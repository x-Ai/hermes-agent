"""Tests for context token tracking in run_agent.py's usage extraction.

The context counter (status bar) must show the TOTAL prompt tokens including
Anthropic's cached portions. This is an integration test for the token
extraction in run_conversation(), not the ContextCompressor itself (which
is tested in tests/agent/test_context_compressor.py).
"""

import sys
import types
from types import SimpleNamespace

sys.modules.setdefault("fire", types.SimpleNamespace(Fire=lambda *a, **k: None))
sys.modules.setdefault("firecrawl", types.SimpleNamespace(Firecrawl=object))
sys.modules.setdefault("fal_client", types.SimpleNamespace())

import run_agent


def _patch_bootstrap(monkeypatch):
    monkeypatch.setattr("model_tools.get_tool_definitions", lambda **kwargs: [{
        "type": "function",
        "function": {"name": "t", "description": "t", "parameters": {"type": "object", "properties": {}}},
    }])
    monkeypatch.setattr("model_tools.check_toolset_requirements", lambda: {})


class _FakeAnthropicClient:
    def close(self):
        pass


class _FakeOpenAIClient:
    """Fake OpenAI client returned by mocked resolve_provider_client."""
    api_key = "fake-codex-key"
    base_url = "https://api.openai.com/v1"
    _default_headers = None


def _make_agent(monkeypatch, api_mode, provider, response_fn):
    _patch_bootstrap(monkeypatch)
    if api_mode == "anthropic_messages":
        monkeypatch.setattr("agent.anthropic_adapter.build_anthropic_client", lambda k, b=None, **kwargs: _FakeAnthropicClient())
    if provider == "openai-codex":
        monkeypatch.setattr(
            "agent.auxiliary_client.resolve_provider_client",
            lambda *a, **kw: (_FakeOpenAIClient(), "test-model"),
        )

    class _A(run_agent.AIAgent):
        def __init__(self, *a, **kw):
            kw.update(skip_context_files=True, skip_memory=True, max_iterations=4)
            super().__init__(*a, **kw)
            self._cleanup_task_resources = self._persist_session = lambda *a, **k: None
            self._save_trajectory = lambda *a, **k: None

        def run_conversation(self, msg, conversation_history=None, task_id=None):
            self._interruptible_api_call = lambda kw: response_fn()
            self._disable_streaming = True
            return super().run_conversation(msg, conversation_history=conversation_history, task_id=task_id)

    return _A(model="test-model", api_key="test-key", base_url="http://localhost:1234/v1", provider=provider, api_mode=api_mode)


def _anthropic_resp(input_tok, output_tok, cache_read=0, cache_creation=0):
    usage_fields = {"input_tokens": input_tok, "output_tokens": output_tok}
    if cache_read:
        usage_fields["cache_read_input_tokens"] = cache_read
    if cache_creation:
        usage_fields["cache_creation_input_tokens"] = cache_creation
    return SimpleNamespace(
        content=[SimpleNamespace(type="text", text="ok")],
        stop_reason="end_turn",
        usage=SimpleNamespace(**usage_fields),
        model="claude-sonnet-4-6",
    )


# -- Anthropic: cached tokens must be included --

def test_anthropic_cache_read_and_creation_added(monkeypatch):
    agent = _make_agent(monkeypatch, "anthropic_messages", "anthropic",
                        lambda: _anthropic_resp(3, 10, cache_read=15000, cache_creation=2000))
    agent.run_conversation("hi")
    assert agent.context_compressor.last_prompt_tokens == 17003  # 3+15000+2000
    assert agent.session_prompt_tokens == 17003


def test_anthropic_no_cache_fields(monkeypatch):
    agent = _make_agent(monkeypatch, "anthropic_messages", "anthropic",
                        lambda: _anthropic_resp(500, 20))
    agent.run_conversation("hi")
    assert agent.context_compressor.last_prompt_tokens == 500


