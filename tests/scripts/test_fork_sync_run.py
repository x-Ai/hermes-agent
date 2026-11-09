"""The sync controller keeps both histories and refuses stale publication."""
from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import time

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


def step(commit, reason="upstream main"):
    return dict(commit=commit, reason=reason, commits=1, conflicts=0, files=0, summary="1 upstream commit(s)")


def later():
    return time.monotonic() + 3600


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

    def repair(context, settings, prompt, timeout):
        calls.append(context)
        (root / "message.txt").write_text("新功能，保留中文二开\n", encoding="utf-8")

    monkeypatch.setattr(controller, "run_coding_agent", repair)
    controller.merge_one(step(upstream), {"agent": {}}, "preserve fork", later())
    assert calls[0]["base"] == fork
    assert calls[0]["merge_base"] == common
    assert calls[0]["conflicts"] == ["message.txt"]
    assert git(root, "rev-parse", "HEAD^1") == fork
    assert git(root, "rev-parse", "HEAD^2") == upstream
    assert (root / "message.txt").read_text(encoding="utf-8") == "新功能，保留中文二开\n"


def test_unresolved_conflict_gets_one_repair_pass_and_is_not_committed(controller, history, monkeypatch):
    root, _, upstream, fork = history
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", lambda context, *args: calls.append(context))
    with pytest.raises(RuntimeError, match="conflict markers"):
        controller.merge_one(step(upstream), {"agent": {}}, "preserve fork", later())
    assert git(root, "rev-parse", "HEAD") == fork
    assert "repair" not in calls[0] and calls[1]["repair"] == ["unresolved conflict markers in message.txt"]


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
    controller.merge_one(step(target, "new text"), {"agent": {}}, "translate", later())
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
    monkeypatch.setattr(controller, "run_coding_agent",
                        lambda *args: (root / "message.txt").write_text("merged 中文\n", encoding="utf-8") and "merged")
    controller.merge_one(step(upstream), {"agent": {}}, "preserve fork", later())
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

    def invoke(command, env, timeout):
        calls.append((command, dict(env=env, timeout=timeout)))
        models.append(json.loads((Path(env["PI_CODING_AGENT_DIR"]) / "models.json").read_text(encoding="utf-8")))
        return 0, jsonl(pi_events()), False

    monkeypatch.setattr(controller.pi_session, "run", invoke)
    controller.run_coding_agent({"conflicts": []}, {"thinking": "max", "context_window": 128000, "max_tokens": 64000},
                                "rules", 1800)
    command, kwargs = calls[0]
    assert command[0:4] == ["pi", "--mode", "json", "--no-session"]
    assert command[command.index("--model") + 1] == "custom-model"
    assert command[command.index("--thinking") + 1] == "max"
    provider = models[0]["providers"]["fork-sync"]
    assert provider["baseUrl"] == "https://proxy.example/anthropic"
    assert provider["apiKey"] == "$SYNC_AI_API_KEY"
    assert provider["models"][0]["id"] == "custom-model"
    # Pi clamps an unmapped max to high and sends effort only in the adaptive format.
    assert provider["models"][0]["reasoning"] is True
    assert provider["models"][0]["thinkingLevelMap"] == {"max": "max"}
    assert provider["models"][0]["compat"] == {"forceAdaptiveThinking": True}
    assert kwargs["env"]["SYNC_AI_API_KEY"] == "test-secret"
    assert "GH_TOKEN" not in kwargs["env"] and "GITHUB_TOKEN" not in kwargs["env"]
    assert "ANTHROPIC_AUTH_TOKEN" not in kwargs["env"] and "CLAUDE_CODE_OAUTH_TOKEN" not in kwargs["env"]
    assert "test-secret" not in " ".join(command) and "test-secret" not in json.dumps(models)
    assert kwargs["timeout"] == 1800
    assert not Path(kwargs["env"]["PI_CODING_AGENT_DIR"]).exists()


@pytest.mark.parametrize("events", [
    [],
    pi_events("blocked"),
    pi_events(reason="error"),
    pi_events(reason="length"),
    pi_events()[:-1],
    [{"type": "auto_retry_end", "success": False}] + pi_events(),
    [{"type": "message_update", "assistantMessageEvent": {"type": "error"}}] + pi_events(),
    [[], *pi_events()],
])
def test_incomplete_or_error_pi_events_cannot_publish(controller, events):
    with pytest.raises(RuntimeError):
        controller.check_pi_result(jsonl(events))


