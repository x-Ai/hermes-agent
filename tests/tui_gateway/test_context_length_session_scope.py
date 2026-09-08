"""Selectable model context windows stay scoped to one desktop session."""

from types import SimpleNamespace
from unittest.mock import Mock, patch

import tui_gateway.server as server


def test_config_set_context_length_updates_and_persists_live_session() -> None:
    compressor = SimpleNamespace(
        _coerce_threshold_tokens_cap=lambda value: None,
        context_length=272_000,
        threshold_tokens=231_200,
    )

    def update_model(**kwargs) -> None:
        compressor.context_length = kwargs["context_length"]
        compressor.threshold_tokens = int(kwargs["context_length"] * 0.85)

    compressor.update_model = Mock(side_effect=update_model)
    agent = SimpleNamespace(
        _primary_runtime={
            "compressor_context_length": 272_000,
            "compressor_threshold_tokens": 231_200,
        },
        api_key="secret",
        api_mode="responses",
        base_url="https://chatgpt.com/backend-api/codex",
        context_compressor=compressor,
        model="gpt-5.6-sol",
        provider="openai-codex",
        requested_provider="openai-codex",
        _session_init_model_config={},
    )
    session = {"agent": agent, "session_key": "stored-1"}

    with (
        patch.dict(server._sessions, {"runtime-1": session}, clear=False),
        patch.object(server, "_persist_live_session_runtime") as persist_runtime,
        patch.object(server, "_emit") as emit,
    ):
        response = server._methods["config.set"](
            "rid-1",
            {
                "key": "context_length",
                "session_id": "runtime-1",
                "value": 872_000,
            },
        )

    assert response["result"]["value"] == 872_000
    assert compressor.context_length == 872_000
    assert agent._session_context_length_override == 872_000
    assert agent._session_init_model_config["context_length"] == 872_000
    assert agent._primary_runtime["compressor_context_length"] == 872_000
    assert session["model_override"]["context_length"] == 872_000
    persist_runtime.assert_called_once_with(session)
    emit.assert_called_once()
    assert emit.call_args.args[:2] == ("session.info", "runtime-1")
    assert emit.call_args.args[2]["usage"]["context_max"] == 872_000

    stored = server._runtime_model_config(agent)
    restored = server._stored_session_runtime_overrides({"model": agent.model, "model_config": stored})
    assert restored["model_override"]["context_length"] == 872_000

    server._apply_live_compression_config(agent, {"model": {"context_length": 272_000}})
    assert compressor.context_length == 872_000
