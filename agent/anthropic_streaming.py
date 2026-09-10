"""SSE compatibility for third-party Anthropic Messages endpoints.

Some relays send ``data: {"type": "message_start", ...}`` without an ``event:``
field. The SDK silently discards these frames because it dispatches by event
name. Keep its framing and message accumulation, supplying only the missing name.
Imported lazily after the optional Anthropic SDK has been loaded.
"""

import json

from anthropic._streaming import SSEDecoder, ServerSentEvent


class AnthropicSSEDecoder(SSEDecoder):
    def decode(self, line: str) -> ServerSentEvent | None:
        event = super().decode(line)
        if event is None or event.event is not None or not event.data:
            return event
        try:
            payload = event.json()
        except json.JSONDecodeError:
            return event
        event_type = payload.get("type") if isinstance(payload, dict) else None
        if not isinstance(event_type, str) or not event_type:
            return event
        return ServerSentEvent(event=event_type, data=event.data, id=event.id, retry=event.retry)
