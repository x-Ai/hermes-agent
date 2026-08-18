"""Update-source contract for the customized x-Ai desktop distribution."""


def test_x_ai_repository_is_the_canonical_update_source():
    from hermes_cli import banner, update_cmd

    expected = "https://github.com/x-Ai/hermes-agent.git"

    assert update_cmd.OFFICIAL_REPO_URL == expected
    assert banner._UPSTREAM_REPO_URL == expected
    assert update_cmd._is_fork(expected) is False
    assert update_cmd._is_fork("git@github.com:x-Ai/hermes-agent.git") is False
    assert update_cmd._is_fork("https://github.com/NousResearch/hermes-agent.git") is True


def test_x_ai_release_and_compare_endpoints_are_used():
    from hermes_cli import banner

    assert banner._RELEASE_URL_BASE == "https://github.com/x-Ai/hermes-agent/releases/tag"
    assert banner._OFFICIAL_REPO_CANONICAL == "github.com/x-ai/hermes-agent"
