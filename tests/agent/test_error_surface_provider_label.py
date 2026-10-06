"""The error card names the configured endpoint, not the generic "Custom endpoint".

A named custom endpoint runs as the resolved provider ``"custom"`` (``agent.provider``), whose
catalog label is generic; ``agent_provider_label`` recovers the identity the user configured and the
surface carries it as ``provider_label`` while ``provider`` stays the slug recovery actions key on."""

from __future__ import annotations

from types import SimpleNamespace

from agent.error_surface import agent_provider_label, build_error_surface_from_result
from agent.i18n import t


def _agent(**fields):
    base = {"provider": "custom", "requested_provider": "", "base_url": "https://api.inyx.ai/v1", "model": "m"}
    return SimpleNamespace(**{**base, **fields})


def _failed(reason="auth"):
    return {"completed": False, "failed": True, "error": "HTTP 403", "failure_reason": reason}


def test_named_custom_endpoint_is_labelled_by_its_configured_identity():
    assert agent_provider_label(_agent(requested_provider="custom:in-y-x")) == "in-y-x"
    assert agent_provider_label(_agent(requested_provider="in-y-x")) == "in-y-x"
    assert agent_provider_label(_agent(requested_provider="Custom:In-Y-X")) == "in-y-x"


def test_bare_custom_recovers_the_identity_from_the_endpoint_url(monkeypatch):
    seen = {}

    def fake_identity(base_url=None, model=None):
        seen.update(base_url=base_url, model=model)
        return "custom:relay"

    monkeypatch.setattr("hermes_cli.runtime_provider.canonical_custom_identity", fake_identity)
    assert agent_provider_label(_agent(requested_provider="custom")) == "relay"
    assert seen == {"base_url": "https://api.inyx.ai/v1", "model": "m"}


def test_unresolvable_custom_endpoint_keeps_the_generic_label(monkeypatch):
    monkeypatch.setattr("hermes_cli.runtime_provider.canonical_custom_identity", lambda **_kw: None)
    assert agent_provider_label(_agent(requested_provider="")) == t("provider.custom_endpoint")


def test_builtin_providers_keep_their_catalog_label():
    assert agent_provider_label(_agent(provider="openrouter", requested_provider="openrouter")) == "OpenRouter"
    assert agent_provider_label(_agent(provider="")) == ""


def test_surface_carries_the_override_and_keeps_the_resolved_slug():
    surface = build_error_surface_from_result(_failed("auth"), provider="custom", provider_label="in-y-x")
    assert surface["provider_label"] == "in-y-x"
    assert surface["provider"] == "custom"  # recovery actions (api_key_env, auth_kind) key on the slug
    assert surface["auth_kind"] == "api_key"

    plain = build_error_surface_from_result(_failed("auth"), provider="custom")
    assert plain["provider_label"] == t("provider.custom_endpoint")


def test_override_reaches_every_surface_shape():
    assert build_error_surface_from_result(_failed("billing"), provider="custom", provider_label="x")["provider_label"] == "x"
    assert build_error_surface_from_result(
        {"completed": False, "failed": True, "error": "boom"}, provider="custom", provider_label="x")["provider_label"] == "x"
    assert build_error_surface_from_result(
        {"completed": False, "failed": True, "error": "No space left on device"}, provider="custom",
        provider_label="x")["provider_label"] == "x"
