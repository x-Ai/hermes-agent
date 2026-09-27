"""Always-on entry points refuse before constructing a store for a profile that never opted in.

``WisdomStore()`` creates ``<home>/wisdom/wisdom.db`` on construction; the skill-load hook, the
gateway housekeeping chores and the inbound observe hook run for every profile, so the opt-in
(config-only) check has to come first.
"""

from __future__ import annotations

import threading

import pytest

from hermes_constants import get_hermes_home
from hermes_wisdom import entitlement


@pytest.fixture(autouse=True)
def not_opted_in(monkeypatch):
    monkeypatch.setattr("hermes_wisdom.service._config", lambda: {})


def _db_created() -> bool:
    return (get_hermes_home() / "wisdom" / "wisdom.db").exists()


def test_opted_in_is_the_enabled_flag_and_local_work_still_needs_the_disclosure(monkeypatch):
    assert not entitlement.opted_in()
    monkeypatch.setattr("hermes_wisdom.service._config", lambda: {"enabled": "yes"})
    assert not entitlement.opted_in()
    monkeypatch.setattr("hermes_wisdom.service._config", lambda: {"enabled": True})
    assert entitlement.opted_in()

    class Untouchable:
        def __getattr__(self, name):
            raise AssertionError(f"store.{name} consulted without the disclosure stamp")

    assert entitlement.local_work_allowed(Untouchable()) is False


def test_local_work_allowed_checks_config_before_touching_the_store():
    class Untouchable:
        def __getattr__(self, name):
            raise AssertionError(f"store.{name} consulted before the opt-in check")

    assert entitlement.local_work_allowed(Untouchable()) is False


def test_skill_load_hooks_create_no_store_without_opt_in(monkeypatch):
    from hermes_wisdom import qualification

    monkeypatch.setattr(
        threading, "Thread",
        lambda *a, **k: (_ for _ in ()).throw(AssertionError("must not spawn")),
    )
    qualification.record_successful_use_async("skill", task_id="t", session_id="s")
    qualification.record_mutation_async("skill", task_id="t", session_id="s")
    assert not _db_created()


def test_gateway_chores_create_no_store_without_opt_in():
    from gateway.run_wisdom import enqueue_weekly_review
    from gateway.wisdom_publication_cards import _claim_cards

    enqueue_weekly_review()
    assert _claim_cards("telegram") == []
    assert not _db_created()
