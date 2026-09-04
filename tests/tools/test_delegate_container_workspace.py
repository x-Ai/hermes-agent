"""Delegated children inherit mounted Docker/Singularity workspaces.

Surface sessions record the host spelling of an attached workspace.  Once it
is bind-mounted, however, child tools must resolve relative paths from the
container spelling (normally ``/workspace``).  These tests cover both the
child prompt and the task-id/cwd seed used by terminal and file tools.
"""

import json
from pathlib import PurePosixPath
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from agent.delegation_context import delegated_child_context
from tools import file_tools, terminal_tool
from tools.approval_context import reset_current_session_key, set_current_session_key
from tools.delegate_tool import (
    _build_child_system_prompt,
    _resolve_host_workspace_hint,
    _resolve_workspace_hint,
    _run_single_child,
)


_BACKEND_MOUNT_FLAG = {
    "docker": "TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE",
    "singularity": "TERMINAL_SINGULARITY_MOUNT_CWD_TO_WORKSPACE",
}
_BACKEND_MOUNT_PATH = {
    "docker": "TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH",
    "singularity": "TERMINAL_SINGULARITY_WORKSPACE_MOUNT_PATH",
}
_MOUNT_CASES = [
    (backend, mount_path)
    for backend in sorted(_BACKEND_MOUNT_FLAG)
    for mount_path in ("/workspace", "/mnt/project")
]


@pytest.fixture(autouse=True)
def _isolated_terminal_state(monkeypatch):
    monkeypatch.setattr(terminal_tool, "_terminal_config_bridge_attempted", True)
    with terminal_tool._session_cwd_lock:
        previous_cwds = dict(terminal_tool._session_cwd)
        terminal_tool._session_cwd.clear()
    with terminal_tool._container_alias_lock:
        previous_aliases = dict(terminal_tool._container_aliases)
        terminal_tool._container_aliases.clear()
    yield
    with terminal_tool._session_cwd_lock:
        terminal_tool._session_cwd.clear()
        terminal_tool._session_cwd.update(previous_cwds)
    with terminal_tool._container_alias_lock:
        terminal_tool._container_aliases.clear()
        terminal_tool._container_aliases.update(previous_aliases)


def _configure_mounted_backend(monkeypatch, backend, workspace, mount_path):
    monkeypatch.setenv("TERMINAL_ENV", backend)
    monkeypatch.setenv(_BACKEND_MOUNT_FLAG[backend], "true")
    monkeypatch.setenv(_BACKEND_MOUNT_PATH[backend], mount_path)
    monkeypatch.setenv("TERMINAL_CWD", str(workspace))


def test_local_backend_keeps_the_host_workspace_path(monkeypatch, tmp_path):
    workspace = tmp_path / "local-project"
    workspace.mkdir()
    monkeypatch.setenv("TERMINAL_ENV", "local")
    monkeypatch.setenv("TERMINAL_CWD", str(workspace))
    terminal_tool.record_session_cwd("parent-task", str(workspace))
    parent = SimpleNamespace(
        _current_task_id="parent-task",
        _subdirectory_hints=SimpleNamespace(working_dir=str(workspace)),
        terminal_cwd=None,
        cwd=None,
    )

    assert terminal_tool.get_session_execution_cwd("parent-task") == str(workspace)
    assert _resolve_workspace_hint(parent) == str(workspace)


@pytest.mark.parametrize("backend,mount_path", _MOUNT_CASES)
def test_child_prompt_names_container_workspace_but_loads_host_rules(
    monkeypatch, tmp_path, backend, mount_path
):
    workspace = tmp_path / "project"
    workspace.mkdir()
    (workspace / "AGENTS.md").write_text(
        "# Mounted project rule\nAlways verify child workspace inheritance.\n",
        encoding="utf-8",
    )
    _configure_mounted_backend(monkeypatch, backend, workspace, mount_path)

    parent = SimpleNamespace(
        _current_task_id="parent-task",
        _subdirectory_hints=SimpleNamespace(working_dir=str(workspace)),
        terminal_cwd=None,
        cwd=None,
    )
    terminal_tool.record_session_cwd("parent-task", str(workspace))

    execution_path = _resolve_workspace_hint(parent)
    context_path = _resolve_host_workspace_hint(parent)
    prompt = _build_child_system_prompt(
        "inspect the mounted project",
        workspace_path=execution_path,
        context_workspace_path=context_path,
    )

    assert execution_path == mount_path
    assert context_path == str(workspace)
    assert f"WORKSPACE PATH:\n{mount_path}\n" in prompt
    assert "Always verify child workspace inheritance." in prompt


