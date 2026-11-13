"""Status lines whose English text is a wire contract print in the user's language.

The compaction, compressed-N-times and auto-recovery lines are classified by their English
text (gateway/run.py noise regexes, the Desktop wait-frame parser), so the producers send a
``WireStatus``: ``status_callback`` keeps the English, the CLI print and the Desktop log show
the catalog rendering (fork catalogs, 17 languages). Viewers' ``compacting`` re-tag reads the
producer's ``CompactionProgressText`` mark instead, which the rendering keeps.
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from agent import i18n
from agent.conversation_compression import COMPACTION_STATUS
from agent.status_output import StatusOutputMixin, WireStatus
from agent.turn_recovery_autorecover import ladder_notice, ladder_notice_display

CJK = __import__("re").compile(r"[一-鿿]")


class _Agent(StatusOutputMixin):
    log_prefix = ""

    def __init__(self):
        self.printed: list[str] = []
        self.wire: list[tuple[str, str]] = []
        self.status_callback = lambda kind, text: self.wire.append((kind, text))

    def _vprint(self, message, **_kwargs):
        self.printed.append(str(message))

    def _warning_presentation_enabled(self):
        return True


@pytest.fixture
def zh():
    token = i18n.bind_client_language("zh")
    try:
        yield
    finally:
        i18n.reset_client_language(token)


def test_wire_status_prints_the_display_and_forwards_the_english():
    agent = _Agent()
    status = WireStatus(COMPACTION_STATUS, "🗜️ 正在压缩上下文")

    agent._emit_status(status)
    agent._emit_diagnostic_status(status)

    assert agent.printed == ["🗜️ 正在压缩上下文", "🗜️ 正在压缩上下文"]
    assert [text for _kind, text in agent.wire] == [COMPACTION_STATUS, COMPACTION_STATUS]
    # Every consumer still sees a str equal to the English line.
    assert isinstance(status, str) and status == COMPACTION_STATUS


def test_plain_status_prints_as_written():
    agent = _Agent()

    agent._emit_status("✓ plain line")

    assert agent.printed == ["✓ plain line"]
    assert agent.wire == [("lifecycle", "✓ plain line")]


def test_wire_status_on_the_diagnostic_rail_is_a_diagnostic_carrying_its_display():
    from gateway.warning_notifications import DiagnosticText, TerminalFailureText

    agent = _Agent()

    agent._emit_diagnostic_status(WireStatus(COMPACTION_STATUS, "🗜️ 正在压缩上下文"))

    [(_kind, forwarded)] = agent.wire
    assert isinstance(forwarded, DiagnosticText) and not isinstance(forwarded, TerminalFailureText)
    assert forwarded == COMPACTION_STATUS and forwarded.display == "🗜️ 正在压缩上下文"


def test_terminal_failure_keeps_its_class_on_the_diagnostic_rail():
    """A producer's finer DiagnosticText reaches ``status_callback`` as itself, so the gateway filter
    still drops the copy the failed turn's final reply repeats; the CLI print is unchanged."""
    from gateway.run_status_filter import is_terminal_failure_status
    from gateway.warning_notifications import TerminalFailureText

    agent = _Agent()
    status = TerminalFailureText("❌ API failed after 3 retries — boom")

    agent._emit_diagnostic_status(status)

    assert agent.printed == ["❌ API failed after 3 retries — boom"]
    [(kind, forwarded)] = agent.wire
    assert kind == "lifecycle" and forwarded is status and is_terminal_failure_status(forwarded)


@pytest.mark.parametrize("platform", ["cli", "tui", "desktop", "api_server", "cron", "telegram"])
def test_ladder_notice_display_matches_the_wire_in_english(platform):
    token = i18n.bind_client_language("en")
    try:
        agent = type("A", (), {"platform": platform})()
        assert ladder_notice_display(agent, wait_s=18.4, cycle=1, total=5) == ladder_notice(
            agent, wait_s=18.4, cycle=1, total=5)
    finally:
        i18n.reset_client_language(token)


