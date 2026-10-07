"""The tui_gateway's "session busy" refusals read in the user's language.

Contract, not a copy snapshot: under ``zh`` the refusal is the zh catalog entry (a real translation,
never the bare key or the English prose), it still names the command it refused, and it keeps the
English ``session busy`` marker at its head — the Desktop and the terminal TUI match that text to
retry or soften a 4009 instead of surfacing it as an error.
"""

import pytest

from agent import i18n
from tui_gateway.user_messages import busy_message


@pytest.fixture
def chinese(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def test_busy_message_is_localized_and_keeps_its_marker(chinese):
    message = busy_message("/compress")

    assert message.startswith("session busy")
    assert "/compress" in message
    assert message == i18n.t("gateway.busy.streaming_reply", lang="zh", command="compress")
    assert message != i18n.t("gateway.busy.streaming_reply", lang="en", command="compress")
    assert "gateway.busy" not in message


def test_every_busy_refusal_keeps_the_marker_in_every_bundled_language():
    for lang in i18n.SUPPORTED_LANGUAGES:
        for key in ("streaming_reply", "compress_wait", "review_wait", "handoff_wait"):
            text = i18n.t(f"gateway.busy.{key}", lang=lang, command="undo")
            assert text.startswith("session busy"), (lang, key, text)
            assert "gateway.busy" not in text, (lang, key)
        assert "gateway.busy" not in i18n.t("gateway.busy.subagent_running", lang=lang)


def test_compress_refusal_is_localized_and_keeps_its_marker(chinese):
    message = busy_message("/undo", compressing=True)

    assert message.startswith("session busy")
    assert "/undo" in message and "/compress" in message
    assert message == i18n.t("gateway.busy.compress_wait", lang="zh", command="undo")
    assert message != busy_message("/undo")


def test_english_default_names_the_command_and_the_stop_affordances(monkeypatch):
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    monkeypatch.setattr(i18n, "_config_language", lambda: None)
    try:
        message = busy_message("undo")
        assert message.startswith("session busy") and "/undo" in message
        assert "Stop button" in message and "Ctrl+C" in message
    finally:
        i18n.reset_language_cache()
