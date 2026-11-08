"""Run one Pi JSON-mode session and report its progress in the job log.

The controller used to see nothing until Pi exited, and a timeout threw the
whole event stream away, so an hour-long session left no trace of where its
time went. Each tool call is printed when it starts (the tool and a path, a
pattern or the first line of a bash command; never tool output or model text),
then failed and slow calls, model retries and compactions. The closing summary
counts turns, output tokens and tool time, and names any tool still running when
the time limit hit. Actions masks the API key secret in the log.

Pi starts every bash command in its own process group and kills those groups
when it receives SIGTERM. A SIGKILL skips that cleanup and leaves the commands
running after Pi is gone, so a timeout sends SIGTERM first.
"""
from __future__ import annotations

from collections import Counter
import json
import subprocess
import threading
import time
from typing import Callable

GRACE_SECONDS = 20
SHOWN = 150
SLOW_SECONDS = 60
ERROR_LINES = 20


def describe(tool: str, args: object) -> str:
    """A tool call as one short log line: its path, pattern or first command line."""
    args = args if isinstance(args, dict) else {}
    if tool == "bash":
        lines = str(args.get("command", "")).strip().splitlines() or [""]
        text = lines[0] + (" …" if len(lines) > 1 else "")
        if args.get("timeout"):
            text += f" [timeout {args['timeout']}s]"
    else:
        text = " ".join(str(args[key]) for key in ("pattern", "path") if args.get(key))
    text = " ".join(text.split())
    return f"{tool} {text[:SHOWN]}{'…' if len(text) > SHOWN else ''}".rstrip()


class Progress:
    def __init__(self, write: Callable[[str], None]):
        self.started = time.monotonic()
        self.write = write
        self.turns = 0
        self.output = 0
        self.calls: Counter = Counter()
        self.seconds: Counter = Counter()
        self.durations: list[tuple[float, str]] = []
        self.running: dict[object, tuple[str, float]] = {}

    def line(self, text: str) -> None:
        self.write(f"[pi {(time.monotonic() - self.started) / 60:5.1f}m] {text}")

    def record(self, event: dict) -> None:
        kind = event.get("type")
        tool = str(event.get("toolName"))
        if kind == "tool_execution_start":
            text = describe(tool, event.get("args"))
            self.running[event.get("toolCallId")] = (text, time.monotonic())
            self.calls[tool] += 1
            self.line(text)
        elif kind == "tool_execution_end":
            text, began = self.running.pop(event.get("toolCallId"), (tool, time.monotonic()))
            duration = event.get("durationMs")
            seconds = duration / 1000 if isinstance(duration, (int, float)) else time.monotonic() - began
            self.seconds[tool] += seconds
            self.durations.append((seconds, text))
            if event.get("isError"):
                self.line(f"  failed after {seconds:.0f}s: {text}")
            elif seconds >= SLOW_SECONDS:
                self.line(f"  took {seconds / 60:.1f}m: {text}")
        elif kind == "message_end" and (event.get("message") or {}).get("role") == "assistant":
            self.turns += 1
            output = ((event["message"].get("usage") or {}).get("output"))
            self.output += output if isinstance(output, int) else 0
        elif kind == "auto_retry_start":
            self.line(f"model retry {event.get('attempt')}/{event.get('maxAttempts')}: "
                      f"{str(event.get('errorMessage', ''))[:SHOWN]}")
        elif kind == "compaction_start":
            self.line(f"compacting the context ({event.get('reason')})")

    def summary(self, timed_out: bool) -> str:
        minutes = (time.monotonic() - self.started) / 60
        lines = [f"Pi {'hit its time limit' if timed_out else 'exited'} after {minutes:.1f} min: "
                 f"{self.turns} model turns, {self.output} output tokens, {sum(self.calls.values())} tool calls"]
        if self.calls:
            lines.append("  tool time: " + ", ".join(
                f"{tool} {count}x {self.seconds[tool] / 60:.1f}m" for tool, count in self.calls.most_common()))
        lines += [f"  slowest: {seconds / 60:.1f}m {text}"
                  for seconds, text in sorted(self.durations, reverse=True)[:5] if seconds >= SLOW_SECONDS / 2]
        lines += [f"  still running after {(time.monotonic() - began) / 60:.1f}m: {text}"
                  for text, began in self.running.values()]
        return "\n".join(lines)


def stop(process: subprocess.Popen) -> None:
    """SIGTERM lets Pi kill its commands' process groups first; SIGKILL if it does not exit."""
    process.terminate()
    try:
        process.wait(timeout=GRACE_SECONDS)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=GRACE_SECONDS)


def run(command: list[str], env: dict, timeout: float,
        write: Callable[[str], None] = lambda text: print(text, flush=True)) -> tuple[int, str, bool]:
    """Run Pi until it exits or ``timeout`` seconds pass: (exit code, JSONL stream, timed out)."""
    progress = Progress(write)
    process = subprocess.Popen(command, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    records: list[str] = []
    errors: list[str] = []

    def read_events() -> None:
        # Binary lines split on LF only: U+2028 inside a JSON string is not a record boundary.
        for raw in process.stdout:
            line = raw.decode("utf-8", errors="replace")
            records.append(line)
            try:
                event = json.loads(line)
            except ValueError:
                continue
            if isinstance(event, dict):
                progress.record(event)

    def read_errors() -> None:
        for raw in process.stderr:
            errors.append(raw.decode("utf-8", errors="replace").rstrip())
            del errors[:-ERROR_LINES]

    readers = [threading.Thread(target=read, daemon=True) for read in (read_events, read_errors)]
    for reader in readers:
        reader.start()
    timed_out = False
    try:
        process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        timed_out = True
        stop(process)
    for reader in readers:
        reader.join(GRACE_SECONDS)
    write(progress.summary(timed_out))
    if process.returncode and errors:
        write("Pi stderr (last lines):\n" + "\n".join(f"  {line}" for line in errors))
    return process.returncode, "".join(records), timed_out
