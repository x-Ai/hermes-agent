"""The active route's output budget is resolved once, at construction, for every entry point.

Regression for the fork's custom-endpoint ``max_output_tokens``: it was wired only into the
gateway and the TUI turn-start sync, so ``hermes`` (CLI), batch, cron, ACP and side agents —
which construct ``AIAgent`` without ``max_tokens`` — ignored the configured budget.
"""

from unittest.mock import patch

URL = "http://relay.example.invalid/v1"


def _build_agent(cfg, **kwargs):
    with (
        patch("hermes_cli.config.load_config", return_value=cfg),
        patch("hermes_cli.config.load_config_readonly", return_value=cfg),
        patch("agent.model_metadata.get_model_context_length", return_value=128_000),
        patch("model_tools.get_tool_definitions", return_value=[]),
        patch("model_tools.check_toolset_requirements", return_value={}),
        patch("agent.process_bootstrap.OpenAI"),
    ):
        from run_agent import AIAgent

        return AIAgent(
            model="shared-model", api_key="test-key-1234567890", base_url=URL,
            provider="custom", requested_provider="custom:relay",
            quiet_mode=True, skip_context_files=True, skip_memory=True, **kwargs,
        )


def _cfg(**provider_fields):
    return {
        "model": {"default": "shared-model", "provider": "relay", "base_url": URL},
        "providers": {"relay": {"base_url": URL, "api_key": "k", **provider_fields}},
    }


def test_constructor_without_max_tokens_adopts_the_route_budget():
    cfg = _cfg(model_token_limits={"shared-model": {"max_output_tokens": 20_000}})
    agent = _build_agent(cfg)
    assert (agent.max_tokens, agent.max_tokens_source) == (20_000, "route")
    assert agent.context_compressor.max_tokens == 20_000


def test_caller_and_model_config_budgets_are_pinned_over_the_route():
    cfg = _cfg(model_token_limits={"shared-model": {"max_output_tokens": 20_000}})
    explicit = _build_agent(cfg, max_tokens=5_000)
    assert (explicit.max_tokens, explicit.max_tokens_source) == (5_000, "explicit")

    cfg["model"]["max_tokens"] = 7_000
    from_config = _build_agent(cfg)
    assert (from_config.max_tokens, from_config.max_tokens_source) == (7_000, "explicit")


def test_route_without_a_budget_leaves_the_provider_default():
    agent = _build_agent(_cfg())
    assert (agent.max_tokens, agent.max_tokens_source) == (None, None)


def test_route_change_rederives_a_route_budget_but_keeps_an_explicit_one():
    from agent.agent_runtime_helpers import _refresh_route_output_limit

    cfg = _cfg(
        max_output_tokens=9_000,
        model_token_limits={"shared-model": {"max_output_tokens": 20_000}},
    )
    agent = _build_agent(cfg)
    agent.model = "other-model"  # falls back to the provider-wide default
    _refresh_route_output_limit(agent)
    assert (agent.max_tokens, agent.max_tokens_source) == (9_000, "route")
    assert agent.context_compressor.max_tokens == 9_000

    pinned = _build_agent(cfg, max_tokens=5_000)
    pinned.model = "other-model"
    _refresh_route_output_limit(pinned)
    assert (pinned.max_tokens, pinned.max_tokens_source) == (5_000, "explicit")
