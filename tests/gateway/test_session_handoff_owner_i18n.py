"""The shared owner's ``handoff.request`` refusals (``gateway/session_handoff.py``) render in the language
the connected client announced, as the sidecar's localized handoff errors did: Desktop shows
``error.message`` verbatim and the CLI prints ``error.data.detail``. The refusal tables hold catalog keys,
never text built at import before any client announced a language; the wire ``reason`` stays a code."""
from __future__ import annotations

import pytest

from agent import i18n
from tests.gateway.test_owner_loop_writes_class import _local, _owner
from tests.gateway.test_session_handoff_owner import _call, _telegram_home


def _owner_keys():
    from gateway import session_handoff
    return [*session_handoff._REFUSALS.values(), *session_handoff._UNSETTLED.values(),
            'gateway.handoff.platform_required', 'gateway.handoff.in_flight']


def test_every_owner_handoff_refusal_is_a_translated_catalog_key():
    for key in _owner_keys():
        en = i18n.t(key, lang='en', name='telegram')
        assert en != key, key
        for lang in ('zh', 'zh-hant'):
            translated = i18n.t(key, lang=lang, name='telegram')
            assert translated not in (key, en), (lang, key)


@pytest.mark.asyncio
@pytest.mark.parametrize('lang', ['en', 'zh', 'zh-hant'])
async def test_owner_handoff_refusals_follow_the_clients_language(tmp_path, monkeypatch, lang):
    _telegram_home(tmp_path, monkeypatch)
    _store, authority, owner = _owner(tmp_path, monkeypatch, handle=None)
    ref = _local(authority, owner, tmp_path)
    token = i18n.bind_client_language(lang)
    try:
        unknown = await _call(owner, 'handoff.request', session_id=ref.session_id, platform='nowhere')
        assert unknown['error']['data']['reason'] == 'invalid_params', unknown
        assert unknown['error']['message'] == i18n.t('tui_gateway.handoff.unknown_platform', lang=lang,
                                                     name='nowhere'), unknown
        missing = await _call(owner, 'handoff.request', session_id=ref.session_id, platform=' ')
        assert missing['error']['message'] == i18n.t('gateway.handoff.platform_required', lang=lang), missing
        queued = await _call(owner, 'handoff.request', session_id=ref.session_id, platform='telegram')
        assert queued['result']['queued'], queued
        again = await _call(owner, 'handoff.request', session_id=ref.session_id, platform='telegram')
        assert again['error']['data']['reason'] == 'session_busy', again
        assert again['error']['message'] == i18n.t('gateway.handoff.in_flight', lang=lang), again
        assert again['error']['data']['detail'] == again['error']['message'], again
    finally:
        i18n.reset_client_language(token)
        authority.db.close()
