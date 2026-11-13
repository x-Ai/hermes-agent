"""skill_manage's refusal when the opt-in post-write security scan cannot finish reads in the
caller's language.

``_security_scan_skill``'s string becomes the tool result's ``error``, which the model and the user
both read, so it is catalog copy (``tools.skill_manager.scan_incomplete``): English stays
byte-identical to the upstream sentence, the scanner's exception text stays verbatim inside every
translation, and the refused write still leaves no skill behind.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest

from agent import i18n
from tools.skill_manager_tool import _create_skill, _security_scan_skill

ENGLISH = "Security scan could not complete, so this skill was blocked: boom"
CONTENT = "---\nname: scan-crash\ndescription: A skill whose post-write scan crashes.\n---\n\n# Scan crash\n"


@pytest.fixture
def crashing_scan(monkeypatch):
    """The guard is on and the scanner raises, so every write must be refused."""
    # The autouse temp HERMES_HOME has no display.language, so English is the profile default.
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    with patch("tools.skill_manager_tool._guard_agent_created_enabled", return_value=True), \
         patch("tools.skill_manager_tool.scan_skill", side_effect=UnicodeError("boom")):
        yield
    i18n.reset_language_cache()


def test_english_refusal_keeps_the_upstream_sentence(crashing_scan, tmp_path):
    assert _security_scan_skill(tmp_path) == ENGLISH


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_refusal_follows_the_profile_language(crashing_scan, tmp_path, monkeypatch, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    i18n.reset_language_cache()

    refusal = _security_scan_skill(tmp_path)

    assert refusal == i18n.t("tools.skill_manager.scan_incomplete", lang=lang, error="boom")
    assert refusal != ENGLISH and "boom" in refusal
    assert "tools.skill_manager" not in refusal


def test_refused_create_reports_the_localized_error_and_keeps_no_skill(crashing_scan, tmp_path, monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "zh")
    i18n.reset_language_cache()

    with patch("tools.skill_manager_tool.SKILLS_DIR", tmp_path), \
         patch("agent.skill_utils.get_all_skills_dirs", return_value=[tmp_path]):
        result = _create_skill("scan-crash", CONTENT)

    assert result == {"success": False,
                      "error": i18n.t("tools.skill_manager.scan_incomplete", lang="zh", error="boom")}
    assert not (tmp_path / "scan-crash").exists()
