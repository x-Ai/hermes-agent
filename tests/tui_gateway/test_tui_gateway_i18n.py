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


# ── batch 2: slash output, CLI-exec guards, compression lock ───────────────────────────────────

def test_cli_exec_guard_hints_keep_their_english_and_resolve_in_chinese(english, monkeypatch):
    from tui_gateway import server
    assert server._cli_exec_blocked(["setup"]) == "`hermes setup` needs a full terminal — run it outside the TUI"
    assert server._cli_exec_blocked(["sessions", "browse"]).startswith("`hermes sessions browse` is interactive")
    assert server._cli_exec_blocked([]).startswith("bare `hermes` is interactive")
    assert server._cli_exec_blocked(["chat", "-q", "hi"]) is None
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()
    assert server._cli_exec_blocked(["setup"]) == i18n.t("tui_gateway.cli_exec.setup", lang="zh")
    assert server._cli_exec_blocked(["config", "edit"]) == i18n.t("tui_gateway.cli_exec.config_edit", lang="zh")
    assert server._cli_exec_blocked(["chat"]) is None


def test_live_slash_hints_and_no_session_replies_come_from_the_catalog(chinese):
    from tui_gateway import server
    # Static hints and the "no session yet" replies are resolved per call, not frozen at import.
    assert server._live_slash_command_output("sid", None, "clear", "") == i18n.t(
        "tui_gateway.slash.clear.terminal_only", lang="zh")
    assert server._live_slash_command_output("sid", None, "rename", "") == i18n.t(
        "tui_gateway.slash.hint.rename", lang="zh")
    assert server._live_slash_command_output("sid", None, "history", "") == i18n.t(
        "tui_gateway.slash.history.empty", lang="zh")
    usage = server._live_slash_command_output("sid", None, "usage", "")
    assert usage.startswith("(._.) ") and usage[6:] == i18n.t("tui_gateway.slash.no_active_agent", lang="zh")
    for text in (usage, server._live_slash_command_output("sid", None, "clear", "")):
        assert "tui_gateway." not in text and "/title" not in text or "rename" not in text


def test_compression_lock_message_names_the_holder_in_the_active_language(chinese):
    from tui_gateway import server
    held = server.CompressionLockHeld("worker-7")
    assert held.holder == "worker-7"
    assert str(held) == i18n.t("tui_gateway.compress.lock_held", lang="zh", holder="worker-7")
    anonymous = server.CompressionLockHeld()
    assert str(anonymous) == i18n.t(
        "tui_gateway.compress.lock_held", lang="zh", holder=i18n.t("tui_gateway.compress.unknown_holder", lang="zh"))


def test_every_bundled_language_keeps_the_slash_commands_users_must_type():
    """Translators may rewrite the prose, never the command the user has to type next."""
    for lang in i18n.SUPPORTED_LANGUAGES:
        assert "/voice on" in i18n.t("tui_gateway.voice.mode_off", lang=lang), lang
        assert "/browser connect" in i18n.t("tui_gateway.browser.not_connected", lang=lang), lang
        assert "/skills approval on" in i18n.t("tui_gateway.tools.skills.write_approval_off", lang=lang), lang
        assert "`/reload-mcp always`" in i18n.t("tui_gateway.tools.reload_mcp_confirm", lang=lang), lang
        assert "`hermes model`" in i18n.t("tui_gateway.credentials.non_key_auth", lang=lang, provider="p", auth="a"), lang
        assert "{count}" not in i18n.t("tui_gateway.tools.undo.done", lang=lang, count=2, unit="t", messages=3), lang


# ── batch 3: config refusals, kanban notices, connector and peer-room copy ─────────────────────

