"""The sync keeps running on its own: it chains while upstream moves and backs off after failures."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"
NOW = datetime(2026, 11, 9, 10, 0, tzinfo=UTC)


@pytest.fixture
def controller(monkeypatch):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location("fork_sync_controller_continuity_test", CONTROLLER / "run.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


def git(root, *args, env=None):
    return subprocess.run(["git", "-c", "core.hooksPath=/dev/null", *args], cwd=root, check=True, env=env,
                          capture_output=True, text=True, encoding="utf-8").stdout.strip()


def commit(root, name, text, message):
    (root / name).write_text(text, encoding="utf-8")
    git(root, "add", "--all")
    git(root, "commit", "-qm", message)
    return git(root, "rev-parse", "HEAD")


def run(run_id, conclusion, minutes_before_now, status="completed"):
    ended = NOW - timedelta(minutes=minutes_before_now)
    return {"id": run_id, "status": status, "conclusion": conclusion, "updated_at": ended.isoformat().replace("+00:00", "Z")}


def test_backoff_doubles_with_each_failed_run_since_the_last_publish_up_to_four_hours(controller):
    last_publish = NOW - timedelta(hours=12)
    assert controller.backoff_until([run(9, "success", 5)], last_publish, current=10) is None
    one = [run(9, "failure", 10)]
    assert controller.backoff_until(one, last_publish, current=10) == NOW - timedelta(minutes=10) + timedelta(minutes=30)
    # Cancelled runs, runs still going and this run itself do not count; the wait runs from the newest failure.
    three = [run(10, "failure", 0), run(9, "cancelled", 1), run(8, "failure", 20), run(7, None, 0, "in_progress"),
             run(6, "timed_out", 200), run(5, "failure", 400)]
    assert controller.backoff_until(three, last_publish, current=10) == NOW - timedelta(minutes=20) + timedelta(hours=2)
    many = [run(n, "failure", n) for n in range(1, 12)]
    assert controller.backoff_until(many, last_publish, current=99) == NOW - timedelta(minutes=1) + timedelta(hours=4)
    # Failures before the last publish are history: that publish ended their streak.
    assert controller.backoff_until(one, NOW - timedelta(minutes=5), current=10) is None


@pytest.fixture
def repo(tmp_path, monkeypatch):
    """A fork checkout whose origin's main is where it stands."""
    root = tmp_path / "repo"
    root.mkdir()
    git(tmp_path, "init", "-q", "--bare", str(tmp_path / "origin.git"))
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    git(root, "remote", "add", "origin", str(tmp_path / "origin.git"))
    commit(root, "file.txt", "base\n", "base")
    git(root, "push", "-q", "origin", "main")
    monkeypatch.chdir(root)
    return root


def test_a_scheduled_run_after_failures_stops_before_merging_and_a_manual_run_never_waits(
        controller, repo, tmp_path, monkeypatch):
    runs = {"workflow_runs": [run(41, "failure", 5), run(40, "failure", 70)]}
    asked = []
    monkeypatch.setattr(controller.releases, "gh_json", lambda path, missing_ok=False: asked.append(path) or runs)
    monkeypatch.setattr(controller, "datetime", type("Clock", (datetime,), {"now": staticmethod(lambda tz=None: NOW)}))
    # Merging would fetch upstream first; nothing may reach it while the run backs off.
    monkeypatch.setattr(controller, "UPSTREAM", str(tmp_path / "missing-upstream.git"))
    out = tmp_path / "github-output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    monkeypatch.setenv("GITHUB_RUN_ID", "42")
    monkeypatch.setenv("GITHUB_EVENT_NAME", "schedule")
    artifacts = tmp_path / "artifacts"
    controller.prepare("owner/repo", artifacts)
    outputs = dict(line.split("=", 1) for line in out.read_text(encoding="utf-8").splitlines())
    assert outputs["needed"] == "false" and outputs["changed"] == "false" and outputs["remaining"] == "false"
    assert asked == ["repos/owner/repo/actions/workflows/fork-upstream-sync.yml/runs?per_page=30"]
    assert not json.loads((artifacts / "manifest.json").read_text(encoding="utf-8"))["needed"]
    monkeypatch.setenv("GITHUB_EVENT_NAME", "workflow_dispatch")
    assert controller.backing_off("owner/repo") is None and len(asked) == 1


