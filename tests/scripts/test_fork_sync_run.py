"""The sync controller keeps both histories and refuses stale publication."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys

import pytest

CONTROLLER = Path(__file__).resolve().parents[2] / "scripts" / "fork_sync"


@pytest.fixture
def controller(monkeypatch):
    monkeypatch.syspath_prepend(str(CONTROLLER))
    spec = importlib.util.spec_from_file_location("fork_sync_controller_test", CONTROLLER / "run.py")
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    return module


def git(root, *args):
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "-c", "user.name=Test",
         "-c", "user.email=test@example.com", *args], cwd=root,
        check=True, capture_output=True, text=True, encoding="utf-8",
    ).stdout.strip()


def commit(root, text):
    (root / "message.txt").write_text(text, encoding="utf-8")
    git(root, "add", "message.txt")
    git(root, "commit", "-qm", "change")
    return git(root, "rev-parse", "HEAD")


@pytest.fixture
def history(tmp_path, monkeypatch):
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    base = commit(root, "base\n")
    git(root, "switch", "-c", "upstream")
    upstream = commit(root, "new feature\n")
    git(root, "switch", "main")
    fork = commit(root, "中文二开\n")
    monkeypatch.chdir(root)
    return root, base, upstream, fork


def test_conflict_repair_retains_both_parents(controller, history, monkeypatch):
    root, common, upstream, fork = history
    calls = []

    def repair(context, settings, prompt):
        calls.append(context)
        (root / "message.txt").write_text("新功能，保留中文二开\n", encoding="utf-8")

    monkeypatch.setattr(controller, "run_coding_agent", repair)
    controller.merge_one(upstream, "upstream main", {"agent": {}}, "preserve fork")
    assert calls[0]["base"] == fork
    assert calls[0]["merge_base"] == common
    assert calls[0]["conflicts"] == ["message.txt"]
    assert git(root, "rev-parse", "HEAD^1") == fork
    assert git(root, "rev-parse", "HEAD^2") == upstream
    assert (root / "message.txt").read_text(encoding="utf-8") == "新功能，保留中文二开\n"


def test_unresolved_conflict_is_not_committed(controller, history, monkeypatch):
    root, _, upstream, fork = history
    monkeypatch.setattr(controller, "run_coding_agent", lambda *args: None)
    with pytest.raises(RuntimeError, match="conflict markers"):
        controller.merge_one(upstream, "upstream main", {"agent": {}}, "preserve fork")
    assert git(root, "rev-parse", "HEAD") == fork


def test_ai_runs_for_clean_merge_too(controller, history, monkeypatch):
    root, _, upstream, _ = history
    git(root, "switch", "--detach", upstream)
    (root / "another.txt").write_text("English label", encoding="utf-8")
    git(root, "add", "another.txt")
    git(root, "commit", "-qm", "new text")
    target = git(root, "rev-parse", "HEAD")
    git(root, "switch", "--detach", upstream)
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", lambda context, *args: calls.append(context))
    controller.merge_one(target, "new text", {"agent": {}}, "translate")
    assert len(calls) == 1
    assert calls[0]["conflicts"] == []


def test_publish_rejects_main_changed_while_testing(controller, history, tmp_path, monkeypatch):
    root, _, _, fork = history
    origin = tmp_path / "origin.git"
    git(tmp_path, "init", "--bare", str(origin))
    git(root, "remote", "add", "origin", str(origin))
    newer = commit(root, "somebody else's change\n")
    git(root, "push", "origin", "main")
    data = dict(base=fork, candidate=fork, changed=False, releases=[])
    monkeypatch.setattr(controller, "import_candidate", lambda *args: data)
    called = []
    monkeypatch.setattr(controller.releases, "publish", lambda *args: called.append(args))
    with pytest.raises(RuntimeError, match="changed during validation"):
        controller.publish(tmp_path, "owner/repo")
    assert not called
    assert git(root, "ls-remote", "origin", "refs/heads/main").split()[0] == newer


def test_bundle_roundtrip_materializes_exact_validated_candidate(controller, history, tmp_path, monkeypatch):
    root, _, upstream, fork = history
    monkeypatch.setattr(controller, "run_coding_agent", lambda *args: (root / "message.txt").write_text(
        "merged 中文\n", encoding="utf-8",
    ))
    controller.merge_one(upstream, "upstream main", {"agent": {}}, "preserve fork")
    candidate = git(root, "rev-parse", "HEAD")
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    git(root, "update-ref", controller.CANDIDATE_REF, candidate)
    git(root, "bundle", "create", str(artifacts / "candidate.bundle"), controller.CANDIDATE_REF, f"^{fork}")
    data = dict(repository="owner/repo", base=fork, candidate=candidate,
                upstream=upstream, changed=True, releases=[])
    (artifacts / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
    receiver = tmp_path / "receiver"
    receiver.mkdir()
    git(receiver, "init", "-q", "-b", "main")
    git(receiver, "fetch", str(root), fork)
    git(receiver, "switch", "--detach", fork)
    monkeypatch.chdir(receiver)
    controller.checkout_candidate(artifacts, "owner/repo")
    assert git(receiver, "rev-parse", "HEAD") == candidate
    assert git(receiver, "rev-parse", "HEAD^1") == fork
    assert git(receiver, "rev-parse", "HEAD^2") == upstream
    assert (receiver / "message.txt").read_text(encoding="utf-8") == "merged 中文\n"


@pytest.fixture
def agent_env(monkeypatch):
    monkeypatch.setenv("SYNC_AI_API_KEY", "test-secret")
    monkeypatch.setenv("SYNC_AI_BASE_URL", "https://proxy.example/anthropic/v1/messages")
    monkeypatch.setenv("SYNC_AI_MODEL", "custom-model")
    monkeypatch.setenv("GH_TOKEN", "github-secret")
    monkeypatch.setenv("GITHUB_TOKEN", "github-secret")
    monkeypatch.setenv("ANTHROPIC_AUTH_TOKEN", "old-auth")
    monkeypatch.setenv("CLAUDE_CODE_OAUTH_TOKEN", "old-auth")


def pi_events(status="completed", reason="stop"):
    return [
        {"type": "message_end", "message": {"role": "assistant", "stopReason": reason,
         "content": [{"type": "text", "text": json.dumps({"status": status, "summary": "Localized"})}]}},
        {"type": "agent_end", "willRetry": False, "messages": []},
        {"type": "agent_settled", "aborted": False},
    ]


def jsonl(events):
    return "\n".join(json.dumps(event) for event in events) + "\n"


def test_pi_cli_receives_model_endpoint_and_no_github_credentials(controller, agent_env, monkeypatch):
    calls = []
    models = []

    def invoke(command, **kwargs):
        calls.append((command, kwargs))
        models.append(json.loads((Path(kwargs["env"]["PI_CODING_AGENT_DIR"]) / "models.json")
                                 .read_text(encoding="utf-8")))
        return subprocess.CompletedProcess(command, 0, jsonl(pi_events()))

    monkeypatch.setattr(controller.subprocess, "run", invoke)
    controller.run_coding_agent({"conflicts": []},
                                {"timeout_seconds": 3600, "context_window": 128000, "max_tokens": 16000}, "rules")
    command, kwargs = calls[0]
    assert command[0:4] == ["pi", "--mode", "json", "--no-session"]
    assert command[command.index("--model") + 1] == "custom-model"
    provider = models[0]["providers"]["fork-sync"]
    assert provider["baseUrl"] == "https://proxy.example/anthropic"
    assert provider["apiKey"] == "$SYNC_AI_API_KEY"
    assert provider["models"][0]["id"] == "custom-model"
    assert kwargs["env"]["SYNC_AI_API_KEY"] == "test-secret"
    assert "GH_TOKEN" not in kwargs["env"] and "GITHUB_TOKEN" not in kwargs["env"]
    assert "ANTHROPIC_AUTH_TOKEN" not in kwargs["env"] and "CLAUDE_CODE_OAUTH_TOKEN" not in kwargs["env"]
    assert "test-secret" not in " ".join(command) and "test-secret" not in json.dumps(models)
    assert kwargs["timeout"] == 3600
    assert not Path(kwargs["env"]["PI_CODING_AGENT_DIR"]).exists()


@pytest.mark.parametrize("events", [
    [],
    pi_events("blocked"),
    pi_events(reason="error"),
    pi_events(reason="length"),
    pi_events()[:-1],
    [{"type": "tool_execution_end", "isError": True}] + pi_events(),
    [{"type": "auto_retry_end", "success": False}] + pi_events(),
    [{"type": "message_update", "assistantMessageEvent": {"type": "error"}}] + pi_events(),
    [[], *pi_events()],
])
def test_incomplete_or_error_pi_events_cannot_publish(controller, events):
    with pytest.raises(RuntimeError):
        controller.check_pi_result(jsonl(events))


def test_unicode_line_separator_is_not_a_jsonl_record_boundary(controller):
    events = pi_events()
    events[0]["message"]["content"][0]["text"] = '{"status":"completed","summary":"a b"}'
    controller.check_pi_result("\n".join(json.dumps(event, ensure_ascii=False) for event in events))


def test_coding_agent_cannot_change_automation_controls(controller, history, monkeypatch):
    root, _, upstream, fork = history
    path = root / ".github" / "workflows" / "sync.yml"
    path.parent.mkdir(parents=True)
    path.write_text("original", encoding="utf-8")

    def repair(*args):
        (root / "message.txt").write_text("resolved", encoding="utf-8")
        path.write_text("changed", encoding="utf-8")

    monkeypatch.setattr(controller, "run_coding_agent", repair)
    with pytest.raises(RuntimeError, match="protected automation"):
        controller.merge_one(upstream, "upstream main", {"agent": {}}, "rules")
    assert git(root, "rev-parse", "HEAD") == fork


@pytest.mark.parametrize("address,expected", [
    ("https://api.example", "https://api.example"),
    ("https://api.example/v1", "https://api.example"),
    ("https://api.example/gateway/v1/messages", "https://api.example/gateway"),
])
def test_sdk_base_url_preserves_proxy_prefix(controller, address, expected):
    assert controller.agent_base_url(address) == expected


def test_manifest_rejects_inconsistent_commit_and_changed_flag(controller, tmp_path):
    data = dict(repository="owner/repo", base="a" * 40, candidate="b" * 40,
                upstream="c" * 40, changed=False)
    (tmp_path / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
    with pytest.raises(RuntimeError, match="change flag"):
        controller.load_manifest(tmp_path, "owner/repo")
