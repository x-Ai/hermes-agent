"""The Docker / Podman probe's needs-setup texts are the Desktop's localization keys.

The dashboard router reports each probe outcome as English prose, and the Desktop's
Chinese catalogs (``apps/desktop/src/i18n/zh_terminal_backend.ts`` and its zh-hant twin)
match that prose verbatim to render it localized. A reworded outcome does not break
anything visibly: the Settings panel silently falls back to English. So every outcome
is pinned here; when a case fails, port the new wording to both catalogs.
"""

from __future__ import annotations

import subprocess

import pytest

from hermes_cli.web_routers import tools as tools_mod
from tools.environments import docker as docker_mod
from tools.environments import remote_common


@pytest.fixture(autouse=True)
def _no_host_runtime(monkeypatch):
    """Neither a cached nor a host-installed container CLI may leak into the probe."""
    docker_mod._docker_executable = None
    monkeypatch.delenv("HERMES_DOCKER_BINARY", raising=False)
    monkeypatch.setattr(docker_mod.shutil, "which", lambda name: None)
    monkeypatch.setattr(docker_mod, "_DOCKER_SEARCH_PATHS", [])
    yield
    docker_mod._docker_executable = None


def _install_fake_cli(tmp_path, monkeypatch, name: str) -> None:
    fake = tmp_path / name
    fake.write_text("#!/bin/sh\nexit 0\n")
    fake.chmod(0o755)
    monkeypatch.setenv("HERMES_DOCKER_BINARY", str(fake))


def test_missing_cli_outcome():
    assert tools_mod._probe_docker_backend({}) == (
        "needs_setup",
        "Docker CLI not found — install Docker Desktop, docker-ce, or Podman.",
    )


@pytest.mark.parametrize(
    ("cli", "expected"),
    [
        ("docker", "Docker not reachable — start Docker and retry."),
        ("podman", "Podman not reachable — run `podman machine start` and retry."),
    ],
)
def test_unreachable_runtime_outcome(tmp_path, monkeypatch, cli, expected):
    _install_fake_cli(tmp_path, monkeypatch, cli)
    monkeypatch.setattr(
        remote_common, "run_capture",
        lambda argv, **kwargs: subprocess.CompletedProcess(argv, 1, stdout="", stderr=""),
    )

    assert tools_mod._probe_docker_backend({}) == ("needs_setup", expected)


@pytest.mark.parametrize(
    ("cli", "expected"),
    [
        ("docker", "Docker not responding (timed out)."),
        ("podman", "Podman not responding (timed out)."),
    ],
)
def test_timed_out_runtime_outcome(tmp_path, monkeypatch, cli, expected):
    _install_fake_cli(tmp_path, monkeypatch, cli)

    def _hang(argv, **kwargs):
        raise subprocess.TimeoutExpired(argv, 2)

    monkeypatch.setattr(remote_common, "run_capture", _hang)

    assert tools_mod._probe_docker_backend({}) == ("needs_setup", expected)
