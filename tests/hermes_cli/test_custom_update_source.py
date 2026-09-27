"""Update-source contract for the x-Ai fork: every updater path must agree on ONE repository.

Regression for the split source found in the 2026-09 audit: the ZIP (no-git) path and the
embedded desktop bundle resolved their target through ``hermes_cli.source_releases`` (still
NousResearch) while the git path used the fork, so a no-git ``hermes update`` silently
reinstalled upstream over the fork.
"""

from hermes_cli import source_releases, update_cmd_git

FORK_REPOSITORY = "x-Ai/hermes-agent"


def test_every_update_path_names_the_same_repository():
    assert source_releases.OFFICIAL_REPOSITORY == FORK_REPOSITORY
    assert update_cmd_git.OFFICIAL_REPO_URL == f"https://github.com/{source_releases.OFFICIAL_REPOSITORY}.git"
    assert update_cmd_git.OFFICIAL_REPO_URL in update_cmd_git.OFFICIAL_REPO_URLS
    # No git command → the release/ZIP resolver falls back to the official repository, i.e. the fork.
    assert source_releases.source_repository(None) == source_releases.OFFICIAL_REPOSITORY


def test_fork_detection_treats_the_fork_as_official_and_upstream_as_foreign():
    assert update_cmd_git._is_fork(update_cmd_git.OFFICIAL_REPO_URL) is False
    assert update_cmd_git._is_fork(f"git@github.com:{FORK_REPOSITORY}.git") is False
    assert update_cmd_git._is_fork("https://github.com/NousResearch/hermes-agent.git") is True


def test_source_target_for_a_plain_main_update_points_at_the_fork(monkeypatch):
    """The path a no-git install takes: ``resolve_source_target(channel, None, ...)``."""
    calls = []

    def fake_fetch(*args, **kwargs):  # any network lookup must be about the fork
        calls.append((args, kwargs))
        raise AssertionError("network lookups are not exercised by this contract")

    for name in ("_fetch_json", "_http_get", "_fetch_text"):
        if hasattr(source_releases, name):
            monkeypatch.setattr(source_releases, name, fake_fetch)
    target = source_releases.resolve_source_target("main", None)
    assert target.repository == source_releases.OFFICIAL_REPOSITORY
    assert target.branch == "main"
    assert not calls
