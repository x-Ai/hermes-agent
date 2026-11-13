"""``hermes whatsapp``'s open-bot warning reads in the profile's language and keeps its docs link."""

from __future__ import annotations

import io
import os
from contextlib import redirect_stdout
from pathlib import Path
from types import SimpleNamespace

import pytest

_DOCS_ANCHOR = "whatsapp/#customer-facing-bot"


@pytest.fixture
def open_bot_home(tmp_path, monkeypatch):
    hermes = tmp_path / "home" / ".hermes"
    hermes.mkdir(parents=True)
    monkeypatch.setattr(Path, "home", lambda: tmp_path / "home")
    monkeypatch.setenv("HERMES_HOME", str(hermes))
    for key in list(os.environ):
        if key.startswith("WHATSAPP_"):
            monkeypatch.delenv(key, raising=False)
    monkeypatch.setenv("WHATSAPP_MODE", "bot")
    monkeypatch.setenv("WHATSAPP_ALLOWED_USERS", "*")
    monkeypatch.setattr("builtins.input", lambda _prompt="": "n")
    monkeypatch.setattr("hermes_cli.main._require_tty", lambda *_a, **_kw: None)
    # Stop right after the access-control step: no bridge script on disk.
    monkeypatch.setattr("gateway.platforms.whatsapp_common.resolve_whatsapp_bridge_dir", lambda: tmp_path / "nobridge")
    return hermes


@pytest.mark.parametrize("lang, phrase", [
    ("en", "This bot answers anyone and has no home channel"),
    ("zh", "此机器人会回复任何人，且尚未设置主频道"),
    ("zh-hant", "這個機器人會回覆任何人，且尚未設定主頻道"),
])
def test_open_bot_warning_reads_in_the_profile_language(open_bot_home, monkeypatch, lang, phrase):
    from agent import i18n
    from hermes_cli.main_platform_setup import cmd_whatsapp

    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    i18n.reset_language_cache()
    buf = io.StringIO()
    try:
        with redirect_stdout(buf):
            cmd_whatsapp(SimpleNamespace())
    finally:
        i18n.reset_language_cache()
    out = buf.getvalue()
    warning = next(line for line in out.splitlines() if "⚠" in line and phrase in line)
    assert warning.startswith("  ⚠ ")
    assert ("This bot answers anyone" in out) is (lang == "en")
    # The docs link is a URL, never translated, and printed exactly once on the next line.
    assert out.count(_DOCS_ANCHOR) == 1
    lines = out.splitlines()
    assert _DOCS_ANCHOR in lines[lines.index(warning) + 1]
