"""Source checkout identity is written only from the checkout itself."""

import json
import os
from pathlib import Path
import subprocess


def _git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args], cwd=repo, text=True, capture_output=True, check=True,
        env={"HOME": str(repo.parent), "PATH": os.environ["PATH"]},
    )
    return result.stdout.strip()


def test_write_source_stamp_records_live_checkout_identity_atomically(tmp_path):
    from hermes_cli.source_stamp import write_source_stamp

    repo = tmp_path / "repo"
    repo.mkdir()
    _git(repo, "init", "-q")
    _git(repo, "config", "user.name", "Hermes Test")
    _git(repo, "config", "user.email", "hermes@example.invalid")
    (repo / "tracked").write_text("release\n", encoding="utf-8")
    _git(repo, "add", "tracked")
    _git(repo, "commit", "-qm", "release")
    _git(repo, "tag", "v0.21.4")
    (repo / "tracked").write_text("next\n", encoding="utf-8")
    _git(repo, "commit", "-qam", "next")

    written = write_source_stamp(repo)
    stored = json.loads((repo / "install-stamp.json").read_text(encoding="utf-8-sig"))

    assert stored == written
    assert stored["commit"] == _git(repo, "rev-parse", "HEAD")
    assert stored["baseVersion"] == "0.21.4"
    assert stored["displayVersion"].startswith("0.21.4+1.g")
    assert stored["source"] == "git"
    assert stored["distribution"] is None
    assert stored["updateMechanism"] == "self"
    assert not list(repo.glob(".install-stamp.*.tmp"))


def test_stale_source_stamp_defers_to_live_checkout(tmp_path, monkeypatch):
    from hermes_cli.source_stamp import write_source_stamp
    from hermes_cli.version_info import _reset_version_info_cache, get_version_info

    repo = tmp_path / "repo"
    repo.mkdir()
    _git(repo, "init", "-q")
    _git(repo, "config", "user.name", "Hermes Test")
    _git(repo, "config", "user.email", "hermes@example.invalid")
    (repo / "tracked").write_text("release\n", encoding="utf-8")
    _git(repo, "add", "tracked")
    _git(repo, "commit", "-qm", "release")
    _git(repo, "tag", "v0.21.4")
    write_source_stamp(repo)

    (repo / "tracked").write_text("manual pull\n", encoding="utf-8")
    _git(repo, "commit", "-qam", "manual pull")
    monkeypatch.setenv("HERMES_INSTALL_ROOT", str(repo))
    monkeypatch.setattr("hermes_cli.version_info._resolve_repo_dir", lambda: repo)
    _reset_version_info_cache()

    info = get_version_info()

    assert info.commit == _git(repo, "rev-parse", "HEAD")
    assert info.derived_version.startswith("0.21.4+1.g")
    assert info.source == "git"

def _stamped_checkout(tmp_path, monkeypatch) -> Path:
    """A checkout one commit past ``v0.21.4`` whose stamp was published at that HEAD."""
    from hermes_cli.source_stamp import write_source_stamp
    from hermes_cli.version_info import _reset_version_info_cache

    repo = tmp_path / "repo"
    repo.mkdir()
    _git(repo, "init", "-q")
    _git(repo, "config", "user.name", "Hermes Test")
    _git(repo, "config", "user.email", "hermes@example.invalid")
    (repo / "tracked").write_text("release\n", encoding="utf-8")
    _git(repo, "add", "tracked")
    _git(repo, "commit", "-qm", "release")
    _git(repo, "tag", "v0.21.4")
    (repo / "tracked").write_text("next\n", encoding="utf-8")
    _git(repo, "commit", "-qam", "next")
    assert write_source_stamp(repo)["displayVersion"].startswith("0.21.4+1.g")
    monkeypatch.setenv("HERMES_INSTALL_ROOT", str(repo))
    monkeypatch.setattr("hermes_cli.version_info._resolve_repo_dir", lambda: repo)
    _reset_version_info_cache()
    return repo


def test_a_release_tag_landing_on_the_stamped_commit_defers_to_live_checkout(tmp_path, monkeypatch):
    """A release cut from a commit the checkout already runs arrives as a tag only: HEAD never
    moves, so the stamp written before the tag must not keep naming the previous release."""
    from hermes_cli.version_info import get_version_info

    repo = _stamped_checkout(tmp_path, monkeypatch)
    _git(repo, "tag", "v0.22.0")

    info = get_version_info()

    assert info.base_version == "0.22.0"
    assert info.distance == 0
    assert info.display_version == "0.22.0"
    assert info.commit == _git(repo, "rev-parse", "HEAD")
    assert info.source == "git"


def test_a_release_tag_moved_onto_the_stamped_commit_defers_to_live_checkout(tmp_path, monkeypatch):
    """Same release name, new commit (a fork re-pointing its mirrored tag at its own release): the
    stamp's distance is what went stale."""
    from hermes_cli.version_info import get_version_info

    repo = _stamped_checkout(tmp_path, monkeypatch)
    _git(repo, "tag", "-f", "v0.21.4", "HEAD")

    info = get_version_info()

    assert info.base_version == "0.21.4"
    assert info.distance == 0
    assert info.display_version == "0.21.4"


def test_a_source_stamp_naming_the_live_identity_is_read_without_a_git_walk(tmp_path, monkeypatch):
    """The stamp stays the fast path: while it names the checkout's commit and release, the full
    git identity (status, log, describe) is never computed."""
    from hermes_cli.version_info import get_version_info

    repo = _stamped_checkout(tmp_path, monkeypatch)

    def never(*_args, **_kwargs):
        raise AssertionError("a current stamp must not fall back to the live git identity")

    monkeypatch.setattr("hermes_cli.version_info._git_version_info", never)

    info = get_version_info()

    assert info.base_version == "0.21.4"
    assert info.distance == 1
    assert info.commit == _git(repo, "rev-parse", "HEAD")
