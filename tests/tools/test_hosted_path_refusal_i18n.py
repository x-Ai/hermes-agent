"""A hosted path the sandbox gives no meaning to is refused in the language the profile reads.

These refusals join the ``tools.hosted.*`` family (see test_hosted_refusal_i18n.py): the model and
the user both read them. A ``~`` the sandbox declared no home for, a ``~user`` path, a relative path
with no known sandbox directory and the write guard wrapping them are catalog copy; the path stays
as written and nothing falls back to English.
"""

from __future__ import annotations

import pytest

from agent import i18n
from tests.tools.test_sandbox_scope_conformance import A
from tests.tools.test_sandbox_scope_conformance import provider as _conformance_provider
from tools.environments import sandbox_conformance as c

provider = _conformance_provider  # the recording-sandbox fixture, by its name


@pytest.fixture
def language(monkeypatch):
    def use(lang: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", lang)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_hosted_tilde_refusals_are_worded_in_the_profile_language(provider, language, lang, monkeypatch, tmp_path):
    monkeypatch.setenv("HOME", str(tmp_path))
    language(lang)
    with c._bind(A):
        c.call_tool("terminal", {"command": "true"}, task_id="t")  # the sandbox is up, with no home
        no_home = c.call_tool("read_file", {"path": "~/notes.txt"}, task_id="t")
        user = c.call_tool("read_file", {"path": "~root/notes.txt"}, task_id="t")
        written = c.call_tool("write_file", {"path": "~root/x", "content": "x\n"}, task_id="t")
    no_home_msg = i18n.t("tools.hosted.no_sandbox_home", lang=lang, path=repr("~/notes.txt"))
    user_msg = i18n.t("tools.hosted.tilde_user_unsupported", lang=lang, path=repr("~root/notes.txt"))
    write_reason = i18n.t("tools.hosted.tilde_user_unsupported", lang=lang, path=repr("~root/x"))
    assert no_home_msg in no_home["error"], no_home
    assert user_msg in user["error"], user
    assert i18n.t("tools.hosted.write_refused", lang=lang, path="~root/x", reason=write_reason) in written["error"]
    for result in (no_home, user, written):
        assert "absolute path" not in result["error"] and "tools.hosted." not in result["error"], result


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_hosted_relative_path_without_a_sandbox_directory_is_refused_in_the_profile_language(
        provider, language, lang, monkeypatch):
    from tools import file_tools_paths

    language(lang)
    monkeypatch.setattr(file_tools_paths, "_authoritative_workspace_root", lambda task_id="default": None)
    with c._bind(A), pytest.raises(ValueError) as refused:
        file_tools_paths._resolve_base_dir("t", container_paths=False)
    assert str(refused.value) == i18n.t("tools.hosted.relative_path_unanchored", lang=lang)
    assert "Pass an absolute path" not in str(refused.value)


def test_english_stays_the_default_wording(provider, monkeypatch, tmp_path):
    monkeypatch.setenv("HOME", str(tmp_path))
    monkeypatch.delenv("HERMES_LANGUAGE", raising=False)
    i18n.reset_language_cache()
    with c._bind(A):
        c.call_tool("terminal", {"command": "true"}, task_id="t")
        written = c.call_tool("write_file", {"path": "~/notes.txt", "content": "x\n"}, task_id="t")
    assert written["error"].startswith("Refusing to write to ~/notes.txt: Cannot resolve '~/notes.txt'")
    assert "declared no home directory. Pass an absolute path." in written["error"]
