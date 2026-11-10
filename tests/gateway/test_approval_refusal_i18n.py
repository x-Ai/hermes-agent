"""A refused approval answer is worded in the profile's language, the no-requester case included.

A turn merged from two members records no requester, so ``refusal_text`` words that refusal through
its own ``gateway.exec_approval.not_requester_admins_only`` key: a Chinese reader gets the admins-only
sentence, never the internal no-requester marker spliced into the "only <name> can answer" copy.
"""

from types import SimpleNamespace

import pytest

from agent import i18n
from gateway.approval_actor import approval_refusal, refusal_text

_ENGLISH_ADMINS_ONLY = "Only an admin or a listed approver can answer this approval."


@pytest.fixture(autouse=True)
def _clean_queues():
    from tools import approval as approval_mod

    approval_mod._gateway_queues.clear()
    yield
    approval_mod._gateway_queues.clear()


@pytest.fixture
def language(monkeypatch):
    def use(lang: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", lang)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


def _pending(session_key: str, requester_id: str, requester_name: str) -> None:
    from tools import approval as approval_mod

    approval_mod._gateway_queues[session_key] = [SimpleNamespace(
        data={"request_id": "req-1"},
        authority={"requester_id": requester_id, "requester_name": requester_name,
                   "chat_type": "group", "approvers": []})]


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_no_requester_refusal_reads_as_the_localized_admins_only_copy(language, lang):
    language(lang)
    _pending("merged-turn", "", "")

    text = refusal_text(approval_refusal("merged-turn", "111"))

    assert text == i18n.t("gateway.exec_approval.not_requester_admins_only", lang=lang)
    assert text != _ENGLISH_ADMINS_ONLY
    assert "\0" not in text and "no-requester" not in text
    assert text != i18n.t("gateway.exec_approval.not_requester", lang=lang, requester="")


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_named_requester_refusal_keeps_the_name_in_the_localized_copy(language, lang):
    language(lang)
    _pending("one-member", "111", "Alice Example")

    text = refusal_text(approval_refusal("one-member", "222"))

    assert text == i18n.t("gateway.exec_approval.not_requester", lang=lang, requester="Alice Example")
    assert "Alice Example" in text and not text.startswith("Only ")


def test_simplified_chinese_refusals_follow_the_catalogs_unterminated_sentence_style(language):
    """Simplified-Chinese catalog sentences carry no trailing 。 (the fork's zh punctuation convention)."""
    language("zh")
    _pending("merged-turn", "", "")
    _pending("one-member", "111", "Alice Example")

    for session_key in ("merged-turn", "one-member"):
        assert not refusal_text(approval_refusal(session_key, "222")).endswith("。")
