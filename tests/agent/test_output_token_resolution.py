"""Output-budget contracts shared by custom OpenAI-compatible transports."""

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from agent.output_tokens import resolve_output_token_limit
from agent.transports.codex import ResponsesApiTransport
from agent.transports.anthropic import AnthropicTransport
from agent.transports.chat_completions import ChatCompletionsTransport
from agent.turn_response_check import is_standard_output_truncation
from run_agent import AIAgent


def _entry(name: str, url: str, **values):
    return {"name": name, "provider_key": name, "base_url": url, **values}


def test_output_limit_precedence_and_scoping():
    url = "https://cursor2api.example/v1"
    entries = [
        _entry(
            "cursor2api", url, max_output_tokens=64_000,
            models={"glm-5.2": {"max_output_tokens": 96_000}},
        ),
        _entry("other", url, max_output_tokens=7_000),
    ]

    explicit = resolve_output_token_limit(
        explicit=4_000, model="glm-5.2", base_url=url, provider="custom",
        requested_provider="custom:cursor2api", custom_providers=entries, discover=False)
    model = resolve_output_token_limit(
        explicit=None, model="glm-5.2", base_url=url, provider="custom",
        requested_provider="custom:cursor2api", custom_providers=entries, discover=False)
    provider = resolve_output_token_limit(
        explicit=None, model="another-model", base_url=url, provider="custom",
        requested_provider="custom:cursor2api", custom_providers=entries, discover=False)
    mismatched = resolve_output_token_limit(
        explicit=None, model="another-model", base_url=url, provider="custom",
        requested_provider="custom:missing", custom_providers=entries, discover=False)

    assert (explicit.value, explicit.source) == (4_000, "explicit")
    assert (model.value, model.source) == (96_000, "model")
    assert (provider.value, provider.source) == (64_000, "provider")
    assert (mismatched.value, mismatched.source) == (None, "transport_default")


def test_provider_limit_wins_over_saved_discovered_capability():
    url = "https://cursor2api.example/v1"
    entries = [_entry(
        "cursor2api", url, max_output_tokens=64_000, models_discovered=True,
        models={"glm-5.2": {"max_output_tokens": 128_000}},
    )]

    resolved = resolve_output_token_limit(
        explicit=None, model="glm-5.2", base_url=url, provider="custom",
        requested_provider="custom:cursor2api", custom_providers=entries, discover=False)

    assert (resolved.value, resolved.source) == (64_000, "provider")


def test_live_discovered_capability_is_used_without_context_length_inference():
    metadata = {"glm-5.2": {"context_length": 1_000_000, "max_output_tokens": 128_000}}
    with patch("agent.model_metadata.fetch_endpoint_model_metadata", return_value=metadata):
        resolved = resolve_output_token_limit(
            explicit=None, model="glm-5.2", base_url="https://cursor2api.example/v1",
            provider="custom", requested_provider="custom:cursor2api", custom_providers=[])
    assert (resolved.value, resolved.source) == (128_000, "discovered")

    with patch(
        "agent.model_metadata.fetch_endpoint_model_metadata",
        return_value={"glm-5.2": {"context_length": 1_000_000}},
    ):
        missing = resolve_output_token_limit(
            explicit=None, model="glm-5.2", base_url="https://cursor2api.example/v1",
            provider="custom", requested_provider="custom:cursor2api", custom_providers=[])
    assert (missing.value, missing.source) == (None, "transport_default")


def test_configured_discovery_uses_provider_transport_and_headers():
    from hermes_cli.models import DiscoveredModelList

    url = "https://cursor2api.example/v1"
    entry = _entry(
        "cursor2api", url, api_mode="anthropic_messages",
        extra_headers={"X-Cursor-Token": "secret"})
    catalog = DiscoveredModelList(
        ["glm-5.2"], model_metadata={"glm-5.2": {"max_output_tokens": 128_000}})
    with patch("hermes_cli.models.cached_fetch_api_models", return_value=catalog) as fetch:
        resolved = resolve_output_token_limit(
            explicit=None, model="glm-5.2", base_url=url, api_key="key",
            provider="custom", requested_provider="custom:cursor2api",
            custom_providers=[entry])

    assert (resolved.value, resolved.source) == (128_000, "discovered")
    fetch.assert_called_once_with(
        "key", url, api_mode="anthropic_messages",
        headers={"X-Cursor-Token": "secret"})


