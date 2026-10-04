"""models.dev ``reasoning_options`` → ``ModelCapabilities.supported_efforts`` / ``can_disable_reasoning``.

The vendor-published effort vocabulary reaches every consumer through ``get_model_capabilities`` (the
one plugin seam); absence must stay "unknown", never a synthesized verdict.
"""

from __future__ import annotations

import pytest

from agent import models_dev
from agent.models_dev import entry_reasoning_support, get_model_capabilities


def test_effort_values_and_toggle_are_both_read():
    entry = {"reasoning_options": [{"type": "toggle"}, {"type": "effort", "values": ["Low", "high", "max", "high"]}]}
    assert entry_reasoning_support(entry) == (("low", "high", "max"), True)


def test_effort_only_leaves_the_disable_verdict_unknown():
    """Vendors omit ``toggle`` inconsistently, so its absence is not a mandatory-reasoning verdict."""
    assert entry_reasoning_support({"reasoning_options": [{"type": "effort", "values": ["low", "high"]}]}) == (("low", "high"), None)


def test_a_published_none_level_means_thinking_can_be_disabled():
    efforts, can_disable = entry_reasoning_support({"reasoning_options": [{"type": "effort", "values": ["none", "low"]}]})
    assert (efforts, can_disable) == (("none", "low"), True)


@pytest.mark.parametrize("entry", [
    {}, {"reasoning_options": None}, {"reasoning_options": "effort"}, {"reasoning_options": [{"type": "budget_tokens", "min": 0}]},
    {"reasoning_options": [{"type": "effort", "values": []}]}, {"reasoning_options": ["low"]},
])
def test_missing_or_malformed_options_are_unknown(entry):
    assert entry_reasoning_support(entry) == (None, None)


def test_capabilities_carry_the_published_vocabulary(monkeypatch):
    catalog = {
        "published": {"reasoning": True, "tool_call": True, "limit": {"context": 128_000},
                      "reasoning_options": [{"type": "toggle"}, {"type": "effort", "values": ["low", "high"]}]},
        "silent": {"reasoning": True, "tool_call": True, "limit": {"context": 128_000}},
    }
    monkeypatch.setattr(models_dev, "_registry_models", lambda *a, **k: catalog)
    monkeypatch.setattr(models_dev, "_load_model_overrides", lambda *a, **k: {})

    published = get_model_capabilities("openai", "published")
    assert (published.supported_efforts, published.can_disable_reasoning) == (("low", "high"), True)
    silent = get_model_capabilities("openai", "silent")
    assert (silent.supported_efforts, silent.can_disable_reasoning) == (None, None)
