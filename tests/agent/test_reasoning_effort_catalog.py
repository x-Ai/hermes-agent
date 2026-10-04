"""``agent.reasoning_effort_catalog``: one merged "which effort levels does this route take" verdict.

Precedence under test: Codex ladder → a RESTRICTIVE plugin declaration → the serving aggregator's
catalog → models.dev ``reasoning_options`` (cross-provider match only for routes with no catalog of
their own) → unknown. The custom profile's generic ceiling is "undiscoverable", never a verdict.
"""

from __future__ import annotations

import providers
from providers.base import ProviderProfile

from agent import models_dev, models_dev_search
from agent.models_dev import ModelCapabilities
from agent.reasoning_effort import OPENAI_COMPAT_WIRE_EFFORTS
from agent.reasoning_effort_catalog import UNKNOWN_SUPPORT, route_profile, route_reasoning_support


class _Declaring(ProviderProfile):
    def __init__(self, name: str, declared, **kw):
        super().__init__(name=name, **kw)
        self._declared = declared

    def supported_reasoning_efforts(self, model):
        return self._declared


REGISTRY = {"zai": {"models": {"glm-5.3": {
    "reasoning": True, "limit": {"context": 200_000}, "reasoning_options": [{"type": "effort", "values": ["low", "high", "max"]}],
}}}}


def _isolated(monkeypatch, *profiles: ProviderProfile):
    monkeypatch.setattr(providers, "_REGISTRY", {})
    monkeypatch.setattr(providers, "_ALIASES", {})
    monkeypatch.setattr(providers, "_discovered", True)
    for profile in profiles:
        providers.register_provider(profile)
    monkeypatch.setattr(models_dev, "fetch_models_dev", lambda *a, **k: REGISTRY)
    monkeypatch.setattr(models_dev, "_registry_models", lambda *a, **k: None)
    monkeypatch.setattr(models_dev, "_load_model_overrides", lambda *a, **k: {})
    monkeypatch.setattr(models_dev_search, "_index_cache", None)


AGG_DETAIL = {"supports_reasoning": True, "supported_efforts": ["minimal", "low"], "mandatory": True}
CAT_CAPS = ModelCapabilities(supports_reasoning=True, supported_efforts=("medium",), can_disable_reasoning=True)


def test_codex_ladder_comes_first_and_carries_ultra_on_the_app_server(monkeypatch):
    _isolated(monkeypatch)
    support = route_reasoning_support("openai-codex", "gpt-5.6", "codex_app_server")
    assert support.source == "codex"
    assert {"none", "max", "ultra"} <= set(support.efforts)
    assert support.can_disable is True


def test_restrictive_declaration_beats_both_catalogs_but_not_the_aggregator_disable_verdict(monkeypatch):
    _isolated(monkeypatch, _Declaring("fixture-strict", ("low", "high", "max")))
    support = route_reasoning_support("fixture-strict", "m", aggregator_detail=AGG_DETAIL, catalog_caps=CAT_CAPS)
    assert (support.efforts, support.source) == (("low", "high", "max"), "profile")
    assert support.can_disable is False  # the serving route says mandatory


def test_a_no_parameter_declaration_is_definitive(monkeypatch):
    _isolated(monkeypatch, _Declaring("fixture-none", ()))
    support = route_reasoning_support("fixture-none", "m", aggregator_detail=AGG_DETAIL, catalog_caps=CAT_CAPS)
    assert (support.efforts, support.can_disable, support.source) == ((), None, "profile")


def test_generic_ceiling_is_not_a_verdict(monkeypatch):
    _isolated(monkeypatch, _Declaring("fixture-generic", OPENAI_COMPAT_WIRE_EFFORTS))
    assert route_reasoning_support("fixture-generic", "m", catalog_caps=CAT_CAPS, aggregator_detail=None).efforts == ("medium",)
    # Nothing below the ceiling knows the model either → unknown, so the client keeps the whole ladder.
    assert route_reasoning_support("fixture-generic", "m", catalog_caps=None, aggregator_detail=None) == UNKNOWN_SUPPORT


def test_aggregator_catalog_outranks_models_dev(monkeypatch):
    _isolated(monkeypatch, ProviderProfile(name="fixture-silent"))
    detail = {"supports_reasoning": True, "supported_efforts": ["High", "max"], "mandatory": False}
    support = route_reasoning_support("fixture-silent", "m", aggregator_detail=detail, catalog_caps=CAT_CAPS)
    assert (support.efforts, support.can_disable, support.source) == (("high", "max"), True, "aggregator")


def test_aggregator_without_a_reasoning_parameter_means_no_controls(monkeypatch):
    _isolated(monkeypatch, ProviderProfile(name="fixture-silent"))
    support = route_reasoning_support("fixture-silent", "m", aggregator_detail={"supports_reasoning": False}, catalog_caps=CAT_CAPS)
    assert (support.efforts, support.source) == ((), "aggregator")


def test_custom_route_without_a_catalog_falls_back_to_a_cross_provider_match(monkeypatch):
    _isolated(monkeypatch)
    support = route_reasoning_support("custom:relay", "zai-org/GLM-5.3", catalog_caps=None, aggregator_detail=None)
    assert (support.efforts, support.source) == (("low", "high", "max"), "catalog_match")


def test_a_catalogued_vendor_never_cross_matches(monkeypatch):
    """``openai`` has its own catalog; a miss there is a miss, not an excuse to borrow zai's row."""
    _isolated(monkeypatch)
    assert route_reasoning_support("openai", "glm-5.3", catalog_caps=None, aggregator_detail=None) == UNKNOWN_SUPPORT


def test_published_none_level_implies_a_disable(monkeypatch):
    _isolated(monkeypatch, _Declaring("fixture-off", ("none", "low", "high")))
    support = route_reasoning_support("fixture-off", "m", aggregator_detail=None, catalog_caps=None)
    assert (support.efforts, support.can_disable) == (("none", "low", "high"), True)


def test_blank_model_is_unknown(monkeypatch):
    _isolated(monkeypatch)
    assert route_reasoning_support("zai", "") == UNKNOWN_SUPPORT


def test_route_profile_follows_the_endpoint_host_before_the_provider_name(monkeypatch):
    """A ``custom:`` entry pointed at a vendor host speaks that vendor's vocabulary."""
    host_profile = _Declaring("deepseek", ("low", "high"))
    _isolated(monkeypatch, host_profile, _Declaring("relay", ("minimal",)))
    assert route_profile("custom:relay", "https://api.deepseek.com/v1") is host_profile
    assert route_profile("relay", None).name == "relay"
    assert route_profile("nobody", None) is None
