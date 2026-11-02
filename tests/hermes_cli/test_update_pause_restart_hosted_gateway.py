"""A gateway hosted by the manual ``gateway restart`` fallback is paused and replayed as ``gateway run``.

Without a service manager (macOS with no launchd job, WSL, Termux) ``hermes gateway restart``
hosts the runtime in-process, so the live process's argv ends in ``gateway restart``. The pause
discovery read only ``gateway run`` argv: such a gateway kept running through the swap, the
fleet check then stamped it stale and the stale-survivor path drained it with no successor
(``runtime_outcomes: stopped``, ``gateway_restart`` owed). It is now listed as a bare gateway and
replayed as ``gateway run``: a replay of ``restart`` would first stop whatever serves the home.

Real processes and a real pause record; the fleet discovery that needs a live install is the only
seam bypassed. The lookalike reports its pid and argv into its home, exits 0 on SIGTERM and waits.
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
from contextlib import suppress

import psutil
import pytest

from tests.waiting import wait_until

_LOOKALIKE = """\
import json, os, signal, sys, time
from pathlib import Path
report = Path(os.environ["HERMES_HOME"]) / f"lookalike-{os.getpid()}.json"
report.with_suffix(".tmp").write_text(json.dumps({"pid": os.getpid(), "argv": sys.argv[1:]}))
os.replace(report.with_suffix(".tmp"), report)
signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
time.sleep(120)
"""


def _reports(home) -> dict[int, list[str]]:
    """pid -> argv of every lookalike that started under *home*."""
    found = {}
    for path in home.glob("lookalike-*.json"):
        body = json.loads(path.read_text(encoding="utf-8"))
        found[body["pid"]] = body["argv"]
    return found


@pytest.mark.platforms("posix")
@pytest.mark.spawns_gateway_lookalike  # stub children that sleep; killed below
def test_a_gateway_hosted_by_the_manual_restart_fallback_is_paused_and_replayed_as_gateway_run(
        tmp_path, monkeypatch, capsys):
    from hermes_cli import gateway, update_cmd_fleet, update_cmd_posix_pause as m, update_fleet_scope

    home = tmp_path / "home"
    home.mkdir()
    monkeypatch.setenv("HERMES_HOME", str(home))
    entry = tmp_path / "bin" / "hermes"  # a ``hermes`` entry token: the argv reads as a gateway command
    entry.parent.mkdir()
    entry.write_text(_LOOKALIKE, encoding="utf-8")
    hosted = subprocess.Popen([sys.executable, str(entry), "gateway", "restart"],
                              env={**os.environ, "HERMES_HOME": str(home)}, stdin=subprocess.DEVNULL)
    replay_pid = None
    try:
        wait_until(lambda: hosted.pid in _reports(home), what="the hosted gateway to report")
        # The fleet discovery that needs a live install, and the supervisor markers the lookalike
        # inherits from this runner's environment, are the seams; everything else is real.
        monkeypatch.setattr(gateway, "find_gateway_pids", lambda **_: [hosted.pid])
        monkeypatch.setattr(gateway, "_get_service_pids", lambda **_: set())
        monkeypatch.setattr(update_cmd_fleet, "_scoped_manual_gateway_pids", lambda pids, **_: list(pids))
        monkeypatch.setattr(update_fleet_scope, "gateway_pid_home", lambda pid: str(home))
        monkeypatch.setattr(m, "_supervisor_markers", lambda pid: None)
        monkeypatch.setattr(m, "_discover_systemd", list)
        monkeypatch.setattr(m, "_discover_launchd", list)
        # The replay's readiness: a lookalike cannot register as a serving gateway, its report stands in.
        monkeypatch.setattr(m, "_gateway_on_home", lambda _home, exclude: next(
            (pid for pid in _reports(home) if pid not in exclude and psutil.pid_exists(pid)), None))

        token = m._empty_token()
        m._pause(token)
        assert [e["argv"] for e in token.get("unmapped", [])] == [[sys.executable, str(entry), "gateway", "run"]], \
            capsys.readouterr().out
        assert hosted.wait(timeout=30) == 0, "the hosted gateway did not take the pause's stop"

        m.resume_paused_set(token)
        replays = {pid: argv for pid, argv in _reports(home).items() if pid != hosted.pid}
        assert list(replays.values()) == [["gateway", "run"]], replays
        replay_pid = next(iter(replays))
        assert token["unmapped"] == [] and token["resume_needed"] is False
    finally:
        if hosted.poll() is None:
            hosted.kill()
            hosted.wait(timeout=10)
        if replay_pid is not None:
            with suppress(ProcessLookupError):
                os.kill(replay_pid, signal.SIGKILL)
        m._RESTARTED["pids"].clear()


@pytest.mark.parametrize(("argv", "expected"), [
    (["hermes", "gateway", "restart"], ["hermes", "gateway", "run"]),
    (["hermes", "-p", "ops", "gateway", "restart", "--force"], ["hermes", "-p", "ops", "gateway", "run", "--force"]),
    (["hermes", "gateway", "--profile=ops", "restart", "--all", "--system"], ["hermes", "gateway", "--profile=ops", "run"]),
    (["python3", "-I", "-c", "import os, re, sys\nfrom hermes_cli.main import main\nsys.exit(main())", "gateway", "restart"],
     ["python3", "-I", "-c", "import os, re, sys\nfrom hermes_cli.main import main\nsys.exit(main())", "gateway", "run"]),
    (["hermes", "gateway", "run", "--quiet"], ["hermes", "gateway", "run", "--quiet"]),
    (["hermes", "gateway"], ["hermes", "gateway"]),
])
def test_the_replay_argv_only_swaps_the_hosting_subcommand(argv, expected):
    from hermes_cli.update_cmd_posix_pause import _replay_argv
    assert _replay_argv(argv) == expected
