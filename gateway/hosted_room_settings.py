"""Per-room settings this fork keeps beside upstream's hosted rooms.

Upstream's ``hosted_rooms`` row and its member rows are exact-field validated and replicated between
gateways, so the Desktop's room features — the working-directory ladder (member > thread > room), the
room's ``@handle`` and the stop-directive switch — live in a sidecar table of the same ``shared-state.db``.
A missing row reads as the defaults; a write merges a patch under a revision compare-and-swap so two
windows never clobber each other. Rows of disbanded rooms are tiny and left in place (``purge_settings``
is for callers that know a room is gone).
"""

from __future__ import annotations

import json
import re
from collections.abc import Iterable, Mapping
from contextlib import closing
from functools import partial
from typing import Any

from gateway.hosted_rooms_common import DbPath, clock, connect, identifier, table_exists, transaction

SETTINGS_TABLE = "hosted_room_settings"
MAX_PATH_CHARS = 1024
MAX_MEMBER_WORKSPACES = 128
MAX_THREAD_WORKSPACES = 64
# The Desktop's group-handle grammar (``group-handle.ts`` GROUP_HANDLE_RE) = a profile id.
HANDLE_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")
RESERVED_HANDLES = frozenset({"all", "everyone", "user", "default", "hermes"})

_DDL = f"""CREATE TABLE IF NOT EXISTS {SETTINGS_TABLE} (
            room_id TEXT PRIMARY KEY,
            settings_json TEXT NOT NULL,
            revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
            updated_at REAL NOT NULL
        )"""


class RoomSettingsError(ValueError):
    """Invalid room, patch or value; ``reason`` is a stable machine tag for the client."""

    def __init__(self, message: str, *, reason: str = "invalid") -> None:
        super().__init__(message)
        self.reason = reason


class RoomSettingsConflictError(RoomSettingsError):
    """The caller's ``expected_revision`` is not the stored one; ``revision`` is the stored value."""

    def __init__(self, revision: int) -> None:
        super().__init__(f"room settings changed underneath this write (revision {revision})",
                         reason="revision_conflict")
        self.revision = revision


def defaults() -> dict[str, Any]:
    return {"workspace": None, "member_workspaces": {}, "thread_workspaces": {}, "handle": None,
            "hold_detection": True}


def _initialize(conn) -> None:
    conn.execute(_DDL)


_connect = partial(connect, db_label="shared-state.db", ready=lambda conn: table_exists(conn, SETTINGS_TABLE),
                   initialize=_initialize)


def _room_id(value: Any) -> str:
    return identifier(value, label="room_id", error=RoomSettingsError)


