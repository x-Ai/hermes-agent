"""The connector refusal table (``tui_gateway/connector_refusals.py``) carries catalog keys, and both sinks —
the legacy handler's ``_connector_rpc_error`` and the session authority's ``ConnectorRefusal`` — render them
in the connected client's language. Module constants are built at import, before any client announced a
language, so the key, not the text, is what the table may hold."""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from agent import i18n


def _entries():
    from tui_gateway import connector_refusals as r
    entries = {name: getattr(r, name) for name in
               ("INVALID_PARAMS", "INVALID_ANSWER", "UNKNOWN_OPERATION", "UNKNOWN_TARGET_REFUSAL",
                "CONNECTORS_UNAVAILABLE", "REQUEST_FAILED", "REISSUE_REFUSED")}
    entries.update({f"reissue:{reason}": entry for reason, entry in r.REISSUE_REFUSALS.items()})
    for code, status in (("no_access", 403), ("invalid_token", 401), ("other", 403)):
        entries[f"auth:{code}"] = r.auth_refusal(SimpleNamespace(code=code, status=status))
    return entries


def test_every_refusal_entry_names_a_translated_catalog_key():
    for name, (code, reason, key) in _entries().items():
        assert isinstance(code, int) and key.startswith("tui_gateway.connectors."), name
        en, zh = i18n.t(key, lang="en"), i18n.t(key, lang="zh")
        assert en != key and zh != key and zh != en, (name, key)


@pytest.mark.parametrize("lang", ["en", "zh"])
def test_both_sinks_render_the_refusal_in_the_clients_language(lang):
    from gateway.session_connections import ConnectorRefusal
    from tui_gateway import connector_refusals as r
    from tui_gateway import server  # the legacy sink runs rebound onto the server namespace, as in production

    token = i18n.bind_client_language(lang)
    try:
        expected = i18n.t(r.REQUEST_FAILED[2], lang=lang)
        assert ConnectorRefusal(*r.REQUEST_FAILED).wire_message == expected
        frame = server._connector_rpc_error("rid", *r.REQUEST_FAILED)
        assert frame["error"]["message"] == expected
        assert frame["error"]["code"] == 5034 and frame["error"]["data"]["reason"] == r.REQUEST_FAILED[1]
    finally:
        i18n.reset_client_language(token)


def test_a_legacy_literal_passes_through_the_resolver_unchanged():
    from tui_gateway.connector_refusals import message
    assert message("session ownership changed") == "session ownership changed"
