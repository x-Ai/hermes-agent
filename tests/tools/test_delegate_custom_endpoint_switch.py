"""``delegation.use_custom_endpoints`` on surfaces that have no endpoint picker.

The switch used to mean only "offer endpoints in the Desktop/dashboard pickers". A CLI setup that
set ``delegation.model`` to a model one of its saved endpoints serves therefore sent that model id
to the *parent's* provider. With the switch on, that model now routes to its own endpoint (its key,
``base_url`` and wire protocol). A configured route and the off state are untouched, so existing
configs keep resolving exactly as before.
"""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from tools.delegate_tool import _resolve_delegation_credentials

_FIND = "hermes_cli.runtime_provider_custom.find_custom_provider_identity_by_model"
_RESOLVE = "hermes_cli.runtime_provider.resolve_runtime_provider"

_ENDPOINT_RUNTIME = {
    "provider": "custom",
    "base_url": "http://127.0.0.1:9999/v1",
    "api_key": "sk-endpoint",
    "api_mode": "chat_completions",
}
_PARENT_RUNTIME = {
    "provider": "openrouter",
    "base_url": "https://openrouter.ai/api/v1",
    "api_key": "sk-parent",
    "api_mode": "chat_completions",
}


def _parent():
    parent = MagicMock()
    parent.base_url = "https://openrouter.ai/api/v1"
    parent.api_key = "sk-parent"
    parent.provider = "openrouter"
    parent.api_mode = "chat_completions"
    parent.model = "anthropic/claude-sonnet-4"
    parent.request_overrides = None
    return parent


class TestCustomEndpointDelegationSwitch(unittest.TestCase):
    @patch(_RESOLVE, return_value=_ENDPOINT_RUNTIME)
    @patch(_FIND, return_value="custom:acme")
    def test_switch_routes_the_named_model_to_its_endpoint(self, find, resolve):
        creds = _resolve_delegation_credentials(
            {"model": "acme-chat", "provider": "", "use_custom_endpoints": True}, _parent())

        self.assertEqual(creds["base_url"], "http://127.0.0.1:9999/v1")
        self.assertEqual(creds["api_key"], "sk-endpoint")
        self.assertEqual(creds["model"], "acme-chat")
        resolve.assert_called_once_with(requested="custom:acme", target_model="acme-chat")

    @patch(_RESOLVE, return_value=_ENDPOINT_RUNTIME)
    @patch(_FIND, return_value="custom:acme")
    def test_switch_off_keeps_plain_inheritance(self, find, resolve):
        creds = _resolve_delegation_credentials({"model": "acme-chat", "provider": ""}, _parent())

        self.assertIsNone(creds["provider"])
        self.assertIsNone(creds["base_url"])
        self.assertIsNone(creds["api_key"])
        find.assert_not_called()
        resolve.assert_not_called()

    @patch(_RESOLVE, return_value=_ENDPOINT_RUNTIME)
    @patch(_FIND, return_value="custom:acme")
    def test_a_configured_route_is_never_rerouted(self, find, resolve):
        with patch(_RESOLVE, return_value=_PARENT_RUNTIME):
            creds = _resolve_delegation_credentials(
                {"model": "acme-chat", "provider": "openrouter", "use_custom_endpoints": True},
                _parent())

        self.assertEqual(creds["base_url"], "https://openrouter.ai/api/v1")
        find.assert_not_called()

    @patch(_RESOLVE, return_value=_ENDPOINT_RUNTIME)
    @patch(_FIND, return_value=None)
    def test_an_unclaimed_model_still_inherits(self, find, resolve):
        creds = _resolve_delegation_credentials(
            {"model": "nobody-serves-this", "provider": "", "use_custom_endpoints": True}, _parent())

        self.assertIsNone(creds["base_url"])
        find.assert_called_once_with("nobody-serves-this")

    @patch(_RESOLVE, return_value=_ENDPOINT_RUNTIME)
    @patch(_FIND, return_value="custom:acme")
    def test_no_model_means_no_lookup(self, find, resolve):
        creds = _resolve_delegation_credentials(
            {"model": "", "provider": "", "use_custom_endpoints": True}, _parent())

        self.assertIsNone(creds["base_url"])
        find.assert_not_called()
