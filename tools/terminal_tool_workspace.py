"""Workspace mount resolution for the Docker sandbox (``terminal.docker_mount_cwd_to_workspace`` and the
fork's per-session / custom-target switches): which host directory becomes the bind source, which
in-container path it lands on, and which paths are the sandbox's own and must never be re-mounted.

Sibling of :mod:`tools.terminal_tool` (the facade imports these names; patch them there).
"""

from __future__ import annotations

import hashlib
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


def _workspace_cwd_for_task(task_id: Optional[str], config_cwd: str = "") -> str:
    """Host cwd shared by workspace identity and mount resolution."""
    from tools import terminal_tool as _tt
    overrides = _tt._task_env_overrides.get(_tt._qualify_task_key(task_id or "default")) or {}
    return str(overrides.get("cwd") or _tt.get_session_cwd(task_id) or config_cwd or "")


def _resolve_workspace_per_session(env_type: str, mount_cwd_enabled: bool) -> bool:
    per_session_var = _WORKSPACE_PER_SESSION_ENV_VARS.get(env_type)
    return bool(
        per_session_var
        and mount_cwd_enabled
        and _tenv(per_session_var, "false").strip().lower() in {"true", "1", "yes", "on"}
    )


def _workspace_per_session_enabled() -> bool:
    from tools import terminal_tool as _tt
    _tt._ensure_terminal_env_bridged()
    env_type = (_tenv("TERMINAL_ENV", "local") or "").strip().lower()
    mount_var = _MOUNT_CWD_ENV_VARS.get(env_type)
    mount_enabled = bool(
        mount_var and _tenv(mount_var, "false").strip().lower() in {"true", "1", "yes", "on"}
    )
    return _resolve_workspace_per_session(env_type, mount_enabled)


def _workspace_profile_identity() -> str:
    """Profile component of a per-project workspace key: two profiles on ONE directory must not
    share an environment (image, forwarded env, egress posture all differ per profile)."""
    from tools import terminal_tool as _tt
    profile = _tt._current_session_profile() or ""
    routed = _tt._routed_home_task_key(True) or ""
    shared = _tenv("TERMINAL_DOCKER_SHARED_CONTAINER_KEY", "") or ""
    return f"{profile}\n{routed}\n{shared.strip()}"


def _mounted_workspace_key(host_path: str) -> str:
    """``ws-<digest>`` identity of a per-session project mount (host path + mount path + profile);
    distinct from upstream's ``<base>:ws:<digest>`` key for a session that registered a cwd."""
    try:
        normalized = os.path.realpath(os.path.abspath(os.path.expanduser(host_path)))
    except OSError:
        normalized = host_path
    identity = f"{normalized.casefold()}\n{_workspace_mount_path()}\n{_workspace_profile_identity()}"
    digest = hashlib.sha256(identity.encode("utf-8", "surrogatepass")).hexdigest()
    return f"ws-{digest[:12]}"


def _resolve_workspace_mount_for_task(
    task_id: Optional[str], config: dict[str, Any]
) -> tuple[Optional[str], Optional[str]]:
    if not config.get("workspace_per_session"):
        return None, None
    # A session with no registered/recorded cwd (plain CLI, cron without a workdir) falls back to
    # the launch directory the config already advertises as ``host_cwd``: every such session keys
    # and mounts the same directory, so there is still no per-session fan-out, but the sandbox is
    # no longer an empty tmpfs while ``host_cwd`` claims the launch dir is mounted. ``config["cwd"]``
    # is the already-translated in-sandbox path and never a mount source.
    return resolve_workspace_mount(_workspace_cwd_for_task(task_id, config.get("host_cwd") or ""))
