"""Gateway ``plugins.manage install``: a refused install answers a structured ``reason`` the client acts
on (``exists`` offers Force, ``source_moved`` re-inspects), and a refusal without its own error text
reads in the user's language rather than as English prose."""

import pytest

from agent import i18n
from tui_gateway import server


@pytest.fixture
def chinese(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def _install_refused(monkeypatch, tmp_path, refusal: dict) -> dict:
    from hermes_cli import plugins_cmd

    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    monkeypatch.setattr(plugins_cmd, "dashboard_install_plugin", lambda *a, **kw: {"ok": False, **refusal})
    return server.handle_request({"id": "1", "method": "plugins.manage", "params": {
        "action": "install", "identifier": "https://example.invalid/acme/gizmo.git"}})["error"]


@pytest.mark.parametrize("refusal,reason", [
    ({"exists": True}, "exists"),
    ({"source_moved": True, "exists": True}, "source_moved"),
])
def test_refused_install_names_its_reason_in_the_users_language(monkeypatch, tmp_path, chinese, refusal, reason):
    error = _install_refused(monkeypatch, tmp_path, refusal)
    assert error["code"] == 5026
    assert error["data"] == {"reason": reason}
    assert error["message"] == i18n.t("tui_gateway.plugins.install_failed", lang="zh")
    assert error["message"] != i18n.t("tui_gateway.plugins.install_failed", lang="en")


def test_refusal_text_from_the_installer_is_kept(monkeypatch, tmp_path):
    error = _install_refused(monkeypatch, tmp_path, {"error": "Plugin 'gizmo' already exists.", "exists": True})
    assert (error["message"], error["data"]) == ("Plugin 'gizmo' already exists.", {"reason": "exists"})
