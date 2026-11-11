"""A named custom endpoint keeps the api_mode its entry selected over a host-mandated one.

The end-to-end switch is covered by
``test_model_switch_openai_api_mode.test_named_custom_endpoint_preserves_explicit_api_mode_on_mandated_host``;
this pins the predicate ``_resolve_switch_credentials`` consults.
"""

import pytest

from hermes_cli.model_switch_custom_endpoint import keeps_selected_api_mode


@pytest.mark.parametrize("provider", ["custom", "custom:relay", "Custom:Relay", "  custom  "])
@pytest.mark.parametrize("api_mode", ["chat_completions", "codex_responses", "anthropic_messages"])
def test_named_custom_with_selected_mode_keeps_it(provider, api_mode):
    assert keeps_selected_api_mode(provider, api_mode) is True


@pytest.mark.parametrize("provider", ["custom", "custom:relay"])
@pytest.mark.parametrize("api_mode", ["", None])
def test_named_custom_without_mode_takes_the_host_mandate(provider, api_mode):
    assert keeps_selected_api_mode(provider, api_mode) is False


@pytest.mark.parametrize("provider", ["openai-api", "openrouter", "anthropic", "customer", "my-custom"])
def test_builtin_providers_take_the_host_mandate(provider):
    assert keeps_selected_api_mode(provider, "chat_completions") is False
