"""The providers-entry known-key set carries both the fork's per-endpoint keys (auth scheme, output-cap
field name, token budgets) and upstream's ``gemini_api`` (read by the gemini provider plugin): an entry
using all of them normalizes without an unknown-key warning, and the fork's keys survive normalization.
"""

from __future__ import annotations

import logging

import pytest

from hermes_cli.config import _PROVIDER_NORMALIZE_WARNED, _normalize_custom_provider_entry


@pytest.fixture(autouse=True)
def _reset_warn_cache():
    _PROVIDER_NORMALIZE_WARNED.clear()
    yield
    _PROVIDER_NORMALIZE_WARNED.clear()


def test_fork_endpoint_keys_and_gemini_api_are_known_together(caplog):
    entry = {
        "base_url": "https://gw.example.com/v1",
        "key_env": "GW_KEY",
        "auth_scheme": "x-api-key",
        "max_tokens_field": "max_completion_tokens",
        "max_input_tokens": 200000,
        "max_output_tokens": 32000,
        "model_token_limits": {"m-1": {"context_length": 262144}},
        "gemini_api": "interactions",
    }
    with caplog.at_level(logging.WARNING):
        result = _normalize_custom_provider_entry(entry, provider_key="merged-keys-probe")

    assert result is not None
    assert not [r for r in caplog.records if "unknown config keys" in r.message.lower()]
    assert result["auth_scheme"] == "x-api-key"
    assert result["max_tokens_field"] == "max_completion_tokens"
    assert (result["max_input_tokens"], result["max_output_tokens"]) == (200000, 32000)
    assert result["model_token_limits"] == {"m-1": {"context_length": 262144}}


def test_a_truly_unknown_key_still_warns_next_to_them(caplog):
    entry = {"base_url": "https://gw.example.com/v1", "auth_scheme": "bearer", "gemini_api": "auto",
             "not_a_provider_key": 1}
    with caplog.at_level(logging.WARNING):
        _normalize_custom_provider_entry(entry, provider_key="merged-keys-unknown-probe")

    warnings = [r.getMessage() for r in caplog.records if "unknown config keys" in r.getMessage().lower()]
    assert warnings and "not_a_provider_key" in warnings[0]
    assert "gemini_api" not in warnings[0] and "auth_scheme" not in warnings[0]
