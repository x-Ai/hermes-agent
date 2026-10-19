"""Deterministic-name races between backend processes creating the same persistent container
(the fork's ``ws-<digest>`` / profile rendezvous names): Docker elects one winner on the name
conflict, the loser joins it and never runs the failed-run cleanup that would remove the winner's
live container; out-of-band recovery takes the same arbitration path."""
import subprocess

from tests.tools.test_docker_environment import _make_dummy_env, _mock_subprocess_run
from tools.environments import docker as docker_env


def test_concurrent_persistent_create_joins_name_race_winner(monkeypatch):
    """Two backend processes may both pass the label probe before either runs.

    Docker's deterministic-name conflict elects one winner. The loser must join
    it and, critically, must not execute the generic failed-run cleanup that
    would remove the winner's live container.
    """
    monkeypatch.setattr(docker_env, "find_docker", lambda: "/usr/bin/docker")
    monkeypatch.setattr(docker_env, "_get_active_profile_name", lambda: "default")
    docker_env._cgroup_limits_ok = True
    calls = []
    ps_calls = 0

    def _run(cmd, **kwargs):
        nonlocal ps_calls
        calls.append((list(cmd) if isinstance(cmd, list) else cmd, kwargs))
        if isinstance(cmd, list) and len(cmd) >= 2:
            sub = cmd[1]
            if sub == "version":
                return subprocess.CompletedProcess(cmd, 0, stdout="ok", stderr="")
            if sub == "ps":
                ps_calls += 1
                if ps_calls == 1:
                    return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
                return subprocess.CompletedProcess(
                    cmd, 0, stdout="winner-cid\trunning\n", stderr="",
                )
            if sub == "run":
                raise subprocess.CalledProcessError(
                    125,
                    cmd,
                    output="",
                    stderr=(
                        'docker: Error response from daemon: Conflict. The container name '
                        '"/hermes-ws-shared-abc" is already in use by container "winner-cid".'
                    ),
                )
        return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

    monkeypatch.setattr(docker_env.subprocess, "run", _run)

    env = _make_dummy_env(task_id="ws-shared", persist_across_processes=True)

    assert env._container_id == "winner-cid"
    assert len([c for c in calls if isinstance(c[0], list) and c[0][1:2] == ["run"]]) == 1
    assert not [c for c in calls if isinstance(c[0], list) and c[0][1:2] == ["rm"]]


def test_recovery_joins_concurrent_recreation_winner(monkeypatch):
    """Out-of-band recovery uses the same cross-process arbitration path."""
    monkeypatch.setattr(docker_env, "find_docker", lambda: "/usr/bin/docker")
    monkeypatch.setattr(docker_env, "_get_active_profile_name", lambda: "default")
    _mock_subprocess_run(monkeypatch)
    env = _make_dummy_env(task_id="ws-recovery", persist_across_processes=True)
    env._container_id = "gone-cid"

    calls = []
    ps_calls = 0

    def _run(cmd, **kwargs):
        nonlocal ps_calls
        calls.append((list(cmd) if isinstance(cmd, list) else cmd, kwargs))
        if isinstance(cmd, list) and len(cmd) >= 2:
            sub = cmd[1]
            if sub == "ps":
                ps_calls += 1
                if ps_calls == 1:
                    return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
                return subprocess.CompletedProcess(
                    cmd, 0, stdout="recovery-winner\trunning\n", stderr="",
                )
            if sub == "run":
                raise subprocess.CalledProcessError(
                    125,
                    cmd,
                    output="",
                    stderr=(
                        "docker: Error response from daemon: Conflict. The container name "
                        "is already in use by container recovery-winner"
                    ),
                )
        return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

    monkeypatch.setattr(docker_env.subprocess, "run", _run)

    assert env._recreate_container() is True
    assert env._container_id == "recovery-winner"
    assert not [c for c in calls if isinstance(c[0], list) and c[0][1:2] == ["rm"]]
