"""The fork's ``context_pending`` flag (``agent/context_breakdown.py::context_usage_fields``) reaches the
gateway-published ``session.usage`` view too: a Desktop reading ``payload.usage`` off a local-viewer turn
drops its stale pre-compaction occupancy exactly as it does on the embedded ticker's frame."""
from __future__ import annotations

import pytest

from tests.gateway.test_local_viewer_usage import _agent


def _unmeasured():
    agent = _agent()
    agent.context_compressor.last_prompt_tokens = 0  # compacted; no API call has measured the new occupancy yet
    return agent


@pytest.mark.parametrize("agent", [pytest.param(_agent(), id="measured"), pytest.param(_unmeasured(), id="pending")])
def test_gateway_usage_view_carries_the_tickers_context_pending_flag(agent):
    from gateway.session_usage import tui_usage, usage_stats
    from tui_gateway.server import _get_usage

    view = tui_usage(usage_stats(agent))
    assert view == _get_usage(agent)
    pending = agent.context_compressor.last_prompt_tokens == 0
    assert view["context_pending"] is pending
    if pending:
        assert "context_used" not in view and view["context_max"] == 128000
