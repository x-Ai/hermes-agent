"""Root-written files in the mounted host project directory go back to the host user when the session
releases its root container: only what the container created (root-owned now, not at its start), through
``docker exec`` while a persist-mode container keeps running, through the sandbox handback's throwaway
after a session-scoped container stopped; never recorded beside the project directory, never flipped
back to root. The Linux / rootless / host-user gates are ``docker_ownership``'s (tested there): these
tests give the host ids directly so the contract runs on every host."""

import importlib
import json
import subprocess

import pytest

from tools.environments import docker as docker_env
from tools.environments import docker_ownership_projects as projects

_BEFORE = b"/workspace/vendor/root-owned\0"  # root's before the container ran: another tool's output
_AFTER = _BEFORE + b"/workspace/build\0/workspace/build/out.o\0"  # plus what this container created


def _fake_docker(monkeypatch, *, baseline_fails: bool = False):
    docker_env._cgroup_limits_ok = True
    importlib.import_module("tools.environments.docker_ownership")._remapping_cache.clear()
    state = {"walks": 0, "running": True}
    calls: list[tuple[list[str], bytes]] = []

    def _inspect() -> str:
        run = next(argv for argv, _ in calls if argv[1] == "run")
        mounts = [{"Destination": run[i + 1].split(":")[1]} for i, a in enumerate(run[:-1]) if a == "-v"]
        user = next((run[i + 1] for i, a in enumerate(run[:-1]) if a == "--user"), "")  # however it was selected
        return json.dumps([{"Config": {"User": user}, "Image": "sha256:img", "Mounts": mounts,
                            "State": {"Running": state["running"]}}])

    def _run(cmd, **kwargs):
        argv = [str(a) for a in cmd]
        calls.append((argv, kwargs.get("input") or b""))
        sub = argv[1] if len(argv) > 1 else ""
        rc, out = 0, {"run": "fake-cid\n", "info": "[name=apparmor name=seccomp]"}.get(sub, "")
        if sub == "stop":
            state["running"] = False
        if sub == "inspect" and argv[-1] == "fake-cid":
            out = _inspect() if len(argv) == 3 else json.dumps(json.loads(_inspect())[0]["Mounts"])
        if "/usr/bin/find" in argv and "-user" in argv:
            state["walks"] += 1
            first = state["walks"] == 1
            out = (_BEFORE if first else _AFTER).decode()
            rc = 1 if first and baseline_fails else 0
        if kwargs.get("text") or kwargs.get("encoding"):
            return subprocess.CompletedProcess(argv, rc, stdout=out, stderr="")
        return subprocess.CompletedProcess(argv, rc, stdout=out.encode(), stderr=b"")

    monkeypatch.setattr(docker_env.subprocess, "run", _run)
    monkeypatch.setattr(docker_env, "find_docker", lambda: "/usr/bin/docker")
    monkeypatch.setattr(docker_env.DockerEnvironment, "init_session", lambda self: None)
    monkeypatch.setattr(projects, "_handback_ids", lambda exe: (1000, 1000))  # the Linux gate is upstream's
    return calls, state


def _env(project, *, persist_across_processes: bool, run_as_host_user: bool = False, extra_args=None):
    return docker_env.DockerEnvironment(
        image="python:3.12-slim", cwd="/workspace", timeout=5, task_id="proj", persistent_filesystem=False,
        persist_across_processes=persist_across_processes, run_as_host_user=run_as_host_user,
        host_cwd=str(project), auto_mount_cwd=True, extra_args=extra_args or [])


def _chowns(calls):
    return [(argv, stdin) for argv, stdin in calls if "/bin/chown" in argv]


def _walks(calls):
    return [argv for argv, _ in calls if "/usr/bin/find" in argv]


