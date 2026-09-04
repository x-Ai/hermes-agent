"""Per-session workspace mounting (``terminal.docker_workspace_per_session`` /
``terminal.singularity_workspace_per_session``).

Behaviours pinned here, all of them contracts rather than snapshots:

1. ``resolve_workspace_mount`` splits a path into (mount source, container
   workdir), and never mistakes a sandbox path for a host one.
   The Windows case is load-bearing: ``os.path.abspath("/workspace")`` yields
   ``C:\\workspace`` on a Windows host, so deciding after abspath() would
   bind-mount over the container's own workspace.
2. Container identity follows the workspace directory when the opt-in is on and
   collapses back to the shared ``"default"`` container when it is off. A
   sandbox's ``/workspace`` bind mount is fixed at creation time, so two
   sessions on different projects cannot share one sandbox — but that is only
   true under the opt-in, and the default must not start multiplying sandboxes.
3. Docker and Singularity gate independently: each backend has its own pair of
   opt-ins, and enabling one backend's pair must not light up the other.
   Modal/Daytona can never enable this — their sandboxes are remote machines
   where the host filesystem cannot be mounted at all.
4. The dangerous-command approval gate (``_sandbox_has_host_access``) tracks
   the mount that was *actually* resolved for this call, not the startup
   snapshot. A stale answer here hands the agent host write access under
   sandbox-grade approval rules.
"""

import os
import sys
from pathlib import Path

import pytest

_repo_root = Path(__file__).resolve().parent.parent.parent
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))

import tools.terminal_tool as tt
from tools.terminal_tool_lifecycle import get_active_env

_WINDOWS = os.name == "nt"


@pytest.fixture
def projects(tmp_path):
    """Two real sibling project directories on the host."""
    a = tmp_path / "projA"
    b = tmp_path / "projB"
    a.mkdir()
    b.mkdir()
    return a, b


# The two mount-capable backends and their independent opt-in pairs. Keyed the
# same way as terminal_tool's own tables so a new backend added there without
# test coverage shows up as a missing entry here.
_BACKEND_FLAGS = {
    "docker": (
        "TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE",
        "TERMINAL_DOCKER_WORKSPACE_PER_SESSION",
    ),
    "singularity": (
        "TERMINAL_SINGULARITY_MOUNT_CWD_TO_WORKSPACE",
        "TERMINAL_SINGULARITY_WORKSPACE_PER_SESSION",
    ),
}


@pytest.fixture(params=sorted(_BACKEND_FLAGS))
def per_session_on(request, monkeypatch):
    """Each mount-capable backend with both of its opt-ins enabled."""
    backend = request.param
    mount_var, per_session_var = _BACKEND_FLAGS[backend]
    monkeypatch.setenv("TERMINAL_ENV", backend)
    monkeypatch.setenv(mount_var, "true")
    monkeypatch.setenv(per_session_var, "true")
    return backend


@pytest.fixture(autouse=True)
def _clean_overrides():
    """Keep the module-global session state from leaking between tests.

    The recorded session cwd is cleaned alongside the override registry
    because it is the second rung of the chain that decides both the mount and
    the container key — a leftover record would silently re-key a later test's
    sandbox.
    """
    yield
    for key in list(tt._task_env_overrides):
        tt.clear_task_env_overrides(key)
    with tt._session_cwd_lock:
        tt._session_cwd.clear()
    with tt._container_alias_lock:
        tt._container_aliases.clear()


# ---------------------------------------------------------------------------
# 1. Mount resolution
# ---------------------------------------------------------------------------

