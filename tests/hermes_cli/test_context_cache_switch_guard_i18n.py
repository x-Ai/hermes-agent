"""The large-context model-switch warning renders from the catalogs in the active language.

Contract: ``_context_cache_guard`` resolves ``core.model_switch.large_context_*`` per call — under the
client language the TUI gateway binds for a Desktop window, the CLI modal and the messaging-gateway
confirm show the same localized title and body — while the English rendering stays byte-identical to
the former literal, so the wire text clients saw before does not drift.
"""

from unittest.mock import patch

import pytest

from agent import i18n
from hermes_cli.model_selection_guards import (
    DEFAULT_CONTEXT_CACHE_SWITCH_THRESHOLD,
    SelectionContext,
    _context_cache_guard,
)

MODEL = "deepseek-ai/DeepSeek-V4.1-Flash"
TOKENS = 266_841
THRESHOLD = DEFAULT_CONTEXT_CACHE_SWITCH_THRESHOLD


def _no_config(*_a, **_k):
    raise FileNotFoundError("no config in tests")


def _warning():
    with patch("hermes_cli.config.load_config", _no_config):
        return _context_cache_guard(
            MODEL, "openrouter", None, None, None,
            SelectionContext(context_tokens=TOKENS, current_model="old/model"))


@pytest.fixture
def client_language():
    """Bind the language a connected client announced (what the TUI gateway does per RPC)."""
    tokens = []

    def _bind(lang: str):
        tokens.append(i18n.bind_client_language(lang))

    yield _bind
    for token in reversed(tokens):
        i18n.reset_client_language(token)


def test_english_rendering_matches_the_former_literal(client_language):
    client_language("en")
    warning = _warning()
    assert warning.title == "Large Context Switch Warning"
    assert warning.message == (
        "!!! LARGE CONTEXT MODEL SWITCH !!!\n"
        "\n"
        f"This session holds ~{TOKENS:,} tokens of context.\n"
        f"Switching to {MODEL} makes the next reply re-read all of it uncached (providers key "
        "prompt caches per model) — a one-time full-price input cost.\n"
        "\n"
        f"Threshold: model.switch_context_confirm_tokens (currently {THRESHOLD:,}; 0 disables this check).\n"
        "Confirm only if you intend to switch now.")


def test_warning_follows_the_clients_language(client_language):
    client_language("zh")
    warning = _warning()
    assert warning.title == i18n.t("core.model_switch.large_context_title", lang="zh")
    assert warning.title != "Large Context Switch Warning"
    lines = warning.message.split("\n")
    assert lines[0] == i18n.t("core.model_switch.large_context_banner", lang="zh")
    assert lines[2] == i18n.t("core.model_switch.large_context_size", lang="zh", tokens=f"{TOKENS:,}")
    assert lines[3] == i18n.t("core.model_switch.large_context_cost", lang="zh", model=MODEL)
    assert lines[5] == i18n.t(
        "core.model_switch.large_context_threshold", lang="zh", threshold=f"{THRESHOLD:,}")
    assert lines[6] == i18n.t("core.model_switch.large_context_confirm", lang="zh")
    # The facts a user acts on survive translation: size, target, threshold and the config key.
    for literal in (f"{TOKENS:,}", MODEL, f"{THRESHOLD:,}", "model.switch_context_confirm_tokens"):
        assert literal in warning.message
    assert "LARGE CONTEXT MODEL SWITCH" not in warning.message
    assert "core.model_switch" not in warning.message + warning.title
