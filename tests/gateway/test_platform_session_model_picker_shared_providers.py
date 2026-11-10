"""Fork feature through the platform picker seam.

A profile that shares the default profile's model providers (``profile.yaml`` ``share_providers``,
``hermes_cli/profiles_shared_providers.py``) lists them in ``list_session_model_picker_providers``
as well: the seam reads the owning profile's config through the gateway's effective-config read,
which lays the default profile's custom endpoints over the sharing profile's ``providers:``.
"""

import json

import pytest

from gateway.config import GatewayConfig, Platform
from gateway.session import SessionSource
from gateway.session_identity import RoutingIdentity
from tests.gateway.test_platform_session_model_settings import _Adapter


@pytest.fixture
def sharing_bot(tmp_path, monkeypatch):
    import gateway.run as gateway_run
    from gateway.run import GatewayRunner

    root = tmp_path / ".hermes"
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    monkeypatch.setattr(gateway_run, "_hermes_home", root)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(json.dumps({"providers": {"shared": {
        "name": "Shared", "base_url": "http://127.0.0.1:9/v1", "models": {"shared-model": {}}}}}))
    (bot / "config.yaml").write_text(json.dumps({"model": {"provider": "shared", "default": "shared-model"}}))
    (bot / "profile.yaml").write_text("share_providers: true\n")
    runner = object.__new__(GatewayRunner)
    runner.config = GatewayConfig()
    adapter = object.__new__(_Adapter)
    adapter.gateway_runner = runner
    source = SessionSource(platform=Platform.TELEGRAM, chat_id="bot-chat", chat_type="dm")
    source._identity = RoutingIdentity(
        transport_profile="default", runtime_profile="bot", authorization_home=root, runtime_home=bot,
    )
    return adapter, source, bot


def _rows_by_slug(adapter, source):
    return {row["slug"]: row for row in adapter.list_session_model_picker_providers(source, include_moa=False)}


def test_a_sharing_profiles_picker_lists_the_default_profiles_endpoints(sharing_bot):
    adapter, source, bot = sharing_bot
    shared = _rows_by_slug(adapter, source)["shared"]
    assert "shared-model" in shared["models"]
    assert shared["is_current"] is True

    (bot / "profile.yaml").write_text("")  # an island again: only its own file
    assert "shared" not in _rows_by_slug(adapter, source)
