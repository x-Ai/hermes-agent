"""A connected client's announced display language (``agent.i18n.bind_client_language``) decides
backend-authored copy ahead of the profile's ``HERMES_LANGUAGE`` / ``display.language``: the Desktop
infers its UI language from the OS without persisting it, so without the claim a Chinese window got
English error cards and failed-turn notices from the backend."""

from __future__ import annotations

import pytest

from agent import i18n

KEY = "core.failed_turn.notice"


@pytest.fixture
def profile_in_french(tmp_path, monkeypatch):
    home = tmp_path / "home"
    home.mkdir()
    (home / "config.yaml").write_text("display:\n  language: fr\n", encoding="utf-8")
    monkeypatch.setenv("HERMES_HOME", str(home))
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    yield home
    i18n.reset_language_cache()


def test_client_claim_beats_the_profiles_config_language(profile_in_french):
    assert i18n.get_language() == "fr"
    token = i18n.bind_client_language("zh")
    try:
        assert i18n.get_language() == "zh"
        assert i18n.t(KEY) == i18n.t(KEY, lang="zh")
    finally:
        i18n.reset_client_language(token)
    assert i18n.get_language() == "fr"  # the claim is scoped, never sticky


def test_client_claim_beats_hermes_language_env(profile_in_french, monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "de")
    token = i18n.bind_client_language("ja")
    try:
        assert i18n.get_language() == "ja"
    finally:
        i18n.reset_client_language(token)
    assert i18n.get_language() == "de"


def test_explicit_lang_still_wins_over_the_claim(profile_in_french):
    token = i18n.bind_client_language("zh")
    try:
        assert i18n.t(KEY, lang="en") == i18n.t(KEY, lang="en")
        assert i18n.t(KEY, lang="de") != i18n.t(KEY, lang="zh")
    finally:
        i18n.reset_client_language(token)


@pytest.mark.parametrize("claim", ["", None, "xx-not-a-language"])
def test_an_empty_or_unknown_claim_leaves_the_profile_language_in_charge(profile_in_french, claim):
    token = i18n.bind_client_language(claim)
    try:
        assert i18n.get_language() == "fr"
    finally:
        i18n.reset_client_language(token)


def test_claim_accepts_aliases_and_regional_tags(profile_in_french):
    token = i18n.bind_client_language("zh_TW")
    try:
        assert i18n.get_language() == "zh-hant"
    finally:
        i18n.reset_client_language(token)