@pytest.mark.parametrize("backend,mount_path", _MOUNT_CASES)
def test_run_single_child_seeds_relative_file_tools_at_container_mount(
    monkeypatch, tmp_path, backend, mount_path
):
    workspace = tmp_path / "project"
    workspace.mkdir()
    _configure_mounted_backend(monkeypatch, backend, workspace, mount_path)
    terminal_tool.record_session_cwd("parent-task", str(workspace))

    parent = MagicMock()
    parent._current_task_id = "parent-task"
    parent._active_children = []
    parent._active_children_lock = None
    parent.session_id = "parent-session"
    parent.tool_progress_callback = None
    parent._touch_activity = None

    child = MagicMock()
    child._subagent_id = "mounted-child"
    child._credential_pool = None
    child._delegate_saved_tool_names = []
    child._delegate_role = "leaf"
    child._parent_session_id = "parent-session"
    child._delegation_id = None
    child.session_id = "child-session"
    child.model = "test-model"
    child.session_prompt_tokens = 0
    child.session_completion_tokens = 0

    def _run_child(*, user_message, task_id, stream_callback):
        assert task_id == "mounted-child"
        assert terminal_tool.get_session_cwd(task_id) == mount_path
        assert file_tools._resolve_base_dir(
            task_id, container_paths=True
        ) == PurePosixPath(mount_path)
        return {
            "final_response": "workspace inherited",
            "completed": True,
            "interrupted": False,
            "api_calls": 1,
            "messages": [],
        }

    child.run_conversation.side_effect = _run_child
    with patch("tools.delegate_tool._get_worktree_isolation", return_value=False):
        result = _run_single_child(
            task_index=0,
            goal="inspect relative files",
            child=child,
            parent_agent=parent,
        )

    assert result["status"] == "completed"


@pytest.mark.parametrize("backend", sorted(_BACKEND_MOUNT_FLAG))
def test_delegated_terminal_uses_child_cwd_not_parent_routing_key(
    monkeypatch, tmp_path, backend
):
    """Approval routing identity must not override a child's cwd identity.

    Detached children intentionally inherit the parent's approval/session
    ContextVars so dangerous-command prompts and completion delivery still
    reach the user.  Their terminal cwd is different state: it is seeded under
    the child's raw task id.  Using the inherited routing key for cwd lookup
    makes a stale parent path override that seed and lets sibling children
    overwrite one another's cwd in their shared container.
    """
    workspace = tmp_path / "project"
    workspace.mkdir()
    _configure_mounted_backend(monkeypatch, backend, workspace, "/workspace")

    parent_routing_key = "parent-route"
    child_task_id = "mounted-child"
    stale_parent_cwd = "/workspace/removed-parent-directory"
    child_cwd = "/workspace"
    child_settled_cwd = "/workspace/child-subdirectory"
    terminal_tool.record_session_cwd(parent_routing_key, stale_parent_cwd)
    terminal_tool.record_session_cwd(child_task_id, child_cwd)

    class FakeSharedContainer:
        env = {}
        cwd = child_cwd
        executed_cwd = None

        def execute(self, command, **kwargs):
            self.executed_cwd = kwargs.get("cwd")
            self.cwd = child_settled_cwd
            return {
                "output": "ok",
                "returncode": 0,
                "cwd_observed": True,
            }

    shared = FakeSharedContainer()
    monkeypatch.setattr(
        terminal_tool, "_resolve_container_task_id", lambda _task_id: "shared"
    )
    monkeypatch.setattr(terminal_tool, "_active_environments", {"shared": shared})
    monkeypatch.setattr(terminal_tool, "_last_activity", {})
    monkeypatch.setattr(terminal_tool, "_start_cleanup_thread", lambda: None)
    monkeypatch.setattr(
        terminal_tool,
        "_check_all_guards",
        lambda command, env_type, **kwargs: {"approved": True},
    )

    routing_token = set_current_session_key(parent_routing_key)
    try:
        with delegated_child_context("child-session"):
            result = json.loads(
                terminal_tool.terminal_tool("pwd", task_id=child_task_id)
            )
    finally:
        reset_current_session_key(routing_token)

    assert result["exit_code"] == 0
    assert shared.executed_cwd == child_cwd
    assert terminal_tool.get_session_cwd(parent_routing_key) == stale_parent_cwd
    assert terminal_tool.get_session_cwd(child_task_id) == child_settled_cwd
