"""Hand root-written files in a mounted host project directory back to the host user.

``docker_ownership`` covers the Hermes-created sandbox binds when a root container is removed. The
host working directory that ``docker_mount_cwd_to_workspace`` / ``docker_workspace_per_session``
bind into the container is the user's own tree, so two things differ. Nothing is flipped back to
root later: the rest of that tree is host-owned already, so the container copes with host-owned
files there anyway, and no record is written beside the directory. And only what THIS container
created as root may change owner: a root-owned path that was there before the container started
(another tool's output, a bind of some other container) stays root's. The baseline is a no-symlink
walk for root-owned entries right after the container starts; the handback walks again when the
session releases the container and gives the difference to the host user. Persist mode keeps the
container running, so that walk goes through ``docker exec``; a stopped one (session-scoped
teardown, after ``docker stop`` and before ``docker rm``) gets the throwaway container the sandbox
handback uses. Same gates as the sandbox handback: a Linux host, a root container, a daemon that
does not remap users. A failed or timed-out baseline walk disables the handback for that container
rather than guessing.
"""

from __future__ import annotations

import logging
import secrets
import subprocess
import time
from typing import Optional

from tools.environments.docker_ownership import (
    _CHOWN_TIMEOUT_S, _SAFE_ENV, _THROWAWAY_CONFINEMENT, _chown, _handback_ids, _inspect, _runs_as_root, _walk,
)

logger = logging.getLogger(__name__)

# The baseline walk runs before the container's first command; a tree too big to list in this
# budget keeps today's behaviour (nothing handed back) instead of delaying every session start.
_BASELINE_TIMEOUT_S = 5


def _target(info: dict, container_id: str) -> list[str]:
    """``docker exec`` into a running container, else a throwaway of its image with its volumes."""
    if (info.get("State") or {}).get("Running"):
        return ["exec", "-i", "-u", "0:0", *_SAFE_ENV, container_id]
    return ["run", "--rm", "-i", "--pull", "never", "--network", "none", "--user", "0:0", *_THROWAWAY_CONFINEMENT,
            *_SAFE_ENV, "--name", f"hermes-handback-{container_id[:12]}-{secrets.token_hex(4)}",
            "--volumes-from", container_id, "--entrypoint", "", info["Image"]]


def _root_container(docker_exe: str, container_id: str, mounts: list[tuple[str, str]]):
    """``(ids, info)`` when the handback applies to this container, else ``(None, None)``."""
    ids = _handback_ids(docker_exe) if mounts else None
    info = _inspect(docker_exe, container_id) if ids else None
    if not info or not _runs_as_root(info):
        return None, None
    return ids, info


def project_mount_baseline(docker_exe: str, container_id: str,
                           mounts: list[tuple[str, str]]) -> Optional[frozenset[bytes]]:
    """Root-owned entries under the project mounts (``(host_dir, container_path)``) as the container
    starts, or ``None`` when no handback applies (no mounts, a non-Linux host, a remapped daemon, a
    container not running as root) or the walk failed. Without a baseline nothing is handed back
    later, so a root-owned file the user had before is never touched by mistake."""
    _, info = _root_container(docker_exe, container_id, mounts)
    if info is None:
        return None
    try:
        paths = _walk(docker_exe, _target(info, container_id), mounts, info, 0,
                      time.monotonic() + _BASELINE_TIMEOUT_S)
    except (subprocess.TimeoutExpired, OSError, KeyError) as e:
        logger.debug("project ownership baseline of %s failed: %s", container_id[:12], e)
        return None
    return None if paths is None else frozenset(paths)


def hand_back_project_files(docker_exe: str, container_id: str, mounts: list[tuple[str, str]],
                            baseline: Optional[frozenset[bytes]]) -> None:
    """Give the host user every root-owned entry under the project mounts that was not root-owned at
    the baseline: what this container created as root. Runs while the container is still up (persist
    mode) or after it stopped (session-scoped teardown). Best-effort: a gone container, an image
    without ``find`` or a timeout logs at debug and leaves the files as they are."""
    if baseline is None:
        return
    ids, info = _root_container(docker_exe, container_id, mounts)
    if info is None:
        return
    target = _target(info, container_id)
    deadline = time.monotonic() + _CHOWN_TIMEOUT_S
    try:
        owned = _walk(docker_exe, target, mounts, info, 0, deadline)
        paths = [p for p in owned or [] if p not in baseline]
        if paths:
            _chown(docker_exe, target, paths, f"{ids[0]}:{ids[1]}", deadline)
    except (subprocess.TimeoutExpired, OSError, KeyError) as e:
        logger.debug("project ownership handback of %s failed: %s", container_id[:12], e)
