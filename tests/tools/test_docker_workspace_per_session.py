"""Per-session Docker workspace mounting (``terminal.docker_workspace_per_session``).

Three behaviours are pinned here, all of them contracts rather than snapshots:

1. ``resolve_docker_workspace_mount`` splits a path into (mount source,
   container workdir), and never mistakes a sandbox path for a host one.
   The Windows case is load-bearing: ``os.path.abspath("/workspace")`` yields
   ``C:\\workspace`` on a Windows host, so deciding after abspath() would
   bind-mount over the container's own workspace.
2. Container identity follows the workspace directory when the opt-in is on and
   collapses back to the shared ``"default"`` container when it is off. A
   container's ``/workspace`` bind mount is fixed at ``docker run`` time, so two
   sessions on different projects cannot share one container — but that is only
   true under the opt-in, and the default must not start multiplying containers.
3. The dangerous-command approval gate (``_docker_has_host_access``) tracks the
   mount that was *actually* resolved for this call, not the startup snapshot.
   A stale answer here hands the agent host write access under sandbox-grade
   approval rules.
"""

import os
import sys
from pathlib import Path

import pytest

_repo_root = Path(__file__).resolve().parent.parent.parent
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))

import tools.terminal_tool as tt

_WINDOWS = os.name == "nt"


@pytest.fixture
def projects(tmp_path):
    """Two real sibling project directories on the host."""
    a = tmp_path / "projA"
    b = tmp_path / "projB"
    a.mkdir()
    b.mkdir()
    return a, b


@pytest.fixture
def per_session_on(monkeypatch):
    """Docker backend with both mount opt-ins enabled."""
    monkeypatch.setenv("TERMINAL_ENV", "docker")
    monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
    monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")


@pytest.fixture(autouse=True)
def _clean_overrides():
    """Keep the module-global override registry from leaking between tests."""
    yield
    for key in list(tt._task_env_overrides):
        tt.clear_task_env_overrides(key)


# ---------------------------------------------------------------------------
# 1. Mount resolution
# ---------------------------------------------------------------------------

class TestResolveDockerWorkspaceMount:
    def test_real_host_dir_becomes_a_mount_into_workspace(self, projects):
        proj, _ = projects
        assert tt.resolve_docker_workspace_mount(str(proj)) == (
            str(proj), "/workspace",
        )

    def test_sandbox_paths_are_never_mount_sources(self):
        # These live inside the container. Mounting a host directory over them
        # would clobber the sandbox's own workspace/home.
        for sandbox_path in ("/workspace", "/workspace/sub", "/root", "/root/x"):
            assert tt.resolve_docker_workspace_mount(sandbox_path) == (None, None), (
                f"{sandbox_path!r} is a container path and must not be mounted"
            )

    def test_blank_input_resolves_to_no_mount(self):
        for blank in ("", "   ", None, 123):
            assert tt.resolve_docker_workspace_mount(blank) == (None, None)

    def test_equivalent_spellings_resolve_to_one_mount_source(self, projects):
        proj, _ = projects
        spellings = [
            str(proj),
            str(proj) + os.sep,
            str(proj / "sub" / ".."),
        ]
        resolved = {tt.resolve_docker_workspace_mount(s)[0] for s in spellings}
        assert len(resolved) == 1, (
            f"one directory produced {len(resolved)} mount sources: {resolved}"
        )

    @pytest.mark.skipif(not _WINDOWS, reason="Windows host path semantics")
    def test_posix_rooted_path_is_not_a_host_dir_on_windows(self):
        # os.path.abspath('/workspace') == 'C:\\workspace' here, which matches
        # the C: host-path prefix. Deciding after abspath() would mount it.
        for posix_path in ("/workspace", "/root", "/home/user/proj", "/Users/me/proj"):
            assert tt.resolve_docker_workspace_mount(posix_path) == (None, None), (
                f"{posix_path!r} is not a Windows host directory"
            )

    @pytest.mark.skipif(_WINDOWS, reason="POSIX host path semantics")
    def test_posix_user_roots_are_host_dirs_on_posix(self):
        # Mirrors the documented startup behaviour: a host user directory is a
        # mount source even when it does not exist on this machine, because
        # DockerEnvironment does the final existence check.
        for host_path in ("/Users/someone/proj", "/home/someone/proj"):
            source, workdir = tt.resolve_docker_workspace_mount(host_path)
            assert (source, workdir) == (host_path, "/workspace")


