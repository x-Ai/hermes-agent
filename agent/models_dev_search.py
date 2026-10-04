"""Cross-provider lookup in the models.dev registry for a model id seen on an unknown route.

A custom endpoint's model ids come from the relay, not from a catalogued vendor, so
``get_model_capabilities`` (which reaches the catalog only through ``catalog_provider``, #112649)
knows nothing about them. This sibling answers the weaker question "which catalogued model is this
id most likely talking about?": the exact id first, then the ``vendor/model`` tail a relay prefixes
(``zai-org/GLM-5.3`` → ``glm-5.3``), ranking the lab's own listing above resellers so the answer
carries the vendor's limits and ``reasoning_options``. Callers treat a match as a HINT (desktop
suggestions, picker effort ladders) — never as the runtime's context source, which stays on the
endpoint's own ``/models`` and the configured ``catalog_provider``. Cache-only by default.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from hermes_constants import openrouter_variant_base

# Attribute access at call time (not ``from ... import``): tests and callers patch the registry on
# the facade (``agent.models_dev.fetch_models_dev``), and this sibling must read what they patched.
from agent import models_dev as _models_dev
from agent.models_dev import PROVIDER_TO_MODELS_DEV


@dataclass(frozen=True)
class CatalogMatch:
    """One registry entry picked for an endpoint's model id."""

    provider_id: str  # models.dev provider id ("openai", "openrouter")
    model_id: str  # catalog id under that provider
    entry: Dict[str, Any]
    exact: bool  # True = the whole id matched; False = only the ``vendor/model`` tail did

    @property
    def ref(self) -> str:
        return f"{self.provider_id}/{self.model_id}"


# First-party labs rank above resellers: their rows carry the vendor's own limits and
# ``reasoning_options`` where an aggregator may copy, cap or omit them.
_LAB_PROVIDERS = frozenset({
    "anthropic", "openai", "google", "deepseek", "zai", "xai", "alibaba", "moonshotai", "kimi-for-coding",
    "minimax", "minimax-cn", "mistral", "cohere", "meta", "xiaomi", "stepfun", "nvidia", "perplexity",
})
# Aggregators whose ``vendor/model`` ids are kept current; preferred over the long tail of resellers.
_PREFERRED_RESELLERS = frozenset({"openrouter"})

# Model-family brand → the lab that owns it, so a bare id listed by several labs (``kimi-k3`` on
# moonshotai AND alibaba's Model Studio) resolves to the vendor's own row.
_BRAND_PROVIDERS: Dict[str, str] = {
    "claude": "anthropic", "gpt": "openai", "chatgpt": "openai", "codex": "openai", "gemini": "google", "gemma": "google",
    "deepseek": "deepseek", "glm": "zai", "grok": "xai", "qwen": "alibaba", "qwq": "alibaba", "kimi": "moonshotai",
    "moonshot": "moonshotai", "minimax": "minimax", "mistral": "mistral", "mixtral": "mistral", "codestral": "mistral",
    "devstral": "mistral", "magistral": "mistral", "pixtral": "mistral", "llama": "meta", "command": "cohere",
    "mimo": "xiaomi", "step": "stepfun", "nemotron": "nvidia", "sonar": "perplexity",
}
_LEADING_ALPHA = re.compile(r"^[a-z]+")
_OPENAI_O_SERIES = re.compile(r"^o\d")


def _brand_owner(tail: str) -> Optional[str]:
    """The lab whose brand leads the bare id (``kimi-k3`` → moonshotai, ``o3-mini`` → openai), or None."""
    if _OPENAI_O_SERIES.match(tail):
        return "openai"
    lead = _LEADING_ALPHA.match(tail)
    return _BRAND_PROVIDERS.get(lead.group(0)) if lead else None

# Hugging Face / relay organisation prefixes → the models.dev provider that owns the model.
_VENDOR_PREFIX_PROVIDERS: Dict[str, str] = {
    "zai-org": "zai", "z-ai": "zai", "deepseek-ai": "deepseek", "qwen": "alibaba", "meta-llama": "meta",
    "x-ai": "xai", "mistralai": "mistral", "minimaxai": "minimax", "xiaomimimo": "xiaomi", "moonshotai": "moonshotai",
    "google": "google", "openai": "openai", "anthropic": "anthropic", "deepseek": "deepseek", "zai": "zai",
    "xai": "xai", "cohere": "cohere", "nvidia": "nvidia", "stepfun": "stepfun", "perplexity": "perplexity",
}

_Hits = Dict[str, List[Tuple[str, str]]]
# (registry object, by lower-cased id, by lower-cased ``vendor/model`` tail). The registry object is
# held so its ``id()`` cannot be recycled onto a different dict while this index is cached.
_index_cache: Optional[Tuple[Dict[str, Any], _Hits, _Hits]] = None


