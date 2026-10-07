"""A built-in this tree shipped and withdrew is cleaned off user machines by the next sync.

collective-wisdom-install shipped with Collective Wisdom V1 and left with it; sync never deletes a
dropped built-in on its own (#95415), so an unmodified copy would keep advertising wisdom_* tools
that no longer exist. The retired list removes exactly such copies; an edited copy is the user's.
"""
from contextlib import ExitStack
from unittest.mock import patch

from tools.skills_sync import RETIRED_BUNDLED_SKILLS, _dir_hash, _read_manifest, _write_manifest, sync_skills

RETIRED = "collective-wisdom-install"


def _seed(stack, tmp_path, monkeypatch):
    bundled = tmp_path / "bundled" / "productivity" / "keeper"
    bundled.mkdir(parents=True)
    (bundled / "SKILL.md").write_text("---\nname: keeper\ndescription: Stays bundled.\n---\n# keeper\n", encoding="utf-8")
    monkeypatch.setenv("HERMES_BUNDLED_SKILLS", str(tmp_path / "bundled"))
    skills_dir = tmp_path / "skills"
    skills_dir.mkdir()
    stack.enter_context(patch("tools.skills_sync.SKILLS_DIR", skills_dir))
    stack.enter_context(patch("tools.skills_sync.MANIFEST_FILE", skills_dir / ".bundled_manifest"))
    copy = skills_dir / "productivity" / RETIRED
    copy.mkdir(parents=True)
    (copy / "SKILL.md").write_text(
        f"---\nname: {RETIRED}\ndescription: Browse team skills.\n---\n# shipped copy\n", encoding="utf-8")
    _write_manifest({RETIRED: _dir_hash(copy)})
    return copy


def test_collective_wisdom_install_is_retired():
    assert RETIRED in RETIRED_BUNDLED_SKILLS


def test_unmodified_copy_of_a_retired_built_in_is_removed(tmp_path, monkeypatch):
    with ExitStack() as stack:
        copy = _seed(stack, tmp_path, monkeypatch)
        result = sync_skills(quiet=True)
        assert not copy.exists()
        assert RETIRED not in _read_manifest()
    assert result["retired"] == [RETIRED]
    assert "keeper" in result["copied"]


def test_edited_copy_of_a_retired_built_in_stays(tmp_path, monkeypatch):
    with ExitStack() as stack:
        copy = _seed(stack, tmp_path, monkeypatch)
        (copy / "SKILL.md").write_text(f"---\nname: {RETIRED}\ndescription: My notes.\n---\n# mine\n", encoding="utf-8")
        result = sync_skills(quiet=True)
        assert (copy / "SKILL.md").exists()
        assert RETIRED in _read_manifest()
    assert result["retired"] == []
