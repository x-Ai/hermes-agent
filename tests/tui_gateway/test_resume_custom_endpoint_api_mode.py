"""A resumed chat runs the custom endpoint's protocol as configured NOW.

The session row keeps the protocol the chat ran with next to the provider identity it ran under.
The Desktop restores the last chat on every launch, so a protocol edited in Settings after the row
was written was undone by each restart whenever the row carried the bare ``providers:`` key
rather than the ``custom:<name>`` spelling the refresh used to require.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

CONFIG = """model:
  provider: foo
  default: m1
  base_url: https://x.example/v1
  api_mode: codex_responses
  key_env: FOO_KEY
providers:
  foo:
    name: foo
    base_url: https://x.example/v1
    key_env: FOO_KEY
    model: m1
    api_mode: codex_responses
    models:
      m1: {}
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


def _row(provider: str) -> dict:
    # The row remembers chat_completions from when the endpoint was set up; Settings has since
    # pinned codex_responses on the entry.
    return {
        "id": "s1", "model": "m1", "title": "Chat", "source": "desktop",
        "model_config": json.dumps({"provider": provider, "base_url": "https://x.example/v1", "api_mode": "chat_completions"}),
    }


@pytest.mark.parametrize("provider", ["foo", "custom:foo"])
def test_resume_follows_the_entry_protocol_for_either_identity_spelling(home, provider):
    from tui_gateway import server

    overrides = server._stored_session_runtime_overrides(_row(provider))

    assert overrides["model_override"]["api_mode"] == "codex_responses"
    assert overrides["model_override"]["model"] == "m1"

    _model, runtime = server._resolve_agent_model_runtime(overrides["model_override"], overrides.get("provider_override"))
    assert runtime["api_mode"] == "codex_responses"
    assert runtime["base_url"] == "https://x.example/v1"
