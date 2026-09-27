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


def test_builtin_keyed_entry_is_custom_only_with_its_own_credential_or_name():
    """``providers.<builtin>`` is that provider's settings block: a bare ``base_url`` override
    (LM Studio on another box, a plugin provider re-homed) keeps the built-in identity and its
    catalog/auth/transport. It is a colliding custom endpoint only when it points off the
    provider's host AND carries a credential or a name of its own."""
    from hermes_cli.providers import is_builtin_provider_id, is_custom_endpoint_entry

    assert is_builtin_provider_id("xai") and not is_builtin_provider_id("my-relay")
    assert is_custom_endpoint_entry("xai", {"base_url": "http://127.0.0.1:8080/v1"}) is False
    assert is_custom_endpoint_entry(
        "lmstudio", {"base_url": "http://remote-box:1234/v1", "discover_models": True}) is False
    assert is_custom_endpoint_entry("xai", {"base_url": "https://gw.example.test/v1", "key_env": "MY_KEY"}) is True
    assert is_custom_endpoint_entry("xai", {"base_url": "https://gw.example.test/v1", "name": "Private relay"}) is True
    # The provider's own label is not an identity of its own; a key pinned on its own host is just a key.
    assert is_custom_endpoint_entry("xai", {"base_url": "https://gw.example.test/v1", "name": "xAI"}) is False
    assert is_custom_endpoint_entry("xai", {"base_url": "https://api.x.ai/v1", "key_env": "XAI_API_KEY"}) is False
    assert is_custom_endpoint_entry("xai", {"request_timeout_seconds": 30}) is False
    # Under a key that is no built-in id, any endpoint row is a custom endpoint.
    assert is_custom_endpoint_entry("my-relay", {"api": "https://gw.example.test/v1"}) is True
