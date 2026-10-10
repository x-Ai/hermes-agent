"""The dashboard's Custom Endpoints page on a profile that shares the default profile's providers: the
shared rows say where they come from, and they are edited in the default profile only.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi import HTTPException


@pytest.fixture
def homes(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(
        "providers:\n  relay:\n    name: Relay\n    base_url: https://relay.example.com/v1\n", encoding="utf-8")
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
