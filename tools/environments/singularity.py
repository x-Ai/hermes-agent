"""Singularity/Apptainer persistent container environment.

Security-hardened with --containall, --no-home, capability dropping.
Supports configurable resource limits and optional filesystem persistence
via writable overlay directories that survive across sessions.
"""

import hashlib
import logging
import os
import re
import shutil
import subprocess
import threading
import uuid
from pathlib import Path
from typing import Optional

from hermes_constants import get_hermes_home
from tools.environments.base import (
    BaseEnvironment,
    _load_json_store,
    _popen_bash,
    _save_json_store,
    sanitize_task_id_for_path,
)

logger = logging.getLogger(__name__)

_SNAPSHOT_STORE = get_hermes_home() / "singularity_snapshots.json"

_INSTANCE_NAME_UNSAFE_RE = re.compile(r"[^A-Za-z0-9_]")


def _get_active_profile_name() -> str:
    """Return the profile that owns a persistent instance."""
    try:
        from hermes_cli.profiles import get_active_profile_name

        return get_active_profile_name() or "default"
    except Exception:
        return "default"


def _persistent_instance_name(task_id: str, profile_name: str) -> str:
    """Return a stable, user-scoped rendezvous name for an instance.

    ``instance list`` followed by a randomly named ``instance start`` is a
    cross-process check-then-create race. Apptainer instance names are unique
    for a user, so a deterministic name makes ``instance start`` the atomic
    winner election when overlapping Hermes backends initialize the same
    project.
    """
    task_text = str(task_id or "default")
    profile_text = str(profile_name or "default")
    readable = _INSTANCE_NAME_UNSAFE_RE.sub("_", task_text)[:24].strip("_") or "task"
    identity = f"{task_text}\0{profile_text}"
    digest = hashlib.sha256(identity.encode("utf-8", "surrogatepass")).hexdigest()[:16]
    return f"hermes_{readable}_{digest}"


def _find_singularity_executable() -> str:
    """Locate the apptainer or singularity CLI binary."""
    if shutil.which("apptainer"):
        return "apptainer"
    if shutil.which("singularity"):
        return "singularity"
    raise RuntimeError(
        "Neither 'apptainer' nor 'singularity' was found in PATH. "
        "Install Apptainer (https://apptainer.org/docs/admin/main/installation.html) "
        "or Singularity and ensure the CLI is available."
    )


def _ensure_singularity_available() -> str:
    """Preflight check: resolve the executable and verify it responds."""
    exe = _find_singularity_executable()
    try:
        result = subprocess.run(
            [exe, "version"], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=10,
            stdin=subprocess.DEVNULL,
        )
    except FileNotFoundError:
        raise RuntimeError(
            f"Singularity backend selected but '{exe}' could not be executed."
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"'{exe} version' timed out.")

    if result.returncode != 0:
        stderr = result.stderr.strip()[:200]
        raise RuntimeError(f"'{exe} version' failed (exit code {result.returncode}): {stderr}")
    return exe


def _load_snapshots() -> dict:
    return _load_json_store(_SNAPSHOT_STORE)


def _save_snapshots(data: dict) -> None:
    _save_json_store(_SNAPSHOT_STORE, data)


def _get_scratch_dir() -> Path:
    custom_scratch = os.getenv("TERMINAL_SCRATCH_DIR")
    if custom_scratch:
        scratch_path = Path(custom_scratch)
        scratch_path.mkdir(parents=True, exist_ok=True)
        return scratch_path

    from tools.environments.base import get_sandbox_dir
    sandbox = get_sandbox_dir() / "singularity"

    scratch = Path("/scratch")
    if scratch.exists() and os.access(scratch, os.W_OK):
        user_scratch = scratch / os.getenv("USER", "hermes") / "hermes-agent"
        user_scratch.mkdir(parents=True, exist_ok=True)
        logger.info("Using /scratch for sandboxes: %s", user_scratch)
        return user_scratch

    sandbox.mkdir(parents=True, exist_ok=True)
    return sandbox


def _get_apptainer_cache_dir() -> Path:
    cache_dir = os.getenv("APPTAINER_CACHEDIR")
    if cache_dir:
        cache_path = Path(cache_dir)
        cache_path.mkdir(parents=True, exist_ok=True)
        return cache_path
    scratch = _get_scratch_dir()
    cache_path = scratch / ".apptainer"
    cache_path.mkdir(parents=True, exist_ok=True)
    return cache_path


_sif_build_lock = threading.Lock()


