"""Which reasoning-effort levels a (provider, model) route accepts — one answer for every surface.

Hermes knows a route's effort vocabulary in four unrelated places: the Codex per-generation ladder
(``agent.reasoning_effort``), provider plugins' ``supported_reasoning_efforts`` declarations, the
OpenRouter / Nous Portal catalogs (``hermes_cli.models_reasoning_caps``) and models.dev's
``reasoning_options``. Transports consult the one they need at request time; the picker and the
composer's reasoning pill need the merged verdict up front, so they can show the levels a model has
and mark the ones the route will clamp. Cache-only: never blocks on HTTP (hot path — once per
picker model and once per ``session.info``).

Precedence, most specific first: Codex ladder (live-verified per generation) → a RESTRICTIVE plugin
declaration (the plugin knows its wire) → the serving aggregator's catalog → models.dev
``reasoning_options`` (a custom route without ``catalog_provider`` falls back to a cross-provider
match on the model id) → unknown. The custom profile's generic ceiling (the whole OpenAI-compat
set) is NOT a verdict: it says "undiscoverable", so it resolves to unknown.

The fork forwards the verdict to the UI as a HINT: unsupported levels are dimmed and annotated with
the level the route sends, never removed — the Portal is known to honor levels its catalog omits
(``z-ai/glm-5.3`` publishes low/high/max yet serves minimal).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Optional, Tuple

from agent.reasoning_effort import OPENAI_COMPAT_WIRE_EFFORTS, route_supported_efforts

logger = logging.getLogger(__name__)

_UNSET: Any = object()


@dataclass(frozen=True)
class RouteReasoningSupport:
    """``efforts``: None = unknown, ``()`` = the route takes no reasoning parameter at all, else the
    accepted levels. ``can_disable``: whether thinking can be switched off (None = unknown).
    ``source`` names the deciding authority (``codex`` / ``profile`` / ``aggregator`` / ``catalog`` /
    ``catalog_match``)."""

    efforts: Optional[Tuple[str, ...]] = None
    can_disable: Optional[bool] = None
    source: str = ""


UNKNOWN_SUPPORT = RouteReasoningSupport()

_AGGREGATOR_READERS = {
    "openrouter": "openrouter_model_reasoning_capabilities",
    "nous": "nous_model_reasoning_capabilities",
    "nous-portal": "nous_model_reasoning_capabilities",
    "nousresearch": "nous_model_reasoning_capabilities",
}


def route_profile(provider: Optional[str], base_url: Optional[str] = None):
    """The profile that speaks for a route: the endpoint host's registered profile first (a ``custom:``
    entry pointed at a vendor host follows that vendor's vocabulary), then the provider's own. None when
    neither is registered."""
    try:
        from providers import get_provider_profile
    except Exception:
        return None
    name = (provider or "").strip().lower()
    if base_url:
        try:
            from agent.model_metadata import _infer_provider_from_url

            inferred = _infer_provider_from_url(str(base_url))
        except Exception:
            inferred = None
        if inferred and inferred != name:
            profile = get_provider_profile(inferred)
            if profile is not None:
                return profile
    return get_provider_profile(name) if name else None


def _normalized(levels) -> Tuple[str, ...]:
    return tuple(dict.fromkeys(str(level).strip().lower() for level in levels if str(level).strip()))


def _declared_efforts(profile, model: str) -> Optional[Tuple[str, ...]]:
    if profile is None:
        return None
    try:
        declared = profile.supported_reasoning_efforts(model)
    except Exception as exc:
        logger.debug("supported_reasoning_efforts failed for %s: %s", getattr(profile, "name", profile), exc)
        return None
    return None if declared is None else _normalized(declared)


def _is_generic_ceiling(declared: Tuple[str, ...]) -> bool:
    return set(declared) == set(OPENAI_COMPAT_WIRE_EFFORTS)


def aggregator_reasoning_detail(provider: Optional[str], model: str) -> Optional[dict]:
    """The serving aggregator's per-model reasoning detail (tri-state, see ``models_reasoning_caps``),
    cache-only; None for providers without a catalog."""
    reader_name = _AGGREGATOR_READERS.get((provider or "").strip().lower())
    if reader_name is None:
        return None
    try:
        from hermes_cli import models_reasoning_caps

        return getattr(models_reasoning_caps, reader_name)(model)
    except Exception:
        return None


def _catalog_support(
    provider: Optional[str], model: str, *, config, catalog_caps,
) -> Tuple[Optional[Tuple[str, ...]], Optional[bool], str]:
    """models.dev verdict: the provider's own catalog (``catalog_provider`` included), else — for a route
    with no catalog at all — a cross-provider match on the id."""
    from agent.models_dev import _models_dev_id, entry_reasoning_support, get_model_capabilities

    caps = catalog_caps
    if caps is _UNSET:
        try:
            caps = get_model_capabilities(provider or "", model, config=config)
        except Exception:
            caps = None
    if caps is not None:
        if caps.supports_reasoning is False:
            return (), None, "catalog"
        if caps.supported_efforts or caps.can_disable_reasoning is not None:
            efforts = _normalized(caps.supported_efforts) if caps.supported_efforts else None
            return efforts, caps.can_disable_reasoning, "catalog"
    try:
        has_catalog = _models_dev_id(provider or "", config=config) is not None
    except Exception:
        has_catalog = True
    if has_catalog:
        return None, None, ""
    try:
        from agent.models_dev_search import find_catalog_model

        match = find_catalog_model(model)
    except Exception:
        match = None
    if match is None:
        return None, None, ""
    if match.entry.get("reasoning") is False:
        return (), None, "catalog_match"
    efforts, can_disable = entry_reasoning_support(match.entry)
    return efforts, can_disable, "catalog_match" if (efforts or can_disable is not None) else ""


def route_reasoning_support(
    provider: Optional[str], model: Optional[str], api_mode: Optional[str] = None, *,
    base_url: Optional[str] = None, config: Optional[dict] = None,
    profile: Any = _UNSET, catalog_caps: Any = _UNSET, aggregator_detail: Any = _UNSET,
) -> RouteReasoningSupport:
    """Merged effort verdict for a route (see module doc for precedence).

    ``profile`` / ``catalog_caps`` / ``aggregator_detail`` let a caller that already resolved them (the
    picker builds all three per model) hand them in instead of paying the lookups twice; ``None`` for
    any of them means "resolved, and there is nothing", which is different from omitting it.
    """
    name = (provider or "").strip().lower()
    mid = (model or "").strip()
    if not mid:
        return UNKNOWN_SUPPORT
    if name == "openai-codex":
        efforts = _normalized(route_supported_efforts(name, mid, api_mode))
        return RouteReasoningSupport(efforts, "none" in efforts, "codex")

    declared = _declared_efforts(route_profile(provider, base_url) if profile is _UNSET else profile, mid)
    detail = aggregator_reasoning_detail(name, mid) if aggregator_detail is _UNSET else aggregator_detail
    agg_efforts: Optional[Tuple[str, ...]] = None
    agg_can_disable: Optional[bool] = None
    if isinstance(detail, dict):
        if not detail.get("supports_reasoning"):
            agg_efforts = ()
        else:
            raw = detail.get("supported_efforts")
            if isinstance(raw, list) and raw:
                agg_efforts = _normalized(raw) or None
            agg_can_disable = not detail.get("mandatory")
    cat_efforts, cat_can_disable, cat_source = _catalog_support(provider, mid, config=config, catalog_caps=catalog_caps)

    if declared == ():
        efforts, source = (), "profile"
    elif declared is not None and not _is_generic_ceiling(declared):
        efforts, source = declared, "profile"
    elif agg_efforts is not None:
        efforts, source = agg_efforts, "aggregator"
    elif cat_efforts is not None:
        efforts, source = cat_efforts, cat_source
    else:
        efforts, source = None, ""

    if efforts == ():
        return RouteReasoningSupport((), None, source)
    can_disable = next((verdict for verdict in (agg_can_disable, cat_can_disable) if verdict is not None), None)
    if can_disable is None and efforts and "none" in efforts:
        can_disable = True
    return RouteReasoningSupport(efforts, can_disable, source)
