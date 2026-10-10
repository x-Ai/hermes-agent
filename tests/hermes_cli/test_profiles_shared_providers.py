"""A bot profile that shares the default profile's model providers (``hermes_cli/profiles_shared_providers.py``).

Custom endpoints and their keys live per profile; creation mirrored them once, so an endpoint added or
a key rotated in the default profile never reached an existing bot, while the New Bot switch promised
"API keys stay shared (not copied)". A sharing profile (``profile.yaml`` ``share_providers``) reads the
default profile's endpoints through ``load_config()`` and their credentials through its secret scope
(and the standalone dotenv load); an island keeps today's semantics; leaving the shared mode copies
the pinned endpoint in once.
"""

from __future__ import annotations

import contextlib
import os
from pathlib import Path

import pytest
import hermes_yaml as yaml

from agent.secret_scope import build_profile_secret_scope, load_env_file, reset_secret_scope, set_secret_scope
from hermes_cli import profiles_shared_providers as shared
from hermes_constants import reset_hermes_home_override, set_hermes_home_override

ROOT_CONFIG = """\
model:
  provider: relay
  default: m-1
providers:
  relay:
    name: Relay
    base_url: https://relay.example.com/v1
    api_key: ${RELAY_TOKEN}
    model: m-1
    models:
      m-2: {}
  slotted:
    name: Slotted
    base_url: https://slotted.example.com/v1
  xai:
    base_url: https://proxy.example.com/v1
  dormant:
    base_url: https://off.example.com/v1
    enabled: false
"""
ROOT_ENV = ("RELAY_TOKEN=root-relay-secret\nHERMES_CUSTOM_SLOTTED_API_KEY=root-slotted-secret\n"
            "ANTHROPIC_API_KEY=root-anthropic-secret\nTELEGRAM_BOT_TOKEN=root-telegram-token\n")
# The bot's own file: an endpoint only it defines, plus a creation-time copy of ``relay`` that has
# since drifted from the default profile (old URL, old key).
BOT_CONFIG = """\
model:
  provider: relay
  default: m-1
providers:
  mine:
    name: Mine
    base_url: https://mine.example.com/v1
  relay:
    name: Relay
    base_url: https://old-relay.example.com/v1
    api_key: ${RELAY_TOKEN}
"""
BOT_ENV = "RELAY_TOKEN=stale-relay-copy\nHERMES_CUSTOM_MINE_API_KEY=bot-mine-secret\nTELEGRAM_BOT_TOKEN=bot-telegram-token\n"