def _get_or_build_sif(image: str, executable: str = "apptainer") -> str:
    if image.endswith('.sif') and Path(image).exists():
        return image
    if not image.startswith('docker://'):
        return image

    image_name = image.replace('docker://', '').replace('/', '-').replace(':', '-')
    cache_dir = _get_apptainer_cache_dir()
    sif_path = cache_dir / f"{image_name}.sif"

    if sif_path.exists():
        return str(sif_path)

    with _sif_build_lock:
        if sif_path.exists():
            return str(sif_path)

        logger.info("Building SIF image (one-time setup)...")
        logger.info("  Source: %s", image)
        logger.info("  Target: %s", sif_path)

        tmp_dir = cache_dir / "tmp"
        tmp_dir.mkdir(parents=True, exist_ok=True)

        # apptainer/singularity build: external tool, may need registry
        # credentials from the user env — exact preservation.
        from tools.environments.local import build_subprocess_env
        env = build_subprocess_env(scrub_secrets=False, inherit_profile_home=False)
        env["APPTAINER_TMPDIR"] = str(tmp_dir)
        env["APPTAINER_CACHEDIR"] = str(cache_dir)

        try:
            result = subprocess.run(
                [executable, "build", str(sif_path), image],
                capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=600, env=env,
                stdin=subprocess.DEVNULL,
            )
            if result.returncode != 0:
                logger.warning("SIF build failed, falling back to docker:// URL")
                logger.warning("  Error: %s", result.stderr[:500])
                return image
            logger.info("SIF image built successfully")
            return str(sif_path)
        except subprocess.TimeoutExpired:
            logger.warning("SIF build timed out, falling back to docker:// URL")
            if sif_path.exists():
                sif_path.unlink()
            return image
        except Exception as e:
            logger.warning("SIF build error: %s, falling back to docker:// URL", e)
            return image


