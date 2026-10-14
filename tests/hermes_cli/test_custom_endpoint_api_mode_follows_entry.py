"""Editing a custom endpoint's protocol must stick across a backend restart.

Two readers kept the protocol the endpoint had when it was first set up:

- ``current_custom_provider_api_mode`` — what a resumed session asks for the entry's CURRENT
  protocol — only answered for the ``custom:<name>`` spelling. A session row persists the provider
  identity it ran under, and for a ``providers:`` entry that is frequently the bare key
  (``in-y-x``, ``g-m-i``), so resume kept the row's protocol and the chat the Desktop restores on
  launch ran the old one.
- The ``model:`` mirror ``activate`` writes (``base_url``, ``api_mode``) was never touched by a later
  edit of the same endpoint.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

CONFIG = """model:
  provider: foo
  default: m1
  base_url: https://x.example/v1
  api_mode: chat_completions
  key_env: FOO_KEY
providers:
  foo:
    name: foo
    base_url: https://x.example/v1
    key_env: FOO_KEY
    model: m1
    api_mode: chat_completions
    models:
      m1: {}
  other:
    name: other
    base_url: https://o.example/v1
    key_env: FOO_KEY
    model: m2
    api_mode: chat_completions
"""


@pytest.fixture
def home(tmp_path, monkeypatch):
    root = tmp_path / ".hermes"
    root.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(root))
    (root / "config.yaml").write_text(CONFIG, encoding="utf-8")
    (root / ".env").write_text("FOO_KEY=sk-test\n", encoding="utf-8")
    return root


def _saved(home: Path) -> dict:
    return yaml.safe_load((home / "config.yaml").read_text(encoding="utf-8"))


def _body(endpoint_id: str, base_url: str, model: str, api_mode: str):
    from hermes_cli.web_models import CustomEndpointUpdate

    return CustomEndpointUpdate(
        id=endpoint_id, name=endpoint_id, base_url=base_url, api_key="", model=model, api_mode=api_mode, models=[model])


def test_the_lookup_answers_for_the_bare_key_and_the_custom_spelling_alike(home):
    from hermes_cli.runtime_provider import current_custom_provider_api_mode

    assert current_custom_provider_api_mode("foo", model="m1") == "chat_completions"
    assert current_custom_provider_api_mode("custom:foo", model="m1") == "chat_completions"
    # Bare custom, a built-in provider and an unknown name have no entry to read.
    assert current_custom_provider_api_mode("custom") is None
    assert current_custom_provider_api_mode("openai") is None
    assert current_custom_provider_api_mode("nope") is None


def test_editing_the_current_endpoint_protocol_moves_the_mirror_with_it(home):
    import hermes_cli.web_routers.config_env as mod
    from hermes_cli.runtime_provider import current_custom_provider_api_mode

    assert mod.upsert_custom_endpoint(_body("foo", "https://x.example/v1", "m1", "codex_responses"))["ok"] is True

    saved = _saved(home)
    assert saved["providers"]["foo"]["api_mode"] == "codex_responses"
    assert saved["model"]["api_mode"] == "codex_responses"
    assert saved["model"]["base_url"] == "https://x.example/v1"
    assert current_custom_provider_api_mode("foo", model="m1") == "codex_responses"

    # Back to auto-detect: the pin leaves the entry AND the mirror.
    mod.upsert_custom_endpoint(_body("foo", "https://x.example/v1", "m1", ""))
    saved = _saved(home)
    assert "api_mode" not in saved["providers"]["foo"]
    assert "api_mode" not in saved["model"]


def test_editing_another_endpoint_leaves_the_main_slot_alone(home):
    import hermes_cli.web_routers.config_env as mod

    mod.upsert_custom_endpoint(_body("other", "https://o.example/v1", "m2", "codex_responses"))

    saved = _saved(home)
    assert saved["providers"]["other"]["api_mode"] == "codex_responses"
    assert saved["model"]["api_mode"] == "chat_completions"
    assert saved["model"]["base_url"] == "https://x.example/v1"