class TestWindowsDriveGuard:
    """Every drive letter must be recognised, not just C:.

    ``_HOST_CWD_PREFIXES`` only listed ``C:``, so a project on D: passed both
    the prefix check and ``os.path.isabs()`` (True on Windows) and reached
    ``docker run -w D:\\proj``, which fails the container with exit 125.
    """

    @pytest.mark.parametrize("path", [
        r"C:\Users\me", "C:/Users/me",
        r"D:\projects\app", "D:/projects/app",
        r"E:\work", r"z:\lower\drive", "q:/mixed",
    ])
    def test_any_drive_qualified_path_is_a_host_path(self, path):
        assert tt._is_host_path(path) is True
        assert tt._is_unusable_container_cwd(path) is True

    @pytest.mark.parametrize("path", ["/workspace", "/root", "/opt/project", "/app"])
    def test_container_absolute_paths_stay_usable(self, path):
        assert tt._is_host_path(path) is False
        assert tt._is_unusable_container_cwd(path) is False

    def test_drive_letter_alone_is_not_a_path(self):
        # "C:" with no separator is a drive-relative reference, not a directory
        # we would ever bind-mount; the regex requires the separator.
        assert tt._is_host_path("C:") is False


# ---------------------------------------------------------------------------
# 2. Container identity
# ---------------------------------------------------------------------------

class TestWorkspaceContainerKey:
    def test_same_directory_yields_one_key(self, projects):
        proj, _ = projects
        assert tt._workspace_container_key(str(proj)) == tt._workspace_container_key(
            str(proj) + os.sep
        )

    def test_different_directories_yield_different_keys(self, projects):
        a, b = projects
        assert tt._workspace_container_key(str(a)) != tt._workspace_container_key(str(b))

    def test_key_is_docker_label_safe(self, tmp_path):
        # Docker label values must match [A-Za-z0-9_.-] and stay under 63 chars
        # to survive a `docker ps --filter label=...` round-trip.
        awkward = tmp_path / "a b&c=d,e" / "ünïcodé"
        key = tt._workspace_container_key(str(awkward))
        assert len(key) <= 63
        assert all(ch.isalnum() or ch in "_.-" for ch in key), key

    @pytest.mark.skipif(not _WINDOWS, reason="Windows paths are case-insensitive")
    def test_case_differences_collapse_on_windows(self, projects):
        proj, _ = projects
        upper = str(proj).upper()
        assert tt._workspace_container_key(str(proj)) == tt._workspace_container_key(upper)


class TestContainerIdentityFollowsWorkspace:
    def test_distinct_projects_get_distinct_containers(self, projects, per_session_on):
        a, b = projects
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        tt.register_task_env_overrides("sess-b", {"cwd": str(b)})
        assert tt._resolve_container_task_id("sess-a") != tt._resolve_container_task_id("sess-b")

    def test_same_project_shares_one_container(self, projects, per_session_on):
        a, _ = projects
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        tt.register_task_env_overrides("sess-c", {"cwd": str(a) + os.sep})
        assert tt._resolve_container_task_id("sess-a") == tt._resolve_container_task_id("sess-c")

    def test_opt_in_off_collapses_every_session_to_default(self, projects, monkeypatch):
        """The pre-existing contract: a cwd-only override is not an isolation
        signal, so all sessions share the parent's long-lived container."""
        a, b = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "false")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        tt.register_task_env_overrides("sess-b", {"cwd": str(b)})
        assert tt._resolve_container_task_id("sess-a") == "default"
        assert tt._resolve_container_task_id("sess-b") == "default"

    def test_mount_opt_in_alone_is_not_enough(self, projects, monkeypatch):
        """per_session without mount_cwd would key containers off a directory
        that never gets mounted — gate on both."""
        a, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "false")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        assert tt._resolve_container_task_id("sess-a") == "default"

    @pytest.mark.parametrize("backend", ["local", "ssh", "modal", "daytona", "singularity"])
    def test_non_docker_backends_never_key_off_workspace(self, projects, monkeypatch, backend):
        """Only Docker bind-mounts a host cwd. Other backends' cwds live inside
        the remote/managed environment, so they must not fan out containers."""
        a, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", backend)
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        assert tt._resolve_container_task_id("sess-a") == "default"

    def test_image_overrides_still_win(self, projects, per_session_on):
        """RL/benchmark rollouts asking for their own image keep their own
        task id — workspace keying must not shadow that."""
        a, _ = projects
        tt.register_task_env_overrides("rl-1", {"docker_image": "custom:latest", "cwd": str(a)})
        assert tt._resolve_container_task_id("rl-1") == "rl-1"

    def test_sandbox_cwd_override_does_not_fan_out(self, per_session_on):
        """An override pointing inside the container (RL sandboxes set
        /workspace) resolves to no mount, so it stays on the shared container."""
        tt.register_task_env_overrides("sess-sandbox", {"cwd": "/workspace"})
        assert tt._resolve_container_task_id("sess-sandbox") == "default"


