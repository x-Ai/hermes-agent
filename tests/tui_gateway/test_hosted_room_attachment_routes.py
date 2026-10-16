"""A member turn with a bound file reaches the member only on a route that can carry it.

The canonical authority route resolves event-bound attachment bytes inside its admission. This
fork's in-process route (`HostedRoomServerRPC`) stages the same bytes into the member session
before `prompt.submit` (`hosted_room_member_attachments.py`): images through `image.attach_bytes`,
other files through `file.attach` plus the authority route's `[Shared attachment] file:` prompt
line. The peer route (`PeerHostedRoomTransport`) still cannot carry files, so the driver refuses
such a turn before dispatching, as a proven failure (a `TypeError` after submit used to book the
attempt ambiguous and leave it `running`).
"""

from __future__ import annotations

import base64
import threading
import time
from pathlib import Path
from types import SimpleNamespace

import pytest

from gateway import hosted_room_driver as state
from gateway import hosted_rooms
from gateway.hosted_room_attachments import HostedRoomAttachmentStore
from gateway.session_ingress_media import HOSTED_DOCUMENT_LINE
from tests.tui_gateway.test_hosted_room_driver_runtime import (
    BINDING,
    PROFILE,
    ROOM_ID,
    RecordingTurnLocks,
    _identity,
    _wait_for,
)
from tui_gateway.hosted_room_driver import HostedRoomRuntime
from tui_gateway.hosted_room_peer_transport import PeerHostedRoomTransport, PeerMemberRoute
from tui_gateway.hosted_room_server_rpc import HostedRoomServerRPC


ATTACHMENTS = [{
    "attachment_id": "att_" + "0" * 32,
    "kind": "file",
    "name": "note.txt",
    "size": 11,
    "mime": "text/plain",
    "event_id": "event-1",
}]


@pytest.fixture
def db(tmp_path: Path) -> Path:
    path = tmp_path / "state.db"
    hosted_rooms.create_room(
        path,
        room_id=ROOM_ID,
        name="Release room",
        members=[{"profile": PROFILE, "handle": PROFILE}],
        authority_gateway_id=BINDING.gateway_id,
        now=time.time(),
    )
    return path


def _bind_file(db: Path, *, recipient="member-ops", data=b"exact bytes", name="note.txt",
               mime="text/plain", kind="file") -> list[dict]:
    """Upload one file and commit it to event-1 for ``recipient``: the task manifest it binds."""
    store = HostedRoomAttachmentStore(db)
    saved = store.put(room_id=ROOM_ID, upload_id=f"upload-{name}", kind=kind, name=name, mime=mime, data=data)
    manifest = [{key: saved[key] for key in ("attachment_id", "kind", "name", "size", "mime")}]
    store.commit_message(room_id=ROOM_ID, event_id="event-1", manifest=manifest, recipient_member_ids=[recipient])
    return [{**manifest[0], "event_id": "event-1"}]


def _admit(db: Path, *, attachments=None) -> state.TaskIdentity:
    identity = _identity()
    payload = {
        "target_profile": PROFILE,
        "target_member_id": "member-ops",
        "prompt": "Read the attached note.",
        "source_event_seq": 1,
    }
    if attachments is not None:
        payload["attachments"] = attachments
    state.admit_task(db, identity, payload=payload, clock=time.time)
    return identity


def _run_until_settled_or_error(runtime: HostedRoomRuntime, db: Path, identity) -> dict:
    runtime.start()
    try:
        _wait_for(lambda: (
            state.get_task(db, identity)["status"] in state.TERMINAL_STATUSES
            or runtime.status()["last_error"] is not None))
    finally:
        assert runtime.stop(timeout=5.0)
    return state.get_task(db, identity)


def _server_module():
    """The installed server surface `HostedRoomServerRPC` normalizes; turns finish at once."""
    submits = []

    def ok(result):
        return lambda rid, params: {"id": rid, "result": result}

    def prompt_submit(rid, params):
        submits.append(params)
        params["_hosted_terminal_callback"]({"status": "settled", "text": "Read it."})
        return {"id": rid, "result": {"status": "streaming"}}

    staged = []

    def file_attach(rid, params):
        staged.append(("file.attach", params))
        return {"id": rid, "result": {"attached": True, "name": params["name"],
                                      "path": f"/srv/member/attachments/{params['name']}"}}

    def image_attach_bytes(rid, params):
        staged.append(("image.attach_bytes", params))
        return {"id": rid, "result": {"attached": True, "path": "/srv/member/images/upload.png", "count": 1}}

    server = SimpleNamespace(
        _methods={
            "session.list": ok({"sessions": []}),
            "session.create": ok({"session_id": "runtime"}),
            "session.resume": ok({"session_id": "runtime"}),
            "session.history": ok({"messages": []}),
            "prompt.submit": prompt_submit,
            "file.attach": file_attach,
            "image.attach_bytes": image_attach_bytes,
        },
        staged=staged,
        _sessions={},
        _sessions_lock=threading.Lock(),
        _pending_approval_request_payload=lambda _session_key: None,
    )
    return server, submits


def _legacy_runtime(db: Path, rpc: HostedRoomServerRPC) -> HostedRoomRuntime:
    return HostedRoomRuntime(
        db_path=db, rooms=[BINDING], rpc=rpc, turn_lock=RecordingTurnLocks(),
        lease_ttl_seconds=0.4, poll_interval_seconds=0.01)


