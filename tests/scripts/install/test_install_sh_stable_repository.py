"""install.sh's stable channel installs the latest release of the repository it installs: the release
`hermes update --channel stable` resolves for the same checkout.

This fork clones its own repository by default and cuts its own releases, whose vX.Y.Z names the
fork's commit. `hermes update` resolves a GitHub origin's own latest release, and for any other
origin the release of the repository it treats as official (`source_releases.source_repository`).
The installer used to ask NousResearch's releases whatever it installed, so while upstream had a
release the fork had not cut yet, a fresh `--channel stable` install of the fork failed (the tag is
absent from the fork) or installed upstream's own commit (the tag mirrored into the fork, before the
fork's release re-points it). Each GitHub URL leads to a local origin, and one fake GitHub answers
the installer's `curl` and the updater's HTTP client alike.
"""
from email.message import Message
import io
import json
import os
from pathlib import Path
import shlex
import subprocess
import urllib.error
import urllib.request
from urllib.parse import urlsplit

import pytest

from hermes_cli import github_api
from hermes_cli.source_releases import OFFICIAL_REPOSITORY, resolve_source_target
from hermes_cli.update_channel import default_channel

pytestmark = pytest.mark.platforms("posix")
INSTALL_SH = Path(__file__).resolve().parents[3] / "scripts" / "install.sh"
UPSTREAM_REPOSITORY = "NousResearch/hermes-agent"
FORK = f"https://github.com/{OFFICIAL_REPOSITORY}.git"  # what the installer clones by default
UPSTREAM = f"https://github.com/{UPSTREAM_REPOSITORY}.git"
ORIGINS = {FORK: "fork", UPSTREAM: "upstream"}  # GitHub URL -> local origin under tmp_path


def _git(cwd, *args, env=None):
    return subprocess.run(
        ["git", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
         "-c", "commit.gpgsign=false", "-c", "tag.gpgsign=false", *args],
        cwd=cwd, check=True, capture_output=True, text=True, stdin=subprocess.DEVNULL, env=env,
    ).stdout.strip()


def _origin(path, *history):
    """A local origin with one empty commit per ``(label, tag)`` on main; returns label -> commit."""
    path.mkdir()
    _git(path, "init", "-q", "-b", "main")
    commits = {}
    for label, tag in history:
        _git(path, "commit", "-q", "--allow-empty", "-m", label)
        commits[label] = _git(path, "rev-parse", "HEAD")
        if tag:
            _git(path, "tag", "-a", tag, "-m", label)
    return commits


def _world(tmp_path, monkeypatch, *, quota_spent=False):
    """Upstream has published v1.3.0, which the fork has not cut yet; the fork's latest release is its
    own v1.2.3. Returns the two origins' commits and the installer's environment."""
    upstream = _origin(tmp_path / "upstream", ("1.2.3", "v1.2.3"), ("1.3.0", "v1.3.0"), ("tip", None))
    fork = _origin(tmp_path / "fork", ("before", None), ("1.2.3", "v1.2.3"), ("tip", None))
    releases = {OFFICIAL_REPOSITORY: ("v1.2.3", fork["1.2.3"]),
                UPSTREAM_REPOSITORY: ("v1.3.0", upstream["1.3.0"])}
    home = tmp_path / "home"
    home.mkdir()
    # Each GitHub URL leads to its local origin, and any other one nowhere: a wrong URL fails at once
    # instead of cloning over the network.
    rules = {**{url: (tmp_path / name).as_uri() for url, name in ORIGINS.items()},
             "https://github.com/": (tmp_path / "offline").as_uri() + "/"}
    (home / ".gitconfig").write_text(
        "".join(f'[url "{to}"]\n  insteadOf = {url}\n' for url, to in rules.items()), encoding="utf-8")
    stub = _github_for_curl(tmp_path / "github", releases, quota_spent=quota_spent)
    _github_for_the_updater(monkeypatch, releases)
    env = {"PATH": f"{stub}{os.pathsep}{os.environ['PATH']}", "HOME": str(home), "NO_COLOR": "1",
           "GIT_CONFIG_NOSYSTEM": "1"}
    return fork, upstream, env


def _api(releases):
    """api.github.com's answers for each repository's latest release: path -> JSON."""
    api = {}
    for repository, (tag, commit) in releases.items():
        api[f"/repos/{repository}/releases/latest"] = {"tag_name": tag, "draft": False, "prerelease": False}
        api[f"/repos/{repository}/commits/{tag}"] = {"sha": commit}
    return api


