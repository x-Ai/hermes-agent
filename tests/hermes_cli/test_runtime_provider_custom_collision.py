"""Configured custom endpoints whose keys collide with built-in providers."""

from unittest.mock import patch

from hermes_cli.runtime_provider import resolve_requested_provider


def test_configured_builtin_collision_recovers_custom_identity_from_endpoint():
    model = {
        "provider": "xai",
        "base_url": "https://gateway.example.test/v1",
    }
    config = {
        "providers": {
            "xai": {
                "base_url": "https://gateway.example.test/v1",
                "key_env": "HERMES_CUSTOM_XAI_API_KEY",
            }
        }
    }

    with (
        patch("hermes_cli.runtime_provider._get_model_config", return_value=model),
        patch("hermes_cli.runtime_provider.load_config", return_value=config),
    ):
        assert resolve_requested_provider() == "custom:xai"


def test_explicit_builtin_request_is_not_shadowed_by_custom_endpoint():
    with patch("hermes_cli.runtime_provider._get_model_config", return_value={}):
        assert resolve_requested_provider("xai") == "xai"


def test_picker_context_uses_same_recovered_custom_identity():
    from hermes_cli.inventory import load_picker_context

    config = {
        "model": {
            "provider": "xai",
            "default": "grok-custom",
            "base_url": "https://gateway.example.test/v1",
        },
        "providers": {
            "xai": {
                "base_url": "https://gateway.example.test/v1",
                "key_env": "HERMES_CUSTOM_XAI_API_KEY",
            }
        },
    }

    with (
        patch("hermes_cli.config.load_config", return_value=config),
        patch("hermes_cli.runtime_provider.load_config", return_value=config),
    ):
        assert load_picker_context().current_provider == "custom:xai"


def test_keyless_entry_named_after_a_builtin_is_still_a_custom_endpoint():
    from hermes_cli.providers import is_builtin_provider_id, is_custom_endpoint_entry

    assert is_builtin_provider_id("xai") and not is_builtin_provider_id("my-relay")
    # Structural: the URL, not the credential's env-var spelling, says this is a foreign endpoint.
    assert is_custom_endpoint_entry("xai", {"base_url": "http://127.0.0.1:8080/v1"}) is True
    assert is_custom_endpoint_entry("xai", {"base_url": "https://gw.example.test/v1", "key_env": "MY_KEY"}) is True
    assert is_custom_endpoint_entry("xai", {"request_timeout_seconds": 30}) is False
    assert is_custom_endpoint_entry("my-relay", {"api": "https://gw.example.test/v1"}) is True
