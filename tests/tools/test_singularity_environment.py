"""Singularity/Apptainer instance lifecycle and cross-process rendezvous."""

from __future__ import annotations

import subprocess

import pytest

from tools.environments import singularity as singularity_mod


class _FakeApptainer:
    def __init__(self) -> None:
        self.calls: list[list[str]] = []
        self.running: set[str] = set()
        self.race_on_next_start = False
        self.fail_on_next_start = False
        self.timeout_on_next_start = False

    def __call__(self, cmd, **kwargs):
        argv = list(cmd)
        self.calls.append(argv)

        if argv[1:3] == ["instance", "list"]:
            name = argv[3]
            stdout = "INSTANCE NAME PID IMAGE\n"
            if name in self.running:
                stdout += f"{name} 123 /tmp/test.sif\n"
            return subprocess.CompletedProcess(argv, 0, stdout=stdout, stderr="")

        if argv[1:3] == ["instance", "start"]:
            name = argv[-1]
            if self.timeout_on_next_start:
                self.timeout_on_next_start = False
                self.running.add(name)
                raise subprocess.TimeoutExpired(argv, 120)
            if self.race_on_next_start:
                self.race_on_next_start = False
                self.running.add(name)
                return subprocess.CompletedProcess(
                    argv, 255, stdout="", stderr="instance name already in use"
                )
            if self.fail_on_next_start:
                self.fail_on_next_start = False
                return subprocess.CompletedProcess(
                    argv, 255, stdout="", stderr="unrelated startup failure"
                )
            self.running.add(name)
            return subprocess.CompletedProcess(argv, 0, stdout="", stderr="")

        if argv[1:3] == ["instance", "stop"]:
            self.running.discard(argv[3])
            return subprocess.CompletedProcess(argv, 0, stdout="", stderr="")

        raise AssertionError(f"unexpected command: {argv}")

    def count(self, verb: str) -> int:
        return sum(call[1:3] == ["instance", verb] for call in self.calls)


@pytest.fixture
def fake_apptainer(monkeypatch, tmp_path):
    fake = _FakeApptainer()
    monkeypatch.setattr(
        singularity_mod, "_ensure_singularity_available", lambda: "apptainer"
    )
    monkeypatch.setattr(
        singularity_mod, "_get_or_build_sif", lambda image, executable: image
    )
    monkeypatch.setattr(singularity_mod, "_get_active_profile_name", lambda: "default")
    monkeypatch.setattr(
        singularity_mod.SingularityEnvironment, "init_session", lambda self: None
    )
    monkeypatch.setattr(singularity_mod, "_get_scratch_dir", lambda: tmp_path)
    monkeypatch.setattr(singularity_mod.subprocess, "run", fake)
    return fake


def _persistent_env(task_id: str = "ws-project"):
    return singularity_mod.SingularityEnvironment(
        image="/tmp/test.sif",
        persistent_filesystem=True,
        task_id=task_id,
    )


def test_persistent_name_is_stable_and_identity_scoped():
    first = singularity_mod._persistent_instance_name("ws-project", "default", "env-a")
    assert first == singularity_mod._persistent_instance_name("ws-project", "default", "env-a")
    assert first != singularity_mod._persistent_instance_name("ws-other", "default", "env-a")
    assert first != singularity_mod._persistent_instance_name("ws-project", "research", "env-a")
    assert first != singularity_mod._persistent_instance_name("ws-project", "default", "env-b")
    assert first.startswith("hermes_ws_project_")


def test_second_backend_reuses_running_persistent_instance(fake_apptainer):
    first = _persistent_env()
    second = _persistent_env()

    assert first.instance_id == second.instance_id
    assert fake_apptainer.count("start") == 1
    assert second._instance_reused is True


def test_start_loser_joins_concurrently_created_instance(fake_apptainer):
    fake_apptainer.race_on_next_start = True

    env = _persistent_env()

    assert env._instance_started is True
    assert env._instance_reused is True
    assert fake_apptainer.count("start") == 1
    assert fake_apptainer.count("list") == 2


def test_unrelated_start_failure_is_not_hidden(fake_apptainer):
    fake_apptainer.fail_on_next_start = True

    with pytest.raises(RuntimeError, match="unrelated startup failure"):
        _persistent_env()