class TestResolveWorkspaceMount:
    def test_real_host_dir_becomes_a_mount_into_workspace(self, projects):
        proj, _ = projects
        assert tt.resolve_workspace_mount(str(proj)) == (
            str(proj), "/workspace",
        )

    def test_sandbox_paths_are_never_mount_sources(self):
        # These live inside the container. Mounting a host directory over them
        # would clobber the sandbox's own workspace/home.
        for sandbox_path in ("/workspace", "/workspace/sub", "/root", "/root/x"):
            assert tt.resolve_workspace_mount(sandbox_path) == (None, None), (
                f"{sandbox_path!r} is a container path and must not be mounted"
            )

    def test_blank_input_resolves_to_no_mount(self):
        for blank in ("", "   ", None, 123):
            assert tt.resolve_workspace_mount(blank) == (None, None)

    def test_equivalent_spellings_resolve_to_one_mount_source(self, projects):
        proj, _ = projects
        spellings = [
            str(proj),
            str(proj) + os.sep,
            str(proj / "sub" / ".."),
        ]
        resolved = {tt.resolve_workspace_mount(s)[0] for s in spellings}
        assert len(resolved) == 1, (
            f"one directory produced {len(resolved)} mount sources: {resolved}"
        )

    @pytest.mark.skipif(not _WINDOWS, reason="Windows host path semantics")
    def test_posix_rooted_path_is_not_a_host_dir_on_windows(self):
        # os.path.abspath('/workspace') == 'C:\\workspace' here, which matches
        # the C: host-path prefix. Deciding after abspath() would mount it.
        for posix_path in ("/workspace", "/root", "/home/user/proj", "/Users/me/proj"):
            assert tt.resolve_workspace_mount(posix_path) == (None, None), (
                f"{posix_path!r} is not a Windows host directory"
            )

    @pytest.mark.skipif(_WINDOWS, reason="POSIX host path semantics")
    def test_posix_user_roots_are_host_dirs_on_posix(self):
        # Mirrors the documented startup behaviour: a host user directory is a
        # mount source even when it does not exist on this machine, because
        # DockerEnvironment does the final existence check.
        for host_path in ("/Users/someone/proj", "/home/someone/proj"):
            source, workdir = tt.resolve_workspace_mount(host_path)
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

    def test_subagent_alias_resolves_parent_workspace_container(
        self, projects, per_session_on, monkeypatch
    ):
        """A child whose cwd is already translated to /workspace must still
        reuse the parent's workspace-keyed sandbox.

        Delegation records the child's execution cwd as the in-container path
        and separately registers child -> parent container ownership.  The
        workspace identity resolver must follow that ownership before trying
        to derive a host mount from the child's /workspace spelling; otherwise
        it falls through to the default sandbox and mounts the process cwd.
        """
        monkeypatch.setenv("TERMINAL_CONTAINER_PERSISTENT", "true")
        project, _ = projects
        parent = "parent-session"
        child = "subagent-child"
        grandchild = "subagent-grandchild"

        tt.register_task_env_overrides(parent, {"cwd": str(project)})
        tt.record_session_cwd(child, "/workspace")
        tt.record_session_cwd(grandchild, "/workspace")
        tt.register_container_alias(child, parent)
        tt.register_container_alias(grandchild, child)

        parent_key = tt._resolve_container_task_id(parent)
        assert parent_key.startswith("ws-")
        assert tt._resolve_container_task_id(child) == parent_key
        assert tt._resolve_container_task_id(grandchild) == parent_key

        parent_env = object()
        monkeypatch.setitem(tt._active_environments, parent_key, parent_env)
        assert get_active_env(child) is parent_env
        assert get_active_env(grandchild) is parent_env

    def test_subagent_explicit_isolation_override_beats_parent_alias(
        self, projects, per_session_on
    ):
        """RL/benchmark children asking for their own image remain isolated."""
        project, _ = projects
        parent = "parent-session"
        child = "isolated-subagent"
        image_key = f"{per_session_on}_image"

        tt.register_task_env_overrides(parent, {"cwd": str(project)})
        tt.register_task_env_overrides(child, {image_key: "custom:latest"})
        tt.register_container_alias(child, parent)

        assert tt._resolve_container_task_id(child) == child
        assert tt._resolve_container_task_id(parent).startswith("ws-")

    @pytest.mark.parametrize("backend", sorted(_BACKEND_FLAGS))
    def test_opt_in_off_collapses_every_session_to_default(self, projects, monkeypatch, backend):
        """The pre-existing contract: a cwd-only override is not an isolation
        signal, so all sessions share the parent's long-lived container."""
        a, b = projects
        mount_var, per_session_var = _BACKEND_FLAGS[backend]
        monkeypatch.setenv("TERMINAL_ENV", backend)
        monkeypatch.setenv(mount_var, "true")
        monkeypatch.setenv(per_session_var, "false")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        tt.register_task_env_overrides("sess-b", {"cwd": str(b)})
        assert tt._resolve_container_task_id("sess-a") == "default"
        assert tt._resolve_container_task_id("sess-b") == "default"

    @pytest.mark.parametrize("backend", sorted(_BACKEND_FLAGS))
    def test_mount_opt_in_alone_is_not_enough(self, projects, monkeypatch, backend):
        """per_session without mount_cwd would key containers off a directory
        that never gets mounted — gate on both."""
        a, _ = projects
        mount_var, per_session_var = _BACKEND_FLAGS[backend]
        monkeypatch.setenv("TERMINAL_ENV", backend)
        monkeypatch.setenv(mount_var, "false")
        monkeypatch.setenv(per_session_var, "true")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        assert tt._resolve_container_task_id("sess-a") == "default"

    @pytest.mark.parametrize("backend", ["local", "ssh", "modal", "daytona"])
    def test_mount_incapable_backends_never_key_off_workspace(self, projects, monkeypatch, backend):
        """Only Docker and Singularity can bind-mount a host cwd. The other
        backends' cwds live inside the remote/managed environment, so they must
        not fan out sandboxes — even with every mount flag turned on."""
        a, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", backend)
        for mount_var, per_session_var in _BACKEND_FLAGS.values():
            monkeypatch.setenv(mount_var, "true")
            monkeypatch.setenv(per_session_var, "true")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        assert tt._resolve_container_task_id("sess-a") == "default"

    @pytest.mark.parametrize("active,other", [("docker", "singularity"), ("singularity", "docker")])
    def test_backends_gate_independently(self, projects, monkeypatch, active, other):
        """Deliberately separate switches: enabling one backend's pair must not
        light up the other backend."""
        a, _ = projects
        other_mount, other_per_session = _BACKEND_FLAGS[other]
        monkeypatch.setenv("TERMINAL_ENV", active)
        monkeypatch.setenv(other_mount, "true")
        monkeypatch.setenv(other_per_session, "true")
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


