"""A refusal written in the user's language still compresses as a denial.

The pruned summary of a refused call must keep "did NOT consent" so a later prune pass never turns
the user's denial into a record of the action. English refusals carry that phrase in their text; a
localized one does not, so the terminal envelope's ``user_consent`` flag is what the compressor reads.
"""

import json

from agent.context_compressor import _PRUNE_MIN_CHARS, _summarize_tool_result
from tools.terminal_tool import _error_json

LOCALIZED_DENIAL = "BLOCKED：用户拒绝了此命令，用户尚未同意此操作，不要重试此命令，不要改写它"


def _summary(content: str) -> str:
    return _summarize_tool_result("terminal", json.dumps({"command": "rm -rf build"}), content)


def test_localized_denial_keeps_no_consent_through_the_envelope_flag():
    summary = _summary(_error_json(LOCALIZED_DENIAL, status="blocked", user_consent=False))

    assert "BLOCKED, not run" in summary and "did NOT consent" in summary, summary
    assert "ran `" not in summary and len(summary) <= _PRUNE_MIN_CHARS - 1


def test_localized_block_without_the_flag_is_still_not_run_but_claims_no_consent():
    # A hardline or deny-rule block never had the user's say, so it carries no consent flag: it reads as
    # blocked and not run, without attributing a refusal to the user.
    summary = _summary(_error_json(LOCALIZED_DENIAL, status="blocked"))

    assert "BLOCKED, not run" in summary and "did NOT consent" not in summary, summary
