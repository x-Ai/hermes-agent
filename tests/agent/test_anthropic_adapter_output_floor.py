"""Output ceiling for an unknown model on the Anthropic Messages wire: who serves the model decides.

Anthropic itself and every host the provider registry can name (Kimi's /coding, Tencent TokenPlan,
MiniMax, …) keep the Anthropic default, as upstream sends it; only a host Hermes knows nothing about
gets the conservative third-party floor, because 128K 400s on many relays and nothing configured or
discovered means the ceiling is unknown.
"""
from agent.anthropic_adapter import (
    _ANTHROPIC_DEFAULT_OUTPUT_LIMIT,
    _THIRD_PARTY_DEFAULT_OUTPUT_LIMIT,
    _resolve_anthropic_messages_max_tokens,
)


def test_unknown_model_keeps_the_anthropic_ceiling_on_registered_hosts():
    for base_url in (None, "https://api.anthropic.com", "https://api.kimi.com/coding/v1",
                     "https://api.lkeap.cloud.tencent.com/plan/anthropic", "https://api.minimaxi.com/anthropic"):
        assert _resolve_anthropic_messages_max_tokens(None, "kimi-k3", base_url=base_url) == \
            _ANTHROPIC_DEFAULT_OUTPUT_LIMIT, base_url


def test_unregistered_relay_gets_the_floor_and_a_configured_budget_wins():
    relay = "https://relay.example.com/v1"
    assert _resolve_anthropic_messages_max_tokens(None, "some-model", base_url=relay) == _THIRD_PARTY_DEFAULT_OUTPUT_LIMIT
    assert _resolve_anthropic_messages_max_tokens(4096, "some-model", base_url=relay) == 4096
