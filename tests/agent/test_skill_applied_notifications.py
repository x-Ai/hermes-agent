import json
from agent.background_review import summarize_background_review_actions
from tools.skill_manager_tool import skill_manage


def _messages(args, data, call_id="skill"):
    return [{"role": "assistant", "tool_calls": [{"id": call_id, "function": {
        "name": "skill_manage", "arguments": json.dumps(args)}}]},
        {"role": "tool", "tool_call_id": call_id, "content": json.dumps(data)}]


def test_applied_skill_operations_notify_with_names(tmp_path, monkeypatch):
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    name = "notify-contract"
    content = f"---\nname: {name}\ndescription: Use when checking notices. Verify applied writes.\n---\nRead the sample before editing.\n"
    operations = [{"name": name, "action": "create", "content": content},
                  {"name": name, "action": "patch", "old_string": "sample", "new_string": "example"},
                  {"name": name, "action": "write_file", "file_path": "references/a.md", "file_content": "Check the example."},
                  {"name": name, "action": "remove_file", "file_path": "references/a.md"},
                  {"name": name, "action": "delete"}]
    for op in operations:
        data = json.loads(skill_manage(action="", name="", operations=[op]))
        assert data["success"], data
        messages = _messages({"operations": [op]}, data)
        for mode in ("on", "verbose"):
            actions = summarize_background_review_actions(messages, [], mode)
            assert actions and all(name in line and "?" not in line for line in actions)
        assert summarize_background_review_actions(messages, [], "off") == []
    assert not (tmp_path / "skills" / name).exists()


def test_unapplied_skill_operations_never_notify():
    args = {"operations": [{"name": "pending", "action": "create"}]}
    for data in (
        {"success": True, "staged": True, "message": "Write staged for approval."},
        {"success": False, "results": [{"success": True, "name": "pending", "action": "create"}]},
        {"success": True, "operations_applied": 0, "results": []},
        {"success": True, "operations_applied": 1, "results": [{"success": False, "name": "pending", "action": "create"}]},
    ):
        for mode in ("on", "verbose"):
            assert summarize_background_review_actions(_messages(args, data), [], mode) == []


def test_batched_skill_operations_group_same_action_and_keep_paths():
    name = "crushftp-audit"
    results = [
        {"name": name, "action": "patch", "file_path": "references/live-target-probing.md", "success": True},
        {"name": name, "action": "patch", "file_path": "references/gates-and-accounts.md", "success": True},
        {"name": name, "action": "write_file", "file_path": "references/extra.md", "success": True},
    ]
    data = {"success": True, "operations_applied": len(results), "results": results}
    messages = _messages({"operations": results}, data)

    assert summarize_background_review_actions(messages, [], "on") == [
        "Skill 'crushftp-audit' patched (references/live-target-probing.md, references/gates-and-accounts.md)",
        "Skill 'crushftp-audit' written (references/extra.md)",
    ]


def test_skill_summary_does_not_depend_on_tool_call_batch_boundaries():
    name = "review-contract"
    first_path, second_path = "references/first.md", "references/accounts, and gates.md"
    results = [
        {"name": name, "action": "patch", "success": True},
        {"name": name, "action": "patch", "file_path": first_path, "success": True},
        {"name": name, "action": "write_file", "file_path": "references/extra.md", "success": True},
        {"name": name, "action": "patch", "file_path": second_path, "success": True},
        {"name": name, "action": "patch", "file_path": first_path, "success": True},
        {"name": "another-skill", "action": "patch", "success": True},
    ]
    expected = [
        f"Skill '{name}' patched (SKILL.md, {first_path}, {second_path})",
        f"Skill '{name}' written (references/extra.md)",
        "Skill 'another-skill' patched",
    ]

    for batches in ([results], [[result] for result in results], [results[:2], results[2:]]):
        messages = []
        for index, batch in enumerate(batches):
            messages.extend(_messages({"operations": batch}, {
                "success": True, "operations_applied": len(batch), "results": batch,
            }, f"call-{index}"))
        for mode in ("on", "verbose"):
            assert summarize_background_review_actions(messages, [], mode) == expected


def test_skill_summary_grouping_preserves_verbose_detail_and_applied_write_evidence():
    name = "review-detail-contract"
    prior_result = {"name": name, "action": "patch", "file_path": "references/prior.md", "success": True}
    prior = _messages({"operations": [prior_result]}, {
        "success": True, "operations_applied": 1, "results": [prior_result],
    }, "prior")
    messages = list(prior)
    for index, path in enumerate((None, "references/new.md")):
        result = {"name": name, "action": "patch", "file_path": path, "success": True}
        messages.extend(_messages({"operations": [result]}, {
            "success": True, "operations_applied": 1, "results": [result],
        }, f"applied-{index}"))
    messages.extend(_messages({"action": "patch", "name": name, "old_string": "old rule", "new_string": "new rule"}, {
        "success": True, "message": f"Patched SKILL.md in skill '{name}' (1 replacement).",
        "_change": {"old": "old rule", "new": "new rule"},
    }, "verbose"))
    for index, data in enumerate((
        {"success": True, "staged": True, "message": "Write staged for approval."},
        {"success": False, "operations_applied": 1, "results": [prior_result]},
        {"success": True, "operations_applied": 0, "results": [prior_result]},
        {"success": True, "operations_applied": 1, "results": [{**prior_result, "success": False}]},
        {"success": True, "operations_applied": 1, "results": [{**prior_result, "action": "future_action"}]},
    )):
        messages.extend(_messages({"operations": [prior_result]}, data, f"unapplied-{index}"))

    assert summarize_background_review_actions(messages, prior, "verbose") == [
        f"Skill '{name}' patched (SKILL.md, references/new.md)",
        f"📝 Skill '{name}' patched: \"old rule\" → \"new rule\"",
    ]
