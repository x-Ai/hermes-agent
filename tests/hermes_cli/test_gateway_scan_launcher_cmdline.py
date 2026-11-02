"""The gateway process sweep lists a gateway started through the published launcher.

The launcher is ``python -I -c '<bootstrap>' gateway run`` with a bootstrap that spans lines. BSD
``ps`` (macOS) renders the newlines inside that one argument as ``\\012``, which the bootstrap
matcher in ``gateway.status`` cannot read, so ``_scan_gateway_pids`` never listed such a gateway
on macOS: ``hermes update`` did not pause it before the swap, stamped it stale afterwards and
stopped it with no successor. The sweep now reads argv through psutil before falling back to ``ps``.
"""

from __future__ import annotations

import os
import subprocess
import sys

import psutil
import pytest

from tests.waiting import wait_until

# A launcher stand-in: the ``import os, re, sys … from <module> import <entry> … sys.exit(<entry>())``
# shape the bootstrap matcher maps to ``python -m hermes_cli.main …``, whose entry point only waits.
_BOOTSTRAP = """\
import os, re, sys
import time, types
pkg, mod = types.ModuleType("hermes_cli"), types.ModuleType("hermes_cli.main")
pkg.__path__, mod.main = [], lambda: time.sleep(120)
sys.modules["hermes_cli"], sys.modules["hermes_cli.main"] = pkg, mod
from hermes_cli.main import main
sys.exit(main())
"""


@pytest.mark.platforms("posix")
@pytest.mark.spawns_gateway_lookalike  # a stub child that sleeps; killed below
def test_the_sweep_lists_a_gateway_started_through_the_multi_line_launcher(tmp_path, monkeypatch):
    import hermes_cli.gateway as gw
    from gateway.status import looks_like_gateway_command_line

    argv = [sys.executable, "-I", "-c", _BOOTSTRAP, "gateway", "run"]
    assert looks_like_gateway_command_line(" ".join(argv)), "premise: the exact argv reads as a gateway"
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    lookalike = subprocess.Popen(argv, env={**os.environ, "HERMES_HOME": str(tmp_path)}, stdin=subprocess.DEVNULL)
    try:
        # Popen returns once exec has begun, before the kernel publishes the new image's argv.
        wait_until(lambda: psutil.Process(lookalike.pid).cmdline()[-2:] == ["gateway", "run"],
                   interval=0.001, what="the lookalike's argv")
        monkeypatch.setattr(gw, "_get_ancestor_pids", set)
        assert lookalike.pid in gw._scan_gateway_pids(set(), all_profiles=True)
    finally:
        lookalike.kill()
        lookalike.wait(timeout=10)
