"""A built-in reaching ``command.dispatch`` never depends on binding the session profile's secrets.

Only a plugin command needs the profile's secret scope (``_dispatch_plugin_in_profile_scope``,
#133244). A secret source that fails to load must leave every built-in working, as it does for
``slash.exec`` (test_plugin_command_profile_scope.py): no wrapper may bind the full profile scope
around the whole dispatch and fail the built-in before its stage runs.
"""

from __future__ import annotations


def test_builtin_command_dispatch_runs_when_the_profile_secret_bind_fails(tmp_path, monkeypatch):
    launch = tmp_path / ".hermes"
    secondary = launch / "profiles" / "infra"
    secondary.mkdir(parents=True)
    (launch / "config.yaml").write_text("{}\n", encoding="utf-8")
    (secondary / "config.yaml").write_text("{}\n", encoding="utf-8")
    (secondary / ".env").write_text("PROBE_KEY=infra-key\n", encoding="utf-8")
    monkeypatch.setenv("HERMES_HOME", str(launch))

    from hermes_cli import env_loader
    from hermes_cli import plugins as plugins_mod
    from tui_gateway import server

    def _boom(home):
        raise RuntimeError("secret source unavailable")

    monkeypatch.setattr(env_loader, "hydrate_profile_secret_sources", _boom)
    plugins_mod._reset_plugin_managers_for_tests()
    server._sessions["sid-infra"] = {"session_key": "s-infra", "cwd": "", "profile_home": str(secondary)}
    try:
        res = server._methods["command.dispatch"](
            1, {"session_id": "sid-infra", "name": "queue", "arg": "hi"})
    finally:
        server._sessions.pop("sid-infra", None)
        plugins_mod._reset_plugin_managers_for_tests()
    assert res.get("result") == {"type": "send", "message": "hi"}, res
