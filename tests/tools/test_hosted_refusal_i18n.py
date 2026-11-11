"""A hosted scope's refusals are catalog copy, worded in the language the profile reads.

The model and the user both read a refusal (a tool result, ``/rollback``, an ``@`` reference warning,
a cron run), so ``tools/hosted_tool_policy.py`` words it through ``tools.hosted.*``: tool names and the
allowlist stay as written, a caller's ``tools.hosted.subject.*`` key and the feature label are
resolved in the reader's language, and the conformance check a hosted backend plugin runs holds in
any language.
"""

from __future__ import annotations

import asyncio

import pytest

from agent import i18n
from agent.runtime_scope import bind_state
from tests.tools.test_sandbox_scope_conformance import A, B
from tests.tools.test_sandbox_scope_conformance import provider as _conformance_provider
from tools.environments import sandbox_conformance as conformance
from tools.hosted_tool_policy import (
    HOST_FEATURES, HOSTED_TOOL_ALLOWLIST, HostedToolRefused, host_feature_refusal, hosted_tool_refusal,
    require_host_feature,
)

provider = _conformance_provider  # the recording-sandbox fixture, by its name


@pytest.fixture
def language(monkeypatch):
    def use(lang: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", lang)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_a_tool_refusal_is_worded_in_the_profile_language(language, lang):
    language(lang)
    with bind_state(A):
        refusal = hosted_tool_refusal("memory")
    assert refusal and "not available to a hosted agent" not in refusal
    assert i18n.t("tools.hosted.reason_sandbox_only", lang=lang) in refusal
    assert "memory" in refusal and all(tool in refusal for tool in HOSTED_TOOL_ALLOWLIST)


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_a_feature_refusal_resolves_its_subject_and_feature_label(language, lang):
    language(lang)
    with bind_state(A):
        refusal = host_feature_refusal("checkpoints", "tools.hosted.subject.checkpoint_restore")
    assert refusal and "tools.hosted." not in refusal
    assert i18n.t("tools.hosted.subject.checkpoint_restore", lang=lang) in refusal
    assert i18n.t("tools.hosted.feature.checkpoints", lang=lang) in refusal


def test_a_tool_name_subject_passes_through_and_mcp_names_its_server(language):
    language("zh")
    with bind_state(A):
        assert "delegate_task" in host_feature_refusal("delegation", "delegate_task")
        with pytest.raises(HostedToolRefused) as refused:
            require_host_feature("mcp_stdio", "tools.hosted.subject.mcp_stdio", name="files")
    assert "'files'" in str(refused.value) and "tools.hosted." not in str(refused.value)


def test_nothing_is_refused_or_worded_outside_a_hosted_scope(language):
    language("zh")
    assert hosted_tool_refusal("memory") is None
    assert host_feature_refusal("checkpoints", "tools.hosted.subject.checkpoint_restore") is None


def test_every_host_feature_has_a_catalog_label():
    """A feature added to HOST_FEATURES ships its label, or its refusal would fall back to English."""
    missing = [f for f in sorted(HOST_FEATURES)
               if i18n.t(f"tools.hosted.feature.{f}", lang="en") == f"tools.hosted.feature.{f}"]
    assert not missing, f"tools.hosted.feature.* labels missing from locales/en.yaml: {missing}"


def test_media_refusals_are_worded_in_the_profile_language(language):
    from tools import vision_tools as vision

    language("zh")
    with bind_state(A), pytest.raises(vision._ImagePrepError) as image:
        asyncio.run(vision._prepare_image("/workspace/a.png", "t", None, validate_decode=True))
    with bind_state(A), pytest.raises(ValueError) as video:
        asyncio.run(vision._materialize_video("/workspace/a.mp4", "t", []))
    assert str(image.value) == i18n.t("tools.hosted.image_unavailable", lang="zh")
    assert str(video.value) == i18n.t("tools.hosted.video_unavailable", lang="zh")


def test_the_host_tools_conformance_check_holds_in_any_language(provider, language):
    """A plugin author whose profile reads Chinese runs the same check and it still passes."""
    language("zh")
    conformance.check_host_tools_refused(provider, A, B)
