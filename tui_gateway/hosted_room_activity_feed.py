"""Live member activity for the connections watching a hosted room (fork).

A room member's turn runs on a hidden ``room_plumbing`` session with no client transport: upstream
projects its tool / reasoning / streamed-text frames to the ``on_room_member_activity`` plugin hook and
writes nothing to the durable room log (deltas would exhaust a room's byte budget). The Desktop's room
view is built from exactly those frames — the folded trace, the live "working" box and the per-member
usage chips — so a connection can WATCH a room: every projected frame of that room, plus the usage frames
the chips read, is re-emitted to the watching transports as one ``room.activity`` event stamped with the
room coordinates. Watches die with their transport; nothing is persisted or replayed.
"""

from __future__ import annotations

import logging
import threading
import weakref
from collections.abc import Mapping
from typing import Any

from tui_gateway.hosted_room_member_activity import KIND_BY_FRAME_TYPE, KIND_BY_REQUEST_METHOD

logger = logging.getLogger(__name__)

EVENT_TYPE = "room.activity"
#: Beyond upstream's activity projection: the frames the Desktop's usage chips are fed from.
EXTRA_KIND_BY_FRAME_TYPE: Mapping[str, str] = {
    "message.complete": "turn.complete", "session.usage": "session.usage",
    "reasoning.available": "reasoning.available"}
_COORDINATE_FIELDS = ("room_id", "thread_id", "member_id", "turn_id", "task_id", "execution_generation")

_lock = threading.Lock()
_watches: weakref.WeakKeyDictionary[Any, set[str]] = weakref.WeakKeyDictionary()


def watch(transport: Any, room_id: str, *, on: bool = True) -> bool:
    """Start (or stop) forwarding ``room_id``'s member activity to ``transport``; returns the new state."""
    room = str(room_id or "")
    if transport is None or not room:
        return False
    with _lock:
        rooms = _watches.get(transport)
        if on:
            if rooms is None:
                rooms = _watches[transport] = set()
            rooms.add(room)
            return True
        if rooms is not None:
            rooms.discard(room)
            if not rooms:
                _watches.pop(transport, None)
        return False


def watched_rooms(transport: Any) -> frozenset[str]:
    if transport is None:
        return frozenset()
    with _lock:
        return frozenset(_watches.get(transport) or ())


def watcher_count(room_id: str) -> int:
    with _lock:
        return sum(1 for rooms in _watches.values() if room_id in rooms)


def _classify(frame: Mapping[str, Any]) -> tuple[str | None, Any]:
    params = frame.get("params")
    if not isinstance(params, Mapping):
        return None, None
    if frame.get("method") == "event":
        frame_type = str(params.get("type") or "")
        return KIND_BY_FRAME_TYPE.get(frame_type) or EXTRA_KIND_BY_FRAME_TYPE.get(frame_type), params.get("payload")
    if "id" in frame:
        return (KIND_BY_REQUEST_METHOD.get(str(frame.get("method") or "")),
                {k: v for k, v in params.items() if k != "session_id"})
    return None, None


def forward(frame: Mapping[str, Any], sessions: Mapping[str, Mapping[str, Any]]) -> int:
    """Re-emit ``frame`` to the watchers of the room its session is running a turn for; returns how
    many transports took it. Cheap when nobody watches (one locked emptiness check)."""
    with _lock:
        if not _watches:
            return 0
    kind, payload = _classify(frame)
    if kind is None:
        return 0
    params = frame["params"]
    sid = str(params.get("session_id") or "")
    session = sessions.get(sid)
    hosted = session.get("_hosted_room_task") if isinstance(session, Mapping) else None
    if not isinstance(hosted, Mapping):
        return 0
    room_id = str(hosted.get("room_id") or "")
    with _lock:
        targets = [transport for transport, rooms in list(_watches.items()) if room_id in rooms]
    if not targets:
        return 0
    coordinates = {field: hosted.get(field) for field in _COORDINATE_FIELDS}
    body = {**coordinates, "kind": kind, "seq": params.get("seq"), "session_id": sid,
            "payload": dict(payload) if isinstance(payload, Mapping) else {}}
    event = {"jsonrpc": "2.0", "method": "event", "params": {"type": "room.activity", "session_id": sid, "payload": body}}
    delivered = 0
    for transport in targets:
        try:
            ok = bool(transport.write(event))
        except Exception:
            logger.debug("room activity watcher write failed", exc_info=True)
            ok = False
        if ok:
            delivered += 1
        else:
            with _lock:
                _watches.pop(transport, None)
    return delivered