class TestSandboxHostAccessDispatch:
    """``_sandbox_has_host_access`` — the backend-dispatching approval gate."""

    def test_docker_agrees_with_the_docker_specific_check(self):
        cfg = {
            "env_type": "docker",
            "docker_volumes": ["/tmp:/x"],
            "host_cwd": None,
            "docker_mount_cwd_to_workspace": False,
        }
        assert tt._sandbox_has_host_access(cfg) is tt._docker_has_host_access(cfg)

    def test_singularity_runtime_mount_reports_host_access(self):
        cfg = {"env_type": "singularity", "singularity_mount_cwd_to_workspace": True,
               "host_cwd": None}
        assert tt._sandbox_has_host_access(cfg, "/host/projA") is True

    def test_singularity_snapshot_mount_reports_host_access(self):
        cfg = {"env_type": "singularity", "singularity_mount_cwd_to_workspace": True,
               "host_cwd": "/host/launch-dir"}
        assert tt._sandbox_has_host_access(cfg) is True

    def test_singularity_without_mount_keeps_sandbox_posture(self):
        cfg = {"env_type": "singularity", "singularity_mount_cwd_to_workspace": True,
               "host_cwd": None}
        assert tt._sandbox_has_host_access(cfg, None) is False

    def test_singularity_flag_off_means_no_host_access(self):
        cfg = {"env_type": "singularity", "singularity_mount_cwd_to_workspace": False,
               "host_cwd": None}
        assert tt._sandbox_has_host_access(cfg, "/host/projA") is False

    @pytest.mark.parametrize("backend", ["modal", "daytona", "local", "ssh"])
    def test_mount_incapable_backends_never_report_host_access(self, backend):
        """Remote sandboxes hold uploaded copies; nothing they write touches
        this host. Reporting host access there would force pointless approvals."""
        cfg = {"env_type": backend, "singularity_mount_cwd_to_workspace": True,
               "docker_mount_cwd_to_workspace": True, "docker_volumes": ["/tmp:/x"]}
        assert tt._sandbox_has_host_access(cfg, "/host/projA") is False


