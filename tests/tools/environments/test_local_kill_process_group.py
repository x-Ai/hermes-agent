"""Regression for the native rg lane flake: ripgrep can exit and be reaped between the
caller's ``poll()`` and the process-group teardown. With nothing having recorded the
group, ``os.getpgid`` answers ESRCH and the teardown used to re-raise it into the search
(``tests/tools/test_file_tools_live.py::TestSearch`` failed once, passed on retry)."""

import subprocess
import sys

import pytest

from tools.environments.local import _kill_process_group_posix


@pytest.mark.platforms("posix")
def test_group_kill_of_a_reaped_wrapper_without_a_recorded_group_is_a_no_op():
    proc = subprocess.Popen([sys.executable, "-c", "pass"], start_new_session=True)
    proc.wait()  # reaped: the PID and its group are gone, and nothing recorded the pgid
    assert not hasattr(proc, "_hermes_pgid")

    _kill_process_group_posix(proc)  # nothing left to signal; must not raise

    assert proc.returncode == 0
