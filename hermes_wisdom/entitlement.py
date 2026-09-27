"""Refresh-free, profile-scoped Wisdom presentation and local-work eligibility.

Portal's OAuth issuer projects the team feature flag into ``wisdom_scopes``.
These locally decoded claims are advisory, NOT server authorization: Gateway
still validates the bearer on every request. Never refresh credentials while
rendering menus or inspecting tool availability, and never cache across profiles
or beyond logout/token replacement. Expired or malformed claims fail closed.
"""

from __future__ import annotations

import math
import threading
import time
from pathlib import Path

# One decoded snapshot per auth-store state. ``get_tool_definitions()`` keys its memo on
# ``is_entitled()`` and read-only surfaces poll it, and each uncached call re-reads the auth store
# (~0.6 ms). The memo is keyed on the (path, mtime_ns, size) signature of every file a token can
# come from, so login, logout, refresh and profile switches invalidate it without a clock; the TTL
# only bounds how long a same-signature rewrite (coarse mtime) could be served stale.
_CLAIMS_CACHE_TTL = 60.0
_claims_cache: tuple[float, tuple, dict] | None = None
_claims_cache_lock = threading.Lock()


def _file_signature(path: Path | None) -> tuple:
    if path is None:
        return ()
    try:
        stat = path.stat()
    except OSError:
        return (str(path), None)
    return (str(path), stat.st_mtime_ns, stat.st_size)


def _auth_store_signature() -> tuple | None:
    """Signature of the auth stores a Nous token can be read from; ``None`` when none exists.

    Both the profile store and the global-root fallback (also home to the credential pool) are
    covered. With no store on disk there is no token to memoise, so callers skip the cache — this is
    also what keeps test doubles that patch the status snapshot without writing a file honest.
    """
    try:
        from hermes_cli.auth import _auth_file_path, _global_auth_file_path

        signature = (_file_signature(_auth_file_path()), _file_signature(_global_auth_file_path()))
    except Exception:
        return None
    if all(len(part) != 3 for part in signature):
        return None
    return signature


def _clear_claims_cache() -> None:
    global _claims_cache
    with _claims_cache_lock:
        _claims_cache = None


def _fresh(claims: dict) -> dict:
    """Apply the time-dependent checks to decoded claims; never cached."""
    expires = claims.get("expires_at")
    now = time.time()
    if (
        isinstance(expires, bool)
        or not isinstance(expires, (int, float))
        or not math.isfinite(expires)
        or expires <= now
    ):
        return {}
    not_before = claims.get("not_before", 0)
    if (
        isinstance(not_before, bool)
        or not isinstance(not_before, (int, float))
        or not math.isfinite(not_before)
        or not_before > now
    ):
        return {}
    return {"org_id": claims["org_id"], "scopes": claims["scopes"], "expires_at": expires}


def current_entitlement() -> dict:
    """Return only fresh local entitlement metadata, never the bearer itself."""
    global _claims_cache
    signature = _auth_store_signature()
    if signature is not None:
        with _claims_cache_lock:
            cached = _claims_cache
        if (
            cached is not None
            and cached[1] == signature
            and time.monotonic() - cached[0] < _CLAIMS_CACHE_TTL
        ):
            return _fresh(cached[2])
    claims = _decode_current_claims()
    if signature is not None:
        with _claims_cache_lock:
            _claims_cache = (time.monotonic(), signature, claims)
    return _fresh(claims)


def _decode_current_claims() -> dict:
    """Decode the current token's advisory claims (``{}`` when logged out or malformed)."""
    try:
        from hermes_cli.auth_constants import _decode_jwt_claims
        from hermes_cli.auth_nous import get_nous_auth_status_local

        status = get_nous_auth_status_local()
        if not status.get("logged_in") or status.get("relogin_required"):
            return {}
        token = status.get("access_token")
        if not isinstance(token, str) or not token:
            return {}
        # Advisory decoding uses the auth layer's stdlib-only parser. Importing
        # PyJWT here loads native cryptography during every CLI parser build,
        # which can lock updater DLLs on Windows.
        claims = _decode_jwt_claims(token)
        org_id = claims.get("org_id")
        scopes = claims.get("wisdom_scopes")
        if not isinstance(org_id, str) or not org_id.strip() or not isinstance(scopes, list):
            return {}
        if not all(isinstance(scope, str) for scope in scopes):
            return {}
        return {
            "org_id": org_id,
            "scopes": tuple(scopes),
            "expires_at": claims.get("exp"),
            "not_before": claims.get("nbf", 0),
        }
    except Exception:
        return {}


def is_entitled(org_id: str | None = None, *, scope: str = "wisdom:read") -> bool:
    """Whether this profile's fresh Nous token grants the requested capability."""
    entitlement = current_entitlement()
    return bool(
        scope in entitlement.get("scopes", ())
        and (org_id is None or org_id == entitlement.get("org_id"))
    )


def require_entitlement(org_id: str | None = None, *, scope: str = "wisdom:read") -> None:
    from .package import PackagePolicyError

    if not is_entitled(org_id, scope=scope):
        raise PackagePolicyError("Collective Wisdom is unavailable for the current account and team")


def opted_in() -> bool:
    """Whether this profile enabled Collective Wisdom (``wisdom.enabled`` in config).

    Config-only, so always-on callers (skill-load hooks, housekeeping chores, idle polls, the
    inbound observe hook) can refuse before constructing a ``WisdomStore`` — construction creates
    ``<home>/wisdom/wisdom.db`` for a profile that never opted in. The disclosure stamp and the
    store-backed checks stay in :func:`local_work_allowed`.
    """
    try:
        from .service import _config

        return _config().get("enabled") is True
    except Exception:
        return False


def local_work_allowed(store) -> bool:
    """Opt-in and matching current entitlement are both required for local work."""
    try:
        from .service import _config

        config = _config()
        if config.get("enabled") is not True or not config.get("disclosure_acknowledged_at"):
            return False
        org_id = store.active_org_id()
        return bool(store.existing_installation_identity() and org_id and is_entitled(org_id))
    except Exception:
        return False
