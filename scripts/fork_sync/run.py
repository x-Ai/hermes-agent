#!/usr/bin/env python3
"""Trusted controller for the fork's prepare → validate → reconcile → publish workflow.

Copy this directory out of the checkout BEFORE merging. Run that copy, never
candidate-controlled Python, in jobs that receive an AI key or a write token.
Its sibling modules are imported before the coding agent runs, so the agent's
shell cannot swap the step planning, the dropped-test guard, the desktop test
check or the test selection. reconcile.py lands a validated candidate on a main
that moved during the run.
"""
from __future__ import annotations

import argparse
from datetime import UTC, datetime, timedelta
from functools import partial
import json
import hashlib
import logging
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import threading
import time
from urllib.parse import urlsplit, urlunsplit

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import desktop_tests
import dropped_tests
import pi_session
import reconcile
import releases
import select_tests
import steps

UPSTREAM = "https://github.com/NousResearch/hermes-agent.git"
CANDIDATE_REF = "refs/heads/fork-sync-candidate"
SHA = re.compile(r"[0-9a-f]{40}")
MARKER = re.compile(r"^(?:<{7}|={7}|>{7})(?: |$)", re.MULTILINE)
WORKTREE = ""  # read_version's revision for the files on disk
ONE_SIDED = {"fork": "the fork", "upstream": "upstream"}
WHITESPACE = re.compile(r"^[^+].*:\d+: ")  # a `git diff --check` finding, not its quoted line
# A repair pass needs time to read the problems and fix them; less than this is not worth starting.
REPAIR_SECONDS = 300
# Characters of a blocked step's reason kept in its warning and step-<n>.json.
REASON_SHOWN = 600
# scripts/run_tests_parallel.py's summary lists each file that passed only on its retry as the
# file's own line, then a report that starts with this.
FLAKY_REPORT = "⚠ FLAKY:"
WORKFLOW_FILE = "fork-upstream-sync.yml"
BOT = "hermes-upstream-sync[bot]"
# After failed runs a scheduled run waits 30 minutes, then 1, 2 and 4 hours, at most 8, from the last
# failure before it merges again, so a failure that repeats does not spend a model budget every half
# hour. Runs started by hand, or by a run that published, never wait.
BACKOFF_SECONDS = (1800, 8 * 3600)
FAILED = ("failure", "timed_out", "startup_failure")


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", *args],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        timeout=300, check=check,
    )


def output(*args: str) -> str:
    return git(*args).stdout.strip()


def ancestor(base: str, head: str) -> bool:
    result = git("merge-base", "--is-ancestor", base, head, check=False)
    if result.returncode not in (0, 1):
        raise RuntimeError("Git could not establish ancestry")
    return result.returncode == 0


