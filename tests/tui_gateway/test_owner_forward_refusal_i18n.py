"""The 4090 refusals of a prompt whose gateway owner is running a turn (``_submit_to_ledger_owner`` +
``owner_forward``) are rendered in the connected client's language: the composed "busy" sentence with
its why-clause, whether the sink or ``owner_forward`` names the reason, and the standalone
"unconfirmed" notice. English stays the former literal text, which the forward tests still pin."""
from __future__ import annotations

import threading
from types import SimpleNamespace

import pytest

from agent import i18n
from tui_gateway import owner_forward, server


def _session(**extra):
    return {"history_lock": threading.Lock(), "attached_images": [], "session_key": "k", **extra}


_REFUSAL = SimpleNamespace(reason="SESSION_NOT_OWNED", ledger_status="owned")


@pytest.mark.parametrize("lang", ["en", "zh"])
def test_a_reason_named_by_the_sink_composes_the_busy_sentence_in_the_clients_language(monkeypatch, lang):
    monkeypatch.setattr(owner_forward, "forwardable", lambda *_: False)
    token = i18n.bind_client_language(lang)
    try:
        reply = server._submit_to_ledger_owner("rid", "sid", _session(), "hi", {}, _REFUSAL)
    finally:
        i18n.reset_client_language(token)
    why = i18n.t("tui_gateway.prompt.owner_busy_reason.rewind_or_attachment", lang=lang)
    assert reply["error"]["message"] == i18n.t("tui_gateway.prompt.owner_busy", lang=lang, why=why)
    assert reply["error"]["code"] == 4090 and reply["error"]["data"] == {"reason": "SESSION_OWNER_BUSY"}
    if lang == "en":
        assert reply["error"]["message"] == ("The gateway is running a turn in this chat and a rewind or attachment"
                                             " cannot join its queue. Nothing was sent. Send it again when the current turn ends.")


@pytest.mark.parametrize("lang", ["en", "zh"])
def test_a_reason_raised_by_owner_forward_is_rendered_in_the_clients_language(monkeypatch, lang):
    monkeypatch.setattr(owner_forward, "forwardable", lambda *_: True)
    token = i18n.bind_client_language(lang)
    try:  # no stored session key: ``forward_prompt`` itself refuses, before any relay thread
        reply = server._submit_to_ledger_owner("rid", "sid", _session(session_key=""), "hi", {}, _REFUSAL)
    finally:
        i18n.reset_client_language(token)
    why = i18n.t("tui_gateway.prompt.owner_unavailable.no_stored_session", lang=lang)
    assert why != "tui_gateway.prompt.owner_unavailable.no_stored_session"
    assert reply["error"]["message"] == i18n.t("tui_gateway.prompt.owner_busy", lang=lang, why=why)
    assert reply["error"]["data"] == {"reason": "SESSION_OWNER_BUSY"}


@pytest.mark.parametrize("lang", ["en", "zh"])
def test_an_unconfirmed_forward_keeps_its_own_notice_in_the_clients_language(monkeypatch, lang):
    monkeypatch.setattr(owner_forward, "forwardable", lambda *_: True)

    def _unconfirmed(*_a, **_k):
        raise owner_forward.OwnerUnconfirmed("the gateway did not confirm it in time")
    monkeypatch.setattr(owner_forward, "forward_prompt", _unconfirmed)
    token = i18n.bind_client_language(lang)
    try:
        reply = server._submit_to_ledger_owner("rid", "sid", _session(), "hi", {}, _REFUSAL)
    finally:
        i18n.reset_client_language(token)
    assert reply["error"]["message"] == i18n.t("tui_gateway.prompt.owner_unconfirmed", lang=lang)
    assert reply["error"]["data"] == {"reason": "SESSION_OWNER_UNCONFIRMED"}
    assert ("Nothing was sent" not in reply["error"]["message"]) and ("未发送" not in reply["error"]["message"])


def test_every_owner_forward_key_is_translated():
    keys = ["tui_gateway.prompt.owner_busy", "tui_gateway.prompt.owner_unconfirmed",
            *(f"tui_gateway.prompt.owner_busy_reason.{k}" for k in ("rewind_or_attachment", "unsupported", "image_removed", "refused")),
            *(f"tui_gateway.prompt.owner_unavailable.{k}" for k in ("other_protocol", "not_admitted", "no_stored_session"))]
    for key in keys:
        en, zh = i18n.t(key, lang="en"), i18n.t(key, lang="zh")
        assert en != key and zh != key and zh != en, key
