"""The tui_gateway's turn, session, storage and attachment copy reads in the user's language.

Contracts, not copy snapshots: under ``zh`` each message is the zh catalog entry (never the bare
key nor the English prose), its placeholders are filled, and the machine-readable fields clients
key on (``StorageFailure.code``) do not move. With no language configured the English copy keeps
the shape the Desktop, the terminal TUI and their tests rely on: title / ``Details:`` / hint
lines, code-then-layer-then-default resolution, and the /model hint for an unrecoverable turn.
"""

import sqlite3

import pytest

from agent import i18n
from hermes_state_user_copy import describe_storage_failure
from tui_gateway.user_messages import (
    agent_init_failed_message, agent_missing_for_turn, agent_still_starting, resume_failed_message,
    turn_error_hint, turn_error_text, turn_error_title)


@pytest.fixture
def chinese(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


@pytest.fixture
def english(monkeypatch):
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    monkeypatch.setattr(i18n, "_config_language", lambda: None)
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def test_turn_error_text_keeps_its_three_line_shape_in_english(english):
    text = turn_error_text("boom", {"code": "rate_limit", "provider": "openrouter"})
    assert text.splitlines() == [
        "The model provider is rate-limiting requests (openrouter). Your message was not answered.",
        "Details: boom",
        "Wait a moment, then /retry.",
    ]
    assert turn_error_text("", {"layer": "disk"}).splitlines() == [
        "The disk is full, so Hermes could not save the turn. Your message was not answered.",
        "Free some space, then /retry.",
    ]


@pytest.mark.parametrize(("surface", "expected"), [
    ({"code": "auth_permanent"}, "The model provider rejected the API key"),  # alias of ``auth``
    ({"code": "upstream_rate_limit"}, "The model provider is rate-limiting requests"),
    ({"code": "nothing_known", "layer": "billing"}, "The model provider reports no credit left"),
    ({"layer": "endpoint"}, "Your custom model endpoint did not answer"),
    ({"code": "mystery", "layer": "nowhere"}, "The request failed"),
    (None, "The request failed"),
])
def test_title_resolves_code_then_layer_then_default(english, surface, expected):
    assert turn_error_title(surface) == expected


@pytest.mark.parametrize(("surface", "recoverable", "expected"), [
    ({"layer": "streaming"}, True, "Send /retry."),
    ({"layer": "streaming"}, False, "Pick another model with /model."),
    ({"layer": "gateway"}, False, "Pick another model with /model; type /logs for the trace."),
    (None, False, "Pick another model with /model, or switch with /model."),
    # Hints that do not open with "Send /retry" have nothing to swap.
    ({"code": "timeout"}, False, "Try /retry; if it keeps happening, switch with /model."),
])
def test_unrecoverable_turns_swap_the_retry_hint_for_model(english, surface, recoverable, expected):
    assert turn_error_hint(surface, recoverable) == expected


def test_turn_error_text_is_localized_and_keeps_detail_and_identity(chinese):
    text = turn_error_text("boom", {"code": "rate_limit", "provider": "openrouter"})
    assert text.startswith(i18n.t("tui_gateway.turn_error.code.rate_limit.title", lang="zh"))
    assert "(openrouter)" in text and "boom" in text and "/retry" in text
    assert "Your message was not answered" not in text and "tui_gateway." not in text
    assert turn_error_hint({"layer": "provider"}, recoverable=False) == i18n.t(
        "tui_gateway.turn_error.layer.provider.hint_unrecoverable", lang="zh")


def test_session_level_messages_are_localized_and_keep_their_facts(chinese):
    lock = agent_init_failed_message(TimeoutError("Timed out waiting for auth store lock (/x/auth.lock)"))
    generic = agent_init_failed_message(RuntimeError("provider bootstrap failed"))
    assert lock == i18n.t("tui_gateway.agent.init_failed_lock", lang="zh",
                          detail="Timed out waiting for auth store lock (/x/auth.lock)")
    assert generic == i18n.t("tui_gateway.agent.init_failed", lang="zh", detail="provider bootstrap failed")
    assert "/model" not in lock and "/model" in generic and "hermes setup" in generic

    resume = resume_failed_message(OSError("transcript gone"))
    assert resume == i18n.t("tui_gateway.resume.failed", lang="zh", detail="transcript gone")
    assert "/new" in resume and "/sessions" in resume

    for text, key in ((agent_still_starting(), "still_starting"), (agent_missing_for_turn(), "missing_for_turn")):
        assert text == i18n.t(f"tui_gateway.agent.{key}", lang="zh")
        assert text != i18n.t(f"tui_gateway.agent.{key}", lang="en")
        assert "tui_gateway." not in text


def test_storage_failure_copy_is_localized_but_its_code_does_not_move(chinese):
    failure = describe_storage_failure(sqlite3.OperationalError("database is locked"))
    assert (failure.cause, failure.code) == ("locked", "storage_locked")
    assert failure.gloss == i18n.t("storage.cause.locked", lang="zh")
    assert failure.gloss != i18n.t("storage.cause.locked", lang="en")
    assert "{profile_arg}" not in failure.action and "`hermes gateway stop`" in failure.action

    unknown = describe_storage_failure(None)
    assert unknown.code == "storage_unavailable"
    assert unknown.action == i18n.t("storage.action.unknown", lang="zh", profile_arg="")


def test_every_bundled_language_keeps_the_recovery_commands_and_placeholders():
    """Translators may rewrite the prose, never the commands the user has to paste."""
    for lang in i18n.SUPPORTED_LANGUAGES:
        action = i18n.t("storage.action.deleted_wal", lang=lang, profile_arg="-p x ", url="https://guide")
        assert "`hermes -p x gateway stop`" in action and "https://guide" in action, lang
        assert "/model" in i18n.t("tui_gateway.turn_error.default.hint_unrecoverable", lang=lang), lang
        assert "{detail}" not in i18n.t("tui_gateway.resume.failed", lang=lang, detail="d"), lang
