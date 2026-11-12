"""The pre-agent setup notices are worded in the reader's language (#138358 notices).

A follow-up queued behind a turn still stuck in setup, and the resend notice of a setup that ran
past its deadline, are gateway-authored prose: they render through ``gateway.busy.setup_waiting``
and ``gateway.busy.setup_timeout`` in the profile's language, or in the language a connected client
announced. Simplified Chinese keeps the catalog's sentence punctuation (no 。 inside or at the end).
"""
from __future__ import annotations

import asyncio
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from agent import i18n
from gateway.config import Platform
from gateway.platforms.event import MessageEvent, MessageType
from gateway.run import GatewayRunner, _AGENT_PENDING_SENTINEL
from gateway.session import SessionSource

KEY = "agent:main:telegram:dm:138358-preagent-i18n"


@pytest.fixture
def language(monkeypatch):
    def use(lang: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", lang)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


def _source() -> SessionSource:
    return SessionSource(platform=Platform.TELEGRAM, chat_id="138358", chat_type="dm",
                         user_id="user-138358", user_name="reporter")


def _event(text: str) -> MessageEvent:
    return MessageEvent(text=text, message_type=MessageType.TEXT, source=_source(), message_id="m1")


def _bare_runner() -> GatewayRunner:
    runner = object.__new__(GatewayRunner)
    runner.hooks = SimpleNamespace(emit=AsyncMock())
    return runner


def _runner_with_turn_in_setup(started_ago: float) -> GatewayRunner:
    runner = _bare_runner()
    runner._draining = False
    runner._hm_busy_slash_or_photo = AsyncMock(return_value=(False, None))
    runner._effective_busy_input_mode = lambda _source: "interrupt"
    runner._hm_busy_telegram_grace_queue = lambda *_args, **_kwargs: False
    runner._hm_merge_pending_for_source = lambda *_args, **_kwargs: None
    state = SimpleNamespace(turn=SimpleNamespace(
        agent=_AGENT_PENDING_SENTINEL, started_ts=time.time() - started_ago, busy_ack_ts=0.0))
    runner._peek_session_state = runner._session_state = lambda _key: state
    return runner


@pytest.fixture
def stalled_setup_env(monkeypatch):
    monkeypatch.setenv("HERMES_SESSION_STALL_TIMEOUT", "60")
    monkeypatch.setenv("HERMES_GATEWAY_BUSY_ACK_ENABLED", "true")


@pytest.mark.asyncio
async def test_followup_behind_a_stalled_setup_is_acked_in_the_profile_language(stalled_setup_env, language):
    language("zh")

    reply = await GatewayRunner._hm_handle_running_session_message(
        _runner_with_turn_in_setup(400), _event("later"), _source(), KEY)

    assert reply == i18n.t("gateway.busy.setup_waiting", lang="zh", minutes=6)
    assert "Still starting" not in reply and "6 分钟" in reply and "/stop" in reply
    assert "。" not in reply


@pytest.mark.asyncio
async def test_setup_deadline_resend_notice_is_in_the_profile_language(monkeypatch, language):
    monkeypatch.setenv("HERMES_AGENT_TIMEOUT", "0.05")
    language("zh")
    runner = _bare_runner()

    async def _hang(*_args, **_kwargs):
        await asyncio.Event().wait()  # an await nothing ever completes

    runner._hmwa_resolve_session = _hang
    reply = await GatewayRunner._handle_message_with_agent(runner, _event("hello"), _source(), KEY, 1)

    assert reply == i18n.t("gateway.busy.setup_timeout", lang="zh")
    assert "Turn setup stalled" not in reply and "重新发送" in reply
    assert "。" not in reply


@pytest.mark.asyncio
async def test_connected_client_language_beats_the_profile_language_for_the_setup_ack(
        stalled_setup_env, language):
    language("en")
    token = i18n.bind_client_language("zh-hant")
    try:
        reply = await GatewayRunner._hm_handle_running_session_message(
            _runner_with_turn_in_setup(400), _event("later"), _source(), KEY)
    finally:
        i18n.reset_client_language(token)

    assert reply == i18n.t("gateway.busy.setup_waiting", lang="zh-hant", minutes=6)
    assert "Still starting" not in reply and "6 分鐘" in reply