def test_timed_out_start_adopts_verified_running_instance(fake_apptainer):
    fake_apptainer.timeout_on_next_start = True

    env = _persistent_env()

    assert env._instance_started is True
    assert env._instance_reused is True
    assert fake_apptainer.count("list") == 2


def test_normal_cleanup_does_not_stop_shared_persistent_instance(fake_apptainer):
    env = _persistent_env()

    env.cleanup()

    assert env.instance_id in fake_apptainer.running
    assert fake_apptainer.count("stop") == 0
    assert env._instance_started is False


def test_force_cleanup_stops_persistent_instance(fake_apptainer):
    env = _persistent_env()

    env.cleanup(force_remove=True)

    assert env.instance_id not in fake_apptainer.running
    assert fake_apptainer.count("stop") == 1


def test_nonpersistent_instances_remain_ephemeral(fake_apptainer):
    env = singularity_mod.SingularityEnvironment(
        image="/tmp/test.sif",
        persistent_filesystem=False,
        task_id="ws-project",
    )

    assert env.instance_id.startswith("hermes_")
    assert fake_apptainer.count("list") == 0

    env.cleanup()
    assert fake_apptainer.count("stop") == 1


# --- the bind publishes the same mount contract DockerEnvironment does -----------------------

def _bound_env(proj):
    return singularity_mod.SingularityEnvironment(
        image="/tmp/test.sif", persistent_filesystem=False,
        host_cwd=str(proj), auto_mount_cwd=True,
    )


def test_bound_workspace_publishes_the_shared_mount_contract(fake_apptainer, tmp_path):
    """``host_cwd`` / ``host_cwd_mount`` are how every shared path translator (file tools, vision
    ingest, the terminal's cwd remapping) learns about a bind. DockerEnvironment publishes them;
    a backend that binds without them leaves every host path untranslated."""
    proj = tmp_path / "proj"
    proj.mkdir()

    env = _bound_env(proj)
    assert (env.host_cwd, env.host_cwd_mount) == (str(proj), "/workspace")

    unbound = singularity_mod.SingularityEnvironment(
        image="/tmp/test.sif", persistent_filesystem=False,
        host_cwd=str(proj), auto_mount_cwd=False,
    )
    assert (unbound.host_cwd, unbound.host_cwd_mount) == (None, None)


def test_file_tools_translate_host_paths_through_the_bind(fake_apptainer, tmp_path):
    from tools.file_operations import ShellFileOperations

    proj = tmp_path / "proj"
    proj.mkdir()
    ops = ShellFileOperations(_bound_env(proj), cwd="/workspace")

    assert ops._expand_path(str(proj / "src" / "a.txt")) == "/workspace/src/a.txt"


# --- an instance is adopted by name only under the configuration that started it ---------------

def _starts(fake):
    return [c for c in fake.calls if c[1:3] == ["instance", "start"]]


def test_changed_bind_starts_a_new_instance_instead_of_adopting_the_old(fake_apptainer, tmp_path):
    """The name must carry what an instance bakes in at start (Docker's ``hermes-environment``
    label). Otherwise switching the project mount on, off or onto another directory keeps
    adopting the instance started under the previous configuration: the sandbox silently shows
    the WRONG project, and a mount switched off stays bound."""
    proj = tmp_path / "proj"
    proj.mkdir()
    first = _persistent_env()

    second = singularity_mod.SingularityEnvironment(
        image="/tmp/test.sif", persistent_filesystem=True, task_id="ws-project",
        host_cwd=str(proj), auto_mount_cwd=True,
    )

    assert second.instance_id != first.instance_id
    assert second._instance_reused is False
    assert _starts(fake_apptainer)[-1][-1] == second.instance_id
    assert f"{proj}:/workspace" in _starts(fake_apptainer)[-1]


def test_changed_image_starts_a_new_instance(fake_apptainer):
    first = _persistent_env()

    second = singularity_mod.SingularityEnvironment(
        image="/tmp/other.sif", persistent_filesystem=True, task_id="ws-project",
    )

    assert second.instance_id != first.instance_id
    assert "/tmp/other.sif" in _starts(fake_apptainer)[-1]
