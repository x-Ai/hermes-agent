"""A plugin's declared effort vocabulary (``ProviderProfile.supported_reasoning_efforts``) is the set its
own request builder clamps onto.

The picker and the composer's reasoning pill read the declaration to dim levels the route will not
send verbatim; the transports read the builder. The two must agree, or the UI dims a level the wire
accepts (or offers one it rejects). ``()`` means the builder emits no reasoning field at all; ``None``
means the plugin does not know (unknown is honest, the UI keeps the whole ladder).
"""

from __future__ import annotations

import pytest

# (provider, model, extra kwargs the builder needs to treat the model as a reasoning model)
DECLARING_ROUTES = [
    ("zai", "glm-5.3", {}),
    ("zai", "glm-5.2", {}),
    ("deepseek", "deepseek-v4-pro", {}),
    ("deepseek", "deepseek-flash", {}),
    ("kimi-coding", "k3", {}),
    ("ollama-cloud", "kimi-k2.6", {"supports_reasoning": True}),
    ("meta-ai", "muse-spark", {}),
    ("upstage", "solar-pro3", {}),
    ("nebius-token-factory", "deepseek-ai/DeepSeek-V4", {}),
    ("opencode-go", "glm-5.2", {}),
    ("opencode-go", "kimi-k2.6", {}),
    ("opencode-zen", "x-preview-f-free", {}),
]


@pytest.fixture(scope="module")
def profile_for():
    import model_tools  # noqa: F401  — plugin discovery registers the provider profiles
    import providers

    def lookup(name):
        profile = providers.get_provider_profile(name)
        assert profile is not None, f"{name} profile must be registered"
        return profile

    return lookup


@pytest.mark.parametrize("effort", ["minimal", "medium", "xhigh", "ultra"])
@pytest.mark.parametrize("provider, model, extra", DECLARING_ROUTES)
def test_the_level_sent_on_the_wire_is_inside_the_declared_set(profile_for, provider, model, extra, effort):
    profile = profile_for(provider)
    declared = profile.supported_reasoning_efforts(model)
    assert declared, f"{provider}/{model} must declare a non-empty vocabulary"
    _extra_body, top_level = profile.build_api_kwargs_extras(
        reasoning_config={"enabled": True, "effort": effort}, model=model, **extra)
    sent = top_level.get("reasoning_effort")
    if sent is not None:
        assert sent in declared, f"{provider}/{model}: sent {sent!r} outside declared {declared}"


@pytest.mark.parametrize("effort", ["low", "high", "max"])
def test_a_no_parameter_declaration_matches_a_builder_that_sends_nothing(profile_for, effort):
    upstage = profile_for("upstage")
    assert upstage.supported_reasoning_efforts("solar-mini") == ()
    extra_body, top_level = upstage.build_api_kwargs_extras(reasoning_config={"enabled": True, "effort": effort}, model="solar-mini")
    assert "reasoning_effort" not in top_level and "reasoning" not in extra_body


@pytest.mark.parametrize("provider, model", [("deepseek", "deepseek-v3"), ("zai", "glm-4-9b"), ("xai", "grok-4"), ("nebius-token-factory", "llama-3.3-70b")])
def test_models_the_plugin_sends_no_effort_to_stay_unknown(profile_for, provider, model):
    assert profile_for(provider).supported_reasoning_efforts(model) is None


def test_xai_declares_the_grok_generation_ladders(profile_for):
    from agent.reasoning_effort import XAI_GROK46_EFFORTS, XAI_LEGACY_EFFORTS

    xai = profile_for("xai")
    assert xai.supported_reasoning_efforts("grok-4.6") == XAI_GROK46_EFFORTS
    assert xai.supported_reasoning_efforts("grok-4.5") == XAI_LEGACY_EFFORTS
