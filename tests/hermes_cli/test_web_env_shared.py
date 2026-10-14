"""The dashboard's API Keys page on a profile that shares the default profile's providers: a provider
credential shows the value the profile resolves and where it comes from, and is edited in the default
profile only; the profile's own keys (its endpoints' slots, tool keys) stay its own.
"""

from __future__ import annotations

import asyncio
from pathlib import Path

import pytest
from fastapi import HTTPException

from agent.secret_scope import load_env_file


@pytest.fixture
def homes(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(
        "providers:\n  relay:\n    name: Relay\n    base_url: https://relay.example.com/v1\n"
        "    api_key: ${RELAY_TOKEN}\n", encoding="utf-8")
    (root / ".env").write_text(
        "RELAY_TOKEN=root-relay-secret\nANTHROPIC_API_KEY=root-anthropic-secret\nBRAVE_API_KEY=root-brave-key\n",
        encoding="utf-8")
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    (bot / "config.yaml").write_text(
        "providers:\n  mine:\n    name: Mine\n    base_url: https://mine.example.com/v1\n", encoding="utf-8")
    (bot / ".env").write_text(
        "RELAY_TOKEN=stale-copy\nHERMES_CUSTOM_MINE_API_KEY=bot-mine-secret\nBRAVE_API_KEY=bot-brave-key\n",
        encoding="utf-8")
    (bot / "profile.yaml").write_text("share_providers: true\n", encoding="utf-8")
    return root, bot


def test_shared_credentials_show_the_resolved_value_and_their_source(homes):
    import hermes_cli.web_routers.config_env as mod
    from hermes_cli.web_routers._common import redacted_credential_preview

    rows = mod._get_env_vars_sync("bot")
    assert rows["RELAY_TOKEN"]["source"] == "default-profile" and rows["RELAY_TOKEN"]["is_set"]
    assert rows["RELAY_TOKEN"]["redacted_value"] == redacted_credential_preview("root-relay-secret")
    assert rows["ANTHROPIC_API_KEY"]["source"] == "default-profile" and rows["ANTHROPIC_API_KEY"]["is_set"]
    # Its own endpoint's slot and a tool key are the profile's: its own values, its own rows.
    assert rows["HERMES_CUSTOM_MINE_API_KEY"]["source"] == "profile"
    assert rows["BRAVE_API_KEY"]["source"] == "profile"
    assert rows["BRAVE_API_KEY"]["redacted_value"] == redacted_credential_preview("bot-brave-key")
    # The default profile's page is unchanged.
    assert mod._get_env_vars_sync(None)["RELAY_TOKEN"]["source"] == "profile"


def test_shared_credentials_are_edited_in_the_default_profile_only(homes):
    import hermes_cli.web_routers.config_env as mod
    from hermes_cli.web_models import EnvVarDelete, EnvVarUpdate

    root, bot = homes
    with pytest.raises(HTTPException) as refused:
        asyncio.run(mod.set_env_var(EnvVarUpdate(key="RELAY_TOKEN", value="bot-wants-its-own"), profile="bot"))
    assert refused.value.status_code == 422 and "shared from the default profile" in refused.value.detail
    with pytest.raises(HTTPException) as refused:
        asyncio.run(mod.remove_env_var(EnvVarDelete(key="ANTHROPIC_API_KEY"), profile="bot"))
    assert refused.value.status_code == 422
    assert load_env_file(bot / ".env")["RELAY_TOKEN"] == "stale-copy"
    assert load_env_file(root / ".env")["ANTHROPIC_API_KEY"] == "root-anthropic-secret"

    asyncio.run(mod.set_env_var(EnvVarUpdate(key="HERMES_CUSTOM_MINE_API_KEY", value="bot-mine-rotated"), profile="bot"))
    assert load_env_file(bot / ".env")["HERMES_CUSTOM_MINE_API_KEY"] == "bot-mine-rotated"
    # The default profile edits the shared key as before, and the bot resolves the rotation.
    asyncio.run(mod.set_env_var(EnvVarUpdate(key="RELAY_TOKEN", value="root-relay-rotated")))
    assert load_env_file(root / ".env")["RELAY_TOKEN"] == "root-relay-rotated"
    from hermes_cli.web_routers._common import redacted_credential_preview
    assert mod._get_env_vars_sync("bot")["RELAY_TOKEN"]["redacted_value"] == redacted_credential_preview("root-relay-rotated")
