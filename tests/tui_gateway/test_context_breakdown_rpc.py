"""Context-breakdown readiness for deferred desktop sessions."""

from __future__ import annotations

import threading
from types import SimpleNamespace

import pytest

from agent.context_compressor import ContextCompressor
from tui_gateway import server
import tui_gateway.methods_session  # noqa: F401  (registers RPC methods)


@pytest.fixture
def session():
    sid = "context-breakdown-deferred"
    record = {
        "agent": None,
        "agent_ready": threading.Event(),
        "history": [],
        "history_lock": threading.RLock(),
        "session_key": sid,
    }
    server._sessions[sid] = record
    try:
        yield sid, record
    finally:
        server._sessions.pop(sid, None)


def _call(sid: str) -> dict:
    return server._methods["session.context_breakdown"](
        "context-breakdown-test", {"session_id": sid}
    )["result"]


def test_deferred_agent_reports_that_categories_are_not_ready(session):
    sid, record = session

    result = _call(sid)

    assert result["categories"] == []
    assert result["ready"] is False
    assert not record["agent_ready"].is_set()


def test_live_agent_marks_the_computed_breakdown_ready(session, monkeypatch):
    sid, record = session
    record["agent"] = object()
    record["agent_ready"].set()
    payload = {
        "categories": [
            {
                "color": "gray",
                "id": "system_prompt",
                "label": "System prompt",
                "tokens": 100,
            }
        ],
        "context_max": 1_000,
        "context_percent": 10,
        "context_used": 100,
        "estimated_total": 100,
        "model": "test-model",
    }
    monkeypatch.setattr(
        "agent.context_breakdown.compute_session_context_breakdown",
        lambda _agent, _history: dict(payload),
    )

    result = _call(sid)

    assert result["ready"] is True
    assert result["categories"] == payload["categories"]


def test_running_breakdown_uses_agent_live_messages_not_pre_turn_history(session, monkeypatch):
    sid, record = session
    stale = [{"role": "user", "content": "before turn"}]
    live = stale + [
        {"role": "assistant", "content": "tool call"},
        {"role": "tool", "content": "large live result"},
    ]
    record["history"] = stale
    record["agent"] = type("Agent", (), {"_session_messages": live})()
    record["agent_ready"].set()
    captured = {}

    def _compute(_agent, history):
        captured["history"] = history
        return {
            "categories": [],
            "context_max": 1_000,
            "context_percent": 0,
            "context_used": 0,
            "estimated_total": 0,
            "model": "test-model",
        }

    monkeypatch.setattr(
        "agent.context_breakdown.compute_session_context_breakdown",
        _compute,
    )

    _call(sid)

    assert captured["history"] == live
    assert captured["history"] is not live


def test_live_breakdown_adopts_endpoint_context_edit_before_reporting(session, monkeypatch):
    sid, record = session
    compressor = ContextCompressor(
        model="z-ai/glm-5.3",
        config_context_length=1_310_720,
        quiet_mode=True,
    )
    agent = SimpleNamespace(
        base_url="https://med.mss.360.net/llm-new/v1",
        model="z-ai/glm-5.3",
        provider="custom",
        context_compressor=compressor,
        compression_enabled=True,
        compression_idle_compact_after_seconds=0,
        codex_responses_native_compaction=False,
        codex_responses_compact_threshold=200_000,
    )
    record["agent"] = agent
    record["agent_ready"].set()
    monkeypatch.setattr(
        server,
        "_load_cfg",
        lambda: {
            "providers": {
                "360llm": {
                    "base_url": agent.base_url,
                    "models": {agent.model: {"context_length": 204_800}},
                }
            }
        },
    )

    def _compute(live_agent, _history):
        maximum = live_agent.context_compressor.context_length
        return {
            "categories": [],
            "context_max": maximum,
            "context_percent": 0,
            "context_used": 0,
            "estimated_total": 0,
            "model": live_agent.model,
        }

    monkeypatch.setattr(
        "agent.context_breakdown.compute_session_context_breakdown",
        _compute,
    )

    result = _call(sid)

    assert result["context_max"] == 204_800
    assert agent._config_context_length == 204_800