def test_a_blocked_step_keeps_pis_reason_for_its_warning(controller):
    # The discarded step's warning and step-<n>.json are the only record of why it stopped.
    events = pi_events("blocked")
    events[0]["message"]["content"][0]["text"] = json.dumps(
        {"status": "blocked", "summary": "28 conflicted files will not fit\nthe 18 minutes left"})
    with pytest.raises(RuntimeError, match=r"\(blocked: 28 conflicted files will not fit the 18 minutes left\)"):
        controller.check_pi_result(jsonl(events))


def test_failed_command_is_feedback_for_the_model_not_a_publication_error(controller):
    # Pi reports every non-zero exit (a grep without matches, a red test it then fixes) as isError.
    events = [{"type": "tool_execution_end", "toolName": "bash", "isError": True}] + pi_events()
    assert controller.check_pi_result(jsonl(events)) == "Localized"


def test_pi_past_its_time_limit_is_not_published(controller, agent_env, monkeypatch):
    monkeypatch.setattr(controller.pi_session, "run", lambda *args: (143, jsonl(pi_events()), True))
    with pytest.raises(RuntimeError, match="30-minute limit"):
        controller.run_coding_agent({}, {"thinking": "max", "context_window": 128000, "max_tokens": 64000}, "rules", 1800)


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
        controller.merge_one(step(upstream), {"agent": {}}, "rules", later())
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


def test_prepare_outputs_one_matrix_entry_per_planned_test_shard(controller, tmp_path, monkeypatch):
    out = tmp_path / "github-output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    shas = dict(base="a" * 40, candidate="b" * 40, upstream="c" * 40)
    controller.emit(dict(shas, changed=True, needed=True, remaining=True,
                         tests=dict(mode="selected", files=3, weight=12000, shards=2)))
    controller.emit(dict(shas, candidate="a" * 40, changed=False, needed=True, remaining=False))
    assert [line for line in out.read_text(encoding="utf-8").splitlines()
            if line.startswith("shards=")] == ["shards=[1, 2]", "shards=[]"]


def test_validation_runs_the_checks_in_one_lane_and_splits_the_ui_suite_over_the_rest(controller, tmp_path,
                                                                                         monkeypatch):
    out = tmp_path / "github-output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(out))
    shas = dict(base="a" * 40, candidate="b" * 40, upstream="c" * 40)
    controller.emit(dict(shas, changed=True, needed=True, remaining=False))
    settings = controller.config()
    lanes = json.loads(next(line for line in out.read_text(encoding="utf-8").splitlines()
                            if line.startswith("lanes="))[len("lanes="):])
    assert lanes == ["checks", *(f"ui:{n}/{settings['ui_shards']}" for n in range(1, settings["ui_shards"] + 1))]
    data = dict(base="a" * 40, candidate="b" * 40)
    checks = controller.lane_commands("checks", settings, data)
    assert checks[0] == ["python", "scripts/check", "--base", "a" * 40, "--commit", "b" * 40]
    assert not any("vitest" in command for argv in checks for command in argv)
    assert controller.lane_commands(lanes[2], settings, data) == [
        [*settings["ui_tests"], f"--shard=2/{settings['ui_shards']}"]]
    with pytest.raises(RuntimeError, match="Unknown validation lane"):
        controller.lane_commands(f"ui:9/{settings['ui_shards']}", settings, data)


