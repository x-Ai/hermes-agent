"""Bot Mode's share switch means shared model providers: ``profiles.create`` writes the flag, the editor
reads it back through ``profiles.describe`` and flips it through ``profiles.configure``, and a bot that
stops sharing takes the endpoint its model pin names with it.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import hermes_yaml as yaml

from agent.secret_scope import load_env_file
import tui_gateway.server as srv


@pytest.fixture
def homes(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(
        "model:\n  provider: relay\n  default: m-1\n"
        "providers:\n  relay:\n    name: Relay\n    base_url: https://relay.example.com/v1\n"
        "    api_key: ${RELAY_TOKEN}\n    model: m-1\n", encoding="utf-8")
    (root / ".env").write_text("RELAY_TOKEN=root-relay-secret\n", encoding="utf-8")
    return root


def _ok(method: str, params: dict) -> dict:
    resp = srv._methods[method](1, params)
    assert "error" not in resp, resp.get("error")
    return resp["result"]


def _flag(profile: Path):
    data = yaml.safe_load((profile / "profile.yaml").read_text(encoding="utf-8")) if (profile / "profile.yaml").is_file() else {}
    return (data or {}).get("share_providers")


def test_create_with_the_share_switch_marks_the_profile_as_sharing(homes):
    root = homes
    shared = _ok("profiles.create", {"name": "scout", "no_alias": True, "no_skills": True, "share_auth": True})
    island = _ok("profiles.create", {"name": "lone", "no_alias": True, "no_skills": True})
    assert shared["mirrored"]["providers"] == "shared" and "providers" not in island["mirrored"]
    assert _flag(root / "profiles" / "scout") is True
    assert _flag(root / "profiles" / "lone") is None
    assert _ok("profiles.describe", {"name": "scout"})["share_providers"] is True
    assert _ok("profiles.describe", {"name": "lone"})["share_providers"] is False


def test_stopping_the_share_copies_the_pinned_endpoint_into_the_profile(homes):
    root = homes
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    (bot / "config.yaml").write_text("model:\n  provider: relay\n  default: m-1\n", encoding="utf-8")
    (bot / ".env").write_text("", encoding="utf-8")
    (bot / "profile.yaml").write_text("share_providers: true\n", encoding="utf-8")

    assert _ok("profiles.configure", {"name": "bot", "share_providers": False})["applied"] == {"share_providers": True}

    assert _flag(bot) is None
    cfg = yaml.safe_load((bot / "config.yaml").read_text(encoding="utf-8"))
    assert cfg["providers"]["relay"]["api_key"] == "${RELAY_TOKEN}"
    assert cfg["model"] == {"provider": "relay", "default": "m-1"}
    assert load_env_file(bot / ".env") == {"RELAY_TOKEN": "root-relay-secret"}
    assert _ok("profiles.describe", {"name": "bot"})["share_providers"] is False

    assert _ok("profiles.configure", {"name": "bot", "share_providers": True})["applied"] == {"share_providers": True}
    assert _flag(bot) is True


def test_a_sharing_profiles_picker_context_lists_the_default_profiles_endpoint(homes):
    root = homes
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    (bot / "config.yaml").write_text("model:\n  provider: relay\n  default: m-1\n", encoding="utf-8")
    (bot / "profile.yaml").write_text("share_providers: true\n", encoding="utf-8")
    from hermes_cli.config import get_compatible_custom_providers, load_config

    with srv._hermes_home_scope(bot):
        rows = get_compatible_custom_providers(load_config())

    assert [(row["provider_key"], row["base_url"]) for row in rows] == [("relay", "https://relay.example.com/v1")]
