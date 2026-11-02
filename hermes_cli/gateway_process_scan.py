"""The POSIX process-table rungs behind ``hermes_cli.gateway._scan_gateway_pids``: ``/proc``
(Docker without procps), psutil's exact argv, then ``ps -Aww``. Each rung yields ``(pid, command
line)`` with the argv space-joined, the shape ``gateway.status``'s matchers read; the facade owns
the matching and the ``/proc`` reader (``_iter_proc_cmdlines``, a test seam).

psutil comes before ``ps`` because BSD ``ps`` (macOS) renders a newline inside one argument as the
octal escape ``\\012`` (a tab as ``\\011``) while printing a literal backslash verbatim, so nothing
downstream can undo it: a gateway started through the published launcher, whose ``-c`` bootstrap
spans lines, never matched in the sweep. ``hermes update`` then did not pause it before the swap,
stamped it stale afterwards and stopped it with no successor. ``ps`` stays the rung for a host
without psutil.
"""

from __future__ import annotations

import os
import subprocess
from collections.abc import Iterator


def _gw():
    from hermes_cli import gateway  # late: the facade imports this module
    return gateway


def iter_psutil_cmdlines(exclude_pids: set[int]) -> Iterator[tuple[int, str]]:
    """``(pid, cmdline)`` for every process whose argv psutil reads. One it cannot read (another
    user's on macOS, a zombie) is skipped: the sweep's owner check rejects it anyway. Raises
    ``ImportError`` without psutil."""
    import psutil  # type: ignore
    my_pid = os.getpid()
    for proc in psutil.process_iter(["pid", "cmdline"]):
        pid, argv = proc.info["pid"], proc.info["cmdline"]
        if pid == my_pid or pid in exclude_pids or not argv:
            continue
        yield pid, " ".join(argv)


def iter_ps_cmdlines() -> Iterator[tuple[int, str]]:
    """``(pid, cmdline)`` from ``ps -Aww -o pid=,command=`` (``-Aww``, not ``-A eww``: BSD/macOS
    ps rejects ``e``; ``-ww`` is unlimited width); nothing when ps fails."""
    gw = _gw()
    result = subprocess.run(["ps", "-Aww", "-o", "pid=,command="], timeout=10, **gw._CAPTURE_TEXT, check=False)
    if result.returncode != 0:
        return
    for line in result.stdout.split("\n"):
        parsed = gw._parse_ps_line(line)
        if parsed is not None:
            yield parsed


def iter_posix_cmdlines(exclude_pids: set[int]) -> Iterator[tuple[int, str]]:
    """The rungs in order: one that cannot enumerate hands over to the next, ``ps`` is last. An
    ``OSError`` / ``TimeoutExpired`` from ``ps`` propagates (the facade answers an empty scan)."""
    rungs = [iter_psutil_cmdlines]
    if os.path.isdir("/proc"):
        rungs.insert(0, _gw()._iter_proc_cmdlines)
    for rung in rungs:
        try:
            yield from rung(exclude_pids)
            return
        except Exception:  # health: allow BLE001 -- an unusable /proc or a missing psutil: next rung
            continue
    yield from iter_ps_cmdlines()
