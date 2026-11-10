"""The child's host workspace hint keeps both sides of the merge.

The fork's ``_resolve_host_workspace_hint`` (the directory a child loads AGENTS.md / CLAUDE.md from,
and its WORKSPACE PATH off containers) puts the session's registered project first; upstream's SSH
guards apply to every candidate, the registered one included: on SSH a candidate must name the
target, never a same-named directory on the machine running Hermes.
"""

from types import SimpleNamespace

import pytest

from tools import terminal_tool
from tools.delegate_tool_progress import _resolve_host_workspace_hint, _resolve_workspace_hint


@pytest.fixture(autouse=True)
def _isolated_task_state(monkeypatch):
    monkeypatch.setattr(terminal_tool, "_task_env_overrides", {})
    monkeypatch.setattr(terminal_tool, "_session_cwd", {})
    monkeypatch.setattr(terminal_tool, "_terminal_config_bridge_attempted", True)


def _parent(**extra):
    return SimpleNamespace(_current_task_id="parent-task", _subdirectory_hints=None,
                           session_cwd=None, terminal_cwd=None, cwd=None, **extra)


def test_registered_project_outranks_the_launch_cwd_on_a_local_backend(tmp_path, monkeypatch):
    launch, project = tmp_path / "launch", tmp_path / "project"
    launch.mkdir()
    project.mkdir()
    monkeypatch.setenv("TERMINAL_ENV", "local")
    monkeypatch.setenv("TERMINAL_CWD", str(launch))
    terminal_tool.register_task_env_overrides("parent-task", {"cwd": str(project)})

    assert _resolve_host_workspace_hint(_parent()) == str(project)
    assert _resolve_workspace_hint(_parent()) == str(project)


@pytest.mark.parametrize("remote_cwd", ["project", "~/project"])
def test_ssh_never_resolves_a_registered_remote_relative_project_on_the_host(
    tmp_path, monkeypatch, remote_cwd,
):
    # A host directory that happens to carry the remote project's name.
    (tmp_path / "project").mkdir()
    monkeypatch.setenv("HOME", str(tmp_path))
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("TERMINAL_ENV", "ssh")
    monkeypatch.setenv("TERMINAL_CWD", remote_cwd)
    terminal_tool.register_task_env_overrides("parent-task", {"cwd": remote_cwd})

    assert _resolve_host_workspace_hint(_parent()) is None
    assert _resolve_workspace_hint(_parent()) is None


def test_ssh_keeps_a_registered_absolute_project(tmp_path, monkeypatch):
    project = tmp_path / "srv" / "project"
    project.mkdir(parents=True)
    monkeypatch.setenv("TERMINAL_ENV", "ssh")
    monkeypatch.setenv("TERMINAL_CWD", "elsewhere")
    terminal_tool.register_task_env_overrides("parent-task", {"cwd": str(project)})

    assert _resolve_host_workspace_hint(_parent()) == str(project)
