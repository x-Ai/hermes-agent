"""The dashboard's Custom Endpoints page on a profile that shares the default profile's providers: the
shared rows say where they come from, they are edited in the default profile only, and an edit or delete
there reaches the sharing profiles pinned to the endpoint.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import hermes_yaml as yaml
from fastapi import HTTPException


@pytest.fixture
def homes(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(
        "providers:\n  relay:\n    name: Relay\n    base_url: https://relay.example.com/v1\n", encoding="utf-8")
    (root / ".env").write_text("", encoding="utf-8")
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    (bot / "config.yaml").write_text(
        "providers:\n  mine:\n    name: Mine\n    base_url: https://mine.example.com/v1\n", encoding="utf-8")
    (bot / "profile.yaml").write_text("share_providers: true\n", encoding="utf-8")
    return root, bot


def test_shared_rows_are_marked_and_only_the_default_profile_may_write_them(homes):
    import hermes_cli.web_routers.config_env as mod
    from hermes_cli.web_models import CustomEndpointUpdate

    rows = {row["id"]: row for row in mod.list_custom_endpoints(profile="bot")["endpoints"]}
    assert rows["relay"]["source"] == "default-profile"
    assert rows["mine"]["source"] == "providers"

    body = CustomEndpointUpdate(id="relay", name="Relay", base_url="https://elsewhere.example.com/v1", api_key="", model="m")
    with pytest.raises(HTTPException) as refused:
        mod.upsert_custom_endpoint(body, profile="bot")
    assert refused.value.status_code == 422 and "shared from the default profile" in refused.value.detail
    with pytest.raises(HTTPException) as refused:
        mod.delete_custom_endpoint("relay", profile="bot")
    assert refused.value.status_code == 422

    # The default profile itself edits it as before; the bot sees the change through.
    assert mod.upsert_custom_endpoint(body)["ok"] is True
    rows = {row["id"]: row for row in mod.list_custom_endpoints(profile="bot")["endpoints"]}
    assert rows["relay"]["base_url"] == "https://elsewhere.example.com/v1"


def _pin(home, provider: str, base_url: str, api_mode: str) -> None:
    (home / "config.yaml").write_text(
        f"model:\n  provider: {provider}\n  default: m\n  base_url: {base_url}\n  api_mode: {api_mode}\n"
        "providers:\n  mine:\n    name: Mine\n    base_url: https://mine.example.com/v1\n", encoding="utf-8")


def _raw(home) -> dict:
    return yaml.safe_load((home / "config.yaml").read_text(encoding="utf-8"))


def test_a_default_profile_edit_resyncs_the_route_mirror_of_the_sharing_profiles_pinned_to_it(homes):
    """Activation copies the endpoint's host and protocol onto the profile's ``model:``; the default
    profile's later edit used to re-sync only its own mirror, leaving every sharing profile's stored
    route on the old host and wire protocol."""
    import hermes_cli.web_routers.config_env as mod
    from hermes_cli.web_models import CustomEndpointUpdate

    root, bot = homes
    _pin(bot, "relay", "https://relay.example.com/v1", "chat_completions")
    island = root / "profiles" / "island"
    island.mkdir()
    _pin(island, "relay", "https://relay.example.com/v1", "chat_completions")  # same pin, not sharing

    body = CustomEndpointUpdate(id="relay", name="Relay", base_url="https://elsewhere.example.com/v1", api_key="",
                                model="m", api_mode="anthropic_messages")
    assert mod.upsert_custom_endpoint(body)["sharing_profiles_synced"] == ["bot"]

    assert _raw(bot)["model"] == {"provider": "relay", "default": "m", "base_url": "https://elsewhere.example.com/v1",
                                  "api_mode": "anthropic_messages"}
    assert _raw(bot)["providers"] == {"mine": {"name": "Mine", "base_url": "https://mine.example.com/v1"}}
    assert _raw(island)["model"]["base_url"] == "https://relay.example.com/v1"
    # A sharing profile editing its own endpoint reaches nobody else.
    own = CustomEndpointUpdate(id="mine", name="Mine", base_url="https://mine2.example.com/v1", api_key="", model="m")
    assert mod.upsert_custom_endpoint(own, profile="bot")["sharing_profiles_synced"] == []


def test_deleting_a_default_endpoint_a_sharing_profile_runs_on_is_refused_until_it_repoints(homes):
    import hermes_cli.web_routers.config_env as mod

    root, bot = homes
    _pin(bot, "relay", "https://relay.example.com/v1", "chat_completions")

    with pytest.raises(HTTPException) as refused:
        mod.delete_custom_endpoint("relay")
    assert refused.value.status_code == 422 and "sharing profile(s) bot" in refused.value.detail
    assert "relay" in _raw(root)["providers"]

    _pin(bot, "mine", "https://mine.example.com/v1", "chat_completions")
    assert mod.delete_custom_endpoint("relay")["ok"] is True
    assert "relay" not in (_raw(root).get("providers") or {})