# ---------------------------------------------------------------------------
# 3. Approval gate
# ---------------------------------------------------------------------------

class TestHostAccessGateFollowsActualMount:
    BASE = {
        "env_type": "docker",
        "docker_volumes": [],
        "host_cwd": None,
        "docker_mount_cwd_to_workspace": True,
    }

    def test_runtime_mount_reports_host_access(self):
        # The startup snapshot has host_cwd=None, but THIS call mounted a host
        # directory — dangerous commands must not get the sandbox fast-path.
        assert tt._docker_has_host_access(self.BASE, "/host/projA") is True

    def test_no_runtime_mount_keeps_sandbox_posture(self):
        assert tt._docker_has_host_access(self.BASE, None) is False

    def test_mount_flag_off_means_no_host_access(self):
        cfg = {**self.BASE, "docker_mount_cwd_to_workspace": False}
        assert tt._docker_has_host_access(cfg, "/host/projA") is False

    def test_non_docker_backend_never_reports_host_access(self):
        cfg = {**self.BASE, "env_type": "modal"}
        assert tt._docker_has_host_access(cfg, "/host/projA") is False

    def test_omitting_the_argument_falls_back_to_the_snapshot(self):
        """Existing single-argument callers keep the old behaviour."""
        cfg = {**self.BASE, "host_cwd": "/host/launch-dir"}
        assert tt._docker_has_host_access(cfg) is True
        assert tt._docker_has_host_access({**cfg, "host_cwd": None}) is False

    def test_explicit_none_still_defers_to_the_snapshot(self):
        """None means "caller resolved nothing", which is exactly the case where
        the startup snapshot is the best available answer."""
        cfg = {**self.BASE, "host_cwd": "/host/launch-dir"}
        assert tt._docker_has_host_access(cfg, None) is True


# ---------------------------------------------------------------------------
# 4. Config plumbing
# ---------------------------------------------------------------------------

class TestConfigPlumbing:
    def test_per_session_requires_the_mount_opt_in(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "false")
        assert tt._get_env_config()["docker_workspace_per_session"] is False

    def test_both_opt_ins_enable_it(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        assert tt._get_env_config()["docker_workspace_per_session"] is True

    def test_defaults_to_off(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.delenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", raising=False)
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        assert tt._get_env_config()["docker_workspace_per_session"] is False

    def test_launch_cwd_still_resolves_to_a_mount(self, projects, monkeypatch):
        """The pre-existing launch-directory behaviour is unchanged."""
        proj, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_CWD", str(proj))
        config = tt._get_env_config()
        assert config["cwd"] == "/workspace"
        assert config["host_cwd"] == str(proj)

    def test_config_default_is_off(self):
        from hermes_cli.config import DEFAULT_CONFIG

        assert DEFAULT_CONFIG["terminal"]["docker_workspace_per_session"] is False

    @pytest.mark.parametrize("raw,enabled", [
        ("true", True), ("True", True), ("TRUE", True),
        ("1", True), ("yes", True), ("on", True),
        ("false", False), ("0", False), ("no", False), ("off", False), ("", False),
    ])
    def test_config_snapshot_and_container_identity_never_disagree(
        self, monkeypatch, raw, enabled,
    ):
        """The two consumers of this opt-in must read the same value.

        ``_get_env_config`` decides whether a cwd becomes a bind mount;
        ``_resolve_container_task_id`` decides whether each project gets its own
        container. A value one accepts and the other rejects (``on`` used to be
        exactly that) produces one container per project with none of them
        holding the project.
        """
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", raw)
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", raw)
        assert tt._get_env_config()["docker_workspace_per_session"] is enabled
        assert tt._docker_workspace_per_session_enabled() is enabled
