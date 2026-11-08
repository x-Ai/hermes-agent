"""Release synchronization uses real Git objects and a mocked GitHub transport."""

from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
import subprocess
from types import SimpleNamespace
from urllib.parse import quote

import pytest

from hermes_cli.update_channel import STABLE_TAG_RE
from scripts.fork_sync import releases

FORK = "example/hermes-agent"
_REAL_RUN = subprocess.run


def _git(cwd: Path, *args: str) -> str:
    return _REAL_RUN(
        ["git", "-c", "user.name=release-test", "-c", "user.email=release@example.invalid",
         "-c", "commit.gpgsign=false", "-c", "tag.gpgsign=false", *args],
        cwd=cwd, capture_output=True, text=True, encoding="utf-8", timeout=30, check=True,
    ).stdout.strip()


def _commit(cwd: Path, filename: str, content: str) -> str:
    (cwd / filename).write_text(content, encoding="utf-8")
    _git(cwd, "add", filename)
    _git(cwd, "commit", "-q", "-m", filename)
    return _git(cwd, "rev-parse", "HEAD")


@pytest.fixture
def graph(tmp_path, monkeypatch):
    monkeypatch.setenv("GIT_CONFIG_NOSYSTEM", "1")
    monkeypatch.setenv("GIT_CONFIG_GLOBAL", str(tmp_path / "empty-gitconfig"))
    monkeypatch.setenv("GIT_TERMINAL_PROMPT", "0")
    upstream = tmp_path / "upstream"
    upstream.mkdir()
    _git(upstream, "init", "-q", "-b", "main")
    base = _commit(upstream, "base.txt", "upstream base\n")
    origin = tmp_path / "origin.git"
    _git(tmp_path, "init", "-q", "--bare", str(origin))
    repo = tmp_path / "fork"
    _git(tmp_path, "clone", "-q", "--no-tags", str(upstream), str(repo))
    _git(repo, "remote", "set-url", "origin", str(origin))
    _git(repo, "config", f"url.{upstream}.insteadOf", f"https://github.com/{releases.UPSTREAM}.git")
    candidate = _commit(repo, "fork.txt", "fork additions\n")
    _git(repo, "push", "-q", "origin", "HEAD:refs/heads/main")
    monkeypatch.chdir(repo)
    return SimpleNamespace(repo=repo, upstream=upstream, origin=origin, base=base, candidate=candidate)


def _upstream_release(release_id=1, tag="v1.0.0", **overrides):
    result = {
        "id": release_id, "tag_name": tag, "name": "  Exact title — 原文  ",
        "body": "# Original notes\r\n\r\nKeep `code`, $(text), and unicode 中文.\n\n",
        "prerelease": False, "draft": False, "published_at": "2026-10-01T00:00:00Z",
    }
    result.update(overrides)
    return result


def _pending(graph, release_id=1, tag="v1.0.0", **overrides):
    result = _upstream_release(release_id, tag)
    result.pop("draft")
    result.update(upstream_commit=graph.base, upstream_ref=f"refs/fork-sync/releases/{release_id}")
    result.update(overrides)
    return result


