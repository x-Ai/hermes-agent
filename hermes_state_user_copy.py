"""Plain-language copy for "session storage is unavailable / could not be written" notices.

One table keyed by ``classify_persistence_error``'s cause bucket feeds every surface (CLI banner,
gateway home-channel warning, TUI/Desktop RPC errors) so they agree on what happened, what to do,
and a machine-readable ``code`` a GUI can attach a "Run doctor" button to. The prose lives in the
``storage`` section of ``locales/<lang>.yaml`` (``storage.cause.<bucket>`` / ``storage.action.<bucket>``)
and is resolved in the profile's ``display.language`` at lookup time.
"""

from __future__ import annotations

from dataclasses import dataclass

from hermes_state_errors import STORAGE_RECOVERY_DOCS_URL, classify_persistence_error, is_disk_full_error


@dataclass(frozen=True)
class StorageFailure:
    cause: str      # classify_persistence_error bucket
    code: str       # machine-readable, stable: storage_locked | storage_readonly | storage_corrupt | disk_full | ...
    gloss: str      # what happened, one clause, lowercase start
    action: str     # what to do, one sentence naming the exact command


# cause -> code. "disk" is split by is_disk_full_error at lookup time. ``deleted_wal`` keeps the
# ``storage_replaced`` code (GUI clients key on it); its copy names the real remedy: every writer on the
# profile must stop, doctor names the ones still holding the retired log (#110054).
_STORAGE_CODES: dict[str, str] = {
    "locked": "storage_locked",
    "disk_full": "disk_full",
    "disk": "storage_readonly",
    "corrupt": "storage_corrupt",
    "session_row_missing": "storage_session_missing",
    "fts_index": "storage_index_corrupt",
    "replaced": "storage_replaced",
    "deleted_wal": "storage_replaced",
    "compression": "storage_busy",
    "compression_closed": "storage_session_rotated",
    "turn_lease": "storage_busy",
    "unknown": "storage_unavailable",
}


def describe_storage_failure(exc_or_str) -> StorageFailure:
    """Plain-language description of a persistence failure (never raises)."""
    cause = classify_persistence_error(exc_or_str)
    key = "disk_full" if cause == "disk" and is_disk_full_error(exc_or_str) else cause
    if key not in _STORAGE_CODES:
        key = "unknown"
    from agent.i18n import t
    # Pin the copy-pasteable command to the failing profile — see profile_cli_selector.
    from hermes_constants import profile_cli_selector

    fmt = {"profile_arg": profile_cli_selector(), "url": STORAGE_RECOVERY_DOCS_URL}
    return StorageFailure(
        cause=cause, code=_STORAGE_CODES[key],
        gloss=t(f"storage.cause.{key}", **fmt), action=t(f"storage.action.{key}", **fmt))


def storage_failure_details(exc_or_str, limit: int = 200) -> str:
    """Raw cause for a trailing, secondary "Details:" line (never the lead sentence)."""
    text = " ".join(str(exc_or_str or "").split())
    return text if len(text) <= limit else text[: limit - 3].rstrip() + "..."
