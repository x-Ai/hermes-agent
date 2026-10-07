"""Shipped skills never lose their ``/<name>`` to a core command.

``scan_skill_commands`` drops a skill whose slug a core command (name or alias) already owns, and
a user cannot rename a built-in. ``DELIBERATE`` lists the shipped skills whose slug a core command
claims on purpose (empty since Collective Wisdom V1 and its ``/collective-wisdom-install`` alias
left the tree); any other collision fails here instead of silently vanishing a /command for every
user.
"""
from pathlib import Path

from agent.skill_commands import slugify_skill_name
from hermes_cli.commands import resolve_command
from tools.skills_tool import _parse_frontmatter

REPO = Path(__file__).resolve().parents[2]

# skill name -> core command whose alias IS the skill's name.
DELIBERATE: dict[str, str] = {}


def _shipped_skill_names():
    paths = sorted(list(REPO.glob("skills/**/SKILL.md")) + list(REPO.glob("optional-skills/**/SKILL.md")))
    for skill_md in paths:
        frontmatter, _body = _parse_frontmatter(skill_md.read_text(encoding="utf-8-sig"))
        yield frontmatter.get("name", skill_md.parent.name)


def test_shipped_skill_slugs_collide_with_core_commands_only_by_design():
    collisions = {}
    for name in _shipped_skill_names():
        slug = slugify_skill_name(name)
        command = resolve_command(slug) if slug else None
        if command is not None:
            collisions[name] = command.name
    assert collisions == DELIBERATE, (
        f"shipped skill(s) whose /command a core command shadows: {collisions}. Rename the skill, or — "
        "when the core command fronts it on purpose — alias the skill's exact name and list it in DELIBERATE.")
    for name, command_name in DELIBERATE.items():
        assert name in resolve_command(command_name).aliases, f"/{name} is not an explicit alias of /{command_name}"
