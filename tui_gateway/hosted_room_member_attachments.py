"""Event-bound attachments on the in-process member route (fork).

``groups.send`` commits a message's files to the room store for the room's members
(``session_hosted_attachments.append_user_event``) and the discussion planner binds them to a member
task with their source ``event_id``. The canonical authority route resolves those bytes per member inside
its own admission (``session_hosted_attachments.submission_payload``); this is the same resolution for the
in-process route, which has no admission of its own. The member's bytes are read from the store, checked
against the task manifest, and staged through the session's own attachment doors: images queue on the
member session (``image.attach_bytes``) and ride the next ``prompt.submit`` like a Desktop upload; other
files land in the session's ``attachments/`` folder (``file.attach``) and are named in the prompt with the
authority route's ``[Shared attachment] file:`` line, so a member reads the same prompt on either route.
A file that cannot be staged is reported before anything is admitted (``HostedRoomSessionError``), which
the route marks ``not_admitted`` like every other pre-admission refusal.
"""

from __future__ import annotations

import base64
from collections.abc import Mapping, Sequence
from typing import Any

from gateway.hosted_room_attachments import AttachmentError, HostedRoomAttachmentStore
from gateway.hosted_room_driver import DriverValidationError, validate_bound_task_manifest
from gateway.session_ingress_media import _ATTACHMENT_MIMES, HOSTED_DOCUMENT_LINE

CODE_ATTACHMENT = 4134
_MANIFEST_KEYS = ("kind", "name", "mime", "size")


def _refused(detail: str):
    from tui_gateway.hosted_room_server_rpc import HostedRoomSessionError
    return HostedRoomSessionError("groups.attachment", CODE_ATTACHMENT, detail)


def _member_bytes(store: HostedRoomAttachmentStore, *, room_id: str, member_id: str, item: Mapping[str, Any]) -> bytes:
    try:
        saved = store.read(room_id=room_id, attachment_id=item["attachment_id"],
                           recipient_member_id=member_id, event_id=item["event_id"])
    except AttachmentError as exc:
        raise _refused(f"{item['name']}: {exc}") from exc
    if any(saved.attachment[key] != item[key] for key in _MANIFEST_KEYS) or len(saved.data) != item["size"]:
        raise _refused(f"{item['name']}: the stored file does not match the task manifest")
    return saved.data


def stage_member_attachments(
    rpc, *, profile: str, session_id: str, room_id: str, member_id: str, prompt: str,
    attachments: Sequence[Mapping[str, Any]], db_path=None,
) -> str:
    """Stage the task's bound files into the member session; returns the prompt to submit."""
    try:
        manifest = validate_bound_task_manifest(list(attachments))
    except DriverValidationError as exc:
        raise _refused(str(exc)) from exc
    if db_path is None:
        from gateway.hosted_rooms import default_db_path
        db_path = default_db_path()
    store = HostedRoomAttachmentStore(db_path)
    documents: list[str] = []
    session = {"profile": profile, "session_id": session_id}
    for item in manifest:
        encoded = base64.b64encode(_member_bytes(store, room_id=room_id, member_id=member_id, item=item)).decode("ascii")
        if item["mime"] in _ATTACHMENT_MIMES:
            rpc._call("image.attach_bytes", {**session, "content_base64": encoded, "filename": item["name"]})
            continue
        staged = rpc._call("file.attach", {
            **session, "name": item["name"], "data_url": f"data:{item['mime']};base64,{encoded}"})
        documents.append(str(staged.get("path") or item["name"]))
    return prompt + "".join(HOSTED_DOCUMENT_LINE + path + "\n" for path in documents)
