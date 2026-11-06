"""The low-disk auto-prune notice a TUI/Desktop session gets is worded in that session's language.

``_maybe_notify_auto_prune`` runs on the deferred-build Timer and then a worker thread, and neither
carries the RPC's context: no profile scope, no client claim. Rendered there unscoped, the notice
(``prune_advisor.notice_payload`` → ``t()``) took the LAUNCH profile's language, so a session of a
secondary profile set to German was asked in English, and so was a client that announced its own
language over ``i18n.client_locale``.
"""

from __future__ import annotations

import shutil
from collections import namedtuple

import pytest

from agent import i18n
from hermes_cli import prune_advisor
from hermes_state import SessionDB
from tests.waiting import wait_until
from tui_gateway import server
from tui_gateway.client_locale import remember_client_locale

_Usage = namedtuple("_Usage", "total used free")


class _Transport:
    def write(self, obj):
        return True

    def close(self):
        pass


def _profile_home(path, language: str):
    path.mkdir()
    (path / "config.yaml").write_text(f"display:\n  language: {language}\n", encoding="utf-8")
    SessionDB(db_path=path / "state.db").close()
    return path


@pytest.fixture
def notices(tmp_path, monkeypatch):
    """English launch profile; disk low for every home; ``notification.show`` payloads captured."""
    monkeypatch.setenv("HERMES_HOME", str(_profile_home(tmp_path / "launch", "en")))
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    gib = prune_advisor.GIB
    monkeypatch.setattr(shutil, "disk_usage", lambda _p: _Usage(100 * gib, 99 * gib, gib))
    shown: list[dict] = []
    monkeypatch.setattr(server, "_emit", lambda event, sid, payload=None: (
        shown.append(payload) if event == "notification.show" else None) or True)
    server._AUTO_PRUNE_NOTIFIED.clear()
    i18n.reset_language_cache()
    yield shown
    server._AUTO_PRUNE_NOTIFIED.clear()
    i18n.reset_language_cache()


def _notice_text(lang: str) -> str:
    free = i18n.t("shared.autoprune.size_gb", lang=lang, size="1.0")
    return f"⚠ {i18n.t('shared.autoprune.notice', lang=lang, free=free)} · /autoprune on|off|later"


def _session_notice(notices, session: dict) -> str:
    """What a session gets once its deferred build is scheduled (session.create / cold resume)."""
    sid = "auto-prune-notice"
    notices.clear()
    server._AUTO_PRUNE_NOTIFIED.clear()
    server._sessions[sid] = session
    try:
        server._schedule_agent_build(sid, delay=0)
        return wait_until(lambda: notices, timeout=30, what="the auto-prune notice")[0]["text"]
    finally:
        server._sessions.pop(sid, None)


def test_notice_follows_the_sessions_profile_and_client_not_the_launch_profile(notices, tmp_path):
    secondary = _profile_home(tmp_path / "secondary", "de")
    assert _notice_text("de") != _notice_text("en")

    transport = _Transport()
    session = {"profile_home": str(secondary), "transport": transport}
    assert _session_notice(notices, session) == _notice_text("de")

    remember_client_locale(transport, "ja")  # the window renders Japanese whatever the profile says
    assert _session_notice(notices, session) == _notice_text("ja")
