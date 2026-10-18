"""Connector refusals both connector handlers send: the legacy one (``methods_connectors``) and the session authority's (``gateway/session_connections``). Each entry is ``(code, ConnectorErrorReason, message)`` where ``message`` is a ``tui_gateway.connectors.*`` catalog key: module constants are built at import, before any client language is known, so the sinks resolve the key through ``message()`` at refusal time."""
from tools.connectors.run import LINK_STILL_VALID, MIXED_KINDS, NOT_ALLOWED, REFUSED, SETTLED, UNKNOWN_TARGET

from agent.i18n import t as _t
from tui_gateway.contracts.connectors import ConnectorErrorReason as Reason

INVALID_PARAMS = (4000, Reason.invalid_params, "tui_gateway.connectors.params_invalid")
INVALID_ANSWER = (4002, Reason.invalid_answer, "tui_gateway.connectors.answer_invalid")
UNKNOWN_OPERATION = (4004, Reason.unknown_operation, "tui_gateway.connectors.no_operation_for_id")
UNKNOWN_TARGET_REFUSAL = (4004, Reason.unknown_target, "tui_gateway.connectors.no_such_target")
CONNECTORS_UNAVAILABLE = (4031, Reason.connectors_unavailable, "tui_gateway.connectors.unavailable_in_session")
REQUEST_FAILED = (5034, Reason.connector_request_failed, "tui_gateway.connectors.request_failed")
REISSUE_REFUSED = (4002, Reason.reissue_refused, "tui_gateway.connectors.target_not_rerunnable")
REISSUE_REFUSALS = {
    UNKNOWN_TARGET: UNKNOWN_TARGET_REFUSAL,
    MIXED_KINDS: (4000, Reason.invalid_params, "tui_gateway.connectors.one_target_kind"),
    LINK_STILL_VALID: (4002, Reason.link_still_valid, "tui_gateway.connectors.reopen_link"),
    SETTLED: (4002, Reason.reissue_refused, "tui_gateway.connectors.operation_settled"),
    NOT_ALLOWED: (4002, Reason.reissue_refused, "tui_gateway.connectors.target_not_rerunnable_this"),
    REFUSED: REISSUE_REFUSED,
}


def auth_refusal(exc):
    """The refusal for a ``GatewayAuthError``."""
    if exc.code in {"no_access", "ORG_ACCESS_DENIED"}:
        return 4030, Reason.org_access_denied, "tui_gateway.connectors.cannot_manage_org"
    if exc.status == 401 or exc.code in {"invalid_token", "INVALID_TOKEN", "NO_TOKEN"}:
        return 4032, Reason.needs_nous_auth, "tui_gateway.connectors.sign_in"
    return 4030, Reason.forbidden_scope, "tui_gateway.connectors.access_not_permitted"


def message(text_or_key: str) -> str:
    """The human message of a refusal entry, in the caller's language: a ``tui_gateway.`` catalog key is
    resolved now, any other text (a legacy literal) passes through unchanged."""
    return _t(text_or_key) if text_or_key.startswith("tui_gateway.") else text_or_key
