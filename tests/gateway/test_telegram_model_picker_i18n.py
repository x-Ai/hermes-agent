"""Fork localization: the Telegram /model picker's "N more available" note renders in the
client's language as MarkdownV2 italics (the adapter wraps the catalog text in ``*...*``)."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from agent.i18n import bind_client_language, reset_client_language
from gateway.config import PlatformConfig
from plugins.platforms.telegram.adapter import TelegramAdapter


@pytest.fixture
def plain_keyboards(monkeypatch):
    """Inspectable stand-ins for PTB's keyboard types (the module mock records nothing)."""
    import plugins.platforms.telegram.adapter as tg

    monkeypatch.setattr(tg, "InlineKeyboardButton",
                        lambda text, callback_data=None, **_: SimpleNamespace(text=text, callback_data=callback_data))
    monkeypatch.setattr(tg, "InlineKeyboardMarkup", lambda rows: SimpleNamespace(inline_keyboard=rows))


@pytest.mark.asyncio
@pytest.mark.parametrize(("lang", "note"), [("zh", "还有 46 个可用"), ("zh-hant", "還有 46 個")])
async def test_more_available_note_renders_localized_and_italic(plain_keyboards, lang, note):
    adapter = TelegramAdapter(PlatformConfig(enabled=True, token="test-token"))
    adapter._bot = AsyncMock()
    adapter._app = MagicMock()
    ids = ["global.anthropic.claude-opus-4-5-20251101-v1:0", "global.anthropic.claude-sonnet-4-5-20250929-v1:0"]
    adapter._model_picker_state["12345"] = {
        "providers": [{"slug": "bedrock", "name": "AWS Bedrock", "models": ids, "total_models": 48}],
        "current_model": "m", "current_provider": "bedrock",
        "session_key": "s", "on_model_selected": AsyncMock(), "msg_id": 42,
    }
    query = AsyncMock()
    query.message = MagicMock()
    query.message.chat_id = 12345
    query.from_user = MagicMock()

    token = bind_client_language(lang)
    try:
        await adapter._handle_model_picker_callback(query, "mp:bedrock", "12345")
    finally:
        reset_client_language(token)

    text = query.edit_message_text.call_args[1]["text"]
    assert f"\n_{note}" in text
    assert "more available" not in text
