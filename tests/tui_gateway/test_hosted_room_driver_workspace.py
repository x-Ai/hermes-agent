"""Fork: a hosted member turn runs in the room ladder's folder — the driver re-homes the member
session through the transport's ``set_workspace`` door before submitting (``hosted_room_workspace.py``)."""

from __future__ import annotations

from gateway import hosted_room_settings as settings
from tui_gateway.hosted_room_workspace import apply_member_workspace


class _Transport:
    def __init__(self, fail: bool = False) -> None:
        self.calls: list[dict] = []
        self.fail = fail

    def set_workspace(self, *, profile: str, session_id: str, cwd: str) -> dict:
        self.calls.append({"profile": profile, "session_id": session_id, "cwd": cwd})
        if self.fail:
            raise RuntimeError("cwd does not exist")
        return {"cwd": cwd}


def _apply(db, transport, member="alpha", thread="t1"):
    return apply_member_workspace(db, transport, profile="alpha", session_id="sid-1", room_id="room-1",
                                  member_id=member, thread_id=thread)


def test_no_settings_means_no_rehome(tmp_path):
    transport = _Transport()
    assert _apply(tmp_path / "state.db", transport) is None
    assert transport.calls == []


def test_the_ladder_is_applied_per_turn_through_the_transport_door(tmp_path):
    db = tmp_path / "state.db"
    settings.write_settings(db, "room-1", {
        "workspace": "/srv/room", "member_workspaces": {"beta": "/srv/beta"}, "thread_workspaces": {"t9": "/srv/t9"}})
    transport = _Transport()
    assert _apply(db, transport, member="alpha", thread="t1") == "/srv/room"
    assert _apply(db, transport, member="alpha", thread="t9") == "/srv/t9"
    assert _apply(db, transport, member="beta", thread="t9") == "/srv/beta"
    assert [c["cwd"] for c in transport.calls] == ["/srv/room", "/srv/t9", "/srv/beta"]
    assert transport.calls[0] == {"profile": "alpha", "session_id": "sid-1", "cwd": "/srv/room"}


def test_routes_without_the_door_and_failing_rehomes_keep_the_turn_alive(tmp_path):
    db = tmp_path / "state.db"
    settings.write_settings(db, "room-1", {"workspace": "/srv/room"})
    assert _apply(db, object()) is None  # a peer route has no set_workspace
    failing = _Transport(fail=True)
    assert _apply(db, failing) is None  # the folder is gone: logged, the turn runs where the session is
    assert failing.calls and failing.calls[0]["cwd"] == "/srv/room"