def test_models_catalog_preserves_advertised_output_capability():
    from agent.model_metadata import _parse_models_payload
    from hermes_cli.models import _models_from_catalog

    payload = {"data": [{
        "id": "glm-5.2",
        "context_length": 1_000_000,
        "capabilities": {"max_output_tokens": 128_000},
    }]}
    models = _models_from_catalog(payload)

    assert models == ["glm-5.2"]
    assert models.model_metadata == {"glm-5.2": {"max_output_tokens": 128_000}}
    assert _parse_models_payload(payload)["glm-5.2"]["max_output_tokens"] == 128_000


def test_responses_anthropic_and_chat_use_one_protocol_field():
    responses = ResponsesApiTransport().build_kwargs(
        model="glm-5.2", messages=[{"role": "user", "content": "hi"}], tools=[],
        max_tokens=128_000, base_url="https://cursor2api.example/v1")
    assert responses["max_output_tokens"] == 128_000
    assert "max_tokens" not in responses and "max_completion_tokens" not in responses

    anthropic = AnthropicTransport().build_kwargs(
        model="glm-5.2", messages=[{"role": "user", "content": "hi"}], tools=[],
        max_tokens=128_000, base_url="https://cursor2api.example/anthropic")
    assert anthropic["max_tokens"] == 128_000
    assert "max_output_tokens" not in anthropic

    custom = AIAgent.__new__(AIAgent)
    custom.base_url = "https://cursor2api.example/v1"
    custom.model = "gpt-5-compatible"
    assert custom._max_tokens_param(128_000) == {"max_tokens": 128_000}
    custom.base_url = "https://api.openai.com/v1"
    assert custom._max_tokens_param(128_000) == {"max_completion_tokens": 128_000}


def test_unknown_custom_anthropic_model_uses_protocol_default_not_128k():
    kwargs = AnthropicTransport().build_kwargs(
        model="unknown-custom-model", messages=[{"role": "user", "content": "hi"}],
        tools=[], max_tokens=None, base_url="https://example.test/anthropic")
    assert kwargs["max_tokens"] == 16_384


def test_optional_chat_and_responses_limits_are_omitted_when_unconfigured():
    responses = ResponsesApiTransport().build_kwargs(
        model="unknown", messages=[{"role": "user", "content": "hi"}], tools=[],
        max_tokens=None, base_url="https://example.test/v1")
    chat = ChatCompletionsTransport().build_kwargs(
        model="unknown", messages=[{"role": "user", "content": "hi"}], tools=[],
        max_tokens=None, max_tokens_param_fn=lambda value: {"max_tokens": value})

    for kwargs in (responses, chat):
        assert not ({"max_tokens", "max_completion_tokens", "max_output_tokens"} & kwargs.keys())


@pytest.mark.parametrize(
    ("api_mode", "response"),
    [
        ("chat_completions", SimpleNamespace(choices=[SimpleNamespace(finish_reason="length")])),
        ("anthropic_messages", SimpleNamespace(stop_reason="max_tokens")),
        ("bedrock_converse", SimpleNamespace(
            choices=[SimpleNamespace(finish_reason="length")])),
        ("codex_responses", SimpleNamespace(
            status="incomplete", incomplete_details=SimpleNamespace(reason="max_output_tokens"))),
    ],
)
def test_provider_reported_output_limits_are_standard_truncations(api_mode, response):
    assert is_standard_output_truncation(SimpleNamespace(api_mode=api_mode), response) is True
