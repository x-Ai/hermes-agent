"""Fork: ``groups.attachment.upload`` / ``groups.attachment.download`` on the in-process gateway, over the
store ``groups.send`` commits manifests into, and their advertisement in ``groups.capabilities``."""

from __future__ import annotations

import base64

import pytest

import tui_gateway.server as srv
from tui_gateway import methods_groups
from tui_gateway.methods_groups_attachments import FEATURES, METHODS

DATA = b"exact bytes of a shared note"


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


def _upload(rid=1, **overrides):
    params = {"room_id": "room-1", "upload_id": "upload-1", "kind": "file", "name": "note.txt",
              "mime": "text/plain", "data_base64": base64.b64encode(DATA).decode("ascii"), **overrides}
    return srv._methods["groups.attachment.upload"](rid, params)


def test_capabilities_advertise_room_attachments(home):
    caps = _result(srv._methods["groups.capabilities"](1, {}))
    assert set(FEATURES) <= set(caps["features"])
    assert set(METHODS) <= set(caps["methods"])


def test_upload_send_and_download_round_trip(home):
    _create_room()

    saved = _result(_upload())
    assert saved["attachment_id"].startswith("att_") and saved["size"] == len(DATA)
    assert _result(_upload(rid=2))["attachment_id"] == saved["attachment_id"]  # idempotent per upload_id

    manifest = {key: saved[key] for key in ("attachment_id", "kind", "name", "size", "mime")}
    sent = _result(srv._methods["groups.send"](3, {
        "room_id": "room-1", "event_id": "evt-1",
        "payload": {"text": "read this", "thread_id": "thread-1", "attachments": [manifest]}}))
    assert sent["accepted"] is True
    assert sent["event"]["payload"]["attachments"][0]["attachment_id"] == saved["attachment_id"]

    # Files are committed under the durable event id (``user:<sha256>`` of the client's), not the client's.
    read = _result(srv._methods["groups.attachment.download"](4, {
        "room_id": "room-1", "event_id": sent["event"]["event_id"], "attachment_id": saved["attachment_id"]}))
    assert base64.b64decode(read["data_base64"]) == DATA
    assert (read["name"], read["mime"], read["size"]) == ("note.txt", "text/plain", len(DATA))


def test_errors_are_typed(home):
    _create_room()
    assert _upload(room_id="missing")["error"]["code"] == 4136
    assert _upload(data_base64="data:text/plain;base64,YQ==")["error"]["code"] == 4134
    assert _upload(kind="image")["error"]["code"] == 4134  # text bytes are not an image
    assert srv._methods["groups.attachment.download"](5, {
        "room_id": "room-1", "attachment_id": "att_" + "0" * 32})["error"]["code"] == 4134  # event_id required
    assert srv._methods["groups.attachment.download"](6, {
        "room_id": "room-1", "event_id": "evt-x", "attachment_id": "att_" + "0" * 32})["error"]["code"] == 4135
