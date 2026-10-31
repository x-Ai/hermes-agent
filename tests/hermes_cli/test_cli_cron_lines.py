"""``/cron cancel`` and ``/cron runs`` on the classic CLI's line builders.

Both verbs already existed as subcommands (``hermes cron cancel``, ``hermes cron runs``) and in
``cronjob``; the in-chat forms were missing, so a wedged run could not be stopped from a chat and
the execution ledger was unreachable there. These pin the line builders and the read/write split
``cron_read`` gives the gateway (``runs`` is a read: it never touches the store).
"""

from __future__ import annotations

import pytest

from cron import executions
from cron.jobs import create_job


@pytest.fixture()
def cron_home(tmp_path, monkeypatch):
    monkeypatch.setattr("cron.jobs.CRON_DIR", tmp_path / "cron")
    monkeypatch.setattr("cron.jobs.JOBS_FILE", tmp_path / "cron" / "jobs.json")
    monkeypatch.setattr("cron.jobs.OUTPUT_DIR", tmp_path / "cron" / "output")
    monkeypatch.setattr(executions, "EXECUTIONS_FILE", tmp_path / "cron" / "executions.db")
    return tmp_path


def test_runs_reports_an_empty_ledger(cron_home):
    from hermes_cli.cli_cron_lines import cron_command_lines

    assert cron_command_lines("runs") == ["(._.) No cron execution attempts recorded."]


def test_runs_lists_a_terminal_attempt(cron_home):
    from hermes_cli.cli_cron_lines import cron_command_lines

    job = create_job(prompt="probe", schedule="every 1h", name="probe")
    record = executions.create_execution(job["id"], source="cli")
    executions.finish_execution(record["id"], success=True)

    out = "\n".join(cron_command_lines("runs"))

    assert record["id"] in out and "completed" in out and job["id"] in out


def test_runs_filters_by_job_and_honours_limit(cron_home):
    from hermes_cli.cli_cron_lines import cron_command_lines

    first = create_job(prompt="one", schedule="every 1h", name="one")
    second = create_job(prompt="two", schedule="every 1h", name="two")
    for job in (first, second):
        executions.finish_execution(executions.create_execution(job["id"], source="cli")["id"],
                                    success=True)

    only_first = "\n".join(cron_command_lines(f"runs {first['id']}"))

    assert first["id"] in only_first and second["id"] not in only_first
    capped = "\n".join(cron_command_lines("runs --limit 1"))
    assert capped.count("source=") == 1


def test_cancel_without_a_job_id_shows_usage(cron_home):
    from hermes_cli.cli_cron_lines import cron_command_lines

    assert cron_command_lines("cancel") == ["(._.) Usage: /cron cancel <job_id>"]


def test_cancel_with_nothing_in_flight_says_so(cron_home):
    from hermes_cli.cli_cron_lines import cron_command_lines

    job = create_job(prompt="probe", schedule="every 1h", name="probe")

    out = "\n".join(cron_command_lines(f"cancel {job['id']}"))

    assert "Nothing to cancel" in out


def test_cancel_requests_the_live_run_and_names_it(cron_home):
    from hermes_cli.cli_cron_lines import cron_command_lines

    job = create_job(prompt="probe", schedule="every 1h", name="probe")
    record = executions.create_execution(job["id"], source="cli")

    out = "\n".join(cron_command_lines(f"cancel {job['id']}"))

    assert "Cancel requested" in out and record["id"] in out


def test_runs_is_a_read_and_cancel_is_a_write():
    """The gateway answers a viewer's read with its deadline and refuses its writes."""
    from gateway.session_cron_commands import cron_read

    assert cron_read(["runs"]) == "runs"
    assert cron_read(["history", "abc"]) == "runs"
    assert cron_read(["cancel", "abc"]) is None


def test_a_bad_limit_names_the_limit_flag(cron_home):
    """``--limit`` and ``--repeat`` each own their message; a bad limit never blames ``--repeat``."""
    from hermes_cli.cli_cron_lines import cron_command_lines

    assert cron_command_lines("runs --limit abc") == ["(._.) --limit must be an integer"]
    assert cron_command_lines("add every 1h probe --repeat xyz") == ["(._.) --repeat must be an integer"]


def test_limit_zero_clamps_like_the_subcommand(cron_home):
    """``hermes cron runs --limit 0`` floors at one row (``list_executions``); the chat form must too."""
    from hermes_cli.cli_cron_lines import cron_command_lines

    job = create_job(prompt="probe", schedule="every 1h", name="probe")
    for _ in range(2):
        executions.finish_execution(executions.create_execution(job["id"], source="cli")["id"], success=True)

    out = "\n".join(cron_command_lines("runs --limit 0"))

    assert out.count("source=") == 1
