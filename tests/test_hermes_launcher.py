"""Behavior contract for the checkout-local ``hermes`` executable."""

import shutil
import subprocess
import sys
from pathlib import Path

import pytest


@pytest.mark.platforms("macos")
def test_direct_launcher_reexecs_the_adjacent_managed_python(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    launcher = tmp_path / "hermes"
    shutil.copy2(repo_root / "hermes", launcher)

    managed_python = tmp_path / "venv" / "bin" / "python"
    managed_python.parent.mkdir(parents=True)
    probe = tmp_path / "probe.txt"
    managed_python.write_text(
        f'#!/bin/sh\nprintf "%s\\n" "$0" "$1" "$2" > "{probe}"\n',
        encoding="utf-8",
    )
    managed_python.chmod(0o755)

    completed = subprocess.run(
        [sys.executable, str(launcher), "doctor"],
        check=False,
        capture_output=True,
        text=True,
    )

    assert completed.returncode == 0, completed.stderr
    invoked_as, script, argument = probe.read_text(encoding="utf-8").splitlines()
    assert Path(invoked_as).resolve() == managed_python.resolve()
    assert Path(script).resolve() == launcher.resolve()
    assert argument == "doctor"


def _load_launcher():
    import importlib.machinery
    import importlib.util

    path = Path(__file__).resolve().parents[1] / "hermes"
    loader = importlib.machinery.SourceFileLoader("hermes_launcher_under_test", str(path))
    spec = importlib.util.spec_from_loader(loader.name, loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


def _stub_python(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("#!/bin/sh\nexit 0\n", encoding="utf-8")
    path.chmod(0o755)
    return path


@pytest.mark.platforms("posix")
class TestManagedPythonTarget:
    """Hand-off decision: never loop, honor HERMES_PYTHON, stay inside a managed interpreter."""

    def test_external_interpreter_hands_off_to_the_first_existing_candidate(self, tmp_path):
        launcher = _load_launcher()
        venv_python = _stub_python(tmp_path / "venv" / "bin" / "python")
        _stub_python(tmp_path / ".venv" / "bin" / "python")
        target = launcher._managed_python_target(str(tmp_path / "elsewhere" / "python3"), tmp_path, {})
        assert target == venv_python

    def test_two_adjacent_environments_never_ping_pong(self, tmp_path):
        launcher = _load_launcher()
        venv_python = _stub_python(tmp_path / "venv" / "bin" / "python")
        dot_venv_python = _stub_python(tmp_path / ".venv" / "bin" / "python")
        # Already running inside either managed environment: stay put even though the other exists.
        assert launcher._managed_python_target(str(venv_python), tmp_path, {}) is None
        assert launcher._managed_python_target(str(dot_venv_python), tmp_path, {}) is None
        # And a launcher that already handed off once never hands off again.
        marker = {launcher._REEXEC_MARKER: "1"}
        assert launcher._managed_python_target(str(tmp_path / "other" / "python3"), tmp_path, marker) is None

    def test_symlinked_venv_python_counts_as_managed(self, tmp_path):
        launcher = _load_launcher()
        base = _stub_python(tmp_path / "base" / "python3")
        venv_bin = tmp_path / "venv" / "bin"
        venv_bin.mkdir(parents=True)
        (venv_bin / "python").symlink_to(base)
        # Launched through the venv's symlink (resolves to the base interpreter): no hand-off.
        assert launcher._managed_python_target(str(venv_bin / "python"), tmp_path, {}) is None
        # Launched by the base interpreter directly: hand off to the venv once.
        assert launcher._managed_python_target(str(base), tmp_path, {}) == venv_bin / "python"

    def test_hermes_python_is_honored_once(self, tmp_path):
        launcher = _load_launcher()
        _stub_python(tmp_path / "venv" / "bin" / "python")
        explicit = _stub_python(tmp_path / "explicit" / "python3")
        env = {"HERMES_PYTHON": str(explicit)}
        assert launcher._managed_python_target(str(tmp_path / "other" / "python3"), tmp_path, env) == explicit
        # The child is already that interpreter: nothing further, even with candidates present.
        assert launcher._managed_python_target(str(explicit), tmp_path, env) is None
        # An unusable HERMES_PYTHON is ignored rather than exec'd.
        assert launcher._managed_python_target(
            str(explicit), tmp_path, {"HERMES_PYTHON": str(tmp_path / "missing")}) is None