def test_config_set_word_refusals_are_catalog_keys_resolved_per_call(english):
    from tui_gateway import server
    key = server._word_setters()["approvals.mode"][2]
    assert key == "tui_gateway.config.unknown_approval_mode"
    assert i18n.t(key, lang="en", value="bogus", raw="'bogus'", options="x|y") == (
        "unknown approval mode: bogus; pick one of manual|smart|off")
    indicator = server._word_setters()["indicator"][2]
    assert i18n.t(indicator, lang="en", value=0, raw="0", options="a|b") == "unknown indicator: 0; pick one of a|b"
    assert "bogus" in i18n.t(key, lang="zh", value="bogus", raw="'bogus'", options="x|y")
    assert "manual|smart|off" in i18n.t(key, lang="zh", value="bogus", raw="'bogus'", options="x|y")


def test_kanban_event_suffixes_keep_their_leading_space_in_every_language():
    """The suffix is glued onto ``Kanban <id>``; a translation that drops the space runs the words together."""
    for lang in i18n.SUPPORTED_LANGUAGES:
        for key in ("blocked", "gave_up", "crashed"):
            assert i18n.t(f"tui_gateway.kanban.{key}", lang=lang).startswith(" "), (lang, key)
        timed_out = i18n.t("tui_gateway.kanban.timed_out", lang=lang, seconds=30)
        assert timed_out.startswith(" ") and "max_runtime=30" in timed_out, lang  # CJK catalogs spell the unit out
        assert i18n.t("tui_gateway.kanban.status", lang=lang, status="running") == " → running", lang


def test_connector_and_peer_room_refusals_are_localized(chinese):
    from tui_gateway import server
    from tui_gateway.contracts.connectors import ConnectorErrorReason
    exc = type("Exc", (), {"code": "policy_changed", "status": 409})()
    assert server._policy_error(exc, ConnectorErrorReason)[2] == i18n.t(
        "tui_gateway.connectors.policy_changed_refresh", lang="zh")
    assert i18n.t("tui_gateway.connectors.sign_in") != i18n.t("tui_gateway.connectors.sign_in", lang="en")
    from tui_gateway.hosted_room_peer_http import _BUDGET_MESSAGES
    budget = i18n.t(_BUDGET_MESSAGES["size"], kind=" probe")
    assert budget == i18n.t("tui_gateway.peer.size_limit", lang="zh", kind=" probe") and " probe" in budget


def test_dropped_queued_pick_notice_is_localized_and_names_both_models(chinese, monkeypatch):
    """A pick queued mid-turn that the guards want confirmed is dropped with a one-line warn notice
    written in the active language; both model names survive and the fallback for a session whose
    agent has no model name comes from the catalog too."""
    import types

    from tui_gateway import server

    monkeypatch.setattr(
        server, "_apply_model_switch", lambda *_a, **_kw: {"confirm_required": True, "confirm_message": "guarded"})
    monkeypatch.setattr(server, "_emit_session_info", lambda *_a, **_kw: None)
    emitted = []
    monkeypatch.setattr(server, "_emit", lambda *a, **_kw: emitted.append(a))
    pending = {"raw": "openai/gpt-5.5", "confirm_expensive_model": False,
               "display_model": "openai/gpt-5.5", "display_provider": ""}

    server._apply_pending_model_switch(
        "sid", {"agent": types.SimpleNamespace(model="deepseek/deepseek-v4.1-flash"), "pending_model_switch": dict(pending)})
    notice = next(a[2] for a in emitted if a[0] == "notification.show")
    assert notice["text"] == i18n.t(
        "tui_gateway.model.queued_switch_needs_confirm", lang="zh",
        current="deepseek/deepseek-v4.1-flash", model="openai/gpt-5.5")
    assert "Stayed on" not in notice["text"] and "tui_gateway." not in notice["text"]
    assert "\n" not in notice["text"] and notice["level"] == "warn"

    emitted.clear()
    server._apply_pending_model_switch(
        "sid", {"agent": types.SimpleNamespace(model=""), "pending_model_switch": dict(pending)})
    fallback = next(a[2] for a in emitted if a[0] == "notification.show")["text"]
    assert i18n.t("tui_gateway.model.current_model_fallback", lang="zh") in fallback
    assert "the current model" not in fallback
