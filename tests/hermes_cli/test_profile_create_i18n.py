"""``hermes profile create`` speaks the terminal's language on every path that reaches its output.

Upstream moved the create's flag refusals into ``_refuse_create_args``, added a create through the
running gateway (``profile_provision_gateway``) whose errors end on the same ``Error:`` line, and made
the CLI print from a receipt a gateway may send. These pin that the refusals, the gateway errors and
the fork's shared-providers line still resolve through the catalog at call time.
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from agent import i18n
from hermes_cli import profile_cmd
from hermes_cli.profile_provision import ProfileCreateReceipt, ProfileCreateRequest, refusal_from
from hermes_cli.profile_provision_gateway import GatewayCreateError, create_through_gateway


@pytest.fixture
def use_language(monkeypatch):
    def use(code: str) -> None:
        monkeypatch.setenv("HERMES_LANGUAGE", code)
        i18n.reset_language_cache()

    yield use
    i18n.reset_language_cache()


def _localized(key: str, lang: str, **kwargs) -> str:
    text = i18n.t(key, lang=lang, **kwargs)
    assert text != i18n.t(key, lang="en", **kwargs)  # a real translation, not the English fallback
    return text


def _create_args(**overrides) -> SimpleNamespace:
    args = {"profile_name": "scout", "clone": False, "clone_all": False, "no_alias": True, "clone_from": None,
            "clone_channels": False, "sync_imports": False, "no_credentials": False, "isolated_auth": False,
            "no_skills": False, "description": None}
    return SimpleNamespace(**{**args, **overrides})


def test_create_refusals_print_in_the_terminal_language(use_language, capsys):
    use_language("zh")
    with pytest.raises(SystemExit):
        profile_cmd._profile_create(_create_args(clone_from="  "))
    assert capsys.readouterr().out.strip() == _localized("shared.profile_create.empty_name", "zh")

    with pytest.raises(SystemExit):
        profile_cmd._profile_create(_create_args(clone=True, no_credentials=True))
    assert capsys.readouterr().err.strip() == _localized("shared.profile_create.no_credentials_with_clone", "zh")


def test_gateway_create_errors_print_in_the_terminal_language(use_language, monkeypatch):
    use_language("zh-hant")
    monkeypatch.setenv("HERMES_TUI_GATEWAY_URL", "http://gw.invalid")
    with pytest.raises(GatewayCreateError) as bad_url:
        create_through_gateway(ProfileCreateRequest(name="scout"))
    assert str(bad_url.value) == _localized("shared.profile_create.gateway_bad_url", "zh-hant")


def test_a_gateway_refusal_without_text_reads_in_the_terminal_language(use_language):
    use_language("zh")
    refused = refusal_from({"type": "FileNotFoundError"})
    assert isinstance(refused, FileNotFoundError)
    assert str(refused) == _localized("shared.profile_create.gateway_refused", "zh")


def test_a_gateway_receipt_keeps_the_forks_shared_providers_line(use_language, capsys):
    use_language("zh")
    made = ProfileCreateReceipt.from_wire({
        "path": "/p/scout", "display_path": "~/.hermes/profiles/scout", "launch_label": "default",
        "source_label": "default", "skills_synced": 3, "skills_opted_out": False, "alias_path": None,
        "alias_collision": None, "mirrored": {"env": True, "providers": "shared", "auth": "shared"},
        "warnings": [], "cloned_plugins": [], "memory_provider": None, "channels_left_behind": [],
        "shared_channels": [], "served_now": None})
    assert made is not None and made.mirrored["providers"] == "shared"

    profile_cmd._print_mirrored(made.mirrored, made.launch_label, isolate_hint=True)
    assert _localized("shared.profile_create.providers_shared", "zh") in capsys.readouterr().out.splitlines()
