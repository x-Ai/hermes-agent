"""``hermes chat``'s built-in delegation defaults: the shared subagent cap and the custom-endpoint
switch the fork adds both survive a config file that does not set them."""

import pytest


@pytest.mark.parametrize("text", ["", "delegation:\n  model: helper/model\n"])
def test_classic_cli_delegation_defaults_keep_the_shared_cap_and_the_endpoint_switch(
        tmp_path, monkeypatch, text):
    from hermes_cli.config import DEFAULT_CONFIG, cfg_get, load_config

    for var in ("HERMES_IGNORE_USER_CONFIG", "HERMES_IGNORE_RULES"):
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    (tmp_path / "config.yaml").write_text(text)
    import cli
    monkeypatch.setattr(cli, "_hermes_home", tmp_path)

    delegation = cli.load_cli_config()["delegation"]

    assert delegation["max_iterations"] == cfg_get(DEFAULT_CONFIG, "delegation", "max_iterations")
    assert delegation["max_iterations"] == load_config()["delegation"]["max_iterations"]
    assert delegation["use_custom_endpoints"] is False
    assert delegation["use_custom_endpoints"] == load_config()["delegation"]["use_custom_endpoints"]
