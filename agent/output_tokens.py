"""Resolve the active route's output-token budget without conflating it with context length."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Iterable, Optional

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class OutputTokenLimit:
    value: Optional[int]
    source: str


def _positive_int(value: Any) -> Optional[int]:
    return value if isinstance(value, int) and not isinstance(value, bool) and value > 0 else None


def _configured_entries(
    entries: Any, *, base_url: str, requested_provider: str, api_mode: str = "",
) -> Iterable[dict[str, Any]]:
    from hermes_cli.config_providers import _token_limit_entries_for_route

    candidates = _token_limit_entries_for_route(
        base_url, entries if isinstance(entries, list) else [],
        requested_provider=requested_provider,
    )
    mode = str(api_mode or "").strip().lower()
    if mode:
        mode_scoped = [
            entry for entry in candidates
            if str(entry.get("api_mode") or entry.get("transport") or "").strip().lower() == mode
        ]
        if mode_scoped:
            return mode_scoped
    return candidates


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
    requested_provider: str = "", api_mode: str = "", custom_providers: Any = None,
    api_key: str = "",
    discover: bool = True,
) -> OutputTokenLimit:
    """Explicit caller budget > the route's configured limit > a live-discovered capability > None.

    The configured rung is ``hermes_cli.config_providers.get_custom_provider_token_limits`` — the
    same resolver ``agent_init`` and the live config sync use for ``agent.max_tokens`` — so an
    auxiliary call never budgets a route differently from the main turn on it. Live discovery
    (``/models`` through the endpoint cache) only fills in when nothing is configured or persisted.
    """
    value = _positive_int(explicit)
    if value is not None:
        return OutputTokenLimit(value, "explicit")

    requested = requested_provider or provider
    entries = list(_configured_entries(
        custom_providers, base_url=base_url, requested_provider=requested, api_mode=api_mode))
    if entries and model and base_url:
        from hermes_cli.config_providers import get_custom_provider_token_limits

        configured = get_custom_provider_token_limits(
            model, base_url, custom_providers=entries, requested_provider=requested,
        ).get("max_output_tokens")
        if configured is not None:
            return OutputTokenLimit(configured, "route")

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
            # This configured route is authoritative even when its provider-aware probe failed.
            # A generic second probe could use the wrong auth mode/headers for the same URL.
            return OutputTokenLimit(None, "transport_default")

        from agent.model_metadata import fetch_endpoint_model_metadata

        metadata = fetch_endpoint_model_metadata(
            base_url, api_key=api_key if isinstance(api_key, str) else "")
        value = _limit_from_discovered_metadata(metadata, model)
        if value is not None:
            return OutputTokenLimit(value, "discovered")
    return OutputTokenLimit(None, "transport_default")


def configured_compression_output_budget(config: Any) -> Optional[int]:
    """Positive ``auxiliary.compression.max_output_tokens`` value, excluding bool drift."""
    raw_cap = config.get("max_output_tokens") if isinstance(config, dict) else None
    try:
        cap = 0 if isinstance(raw_cap, bool) else int(raw_cap or 0)
    except (TypeError, ValueError):
        cap = 0
    return cap if cap > 0 else None


def _compression_route_output_limit(
    *, actual_provider: str, actual_model: Optional[str], base_url: str,
    api_key: Any, api_mode: Optional[str],
) -> Optional[int]:
    """Resolve a compression route's advertised ceiling through the endpoint cache."""
    mode = str(api_mode or "").strip().lower()
    if mode not in {"codex_responses", "anthropic_messages"}:
        return None
    try:
        from hermes_cli.config import load_config_readonly
        from hermes_cli.config_providers import get_compatible_custom_providers

        custom_providers = get_compatible_custom_providers(load_config_readonly())
        resolved = resolve_output_token_limit(
            explicit=None, model=str(actual_model or ""), base_url=str(base_url or ""),
            provider=str(actual_provider or ""), requested_provider=str(actual_provider or ""),
            api_mode=mode, custom_providers=custom_providers,
            api_key=api_key if isinstance(api_key, str) else "",
        )
        return resolved.value
    except (ImportError, OSError, TypeError, ValueError):
        logger.debug("Compression output-limit discovery failed", exc_info=True)
        return None


def compression_output_budget(
    task: Optional[str], *, max_tokens: Optional[int],
    actual_provider: str, actual_model: Optional[str], base_url: str, api_key: Any,
    api_mode: Optional[str], route_config: dict[str, Any], task_config: dict[str, Any],
) -> Optional[int]:
    """Explicit caller > configured task/fallback budget clamped to route ceiling.

    Responses and Anthropic compression may use an independent task budget even for a
    reasoning model. An omitted budget preserves the provider's default policy instead
    of turning a discovered capability ceiling into a requested generation size.
    Fallbacks resolve their own route when a budget was configured.
    """
    if task != "compression" or max_tokens is not None:
        return max_tokens

    mode = str(api_mode or "").strip().lower()
    if mode not in {"codex_responses", "anthropic_messages"}:
        return None
    configured_budget = (
        configured_compression_output_budget(route_config)
        or configured_compression_output_budget(task_config)
    )
    if configured_budget is None:
        return None
    route_limit = _compression_route_output_limit(
        actual_provider=actual_provider, actual_model=actual_model, base_url=base_url,
        api_key=api_key, api_mode=mode,
    )
    if route_limit is not None:
        return min(configured_budget, route_limit)
    return configured_budget


def chat_max_tokens_field(
    base_url: Any, model: Any = None, provider: Any = None, requested_provider: Any = None,
    custom_providers: Any = None,
) -> str:
    """Which Chat Completions field carries the output cap for a route.

    A configured ``max_tokens_field`` (provider entry or ``models[model]`` row) wins; otherwise the
    ENDPOINT decides: OpenAI's own API, Azure OpenAI and GitHub Copilot reject ``max_tokens`` for
    their newer families, everything else speaks ``max_tokens``. Never inferred from the model
    name — a third-party host fronting ``gpt-5`` is the user's call, hence the config field.
    """
    url = str(base_url or "")
    try:
        from hermes_cli.config_providers import get_custom_provider_max_tokens_field

        configured = get_custom_provider_max_tokens_field(
            str(model or ""), url, custom_providers=custom_providers,
            requested_provider=str(requested_provider or provider or ""),
        )
    except Exception:
        configured = None
    if configured:
        return configured
    from utils import base_url_host_matches, base_url_hostname

    host = base_url_hostname(url) or ""
    if host == "api.openai.com" or base_url_host_matches(url, "openai.azure.com") or (
        host == "api.githubcopilot.com" or host.endswith(".githubcopilot.com")
    ):
        return "max_completion_tokens"
    return "max_tokens"