def test_a_persisting_container_hands_back_only_what_it_created_while_it_keeps_running(monkeypatch, tmp_path):
    project = tmp_path / "proj"
    project.mkdir()
    calls, _ = _fake_docker(monkeypatch)
    env = _env(project, persist_across_processes=True)
    assert env._project_mounts == [(str(project), "/workspace")]
    assert env._project_root_baseline == frozenset(_BEFORE.split(b"\0")) - {b""}
    (baseline,) = _walks(calls)
    assert baseline[1] == "exec" and baseline[baseline.index("/usr/bin/find") + 1:baseline.index("-xdev")] == ["-P", "/workspace"]
    assert " ".join(baseline).endswith("( -type f -o -type d -o -type l ) -user 0 -print0")

    env.cleanup()
    assert env.wait_for_cleanup(5)
    subcommands = [argv[1] for argv, _ in calls]
    assert "stop" not in subcommands and "rm" not in subcommands  # the container stays up for the next session
    ((chown, stdin),) = _chowns(calls)
    assert chown[1] == "exec" and "0:0" in chown[:chown.index("fake-cid")] and "1000:1000" in chown
    assert stdin == b"/workspace/build\0/workspace/build/out.o\0"  # not the pre-existing root-owned path
    assert not list(tmp_path.rglob(".hermes-owner-handback"))  # no record beside the user's directory


def test_a_session_scoped_container_hands_back_after_stop_before_rm_from_its_volumes(monkeypatch, tmp_path):
    project = tmp_path / "proj"
    project.mkdir()
    calls, _ = _fake_docker(monkeypatch)
    env = _env(project, persist_across_processes=False)
    env.cleanup()
    assert env.wait_for_cleanup(5)
    subcommands = [argv[1] for argv, _ in calls]
    ((chown, stdin),) = _chowns(calls)
    walk = _walks(calls)[-1]
    stop, rm = subcommands.index("stop"), subcommands.index("rm")
    assert stop < calls.index((walk, b"")) < rm and stop < calls.index((chown, stdin)) < rm
    for argv in (walk, chown):  # stopped: the throwaway of the same image, confined like the sandbox handback
        assert argv[1] == "run" and argv[argv.index("--volumes-from") + 1] == "fake-cid" and "sha256:img" in argv
        joined = " ".join(argv[:argv.index("sha256:img")])
        assert "--cap-drop ALL" in joined and "no-new-privileges" in joined and "-e PATH=/usr/sbin:/usr/bin:/sbin:/bin" in joined
    assert stdin == b"/workspace/build\0/workspace/build/out.o\0"


@pytest.mark.parametrize("scenario", ["host-user", "extra-user", "baseline-failed", "no-project-mount"])
def test_nothing_is_handed_back_without_a_root_container_and_a_baseline(monkeypatch, tmp_path, scenario):
    project = tmp_path / "proj"
    project.mkdir()
    calls, _ = _fake_docker(monkeypatch, baseline_fails=scenario == "baseline-failed")
    if scenario == "no-project-mount":
        env = docker_env.DockerEnvironment(image="python:3.12-slim", cwd="/workspace", timeout=5, task_id="bare",
                                           persistent_filesystem=False, persist_across_processes=True)
        assert env._project_mounts == [] and env._project_root_baseline is None
    else:
        env = _env(project, persist_across_processes=True, run_as_host_user=scenario == "host-user",
                   extra_args=["--user", "1000:1000"] if scenario == "extra-user" else None)
        assert env._project_root_baseline is None
    env.cleanup()
    assert env.wait_for_cleanup(5)
    assert _chowns(calls) == []


def test_nested_mounts_under_the_project_directory_are_pruned_from_the_walk(monkeypatch, tmp_path):
    project, shared = tmp_path / "proj", tmp_path / "shared"
    project.mkdir()
    shared.mkdir()
    calls, _ = _fake_docker(monkeypatch)
    env = _env(project, persist_across_processes=True, extra_args=["-v", f"{shared}:/workspace/shared"])
    baseline = _walks(calls)[0]
    assert [baseline[i + 1] for i, a in enumerate(baseline) if a == "-path"] == ["/workspace/shared"]
    env.cleanup()  # held until here: a collected env would tear down and walk again mid-assertion
