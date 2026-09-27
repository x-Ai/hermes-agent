"""``session.context_breakdown`` through the dispatcher: readiness for deferred desktop sessions, which
transcript a running vs idle session is measured on, and the wire contract on every result.

Every call goes through ``server.handle_request`` so ``rpc_dispatch`` validates the result against
``SessionContextBreakdownResult`` (``extra="forbid"``): a key the handler adds without declaring it
(``ready`` was one) fails here instead of logging an error on every desktop poll.
"""

from __future__ import annotations

import threading
from types import SimpleNamespace

import pytest

from agent.context_compressor import ContextCompressor
from tui_gateway import server
import tui_gateway.methods_session  # noqa: F401  (registers RPC methods)

METHOD = "session.context_breakdown"


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
    response = server.handle_request({"id": "context-breakdown-test", "method": METHOD, "params": {"session_id": sid}})
    assert "error" not in response, response
    result = response["result"]
    # Explicit even though the dispatcher already raises under HERMES_TEST_ISOLATION: the contract is the
    # assertion, not the environment.
    server._contracts.METHODS[METHOD].result.model_validate(result)
    return result


def _payload(**overrides) -> dict:
    payload = {
        "categories": [],
        "context_max": 1_000,
        "context_percent": 0,
        "context_used": 0,
        "context_estimated": True,
        "context_source": "estimate",
        "estimated_total": 0,
        "model": "test-model",
    }
    payload.update(overrides)
    return payload


def _live_agent(**attrs):
    return SimpleNamespace(**attrs)


def test_deferred_agent_reports_that_categories_are_not_ready(session):
    sid, record = session

    result = _call(sid)

    assert result["categories"] == []
    assert result["ready"] is False
    assert not record["agent_ready"].is_set()


def test_live_agent_marks_the_computed_breakdown_ready(session, monkeypatch):
    sid, record = session
    record["agent"] = _live_agent()
    record["agent_ready"].set()
    categories = [{"color": "gray", "id": "system_prompt", "label": "System prompt", "tokens": 100}]
    monkeypatch.setattr(
        "agent.context_breakdown.compute_session_context_breakdown",
        lambda _agent, _history: _payload(categories=list(categories), context_percent=10, context_used=100,
                                          estimated_total=100),
    )

    result = _call(sid)

    assert result["ready"] is True
    assert result["categories"] == categories


COMMITTED = [{"role": "user", "content": "committed transcript"}]
LIVE = COMMITTED + [
    {"role": "assistant", "content": "tool call"},
    {"role": "tool", "content": "large live result"},
]


@pytest.mark.parametrize(
    ("running", "live", "expected"),
    [
        # Mid-turn the committed history is pre-turn; the agent's list holds the tool rounds (and any
        # in-turn compaction), so the meter must not restart from the pre-turn count.
        pytest.param(True, LIVE, LIVE, id="running-uses-live-list"),
        # Idle, the committed history is what a manual /compress installed; the live pointer is only
        # rebound by the next turn and would recount the pre-compression window.
        pytest.param(False, LIVE, COMMITTED, id="idle-uses-committed-history"),
        # A resumed agent that has not run in this process owns an empty list; the committed transcript
        # is the only source, whether or not a turn just started.
        pytest.param(True, [], COMMITTED, id="running-empty-live-list-falls-back"),
        pytest.param(False, [], COMMITTED, id="idle-empty-live-list-falls-back"),
    ],
)
def test_breakdown_measures_live_list_only_while_running(session, monkeypatch, running, live, expected):
    sid, record = session
    record["history"] = list(COMMITTED)
    record["running"] = running
    record["agent"] = _live_agent(_session_messages=live)
    record["agent_ready"].set()
    captured = {}

    def _compute(_agent, history):
        captured["history"] = history
        return _payload()

    monkeypatch.setattr("agent.context_breakdown.compute_session_context_breakdown", _compute)

    _call(sid)

    assert captured["history"] == expected
    # Always a copy: the RPC thread must never hand the compute a list the turn thread mutates.
    assert captured["history"] is not live and captured["history"] is not record["history"]


@pytest.mark.parametrize("running", [True, False], ids=["running-skips-sync", "idle-syncs"])
def test_compression_config_sync_runs_only_with_no_turn_in_flight(session, monkeypatch, running):
    """The sync rewrites the live compressor and ``agent.max_tokens``; it is a turn-thread step
    (``prompt_turn`` runs it at turn start), so the RPC thread must leave a streaming request alone."""
    sid, record = session
    record["running"] = running
    record["agent"] = _live_agent(_session_messages=list(LIVE))
    record["agent_ready"].set()
    synced = []
    monkeypatch.setattr(server, "_sync_agent_compression_with_config", lambda _sid, _session: synced.append(_sid))
    monkeypatch.setattr("agent.context_breakdown.compute_session_context_breakdown", lambda _agent, _history: _payload())

    _call(sid)

    assert synced == ([] if running else [sid])


def test_live_breakdown_adopts_endpoint_context_edit_before_reporting(session, monkeypatch):
    sid, record = session
    compressor = ContextCompressor(
        model="z-ai/glm-5.3",
        config_context_length=1_310_720,
        quiet_mode=True,
    )
    agent = _live_agent(
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
    monkeypatch.setattr(
        "agent.context_breakdown.compute_session_context_breakdown",
        lambda live_agent, _history: _payload(context_max=live_agent.context_compressor.context_length,
                                              model=live_agent.model),
    )

    result = _call(sid)

    assert result["context_max"] == 204_800
    assert agent._config_context_length == 204_800
