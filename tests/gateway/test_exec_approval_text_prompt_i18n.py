"""The plain-text approval prompts take their punctuation and layout from the catalog in every language.

The cutting-platform prompt (ntfy, DingTalk, Photon, LINE) renders its reason line and its Deny-only
instruction through ``gateway.exec_approval.*``, so a Chinese user sees the catalog's full-width colon
and no ASCII stop glued to the Chinese Deny choice; English keeps its exact wording. The ``/approve``
fallback keeps a blank line between the reason and the instructions in every bundled catalog: a block
scalar's kept trailing newline is easy to lose when keys are inserted after it.
"""
from __future__ import annotations

from types import SimpleNamespace

import pytest

from agent import i18n
from agent.i18n import t
from gateway.run import _format_exec_approval_fallback
from gateway.run_turn_runner_approval_text import _cutting_text_prompt

LONG_COMMAND = "echo " + "A" * 5000


def _cutting_adapter(limit: int):
    return SimpleNamespace(max_message_length_for_chat=lambda _chat: limit, message_len_fn_for_chat=lambda _chat: len)


@pytest.fixture
def language():
    tokens = []

    def bind(code: str) -> None:
        tokens.append(i18n.bind_client_language(code))

    yield bind
    for token in reversed(tokens):
        i18n.reset_client_language(token)


def test_chinese_cut_prompt_uses_the_catalog_punctuation(language):
    language("zh")
    text, deny_only = _cutting_text_prompt(_cutting_adapter(1500), "chat", LONG_COMMAND, "递归删除", "/")
    label, deny = t("gateway.exec_approval.reason_label"), t("gateway.exec_approval.text_choice_deny", prefix="/")
    assert deny_only and "/approve" not in text
    assert f"{label}：递归删除" in text and f"{label}: " not in text
    assert deny in text and f"{deny}." not in text
    assert t("gateway.exec_approval.truncated_deny_only", total=len(LONG_COMMAND)) in text
    assert len(text) <= 1500


def test_chinese_whole_prompt_uses_the_catalog_punctuation(language):
    language("zh")
    text, deny_only = _cutting_text_prompt(_cutting_adapter(4096), "chat", "rm -rf /tmp/x", "递归删除", "/")
    assert not deny_only and "/approve" in text and "rm -rf /tmp/x" in text
    assert f"{t('gateway.exec_approval.reason_label')}：递归删除" in text


def test_english_cut_prompt_wording_is_unchanged(language):
    language("en")
    text, deny_only = _cutting_text_prompt(_cutting_adapter(1500), "chat", LONG_COMMAND, "recursive delete", "/")
    assert deny_only and "`/deny` to cancel.\n" in text
    assert f"{t('gateway.exec_approval.reason_label')}: recursive delete" in text
    assert "Preview shortened" in text


@pytest.mark.parametrize("code", sorted(i18n.SUPPORTED_LANGUAGES))
def test_approve_fallback_keeps_a_blank_line_before_the_instructions(language, code):
    language(code)
    text = _format_exec_approval_fallback("rm -rf /tmp/x", "WHY", "/")
    assert "WHY\n\n" + t("gateway.exec_approval.text_choice_once", prefix="/") in text
