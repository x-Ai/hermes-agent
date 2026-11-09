"""Land a validated candidate on a fork main that moved while the sync tested it.

A sync run takes about two hours, and the fork's own sessions push to main meanwhile. Publish
used to refuse every candidate whose base was no longer main: on 2026-11-09 three desktop copy
fixes voided run 42545414309's 514 upstream commits, and two more pushes overtook the next
run's base within the hour. Upstream lands with a push and validates on main afterwards. This
fork keeps "nothing lands untested" and re-checks only what the newer main commits change on
top of the validated candidate:

* git must merge main and the candidate without conflicts;
* the repository checks of config.json run on the merge, scripts/check against the newer
  main, and the tree-scoped ones (``pnpm --dir <tree>``) for the trees those commits touch;
* the desktop UI tests beside every desktop file they changed (desktop_tests.selected);
* the Python tests they reach (select_tests.plan from the candidate to the merge), one test
  shard at most. A broader reach (a dependency lock, a conftest) leaves the merge to the next
  run, which starts from the newer main as it always did.

The checks run in a job without the write token. Publish then pushes the merge only after it
proves the merge is exactly the clean merge of the current main and the validated candidate.
"""
from __future__ import annotations

import os
from pathlib import Path
import subprocess

import desktop_tests
import select_tests

STATE = "reconcile.json"
BUNDLE = "reconciled.bundle"
REF = "refs/heads/fork-sync-reconciled"
IDENTITY = {"GIT_AUTHOR_NAME": "hermes-upstream-sync[bot]",
            "GIT_AUTHOR_EMAIL": "hermes-upstream-sync[bot]@users.noreply.github.com"}
# Workspace files every JS tree depends on: a change here re-runs every tree-scoped check.
SHARED_JS = ("package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "apps/shared/")
REFUSED = "Fork main changed during validation; retry from the new main"


def _git(*args: str, check: bool = True, env: dict | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", *args], capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=300, check=check, env=env,
    )


def _out(*args: str) -> str:
    return _git(*args).stdout.strip()


def _contains(older: str, newer: str) -> bool:
    result = _git("merge-base", "--is-ancestor", older, newer, check=False)
    if result.returncode not in (0, 1):
        raise RuntimeError("Git could not establish ancestry")
    return result.returncode == 0


def clean_merge_tree(main: str, candidate: str) -> str | None:
    """The tree git writes for merging ``candidate`` into ``main``; None when they conflict."""
    result = _git("merge-tree", "--write-tree", "--no-messages", main, candidate, check=False)
    if result.returncode not in (0, 1):
        raise RuntimeError("git merge-tree could not merge the moved main")
    return result.stdout.split("\n", 1)[0].strip() if result.returncode == 0 else None


def plan(base: str, candidate: str, main: str, settings: dict) -> dict:
    """Decide what publish needs for ``main``; when it moved, build the merge, check it out and list its checks.

    ``status`` is ``unchanged`` (main is the base, or already has the candidate), ``merged``,
    or why the merge is left to the next run: ``diverged``, ``conflict`` or ``too-broad``.
    """
    if main == base or _contains(candidate, main):
        return {"main": main, "status": "unchanged"}
    if not _contains(base, main):
        return {"main": main, "status": "diverged"}
    tree = clean_merge_tree(main, candidate)
    if tree is None:
        return {"main": main, "status": "conflict"}
    env = {**os.environ, **IDENTITY, "GIT_COMMITTER_NAME": IDENTITY["GIT_AUTHOR_NAME"],
           "GIT_COMMITTER_EMAIL": IDENTITY["GIT_AUTHOR_EMAIL"]}
    message = (f"chore(sync): land the validated candidate {candidate[:12]} on main {main[:12]}\n\n"
               f"Main moved past the run's base {base[:12]} while the candidate was validated; this merge"
               " carries the newer main commits, re-checked on top of the candidate.")
    merged = _git("commit-tree", tree, "-p", main, "-p", candidate, "-m", message, env=env).stdout.strip()
    _git("switch", "--detach", merged)
    python = select_tests.plan(Path.cwd(), candidate, merged, candidate, settings["tests"])
    if python["mode"] == "full" or python["weight"] > settings["tests"]["tests_per_shard"]:
        _git("switch", "--detach", candidate)
        return {"main": main, "status": "too-broad", "python": f"{python['mode']}, {len(python['files'])} files"}
    changed = _out("diff", "--name-only", "--no-renames", candidate, merged).splitlines()
    return {"main": main, "status": "merged", "merged": merged, "commands": checks(settings["checks"], changed, main, merged),
            "desktop": desktop_tests.selected(candidate), "python": python["files"]}


def checks(commands: list[list[str]], changed: list[str], main: str, merged: str) -> list[list[str]]:
    """The repository checks to rerun: every one without ``--dir``, and those whose tree changed."""
    shared = any(path.startswith(SHARED_JS) for path in changed)
    chosen = []
    for command in commands:
        tree = command[command.index("--dir") + 1] if "--dir" in command else None
        if tree is None or shared or any(path.startswith(f"{tree}/") for path in changed):
            chosen.append([part.replace("{base}", main).replace("{candidate}", merged) for part in command])
    return chosen


def write_bundle(directory: Path, state: dict, candidate: str) -> None:
    """Hand publish exactly the merge commit: it has the candidate and main already."""
    _git("update-ref", REF, state["merged"])
    _git("bundle", "create", str(directory / BUNDLE), REF, f"^{candidate}", f"^{state['main']}")


def verified(state: dict | None, directory: Path | None, candidate: str, main: str) -> str:
    """The reconciled merge to push onto ``main``; raise unless it is the clean merge of main and the candidate."""
    if not state or state.get("status") != "merged":
        raise RuntimeError(REFUSED)
    if state["main"] != main:
        raise RuntimeError("Fork main changed again while the merge was re-checked; retry from the new main")
    _git("bundle", "verify", str(directory / BUNDLE))
    _git("fetch", "--no-tags", str(directory / BUNDLE), f"{REF}:refs/remotes/fork-sync/reconciled")
    merged = _out("rev-parse", "refs/remotes/fork-sync/reconciled")
    if merged != state["merged"]:
        raise RuntimeError("The reconciled bundle does not hold the re-checked merge")
    if _out("rev-list", "--parents", "-n", "1", merged).split()[1:] != [main, candidate]:
        raise RuntimeError("The reconciled merge does not join main and the validated candidate")
    if clean_merge_tree(main, candidate) != _out("rev-parse", f"{merged}^{{tree}}"):
        raise RuntimeError("The reconciled merge is not the clean merge of main and the validated candidate")
    return merged