def _index(registry: Dict[str, Any]) -> Tuple[_Hits, _Hits]:
    global _index_cache
    if _index_cache is not None and _index_cache[0] is registry and len(_index_cache[0]) == len(registry):
        return _index_cache[1], _index_cache[2]
    by_id: _Hits = {}
    by_tail: _Hits = {}
    for provider_id, provider in registry.items():
        models = provider.get("models") if isinstance(provider, dict) else None
        if not isinstance(models, dict):
            continue
        for model_id, entry in models.items():
            if not isinstance(model_id, str) or not isinstance(entry, dict):
                continue
            lower = model_id.strip().lower()
            if not lower:
                continue
            by_id.setdefault(lower, []).append((provider_id, model_id))
            by_tail.setdefault(lower.rsplit("/", 1)[-1], []).append((provider_id, model_id))
    _index_cache = (registry, by_id, by_tail)
    return by_id, by_tail


def _mdev_provider_id(provider: Optional[str]) -> Optional[str]:
    key = (provider or "").strip()
    if key.lower().startswith("custom:"):
        key = key[len("custom:"):]
    if not key:
        return None
    return PROVIDER_TO_MODELS_DEV.get(key, _VENDOR_PREFIX_PROVIDERS.get(key.lower(), key))


def _query_forms(model: str) -> List[str]:
    """Lower-cased ids to look up: the id itself, then its OpenRouter routing-variant base."""
    raw = (model or "").strip()
    forms = [raw]
    base = openrouter_variant_base(raw) if raw else None
    if base:
        forms.append(base)
    return list(dict.fromkeys(form.lower() for form in forms if form))


def _rank(provider_id: str, exact: bool, preferred: Tuple[str, ...], brand: Optional[str]) -> Tuple[int, int, str]:
    if provider_id in preferred:
        tier = 0
    elif brand is not None and provider_id == brand:
        tier = 1
    elif provider_id in _LAB_PROVIDERS:
        tier = 2
    elif provider_id in _PREFERRED_RESELLERS:
        tier = 3
    else:
        tier = 4
    return (tier, 0 if exact else 1, provider_id)


def find_catalog_model(
    model: str, *, provider_hint: Optional[str] = None, allow_network: bool = False,
) -> Optional[CatalogMatch]:
    """Best catalog entry for *model*, or None.

    ``provider_hint`` (a Hermes or models.dev provider id — a custom endpoint's ``catalog_provider``)
    and a ``vendor/`` prefix on the id outrank everything; the brand's own lab comes next, then other
    labs, then resellers. A lab's listing beats a reseller's even when only the tail matched: the
    vendor's row is the canonical description of the model, while a reseller's exact row describes
    that reseller's serving of it.
    """
    forms = _query_forms(model)
    if not forms:
        return None
    registry = _models_dev.fetch_models_dev() if allow_network else _models_dev.fetch_models_dev(allow_network=False)
    if not isinstance(registry, dict) or not registry:
        return None
    by_id, by_tail = _index(registry)
    preferred = tuple(
        p for p in (_mdev_provider_id(provider_hint), _mdev_provider_id(forms[0].split("/", 1)[0]) if "/" in forms[0] else None)
        if p
    )
    candidates: Dict[Tuple[str, str], bool] = {}
    for form in forms:
        for hit in by_id.get(form, ()):
            candidates.setdefault(hit, True)
        for hit in by_tail.get(form.rsplit("/", 1)[-1], ()):
            candidates.setdefault(hit, False)
    if not candidates:
        return None
    brand = _brand_owner(forms[0].rsplit("/", 1)[-1])
    (provider_id, model_id), exact = min(
        candidates.items(), key=lambda item: _rank(item[0][0], item[1], preferred, brand)
    )
    return CatalogMatch(provider_id, model_id, registry[provider_id]["models"][model_id], exact)


def match_metadata(match: CatalogMatch) -> Dict[str, Any]:
    """Canonical-key metadata from a match; a key is present only when the entry states it."""
    entry = match.entry
    out: Dict[str, Any] = {}
    for key, limit in (("context_length", "context"), ("max_input_tokens", "input"), ("max_output_tokens", "output")):
        value = _models_dev._extract_limit(entry, limit)
        if value is not None:
            out[key] = value
    if "modalities" in entry or "attachment" in entry:
        out["supports_vision"] = _models_dev._entry_supports_vision(entry)
    if "reasoning" in entry:
        out["supports_reasoning"] = bool(entry.get("reasoning"))
    efforts, can_disable = _models_dev.entry_reasoning_support(entry)
    if efforts:
        out["supported_efforts"] = list(efforts)
    if can_disable is not None:
        out["can_disable_reasoning"] = can_disable
    return out