def test_ladder_notice_display_is_localized_while_the_wire_stays_english(zh):
    agent = type("A", (), {"platform": "desktop"})()

    wire = ladder_notice(agent, wait_s=18, cycle=1, total=5)
    shown = ladder_notice_display(agent, wait_s=18, cycle=1, total=5)

    assert wire == "⏳ Provider temporarily unavailable — retrying automatically in 18s (cycle 1/5); press Esc to stop"
    assert CJK.search(shown) and "Esc" in shown and "18" in shown and "1/5" in shown
    # cron has no stop hint on either side.
    cron = type("A", (), {"platform": "cron"})()
    assert ladder_notice(cron, wait_s=18, cycle=1, total=5).endswith("(cycle 1/5)")
    assert CJK.search(ladder_notice_display(cron, wait_s=18, cycle=1, total=5))


def test_a_localized_compaction_line_keeps_its_progress_mark():
    """Gateways re-tag only producer-marked lines ``compacting``; the catalog rendering keeps the mark,
    and a warning's rendering stays unmarked, so it keeps the kind it was sent with."""
    from agent.context_engine import CompactionProgressText
    from agent.conversation_compression import COMPACTION_HEARTBEAT_STATUS, compaction_status_kind

    agent = _Agent()
    for wire in (COMPACTION_STATUS, COMPACTION_HEARTBEAT_STATUS):
        status = WireStatus(wire, "🗜️ 正在压缩上下文")
        assert isinstance(status, CompactionProgressText) and status == wire
        assert status.display == "🗜️ 正在压缩上下文"
        agent._emit_status(status)

    assert agent.printed == ["🗜️ 正在压缩上下文"] * 2
    assert [compaction_status_kind(kind, text) for kind, text in agent.wire] == ["compacting"] * 2
    warning = WireStatus("⚠️  Session compressed 3 times — accuracy may degrade. Consider /new to start fresh.",
                         "⚠️  会话已压缩 3 次")
    assert not isinstance(warning, CompactionProgressText)
    assert compaction_status_kind("lifecycle", warning) == "lifecycle"
    assert compaction_status_kind("warn", warning) == "warn"


def test_manual_compress_heartbeat_and_codex_compaction_reach_viewers_as_compacting(zh, monkeypatch):
    """The producers that print the catalog rendering still open the viewers' compaction phase."""
    from agent.codex_runtime import _record_codex_app_server_compaction
    from agent.conversation_compression import (
        COMPACTION_HEARTBEAT_STATUS,
        _announce_compression_start,
        _CompressionActivityHeartbeat,
        compaction_status_kind,
    )

    monkeypatch.setattr("agent.compaction_events.publish_provider_native", lambda _agent: None)
    agent = _Agent()
    agent.session_id, agent.model, agent.context_compressor = "s1", "test-model", None

    _announce_compression_start(agent, message_count=12, approx_tokens=1_000, focus_topic=None, force=True)
    _CompressionActivityHeartbeat(agent, emit_client_status=True)._emit_progress_status()
    assert _record_codex_app_server_compaction(agent, SimpleNamespace(compacted=True, thread_id="t", turn_id="u"))

    assert [text for _kind, text in agent.wire] == [COMPACTION_STATUS, COMPACTION_HEARTBEAT_STATUS, COMPACTION_STATUS]
    assert [compaction_status_kind(kind, text) for kind, text in agent.wire] == ["compacting"] * 3
    assert len(agent.printed) == 3 and all(CJK.search(line) for line in agent.printed)


def test_compaction_copy_renders_in_chinese_with_the_glyph(zh):
    for key in ("core.compaction.status", "core.compaction.heartbeat"):
        assert i18n.t(key).startswith("🗜️") and CJK.search(i18n.t(key))
    assert i18n.t("core.compaction.compressed_times", count=3).startswith("⚠️") and "3" in i18n.t(
        "core.compaction.compressed_times", count=3)
    assert "boom" in i18n.t("core.transport.transient_retry", error_type="boom", provider="custom", wait=8)
