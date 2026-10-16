"""Fork: a "session not found" answer names its verdict by reason (``data.reason == "not_found"``), the
canonical owner's vocabulary, beside whichever historical code the method keeps. The Desktop's room
engine classifies a missing member session by that reason alone (``group-session-errors.ts``)."""

from __future__ import annotations

import pytest

from tui_gateway import server


class _EmptyDB:
    """The launch profile's store with no rows: every lookup misses."""

    db_path = None

    def get_session(self, _target):
        return None

    def get_session_by_title(self, _target):
        return None

    def resolve_resume_session_id(self, target):
        return target

    def close(self):
        return None


@pytest.fixture()
def hermetic(monkeypatch, tmp_path):
    monkeypatch.setattr(server, "_get_db", lambda: _EmptyDB())
    monkeypatch.setattr(server, "_profile_home", lambda profile: None)
    monkeypatch.setattr(server, "_profile_configured_cwd", lambda _home: str(tmp_path))
    monkeypatch.setattr(server, "_enable_gateway_prompts", lambda: None)
    monkeypatch.setattr(server, "_find_live_session_by_key", lambda _key, *_a: None)
    monkeypatch.setattr(server, "_schedule_agent_build", lambda *a, **k: None)
    monkeypatch.setattr(server, "_schedule_session_cap_enforcement", lambda *a, **k: None)
    monkeypatch.setattr(server, "_maybe_schedule_auto_continue", lambda *a, **k: None)
    monkeypatch.setattr(server, "_default_session_cwd", lambda *a, **k: str(tmp_path))


def _call(method, **params):
    return server.handle_request({"id": "1", "method": method, "params": params})


def test_resume_of_an_unknown_session_names_the_reason_beside_its_code(hermetic):
    error = _call("session.resume", session_id="missing")["error"]
    assert error["code"] == 4007  # the resume family's historical code, unchanged for older clients
    assert error["data"] == {"reason": server.SESSION_NOT_FOUND_REASON} == {"reason": "not_found"}


def test_a_stale_runtime_id_is_refused_with_the_same_reason(hermetic):
    # ``_sess_nowait``: the runtime id is not in memory (reaped / evicted); the client resumes the stored id.
    error = _call("session.usage", session_id="rt-gone")["error"]
    assert error["code"] == 4001  # the registry's historical code, unchanged for older clients
    assert error["data"] == {"reason": "not_found"}
