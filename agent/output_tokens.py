"""Resolve the active route's output-token budget without conflating it with context length."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Optional

from hermes_cli.providers import custom_provider_aliases
from hermes_cli.route_identity import normalize_route_base_url


@dataclass(frozen=True)
class OutputTokenLimit:
    value: Optional[int]
    source: str


def _positive_int(value: Any) -> Optional[int]:
    return value if isinstance(value, int) and not isinstance(value, bool) and value > 0 else None


def _configured_entries(
    entries: Any, *, base_url: str, requested_provider: str,
) -> Iterable[dict[str, Any]]:
    if not isinstance(entries, list):
        return ()
    route = normalize_route_base_url(base_url)
    candidates = [
        entry for entry in entries
        if isinstance(entry, dict) and normalize_route_base_url(entry.get("base_url")) == route
    ]
    requested = str(requested_provider or "").strip().lower()
    if requested and requested not in {"auto", "custom"}:
        scoped = [
            entry for entry in candidates
            if requested in custom_provider_aliases(
                str(entry.get("name") or ""), str(entry.get("provider_key") or ""))
        ]
        return scoped
    return candidates


def _limit_from_mapping(mapping: Any) -> Optional[int]:
    if not isinstance(mapping, dict):
        return None
    for key in ("max_output_tokens", "max_tokens"):
        value = _positive_int(mapping.get(key))
        if value is not None:
            return value
    return None


def _limit_from_discovered_metadata(metadata: Any, model: str) -> Optional[int]:
    model_metadata = metadata.get(model) if isinstance(metadata, dict) else None
    if not isinstance(model_metadata, dict):
        return None
    # ``max_completion_tokens`` is accepted for old on-disk endpoint metadata caches.
    return (
        _positive_int(model_metadata.get("max_output_tokens"))
        or _positive_int(model_metadata.get("max_completion_tokens")))


def resolve_output_token_limit(
    *, explicit: Any, model: str, base_url: str, provider: str = "",
    requested_provider: str = "", custom_providers: Any = None, api_key: str = "",
    discover: bool = True,
) -> OutputTokenLimit:
    """Resolve explicit > model > provider > discovered capability > transport default."""
    value = _positive_int(explicit)
    if value is not None:
        return OutputTokenLimit(value, "explicit")

    entries = list(_configured_entries(
        custom_providers, base_url=base_url, requested_provider=requested_provider))
    saved_discovered: Optional[int] = None
    for entry in entries:
        models = entry.get("models")
        model_config = models.get(model) if isinstance(models, dict) else None
        value = _limit_from_mapping(model_config)
        if value is not None:
            if entry.get("models_discovered") is True:
                saved_discovered = value
            else:
                return OutputTokenLimit(value, "model")
    for entry in entries:
        value = _limit_from_mapping(entry)
        if value is not None:
            return OutputTokenLimit(value, "provider")
    if saved_discovered is not None:
        return OutputTokenLimit(saved_discovered, "discovered")

    route_is_custom = bool(entries) or str(provider or "").strip().lower() == "custom" or (
        str(requested_provider or "").strip().lower().startswith("custom:"))
    if discover and route_is_custom and model and base_url:
        if entries:
            from hermes_cli.models import cached_fetch_api_models

            entry = entries[0]
            catalog = cached_fetch_api_models(
                api_key if isinstance(api_key, str) else "", base_url,
                api_mode=entry.get("api_mode") or entry.get("transport"),
                headers=entry.get("extra_headers"))
            value = _limit_from_discovered_metadata(
                getattr(catalog, "model_metadata", None), model)
            if value is not None:
                return OutputTokenLimit(value, "discovered")
            if catalog is not None:
                # The provider-aware probe answered authoritatively. Do not immediately issue a
                # second request with generic Bearer auth when the catalog advertised no limit.
                return OutputTokenLimit(None, "transport_default")

        from agent.model_metadata import fetch_endpoint_model_metadata

        metadata = fetch_endpoint_model_metadata(
            base_url, api_key=api_key if isinstance(api_key, str) else "")
        value = _limit_from_discovered_metadata(metadata, model)
        if value is not None:
            return OutputTokenLimit(value, "discovered")
    return OutputTokenLimit(None, "transport_default")


def output_token_limit_for_agent(agent) -> Optional[int]:
    """Resolve the active agent route. Called at request construction so fallback routes re-scope."""
    source = str(getattr(agent, "max_tokens_source", "") or "").strip().lower()
    explicit = None if source in {"model", "provider", "discovered"} else getattr(agent, "max_tokens", None)
    return resolve_output_token_limit(
        explicit=explicit,
        model=str(getattr(agent, "model", "") or ""),
        base_url=str(getattr(agent, "base_url", "") or ""),
        provider=str(getattr(agent, "provider", "") or ""),
        requested_provider=str(getattr(agent, "requested_provider", "") or ""),
        custom_providers=getattr(agent, "_custom_providers", None),
        api_key=getattr(agent, "api_key", ""),
    ).value
