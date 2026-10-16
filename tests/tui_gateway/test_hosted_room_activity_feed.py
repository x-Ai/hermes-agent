"""Fork: a connection watching a hosted room receives its members' hidden-session activity as
``room.activity`` events; unwatched rooms and ordinary sessions stay silent; a dead watcher is dropped."""

from __future__ import annotations

import time

import pytest

from tui_gateway import hosted_room_activity_feed as feed
from tui_gateway import server


class _Watcher:
    def __init__(self, alive: bool = True) -> None:
        self.frames: list[dict] = []
        self.alive = alive

    def write(self, frame: dict) -> bool:
        if not self.alive:
            return False
        self.frames.append(frame)
        return True


HOSTED_TASK = {
    "room_id": "room-a", "task_id": "task-1", "thread_id": "thread-1", "turn_id": "turn-1",
    "execution_generation": 2, "member_id": "reviewer"}


@pytest.fixture
def quiet(monkeypatch):
    monkeypatch.setattr(server, "_stdio_transport", type("Sink", (), {"write": staticmethod(lambda _o: True)})())
    monkeypatch.setattr(feed, "_watches", type(feed._watches)())
    yield


def _session(sid: str, hosted: bool):
    entry = {"session_key": sid, "transport": None, "agent": None, "created_at": time.time()}
    if hosted:
        entry["_hosted_room_task"] = dict(HOSTED_TASK)
    with server._sessions_lock:
        server._sessions[sid] = entry


def _forget(*sids: str):
    with server._sessions_lock:
        for sid in sids:
            server._sessions.pop(sid, None)


def test_watchers_get_the_members_frames_with_room_coordinates(quiet):
    watcher, other_room = _Watcher(), _Watcher()
    assert feed.watch(watcher, "room-a") is True
    assert feed.watch(other_room, "room-b") is True
    _session("room-sid", hosted=True)
    _session("plain-sid", hosted=False)
    try:
        server._emit("tool.start", "room-sid", {"tool_id": "call-1", "name": "terminal", "args": {"command": "ls"}})
        server._emit("session.info", "room-sid", {"title": "chrome, not activity"})
        server._emit("message.complete", "room-sid", {"usage": {"total_tokens": 10}})
        server._emit("tool.start", "plain-sid", {"tool_id": "call-2", "name": "terminal"})
    finally:
        _forget("room-sid", "plain-sid")

    assert other_room.frames == []
    kinds = [f["params"]["payload"]["kind"] for f in watcher.frames]
    assert kinds == ["tool.started", "turn.complete"]
    first = watcher.frames[0]
    assert first["method"] == "event" and first["params"]["type"] == "room.activity"
    body = first["params"]["payload"]
    assert {k: body[k] for k in HOSTED_TASK} == HOSTED_TASK
    assert body["session_id"] == "room-sid" and body["payload"]["args"] == {"command": "ls"}
    assert isinstance(body["seq"], int)


def test_unwatching_and_dead_transports_stop_the_feed(quiet):
    watcher, dead = _Watcher(), _Watcher(alive=False)
    feed.watch(watcher, "room-a")
    feed.watch(dead, "room-a")
    assert feed.watcher_count("room-a") == 2
    _session("room-sid", hosted=True)
    try:
        server._emit("reasoning.delta", "room-sid", {"text": "hm"})
        assert feed.watcher_count("room-a") == 1  # the dead transport was dropped on its first failed write
        assert feed.watch(watcher, "room-a", on=False) is False
        assert feed.watched_rooms(watcher) == frozenset()
        server._emit("reasoning.delta", "room-sid", {"text": "more"})
    finally:
        _forget("room-sid")
    assert [f["params"]["payload"]["kind"] for f in watcher.frames] == ["reasoning.delta"]
    assert feed.watcher_count("room-a") == 0


def test_an_approval_request_is_member_activity_too(quiet):
    watcher = _Watcher()
    feed.watch(watcher, "room-a")
    _session("room-sid", hosted=True)
    try:
        from tui_gateway import server_requests
        server_requests.send_async("approval", "room-sid", {"request_id": "req-1", "command": "rm -rf build"},
                                   lambda result: None)("test_done")
    finally:
        _forget("room-sid")
    assert [f["params"]["payload"]["kind"] for f in watcher.frames] == ["request.opened"]
    assert watcher.frames[0]["params"]["payload"]["payload"]["request_id"] == "req-1"
