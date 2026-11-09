"""Run the desktop UI tests a merge step reaches, so Pi's repair pass sees their failures.

Pi resolves and localizes desktop code in the prepare job, and validate runs the whole UI suite
(``pnpm --dir apps/desktop run test:ui``, about half an hour on the runner) only after the run.
A failure there surfaced once every step was merged, and the next run merged the same commits
blind again: run 42496743929 lost a run to an i18n guard and two gateway-owner tests.

A step runs its own test files and every test file beside a desktop file it changed. Following
imports instead (``vitest related``) reaches nearly the whole suite from any locale catalog or
the SDK index; the tests next to a file are the ones written for it, including the i18n guards
beside the catalogs.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

SOURCE = "apps/desktop/src"
UI_TEST = re.compile(r"\.test\.tsx?$")  # the ui project's include: src/**/*.test.{ts,tsx}
COMMAND = ["pnpm", "--dir", "apps/desktop", "exec", "vitest", "run", "--project", "ui", "--passWithNoTests",
           "--reporter=json"]
# About 1.1 s per test file on the runner: 192 files took 208 s, and one step of run 42545414309
# reached 753 files and took 13.5 min. The whole UI suite (about 1,690 files) takes 18-33 min in
# validate, so a step that reaches most of it must not fail on the clock instead of on a test.
TIMEOUT = 2700
# Files whose change makes the installed node_modules stale.
DEPENDENCIES = ["pnpm-lock.yaml", "pnpm-workspace.yaml", ":(glob)**/package.json"]
SHOWN = 300  # characters of one failure kept for Pi
LISTED = 20  # failures handed to Pi; the rest are counted
COLOR = re.compile(r"\x1b\[[0-9;]*m")


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", *args], capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=300, check=True,
    ).stdout


def selected(before: str) -> list[str]:
    """The UI test files this step reaches: its own, and every one in a folder where it changed a file."""
    changed = set(_git("diff", "--name-only", "--no-renames", before, "--", SOURCE).splitlines())
    changed.update(_git("ls-files", "--others", "--exclude-standard", "--", SOURCE).splitlines())
    folders = {name.rpartition("/")[0] for name in changed}
    present = _git("ls-files", "--cached", "--others", "--exclude-standard", "--", SOURCE).splitlines()
    return sorted({name for name in present if UI_TEST.search(name) and Path(name).is_file()
                   and (name in changed or name.rpartition("/")[0] in folders)})


def problems(before: str) -> list[str]:
    """The failures of the UI tests this step reaches, as repair problems; none when it changed no desktop code."""
    files = selected(before)
    if not files:
        return []
    # Candidate code runs here: keep the AI key and the GitHub token out of it.
    env = {key: value for key, value in os.environ.items() if not key.startswith(("GH_", "SYNC_"))}
    with tempfile.TemporaryDirectory(prefix="fork-sync-ui-tests-") as folder:
        report = Path(folder) / "report.json"
        try:
            if _git("diff", "--name-only", before, "--", *DEPENDENCIES).strip():
                install = _run(["pnpm", "install", "--frozen-lockfile"], env)
                if install.returncode:
                    return [f"pnpm install --frozen-lockfile fails after this step's dependency changes: {_tail(install)}"]
            ran = _run([*COMMAND, f"--outputFile={report}", *(name.removeprefix("apps/desktop/") for name in files)], env)
        except subprocess.TimeoutExpired as expired:
            return [f"{' '.join(expired.cmd[:4])} did not finish within {TIMEOUT // 60} minutes"]
        if not report.is_file():
            return [f"the desktop UI tests could not run (exit {ran.returncode}): {_tail(ran)}"]
        results = json.loads(report.read_text(encoding="utf-8-sig"))
    found = failures(results)
    print(f"Desktop UI tests beside this step's changes: {len(files)} file(s), "
          f"{results.get('numFailedTests', 0)} of {results.get('numTotalTests', 0)} test(s) failed", flush=True)
    return found


def failures(results: dict) -> list[str]:
    """One problem per failed test, or per test file that failed to load, in a vitest JSON report."""
    found = []
    for suite in results.get("testResults", []):
        name = suite.get("name", "").rpartition("/apps/desktop/")[2]
        failed = [case for case in suite.get("assertionResults", []) if case.get("status") == "failed"]
        for case in failed:
            found.append(f"desktop UI test fails: {name} > {case.get('fullName')}: "
                         f"{_message(case.get('failureMessages') or [], name)}")
        if suite.get("status") == "failed" and not failed:
            found.append(f"desktop UI test file fails: {name}: {_message([suite.get('message') or ''], name)}")
    if len(found) > LISTED:
        found = [*found[:LISTED], f"and {len(found) - LISTED} more failing desktop UI tests"]
    return found


def _message(messages: list[str], name: str) -> str:
    """The error's first line and the line of the test file it failed at."""
    text = COLOR.sub("", "\n".join(messages))
    first = " ".join(text.strip().split("\n", 1)[0].split())[:SHOWN]
    line = re.search(re.escape(name) + r":(\d+)", text) if name else None
    return f"{first} (line {line.group(1)})" if line else first


def _run(argv: list[str], env: dict) -> subprocess.CompletedProcess:
    return subprocess.run(argv, capture_output=True, text=True, encoding="utf-8", errors="replace",
                          timeout=TIMEOUT, env=env, check=False)


def _tail(result: subprocess.CompletedProcess) -> str:
    lines = [line for line in COLOR.sub("", f"{result.stdout}\n{result.stderr}").splitlines() if line.strip()]
    return " | ".join(lines[-5:])[-SHOWN:]
