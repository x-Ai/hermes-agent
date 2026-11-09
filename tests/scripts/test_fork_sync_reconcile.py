"""A validated candidate lands on a fork main that moved during the run, through a re-checked merge."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"


@pytest.fixture
def controller(monkeypatch):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location("fork_sync_controller_reconcile_test", CONTROLLER / "run.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


def git(root, *args):
    return subprocess.run(["git", "-c", "core.hooksPath=/dev/null", *args], cwd=root, check=True,
                          capture_output=True, text=True, encoding="utf-8").stdout.strip()


def write(root, files):
    for name, text in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")


def commit(root, files, message):
    write(root, files)
    git(root, "add", "--all")
    git(root, "commit", "-qm", message)
    return git(root, "rev-parse", "HEAD")


class Fork:
    """A fork whose run merged upstream into ``base`` as ``candidate``; origin's main is still ``base``."""

    def __init__(self, tmp_path, monkeypatch, changed=True):
        self.root, self.origin, self.artifacts = tmp_path / "repo", tmp_path / "origin.git", tmp_path / "artifacts"
        self.reconciled = tmp_path / "reconciled"
        git(tmp_path, "init", "-q", "--bare", str(self.origin))
        self.root.mkdir()
        self.artifacts.mkdir()
        git(self.root, "init", "-q", "-b", "main")
        git(self.root, "config", "user.name", "Test")
        git(self.root, "config", "user.email", "test@example.com")
        git(self.root, "remote", "add", "origin", str(self.origin))
        self.base = commit(self.root, {"app/core.py": "VALUE = 1\n", "web/page.ts": "export const a = 1\n",
                                       "ui-tui/view.ts": "export const v = 1\n"}, "fork base")
        git(self.root, "push", "-q", "origin", "main")
        self.candidate = self.base
        if changed:
            git(self.root, "switch", "-q", "-c", "upstream")
            upstream = commit(self.root, {"app/upstream.py": "NEW = 2\n"}, "upstream change")
            git(self.root, "switch", "-q", "main")
            git(self.root, "merge", "-q", "--no-ff", "-m", "sync upstream", upstream)
            self.candidate = git(self.root, "rev-parse", "HEAD")
        git(self.root, "switch", "-q", "--detach", self.candidate)
        git(self.root, "update-ref", "refs/heads/fork-sync-candidate", self.candidate)
        if changed:
            git(self.root, "bundle", "create", str(self.artifacts / "candidate.bundle"),
                "refs/heads/fork-sync-candidate", f"^{self.base}")
        manifest = dict(repository="owner/repo", base=self.base, candidate=self.candidate, upstream=self.base,
                        changed=changed, releases=[])
        (self.artifacts / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        monkeypatch.chdir(self.root)

    def peer_push(self, files, message="a fork session's fix"):
        """Another session pushes to origin's main while the run tests the candidate."""
        here = git(self.root, "rev-parse", "HEAD")
        git(self.root, "fetch", "-q", "origin", "main")
        git(self.root, "switch", "-q", "--detach", "FETCH_HEAD")
        pushed = commit(self.root, files, message)
        git(self.root, "push", "-q", "origin", "HEAD:refs/heads/main")
        git(self.root, "switch", "-q", "--detach", here)
        return pushed

    def origin_main(self):
        return git(self.root, "ls-remote", str(self.origin), "refs/heads/main").split()[0]


@pytest.fixture
def checks(controller, monkeypatch):
    """Record the check commands instead of running them; git still runs."""
    real = subprocess.run
    ran = []

    def run(argv, **kwargs):
        if argv[0] == "git":
            return real(argv, **kwargs)
        ran.append(list(argv))
        return subprocess.CompletedProcess(argv, 0, "", "")

    monkeypatch.setattr(controller.subprocess, "run", run)
    return ran


@pytest.fixture
def released(controller, monkeypatch):
    calls = []
    monkeypatch.setattr(controller.releases, "publish", lambda *args: calls.append(args))
    return calls


def reconcile(controller, fork, tmp_path, monkeypatch):
    out = tmp_path / "github-output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    controller.reconcile_main(fork.artifacts, "owner/repo", fork.reconciled)
    state = json.loads((fork.reconciled / "reconcile.json").read_text(encoding="utf-8"))
    return state, out.read_text(encoding="utf-8").strip()


def test_publish_lands_the_candidate_on_a_main_that_moved_through_a_rechecked_merge(
        controller, tmp_path, monkeypatch, checks, released):
    fork = Fork(tmp_path, monkeypatch)
    peer = fork.peer_push({"web/page.ts": "export const a = 2\n"})
    state, output = reconcile(controller, fork, tmp_path, monkeypatch)
    assert output == "merged=true" and state["status"] == "merged" and state["main"] == peer
    merged = state["merged"]
    assert git(fork.root, "rev-parse", "HEAD") == merged
    assert git(fork.root, "rev-list", "--parents", "-n", "1", merged).split()[1:] == [peer, fork.candidate]
    controller.recheck(fork.artifacts, "owner/repo", fork.reconciled)
    # Every check without a tree, and the web check for the tree the newer commit touched; not ui-tui
    # or the desktop typecheck and lint, whose trees it left alone.
    assert checks == [
        ["python", "scripts/check", "--base", peer, "--commit", merged],
        ["pnpm", "--dir", "web", "run", "check"],
        ["node", "apps/desktop/scripts/i18n-keys.mjs", "--check"],
    ]
    controller.publish(fork.artifacts, "owner/repo", fork.reconciled)
    assert fork.origin_main() == merged
    assert released == [("owner/repo", [], fork.candidate)]


def test_a_reconciled_merge_is_refused_once_main_moves_again(controller, tmp_path, monkeypatch, checks, released):
    fork = Fork(tmp_path, monkeypatch)
    fork.peer_push({"web/page.ts": "export const a = 2\n"})
    reconcile(controller, fork, tmp_path, monkeypatch)
    controller.recheck(fork.artifacts, "owner/repo", fork.reconciled)
    later = fork.peer_push({"ui-tui/view.ts": "export const v = 2\n"}, "another session's fix")
    with pytest.raises(RuntimeError, match="changed again"):
        controller.publish(fork.artifacts, "owner/repo", fork.reconciled)
    assert fork.origin_main() == later and not released


def test_publish_refuses_a_reconciled_merge_that_is_not_the_clean_merge(
        controller, tmp_path, monkeypatch, checks, released):
    fork = Fork(tmp_path, monkeypatch)
    peer = fork.peer_push({"web/page.ts": "export const a = 2\n"})
    state, _ = reconcile(controller, fork, tmp_path, monkeypatch)
    controller.recheck(fork.artifacts, "owner/repo", fork.reconciled)
    # Same parents, one extra file: what a tampered re-check job could hand over.
    write(fork.root, {"app/extra.py": "SNEAKED = True\n"})
    git(fork.root, "add", "--all")
    git(fork.root, "commit", "-q", "--amend", "--no-edit")
    forged = git(fork.root, "rev-parse", "HEAD")
    git(fork.root, "update-ref", "refs/heads/fork-sync-reconciled", forged)
    git(fork.root, "bundle", "create", str(fork.reconciled / "reconciled.bundle"),
        "refs/heads/fork-sync-reconciled", f"^{fork.candidate}", f"^{peer}")
    (fork.reconciled / "reconcile.json").write_text(json.dumps(dict(state, merged=forged)), encoding="utf-8")
    with pytest.raises(RuntimeError, match="not the clean merge"):
        controller.publish(fork.artifacts, "owner/repo", fork.reconciled)
    assert fork.origin_main() == peer and not released


def test_a_main_that_conflicts_with_the_candidate_is_left_to_the_next_run(
        controller, tmp_path, monkeypatch, checks, released, capsys):
    fork = Fork(tmp_path, monkeypatch)
    peer = fork.peer_push({"app/upstream.py": "NEW = 'the fork wrote this file too'\n"})
    state, output = reconcile(controller, fork, tmp_path, monkeypatch)
    assert output == "merged=false" and state == {"main": peer, "status": "conflict"}
    assert "conflicts with the candidate" in capsys.readouterr().out
    controller.recheck(fork.artifacts, "owner/repo", fork.reconciled)
    assert checks == []
    with pytest.raises(RuntimeError, match="changed during validation"):
        controller.publish(fork.artifacts, "owner/repo", fork.reconciled)
    assert fork.origin_main() == peer and not released


def test_a_main_that_changes_a_dependency_lock_is_left_to_the_next_run(controller, tmp_path, monkeypatch, checks):
    fork = Fork(tmp_path, monkeypatch)
    peer = fork.peer_push({"uv.lock": "version = 1\n"})
    state, output = reconcile(controller, fork, tmp_path, monkeypatch)
    # A lock change reaches the whole Python suite, far more than one shard.
    assert output == "merged=false" and state["status"] == "too-broad" and state["main"] == peer
    assert git(fork.root, "rev-parse", "HEAD") == fork.candidate


def test_a_shared_js_manifest_change_reruns_every_tree_check(controller, tmp_path, monkeypatch, checks):
    fork = Fork(tmp_path, monkeypatch)
    fork.peer_push({"package.json": "{\"private\": true}\n"})
    state, _ = reconcile(controller, fork, tmp_path, monkeypatch)
    trees = [command[2] for command in state["commands"] if "--dir" in command]
    assert trees == ["ui-tui", "apps/desktop", "web"]


def test_a_run_without_changes_publishes_its_releases_on_a_main_that_moved(
        controller, tmp_path, monkeypatch, released):
    fork = Fork(tmp_path, monkeypatch, changed=False)
    peer = fork.peer_push({"web/page.ts": "export const a = 2\n"})
    state, output = reconcile(controller, fork, tmp_path, monkeypatch)
    assert output == "merged=false" and state["status"] == "unchanged"
    controller.publish(fork.artifacts, "owner/repo", fork.reconciled)
    assert fork.origin_main() == peer
    assert released == [("owner/repo", [], fork.base)]