class SingularityEnvironment(BaseEnvironment):
    """Hardened Singularity/Apptainer container with resource limits and persistence.

    Spawn-per-call: every execute() spawns a fresh ``apptainer exec ... bash -c`` process.
    Session snapshot preserves env vars across calls.
    CWD persists via in-band stdout markers.
    """

    def __init__(
        self,
        image: str,
        cwd: str = "~",
        timeout: int = 60,
        cpu: float = 0,
        memory: int = 0,
        disk: int = 0,
        persistent_filesystem: bool = False,
        task_id: str = "default",
        host_cwd: str = None,
        auto_mount_cwd: bool = False,
        workspace_mount_path: str = "/workspace",
    ):
        super().__init__(cwd=cwd, timeout=timeout)
        self.executable = _ensure_singularity_available()
        self.image = _get_or_build_sif(image, self.executable)
        self._persistent = persistent_filesystem
        self._task_id = task_id
        self._profile_name = _get_active_profile_name()
        self.instance_id = (
            _persistent_instance_name(task_id, self._profile_name)
            if self._persistent
            else f"hermes_{uuid.uuid4().hex[:12]}"
        )
        self._instance_started = False
        self._instance_reused = False
        self._overlay_dir: Optional[Path] = None
        self._cpu = cpu
        self._memory = memory

        # Opt-in host workspace mount (singularity_mount_cwd_to_workspace):
        # bind the host project directory to the workspace mount path,
        # mirroring the Docker backend's -v semantics. The existence check is
        # the same final defense DockerEnvironment applies — the resolver
        # upstream may hand us a host path it did not (or could not) verify.
        self._workspace_mount_path = (
            (workspace_mount_path or "/workspace").rstrip("/") or "/workspace"
        )
        host_cwd_abs = os.path.abspath(os.path.expanduser(host_cwd)) if host_cwd else ""
        self._host_workspace: Optional[str] = None
        if auto_mount_cwd and host_cwd_abs:
            if os.path.isdir(host_cwd_abs):
                self._host_workspace = host_cwd_abs
            else:
                logger.debug(
                    "Singularity: skipping cwd mount — host_cwd is not a valid directory: %s",
                    host_cwd,
                )

        if self._persistent:
            overlay_base = _get_scratch_dir() / "hermes-overlays"
            overlay_base.mkdir(parents=True, exist_ok=True)
            # A raw session-key task_id carries colons and other characters
            # that are unsafe in host path components (same class of bug as
            # the docker -v mount failure); route it through the shared
            # sanitizer so all backends agree on the mapping.
            self._overlay_dir = overlay_base / f"overlay-{sanitize_task_id_for_path(task_id)}"
            self._overlay_dir.mkdir(parents=True, exist_ok=True)

        self._start_instance()
        self.init_session()

    def _instance_is_running(self) -> bool:
        """Return whether our exact user-owned instance is currently listed."""
        try:
            result = subprocess.run(
                [self.executable, "instance", "list", self.instance_id],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=15,
                stdin=subprocess.DEVNULL,
            )
        except (OSError, subprocess.TimeoutExpired):
            return False

        if result.returncode != 0:
            return False

        # ``instance list <glob>`` still prints the header when there is no
        # match. Instance names contain no whitespace, so the first table
        # column is an exact and version-compatible membership check for both
        # Apptainer and legacy Singularity.
        return any(
            fields and fields[0] == self.instance_id
            for fields in (line.split() for line in result.stdout.splitlines())
        )

    def _start_instance(self):
        if self._persistent and self._instance_is_running():
            self._instance_started = True
            self._instance_reused = True
            logger.info(
                "Reusing Singularity instance %s (task=%s, profile=%s)",
                self.instance_id,
                self._task_id,
                self._profile_name,
            )
            return

        cmd = [self.executable, "instance", "start"]
        cmd.extend(["--containall", "--no-home"])

        if self._persistent and self._overlay_dir:
            cmd.extend(["--overlay", str(self._overlay_dir)])
        else:
            cmd.append("--writable-tmpfs")

        if self._host_workspace:
            # Read-write on purpose: the entire point of the opt-in is letting
            # the agent work on the live project tree, exactly like Docker's
            # auto-mounted workspace. Bind mounts stack above the overlay /
            # tmpfs, so the rest of the filesystem stays sandbox-owned.
            cmd.extend(["--bind", f"{self._host_workspace}:{self._workspace_mount_path}"])
            logger.info(
                "Singularity: mounting host workspace %s -> %s",
                self._host_workspace, self._workspace_mount_path,
            )

        try:
            from tools.credential_files import get_credential_file_mounts, get_skills_directory_mount
            for mount_entry in get_credential_file_mounts():
                cmd.extend(["--bind", f"{mount_entry['host_path']}:{mount_entry['container_path']}:ro"])
            for skills_mount in get_skills_directory_mount():
                cmd.extend(["--bind", f"{skills_mount['host_path']}:{skills_mount['container_path']}:ro"])
        except Exception as e:
            logger.debug("Singularity: could not load credential/skills mounts: %s", e)

        if self._memory > 0:
            cmd.extend(["--memory", f"{self._memory}M"])
        if self._cpu > 0:
            cmd.extend(["--cpus", str(self._cpu)])

        cmd.extend([str(self.image), self.instance_id])

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=120, stdin=subprocess.DEVNULL)
            if result.returncode != 0:
                # Another backend may have won the deterministic-name race
                # after our preflight list but before this start. Do not rely
                # on localized/version-specific stderr; verify the winner by
                # querying the exact instance name.
                if self._persistent and self._instance_is_running():
                    self._instance_started = True
                    self._instance_reused = True
                    logger.info(
                        "Joined concurrently created Singularity instance %s "
                        "(task=%s, profile=%s)",
                        self.instance_id,
                        self._task_id,
                        self._profile_name,
                    )
                    return
                raise RuntimeError(f"Failed to start instance: {result.stderr}")
            self._instance_started = True
            logger.info("Singularity instance %s started (persistent=%s)",
                        self.instance_id, self._persistent)
        except subprocess.TimeoutExpired:
            # The timed-out launcher may have crossed the point where the
            # background instance became visible, or a sibling backend may
            # have won while it was blocked. Prefer the verified running
            # instance over reporting a false startup failure.
            if self._persistent and self._instance_is_running():
                self._instance_started = True
                self._instance_reused = True
                logger.info(
                    "Recovered timed-out Singularity start via running instance %s",
                    self.instance_id,
                )
                return
            raise RuntimeError("Instance start timed out")

    def _run_bash(self, cmd_string: str, *, login: bool = False,
                  timeout: int = 120,
                  stdin_data: str | None = None) -> subprocess.Popen:
        """Spawn a bash process inside the Singularity instance."""
        if not self._instance_started:
            raise RuntimeError("Singularity instance not started")

        cmd = [self.executable, "exec",
               f"instance://{self.instance_id}"]
        if login:
            cmd.extend(["bash", "-l", "-c", cmd_string])
        else:
            cmd.extend(["bash", "-c", cmd_string])

        return _popen_bash(cmd, stdin_data)

    def cleanup(self, *, force_remove: bool = False):
        """Release this handle, preserving shared persistent instances.

        A persistent instance is shared across Hermes backend processes. A
        normal session/idle/atexit cleanup must therefore not stop it out from
        under another process. ``force_remove=True`` remains the explicit
        teardown path. Non-persistent instances retain their prior stop-on-
        cleanup behavior.
        """
        should_stop = self._instance_started and (force_remove or not self._persistent)
        if should_stop:
            try:
                subprocess.run(
                    [self.executable, "instance", "stop", self.instance_id],
                    capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=30,
                    stdin=subprocess.DEVNULL,
                )
                logger.info("Singularity instance %s stopped", self.instance_id)
            except Exception as e:
                logger.warning("Failed to stop Singularity instance %s: %s", self.instance_id, e)

        # Always detach the Python handle. A later environment construction
        # rechecks Apptainer's user-scoped instance registry.
        self._instance_started = False

        if self._persistent and self._overlay_dir:
            snapshots = _load_snapshots()
            snapshots[self._task_id] = str(self._overlay_dir)
            _save_snapshots(snapshots)
