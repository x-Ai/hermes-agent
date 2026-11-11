"""The bare ``custom`` provider's display label is i18n-aware.

"Custom endpoint" is UI prose (unlike provider ids / model ids, which are
identifiers and stay untranslated), so it resolves through the locale
catalog at call time: ``locales/<lang>.yaml`` key ``provider.custom_endpoint``.

Guards the read-time resolution contract: the label must NOT be frozen into
module-level dicts at import time, because the active language comes from
config/env and can differ per process.
"""

from __future__ import annotations

from agent.i18n import t
from hermes_cli.model_switch import _bare_custom_provider_def, switch_model
from hermes_cli.models import provider_label
from hermes_cli.providers import custom_endpoint_label, get_label


def test_catalog_key_exists_in_english():
    """A missing key would make t() return the key path itself — the label
    functions must always resolve to a human string."""
    assert t("provider.custom_endpoint", lang="en") != "provider.custom_endpoint"


def test_labels_default_to_english():
    en_label = t("provider.custom_endpoint", lang="en")
    assert provider_label("custom") == en_label
    assert get_label("custom") == en_label
    assert custom_endpoint_label() == en_label


def test_labels_localize_with_language_env(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    zh_label = t("provider.custom_endpoint", lang="zh")
    assert zh_label != t("provider.custom_endpoint", lang="en")  # zh catalog actually translates it
    assert provider_label("custom") == zh_label
    assert get_label("custom") == zh_label
    assert custom_endpoint_label() == zh_label


def test_bare_custom_provider_def_uses_localized_name(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    pdef = _bare_custom_provider_def("https://relay.example.com/v1")
    assert pdef is not None
    assert pdef.name == t("provider.custom_endpoint", lang="zh")


def test_switch_on_bare_custom_endpoint_reports_localized_label(monkeypatch):
    """The /model result names the bare custom endpoint in the user's language, where upstream
    hardcodes the English label (merges have reverted such call sites before)."""
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    monkeypatch.setattr(
        "hermes_cli.models_validate.validate_requested_model",
        lambda *a, **k: {"accepted": True, "persist": True, "recognized": True, "message": None},
    )
    monkeypatch.setattr("hermes_cli.model_switch.get_model_info", lambda *a, **k: None)
    monkeypatch.setattr("hermes_cli.model_switch.get_model_capabilities", lambda *a, **k: None)

    result = switch_model(
        raw_input="gpt-4o-mini",
        current_provider="custom",
        current_model="gpt-4o",
        current_base_url="https://relay.example.com/v1",
        current_api_key="sk-test",
        explicit_provider="custom",
        user_providers={},
        custom_providers=[],
    )

    assert result.success, result.error_message
    assert result.provider_label == t("provider.custom_endpoint", lang="zh")


def test_other_provider_labels_unaffected():
    assert get_label("moa") == "Mixture of Agents"
    assert provider_label("moa") == "Mixture of Agents"
