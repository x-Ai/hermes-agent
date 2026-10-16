"""Fork extensions of the hosted-room JSON-RPC contract (see ``methods_groups.py``): per-room settings,
member session lookup, the live turn and the activity watch the Desktop's room view is built on.

Handlers are rebound onto server.py's globals at install (``method_ctx.py``), so every fork import is
local to its handler and module constants travel as keyword defaults."""

from .method_ctx import HandlerRegistry

_registry = HandlerRegistry()
method = _registry.method

#: Advertised in ``groups.capabilities`` so a client feature-detects this gateway.
FEATURES = ("room_settings", "member_sessions", "room_live", "activity_watch")
METHODS = ("groups.settings.get", "groups.settings.set", "groups.member_sessions", "groups.live", "groups.watch")

CODE_INVALID = 4130
CODE_CONFLICT = 4131
CODE_ROOM = 4132
CODE_NO_CONNECTION = 4133
CODE_INTERNAL = 5130


def _room_row(room_id):
    """The hosted room row (disbanded included) or a ``HostedRoomError``."""
    from gateway.hosted_rooms import default_db_path, room_state
    return room_state(default_db_path(), room_id=room_id, include_disbanded=True)


@method("groups.settings.get")
def _(rid, params: dict) -> dict:
    """This fork's per-room settings (``gateway/hosted_room_settings.py``)."""
    from gateway.hosted_rooms import HostedRoomError, default_db_path
    from gateway.hosted_room_settings import RoomSettingsError, read_settings
    try:
        _room_row(params.get("room_id"))
        return _ok(rid, read_settings(default_db_path(), params.get("room_id")))
    except HostedRoomError as exc:
        return _err(rid, CODE_ROOM, str(exc))
    except RoomSettingsError as exc:
        return _err(rid, CODE_INVALID, str(exc), {"reason": exc.reason})


@method("groups.settings.set")
def _(rid, params: dict) -> dict:
    """Merge a settings patch; ``expected_revision`` makes it a compare-and-swap."""
    from gateway.hosted_rooms import HostedRoomError, default_db_path
    from gateway.hosted_room_settings import RoomSettingsConflictError, RoomSettingsError, write_settings
    try:
        _room_row(params.get("room_id"))
        return _ok(rid, write_settings(
            default_db_path(), params.get("room_id"), params.get("patch"),
            expected_revision=params.get("expected_revision")))
    except HostedRoomError as exc:
        return _err(rid, CODE_ROOM, str(exc))
    except RoomSettingsConflictError as exc:
        return _err(rid, CODE_CONFLICT, str(exc), {"reason": exc.reason, "revision": exc.revision})
    except RoomSettingsError as exc:
        return _err(rid, CODE_INVALID, str(exc), {"reason": exc.reason})


def _member_session(room_id: str, member: dict, lookup) -> dict:
    """One ``RoomMemberSession`` row: a local member's hidden session is found by its exact title, the
    same lookup the driver runs before a turn (``HostedRoomServerRPC.resolve_exact``)."""
    profile = str(member.get("profile") or "")
    target = member.get("target") if isinstance(member.get("target"), dict) else {}
    local = str(target.get("kind") or "local") == "local"
    row = {"member_id": str(member.get("member_id") or profile), "profile": profile, "local": local,
           "session_id": None, "root_id": None}
    if not local or not profile:
        return row
    envelope = lookup({"profile": profile, "title": f"Group: {room_id}", "include_hidden": True})
    rows = (envelope.get("result") or {}).get("sessions") if isinstance(envelope, dict) else None
    if isinstance(rows, list) and rows and isinstance(rows[0], dict):
        row["root_id"] = rows[0].get("id")
        row["session_id"] = rows[0].get("resolved_id") or rows[0].get("id")
    return row


@method("groups.member_sessions")
def _(rid, params: dict) -> dict:
    """Each member's hidden room session, so a client can read its usage and transcript."""
    from gateway.hosted_rooms import HostedRoomError
    try:
        room = _room_row(params.get("room_id"))
    except HostedRoomError as exc:
        return _err(rid, CODE_ROOM, str(exc))
    room_id = str(room["room_id"])

    def lookup(query: dict) -> dict:  # the installed handler, as the driver's resolve_exact calls it
        return _methods["session.list"](rid, query)

    sessions = [_member_session(room_id, member, lookup)
                for member in (room.get("members") or []) if isinstance(member, dict)]
    return _ok(rid, {"room_id": room_id, "sessions": sessions})


@method("groups.live")
def _(rid, params: dict) -> dict:
    """The member turn running right now and whether this connection watches the room."""
    from gateway import hosted_room_driver as state
    from gateway.hosted_rooms import HostedRoomError
    from tui_gateway.hosted_room_activity_feed import watched_rooms
    from tui_gateway.methods_groups import get_hosted_room_service
    try:
        room = _room_row(params.get("room_id"))
    except HostedRoomError as exc:
        return _err(rid, CODE_ROOM, str(exc))
    room_id = str(room["room_id"])
    current = None
    service = get_hosted_room_service()
    if service is not None:
        for task in state.list_tasks(service.db_path, room_id=room_id):
            if task.get("status") in ("running", "stopping"):
                identity = task["identity"]
                current = {
                    "member_id": (task.get("payload") or {}).get("target_member_id"),
                    "thread_id": identity.thread_id, "turn_id": identity.turn_id, "task_id": identity.task_id,
                    "status": str(task.get("status")), "started_at": task.get("started_at")}
                break
    return _ok(rid, {"room_id": room_id, "current": current,
                     "watching": room_id in watched_rooms(current_transport())})


@method("groups.watch")
def _(rid, params: dict) -> dict:
    """Forward the room's member activity to this connection as ``room.activity`` events."""
    from gateway.hosted_rooms import HostedRoomError
    from tui_gateway.hosted_room_activity_feed import watch
    try:
        room = _room_row(params.get("room_id"))
    except HostedRoomError as exc:
        return _err(rid, CODE_ROOM, str(exc))
    transport = current_transport()
    if transport is None:
        return _err(rid, CODE_NO_CONNECTION, "no connection to watch from")
    room_id = str(room["room_id"])
    return _ok(rid, {"room_id": room_id, "watching": watch(transport, room_id, on=params.get("on", True) is not False)})


def register(server) -> None:
    _registry.install(server)
