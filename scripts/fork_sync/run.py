#!/usr/bin/env python3
"""Trusted controller for the fork's prepare → validate → publish workflow.

Copy this directory out of the checkout BEFORE merging. Run that copy, never
candidate-controlled Python, in jobs that receive an AI key or a write token.
Its modules are imported before the coding agent runs, so the agent's shell
cannot swap the test selection that plans validation.
"""
from __future__ import annotations

import argparse
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
from urllib.parse import urlsplit, urlunsplit

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import releases
import select_tests

UPSTREAM = "https://github.com/NousResearch/hermes-agent.git"
CANDIDATE_REF = "refs/heads/fork-sync-candidate"
SHA = re.compile(r"[0-9a-f]{40}")
MARKER = re.compile(r"^(?:<{7}|={7}|>{7})(?: |$)", re.MULTILINE)


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


def prepare(repository: str, artifacts: Path) -> None:
    if output("status", "--porcelain"):
        raise RuntimeError("Preparation requires a clean disposable checkout")
    settings = config()
    base = output("rev-parse", "HEAD")
    git("config", "user.name", "hermes-upstream-sync[bot]")
    git("config", "user.email", "hermes-upstream-sync@users.noreply.github.com")
    git("fetch", "--no-tags", UPSTREAM, "+refs/heads/main:refs/remotes/fork-upstream/main")
    upstream = output("rev-parse", "refs/remotes/fork-upstream/main")
    since = os.environ.get("SYNC_RELEASES_SINCE") or settings["releases_since"]
    pending = releases.discover(repository, since)
    artifacts.mkdir(parents=True, exist_ok=True)
    manifest = dict(repository=repository, base=base, upstream=upstream,
                    candidate=base, changed=False, needed=False, releases=pending)
    write_json(artifacts / "manifest.json", manifest)
    targets = [(upstream, "upstream main")]
    targets.extend((item["upstream_commit"], f"release {item['tag_name']}") for item in pending)
    prompt = (HERE / "prompt.md").read_text(encoding="utf-8-sig")
    try:
        for commit, reason in targets:
            if ancestor(commit, "HEAD"):
                continue
            merge_one(commit, reason, settings, prompt)
    except Exception:
        save_diagnostics(artifacts)
        raise
    candidate = output("rev-parse", "HEAD")
    manifest.update(candidate=candidate, changed=candidate != base,
                    needed=candidate != base or bool(pending))
    if manifest["changed"]:
        git("update-ref", CANDIDATE_REF, candidate)
        git("bundle", "create", str(artifacts / "candidate.bundle"), CANDIDATE_REF, f"^{base}")
        manifest["tests"] = plan_tests(manifest, settings["tests"], artifacts)
    write_json(artifacts / "manifest.json", manifest)
    emit(manifest)
    print(f"Prepared {candidate[:12]}; code changed={manifest['changed']}; releases={len(pending)}")


def plan_tests(manifest: dict, settings: dict, artifacts: Path) -> dict:
    """Write the Python test files the merge can affect; the test matrix shards them."""
    result = select_tests.plan(Path.cwd(), manifest["base"], manifest["candidate"],
                               manifest["upstream"], settings)
    print(select_tests.describe(result), flush=True)
    (artifacts / "tests.txt").write_text("".join(f"{path}\n" for path in result["files"]), encoding="utf-8")
    return dict(mode=result["mode"], files=len(result["files"]), weight=result["weight"],
                shards=result["shards"])


def save_diagnostics(artifacts: Path) -> None:
    (artifacts / "working-tree.patch").write_text(
        git("diff", "--binary", "HEAD", check=False).stdout, encoding="utf-8",
    )
    (artifacts / "conflicts.txt").write_text(
        git("diff", "--name-only", "--diff-filter=U", check=False).stdout, encoding="utf-8",
    )
    git("bundle", "create", str(artifacts / "recovery.bundle"), "HEAD", check=False)


def merge_one(commit: str, reason: str, settings: dict, prompt: str) -> None:
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
    run_coding_agent(dict(base=before, upstream=commit, merge_base=common,
                          conflicts=conflicts, reason=reason), settings["agent"], prompt)
    if output("rev-parse", "HEAD") != before or output("rev-parse", "MERGE_HEAD") != commit:
        raise RuntimeError("Coding agent changed Git history or the pending merge")
    if control_snapshot() != guard:
        raise RuntimeError("Coding agent changed protected automation files")
    # Writing a resolved file does not clear Git's unmerged index until it is staged.
    paths = set(output("diff", "--name-only", before).splitlines()) | set(conflicts)
    paths.update(output("ls-files", "--others", "--exclude-standard").splitlines())
    for name in paths:
        path = Path(name)
        if path.is_file() and not path.is_symlink():
            text = path.read_bytes()
            if b"\0" not in text and MARKER.search(text.decode("utf-8", errors="replace")):
                raise RuntimeError(f"Unresolved conflict markers in {name}")
    git("add", "--all")
    if output("ls-files", "--unmerged"):
        raise RuntimeError("Unmerged index entries remain")
    git("diff", "--cached", "--check")
    git("commit", "-m", f"chore(sync): merge {reason} {commit[:12]} and preserve localization")
    if not ancestor(before, "HEAD") or not ancestor(commit, "HEAD"):
        raise RuntimeError("Candidate lost one of the merge parents")


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


def run_coding_agent(context: dict, settings: dict, prompt: str) -> None:
    """One subprocess call; Pi owns the model/tool loop and compaction."""
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
        result = subprocess.run(
            command, env=env, stdin=subprocess.DEVNULL, capture_output=True,
            text=True, encoding="utf-8", errors="replace", timeout=settings["timeout_seconds"], check=False,
        )
    if result.returncode:
        raise RuntimeError(f"Pi exited unsuccessfully ({result.returncode}); candidate not published")
    check_pi_result(result.stdout)
    print("Pi completed upstream integration")


def check_pi_result(stream: str) -> None:
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
        if (kind in ("error", "extension_error") or event.get("isError")
                or event.get("assistantMessageEvent", {}).get("type") == "error"
                or (kind == "auto_retry_end" and not event.get("success"))
                or (kind == "compaction_end" and event.get("errorMessage"))):
            raise RuntimeError("Pi reported a model or tool error; candidate not published")
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
