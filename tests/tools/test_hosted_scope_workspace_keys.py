"""A hosted scope keys its agent's sandbox over the fork's per-project and delegate-alias keys.

The fork keys a Docker sandbox per project directory (``ws-<digest>``,
``terminal.docker_workspace_per_session``) and follows delegate_task's child -> parent alias registry
in ``_resolve_container_task_id``; upstream's hosted scope overrides every branch there with the
agent's sandbox identity. Both hold after the merge: unscoped calls keep the fork's keys, and a hosted
call reaches only its own sandbox, whatever project or parent its task id names.
"""

from __future__ import annotations

import pytest

import tools.terminal_tool as tt
from agent.runtime_scope import bind_state
from hermes_scope import Principal, Scope
from tools.environments.sandbox_scope import sandbox_identity
from tools.terminal_tool_lifecycle import get_active_env

A = Scope("acme", "agent-a", Principal("u1"), owner=Principal("u1"), can_administer=True)


@pytest.fixture
def project(monkeypatch, tmp_path):
    """A host project directory with the fork's per-project Docker workspaces switched on."""
    monkeypatch.setenv("TERMINAL_ENV", "docker")
    monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
    monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_PER_SESSION", "true")
    monkeypatch.setattr(tt, "_active_environments", {})
    monkeypatch.setattr(tt, "_last_activity", {})
    path = tmp_path / "project"
    path.mkdir()
    yield path
    for key in list(tt._task_env_overrides):
        tt.clear_task_env_overrides(key)
    with tt._session_cwd_lock:
        tt._session_cwd.clear()
    with tt._container_alias_lock:
        tt._container_aliases.clear()


def test_a_hosted_scope_keys_its_sandbox_not_the_project_workspace(project):
    tt.register_task_env_overrides("sess-1", {"cwd": str(project)})
    assert tt._resolve_container_task_id("sess-1").startswith("ws-")  # the fork's per-project key, unscoped
    with bind_state(A):
        assert tt._resolve_container_task_id("sess-1") == sandbox_identity(A).key


def test_a_hosted_subagent_does_not_follow_the_alias_to_another_environment(project, monkeypatch):
    tt.register_task_env_overrides("parent", {"cwd": str(project)})
    tt.register_container_alias("child", "parent")
    parent_key = tt._resolve_container_task_id("parent")
    assert tt._resolve_container_task_id("child") == parent_key  # unscoped: the child shares the parent's
    monkeypatch.setitem(tt._active_environments, parent_key, object())
    with bind_state(A):
        assert tt._resolve_container_task_id("child") == sandbox_identity(A).key
        assert get_active_env("child") is None  # the parent's cached environment is never handed over
