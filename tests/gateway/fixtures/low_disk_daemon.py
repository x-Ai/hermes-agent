"""Test-only daemon whose state.db disk reads as low (1 GiB free of 100 GiB), so the low-disk
auto-prune question is due for every undecided profile; everything else is the ordinary daemon."""
import runpy

from hermes_cli import prune_advisor

_disk_snapshot = prune_advisor.disk_snapshot


def low_disk(home=None):
    snap = _disk_snapshot(home)
    return snap and prune_advisor.DiskSnapshot(snap.db_bytes, prune_advisor.GIB, 100 * prune_advisor.GIB)


prune_advisor.disk_snapshot = low_disk
runpy.run_module('gateway.run', run_name='__main__')
