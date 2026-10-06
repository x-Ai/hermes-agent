"""The display language a connected client renders in, remembered per transport.

The Desktop infers its UI language from the OS when ``display.language`` is unset and deliberately
does not persist that guess, so the profile's own resolution (``HERMES_LANGUAGE`` > ``display.language``
> ``en``) answered English under a Chinese UI: the failed-turn notice, provider labels and every
``_t()`` reply landed in the wrong language. A client announces what it renders over
``i18n.client_locale``; the claim lives with its connection (``WSTransport``: one per socket) and is
bound into ``agent.i18n`` for every RPC body on that connection and for every turn a prompt from it
starts (``session["client_locale"]``, so follow-up turns and off-turn events keep the language).
"""

from __future__ import annotations

import contextlib
import weakref
from typing import Any

from agent.i18n import bind_client_language, reset_client_language, resolve_language_id

from .transport import current_transport

# Keyed by transport object; a closed connection drops its claim with the transport. Slotted
# transports declare ``__weakref__`` for this; a test double that cannot be weak-referenced simply
# carries no claim.
_claims: "weakref.WeakKeyDictionary[Any, str]" = weakref.WeakKeyDictionary()


def remember_client_locale(transport: Any, lang: Any) -> str:
    """Record the language ``transport``'s client renders; returns the canonical id, or ``""`` when
    the claim was cleared (empty) or names a language no layer supplies."""
    resolved = resolve_language_id(lang) or "" if lang else ""
    if transport is None:
        return resolved
    try:
        if resolved:
            _claims[transport] = resolved
        else:
            _claims.pop(transport, None)
    except TypeError:  # not weak-referenceable (bare ``object()`` doubles)
        return ""
    return resolved


def client_locale(transport: Any) -> str:
    """The language announced on ``transport``, ``""`` when none."""
    if transport is None:
        return ""
    try:
        return _claims.get(transport, "")
    except TypeError:
        return ""


def remember_session_client_locale(session: dict, transport: Any) -> None:
    """Carry the submitting connection's claim onto the session, so the turn thread (which does not
    inherit the RPC context) and every later off-turn body for this session render in it. A submit
    with no claim (hosted-room / relay dispatch, an old client) leaves the previous one in place."""
    if lang := client_locale(transport):
        session["client_locale"] = lang


@contextlib.contextmanager
def client_language_scope(lang: Any):
    """Bind ``lang`` (a transport's or session's claim; empty = none) for the body."""
    token = bind_client_language(lang or "")
    try:
        yield
    finally:
        reset_client_language(token)


@contextlib.contextmanager
def connection_language_scope():
    """Bind the claim of the transport the current request arrived on (the dispatcher wraps every
    RPC body in it, so ``_t()`` replies and events emitted from the body follow the client's screen)."""
    with client_language_scope(client_locale(current_transport())):
        yield
