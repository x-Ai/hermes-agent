"""The page a browser gets for a SPA bundle that cannot be served speaks the host profile's display
language (the fork's i18n), while the reason keeps naming the build command verbatim and API clients
keep reading the English JSON reason."""
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from agent import i18n

BROWSER = {"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"}


@pytest.fixture(autouse=True)
def _fresh_language_cache():
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def _webapp(monkeypatch, dist: Path) -> TestClient:
    from hermes_cli import web_server as server
    from hermes_cli.web_server_dashboard import mount_spa

    app = FastAPI()
    app.state.ui_surface = "webapp"
    app.state.web_dist = dist
    monkeypatch.setattr(server, "app", app)
    monkeypatch.delenv("HERMES_SERVE_HEADLESS", raising=False)
    mount_spa(app)
    return TestClient(app)


@pytest.mark.parametrize("lang", ["en", "zh", "zh-hant"])
def test_the_page_follows_the_profile_language_and_keeps_the_command(monkeypatch, tmp_path, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    response = _webapp(monkeypatch, tmp_path).get("/", headers=BROWSER)

    assert response.status_code == 404
    assert f'<html lang="{lang}">' in response.text
    title = i18n.t("webapp.bundle_unavailable.title", lang=lang)
    assert f"<title>{title}</title>" in response.text and f"<h1>{title}</h1>" in response.text
    assert i18n.t("webapp.bundle_unavailable.ask_host", lang=lang) in response.text
    assert "hermes webapp" in response.text
    if lang != "en":
        assert "Hermes is unavailable" not in response.text
        assert "reload this page" not in response.text


def test_an_api_client_keeps_the_english_reason_under_a_localized_profile(monkeypatch, tmp_path):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    response = _webapp(monkeypatch, tmp_path).get("/", headers={"accept": "application/json"})

    assert response.status_code == 404
    assert response.json() == {"error": "The Webapp is not built. Run: hermes webapp"}
