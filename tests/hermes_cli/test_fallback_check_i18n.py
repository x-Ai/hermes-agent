"""``hermes fallback check`` renders its table chrome in the profile's language: column labels, the
ok/fail marks and the guidance lines come from ``cli.fallback_check``; columns stay aligned in terminal
cells (a CJK label counts double); the status column keeps the JSON ``status`` identifiers.
"""

from __future__ import annotations

import pytest
from prompt_toolkit.utils import get_cwidth

from agent import i18n
from hermes_cli import fallback_check
from hermes_cli.fallback_check import EntryCheck


@pytest.fixture(autouse=True)
def _fresh_language_cache():
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def _results() -> list[EntryCheck]:
    return [
        EntryCheck(provider="openrouter", model="m-1", configured=True, auth_ready=True),
        EntryCheck(provider="acme", model="m-2", configured=True, auth_ready=False, error_class="auth",
                   error="No usable credentials found for acme."),
    ]


def test_english_table_keeps_its_layout(monkeypatch, capsys):
    monkeypatch.setenv("HERMES_LANGUAGE", "en")
    fallback_check._print_table(_results(), live=False)
    lines = capsys.readouterr().out.splitlines()

    assert lines[1] == f"  {'#':<3}{'Provider / model':<44}{'Config':<8}{'Auth':<8}{'Live':<8}{'Latency':<10}Status"
    assert lines[2] == f"  {'1':<3}{'openrouter / m-1':<44}{'ok':<8}{'ok':<8}{'—':<8}{'—':<10}ready (static)"
    assert lines[3] == f"  {'2':<3}{'acme / m-2':<44}{'ok':<8}{'FAIL':<8}{'—':<8}{'—':<10}auth"
    assert "  Static check only (no inference request sent)." in lines[-2]


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_chinese_table_is_localized_and_aligned(monkeypatch, capsys, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    fallback_check._print_table(_results(), live=False)
    lines = capsys.readouterr().out.splitlines()
    header, first, second = lines[1], lines[2], lines[3]

    assert "Provider" not in header and "提供方 / 模型" in header
    assert first.endswith("ready (static)") and second.endswith("auth")  # JSON identifiers stay
    assert ("失败" if lang == "zh" else "失敗") in second
    # Every row's status column starts at the same terminal cell.
    status = i18n.t("cli.fallback_check.col_status", lang=lang)
    starts = {get_cwidth(header[:header.rindex(status)]),
              get_cwidth(first[:first.rindex("ready (static)")]),
              get_cwidth(second[:second.rindex("auth")])}
    assert len(starts) == 1
    assert lines[-2].strip() == i18n.t("cli.fallback_check.static_only", lang=lang)
    assert "--live" in lines[-2]


def test_no_chain_message_is_localized(monkeypatch, capsys):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    monkeypatch.setattr("hermes_cli.config.load_config_readonly", dict)
    monkeypatch.setattr("hermes_cli.fallback_config.get_fallback_chain", lambda cfg: [])
    monkeypatch.setattr("hermes_cli.profiles.get_active_profile_name", lambda: "default")

    class Args:
        live = False
        json = False

    fallback_check.cmd_fallback_check(Args())
    out = capsys.readouterr().out
    assert "尚未配置备用提供方" in out and "hermes fallback add" in out
