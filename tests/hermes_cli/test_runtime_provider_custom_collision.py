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
