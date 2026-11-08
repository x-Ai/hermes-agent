"""Plan bounded upstream merge steps with trial merges.

A sync that falls behind must not merge the whole backlog in one coding agent
session: every failed hour adds upstream commits to the next attempt, so a fixed
time limit can never catch up. Each step merges the furthest commit on upstream
main's first-parent chain whose merge stays within the conflict and review-file
limits. ``git merge-tree --write-tree`` measures a trial merge in a fraction of a
second without touching the working tree. A single first-parent commit is never
split, so one commit over the limits is still one step.

Upstream lands a pull request's commits together with one committer timestamp,
and its CI checks only the last of them; a commit inside such a batch can be a
state upstream never validated (one created a file with a stray blank line that a
later commit of the batch removed). Steps therefore end at the last commit of a
batch whenever one fits, and split a batch only when it alone is over the limits.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, replace
import re
import subprocess

# Files with no user-facing copy for the agent to review: tests and catalog data.
UNREVIEWED = re.compile(
    r"(?:^|/)(?:tests|tests-js|__snapshots__)/|\.(?:test|spec)\.[cm]?[jt]sx?$|^(?:contributors|plugin-catalog)/"
)


@dataclass(frozen=True)
class Step:
    commit: str
    commits: int
    conflicts: int
    files: int
    batch_end: bool = True

    def describe(self) -> str:
        inside = "" if self.batch_end else ", inside an upstream batch"
        return (f"{self.commits} upstream commit(s), {self.conflicts} conflicted file(s), "
                f"{self.files} file(s) to review{inside}")

    def record(self) -> dict:
        return asdict(self)


def _git(*args: str, check: bool = True) -> str:
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", *args], capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=300, check=check,
    ).stdout


def measure(head: str, commit: str) -> Step:
    """Size of merging ``commit`` into ``head``, without touching the working tree."""
    result = subprocess.run(
        ["git", "merge-tree", "--write-tree", "--name-only", "--no-messages", "-z", head, commit],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300, check=False,
    )
    if result.returncode not in (0, 1):
        raise RuntimeError("git merge-tree could not measure an upstream step")
    # Output: the merged tree's ID, then one NUL-terminated name per conflicted file.
    conflicts = [name for name in result.stdout.split("\0")[1:] if name]
    base = _git("merge-base", head, commit).strip()
    files = [name for name in _git("diff", "--name-only", "-z", base, commit).split("\0")
             if name and not UNREVIEWED.search(name)]
    commits = int(_git("rev-list", "--count", f"{base}..{commit}"))
    return Step(commit, commits, len(conflicts), len(files))


def furthest(head: str, tip: str, max_conflicts: int, max_files: int) -> Step:
    """The furthest first-parent commit toward ``tip`` that one step may merge."""
    base = _git("merge-base", head, tip).strip()
    rows = [line.split() for line in _git("log", "--first-parent", "--reverse", "--format=%H %ct",
                                          f"{base}..{tip}").splitlines()]
    if not rows:
        raise ValueError("upstream has nothing left to merge")
    chain = [commit for commit, _ in rows]
    tips = [index for index in range(len(rows)) if index == len(rows) - 1 or rows[index][1] != rows[index + 1][1]]
    measured: dict[int, Step] = {}

    def fits(index: int) -> bool:
        if index not in measured:
            measured[index] = measure(head, chain[index])
        step = measured[index]
        return step.conflicts <= max_conflicts and step.files <= max_files

    reached = _last_fitting(tips, fits)
    if reached is not None:
        return measured[reached]
    # The first batch alone is over the limits: end inside it, one commit at least.
    reached = _last_fitting(list(range(tips[0] + 1)), fits)
    index = 0 if reached is None else reached
    return replace(measured[index], batch_end=index in tips)


def _last_fitting(indices: list[int], fits) -> int | None:
    """The last of ``indices`` that fits, assuming a fitting index only follows fitting ones."""
    if fits(indices[-1]):
        return indices[-1]
    if not fits(indices[0]):
        return None
    # Gallop to the first position over the limits, then bisect back to the last one within them.
    good, probe = 0, 1
    while probe < len(indices) - 1 and fits(indices[probe]):
        good, probe = probe, probe * 2
    bad = min(probe, len(indices) - 1)
    while bad - good > 1:
        middle = (good + bad) // 2
        if fits(indices[middle]):
            good = middle
        else:
            bad = middle
    return indices[good]
