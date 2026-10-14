"""Model providers a bot profile shares with the default profile.

Custom endpoints (``providers:`` entries with a ``base_url``) and the credentials behind them live per
profile: the Desktop's Custom Endpoints page writes the "Applies to" profile, normally the default one,
while a bot resolves providers from its own ``config.yaml`` / ``.env``. Creation mirrors the launch
profile's files ONCE, so an endpoint added or a key rotated later never reached an existing bot — while
the New Bot dialog's "share keys & accounts with the main profile" switch promised exactly that.

A profile whose ``profile.yaml`` carries ``share_providers: true`` reads the default profile's model
providers THROUGH instead of owning copies:

* ``load_config()`` overlays the default profile's custom endpoints onto the profile's ``providers:``
  (``overlay_shared_providers``; the shared definition wins over a stale local copy) and
  ``save_config()`` keeps them out of the profile's file (``restore_own_providers_for_save``);
* every profile secret scope and the standalone dotenv load layer the default profile's provider
  credentials over the profile's own (``shared_provider_secrets``) — only variables that hold a
  model-provider key, never channel tokens or anything else from the default ``.env``;
* the file-first credential readers (``config.get_env_value_prefer_dotenv``,
  ``credential_pool.get_env_prefer_dotenv``) take the same shared value ahead of the profile's own
  ``.env`` line (``shared_provider_secret_override``), and creation strips the mirrored provider keys
  from a sharing profile's ``.env`` (``strip_shared_provider_env_file``): a copy there is a second
  place for the secret to live and only shadowed a later rotation.

Everything else — sessions, memory, skills, channels, the model pin itself — stays the profile's own,
and the default profile never follows anybody. ``adopt_default_endpoint`` is the one-time copy a
profile takes when it stops sharing: the default profile's CURRENT definition, over any drifted copy
creation left in the file, so the endpoint its model pin names keeps resolving as it did while shared.
"""

from __future__ import annotations

import copy
from contextvars import ContextVar
import logging
import re
from pathlib import Path
from typing import Any

from hermes_cli.config_providers import coerce_provider_id, is_provider_enabled
from utils import is_truthy_value

logger = logging.getLogger(__name__)

SHARE_PROVIDERS_KEY = "share_providers"
# Keys of a ``providers.<key>`` block that name its endpoint (the dashboard list route's reading).
_URL_KEYS = ("base_url", "url", "api")
# Sentinel keys pre-fix Hermes wrote inside the user-facing ``models`` mapping.
_MODEL_SENTINELS = frozenset({"__explicit_model_allowlist__", "__discovered_model_catalog__"})
# The dashboard's custom-endpoint key slots (``custom_endpoint_key_env``).
_CUSTOM_SLOT_RE = re.compile(r"^HERMES_CUSTOM_(?:[A-Z0-9_]+_)?API_KEY$")


def _default_root() -> Path:
    from hermes_constants import get_default_hermes_root
    return get_default_hermes_root()


def is_default_root(home: Path) -> bool:
    """String equality first: ``load_config()`` asks on every call, and the default root is the common case."""
    home, root = Path(home), _default_root()
    if home == root:
        return True
    try:
        return home.resolve() == root.resolve()
    except OSError:
        return False


def _read_yaml_dict(path: Path) -> dict:
    """The mapping in a YAML file; ``{}`` when missing, unreadable, malformed or not a mapping."""
    from hermes_yaml import YAMLError, safe_load
    try:
        data = safe_load(path.read_text(encoding="utf-8-sig")) or {}
    except (OSError, ValueError, YAMLError):
        return {}
    return data if isinstance(data, dict) else {}


# ── the flag ─────────────────────────────────────────────────────────────────────────────────────

# profile.yaml path -> ((mtime_ns, size), flag): the loader asks on every config read.
_FLAG_CACHE: dict[str, tuple[tuple[int, int], bool]] = {}


def profile_shares_providers(profile_home: Path) -> bool:
    """``profile.yaml`` ``share_providers`` of ``profile_home``; always False for the default root."""
    home = Path(profile_home)
    if is_default_root(home):
        return False
    path = home / "profile.yaml"
    try:
        st = path.stat()
    except OSError:
        return False
    sig = (st.st_mtime_ns, st.st_size)
    cached = _FLAG_CACHE.get(str(path))
    if cached is not None and cached[0] == sig:
        return cached[1]
    value = is_truthy_value(_read_yaml_dict(path).get(SHARE_PROVIDERS_KEY, False))
    _FLAG_CACHE[str(path)] = (sig, value)
    return value


