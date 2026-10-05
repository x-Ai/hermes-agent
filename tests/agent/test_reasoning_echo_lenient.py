"""Lenient reasoning echo: a DeepSeek-/MiMo-named model behind a non-vendor host.

The require-side pad (" " on a reasoning-less tool-call turn) exists for the vendors' own
endpoints, which 400 without the field. Behind a relay or aggregator the same pad is harmful:
a content-neutral A/B against a DeepSeek relay (6 runs per arm) showed real reasoning echoed →
6/6 turns reasoned, field omitted → 2/6, " " pad replayed → 0/6 — and because Hermes padded
every reasoning-less turn, one blank turn locked the whole session out of thinking (171/171
blank assistant rows in the reported state.db). These tests pin the lenient contract: echo
real reasoning verbatim, drop blank pads, never fabricate; and the one-shot recovery when a
verbatim proxy turns out to enforce the echo after all.
"""

from __future__ import annotations

from types import SimpleNamespace

from run_agent import AIAgent

RELAY = ("custom", "deepseek-v4.1-flash", "https://relay.example/v1")


def _agent(provider: str, model: str, base_url: str) -> AIAgent:
    agent = object.__new__(AIAgent)
    agent.provider, agent.model, agent.base_url = provider, model, base_url
    agent.verbose_logging = False
    agent.reasoning_callback = agent.stream_delta_callback = agent._stream_callback = None
    agent._reasoning_echo_flag = False
    agent._reasoning_echo_required_routes = set()
    agent._image_rejecting_models = set()
    agent._force_ascii_payload = False
    agent.log_prefix = ""
    agent._vprint = lambda *a, **k: None
    return agent


def _locked_relay_history() -> list[dict]:
    """A session as the require-side pad left it: every reasoning-less tool-call turn carries
    " ", the one turn where the relay did reason carries the real text."""
    return [
        {"role": "system", "content": "sys"},
        {"role": "user", "content": "do the thing"},
        {"role": "assistant", "content": "", "reasoning_content": " ",
         "tool_calls": [{"id": "a", "function": {"name": "terminal", "arguments": "{}"}}]},
        {"role": "tool", "tool_call_id": "a", "content": "ok"},
        {"role": "assistant", "content": "", "reasoning_content": "let me check the file first",
         "tool_calls": [{"id": "b", "function": {"name": "read_file", "arguments": "{}"}}]},
        {"role": "tool", "tool_call_id": "b", "content": "contents"},
        {"role": "assistant", "content": "", "reasoning_content": " ",
         "tool_calls": [{"id": "c", "function": {"name": "terminal", "arguments": "{}"}}]},
        {"role": "tool", "tool_call_id": "c", "content": "ok"},
    ]


class TestLenientRelayReplay:
    def test_replay_drops_pads_and_keeps_real_reasoning(self):
        """The already-locked session recovers on its next request: no pad goes out, the one
        real reasoning turn is echoed verbatim."""
        from agent.agent_runtime_helpers import reapply_reasoning_echo_for_provider

        agent = _agent(*RELAY)
        msgs = _locked_relay_history()
        assert reapply_reasoning_echo_for_provider(agent, msgs) == 2
        assert "reasoning_content" not in msgs[2]
        assert msgs[4]["reasoning_content"] == "let me check the file first"
        assert "reasoning_content" not in msgs[6]

    def test_rebuild_path_matches(self):
        """copy_reasoning_content_for_api (fresh api_messages from history) agrees with the
        already-built path: pad → absent, real → verbatim."""
        agent = _agent(*RELAY)
        padded, real = _locked_relay_history()[2], _locked_relay_history()[4]
        api_padded = {"role": "assistant", "tool_calls": padded["tool_calls"]}
        api_real = {"role": "assistant", "tool_calls": real["tool_calls"]}
        agent._copy_reasoning_content_for_api(padded, api_padded)
        agent._copy_reasoning_content_for_api(real, api_real)
        assert "reasoning_content" not in api_padded
        assert api_real["reasoning_content"] == "let me check the file first"

    def test_new_reasoning_less_tool_turn_is_not_padded_at_write_time(self):
        """The pad is what seeds the lock; a lenient route never writes it."""
        agent = _agent(*RELAY)
        tool_call = SimpleNamespace(
            id="c1", call_id="c1", type="function",
            function=SimpleNamespace(name="terminal", arguments="{}"), extra_content=None,
        )
        msg = agent._build_assistant_message(SimpleNamespace(content="", tool_calls=[tool_call]), "tool_calls")
        assert "reasoning_content" not in msg
        assert msg["tool_calls"][0]["id"] == "c1"

    def test_vendor_endpoint_still_pads(self):
        """The contract that protects the real DeepSeek API (#15250) is untouched."""
        from agent.agent_runtime_helpers import reapply_reasoning_echo_for_provider

        for route in (
            ("deepseek", "deepseek-v4-pro", ""),
            ("custom", "deepseek-v4-flash", "https://api.deepseek.com/v1"),
        ):
            agent = _agent(*route)
            msgs = _locked_relay_history()
            reapply_reasoning_echo_for_provider(agent, msgs)
            assert msgs[2]["reasoning_content"] == " "
            assert msgs[4]["reasoning_content"] == "let me check the file first"


class TestEchoRequiredRecovery:
    """A verbatim proxy to DeepSeek answers the first pad-free replay with the echo-back 400."""

    class _EchoRequired400(Exception):
        status_code = 400
        body = ("Error code: 400 - {'error': {'message': 'The `reasoning_content` in the thinking "
                "mode must be passed back to the API.', 'type': 'invalid_request_error'}}")

    def _recover(self, agent, api_messages):
        from agent.turn_recovery import recover_before_classification

        return recover_before_classification(
            agent, self._EchoRequired400(), messages=[], api_messages=api_messages,
            api_kwargs={}, active_system_prompt="sys",
        )

    def test_promotes_route_to_require_and_retries_once(self):
        from agent.agent_runtime_helpers import reapply_reasoning_echo_for_provider

        agent = _agent(*RELAY)
        msgs = _locked_relay_history()
        reapply_reasoning_echo_for_provider(agent, msgs)  # lenient: pads gone
        assert "reasoning_content" not in msgs[2]

        retry, prompt = self._recover(agent, msgs)
        assert (retry, prompt) == (True, "sys")
        assert agent._reasoning_echo_mode() == "require"
        # The retry re-enters build_api_request, whose reapply re-pads the same api_messages.
        assert reapply_reasoning_echo_for_provider(agent, msgs) == 2
        assert msgs[2]["reasoning_content"] == " "
        assert msgs[4]["reasoning_content"] == "let me check the file first"

        # The same error on the now-require route is not ours to retry: fall through.
        retry, _ = self._recover(agent, msgs)
        assert retry is False

    def test_learned_route_is_per_provider_model(self):
        agent = _agent(*RELAY)
        self._recover(agent, [])
        assert agent._reasoning_echo_required_routes == {("custom", "deepseek-v4.1-flash")}
        agent.model = "deepseek-v4.1-pro"  # another model on the same relay starts lenient again
        assert agent._reasoning_echo_mode() == "lenient"

    def test_unrelated_400_is_left_alone(self):
        class _Other400(Exception):
            status_code = 400
            body = "Invalid request: unknown parameter 'foo'."

        from agent.turn_recovery import recover_before_classification

        agent = _agent(*RELAY)
        retry, _ = recover_before_classification(
            agent, _Other400(), messages=[], api_messages=[], api_kwargs={}, active_system_prompt="sys",
        )
        assert retry is False
        assert agent._reasoning_echo_mode() == "lenient"