class FakeGitHub:
    def __init__(self):
        self.pages = {FORK: [[]], releases.UPSTREAM: [[]]}
        self.existing = {}
        self.commits = {}
        self.latest = None
        self.requests = []
        self.creates = []
        self.fail_create = False
        self.error = None
        self.before_push = None
        self.git_commands = []
        self.merge_base_error = None

    def __call__(self, args, **kwargs):
        if args[0] != "gh":
            return self._git_command(args, kwargs)
        assert kwargs.get("shell", False) is False
        assert kwargs["timeout"] == releases.GH_TIMEOUT
        method = args[args.index("--method") + 1]
        path = args[2]
        self.requests.append((method, path))
        if self.error is not None:
            return subprocess.CompletedProcess(args, 1, "", self.error)
        if method == "POST":
            assert args[-2:] == ["--input", "-"]
            assert path == f"repos/{FORK}/releases"
            payload = json.loads(kwargs["input"])
            self.creates.append(deepcopy(payload))
            if self.fail_create:
                return subprocess.CompletedProcess(args, 1, "", f"private body: {payload['body']}")
            self.existing[payload["tag_name"]] = {**payload, "id": len(self.creates), "assets": []}
            return self._ok(args, self.existing[payload["tag_name"]])
        assert method == "GET"
        return self._get(args, path)

    def _git_command(self, args, kwargs):
        self.git_commands.append(list(args))
        if args[:2] == ["git", "push"] and self.before_push:
            callback, self.before_push = self.before_push, None
            callback()
        if args[:2] == ["git", "merge-base"] and self.merge_base_error is not None:
            return subprocess.CompletedProcess(args, self.merge_base_error, "", "private git error")
        return _REAL_RUN(args, **kwargs)

    def _get(self, args, path):
        for repository, pages in self.pages.items():
            prefix = f"repos/{repository}/releases?per_page=100&page="
            if path.startswith(prefix):
                page = int(path.removeprefix(prefix))
                batch = pages[page - 1] if page <= len(pages) else []
                if repository == FORK and page == 1:
                    batch = [*batch, *self.existing.values()]
                return self._ok(args, batch)
        if path == f"repos/{releases.UPSTREAM}/releases/latest":
            return self._ok(args, self.latest) if self.latest is not None else self._missing(args)
        for tag, sha in self.commits.items():
            if path == f"repos/{releases.UPSTREAM}/commits/{quote(tag, safe='')}":
                return self._ok(args, {"sha": sha})
        prefix = f"repos/{FORK}/releases/tags/"
        if path.startswith(prefix):
            for tag, release in self.existing.items():
                if path == prefix + quote(tag, safe=""):
                    return self._ok(args, release)
            return self._missing(args)
        raise AssertionError(f"Unexpected GitHub GET: {path}")

    @staticmethod
    def _ok(args, payload):
        return subprocess.CompletedProcess(args, 0, json.dumps(payload, ensure_ascii=False), "")

    @staticmethod
    def _missing(args):
        return subprocess.CompletedProcess(args, 1, "", "gh: Not Found (HTTP 404)")


@pytest.fixture
def github(monkeypatch):
    fake = FakeGitHub()
    monkeypatch.setattr(releases.subprocess, "run", fake)
    return fake


def test_discover_paginates_filters_sorts_and_keeps_prereleases(graph, github):
    old = [_upstream_release(i, f"old-{i}", published_at="2025-01-01T00:00:00Z") for i in range(1, 101)]
    first = _upstream_release(201, "release/v2.0.0-rc.1", prerelease=True)
    second = _upstream_release(202, "v2.0.0", published_at="2026-10-02T00:00:00Z")
    skipped = _upstream_release(203, "v0.23.0")
    github.pages[releases.UPSTREAM] = [old, [second, skipped, _upstream_release(204, "draft", draft=True), first]]
    github.pages[FORK] = [
        [_upstream_release(i + 1000, f"fork-{i}") for i in range(100)],
        [{**skipped, "draft": True}],
    ]
    for release in (first, second):
        _git(graph.upstream, "tag", "-a", release["tag_name"], graph.base, "-m", "upstream annotated")
        github.commits[release["tag_name"]] = graph.base
    # Discovery must not let the upstream version overwrite this fork's local tag.
    _git(graph.repo, "tag", second["tag_name"], graph.candidate)

    found = releases.discover(FORK, "2026-10-01T00:00:00Z")

    assert found == [
        {key: value for key, value in release.items() if key != "draft"}
        | {"upstream_commit": graph.base, "upstream_ref": f"refs/fork-sync/releases/{release['id']}"}
        for release in (first, second)
    ]
    assert ("GET", f"repos/{FORK}/releases?per_page=100&page=2") in github.requests
    assert ("GET", f"repos/{releases.UPSTREAM}/releases?per_page=100&page=2") in github.requests
    for release in found:
        assert _git(graph.repo, "rev-parse", release["upstream_ref"] + "^{commit}") == graph.base
    assert _git(graph.repo, "rev-parse", "refs/tags/v2.0.0") == graph.candidate
    assert _git(graph.repo, "tag", "--list", first["tag_name"]) == ""
    assert all("--no-tags" in command for command in github.git_commands if command[1] == "fetch")


def test_discover_rejects_api_and_fetched_tag_mismatch(graph, github):
    item = _upstream_release()
    github.pages[releases.UPSTREAM] = [[item]]
    github.commits[item["tag_name"]] = graph.candidate
    _git(graph.upstream, "tag", item["tag_name"], graph.base)

    with pytest.raises(RuntimeError, match="does not match"):
        releases.discover(FORK, "2026-10-01")

    assert _git(graph.repo, "tag", "--list") == ""
    assert github.creates == []


