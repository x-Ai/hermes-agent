"""Saved model budgets belong to a provider, even when routes or model ids coincide."""

from types import SimpleNamespace

import pytest
from starlette.testclient import TestClient

from agent.context_compressor import ContextCompressor
from agent.output_tokens import resolve_output_token_limit
from gateway.run_agent_cache import GatewayAgentCacheMixin
from hermes_cli.config import get_compatible_custom_providers, load_config, save_config
from hermes_cli.runtime_provider import resolve_runtime_provider
from hermes_cli.web_server import app, _SESSION_HEADER_NAME, _SESSION_TOKEN
from hermes_constants import get_hermes_home, reset_hermes_home_override, set_hermes_home_override
from tui_gateway import server


PROVIDER_NAMES = [
    pytest.param(("First", "Second"), id="distinct-labels"),
    pytest.param(("Second", "Other provider"), id="label-matches-other-id"),
    pytest.param(("Shared label", "Shared label"), id="identical-labels"),
]


@pytest.fixture
def client():
    home_token = set_hermes_home_override(str(get_hermes_home()))
    client = TestClient(app, headers={_SESSION_HEADER_NAME: _SESSION_TOKEN})
    try:
        yield client
    finally:
        client.close()
        reset_hermes_home_override(home_token)


def _save_endpoint(client, provider, base_url, limits, *, name):
    response = client.post(
        "/api/providers/custom-endpoints",
        json={
            "id": provider,
            "name": name,
            "base_url": base_url,
            "model": "shared-model",
            "make_default": False,
            "model_token_limits": {"shared-model": limits},
        },
    )
    assert response.status_code == 200, response.text


def _live_session(provider, base_url):
    compressor = ContextCompressor(
        "shared-model", base_url=base_url,
        config_context_length=128_000, quiet_mode=True,
    )
    agent = SimpleNamespace(
        model="shared-model", provider="custom", requested_provider=f"custom:{provider}",
        base_url=base_url, context_compressor=compressor,
    )
    return {"agent": agent}, compressor


def _assert_live_limits(provider, base_url, expected):
    resolved_runtime = resolve_runtime_provider(requested=f"custom:{provider}", target_model="shared-model")
    assert resolved_runtime["base_url"] == base_url
    assert resolved_runtime.get("max_output_tokens") == expected.get("max_output_tokens")
    session, compressor = _live_session(provider, base_url)
    server._sync_agent_compression_with_config(provider, session)
    agent = session["agent"]
    assert agent._config_context_length == expected.get("context_length")
    assert compressor._config_context_length == expected.get("context_length")
    assert compressor.max_input_tokens == expected.get("max_input_tokens")
    assert compressor.max_tokens == expected.get("max_output_tokens")
    assert agent.max_tokens == expected.get("max_output_tokens")
    runtime = {"provider": "custom", "requested_provider": f"custom:{provider}", "base_url": base_url}
    assert GatewayAgentCacheMixin._active_provider_token_limits(
        "shared-model", runtime, load_config(),
    ) == expected
    output = resolve_output_token_limit(
        explicit=None, model="shared-model", **runtime,
        custom_providers=get_compatible_custom_providers(), discover=False,
    )
    assert output.value == expected.get("max_output_tokens")


@pytest.mark.parametrize("same_url", [True, False])
@pytest.mark.parametrize("provider_names", PROVIDER_NAMES)
def test_endpoint_save_reload_and_clear_keep_same_named_models_independent(client, same_url, provider_names):
    first_url = "https://first.example.invalid/v1"
    second_url = first_url if same_url else "https://second.example.invalid/v1"
    first_name, second_name = provider_names
    first_limits = {"context_length": 423_353, "max_input_tokens": 320_000, "max_output_tokens": 32_000}
    second_limits = {"context_length": 256_000, "max_input_tokens": 200_000, "max_output_tokens": 16_000}
    automatic = dict.fromkeys(first_limits)

    _save_endpoint(client, "first", first_url, first_limits, name=first_name)
    _save_endpoint(client, "second", second_url, automatic, name=second_name)
    _assert_live_limits("first", first_url, first_limits)
    _assert_live_limits("second", second_url, {})

    _save_endpoint(client, "second", second_url, second_limits, name=second_name)
    _assert_live_limits("first", first_url, first_limits)
    _assert_live_limits("second", second_url, second_limits)
    first_session, _ = _live_session("first", first_url)
    first_signature = server._tui_compression_config_signature(load_config(), first_session["agent"])

    for field in second_limits:
        _save_endpoint(client, "second", second_url, {field: None}, name=second_name)
        expected = {key: value for key, value in second_limits.items() if key != field}
        _assert_live_limits("second", second_url, expected)
        _assert_live_limits("first", first_url, first_limits)
        assert server._tui_compression_config_signature(load_config(), first_session["agent"]) == first_signature
        _save_endpoint(client, "second", second_url, second_limits, name=second_name)

    _save_endpoint(client, "second", second_url, automatic, name=second_name)
    response = client.get("/api/providers/custom-endpoints")
    assert response.status_code == 200
    rows = {row["id"]: row for row in response.json()["endpoints"]}
    assert rows["first"]["model_token_limits"]["shared-model"] == first_limits
    assert rows["second"]["model_token_limits"] == {}
    _assert_live_limits("second", second_url, {})


@pytest.mark.parametrize("same_url", [True, False])
@pytest.mark.parametrize("provider_names", PROVIDER_NAMES)
def test_default_context_pin_only_refreshes_its_own_provider(client, same_url, provider_names):
    first_url = "https://first.example.invalid/v1"
    second_url = first_url if same_url else "https://second.example.invalid/v1"
    first_name, second_name = provider_names
    _save_endpoint(client, "first", first_url, {}, name=first_name)
    second_limits = {"context_length": 256_000, "max_input_tokens": 200_000, "max_output_tokens": 16_000}
    _save_endpoint(client, "second", second_url, second_limits, name=second_name)
    cfg = load_config()
    cfg["model"] = {
        "default": "shared-model", "provider": "first",
        "context_length": 423_353,
    }
    save_config(cfg)
    session, compressor = _live_session("second", second_url)
    server._sync_agent_compression_with_config("second", session)
    assert compressor.context_length == second_limits["context_length"]
    signature = session["config_compression_seen"]

    cfg["model"]["context_length"] += 1000
    save_config(cfg)
    server._sync_agent_compression_with_config("second", session)
    assert session["config_compression_seen"] == signature
    assert compressor.context_length == second_limits["context_length"]
    first_session, first_compressor = _live_session("first", first_url)
    server._sync_agent_compression_with_config("first", first_session)
    assert first_compressor.context_length == cfg["model"]["context_length"]
    if same_url:
        first_session["agent"].requested_provider = "custom"
        assert server._global_context_length_for_agent(first_session["agent"], cfg) is None
