"""install.ps1's stable lookup asks the releases of the repository it installs.

The Windows twin of test_install_sh_stable_repository: a GitHub origin's own releases (a fork cuts its
own), and for any other origin the releases of the repository this installer clones by default, as
`hermes update` picks them (`source_releases.source_repository`). Real Windows PowerShell runs
Get-LatestStableRelease with api.github.com stubbed per repository.
"""
from pathlib import Path
import shutil
import subprocess

import pytest

from hermes_cli.source_releases import OFFICIAL_REPOSITORY

pytestmark = pytest.mark.platforms("windows")
INSTALL_PS1 = Path(__file__).resolve().parents[3] / "scripts" / "install.ps1"
UPSTREAM_REPOSITORY = "NousResearch/hermes-agent"
LATEST = {OFFICIAL_REPOSITORY: "v1.2.3", UPSTREAM_REPOSITORY: "v1.3.0"}


@pytest.mark.parametrize("origin,repository", [
    (f"https://github.com/{OFFICIAL_REPOSITORY}.git", OFFICIAL_REPOSITORY),  # the default URL
    ("git@github.com:NousResearch/hermes-agent.git", UPSTREAM_REPOSITORY),
    ("C:\\mirrors\\hermes-agent", OFFICIAL_REPOSITORY),
])
def test_stable_lookup_asks_the_installed_repository(tmp_path, origin, repository):
    powershell = shutil.which("powershell")
    if not powershell:
        pytest.skip("Windows PowerShell is required")
    latest = "; ".join(f"'https://api.github.com/repos/{name}/releases/latest' = '{tag}'"
                       for name, tag in LATEST.items())
    wrapper = tmp_path / "lookup.ps1"
    wrapper.write_text(
        f". '{INSTALL_PS1}'\n"
        # Keys match case-insensitively, as GitHub matches owner/repo. Any other URL answers a tag no
        # repository published, so a wrong lookup fails the assertion instead of reaching the network.
        f"$StubLatestTags = @{{ {latest} }}\n"
        "function Invoke-RestMethod([string]$Uri, $Headers, $TimeoutSec) {\n"
        "    $tag = $StubLatestTags[$Uri]\n"
        "    if (-not $tag) { $tag = 'v0.0.1' }\n"
        "    [pscustomobject]@{ tag_name = $tag }\n"
        "}\n"
        f"Get-LatestStableRelease '{origin}'\n", encoding="utf-8")

    result = subprocess.run(
        [powershell, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", str(wrapper)],
        check=False, capture_output=True, text=True, encoding="utf-8", errors="replace",
        stdin=subprocess.DEVNULL, timeout=120,
    )

    assert result.returncode == 0, result.stdout + result.stderr
    assert result.stdout.strip() == LATEST[repository], result.stdout + result.stderr
