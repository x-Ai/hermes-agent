"""The failed-turn boundary row is written in the profile's language.

Contract: ``failed_turn_notice`` resolves ``core.failed_turn.*`` per call (hedged when a tool may have
run), the English rendering stays byte-identical to the legacy constants that
``untyped_failed_turn_display_kind`` still matches on older transcripts, and the gateway closer shares
the same text.
"""

import pytest

from agent import i18n
from agent.turn_failure_copy import (
    AUTOMATION_INTERRUPTED_NOTICE, FAILED_TURN_DISPLAY_KIND, FAILED_TURN_NOTICE, PARTIAL_FAILED_TURN_NOTICE,
    automation_interrupted_notice, failed_turn_notice, partial_failed_turn_notice, restart_interrupt_notice,
    shutdown_interrupt_notice, untyped_failed_turn_display_kind)


@pytest.fixture
def chinese(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def test_english_rendering_matches_the_legacy_constants(monkeypatch):
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    monkeypatch.setattr(i18n, "_config_language", lambda: None)
    i18n.reset_language_cache()
    try:
        assert failed_turn_notice([{"role": "user", "content": "hi"}]) == FAILED_TURN_NOTICE
        assert failed_turn_notice([{"role": "assistant", "tool_calls": [{}]}]) == PARTIAL_FAILED_TURN_NOTICE
        assert partial_failed_turn_notice() == PARTIAL_FAILED_TURN_NOTICE
        assert automation_interrupted_notice() == AUTOMATION_INTERRUPTED_NOTICE
        from gateway.session_settlement_recovery import RESTART_INTERRUPT_NOTICE, SHUTDOWN_INTERRUPT_NOTICE
        assert restart_interrupt_notice() == RESTART_INTERRUPT_NOTICE
        assert shutdown_interrupt_notice() == SHUTDOWN_INTERRUPT_NOTICE
    finally:
        i18n.reset_language_cache()


def test_notice_is_localized_and_hedges_when_a_tool_ran(chinese):
    plain = failed_turn_notice([{"role": "user", "content": "hi"}])
    hedged = failed_turn_notice([{"role": "tool", "content": "ran"}])
    assert plain == i18n.t("core.failed_turn.notice", lang="zh") != FAILED_TURN_NOTICE
    assert hedged == i18n.t("core.failed_turn.partial_notice", lang="zh") == partial_failed_turn_notice()
    assert "core.failed_turn" not in plain + hedged
    # Legacy rows carry the English text and no display_kind; the read-side matcher still types them.
    assert untyped_failed_turn_display_kind("assistant", FAILED_TURN_NOTICE) == FAILED_TURN_DISPLAY_KIND


def test_settled_automation_notice_is_localized_and_its_legacy_row_still_typed(chinese):
    """The unattended-turn closer (gateway/session_unattended_unknown.py) writes this copy; a row an older
    gateway wrote in English is typed by the read-side matcher like the other two notices."""
    notice = automation_interrupted_notice()
    assert notice == i18n.t("core.failed_turn.automation_interrupted", lang="zh") != AUTOMATION_INTERRUPTED_NOTICE
    assert "core.failed_turn" not in notice
    assert untyped_failed_turn_display_kind("assistant", AUTOMATION_INTERRUPTED_NOTICE) == FAILED_TURN_DISPLAY_KIND


@pytest.mark.parametrize("unattended", [False, True])
def test_the_owner_stop_notice_is_written_in_the_profiles_language(chinese, unattended):
    """GW-21 commits the restart / shutdown notice as the turn's own failed-turn boundary row, so it
    follows the other boundary notices: resolved per write, the neutral automation copy for a row
    nobody can resend."""
    from gateway.run import _INTERRUPT_REASON_GATEWAY_RESTART
    from gateway.session_settlement_recovery import RESTART_INTERRUPT_NOTICE, owner_stop_notice
    row = {"principal_id": "automation:webhook" if unattended else "user:desktop", "payload": {}}
    notice = owner_stop_notice({"result": {"interrupt_message": _INTERRUPT_REASON_GATEWAY_RESTART}}, "interrupted", row)
    expected = "core.failed_turn.automation_interrupted" if unattended else "core.failed_turn.restart_interrupted"
    assert notice == i18n.t(expected, lang="zh") != RESTART_INTERRUPT_NOTICE
    assert "core.failed_turn" not in notice
    assert owner_stop_notice({"result": {"interrupt_message": "user"}}, "interrupted", row) is None

