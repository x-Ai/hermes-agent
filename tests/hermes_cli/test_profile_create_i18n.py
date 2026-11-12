"""``hermes profile create`` speaks the terminal's language on every path that reaches its output.

Upstream moved the create's flag refusals into ``_refuse_create_args``, added a create through the
running gateway (``profile_provision_gateway``) whose errors end on the same ``Error:`` line, and made
the CLI print from a receipt a gateway may send. These pin that the refusals, the gateway errors and
the fork's shared-providers line still resolve through the catalog at call time.
"""

from __future__ import annotations

import contextlib
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


def _url_gateway_answering(monkeypatch, tmp_path, error) -> str:
    """This terminal in profile ``work``, pointed by URL at a gateway whose create raises *error*;
    returns how the errors name that gateway (resolved in the active language)."""
    import hermes_constants
    from hermes_cli import gateway_client
    from hermes_cli.profile_provision_gateway import _where

    class _Client:
        async def rpc(self, method, **_params):
            assert method == "profiles.create"
            raise error

    @contextlib.asynccontextmanager
    async def connect(endpoint=None):
        yield _Client()

    url = "wss://gw.invalid/api/ws"
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    monkeypatch.setenv("HERMES_TUI_GATEWAY_URL", url)
    monkeypatch.setattr(hermes_constants, "profile_name_for_home", lambda home: "work")
    monkeypatch.setattr(gateway_client, "connect_gateway", connect)
    return _where(url)


def test_routing_refusals_matched_by_code_and_reason_print_in_the_terminal_language(
        use_language, monkeypatch, tmp_path):
    """Upstream matches the gateway's routing refusals by code AND ``data.reason``; the fork's translated
    refusals stay on that path, and a handler failure merely named like one (5062) is the translated
    unknown outcome, never "nothing was created"."""
    from hermes_cli.gateway_client import GatewayRPCError
    use_language("zh")
    request = ProfileCreateRequest(name="scout", alias=False)

    mismatch = GatewayRPCError("profile_mismatch", 4001, {"reason": "profile_mismatch"})
    where = _url_gateway_answering(monkeypatch, tmp_path, mismatch)
    with pytest.raises(GatewayCreateError) as refused:
        create_through_gateway(request)
    assert str(refused.value) == _localized("shared.profile_create.gateway_profile_refused", "zh",
                                            where=where, profile="work")

    draining = GatewayRPCError("runtime_draining", 4001, {"reason": "runtime_draining"})
    where = _url_gateway_answering(monkeypatch, tmp_path, draining)
    with pytest.raises(GatewayCreateError) as restarting:
        create_through_gateway(request)
    assert str(restarting.value) == _localized("shared.profile_create.gateway_restarting", "zh", where=where)

    use_language("zh-hant")
    failed = GatewayRPCError("profile_mismatch", 5062, {"reason": "profile_mismatch"})
    where = _url_gateway_answering(monkeypatch, tmp_path, failed)
    with pytest.raises(GatewayCreateError) as unknown:
        create_through_gateway(request)
    may_have = _localized("shared.profile_create.gateway_may_have_created_remote", "zh-hant",
                          where=where, name="scout")
    assert str(unknown.value).endswith(may_have)
    assert i18n.t("shared.profile_create.gateway_profile_refused", lang="zh-hant", where=where,
                  profile="work") != str(unknown.value)


def test_an_unnamed_home_asking_a_url_gateway_for_its_command_reads_in_the_terminal_language(
        use_language, monkeypatch, tmp_path):
    """An alias request by URL now also runs discovery (to prove the gateway is this home's); a home
    outside the profiles tree is still refused first, in the terminal's language."""
    import hermes_constants
    use_language("zh-hant")
    where = _url_gateway_answering(monkeypatch, tmp_path, AssertionError("never sent"))
    monkeypatch.setattr(hermes_constants, "profile_name_for_home", lambda home: None)
    with pytest.raises(GatewayCreateError) as unnamed:
        create_through_gateway(ProfileCreateRequest(name="scout", alias=True))
    assert str(unnamed.value) == _localized("shared.profile_create.gateway_not_named_profile", "zh-hant",
                                            where=where)


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
