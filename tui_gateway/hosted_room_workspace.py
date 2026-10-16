"""Working directories for hosted-room member turns (fork).

The Desktop's rooms carry a working-directory ladder (a member's own folder, else the thread's, else the
room's — ``gateway/hosted_room_settings.py``). A hosted member runs on one hidden session per room, so the
ladder is applied per TURN: right after the driver resolved or created the member session and before it
submits the prompt, the session is re-homed to the ladder's answer through the transport's
``set_workspace`` (``session.cwd.set`` on the in-process route). Routes without that door (peers) keep
their own cwd; a folder that no longer exists is logged and the turn runs where the session already is.
"""

from __future__ import annotations

import logging
from typing import Any

from gateway.hosted_room_settings import read_settings, resolve_member_cwd

logger = logging.getLogger(__name__)


def apply_member_workspace(db_path: Any, transport: Any, *, profile: str, session_id: str, room_id: str,
                           member_id: str, thread_id: str | None) -> str | None:
    """Re-home ``session_id`` to the room ladder's folder for this turn; the folder applied, else None."""
    setter = getattr(transport, "set_workspace", None)
    if setter is None:
        return None
    try:
        settings = read_settings(db_path, room_id)["settings"]
    except Exception:
        logger.warning("room %s: settings unreadable, member turn keeps its cwd", room_id, exc_info=True)
        return None
    cwd = resolve_member_cwd(settings, member_id=member_id, thread_id=thread_id)
    if not cwd:
        return None
    try:
        setter(profile=profile, session_id=session_id, cwd=cwd)
    except Exception:
        # Transport boundary: a vanished folder, a busy session or a route error must not fail the turn.
        logger.warning("room %s: member %s keeps its cwd (%s not applied)", room_id, member_id, cwd, exc_info=True)
        return None
    return cwd
