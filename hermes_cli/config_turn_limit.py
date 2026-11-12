"""Formatting for resolved foreground turn budgets."""

from hermes_cli.config import TURN_LIMIT_UNLIMITED


def turn_limit_label(limit: int, unlimited: str = "unlimited") -> str:
    """How a resolved turn limit reads on screen; *unlimited* is the caller's word for no cap
    (the classic CLI passes its localized ``cli.config.value_unlimited``)."""
    return unlimited if limit == TURN_LIMIT_UNLIMITED else str(limit)
