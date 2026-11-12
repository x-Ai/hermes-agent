"""A translated empty-response retry counter stays out of chats like the English one (#101138).

The fork renders ``core.empty_recovery.retry_status`` in the user's language, which the gateway's
English noise regex (``retrying (1/3) in 8s``) cannot match. The producer classifies the line
(``RetryChatterText``), the status buffer keeps that class through the terminal flush, and the
chat filter drops it by class; the CLI keeps the translated line.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from agent import i18n
from agent import turn_empty_response as ter
from agent.status_output import StatusOutputMixin
from gateway.run import _prepare_gateway_status_message
from gateway.warning_notifications import DiagnosticText, RetryChatterText


def _buffering_agent():
    agent = MagicMock()
    for name in ("_buffer_retry_message", "_buffer_status", "_buffer_diagnostic_status", "_flush_status_buffer"):
        setattr(agent, name, getattr(StatusOutputMixin, name).__get__(agent))
    agent._retry_status_buffer = []
    emitted = []
    agent._emit_status.side_effect = emitted.append
    return agent, emitted


@pytest.fixture
def client_language():
    tokens = []

    def bind(lang):
        tokens.append(i18n.bind_client_language(lang))

    yield bind
    for token in reversed(tokens):
        i18n.reset_client_language(token)


@pytest.mark.parametrize("lang", ["zh", "zh-hant", "ja", "de"])
def test_translated_retry_counter_is_dropped_from_chats_but_kept_for_the_cli(monkeypatch, client_language, lang):
    client_language(lang)
    agent, emitted = _buffering_agent()
    agent.model = "m"
    agent._empty_content_retries = 0
    agent._empty_response_retry_budget = 3
    agent._empty_guard_enabled = True
    monkeypatch.setattr(ter._empty_guard, "_estimate_attempt_cost", lambda a, r: None)
    monkeypatch.setattr(ter._empty_guard, "record_empty_attempt", lambda *a, **k: None)
    monkeypatch.setattr(ter._empty_guard, "deterministic_empty", lambda a: False)
    monkeypatch.setattr(ter, "interruptible_backoff_sleep", lambda *a, **k: None)

    action, _, _ = ter._retry_empty(agent, SimpleNamespace(usage=None), "stop", True,
                                    messages=[], conversation_history=[], api_call_count=1)
    agent._flush_status_buffer()  # the turn ended empty: the buffered trace is replayed

    assert action == "continue"
    (status,) = emitted
    assert isinstance(status, RetryChatterText)
    assert "Empty response from model" not in status  # translated: the English regex cannot see it
    assert _prepare_gateway_status_message("telegram", "status", status) is None
    assert _prepare_gateway_status_message("local", "status", status) == status


def test_status_buffer_keeps_a_finer_diagnostic_class():
    agent, emitted = _buffering_agent()
    agent._buffer_diagnostic_status(RetryChatterText("⚠️ 模型返回空响应，6 秒后重试（1/3）"))
    agent._buffer_diagnostic_status("⚠️ Tool output was truncated to 50,000 characters.")
    agent._flush_status_buffer()

    chatter, warning = emitted
    assert isinstance(chatter, RetryChatterText)
    assert type(warning) is DiagnosticText
    assert _prepare_gateway_status_message("telegram", "status", chatter) is None
    assert _prepare_gateway_status_message("telegram", "status", warning) == warning
