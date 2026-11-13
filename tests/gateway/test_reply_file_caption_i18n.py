"""A reply past the split cap is uploaded with its caption in the profile's language.

Upstream's long-reply handoff (``send_reply_as_file``) captions the first file with
``platform.shared.response_as_file``. The caption follows the profile's language like every other
adapter notice, and the Simplified-Chinese copy keeps the fork's unterminated-sentence style (no
trailing 。).
"""

import asyncio
from types import SimpleNamespace

import pytest

from agent import i18n


@pytest.fixture
def language(monkeypatch):
    def use(lang: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", lang)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


class _Uploader:
    """An adapter whose ``send_reply_document`` records each upload's caption and file name."""

    REPLY_FILE_MAX_BYTES = 8 * 1024 * 1024

    def __init__(self):
        self.uploads = []

    async def send_reply_document(self, chat_id, path, caption=None, file_name=None, reply_to=None, metadata=None):
        self.uploads.append((caption, file_name))
        return SimpleNamespace(success=True, message_id=str(len(self.uploads)), raw_response=None)


@pytest.mark.parametrize("lang", ["zh", "zh-hant", "en"])
def test_long_reply_file_caption_is_in_the_profile_language(language, lang):
    from gateway.platforms.helpers import send_reply_as_file
    language(lang)
    adapter = _Uploader()

    ids = asyncio.run(send_reply_as_file(adapter, "chat", "x" * 64))

    assert ids == ["1"]
    (caption, file_name), = adapter.uploads
    assert caption == i18n.t("platform.shared.response_as_file", lang=lang)
    assert file_name.startswith("reply-") and file_name.endswith(".md")
    if lang != "en":
        assert caption != i18n.t("platform.shared.response_as_file", lang="en")


def test_simplified_chinese_caption_follows_the_unterminated_sentence_style(language):
    language("zh")
    assert not i18n.t("platform.shared.response_as_file").endswith("。")
