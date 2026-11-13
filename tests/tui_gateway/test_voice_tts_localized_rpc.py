"""``voice.tts`` keeps its refusal in the client's language while the speaker runs on a context thread.

The fork renders the missing-voice-module refusal through ``_t`` in the language the connection
announced (``i18n.client_locale``); upstream made the handler profile-scoped and moved the speaker
hops onto ``spawn_context_thread`` so the caller's context follows them. Both hold at once: the
refusal is localized, and the speaker thread still sees the connection's language.
"""

import sys
import threading

import pytest

from agent import i18n
from tui_gateway.client_locale import remember_client_locale
from tui_gateway.transport import bind_transport, reset_transport


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


def _call_on_connection(lang, params):
    from tui_gateway import server
    transport = _Transport()
    remember_client_locale(transport, lang)
    token = bind_transport(transport)
    try:
        return server._methods["voice.tts"]("rid", params)
    finally:
        reset_transport(token)


@pytest.mark.parametrize(("lang", "message"), [("zh", "语音模块不可用"), ("zh-hant", "語音模組無法使用")])
def test_missing_voice_module_refusal_is_in_the_connections_language(monkeypatch, lang, message):
    monkeypatch.setitem(sys.modules, "hermes_cli.voice", None)  # ``import hermes_cli.voice`` -> ImportError
    resp = _call_on_connection(lang, {"text": "hi"})
    assert resp["error"] == {"code": 5026, "message": message}


def test_missing_voice_module_refusal_stays_english_without_a_claim(monkeypatch):
    monkeypatch.setitem(sys.modules, "hermes_cli.voice", None)
    resp = _call_on_connection("", {"text": "hi"})
    assert resp["error"] == {"code": 5026, "message": "voice module not available"}


def test_speaker_thread_keeps_the_connections_language(monkeypatch):
    from hermes_cli import voice
    from tui_gateway import server
    monkeypatch.setattr(server, "_arm_barge_listener_if_enabled", lambda: None)
    seen, done = {}, threading.Event()

    def speak_text(text, stop_event=None):
        seen["lang"] = i18n.get_language()
        done.set()
    monkeypatch.setattr(voice, "speak_text", speak_text)
    resp = _call_on_connection("zh-hant", {"text": "hi"})
    assert resp["result"]["status"] == "speaking"
    assert done.wait(10)
    assert seen["lang"] == "zh-hant"
