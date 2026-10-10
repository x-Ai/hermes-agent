"""The Desktop's memory-isolation switch over the profile RPCs: ``profiles.create`` can start a bot with an
empty, isolated memory, ``profiles.describe`` reports the flag and how many entries the bot still shares
with the default profile, and ``profiles.configure`` flips the flag through the two switch operations and
reports what they did (``memory_isolation``).
"""

from __future__ import annotations

from pathlib import Path

import pytest
import hermes_yaml as yaml

import hermes_constants
from hermes_cli.profiles_isolated_memory import memory_entries
import tui_gateway.server as srv

ENTRY = "\n§\n"
ROOT_MEMORY = ["Repo lives in ~/code/app", "Deploys go through the staging gate"]
ROOT_USER = ["Prefers short answers"]


@pytest.fixture
def root(tmp_path, monkeypatch):
    home = tmp_path / ".hermes"
    (home / "memories").mkdir(parents=True)
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(home))
    monkeypatch.setattr(hermes_constants, "_default_hermes_root_memo", None)
    (home / "config.yaml").write_text("model:\n  provider: openai\n  default: gpt-5\n", encoding="utf-8")
    (home / "memories" / "MEMORY.md").write_text(ENTRY.join(ROOT_MEMORY), encoding="utf-8")
    (home / "memories" / "USER.md").write_text(ENTRY.join(ROOT_USER), encoding="utf-8")
    return home


def _ok(method: str, params: dict) -> dict:
    resp = srv._methods[method](1, params)
    assert "error" not in resp, resp.get("error")
    return resp["result"]


def _flag(profile: Path):
    path = profile / "profile.yaml"
    data = yaml.safe_load(path.read_text(encoding="utf-8")) if path.is_file() else None
    return (data or {}).get("isolated_memory")


def test_create_can_start_a_clone_with_an_empty_isolated_memory(root):
    _ok("profiles.create", {"name": "island", "clone_from": "default", "no_alias": True, "isolated_memory": True})
    _ok("profiles.create", {"name": "twin", "clone_from": "default", "no_alias": True})
    island, twin = root / "profiles" / "island", root / "profiles" / "twin"

    assert memory_entries(island) == {"memory": [], "user": []} and _flag(island) is True
    assert memory_entries(twin) == {"memory": ROOT_MEMORY, "user": ROOT_USER} and _flag(twin) is None

    described = _ok("profiles.describe", {"name": "island"})
    assert described["isolated_memory"] is True and described["inherited_memory"] == {"memory": 0, "user": 0}
    described = _ok("profiles.describe", {"name": "twin"})
    assert described["isolated_memory"] is False and described["inherited_memory"] == {"memory": 2, "user": 1}


def test_configure_flips_the_switch_and_reports_what_moved(root):
    bot = root / "profiles" / "bot"
    (bot / "memories").mkdir(parents=True)
    (bot / "config.yaml").write_text("model:\n  provider: openai\n  default: gpt-5\n", encoding="utf-8")
    (bot / "memories" / "MEMORY.md").write_text(ENTRY.join([ROOT_MEMORY[0], "Bot: owns the review queue"]), encoding="utf-8")
    (bot / "memories" / "USER.md").write_text(ENTRY.join(ROOT_USER), encoding="utf-8")

    on = _ok("profiles.configure", {"name": "bot", "isolated_memory": True})
    assert on["applied"] == {"isolated_memory": True}
    assert on["memory_isolation"] == {"ok": True, "isolated": True, "removed": {"memory": 1, "user": 1}}
    assert memory_entries(bot) == {"memory": ["Bot: owns the review queue"], "user": []} and _flag(bot) is True
    assert _ok("profiles.describe", {"name": "bot"})["isolated_memory"] is True

    off = _ok("profiles.configure", {"name": "bot", "isolated_memory": False})
    assert off["applied"] == {"isolated_memory": True}
    assert off["memory_isolation"] == {"ok": True, "isolated": False, "added": {"memory": 2, "user": 1}, "skipped": 0}
    assert memory_entries(bot) == {"memory": ["Bot: owns the review queue", *ROOT_MEMORY], "user": ROOT_USER}
    assert _flag(bot) is None
    described = _ok("profiles.describe", {"name": "bot"})
    assert described["isolated_memory"] is False and described["inherited_memory"] == {"memory": 2, "user": 1}
    # The default profile's files never moved.
    assert memory_entries(root) == {"memory": ROOT_MEMORY, "user": ROOT_USER}


def test_configure_reports_an_overflow_without_writing_and_keeps_the_flag(root):
    bot = root / "profiles" / "bot"
    (bot / "memories").mkdir(parents=True)
    (bot / "config.yaml").write_text(
        "model:\n  provider: openai\n  default: gpt-5\nmemory:\n  memory_char_limit: 40\n", encoding="utf-8")
    (bot / "profile.yaml").write_text("isolated_memory: true\n", encoding="utf-8")
    (bot / "memories" / "MEMORY.md").write_text("Bot: owns the review queue", encoding="utf-8")

    off = _ok("profiles.configure", {"name": "bot", "isolated_memory": False})

    assert off["ok"] is False and off["applied"] == {"isolated_memory": False}
    change = off["memory_isolation"]
    assert change["ok"] is False and change["isolated"] is True
    assert change["failure_class"] == "over_budget" and change["target"] == "memory" and change["limit"] == 40
    assert memory_entries(bot)["memory"] == ["Bot: owns the review queue"] and _flag(bot) is True
