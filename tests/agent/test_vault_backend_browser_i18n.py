"""The real-profile browser login source names itself in the reader's language, never the model's.

``display_name`` of the ``browser:`` source is read by people only: ``hermes vault list`` prints it
under the profile's language, and inside an RPC the connected client's claim decides. The source
never locks, so no lock hint carries the name into an agent tool result, which stays language-neutral.
The detected browser's brand name is filled in untranslated.
"""

from __future__ import annotations

import json
import sqlite3
from unittest.mock import patch

import pytest

from agent import i18n
from agent.vault_backends import enabled_backends

KEY = "vault.browser_profile_source"


@pytest.fixture
def chrome_profile(tmp_path, monkeypatch):
    """Scratch HERMES_HOME (no language configured), a seeded snapshot for Chrome, consent on, and no
    password-manager CLI in play whatever the host has installed."""
    home = tmp_path / ".hermes"
    monkeypatch.setenv("HERMES_HOME", str(home))
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    copy_dir = home / "browser-profile" / "chrome"
    (copy_dir / "Default").mkdir(parents=True)
    con = sqlite3.connect(copy_dir / "Default" / "Login Data")
    con.execute("CREATE TABLE logins (origin_url TEXT, username_value TEXT, password_value BLOB, "
                "blacklisted_by_user INTEGER DEFAULT 0)")
    con.execute("INSERT INTO logins VALUES ('https://example.com/login', 'jane@example.com', x'00', 0)")
    con.commit()
    con.close()
    i18n.reset_language_cache()
    with patch("hermes_cli.browser_connect.detect_default_chromium", return_value="chrome"), \
         patch("hermes_cli.browser_connect.real_profile_copy_dir", return_value=str(copy_dir)), \
         patch("agent.vault_backends.base._browser_profile_enabled", return_value=True), \
         patch("agent.vault_backends.base.external_backend_classes", return_value=()):
        yield home
    i18n.reset_language_cache()


def _browser_source():
    return next(b for b in enabled_backends() if b.name == "browser")


def test_with_no_language_set_the_name_is_english(chrome_profile):
    assert _browser_source().display_name == i18n.t(KEY, lang="en", browser="Chrome")


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_a_client_claim_names_the_source_in_its_language(chrome_profile, lang):
    token = i18n.bind_client_language(lang)
    try:
        name = _browser_source().display_name
    finally:
        i18n.reset_client_language(token)
    assert name == i18n.t(KEY, lang=lang, browser="Chrome")
    assert name != i18n.t(KEY, lang="en", browser="Chrome")
    assert name.endswith("Chrome") and "{browser}" not in name


def test_the_profile_language_names_the_source_for_the_cli(chrome_profile):
    (chrome_profile / "config.yaml").write_text("display:\n  language: zh-hant\n", encoding="utf-8")
    i18n.reset_language_cache()
    name = _browser_source().display_name
    assert name == i18n.t(KEY, lang="zh-hant", browser="Chrome")
    assert name != i18n.t(KEY, lang="en", browser="Chrome")


def test_the_agents_listing_stays_language_neutral(chrome_profile):
    from tools.browser_vault_tool import browser_vault_list

    token = i18n.bind_client_language("zh")
    try:
        out = browser_vault_list()
    finally:
        i18n.reset_client_language(token)
    listed = json.loads(out)
    assert [item["backend"] for item in listed["items"]] == ["browser"]
    assert "locked" not in listed
    assert i18n.t(KEY, lang="zh", browser="Chrome") not in out
