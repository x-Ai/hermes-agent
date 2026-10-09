"""Recovery-ladder copy follows the configured budgets and renders from the catalogs.

- The empty-response retry status says "high-cost request, reduced retry budget" only when the
  cost guard actually lowered the budget; a plain ``agent.empty_response_retries: 2`` is the
  operator's choice, not a cost reduction.
- The truncation ceiling reports the continuations actually sent, not the four of the old fixed
  ladder, so ``output_truncation_retries: 0`` no longer claims a continuation that never went out.
- Both families render through ``agent.i18n`` (17 backend catalogs), so a zh client sees Chinese.
"""

from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from agent import i18n
from agent import turn_empty_response as ter
from run_agent import AIAgent
from tests.agent.test_run_agent import _make_tool_defs, _mock_response

CJK = __import__("re").compile(r"[一-鿿]")


@pytest.fixture(autouse=True)
def _no_backoff(monkeypatch):
    import time as _time
    monkeypatch.setattr("agent.retry_utils.jittered_backoff", lambda *a, **k: 0.0)
    monkeypatch.setattr(_time, "sleep", lambda *_a, **_k: None)


@pytest.fixture
def zh():
    token = i18n.bind_client_language("zh")
    try:
        yield
    finally:
        i18n.reset_client_language(token)


# ---------------------------------------------------------------- empty-response retry status

def _empty_retry_status(monkeypatch, *, configured: int, attempt_cost):
    agent = MagicMock()
    agent.model = "m"
    agent._empty_content_retries = 0
    agent._empty_response_retry_budget = configured
    agent._empty_guard_enabled = True
    monkeypatch.setattr(ter._empty_guard, "_estimate_attempt_cost", lambda a, r: attempt_cost)
    monkeypatch.setattr(ter._empty_guard, "record_empty_attempt", lambda *a, **k: None)
    monkeypatch.setattr(ter._empty_guard, "deterministic_empty", lambda a: False)
    monkeypatch.setattr(ter, "interruptible_backoff_sleep", lambda *a, **k: None)
    action, _, _ = ter._retry_empty(agent, SimpleNamespace(usage=None), "stop", True,
                                    messages=[], conversation_history=[], api_call_count=1)
    assert action == "continue"
    return agent._buffer_diagnostic_status.call_args[0][0]


def test_configured_budget_below_default_is_not_called_high_cost(monkeypatch):
    status = _empty_retry_status(monkeypatch, configured=2, attempt_cost=None)
    assert "(1/2)" in status
    assert "high-cost" not in status


def test_cost_guard_reduction_still_says_high_cost(monkeypatch):
    status = _empty_retry_status(monkeypatch, configured=2, attempt_cost=Decimal("0.80"))
    assert "(1/1)" in status
    assert "high-cost request, reduced retry budget" in status


def test_empty_retry_status_renders_in_the_client_language(monkeypatch, zh):
    status = _empty_retry_status(monkeypatch, configured=2, attempt_cost=Decimal("0.80"))
    assert CJK.search(status) and "(1/1)" in status.replace("（", "(").replace("）", ")")
    assert "Empty response" not in status


# ---------------------------------------------------------------- truncation ceiling

def _chat_agent(limit):
    with (
        patch("model_tools.get_tool_definitions", return_value=_make_tool_defs("web_search")),
        patch("model_tools.check_toolset_requirements", return_value={}),
        patch("agent.process_bootstrap.OpenAI"),
    ):
        a = AIAgent(api_key="test-key-1234567890", base_url="https://openrouter.ai/api/v1",
                    quiet_mode=True, skip_context_files=True, skip_memory=True)
    a.client = MagicMock()
    a._cached_system_prompt = "You are helpful."
    a._use_prompt_caching = False
    a.compression_enabled = False
    a.save_trajectories = False
    a._output_truncation_retries = limit
    return a


def _run_truncated(limit):
    agent = _chat_agent(limit)
    agent.client.chat.completions.create.side_effect = [
        _mock_response(content=f"Part {i} ", finish_reason="length") for i in range(1, 6)
    ]
    with (patch.object(agent, "_persist_session"), patch.object(agent, "_save_trajectory"),
          patch.object(agent, "_cleanup_task_resources")):
        return agent.run_conversation("hello")


@pytest.mark.parametrize("limit", [0, 2, 3])
def test_truncation_ceiling_reports_the_continuations_actually_sent(limit):
    result = _run_truncated(limit)
    assert result["partial"] is True
    assert result["api_calls"] == limit + 1
    assert result["error"] == f"Response remained truncated after {limit} continuation attempt(s)"


def test_truncation_ceiling_error_renders_in_the_client_language(zh):
    result = _run_truncated(0)
    assert CJK.search(result["error"]) and "0" in result["error"]
    assert "truncated" not in result["error"]
