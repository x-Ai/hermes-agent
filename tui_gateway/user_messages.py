"""User-facing copy for gateway refusals and session-level failures.

One place for the sentences the TUI, Desktop and dashboard print verbatim, so the
"what happened / what to do" shape stays consistent and the slash commands cited
(`/model`, `/new`, `/sessions`, `/retry`) exist on EVERY client this gateway serves (TUI,
Desktop, dashboard) — no client-only forms (`/sessions new`, `/setup`) and no single-surface
gestures stated as fact (Ctrl+C is copy on Desktop). The prose itself lives in the
``tui_gateway`` section of ``locales/<lang>.yaml`` and is resolved per call, in the profile's
``display.language``. Lead phrases that clients pattern-match on (``Session busy``) are part of
the wire contract — keep them English in every catalog.
"""

from __future__ import annotations

from typing import Any

from agent.i18n import t as _t

# Provider-layer failure codes are ``agent.error_classifier.FailoverReason`` values carried in
# ``error_surface.code``. Each code in _CODE_KEYS has its own ``turn_error.code.<code>`` catalog
# entry; an alias shares the entry of the code it is a variant of; anything unlisted falls back on
# the ``turn_error.layer.<layer>`` entry, then on ``turn_error.default``.
_CODE_ALIASES: dict[str, str] = {
    "auth_permanent": "auth", "billing_unverified": "billing", "upstream_rate_limit": "rate_limit"}
_CODE_KEYS = frozenset({
    "auth", "billing", "rate_limit", "upstream_blocked", "overloaded", "server_error", "timeout",
    "context_overflow", "payload_too_large", "model_not_found", "content_policy_blocked",
    "provider_policy_blocked", "format_error", "ssl_cert_verification"})
_LAYER_KEYS = frozenset({"auth", "endpoint", "streaming", "disk", "gateway", "provider"})
# Entries whose hint opens with "Send /retry": a turn that cannot be retried gets their
# ``hint_unrecoverable`` sibling, which names /model instead.
_RETRY_LED_HINTS = frozenset({"default", "layer.streaming", "layer.gateway", "layer.provider"})

_DETAIL_LIMIT = 400


def _identity(surface: dict | None) -> str:
    provider = str((surface or {}).get("provider") or "").strip()
    return f" ({provider})" if provider else ""


def _copy_key(surface: dict | None) -> str:
    """``code.<c>`` / ``layer.<l>`` / ``default`` under ``tui_gateway.turn_error``."""
    surface = surface if isinstance(surface, dict) else {}
    code = str(surface.get("code") or "")
    code = _CODE_ALIASES.get(code, code)
    if code in _CODE_KEYS:
        return f"code.{code}"
    layer = str(surface.get("layer") or "")
    if layer == "billing":  # same copy as the billing code
        return "code.billing"
    return f"layer.{layer}" if layer in _LAYER_KEYS else "default"


def turn_error_title(surface: dict | None) -> str:
    """Plain title for a failed turn, picked from ``error_surface`` code then layer."""
    return f"{_t(f'tui_gateway.turn_error.{_copy_key(surface)}.title')}{_identity(surface)}"


def turn_error_hint(surface: dict | None, recoverable: bool = True) -> str:
    key = _copy_key(surface)
    if not recoverable and key in _RETRY_LED_HINTS:
        return _t(f"tui_gateway.turn_error.{key}.hint_unrecoverable")
    return _t(f"tui_gateway.turn_error.{key}.hint")


def turn_error_text(error: Any, surface: dict | None = None, *, recoverable: bool = True) -> str:
    """The assistant-slot text for a turn that produced no reply: title, what it means for the
    user, the raw provider detail on its own dimmed-able line, and the next step."""
    detail = " ".join(str(error or "").split())
    if len(detail) > _DETAIL_LIMIT:
        detail = detail[:_DETAIL_LIMIT - 1] + "…"
    lines = [_t("tui_gateway.turn_error.not_answered", title=turn_error_title(surface))]
    if detail:
        lines.append(_t("tui_gateway.turn_error.details", detail=detail))
    lines.append(turn_error_hint(surface, recoverable))
    return "\n".join(lines)


def busy_message(command: str, compressing: bool = False) -> str:
    """4009 refusal for a history-mutating command while a reply is streaming. There is no
    ``/interrupt`` slash command on any client: Desktop has a Stop button, the terminal TUI uses
    Ctrl+C — name both without assuming which one the reader has. A manual /compress also holds
    the session busy, but nothing is replying and Stop does not end it: say to wait instead.
    Catalog prose, but the leading ``session busy`` stays English in every language: both clients
    match it to retry or soften."""
    key = "gateway.busy.compress_wait" if compressing else "gateway.busy.streaming_reply"
    return _t(key, command=command.lstrip("/"))


def handoff_busy_message() -> str:
    """4009 refusal for ``handoff.request`` while a reply is streaming — same marker contract."""
    return _t("gateway.busy.handoff_wait")


# Prefixes of the TimeoutErrors raised by ``hermes_cli.auth._auth_store_lock`` (profile
# auth.json) and ``hermes_cli.auth_nous._nous_shared_store_lock`` (cross-profile shared store)
# when the advisory lock times out (#124533). Both sit on the assistant-init path
# (``resolve_nous_access_token`` acquires the shared lock inside the profile lock), and init
# died on lock contention there — the generic /model /setup hints would send the user
# debugging credentials that are perfectly fine.
_AUTH_LOCK_TIMEOUT_PREFIXES = (
    "Timed out waiting for auth store lock",
    "Timed out waiting for shared Nous auth lock",
)


def agent_init_failed_message(exc: Any) -> str:
    lock = any(prefix in str(exc) for prefix in _AUTH_LOCK_TIMEOUT_PREFIXES)
    return _t("tui_gateway.agent.init_failed_lock" if lock else "tui_gateway.agent.init_failed", detail=str(exc))


def agent_still_starting() -> str:
    """5032 refusal for a command that needs the agent while the deferred build is still running."""
    return _t("tui_gateway.agent.still_starting")


# A deferred build that finished WITHOUT attaching an agent (its session record was replaced or
# closed while it ran) leaves ``agent_ready`` set and ``agent`` None; this is the recorded cause.
AGENT_BUILD_ABANDONED = "agent build aborted: the session was closed or replaced before the build finished"


def agent_missing_for_turn() -> str:
    """Turn refusal when the record still has no agent at admission time (reason unknown)."""
    return _t("tui_gateway.agent.missing_for_turn")


def resume_failed_message(exc: Any) -> str:
    return _t("tui_gateway.resume.failed", detail=str(exc))
