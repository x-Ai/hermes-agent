"""This fork's stable release: upstream's version number on this repository's commit
(``scripts/releases/fork_stable_release.py``, run by ``.github/workflows/fork-stable-release.yml``)."""

from __future__ import annotations

import pytest

from hermes_cli.update_channel import STABLE_TAG_RE
from scripts.releases import fork_stable_release as release


def _plan(**overrides):
    fields = dict(
        tag="v0.21.7", commit="f" * 40, upstream_commit="a" * 40,
        upstream_body="# Hermes Agent v0.21.7\n\n**Release Date:** October 11, 2026\n\nupstream text\n",
        synced_upstream="b" * 40, previous_tag="v0.21.6",
        fork_commits=["abc1234\tfeat(desktop): one", "def5678\tfix: two"], more_commits=3, existing_release=False,
    )
    fields.update(overrides)
    return release.ReleasePlan(**fields)


def test_version_normalizes_and_follows_the_updaters_stable_tag_rule():
    assert release.normalize_version("0.21.7") == "v0.21.7" == release.normalize_version(" v0.21.7 ")
    # The updater (`_resolve_release`, `_git_version_info`) only ever sees strict vX.Y.Z tags.
    assert release.STABLE_TAG.pattern == STABLE_TAG_RE.pattern
    for rejected in ("0.21", "v0.21.7-rc.1", "v0.21.7+canary.20261012T072214Z", "main", ""):
        with pytest.raises(SystemExit):
            release.normalize_version(rejected)


def test_notes_keep_upstreams_body_first_and_name_what_the_fork_adds():
    notes = release.compose_notes(_plan(), "x-Ai/hermes-agent")
    assert notes.startswith("# Hermes Agent v0.21.7\n\n**Release Date:** October 11, 2026\n\nupstream text\n\n---\n")
    assert "## x-Ai fork" in notes
    assert "`aaaaaaaaaa`" in notes and "`ffffffffff`" in notes and "`bbbbbbbbbb`" in notes
    assert "Fork commits since v0.21.6" in notes
    assert "- `abc1234` feat(desktop): one\n- `def5678` fix: two\n- …另有 3 个提交 / and 3 more" in notes
    assert notes.rstrip().endswith("https://github.com/x-Ai/hermes-agent/compare/" + "a" * 40 + "...v0.21.7")


def test_first_release_and_offline_runs_still_link_the_diff():
    notes = release.compose_notes(_plan(previous_tag=None, fork_commits=[], more_commits=0, synced_upstream=None), "x-Ai/hermes-agent")
    assert "Fork commits since" not in notes and "已同步至上游" not in notes
    assert "compare/" + "a" * 40 + "...v0.21.7" in notes


def test_origin_must_be_a_github_repository(tmp_path, monkeypatch):
    monkeypatch.setattr(release, "git", lambda *a, **k: "https://example.com/not/github.git")
    with pytest.raises(SystemExit, match="not a GitHub repository"):
        release.origin_repository()
    monkeypatch.setattr(release, "git", lambda *a, **k: "git@github.com:x-Ai/hermes-agent.git")
    assert release.origin_repository() == "x-Ai/hermes-agent"
