"""Default-plugin install notices (``hermes update``'s tail) render in the user's language.

The notices come from the ``cli.default_plugins`` catalog keys with the plugin name, the profile the
notice is about and the installer's cause interpolated. Real catalog parser and temp homes; the network
install is a stand-in.
"""

from __future__ import annotations

import pytest

import hermes_cli.left_core_migration as lcm
from agent.i18n import bind_client_language, reset_client_language, t
from hermes_cli import default_plugins
from hermes_cli.memory_provider_migration import _home_label
from hermes_cli.plugin_catalog import entry_from_mapping

_CAUSE = "unable to access the repository"


def _entry(name: str):
    return entry_from_mapping({"name": name, "repo": "https://github.com/NousResearch/hermes-official-plugins",
                               "sha": "a" * 40, "description": "d", "maintainer": "NousResearch",
                               "tier": "official", "default": True}, name)


@pytest.fixture
def notices(monkeypatch, tmp_path):
    """Run one install pass (``accent-picker`` installs, ``broken`` fails) for profile ``work`` in *lang*."""
    monkeypatch.delenv("HERMES_DISABLE_LAZY_INSTALLS", raising=False)  # the suite turns fetching off

    def install_into(home, consent=None):
        def install(name, discard=None):
            if name == "broken":
                return {"ok": False, "error": f"fatal: {_CAUSE}\n"}
            (home / "plugins" / name).mkdir(parents=True, exist_ok=True)
            return {"ok": True}
        return install
    monkeypatch.setattr(lcm, "_install_into", install_into)

    def run(lang: str) -> list[str]:
        home = tmp_path / lang / "profiles" / "work"
        home.mkdir(parents=True)
        lines: list[str] = []
        token = bind_client_language(lang)
        try:
            outcome = default_plugins.install_defaults(home, say=lines.append,
                                                       entries=[_entry("accent-picker"), _entry("broken")])
        finally:
            reset_client_language(token)
        assert outcome == {"installed": ["accent-picker"], "owed": ["broken"]}
        return lines
    return run


@pytest.mark.parametrize("lang", ["en", "zh", "zh-hant"])
def test_notices_render_the_catalog_copy_of_the_user_language(notices, lang):
    where = t("cli.default_plugins.profile", lang=lang, profile="work")
    assert notices(lang) == [
        "  " + t("cli.default_plugins.installed", lang=lang, plugin="accent-picker", home=where),
        "  " + t("cli.default_plugins.install_failed", lang=lang, plugin="broken", home=where, cause=_CAUSE),
    ]


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_a_chinese_user_reads_translated_notices_that_keep_every_value(notices, lang):
    installed, failed = notices(lang)
    english = notices("en")
    assert installed not in english and failed not in english
    assert "work" in installed and "accent-picker" in installed
    assert "work" in failed and _CAUSE in failed and "`hermes plugins install broken`" in failed


def test_english_names_a_home_the_way_the_other_update_notices_do(tmp_path):
    token = bind_client_language("en")
    try:
        for home in (tmp_path / "profiles" / "work", tmp_path / "standalone-home"):
            home.mkdir(parents=True)
            assert default_plugins._home_text(home) == _home_label(home)
    finally:
        reset_client_language(token)
