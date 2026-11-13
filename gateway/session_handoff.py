"""``handoff.request`` / ``handoff.state`` / ``handoff.fail`` on the shared owner (Desktop and CLI
``/handoff``), as the per-TUI sidecar serves them (``tui_gateway/methods_session.py``).

The owner only writes the session row's ``pending`` handoff; the gateway's handoff watcher claims it,
repoints the platform's home route at the session and runs the synthetic turn there. ``dispatch``
runs each handler under the owning profile's scope, so the gateway config read here (platform and
home channel) is that profile's, the one the watcher delivers through. SQLite runs off the owner loop.
"""
import asyncio
from functools import partial

from agent.i18n import t
from gateway.session_busy_controls import authorize
from hermes_state_runtime import RuntimeStoreError


def handlers(connection):
    return {'handoff.request': partial(request, connection), 'handoff.state': partial(state, connection),
            'handoff.fail': partial(fail, connection)}


def _session(connection, ref, params, fields, capability):
    if set(params) - fields or not isinstance(ref.session_id, str) or not ref.session_id:
        raise RuntimeStoreError('invalid_params')
    authorize(connection, ref, params, capability)


class HandoffRefusal(RuntimeStoreError):
    """A refusal whose wire ``message`` is the human reason, as the sidecar's handoff errors were:
    Desktop shows ``error.message`` verbatim, and a bare ``invalid_params`` never says what to fix
    (``data`` still carries the reason code, field and detail)."""

    def __init__(self, reason, detail, field=None):
        super().__init__(reason, field=field, detail=detail)
        self.wire_message = self.detail


def _destination(platform_name):
    """The home channel the watcher will deliver to, by the CLI's own rule (relay-fronted platforms
    included): an unconfigured platform or a missing home channel would otherwise sit ``pending``
    until the client gives up."""
    from gateway.handoff_target import HandoffTargetError, resolve_handoff_home
    try:
        return resolve_handoff_home(platform_name)
    except HandoffTargetError as exc:
        raise HandoffRefusal('invalid_params', t(_REFUSALS[exc.reason], name=platform_name),
                       field='platform') from None


# Catalog keys, rendered when the refusal is raised: an RPC body runs in the language its client
# announced (``tui_gateway/ws.py::_dispatch_request``), the watcher's re-check in the profile's own.
# The sidecar's ``handoff.request`` answers the same three target refusals with the same keys.
_REFUSALS = {'unknown_platform': 'tui_gateway.handoff.unknown_platform',
             'platform_not_enabled': 'tui_gateway.handoff.platform_not_enabled',
             'no_home_channel': 'tui_gateway.handoff.no_home_channel'}


_UNSETTLED = {'session_busy': 'gateway.handoff.session_busy',
              'unknown_execution': 'gateway.handoff.unknown_execution'}


def require_settled(db, session_id, conn):
    """Refuse a handoff while durable work still owns *session_id*: any queued, started or unknown
    admission, a live worker, or a live turn lease on its runtime lineage. A recovered ``unknown``
    turn has no resident drain task, yet moving its route would hand the lane a turn whose outcome
    nobody resolved. Runs on the caller's write transaction: inside ``request_handoff``'s, and again
    when the watcher repoints (``check_settled``), so a turn admitted after the request still wins."""
    from hermes_state_mutation_guards import MUTATION_GUARD_REFUSALS, require_idle
    from hermes_state_runtime_workers import runtime_lineage
    try:
        require_idle(db, conn, sorted(runtime_lineage(conn, session_id)))
    except MUTATION_GUARD_REFUSALS:
        raise HandoffRefusal('session_busy', t(_UNSETTLED['session_busy'])) from None
    except RuntimeStoreError as exc:
        if exc.reason not in _UNSETTLED:
            raise
        raise HandoffRefusal(exc.reason, t(_UNSETTLED[exc.reason])) from None


async def check_settled(db, session_id):
    """The watcher's re-check of ``require_settled`` right before it repoints the route; a refusal
    fails the handoff with the human reason (the CLI and Desktop show ``handoff_error``)."""
    if db is None or not callable(getattr(db, '_execute_write', None)):
        return
    try:
        await asyncio.to_thread(db._execute_write, partial(require_settled, db, session_id))
    except HandoffRefusal as exc:
        raise RuntimeError(exc.detail) from None


async def request(connection, ref, params):
    _session(connection, ref, params, {'session_id', 'profile', 'platform'}, 'session:control')
    platform_name = params.get('platform')
    if not isinstance(platform_name, str) or not platform_name.strip():
        raise HandoffRefusal('invalid_params', t('gateway.handoff.platform_required'), field='platform')
    platform_name = platform_name.strip().lower()
    live = connection.authority.sessions[ref.session_id]
    if live.task is not None and not live.task.done():
        # The watcher's repoint and synthetic turn would race the running one.
        raise HandoffRefusal('session_busy', t(_UNSETTLED['session_busy']))
    db = connection.authority.db

    def write():
        home = _destination(platform_name)
        if not db.request_handoff(ref.session_id, platform_name, _guard=partial(require_settled, db, ref.session_id)):
            raise HandoffRefusal('session_busy', t('gateway.handoff.in_flight'), field='handoff')
        return home
    home = await asyncio.to_thread(write)
    return {'queued': True, 'session_key': ref.session_id, 'platform': platform_name, 'home_name': home.name}


async def state(connection, ref, params):
    _session(connection, ref, params, {'session_id', 'profile'}, 'session:read')
    record = await asyncio.to_thread(connection.authority.db.get_handoff_state, ref.session_id) or {}
    return {field: record.get(field) or '' for field in ('state', 'platform', 'error')}


async def fail(connection, ref, params):
    """A client's poll timeout: fails a handoff no watcher claimed yet. A claimed (``running``) row is
    the watcher's to settle, so the write is a compare-and-swap on ``pending``."""
    _session(connection, ref, params, {'session_id', 'profile', 'error'}, 'session:control')
    reason = params.get('error')
    reason = (reason.strip() if isinstance(reason, str) else '')[:500] or 'handoff failed'
    db = connection.authority.db

    def write():
        failed = db.fail_handoff(ref.session_id, reason, only_states=('pending',))
        return failed, (db.get_handoff_state(ref.session_id) or {}).get('state') or ''
    failed, current = await asyncio.to_thread(write)
    return {'failed': bool(failed), 'state': 'failed' if failed else current}
