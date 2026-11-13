"""The foreign-checkout refusal (a damaged plugin .git that git resolves elsewhere, #146032) is prose
a dashboard or CLI user acts on: it follows the caller's language and keeps the paths verbatim."""

import subprocess

from agent import i18n


def _refusal_in(lang, plugin):
    from hermes_cli.plugins_cmd_git import _foreign_checkout_error

    token = i18n.bind_client_language(lang)
    try:
        return _foreign_checkout_error("git", plugin)
    finally:
        i18n.reset_client_language(token)


def test_refusal_naming_the_enclosing_repo_follows_the_client_language(tmp_path):
    home = tmp_path / "home"
    plugin = home / "plugins" / "demo"
    plugin.mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=home, check=True)
    (plugin / ".git").mkdir()  # an empty plugin .git: git walks up to the home repo
    resolved = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=plugin, capture_output=True,
                              text=True, check=True).stdout.strip()

    message = _refusal_in("zh", plugin)

    assert message == i18n.t("cli.plugins.foreign_checkout", lang="zh", path=plugin, resolved=resolved)
    assert message != i18n.t("cli.plugins.foreign_checkout", lang="en", path=plugin, resolved=resolved)
    assert str(plugin) in message and resolved in message


def test_refusal_without_any_repo_follows_the_client_language(tmp_path, monkeypatch):
    plugin = tmp_path / "plugins" / "demo"
    (plugin / ".git").mkdir(parents=True)
    monkeypatch.setenv("GIT_CEILING_DIRECTORIES", str(tmp_path))  # nothing above to resolve to

    message = _refusal_in("zh-hant", plugin)

    assert message == i18n.t("cli.plugins.foreign_checkout_no_repo", lang="zh-hant", path=plugin)
    assert message != i18n.t("cli.plugins.foreign_checkout_no_repo", lang="en", path=plugin)