def set_profile_shares_providers(profile_home: Path, enabled: bool) -> None:
    """Write the flag in place (other ``profile.yaml`` fields untouched); off removes the key."""
    from utils import atomic_yaml_write
    path = Path(profile_home) / "profile.yaml"
    existing: dict = _read_yaml_dict(path)
    if enabled:
        existing[SHARE_PROVIDERS_KEY] = True
    else:
        existing.pop(SHARE_PROVIDERS_KEY, None)
    atomic_yaml_write(path, existing, sort_keys=False)


# ── the default profile's endpoints ──────────────────────────────────────────────────────────────

def _raw_providers(home: Path) -> dict[str, dict[str, Any]]:
    """``providers:`` of ``<home>/config.yaml`` exactly as written (refs unexpanded, no defaults)."""
    from hermes_cli.config import read_user_config_raw
    providers = read_user_config_raw(Path(home) / "config.yaml").get("providers")
    if not isinstance(providers, dict):
        return {}
    return {coerce_provider_id(key): entry for key, entry in providers.items()
            if coerce_provider_id(key) and isinstance(entry, dict)}


def endpoint_url(entry: dict[str, Any]) -> str:
    return next((str(entry.get(k)).strip() for k in _URL_KEYS if str(entry.get(k) or "").strip()), "")


def endpoint_name(key: str, entry: dict[str, Any]) -> str:
    return coerce_provider_id(entry.get("name")) or key


def _is_custom_endpoint(key: str, entry: dict[str, Any]) -> bool:
    """An enabled row that describes its own endpoint — the runtime's structural test, so a
    ``providers.<builtin>`` settings block (a bare ``base_url`` override) is not one."""
    from hermes_cli.providers import is_custom_endpoint_entry
    return is_provider_enabled(entry) and is_custom_endpoint_entry(key, entry)


# Classifying the default profile's rows reaches the provider runtime (``is_custom_endpoint_entry``:
# registry discovery, the models.dev catalog behind ``get_label``), and both load the config on their
# way. That nested load must see the profile's own file, never this classification again: re-entering
# recursed until the RecursionError was swallowed as a "formatting error" (default settings, a
# ``.corrupt`` backup, a warning per load) and took the models.dev refresh lock twice on one thread.
_CLASSIFYING: ContextVar[bool] = ContextVar("hermes_shared_providers_classifying", default=False)


def default_profile_custom_endpoints() -> dict[str, dict[str, Any]]:
    """Custom endpoints the default (root) profile declares, keyed by their ``providers.<key>``.
    ``{}`` for a config load the classification itself triggers (``_CLASSIFYING``)."""
    if _CLASSIFYING.get():
        return {}
    token = _CLASSIFYING.set(True)
    try:
        return {key: entry for key, entry in _raw_providers(_default_root()).items()
                if _is_custom_endpoint(key, entry)}
    finally:
        _CLASSIFYING.reset(token)


def endpoint_models(entry: dict[str, Any]) -> list[str]:
    """Model ids an endpoint entry declares: ``model``/``default_model`` first, then ``models``
    (mapping keys, or list items by ``id``/``name``), de-duplicated."""
    candidates: list[Any] = [entry.get("model") or entry.get("default_model") or ""]
    raw_models = entry.get("models")
    if isinstance(raw_models, dict):
        candidates.extend(key for key in raw_models if key not in _MODEL_SENTINELS)
    elif isinstance(raw_models, (list, tuple)):
        candidates.extend(item.get("id") or item.get("name") if isinstance(item, dict) else item for item in raw_models)
    models: list[str] = []
    for candidate in candidates:
        model = str(candidate or "").strip()
        if model and model not in models:
            models.append(model)
    return models


def endpoint_key_env(key: str, entry: dict[str, Any]) -> str:
    """The ``.env`` variable holding the endpoint's key: an explicit ``key_env``/``api_key_env``, the
    variable a ``${VAR}`` ``api_key`` names, or — with no credential field at all — the custom-endpoint
    slot the dashboard writes. ``""`` for a literal ``api_key``: it travels inside the entry itself."""
    from hermes_cli.config import _env_ref_var_name, custom_endpoint_key_env
    key_env = str(entry.get("key_env") or entry.get("api_key_env") or "").strip()
    if key_env:
        return key_env
    api_key = str(entry.get("api_key") or "").strip()
    if api_key:
        if api_key.startswith("${") and api_key.endswith("}"):
            return _env_ref_var_name(api_key[2:-1]) or ""
        return ""
    return custom_endpoint_key_env(key)


# ── the config overlay (load_config / save_config) ───────────────────────────────────────────────