def test_anthropic_cache_read_only(monkeypatch):
    agent = _make_agent(monkeypatch, "anthropic_messages", "anthropic",
                        lambda: _anthropic_resp(5, 15, cache_read=17666, cache_creation=15))
    agent.run_conversation("hi")
    assert agent.context_compressor.last_prompt_tokens == 17686  # 5+17666+15


def test_custom_anthropic_total_input_is_not_double_counted(monkeypatch):
    """A custom Messages gateway can report cache as a subset of input."""
    monkeypatch.setattr(
        "agent.conversation_loop._midturn_request_pressure_tokens",
        lambda *args, **kwargs: 600_000,
    )
    agent = _make_agent(
        monkeypatch,
        "anthropic_messages",
        "custom",
        lambda: _anthropic_resp(600_000, 10, cache_read=580_000),
    )

    agent.run_conversation("hi")

    assert agent.context_compressor.last_prompt_tokens == 600_000
    assert agent.session_prompt_tokens == 600_000
    assert agent.session_input_tokens == 20_000
    assert agent.session_cache_read_tokens == 580_000
    assert agent._usage_anchor["prompt_tokens"] == 600_000


# -- OpenAI Chat Completions: cache details are subsets of prompt_tokens --

def test_openai_prompt_tokens_unchanged(monkeypatch):
    resp = lambda: SimpleNamespace(
        choices=[SimpleNamespace(index=0, message=SimpleNamespace(
            role="assistant", content="ok", tool_calls=None, reasoning_content=None,
        ), finish_reason="stop")],
        usage=SimpleNamespace(
            prompt_tokens=5000,
            completion_tokens=100,
            total_tokens=5100,
            prompt_tokens_details=SimpleNamespace(
                cached_tokens=4500,
                cache_write_tokens=200,
            ),
        ),
        model="gpt-4o",
    )
    agent = _make_agent(monkeypatch, "chat_completions", "openrouter", resp)
    agent.run_conversation("hi")
    assert agent.context_compressor.last_prompt_tokens == 5000
    assert agent.session_prompt_tokens == 5000
    assert agent.session_input_tokens == 300
    assert agent.session_cache_read_tokens == 4500
    assert agent.session_cache_write_tokens == 200
    assert agent.session_total_tokens == 5100


# -- OpenAI Responses: cache details are subsets of input_tokens --

def test_responses_input_tokens_unchanged(monkeypatch):
    resp = lambda: SimpleNamespace(
        output=[SimpleNamespace(type="message", content=[SimpleNamespace(type="output_text", text="ok")])],
        usage=SimpleNamespace(
            input_tokens=3000,
            output_tokens=50,
            total_tokens=3050,
            input_tokens_details=SimpleNamespace(
                cached_tokens=2700,
                cache_write_tokens=100,
            ),
        ),
        status="completed", model="gpt-5-codex",
    )
    agent = _make_agent(monkeypatch, "codex_responses", "openai-codex", resp)
    agent.run_conversation("hi")
    assert agent.context_compressor.last_prompt_tokens == 3000
    assert agent.session_prompt_tokens == 3000
    assert agent.session_input_tokens == 200
    assert agent.session_cache_read_tokens == 2700
    assert agent.session_cache_write_tokens == 100
    assert agent.session_total_tokens == 3050


def test_responses_without_cache_details(monkeypatch):
    resp = lambda: SimpleNamespace(
        output=[SimpleNamespace(type="message", content=[SimpleNamespace(type="output_text", text="ok")])],
        usage=SimpleNamespace(input_tokens=3000, output_tokens=50, total_tokens=3050),
        status="completed", model="gpt-5-codex",
    )
    agent = _make_agent(monkeypatch, "codex_responses", "openai-codex", resp)
    agent.run_conversation("hi")
    assert agent.context_compressor.last_prompt_tokens == 3000
    assert agent.session_input_tokens == 3000
    assert agent.session_cache_read_tokens == 0
    assert agent.session_cache_write_tokens == 0
