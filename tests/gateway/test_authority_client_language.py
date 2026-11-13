"""A Desktop window on the gateway's session authority gets backend copy in the language it announced.

The Desktop leaves ``display.language`` unset while it infers its locale from the OS, and announces on
every socket what it renders (``i18n.client_locale``). On an authority-backed socket the authority answers
that verb -32601 and the legacy fallback records the claim on the socket's transport; the authority's own
request bodies must render in it, as the legacy dispatcher's do. Before, the low-disk auto-prune question a
``session.create`` / ``session.resume`` posts and the ``/autoprune`` replies came out in the profile's
language (English) under a Chinese window. A socket that announced nothing keeps the profile's language.

A real daemon (``gateway.run``) whose state.db disk reads as low (tests/gateway/fixtures/low_disk_daemon.py).
"""
import asyncio
import json
import signal
import threading
from http.server import ThreadingHTTPServer
from pathlib import Path

from agent.i18n import t
from tests.gateway.fixtures.local_recovery_probe import Model, child_env, daemon, websocket

NOTICE_KEY = 'sessions.auto_prune'


async def _call(ws, events, method, **params):
    """One request; the event frames read while waiting for its reply are kept in *events*."""
    await ws.send(json.dumps({'jsonrpc': '2.0', 'id': method, 'method': method, 'params': params}))
    async with asyncio.timeout(30):
        while (frame := json.loads(await ws.recv())).get('id') != method:
            events.append(frame)
    return frame


async def _notice(ws, events):
    """The auto-prune ``notification.show`` payload (posted off the reply's path, so it may land
    before or after the reply of the request that attached the session)."""
    async with asyncio.timeout(30):
        while True:
            for frame in events:
                params = frame.get('params') or {}
                if params.get('type') == 'notification.show' and params['payload'].get('key') == NOTICE_KEY:
                    return params['payload']
            events.append(json.loads(await ws.recv()))


def test_authority_socket_renders_the_low_disk_question_and_autoprune_replies_in_the_announced_language(tmp_path):
    root = Path(__file__).resolve().parents[2]
    home, user = tmp_path / 'state', tmp_path / 'user'
    home.mkdir(mode=0o700)
    user.mkdir()
    peer = ThreadingHTTPServer(('127.0.0.1', 0), Model)
    peer.requests = []
    peer.blocked, peer.release = threading.Event(), threading.Event()
    thread = threading.Thread(target=peer.serve_forever, daemon=True)
    thread.start()
    url = f'http://127.0.0.1:{peer.server_port}/v1'
    # No display.language: the profile itself renders English, like a Desktop that infers its locale.
    (home / 'config.yaml').write_text(json.dumps({
        'gateway': {'multiplex_profiles': False},
        'model': {'provider': 'custom', 'default': 'language-model', 'base_url': url},
        'auxiliary': {'title_generation': {'enabled': False}}, 'platform_toolsets': {'cli': []},
        'sessions': {'retention_days': 30}}))
    env = child_env()
    env.update(HOME=str(user), USERPROFILE=str(user), HERMES_HOME=str(home), PYTHONPATH=str(root),
               OPENAI_API_KEY='loopback-only', OPENAI_BASE_URL=url, PYTHONUNBUFFERED='1')
    out = {}

    async def probe(desc):
        events = []
        async with websocket(home, desc) as ws:
            out['claim'] = (await _call(ws, events, 'i18n.client_locale', lang='zh')).get('result')
            created = await _call(ws, events, 'session.create', request_id='language', source='gui',
                                  cwd=str(home), toolsets=[])
            sid = created['result']['session_id']
            out['notice'] = await _notice(ws, events)
            out['later'] = (await _call(ws, events, 'slash.exec', session_id=sid, command='autoprune later'))['result']
            async with websocket(home, desc) as plain:
                plain_events = []
                assert 'result' in await _call(plain, plain_events, 'session.resume', session_id=sid)
                out['plain'] = (await _call(plain, plain_events, 'slash.exec', session_id=sid,
                                            command='autoprune later'))['result']
    try:
        with daemon(root, home, env, barrier=True, fixture='low_disk_daemon.py') as (proc, desc):
            asyncio.run(probe(desc))
            proc.send_signal(signal.SIGINT)
            proc.wait(timeout=20)
    finally:
        peer.shutdown()
        peer.server_close()
        thread.join(timeout=5)

    assert out['claim'] == {'lang': 'zh'}, out
    free = t('shared.autoprune.size_gb', lang='zh', size='1.0')
    assert out['notice']['text'] == f"⚠ {t('shared.autoprune.notice', lang='zh', free=free)} · /autoprune on|off|later", out
    detail = out['notice']['detail'].splitlines()
    assert detail[1] == t('shared.autoprune.off_explainer', lang='zh', days=30), detail
    assert detail[-1] == t('shared.autoprune.commands', lang='zh', on='/autoprune on', off='/autoprune off',
                           later='/autoprune later'), detail
    assert out['later']['output'] == t('shared.autoprune.snoozed', lang='zh'), out['later']
    # The claim belongs to the window that made it: another socket on the same session is not told.
    assert out['plain']['output'] == t('shared.autoprune.snoozed', lang='en'), out['plain']