def shared_providers_cache_sig(config_path: Path) -> tuple[int, int, int, int]:
    """Folded into ``load_config()``'s cache signature: the home's ``profile.yaml`` (the flag can flip)
    and, while sharing, the default profile's ``config.yaml`` (the shared definitions). Zeros for
    the default root and for a home without ``profile.yaml``."""
    home = Path(config_path).parent
    if is_default_root(home):
        return (0, 0, 0, 0)
    paths = [home / "profile.yaml"]
    if profile_shares_providers(home):
        paths.append(_default_root() / "config.yaml")
    sig: list[int] = []
    for path in paths:
        try:
            st = path.stat()
            sig.extend((st.st_mtime_ns, st.st_size))
        except OSError:
            sig.extend((0, 0))
    while len(sig) < 4:
        sig.append(0)
    return (sig[0], sig[1], sig[2], sig[3])


def overlay_shared_providers(config: dict[str, Any], home: Path) -> None:
    """``load_config()``: lay the default profile's custom endpoints over ``home``'s ``providers:``
    (in place). The shared definition wins over a local copy of the same id — a creation-time
    snapshot must not shadow the endpoint it was copied from; endpoints only the profile defines stay.
    No-op unless the profile shares."""
    if not profile_shares_providers(home):
        return
    shared = default_profile_custom_endpoints()
    if not shared:
        return
    providers = config.get("providers")
    merged: dict[Any, Any] = dict(providers) if isinstance(providers, dict) else {}
    local_by_lower = {coerce_provider_id(key).lower(): key for key in merged}
    for key, entry in shared.items():
        local_key = local_by_lower.get(key.lower())
        if local_key is not None and local_key != key:
            merged.pop(local_key, None)
        merged[key] = copy.deepcopy(entry)
    config["providers"] = merged


def restore_own_providers_for_save(config: dict[str, Any], raw: dict[str, Any], config_path: Path) -> dict[str, Any]:
    """``save_config()``: a shared endpoint never persists into the profile's file. Every shared id is
    put back to what the file holds (a stale local copy stays exactly as it was) or dropped, so a
    ``save_config(load_config())`` round trip is a no-op for them. Returns ``config`` (copied when
    it changes)."""
    home = Path(config_path).parent
    providers = config.get("providers")
    if not isinstance(providers, dict) or not profile_shares_providers(home):
        return config
    shared = default_profile_custom_endpoints()
    if not shared:
        return config
    raw_providers = raw.get("providers") if isinstance(raw.get("providers"), dict) else {}
    own = dict(providers)
    for key in shared:
        if key not in own:
            continue
        if key in raw_providers:
            own[key] = copy.deepcopy(raw_providers[key])
        else:
            del own[key]
    if own == providers:
        return config
    out = dict(config)
    if own:
        out["providers"] = own
    else:
        out.pop("providers", None)
    return out


# ── the credentials ──────────────────────────────────────────────────────────────────────────────

def shared_provider_secret_names(shared: dict[str, dict[str, Any]] | None = None) -> set[str]:
    """Variables that hold a model-provider credential: every registry provider's key variables plus
    whatever the default profile's endpoints point at (``endpoint_key_env``). Process-global names
    are never profile secrets."""
    from agent.secret_scope import _is_global_env
    from hermes_cli.auth import PROVIDER_REGISTRY
    names: set[str] = set()
    for pcfg in PROVIDER_REGISTRY.values():
        names.update(str(v) for v in (getattr(pcfg, "api_key_env_vars", ()) or ()) if v)
    for key, entry in (default_profile_custom_endpoints() if shared is None else shared).items():
        key_env = endpoint_key_env(key, entry)
        if key_env:
            names.add(key_env)
    return {name for name in names if name and not _is_global_env(name)}


# default root -> ((config.yaml sig, .env sig), secrets): the file-first readers ask per variable.
_SECRETS_CACHE: dict[str, tuple[tuple[tuple[int, int], tuple[int, int]], dict[str, str]]] = {}


def _default_files_sig(root: Path) -> tuple[tuple[int, int], tuple[int, int]]:
    sig: list[tuple[int, int]] = []
    for name in ("config.yaml", ".env"):
        try:
            st = (root / name).stat()
            sig.append((st.st_mtime_ns, st.st_size))
        except OSError:
            sig.append((0, 0))
    return (sig[0], sig[1])


def shared_provider_secrets() -> dict[str, str]:
    """The default profile's values for its model-provider credentials: ``shared_provider_secret_names``
    plus every dashboard custom-endpoint slot, read from the default ``.env`` only. Memoised on the
    default profile's ``config.yaml`` / ``.env`` signatures (the file-first readers ask per variable);
    never stored from inside the endpoint classification, which sees no endpoints (``_CLASSIFYING``)."""
    from agent.secret_scope import load_env_file
    root = _default_root()
    sig = _default_files_sig(root)
    cached = _SECRETS_CACHE.get(str(root))
    if cached is not None and cached[0] == sig:
        return dict(cached[1])
    names = shared_provider_secret_names()
    secrets = {name: value for name, value in load_env_file(root / ".env").items()
               if value and (name in names or _CUSTOM_SLOT_RE.match(name))}
    if not _CLASSIFYING.get():
        _SECRETS_CACHE[str(root)] = (sig, dict(secrets))
    return secrets


