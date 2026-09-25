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
