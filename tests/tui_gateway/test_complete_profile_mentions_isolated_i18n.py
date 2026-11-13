"""@profile completion keeps its localized labels under the isolated listing scope.

An operator's ``-p <name> serve --isolated`` advertises only <name>: no sibling profile and no
``@hermes`` alias for the root profile (#76932). The labels the remaining items carry are backend
copy rendered inside the client's UI, so they follow the connection's language.
"""

import pytest

from agent import i18n
from hermes_cli import isolated_scope


@pytest.fixture
def homes(_isolate_hermes_home):
    from hermes_constants import get_hermes_home

    root = get_hermes_home()
    worker = root / "profiles" / "worker"
    for home in (root, worker):
        home.mkdir(parents=True, exist_ok=True)
        (home / "config.yaml").write_text("{}\n", encoding="utf-8")
    yield {"default": root, "worker": worker}
    isolated_scope._LAUNCH_PROFILE = None


@pytest.fixture
def zh_client():
    token = i18n.bind_client_language("zh")
    yield
    i18n.reset_client_language(token)


def _mentions(prefix=""):
    from tui_gateway.methods_complete import _profile_mention_items

    return {item["text"]: item["meta"] for item in _profile_mention_items(prefix)}


def _label(key, lang):
    return i18n.t(f"tui_gateway.complete.{key}", lang=lang)


def test_isolated_serve_offers_only_its_profile_in_the_client_language(homes, monkeypatch, zh_client):
    monkeypatch.setenv("HERMES_HOME", str(homes["worker"]))
    assert isolated_scope.record_launch_scope(isolated=True, desktop_owned=False) == "worker"

    assert _mentions() == {"@worker": _label("agent_profile", "zh")}
    assert _mentions("herm") == {}  # the root profile's alias is a sibling too


def test_unscoped_backend_keeps_the_localized_primary_alias(homes, monkeypatch, zh_client):
    monkeypatch.setenv("HERMES_HOME", str(homes["worker"]))
    assert isolated_scope.record_launch_scope(isolated=False, desktop_owned=False) is None

    mentions = _mentions()
    assert set(mentions) == {"@default", "@worker", "@hermes"}
    assert mentions["@hermes"] == _label("agent_profile_primary", "zh") != _label("agent_profile_primary", "en")
    assert mentions["@worker"] == _label("agent_profile", "zh") != _label("agent_profile", "en")
