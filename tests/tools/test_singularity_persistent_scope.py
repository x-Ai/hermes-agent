"""Persistent Singularity sandboxes are profile-scoped, like persistent Docker containers.

A persistent instance is adopted by name across processes and survives ``cleanup()`` exactly like
a persistent Docker container. Keying it per session — what every Desktop / gateway session
carries — therefore left one running instance behind per session, with nothing that ever stopped
them. Docker already collapses persistent sandboxes onto the profile; this pins the same contract
for Singularity.
"""

import pytest

from gateway.session_context import clear_session_vars, set_session_vars
import tools.terminal_tool as tt


@pytest.fixture(autouse=True)
def persistent_singularity(monkeypatch):
    monkeypatch.setenv("TERMINAL_ENV", "singularity")
    monkeypatch.setenv("TERMINAL_CONTAINER_PERSISTENT", "true")
    monkeypatch.delenv("TERMINAL_DOCKER_SHARED_CONTAINER_KEY", raising=False)


def _key_for_session(session_key: str, **session_vars) -> str:
    tokens = set_session_vars(session_key=session_key, **session_vars)
    try:
        return tt._resolve_container_task_id(session_key)
    finally:
        clear_session_vars(tokens)


def test_persistent_sessions_share_the_profile_instance():
    assert _key_for_session("desktop-a") == _key_for_session("desktop-b") == "default"


def test_named_profile_sessions_share_that_profiles_instance():
    assert _key_for_session("desktop-a", profile="work") == "profile:work"


def test_ephemeral_sessions_keep_their_own_instance(monkeypatch):
    monkeypatch.setenv("TERMINAL_CONTAINER_PERSISTENT", "false")
    assert _key_for_session("desktop-a") != _key_for_session("desktop-b")


def test_ssh_sessions_keep_their_own_environment(monkeypatch):
    """Profile scoping is for sandboxes adopted by name; one SSH environment per session stays."""
    monkeypatch.setenv("TERMINAL_ENV", "ssh")
    assert _key_for_session("desktop-a") != _key_for_session("desktop-b")
