from hermes_cli.web_server_config import CONFIG_SCHEMA


def test_dashboard_schema_exposes_desktop_added_runtime_controls():
    expected_types = {
        "agent.output_truncation_retries": "number",
        "agent.post_tool_empty_retries": "number",
        "agent.thinking_prefill_retries": "number",
        "agent.empty_response_retries": "number",
        "agent.environment_probe": "boolean",
        "terminal.container_persistent": "boolean",
        "terminal.docker_mount_cwd_to_workspace": "boolean",
        "terminal.docker_workspace_per_session": "boolean",
        "terminal.docker_workspace_mount_path": "string",
        "terminal.singularity_mount_cwd_to_workspace": "boolean",
        "terminal.singularity_workspace_per_session": "boolean",
        "terminal.singularity_workspace_mount_path": "string",
        "delegation.use_custom_endpoints": "boolean",
        "delegation.model": "string",
        "delegation.provider": "string",
    }

    assert {key: CONFIG_SCHEMA[key]["type"] for key in expected_types} == expected_types
    retry_keys = {
        "agent.output_truncation_retries",
        "agent.post_tool_empty_retries",
        "agent.thinking_prefill_retries",
        "agent.empty_response_retries",
    }
    assert {key: CONFIG_SCHEMA[key]["options"] for key in retry_keys} == {
        key: [0, 1, 2, 3] for key in retry_keys
    }
