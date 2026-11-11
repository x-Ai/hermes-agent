"""A merge step runs scripts/check on the merged tree, and Pi repairs what it finds."""
from __future__ import annotations

import importlib.util
from pathlib import Path
import subprocess
import sys
import time

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"
# What scripts/check printed in run 42905269398's validate lane.
HEALTH = """
=== health (failed) ===
hermes_cli/model_switch.py:1  FILE_LINES  <module>
    lines 2001 > target 2000 (was 1994)
    fix: offset the growth in the same PR: move an existing function or class into a topical sibling `<stem>_<topic>.py`

code health: 56 files vs 561596e7ed40: 1 blocking, 0 advisory (41.1s)

scripts/check: 16 checks, FAILED: health
"""


@pytest.fixture
def controller(monkeypatch):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location("fork_sync_controller_repo_checks_test", CONTROLLER / "run.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


def git(root, *args):
    return subprocess.run(["git", "-c", "core.hooksPath=/dev/null", *args], cwd=root, check=True,
                          capture_output=True, text=True, encoding="utf-8").stdout.strip()


def test_findings_name_each_failed_check_with_its_lines(controller):
    no_tmp = ("=== no-tmp (failed) ===\nplugin-catalog/no-cap.yaml:49: with /bin/sh in a throwaway HERMES_HOME under /tmp\n\n"
              "1 literal /tmp path(s) flagged.\n\n=== health (ok) ===\ncode health: 154 files: 0 blocking\n")
    assert controller.repo_checks.findings(HEALTH + no_tmp) == [
        "scripts/check health fails: hermes_cli/model_switch.py:1 FILE_LINES <module> | lines 2001 > target 2000 (was 1994)"
        " | fix: offset the growth in the same PR: move an existing function or class into a topical sibling"
        " `<stem>_<topic>.py` | code health: 56 files vs 561596e7ed40: 1 blocking, 0 advisory (41.1s)",
        "scripts/check no-tmp fails: plugin-catalog/no-cap.yaml:49: with /bin/sh in a throwaway HERMES_HOME under /tmp"
        " | 1 literal /tmp path(s) flagged.",
    ]
    assert controller.repo_checks.findings("Traceback (most recent call last):\nboom") == [
        "scripts/check fails: Traceback (most recent call last): | boom"]


@pytest.mark.parametrize("fixed_by_repair", [True, False])
def test_scripts_check_findings_go_back_to_pi_and_block_the_step_until_fixed(
        controller, tmp_path, monkeypatch, fixed_by_repair):
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    (root / "switch.py").write_text("A = 1\n", encoding="utf-8")
    (root / "scripts").mkdir()
    (root / "scripts" / "check").write_text("# the repository's check runner\n", encoding="utf-8")
    git(root, "add", "--all")
    git(root, "commit", "-qm", "base")
    base = git(root, "rev-parse", "HEAD")
    git(root, "switch", "-qc", "upstream")
    (root / "switch.py").write_text("A = 1\nB = 2\n", encoding="utf-8")
    git(root, "commit", "-qam", "upstream grows the file")
    upstream = git(root, "rev-parse", "HEAD")
    git(root, "switch", "-q", "main")
    monkeypatch.chdir(root)
    monkeypatch.setenv("SYNC_AI_API_KEY", "test-secret")
    monkeypatch.setenv("GH_TOKEN", "test-token")
    real = subprocess.run
    checked = []

    def run(argv, **kwargs):
        if argv[:2] != ["python", "scripts/check"]:
            return real(argv, **kwargs)
        env = kwargs["env"]
        # The private index holds the merged tree; the merge's own index is left alone.
        staged = real(["git", "ls-files", "--stage", "switch.py"], env=env, capture_output=True, text=True).stdout
        checked.append((argv, env, staged))
        failing = len(checked) == 1 or not fixed_by_repair
        return subprocess.CompletedProcess(argv, int(failing), HEALTH if failing else "scripts/check: 16 checks, ok", "")

    monkeypatch.setattr(controller.repo_checks.subprocess, "run", run)
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", lambda context, *args: calls.append(context))

    def merge():
        step = dict(commit=upstream, reason="upstream main", commits=1, conflicts=0, files=1, summary="1 upstream commit(s)")
        controller.merge_one(step, {"agent": {}}, "rules", time.monotonic() + 3600)

    if fixed_by_repair:
        merge()
        assert git(root, "rev-parse", "HEAD^2") == upstream
    else:
        with pytest.raises(RuntimeError, match="scripts/check health fails: hermes_cli/model_switch.py:1 FILE_LINES"):
            merge()
        assert git(root, "rev-parse", "HEAD") == base
    assert "repair" not in calls[0] and calls[1]["repair"][0].startswith("scripts/check health fails: hermes_cli/model_switch")
    argv, env, staged = checked[0]
    assert argv == ["python", "scripts/check", "--staged", "--base", base]
    assert "SYNC_AI_API_KEY" not in env and "GH_TOKEN" not in env
    assert staged.split()[1] == git(root, "hash-object", "switch.py")
