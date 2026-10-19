"""``load_user_config_effective`` (the gateway's policy and pick reads, cron, the send tool, …) applies
the same shared-providers overlay as ``load_config()``: a sharing profile's effective ``providers:``
carry the default profile's custom endpoints, expanded against the profile's secret scope, cached on
the same signatures (the default profile's config.yaml and the profile.yaml flag), while the raw user
file and the default profile itself stay untouched."""
from __future__ import annotations

import pytest

from hermes_cli import config_effective
from hermes_cli import profiles_shared_providers as shared
from tests.hermes_cli.test_profiles_shared_providers import ROOT_CONFIG, _bump, make_homes, profile_scope


@pytest.fixture
def homes(tmp_path, monkeypatch):
    return make_homes(tmp_path, monkeypatch)


def _effective_providers(home):
    with profile_scope(home):
        return config_effective.load_user_config_effective(home / "config.yaml").get("providers") or {}


def test_the_effective_user_config_reads_the_shared_endpoints_through(homes):
    root, bot = homes
    assert set(_effective_providers(bot)) == {"mine", "relay"}  # an island sees only its own file
    shared.set_profile_shares_providers(bot, True)
    providers = _effective_providers(bot)
    assert set(providers) == {"mine", "relay", "slotted"}
    assert providers["relay"]["base_url"] == "https://relay.example.com/v1"
    assert providers["relay"]["api_key"] == "root-relay-secret"  # the shared key, through the profile's scope
    assert providers["mine"]["base_url"] == "https://mine.example.com/v1"
    # The raw user layer (the write-back primitive) and the default profile never carry the overlay.
    from hermes_cli.config import read_user_config_raw
    assert set(read_user_config_raw(bot / "config.yaml")["providers"]) == {"mine", "relay"}
    assert set(_effective_providers(root)) == {"relay", "slotted", "xai", "dormant"}


def test_effective_config_follows_the_default_profile_and_serves_repeats_from_cache(homes, monkeypatch):
    root, bot = homes
    shared.set_profile_shares_providers(bot, True)
    assert "later" not in _effective_providers(bot)
    (root / "config.yaml").write_text(
        ROOT_CONFIG + "  later:\n    name: Later\n    base_url: https://later.example.com/v1\n", encoding="utf-8")
    _bump(root / "config.yaml")
    assert _effective_providers(bot)["later"]["base_url"] == "https://later.example.com/v1"

    # Nothing changed since: both reads are cache hits that still carry the overlay.
    builds = []
    real = config_effective._effective
    monkeypatch.setattr(config_effective, "_effective", lambda raw: builds.append(1) or real(raw))
    assert "later" in _effective_providers(bot) and "later" in _effective_providers(bot)
    assert builds == []

    shared.set_profile_shares_providers(bot, False)
    _bump(bot / "profile.yaml")
    assert set(_effective_providers(bot)) == {"mine", "relay"}