def test_publish_copies_exact_metadata_and_only_marks_upstream_latest(graph, github):
    items = [_pending(graph), _pending(graph, 2, "v1.1.0"), _pending(graph, 3, "v1.2.0-rc.1", prerelease=True)]
    github.latest = {"tag_name": "v1.1.0"}

    releases.publish(FORK, items, graph.candidate)

    assert [item["make_latest"] for item in github.creates] == ["false", "true", "false"]
    for source, created in zip(items, github.creates):
        assert created == {
            "tag_name": source["tag_name"], "target_commitish": graph.candidate,
            "name": source["name"], "body": source["body"], "draft": False,
            "prerelease": source["prerelease"],
            "make_latest": "true" if source["tag_name"] == "v1.1.0" else "false",
        }
        assert _git(graph.origin, "rev-parse", f"refs/tags/{source['tag_name']}^{{commit}}") == graph.candidate
    assert _git(graph.repo, "tag", "--list") == ""


def test_publish_preserves_existing_release_assets_and_localized_tag(graph, github):
    item = _pending(graph, tag="v0.23.0")
    existing = {"tag_name": item["tag_name"], "name": "本地版本", "body": "localized",
                "prerelease": False, "assets": [{"id": 42, "name": "installer.zip"}]}
    github.existing[item["tag_name"]] = deepcopy(existing)
    _git(graph.repo, "push", "-q", "origin", f"{graph.base}:refs/tags/{item['tag_name']}")
    before = _git(graph.origin, "show-ref", "--tags")

    releases.publish(FORK, [item], graph.candidate)
    releases.publish(FORK, [item], graph.candidate)

    assert github.existing[item["tag_name"]] == existing
    assert github.creates == []
    assert _git(graph.origin, "show-ref", "--tags") == before


@pytest.mark.parametrize("annotated", [False, True])
def test_publish_moves_only_unpublished_upstream_mirror_with_object_id_lease(graph, github, annotated):
    item = _pending(graph)
    tag = item["tag_name"]
    args = ["tag", "-a", tag, graph.base, "-m", "upstream"] if annotated else ["tag", tag, graph.base]
    _git(graph.repo, *args)
    observed = _git(graph.repo, "rev-parse", f"refs/tags/{tag}")
    _git(graph.repo, "push", "-q", "origin", f"refs/tags/{tag}")
    if annotated:
        assert observed != graph.base

    releases.publish(FORK, [item], graph.candidate)

    pushes = [args for args in github.git_commands if args[1] == "push"]
    assert len(pushes) == 1
    assert f"--force-with-lease=refs/tags/{tag}:{observed}" in pushes[0]
    assert _git(graph.origin, "rev-parse", f"refs/tags/{tag}^{{commit}}") == graph.candidate
    assert _git(graph.repo, "rev-parse", f"refs/tags/{tag}") == observed


def test_publish_cas_rejects_tag_changed_after_observation(graph, github):
    item = _pending(graph)
    ref = f"refs/tags/{item['tag_name']}"
    _git(graph.repo, "tag", "-a", item["tag_name"], graph.base, "-m", "first mirror")
    _git(graph.repo, "push", "-q", "origin", ref)
    _git(graph.repo, "tag", "-a", "replacement", graph.base, "-m", "second object, same commit")
    replacement = _git(graph.repo, "rev-parse", "refs/tags/replacement")
    github.before_push = lambda: _git(graph.repo, "push", "-q", "--force", "origin", f"{replacement}:{ref}")

    with pytest.raises(RuntimeError, match="git push failed"):
        releases.publish(FORK, [item], graph.candidate)

    assert _git(graph.origin, "rev-parse", ref) == replacement
    assert github.creates == []


def test_publish_rejects_different_reachable_fork_candidate(graph, github):
    item = _pending(graph)
    newer = _commit(graph.repo, "later.txt", "later fork candidate")
    _git(graph.repo, "push", "-q", "origin", f"{graph.candidate}:refs/tags/{item['tag_name']}")

    with pytest.raises(RuntimeError, match="collides"):
        releases.publish(FORK, [item], newer)

    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}") == graph.candidate
    assert github.creates == []


def test_publish_rejects_unrelated_tag_collision(graph, github):
    item = _pending(graph)
    other = _commit(graph.upstream, "other.txt", "not in fork")
    _git(graph.upstream, "push", "-q", str(graph.origin), f"{other}:refs/tags/{item['tag_name']}")

    with pytest.raises(RuntimeError, match="collides"):
        releases.publish(FORK, [item], graph.candidate)

    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}") == other
    assert github.creates == []


