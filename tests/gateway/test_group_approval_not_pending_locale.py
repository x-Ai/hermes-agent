"""A translated "approval no longer pending" refusal still reaches the wire as its English reason."""

import pytest

from agent.i18n import bind_client_language, reset_client_language
from gateway.session_group_controls import _execution_control
from hermes_state_runtime import RuntimeStoreError
from tests.tui_gateway.test_hosted_room_stop_replay import _service


def test_an_answer_to_no_pending_approval_keeps_the_wire_reason_under_a_translated_ui(tmp_path):
    service = _service(tmp_path / "state.db")
    service.create_room(room_id="room", name="Approvals", members=[
        {"member_id": "default", "profile": "default", "handle": "hermes"},
        {"member_id": "ops", "profile": "ops", "handle": "ops"}])
    token = bind_client_language("zh")
    try:
        with pytest.raises(RuntimeStoreError) as refused:
            _execution_control(service, "groups.approve", {
                "room_id": "room", "member_id": "ops", "task_id": "task", "execution_generation": 1,
                "request_id": "stale", "choice": "once"})
    finally:
        reset_client_language(token)
    assert refused.value.reason == "room approval is no longer pending"
    # The service's own refusal kept its translated copy for the Desktop surface.
    assert "room approval" not in str(refused.value.__cause__)
