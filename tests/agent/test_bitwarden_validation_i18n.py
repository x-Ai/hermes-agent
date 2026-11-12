"""The Bitwarden endpoint / project refusals (agent/secret_sources/bitwarden.py) and the setup line
naming an ignored stored server_url speak the profile's display language (the fork's i18n). The
refused value, config keys, env names and the setup command stay verbatim, and English keeps the
upstream wording the endpoint tests match on."""
from __future__ import annotations

import argparse
import io

import pytest
from rich.console import Console

from agent import i18n
from agent.secret_sources import bitwarden as bw


@pytest.fixture(autouse=True)
def _fresh_language_cache(monkeypatch):
    monkeypatch.delenv("BWS_SERVER_URL", raising=False)
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_plaintext_server_url_refusal_follows_the_profile_language(monkeypatch, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)

    with pytest.raises(ValueError) as excinfo:
        bw.validate_server_url("http://attacker.example")

    message = str(excinfo.value)
    assert message == i18n.t("secret_sources.bitwarden.server_url_plaintext", lang=lang,
                             value="'http://attacker.example'")
    assert message.startswith("secrets.bitwarden.server_url 'http://attacker.example' ")
    assert "localhost" in message and "plaintext" not in message


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_a_refused_fetch_carries_the_localized_reason(monkeypatch, tmp_path, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)

    with pytest.raises(bw.BitwardenConfigError) as excinfo:
        bw.fetch_bitwarden_secrets(access_token="0.token", project_id="not-a-uuid", home_path=tmp_path)

    message = str(excinfo.value)
    assert message == i18n.t("secret_sources.bitwarden.project_id_not_uuid", lang=lang, value="'not-a-uuid'")
    assert "`hermes secrets bitwarden setup`" in message and "is not a project UUID" not in message


def test_a_dropped_endpoint_warning_wraps_the_localized_reason(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    env = {"BWS_SERVER_URL": "ftp://vault.example.com"}

    warning = bw.apply_server_url_to_env(env, "")

    reason = i18n.t("secret_sources.bitwarden.server_url_not_https", lang="zh", value="'ftp://vault.example.com'")
    assert warning == i18n.t("secret_sources.bitwarden.env_url_dropped", lang="zh", error=reason)
    assert "BWS_SERVER_URL" in warning and "Ignoring" not in warning
    assert "BWS_SERVER_URL" not in env


def test_english_keeps_the_upstream_wording(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "en")

    with pytest.raises(ValueError, match=r"^secrets\.bitwarden\.project_id 'not-a-uuid' is not a project UUID "):
        bw.validate_project_id("not-a-uuid")
    assert bw.apply_server_url_to_env({}, "ftp://vault.example.com") == (
        "Ignoring the configured Bitwarden server_url: secrets.bitwarden.server_url "
        "'ftp://vault.example.com' must be an https:// URL.  Falling back to the bws default (US Cloud).")


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_setup_names_the_ignored_stored_url_in_the_profile_language(monkeypatch, lang):
    from hermes_cli import secrets_cli as bw_cli

    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    console = Console(file=io.StringIO(), record=True, width=300)
    replies = iter(["", "2"])  # Enter must not keep the refused stored value; 2 = EU Cloud
    console.input = lambda *_a, **_kw: next(replies)

    result = bw_cli._resolve_server_url(argparse.Namespace(server_url=None),
                                        {"server_url": "http://attacker.example"}, console)

    assert result == "https://vault.bitwarden.eu"
    def _flat(text: str) -> str:  # the console may wrap a long line
        return " ".join(text.split())

    out = console.export_text(styles=False)
    reason = i18n.t("secret_sources.bitwarden.server_url_plaintext", lang=lang, value="'http://attacker.example'")
    assert _flat(i18n.t("secret_sources.bitwarden.stored_url_ignored", lang=lang, error=reason)) in _flat(out)
    assert "Ignoring stored server_url" not in out
