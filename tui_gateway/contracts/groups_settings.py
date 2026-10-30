"""Fork extensions of the hosted-room contract (``methods_groups_settings.py``,
``methods_groups_attachments.py``): per-room settings the Desktop's room features keep on the gateway,
member session lookup, the live turn, the activity watch that feeds the room view's trace and usage chips,
and the canonical contract's attachment upload / download served in-process. ``groups.capabilities.features``
advertises them as ``room_settings`` / ``member_sessions`` / ``room_live`` / ``activity_watch`` /
``room_attachments``.
"""

from __future__ import annotations

from .base import JsonValue, Params, Payload, Result
from .canonical import (
    GroupsAttachmentDownloadParams, GroupsAttachmentUploadParams, RoomAttachment, RoomAttachmentBytes)
from .groups_bot_relay import RoomParams
from .registry import event, method

# ── room settings ──────────────────────────────────────────────────────────────────────────────


class RoomSettings(Result):
    """``gateway/hosted_room_settings.py`` shape: folders by member id / thread id, the room's folder,
    its ``@handle`` and whether stop directives are detected."""

    workspace: str | None = None
    member_workspaces: dict[str, str]
    thread_workspaces: dict[str, str]
    handle: str | None = None
    hold_detection: bool


class GroupsSettingsResult(Result):
    room_id: str
    settings: RoomSettings
    revision: int


method("groups.settings.get", params=RoomParams, result=GroupsSettingsResult,
       doc="This fork's per-room settings; a room without a row answers the defaults at revision 0.")


class RoomSettingsPatch(Params):
    """Scalars replace (``null`` clears); folder maps merge entry by entry (``null`` removes one)."""

    workspace: str | None = None
    member_workspaces: dict[str, str | None] | None = None
    thread_workspaces: dict[str, str | None] | None = None
    handle: str | None = None
    hold_detection: bool | None = None


class GroupsSettingsSetParams(RoomParams):
    patch: RoomSettingsPatch
    # The revision the caller read; a mismatch answers 4131 with the stored revision.
    expected_revision: int | None = None


method("groups.settings.set", params=GroupsSettingsSetParams, result=GroupsSettingsResult,
       doc="Merge a settings patch under a revision compare-and-swap.")


# ── member sessions / live turn / watch ────────────────────────────────────────────────────────


class RoomMemberSession(Result):
    """A local member's hidden room session (``Group: <room_id>``); ids are None until its first turn.
    ``session_id`` is the compression tip a client resumes, ``root_id`` the stored row."""

    member_id: str
    profile: str
    local: bool
    session_id: str | None = None
    root_id: str | None = None


class GroupsMemberSessionsResult(Result):
    room_id: str
    sessions: list[RoomMemberSession]


method("groups.member_sessions", params=RoomParams, result=GroupsMemberSessionsResult,
       doc="Each member's hidden room session, so a client can read its usage and transcript.")


class RoomLiveTurn(Result):
    member_id: str | None = None
    thread_id: str
    turn_id: str
    task_id: str
    status: str
    started_at: float | None = None


class GroupsLiveResult(Result):
    room_id: str
    current: RoomLiveTurn | None = None
    watching: bool


method("groups.live", params=RoomParams, result=GroupsLiveResult,
       doc="The member turn running right now (None when the room is idle) and this connection's watch.")


class GroupsWatchParams(RoomParams):
    on: bool = True


class GroupsWatchResult(Result):
    room_id: str
    watching: bool


method("groups.watch", params=GroupsWatchParams, result=GroupsWatchResult,
       doc="Forward the room's member activity to this connection as room.activity events.")


class RoomActivityPayload(Payload):
    """One member-activity frame re-emitted to a watching connection: the room coordinates of the turn,
    the activity ``kind`` (tool.started, tool.completed, reasoning.delta, message.delta, message.interim,
    turn.error, request.opened, turn.complete, session.usage, ...) and the original frame's payload."""

    room_id: str
    thread_id: str | None = None
    member_id: str | None = None
    turn_id: str | None = None
    task_id: str | None = None
    execution_generation: int | None = None
    kind: str
    seq: int | None = None
    session_id: str
    payload: JsonValue


event("room.activity", RoomActivityPayload,
      doc="A watched room's member did something: the hidden session's frame with room coordinates.")
