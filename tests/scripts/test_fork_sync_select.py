"""Validation runs the Python tests a fork-sync merge can affect, sharded to fit the runner."""
from __future__ import annotations

import importlib.util
from pathlib import Path
import subprocess
import sys

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"
SETTINGS = {"full_suite": ["uv.lock"], "tests_per_shard": 2, "max_shards": 3}

TREE = {
    "pkg/__init__.py": "",
    "pkg/core.py": "def answer():\n    return 42\n",
    "pkg/other.py": "def other():\n    return 1\n",
    "pkg/feature.py": "def feature():\n    return 1\n",
    "locales/en.yaml": "greeting: hi\n",
    "docker/type": "longrun\n",
    "uv.lock": "version = 1\n",
    "tests/__init__.py": "",
    "tests/conftest.py": "",
    "tests/helpers.py": "from pkg.core import answer\n",
    "tests/test_core.py": "from pkg import core\n\n\ndef test_core():\n    assert core.answer() == 42\n",
    "tests/test_other.py": "from pkg.other import other\n\n\ndef test_other():\n    assert other() == 1\n",
    "tests/test_feature.py": "from pkg.feature import feature\n\n\ndef test_feature():\n    assert feature()\n",
    "tests/test_helper_user.py": "from tests.helpers import answer\n\n\ndef test_answer():\n    assert answer\n",
    "tests/test_patch.py": (
        "from unittest import mock\n\n\ndef test_patch():\n"
        "    with mock.patch(\"pkg.other.other\"):\n        pass\n"
    ),
    "tests/test_locales.py": (
        "from pathlib import Path\n\nROOT = Path(__file__).parents[1] / \"locales\"\n\n\n"
        "def test_catalogs():\n    assert list(ROOT.glob(\"*.yaml\"))\n"
    ),
    "tests/test_words.py": "def test_words():\n    assert {\"type\": \"docker\"}\n",
    "tests/e2e/test_slow.py": "from pkg import core\n\n\ndef test_slow():\n    assert core\n",
}


@pytest.fixture
def selector(monkeypatch):
    spec = importlib.util.spec_from_file_location("fork_sync_select_test", CONTROLLER / "select_tests.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


def git(root, *args):
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "-c", "user.name=Test",
         "-c", "user.email=test@example.com", *args], cwd=root,
        check=True, capture_output=True, text=True, encoding="utf-8",
    ).stdout.strip()


def change(root, files, removed=()):
    for name, text in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    for name in removed:
        (root / name).unlink()
    git(root, "add", "--all")
    git(root, "commit", "-qm", "change")
    return git(root, "rev-parse", "HEAD")


@pytest.fixture
def repo(tmp_path):
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    return root, change(root, TREE)


def selected(selector, root, base, upstream=None):
    candidate = git(root, "rev-parse", "HEAD")
    return selector.plan(root, base, candidate, upstream or candidate, SETTINGS)


def test_changed_module_selects_tests_that_import_or_patch_it(selector, repo):
    root, base = repo
    change(root, {"pkg/other.py": "def other():\n    return 2\n"})
    result = selected(selector, root, base)
    assert result["mode"] == "selected"
    assert result["files"] == ["tests/test_other.py", "tests/test_patch.py"]


def test_helpers_count_as_part_of_the_tests_that_import_them(selector, repo):
    root, base = repo
    change(root, {"pkg/core.py": "def answer():\n    return 41 + 1\n"})
    # tests/e2e has its own lane; pkg/feature.py does not use pkg.core.
    assert selected(selector, root, base)["files"] == ["tests/test_core.py", "tests/test_helper_user.py"]


def test_fork_written_lines_pull_in_tests_of_the_fork_module(selector, repo):
    root, _ = repo
    git(root, "switch", "-qc", "upstream")
    upstream = change(root, {"pkg/core.py": "def answer(scale=1):\n    return 42 * scale\n"})
    git(root, "switch", "-q", "main")
    fork = change(root, {
        "pkg/feature.py": "from pkg.core import answer\n\n\ndef feature():\n    return answer()\n",
        "pkg/other.py": "def other():\n    return 1  # fork tweak\n",
    })
    git(root, "merge", "-q", "--no-edit", upstream)
    files = selected(selector, root, fork, upstream)["files"]
    assert "tests/test_feature.py" in files
    assert "tests/test_other.py" not in files and "tests/test_patch.py" not in files


def test_conftest_fans_out_test_helpers_but_not_product_modules(selector, repo):
    root, _ = repo
    after_conftest = change(root, {"tests/conftest.py": "from tests import helpers  # noqa: F401\n"})
    change(root, {"pkg/core.py": "def answer():\n    return 6 * 7\n"})
    assert selected(selector, root, after_conftest)["files"] == [
        "tests/test_core.py", "tests/test_helper_user.py",
    ]
    before_helper = git(root, "rev-parse", "HEAD")
    change(root, {"tests/helpers.py": "from pkg.core import answer  # noqa: F401\n"})
    everything = sorted(name for name in TREE if name.startswith("tests/test_"))
    assert selected(selector, root, before_helper)["files"] == everything


def test_data_file_selects_tests_naming_its_directory_and_pattern(selector, repo):
    root, base = repo
    change(root, {"locales/en.yaml": "greeting: hello\n", "docker/type": "oneshot\n"})
    # "docker" and "type" are only words in test_words.py, not a reference to docker/type.
    assert selected(selector, root, base)["files"] == ["tests/test_locales.py"]


def test_deleted_module_selects_tests_still_importing_it(selector, repo):
    root, base = repo
    change(root, {}, removed=["pkg/other.py"])
    assert selected(selector, root, base)["files"] == ["tests/test_other.py", "tests/test_patch.py"]


def test_dependency_lock_selects_every_test_in_capped_shards(selector, repo):
    root, base = repo
    change(root, {"uv.lock": "version = 2\n"})
    result = selected(selector, root, base)
    assert result["mode"] == "full"
    assert result["files"] == sorted(name for name in TREE if name.startswith("tests/test_"))
    assert result["weight"] == len(result["files"])
    assert result["shards"] == SETTINGS["max_shards"]


def test_frontend_only_change_needs_no_python_shard(selector, repo):
    root, base = repo
    change(root, {"web/src/App.tsx": "export const App = () => null\n"})
    result = selected(selector, root, base)
    assert result["files"] == [] and result["shards"] == 0
