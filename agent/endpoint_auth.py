"""Per-endpoint authentication header policy (``providers.<id>.auth_scheme``) for OpenAI-wire clients.

The Anthropic transport applies the same setting through ``anthropic_adapter._requires_bearer_auth``;
this module is the Chat Completions / Responses counterpart, so one config field governs every wire.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

_SCHEMES = ("bearer", "x-api-key")


def custom_provider_auth_scheme(
    base_url: Any, custom_providers: Any = None, config: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """``"bearer"`` / ``"x-api-key"`` pinned on the endpoint serving ``base_url``, else None
    (auto-detect). The exact route wins; failing that, an entry on the same host (or a parent
    domain) covers path variants such as a bare ``model.base_url`` — never a lookalike host."""
    url = str(base_url or "").strip()
    if not url:
        return None
    try:
        from hermes_cli.config import get_compatible_custom_providers
        from hermes_cli.config_providers import _entries_for_route
        from utils import base_url_host_matches, base_url_hostname

        entries = custom_providers if isinstance(custom_providers, list) else get_compatible_custom_providers(config)
        exact = list(_entries_for_route(url, entries, config))
        same_host = [
            e for e in entries
            if isinstance(e, dict) and (host := base_url_hostname(str(e.get("base_url") or "")))
            and base_url_host_matches(url, host)
        ]
        for entry in (*exact, *same_host):
            scheme = str(entry.get("auth_scheme") or "").strip().lower().replace("_", "-")
            if scheme in _SCHEMES:
                return scheme
    except Exception:
        return None
    return None


def auth_scheme_default_headers(base_url: Any, api_key: Any, custom_providers: Any = None) -> Dict[str, Any]:
    """Header overrides that move a static key from ``Authorization: Bearer`` to ``x-api-key`` when
    the endpoint pins that scheme; ``{}`` otherwise. The OpenAI SDK drops ``Omit()``-valued default
    headers, which is how the bearer header is suppressed. A callable (command-minted) key stays on
    the SDK's own bearer path: there is no static value to copy into a header."""
    if custom_provider_auth_scheme(base_url, custom_providers) != "x-api-key":
        return {}
    if not isinstance(api_key, str) or not api_key.strip() or api_key.strip().lower() == "no-key-required":
        return {}
    from openai._types import Omit

    return {"Authorization": Omit(), "x-api-key": api_key.strip()}


def apply_auth_scheme_to_client_kwargs(client_kwargs: Dict[str, Any], base_url: Any, custom_providers: Any = None) -> None:
    """Merge :func:`auth_scheme_default_headers` onto ``client_kwargs['default_headers']`` in place."""
    overrides = auth_scheme_default_headers(base_url, client_kwargs.get("api_key"), custom_providers)
    if not overrides:
        return
    merged = {k: v for k, v in (client_kwargs.get("default_headers") or {}).items() if str(k).lower() != "authorization"}
    merged.update(overrides)
    client_kwargs["default_headers"] = merged
