#!/usr/bin/env python3
"""Choose the Python test files a fork-sync candidate has to pass.

The whole suite needs about three hours on a 4-vCPU hosted runner. The fork main
a candidate is built on already passed validation, and upstream's CI ran
upstream's suite on upstream's code, so a test can change outcome only when the
merge changed something it exercises. Validation runs:

* every changed test file;
* tests that reference a changed file directly: an import (including the lazy
  function-level imports of the facade/sibling layout), a dotted string naming a
  module (patch targets, ``import_module``), or a string naming the file by path,
  by a basename at most three files share, or by name or pattern under a
  directory the test also names (``"locales"`` + ``".yaml"``). Helper modules
  under tests/ count as part of the tests that import them;
* tests of a fork-owned module whose fork-written lines use a changed file:
  upstream never ran its change against the fork's own code. Only the lines that
  differ from upstream count, so a module the fork touched for one feature does
  not pull in its tests for every upstream change;
* every test under a conftest.py that changed or that loads a changed test
  helper. A product module reached through a conftest does not fan out.

The full import closure is no bound at all: lazy imports connect nearly every
module, so it selects the whole suite for any change. Dependency locks and the
other ``full_suite`` paths in config.json select every test.
"""
from __future__ import annotations

import argparse
import ast
from collections import Counter, defaultdict, deque
from fnmatch import fnmatchcase
import json
import math
from pathlib import Path
import re
import subprocess
import sys

# Mirrors _SKIP_PARTS in scripts/run_tests_parallel.py: these suites have their own lanes.
SKIP_PARTS = frozenset({"integration", "e2e", "docker"})
# A basename more files share only counts next to a directory the referrer names.
BASENAME_LIMIT = 3
DOTTED = re.compile(r"[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+")
WORD = re.compile(r"[A-Za-z_]\w*")
IMPORT_LINE = re.compile(
    r"^[ \t]*(?:from[ \t]+(\.*[\w.]*)[ \t]+import[ \t]+\(?([\w \t,.*]+)|import[ \t]+([\w \t,.]+))",
    re.MULTILINE,
)
QUOTED = re.compile(r"'([^'\\\n]{1,255})'|\"([^\"\\\n]{1,255})\"")


def git(root: Path, *args: str) -> list[str]:
    result = subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "-C", str(root), *args],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300, check=True,
    )
    return [line for line in result.stdout.splitlines() if line]


def is_test(path: str) -> bool:
    parts = path.split("/")
    return (parts[0] == "tests" and parts[-1].startswith("test_") and parts[-1].endswith(".py")
            and SKIP_PARTS.isdisjoint(parts[1:-1]))


def is_helper(path: str) -> bool:
    name = path.rpartition("/")[2]
    return (path.startswith("tests/") and path.endswith(".py")
            and not name.startswith("test_") and name != "conftest.py")


def module_of(path: str) -> str:
    stem = path[: -len(".py")]
    if stem == "__init__" or stem.endswith("/__init__"):
        stem = stem[: -len("__init__")].rstrip("/")
    return stem.replace("/", ".")


def package_of(path: str) -> str:
    return module_of(path) if path.endswith("__init__.py") else module_of(path).rpartition(".")[0]


def absolute(module: str | None, level: int, package: str) -> str | None:
    """Resolve a (possibly relative) ``from`` import; None when it escapes the tree."""
    if not level:
        return module
    parts = package.split(".") if package else []
    if level - 1 > len(parts):
        return None
    parts = parts[: len(parts) - level + 1]
    if module:
        parts.append(module)
    return ".".join(parts)


def scan(path: str, text: str) -> tuple[set[str], set[str], dict[str, set[str]]]:
    """Imported module names, short string constants and the names imports bind."""
    package = package_of(path)
    try:
        tree = ast.parse(text, filename=path)
    except (SyntaxError, ValueError):
        return scan_text(text, package)
    imports: set[str] = set()
    strings: set[str] = set()
    bound: dict[str, set[str]] = defaultdict(set)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name)
                bound[alias.asname or alias.name.partition(".")[0]].add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            base = absolute(node.module, node.level, package)
            if base is not None:
                bind_from(base, [(alias.name, alias.asname) for alias in node.names], imports, bound)
        elif isinstance(node, ast.Constant) and isinstance(node.value, str) and short(node.value):
            strings.add(node.value)
    return imports, strings, bound


def scan_text(text: str, package: str) -> tuple[set[str], set[str], dict[str, set[str]]]:
    """Line-based scan for code this interpreter cannot parse, or a diff's lines."""
    imports: set[str] = set()
    bound: dict[str, set[str]] = defaultdict(set)
    for source, names, plain in IMPORT_LINE.findall(text):
        aliases = [part.split() for part in (plain or names).split(",") if part.split()]
        aliases = [(words[0], words[2] if len(words) == 3 and words[1] == "as" else None) for words in aliases]
        if plain:
            for name, alias in aliases:
                imports.add(name)
                bound[alias or name.partition(".")[0]].add(name)
            continue
        level = len(source) - len(source.lstrip("."))
        base = absolute(source.lstrip(".") or None, level, package)
        if base is not None:
            bind_from(base, aliases, imports, bound)
    strings = {single or double for single, double in QUOTED.findall(text) if short(single or double)}
    return imports, strings, bound


