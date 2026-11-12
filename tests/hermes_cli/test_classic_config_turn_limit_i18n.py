"""The classic CLI's config panel names an unlimited turn budget in the profile's language."""

from datetime import datetime

import pytest


@pytest.mark.parametrize("lang", ["en", "zh", "zh-hant"])
def test_unlimited_turn_budget_reads_in_the_profile_language(capsys, monkeypatch, lang):
    from agent import i18n
    from cli import HermesCLI, _t
    from hermes_cli.config import resolve_turn_limit

    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    i18n.reset_language_cache()
    try:
        stand_in = HermesCLI.__new__(HermesCLI)
        stand_in.api_key, stand_in.agent = None, None
        stand_in.model, stand_in.base_url = "test/model", "local"
        stand_in.max_turns = resolve_turn_limit(None)
        stand_in.enabled_toolsets, stand_in.verbose = [], False
        stand_in.session_start = datetime(2026, 1, 1)
        HermesCLI.show_config(stand_in)
        output = capsys.readouterr().out
        turn_label = _t("cli.config.label_max_turns")
        word = _t("cli.config.value_unlimited")
    finally:
        i18n.reset_language_cache()

    row = next(line.strip() for line in output.splitlines()
               if line.strip().startswith(turn_label + " "))
    assert row.removeprefix(turn_label).strip() == word
    assert (word == "unlimited") is (lang == "en")
