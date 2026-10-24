"""Workspace mount resolution for the Docker sandbox (``terminal.docker_mount_cwd_to_workspace`` and the
fork's per-session / custom-target switches): which host directory becomes the bind source, which
in-container path it lands on, and which paths are the sandbox's own and must never be re-mounted.

Sibling of :mod:`tools.terminal_tool` (the facade imports these names; patch them there).
"""

from __future__ import annotations

import logging
import os
import posixpath
from typing import Optional

from tools.terminal_tool_config import _is_host_cwd, _tenv

logger = logging.getLogger(__name__)


_MOUNT_CWD_ENV_VARS = {
    "docker": "TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE",
    "singularity": "TERMINAL_SINGULARITY_MOUNT_CWD_TO_WORKSPACE",
}
_WORKSPACE_PER_SESSION_ENV_VARS = {
    "docker": "TERMINAL_DOCKER_WORKSPACE_PER_SESSION",
    "singularity": "TERMINAL_SINGULARITY_WORKSPACE_PER_SESSION",
}
_DEFAULT_WORKSPACE_MOUNT_PATH = "/workspace"
_WORKSPACE_MOUNT_PATH_ENV_VARS = {
    "docker": "TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH",
    "singularity": "TERMINAL_SINGULARITY_WORKSPACE_MOUNT_PATH",
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
