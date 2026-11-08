"""Find test cases a merge result dropped.

A merge must keep every test case a 3-way merge of the test names keeps: one the
fork or upstream added, and one both sides still have. A test only one side
deleted is gone on purpose. Counts are compared by name across all checked
files of one kind, so a test that moved to another file with its rename still
counts as kept.
"""
from __future__ import annotations

from collections import Counter
import re
from typing import Callable

PYTHON_CASE = re.compile(r"^[ \t]*(?:async[ \t]+)?def[ \t]+(test\w*)[ \t]*\(", re.MULTILINE)
SCRIPT_CASE = re.compile(
    r"(?<![\w.$])(?:it|test)(?:\.(?:only|skip|todo|fails|concurrent|sequential))*"
    r"[ \t]*\([ \t\r\n]*(['\"`])((?:\\.|(?!\1)[^\\])*)\1"
)
SCRIPT_FILE = re.compile(r"\.(?:test|spec)\.[cm]?[jt]sx?$")
# Formatters swap quote styles ('it\'s' and "it's" are one title), so compare unescaped text.
ESCAPE = re.compile(r"\\(.)", re.DOTALL)


def kind(path: str) -> str | None:
    name = path.rpartition("/")[2]
    if path.startswith("tests/") and name.startswith("test_") and name.endswith(".py"):
        return "python"
    if SCRIPT_FILE.search(name):
        return "script"
    return None


def cases(path: str, text: str | None) -> Counter:
    if not text:
        return Counter()
    if kind(path) == "python":
        return Counter(PYTHON_CASE.findall(text))
    return Counter(ESCAPE.sub(r"\1", title) for _, title in SCRIPT_CASE.findall(text))


def dropped(paths: list[str], read: Callable[[str, str], str | None],
            fork: str, upstream: str, base: str, result: str) -> dict[str, list[str]]:
    """Files whose test cases the merge result lost, mapped to the lost names.

    ``read(revision, path)`` returns a file's text at a revision, None when absent.
    """
    expected: dict[str, Counter] = {}
    kept: dict[str, Counter] = {}
    losses: list[tuple[str, str, Counter]] = []
    for path in sorted({path for path in paths if kind(path)}):
        group = kind(path)
        mine, theirs, common = (cases(path, read(revision, path)) for revision in (fork, upstream, base))
        merged = cases(path, read(result, path))
        want = Counter({name: min(max(mine[name], theirs[name]), mine[name] + theirs[name] - common[name])
                        for name in mine.keys() | theirs.keys()})
        expected.setdefault(group, Counter()).update(+want)
        kept.setdefault(group, Counter()).update(merged)
        losses.append((group, path, +want - merged))
    short = {group: expected[group] - kept[group] for group in expected}
    report: dict[str, list[str]] = {}
    for group, path, lost in losses:
        names = sorted(name for name in lost if short[group][name])
        if names:
            report[path] = names
    return report
