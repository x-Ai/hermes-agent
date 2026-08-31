"""Context-breakdown readiness for deferred desktop sessions."""

from __future__ import annotations

import threading

import pytest

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
