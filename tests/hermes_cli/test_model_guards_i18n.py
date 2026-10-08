"""The expensive-model and data-training selection guards render from the catalogs in the active language.

Contract: ``expensive_model_warning`` / ``data_training_warning`` and the registry titles resolve
``core.model_switch.*`` per call — the client language the TUI gateway binds for a Desktop window, the
CLI modal and the messaging-gateway confirm show the same localized title and body — while the English
renderings stay byte-identical to the former literals (which the startup and gateway tests still grep).
"""

from decimal import Decimal

import pytest

from agent import i18n
from agent.usage_pricing import PricingEntry
from hermes_cli.model_cost_guard import expensive_model_warning
from hermes_cli.model_data_policy_guard import data_training_warning
from hermes_cli.model_selection_guards import selection_warnings

PRICED = PricingEntry(
    input_cost_per_million=Decimal("25.00"), output_cost_per_million=Decimal("150.00"),
    source="provider_models_api")

EXPENSIVE_EN = (
    "!!! EXPENSIVE MODEL WARNING !!!\n"
    "\n"
    "openai/gpt-5.5-pro has known pricing above Hermes' safety threshold.\n"
    "Input tokens: $25.00/M\n"
    "Output tokens: $150.00/M\n"
    "Threshold: more than $20/M input tokens or more than $100/M output tokens.\n"
    "Pricing source: provider_models_api.\n"
    "did you mean to select openai/gpt-5.5?\n"
    "Confirm only if you intend to use this model.")

META_EN = (
    "!!! CONTRIBUTOR TIER — TRAINS ON YOUR DATA !!!\n"
    "\n"
    "This is Meta's contributor tier. Selecting it permits Meta to use your\n"
    "prompts and completions to train future Meta models.\n"
    "\n"
    "See current pricing and rate limits for the Meta Model API here:\n"
    "  https://dev.meta.ai/docs/pricing-rate-limits/\n"
    "\n"
    "It lowers the barrier to entry for prototyping, testing integrations, and\n"
    "scaling experiments where training on your data is acceptable. Do NOT use it\n"
    "for confidential, proprietary, personal, or otherwise sensitive data. For the\n"
    "same model with no training on your data, select the standard variant\n"
    "(without the -contributor suffix).\n"
    "\n"
    "Confirm only if training on your prompts and completions is acceptable.")


def zh(key: str, **fmt: str) -> str:
    return i18n.t(key, lang="zh", **fmt)


@pytest.fixture
def client_language():
    """Bind the language a connected client announced (what the TUI gateway does per RPC)."""
    tokens = []

    def _bind(lang: str):
        tokens.append(i18n.bind_client_language(lang))

    yield _bind
    for token in reversed(tokens):
        i18n.reset_client_language(token)


@pytest.fixture
def priced_openrouter(monkeypatch):
    monkeypatch.setattr("agent.models_dev.get_model_info", lambda *_a, **_k: None)
    monkeypatch.setattr("agent.usage_pricing.get_pricing_entry", lambda *_a, **_k: PRICED)


def test_english_renderings_match_the_former_literals(client_language, priced_openrouter):
    client_language("en")
    assert expensive_model_warning("openai/gpt-5.5-pro", provider="openrouter").message == EXPENSIVE_EN
    assert data_training_warning("muse-spark-1.2-contributor", provider="meta-ai").message == META_EN
    cost = selection_warnings("openai/gpt-5.5-pro", provider="openrouter", include_kinds=["cost"])
    assert [w.title for w in cost] == ["Expensive Model Warning"]
    titles = {w.kind: w.title for w in selection_warnings("muse-spark-1.2-contributor", provider="custom")}
    assert titles["data_policy"] == "Data-Training Tier Warning"


def test_expensive_model_warning_follows_the_clients_language(client_language, priced_openrouter):
    client_language("zh")
    warning = expensive_model_warning("openai/gpt-5.5-pro", provider="openrouter")
    assert warning.message.split("\n") == [
        zh("core.model_switch.expensive_banner"),
        "",
        zh("core.model_switch.expensive_above_threshold", model="openai/gpt-5.5-pro"),
        zh("core.model_switch.expensive_input", price="$25.00/M"),
        zh("core.model_switch.expensive_output", price="$150.00/M"),
        zh("core.model_switch.expensive_threshold", input_limit="20", output_limit="100"),
        zh("core.model_switch.expensive_source", source="provider_models_api"),
        zh("core.model_switch.expensive_gpt55_suggestion"),
        zh("core.model_switch.expensive_confirm"),
    ]
    assert warning.message != EXPENSIVE_EN
    # The facts a user acts on survive translation: the model, both prices, both limits, the nudge.
    for literal in ("openai/gpt-5.5-pro", "$25.00/M", "$150.00/M", "$20/M", "$100/M", "openai/gpt-5.5"):
        assert literal in warning.message
    assert "core.model_switch" not in warning.message
    title = selection_warnings("openai/gpt-5.5-pro", provider="openrouter", include_kinds=["cost"])[0].title
    assert title == zh("core.model_switch.expensive_title") != "Expensive Model Warning"


def test_unknown_price_is_localized(client_language, monkeypatch):
    monkeypatch.setattr("agent.models_dev.get_model_info", lambda *_a, **_k: None)
    monkeypatch.setattr("agent.usage_pricing.get_pricing_entry", lambda *_a, **_k: None)
    client_language("zh")
    message = expensive_model_warning("openai/gpt-5.5-pro", provider="openai-codex").message
    unknown = zh("core.model_switch.expensive_unknown_price")
    assert zh("core.model_switch.expensive_input", price=unknown) in message
    assert zh("core.model_switch.expensive_output", price=unknown) in message
    assert "unknown" not in message


def test_data_training_warning_follows_the_clients_language(client_language):
    client_language("zh")
    warning = data_training_warning("muse-spark-1.2-contributor", provider="meta-ai")
    parts = ("banner", "intro", "pricing", "usage", "confirm")
    assert warning.message == "\n\n".join(zh(f"core.model_switch.meta_contributor_{part}") for part in parts)
    assert warning.message != META_EN
    # The facts a user acts on survive translation: the pricing page and the suffix to drop.
    assert "https://dev.meta.ai/docs/pricing-rate-limits/" in warning.message
    assert "-contributor" in warning.message
    assert "core.model_switch" not in warning.message
    policy = next(w for w in selection_warnings("muse-spark-1.2-contributor", provider="custom")
                  if w.kind == "data_policy")
    assert policy.title == zh("core.model_switch.data_training_title") != "Data-Training Tier Warning"
