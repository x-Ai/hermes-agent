"""Regression tests for provider-declared output-limit truncations.

A normal protocol response with ``finish_reason="length"`` is terminal by default.
Hermes preserves visible partial text and surfaces a localized fallback when reasoning
consumed the entire output budget. An explicit, bounded config may replay a no-visible-
text result, but no path injects a continuation prompt, raises the output cap, or changes
the reasoning configuration.
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from hermes_constants import FINISH_REASON_LENGTH


class _AgentStandIn:
    """Minimal agent surface _reasoning_config_for_wire needs."""

    def __init__(self, reasoning_config):
        self.reasoning_config = reasoning_config


class TestReasoningOffOneShotOverride:
    """The pre-existing synthetic stream-recovery helper remains bounded.

    Provider-declared output limits are covered below and never arm this flag.
    """

    def test_flag_consumed_exactly_once(self):
        from agent.chat_completion_helpers import _reasoning_config_for_wire

        agent = _AgentStandIn({"enabled": True, "effort": "high"})
        # Without the flag the reasoning config passes through untouched.
        assert _reasoning_config_for_wire(agent) == {
            "enabled": True,
            "effort": "high",
        }

        agent._ephemeral_reasoning_off = True
        cfg = _reasoning_config_for_wire(agent)
        assert cfg["enabled"] is False
        assert cfg["effort"] == "none"
        assert agent._ephemeral_reasoning_off is False, (
            "The one-shot override must be consumed by the first call."
        )

        # Subsequent calls keep the user's own reasoning config.
        assert _reasoning_config_for_wire(agent) == {
            "enabled": True,
            "effort": "high",
        }

    def test_flag_with_no_user_reasoning_config(self):
        from agent.chat_completion_helpers import _reasoning_config_for_wire

        agent = _AgentStandIn(None)
        agent._ephemeral_reasoning_off = True
        cfg = _reasoning_config_for_wire(agent)
        assert cfg == {"enabled": False, "effort": "none"}

    def test_rejected_disable_resends_users_config_verbatim(self):
        """After a 'reasoning is mandatory' 400 the retry must land on the
        SAME provider cache key as every prior request: the ephemeral
        continuation override is discarded and the user's own config goes
        out unchanged. A config that is itself a disable is omitted."""
        from agent.chat_completion_helpers import _reasoning_config_for_wire

        agent = _AgentStandIn({"enabled": True, "effort": "high"})
        agent._reasoning_disable_rejected = True
        agent._ephemeral_reasoning_off = True
        assert _reasoning_config_for_wire(agent) == {"enabled": True, "effort": "high"}
        assert agent._ephemeral_reasoning_off is False

        agent.reasoning_config = {"enabled": False}
        assert _reasoning_config_for_wire(agent) is None


@pytest.fixture()
def loop_agent():
    from run_agent import AIAgent

    with (
        patch("model_tools.get_tool_definitions", return_value=[]),
        patch("model_tools.check_toolset_requirements", return_value={}),
        patch("agent.process_bootstrap.OpenAI"),
    ):
        a = AIAgent(
            api_key="test-key-1234567890",
            base_url="https://openrouter.ai/api/v1",
            quiet_mode=True,
            skip_context_files=True,
            skip_memory=True,
        )
        a.client = MagicMock()
        a._cached_system_prompt = "You are helpful."
        a._use_prompt_caching = False
        a.compression_enabled = False
        a.save_trajectories = False
        return a


def _thinking_only_length_response():
    """finish_reason='length' with reasoning but zero visible content — the
    live GLM-5.3-flash-on-ollama-cloud shape (normal response id, NOT the
    partial-stream stub)."""
    from tests.run_agent.test_run_agent import _mock_assistant_msg

    return SimpleNamespace(
        id="chatcmpl-thinking-exhausted",
        model="test/model",
        choices=[SimpleNamespace(
            index=0,
            message=_mock_assistant_msg(content=""),
            finish_reason=FINISH_REASON_LENGTH,
        )],
        usage=None,
    )


def _full_response(content):
    from tests.run_agent.test_run_agent import _mock_response

    return _mock_response(content=content, finish_reason="stop")


def _truncated_text_response(content):
    from tests.run_agent.test_run_agent import _mock_response

    return _mock_response(content=content, finish_reason=FINISH_REASON_LENGTH)


def _run(agent, message, history=None):
    with (
        patch.object(agent, "_persist_session"),
        patch.object(agent, "_save_trajectory"),
        patch.object(agent, "_cleanup_task_resources"),
    ):
        return agent.run_conversation(message, conversation_history=history)


def _no_empty_assistant_rows(messages):
    return [
        m for m in messages
        if m.get("role") == "assistant"
        and not (m.get("content") or "").strip()
        and not m.get("tool_calls")
    ]


class TestThinkingOnlyTruncation:
    def test_thinking_only_output_limit_is_terminal(self, loop_agent, monkeypatch):
        monkeypatch.setenv("HERMES_LANGUAGE", "zh")
        loop_agent.client.chat.completions.create.side_effect = [
            _thinking_only_length_response(),
            _full_response("must not be requested"),
        ]
        result = _run(loop_agent, "write me a long report")

        assert result["completed"] is True
        assert result["partial"] is True
        assert result["final_response"] == (
            "响应在生成可见文本之前达到提供方的输出 Token 上限，已被截断。"
        )
        assert _no_empty_assistant_rows(result["messages"]) == [], (
            "The localized fallback must replace an empty assistant row."
        )
        calls = loop_agent.client.chat.completions.create.call_args_list
        assert len(calls) == 1, "A provider output limit must not replay the request."
        assert [
            m.get("content") for m in result["messages"] if m.get("role") == "user"
        ] == ["write me a long report"]
        assert loop_agent._ephemeral_reasoning_off is False

    def test_opt_in_retries_exactly_the_configured_number(self, loop_agent):
        loop_agent._output_truncation_retries = 2
        loop_agent.client.chat.completions.create.side_effect = [
            _thinking_only_length_response(),
            _thinking_only_length_response(),
            _full_response("answer after two paid retries"),
            _full_response("must not be requested"),
        ]

        result = _run(loop_agent, "write me a long report")

        assert result["completed"] is True
        assert result["final_response"] == "answer after two paid retries"
        assert len(loop_agent.client.chat.completions.create.call_args_list) == 3
        assert [
            m.get("content") for m in result["messages"] if m.get("role") == "user"
        ] == ["write me a long report"], "Paid replays must not inject retry scaffolding."
        assert loop_agent._ephemeral_reasoning_off is False

    def test_visible_output_limit_preserves_partial_text(self, loop_agent):
        loop_agent._output_truncation_retries = 2
        loop_agent.client.chat.completions.create.side_effect = [
            _truncated_text_response("visible partial answer"),
            _full_response("must not be requested"),
        ]
        result = _run(loop_agent, "write me a long report")

        assert result["completed"] is True
        assert result["partial"] is True
        assert result["final_response"] == "visible partial answer"
        assert len(loop_agent.client.chat.completions.create.call_args_list) == 1

    def test_output_limit_does_not_change_reasoning_or_cached_prefix(self, loop_agent):
        loop_agent.reasoning_config = {"enabled": True, "effort": "high"}
        loop_agent._supports_reasoning_extra_body = lambda: True
        loop_agent.client.chat.completions.create.side_effect = [
            _thinking_only_length_response(),
            _full_response("fresh turn answer"),
        ]
        first_result = _run(loop_agent, "write me a long report")
        second_result = _run(loop_agent, "start a fresh answer")

        assert first_result["partial"] is True
        assert second_result["completed"] is True
        calls = loop_agent.client.chat.completions.create.call_args_list
        assert len(calls) == 2
        wire = [
            (c.kwargs.get("extra_body") or {}).get("reasoning") for c in calls
        ]
        assert wire == [
            {"enabled": True, "effort": "high"},
            {"enabled": True, "effort": "high"},
        ]
        system_prompts = {
            c.kwargs["messages"][0]["content"] for c in calls
            if c.kwargs["messages"][0].get("role") == "system"
        }
        assert len(system_prompts) == 1
        assert loop_agent._ephemeral_reasoning_off is False


class TestStaleReasoningOverride:
    def test_stale_flag_does_not_leak_into_next_turn(self, loop_agent):
        """A flag armed by a previous turn that never reached build_api_kwargs
        (interrupt/error between arm and consume) must not silently strip
        thinking from the next turn's first request."""
        loop_agent.reasoning_config = {"enabled": True, "effort": "high"}
        loop_agent._supports_reasoning_extra_body = lambda: True
        loop_agent._ephemeral_reasoning_off = True  # stale from a prior turn
        loop_agent.client.chat.completions.create.side_effect = [
            _full_response("fresh turn answer."),
        ]
        result = _run(loop_agent, "hello")
        assert result["completed"] is True
        calls = loop_agent.client.chat.completions.create.call_args_list
        first = (calls[0].kwargs.get("extra_body") or {}).get("reasoning")
        assert first == {"enabled": True, "effort": "high"}, first