def bind_from(base: str, aliases: list[tuple[str, str | None]], imports: set[str],
              bound: dict[str, set[str]]) -> None:
    if base:
        imports.add(base)
    for name, alias in aliases:
        if name != "*":
            target = f"{base}.{name}" if base else name
            imports.add(target)
            bound[alias or name].add(target)


def short(value: str) -> bool:
    return 0 < len(value) <= 255 and not any(char.isspace() for char in value)


def names_file(strings: frozenset[str], name: str, patterns: bool) -> bool:
    """Whether strings name a file exactly or, with ``patterns``, by ``.suffix`` or glob."""
    if "." not in name:
        return False  # "run", "type": ordinary words, not evidence of a file
    if name in strings:
        return True
    if not patterns:
        return False
    for value in strings:
        tail = value.rpartition("/")[2]
        if len(tail) > 1 and tail.startswith(".") and name.endswith(tail):
            return True
        if "." in tail and any(char in tail for char in "*?[") and fnmatchcase(name, tail):
            return True
    return False


class Graph:
    """Direct references between the files of one tree."""

    def __init__(self, root: Path, tracked: list[str], gone: list[str] = ()):
        self.tracked = frozenset(tracked)
        self.paths = self.tracked.union(gone)
        self.modules: dict[str, str] = {}
        self.tails: dict[str, list[str]] = defaultdict(list)
        self.names: dict[str, list[str]] = defaultdict(list)
        self.endings: dict[str, list[str]] = defaultdict(list)
        self.dirs: set[str] = set()
        for path in sorted(self.paths):
            self._index(path)
        self.firstparty = {name.partition(".")[0] for name in self.modules}
        self.weights: dict[str, int] = {}
        self.mentions: dict[str, list[tuple[str, frozenset[str]]]] = defaultdict(list)
        self.users: dict[str, set[str]] = defaultdict(set)
        for path in sorted(self.tracked):
            if path.endswith(".py"):
                self._link(path, (root / path).read_text(encoding="utf-8-sig", errors="replace"))

    def _index(self, path: str) -> None:
        parts = path.split("/")
        self.names[parts[-1]].append(path)
        for i in range(1, len(parts)):
            self.dirs.add("/".join(parts[:i]))
            if i < len(parts) - 1:
                self.endings["/".join(parts[i:])].append(path)
        if path.endswith(".py"):
            name = module_of(path)
            self.modules.setdefault(name, path)
            pieces = name.split(".")
            for i in range(1, len(pieces)):
                self.tails[".".join(pieces[i:])].append(path)

    def _link(self, path: str, text: str) -> None:
        imports, strings, _ = scan(path, text)
        targets = self.targets(imports, strings)
        frozen = frozenset(strings)
        for value in strings:
            clean = value.removeprefix("./").strip("/")
            if clean in self.dirs:
                self.mentions[clean].append((path, frozen))
        if is_test(path):
            # The runner's own progress estimate.
            self.weights[path] = max(1, text.count("def test_"))
            # pytest runs every enclosing conftest.py and package __init__.py first.
            folder = path.rpartition("/")[0]
            while folder:
                targets.update(p for p in (f"{folder}/conftest.py", f"{folder}/__init__.py") if p in self.tracked)
                folder = folder.rpartition("/")[0]
        for target in targets - {path}:
            self.users[target].add(path)

    def targets(self, imports: set[str], strings: set[str]) -> set[str]:
        """Files that these imports and string constants refer to."""
        found: set[str] = set()
        for name in imports:
            found.update(self._module(name, guess=True))
        for value in strings:
            if DOTTED.fullmatch(value) and value.partition(".")[0] in self.firstparty:
                found.update(self._module(value, guess=False))
            found.update(self._file(value.removeprefix("./").strip("/")))
        return found

    def _module(self, name: str, guess: bool) -> list[str]:
        pieces = name.split(".")
        for size in range(len(pieces), 0, -1):
            hit = self.modules.get(".".join(pieces[:size]))
            if hit:
                parents = (self.modules.get(".".join(pieces[:i])) for i in range(1, size))
                return [hit, *filter(None, parents)]
        # A test that put a subdirectory on sys.path imports by a shorter name.
        if guess and pieces[0] not in sys.stdlib_module_names:
            for size in range(len(pieces), 0, -1):
                hits = self.tails.get(".".join(pieces[:size]))
                if hits:
                    return hits
        return []

    def _file(self, clean: str) -> list[str]:
        if clean in self.paths:
            return [clean]
        if "/" in clean:
            return self.endings.get(clean, [])
        hits = self.names.get(clean, [])
        return hits if "." in clean and len(hits) <= BASENAME_LIMIT else []

    def referrers(self, path: str) -> set[str]:
        """Files that import or name ``path``, including by name under a directory they name."""
        found = set(self.users.get(path, ()))
        name = path.rpartition("/")[2]
        patterns = not path.endswith(".py")
        folder = path.rpartition("/")[0]
        while folder:
            found.update(user for user, strings in self.mentions.get(folder, ())
                         if names_file(strings, name, patterns))
            folder = folder.rpartition("/")[0]
        found.discard(path)
        return found


