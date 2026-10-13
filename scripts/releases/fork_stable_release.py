#!/usr/bin/env python3
"""Publish this fork's stable release for one upstream version.

``vX.Y.Z`` here is upstream's ``vX.Y.Z`` plus this fork's changes: the tag of that name is
(re)pointed at the released commit on this repository — it arrived as a mirror of upstream's tag,
which names a commit without the fork — and the GitHub Release carries upstream's notes verbatim
with a fork section appended. ``hermes update --set-channel stable`` and the Desktop's stable
selector resolve exactly this: the repository's latest published strict ``vX.Y.Z`` release whose
tag on origin names the release commit (``hermes_cli/source_releases._resolve_release``), and
``hermes --version`` reads ``vX.Y.Z+N`` from it like upstream's checkouts do.

Run by ``.github/workflows/fork-stable-release.yml`` (workflow_dispatch) on a full-depth checkout of
the commit to release, with ``gh`` authenticated for the repository. Refuses when upstream has no
such published release, when upstream's tag commit is not an ancestor of the released commit (the
sync has not merged it), when origin's tag of that name points outside the released history, or
when this repository already released the version (``--force`` replaces it).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import tempfile
from dataclasses import dataclass

UPSTREAM_REPOSITORY = "NousResearch/hermes-agent"
# hermes_cli.update_channel.STABLE_TAG_RE, copied so this script runs on a bare CI Python;
# tests/scripts/test_fork_stable_release.py pins the two patterns to each other.
STABLE_TAG = re.compile(r"^v(?:0|[1-9]\d{0,2})\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$")
_GITHUB_ORIGIN = re.compile(r"^(?:https://github\.com/|git@github\.com:)([^/]+/[^/]+?)(?:\.git)?/?$")
GIT_TIMEOUT = 300
GH_TIMEOUT = 60
MAX_LISTED_COMMITS = 40
_TAGGER = ("-c", "user.name=hermes-fork-release", "-c", "user.email=noreply@github.com")


@dataclass(frozen=True)
class ReleasePlan:
    tag: str
    commit: str
    upstream_commit: str
    upstream_body: str
    synced_upstream: str | None
    previous_tag: str | None
    fork_commits: list[str]
    more_commits: int
    existing_release: bool


def normalize_version(raw: str) -> str:
    """``0.21.7`` or ``v0.21.7`` -> ``v0.21.7``; anything else is refused."""
    tag = raw.strip()
    if tag and not tag.startswith("v"):
        tag = "v" + tag
    if not STABLE_TAG.fullmatch(tag):
        raise SystemExit(f"'{raw}' is not a stable release version (vX.Y.Z)")
    return tag


def run(args: list[str], *, cwd: str | None = None, timeout: int = GIT_TIMEOUT, check: bool = True):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True, encoding="utf-8",
                          errors="replace", timeout=timeout, check=check)


def git(*args: str, cwd: str | None = None, check: bool = True) -> str:
    return run(["git", *args], cwd=cwd, check=check).stdout.strip()


def gh_json(path: str, *, missing_ok: bool = False):
    result = run(["gh", "api", path], timeout=GH_TIMEOUT, check=False)
    if result.returncode != 0:
        if missing_ok and "HTTP 404" in (result.stderr or ""):
            return None
        raise SystemExit(f"gh api {path} failed: {(result.stderr or result.stdout).strip()}")
    return json.loads(result.stdout)


def is_ancestor(commit: str, ref: str, cwd: str | None = None) -> bool:
    return run(["git", "merge-base", "--is-ancestor", commit, ref], cwd=cwd, check=False).returncode == 0


def origin_repository(cwd: str | None = None) -> str:
    url = git("config", "--get", "remote.origin.url", cwd=cwd, check=False)
    match = _GITHUB_ORIGIN.fullmatch(url)
    if not match:
        raise SystemExit(f"origin is not a GitHub repository: {url!r}; pass --repository owner/repo")
    return match[1]


def previous_release(repository: str, ref: str, tag: str, cwd: str | None = None) -> str | None:
    """The newest published strict release of THIS repository that ``ref`` contains, other than ``tag``."""
    for release in gh_json(f"repos/{repository}/releases?per_page=100") or ():  # newest first
        name = release.get("tag_name")
        if (release.get("draft") or release.get("prerelease") or not isinstance(name, str)
                or name == tag or not STABLE_TAG.fullmatch(name)):
            continue
        commit = git("rev-parse", "--verify", "--quiet", f"refs/tags/{name}^{{commit}}", cwd=cwd, check=False)
        if commit and is_ancestor(commit, ref, cwd=cwd):
            return name
    return None


def fork_commits(previous: str | None, ref: str, cwd: str | None = None) -> tuple[list[str], int]:
    """This repository's own commits since ``previous``: the first-parent chain minus its merges,
    which are the upstream syncs (upstream's commits ride on their second parent)."""
    if previous is None:
        return [], 0
    lines = [line for line in git("log", "--first-parent", "--no-merges", "--format=%h%x09%s",
                                  f"{previous}..{ref}", cwd=cwd).splitlines() if line.strip()]
    return lines[:MAX_LISTED_COMMITS], max(0, len(lines) - MAX_LISTED_COMMITS)


def synced_upstream_commit(ref: str, cwd: str | None = None) -> str | None:
    """The last upstream ``main`` commit ``ref`` contains (what the sync merged), None offline."""
    fetched = run(["git", "fetch", "--no-tags", f"https://github.com/{UPSTREAM_REPOSITORY}.git", "main"],
                  cwd=cwd, check=False)
    if fetched.returncode != 0:
        return None
    return git("merge-base", ref, "FETCH_HEAD", cwd=cwd, check=False) or None


def compose_notes(plan: ReleasePlan, repository: str) -> str:
    """Upstream's notes verbatim, then what this repository's release of the same number adds."""
    up, here = plan.upstream_commit[:10], plan.commit[:10]
    synced_zh = f"，已同步至上游 main `{plan.synced_upstream[:10]}`" if plan.synced_upstream else ""
    synced_en = f" and synced with upstream main `{plan.synced_upstream[:10]}`" if plan.synced_upstream else ""
    lines = [
        plan.upstream_body.rstrip(), "", "---", "", "## x-Ai fork", "",
        f"本仓库的 {plan.tag} = 上游 Hermes Agent {plan.tag}（标签提交 `{up}`）加上本仓库的改动，发布提交 `{here}`{synced_zh}。",
        f"This repository's {plan.tag} is upstream's {plan.tag} (tag commit `{up}`) plus this fork's changes, "
        f"released from `{here}`{synced_en}.",
        "",
    ]
    if plan.previous_tag and plan.fork_commits:
        lines += [f"自 {plan.previous_tag} 以来本仓库的自有提交 / Fork commits since {plan.previous_tag}:", ""]
        lines += [f"- `{sha}` {subject}" for sha, _, subject in (line.partition("\t") for line in plan.fork_commits)]
        if plan.more_commits:
            lines.append(f"- …另有 {plan.more_commits} 个提交 / and {plan.more_commits} more")
        lines.append("")
    lines.append(f"与上游 {plan.tag} 的完整差异 / Full diff against upstream {plan.tag}: "
                 f"https://github.com/{repository}/compare/{plan.upstream_commit}...{plan.tag}")
    return "\n".join(lines) + "\n"


def plan_release(version: str, ref: str, repository: str, cwd: str | None = None) -> ReleasePlan:
    tag = normalize_version(version)
    commit = git("rev-parse", "--verify", f"{ref}^{{commit}}", cwd=cwd)
    upstream = gh_json(f"repos/{UPSTREAM_REPOSITORY}/releases/tags/{tag}", missing_ok=True)
    if upstream is None or upstream.get("draft") or upstream.get("prerelease"):
        raise SystemExit(f"{UPSTREAM_REPOSITORY} has no published release {tag}; this fork releases upstream's versions only")
    upstream_commit = gh_json(f"repos/{UPSTREAM_REPOSITORY}/commits/{tag}")["sha"]
    if not is_ancestor(upstream_commit, commit, cwd=cwd):
        raise SystemExit(f"{commit[:10]} does not contain upstream {tag} ({upstream_commit[:10]}); sync upstream first")
    existing = gh_json(f"repos/{repository}/releases/tags/{tag}", missing_ok=True) is not None
    previous = previous_release(repository, commit, tag, cwd=cwd)
    commits, more = fork_commits(previous, commit, cwd=cwd)
    return ReleasePlan(tag, commit, upstream_commit, str(upstream.get("body") or ""),
                       synced_upstream_commit(commit, cwd=cwd), previous, commits, more, existing)


def _origin_tag_commit(tag: str, cwd: str | None = None) -> str | None:
    ref = f"refs/tags/{tag}"
    listed = git("ls-remote", "--tags", "origin", ref, ref + "^{}", cwd=cwd)
    refs = {parts[1]: parts[0] for line in listed.splitlines() if len(parts := line.split()) == 2}
    return refs.get(ref + "^{}", refs.get(ref))


def publish(plan: ReleasePlan, repository: str, *, force: bool, dry_run: bool, cwd: str | None = None) -> None:
    notes = compose_notes(plan, repository)
    if plan.existing_release and not force:
        raise SystemExit(f"{repository} already released {plan.tag}; pass --force to replace it")
    current = _origin_tag_commit(plan.tag, cwd=cwd)
    if current and current != plan.commit and not is_ancestor(current, plan.commit, cwd=cwd):
        raise SystemExit(f"origin tag {plan.tag} names {current[:10]}, which {plan.commit[:10]} does not contain; "
                         "refusing to move it")
    if dry_run:
        print(notes)
        print(f"[dry-run] would tag {plan.commit} as {plan.tag} (origin tag now: {current or 'none'}) "
              f"and publish it on {repository}{' replacing the existing release' if plan.existing_release else ''}")
        return
    message = f"Hermes Agent {plan.tag} (x-Ai fork): upstream {plan.tag} {plan.upstream_commit[:10]} plus this repository's changes"
    git(*_TAGGER, "tag", "-a", "-f", plan.tag, plan.commit, "-m", message, cwd=cwd)
    git("push", "--force", "origin", f"refs/tags/{plan.tag}", cwd=cwd)
    if plan.existing_release:
        run(["gh", "release", "delete", plan.tag, "--repo", repository, "--yes"], timeout=GH_TIMEOUT)
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as handle:
        handle.write(notes)
    try:
        run(["gh", "release", "create", plan.tag, "--repo", repository, "--verify-tag", "--latest",
             "--title", f"Hermes Agent {plan.tag}", "--notes-file", handle.name], timeout=GH_TIMEOUT)
    finally:
        os.unlink(handle.name)
    print(f"published {repository} {plan.tag} at {plan.commit}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Publish this fork's stable release for an upstream version.")
    parser.add_argument("--version", required=True, help="upstream release version, e.g. 0.21.7")
    parser.add_argument("--ref", default="HEAD", help="commit to release (default: HEAD)")
    parser.add_argument("--repository", default=os.environ.get("GITHUB_REPOSITORY") or None,
                        help="owner/repo to publish on (default: GITHUB_REPOSITORY, else the checkout's origin)")
    parser.add_argument("--force", action="store_true", help="replace an existing release of this version")
    parser.add_argument("--dry-run", action="store_true", help="print the notes and the plan; tag and publish nothing")
    args = parser.parse_args(argv)
    repository = args.repository or origin_repository()
    if repository.lower() == UPSTREAM_REPOSITORY.lower():
        raise SystemExit("this script publishes a fork's releases; upstream has its own pipeline")
    plan = plan_release(args.version, args.ref, repository)
    publish(plan, repository, force=args.force, dry_run=args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
