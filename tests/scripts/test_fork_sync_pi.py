"""A Pi session reports its progress live and leaves no command running after its time limit."""
from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import sys

import pytest

from tests.waiting import wait_until

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"

# A stand-in for `pi --mode json`: prints the given events, then exits, hangs, or ignores SIGTERM.
FAKE_PI = r'''
import json, os, signal, subprocess, sys
events, mode, marker = json.loads(sys.argv[1]), sys.argv[2], sys.argv[3]
child = None
if mode == "hang":
    # Like Pi's bash tool: the command runs in its own process group.
    child = subprocess.Popen([sys.executable, "-c",
        "import os, signal, sys; open(sys.argv[1], 'w').write(str(os.getpid())); signal.pause()", marker],
        start_new_session=True)
def terminate(signum, frame):
    os.killpg(child.pid, signal.SIGKILL)
    sys.exit(143)
signal.signal(signal.SIGTERM, signal.SIG_IGN if mode == "stubborn" else terminate)
for event in events:
    sys.stdout.write(json.dumps(event, ensure_ascii=False) + "\n")
sys.stdout.flush()
if mode != "exit":
    signal.pause()
'''


@pytest.fixture
def pi_session(monkeypatch):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location("fork_sync_pi_session_test", CONTROLLER / "pi_session.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def no_orphan(tmp_path):
    """Kill the stand-in's command at teardown, so a regression cannot leak a process."""
    yield
    marker = tmp_path / "child.pid"
    if marker.is_file() and alive(pid := int(marker.read_text(encoding="utf-8"))):
        os.kill(pid, signal.SIGKILL)


def fake_pi(tmp_path, events, mode):
    script = tmp_path / "fake_pi.py"
    script.write_text(FAKE_PI, encoding="utf-8")
    return [sys.executable, str(script), json.dumps(events), mode, str(tmp_path / "child.pid")]


def alive(pid):
    state = subprocess.run(["ps", "-o", "stat=", "-p", str(pid)], capture_output=True, text=True,
                           check=False).stdout.strip()
    return bool(state) and not state.startswith("Z")


def test_tool_calls_and_the_summary_reach_the_log(pi_session, tmp_path):
    events = [
        {"type": "session", "version": 3},
        {"type": "tool_execution_start", "toolCallId": "a", "toolName": "bash",
         "args": {"command": "scripts/run_tests.sh tests/agent/test_i18n.py\necho done", "timeout": 600}},
        {"type": "tool_execution_end", "toolCallId": "a", "toolName": "bash", "isError": True, "durationMs": 90_000},
        {"type": "tool_execution_start", "toolCallId": "b", "toolName": "edit",
         "args": {"path": "locales/zh.yaml", "oldText": "secret-looking text", "newText": "中文"}},
        {"type": "tool_execution_end", "toolCallId": "b", "toolName": "edit", "isError": False, "durationMs": 5},
        {"type": "message_end", "message": {"role": "assistant", "usage": {"output": 42},
                                            "content": [{"type": "text", "text": "a b"}]}},
    ]
    lines = []
    code, stream, timed_out = pi_session.run(fake_pi(tmp_path, events, "exit"), {}, 60, lines.append)
    assert (code, timed_out) == (0, False)
    assert stream == "".join(json.dumps(event, ensure_ascii=False) + "\n" for event in events)
    log = "\n".join(lines)
    assert "bash scripts/run_tests.sh tests/agent/test_i18n.py … [timeout 600s]" in log
    assert "failed after 90s" in log and "edit locales/zh.yaml" in log
    assert "secret-looking text" not in log and "中文" not in log
    assert "1 model turns, 42 output tokens, 2 tool calls" in lines[-1]


@pytest.mark.platforms("posix")
def test_time_limit_stops_pi_and_the_command_it_started(pi_session, tmp_path, no_orphan):
    events = [{"type": "tool_execution_start", "toolCallId": "a", "toolName": "bash",
               "args": {"command": "pnpm install"}}]
    lines = []
    code, _, timed_out = pi_session.run(fake_pi(tmp_path, events, "hang"), {}, 5, lines.append)
    assert timed_out and code == 143
    assert "still running after" in lines[-1] and "bash pnpm install" in lines[-1]
    pid = int((tmp_path / "child.pid").read_text(encoding="utf-8"))
    wait_until(lambda: not alive(pid), what="the command Pi started to exit")


@pytest.mark.platforms("posix")
def test_pi_that_ignores_sigterm_is_killed(pi_session, tmp_path, monkeypatch):
    monkeypatch.setattr(pi_session, "GRACE_SECONDS", 1)
    code, _, timed_out = pi_session.run(fake_pi(tmp_path, [], "stubborn"), {}, 3, lambda line: None)
    assert timed_out and code < 0