# ---------------------------------------------------------------------------
# 4. Config plumbing
# ---------------------------------------------------------------------------

class TestConfigPlumbing:
    def test_per_session_requires_the_mount_opt_in(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "false")
        assert tt._get_env_config()["workspace_per_session"] is False

    def test_both_opt_ins_enable_it(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        assert tt._get_env_config()["workspace_per_session"] is True

    def test_defaults_to_off(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.delenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", raising=False)
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        assert tt._get_env_config()["workspace_per_session"] is False

    def test_launch_cwd_still_resolves_to_a_mount(self, projects, monkeypatch):
        """The pre-existing launch-directory behaviour is unchanged."""
        proj, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_CWD", str(proj))
        config = tt._get_env_config()
        assert config["cwd"] == "/workspace"
        assert config["host_cwd"] == str(proj)

    def test_singularity_pair_enables_it(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "singularity")
        monkeypatch.setenv("TERMINAL_SINGULARITY_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_SINGULARITY_WORKSPACE_PER_SESSION", "true")
        config = tt._get_env_config()
        assert config["workspace_per_session"] is True
        assert config["singularity_mount_cwd_to_workspace"] is True

    def test_singularity_launch_cwd_resolves_to_a_mount(self, projects, monkeypatch):
        """Launch-directory mounting works for Singularity exactly as for Docker."""
        proj, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "singularity")
        monkeypatch.setenv("TERMINAL_SINGULARITY_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_CWD", str(proj))
        config = tt._get_env_config()
        assert config["cwd"] == "/workspace"
        assert config["host_cwd"] == str(proj)

    def test_singularity_mount_off_discards_host_path(self, projects, monkeypatch):
        """Without the opt-in, a host TERMINAL_CWD is discarded for the sandbox
        default — the pre-existing isolation posture."""
        proj, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "singularity")
        monkeypatch.delenv("TERMINAL_SINGULARITY_MOUNT_CWD_TO_WORKSPACE", raising=False)
        monkeypatch.setenv("TERMINAL_CWD", str(proj))
        config = tt._get_env_config()
        assert config["host_cwd"] is None
        assert config["cwd"] == "/root"

    def test_config_defaults_are_off(self):
        from hermes_cli.config import DEFAULT_CONFIG

        terminal = DEFAULT_CONFIG["terminal"]
        assert terminal["docker_workspace_per_session"] is False
        assert terminal["singularity_mount_cwd_to_workspace"] is False
        assert terminal["singularity_workspace_per_session"] is False

    @pytest.mark.parametrize("backend", sorted(_BACKEND_FLAGS))
    @pytest.mark.parametrize("raw,enabled", [
        ("true", True), ("True", True), ("TRUE", True),
        ("1", True), ("yes", True), ("on", True),
        ("false", False), ("0", False), ("no", False), ("off", False), ("", False),
    ])
    def test_config_snapshot_and_container_identity_never_disagree(
        self, monkeypatch, backend, raw, enabled,
    ):
        """The two consumers of this opt-in must read the same value.

        ``_get_env_config`` decides whether a cwd becomes a bind mount;
        ``_resolve_container_task_id`` decides whether each project gets its own
        container. A value one accepts and the other rejects (``on`` used to be
        exactly that) produces one container per project with none of them
        holding the project.
        """
        mount_var, per_session_var = _BACKEND_FLAGS[backend]
        monkeypatch.setenv("TERMINAL_ENV", backend)
        monkeypatch.setenv(mount_var, raw)
        monkeypatch.setenv(per_session_var, raw)
        assert tt._get_env_config()["workspace_per_session"] is enabled
        assert tt._workspace_per_session_enabled() is enabled


# ---------------------------------------------------------------------------
# 5. Configurable mount target (workspace_mount_path)
# ---------------------------------------------------------------------------

