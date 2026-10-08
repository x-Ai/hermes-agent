"""Data-policy confirmation helpers for model selection surfaces.

Some inference tiers are cheap *because* the vendor trains on your prompts. A static rule table (not
a ProviderProfile hook) because the guard runs inside core selection code (``auth.py`` /
``web_server.py``), which never calls into the active provider profile.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from agent.i18n import t


@dataclass(frozen=True)
class DataTrainingWarning:
    """Confirmation payload for models whose tier trains on user data."""

    model: str
    provider: str
    message: str


# Rule predicates are deliberately conservative: match an explicit, vendor-documented id rather
# than guessing from price (a corroborating signal that can change).

def _is_meta_contributor(model_lower: str, provider_lower: str) -> bool:
    # Meta "contributor" tier, matched on the id alone (no provider check) so it fires whether
    # selected via the meta-ai plugin, a gateway, or a custom endpoint serving the same id.
    return model_lower.endswith("-contributor") or "contributor" in model_lower.split("-")


def _meta_contributor_message() -> str:
    """Catalog copy (``core.model_switch.meta_contributor_*``), resolved per call so the confirm follows
    the surface's language; the English rendering is the former literal."""
    return "\n\n".join([
        t("core.model_switch.meta_contributor_banner"),
        t("core.model_switch.meta_contributor_intro"),
        t("core.model_switch.meta_contributor_pricing"),
        t("core.model_switch.meta_contributor_usage"),
        t("core.model_switch.meta_contributor_confirm")])


# (predicate, message builder) pairs, evaluated in order; first match wins. Builders rather than
# strings: catalog text must resolve at call time, never at import.
_RULES: tuple[tuple[Callable[[str, str], bool], Callable[[], str]], ...] = (
    (_is_meta_contributor, _meta_contributor_message),
)


def data_training_warning(
    model_name: str,
    *,
    provider: Optional[str] = None,
    # Reserved for host-scoped rules (e.g. third-party relays) — unused for now, on purpose.
    base_url: Optional[str] = None,
) -> Optional[DataTrainingWarning]:
    """Warning payload when *model_name* selects a data-training tier, else ``None``. Call after model
    resolution; surface ``.message`` as a confirm prompt."""
    model = (model_name or "").strip()
    if not model:
        return None
    model_lower, provider_lower = model.lower(), (provider or "").strip().lower()
    for predicate, message in _RULES:
        try:
            if predicate(model_lower, provider_lower):
                return DataTrainingWarning(model=model, provider=(provider or "").strip(), message=message())
        except Exception:
            continue  # a misbehaving predicate must never break model selection
    return None
