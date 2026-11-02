"""A stopped dashboard whose launcher argv carries a newline is captured and replayed verbatim.

The published launcher runs ``python -I -c '<multi-line bootstrap>' dashboard …``. BSD ``ps``
(macOS) renders the newlines inside that one argument as ``\\012``, and ``shlex.split`` then broke
the bootstrap into words, so every post-update dashboard respawn on macOS ran
``python -I -c import os, re, sys012import …`` and died on ``SyntaxError`` inside the liveness
grace (``logs/dashboard-restart.log``), leaving ``gateway_restart`` owed. psutil reads the argv
exactly; ``ps`` is only the fallback for a process it cannot read.

Real processes: the backend stand-in reports its pid and argv into the file named by its last
argument, then waits like a resident server.
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
from contextlib import suppress

import pytest

from tests.waiting import wait_until

_SOURCE = (
    "import json, os, sys, time\n"
    "report = sys.argv[1]\n"
    "with open(report + '.tmp', 'w') as f:\n"
    "    json.dump({'pid': os.getpid(), 'argv': sys.argv}, f)\n"
    "os.replace(report + '.tmp', report)\n"
    "time.sleep(120)\n"
)


def _report(path):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


@pytest.mark.platforms("posix")
def test_a_launcher_argv_spanning_lines_is_captured_and_replayed_verbatim(tmp_path, monkeypatch):
    from hermes_cli import main_dashboard

    monkeypatch.setenv("HERMES_HOME", str(tmp_path / "home"))
    report = tmp_path / "report.json"
    argv = [sys.executable, "-I", "-c", _SOURCE, str(report)]
    stopped = subprocess.Popen(argv, stdin=subprocess.DEVNULL)
    replay_pid = None
    try:
        assert wait_until(lambda: _report(report), what="the stand-in to report")["pid"] == stopped.pid
        captured = main_dashboard._dashboard_cmdline_for_pid(stopped.pid)
        assert captured == argv, "the captured argv is not the one the process was started with"

        report.unlink()
        assert main_dashboard._respawn_dashboard_processes([captured]) == []
        replay = wait_until(lambda: _report(report), what="the replay to report")
        replay_pid = replay["pid"]
        assert replay_pid != stopped.pid
        assert replay["argv"] == ["-c", str(report)]  # the whole source ran: nothing was split into words
    finally:
        stopped.kill()
        stopped.wait(timeout=10)
        if replay_pid is not None:
            with suppress(ProcessLookupError):
                os.kill(replay_pid, signal.SIGKILL)
