"""A fork sync merges a large upstream backlog in bounded steps and never loses test cases."""
from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import subprocess
import sys

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"


def load(monkeypatch, name):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location(f"fork_sync_{name}_test", CONTROLLER / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def steps(monkeypatch):
    return load(monkeypatch, "steps")


@pytest.fixture
def dropped_tests(monkeypatch):
    return load(monkeypatch, "dropped_tests")


def git(root, *args, date="2026-11-07T12:00:00+00:00"):
    # One committer timestamp for every commit unless a test sets batches apart.
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "-c", "user.name=Test",
         "-c", "user.email=test@example.com", *args], cwd=root,
        check=True, capture_output=True, text=True, encoding="utf-8",
        env={**os.environ, "GIT_COMMITTER_DATE": date, "GIT_AUTHOR_DATE": date},
    ).stdout.strip()


def commit(root, files, date="2026-11-07T12:00:00+00:00"):
    for name, text in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    git(root, "add", "--all")
    git(root, "commit", "-qm", "change", date=date)
    return git(root, "rev-parse", "HEAD")


def make_backlog(tmp_path, monkeypatch, hours=(12, 12, 12, 12, 12)):
    """A fork that localized four lines, and five upstream commits; the first three conflict.

    ``hours`` are the upstream commits' committer hours: equal neighbours form one batch.
    """
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    lines = {f"app/f{i}.txt": "English\n" for i in range(1, 5)}
    commit(root, lines)
    git(root, "switch", "-qc", "upstream")
    changes = [{f"app/f{i}.txt": f"Upstream {i}\n"} for i in (1, 2, 3)]
    # Tests and catalog data carry no copy to review.
    changes.append({"plugin-catalog/extra.yaml": "name: extra\n", "tests/test_extra.py": "", "app/view.test.ts": ""})
    changes.append({"app/new1.ts": "export const a = 1\n", "app/new2.ts": "export const b = 2\n"})
    chain = [commit(root, files, f"2026-11-07T{hour:02d}:00:00+00:00") for files, hour in zip(changes, hours)]
    git(root, "switch", "-q", "main")
    fork = commit(root, {name: "中文\n" for name in lines})
    monkeypatch.chdir(root)
    return fork, chain


@pytest.fixture
def backlog(tmp_path, monkeypatch):
    return make_backlog(tmp_path, monkeypatch)


def test_step_stops_before_the_conflict_over_the_limit(steps, backlog):
    fork, chain = backlog
    step = steps.furthest(fork, chain[-1], max_conflicts=2, max_files=50)
    assert (step.commit, step.commits, step.conflicts) == (chain[1], 2, 2)


def test_review_limit_ignores_tests_and_catalog_data(steps, backlog):
    fork, chain = backlog
    assert steps.measure(fork, chain[3]).files == 3
    step = steps.furthest(fork, chain[-1], max_conflicts=3, max_files=4)
    assert step.commit == chain[3]
    assert steps.furthest(fork, chain[-1], max_conflicts=3, max_files=5).commit == chain[-1]


def test_one_commit_over_the_limits_is_still_one_step(steps, backlog):
    fork, chain = backlog
    step = steps.furthest(fork, chain[-1], max_conflicts=0, max_files=0)
    assert (step.commit, step.conflicts, step.files) == (chain[0], 1, 1)


def test_next_step_starts_after_the_merged_part(steps, backlog):
    _, chain = backlog
    root = Path.cwd()
    git(root, "merge", "-q", "--no-edit", "-X", "ours", chain[1])
    step = steps.furthest(git(root, "rev-parse", "HEAD"), chain[-1], max_conflicts=1, max_files=50)
    # Only the third localized line still conflicts; the first two merged in the earlier step.
    assert (step.commit, step.commits, step.conflicts) == (chain[-1], 3, 1)


def test_step_ends_where_upstream_finished_a_batch(steps, tmp_path, monkeypatch):
    fork, chain = make_backlog(tmp_path, monkeypatch, hours=(10, 11, 11, 12, 12))
    step = steps.furthest(fork, chain[-1], max_conflicts=2, max_files=50)
    # The second commit fits too, but its batch ends with the third, which does not.
    assert (step.commit, step.batch_end) == (chain[0], True)


def test_batch_over_the_limits_is_split_inside(steps, tmp_path, monkeypatch):
    fork, chain = make_backlog(tmp_path, monkeypatch, hours=(10, 10, 10, 11, 11))
    step = steps.furthest(fork, chain[-1], max_conflicts=2, max_files=50)
    assert (step.commit, step.conflicts, step.batch_end) == (chain[1], 2, False)


def versions(**sides):
    def read(revision, path):
        return sides[revision].get(path)
    return read


def test_merge_that_loses_an_upstream_test_is_reported(dropped_tests):
    old = "it('keeps the old label', () => {})\n"
    new = old + "it('names the bots that did not join', () => {})\n"
    read = versions(base={"a.test.tsx": old}, fork={"a.test.tsx": old},
                    upstream={"a.test.tsx": new}, result={"a.test.tsx": old})
    assert dropped_tests.dropped(["a.test.tsx"], read, "fork", "upstream", "base", "result") == {
        "a.test.tsx": ["names the bots that did not join"],
    }


def test_a_test_one_side_deleted_on_purpose_is_not_expected(dropped_tests):
    both = "def test_kept():\n    pass\n\n\ndef test_retired():\n    pass\n"
    kept = "def test_kept():\n    pass\n"
    path = "tests/agent/test_label.py"
    by_fork = versions(base={path: both}, fork={path: kept}, upstream={path: both}, result={path: kept})
    by_upstream = versions(base={path: both}, fork={path: both}, upstream={path: kept}, result={path: kept})
    for read in (by_fork, by_upstream):
        assert dropped_tests.dropped([path], read, "fork", "upstream", "base", "result") == {}


def test_quote_style_and_moved_tests_still_count_as_kept(dropped_tests):
    upstream = "it('reads the bot\\'s title', () => {})\n"
    formatted = 'it("reads the bot\'s title", () => {})\n'
    fork_test = "it('keeps the Chinese label', () => {})\n"
    read = versions(
        base={"old.test.ts": "", "new.test.ts": None},
        fork={"old.test.ts": fork_test, "new.test.ts": None},
        upstream={"old.test.ts": None, "new.test.ts": upstream},
        result={"old.test.ts": None, "new.test.ts": formatted + fork_test},
    )
    paths = ["old.test.ts", "new.test.ts"]
    assert dropped_tests.dropped(paths, read, "fork", "upstream", "base", "result") == {}
