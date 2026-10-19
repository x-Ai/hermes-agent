"""A profile that shares the default profile's model providers (``profile.yaml`` ``share_providers``,
``hermes_cli/profiles_shared_providers.py``) shares them on the gateway's own paths too: the config a
new gateway-owned session freezes lists the default profile's endpoints with the keys behind them, and
a Desktop / TUI pick of one resolves and freezes that endpoint — the same read-through ``load_config()``
gives the in-process backend."""
import json

import pytest

from tests.gateway.test_session_mutation_model_provider_replacement import peers, pick


def _sharing_bot(tmp_path):
    root = tmp_path / '.hermes'
    bot = root / 'profiles' / 'bot'
    bot.mkdir(parents=True)
    (bot / 'profile.yaml').write_text('share_providers: true\n')
    return root, bot


def test_a_sharing_profiles_policy_config_lists_the_default_profiles_endpoints(tmp_path, monkeypatch):
    from gateway.session_local import load_profile_config
    root, bot = _sharing_bot(tmp_path)
    monkeypatch.setenv('HERMES_HOME', str(root))
    (root / 'config.yaml').write_text(json.dumps({'providers': {'shared': {
        'base_url': 'https://shared.example.com/v1', 'api_key': '${SHARED_KEY}', 'models': {'m': {}}}}}))
    (root / '.env').write_text('SHARED_KEY=root-shared-key\n')
    (bot / 'config.yaml').write_text(json.dumps({'model': {'provider': 'openai', 'default': 'gpt'}}))
    (bot / '.env').write_text('OPENAI_API_KEY=bot-openai-key\n')
    providers = load_profile_config(bot).get('providers') or {}
    assert providers['shared']['base_url'] == 'https://shared.example.com/v1'
    assert providers['shared']['api_key'] == 'root-shared-key'  # the key behind it, through the bot's scope
    assert 'shared' in (load_profile_config(root).get('providers') or {})
    (bot / 'profile.yaml').write_text('')  # an island again: only its own file
    assert 'shared' not in (load_profile_config(bot).get('providers') or {})


@pytest.mark.asyncio
async def test_a_pick_of_a_shared_endpoint_freezes_it_with_its_key(tmp_path, monkeypatch):
    root, bot = _sharing_bot(tmp_path)
    with peers() as (_own, own_url, shared_peer, shared_url):
        (root / 'config.yaml').write_text(json.dumps({'providers': {'shared': {
            'base_url': shared_url, 'api_key': 'root-shared-key', 'models': {'original': {}, 'switched': {}}}}}))
        before = {'model': {'provider': 'custom', 'base_url': own_url, 'default': 'original'}}
        config, runtime = await pick(bot, monkeypatch, before, before, 'shared', hermes_home=root)
        assert runtime['base_url'].rstrip('/') == shared_url
        assert shared_peer.bearers == ['Bearer root-shared-key']
        assert config['providers']['shared']['base_url'] == shared_url
