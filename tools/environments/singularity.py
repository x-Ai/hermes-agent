"""Singularity/Apptainer persistent container environment.

Security-hardened with --containall, --no-home, capability dropping. Supports
resource limits and optional persistence via writable overlay dirs that survive sessions.
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
from tools.environments.base import BaseEnvironment, _load_json_store, _save_json_store
from tools.environments.base_output import _popen_bash
from tools.environments.path_utils import sanitize_task_id_for_path
from tools.environments.remote_common import bash_argv, run_capture

logger = logging.getLogger(__name__)

_SNAPSHOT_STORE = get_hermes_home() / "singularity_snapshots.json"
_INSTANCE_NAME_UNSAFE_RE = re.compile(r"[^A-Za-z0-9_]")


def _get_active_profile_name() -> str:
    try:
        from hermes_cli.profiles import get_active_profile_name

        return get_active_profile_name() or "default"
    except Exception:
        return "default"


def _persistent_instance_name(task_id: str, profile_name: str) -> str:
    task_text = str(task_id or "default")
    profile_text = str(profile_name or "default")
    readable = _INSTANCE_NAME_UNSAFE_RE.sub("_", task_text)[:24].strip("_") or "task"
    identity = f"{task_text}\0{profile_text}"
    digest = hashlib.sha256(identity.encode("utf-8", "surrogatepass")).hexdigest()[:16]
    return f"hermes_{readable}_{digest}"


def _find_singularity_executable() -> str:
    """Locate the apptainer or singularity CLI binary."""
    for exe in ("apptainer", "singularity"):
        if shutil.which(exe):
            return exe
    raise RuntimeError(
        "Neither 'apptainer' nor 'singularity' was found in PATH. "
        "Install Apptainer (https://apptainer.org/docs/admin/main/installation.html) "
        "or Singularity and ensure the CLI is available.")


def _ensure_singularity_available() -> str:
    """Preflight check: resolve the executable and verify it responds."""
    exe = _find_singularity_executable()
    try:
        result = run_capture([exe, "version"], timeout=10)
    except FileNotFoundError:
        raise RuntimeError(f"Singularity backend selected but '{exe}' could not be executed.")
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
    """``TERMINAL_SCRATCH_DIR`` override, else a writable ``/scratch`` (HPC), else the sandbox dir."""
    custom_scratch = os.getenv("TERMINAL_SCRATCH_DIR")
    if custom_scratch:
        scratch_path = Path(custom_scratch)
    else:
        from tools.environments.base import get_sandbox_dir
        scratch_path = get_sandbox_dir() / "singularity"
        scratch = Path("/scratch")
        if scratch.exists() and os.access(scratch, os.W_OK):
            scratch_path = scratch / os.getenv("USER", "hermes") / "hermes-agent"
            scratch_path.mkdir(parents=True, exist_ok=True)
            logger.info("Using /scratch for sandboxes: %s", scratch_path)
    scratch_path.mkdir(parents=True, exist_ok=True)
    return scratch_path


def _get_apptainer_cache_dir() -> Path:
    cache_dir = os.getenv("APPTAINER_CACHEDIR")
    cache_path = Path(cache_dir) if cache_dir else _get_scratch_dir() / ".apptainer"
    cache_path.mkdir(parents=True, exist_ok=True)
    return cache_path


_sif_build_lock = threading.Lock()


def _get_or_build_sif(image: str, executable: str = "apptainer") -> str:
    """Build (once, cached) a SIF from a ``docker://`` URL; falls back to the URL on failure."""
    if (image.endswith('.sif') and Path(image).exists()) or not image.startswith('docker://'):
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

        # External build tool may need registry credentials from the user env — exact preservation.
        from tools.environments.local import build_subprocess_env
        env = build_subprocess_env(scrub_secrets=False, inherit_profile_home=False)
        env["APPTAINER_TMPDIR"] = str(tmp_dir)
        env["APPTAINER_CACHEDIR"] = str(cache_dir)

        try:
            result = run_capture([executable, "build", str(sif_path), image], timeout=600, env=env)
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
    Session snapshot preserves env vars across calls; CWD persists via in-band stdout markers.
    """

    def __init__(self, image: str, cwd: str = "~", timeout: int = 60, cpu: float = 0,
                 memory: int = 0, disk: int = 0, persistent_filesystem: bool = False,
                 task_id: str = "default", host_cwd: str = None,
                 auto_mount_cwd: bool = False,
                 workspace_mount_path: str = "/workspace"):
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
                    "Singularity: skipping cwd mount because host_cwd is not a valid directory: %s",
                    host_cwd,
                )

        if self._persistent:
            # A raw session-key task_id carries colons etc. unsafe in host path components;
            # the shared sanitizer keeps all backends agreeing on the mapping.
            self._overlay_dir = (
                _get_scratch_dir() / "hermes-overlays" / f"overlay-{sanitize_task_id_for_path(task_id)}")
            self._overlay_dir.mkdir(parents=True, exist_ok=True)

        self._start_instance()
        self.init_session()

    def _instance_is_running(self) -> bool:
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
                self.instance_id, self._task_id, self._profile_name,
            )
            return
        cmd = [self.executable, "instance", "start", "--containall", "--no-home"]
        if self._persistent and self._overlay_dir:
            cmd.extend(["--overlay", str(self._overlay_dir)])
        else:
            cmd.append("--writable-tmpfs")

        if self._host_workspace:
            cmd.extend([
                "--bind",
                f"{self._host_workspace}:{self._workspace_mount_path}",
            ])
            logger.info(
                "Singularity: mounting host workspace %s -> %s",
                self._host_workspace, self._workspace_mount_path,
            )

        try:
            from tools.credential_files import get_credential_file_mounts, get_skills_directory_mount
            for entry in (*get_credential_file_mounts(), *get_skills_directory_mount()):
                cmd.extend(["--bind", f"{entry['host_path']}:{entry['container_path']}:ro"])
        except Exception as e:
            logger.debug("Singularity: could not load credential/skills mounts: %s", e)

        if self._memory > 0:
            cmd.extend(["--memory", f"{self._memory}M"])
        if self._cpu > 0:
            cmd.extend(["--cpus", str(self._cpu)])
        cmd.extend([str(self.image), self.instance_id])

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=120,
                stdin=subprocess.DEVNULL,
            )
        except subprocess.TimeoutExpired:
            if self._persistent and self._instance_is_running():
                self._instance_started = True
                self._instance_reused = True
                logger.info(
                    "Recovered timed-out Singularity start via running instance %s",
                    self.instance_id,
                )
                return
            raise RuntimeError("Instance start timed out")
        if result.returncode != 0:
            if self._persistent and self._instance_is_running():
                self._instance_started = True
                self._instance_reused = True
                logger.info(
                    "Joined concurrently created Singularity instance %s",
                    self.instance_id,
                )
                return
            raise RuntimeError(f"Failed to start instance: {result.stderr}")
        self._instance_started = True
        logger.info("Singularity instance %s started (persistent=%s)", self.instance_id, self._persistent)

    def _run_bash(self, cmd_string: str, *, login: bool = False, timeout: int = 120,
                  stdin_data: str | None = None) -> subprocess.Popen:
        """Spawn a bash process inside the Singularity instance."""
        if not self._instance_started:
            raise RuntimeError("Singularity instance not started")
        cmd = [self.executable, "exec", f"instance://{self.instance_id}", *bash_argv(cmd_string, login)]
        return _popen_bash(cmd, stdin_data)

    def cleanup(self, *, force_remove: bool = False):
        """Detach persistent shared instances unless explicit removal is requested."""
        should_stop = self._instance_started and (force_remove or not self._persistent)
        if should_stop:
            try:
                subprocess.run(
                    [self.executable, "instance", "stop", self.instance_id],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=30,
                    stdin=subprocess.DEVNULL,
                )
                logger.info("Singularity instance %s stopped", self.instance_id)
            except Exception as e:
                logger.warning("Failed to stop Singularity instance %s: %s", self.instance_id, e)
        self._instance_started = False

        if self._persistent and self._overlay_dir:
            snapshots = _load_snapshots()
            snapshots[self._task_id] = str(self._overlay_dir)
            _save_snapshots(snapshots)
