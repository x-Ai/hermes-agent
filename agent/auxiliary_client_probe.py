"""Availability-probe mode for the auxiliary client (split out of the facade).

check_fns only need to know whether a client is RESOLVABLE, so inside ``aux_probe_mode()`` the
facade's constructors return :class:`_AuxProbeClientStub` instead of importing openai and building
httpx/SSL (~0.3s on CLI startup). Stubs are never cached (see ``_store_cached_client``)."""
from __future__ import annotations

import contextlib
import threading
from typing import Any

_aux_probe_state = threading.local()


class _AuxProbeClientStub:
    """Non-functional placeholder returned while `aux_probe_mode` is active."""
    __slots__ = ("api_key", "base_url")

    def __init__(self, api_key: str = "", base_url: str = "") -> None:
        self.api_key = api_key
        self.base_url = base_url

    def __getattr__(self, name: str) -> Any:
        # Loud failure if a probe stub ever leaks into a runtime call path.
        raise RuntimeError(
            f"_AuxProbeClientStub used as a real client (attribute {name!r}); "
            "aux_probe_mode is for availability checks only")

    def __repr__(self) -> str:
        return "<aux availability-probe client stub>"


def _aux_probe_active() -> bool:
    return bool(getattr(_aux_probe_state, "active", False))


@contextlib.contextmanager
def aux_probe_mode():
    """Resolve provider availability without constructing real SDK clients."""
    prev = getattr(_aux_probe_state, "active", False)
    _aux_probe_state.active = True
    try:
        yield
    finally:
        _aux_probe_state.active = prev