def shared_provider_secret_override(name: str) -> str | None:
    """The default profile's value for credential ``name`` when the scoped profile shares providers and
    the default ``.env`` holds it, else None. The file-first readers consult this before the profile's
    own ``.env`` line: the secret scope already layers the shared value over the profile's copy, and a
    reader that preferred the file put that copy — a creation-time snapshot — back in front of a key
    the default profile has since rotated."""
    from hermes_constants import get_hermes_home
    if not profile_shares_providers(get_hermes_home()):
        return None
    return shared_provider_secrets().get(name) or None


_ENV_ASSIGNMENT_RE = re.compile(r"^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=")


def strip_shared_provider_env_file(env_path: Path) -> list[str]:
    """Drop every model-provider credential assignment from ``env_path`` in place: the variables a
    sharing profile reads through from the default profile (``shared_provider_secret_names`` plus the
    dashboard's custom-endpoint slots). Comments, blank lines and every other key survive verbatim.
    Returns the keys removed. Runs on the ``.env`` creation mirrors into a profile that shares."""
    path = Path(env_path)
    if not path.is_file():
        return []
    names = shared_provider_secret_names()
    removed: list[str] = []
    kept: list[str] = []
    for line in path.read_text(encoding="utf-8-sig", errors="replace").splitlines():
        match = _ENV_ASSIGNMENT_RE.match(line)
        key = match.group(1) if match else None
        if key is not None and (key in names or _CUSTOM_SLOT_RE.match(key)):
            removed.append(key)
        else:
            kept.append(line)
    if removed:
        path.write_text("\n".join(kept) + ("\n" if kept else ""), encoding="utf-8")
    return removed


def sharing_profile_homes() -> list[Path]:
    """Every named profile directory whose ``profile.yaml`` shares providers, sorted by name (the default
    root never does)."""
    from hermes_cli.profiles import _get_profiles_root
    try:
        candidates = sorted(
            path for path in _get_profiles_root().iterdir() if path.is_dir() and not path.name.startswith("."))
    except OSError:
        return []
    return [home for home in candidates if profile_shares_providers(home)]


# ── leaving the shared mode ──────────────────────────────────────────────────────────────────────

def adopt_default_endpoint(profile_home: Path, key: str) -> dict[str, Any]:
    """Copy default-profile endpoint ``key`` into ``profile_home``: the raw entry under
    ``providers.<key>`` — the default profile's current definition, over any copy creation left there,
    which the overlay had shadowed and the profile would otherwise fall back to — and the key variable
    behind it into the profile's ``.env`` (only when the profile does not define that variable already).
    The copy a profile takes when it stops sharing, so the endpoint its model pin names keeps resolving.

    Runs inside the profile's runtime scope — the caller binds it (config / ``.env`` writes target the
    scoped home) — and with sharing already OFF (``save_config`` keeps shared ids out of a sharing
    profile's file). Returns ``{"entry", "key_env", "key_copied"}``; ``entry`` False means ``key`` is not
    a default-profile endpoint and nothing was written."""
    home = Path(profile_home)
    key = coerce_provider_id(key)
    entry = default_profile_custom_endpoints().get(key)
    if entry is None:
        return {"entry": False, "key_env": "", "key_copied": False}
    from agent.secret_scope import load_env_file
    from hermes_cli.config import get_env_path, read_user_config_raw, save_config, save_env_value
    # RAW destination file: load_config() hands back expanded refs, and the entry must land as the
    # default profile wrote it (the pointer, resolved against the profile's own .env).
    current = read_user_config_raw() or {}
    providers = dict(current.get("providers")) if isinstance(current.get("providers"), dict) else {}
    providers[key] = dict(entry)
    save_config({**current, "providers": providers})
    key_env = endpoint_key_env(key, entry)
    copied = False
    if key_env and not load_env_file(get_env_path()).get(key_env):
        value = load_env_file(_default_root() / ".env").get(key_env)
        if value:
            save_env_value(key_env, value)
            copied = True
    logger.info("profile %s adopted custom endpoint %r from the default profile (key %s: %s)",
                home.name, key, key_env or "inline", "copied" if copied else "kept")
    return {"entry": True, "key_env": key_env, "key_copied": copied}
