"""The reasoning_content echo-back recovery ``recover_before_classification`` runs (this fork).

A deepseek-/mimo-named model behind a non-vendor host runs lenient: real reasoning is echoed and
nothing is fabricated. A verbatim proxy to the vendor enforces the echo after all and 400s the first
replay of a reasoning-less tool-call turn. The route learns that once per (provider, model): it pads
from then on, and ``build_api_request`` re-pads the same ``api_messages`` on the retry.
"""
from __future__ import annotations

import logging
from typing import Any

from agent.message_sanitization import looks_like_reasoning_echo_required

logger = logging.getLogger("agent.conversation_loop")  # turn_recovery's logger: the same log stream


def promote_reasoning_echo_route(agent: Any, err_body: Any, model_key: Any) -> bool:
    """True once this route is promoted to must-echo, so the caller retries the request now; False when
    the error is not the echo-back 400 or the route already pads (the same error is not ours twice)."""
    if not looks_like_reasoning_echo_required(err_body) or agent._needs_thinking_reasoning_pad():
        return False
    from agent.turn_recovery import _vlines  # the facade's helper; late import, no module-level cycle
    agent._reasoning_echo_required_routes.add(model_key)
    _vlines(agent, "⚠️  Endpoint enforces reasoning_content echo-back — padding replayed turns for this model, retrying...")
    logger.warning("%sreasoning_content echo-back enforced by %s/%s: route promoted to must-echo for this session",
                   agent.log_prefix, agent.provider, agent.model)
    return True
