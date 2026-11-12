"""A failed turn on the inherited adapter path is reported in the profile's language.

Upstream (#38012) replaced the detailed ``type(e): str(e)`` reply with the generic gateway
failure copy, because exception text can carry provider credentials. The fork renders that
copy from its catalogs in the profile's ``display.language``: the localized notice must stay
the generic one, never regain the exception text, and keep the traceback in the log.
"""

from __future__ import annotations

import pytest

from agent import i18n
from gateway.session import build_session_key
from tests.gateway.test_baseexception_turn_notify import _event, _make_adapter, _raising_handler


@pytest.fixture
def profile_language(tmp_path, monkeypatch):
    def _configure(lang: str, suppressed: bool) -> None:
        monkeypatch.setenv("HERMES_HOME", str(tmp_path))
        monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
        (tmp_path / "config.yaml").write_text(
            f"display: {{language: {lang}, suppress_warning_notifications: {str(suppressed).lower()}}}\n",
            encoding="utf-8")
        i18n.reset_language_cache()

    yield _configure
    i18n.reset_language_cache()


@pytest.mark.asyncio
@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
@pytest.mark.parametrize("suppressed", [False, True])
async def test_turn_failure_notice_is_localized_and_leaks_no_exception_text(
        profile_language, caplog, lang, suppressed):
    profile_language(lang, suppressed)
    secret = "sk-proj-" + "Z9y8X7w6V5u4T3s2R1q0" * 2
    adapter = _make_adapter(_raising_handler(RuntimeError(f"Incorrect API key provided: {secret}")))
    event = _event()

    await adapter._process_message_background(event, build_session_key(event.source))

    key = "gateway.notify.turn_error" if suppressed else "gateway.errors.generic_failed"
    assert adapter.sent == [i18n.t(key, lang=lang)]
    assert adapter.sent[0] != i18n.t(key, lang="en")
    assert secret not in adapter.sent[0]
    assert "RuntimeError" not in adapter.sent[0] and "Incorrect API key" not in adapter.sent[0]
    assert "Incorrect API key provided" in caplog.text
