"""The low-disk auto-prune prompt and the /autoprune replies render from the catalogs in the user's language.

Contract: every line ``hermes_cli/prune_advisor.py`` shows (the prompt every surface prints, the
TUI/Desktop status-line notice, the ``/autoprune`` replies of every surface and the classic-CLI
question) resolves ``shared.autoprune.*`` per call in the active language, while the English
renderings stay byte-identical to the former literals, which the prompt tests still grep.
"""

from __future__ import annotations

import shutil
from collections import namedtuple

import pytest

from agent import i18n
from hermes_cli import prune_advisor
from hermes_cli.prune_advisor import GIB, Advice, DiskSnapshot, advice_lines, notice_payload, run_command

_Usage = namedtuple("_Usage", "total used free")
MIB = 1024 ** 2

# 1.5 GB free of 100 GB beside a 5 GB store; one Advice per variant of the prompt's verdict line.
_SNAP = DiskSnapshot(db_bytes=5 * GIB, free_bytes=3 * GIB // 2, total_bytes=100 * GIB)
HELPS = Advice(_SNAP, 90, prunable_sessions=3, total_sessions=12, reclaim_bytes=2 * GIB)
TOO_SMALL = Advice(_SNAP, 90, prunable_sessions=1, total_sessions=12, reclaim_bytes=26 * MIB)
NONE_OLD_ENOUGH = Advice(_SNAP, 30, prunable_sessions=0, total_sessions=1, reclaim_bytes=0)
NO_HISTORY = Advice(_SNAP, 90, prunable_sessions=0, total_sessions=0, reclaim_bytes=0)
UNREADABLE = Advice(_SNAP, 90, prunable_sessions=0, total_sessions=0, reclaim_bytes=0, estimate_ok=False)

COMMANDS_EN = ("/autoprune on to enable, /autoprune off to keep everything (never asked again), "
               "/autoprune later to be reminded in a week.")
HELPS_EN = [
    "Low disk space: 1.5 GB free of 100.0 GB. Your session history (state.db) uses 5.0 GB.",
    "Auto-prune is off. Turning it on deletes ended sessions inactive for more than 90 days, once a day "
    "(pinned and open sessions are kept).",
    "Pruning would remove about 2.0 GB of history (3 of 12 sessions).",
    "Deleted history frees space inside state.db; to give it back to the disk, run "
    "`hermes sessions optimize` with other Hermes windows closed.",
    COMMANDS_EN,
]
STATUS_TAIL_EN = "state.db 26 MB; 1.0 GB free of 100.0 GB (low). Usage: /autoprune on | off | later"


@pytest.fixture
def home(tmp_path, monkeypatch):
    """A low disk (1 GB free of 100 GB) beside a 26 MB store, auto-prune undecided."""
    h = tmp_path / "home"
    h.mkdir()
    with open(h / "state.db", "wb") as db:  # sparse: only its size is read here
        db.truncate(26 * MIB)
    monkeypatch.setenv("HERMES_HOME", str(h))
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    monkeypatch.setattr(shutil, "disk_usage", lambda _p: _Usage(100 * GIB, 99 * GIB, GIB))
    i18n.reset_language_cache()
    yield h
    i18n.reset_language_cache()


def _cli_offer(home, answer: str) -> tuple[list[str], list[str]]:
    """One classic-CLI startup offer asked from a fresh stored estimate: (questions, printed lines)."""
    prune_advisor._snooze_path(home).unlink(missing_ok=True)
    prune_advisor._store_estimate(home, advice={"retention_days": 90, "prunable": 3, "total": 12,
                                                "db_bytes": 26 * MIB, "reclaim_bytes": 26 * MIB})
    asked: list[str] = []
    printed: list[str] = []
    prune_advisor.offer_interactive(cprint=printed.append, ask=lambda q: asked.append(q) or answer)
    return asked, printed


def test_english_copy_is_byte_identical_to_the_former_literals(home):
    assert advice_lines(HELPS) == HELPS_EN
    assert advice_lines(TOO_SMALL)[2] == ("Pruning would remove only about 26 MB of history (1 session), "
                                          "which will not fix this disk on its own.")
    assert advice_lines(NONE_OLD_ENOUGH)[1:] == [
        "Auto-prune is off. Turning it on deletes ended sessions inactive for more than 30 days, once a day "
        "(pinned and open sessions are kept).",
        "Pruning will not help right now: none of your 1 session is older than 30 days. "
        "Something else is filling this disk.",
        COMMANDS_EN]
    assert advice_lines(NO_HISTORY)[2] == ("Pruning will not help right now: there is no session history to delete. "
                                           "Something else is filling this disk.")
    assert advice_lines(UNREADABLE)[2:] == ["Could not read state.db to estimate how much pruning would free.",
                                            COMMANDS_EN]
    assert advice_lines(HELPS, command_prefix="!")[-1] == COMMANDS_EN.replace("/", "!")
    assert notice_payload(HELPS)["text"] == "⚠ Low disk (1.5 GB free) · /autoprune on|off|later"

    asked, printed = _cli_offer(home, "")
    assert asked == ["  Enable auto-prune? [y = enable / n = never prune, don't ask again / Enter = remind me later]: "]
    assert printed[-1] == "  Later. /autoprune on|off decides it any time."
    assert run_command("status", home) == f"Auto-prune is off (default), retention 90 days. {STATUS_TAIL_EN}"
    assert run_command("later", home) == "OK, I'll ask again in a week if the disk is still low."
    _asked, printed = _cli_offer(home, "n")
    assert printed[-1] == "  ✓ sessions.auto_prune: false. You won't be asked again."
    assert run_command("status", home) == f"Auto-prune is off (your setting), retention 90 days. {STATUS_TAIL_EN}"
    assert run_command("on", home) == ("Auto-prune is on: ended sessions inactive past retention_days are deleted "
                                       "once a day.")
    assert run_command("off", home) == ("Auto-prune is off and you will not be asked again. "
                                        "`hermes sessions prune` still works any time.")


def zh(key: str, **fmt) -> str:
    return i18n.t(f"shared.autoprune.{key}", lang="zh", **fmt)


def test_prompt_notice_replies_and_cli_question_follow_the_users_language(home):
    (home / "config.yaml").write_text("display:\n  language: zh\n", encoding="utf-8")
    i18n.reset_language_cache()

    def gb(size: str) -> str:
        return zh("size_gb", size=size)

    lines = advice_lines(HELPS)
    assert lines == [zh("low_disk", free=gb("1.5"), total=gb("100.0"), db=gb("5.0")),
                     zh("off_explainer", days=90),
                     zh("reclaim_other", size=gb("2.0"), prunable=3, count=12),
                     zh("optimize_hint"),
                     zh("commands", on="/autoprune on", off="/autoprune off", later="/autoprune later")]
    assert all(mine != english for mine, english in zip(lines, HELPS_EN, strict=True))
    assert advice_lines(TOO_SMALL)[2] == zh("too_small_one", size=zh("size_mb", size="26"), count=1)
    assert advice_lines(NONE_OLD_ENOUGH)[2] == zh("none_old_enough_one", count=1, days=30)
    assert advice_lines(NO_HISTORY)[2] == zh("no_history")
    assert advice_lines(UNREADABLE)[2] == zh("estimate_unavailable")
    assert advice_lines(HELPS, command_prefix="!")[-1] == zh(
        "commands", on="!autoprune on", off="!autoprune off", later="!autoprune later")
    assert notice_payload(HELPS)["text"] == f"⚠ {zh('notice', free=gb('1.5'))} · /autoprune on|off|later"

    asked, printed = _cli_offer(home, "")
    assert asked == [f"  {zh('ask')}: "]
    assert printed[-1] == f"  {zh('later', command='/autoprune on|off')}"
    disk = zh("status_disk_low", db=zh("size_mb", size="26"), free=gb("1.0"), total=gb("100.0"))
    assert run_command("status", home) == " ".join(
        [zh("status_off", source=zh("source_default"), days=90), disk, zh("usage")])
    assert run_command("later", home) == zh("snoozed")
    _asked, printed = _cli_offer(home, "n")
    assert printed[-1] == f"  ✓ {zh('answered_off', setting='sessions.auto_prune: false')}"
    assert run_command("status", home) == " ".join(
        [zh("status_off", source=zh("source_user"), days=90), disk, zh("usage")])
    assert run_command("on", home) == zh("enabled")
    assert run_command("off", home) == zh("disabled")
