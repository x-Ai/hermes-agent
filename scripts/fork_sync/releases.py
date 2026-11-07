"""Discover upstream releases and publish their metadata on a merged fork commit.

Run from the repository root with authenticated ``gh`` and a writable ``origin``.
Only unpublished upstream mirror tags may move. Annotated provenance receipts let
retries publish a previously validated candidate without moving its tag.
"""

from __future__ import annotations

from datetime import UTC, datetime
import json
import re
import subprocess
import time
from urllib.parse import quote

UPSTREAM = "NousResearch/hermes-agent"
GIT_TIMEOUT = 300
GH_TIMEOUT = 60
_OBJECT_ID = re.compile(r"(?:[0-9a-f]{40}|[0-9a-f]{64})\Z")
_REPOSITORY = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\Z")
_RECEIPT_PREFIX = "hermes-fork-sync-release-v1\n"


def _run(args: list[str], *, timeout: int, input: str | None = None):
    try:
        return subprocess.run(
            args, input=input, capture_output=True, text=True, encoding="utf-8",
            errors="replace", timeout=timeout, check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        # CLI output and exception details may contain credentials or release bodies.
        raise RuntimeError(f"{args[0]} command could not complete") from None


def _git(*args: str, input: str | None = None) -> str:
    result = _run(["git", *args], timeout=GIT_TIMEOUT, input=input)
    if result.returncode:
        raise RuntimeError(f"git {args[0]} failed (exit {result.returncode})")
    return result.stdout.strip()


def _gh_request(path: str, *, payload: dict | None = None, missing_ok: bool = False):
    args = ["gh", "api", path, "--method", "GET" if payload is None else "POST"]
    body = None
    if payload is not None:
        args += ["--input", "-"]
        body = json.dumps(payload, ensure_ascii=False)
    result = _run(args, timeout=GH_TIMEOUT, input=body)
    if result.returncode:
        if missing_ok and "(HTTP 404)" in result.stderr:
            return None
        raise RuntimeError(f"GitHub API request failed (exit {result.returncode})")
    try:
        return json.loads(result.stdout)
    except (ValueError, TypeError):
        raise RuntimeError("GitHub API returned invalid JSON") from None


def gh_json(path: str, missing_ok: bool = False):
    """Read GitHub JSON, allowing only an explicit HTTP 404 to mean missing."""
    return _gh_request(path, missing_ok=missing_ok)


def _fork_repository(repository: str) -> None:
    if not _REPOSITORY.fullmatch(repository) or repository.casefold() == UPSTREAM.casefold():
        raise ValueError("repository must name a fork as owner/repo")


def _timestamp(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value)
    except (ValueError, AttributeError, TypeError):
        raise ValueError("release timestamps and since must use ISO 8601") from None
    return parsed.replace(tzinfo=UTC) if parsed.tzinfo is None else parsed


def _all_releases(repository: str) -> list[dict]:
    releases = []
    page = 1
    while True:
        batch = gh_json(f"repos/{repository}/releases?per_page=100&page={page}")
        if not isinstance(batch, list) or any(not isinstance(item, dict) for item in batch):
            raise RuntimeError("GitHub API returned an invalid release list")
        releases.extend(batch)
        if len(batch) < 100:
            return releases
        page += 1


def _tag_ref(tag: str) -> str:
    if not isinstance(tag, str) or not tag:
        raise ValueError("release tag must be a nonempty string")
    ref = f"refs/tags/{tag}"
    _git("check-ref-format", ref)
    return ref


def _object_id(value: str) -> str:
    if not isinstance(value, str) or not _OBJECT_ID.fullmatch(value):
        raise ValueError("release commit must be a full Git object ID")
    return value


def _commit(ref: str) -> str:
    return _object_id(_git("rev-parse", "--verify", "--end-of-options", f"{ref}^{{commit}}"))


def discover(repository: str, since: str) -> list[dict]:
    """Fetch every pending public release at or after ``since``, oldest first.

    Fork releases (including drafts) reserve their tag names. Prereleases from
    upstream are included; their tags are fetched into a separate ref namespace.
    """
    _fork_repository(repository)
    cutoff = _timestamp(since)
    existing = {release["tag_name"] for release in _all_releases(repository)}
    pending = [
        release for release in _all_releases(UPSTREAM)
        if not release.get("draft") and release["tag_name"] not in existing
        and release.get("published_at") is not None
        and _timestamp(release["published_at"]) >= cutoff
    ]
    pending.sort(key=lambda release: (_timestamp(release["published_at"]), release["id"]))
    result = []
    for release in pending:
        release_id = release["id"]
        if type(release_id) is not int or release_id <= 0:
            raise ValueError("upstream release must have a positive numeric ID")
        tag = release["tag_name"]
        source = _tag_ref(tag)
        upstream_ref = f"refs/fork-sync/releases/{release_id}"
        upstream_commit = _object_id(gh_json(f"repos/{UPSTREAM}/commits/{quote(tag, safe='')}")["sha"])
        _git("fetch", "--no-tags", f"https://github.com/{UPSTREAM}.git", f"+{source}:{upstream_ref}")
        if _commit(upstream_ref) != upstream_commit:
            raise RuntimeError("fetched upstream release tag does not match its API commit")
        result.append({
            "id": release_id,
            "tag_name": tag,
            "name": release.get("name"),
            "body": release.get("body"),
            "prerelease": release["prerelease"],
            "published_at": release["published_at"],
            "upstream_commit": upstream_commit,
            "upstream_ref": upstream_ref,
        })
    return result


def _require_ancestor(upstream_commit: str, candidate: str) -> None:
    # Resolve the object first: a missing object is an error, never an empty diff.
    if _commit(_object_id(upstream_commit)) != upstream_commit:
        raise RuntimeError("upstream release object must be a commit")
    result = _run(
        ["git", "merge-base", "--is-ancestor", upstream_commit, candidate], timeout=GIT_TIMEOUT,
    )
    if result.returncode == 1:
        raise RuntimeError("candidate does not contain the upstream release commit as an ancestor")
    if result.returncode:
        raise RuntimeError(f"git merge-base failed (exit {result.returncode})")


def _origin_tag(ref: str) -> tuple[str | None, str | None]:
    """Return the remote tag object ID and its peeled target separately."""
    refs = {}
    for line in _git("ls-remote", "--tags", "origin", ref, ref + "^{}").splitlines():
        parts = line.split()
        if len(parts) != 2 or parts[1] not in (ref, ref + "^{}"):
            raise RuntimeError("git ls-remote returned invalid tag data")
        refs[parts[1]] = _object_id(parts[0])
    observed = refs.get(ref)
    if observed is None and refs:
        raise RuntimeError("git ls-remote returned a peeled tag without its object ID")
    return observed, refs.get(ref + "^{}", observed)


def _receipt(repository: str, release: dict, candidate: str) -> str:
    return _RECEIPT_PREFIX + json.dumps({
        "repository": repository,
        "upstream": UPSTREAM,
        "upstream_commit": release["upstream_commit"],
        "candidate": candidate,
        "tag_name": release["tag_name"],
        "release_id": release["id"],
    }, sort_keys=True)


def _annotated_tag(repository: str, release: dict, candidate: str) -> str:
    # mktag writes an object without replacing any local tags or requiring Git config.
    contents = (
        f"object {candidate}\ntype commit\ntag {release['tag_name']}\n"
        f"tagger hermes-fork-sync <noreply@github.com> {int(time.time())} +0000\n\n"
        f"{_receipt(repository, release, candidate)}\n"
    )
    return _object_id(_git("mktag", input=contents))


def _previous_candidate(repository: str, release: dict, candidate: str,
                        ref: str, observed: str, peeled: str) -> str:
    if observed == peeled:
        raise RuntimeError("origin tag collides with an unverified fork candidate")
    release_id = release["id"]
    if type(release_id) is not int or release_id <= 0:
        raise ValueError("upstream release must have a positive numeric ID")
    receipt_ref = f"refs/fork-sync/published/{release_id}"
    _git("fetch", "--no-tags", "origin", f"+{ref}:{receipt_ref}")
    if _git("rev-parse", "--verify", receipt_ref) != observed or _commit(receipt_ref) != peeled:
        raise RuntimeError("origin tag changed while verifying its publication receipt")
    contents = _git("cat-file", "tag", observed)
    header, separator, message = contents.partition("\n\n")
    expected_header = f"object {peeled}\ntype commit\ntag {release['tag_name']}\n"
    if not separator or not header.startswith(expected_header) or message != _receipt(repository, release, peeled):
        raise RuntimeError("origin tag collides with a tag without a matching publication receipt")
    _require_ancestor(release["upstream_commit"], peeled)
    _require_ancestor(peeled, candidate)
    return peeled


def _publish_one(repository: str, release: dict, candidate: str, latest_tag: str | None) -> None:
    tag = release["tag_name"]
    ref = _tag_ref(tag)
    endpoint = f"repos/{repository}/releases/tags/{quote(tag, safe='')}"
    # Recheck immediately before touching a tag in case another run published it.
    if gh_json(endpoint, missing_ok=True) is not None:
        return
    observed, peeled = _origin_tag(ref)
    target = candidate
    if observed is not None and peeled not in (release["upstream_commit"], candidate):
        target = _previous_candidate(repository, release, candidate, ref, observed, peeled)
    elif peeled != candidate:
        tag_object = _annotated_tag(repository, release, candidate)
        # An annotated tag's peeled commit is NOT the lease's expected object ID.
        _git(
            "push", "--porcelain", f"--force-with-lease={ref}:{observed or ''}",
            "origin", f"{tag_object}:{ref}",
        )
    _gh_request(f"repos/{repository}/releases", payload={
        "tag_name": tag,
        "target_commitish": target,
        "name": release["name"],
        "body": release["body"],
        "draft": False,
        "prerelease": release["prerelease"],
        "make_latest": "true" if tag == latest_tag else "false",
    })


def publish(repository: str, releases: list[dict], candidate: str) -> None:
    """Publish without editing existing Releases, assets, or unrelated tags.

    All upstream commits must exist and be ancestors before any remote mutation.
    API failures leave pushed tags intact so the same candidate can be retried.
    """
    _fork_repository(repository)
    if not releases:
        return
    candidate_commit = _commit(candidate)
    for release in releases:
        _require_ancestor(release["upstream_commit"], candidate_commit)
    existing = {release["tag_name"] for release in _all_releases(repository)}
    pending = [release for release in releases if release["tag_name"] not in existing]
    if not pending:
        return
    latest = gh_json(f"repos/{UPSTREAM}/releases/latest", missing_ok=True)
    latest_tag = latest["tag_name"] if latest is not None else None
    for release in pending:
        _publish_one(repository, release, candidate_commit, latest_tag)
