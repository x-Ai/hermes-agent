"""Accounts on a profile that resolves a sign-in through the global-root fallback (the default profile's
``auth.json``): the list says the sign-in is borrowed, and disconnecting it there is refused — nothing
of the profile's would be cleared, and clearing the root's grant would sign out every profile.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

import pytest
from fastapi import HTTPException

from hermes_constants import reset_hermes_home_override, set_hermes_home_override


def _store(provider: str, row_id: str, token: str) -> str:
    return json.dumps({"credential_pool": {provider: [{"id": row_id, "access_token": token, "auth_type": "oauth"}]}})


@pytest.fixture
def homes(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text("", encoding="utf-8")
    (root / "auth.json").write_text(_store("openai-codex", "root-1", "root-token"), encoding="utf-8")
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    (bot / "config.yaml").write_text("", encoding="utf-8")
    return root, bot


def test_borrowed_from_root_reads_the_stores_not_a_flag(homes):
    from hermes_cli.auth_oauth_grants import provider_borrowed_from_root

    _root, bot = homes
    assert provider_borrowed_from_root("openai-codex") is False  # the default root owns its own sign-in
    token = set_hermes_home_override(str(bot))
    try:
        assert provider_borrowed_from_root("openai-codex") is True
        assert provider_borrowed_from_root("nous") is False  # nobody is signed in to that one
        (bot / "auth.json").write_text(_store("openai-codex", "bot-1", "bot-token"), encoding="utf-8")
        assert provider_borrowed_from_root("openai-codex") is False  # its own sign-in shadows the root's
    finally:
        reset_hermes_home_override(token)


def test_the_accounts_list_flags_a_borrowed_sign_in_and_disconnecting_it_is_refused(homes, monkeypatch):
    import hermes_cli.web_routers.oauth as mod

    monkeypatch.setattr(mod, "_resolve_provider_status", lambda pid, _fn: {"logged_in": pid == "openai-codex"})
    monkeypatch.setattr(mod, "_require_token", lambda _request: None)

    rows = {p["id"]: p for p in asyncio.run(mod.list_oauth_providers(profile="bot"))["providers"]}
    assert rows["openai-codex"]["status"]["borrowed_from_root"] is True
    assert "borrowed_from_root" not in rows["nous"]["status"]
    own = {p["id"]: p for p in asyncio.run(mod.list_oauth_providers())["providers"]}
    assert "borrowed_from_root" not in own["openai-codex"]["status"]

    with pytest.raises(HTTPException) as refused:
        asyncio.run(mod.disconnect_oauth_provider("openai-codex", request=None, profile="bot"))
    assert refused.value.status_code == 422 and "signed in from the default profile" in refused.value.detail
    root, _bot = homes
    assert json.loads((root / "auth.json").read_text(encoding="utf-8"))["credential_pool"]["openai-codex"]
