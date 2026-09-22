"""Tests for agent.api_max_retries config surface.

Closes #11616 — make the hardcoded ``max_retries = 3`` in the agent's API
retry loop user-configurable so fallback-provider setups can fail over
faster on flaky primaries instead of burning ~3x180s on the same stall.
"""
from unittest.mock import patch

from run_agent import AIAgent


def _make_agent(api_max_retries=None, output_truncation_retries=None, **empty_recovery_retries):
    """Build an AIAgent with a mocked config.load_config that returns a
    config tree containing the given agent.api_max_retries (or default)."""
    cfg = {"agent": {}}
    if api_max_retries is not None:
        cfg["agent"]["api_max_retries"] = api_max_retries
    if output_truncation_retries is not None:
        cfg["agent"]["output_truncation_retries"] = output_truncation_retries
    cfg["agent"].update(empty_recovery_retries)

    with patch("agent.process_bootstrap.OpenAI"), \
         patch("hermes_cli.config.load_config", return_value=cfg), \
         patch("hermes_cli.config.load_config_readonly", return_value=cfg):
        return AIAgent(
            api_key="test-key",
            base_url="https://openrouter.ai/api/v1",
            model="test/model",
            quiet_mode=True,
            skip_context_files=True,
            skip_memory=True,
        )


def test_default_api_max_retries_is_three():
    """No config override → legacy default of 3 retries preserved."""
    agent = _make_agent()
    assert agent._api_max_retries == 3


def test_api_max_retries_honors_config_override():
    """Setting agent.api_max_retries in config propagates to the agent."""
    agent = _make_agent(api_max_retries=1)
    assert agent._api_max_retries == 1

    agent2 = _make_agent(api_max_retries=5)
    assert agent2._api_max_retries == 5


def test_output_truncation_retry_budget_defaults_once_and_is_bounded():
    """No-visible output exhaustion gets one recovery replay, bounded at three."""
    assert _make_agent()._output_truncation_retries == 1
    assert _make_agent(output_truncation_retries=2)._output_truncation_retries == 2
    assert _make_agent(output_truncation_retries=-1)._output_truncation_retries == 0
    assert _make_agent(output_truncation_retries=99)._output_truncation_retries == 3


def test_empty_recovery_retry_budgets_are_independent_and_bounded():
    defaults = _make_agent()
    assert (
        defaults._post_tool_empty_retry_budget,
        defaults._thinking_prefill_retry_budget,
        defaults._empty_response_retry_budget,
    ) == (1, 2, 3)

    disabled = _make_agent(
        post_tool_empty_retries=0,
        thinking_prefill_retries=-1,
        empty_response_retries=False,
    )
    assert (
        disabled._post_tool_empty_retry_budget,
        disabled._thinking_prefill_retry_budget,
        disabled._empty_response_retry_budget,
    ) == (0, 0, 3)

    capped = _make_agent(
        post_tool_empty_retries=9,
        thinking_prefill_retries=9,
        empty_response_retries=9,
    )
    assert (
        capped._post_tool_empty_retry_budget,
        capped._thinking_prefill_retry_budget,
        capped._empty_response_retry_budget,
    ) == (3, 3, 3)

