#!/usr/bin/env python3
"""Trusted controller for the fork's prepare → validate → publish workflow.

Copy this directory out of the checkout BEFORE merging. Run that copy, never
candidate-controlled Python, in jobs that receive an AI key or a write token.
Its sibling modules are imported before the coding agent runs, so the agent's
shell cannot swap the step planning, the dropped-test guard or the test selection.
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
import time
from urllib.parse import urlsplit, urlunsplit

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import dropped_tests
import pi_session
import releases
import select_tests
import steps

UPSTREAM = "https://github.com/NousResearch/hermes-agent.git"
CANDIDATE_REF = "refs/heads/fork-sync-candidate"
SHA = re.compile(r"[0-9a-f]{40}")
MARKER = re.compile(r"^(?:<{7}|={7}|>{7})(?: |$)", re.MULTILINE)
WORKTREE = ""  # read_version's revision for the files on disk
WHITESPACE = re.compile(r"^[^+].*:\d+: ")  # a `git diff --check` finding, not its quoted line
# A repair pass needs time to read the problems and fix them; less than this is not worth starting.
REPAIR_SECONDS = 300


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
            for key in ("base", "candidate", "upstream", "changed", "needed"):
                value = manifest[key]
                handle.write(f"{key}={str(value).lower() if isinstance(value, bool) else value}\n")
            shards = manifest.get("tests", {}).get("shards", 0)
            handle.write(f"shards={json.dumps(list(range(1, shards + 1)))}\n")


def warn(message: str) -> None:
    """A warning annotation, so a partial sync shows on the run page without opening the log."""
    text = message.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
    print(f"::warning title=Fork sync::{text}", flush=True)


def prepare(repository: str, artifacts: Path) -> None:
    if output("status", "--porcelain"):
        raise RuntimeError("Preparation requires a clean disposable checkout")
    settings = config()
    base = output("rev-parse", "HEAD")
    git("config", "user.name", "hermes-upstream-sync[bot]")
    git("config", "user.email", "hermes-upstream-sync@users.noreply.github.com")
    git("fetch", "--no-tags", UPSTREAM, "+refs/heads/main:refs/remotes/fork-upstream/main")
    tip = output("rev-parse", "refs/remotes/fork-upstream/main")
    since = os.environ.get("SYNC_RELEASES_SINCE") or settings["releases_since"]
    pending = releases.discover(repository, since)
    artifacts.mkdir(parents=True, exist_ok=True)
    manifest = dict(repository=repository, base=base, upstream=tip, upstream_tip=tip,
                    candidate=base, changed=False, needed=False, releases=pending, steps=[])
    write_json(artifacts / "manifest.json", manifest)
    integrate(manifest, settings, artifacts)
    write_json(artifacts / "manifest.json", manifest)
    emit(manifest)


def integrate(manifest: dict, settings: dict, artifacts: Path) -> None:
    """Merge as much as this run's budget allows and record the candidate in ``manifest``."""
    base, tip, pending = manifest["base"], manifest["upstream_tip"], manifest["releases"]
    if not ancestor(tip, "HEAD"):
        print(f"Upstream main backlog: {steps.measure('HEAD', tip).describe()}", flush=True)
    done = merge_steps(tip, pending, settings, (HERE / "prompt.md").read_text(encoding="utf-8-sig"), artifacts)
    # Publish up to the last batch upstream finished; with none finished, publish what was merged.
    ends = [index for index, item in enumerate(done) if item["batch_end"]]
    keep = ends[-1] + 1 if ends else len(done)
    if keep < len(done):
        git("reset", "--hard", done[keep - 1]["merged"])
        warn(f"{len(done) - keep} step(s) inside an unfinished upstream batch were not published; "
             "the next run merges them again")
        done = done[:keep]
    candidate = output("rev-parse", "HEAD")
    finished = ancestor(tip, candidate)
    # Releases the candidate does not contain yet are discovered again by the next run.
    included = [item for item in pending if ancestor(item["upstream_commit"], candidate)]
    manifest.update(candidate=candidate, upstream=tip if finished else done[-1]["commit"],
                    changed=candidate != base, needed=candidate != base or bool(included),
                    releases=included, steps=done)
    if manifest["changed"]:
        git("update-ref", CANDIDATE_REF, candidate)
        git("bundle", "create", str(artifacts / "candidate.bundle"), CANDIDATE_REF, f"^{base}")
        manifest["tests"] = plan_tests(manifest, settings["tests"], artifacts)
    left = "" if finished else f"; upstream main continues in the next run from {manifest['upstream'][:12]}"
    print(f"Prepared {candidate[:12]}: {len(done)} step(s), {len(included)} of {len(pending)} release(s){left}")