@pytest.fixture
def homes(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(ROOT_CONFIG, encoding="utf-8")
    (root / ".env").write_text(ROOT_ENV, encoding="utf-8")
    bot = root / "profiles" / "bot"
    bot.mkdir(parents=True)
    (bot / "config.yaml").write_text(BOT_CONFIG, encoding="utf-8")
    (bot / ".env").write_text(BOT_ENV, encoding="utf-8")
    return root, bot


@contextlib.contextmanager
def profile_scope(home: Path):
    """The runtime scope a profile's bodies run in: its home plus its secret scope."""
    home_token = set_hermes_home_override(str(home))
    secret_token = set_secret_scope(build_profile_secret_scope(home), profile_home=str(home))
    try:
        yield
    finally:
        reset_secret_scope(secret_token)
        reset_hermes_home_override(home_token)


def _providers(home: Path) -> dict:
    from hermes_cli.config import load_config
    with profile_scope(home):
        return load_config()["providers"]


def _bump(path: Path) -> None:
    """A rewrite within the same mtime tick must still read as a change."""
    st = path.stat()
    os.utime(path, ns=(st.st_atime_ns, st.st_mtime_ns + 1_000_000))


def test_flag_round_trips_in_profile_yaml_and_the_default_root_never_shares(homes):
    root, bot = homes
    assert shared.profile_shares_providers(bot) is False
    shared.set_profile_shares_providers(bot, True)
    assert shared.profile_shares_providers(bot) is True
    assert yaml.safe_load((bot / "profile.yaml").read_text(encoding="utf-8")) == {"share_providers": True}
    shared.set_profile_shares_providers(bot, False)
    assert shared.profile_shares_providers(bot) is False
    assert "share_providers" not in (bot / "profile.yaml").read_text(encoding="utf-8")
    shared.set_profile_shares_providers(root, True)
    assert shared.profile_shares_providers(root) is False


def test_sharing_profile_reads_the_default_profiles_endpoints_through(homes):
    root, bot = homes
    # An island sees only its own file.
    assert set(_providers(bot)) == {"mine", "relay"}
    assert _providers(bot)["relay"]["base_url"] == "https://old-relay.example.com/v1"

    shared.set_profile_shares_providers(bot, True)
    providers = _providers(bot)
    # ``slotted`` arrives; ``xai`` is a built-in's settings block and ``dormant`` is disabled; the
    # shared ``relay`` wins over the drifted local copy, down to the key it expands to; ``mine`` stays.
    assert set(providers) == {"mine", "relay", "slotted"}
    assert providers["relay"]["base_url"] == "https://relay.example.com/v1"
    assert providers["relay"]["api_key"] == "root-relay-secret"
    assert providers["mine"]["base_url"] == "https://mine.example.com/v1"
    # The default profile itself is untouched by the mode.
    assert set(_providers(root)) == {"relay", "slotted", "xai", "dormant"}


def test_default_profile_changes_reach_a_sharing_profile_without_a_restart(homes):
    root, bot = homes
    shared.set_profile_shares_providers(bot, True)
    assert "later" not in _providers(bot)

    (root / "config.yaml").write_text(
        ROOT_CONFIG + "  later:\n    name: Later\n    base_url: https://later.example.com/v1\n", encoding="utf-8")
    _bump(root / "config.yaml")
    assert _providers(bot)["later"]["base_url"] == "https://later.example.com/v1"

    shared.set_profile_shares_providers(bot, False)
    _bump(bot / "profile.yaml")
    assert set(_providers(bot)) == {"mine", "relay"}


def test_save_round_trip_keeps_shared_endpoints_out_of_the_profiles_file(homes):
    root, bot = homes
    shared.set_profile_shares_providers(bot, True)
    from hermes_cli.config import load_config, save_config
    with profile_scope(bot):
        cfg = load_config()
        cfg["model"]["default"] = "m-2"
        save_config(cfg)
    raw = yaml.safe_load((bot / "config.yaml").read_text(encoding="utf-8"))
    assert raw["model"]["default"] == "m-2"
    # No ``slotted``; the drifted local ``relay`` copy stays exactly as the file had it.
    assert set(raw["providers"]) == {"mine", "relay"}
    assert raw["providers"]["relay"]["base_url"] == "https://old-relay.example.com/v1"
    assert raw["providers"]["relay"]["api_key"] == "${RELAY_TOKEN}"
    # And the default profile's file was never written.
    assert (root / "config.yaml").read_text(encoding="utf-8") == ROOT_CONFIG


def test_secret_scope_layers_only_the_default_profiles_provider_credentials(homes):
    root, bot = homes
    island = build_profile_secret_scope(bot)
    assert island["RELAY_TOKEN"] == "stale-relay-copy"
    assert "HERMES_CUSTOM_SLOTTED_API_KEY" not in island and "ANTHROPIC_API_KEY" not in island

    shared.set_profile_shares_providers(bot, True)
    scope = build_profile_secret_scope(bot)
    # Provider credentials: the shared endpoint's variable, the dashboard slot, a registry provider's key.
    assert scope["RELAY_TOKEN"] == "root-relay-secret"
    assert scope["HERMES_CUSTOM_SLOTTED_API_KEY"] == "root-slotted-secret"
    assert scope["ANTHROPIC_API_KEY"] == "root-anthropic-secret"
    # The bot's own endpoint key is its own; a channel token never crosses.
    assert scope["HERMES_CUSTOM_MINE_API_KEY"] == "bot-mine-secret"
    assert scope["TELEGRAM_BOT_TOKEN"] == "bot-telegram-token"


def test_standalone_dotenv_load_layers_the_same_credentials(homes, monkeypatch):
    root, bot = homes
    for name in ("RELAY_TOKEN", "HERMES_CUSTOM_SLOTTED_API_KEY", "HERMES_CUSTOM_MINE_API_KEY", "TELEGRAM_BOT_TOKEN"):
        monkeypatch.delenv(name, raising=False)
    shared.set_profile_shares_providers(bot, True)
    from hermes_cli.env_loader import load_hermes_dotenv

    load_hermes_dotenv(hermes_home=bot, load_external_secrets=False)

    assert os.environ["RELAY_TOKEN"] == "root-relay-secret"
    assert os.environ["HERMES_CUSTOM_SLOTTED_API_KEY"] == "root-slotted-secret"
    assert os.environ["HERMES_CUSTOM_MINE_API_KEY"] == "bot-mine-secret"
    assert os.environ["TELEGRAM_BOT_TOKEN"] == "bot-telegram-token"


def test_endpoint_rows_and_key_variables_read_the_raw_entry():
    entry = {"name": "Relay", "base_url": "https://relay.example.com/v1", "model": "m-1",
             "models": {"m-2": {}, "m-1": {}, "__discovered_model_catalog__": {}}}
    assert shared.endpoint_models(entry) == ["m-1", "m-2"]
    assert shared.endpoint_models({"models": [{"id": "a"}, "b", {"name": "c"}]}) == ["a", "b", "c"]
    assert shared.endpoint_url({"api": "https://x.example.com/v1"}) == "https://x.example.com/v1"
    assert shared.endpoint_name("relay", {}) == "relay"
    assert shared.endpoint_key_env("relay", {"key_env": "MY_KEY", "api_key": "${OTHER}"}) == "MY_KEY"
    assert shared.endpoint_key_env("relay", {"api_key_env": "ALIASED"}) == "ALIASED"
    assert shared.endpoint_key_env("relay", {"api_key": "${RELAY_TOKEN}"}) == "RELAY_TOKEN"
    assert shared.endpoint_key_env("relay", {"api_key": "${env:RELAY_TOKEN}"}) == "RELAY_TOKEN"
    assert shared.endpoint_key_env("relay", {"api_key": "sk-literal"}) == ""
    assert shared.endpoint_key_env("relay", {}) == "HERMES_CUSTOM_RELAY_API_KEY"


def test_adopt_copies_a_default_endpoint_with_its_pointer_and_key_once(homes):
    root, bot = homes
    (bot / "config.yaml").write_text("model:\n  provider: slotted\n  default: x\n", encoding="utf-8")
    (bot / ".env").write_text("HERMES_CUSTOM_MINE_API_KEY=bot-mine-secret\n", encoding="utf-8")
    with profile_scope(bot):
        assert shared.adopt_default_endpoint(bot, "relay") == {"entry": True, "key_env": "RELAY_TOKEN", "key_copied": True}
        # No credential field at all: the dashboard slot is the variable that travels.
        assert shared.adopt_default_endpoint(bot, "slotted") == {
            "entry": True, "key_env": "HERMES_CUSTOM_SLOTTED_API_KEY", "key_copied": True}
        # Not a default-profile endpoint the file lacks: nothing happens.
        for provider in ("relay", "xai", "dormant", "anthropic", "nope"):
            assert shared.adopt_default_endpoint(bot, provider)["entry"] is False
    cfg = yaml.safe_load((bot / "config.yaml").read_text(encoding="utf-8"))
    assert cfg["providers"]["relay"]["api_key"] == "${RELAY_TOKEN}"  # the pointer, never the secret
    assert cfg["model"] == {"provider": "slotted", "default": "x"}
    env = load_env_file(bot / ".env")
    assert env == {"HERMES_CUSTOM_MINE_API_KEY": "bot-mine-secret", "RELAY_TOKEN": "root-relay-secret",
                   "HERMES_CUSTOM_SLOTTED_API_KEY": "root-slotted-secret"}
    assert load_env_file(root / ".env") == load_env_file(root / ".env") and (root / "config.yaml").read_text(
        encoding="utf-8") == ROOT_CONFIG


def test_adopt_never_overwrites_a_key_the_profile_already_holds(homes):
    root, bot = homes
    (bot / "config.yaml").write_text("model:\n  provider: relay\n  default: m-1\n", encoding="utf-8")
    with profile_scope(bot):
        assert shared.adopt_default_endpoint(bot, "relay") == {"entry": True, "key_env": "RELAY_TOKEN", "key_copied": False}
    assert load_env_file(bot / ".env")["RELAY_TOKEN"] == "stale-relay-copy"
