"""The deterministic name of a cross-process persistent container must key on the SAME identity
``_find_reusable_container`` filters on — task, profile, egress posture and the immutable
environment fingerprint (image, mounts, Hermes home).

With the fingerprint left out, a sandbox created under an earlier configuration (another image,
another mounted project directory, a changed mount path) is invisible to the reuse probe yet still
owns the name, so every fresh ``docker run`` fails with a name conflict, the conflict is mistaken for
a concurrent creator, and after the race wait the terminal tool gives up — until someone removes
the old container by hand. Upstream's random names never had this failure mode.
"""

import subprocess

import pytest

from tools.environments import docker as docker_env


def _run_name(cmd: list[str]) -> str | None:
    return cmd[cmd.index("--name") + 1] if "--name" in cmd else None


@pytest.fixture
def fake_docker(monkeypatch):
    """A daemon with no reusable container: every ``ps`` probe misses, every ``run`` succeeds
    unless the test registers the name as taken (a container the probe cannot see)."""
    monkeypatch.setattr(docker_env, "find_docker", lambda: "/usr/bin/docker")
    monkeypatch.setattr(docker_env, "_get_active_profile_name", lambda: "default")
    monkeypatch.setattr(docker_env.time, "sleep", lambda *_: None)
    monkeypatch.setattr(docker_env.DockerEnvironment, "init_session", lambda self: None)
    docker_env._cgroup_limits_ok = True
    state = {"taken": set(), "runs": [], "removed": []}

    def _run(cmd, **kwargs):
        if not isinstance(cmd, list) or len(cmd) < 2:
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        sub = cmd[1]
        if sub == "version":
            return subprocess.CompletedProcess(cmd, 0, stdout="ok", stderr="")
        if sub == "ps":
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        if sub == "rm":
            state["removed"].append(cmd[-1])
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        if sub == "run":
            name = _run_name(cmd)
            state["runs"].append(name)
            if name in state["taken"]:
                raise subprocess.CalledProcessError(
                    125, cmd, output="",
                    stderr=f'docker: Error response from daemon: Conflict. The container name "/{name}" '
                           f'is already in use by container "stale-cid".')
            return subprocess.CompletedProcess(cmd, 0, stdout=f"cid-{len(state['runs'])}\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

    monkeypatch.setattr(docker_env.subprocess, "run", _run)
    return state


def _env(**kwargs):
    return docker_env.DockerEnvironment(
        image=kwargs.pop("image", "python:3.11"), cwd=kwargs.pop("cwd", "/workspace"), timeout=60,
        task_id=kwargs.pop("task_id", "default"), persist_across_processes=True, **kwargs)


def test_name_follows_the_environment_fingerprint(fake_docker, tmp_path, monkeypatch):
    """Same configuration → same rendezvous name; another image or another mounted project
    directory → another name, exactly as the reuse probe would judge them."""
    # tmp_path sits under the system tempdir, which the fingerprint canonicalizes as a volatile
    # per-process mount; real project directories never do.
    monkeypatch.setattr(docker_env, "_is_volatile_mount_spec", lambda spec: False)
    (tmp_path / "a").mkdir()
    (tmp_path / "b").mkdir()
    _env()
    _env()
    _env(image="python:3.12")
    _env(host_cwd=str(tmp_path / "a"), auto_mount_cwd=True)
    _env(host_cwd=str(tmp_path / "b"), auto_mount_cwd=True)
    same, same_again, other_image, project_a, project_b = fake_docker["runs"]
    assert same == same_again
    assert len({same, other_image, project_a, project_b}) == 4


def test_a_container_of_another_configuration_never_blocks_a_fresh_run(fake_docker):
    """The daemon still holds the container a previous configuration created; the probe (filtering
    on the new fingerprint) does not see it. Starting under the new configuration must succeed."""
    _env(image="python:3.11")
    fake_docker["taken"].add(fake_docker["runs"][0])

    env = _env(image="python:3.12")

    assert env._container_id == "cid-2"
    assert fake_docker["runs"][1] not in fake_docker["taken"]
    assert not fake_docker["removed"], "the previous configuration's sandbox is not ours to delete"


def test_persistent_name_is_stable_and_identity_scoped():
    first = docker_env._persistent_container_name("ws-project", "default", "off", "env-a")
    assert first == docker_env._persistent_container_name("ws-project", "default", "off", "env-a")
    assert first != docker_env._persistent_container_name("ws-other", "default", "off", "env-a")
    assert first != docker_env._persistent_container_name("ws-project", "work", "off", "env-a")
    assert first != docker_env._persistent_container_name("ws-project", "default", "on", "env-a")
    assert first != docker_env._persistent_container_name("ws-project", "default", "off", "env-b")
    assert first.startswith("hermes-ws-project-")
    assert len(first) <= 63
