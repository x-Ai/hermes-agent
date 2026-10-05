"""In-process end-to-end for the lenient reasoning echo: a real ``AIAgent`` turn loop against
the loopback fake provider, model id ``deepseek-*`` on a non-vendor host.

Pinned on the wire (the recorded request bodies), not on helper calls:

1. A relay never receives a fabricated ``" "`` pad; real reasoning is echoed verbatim within
   the turn and again after a gateway/desktop-style resume from state.db.
2. A verbatim proxy that answers the pad-free replay with DeepSeek's echo-back 400 gets
   exactly one padded retry and the turn completes.
"""

from __future__ import annotations

import os
from pathlib import Path

from tests.fakes.fake_llm_provider import Error, FakeLLMServer, Text, ToolCall, write_hermes_home

MODEL = "deepseek-v4.1-flash"
ECHO_400 = "The `reasoning_content` in the thinking mode must be passed back to the API."


def _assistant_msgs(body: dict) -> list[dict]:
    return [m for m in body["messages"] if m.get("role") == "assistant"]


def _tool_turns(body: dict) -> list[dict]:
    return [m for m in _assistant_msgs(body) if m.get("tool_calls")]


def _write_home(srv: FakeLLMServer) -> Path:
    home = Path(os.environ["HERMES_HOME"])
    write_hermes_home(home, srv.base_url, extra_config="updates:\n  check: false\n")
    cfg = home / "config.yaml"
    cfg.write_text(cfg.read_text().replace("default: fake-model", f"default: {MODEL}"))
    return home


def _agent(srv: FakeLLMServer, db, session_id: str):
    from run_agent import AIAgent

    return AIAgent(
        provider="custom", base_url=srv.base_url, api_key="sk-fake-e2e", model=MODEL,
        session_db=db, session_id=session_id, quiet_mode=True, platform="cli",
        enabled_toolsets=["file"], skip_context_files=True, skip_memory=True,
    )


def _close(agent) -> None:
    close = getattr(agent, "close", None)
    if callable(close):
        close()


def test_relay_gets_real_reasoning_and_never_a_pad(tmp_path):
    from hermes_state import SessionDB

    note = tmp_path / "notes.txt"
    note.write_text("CANARY\n", encoding="utf-8")
    script = [
        ToolCall("read_file", {"path": str(note)}),           # step 1: the relay did not reason
        Text("ONE", reasoning="thinking about the notes"),    # step 2: it did
        Text("TWO"),                                          # next turn, after resume
    ]
    with FakeLLMServer(script) as srv:
        home = _write_home(srv)
        db = SessionDB(db_path=home / "state.db")
        try:
            agent = _agent(srv, db, "relay")
            first = agent.run_conversation("read notes.txt")
            _close(agent)
            assert first["final_response"].strip() == "ONE", first

            # Gateway/Desktop shape: a fresh agent replays whatever state.db hands back.
            history = db.get_messages_as_conversation("relay")
            agent = _agent(srv, db, "relay")
            second = agent.run_conversation("again", conversation_history=history)
            _close(agent)
            assert second["final_response"].strip() == "TWO", second
        finally:
            db.close()
        mains = srv.main_requests()

    assert len(mains) == 3, [len(m["messages"]) for m in mains]
    # Request 2 (after the tool result): the reasoning-less tool-call turn carries NO field —
    # the old require-side pad put " " here and that is what locked the relay's thinking off.
    assert _tool_turns(mains[1]) and all("reasoning_content" not in m for m in _tool_turns(mains[1]))
    # Request 3 (resumed turn): still no pad, and the reasoning turn is echoed verbatim.
    assert [m.get("reasoning_content", "<absent>") for m in _assistant_msgs(mains[2])] == [
        "<absent>", "thinking about the notes",
    ]


def test_verbatim_proxy_echo_400_gets_one_padded_retry(tmp_path):
    from hermes_state import SessionDB

    note = tmp_path / "notes.txt"
    note.write_text("CANARY\n", encoding="utf-8")
    seen: list[dict] = []

    def proxy(rec: dict):
        """DeepSeek behind a body-forwarding proxy: 400 on any bare assistant tool-call turn."""
        body = rec["body"]
        seen.append(body)
        if len(seen) == 1:
            return ToolCall("read_file", {"path": str(note)})
        if any("reasoning_content" not in m for m in _tool_turns(body)):
            return Error(400, ECHO_400)
        return Text("DONE")

    with FakeLLMServer(proxy) as srv:
        home = _write_home(srv)
        db = SessionDB(db_path=home / "state.db")
        try:
            agent = _agent(srv, db, "proxy")
            result = agent.run_conversation("read notes.txt")
            assert result["final_response"].strip() == "DONE", result
            assert agent._reasoning_echo_mode() == "require"
            _close(agent)
        finally:
            db.close()
        mains = srv.main_requests()

    # 1: tool call · 2: pad-free replay → 400 · 3: the one retry, padded · nothing more.
    assert len(mains) == 3, [len(m["messages"]) for m in mains]
    assert "reasoning_content" not in _tool_turns(mains[1])[0]
    assert _tool_turns(mains[2])[0]["reasoning_content"] == " "