def _github_for_curl(stub, releases, *, quota_spent):
    """A ``curl`` answering as GitHub does, owner/repo case-insensitively: the REST API (nothing once
    the anonymous quota is spent) and github.com's /releases/latest redirect. Any other URL fails like
    an unreachable host. Returns the directory to put first on PATH."""
    stub.mkdir()
    api = _api(releases)
    answers = []
    for n, (repository, (tag, _)) in enumerate(releases.items()):
        latest = f"/repos/{repository}/releases/latest"
        if not quota_spent:
            (stub / f"{n}.json").write_text(json.dumps(api[latest], indent=2) + "\n", encoding="utf-8")
            answers.append((f"https://api.github.com{latest}", stub / f"{n}.json"))
        (stub / f"{n}.headers").write_bytes(
            f"HTTP/2 302\r\nlocation: https://github.com/{repository}/releases/tag/{tag}\r\n\r\n".encode())
        answers.append((f"https://github.com/{repository}/releases/latest", stub / f"{n}.headers"))
    (stub / "curl").write_text("\n".join([
        "#!/bin/sh",
        "for url; do :; done",  # the URL is the last argument
        "case \"$(printf '%s' \"$url\" | tr '[:upper:]' '[:lower:]')\" in",
        *(f"    {shlex.quote(url.lower())}) exec cat {shlex.quote(str(body))} ;;" for url, body in answers),
        "    *) exit 22 ;;",
        "esac",
        "",
    ]), encoding="utf-8")
    (stub / "curl").chmod(0o755)
    return stub


def _github_for_the_updater(monkeypatch, releases):
    """The same api.github.com behind the updater's own HTTP client, anonymous."""
    answers = {path.lower(): payload for path, payload in _api(releases).items()}

    def urlopen(request, *args, **kwargs):
        url = request.full_url if isinstance(request, urllib.request.Request) else request
        parts = urlsplit(url)
        payload = answers.get(parts.path.lower()) if parts.netloc == "api.github.com" else None
        if payload is None:
            raise urllib.error.HTTPError(url, 404, "Not Found", Message(), None)
        return io.BytesIO(json.dumps(payload).encode())

    monkeypatch.setattr(urllib.request, "urlopen", urlopen)
    monkeypatch.setattr(github_api, "_gh_cli_token", lambda: None)


def _install(install, env, *args):
    return subprocess.run(
        ["bash", str(INSTALL_SH), "--stage", "repository", "--dir", str(install),
         "--hermes-home", str(install.parent), "--non-interactive", *args],
        check=False, capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=120, env=env,
    )


@pytest.mark.parametrize("origin,args,variant,lands", [
    # The fork's default URL: its own release, whether upstream's newer tag is absent from the fork
    # or mirrored there on upstream's commit.
    pytest.param("fork", ["--channel", "stable"], "", "fork", id="fork"),
    pytest.param("fork", ["--channel", "stable"], "mirrored", "fork", id="fork-holding-upstream-tag"),
    # github.com's redirect answers instead.
    pytest.param("fork", ["--channel", "stable"], "quota-spent", "fork", id="fork-api-quota-spent"),
    # A checkout behind the release moves forward to it.
    pytest.param("fork", ["--channel", "stable"], "rerun", "fork", id="fork-rerun"),
    # An origin off GitHub mirrors the default repository's tags.
    pytest.param("mirror", ["--channel", "stable"], "", "fork", id="mirror-off-github"),
    # Upstream's URL: stable by default and its own release, as before.
    pytest.param("upstream", [], "", "upstream", id="upstream"),
])
def test_stable_install_lands_on_the_release_hermes_update_resolves(tmp_path, monkeypatch, origin, args,
                                                                    variant, lands):
    fork, upstream, env = _world(tmp_path, monkeypatch, quota_spent=variant == "quota-spent")
    install = tmp_path / "home" / ".hermes" / "hermes-agent"
    if variant == "mirrored":
        _git(tmp_path / "fork", "fetch", "-q", "--no-tags", str(tmp_path / "upstream"),
             "refs/tags/v1.3.0:refs/tags/v1.3.0")
    if origin != "fork":
        env["HERMES_REPO_URL"] = UPSTREAM if origin == "upstream" else str(tmp_path / "fork")
    if variant == "rerun":
        install.parent.mkdir(parents=True)
        _git(tmp_path, "clone", "-q", FORK, str(install), env=env)
        _git(install, "checkout", "-q", "--detach", fork["before"])

    result = _install(install, env, *args)

    assert result.returncode == 0, result.stdout + result.stderr
    head = _git(install, "rev-parse", "HEAD")
    assert head == (fork["1.2.3"] if lands == "fork" else upstream["1.3.0"]), result.stdout + result.stderr
    assert _git(install, "status", "--porcelain") == "", result.stdout + result.stderr
    # The updater's git reads no global config, so it reaches the local origins through the checkout's.
    for url, name in ORIGINS.items():
        _git(install, "config", f"url.{(tmp_path / name).as_uri()}.insteadOf", url)
    target = resolve_source_target("stable", ["git"], install)
    assert (target.commit, target.version) == (head, "1.2.3" if lands == "fork" else "1.3.0")


def test_the_forks_url_keeps_following_main_by_default(tmp_path, monkeypatch):
    """Only NousResearch's URL defaults to stable; the fork's follows main, as its updater does."""
    fork, _, env = _world(tmp_path, monkeypatch)
    install = tmp_path / "home" / ".hermes" / "hermes-agent"

    result = _install(install, env)

    assert result.returncode == 0, result.stdout + result.stderr
    assert _git(install, "rev-parse", "HEAD") == fork["tip"], result.stdout + result.stderr
    assert default_channel(install) == "main"
