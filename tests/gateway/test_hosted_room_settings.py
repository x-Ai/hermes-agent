"""Fork: per-room settings beside upstream's hosted rooms — defaults, patch merge, revision CAS, the
working-directory ladder, validation and purge (``gateway/hosted_room_settings.py``)."""

from __future__ import annotations

import pytest

from gateway import hosted_room_settings as settings


@pytest.fixture
def db(tmp_path):
    return tmp_path / "shared-state.db"


def test_a_room_without_a_row_reads_the_defaults_at_revision_zero(db):
    read = settings.read_settings(db, "room-1")
    assert read == {"room_id": "room-1", "revision": 0, "settings": settings.defaults()}
    assert read["settings"]["hold_detection"] is True and read["settings"]["workspace"] is None


def test_writes_merge_scalars_and_folder_maps_and_bump_the_revision(db):
    first = settings.write_settings(db, "room-1", {"workspace": " /srv/room ", "handle": "@Release-Room"})
    assert first["revision"] == 1
    assert first["settings"]["workspace"] == "/srv/room" and first["settings"]["handle"] == "release-room"

    second = settings.write_settings(
        db, "room-1", {"member_workspaces": {"alpha": "/srv/alpha"}, "thread_workspaces": {"t1": "/srv/t1"}},
        expected_revision=1)
    assert second["revision"] == 2
    assert second["settings"]["workspace"] == "/srv/room"  # untouched by a patch that names other keys
    assert second["settings"]["member_workspaces"] == {"alpha": "/srv/alpha"}

    # null clears a scalar and removes one folder entry; other entries survive the merge.
    third = settings.write_settings(
        db, "room-1", {"workspace": None, "member_workspaces": {"alpha": None, "beta": "/srv/beta"}})
    assert third["settings"]["workspace"] is None
    assert third["settings"]["member_workspaces"] == {"beta": "/srv/beta"}
    assert third["settings"]["thread_workspaces"] == {"t1": "/srv/t1"}
    assert settings.read_settings(db, "room-1") == third


def test_a_stale_expected_revision_is_refused_with_the_stored_revision(db):
    settings.write_settings(db, "room-1", {"workspace": "/a"})
    settings.write_settings(db, "room-1", {"workspace": "/b"})
    with pytest.raises(settings.RoomSettingsConflictError) as info:
        settings.write_settings(db, "room-1", {"workspace": "/c"}, expected_revision=1)
    assert info.value.revision == 2 and info.value.reason == "revision_conflict"
    assert settings.read_settings(db, "room-1")["settings"]["workspace"] == "/b"


@pytest.mark.parametrize("patch, reason", [
    ({"colour": "red"}, "unknown_key"),
    ({"handle": "all"}, "invalid_handle"),
    ({"handle": "Has Space"}, "invalid_handle"),
    ({"workspace": "x" * (settings.MAX_PATH_CHARS + 1)}, "invalid"),
    ({"hold_detection": "yes"}, "invalid"),
    ({"member_workspaces": ["/a"]}, "invalid"),
    ({"member_workspaces": {"bad id!": "/a"}}, "invalid"),
])
def test_invalid_patches_are_refused_and_leave_nothing_behind(db, patch, reason):
    with pytest.raises(settings.RoomSettingsError) as info:
        settings.write_settings(db, "room-1", patch)
    assert info.value.reason == reason
    assert settings.read_settings(db, "room-1")["revision"] == 0


def test_folder_maps_are_capped(db):
    too_many = {f"m{i}": f"/srv/{i}" for i in range(settings.MAX_MEMBER_WORKSPACES + 1)}
    with pytest.raises(settings.RoomSettingsError) as info:
        settings.write_settings(db, "room-1", {"member_workspaces": too_many})
    assert info.value.reason == "too_many"


def test_the_ladder_prefers_the_member_then_the_thread_then_the_room():
    ladder = {"workspace": "/room", "member_workspaces": {"alpha": "/alpha"}, "thread_workspaces": {"t1": "/t1"}}
    assert settings.resolve_member_cwd(ladder, member_id="alpha", thread_id="t1") == "/alpha"
    assert settings.resolve_member_cwd(ladder, member_id="beta", thread_id="t1") == "/t1"
    assert settings.resolve_member_cwd(ladder, member_id="beta", thread_id="t2") == "/room"
    assert settings.resolve_member_cwd(ladder, member_id="beta", thread_id=None) == "/room"
    assert settings.resolve_member_cwd(settings.defaults(), member_id="beta", thread_id="t1") is None


def test_purge_removes_only_the_named_rooms(db):
    settings.write_settings(db, "room-1", {"workspace": "/a"})
    settings.write_settings(db, "room-2", {"workspace": "/b"})
    assert settings.purge_settings(db, ["room-1", "room-3"]) == 1
    assert settings.read_settings(db, "room-1")["revision"] == 0
    assert settings.read_settings(db, "room-2")["settings"]["workspace"] == "/b"


def test_room_ids_follow_the_hosted_room_identifier_grammar(db):
    with pytest.raises(settings.RoomSettingsError):
        settings.read_settings(db, "../escape")
