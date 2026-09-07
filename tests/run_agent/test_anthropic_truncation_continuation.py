"""Regression tests for Anthropic standard output truncation.

When an Anthropic response hits ``stop_reason: max_tokens`` (mapped to
``finish_reason == 'length'`` in run_agent), Hermes keeps the partial response
and ends the turn without replaying the request.

We don't exercise the full agent loop here (it's 3000 lines of inference,
streaming, plugin hooks, etc.) — instead we verify the normalization
adapter produces exactly the shape the continuation block now consumes.
"""

from __future__ import annotations

from types import SimpleNamespace

def _make_anthropic_text_block(text: str) -> SimpleNamespace:
    return SimpleNamespace(type="text", text=text)


def _make_anthropic_tool_use_block(name: str = "my_tool") -> SimpleNamespace:
    return SimpleNamespace(
        type="tool_use",
        id="toolu_01",
        name=name,
        input={"foo": "bar"},
    )


def _make_anthropic_response(blocks, stop_reason: str = "max_tokens"):
    return SimpleNamespace(
        id="msg_01",
        type="message",
        role="assistant",
        model="claude-sonnet-4-6",
        content=blocks,
        stop_reason=stop_reason,
        stop_sequence=None,
        usage=SimpleNamespace(input_tokens=100, output_tokens=200),
    )


class TestTruncatedAnthropicResponseNormalization:
    """AnthropicTransport.normalize_response() gives us the shape _build_assistant_message expects."""

    def test_text_only_truncation_produces_text_content_no_tool_calls(self):
        """Pure-text Anthropic truncation remains available as a partial response."""
        from agent.transports import get_transport

        response = _make_anthropic_response(
            [_make_anthropic_text_block("partial response that was cut off")]
        )
        nr = get_transport("anthropic_messages").normalize_response(response)

        # The continuation block checks these two attributes:
        #   assistant_message.content  → appended to truncated_response_parts
        #   assistant_message.tool_calls → guards the text-retry branch
        assert nr.content is not None
        assert "partial response" in nr.content
        assert not nr.tool_calls, (
            "Pure-text truncation must not invent tool calls"
        )
        assert nr.finish_reason == "length", "max_tokens stop_reason must map to OpenAI-style 'length'"


    def test_empty_content_does_not_crash(self):
        """Empty response.content — defensive: treat as a truncation with no text."""
        from agent.transports import get_transport

        response = _make_anthropic_response([])
        nr = get_transport("anthropic_messages").normalize_response(response)
        # Depending on the adapter, content may be "" or None — both are
        # acceptable; what matters is no exception.
        assert nr is not None
        assert not nr.tool_calls


class TestContinuationLogicBranching:
    """Only synthetic/network truncations retain continuation recovery."""

    def test_anthropic_max_tokens_is_a_standard_terminal_truncation(self):
        from agent.turn_response_check import is_standard_output_truncation

        response = _make_anthropic_response([_make_anthropic_text_block("partial")])
        assert is_standard_output_truncation(
            SimpleNamespace(api_mode="anthropic_messages"), response) is True

    def test_bedrock_length_remains_synthetic_recovery(self):
        from agent.turn_response_check import is_standard_output_truncation

        assert is_standard_output_truncation(
            SimpleNamespace(api_mode="bedrock_converse"), SimpleNamespace()) is False
