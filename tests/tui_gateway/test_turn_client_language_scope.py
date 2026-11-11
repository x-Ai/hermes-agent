"""A prompt turn binds two things on its own thread: the session's profile state (home, secrets and
terminal policy, held as ONE runtime-scope bind) and the display language the session's client
announced. Both outlive the turn's approval / session-context scopes, so post-turn housekeeping
still runs under the session's own profile and renders in its client's language, and both are
released at the end of housekeeping, leaving nothing bound on the thread."""

from __future__ import annotations

import pytest

from agent import i18n
from agent.secret_scope import get_secret
from hermes_constants import get_hermes_home_override
from hermes_scope import current_scope
from tui_gateway import server

KEY = "core.failed_turn.notice"


class _StopAfterBind(Exception):
    pass


@pytest.fixture(autouse=True)
def english_profile(monkeypatch):
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    monkeypatch.delenv("TURN_SCOPE_ONLY_SECONDARY", raising=False)
    monkeypatch.setattr("agent.secret_scope._MULTIPLEX_ACTIVE", False)
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


def _secondary(tmp_path, monkeypatch):
    home = tmp_path / "profiles" / "secondary"
    home.mkdir(parents=True)
    (home / "config.yaml").write_text("{}\n", encoding="utf-8")
    monkeypatch.setattr(
        "agent.secret_scope.build_profile_secret_scope",
        lambda h: {"TURN_SCOPE_ONLY_SECONDARY": "secondary-value"} if str(h) == str(home) else {})
    return home


def _admit(monkeypatch, session):
    """Real turn admission up to the callback wiring, i.e. after every scope the turn binds."""
    def stop(*_a):
        raise _StopAfterBind()

    monkeypatch.setattr(server, "_wire_callbacks", stop)
    st = server._TurnRun(agent=None, one_turn_restore=None, terminal_callback=None, receipt_committed=False)
    with pytest.raises(_StopAfterBind):
        server._prepare_turn_input("turn-sid", session, st, "hello", [])
    return st


def _assert_turn_bound(home):
    assert get_hermes_home_override() == str(home)
    assert get_secret("TURN_SCOPE_ONLY_SECONDARY") == "secondary-value"
    assert i18n.t(KEY) == i18n.t(KEY, lang="zh") != i18n.t(KEY, lang="en")


def test_profile_scope_and_client_language_last_through_housekeeping(tmp_path, monkeypatch):
    home = _secondary(tmp_path, monkeypatch)
    session = {"session_key": "turn-key", "profile_home": str(home), "client_locale": "zh"}
    assert current_scope() is None

    st = _admit(monkeypatch, session)
    _assert_turn_bound(home)

    server._release_turn_scopes("turn-sid", session, st)
    _assert_turn_bound(home)  # housekeeping runs under the session's profile and its client's language

    monkeypatch.setattr(server, "_sessions_quiescent", lambda exclude=None: False)
    server._post_turn_housekeeping("turn-sid", session, st)
    assert current_scope() is None
    assert get_hermes_home_override() is None
    assert get_secret("TURN_SCOPE_ONLY_SECONDARY") is None
    assert i18n.t(KEY) == i18n.t(KEY, lang="en")


def test_a_session_without_a_claim_renders_in_the_profiles_language(tmp_path, monkeypatch):
    home = _secondary(tmp_path, monkeypatch)
    session = {"session_key": "turn-key", "profile_home": str(home)}

    st = _admit(monkeypatch, session)
    try:
        assert get_hermes_home_override() == str(home)
        assert i18n.t(KEY) == i18n.t(KEY, lang="en")
    finally:
        server._release_turn_scopes("turn-sid", session, st)
        monkeypatch.setattr(server, "_sessions_quiescent", lambda exclude=None: False)
        server._post_turn_housekeeping("turn-sid", session, st)
    assert current_scope() is None