class TestWorkspaceMountPath:
    def test_default_when_unset(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.delenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", raising=False)
        assert tt._workspace_mount_path() == "/workspace"

    def test_normalizes_slashes(self, monkeypatch):
        # The doubled-slash spelling from the feature request must collapse to
        # one canonical target, or the same config would hash to two containers.
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/root//workspace/")
        assert tt._workspace_mount_path() == "/root/workspace"

    @pytest.mark.parametrize("bad", ["relative/path", "/", "workspace", "C:\\ws"])
    def test_invalid_values_fall_back(self, monkeypatch, bad):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", bad)
        assert tt._workspace_mount_path() == "/workspace"

    @pytest.mark.parametrize("reserved", ["/root", "/home", "/tmp", "/var/tmp", "/run"])
    def test_sandbox_internal_mount_points_fall_back(self, monkeypatch, reserved):
        # Binding the project exactly over a sandbox-owned mount point either
        # collides (duplicate mount target) or hides the sandbox's state.
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", reserved)
        assert tt._workspace_mount_path() == "/workspace"

    def test_nested_path_under_reserved_root_is_allowed(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/root/workspace")
        assert tt._workspace_mount_path() == "/root/workspace"

    def test_backends_read_independent_variables(self, monkeypatch):
        monkeypatch.setenv("TERMINAL_ENV", "singularity")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/root/ws")
        monkeypatch.delenv("TERMINAL_SINGULARITY_WORKSPACE_MOUNT_PATH", raising=False)
        assert tt._workspace_mount_path() == "/workspace"
        monkeypatch.setenv("TERMINAL_SINGULARITY_WORKSPACE_MOUNT_PATH", "/mnt/project")
        assert tt._workspace_mount_path() == "/mnt/project"

    def test_resolver_uses_the_custom_target(self, projects, monkeypatch):
        proj, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/root/workspace")
        assert tt.resolve_workspace_mount(str(proj)) == (str(proj), "/root/workspace")

    def test_custom_target_is_a_sandbox_path_not_a_host_dir(self, monkeypatch):
        """With a custom target configured, that path (and anything under it)
        refers to the in-container workspace — it must never be re-mounted as
        a host directory, even if the host has a real directory by that name."""
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/root/workspace")
        assert tt.resolve_workspace_mount("/root/workspace") == (None, None)
        assert tt.resolve_workspace_mount("/root/workspace/sub") == (None, None)
        # The default target stays a sandbox path too.
        assert tt.resolve_workspace_mount("/workspace") == (None, None)

    def test_mount_target_is_part_of_container_identity(self, projects, per_session_on, monkeypatch):
        """No hot-remount exists, so a target change must produce a new
        container key; reverting must land back on the original one."""
        proj, _ = projects
        backend = per_session_on
        path_var = tt._WORKSPACE_MOUNT_PATH_ENV_VARS[backend]
        tt.register_task_env_overrides("sess-a", {"cwd": str(proj)})
        key_default = tt._resolve_container_task_id("sess-a")
        monkeypatch.setenv(path_var, "/root/workspace")
        key_custom = tt._resolve_container_task_id("sess-a")
        assert key_default != key_custom
        monkeypatch.delenv(path_var, raising=False)
        assert tt._resolve_container_task_id("sess-a") == key_default

    def test_env_config_carries_the_resolved_target(self, projects, monkeypatch):
        proj, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/root/workspace")
        monkeypatch.setenv("TERMINAL_CWD", str(proj))
        config = tt._get_env_config()
        assert config["workspace_mount_path"] == "/root/workspace"
        assert config["cwd"] == "/root/workspace"
        assert config["host_cwd"] == str(proj)

    def test_config_defaults(self):
        from hermes_cli.config import DEFAULT_CONFIG

        terminal = DEFAULT_CONFIG["terminal"]
        assert terminal["docker_workspace_mount_path"] == "/workspace"
        assert terminal["singularity_workspace_mount_path"] == "/workspace"


class TestDockerCustomMountTarget:
    """DockerEnvironment must place every workspace flavor at the configured
    target: host bind, explicit-volume detection, and the tmpfs fallback."""

    @pytest.fixture
    def docker_calls(self, monkeypatch):
        import subprocess as _sp

        from tools.environments import docker as docker_env

        docker_env._cgroup_limits_ok = True
        monkeypatch.setattr(docker_env, "find_docker", lambda: "/usr/bin/docker")
        calls = []

        def _run(cmd, **kwargs):
            calls.append(list(cmd) if isinstance(cmd, list) else cmd)
            if isinstance(cmd, list) and len(cmd) >= 2:
                if cmd[1] == "version":
                    return _sp.CompletedProcess(cmd, 0, stdout="Docker version", stderr="")
                if cmd[1] == "run":
                    return _sp.CompletedProcess(cmd, 0, stdout="fake-container-id\n", stderr="")
            return _sp.CompletedProcess(cmd, 0, stdout="", stderr="")

        monkeypatch.setattr(docker_env.subprocess, "run", _run)
        monkeypatch.setattr(docker_env.DockerEnvironment, "init_session", lambda self: None)
        return docker_env, calls

    @staticmethod
    def _run_cmd(calls):
        runs = [c for c in calls if isinstance(c, list) and len(c) >= 2 and c[1] == "run"]
        assert runs, f"no docker run captured; calls={calls}"
        return " ".join(runs[0])

    def test_host_bind_lands_on_custom_target(self, docker_calls, tmp_path):
        docker_env, calls = docker_calls
        proj = tmp_path / "proj"
        proj.mkdir()
        docker_env.DockerEnvironment(
            image="python:3.11", cwd="/root/workspace",
            host_cwd=str(proj), auto_mount_cwd=True,
            workspace_mount_path="/root/workspace",
            persist_across_processes=False,
        )
        assert f"{proj}:/root/workspace" in self._run_cmd(calls)

    def test_tmpfs_workspace_follows_target(self, docker_calls):
        docker_env, calls = docker_calls
        docker_env.DockerEnvironment(
            image="python:3.11", cwd="/root",
            workspace_mount_path="/root/workspace",
            persist_across_processes=False,
        )
        assert "/root/workspace:rw,exec,size=10g" in self._run_cmd(calls)

    def test_explicit_volume_on_target_suppresses_auto_mount(self, docker_calls, tmp_path):
        docker_env, calls = docker_calls
        proj = tmp_path / "proj"
        other = tmp_path / "other"
        proj.mkdir()
        other.mkdir()
        docker_env.DockerEnvironment(
            image="python:3.11", cwd="/root/workspace",
            host_cwd=str(proj), auto_mount_cwd=True,
            workspace_mount_path="/root/workspace",
            volumes=[f"{other}:/root/workspace"],
            persist_across_processes=False,
        )
        run_cmd = self._run_cmd(calls)
        assert f"{other}:/root/workspace" in run_cmd
        assert f"{proj}:/root/workspace" not in run_cmd


# ---------------------------------------------------------------------------
# 6. Singularity --bind translation
# ---------------------------------------------------------------------------

class TestSingularityBindMount:
    """The resolved host workspace must become an ``--bind host:/workspace``
    flag on ``instance start`` — and only under the opt-in."""

    @pytest.fixture
    def sg(self, monkeypatch):
        from tools.environments import singularity as sg_mod

        monkeypatch.setattr(sg_mod, "_ensure_singularity_available", lambda: "apptainer")
        monkeypatch.setattr(sg_mod, "_get_or_build_sif", lambda image, executable: image)
        # init_session shells into the (fake) instance; not under test here.
        monkeypatch.setattr(sg_mod.SingularityEnvironment, "init_session", lambda self: None)

        calls = []

        def _run(cmd, **kwargs):
            import subprocess as _sp
            calls.append(list(cmd))
            return _sp.CompletedProcess(cmd, 0, stdout="", stderr="")

        monkeypatch.setattr(sg_mod.subprocess, "run", _run)
        return sg_mod, calls

    @staticmethod
    def _instance_start_cmd(calls):
        starts = [c for c in calls if len(c) >= 3 and c[1:3] == ["instance", "start"]]
        assert starts, f"no instance start captured; calls={calls}"
        return starts[0]

    def test_opt_in_mounts_the_host_workspace(self, sg, tmp_path):
        sg_mod, calls = sg
        proj = tmp_path / "proj"
        proj.mkdir()
        sg_mod.SingularityEnvironment(
            image="docker://python:3.11", cwd="/workspace",
            host_cwd=str(proj), auto_mount_cwd=True,
        )
        cmd = self._instance_start_cmd(calls)
        joined = " ".join(cmd)
        assert f"{proj}:/workspace" in joined
        assert "--bind" in cmd

    def test_without_opt_in_no_workspace_bind(self, sg, tmp_path):
        sg_mod, calls = sg
        proj = tmp_path / "proj"
        proj.mkdir()
        sg_mod.SingularityEnvironment(
            image="docker://python:3.11", cwd="/root",
            host_cwd=str(proj), auto_mount_cwd=False,
        )
        assert f"{proj}:/workspace" not in " ".join(self._instance_start_cmd(calls))

    def test_missing_host_dir_is_not_mounted(self, sg, tmp_path):
        sg_mod, calls = sg
        ghost = tmp_path / "does-not-exist"
        sg_mod.SingularityEnvironment(
            image="docker://python:3.11", cwd="/workspace",
            host_cwd=str(ghost), auto_mount_cwd=True,
        )
        assert f"{ghost}:/workspace" not in " ".join(self._instance_start_cmd(calls))

    def test_custom_mount_target_reaches_the_bind_flag(self, sg, tmp_path):
        sg_mod, calls = sg
        proj = tmp_path / "proj"
        proj.mkdir()
        sg_mod.SingularityEnvironment(
            image="docker://python:3.11", cwd="/mnt/project",
            host_cwd=str(proj), auto_mount_cwd=True,
            workspace_mount_path="/mnt/project",
        )
        assert f"{proj}:/mnt/project" in " ".join(self._instance_start_cmd(calls))


# ---------------------------------------------------------------------------
# 7. Identity / mount agreement
# ---------------------------------------------------------------------------

class TestIdentityAndMountAgree:
    """The container key and the bind mount must come from ONE cwd.

    When they diverged, a sandbox keyed on project A was mounted at project B:
    the agent believed it worked in A while every file it touched lived in B,
    and each session minted a fresh container because the key moved while the
    mount stayed on the global config directory. The regression vector was
    ``code_execution_tool`` reading the override registry under the *collapsed*
    task id (``ws-<hash>``) — a key that registry never contains, since it is
    keyed by session id — so its cwd silently fell back to ``config["cwd"]``.
    """

    @pytest.fixture
    def config(self, projects, per_session_on, monkeypatch, tmp_path):
        """Startup config whose global cwd is NOT any session's project dir."""
        global_dir = tmp_path / "elsewhere"
        global_dir.mkdir()
        monkeypatch.setenv("TERMINAL_CWD", str(global_dir))
        return tt._get_env_config()

    def test_every_session_mounts_the_directory_it_is_keyed_on(self, projects, config):
        a, b = projects
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        tt.register_task_env_overrides("sess-b", {"cwd": str(b)})

        for session, project in (("sess-a", a), ("sess-b", b)):
            identity = tt._resolve_container_task_id(session)
            mount_source, _ = tt._resolve_workspace_mount_for_task(session, config)

            assert mount_source == str(project)
            assert identity == tt._workspace_container_key(str(project)), (
                f"{session} is keyed on a different directory than it mounts"
            )

    def test_two_sessions_on_one_project_share_a_container(self, projects, config):
        """The whole point of the feature: a project's sessions pool onto one
        sandbox, however many of them there are."""
        a, _ = projects
        for session in ("sess-1", "sess-2", "sess-3"):
            tt.register_task_env_overrides(session, {"cwd": str(a)})

        keys = {tt._resolve_container_task_id(s) for s in ("sess-1", "sess-2", "sess-3")}
        mounts = {
            tt._resolve_workspace_mount_for_task(s, config)[0]
            for s in ("sess-1", "sess-2", "sess-3")
        }

        assert len(keys) == 1
        assert mounts == {str(a)}

    def test_a_session_without_a_registered_cwd_does_not_fan_out(self, config):
        """No host cwd to key on means the shared default container — and no
        mount. Reporting one without the other is the divergence itself."""
        identity = tt._resolve_container_task_id("never-registered")
        mount_source, _ = tt._resolve_workspace_mount_for_task("never-registered", config)

        assert identity == "default"
        assert mount_source is None

    def test_recorded_session_cwd_feeds_identity_too(self, projects, config):
        """``get_session_cwd`` is the second rung of the mount chain, so it must
        also be the second rung of the identity chain."""
        a, _ = projects
        tt.record_session_cwd("sess-recorded", str(a))

        identity = tt._resolve_container_task_id("sess-recorded")
        mount_source, _ = tt._resolve_workspace_mount_for_task("sess-recorded", config)

        assert mount_source == str(a)
        assert identity == tt._workspace_container_key(str(a))

    def test_opt_in_off_means_no_mount_and_the_shared_container(self, projects, monkeypatch):
        a, _ = projects
        monkeypatch.setenv("TERMINAL_ENV", "docker")
        monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
        monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "false")
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        config = tt._get_env_config()

        assert tt._resolve_container_task_id("sess-a") == "default"
        assert tt._resolve_workspace_mount_for_task("sess-a", config) == (None, None)


# ---------------------------------------------------------------------------
# 8. One mount per sandbox, whichever tool creates it
# ---------------------------------------------------------------------------

class TestEveryToolResolvesOneMount:
    """execute_code and the file tools share a container, so they must resolve
    the same mount for it.

    Each reaches ``_create_environment`` by its own path and whichever wins the
    race to create the sandbox decides what gets mounted. This exercises those
    real paths rather than the resolver alone: the reported bug was
    ``code_execution_tool`` reading overrides under the collapsed container id
    and mounting the global config directory while the file tools mounted the
    session's actual project.
    """

    @pytest.fixture
    def creation_args(self, per_session_on, monkeypatch, tmp_path):
        """Return the ``(cwd, host_cwd)`` a tool would create a sandbox with."""
        global_dir = tmp_path / "elsewhere"
        global_dir.mkdir()
        monkeypatch.setenv("TERMINAL_CWD", str(global_dir))

        import tools.file_tools as ft
        from tools import terminal_tool_backends

        class _Captured(Exception):
            def __init__(self, kwargs):
                self.kwargs = kwargs

        monkeypatch.setattr(
            terminal_tool_backends,
            "_create_environment",
            lambda **kwargs: (_ for _ in ()).throw(_Captured(kwargs)),
        )

        def _resolve(trigger, task_id):
            tt._active_environments.clear()
            ft._file_ops_cache.clear()
            try:
                trigger(task_id)
            except _Captured as exc:
                return exc.kwargs.get("cwd"), exc.kwargs.get("host_cwd")
            raise AssertionError(f"{trigger.__name__} never reached _create_environment")

        yield _resolve
        tt._active_environments.clear()
        ft._file_ops_cache.clear()

    @pytest.fixture
    def tools(self):
        import tools.code_execution_tool as ce
        import tools.file_tools as ft

        return ce._get_or_create_env, ft._get_file_ops

    def test_both_tools_mount_the_session_project(self, projects, creation_args, tools):
        execute_code, file_tools = tools
        a, b = projects
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})
        tt.register_task_env_overrides("sess-b", {"cwd": str(b)})

        for session, project in (("sess-a", a), ("sess-b", b)):
            from_execute_code = creation_args(execute_code, session)
            from_file_tools = creation_args(file_tools, session)

            assert from_execute_code == from_file_tools, (
                f"{session}: execute_code and the file tools disagree on the mount"
            )
            assert from_execute_code[1] == str(project)
            assert from_execute_code[0] == tt._workspace_mount_path()

    def test_the_sandbox_is_named_after_what_it_mounts(self, projects, creation_args, tools):
        execute_code, _ = tools
        a, _unused = projects
        tt.register_task_env_overrides("sess-a", {"cwd": str(a)})

        _cwd, host_cwd = creation_args(execute_code, "sess-a")

        assert tt._resolve_container_task_id("sess-a") == tt._workspace_container_key(host_cwd)
