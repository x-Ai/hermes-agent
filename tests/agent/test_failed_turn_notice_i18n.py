"""The failed-turn boundary row is written in the profile's language.

Contract: ``failed_turn_notice`` resolves ``core.failed_turn.*`` per call (hedged when a tool may have
run), the English rendering stays byte-identical to the legacy constants that
``untyped_failed_turn_display_kind`` still matches on older transcripts, and the gateway closer shares
the same text.
"""

import pytest

from agent import i18n
from agent.turn_failure_copy import (
    FAILED_TURN_DISPLAY_KIND, FAILED_TURN_NOTICE, PARTIAL_FAILED_TURN_NOTICE, failed_turn_notice,
    partial_failed_turn_notice, untyped_failed_turn_display_kind)


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
