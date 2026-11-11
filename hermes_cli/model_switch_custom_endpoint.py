"""``/model`` onto a named custom endpoint keeps the wire protocol its entry selected.

``custom`` and ``custom:<name>`` are routes the user configured, ``api_mode`` included. When such an
entry points at a host that otherwise mandates one protocol (a relay on ``api.openai.com`` set to
``chat_completions``, an ``anthropic_messages`` proxy), the selected mode must survive the switch
instead of being replaced by the URL-based guess. Built-in providers keep the host's mandate, and a
custom route that resolved no mode still takes it.

Split out of ``hermes_cli/model_switch.py`` (the facade's size cap); the switch pipeline late-imports
it in ``_resolve_switch_credentials``.
"""

from __future__ import annotations

from typing import Optional


def keeps_selected_api_mode(provider: str, api_mode: Optional[str]) -> bool:
    """True when a host-mandated ``api_mode`` must not replace ``api_mode``: the target is a named
    custom endpoint (``custom`` / ``custom:<name>``, any case) that already resolved a mode."""
    norm = provider.strip().lower()
    return bool(api_mode) and (norm == "custom" or norm.startswith("custom:"))
