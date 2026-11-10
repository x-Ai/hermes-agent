"""Fork localization through the platform picker seam.

The bare ``custom`` row's name ("Custom endpoint") is UI prose that the fork localizes
(``provider.custom_endpoint``); ``list_session_model_picker_providers`` hands it to platform
plugins as a button label, so it must render in the owning profile's ``display.language``,
never the launch profile's.
"""

import pytest

from agent.i18n import t
from gateway.config import GatewayConfig, Platform
from gateway.session import SessionSource
from gateway.session_identity import RoutingIdentity
from tests.gateway.test_platform_session_model_settings import _Adapter

_BARE_CUSTOM = "model:\n  default: local-model\n  provider: custom\n  base_url: http://127.0.0.1:9/v1\n"


@pytest.fixture
def picker_env(tmp_path, monkeypatch):
    import gateway.run as gateway_run
    from gateway.run import GatewayRunner

    monkeypatch.setattr(gateway_run, "_hermes_home", tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    runner = object.__new__(GatewayRunner)
    runner.config = GatewayConfig()
    adapter = object.__new__(_Adapter)
    adapter.gateway_runner = runner
    return adapter, tmp_path


def _source(chat_id):
    return SessionSource(platform=Platform.TELEGRAM, chat_id=chat_id, chat_type="dm")


def _custom_row_name(rows):
    return next(row["name"] for row in rows if row["slug"] == "custom")


def test_custom_row_renders_in_the_profile_language(picker_env):
    adapter, home = picker_env
    (home / "config.yaml").write_text(_BARE_CUSTOM + "display:\n  language: zh-hant\n")
    rows = adapter.list_session_model_picker_providers(_source("picker-chat"), include_moa=False)
    assert _custom_row_name(rows) == t("provider.custom_endpoint", lang="zh-hant") == "自訂端點"


def test_custom_row_follows_the_routed_profile_not_the_launch_profile(picker_env):
    adapter, home = picker_env
    secondary = home / "secondary"
    secondary.mkdir()
    (home / "config.yaml").write_text(_BARE_CUSTOM)
    (secondary / "config.yaml").write_text(_BARE_CUSTOM + "display:\n  language: zh\n")
    routed = _source("routed-chat")
    routed._identity = RoutingIdentity(
        transport_profile="default", runtime_profile="secondary", authorization_home=home, runtime_home=secondary,
    )

    routed_rows = adapter.list_session_model_picker_providers(routed, include_moa=False)
    launch_rows = adapter.list_session_model_picker_providers(_source("launch-chat"), include_moa=False)

    assert _custom_row_name(routed_rows) == t("provider.custom_endpoint", lang="zh") == "自定义端点"
    assert _custom_row_name(launch_rows) == t("provider.custom_endpoint", lang="en") == "Custom endpoint"