def test_api_create_failure_leaves_tag_and_retry_is_idempotent(graph, github):
    item = _pending(graph)
    github.fail_create = True

    with pytest.raises(RuntimeError) as failure:
        releases.publish(FORK, [item], graph.candidate)

    assert item["body"] not in str(failure.value)
    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}^{{commit}}") == graph.candidate
    pushes_before_retry = [args for args in github.git_commands if args[1] == "push"]
    github.fail_create = False
    releases.publish(FORK, [item], graph.candidate)
    releases.publish(FORK, [item], graph.candidate)

    assert len(github.creates) == 2  # One failed request, one successful request.
    assert [args for args in github.git_commands if args[1] == "push"] == pushes_before_retry
    assert github.existing[item["tag_name"]]["body"] == item["body"]


def test_retry_uses_verified_older_candidate_without_moving_its_tag(graph, github):
    item = _pending(graph)
    github.fail_create = True
    with pytest.raises(RuntimeError):
        releases.publish(FORK, [item], graph.candidate)
    ref = f"refs/tags/{item['tag_name']}"
    receipt_object = _git(graph.origin, "rev-parse", ref)
    assert receipt_object != graph.candidate
    newer = _commit(graph.repo, "newer.txt", "new candidate after a partial publication")
    github.fail_create = False
    pushes_before_retry = [args for args in github.git_commands if args[1] == "push"]

    releases.publish(FORK, [item], newer)

    assert github.creates[-1]["target_commitish"] == graph.candidate
    assert _git(graph.origin, "rev-parse", ref) == receipt_object
    assert _git(graph.origin, "rev-parse", ref + "^{commit}") == graph.candidate
    assert [args for args in github.git_commands if args[1] == "push"] == pushes_before_retry


def test_retry_rejects_an_annotated_candidate_without_matching_receipt(graph, github):
    item = _pending(graph)
    newer = _commit(graph.repo, "newer.txt", "newer fork candidate")
    _git(graph.repo, "tag", "-a", item["tag_name"], graph.candidate, "-m", "unrelated tag")
    ref = f"refs/tags/{item['tag_name']}"
    _git(graph.repo, "push", "-q", "origin", ref)
    observed = _git(graph.origin, "rev-parse", ref)

    with pytest.raises(RuntimeError, match="matching publication receipt"):
        releases.publish(FORK, [item], newer)

    assert github.creates == []
    assert _git(graph.origin, "rev-parse", ref) == observed


def test_retry_rejects_receipt_for_different_upstream_commit(graph, github):
    item = _pending(graph)
    github.fail_create = True
    with pytest.raises(RuntimeError):
        releases.publish(FORK, [item], graph.candidate)
    newer = _commit(graph.repo, "newer.txt", "newer fork candidate")
    changed = {**item, "upstream_commit": newer}
    github.fail_create = False

    with pytest.raises(RuntimeError, match="matching publication receipt"):
        releases.publish(FORK, [changed], newer)

    assert len(github.creates) == 1
    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}^{{commit}}") == graph.candidate


def test_retry_requires_previous_candidate_to_be_ancestor(graph, github):
    item = _pending(graph)
    github.fail_create = True
    with pytest.raises(RuntimeError):
        releases.publish(FORK, [item], graph.candidate)
    _git(graph.repo, "switch", "-q", "-c", "divergent", graph.base)
    divergent = _commit(graph.repo, "different.txt", "divergent fork candidate")
    github.fail_create = False

    with pytest.raises(RuntimeError, match="as an ancestor"):
        releases.publish(FORK, [item], divergent)

    assert len(github.creates) == 1
    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}^{{commit}}") == graph.candidate


def test_publish_validates_all_upstream_objects_before_first_mutation(graph, github):
    items = [_pending(graph), _pending(graph, 2, "v1.1.0", upstream_commit="f" * 40)]

    with pytest.raises(RuntimeError, match="git rev-parse failed"):
        releases.publish(FORK, items, graph.candidate)

    assert _git(graph.origin, "tag", "--list") == ""
    assert github.requests == []


def test_publish_requires_strict_ancestry_even_when_patch_is_cherry_picked(graph, github):
    fix = _commit(graph.upstream, "fix.txt", "release branch fix\n")
    _git(graph.repo, "fetch", "-q", "--no-tags", str(graph.upstream), fix)
    _git(graph.repo, "cherry-pick", fix)
    picked = _git(graph.repo, "rev-parse", "HEAD")
    item = _pending(graph, upstream_commit=fix)
    assert fix != picked

    with pytest.raises(RuntimeError, match="as an ancestor"):
        releases.publish(FORK, [item], picked)

    assert github.requests == []
    assert _git(graph.origin, "tag", "--list") == ""
    _git(graph.repo, "merge", "-q", "--no-ff", "-m", "merge release branch", fix)
    merged = _git(graph.repo, "rev-parse", "HEAD")
    releases.publish(FORK, [item], merged)
    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}^{{commit}}") == merged


