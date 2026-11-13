"""Classic CLI / TUI ``/debug`` without ``upload``: the "nothing was uploaded" hint reads in the
profile's language and names the consent command for the chosen destination, while nothing
leaves the machine (#94876)."""

from unittest.mock import patch

import pytest


@pytest.mark.parametrize("lang", ["en", "zh", "zh-hant"])
@pytest.mark.parametrize(("cmd", "consent"), [("/debug", "/debug upload"),
                                              ("/debug nous", "/debug nous upload")])
def test_bare_debug_hint_reads_in_the_profile_language(capsys, monkeypatch, lang, cmd, consent):
    from agent import i18n
    from hermes_cli.debug import run_debug_slash

    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    i18n.reset_language_cache()
    try:
        with patch("hermes_cli.debug.upload_to_pastebin") as paste, \
             patch("hermes_cli.diagnostics_upload.share_to_nous") as nous, \
             patch("hermes_cli.debug.collect_share_bundle") as collect:
            run_debug_slash(cmd)
        hint = i18n.t("cli.commands.debug.nothing_uploaded", command=consent)
    finally:
        i18n.reset_language_cache()

    paste.assert_not_called()
    nous.assert_not_called()
    collect.assert_not_called()
    output = capsys.readouterr().out
    assert hint in output
    assert f"`{consent}`" in hint and "`/debug local`" in hint
    assert ("Nothing was uploaded" in output) is (lang == "en")
