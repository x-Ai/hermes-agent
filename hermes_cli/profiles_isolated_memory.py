"""Persistent memory a profile keeps apart from the default profile (``profile.yaml`` ``isolated_memory``).

``hermes profile create --clone`` and the Desktop's New Bot / New profile dialogs copy the source
profile's ``memories/MEMORY.md`` and ``USER.md`` into the new profile, so every bot starts with the
default profile's notes. A bot pinned to a model whose safety filter rejects some of those notes then
fails every turn, and switching memory off for it loses the feature. Memory itself is per profile
either way (``tools.memory_tool.get_memory_dir``): the flag changes what a profile is SEEDED with,
never which files a session reads.

* creation (``create_profile(isolated_memory=True)``) leaves the copied memory files out and writes
  the flag (``start_isolated``);
* switching an existing profile on removes the entries identical to the default profile's current
  entries and keeps the ones the profile wrote itself (``isolate_profile_memory``);
* switching it off copies the default profile's missing entries back in, within the profile's own
  char budgets, writing nothing when a target would overflow (``inherit_default_memory``).

The default root is never isolated from itself. Both switch operations go through ``MemoryStore``
(its lock, drift guard, threat scan and budgets), so a running agent on the profile sees the same
on-disk contract as its own writes.
"""

from __future__ import annotations

import contextlib
import logging
from pathlib import Path
from typing import Any, Iterator

from hermes_constants import (
    get_default_hermes_root, profile_name_for_home, reset_hermes_home_override, set_hermes_home_override,
)

logger = logging.getLogger(__name__)

ISOLATED_MEMORY_KEY = "isolated_memory"
# Store target -> file under ``<home>/memories``, in the order results report them.
MEMORY_FILES = (("memory", "MEMORY.md"), ("user", "USER.md"))


def _is_default_root(home: Path) -> bool:
    return profile_name_for_home(home) == "default"


def _profile_yaml(home: Path) -> dict:
    from hermes_cli.profiles import _load_yaml_dict
    return _load_yaml_dict(Path(home) / "profile.yaml") or {}


@contextlib.contextmanager
def _home_scope(home: Path) -> Iterator[None]:
    """Bind ``home`` as the Hermes home so ``MemoryStore`` reads and writes ITS memory files with ITS
    configured budgets. Callers inside a full profile runtime scope re-bind the same home; harmless."""
    token = set_hermes_home_override(str(home))
    try:
        yield
    finally:
        reset_hermes_home_override(token)


# ── the flag ─────────────────────────────────────────────────────────────────────────────────────

def profile_memory_is_isolated(profile_home: Path) -> bool:
    """``profile.yaml`` ``isolated_memory`` of ``profile_home``; always False for the default root."""
    from utils import is_truthy_value
    home = Path(profile_home)
    if _is_default_root(home):
        return False
    return is_truthy_value(_profile_yaml(home).get(ISOLATED_MEMORY_KEY, False))


def set_profile_memory_isolated(profile_home: Path, enabled: bool) -> None:
    """Write the flag in place (other ``profile.yaml`` fields untouched); off removes the key."""
    from utils import atomic_yaml_write
    path = Path(profile_home) / "profile.yaml"
    existing = _profile_yaml(path.parent)
    if enabled:
        existing[ISOLATED_MEMORY_KEY] = True
    else:
        existing.pop(ISOLATED_MEMORY_KEY, None)
    atomic_yaml_write(path, existing, sort_keys=False)


def start_isolated(profile_home: Path) -> list[str]:
    """Creation: drop the memory files a clone copied (and their lock files) and write the flag, so the
    profile's first session starts from an empty store. Returns the file names removed."""
    home = Path(profile_home)
    removed: list[str] = []
    for _target, name in MEMORY_FILES:
        path = home / "memories" / name
        if path.is_file():
            path.unlink()
            removed.append(name)
        path.with_suffix(path.suffix + ".lock").unlink(missing_ok=True)
    set_profile_memory_isolated(home, True)
    return removed


# ── what the profile holds vs. the default profile ───────────────────────────────────────────────

def memory_entries(home: Path) -> dict[str, list[str]]:
    """``{"memory": [...], "user": [...]}`` of ``<home>/memories`` as the memory tool parses them
    (de-duplicated, first occurrence wins); ``[]`` for a missing or unreadable file."""
    from tools.memory_tool import MemoryStore
    base = Path(home) / "memories"
    return {target: list(dict.fromkeys(MemoryStore._read_file(base / name))) for target, name in MEMORY_FILES}


