"""Fork: the canonical contract's hosted-room attachment RPCs (``groups.attachment.upload`` /
``groups.attachment.download``) on the in-process gateway — ``hermes serve``, the Desktop's backend.

The gateway-run worker serves the same two methods through ``gateway/session_group_controls.py``. Here they
run against the hosted-room service's store (``HostedRoomAttachmentStore(service.db_path)``): the one
``groups.send`` commits manifests into (``session_hosted_attachments.append_user_event``) and the one a
member turn's bound files are resolved from (``session_hosted_attachments.bound_submission_payload``).

Handlers are rebound onto server.py's globals at install (``method_ctx.bind_module``), which also publishes
this module's helpers and codes there; every fork import stays local to its handler."""

from .method_ctx import HandlerRegistry, bind_module

_registry = HandlerRegistry()
method = _registry.method

#: Advertised in ``groups.capabilities``: this gateway's member route carries a message's files.
FEATURES = ("room_attachments",)
METHODS = ("groups.attachment.upload", "groups.attachment.download")

ATTACH_CODE_INVALID = 4134
ATTACH_CODE_NOT_FOUND = 4135
ATTACH_CODE_ROOM = 4136
ATTACH_CODE_NO_SERVICE = 4137


def _attachment_call(name: str, rid, params: dict, body) -> dict:
    """Run ``body(service, room_id, gateway_id, epoch)`` on an owned live room under one error envelope."""
    from gateway.hosted_room_attachments import AttachmentError, AttachmentNotFoundError
    from gateway.hosted_rooms import HostedRoomError
    from tui_gateway.methods_groups import _DRIVER_UNAVAILABLE, _forward_to_owner, get_hosted_room_service
    # A room the running gateway imported is fenced in this process's store, so a local write here
    # would be refused ("managed by another gateway"): forward first, exactly as `_room_method`
    # does, and answer locally only when no gateway owns the room. Deferred import: the parent
    # module imports THIS one at module scope.
    if (forwarded := _forward_to_owner(rid, name, params)) is not None:
        return forwarded
    service = get_hosted_room_service()
    if service is None:
        return _err(rid, ATTACH_CODE_NO_SERVICE, _DRIVER_UNAVAILABLE)
    room_id = params.get("room_id")
    if not isinstance(room_id, str) or not room_id:
        return _err(rid, ATTACH_CODE_INVALID, "room_id is required")
    try:
        gateway_id, epoch = service._owned_authority(room_id)
        return _ok(rid, body(service, room_id, gateway_id, epoch))
    except HostedRoomError as exc:
        return _err(rid, ATTACH_CODE_ROOM, str(exc))
    except AttachmentNotFoundError as exc:
        return _err(rid, ATTACH_CODE_NOT_FOUND, str(exc))
    except AttachmentError as exc:
        return _err(rid, ATTACH_CODE_INVALID, str(exc))


@method("groups.attachment.upload")
def _(rid, params: dict) -> dict:
    """Store one file for a later ``groups.send`` manifest (idempotent per ``upload_id``)."""
    from gateway.hosted_room_attachments import HostedRoomAttachmentStore, decode_content_base64

    def body(service, room_id, _gateway_id, _epoch):
        data = decode_content_base64(params.get("data_base64"))
        return HostedRoomAttachmentStore(service.db_path).put(
            room_id=room_id, upload_id=params.get("upload_id"), kind=params.get("kind"),
            name=params.get("name"), mime=params.get("mime"), data=data)
    return _attachment_call("groups.attachment.upload", rid, params, body)


@method("groups.attachment.download")
def _(rid, params: dict) -> dict:
    """Read one committed attachment for a live room viewer: its metadata beside the bytes, base64."""
    from gateway.hosted_room_attachments import AttachmentError, HostedRoomAttachmentStore, encode_content_base64

    def body(service, room_id, gateway_id, epoch):
        if not params.get("event_id"):
            raise AttachmentError("event_id is required")
        saved = HostedRoomAttachmentStore(service.db_path).read_viewer(
            room_id=room_id, attachment_id=params.get("attachment_id"), event_id=params["event_id"],
            authority_gateway_id=gateway_id, authority_epoch=epoch)
        return {**saved.attachment, "data_base64": encode_content_base64(saved.data)}
    return _attachment_call("groups.attachment.download", rid, params, body)


def register(server) -> None:
    """Publish this module's helpers + handlers onto ``server``, rebound to its globals."""
    # FEATURES / METHODS stay module attributes: the settings sibling publishes the same names.
    bind_module(globals(), server, skip=("_", "FEATURES", "METHODS"))
