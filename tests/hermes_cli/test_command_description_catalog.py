"""Every registry command carries ``slash.<name>.description`` in the English catalog.

``CommandDef.describe()`` falls back to the English ``description`` field when no catalog has the
key, so a command registered without it reads English in every language (CLI /help, TUI, gateway
command menus). ``test_catalog_keys_match_english`` cannot catch that on its own: it only holds the
other catalogs to ``en.yaml``. Once the key is in ``en.yaml``, that parity test demands it from
every locale.
"""

from __future__ import annotations

from pathlib import Path

from agent.i18n_layers import parse_locale_file
from hermes_cli.commands import COMMAND_REGISTRY

EN_CATALOG = Path(__file__).resolve().parents[2] / "locales" / "en.yaml"


def test_every_registry_command_has_an_english_catalog_description():
    catalog = parse_locale_file(EN_CATALOG)
    missing = [cmd.name for cmd in COMMAND_REGISTRY if f"slash.{cmd.name}.description" not in catalog]
    assert not missing, f"locales/en.yaml has no slash.<name>.description for: {missing}"
