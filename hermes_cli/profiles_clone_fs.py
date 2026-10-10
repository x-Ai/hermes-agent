"""Filesystem mechanics of copying one profile tree into another (``hermes profile create --clone``,
``--clone-all``, the setup profile's skills refresh): symlink materialization and an NTFS
junction-preserving ``copytree``. Pure path operations; nothing here knows what a profile is.
"""

from __future__ import annotations

import logging
import os
import shutil
import stat
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Files a clone edits in place after copying. A ``--clone-all`` copy preserves symlinks
# (``symlinks=True``), so a symlinked source ``.env`` would otherwise be edited THROUGH the link and
# the channel stripping would mutate the SOURCE profile. These are materialized as real files first.
CLONE_MATERIALIZE = (".env", "config.yaml", "auth.json", "SOUL.md")


def materialize_symlinked_files(profile_dir: Path) -> list[str]:
    """Replace symlinked root files the clone will edit with private copies of their targets (a
    dangling link is dropped). Returns the relative names materialized."""
    done: list[str] = []
    for name in CLONE_MATERIALIZE:
        path = profile_dir / name
        if not path.is_symlink():
            continue
        target = Path(os.path.realpath(path))
        path.unlink()
        if target.is_file():
            shutil.copy2(target, path)
        done.append(name)
    return done


def junction_target(path: str) -> Optional[str]:
    """Target of an NTFS directory junction, else ``None``. A junction is a reparse point, not a
    symlink: ``os.path.islink()`` is False and ``shutil.copytree(symlinks=True)`` descends into it."""
    if os.name != "nt":
        return None
    try:
        if os.lstat(path).st_reparse_tag != stat.IO_REPARSE_TAG_MOUNT_POINT:
            return None
        target = os.readlink(path)
    except OSError:
        return None
    # readlink hands back the substitute name; CreateJunction rejects the ``\\?\`` spelling.
    if target.startswith("\\\\?\\UNC\\"):
        return "\\" + target[7:]
    return target[4:] if target.startswith("\\\\?\\") else target


def copytree_keep_junctions(src: Path, dst: Path, ignore, dirs_exist_ok: bool = False) -> None:
    """``shutil.copytree(symlinks=True)`` that re-creates NTFS junctions as junctions instead of
    traversing them. A ``skills/foo`` junction into a ``skills.external_dirs`` root copied as a
    physical tree is a second same-named candidate and ``_locate_skill`` refuses to guess (#113471).
    A junction whose target is gone is skipped with a warning, never a crash."""
    junctions: dict[str, str] = {}

    def _ignore(directory: str, names: list[str]) -> set:
        ignored = set(ignore(directory, names))
        for name in names:
            target = junction_target(os.path.join(directory, name))
            if target is not None:
                junctions[os.path.join(directory, name)] = target
                ignored.add(name)
        return ignored

    shutil.copytree(src, dst, symlinks=True, dirs_exist_ok=dirs_exist_ok, ignore=_ignore)
    if junctions:
        import _winapi  # Windows-only stdlib module; only reachable once a junction was seen
    for link, target in junctions.items():
        try:
            _winapi.CreateJunction(target, os.path.join(dst, os.path.relpath(link, src)))
        except OSError as exc:
            logger.warning("clone: skipped junction %s -> %s (%s)", link, target, exc)
