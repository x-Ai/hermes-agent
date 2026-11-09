"""A merge step runs the desktop UI tests beside what it changed, and Pi repairs their failures."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import time

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"
BOTS = "apps/desktop/src/plugins/bots"


@pytest.fixture
def controller(monkeypatch):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location("fork_sync_controller_desktop_test", CONTROLLER / "run.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


def git(root, *args):
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "-c", "user.name=Test",
         "-c", "user.email=test@example.com", *args], cwd=root,
        check=True, capture_output=True, text=True, encoding="utf-8",
    ).stdout.strip()


def write(root, files):
    for name, text in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")


@pytest.fixture
def desktop(tmp_path, monkeypatch):
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    # The controller's own git calls (merge, commit) carry no identity; a runner has none globally.
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    write(root, {
        f"{BOTS}/copy.ts": "export const label = 'Group chat'\n",
        f"{BOTS}/copy.test.ts": "test('label', () => {})\n",
        f"{BOTS}/view.test.tsx": "test('view', () => {})\n",
        f"{BOTS}/sub/deep.test.ts": "test('deep', () => {})\n",
        "apps/desktop/src/store/rooms.test.ts": "test('rooms', () => {})\n",
        "apps/desktop/src/i18n/zh.ts": "export const zh = {}\n",
        "apps/desktop/src/i18n/guard.test.ts": "test('guard', () => {})\n",
        "apps/desktop/src/old/gone.test.ts": "test('gone', () => {})\n",
        "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
    })
    git(root, "add", "--all")
    git(root, "commit", "-qm", "base")
    monkeypatch.chdir(root)
    return root, git(root, "rev-parse", "HEAD")


def test_a_step_runs_its_own_ui_tests_and_those_beside_what_it_changed(controller, desktop):
    root, base = desktop
    assert controller.desktop_tests.selected(base) == []
    write(root, {f"{BOTS}/copy.ts": "export const label = '群聊'\n", "apps/desktop/src/i18n/zh.ts": "export const zh = {a: 1}\n",
                 "apps/desktop/src/peers/peer.test.ts": "test('peer', () => {})\n"})
    (root / "apps/desktop/src/old/gone.test.ts").unlink()
    # Beside the changed copy and catalog, plus the step's new test file; not a subfolder, an
    # untouched folder, or a test file the step deleted.
    assert controller.desktop_tests.selected(base) == sorted([
        f"{BOTS}/copy.test.ts", f"{BOTS}/view.test.tsx", "apps/desktop/src/i18n/guard.test.ts",
        "apps/desktop/src/peers/peer.test.ts"])


def vitest_report(path, failing):
    """What `vitest run --reporter=json` writes for the one test file beside the changed copy."""
    case = {"fullName": "copy says group chat in Chinese", "status": "failed" if failing else "passed",
            "failureMessages": [
                "AssertionError: expected 'Group chats' to be '群聊'\n"
                "    at /runner/work/repo/apps/desktop/src/plugins/bots/copy.test.ts:7:21"] if failing else []}
    path.write_text(json.dumps({"numTotalTests": 1, "numFailedTests": int(failing), "testResults": [
        {"name": "/runner/work/repo/apps/desktop/src/plugins/bots/copy.test.ts", "message": "",
         "status": "failed" if failing else "passed", "assertionResults": [case]}]}), encoding="utf-8")


@pytest.mark.parametrize("fixed_by_repair", [True, False])
def test_failing_ui_tests_beside_a_step_go_back_to_pi_and_block_it_until_fixed(controller, desktop, monkeypatch,
                                                                              fixed_by_repair):
    root, base = desktop
    git(root, "switch", "-qc", "upstream")
    write(root, {f"{BOTS}/copy.ts": "export const label = 'Group chats'\n"})
    git(root, "commit", "-qam", "upstream copy")
    upstream = git(root, "rev-parse", "HEAD")
    git(root, "switch", "-q", "main")
    monkeypatch.setenv("SYNC_AI_API_KEY", "test-secret")
    monkeypatch.setenv("GH_TOKEN", "test-token")
    real = subprocess.run
    runs = []

    def run(argv, **kwargs):
        if argv[0] != "pnpm":
            return real(argv, **kwargs)
        runs.append((argv, kwargs["env"]))
        failing = len(runs) == 1 or not fixed_by_repair
        vitest_report(Path(next(arg for arg in argv if arg.startswith("--outputFile=")).partition("=")[2]), failing)
        return subprocess.CompletedProcess(argv, int(failing), "", "")

    monkeypatch.setattr(controller.desktop_tests.subprocess, "run", run)
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", lambda context, *args: calls.append(context))
    def merge():
        step = dict(commit=upstream, reason="upstream main", commits=1, conflicts=0, files=1,
                    summary="1 upstream commit(s)")
        controller.merge_one(step, {"agent": {}}, "rules", time.monotonic() + 3600)

    failure = ("desktop UI test fails: src/plugins/bots/copy.test.ts > copy says group chat in Chinese: "
               "AssertionError: expected 'Group chats' to be '群聊' (line 7)")
    if fixed_by_repair:
        merge()
        assert git(root, "rev-parse", "HEAD^2") == upstream
    else:
        with pytest.raises(RuntimeError, match="desktop UI test fails: src/plugins/bots/copy.test.ts"):
            merge()
        assert git(root, "rev-parse", "HEAD") == base
    assert "repair" not in calls[0] and calls[1]["repair"] == [failure]
    argv, env = runs[0]
    assert argv[:9] == ["pnpm", "--dir", "apps/desktop", "exec", "vitest", "run", "--project", "ui", "--passWithNoTests"]
    assert argv[-3].startswith("--outputFile=")
    assert argv[-2:] == ["src/plugins/bots/copy.test.ts", "src/plugins/bots/view.test.tsx"]
    # Candidate code runs the tests: the AI key and the GitHub token stay out of their environment.
    assert "SYNC_AI_API_KEY" not in env and "GH_TOKEN" not in env


def test_a_step_that_changes_dependencies_installs_them_before_testing(controller, desktop, monkeypatch):
    root, base = desktop
    write(root, {f"{BOTS}/copy.ts": "export const label = 'Group chats'\n", "pnpm-lock.yaml": "lockfileVersion: '9.1'\n"})
    real = subprocess.run
    runs = []

    def run(argv, **kwargs):
        if argv[0] != "pnpm":
            return real(argv, **kwargs)
        runs.append(argv[:3])
        return subprocess.CompletedProcess(argv, 1, "", "ERR_PNPM_OUTDATED_LOCKFILE Cannot install with frozen-lockfile")

    monkeypatch.setattr(controller.desktop_tests.subprocess, "run", run)
    # Stale node_modules would fail tests for reasons Pi cannot see; a lockfile that does not
    # install is the step's own problem to repair.
    assert controller.desktop_tests.problems(base) == [
        "pnpm install --frozen-lockfile fails after this step's dependency changes: "
        "ERR_PNPM_OUTDATED_LOCKFILE Cannot install with frozen-lockfile"]
    assert runs == [["pnpm", "install", "--frozen-lockfile"]]
