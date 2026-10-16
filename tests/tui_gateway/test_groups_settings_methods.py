"""Fork: the ``groups.settings.*`` / ``groups.member_sessions`` / ``groups.live`` / ``groups.watch`` RPCs
over a real hosted-room service, and their advertisement in ``groups.capabilities``."""

from __future__ import annotations

import pytest

import tui_gateway.server as srv
from tui_gateway import methods_groups
from tui_gateway.client_locale import bind_transport, reset_transport
from tui_gateway.methods_groups_settings import FEATURES, METHODS


@pytest.fixture
def home(tmp_path, monkeypatch):
    class DurableRunStore:
        durable = True

    path = tmp_path / ".hermes"
    path.mkdir()
    (path / "profiles" / "ops").mkdir(parents=True)
    (path / "profiles" / "ops" / "config.yaml").write_text("{}\n")
    monkeypatch.setenv("HERMES_HOME", str(path))
    monkeypatch.setattr(srv, "_run_idempotency_store", DurableRunStore(), raising=False)
    methods_groups.stop_hosted_room_service(timeout=1.0)
    methods_groups.start_hosted_room_service()
    yield path
    methods_groups.stop_hosted_room_service(timeout=1.0)


def _result(envelope):
    assert "error" not in envelope, envelope
    return envelope["result"]


def _create_room(room_id="room-1"):
    return _result(srv._methods["groups.create"](1, {
        "room_id": room_id, "name": "Release room",
        "members": [{"member_id": "default", "profile": "default", "handle": "hermes"},
                    {"member_id": "ops", "profile": "ops", "handle": "ops"}]}))["room"]


class _Transport:
    __slots__ = ("__weakref__", "frames")

    def __init__(self) -> None:
        self.frames = []

    def write(self, frame) -> bool:
        self.frames.append(frame)
        return True


def test_capabilities_advertise_the_fork_features_and_methods(home):
    caps = _result(srv._methods["groups.capabilities"](1, {}))
    assert set(FEATURES) <= set(caps["features"])
    assert set(METHODS) <= set(caps["methods"])
    assert caps["methods"][: len(caps["methods"]) - len(METHODS)] == list(methods_groups._METHODS)


def test_settings_round_trip_with_revision_cas_and_errors(home):
    _create_room()
    read = _result(srv._methods["groups.settings.get"](1, {"room_id": "room-1"}))
    assert read["revision"] == 0 and read["settings"]["workspace"] is None

    written = _result(srv._methods["groups.settings.set"](2, {
        "room_id": "room-1", "patch": {"workspace": "/srv/room", "handle": "@Release"}, "expected_revision": 0}))
    assert written["revision"] == 1 and written["settings"] == {
        **read["settings"], "workspace": "/srv/room", "handle": "release"}

    stale = srv._methods["groups.settings.set"](3, {"room_id": "room-1", "patch": {"workspace": "/x"}, "expected_revision": 0})
    assert stale["error"]["code"] == 4131 and stale["error"]["data"] == {"reason": "revision_conflict", "revision": 1}

    invalid = srv._methods["groups.settings.set"](4, {"room_id": "room-1", "patch": {"handle": "all"}})
    assert invalid["error"]["code"] == 4130 and invalid["error"]["data"]["reason"] == "invalid_handle"

    missing = srv._methods["groups.settings.get"](5, {"room_id": "no-such-room"})
    assert missing["error"]["code"] == 4132


def test_member_sessions_and_live_turn_before_any_turn_ran(home):
    _create_room()
    sessions = _result(srv._methods["groups.member_sessions"](1, {"room_id": "room-1"}))
    assert sessions["room_id"] == "room-1"
    assert [(s["member_id"], s["profile"], s["local"], s["session_id"]) for s in sessions["sessions"]] == [
        ("default", "default", True, None), ("ops", "ops", True, None)]

    live = _result(srv._methods["groups.live"](2, {"room_id": "room-1"}))
    assert live == {"room_id": "room-1", "current": None, "watching": False}


def test_watch_binds_the_calling_connection_and_live_reports_it(home):
    _create_room()
    transport = _Transport()
    token = bind_transport(transport)
    try:
        assert _result(srv._methods["groups.watch"](1, {"room_id": "room-1"})) == {"room_id": "room-1", "watching": True}
        assert _result(srv._methods["groups.live"](2, {"room_id": "room-1"}))["watching"] is True
        assert _result(srv._methods["groups.watch"](3, {"room_id": "room-1", "on": False}))["watching"] is False
        assert _result(srv._methods["groups.live"](4, {"room_id": "room-1"}))["watching"] is False
    finally:
        reset_transport(token)
    no_connection = srv._methods["groups.watch"](5, {"room_id": "room-1"})
    assert no_connection["error"]["code"] == 4133