def config() -> dict:
    return json.loads((HERE / "config.json").read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def emit(manifest: dict) -> None:
    destination = os.environ.get("GITHUB_OUTPUT")
    if destination:
        with open(destination, "a", encoding="utf-8") as handle:
            for key in ("base", "candidate", "upstream", "changed", "needed", "remaining"):
                value = manifest[key]
                handle.write(f"{key}={str(value).lower() if isinstance(value, bool) else value}\n")
            shards = manifest.get("tests", {}).get("shards", 0)
            handle.write(f"shards={json.dumps(list(range(1, shards + 1)))}\n")
            handle.write(f"lanes={json.dumps(validation_lanes(config()))}\n")


def validation_lanes(settings: dict) -> list[str]:
    """The validate matrix: the repository checks in one job, the desktop UI suite over the others.

    One job ran them in turn on a 4-vCPU runner: the checks took about 5 minutes and the UI suite
    18-33 more. Separate jobs on more runners finish in about the time of one UI shard, with
    every check still run (upstream gets the same from one 32-vCPU runner).
    """
    shards = settings["ui_shards"]
    return ["checks", *(f"ui:{index}/{shards}" for index in range(1, shards + 1))]


def lane_commands(lane: str, settings: dict, data: dict) -> list[list[str]]:
    if lane == "checks":
        return [[part.replace("{base}", data["base"]).replace("{candidate}", data["candidate"]) for part in command]
                for command in settings["checks"]]
    if lane in validation_lanes(settings)[1:]:
        return [[*settings["ui_tests"], f"--shard={lane.partition(':')[2]}"]]
    raise RuntimeError(f"Unknown validation lane {lane!r}")


def warn(message: str) -> None:
    """A warning annotation, so a partial sync shows on the run page without opening the log."""
    text = message.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
    print(f"::warning title=Fork sync::{text}", flush=True)


def backoff_until(runs: list[dict], last_publish: datetime, current: int) -> datetime | None:
    """When a scheduled run may merge again: the failed runs since the last publish set the wait.

    A run that skipped (nothing to merge, or backing off) neither counts nor resets the streak.
    """
    failed = [datetime.fromisoformat(run["updated_at"]) for run in runs
              if run.get("id") != current and run.get("status") == "completed" and run.get("conclusion") in FAILED]
    failed = [ended for ended in failed if ended > last_publish]
    if not failed:
        return None
    first, longest = BACKOFF_SECONDS
    return max(failed) + timedelta(seconds=min(first * 2 ** (len(failed) - 1), longest))


def backing_off(repository: str) -> datetime | None:
    """The time a scheduled run waits for after failed runs; None for other events or when it may run."""
    if os.environ.get("GITHUB_EVENT_NAME") != "schedule":
        return None
    try:
        runs = releases.gh_json(f"repos/{repository}/actions/workflows/{WORKFLOW_FILE}/runs?per_page=30")
    except RuntimeError:
        warn("Could not read this workflow's earlier runs; merging without a backoff")
        return None
    stamp = output("log", "-1", "--format=%cI", "--fixed-strings", f"--author={BOT}", "HEAD")
    last = datetime.fromisoformat(stamp) if stamp else datetime.min.replace(tzinfo=UTC)
    until = backoff_until(runs.get("workflow_runs", []), last, int(os.environ.get("GITHUB_RUN_ID") or 0))
    return until if until is not None and until > datetime.now(UTC) else None


def prepare(repository: str, artifacts: Path) -> None:
    if output("status", "--porcelain"):
        raise RuntimeError("Preparation requires a clean disposable checkout")
    settings = config()
    base = output("rev-parse", "HEAD")
    artifacts.mkdir(parents=True, exist_ok=True)
    until = backing_off(repository)
    if until is not None:
        warn(f"Earlier runs failed: the next scheduled merge starts after {until:%Y-%m-%d %H:%M} UTC."
             " Dispatch the workflow to retry now")
        manifest = dict(repository=repository, base=base, upstream=base, upstream_tip=base, candidate=base,
                        changed=False, needed=False, remaining=False, releases=[], steps=[])
        write_json(artifacts / "manifest.json", manifest)
        emit(manifest)
        return
    git("config", "user.name", BOT)
    git("config", "user.email", "hermes-upstream-sync@users.noreply.github.com")
    git("fetch", "--no-tags", UPSTREAM, "+refs/heads/main:refs/remotes/fork-upstream/main")
    tip = output("rev-parse", "refs/remotes/fork-upstream/main")
    since = os.environ.get("SYNC_RELEASES_SINCE") or settings["releases_since"]
    pending = releases.discover(repository, since)
    manifest = dict(repository=repository, base=base, upstream=tip, upstream_tip=tip,
                    candidate=base, changed=False, needed=False, releases=pending, steps=[])
    write_json(artifacts / "manifest.json", manifest)
    integrate(manifest, settings, artifacts)
    write_json(artifacts / "manifest.json", manifest)
    emit(manifest)


def integrate(manifest: dict, settings: dict, artifacts: Path) -> None:
    """Merge as much as this run's budget allows and record the candidate in ``manifest``.

    A pending upstream release comes first: the run merges toward that release's
    commit, stops there and publishes the release on the merge, so the fork's tag
    names upstream's release plus this repository's changes and nothing newer.
    Upstream main follows in the next run, which publish starts right away.
    """
    base, tip, pending = manifest["base"], manifest["upstream_tip"], manifest["releases"]
    missing = [item for item in pending if not ancestor(item["upstream_commit"], base)]
    goal, reason = ((missing[0]["upstream_commit"], f"release {missing[0]['tag_name']}") if missing
                    else (tip, "upstream main"))
    if not ancestor(goal, "HEAD"):
        print(f"Backlog to {reason}: {steps.measure('HEAD', goal).describe()}", flush=True)
    done = merge_steps(goal, reason, settings, (HERE / "prompt.md").read_text(encoding="utf-8-sig"), artifacts)
    candidate = output("rev-parse", "HEAD")
    # Releases the candidate does not contain yet are discovered again by the next run.
    included = [item for item in pending if ancestor(item["upstream_commit"], candidate)]
    for item in included:
        item["target"] = earliest_containing(item["upstream_commit"], candidate)
        item["notes"] = releases.notes(manifest["repository"], item, item["target"], tip)
    manifest.update(candidate=candidate, upstream=output("merge-base", candidate, tip),
                    changed=candidate != base, needed=candidate != base or bool(included),
                    remaining=not ancestor(tip, candidate) or len(included) < len(pending),
                    releases=included, steps=done)
    if manifest["changed"]:
        git("update-ref", CANDIDATE_REF, candidate)
        git("bundle", "create", str(artifacts / "candidate.bundle"), CANDIDATE_REF, f"^{base}")
        manifest["tests"] = plan_tests(manifest, settings["tests"], artifacts)
    left = "; the next run continues" if manifest["remaining"] else ""
    print(f"Prepared {candidate[:12]}: {len(done)} step(s), {len(included)} of {len(pending)} release(s){left}")


def earliest_containing(commit: str, head: str) -> str:
    """The first commit on ``head``'s first-parent line that contains ``commit``.

    Once a commit on that line contains it, every newer one does, so bisect for the oldest.
    (``rev-list --first-parent --ancestry-path`` judges descent along first parents too and
    misses a commit that a merge brought in below its second parent.)
    """
    line = output("rev-list", "--first-parent", head).splitlines()  # newest first; line[0] contains it
    good, bad = 0, len(line)
    while bad - good > 1:
        middle = (good + bad) // 2
        if ancestor(commit, line[middle]):
            good = middle
        else:
            bad = middle
    return line[good]


def merge_steps(goal: str, reason: str, settings: dict, prompt: str, artifacts: Path) -> list[dict]:
    """Merge toward ``goal`` (a release commit or upstream main) one bounded step at a time.

    Steps stop when the goal is merged, the time budget cannot fit another, or the
    run has finished an upstream batch and the next one would have to be split.
    A step that fails after an earlier one succeeded is discarded with a warning:
    the completed steps become the candidate and the next run continues from
    them. Only a failure in the first step fails the run.
    """
    agent = settings["agent"]
    deadline = time.monotonic() + agent["budget_seconds"]
    done: list[dict] = []
    while True:
        remaining = deadline - time.monotonic()
        step = next_step(goal, reason, settings["steps"], remaining / agent["budget_seconds"])
        if step is None:
            return done
        number = len(done) + 1
        if remaining < agent["min_step_seconds"]:
            warn(f"Time budget used after {len(done)} step(s); the next run continues toward {reason}")
            return done
        # A batch over the step limits is split, and its steps stop at states upstream's CI never
        # checked. Once this run has finished a batch, it publishes there instead of splitting the next
        # one: a split this run cannot finish used to be thrown away and merged again by the next run
        # (about 70 minutes of Pi work, twice, on 2026-11-08). The next run, which publish starts right
        # away, splits the batch with the whole budget.
        if not step["batch_end"] and any(item["batch_end"] for item in done):
            warn(f"Stopped after {len(done)} step(s) at the end of an upstream batch: the next batch must be"
                 f" split ({step['summary']}), so the next run starts it with the whole budget")
            return done
        print(f"Step {number}: merge {step['reason']} {step['commit'][:12]} ({step['summary']})", flush=True)
        before = output("rev-parse", "HEAD")
        try:
            sided = merge_one(step, settings, prompt, deadline)
        except Exception as error:
            save_diagnostics(artifacts, number, step, error)
            if not done:
                raise
            git("reset", "--hard", before)
            git("clean", "-fdq")
            warn(f"Step {number} ({step['reason']} {step['commit'][:12]}) was discarded: {error}")
            return done
        done.append(dict(step, merged=output("rev-parse", "HEAD"), one_sided=sided))


def next_step(goal: str, reason: str, limits: dict, scale: float) -> dict | None:
    """The next bounded step toward ``goal``, None once HEAD contains it.

    Limits shrink with the budget left, so a late step is sized for the time remaining.
    """
    head = output("rev-parse", "HEAD")
    if ancestor(goal, head):
        return None
    bound = [max(1, round(limits[key] * min(scale, 1.0))) for key in ("max_conflicts", "max_review_files")]
    step = steps.furthest(head, goal, *bound)
    return dict(step.record(), reason=reason, summary=step.describe())


def plan_tests(manifest: dict, settings: dict, artifacts: Path) -> dict:
    """Write the Python test files the merge can affect; the test matrix shards them."""
    result = select_tests.plan(Path.cwd(), manifest["base"], manifest["candidate"],
                               manifest["upstream"], settings)
    print(select_tests.describe(result), flush=True)
    (artifacts / "tests.txt").write_text("".join(f"{path}\n" for path in result["files"]), encoding="utf-8")
    return dict(mode=result["mode"], files=len(result["files"]), weight=result["weight"],
                shards=result["shards"])


def save_diagnostics(artifacts: Path, number: int, step: dict, error: Exception) -> None:
    """Keep what a failed step left for review; the next run starts that step again."""
    (artifacts / f"step-{number}.patch").write_text(
        git("diff", "--binary", "HEAD", check=False).stdout, encoding="utf-8",
    )
    unmerged = git("diff", "--name-only", "--diff-filter=U", check=False).stdout.splitlines()
    write_json(artifacts / f"step-{number}.json", dict(step, error=str(error), conflicts=unmerged))


def merge_one(step: dict, settings: dict, prompt: str, deadline: float) -> dict[str, list[str]]:
    """Merge one step, let Pi resolve, localize and check it, then commit.

    Returns the conflicted files the resolution left exactly as one side had them.
    """
    commit, reason = step["commit"], step["reason"]
    before = output("rev-parse", "HEAD")
    common = output("merge-base", before, commit)
    merged = git("merge", "--no-commit", "--no-ff", commit, check=False)
    conflicts = output("diff", "--name-only", "--diff-filter=U").splitlines()
    if merged.returncode and not conflicts:
        raise RuntimeError(f"Git merge failed before conflict repair: {reason}")
    # The AI cannot modify the workflow, controller or its own regression tests.
    if any(protected(path) for path in conflicts):
        raise RuntimeError("A conflict touches automation controls; resolve it manually before retrying")
    guard = control_snapshot()
    context = dict(base=before, upstream=commit, merge_base=common, conflicts=conflicts, reason=reason,
                   upstream_commits=step["commits"])
    summaries = [agent_pass(context, settings["agent"], prompt, deadline, guard)]
    problems = merge_problems(before, commit, common, conflicts)
    if problems and deadline - time.monotonic() >= REPAIR_SECONDS:
        print(f"Asking Pi to repair {len(problems)} problem(s): {problems[0][:200]}", flush=True)
        summaries.append(agent_pass(dict(context, repair=problems), settings["agent"], prompt, deadline, guard))
        problems = merge_problems(before, commit, common, conflicts)
    if problems:
        raise RuntimeError("; ".join(problem[:300] for problem in problems[:3]))
    sided = one_sided(before, commit, conflicts)
    report_one_sided(sided, " ".join(summary or "" for summary in summaries))
    git("add", "--all")
    if output("ls-files", "--unmerged"):
        raise RuntimeError("Unmerged index entries remain")
    added = introduced_whitespace(before, commit)
    if added:
        raise RuntimeError("The resolution added whitespace errors: " + "; ".join(added[:3]))
    body = [f"Step: {step['summary']}."]
    body += [f"Conflicted files left exactly as {ONE_SIDED[side]} had them: {', '.join(names)}."
             for side, names in sided.items()]
    git("commit", "-m", f"chore(sync): merge {reason} {commit[:12]}, keep the fork's i18n and features",
        *(arg for paragraph in body for arg in ("-m", paragraph)))
    if not ancestor(before, "HEAD") or not ancestor(commit, "HEAD"):
        raise RuntimeError("Candidate lost one of the merge parents")
    return sided


def one_sided(before: str, commit: str, conflicts: list[str]) -> dict[str, list[str]]:
    """Conflicted files the resolution left byte for byte as one parent had them.

    Sometimes one side is right, but taking it wholesale is also how a fork change or
    an upstream fix silently disappears, so each one is listed for review.
    """
    sided: dict[str, list[str]] = {}
    for name in conflicts:
        merged = blob(WORKTREE, name)
        side = next((side for side, revision in (("fork", before), ("upstream", commit))
                     if merged == blob(revision, name)), None)
        if side:
            sided.setdefault(side, []).append(name)
    return sided


def report_one_sided(sided: dict[str, list[str]], summary: str) -> None:
    if not sided:
        return
    print("Conflicted files resolved entirely to one side: "
          + "; ".join(f"{side}: {', '.join(names)}" for side, names in sided.items()), flush=True)
    unexplained = [name for names in sided.values() for name in names
                   if name not in summary and name.rpartition("/")[2] not in summary]
    if unexplained:
        warn(f"Pi's summary does not explain the one-sided resolution of {', '.join(unexplained[:5])}")


def blob(revision: str, name: str) -> bytes | None:
    """A file's bytes at ``revision`` (WORKTREE: on disk), None when absent."""
    if revision == WORKTREE:
        path = Path(name)
        return path.read_bytes() if path.is_file() and not path.is_symlink() else None
    shown = subprocess.run(["git", "show", f"{revision}:{name}"], capture_output=True, timeout=300, check=False)
    return shown.stdout if shown.returncode == 0 else None


def agent_pass(context: dict, settings: dict, prompt: str, deadline: float, guard: dict) -> str:
    """One Pi run on the pending merge, then the checks that it left Git and the controls alone."""
    seconds = max(0.0, deadline - time.monotonic())
    end = datetime.now(UTC) + timedelta(seconds=seconds)
    context = dict(context, time_limit_minutes=int(seconds // 60), deadline_utc=end.strftime("%Y-%m-%dT%H:%M:%SZ"))
    summary = run_coding_agent(context, settings, prompt, seconds)
    if output("rev-parse", "HEAD") != context["base"] or output("rev-parse", "MERGE_HEAD") != context["upstream"]:
        raise RuntimeError("Coding agent changed Git history or the pending merge")
    if control_snapshot() != guard:
        raise RuntimeError("Coding agent changed protected automation files")
    return summary


def merge_problems(before: str, commit: str, common: str, conflicts: list[str]) -> list[str]:
    """What a pass left unfinished: conflict markers, test cases the merge lost, and failing desktop
    UI tests beside what the step changed."""
    # Writing a resolved file does not clear Git's unmerged index until it is staged.
    paths = set(output("diff", "--name-only", "--no-renames", before).splitlines()) | set(conflicts)
    paths.update(output("ls-files", "--others", "--exclude-standard").splitlines())
    markers = [f"unresolved conflict markers in {name}" for name in sorted(paths) if has_markers(name)]
    paths.update(output("diff", "--name-only", "--no-renames", common, commit).splitlines())
    lost = dropped_tests.dropped(sorted(paths), read_version, before, commit, common, WORKTREE)
    problems = markers + [f"dropped test cases in {path}: {'; '.join(names)}" for path, names in lost.items()]
    # Tests cannot judge a tree that still holds conflict markers.
    if not markers:
        problems += desktop_tests.problems(before)
    return problems


def introduced_whitespace(before: str, commit: str) -> list[str]:
    """Whitespace errors on staged lines that neither parent has.

    Upstream's own commits carry some (a Markdown line break is two trailing
    spaces), and a merge that only brings them in must not fail on them.
    """
    def errors(parent: str) -> set[str]:
        found = git("diff", "--cached", "--check", parent, check=False).stdout
        return {line for line in found.splitlines() if WHITESPACE.match(line)}
    return sorted(errors(before) & errors(commit))


def has_markers(name: str) -> bool:
    path = Path(name)
    if not path.is_file() or path.is_symlink():
        return False
    text = path.read_bytes()
    return b"\0" not in text and bool(MARKER.search(text.decode("utf-8", errors="replace")))


def read_version(revision: str, name: str) -> str | None:
    if revision == WORKTREE:
        path = Path(name)
        if not path.is_file() or path.is_symlink():
            return None
        return path.read_text(encoding="utf-8-sig", errors="replace")
    shown = git("show", f"{revision}:{name}", check=False)
    return shown.stdout if shown.returncode == 0 else None


def agent_base_url(raw: str) -> str:
    url = urlsplit(raw)
    if (url.scheme != "https" or not url.hostname or url.username or url.password
            or url.query or url.fragment):
        raise RuntimeError("SYNC_AI_BASE_URL must be an HTTPS URL without credentials or query")
    # Pi's Anthropic client appends /v1/messages; preserve gateway path prefixes.
    path = url.path.rstrip("/")
    for suffix in ("/v1/messages", "/v1"):
        if path.endswith(suffix):
            path = path[:-len(suffix)]
            break
    return urlunsplit((url.scheme, url.netloc, path, "", ""))


def run_coding_agent(context: dict, settings: dict, prompt: str, timeout: float) -> str:
    """One Pi process, returning its completion summary; Pi owns the model/tool loop and compaction."""
    if not os.environ.get("SYNC_AI_API_KEY") or not os.environ.get("SYNC_AI_MODEL"):
        raise RuntimeError("Configure SYNC_AI_API_KEY and SYNC_AI_MODEL before syncing")
    model = os.environ["SYNC_AI_MODEL"]
    endpoint = agent_base_url(os.environ.get("SYNC_AI_BASE_URL", ""))
    env = {k: v for k, v in os.environ.items()
           if not k.startswith(("GH_", "GITHUB_", "ANTHROPIC_", "CLAUDE_", "PI_", "SYNC_"))}
    env["SYNC_AI_API_KEY"] = os.environ["SYNC_AI_API_KEY"]
    with tempfile.TemporaryDirectory(prefix="fork-sync-pi-") as folder:
        env["PI_CODING_AGENT_DIR"] = folder
        write_json(Path(folder) / "models.json", {"providers": {"fork-sync": {
            "baseUrl": endpoint, "api": "anthropic-messages", "apiKey": "$SYNC_AI_API_KEY",
            # Adaptive thinking: Pi sends thinking.type adaptive and output_config.effort, and an
            # unmapped max level would fall back to high.
            "models": [{"id": model, "reasoning": True, "thinkingLevelMap": {"max": "max"},
                        "compat": {"forceAdaptiveThinking": True}, "input": ["text"],
                        "contextWindow": settings["context_window"], "maxTokens": settings["max_tokens"]}],
        }}})
        command = [
            "pi", "--mode", "json", "--no-session", "--provider", "fork-sync", "--model", model,
            "--thinking", settings["thinking"], "--tools", "read,grep,find,ls,edit,write,bash",
            "--no-extensions", "--no-skills", "--no-prompt-templates", "--no-themes",
            "--no-context-files", "--no-mcp", "--no-approve", "--offline",
            "--append-system-prompt", prompt,
            "Complete this upstream integration:\n" + json.dumps(context),
        ]
        code, stream, timed_out = pi_session.run(command, env, timeout)
    if timed_out:
        raise RuntimeError(f"Pi did not finish within its {timeout / 60:.0f}-minute limit")
    if code:
        raise RuntimeError(f"Pi exited unsuccessfully ({code}); candidate not published")
    summary = check_pi_result(stream)
    print(f"Pi completed: {summary[:2000]}", flush=True)
    return summary


def check_pi_result(stream: str) -> str:
    """The summary of a session that ended in a completed assistant turn; raise otherwise."""
    last = None
    settled = False
    for line in stream.split("\n"):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except ValueError:
            raise RuntimeError("Pi returned invalid JSONL") from None
        if not isinstance(event, dict):
            raise RuntimeError("Pi returned an invalid event")
        kind = event.get("type")
        # A failed tool call (a command's non-zero exit, an edit that missed) is feedback for the
        # model, not an error: Pi reports every non-zero exit that way, and the controller checks
        # the merge result itself.
        if (kind in ("error", "extension_error")
                or event.get("assistantMessageEvent", {}).get("type") == "error"
                or (kind == "auto_retry_end" and not event.get("success"))
                or (kind == "compaction_end" and event.get("errorMessage"))):
            raise RuntimeError("Pi reported a model error; candidate not published")
        if kind == "agent_settled":
            settled = not event.get("aborted", True)
        if kind == "message_end" and event.get("message", {}).get("role") == "assistant":
            last = event["message"]
            if last.get("stopReason") in ("error", "aborted", "length"):
                raise RuntimeError("Pi assistant turn did not complete")
    if not settled or not last or last.get("stopReason") != "stop":
        raise RuntimeError("Pi did not finish a successful assistant turn")
    text = "\n".join(block.get("text", "") for block in last.get("content", []) if block.get("type") == "text")
    try:
        completion = json.loads(text)
    except ValueError:
        raise RuntimeError("Pi did not return the requested completion JSON") from None
    if not isinstance(completion, dict):
        raise RuntimeError("Pi did not return the requested completion JSON")
    status, summary = completion.get("status"), completion.get("summary")
    if status != "completed" or not isinstance(summary, str) or not summary.strip():
        # The step is discarded, and Pi's reason is its only record: the progress log never shows model text.
        said = " ".join(summary.split())[:REASON_SHOWN] if isinstance(summary, str) else ""
        detail = f" ({status}: {said})" if said else ""
        raise RuntimeError(f"Pi did not confirm completion{detail}; candidate not published")
    return summary


def control_snapshot() -> dict:
    names = set(output("ls-files").splitlines())
    names.update(output("ls-files", "--others", "--exclude-standard").splitlines())
    snapshot = {}
    for name in sorted(names):
        if not protected(name):
            continue
        path = Path(name)
        if path.is_symlink():
            snapshot[name] = ("symlink", os.readlink(path))
        elif path.is_file():
            snapshot[name] = (path.stat().st_mode, hashlib.sha256(path.read_bytes()).hexdigest())
        else:
            snapshot[name] = None
    return snapshot


def protected(path: str) -> bool:
    return (path.startswith((".github/", "scripts/fork_sync/"))
            or path.startswith("tests/scripts/test_fork_sync"))


def load_manifest(artifacts: Path, repository: str) -> dict:
    data = json.loads((artifacts / "manifest.json").read_text(encoding="utf-8-sig"))
    if data["repository"] != repository:
        raise RuntimeError("Artifact repository mismatch")
    for key in ("base", "candidate", "upstream"):
        if not isinstance(data.get(key), str) or not SHA.fullmatch(data[key]):
            raise RuntimeError(f"Invalid {key} SHA in artifact")
    if data["changed"] != (data["candidate"] != data["base"]):
        raise RuntimeError("Artifact change flag disagrees with its commits")
    return data


def import_candidate(artifacts: Path, repository: str) -> dict:
    data = load_manifest(artifacts, repository)
    if data["changed"]:
        git("bundle", "verify", str(artifacts / "candidate.bundle"))
        git("fetch", "--no-tags", str(artifacts / "candidate.bundle"),
            f"{CANDIDATE_REF}:refs/remotes/fork-sync/candidate")
        if output("rev-parse", "refs/remotes/fork-sync/candidate") != data["candidate"]:
            raise RuntimeError("Bundle does not contain the announced candidate")
    if not ancestor(data["base"], data["candidate"]) or not ancestor(data["upstream"], data["candidate"]):
        raise RuntimeError("Candidate does not preserve the fork and upstream history")
    for item in data["releases"]:
        if not ancestor(item["upstream_commit"], data["candidate"]):
            raise RuntimeError("Candidate does not include a planned release")
    return data


def checkout_candidate(artifacts: Path, repository: str) -> None:
    data = import_candidate(artifacts, repository)
    git("switch", "--detach", data["candidate"])


def validate(artifacts: Path, repository: str, lane: str) -> None:
    data = load_manifest(artifacts, repository)
    if output("rev-parse", "HEAD") != data["candidate"]:
        raise RuntimeError("Validation is not running against the prepared commit")
    for argv in lane_commands(lane, config(), data):
        print("Check:", " ".join(argv), flush=True)
        subprocess.run(argv, timeout=3600, check=True)
    if output("diff", "HEAD", "--name-only"):
        raise RuntimeError("Checks modified tracked candidate files")


def run_tests(argv: list[str], timeout: float) -> list[str]:
    """Run the test command with its output passed through; return the files it reports flaky.

    The runner re-runs a failed file once, as upstream CI does, so an intermittent upstream test
    does not throw away a merge that took hours. A file that passed only on that retry still means
    a race (in the test, or one the merge introduced), and a green job buries the runner's FLAKY
    summary in a long log, so the shard warns about each one.
    """
    flaky, previous = [], ""
    expired = threading.Event()
    with subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                          text=True, encoding="utf-8", errors="replace") as proc:
        def expire() -> None:
            expired.set()
            proc.kill()

        timer = threading.Timer(timeout, expire)
        timer.start()
        try:
            for line in proc.stdout:
                print(line, end="", flush=True)
                if line.startswith(FLAKY_REPORT) and previous.startswith("  "):
                    flaky.append(previous.strip())
                previous = line
            # A runner can close its output and still hang; the timer kills it at the deadline, so
            # this returns by then.
            proc.wait(timeout=timeout)
        finally:
            timer.cancel()
    if expired.is_set():
        raise subprocess.TimeoutExpired(argv, timeout)
    if proc.returncode:
        raise subprocess.CalledProcessError(proc.returncode, argv)
    return flaky


def run_shard(repository: str, artifacts: Path, shard: int) -> None:
    data = load_manifest(artifacts, repository)
    if output("rev-parse", "HEAD") != data["candidate"]:
        raise RuntimeError("Tests are not running against the prepared commit")
    total = data.get("tests", {}).get("shards", 0)
    if not 1 <= shard <= total:
        raise RuntimeError(f"Shard {shard} is outside the planned 1..{total}")
    # The runner partitions a sorted list round-robin, so every shard agrees on the split.
    argv = [*config()["tests"]["command"], "--files-from", str(artifacts / "tests.txt"),
            "--slice", f"{shard}/{total}"]
    print("Tests:", " ".join(argv), flush=True)
    # Tests must never write the account's own Hermes home (tests/AGENTS.md), and the suite's
    # in-process guard cannot see the children they spawn. The job tests under a temporary
    # HERMES_HOME on a runner that starts without the default home, so one that appears during
    # the run came from a test. A home that already existed (a developer machine) is not judged.
    account_home = Path.home() / ".hermes"
    preexisting = account_home.exists()
    flaky = run_tests(argv, 3600)
    if flaky:
        warn(f"Shard {shard}: {', '.join(flaky)} failed once and passed on retry; the FLAKY summary in"
             " this job's log has both attempts")
    if output("diff", "HEAD", "--name-only"):
        raise RuntimeError("Tests modified tracked candidate files")
    if not preexisting and account_home.exists():
        entries = ", ".join(sorted(entry.name for entry in account_home.iterdir()))
        raise RuntimeError(f"Tests wrote the real Hermes home {account_home} ({entries}): a test's"
                           " child process ran without an isolated HERMES_HOME")


def fetch_main() -> str:
    git("fetch", "--no-tags", "origin", "+refs/heads/main:refs/remotes/origin/main")
    return output("rev-parse", "refs/remotes/origin/main")


def reconcile_main(artifacts: Path, repository: str, reconciled: Path) -> None:
    """No toolchain needed: merge a main that moved during the run, and list what to re-check on it."""
    data = load_manifest(artifacts, repository)
    if output("rev-parse", "HEAD") != data["candidate"]:
        raise RuntimeError("Reconciliation is not starting from the prepared commit")
    state = reconcile.plan(data["base"], data["candidate"], fetch_main(), config())
    reconciled.mkdir(parents=True, exist_ok=True)
    write_json(reconciled / reconcile.STATE, state)
    reasons = {"diverged": "no longer contains the run's base", "conflict": "conflicts with the candidate",
               "too-broad": f"reaches more Python tests than one shard ({state.get('python')})"}
    if state["status"] in reasons:
        warn(f"Fork main moved to {state['main'][:12]} during the run and {reasons[state['status']]};"
             " the next run starts from it")
    print(f"Fork main {state['main'][:12]}: {state['status']}", flush=True)
    destination = os.environ.get("GITHUB_OUTPUT")
    if destination:
        with open(destination, "a", encoding="utf-8") as handle:
            handle.write(f"merged={str(state['status'] == 'merged').lower()}\n")


def recheck(artifacts: Path, repository: str, reconciled: Path) -> None:
    """With the toolchain installed: run the reconciled merge's checks, then bundle it for publish."""
    data = load_manifest(artifacts, repository)
    state = json.loads((reconciled / reconcile.STATE).read_text(encoding="utf-8-sig"))
    if state["status"] != "merged":
        return
    if output("rev-parse", "HEAD") != state["merged"]:
        raise RuntimeError("The re-check is not running against the reconciled merge")
    settings = config()
    for argv in state["commands"]:
        print("Check:", " ".join(argv), flush=True)
        subprocess.run(argv, timeout=3600, check=True)
    if state["desktop"]:
        print(f"Check: {' '.join(settings['ui_tests'])} on {len(state['desktop'])} test file(s)", flush=True)
        subprocess.run([*settings["ui_tests"], *(name.removeprefix("apps/desktop/") for name in state["desktop"])],
                       timeout=3600, check=True)
    if state["python"]:
        listing = reconciled / "python-tests.txt"
        listing.write_text("".join(f"{name}\n" for name in state["python"]), encoding="utf-8")
        flaky = run_tests([*settings["tests"]["command"], "--files-from", str(listing)], 3600)
        if flaky:
            warn(f"Re-check: {', '.join(flaky)} failed once and passed on retry")
    if output("diff", "HEAD", "--name-only"):
        raise RuntimeError("Checks modified tracked files of the reconciled merge")
    reconcile.write_bundle(reconciled, state, data["candidate"])


def publish(artifacts: Path, repository: str, reconciled: Path | None = None) -> None:
    data = import_candidate(artifacts, repository)
    # origin/main may advance while AI/tests run. Never force it back; the candidate lands on a newer
    # main only through the merge the reconcile job re-checked on top of it (reconcile.py).
    current = fetch_main()
    if ancestor(data["candidate"], current):
        landed = current
    elif current == data["base"]:
        git("push", "origin", f"{data['candidate']}:refs/heads/main")
        landed = data["candidate"]
    else:
        state_path = reconciled / reconcile.STATE if reconciled is not None else None
        state = json.loads(state_path.read_text(encoding="utf-8-sig")) if state_path and state_path.is_file() else None
        landed = reconcile.verified(state, reconciled, data["candidate"], current)
        git("push", "origin", f"{landed}:refs/heads/main")
        print(f"Main moved to {current[:12]} during the run; landed the candidate through the re-checked merge",
              flush=True)
    releases.publish(repository, data["releases"], data["candidate"])
    print(f"Published main {landed[:12]} and {len(data['releases'])} release(s)")
    # Upstream lands commits all hour: a run that reached its tip is usually behind again by now.
    more = bool(data.get("remaining")) or upstream_ahead(landed)
    destination = os.environ.get("GITHUB_OUTPUT")
    if destination:
        with open(destination, "a", encoding="utf-8") as handle:
            handle.write(f"continue={str(more).lower()}\n")


def upstream_ahead(landed: str) -> bool:
    """Whether upstream main, fetched now, has commits the landed fork main does not."""
    git("fetch", "--no-tags", UPSTREAM, "+refs/heads/main:refs/remotes/fork-upstream/main")
    return not ancestor(output("rev-parse", "refs/remotes/fork-upstream/main"), landed)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("phase", choices=("prepare", "materialize", "validate", "test", "reconcile", "recheck",
                                          "publish"))
    parser.add_argument("--artifacts", type=Path, required=True)
    parser.add_argument("--shard", type=int, default=0, help="test phase: 1-based shard number")
    parser.add_argument("--lane", help="validate phase: one of validation_lanes()")
    parser.add_argument("--reconciled", type=Path, help="reconcile, recheck, publish: the reconciled merge's folder")
    parser.add_argument("--repository", default=os.environ.get("GITHUB_REPOSITORY"), required=False)
    args = parser.parse_args()
    if not args.repository or args.repository.lower() == "nousresearch/hermes-agent":
        raise RuntimeError("This controller requires a fork repository")
    if args.phase in ("reconcile", "recheck") and args.reconciled is None:
        raise RuntimeError(f"The {args.phase} phase needs --reconciled")
    artifacts = args.artifacts.resolve()
    reconciled = args.reconciled.resolve() if args.reconciled else None
    phases = dict(prepare=prepare, materialize=checkout_candidate, validate=partial(validate, lane=args.lane),
                  test=partial(run_shard, shard=args.shard), reconcile=partial(reconcile_main, reconciled=reconciled),
                  recheck=partial(recheck, reconciled=reconciled), publish=partial(publish, reconciled=reconciled))
    phases[args.phase](repository=args.repository, artifacts=artifacts)


if __name__ == "__main__":
    main()