def merge_steps(tip: str, pending: list[dict], settings: dict, prompt: str, artifacts: Path) -> list[dict]:
    """Merge upstream main, then each pending release, one bounded step at a time.

    Steps stop when everything is merged or the time budget cannot fit another.
    A step that fails after an earlier one succeeded is discarded with a warning:
    the completed steps become the candidate and the next run continues from
    them. Only a failure in the first step fails the run.
    """
    agent = settings["agent"]
    deadline = time.monotonic() + agent["budget_seconds"]
    done: list[dict] = []
    while True:
        remaining = deadline - time.monotonic()
        step = next_step(tip, pending, settings["steps"], remaining / agent["budget_seconds"])
        if step is None:
            return done
        number = len(done) + 1
        if remaining < agent["min_step_seconds"]:
            warn(f"Time budget used after {len(done)} step(s); the next run continues with {step['reason']}")
            return done
        print(f"Step {number}: merge {step['reason']} {step['commit'][:12]} ({step['summary']})", flush=True)
        before = output("rev-parse", "HEAD")
        try:
            merge_one(step, settings, prompt, deadline)
        except Exception as error:
            save_diagnostics(artifacts, number, step, error)
            if not done:
                raise
            git("reset", "--hard", before)
            git("clean", "-fdq")
            warn(f"Step {number} ({step['reason']} {step['commit'][:12]}) was discarded: {error}")
            return done
        done.append(dict(step, merged=output("rev-parse", "HEAD")))


def next_step(tip: str, pending: list[dict], limits: dict, scale: float) -> dict | None:
    """The next bounded step: upstream main first, then each release not merged yet.

    Limits shrink with the budget left, so a late step is sized for the time remaining.
    """
    head = output("rev-parse", "HEAD")
    if not ancestor(tip, head):
        bound = [max(1, round(limits[key] * min(scale, 1.0))) for key in ("max_conflicts", "max_review_files")]
        step, reason = steps.furthest(head, tip, *bound), "upstream main"
    else:
        release = next((item for item in pending if not ancestor(item["upstream_commit"], head)), None)
        if release is None:
            return None
        step, reason = steps.measure(head, release["upstream_commit"]), f"release {release['tag_name']}"
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


def merge_one(step: dict, settings: dict, prompt: str, deadline: float) -> None:
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
    agent_pass(context, settings["agent"], prompt, deadline, guard)
    problems = merge_problems(before, commit, common, conflicts)
    if problems and deadline - time.monotonic() >= REPAIR_SECONDS:
        print(f"Asking Pi to repair {len(problems)} problem(s): {problems[0][:200]}", flush=True)
        agent_pass(dict(context, repair=problems), settings["agent"], prompt, deadline, guard)
        problems = merge_problems(before, commit, common, conflicts)
    if problems:
        raise RuntimeError("; ".join(problem[:300] for problem in problems[:3]))
    git("add", "--all")
    if output("ls-files", "--unmerged"):
        raise RuntimeError("Unmerged index entries remain")
    added = introduced_whitespace(before, commit)
    if added:
        raise RuntimeError("The resolution added whitespace errors: " + "; ".join(added[:3]))
    git("commit", "-m", f"chore(sync): merge {reason} {commit[:12]} and preserve localization",
        "-m", f"Step: {step['summary']}.")
    if not ancestor(before, "HEAD") or not ancestor(commit, "HEAD"):
        raise RuntimeError("Candidate lost one of the merge parents")


