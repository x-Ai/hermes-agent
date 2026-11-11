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


def _pending_under_slash_gate(session_key: str) -> None:
    """An approval under the default ``approvers: ["*"]``: the chat's slash policy decides who answers."""
    from tools import approval as approval_mod

    approval_mod._gateway_queues[session_key] = [SimpleNamespace(
        data={"request_id": "req-1"},
        authority={"requester_id": "111", "requester_name": "Alice Example",
                   "chat_type": "dm", "approvers": ["*"]})]


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_slash_gated_answer_refusal_reads_as_the_localized_admin_only_sentence(language, lang):
    from gateway.slash_access import SlashAccessPolicy

    language(lang)
    _pending_under_slash_gate("gated-chat")
    policy = SlashAccessPolicy(True, frozenset({"111"}), frozenset())

    text = refusal_text(approval_refusal("gated-chat", "222", admin_ids=policy, choice="deny"))

    assert text.startswith("⛔ /deny") and "admin-only" not in text
    assert "\0" not in text and "Alice Example" not in text
    assert text[-1] not in "，,；;：:"  # the empty suffix leaves no separator dangling


def test_simplified_chinese_slash_gated_refusal_is_an_unterminated_sentence(language):
    from gateway.slash_access import SlashAccessPolicy

    language("zh")
    _pending_under_slash_gate("gated-chat")
    policy = SlashAccessPolicy(True, frozenset({"111"}), frozenset())

    text = refusal_text(approval_refusal("gated-chat", "222", admin_ids=policy, choice="approve"))

    assert text == "⛔ /approve 在此处仅限管理员使用"


@pytest.mark.parametrize("allowed, tail", [
    (["status"], "，你可以运行：/status"),
    ([], "，此平台未为非管理员启用任何斜杠命令"),
])
def test_simplified_chinese_slash_denial_still_joins_its_suffix_with_one_comma(language, allowed, tail):
    from tests.gateway.test_slash_access_dispatch import _make_runner, _make_source

    language("zh")
    runner = _make_runner(platform_extra={"allow_admin_from": ["111"], "user_allowed_commands": allowed})

    text = runner._check_slash_access(_make_source(user_id="999"), "model")

    assert text.startswith("⛔ /model 在此处仅限管理员使用" + tail)
    assert "，，" not in text


@pytest.mark.asyncio
async def test_second_update_refusal_reads_in_simplified_chinese_without_a_trailing_period(
        tmp_path, monkeypatch, language):
    from unittest.mock import AsyncMock, MagicMock, patch

    import gateway.run as gateway_run
    from gateway.platforms.event import MessageEvent
    from tests.gateway.test_prompt_opener_binding import _runner, _source

    language("zh")
    runner = _runner(MagicMock(send=AsyncMock()))
    monkeypatch.setattr(gateway_run, "_hermes_home", tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    (tmp_path / "checkout" / "gateway").mkdir(parents=True)
    (tmp_path / "checkout" / ".git").mkdir()
    runner._schedule_update_notification_watch = lambda: None
    with patch("gateway.slash_commands.__file__", str(tmp_path / "checkout" / "gateway" / "slash_commands.py")), \
            patch("gateway.slash_commands._spawn_detached_update") as spawn, \
            patch("gateway.run._resolve_hermes_bin", return_value=["hermes"]), \
            patch("hermes_cli.config.is_managed", return_value=False), \
            patch("hermes_cli.config.detect_install_method", return_value="git"):
        await runner._handle_update_command(MessageEvent(text="/update", source=_source("alice")))
        reply = await runner._handle_update_command(MessageEvent(text="/update", source=_source("bob")))

    assert spawn.call_count == 1
    assert reply == i18n.t("gateway.update.already_running", lang="zh")
    assert "already running" not in reply and "/update" in reply
    assert not reply.endswith("。") and "；" not in reply