class DispatchingPeerClient:
    """Peer client whose member settles every dispatched turn immediately."""

    def __init__(self) -> None:
        self.dispatches = []

    def prepare(self, **_kwargs):
        return {"session_id": "peer-session"}

    def dispatch(self, *, dispatch, grant):
        self.dispatches.append(dispatch)
        return {"status": "settled", "text": "Read it."}

    def status(self, **_kwargs):
        return {"active": False}

    def history(self, **_kwargs):
        return []

    def stop(self, **_kwargs):
        return {"status": "stopping"}


def _peer_runtime(db: Path, client: DispatchingPeerClient) -> HostedRoomRuntime:
    route = PeerMemberRoute(
        home_install_id="install-home", member_id="member-ops", target_install_id="install-peer",
        target_profile=PROFILE, capability_digest="a" * 64, execution_policy_digest="b" * 64,
        cancellation_scope_id="cancel-peer", trace_id="trace-peer", grant="signed-room-grant")

    def resolve(binding, task):
        return PeerHostedRoomTransport(
            binding=binding, route=route, client=client,
            source_event_seq=int(task["payload"]["source_event_seq"]),
            task_id=task["identity"].task_id,
            execution_generation=int(task["execution_generation"]))

    return HostedRoomRuntime(
        db_path=db, rooms=[BINDING], transport_resolver=resolve, turn_lock=RecordingTurnLocks(),
        lease_ttl_seconds=0.4, poll_interval_seconds=0.01)


def _assert_refused_as_proven_failure(task: dict, runtime: HostedRoomRuntime) -> None:
    assert task["status"] == "failed", (task["status"], runtime.status()["last_error"])
    assert task["result"]["error"].startswith("attachments_unsupported_on_route")
    assert "attachments_unsupported_on_route" in runtime.status()["last_error"]
    assert runtime.status()["blocked_rooms"] == ()


def test_legacy_route_stages_a_bound_document_into_the_member_session_before_submitting(db: Path):
    identity = _admit(db, attachments=_bind_file(db))
    server, submits = _server_module()
    runtime = _legacy_runtime(db, HostedRoomServerRPC(server, db_path=db))

    task = _run_until_settled_or_error(runtime, db, identity)

    assert task["status"] == "settled", runtime.status()["last_error"]
    [(door, params)] = server.staged
    assert door == "file.attach"
    assert (params["profile"], params["session_id"], params["name"]) == (PROFILE, "runtime", "note.txt")
    assert base64.b64decode(params["data_url"].split(",", 1)[1]) == b"exact bytes"
    # The member reads the same prompt the authority route composes: the file named on its own line.
    assert submits[0]["text"] == (
        "Read the attached note." + HOSTED_DOCUMENT_LINE + "/srv/member/attachments/note.txt\n")


def test_legacy_route_queues_a_bound_image_on_the_member_session(db: Path):
    png = b"\x89PNG\r\n\x1a\n" + bytes(16)
    identity = _admit(db, attachments=_bind_file(db, data=png, name="shot.png", mime="image/png", kind="image"))
    server, submits = _server_module()
    runtime = _legacy_runtime(db, HostedRoomServerRPC(server, db_path=db))

    task = _run_until_settled_or_error(runtime, db, identity)

    assert task["status"] == "settled", runtime.status()["last_error"]
    [(door, params)] = server.staged
    assert door == "image.attach_bytes"
    assert base64.b64decode(params["content_base64"]) == png and params["filename"] == "shot.png"
    assert submits[0]["text"] == "Read the attached note."  # images ride as images, not prompt lines


def test_legacy_route_proves_not_admitted_when_the_member_may_not_read_the_file(db: Path):
    identity = _admit(db, attachments=_bind_file(db, recipient="someone-else"))
    server, submits = _server_module()
    runtime = _legacy_runtime(db, HostedRoomServerRPC(server, db_path=db))

    task = _run_until_settled_or_error(runtime, db, identity)

    assert task["status"] == "queued", runtime.status()["last_error"]
    assert "was not admitted" in runtime.status()["last_error"]
    assert runtime.status()["blocked_rooms"] == ()
    assert server.staged == [] and submits == []


def test_legacy_route_still_runs_a_turn_without_a_file(db: Path):
    identity = _admit(db)
    server, submits = _server_module()
    runtime = _legacy_runtime(db, HostedRoomServerRPC(server))

    task = _run_until_settled_or_error(runtime, db, identity)

    assert task["status"] == "settled", runtime.status()["last_error"]
    assert task["result"]["text"] == "Read it."
    assert [s["_hosted_task"]["member_id"] for s in submits] == ["member-ops"]


def test_peer_route_refuses_a_turn_with_a_file_before_dispatching(db: Path):
    identity = _admit(db, attachments=ATTACHMENTS)
    client = DispatchingPeerClient()
    runtime = _peer_runtime(db, client)

    task = _run_until_settled_or_error(runtime, db, identity)

    _assert_refused_as_proven_failure(task, runtime)
    assert client.dispatches == []


def test_peer_route_still_runs_a_turn_without_a_file(db: Path):
    identity = _admit(db)
    client = DispatchingPeerClient()
    runtime = _peer_runtime(db, client)

    task = _run_until_settled_or_error(runtime, db, identity)

    assert task["status"] == "settled", runtime.status()["last_error"]
    assert task["result"]["text"] == "Read it."
    assert len(client.dispatches) == 1
