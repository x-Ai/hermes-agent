"""``provision_profile`` keeps the fork's share switch: ``share_auth`` makes the new profile read the
default profile's model providers through (profile.yaml ``share_providers``), strips the provider keys
the mirrored .env would otherwise shadow them with, and flags the profile BEFORE the model step, so a
pick naming a default-profile endpoint validates inside the new profile.
"""

from __future__ import annotations

from pathlib import Path

import hermes_yaml as yaml
import pytest

from agent.secret_scope import load_env_file
from hermes_cli import profile_provision, profiles
from hermes_cli.profile_provision import ProfileCreateRequest, provision_profile
from hermes_cli.profiles_shared_providers import profile_shares_providers


@pytest.fixture()
def launch(tmp_path, monkeypatch):
    home = tmp_path / ".hermes"
    home.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(home))
    (home / "config.yaml").write_text(
        "model:\n  provider: acme\n  default: m-1\n"
        "providers:\n  acme:\n    name: Acme\n    base_url: https://acme.example.com/v1\n"
        "    api_key: ${ACME_TOKEN}\n    model: m-1\n", encoding="utf-8")
    (home / ".env").write_text("ACME_TOKEN=root-acme-secret\nBRAVE_API_KEY=root-brave-key\n", encoding="utf-8")
    monkeypatch.setattr(profiles, "seed_profile_skills", lambda path, quiet=True: {"copied": []})
    monkeypatch.setattr(profiles, "check_alias_collision", lambda name: None)
    monkeypatch.setattr(profiles, "create_wrapper_script", lambda name: None)
    return home


def _profile_yaml(path: Path) -> dict:
    target = path / "profile.yaml"
    return (yaml.safe_load(target.read_text(encoding="utf-8")) or {}) if target.is_file() else {}


def test_share_auth_reads_providers_through_instead_of_copying_them(launch):
    result = provision_profile(ProfileCreateRequest(name="scout", mirror_credentials=True, share_auth=True))

    assert result.warnings == []
    assert result.mirrored["providers"] == "shared"
    assert result.mirrored["auth"] == "shared"
    assert _profile_yaml(result.path).get("share_providers") is True
    assert profile_shares_providers(result.path) is True
    # Provider keys are read through from the default profile; tool keys still travel.
    assert load_env_file(result.path / ".env") == {"BRAVE_API_KEY": "root-brave-key"}


def test_the_profile_shares_before_its_model_pick_is_written(launch, monkeypatch):
    sharing_at_pin = []

    def fake_write_profile_model(path, provider, model, validate_in=None, base_url=""):
        sharing_at_pin.append(profile_shares_providers(path))

    monkeypatch.setattr(profile_provision, "write_profile_model", fake_write_profile_model)
    result = provision_profile(ProfileCreateRequest(
        name="scout", mirror_credentials=True, share_auth=True, model="m-1", provider="acme"))

    assert result.model_set is True
    assert sharing_at_pin == [True]


def test_an_island_profile_keeps_its_own_copies_and_no_share_flag(launch):
    result = provision_profile(ProfileCreateRequest(name="lone", mirror_credentials=True))

    assert "providers" not in result.mirrored
    assert "share_providers" not in _profile_yaml(result.path)
    assert load_env_file(result.path / ".env") == {
        "ACME_TOKEN": "root-acme-secret", "BRAVE_API_KEY": "root-brave-key"}
    config = yaml.safe_load((result.path / "config.yaml").read_text(encoding="utf-8")) or {}
    assert config["providers"]["acme"]["api_key"] == "${ACME_TOKEN}"
