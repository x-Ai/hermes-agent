"""``/diff``'s refusal to spawn git (the repository's filters could not be discovered) reads in the
caller's language.

The CLI prints ``collect_working_diff``'s error as is and the gateway's ``gateway.diff.failed``
frame is a bare ``{error}``, so the sentence itself is resolved per call through ``agent.i18n``:
English stays byte-identical to the upstream copy, and the ``FILTER_DISCOVERY_FAILED`` stand-in
stderr stays verbatim inside every translation. The gateway runs the collector in
``asyncio.to_thread``; a connected client's language claim must survive that hop.
"""

from __future__ import annotations

import asyncio

import pytest

from agent import i18n
from hermes_cli._subprocess_compat import FILTER_DISCOVERY_FAILED
from tools import working_diff
from tools.working_diff import collect_working_diff

ENGLISH = f"git could not be run safely for this repository ({FILTER_DISCOVERY_FAILED})."


@pytest.fixture
def refused_repo(tmp_path, monkeypatch):
    """git resolves, but the repository's filter drivers cannot be discovered: nothing is spawned."""
    monkeypatch.setattr(working_diff.shutil, "which", lambda *_args, **_kwargs: "/usr/bin/git")
    monkeypatch.setattr(working_diff, "noninteractive_repo_git_env", lambda cwd, base=None: None)

    def no_spawn(*_args, **_kwargs):
        raise AssertionError("git must not be spawned when filter discovery fails")

    monkeypatch.setattr(working_diff.subprocess, "run", no_spawn)
    # The autouse temp HERMES_HOME has no display.language, so English is the profile default.
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    yield str(tmp_path)
    i18n.reset_language_cache()


def test_english_refusal_keeps_the_upstream_sentence(refused_repo):
    assert collect_working_diff(refused_repo) == {"success": False, "error": ENGLISH}


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_refusal_follows_the_profile_language(refused_repo, monkeypatch, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    i18n.reset_language_cache()

    error = collect_working_diff(refused_repo)["error"]

    assert error == i18n.t("tools.working_diff.refused", lang=lang, reason=FILTER_DISCOVERY_FAILED)
    assert error != ENGLISH
    assert FILTER_DISCOVERY_FAILED in error
    assert "tools.working_diff" not in error


def test_client_language_claim_survives_the_gateway_thread_hop(refused_repo):
    async def gateway_diff() -> dict:
        token = i18n.bind_client_language("zh")
        try:
            return await asyncio.to_thread(collect_working_diff, refused_repo, "working")
        finally:
            i18n.reset_client_language(token)

    result = asyncio.run(gateway_diff())

    assert result["error"] == i18n.t("tools.working_diff.refused", lang="zh", reason=FILTER_DISCOVERY_FAILED)
    # The claim was scoped to that call; this context is back to English.
    assert collect_working_diff(refused_repo)["error"] == ENGLISH