def test_shard_runs_its_slice_of_the_planned_test_files(controller, history, tmp_path, monkeypatch):
    _, common, _, fork = history
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    data = dict(repository="owner/repo", base=common, candidate=fork, upstream=common, changed=True,
                releases=[], tests=dict(mode="selected", files=2, weight=2, shards=3))
    (artifacts / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
    calls = []
    monkeypatch.setattr(controller, "run_tests", lambda argv, timeout: calls.append(argv) or [])
    controller.run_shard("owner/repo", artifacts, 2)
    assert calls == [[*controller.config()["tests"]["command"],
                      "--files-from", str(artifacts / "tests.txt"), "--slice", "2/3"]]
    for outside in (0, 4):
        with pytest.raises(RuntimeError, match="outside the planned"):
            controller.run_shard("owner/repo", artifacts, outside)


def test_shard_warns_about_test_files_that_passed_only_on_retry(controller, history, tmp_path, monkeypatch,
                                                                 capsys):
    _, common, _, fork = history
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    data = dict(repository="owner/repo", base=common, candidate=fork, upstream=common, changed=True,
                releases=[], tests=dict(mode="selected", files=2, weight=2, shards=1))
    (artifacts / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
    monkeypatch.setattr(controller, "run_tests", lambda argv, timeout: ["tests/tools/test_live.py"])
    controller.run_shard("owner/repo", artifacts, 1)
    warnings = [line for line in capsys.readouterr().out.splitlines() if line.startswith("::warning")]
    assert len(warnings) == 1 and "tests/tools/test_live.py failed once and passed on retry" in warnings[0]


def test_test_runner_output_is_passed_through_and_its_flaky_files_returned(controller, tmp_path, capsys):
    # The tail of scripts/run_tests_parallel.py's summary when a file passed only on its retry.
    summary = tmp_path / "summary.txt"
    summary.write_text(
        "=== Summary: 2 files, 9 tests passed, 0 failed ===\n\n"
        "=== ⚠ 1 FLAKY file (failed once, passed on retry — fix these) ===\n"
        "  tests/tools/test_live.py\n"
        "⚠ FLAKY: failed on attempt 1, passed on retry (attempt 2). Fix the flake — do not ignore this.\n"
        "--- first-attempt output ---\n"
        "  tests/tools/test_live.py:88: in _launch_chrome\n", encoding="utf-8")
    show = [sys.executable, "-c", "import sys; sys.stdout.buffer.write(open(sys.argv[1], 'rb').read())",
            str(summary)]
    assert controller.run_tests(show, 60) == ["tests/tools/test_live.py"]
    assert capsys.readouterr().out == summary.read_text(encoding="utf-8")
    with pytest.raises(subprocess.CalledProcessError):
        controller.run_tests([sys.executable, "-c", "raise SystemExit(1)"], 60)
    with pytest.raises(subprocess.TimeoutExpired):
        controller.run_tests([sys.executable, "-c", "import time; time.sleep(30)"], 0.5)


SETTINGS = {
    "agent": {"budget_seconds": 3600, "min_step_seconds": 60},
    "steps": {"max_conflicts": 2, "max_review_files": 50},
    "tests": {"full_suite": ["uv.lock"], "tests_per_shard": 10, "max_shards": 2},
}


def write_commit(root, files, hour=12):
    """Commit with a fixed committer timestamp: commits of one hour form one upstream batch."""
    for name, text in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    git(root, "add", "--all")
    date = f"2026-11-07T{hour:02d}:00:00+00:00"
    subprocess.run(["git", "-c", "core.hooksPath=/dev/null", "commit", "-qm", "change"], cwd=root, check=True,
                   env={**os.environ, "GIT_COMMITTER_DATE": date, "GIT_AUTHOR_DATE": date})
    return git(root, "rev-parse", "HEAD")


def make_backlog(tmp_path, monkeypatch, hours=(12, 12, 12, 12)):
    """Four localized fork lines; each of four upstream commits changes one of them."""
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    lines = {f"app/f{i}.txt": "English\n" for i in range(1, 5)}
    write_commit(root, lines)
    git(root, "switch", "-qc", "upstream")
    chain = [write_commit(root, {f"app/f{i}.txt": f"Upstream {i}\n"}, hour) for i, hour in zip(range(1, 5), hours)]
    git(root, "switch", "-q", "main")
    fork = write_commit(root, {name: "中文\n" for name in lines})
    (tmp_path / "artifacts").mkdir()
    monkeypatch.chdir(root)
    return root, fork, chain


@pytest.fixture
def backlog(tmp_path, monkeypatch):
    return make_backlog(tmp_path, monkeypatch)


def resolver(root, calls, fail_from=None):
    def resolve(context, settings, prompt, timeout):
        calls.append(context)
        if fail_from is not None and len(calls) >= fail_from:
            raise RuntimeError("model endpoint unavailable")
        for name in context["conflicts"]:
            (root / name).write_text("中文（已合并）\n", encoding="utf-8")
    return resolve


def test_backlog_merges_in_steps_within_the_conflict_limit(controller, backlog, tmp_path, monkeypatch):
    root, _, chain = backlog
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", resolver(root, calls))
    done = controller.merge_steps(chain[-1], "upstream main", SETTINGS, "rules", tmp_path / "artifacts")
    assert [item["commit"] for item in done] == [chain[1], chain[3]]
    assert [len(context["conflicts"]) for context in calls] == [2, 2]
    assert git(root, "rev-parse", "HEAD^2") == chain[3]
    assert git(root, "rev-parse", "HEAD^1^2") == chain[1]
    assert calls[0]["time_limit_minutes"] >= 59 and calls[0]["deadline_utc"].endswith("Z")


def test_failed_later_step_leaves_the_completed_steps_to_publish(controller, backlog, tmp_path, monkeypatch, capsys):
    root, _, chain = backlog
    monkeypatch.setattr(controller, "run_coding_agent", resolver(root, [], fail_from=2))
    done = controller.merge_steps(chain[-1], "upstream main", SETTINGS, "rules", tmp_path / "artifacts")
    assert [item["commit"] for item in done] == [chain[1]]
    assert git(root, "rev-parse", "HEAD^2") == chain[1]
    assert git(root, "status", "--porcelain", "--untracked-files=all") == ""
    assert "::warning title=Fork sync::Step 2" in capsys.readouterr().out
    report = json.loads((tmp_path / "artifacts" / "step-2.json").read_text(encoding="utf-8"))
    assert report["commit"] == chain[3] and "unavailable" in report["error"]
    assert report["conflicts"] == ["app/f3.txt", "app/f4.txt"]


def test_failed_first_step_fails_the_run(controller, backlog, tmp_path, monkeypatch):
    root, _, chain = backlog
    monkeypatch.setattr(controller, "run_coding_agent", resolver(root, [], fail_from=1))
    with pytest.raises(RuntimeError, match="unavailable"):
        controller.merge_steps(chain[-1], "upstream main", SETTINGS, "rules", tmp_path / "artifacts")
    assert (tmp_path / "artifacts" / "step-1.patch").read_text(encoding="utf-8")


class Clock:
    def __init__(self):
        self.now = 0.0

    def monotonic(self):
        return self.now


def test_budget_shrinks_late_steps_and_stops_before_one_that_cannot_fit(controller, backlog, tmp_path,
                                                                       monkeypatch, capsys):
    root, _, chain = backlog
    clock = Clock()
    monkeypatch.setattr(controller, "time", clock)
    calls = []
    resolve = resolver(root, calls)

    def slow(context, *args):
        resolve(context, *args)
        clock.now += 1500

    monkeypatch.setattr(controller, "run_coding_agent", slow)
    settings = dict(SETTINGS, agent={"budget_seconds": 3600, "min_step_seconds": 1000})
    done = controller.merge_steps(chain[-1], "upstream main", settings, "rules", tmp_path / "artifacts")
    # 2100 s left after the first step: the conflict limit of 2 shrinks to 1 for the second.
    assert [(item["commit"], item["conflicts"]) for item in done] == [(chain[1], 2), (chain[2], 1)]
    assert "Time budget used after 2 step(s)" in capsys.readouterr().out


def test_pending_release_is_merged_first_and_tagged_on_its_own_merge(controller, backlog, tmp_path, monkeypatch):
    root, fork, chain = backlog
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", resolver(root, calls))
    monkeypatch.setattr(controller.releases, "notes", lambda repository, item, target, tip: f"notes for {target}")
    first = {"tag_name": "v1", "upstream_commit": chain[0]}
    second = {"tag_name": "v2", "upstream_commit": chain[2]}
    manifest = dict(repository="owner/repo", base=fork, upstream_tip=chain[-1], releases=[first, second])
    controller.integrate(manifest, SETTINGS, tmp_path / "artifacts")
    # The run stops at the oldest pending release, not at upstream main's tip.
    assert [context["reason"] for context in calls] == ["release v1"]
    candidate = git(root, "rev-parse", "HEAD")
    assert manifest["candidate"] == candidate and git(root, "rev-parse", "HEAD^2") == chain[0]
    assert manifest["releases"] == [first] and first["target"] == candidate
    assert first["notes"] == f"notes for {candidate}"
    assert manifest["upstream"] == chain[0]
    assert manifest["remaining"] and manifest["changed"] and manifest["needed"]


def test_release_main_already_contains_is_tagged_where_main_merged_it(controller, backlog, tmp_path, monkeypatch):
    root, _, chain = backlog
    monkeypatch.setattr(controller, "run_coding_agent", resolver(root, []))
    monkeypatch.setattr(controller.releases, "notes", lambda *args: "notes")
    controller.merge_steps(chain[1], "upstream main", SETTINGS, "rules", tmp_path / "artifacts")
    merged_first = git(root, "rev-parse", "HEAD")
    write_commit(root, {"app/fork.txt": "a later fork change\n"})
    base = git(root, "rev-parse", "HEAD")
    release = {"tag_name": "v1", "upstream_commit": chain[0]}
    manifest = dict(repository="owner/repo", base=base, upstream_tip=chain[1], releases=[release])
    controller.integrate(manifest, SETTINGS, tmp_path / "artifacts")
    # Nothing to merge: the release is published on the fork's merge of it, not on today's main.
    assert manifest["candidate"] == base and not manifest["changed"] and manifest["needed"]
    assert release["target"] == merged_first and not manifest["remaining"]


def test_a_run_that_finished_a_batch_leaves_splitting_the_next_one_to_the_next_run(controller, tmp_path,
                                                                                  monkeypatch, capsys):
    root, fork, chain = make_backlog(tmp_path, monkeypatch, hours=(10, 11, 11, 11))
    calls = []
    monkeypatch.setattr(controller, "run_coding_agent", resolver(root, calls))
    manifest = dict(repository="owner/repo", base=fork, upstream_tip=chain[-1], releases=[])
    controller.integrate(manifest, SETTINGS, tmp_path / "artifacts")
    # Step 1 ends the first batch. The second (3 conflicts, limit 2) would end a step inside it, so no
    # Pi time is spent on it here: it was thrown away at the end of the run whenever the run fell short.
    assert [context["upstream"] for context in calls] == chain[:1]
    assert manifest["upstream"] == chain[0] == git(root, "rev-parse", "HEAD^2")
    assert [item["commit"] for item in manifest["steps"]] == [chain[0]]
    assert manifest["remaining"]  # publish starts the next run, which splits the batch with a full budget
    assert "Stopped after 1 step(s) at the end of an upstream batch" in capsys.readouterr().out
    calls.clear()
    controller.integrate(dict(manifest, base=git(root, "rev-parse", "HEAD")), SETTINGS, tmp_path / "artifacts")
    assert [context["upstream"] for context in calls] == chain[2:]


@pytest.fixture
def tested_history(tmp_path, monkeypatch):
    """Upstream adds a test case to a test file both sides share and changes a localized line."""
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    old = "def test_old():\n    pass\n"
    write_commit(root, {"message.txt": "English\n", "tests/test_feature.py": old})
    git(root, "switch", "-qc", "upstream")
    upstream = write_commit(root, {"message.txt": "Upstream\n",
                                   "tests/test_feature.py": old + "\n\ndef test_new():\n    pass\n"})
    git(root, "switch", "-q", "main")
    fork = write_commit(root, {"message.txt": "中文\n"})
    monkeypatch.chdir(root)
    return root, fork, upstream


def test_repair_pass_restores_a_test_the_first_pass_dropped(controller, tested_history, monkeypatch):
    root, fork, upstream = tested_history
    calls = []

    def agent(context, *args):
        calls.append(context)
        (root / "message.txt").write_text("中文（已合并）\n", encoding="utf-8")
        version = upstream if "repair" in context else fork
        (root / "tests" / "test_feature.py").write_text(git(root, "show", f"{version}:tests/test_feature.py") + "\n",
                                                        encoding="utf-8")

    monkeypatch.setattr(controller, "run_coding_agent", agent)
    controller.merge_one(step(upstream), {"agent": {}}, "rules", later())
    assert calls[1]["repair"] == ["dropped test cases in tests/test_feature.py: test_new"]
    assert "def test_new" in git(root, "show", "HEAD:tests/test_feature.py")


def test_merge_that_keeps_dropping_a_test_is_not_committed(controller, tested_history, monkeypatch):
    root, fork, upstream = tested_history

    def agent(context, *args):
        (root / "message.txt").write_text("中文（已合并）\n", encoding="utf-8")
        (root / "tests" / "test_feature.py").write_text("def test_old():\n    pass\n", encoding="utf-8")

    monkeypatch.setattr(controller, "run_coding_agent", agent)
    with pytest.raises(RuntimeError, match="dropped test cases in tests/test_feature.py: test_new"):
        controller.merge_one(step(upstream), {"agent": {}}, "rules", later())
    assert git(root, "rev-parse", "HEAD") == fork


@pytest.fixture
def documented_history(tmp_path, monkeypatch):
    """Upstream writes a Markdown line break (two trailing spaces) and changes a localized line."""
    root = tmp_path / "repo"
    root.mkdir()
    git(root, "init", "-q", "-b", "main")
    git(root, "config", "user.name", "Test")
    git(root, "config", "user.email", "test@example.com")
    write_commit(root, {"message.txt": "English\n"})
    git(root, "switch", "-qc", "upstream")
    upstream = write_commit(root, {"message.txt": "Upstream\n", "docs/guide.md": "first line  \nsecond line\n"})
    git(root, "switch", "-q", "main")
    fork = write_commit(root, {"message.txt": "中文\n"})
    monkeypatch.chdir(root)
    return root, fork, upstream


@pytest.mark.parametrize("resolution,error", [("中文（已合并）\n", None), ("中文（已合并） \n", "whitespace errors")])
def test_only_whitespace_the_resolution_wrote_blocks_the_merge(controller, documented_history, monkeypatch,
                                                              resolution, error):
    root, fork, upstream = documented_history
    monkeypatch.setattr(controller, "run_coding_agent",
                        lambda *args: (root / "message.txt").write_text(resolution, encoding="utf-8") and "merged")
    if error is None:
        controller.merge_one(step(upstream), {"agent": {}}, "rules", later())
        assert git(root, "rev-parse", "HEAD^2") == upstream
    else:
        with pytest.raises(RuntimeError, match=error):
            controller.merge_one(step(upstream), {"agent": {}}, "rules", later())
        assert git(root, "rev-parse", "HEAD") == fork


def test_shard_fails_when_its_tests_create_the_account_hermes_home(controller, history, tmp_path, monkeypatch):
    _, common, _, fork = history
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    data = dict(repository="owner/repo", base=common, candidate=fork, upstream=common, changed=True,
                releases=[], tests=dict(mode="selected", files=1, weight=1, shards=1))
    (artifacts / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
    account = tmp_path / "account"
    account.mkdir()
    monkeypatch.setattr(Path, "home", lambda: account)

    def run_tests(argv, timeout):
        # What a test's child process without an isolated HERMES_HOME leaves behind.
        (account / ".hermes" / "sessions").mkdir(parents=True, exist_ok=True)
        return []

    monkeypatch.setattr(controller, "run_tests", run_tests)
    with pytest.raises(RuntimeError, match=r"real Hermes home .*\(sessions\)"):
        controller.run_shard("owner/repo", artifacts, 1)
    # A home that existed before the run (a developer machine's own install) is not judged.
    controller.run_shard("owner/repo", artifacts, 1)


@pytest.mark.parametrize("side,summary,warned", [
    ("fork", None, True),
    ("upstream", "message.txt: upstream's new wording replaces the obsolete fork string", False),
])
def test_conflict_left_as_one_side_had_it_is_listed_in_the_merge_commit(controller, history, monkeypatch, capsys,
                                                                        side, summary, warned):
    root, _, upstream, fork = history
    version = {"fork": fork, "upstream": upstream}[side]

    def agent(context, *args):
        (root / "message.txt").write_text(git(root, "show", f"{version}:message.txt") + "\n", encoding="utf-8")
        return summary

    monkeypatch.setattr(controller, "run_coding_agent", agent)
    assert controller.merge_one(step(upstream), {"agent": {}}, "rules", later()) == {side: ["message.txt"]}
    who = {"fork": "the fork", "upstream": "upstream"}[side]
    assert f"Conflicted files left exactly as {who} had them: message.txt." in git(root, "log", "-1", "--format=%B")
    assert ("does not explain the one-sided resolution of message.txt" in capsys.readouterr().out) == warned
