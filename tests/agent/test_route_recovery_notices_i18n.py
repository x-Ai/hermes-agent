"""Route-rejection recovery notices render in the language the connected client announced.

The reasoning-rejection repairs, the Codex encrypted-replay strip and the empty-keepalive streaming
fallback are route verdicts ("until the route changes" / "on this route"); their user-facing notices
come from the ``core.reasoning_recovery`` / ``core.streaming`` catalog keys, so a Chinese client sees
Chinese copy with the model, effort and counts still interpolated.
"""
from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from agent.error_classifier import FailoverReason, classify_api_error
from agent.i18n import bind_client_language, reset_client_language, t
from agent.turn_retry_state import TurnRetryState

_REVERSED_400 = "reasoning_effort 'none' unsupported; use minimal|low|medium|high|xhigh"
# #100536: a structured 400 refusing the reasoning LEVEL of an enabled config.
_LEVEL_400 = (
    "Error code: 400 - {'error': {'param': 'reasoning.effort', "
    "'error_code': 'invalid_reasoning_effort', 'retryable': False}}"
)


@pytest.fixture
def client_language():
    tokens = []

    def bind(lang: str) -> None:
        tokens.append(bind_client_language(lang))

    yield bind
    for token in reversed(tokens):
        reset_client_language(token)


class _ApiError(Exception):
    def __init__(self, message: str):
        super().__init__(f"Error code: 400 - {{'error': {{'message': {message!r}}}}}")
        self.status_code = 400
        self.message = message
        self.body = {"error": {"message": message, "type": "invalid_request_error"}}


class _Agent:
    log_prefix = ""
    provider = "custom"
    model = "chat-only"
    base_url = "http://relay.example/v1"
    api_mode = "chat_completions"
    _credential_pool = None
    _fallback_chain = [object()]
    _fallback_index = 0

    def __init__(self, sent=None):
        self.notices: list[str] = []
        self._wire_reasoning_config = sent
        self._reasoning_disable_rejected = False
        self._reasoning_effort_rejected = False
        self._reasoning_floor_required = False

    def _vprint(self, line, **kwargs):
        self.notices.append(line)

    def _recover_with_credential_pool(self, **kwargs):
        return False, False

    def __getattr__(self, name):
        return lambda *args, **kwargs: None


def _recover(agent: _Agent, message: str) -> None:
    from agent.turn_recovery import recover_after_classification

    err = _ApiError(message)
    classified = classify_api_error(err, provider=agent.provider, model=agent.model)
    assert classified.reason == FailoverReason.reasoning_mandatory
    with patch("hermes_cli.models_reasoning_caps.refresh_reasoning_caps_async", lambda provider: None):
        retry_now, _ = recover_after_classification(
            agent, err, classified, TurnRetryState(), status_code=400, error_context={},
            messages=[], api_messages=[],
        )
    assert retry_now is True


def test_rejected_disable_notice_follows_the_client_language(client_language):
    client_language("zh")
    agent = _Agent()
    _recover(agent, _REVERSED_400)

    assert agent._reasoning_disable_rejected is True
    expected = t("core.reasoning_recovery.disable_rejected", lang="zh", model="chat-only")
    assert agent.notices == [expected]
    assert expected != t("core.reasoning_recovery.disable_rejected", lang="en", model="chat-only")
    assert "chat-only" in expected


def test_rejected_effort_notice_keeps_the_model_and_effort(client_language):
    client_language("zh-hant")
    agent = _Agent(sent={"enabled": True, "effort": "max"})
    _recover(agent, _LEVEL_400)

    assert agent._reasoning_effort_rejected is True
    expected = t("core.reasoning_recovery.effort_rejected", lang="zh-hant", model="chat-only", effort="max")
    assert agent.notices == [expected]
    assert "chat-only" in expected and "max" in expected
    assert expected != t("core.reasoning_recovery.effort_rejected", lang="en", model="chat-only", effort="max")


class _CodexAgent:
    log_prefix = ""
    api_mode = "codex_responses"

    def __init__(self):
        self.notices: list[str] = []
        self._codex_reasoning_replay_enabled = True
        self._codex_reasoning_replay_rejected = False

    def _vprint(self, line, **kwargs):
        self.notices.append(line)

    def _get_transport(self):
        return None

    def _disable_codex_reasoning_replay(self, messages, *, keep_replay):
        return {"items": 3, "messages": 2}


def test_codex_replay_notices_follow_the_client_language(client_language):
    from agent.turn_recovery_codex import _recover_stale_codex_reasoning

    def history():
        return [{"role": "assistant", "content": "a", "codex_reasoning_items": [{"type": "reasoning", "id": "rs_1"}]}]

    client_language("zh")
    agent = _CodexAgent()
    assert _recover_stale_codex_reasoning(agent, TurnRetryState(), history(), history()) is True
    # A repeat rejection on a later attempt turns replay off on this route.
    assert _recover_stale_codex_reasoning(agent, TurnRetryState(), history(), history()) is True

    assert agent.notices == [
        t("core.reasoning_recovery.replay_stripped", lang="zh", items=3, messages=2),
        t("core.reasoning_recovery.replay_disabled", lang="zh", items=3, messages=2),
    ]
    assert agent.notices[0] != agent.notices[1]
    assert all("3" in notice and "2" in notice for notice in agent.notices)


def test_empty_keepalive_fallback_warning_follows_the_client_language(client_language):
    from agent.chat_completion_helpers import _StreamingCall
    from agent.error_classifier import PROVIDER_STREAM_EMPTY_FRAME_ERROR_CODE

    client_language("zh-hant")
    warnings: list[str] = []
    agent = SimpleNamespace(
        api_mode="anthropic_messages", provider="custom", model="m", _disable_streaming=False,
        _emit_warning=warnings.append,
    )
    error = SimpleNamespace(body={"error": {"code": PROVIDER_STREAM_EMPTY_FRAME_ERROR_CODE}})

    _StreamingCall._maybe_disable_streaming(SimpleNamespace(agent=agent), error)

    assert agent._disable_streaming is True
    assert warnings == [t("core.streaming.empty_keepalive_fallback", lang="zh-hant")]
    assert warnings[0] != t("core.streaming.empty_keepalive_fallback", lang="en")