def test_publish_fails_closed_on_git_ancestry_error(graph, github):
    github.merge_base_error = 128

    with pytest.raises(RuntimeError, match="git merge-base failed"):
        releases.publish(FORK, [_pending(graph)], graph.candidate)

    assert github.requests == []
    assert _git(graph.origin, "tag", "--list") == ""


@pytest.mark.parametrize("error", ["gh: Forbidden (HTTP 403) secret-token", "gh: service failed (HTTP 500)"])
def test_missing_ok_does_not_hide_other_api_errors(github, error):
    github.error = error

    with pytest.raises(RuntimeError) as failure:
        releases.gh_json(f"repos/{FORK}/releases/latest", missing_ok=True)

    assert error not in str(failure.value)
    assert "secret-token" not in str(failure.value)


def test_missing_ok_accepts_only_not_found(github):
    assert releases.gh_json(f"repos/{FORK}/releases/tags/missing", missing_ok=True) is None
    with pytest.raises(RuntimeError, match="GitHub API request failed"):
        releases.gh_json(f"repos/{FORK}/releases/tags/missing")


def test_timeout_is_bounded_and_does_not_expose_process_details(monkeypatch):
    def timeout(args, **kwargs):
        assert kwargs["timeout"] == releases.GH_TIMEOUT
        raise subprocess.TimeoutExpired(args, kwargs["timeout"], output="sensitive body", stderr="token")

    monkeypatch.setattr(releases.subprocess, "run", timeout)
    with pytest.raises(RuntimeError) as failure:
        releases.gh_json(f"repos/{FORK}/releases")
    assert str(failure.value) == "gh command could not complete"


def test_previous_release_lookup_follows_the_updaters_stable_tag_rule():
    # The updater (`_resolve_release`, `_git_version_info`) only ever sees strict vX.Y.Z tags.
    assert releases.STABLE_TAG.pattern == STABLE_TAG_RE.pattern


def test_each_release_is_tagged_at_its_own_target(graph, github):
    later = _commit(graph.repo, "later.txt", "a later fork change\n")
    item = _pending(graph, target=graph.candidate, notes="upstream notes\n\n---\nfork section\n")

    releases.publish(FORK, [item], later)

    assert github.creates[0]["target_commitish"] == graph.candidate
    assert github.creates[0]["body"] == item["notes"]
    assert _git(graph.origin, "rev-parse", f"refs/tags/{item['tag_name']}^{{commit}}") == graph.candidate


def test_a_target_outside_the_candidate_history_is_refused_before_any_mutation(graph, github):
    _git(graph.repo, "switch", "-q", "-c", "side", graph.base)
    side = _commit(graph.repo, "side.txt", "not on main\n")
    item = _pending(graph, target=side)

    with pytest.raises(RuntimeError, match="not in the candidate's history"):
        releases.publish(FORK, [item], graph.candidate)

    assert github.requests == [] and _git(graph.origin, "tag", "--list") == ""


def test_notes_keep_upstreams_body_first_and_name_what_the_fork_adds(graph, github):
    _git(graph.repo, "tag", "v0.9.0", graph.candidate)
    github.pages[FORK] = [[{"tag_name": "v0.9.0", "draft": False, "prerelease": False}]]
    fork_change = _commit(graph.repo, "feature.txt", "fork feature\n")
    item = _pending(graph, tag="v1.0.0", body="# Hermes Agent v1.0.0\n\nupstream text\n")

    text = releases.notes("example/hermes-agent", item, fork_change, graph.base)

    assert text.startswith("# Hermes Agent v1.0.0\n\nupstream text\n\n---\n\n## example fork\n")
    assert f"`{graph.base[:10]}`" in text and f"`{fork_change[:10]}`" in text
    assert "Fork commits since v0.9.0" in text and f"- `{fork_change[:7]}` feature.txt" in text
    assert text.rstrip().endswith(f"https://github.com/example/hermes-agent/compare/{graph.base}...v1.0.0")


def test_first_release_still_links_the_diff(graph, github):
    text = releases.notes("example/hermes-agent", _pending(graph), graph.candidate, graph.base)
    assert "Fork commits since" not in text
    assert f"compare/{graph.base}...v1.0.0" in text
