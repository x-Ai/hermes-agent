"""Cross-provider lookup of an endpoint's model id in the models.dev registry (``agent.models_dev_search``).

A custom endpoint's ids are the relay's, so the catalog-by-provider path knows nothing about them. The
search answers "which catalogued model is this most likely?" and must prefer the vendor's own row —
the canonical description — over a reseller's, while an explicit ``catalog_provider`` hint or a
``vendor/`` prefix on the id outranks both.
"""

from __future__ import annotations

import pytest

from agent import models_dev, models_dev_search
from agent.models_dev_search import find_catalog_model, match_metadata

REGISTRY = {
    "zai": {"models": {"glm-5.3": {
        "reasoning": True, "limit": {"context": 200_000, "output": 128_000}, "modalities": {"input": ["text"]},
        "reasoning_options": [{"type": "effort", "values": ["low", "high", "max"]}],
    }}},
    # A reseller listing the SAME model under its Hugging Face org id, with its own (capped) limits.
    "deepinfra": {"models": {"zai-org/GLM-5.3": {"reasoning": True, "limit": {"context": 128_000, "output": 32_000}}}},
    "openai": {"models": {"gpt-5.6": {
        "reasoning": True, "limit": {"context": 400_000, "input": 272_000, "output": 128_000},
        "modalities": {"input": ["text", "image"]},
        "reasoning_options": [{"type": "effort", "values": ["none", "low", "medium", "high"]}],
    }}},
    "openrouter": {"models": {"openai/gpt-5.6": {"reasoning": True, "limit": {"context": 400_000, "output": 128_000}}}},
    # Two labs list the bare id: the brand owner must win over the hosting lab.
    "moonshotai": {"models": {"kimi-k3": {"reasoning": True, "limit": {"context": 256_000, "output": 32_000}}}},
    "alibaba": {"models": {"kimi-k3": {"reasoning": True, "limit": {"context": 1_000_000, "output": 1_000_000}}}},
    "venice": {"models": {"llama-3.3-70b": {"reasoning": False, "limit": {"context": 128_000, "output": 4_096}}}},
}


@pytest.fixture(autouse=True)
def registry(monkeypatch):
    monkeypatch.setattr(models_dev, "fetch_models_dev", lambda *a, **k: REGISTRY)
    monkeypatch.setattr(models_dev_search, "_index_cache", None)
    return REGISTRY


def test_bare_id_resolves_to_the_vendor_row():
    match = find_catalog_model("glm-5.3")
    assert (match.ref, match.exact) == ("zai/glm-5.3", True)


def test_relay_prefixed_id_prefers_the_vendor_tail_over_a_reseller_exact_row():
    """``zai-org/GLM-5.3`` IS listed verbatim by deepinfra, yet the vendor's own ``glm-5.3`` row is the
    canonical description (the reseller's row describes the reseller's capped serving)."""
    match = find_catalog_model("zai-org/GLM-5.3")
    assert (match.ref, match.exact) == ("zai/glm-5.3", False)


def test_vendor_prefix_on_the_id_outranks_the_aggregator_exact_row():
    assert find_catalog_model("openai/gpt-5.6").ref == "openai/gpt-5.6"


def test_catalog_provider_hint_outranks_the_brand_owner():
    match = find_catalog_model("gpt-5.6", provider_hint="openrouter")
    assert (match.ref, match.exact) == ("openrouter/openai/gpt-5.6", False)


def test_brand_owner_beats_another_lab_listing_the_same_bare_id():
    assert find_catalog_model("kimi-k3").ref == "moonshotai/kimi-k3"


def test_openrouter_routing_variant_is_stripped_before_matching():
    assert find_catalog_model("openai/gpt-5.6:nitro").ref == "openai/gpt-5.6"


@pytest.mark.parametrize("model", ["", "   ", "gpt-5.6-sol-high", "some/relay/private-model"])
def test_ids_the_catalog_does_not_know_are_none(model):
    assert find_catalog_model(model) is None


def test_match_metadata_reports_only_what_the_entry_states():
    zai = match_metadata(find_catalog_model("glm-5.3"))
    assert zai == {
        "context_length": 200_000, "max_output_tokens": 128_000, "supports_vision": False,
        "supports_reasoning": True, "supported_efforts": ["low", "high", "max"],
    }
    openai = match_metadata(find_catalog_model("gpt-5.6"))
    assert openai["max_input_tokens"] == 272_000
    assert openai["supports_vision"] is True
    assert openai["can_disable_reasoning"] is True  # a published ``none`` level
    # No modalities/attachment on the entry → vision stays unknown rather than synthesized False.
    assert "supports_vision" not in match_metadata(find_catalog_model("zai-org/GLM-5.3", provider_hint="deepinfra"))


def test_index_follows_the_registry_object(monkeypatch):
    """The lookup index is a cache of ONE registry object: a refreshed registry (new dict) must be
    re-indexed, never answered from the previous payload."""
    assert find_catalog_model("glm-5.3") is not None
    monkeypatch.setattr(models_dev, "fetch_models_dev", lambda *a, **k: {"openai": REGISTRY["openai"]})
    assert find_catalog_model("glm-5.3") is None
    assert find_catalog_model("gpt-5.6").ref == "openai/gpt-5.6"
