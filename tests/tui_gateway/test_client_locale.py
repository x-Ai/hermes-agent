"""``i18n.client_locale``: a connection announces the language its client renders; RPC bodies on that
connection, the sessions its prompts drive and their off-turn bodies render backend copy in it."""

from __future__ import annotations

import gc
import threading
import weakref

import pytest

from agent import i18n
from tui_gateway import server
from tui_gateway.client_locale import client_locale, remember_client_locale, remember_session_client_locale
from tui_gateway.transport import StdioTransport, TeeTransport, bind_transport, reset_transport

KEY = "core.failed_turn.notice"


class _Transport:
    def write(self, obj):
        return True

    def close(self):
        pass


@pytest.fixture(autouse=True)
def english_profile(monkeypatch):
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


@pytest.fixture
def localized_method(monkeypatch):
    """A handler whose reply is backend-authored copy (what every ``_t()`` reply looks like)."""
    monkeypatch.setitem(server._methods, "test.localized",
                        lambda rid, params: server._ok(rid, {"text": i18n.t(KEY)}))


def _rpc(transport, method, params=None, rid="r"):
    return server.dispatch({"id": rid, "method": method, "params": params or {}}, transport)


def test_announce_binds_the_connection_and_its_rpc_bodies(localized_method):
    chinese, other = _Transport(), _Transport()
    assert _rpc(chinese, "i18n.client_locale", {"lang": "zh"})["result"] == {"lang": "zh"}

    assert _rpc(chinese, "test.localized")["result"]["text"] == i18n.t(KEY, lang="zh")
    assert _rpc(other, "test.localized")["result"]["text"] == i18n.t(KEY, lang="en")
    assert i18n.get_language() == "en"  # nothing leaks past the request


def test_withdrawing_or_naming_an_unknown_language_clears_the_claim(localized_method):
    transport = _Transport()
    _rpc(transport, "i18n.client_locale", {"lang": "zh"})
    assert _rpc(transport, "i18n.client_locale", {"lang": "xx-nope"})["result"] == {"lang": ""}
    assert _rpc(transport, "test.localized")["result"]["text"] == i18n.t(KEY, lang="en")

    _rpc(transport, "i18n.client_locale", {"lang": "zh_TW"})
    assert client_locale(transport) == "zh-hant"
    assert _rpc(transport, "i18n.client_locale", {})["result"] == {"lang": ""}
    assert client_locale(transport) == ""


def test_claim_rides_onto_the_session_only_when_the_submit_carries_one():
    transport = _Transport()
    remember_client_locale(transport, "ja")
    session = {}
    remember_session_client_locale(session, transport)
    assert session["client_locale"] == "ja"
    remember_session_client_locale(session, _Transport())  # relay / hosted submit: no claim
    assert session["client_locale"] == "ja"
    remember_session_client_locale(session, None)
    assert session["client_locale"] == "ja"


def test_session_runtime_scope_binds_the_sessions_client_language():
    with server._session_profile_runtime_scope({"profile_home": None, "client_locale": "zh"}, hydrate_secrets=False):
        assert i18n.t(KEY) == i18n.t(KEY, lang="zh")
    assert i18n.t(KEY) == i18n.t(KEY, lang="en")
    with server._session_profile_runtime_scope({"profile_home": None}, hydrate_secrets=False):
        assert i18n.t(KEY) == i18n.t(KEY, lang="en")


def test_slotted_transports_can_carry_a_claim_and_doubles_that_cannot_are_tolerated():
    stdio = StdioTransport(lambda: None, threading.Lock())
    assert remember_client_locale(stdio, "de") == "de"
    assert client_locale(stdio) == "de"
    tee = TeeTransport(stdio)
    assert remember_client_locale(tee, "fr") == "fr"
    assert client_locale(tee) == "fr"
    opaque = object()  # not weak-referenceable
    assert remember_client_locale(opaque, "de") == ""
    assert client_locale(opaque) == ""


def test_claim_dies_with_its_connection(localized_method):
    transport = _Transport()
    token = bind_transport(transport)
    try:
        assert server.handle_request({"id": 1, "method": "i18n.client_locale", "params": {"lang": "zh"}})["result"]["lang"] == "zh"
    finally:
        reset_transport(token)
    assert client_locale(transport) == "zh"
    alive = weakref.ref(transport)
    del transport
    gc.collect()
    assert alive() is None  # the claim table holds no strong reference: the connection can go
