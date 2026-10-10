"""The Desktop's About ▸ Updates row renders its stable/main selector only when the
source check reports ``channelSelectable``. This fork keeps the selector (stable = this
repository's latest release, main = every commit) while an unconfigured checkout rides
main, so the flag has to ride every report the check prints."""

import json
import sys

from hermes_cli import source_check


def test_check_report_offers_the_channel_selector(monkeypatch, capsys, tmp_path):
    seen = {}

    def fake_check(**kwargs):
        seen.update(kwargs)
        return {"supported": True, "branch": "main", "behind": 0}

    monkeypatch.setattr(source_check, "check_for_updates", fake_check)
    monkeypatch.setattr(sys, "argv", ["source_check", "--install-root", str(tmp_path), "--home", str(tmp_path / "home")])

    source_check.main()

    payload = json.loads(capsys.readouterr().out.strip().splitlines()[-1])
    assert payload["channelSelectable"] is True
    assert payload["branch"] == "main"
    # No --set-channel on the command line: the check runs without persisting anything.
    assert "set_channel" not in seen and seen["channel"] is None
