"""The TUI's previous-build fallback (#150031) speaks the profile's language: the notice, its cause
and the Enter-wait prompt resolve through the i18n catalog at call time."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from agent import i18n
from hermes_cli import main_tui_launch, source_build


@pytest.fixture
def language(monkeypatch):
    def use(lang: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", lang)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


@pytest.fixture
def failed_preparation(tmp_path, monkeypatch):
    """A checkout TUI whose dependency install failed, with its previous bundle still on disk."""
    tui_dir = tmp_path / "ui-tui"
    (tui_dir / "dist").mkdir(parents=True)
    (tui_dir / "dist/entry.js").write_text("console.log('tui')", encoding="utf-8")
    monkeypatch.delenv("HERMES_TUI_DIR", raising=False)
    monkeypatch.delenv("HERMES_TUI_FORCE_BUILD", raising=False)
    monkeypatch.setattr(main_tui_launch, "_find_bundled_tui", lambda: None)
    monkeypatch.setattr(main_tui_launch, "_ensure_tui_workspace", lambda _tui_dir: None)
    monkeypatch.setattr(main_tui_launch, "_tui_need_rebuild", lambda _tui_dir: True)
    monkeypatch.setattr(main_tui_launch, "_tui_node_bin", lambda _bin: "node")

    def install_failed():
        raise subprocess.CalledProcessError(1, ["pnpm", "install"])

    monkeypatch.setattr(source_build, "source_build_env", install_failed)
    return tui_dir


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_fallback_notice_and_cause_follow_the_language(failed_preparation, language, capsys, lang):
    language(lang)
    notices: list[str] = []
    argv, cwd = main_tui_launch._make_tui_argv(failed_preparation, tui_dev=False, notices=notices)
    assert argv[-1] == str(failed_preparation / "dist/entry.js")
    assert cwd == failed_preparation
    notice = i18n.t("cli.tui_launch.fallback_notice", lang=lang)
    assert notice != i18n.t("cli.tui_launch.fallback_notice", lang="en")
    assert "`hermes update`" in notice and "`hermes --cli`" in notice  # commands stay literal
    assert notices == [notice]  # shown again after the TUI exits, in the same language
    err = capsys.readouterr().err
    assert notice in err
    assert i18n.t("cli.tui_launch.fallback_cause_above", lang=lang) in err
    assert "previous TUI build was started" not in err


def test_fallback_notice_stays_english_by_default(failed_preparation, language, capsys):
    language("en")
    notices: list[str] = []
    main_tui_launch._make_tui_argv(failed_preparation, tui_dev=False, notices=notices)
    err = capsys.readouterr().err
    assert "previous TUI build was started" in err and "(The error is above.)" in err
    assert len(notices) == 1 and "hermes update" in notices[0]


@pytest.mark.parametrize("lang", ["en", "zh", "zh-hant"])
def test_wait_prompt_follows_the_language(language, monkeypatch, lang):
    language(lang)
    prompts = []
    monkeypatch.setattr(main_tui_launch, "_someone_at_the_terminal", lambda: True)
    monkeypatch.setattr(main_tui_launch, "_wait_for_enter", lambda prompt, timeout: prompts.append((prompt, timeout)))
    monkeypatch.setattr(main_tui_launch.subprocess, "call", lambda argv, cwd=None, env=None: 0)
    assert main_tui_launch._run_tui(["node", "entry.js"], Path("."), {}, ["notice"]) == 0
    wait_s = main_tui_launch._NOTICE_WAIT_S
    expected = i18n.t("cli.tui_launch.fallback_wait_prompt", lang=lang, seconds=wait_s)
    assert prompts == [(f"  {expected} ", wait_s)]
    assert str(wait_s) in expected
    assert ("Press Enter" in expected) == (lang == "en")
