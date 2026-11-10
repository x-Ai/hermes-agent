"""The configurable recovery budgets drive the request-local recovery hints.

``agent.post_tool_empty_retries`` and ``agent.thinking_prefill_retries`` set how many
post-tool nudges and thinking-only completion reminders a turn may send. Each one only
queues ``_empty_response_retry_hint`` for the next outgoing request: the live history
never gains a synthetic row, the status counts against the configured budget, and the
status renders through the catalogs in the client's language.
"""

import re
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from agent import i18n
from agent import turn_empty_response as ter
from agent.conversation_loop import _CODEX_INCOMPLETE_NUDGE, _EMPTY_TOOL_RESPONSE_NUDGE

CJK = re.compile(r"[一-鿿]")


def _agent(*, post_tool_budget=1, thinking_budget=2):
    a = MagicMock()
    a._current_streamed_assistant_text = ""
    a._has_content_after_think_block.return_value = False
    a._strip_think_blocks.side_effect = lambda text: text or ""
    a._last_content_with_tools = None
    a._last_content_tools_all_housekeeping = False
    a._post_tool_empty_retry_budget = post_tool_budget
    a._post_tool_empty_retry_count = 0
    a._thinking_prefill_retry_budget = thinking_budget
    a._thinking_prefill_retries = 0
    a._empty_response_retry_hint = None
    a._fallback_chain = []
    return a


def _reply(reasoning=None):
    return SimpleNamespace(reasoning=reasoning, reasoning_content=None, reasoning_details=None)


def _recover(agent, messages, reply, retry_empty):
    with patch.object(ter, "_retry_empty", retry_empty):
        return ter.recover_empty_response(
            agent, reply, None, "stop", final_response="", messages=messages, api_messages=[],
            conversation_history=[], active_system_prompt="sys", api_call_count=1,
            turn_exit_reason=None, preflight_compression_blocked=False,
        )


def _last_status(agent):
    return agent._buffer_diagnostic_status.call_args[0][0]


def test_post_tool_budget_queues_one_request_local_nudge_per_retry():
    agent = _agent(post_tool_budget=2)
    messages = [
        {"role": "user", "content": "look it up"},
        {"role": "assistant", "content": "", "tool_calls": [{"id": "c1"}]},
        {"role": "tool", "tool_call_id": "c1", "content": "42"},
    ]
    stored = [dict(m) for m in messages]
    retry_empty = MagicMock(return_value=("continue", None, False))

    for n in (1, 2):
        verdict = _recover(agent, messages, _reply(), retry_empty)
        assert verdict.action == "continue"
        assert verdict.final_response is None
        assert agent._empty_response_retry_hint == _EMPTY_TOOL_RESPONSE_NUDGE
        assert f"({n}/2)" in _last_status(agent)
        assert messages == stored, "the nudge rides the outgoing request, never the history"
        agent._empty_response_retry_hint = None  # response intake consumes it
    retry_empty.assert_not_called()

    # Budget spent: the ladder moves on to the empty-response retries.
    _recover(agent, messages, _reply(), retry_empty)
    retry_empty.assert_called_once()
    assert retry_empty.call_args[0][3] is True
    assert agent._empty_response_retry_hint is None
    assert messages == stored


def test_post_tool_budget_zero_skips_the_nudge():
    agent = _agent(post_tool_budget=0)
    messages = [{"role": "user", "content": "q"}, {"role": "tool", "tool_call_id": "c1", "content": "42"}]
    retry_empty = MagicMock(return_value=("continue", None, False))

    _recover(agent, messages, _reply(), retry_empty)

    retry_empty.assert_called_once()
    assert agent._empty_response_retry_hint is None


def test_thinking_budget_requests_completion_without_storing_reasoning():
    agent = _agent(thinking_budget=3)
    messages = [{"role": "user", "content": "do the thing"}]
    retry_empty = MagicMock(return_value=(None, None, False))
    reply = _reply(reasoning="Let me think about this.")

    for n in (1, 2, 3):
        verdict = _recover(agent, messages, reply, retry_empty)
        assert verdict.action == "continue"
        assert verdict.final_response is None
        assert agent._empty_response_retry_hint == _CODEX_INCOMPLETE_NUDGE
        assert f"({n}/3)" in _last_status(agent)
        assert messages == [{"role": "user", "content": "do the thing"}]
        agent._empty_response_retry_hint = None
    retry_empty.assert_not_called()

    # Reminders spent: a reasoning-only reply becomes an empty-response retry candidate.
    with patch.object(ter, "_terminal_empty", return_value="(empty)"):
        _recover(agent, messages, reply, retry_empty)
    retry_empty.assert_called_once()
    assert retry_empty.call_args[0][3] is True
    assert agent._empty_response_retry_hint is None


@pytest.fixture
def zh():
    token = i18n.bind_client_language("zh")
    try:
        yield
    finally:
        i18n.reset_client_language(token)


@pytest.mark.parametrize("after_tool", [False, True], ids=["thinking-only", "post-tool"])
def test_recovery_status_renders_in_the_client_language(zh, after_tool):
    agent = _agent()
    messages = [{"role": "user", "content": "q"}]
    if after_tool:
        messages.append({"role": "tool", "tool_call_id": "c1", "content": "42"})
    reply = _reply() if after_tool else _reply(reasoning="thinking")

    _recover(agent, messages, reply, MagicMock(return_value=(None, None, False)))

    status = _last_status(agent)
    assert CJK.search(status)
    assert "(1/" in status.replace("（", "(")
    assert "Thinking-only" not in status and "Model returned empty" not in status
