"""Fork: a member turn re-homes its session into the room ladder's folder inside the lease-kept turn.

Topical sibling of ``test_hosted_room_driver_workspace.py`` and ``test_hosted_room_lease_keeper.py``:
the driver applies the fork's room working directory (``session.cwd.set``) after the profile lock is
held and before submit, while upstream's ``LeaseKeeper`` keeps the room lease alive through a lock
wait that outlasts the lease ttl, so the re-homed turn still settles.
"""

from __future__ import annotations

import contextlib
import threading
import time
from pathlib import Path
from types import SimpleNamespace

import pytest

from gateway import hosted_room_driver as state
from gateway import hosted_room_settings as settings
from gateway import hosted_rooms
from tests.tui_gateway.test_hosted_room_driver_runtime import BINDING, PROFILE, ROOM_ID, _identity, _wait_for
from tui_gateway.hosted_room_driver import HostedRoomRuntime
from tui_gateway.hosted_room_server_rpc import HostedRoomServerRPC

TTL = 0.6


@pytest.fixture
def db(tmp_path: Path) -> Path:
    path = tmp_path / "state.db"
    hosted_rooms.create_room(
        path, room_id=ROOM_ID, name="Release room", members=[{"profile": PROFILE, "handle": PROFILE}],
        authority_gateway_id=BINDING.gateway_id, now=time.time())
    return path


def _server(events: list):
    """Installed server surface recording the cwd door and the submit, in call order."""
    def ok(result):
        return lambda rid, params: {"id": rid, "result": result}

    def set_cwd(rid, params):
        events.append(("cwd", params))
        return {"id": rid, "result": {"cwd": params["cwd"]}}

    def prompt_submit(rid, params):
        events.append(("submit", params))
        done = params["_hosted_terminal_callback"]
        threading.Timer(TTL, done, args=({"status": "settled", "text": "Done."},)).start()
        return {"id": rid, "result": {"status": "streaming"}}

    return SimpleNamespace(
        _methods={
            "session.list": ok({"sessions": []}), "session.create": ok({"session_id": "runtime"}),
            "session.resume": ok({"session_id": "runtime"}), "session.history": ok({"messages": []}),
            "session.cwd.set": set_cwd, "prompt.submit": prompt_submit},
        _sessions={}, _sessions_lock=threading.Lock(),
        _pending_approval_request_payload=lambda _session_key: None)


def test_member_workspace_is_applied_inside_a_lock_wait_that_outlasts_the_lease(db: Path):
    settings.write_settings(db, ROOM_ID, {
        "workspace": "/srv/room", "member_workspaces": {"member-ops": "/srv/ops"}})
    identity = _identity()
    state.admit_task(db, identity, clock=time.time, payload={
        "target_profile": PROFILE, "target_member_id": "member-ops", "prompt": "Ship it.",
        "source_event_seq": 1})

    @contextlib.contextmanager
    def busy_lock(_profile):
        # health: allow HX013 -- the lock wait outlasting the lease ttl IS the behaviour under test
        time.sleep(TTL * 2)  # another turn on this profile holds the lock past the lease ttl
        yield

    events: list = []
    runtime = HostedRoomRuntime(
        db_path=db, rooms=[BINDING], rpc=HostedRoomServerRPC(_server(events)), turn_lock=busy_lock,
        clock=time.time, lease_ttl_seconds=TTL, poll_interval_seconds=0.01, active_poll_interval_seconds=0.02)
    runtime.start()
    try:
        _wait_for(lambda: (
            state.get_task(db, identity)["status"] in state.TERMINAL_STATUSES
            or runtime.status()["last_error"] is not None), timeout=10.0)
    finally:
        assert runtime.stop(timeout=5.0)

    assert runtime.status()["last_error"] is None
    assert state.get_task(db, identity)["status"] == "settled"
    assert [kind for kind, _params in events] == ["cwd", "submit"]
    assert events[0][1] == {"profile": PROFILE, "session_id": "runtime", "cwd": "/srv/ops"}