def inherited_memory_counts(profile_home: Path) -> dict[str, int]:
    """Per target, how many of ``profile_home``'s entries are identical to a default-profile entry: what
    switching isolation on would remove. Zeros for the default root."""
    home = Path(profile_home)
    if _is_default_root(home):
        return {target: 0 for target, _name in MEMORY_FILES}
    own, root = memory_entries(home), memory_entries(get_default_hermes_root())
    return {target: sum(1 for entry in own[target] if entry in set(root[target])) for target, _name in MEMORY_FILES}


def _refusal(isolated: bool, failure_class: str, **extra: Any) -> dict[str, Any]:
    return {"ok": False, "isolated": isolated, "failure_class": failure_class, **extra}


# ── the switch ───────────────────────────────────────────────────────────────────────────────────

def isolate_profile_memory(profile_home: Path) -> dict[str, Any]:
    """Switch ON: remove every entry of ``profile_home`` that is identical to a current default-profile
    entry (one locked ``remove`` each: a batch refuses to empty a store, and a bot that never wrote a
    note of its own ends up empty here on purpose), then write the flag. Entries only the profile
    holds stay. ``{"ok": True, "isolated": True, "removed": {target: n}}``; a store refusal (drift,
    unreadable file) stops at that entry and reports ``failure_class`` / ``error`` with the flag
    unchanged."""
    from tools.memory_tool import load_on_disk_store
    from tools.memory_tool_store import FAILURE_CLASS
    home = Path(profile_home)
    if _is_default_root(home):
        return _refusal(False, "default_profile")
    root = memory_entries(get_default_hermes_root())
    removed = {target: 0 for target, _name in MEMORY_FILES}
    with _home_scope(home):
        store = load_on_disk_store()
        for target, own in (("memory", store.memory_entries), ("user", store.user_entries)):
            for entry in [e for e in own if e in set(root[target])]:
                result = store.remove(target, entry)
                if not result.get("success"):
                    return _refusal(profile_memory_is_isolated(home), FAILURE_CLASS.get(), target=target,
                                    error=str(result.get("error") or ""), removed=removed)
                removed[target] += 1
    set_profile_memory_isolated(home, True)
    logger.info("profile %s: memory isolated from the default profile (removed %s)", home.name, removed)
    return {"ok": True, "isolated": True, "removed": removed}


def inherit_default_memory(profile_home: Path) -> dict[str, Any]:
    """Switch OFF: copy the default profile's entries ``profile_home`` lacks into it (one atomic batch
    per target, in the default profile's order), then clear the flag. Entries the threat scan would
    refuse are skipped and counted. Both targets are budgeted BEFORE anything is written: an overflow
    reports ``failure_class: "over_budget"`` with ``target`` / ``chars`` / ``limit`` and changes
    nothing. ``{"ok": True, "isolated": False, "added": {target: n}, "skipped": n}``."""
    from tools.memory_tool import load_on_disk_store
    from tools.memory_tool_store import ENTRY_DELIMITER, FAILURE_CLASS
    from tools.threat_patterns import first_threat_message
    home = Path(profile_home)
    if _is_default_root(home):
        return _refusal(False, "default_profile")
    root = memory_entries(get_default_hermes_root())
    with _home_scope(home):
        store = load_on_disk_store()
        plan: dict[str, list[str]] = {}
        skipped = 0
        for target, own, limit in (("memory", store.memory_entries, store.memory_char_limit),
                                   ("user", store.user_entries, store.user_char_limit)):
            missing: list[str] = []
            for entry in root[target]:
                if entry in own or entry in missing:
                    continue
                if first_threat_message(entry, scope="strict"):
                    skipped += 1
                    continue
                missing.append(entry)
            chars = len(ENTRY_DELIMITER.join([*own, *missing]))
            if missing and chars > limit:
                return _refusal(True, "over_budget", target=target, chars=chars, limit=limit, skipped=skipped)
            plan[target] = missing
        added = {target: 0 for target, _name in MEMORY_FILES}
        for target, missing in plan.items():
            if not missing:
                continue
            result = store.apply_batch(target, [{"action": "add", "content": entry} for entry in missing])
            if not result.get("success"):
                return _refusal(True, FAILURE_CLASS.get(), target=target, error=str(result.get("error") or ""),
                                added=added, skipped=skipped)
            added[target] = len(missing)
    set_profile_memory_isolated(home, False)
    logger.info("profile %s: memory follows the default profile again (added %s, skipped %d)",
                home.name, added, skipped)
    return {"ok": True, "isolated": False, "added": added, "skipped": skipped}
