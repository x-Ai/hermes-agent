"""xAI (Grok) provider profile."""

from hermes_cli.version_info import get_version_info
from providers import register_provider
from providers.base import ProviderProfile


class XaiProfile(ProviderProfile):
    """xAI Responses: Grok 4.6+ accepts ``xhigh``; older effort-capable Grok tops out at ``high``."""

    def supported_reasoning_efforts(self, model: str | None) -> tuple[str, ...] | None:
        from agent.model_metadata import grok_supports_reasoning_effort, is_grok_46_family
        from agent.reasoning_effort import XAI_GROK46_EFFORTS, XAI_LEGACY_EFFORTS

        if not grok_supports_reasoning_effort(model or ""):
            return None
        return XAI_GROK46_EFFORTS if is_grok_46_family(model or "") else XAI_LEGACY_EFFORTS


xai = XaiProfile(
    name="xai", aliases=("grok", "x-ai", "x.ai"), api_mode="codex_responses", env_vars=("XAI_API_KEY",),
    base_url="https://api.x.ai/v1", auth_type="api_key",
    default_headers={"User-Agent": f"Hermes-Agent/{get_version_info().base_version}"},
)

register_provider(xai)