def agent_pass(context: dict, settings: dict, prompt: str, deadline: float, guard: dict) -> None:
    """One Pi run on the pending merge, then the checks that it left Git and the controls alone."""
    seconds = max(0.0, deadline - time.monotonic())
    end = datetime.now(UTC) + timedelta(seconds=seconds)
    context = dict(context, time_limit_minutes=int(seconds // 60), deadline_utc=end.strftime("%Y-%m-%dT%H:%M:%SZ"))
    run_coding_agent(context, settings, prompt, seconds)
    if output("rev-parse", "HEAD") != context["base"] or output("rev-parse", "MERGE_HEAD") != context["upstream"]:
        raise RuntimeError("Coding agent changed Git history or the pending merge")
    if control_snapshot() != guard:
        raise RuntimeError("Coding agent changed protected automation files")


def merge_problems(before: str, commit: str, common: str, conflicts: list[str]) -> list[str]:
    """What a pass left unfinished: conflict markers, and test cases the merge lost."""
    # Writing a resolved file does not clear Git's unmerged index until it is staged.
    paths = set(output("diff", "--name-only", "--no-renames", before).splitlines()) | set(conflicts)
    paths.update(output("ls-files", "--others", "--exclude-standard").splitlines())
    problems = [f"unresolved conflict markers in {name}" for name in sorted(paths) if has_markers(name)]
    paths.update(output("diff", "--name-only", "--no-renames", common, commit).splitlines())
    lost = dropped_tests.dropped(sorted(paths), read_version, before, commit, common, WORKTREE)
    problems += [f"dropped test cases in {path}: {'; '.join(names)}" for path, names in lost.items()]
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


def run_coding_agent(context: dict, settings: dict, prompt: str, timeout: float) -> None:
    """One Pi process; Pi owns the model/tool loop and compaction."""
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
            "models": [{"id": model, "reasoning": False, "input": ["text"],
                        "contextWindow": settings["context_window"], "maxTokens": settings["max_tokens"]}],
        }}})
        command = [
            "pi", "--mode", "json", "--no-session", "--provider", "fork-sync", "--model", model,
            "--thinking", "off", "--tools", "read,grep,find,ls,edit,write,bash",
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
    print(f"Pi completed: {check_pi_result(stream)[:2000]}", flush=True)


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
    if (not isinstance(completion, dict) or completion.get("status") != "completed"
            or not isinstance(completion.get("summary"), str) or not completion["summary"].strip()):
        raise RuntimeError("Pi did not confirm completion; candidate not published")
    return completion["summary"]


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


def validate(artifacts: Path, repository: str) -> None:
    data = load_manifest(artifacts, repository)
    if output("rev-parse", "HEAD") != data["candidate"]:
        raise RuntimeError("Validation is not running against the prepared commit")
    for command in config()["checks"]:
        argv = [part.replace("{base}", data["base"]).replace("{candidate}", data["candidate"])
                for part in command]
        print("Check:", " ".join(argv), flush=True)
        subprocess.run(argv, timeout=3600, check=True)
    if output("diff", "HEAD", "--name-only"):
        raise RuntimeError("Checks modified tracked candidate files")


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
    subprocess.run(argv, timeout=3600, check=True)
    if output("diff", "HEAD", "--name-only"):
        raise RuntimeError("Tests modified tracked candidate files")


def publish(artifacts: Path, repository: str) -> None:
    data = import_candidate(artifacts, repository)
    # origin/main may advance while AI/tests run. Never force it back or silently
    # rebase onto untested code; the next poll rebuilds from the new main.
    git("fetch", "--no-tags", "origin", "+refs/heads/main:refs/remotes/origin/main")
    current = output("rev-parse", "refs/remotes/origin/main")
    if current not in (data["base"], data["candidate"]):
        raise RuntimeError("Fork main changed during validation; retry from the new main")
    if current != data["candidate"]:
        git("push", "origin", f"{data['candidate']}:refs/heads/main")
    releases.publish(repository, data["releases"], data["candidate"])
    print(f"Published main {data['candidate'][:12]} and {len(data['releases'])} release(s)")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("phase", choices=("prepare", "materialize", "validate", "test", "publish"))
    parser.add_argument("--artifacts", type=Path, required=True)
    parser.add_argument("--shard", type=int, default=0, help="test phase: 1-based shard number")
    parser.add_argument("--repository", default=os.environ.get("GITHUB_REPOSITORY"), required=False)
    args = parser.parse_args()
    if not args.repository or args.repository.lower() == "nousresearch/hermes-agent":
        raise RuntimeError("This controller requires a fork repository")
    artifacts = args.artifacts.resolve()
    phases = dict(prepare=prepare, materialize=checkout_candidate, validate=validate,
                  test=partial(run_shard, shard=args.shard), publish=publish)
    phases[args.phase](repository=args.repository, artifacts=artifacts)


if __name__ == "__main__":
    main()
