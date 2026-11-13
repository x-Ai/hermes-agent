"""A delegated child's foreground command: cwd keyed by the child's task, routing by the parent's key.

The fork keyed a delegated child's cwd record on its own task id (``cwd_session_key``); upstream
adopted the same fix as ``cwd_key`` and keeps the inherited session key for everything else. The
merge took upstream's shape, so a yield-to-background of the child's foreground command routes its
completion by the parent's session key (as a background spawn always did), while the command still
runs in the child's own directory and the parent's cwd record is never touched.
"""

import json

import pytest

from agent.delegation_context import delegated_child_context
from tools import terminal_tool
from tools.approval_context import reset_current_session_key, set_current_session_key


@pytest.fixture(autouse=True)
def _isolated_terminal_state(monkeypatch):
    monkeypatch.setattr(terminal_tool, "_terminal_config_bridge_attempted", True)
    with terminal_tool._session_cwd_lock:
        previous = dict(terminal_tool._session_cwd)
        terminal_tool._session_cwd.clear()
    yield
    with terminal_tool._session_cwd_lock:
        terminal_tool._session_cwd.clear()
        terminal_tool._session_cwd.update(previous)


def test_child_foreground_command_runs_in_child_cwd_and_routes_by_parent_key(monkeypatch, tmp_path):
    workspace = tmp_path / "project"
    workspace.mkdir()
    monkeypatch.setenv("TERMINAL_ENV", "docker")
    monkeypatch.setenv("TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE", "true")
    monkeypatch.setenv("TERMINAL_DOCKER_WORKSPACE_MOUNT_PATH", "/workspace")
    monkeypatch.setenv("TERMINAL_CWD", str(workspace))
    terminal_tool.record_session_cwd("parent-route", "/workspace/parent-dir")
    terminal_tool.record_session_cwd("child-task", "/workspace")

    class FakeContainer:
        env = {}
        cwd = "/workspace"
        executed_cwd = None

        def execute(self, command, **kwargs):
            self.executed_cwd = kwargs.get("cwd")
            return {"output": "ok", "returncode": 0}

    container = FakeContainer()
    monkeypatch.setattr(terminal_tool, "_resolve_container_task_id", lambda _task_id: "shared")
    monkeypatch.setattr(terminal_tool, "_active_environments", {"shared": container})
    monkeypatch.setattr(terminal_tool, "_last_activity", {})
    monkeypatch.setattr(terminal_tool, "_start_cleanup_thread", lambda: None)
    monkeypatch.setattr(terminal_tool, "_check_all_guards", lambda command, env_type, **kwargs: {"approved": True})
    routed = {}

    def yield_handler(*, command, **ctx):  # records the routing context; None = no yield handler
        routed.update(ctx)
    monkeypatch.setattr(terminal_tool, "yield_to_background_handler", yield_handler)

    token = set_current_session_key("parent-route")
    try:
        with delegated_child_context("child-session"):
            result = json.loads(terminal_tool.terminal_tool("pwd", task_id="child-task"))
    finally:
        reset_current_session_key(token)

    assert result["exit_code"] == 0
    assert container.executed_cwd == "/workspace"
    assert routed["session_key"] == "parent-route" and routed["task_id"] == "child-task"
    assert terminal_tool.get_session_cwd("parent-route") == "/workspace/parent-dir"
