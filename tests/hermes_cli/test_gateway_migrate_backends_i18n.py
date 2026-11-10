"""``hermes gateway migrate --backends`` renders its report prose in the profile's language
(``shared.gateway_backends``): the title, row labels, ownership sentences, notes and flag errors are
translated, while what the host reports (supervisor names, unit, scope, PID, paths, unit-file state,
argv) stays as written. English keeps the report's original layout byte for byte.
"""

from __future__ import annotations

import shlex
from types import SimpleNamespace

import pytest

from agent import i18n
from hermes_cli import gateway_migrate as gm
from hermes_cli import gateway_migrate_backends as gmb


@pytest.fixture(autouse=True)
def _fresh_language_cache():
    i18n.reset_language_cache()
    yield
    i18n.reset_language_cache()


_ARGV = ["/opt/venv/bin/python", "-m", "hermes_cli.main", "dashboard", "--port", "9119"]


def _item() -> gmb.BackendItem:
    item = gmb.BackendItem(supervisor="systemd", running=True, pid=4101, argv=list(_ARGV),
                           unit="hermes-web.service", scope="user",
                           unit_path="/home/u/.config/systemd/user/hermes-web.service", state="disabled",
                           hermes_home="/home/u/.hermes")
    return gmb._finish(item, "/home/u/.hermes")


def test_english_report_keeps_its_layout(monkeypatch):
    monkeypatch.setenv("HERMES_LANGUAGE", "en")
    lines = gmb.format_report([_item()])

    assert lines == [
        "Serve/dashboard background services (report only; nothing was changed)",
        "",
        "• systemd hermes-web.service (user): PID 4101",
        f"    runs:    {shlex.join(_ARGV)}",
        "    file:    /home/u/.config/systemd/user/hermes-web.service",
        "    state:   disabled",
        "    home:    /home/u/.hermes (this HERMES_HOME)",
        "    report:  Report only: changes no service; backend migration is not available yet.",
        "    note:    The unit was written by hand (Hermes never installs one).",
        "    note:    `hermes update`'s systemd unit pass matches only hermes-gateway*/hermes-serve*/"
        "hermes-dashboard* names, so it does not list hermes-web.service.",
        "    note:    The unit is disabled: it does not start at boot.",
    ]
    assert gmb.format_report([])[-1] == "  No running or enabled hermes serve / hermes dashboard backend found."


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_chinese_report_translates_prose_and_keeps_host_facts(monkeypatch, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)
    item = _item()
    lines = gmb.format_report([item])
    text = "\n".join(lines)

    def tr(key, **kw):
        return i18n.t(f"shared.gateway_backends.{key}", lang=lang, **kw)

    assert lines[0] == tr("title") and "report only" not in lines[0]
    # The host's own facts are never translated.
    assert "• systemd hermes-web.service (user): PID 4101" in lines
    assert shlex.join(_ARGV) in text and "/home/u/.config/systemd/user/hermes-web.service" in text
    assert "disabled" in text and "/home/u/.hermes" in text and "HERMES_HOME" in text
    # The JSON report carries the same translated prose.
    assert item.not_applied == tr("not_applied")
    assert item.notes == [tr("owner_systemd"), tr("update_skips_unit", unit="hermes-web.service"),
                          tr("unit_disabled")]
    assert "hermes-web.service" in item.notes[1] and "hermes-gateway*/hermes-serve*/hermes-dashboard*" in item.notes[1]
    for label in ("label_runs", "label_file", "label_state", "label_home", "label_report", "label_note"):
        assert any(line.startswith(f"    {tr(label)} ") for line in lines), label
    assert not any(word in text for word in ("runs:", "note:", "written by hand", "Report only"))
    assert gmb.format_report([])[-1] == f"  {tr('none_found')}"


def test_long_translated_label_still_leaves_a_space(monkeypatch):
    monkeypatch.setattr(gmb, "_t", lambda key, **kw: "megjegyzés:" if key == "label_note" else key)
    assert gmb._field("label_note", "value") == "    megjegyzés: value"


@pytest.mark.parametrize("lang", ["zh", "zh-hant"])
def test_flag_errors_are_localized(monkeypatch, capsys, lang):
    monkeypatch.setenv("HERMES_LANGUAGE", lang)

    with pytest.raises(SystemExit) as exc:
        gm.cmd_migrate(SimpleNamespace(backends=True, json=False, dry_run=False, yes=True, multiplex=False))
    assert exc.value.code == 2
    assert capsys.readouterr().err.strip() == f"✗ {i18n.t('shared.gateway_backends.readonly_flags', lang=lang)}"

    with pytest.raises(SystemExit) as exc:
        gm.cmd_migrate(SimpleNamespace(backends=False, json=True, dry_run=True, yes=False, multiplex=True))
    assert exc.value.code == 2
    err = capsys.readouterr().err.strip()
    assert err == f"✗ {i18n.t('shared.gateway_backends.json_needs_backends', lang=lang)}"
    assert "--json" in err and "--backends" in err and "only supported" not in err
