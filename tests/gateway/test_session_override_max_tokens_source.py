"""A session /model override hands its ``max_tokens_source`` to the agent with ``max_tokens``.

The marker tells a user-pinned output budget (``explicit``) from one derived from the route
(``route``); the agent and the live-config reload read it. Both session-override exits, the keyed
fast return and the managed-OAuth re-resolution, build their runtime from the same snapshot.
"""
from pathlib import Path

import pytest

from gateway.run import GatewayRunner
from hermes_cli.auth import PROVIDER_REGISTRY


def _runner(monkeypatch, tmp_path):
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setattr("gateway.run._resolve_gateway_model", lambda *_: "default-model")
    monkeypatch.setattr("gateway.run._resolve_runtime_agent_kwargs", lambda: {
        "provider": "openrouter", "api_key": "default-key", "base_url": "https://openrouter.ai/api/v1"})
    monkeypatch.setattr("gateway.run._credential_pool_for_provider", lambda *_: None)
    runner = object.__new__(GatewayRunner)
    runner.config = None
    runner.session_store = None
    runner._session_model_overrides = {}
    return runner


def test_keyed_session_override_keeps_max_tokens_source(tmp_path, monkeypatch):
    runner = _runner(monkeypatch, tmp_path)
    runner._session_model_overrides["session"] = {
        "model": "selected-model", "provider": "custom:private", "api_key": "explicit-key",
        "base_url": "https://private.invalid/v1", "api_mode": "chat_completions",
        "max_tokens": 4096, "max_tokens_source": "explicit",
    }
    model, runtime = runner._resolve_session_agent_runtime(session_key="session")
    assert (model, runtime["api_key"]) == ("selected-model", "explicit-key")
    assert (runtime["max_tokens"], runtime["max_tokens_source"]) == (4096, "explicit")


@pytest.mark.parametrize("provider", ["openai-codex", "xai-oauth"])
def test_managed_oauth_session_override_keeps_max_tokens_source(tmp_path, monkeypatch, provider):
    runner = _runner(monkeypatch, tmp_path)
    endpoint = PROVIDER_REGISTRY[provider].inference_base_url
    runner._session_model_overrides["session"] = {
        "model": "selected-model", "provider": provider, "api_key": "stale-key",
        "base_url": endpoint, "api_mode": "codex_responses", "credential_pool": None,
        "max_tokens": 9000, "max_tokens_source": "route",
    }
    monkeypatch.setattr("gateway.run._resolve_runtime_agent_kwargs_for_provider", lambda *a, **k: {
        "provider": provider, "api_key": "fresh-key", "base_url": endpoint, "credential_pool": None})
    model, runtime = runner._resolve_session_agent_runtime(session_key="session")
    assert (model, runtime["api_key"]) == ("selected-model", "fresh-key")
    assert (runtime["max_tokens"], runtime["max_tokens_source"]) == (9000, "route")