def fork_uses(graph: Graph, root: Path, upstream: str, candidate: str) -> dict[str, set[str]]:
    """Files the fork-written lines of each fork-owned product module refer to."""
    added: dict[str, list[str]] = defaultdict(list)
    path = None
    for line in git(root, "diff", "-U0", "--no-renames", "--no-color", "--no-ext-diff",
                    "--src-prefix=a/", "--dst-prefix=b/", upstream, candidate, "--", "*.py"):
        if line.startswith("+++ "):
            path = line[len("+++ b/"):] if line.startswith("+++ b/") else None
        elif line.startswith("+") and path:
            added[path].append(line[1:])
    uses = {}
    for path, lines in sorted(added.items()):
        if path.startswith("tests/") or path not in graph.tracked:
            continue
        text = "\n".join(lines)
        _, _, bound = scan(path, (root / path).read_text(encoding="utf-8-sig", errors="replace"))
        imports, strings, _ = scan_text(text, package_of(path))
        imports.update(name for word in set(WORD.findall(text)) & bound.keys() for name in bound[word])
        uses[path] = graph.targets(imports, strings)
    return uses


def walk(graph: Graph, seeds: dict[str, str], chosen: dict[str, str], through) -> None:
    """Record every test reachable from ``seeds`` through files ``through`` accepts."""
    reason = dict(seeds)
    queue = deque(sorted(seeds))
    while queue:
        node = queue.popleft()
        for user in sorted(graph.referrers(node)):
            if is_test(user) and user in graph.tracked:
                chosen.setdefault(user, reason[node])
            elif user not in reason and through(user):
                reason[user] = reason[node]
                queue.append(user)


def select(graph: Graph, changed: set[str], uses: dict[str, set[str]]) -> dict[str, str]:
    """Map each selected test file to the change that selects it."""
    chosen = {path: path for path in sorted(changed) if is_test(path) and path in graph.tracked}
    seeds = {path: path for path in sorted(changed)}
    for path, targets in sorted(uses.items()):
        hits = sorted(targets & changed)
        if hits:
            seeds.setdefault(path, f"{hits[0]} (fork code in {path})")
    walk(graph, seeds, chosen, is_helper)
    local = {path: path for path in sorted(changed) if path.startswith("tests/")}
    walk(graph, local, chosen, lambda path: is_helper(path) or path.endswith("conftest.py"))
    return chosen


def plan(root: Path, base: str, candidate: str, upstream: str, settings: dict) -> dict:
    """Pick the candidate's test files and split them into shards; reads the working tree."""
    changed = set(git(root, "diff", "--name-only", "--no-renames", base, candidate))
    tracked = git(root, "ls-tree", "-r", "--name-only", candidate)
    graph = Graph(root, tracked, sorted(changed.difference(tracked)))
    full = sorted(changed.intersection(settings["full_suite"]))
    if full:
        chosen = dict.fromkeys(graph.weights, full[0])
    else:
        chosen = select(graph, changed, fork_uses(graph, root, upstream, candidate))
    weight = sum(graph.weights[path] for path in chosen)
    return {
        "mode": "full" if full else "selected",
        "files": sorted(chosen),
        "weight": weight,
        "total": sum(graph.weights.values()),
        "shards": min(settings["max_shards"], len(chosen), math.ceil(weight / settings["tests_per_shard"])),
        "reasons": Counter(chosen.values()).most_common(),
        "changed": len(changed),
    }


def describe(result: dict) -> str:
    lines = [f"Python tests: {result['mode']}, {len(result['files'])} files, about "
             f"{result['weight']} of {result['total']} tests, {result['shards']} shard(s); "
             f"{result['changed']} changed files"]
    lines += [f"  {count:5d} via {reason}" for reason, count in result["reasons"][:15]]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base", required=True, help="tested fork main the candidate was built on")
    parser.add_argument("--upstream", required=True, help="upstream commit the candidate merged")
    parser.add_argument("--list", action="store_true", help="also print the selected test files")
    args = parser.parse_args()
    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel")[0])
    settings = json.loads((Path(__file__).resolve().parent / "config.json").read_text(encoding="utf-8-sig"))
    base, upstream, candidate = (git(root, "rev-parse", ref)[0] for ref in (args.base, args.upstream, "HEAD"))
    result = plan(root, base, candidate, upstream, settings["tests"])
    print(describe(result))
    if args.list:
        print("\n".join(result["files"]))


if __name__ == "__main__":
    main()