def test_a_queued_run_merges_onto_fork_main_as_it_is_now(controller, repo, tmp_path, monkeypatch):
    # Triggered at `triggered`; by the time it starts, the run ahead of it has landed `landed`.
    triggered = git(repo, "rev-parse", "HEAD")
    landed = commit(repo, "file.txt", "the run ahead landed this\n", "chore(sync): merge upstream")
    git(repo, "push", "-q", "origin", "main")
    git(repo, "switch", "-q", "--detach", triggered)
    assert controller.start_from_latest_main() == landed
    assert git(repo, "rev-parse", "HEAD") == landed
    # prepare records it as the base that validation and publish judge the candidate against.
    git(repo, "switch", "-q", "--detach", triggered)
    monkeypatch.setattr(controller, "backing_off", lambda repository: NOW)
    controller.prepare("owner/repo", tmp_path / "artifacts")
    assert json.loads((tmp_path / "artifacts" / "manifest.json").read_text(encoding="utf-8"))["base"] == landed


def test_the_last_publish_is_the_newest_sync_bot_commit_on_main(controller, repo, tmp_path, monkeypatch):
    # Two failures 20 and 50 minutes ago hold scheduled runs back for an hour from the newer one, until a
    # sync-bot commit that landed after them shows a publish ended the streak.
    runs = {"workflow_runs": [run(41, "failure", 20), run(40, "failure", 50)]}
    monkeypatch.setattr(controller.releases, "gh_json", lambda path, missing_ok=False: runs)
    monkeypatch.setattr(controller, "datetime", type("Clock", (datetime,), {"now": staticmethod(lambda tz=None: NOW)}))
    monkeypatch.setenv("GITHUB_EVENT_NAME", "schedule")
    assert controller.backing_off("owner/repo") is not None
    stamp = (NOW - timedelta(minutes=10)).isoformat()
    env = {"GIT_AUTHOR_NAME": "hermes-upstream-sync[bot]", "GIT_AUTHOR_EMAIL": "bot@example.com",
           "GIT_COMMITTER_NAME": "hermes-upstream-sync[bot]", "GIT_COMMITTER_EMAIL": "bot@example.com",
           "GIT_AUTHOR_DATE": stamp, "GIT_COMMITTER_DATE": stamp, "PATH": __import__("os").environ["PATH"]}
    (repo / "file.txt").write_text("synced\n", encoding="utf-8")
    git(repo, "commit", "-qam", "chore(sync): merge upstream", env=env)
    git(repo, "push", "-q", "origin", "main")
    assert controller.backing_off("owner/repo") is None


@pytest.mark.parametrize("upstream_moved", [False, True])
def test_publish_starts_the_next_run_when_upstream_moved_past_what_landed(
        controller, repo, tmp_path, monkeypatch, upstream_moved):
    origin, upstream_repo = tmp_path / "origin.git", tmp_path / "upstream.git"
    git(tmp_path, "init", "-q", "--bare", str(upstream_repo))
    base = git(repo, "rev-parse", "HEAD")
    git(repo, "switch", "-q", "-c", "upstream")
    merged_upstream = commit(repo, "upstream.txt", "one\n", "upstream one")
    if upstream_moved:
        commit(repo, "upstream.txt", "two\n", "upstream two, landed while the run tested")
    git(repo, "push", "-q", str(upstream_repo), "HEAD:refs/heads/main")
    git(repo, "switch", "-q", "main")
    git(repo, "merge", "-q", "--no-ff", "-m", "sync", merged_upstream)
    candidate = git(repo, "rev-parse", "HEAD")
    monkeypatch.setattr(controller, "UPSTREAM", str(upstream_repo))
    data = dict(base=base, candidate=candidate, changed=True, releases=[], remaining=False)
    monkeypatch.setattr(controller, "import_candidate", lambda *args: data)
    monkeypatch.setattr(controller.releases, "publish", lambda *args: None)
    out = tmp_path / "github-output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    controller.publish(tmp_path, "owner/repo")
    assert git(repo, "ls-remote", str(origin), "refs/heads/main").split()[0] == candidate
    assert out.read_text(encoding="utf-8").strip() == f"continue={str(upstream_moved).lower()}"


def test_publish_keeps_only_this_workflow_enabled_on_the_fork(controller, monkeypatch):
    # Upstream's workflows, including one a merge just brought in, start out enabled on the fork.
    listing = "\n".join([
        "11\t.github/workflows/docker.yml\tactive",
        "12\t.github/workflows/fork-upstream-sync.yml\tactive",
        "13\t.github/workflows/ci.yaml\tdisabled_manually",
        "14\t.github/workflows/brand-new-upstream.yml\tactive",
    ]) + "\n"
    calls = []

    def fake(argv, **kwargs):
        calls.append(argv)
        return subprocess.CompletedProcess(argv, 0, listing if "--paginate" in argv else "", "")

    monkeypatch.setattr(controller.subprocess, "run", fake)
    controller.quiet_others("owner/repo", Path("unused"))
    assert [argv for argv in calls if "-X" in argv] == [
        ["gh", "api", "-X", "PUT", "repos/owner/repo/actions/workflows/11/disable"],
        ["gh", "api", "-X", "PUT", "repos/owner/repo/actions/workflows/14/disable"],
    ]
