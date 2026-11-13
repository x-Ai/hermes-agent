"""Workspace mount resolution for the Docker sandbox (``terminal.docker_mount_cwd_to_workspace`` and the
fork's per-session / custom-target switches): which host directory becomes the bind source, which
in-container path it lands on, and which paths are the sandbox's own and must never be re-mounted.

Sibling of :mod:`tools.terminal_tool` (the facade imports these names; patch them there).
"""

from __future__ import annotations

import logging
import os
import posixpath
from typing import Any, Optional

from tools.terminal_tool_config import _is_host_cwd, _tenv

logger = logging.getLogger(__name__)


_MOUNT_CWD_ENV_VARS = {
    "docker": "TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE",
}
_WORKSPACE_PER_SESSION_ENV_VARS = {
    "docker": "TERMINAL_DOCKER_WORKSPACE_PER_SESSION",
}
_DEFAULT_WORKSPACE_MOUNT_PATH = "/workspace"
_WORKSPACE_MOUNT_PATH_ENV_VARS = {
    "docker": "TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH",
}
_SANDBOX_PATH_PREFIXES = ("/workspace", "/root")
# no-tmp: ok — a denylist of mount TARGETS the workspace may not shadow, not scratch space.
_RESERVED_MOUNT_TARGETS = frozenset({"/root", "/home", "/tmp", "/var/tmp", "/run"})


def _workspace_mount_path(env_type: Optional[str] = None) -> str:
    """Resolve and validate the in-container project mount target."""
    if env_type is None:
        env_type = (_tenv("TERMINAL_ENV", "local") or "").strip().lower()
    env_var = _WORKSPACE_MOUNT_PATH_ENV_VARS.get(env_type)
    raw = (_tenv(env_var) or "").strip() if env_var else ""
    if not raw:
        return _DEFAULT_WORKSPACE_MOUNT_PATH
    normalized = posixpath.normpath(raw.replace("\\", "/"))
    if not normalized.startswith("/") or normalized == "/":
        logger.warning(
            "Ignoring invalid %s value %r (must be an absolute in-container path other than /); using %s.",
            env_var, raw, _DEFAULT_WORKSPACE_MOUNT_PATH,
        )
        return _DEFAULT_WORKSPACE_MOUNT_PATH
    if normalized in _RESERVED_MOUNT_TARGETS:
        logger.warning(
            "Ignoring %s value %r because it collides with a sandbox-internal mount point; using %s.",
            env_var, raw, _DEFAULT_WORKSPACE_MOUNT_PATH,
        )
        return _DEFAULT_WORKSPACE_MOUNT_PATH
    return normalized


def _is_sandbox_path(path: str, mount_path: str) -> bool:
    return path.startswith(_SANDBOX_PATH_PREFIXES) or path == mount_path or path.startswith(mount_path + "/")


def _is_host_path(cwd: str) -> bool:
    return bool(cwd) and _is_host_cwd(cwd)


def resolve_workspace_mount(raw_cwd: str) -> tuple[Optional[str], Optional[str]]:
    """Return ``(host source, sandbox target)`` for a mountable host cwd."""
    if not isinstance(raw_cwd, str) or not raw_cwd.strip():
        return None, None
    raw = raw_cwd.strip()
    mount_path = _workspace_mount_path()
    if _is_sandbox_path(raw, mount_path):
        return None, None
    if os.name == "nt" and raw.startswith("/"):
        return None, None
    candidate = os.path.abspath(os.path.expanduser(raw))
    if _is_sandbox_path(candidate, mount_path):
        return None, None
    if _is_host_path(candidate):
        return candidate, mount_path
    if os.path.isabs(candidate) and os.path.isdir(candidate):
        return candidate, mount_path
    return None, None


def _path_is_within(path: str, root: str) -> bool:
    """True when ``path`` equals ``root`` or is a descendant of it (segment-safe, symlink-aware)."""
    try:
        real_path = os.path.realpath(os.path.abspath(os.path.expanduser(path)))
        real_root = os.path.realpath(os.path.abspath(os.path.expanduser(root)))
    except OSError:
        return False
    if os.name == "nt":
        real_path, real_root = real_path.casefold(), real_root.casefold()
    return real_path == real_root or real_path.startswith(real_root.rstrip(os.sep) + os.sep)


def _translate_mounted_cwd(
    recorded: str, session_key: Optional[str], config: dict[str, Any]
) -> Optional[str]:
    """In-sandbox path for a recorded HOST cwd that sits inside this session's mounted workspace
    (``/private/tmp/proj`` → ``/workspace``; a subdirectory keeps its relative tail). None when the
    session mounts nothing or the path is outside the mount."""
    from tools.terminal_tool import _resolve_task_host_cwd, _resolve_workspace_mount_for_task

    mount_source, mount_target = _resolve_workspace_mount_for_task(session_key, config)
    if not mount_source or not mount_target:
        host_cwd = _resolve_task_host_cwd(config, session_key)
        if not host_cwd:
            return None
        mount_source = host_cwd
        mount_target = str(config.get("workspace_mount_path") or _DEFAULT_WORKSPACE_MOUNT_PATH)
    if not _path_is_within(recorded, mount_source):
        return None
    real_recorded = os.path.realpath(os.path.abspath(os.path.expanduser(recorded)))
    real_source = os.path.realpath(os.path.abspath(os.path.expanduser(mount_source)))
    tail = os.path.relpath(real_recorded, real_source)
    if tail in (".", ""):
        return mount_target
    return posixpath.join(mount_target, *tail.split(os.sep))