def _path(value: Any, *, label: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise RoomSettingsError(f"{label} must be a path string or null")
    path = value.strip()
    if not path:
        return None
    if "\x00" in path or len(path) > MAX_PATH_CHARS:
        raise RoomSettingsError(f"{label} must be a path of at most {MAX_PATH_CHARS} characters")
    return path


def _handle(value: Any) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise RoomSettingsError("handle must be a string or null", reason="invalid_handle")
    handle = value.strip().lstrip("@").lower()
    if not handle:
        return None
    if not HANDLE_RE.fullmatch(handle) or handle in RESERVED_HANDLES:
        raise RoomSettingsError(f"'{handle}' is not a usable @handle", reason="invalid_handle")
    return handle


def _folders(current: Mapping[str, str], patch: Any, *, label: str, cap: int) -> dict[str, str]:
    if not isinstance(patch, Mapping):
        raise RoomSettingsError(f"{label} must be an object of id -> path (null removes an entry)")
    merged = dict(current)
    for key, value in patch.items():
        entry = identifier(key, label=f"{label} key", error=RoomSettingsError)
        path = _path(value, label=f"{label}[{entry}]")
        if path is None:
            merged.pop(entry, None)
        else:
            merged[entry] = path
    if len(merged) > cap:
        raise RoomSettingsError(f"{label} holds at most {cap} entries", reason="too_many")
    return merged


def _hold_detection(value: Any) -> bool:
    if not isinstance(value, bool):
        raise RoomSettingsError("hold_detection must be a boolean")
    return value


# setting -> (merged settings, incoming value) -> stored value
_SETTERS = {
    "workspace": lambda _merged, value: _path(value, label="workspace"),
    "handle": lambda _merged, value: _handle(value),
    "hold_detection": lambda _merged, value: _hold_detection(value),
    "member_workspaces": lambda merged, value: _folders(
        merged["member_workspaces"], value, label="member_workspaces", cap=MAX_MEMBER_WORKSPACES),
    "thread_workspaces": lambda merged, value: _folders(
        merged["thread_workspaces"], value, label="thread_workspaces", cap=MAX_THREAD_WORKSPACES),
}


def normalize_patch(current: Mapping[str, Any], patch: Any) -> dict[str, Any]:
    """``current`` with ``patch`` applied: scalars replace (``null`` clears), folder maps merge entry by
    entry (``null`` removes). Unknown keys are the client's bug."""
    if not isinstance(patch, Mapping):
        raise RoomSettingsError("patch must be an object")
    merged = {**defaults(), **{k: v for k, v in current.items() if k in defaults()}}
    for key, value in patch.items():
        setter = _SETTERS.get(key)
        if setter is None:
            raise RoomSettingsError(f"unknown room setting '{key}'", reason="unknown_key")
        merged[key] = setter(merged, value)
    return merged


def _row(conn, room_id: str):
    return conn.execute(
        f"SELECT settings_json, revision FROM {SETTINGS_TABLE} WHERE room_id=?", (room_id,)).fetchone()


def _settings_from_row(row) -> tuple[dict[str, Any], int]:
    if row is None:
        return defaults(), 0
    stored = json.loads(row["settings_json"])
    merged = defaults()
    merged.update({k: v for k, v in stored.items() if k in merged})
    return merged, int(row["revision"])


def read_settings(db_path: DbPath, room_id: Any) -> dict[str, Any]:
    """``{room_id, settings, revision}``; a room without a row answers the defaults at revision 0."""
    rid = _room_id(room_id)
    with closing(_connect(db_path)) as conn:
        settings, revision = _settings_from_row(_row(conn, rid))
    return {"room_id": rid, "settings": settings, "revision": revision}


def write_settings(db_path: DbPath, room_id: Any, patch: Any, *, expected_revision: int | None = None,
                   now: float | None = None) -> dict[str, Any]:
    """Merge ``patch`` into the room's settings; ``expected_revision`` (the revision the caller read)
    makes the write a compare-and-swap."""
    rid = _room_id(room_id)
    with transaction(_connect, db_path, immediate=True) as conn:
        current, revision = _settings_from_row(_row(conn, rid))
        if expected_revision is not None and int(expected_revision) != revision:
            raise RoomSettingsConflictError(revision)
        merged = normalize_patch(current, patch)
        revision += 1
        conn.execute(
            f"""INSERT INTO {SETTINGS_TABLE} (room_id, settings_json, revision, updated_at) VALUES (?, ?, ?, ?)
                ON CONFLICT(room_id) DO UPDATE SET settings_json=excluded.settings_json,
                revision=excluded.revision, updated_at=excluded.updated_at""",
            (rid, json.dumps(merged, ensure_ascii=False, sort_keys=True), revision, clock(now)))
    return {"room_id": rid, "settings": merged, "revision": revision}


def resolve_member_cwd(settings: Mapping[str, Any], *, member_id: str, thread_id: str | None) -> str | None:
    """The ladder: the member's own folder, else the thread's, else the room's; None = the profile's cwd."""
    member = (settings.get("member_workspaces") or {}).get(member_id)
    if member:
        return str(member)
    thread = (settings.get("thread_workspaces") or {}).get(thread_id or "")
    if thread:
        return str(thread)
    room = settings.get("workspace")
    return str(room) if room else None


def purge_settings(db_path: DbPath, room_ids: Iterable[Any]) -> int:
    ids = tuple(_room_id(room_id) for room_id in room_ids)
    if not ids:
        return 0
    with transaction(_connect, db_path, immediate=True) as conn:
        placeholders = ",".join("?" for _ in ids)
        return conn.execute(f"DELETE FROM {SETTINGS_TABLE} WHERE room_id IN ({placeholders})", ids).rowcount
