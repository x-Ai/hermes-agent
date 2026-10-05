"""The approval layer's refusals read in the user's language.

Contract, not a copy snapshot: under ``zh`` every refusal resolves to the zh catalog (a real
translation, never the bare key or the English text), keeps the ``BLOCKED`` marker the context
compressor keys on, and still carries the runtime detail (pattern description, deny rule, saved
script path) it exists to report.
"""

import pytest

from agent import i18n
from tools import approval
from tools.approval_floors import _hardline_block_result, _sudo_stdin_block_result, _user_deny_block_result


@pytest.fixture
def chinese(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def _english(key: str, **kwargs) -> str:
    return i18n.t(key, lang="en", **kwargs)


def test_hardline_block_is_localized_and_keeps_its_marker_and_description(chinese):
    description = "recursive/any delete of the Python interpreter this Hermes runtime is running from"
    result = _hardline_block_result(description)

    assert result["hardline"] is True and result["approved"] is False
    assert result["message"].startswith("BLOCKED")
    assert description in result["message"]
    assert result["message"] == i18n.t("approval.blocked.hardline", lang="zh", description=description)
    assert result["message"] != _english("approval.blocked.hardline", description=description)
    assert "approval.blocked" not in result["message"]


def test_user_deny_and_sudo_floors_are_localized(chinese):
    deny = _user_deny_block_result("rm -rf *")
    sudo = _sudo_stdin_block_result("piping a password into sudo -S")

    assert deny["user_deny"] is True and "rm -rf *" in deny["message"]
    assert deny["message"].startswith("BLOCKED") and "approvals.deny" in deny["message"]
    assert deny["message"] != _english("approval.blocked.user_deny", pattern="rm -rf *")
    assert sudo["message"].startswith("BLOCKED") and "piping a password into sudo -S" in sudo["message"]
    assert sudo["message"] != _english("approval.blocked.sudo_stdin", description="piping a password into sudo -S")


def test_gate_outcomes_and_unattended_contexts_are_localized(chinese):
    denied = approval._COMMAND_GATE.message("cli_denied", description="", breaker="")
    timeout = approval._EXECUTE_CODE_GATE.message("cli_timeout", description="", breaker="")
    cron = approval._CRON_CTX.block_message(
        i18n.t("approval.blocked.flagged_subject", description="recursive delete"),
        noun=i18n.t("approval.blocked.noun_dangerous_commands"), advice=i18n.t("approval.blocked.advice_command"))

    for message in (denied, timeout, cron):
        assert message.startswith("BLOCKED")
        assert "approval.blocked" not in message
    assert "User denied" not in denied and "NOT consented" not in denied
    assert "approvals.cron_mode: approve" in cron and "recursive delete" in cron
    # The breaker addendum is still read only where the English template shows it.
    assert approval._COMMAND_GATE.shows_breaker("cli_denied") is True
    assert approval._ACTION_GATE.shows_breaker("cli_denied") is False


def test_english_stays_the_default_and_matches_the_catalog(monkeypatch):
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    monkeypatch.setattr(i18n, "_config_language", lambda: None)
    try:
        result = _hardline_block_result("fork bomb")
        assert result["message"] == _english("approval.blocked.hardline", description="fork bomb")
        assert result["message"].startswith("BLOCKED (hardline): fork bomb. This command is on the unconditional blocklist")
    finally:
        i18n.reset_language_cache()
