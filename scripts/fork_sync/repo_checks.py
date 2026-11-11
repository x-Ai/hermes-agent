"""Run scripts/check on a merge step, so Pi's repair pass sees its findings.

Validate runs scripts/check on the whole candidate after the run, and two runs on 2026-11-10/11
failed there after a full merge:
- run 42905269398's merge left hermes_cli/model_switch.py at 2,001 lines, one over the cap, from
  the fork's own lines plus upstream's;
- run 42935109164 stopped at an upstream commit whose catalog text spelled out the system temp
  directory's path, which upstream reworded nine minutes after the run fetched it.
Each threw away the whole merge, and the next run could hit the same thing again. Pi can fix
both inside the step: move fork code into a topical sibling, or word the line the way the
check asks.

The check judges the merged working tree through a private index, so the merge's own index
(its unmerged entries and MERGE_HEAD) is untouched until the controller commits the step.
"""
from __future__ import annotations

import os
from pathlib import Path
import re
import subprocess
import tempfile

COMMAND = ["python", "scripts/check", "--staged"]
# scripts/check took up to 3.4 minutes in validate (the code-health ratchet over 154 files).
TIMEOUT = 900
SHOWN = 700  # characters of one check's findings kept for Pi
FAILED = re.compile(r"^=== (\S+) \(failed\) ===$")


def problems(before: str) -> list[str]:
    """scripts/check's failing checks on the merged working tree, judged against ``before``.

    A tree without scripts/check (the controller's own test repositories) has nothing to run.
    """
    if not Path(COMMAND[1]).is_file():
        return []
    # Candidate code runs here: keep the AI key and the GitHub token out of it.
    env = {key: value for key, value in os.environ.items() if not key.startswith(("GH_", "SYNC_"))}
    with tempfile.TemporaryDirectory(prefix="fork-sync-check-") as folder:
        env["GIT_INDEX_FILE"] = str(Path(folder) / "index")
        for args in (["read-tree", "HEAD"], ["add", "--all"]):
            subprocess.run(["git", "-c", "core.hooksPath=/dev/null", *args], env=env, capture_output=True,
                           text=True, encoding="utf-8", errors="replace", timeout=300, check=True)
        try:
            ran = subprocess.run([*COMMAND, "--base", before], env=env, capture_output=True,
                                 text=True, encoding="utf-8", errors="replace", timeout=TIMEOUT, check=False)
        except subprocess.TimeoutExpired:
            return [f"scripts/check did not finish within {TIMEOUT // 60} minutes"]
    print(f"scripts/check on this step: {'ok' if ran.returncode == 0 else 'failed'}", flush=True)
    return [] if ran.returncode == 0 else findings(f"{ran.stdout}\n{ran.stderr}")


def findings(text: str) -> list[str]:
    """One problem per failed check, with the lines it printed (they carry its own ``fix:`` hint)."""
    found, name, lines = [], None, []
    for line in [*text.splitlines(), "=== end ==="]:
        if line.startswith("=== "):
            if name:
                found.append(f"scripts/check {name} fails: " + " | ".join(lines)[:SHOWN])
            match = FAILED.match(line.strip())
            name, lines = (match.group(1), []) if match else (None, [])
        elif name and line.strip() and not line.startswith("scripts/check:"):
            lines.append(" ".join(line.split()))
    if not found:
        tail = " | ".join(" ".join(line.split()) for line in text.splitlines() if line.strip())[-SHOWN:]
        found.append(f"scripts/check fails: {tail}")
    return found
