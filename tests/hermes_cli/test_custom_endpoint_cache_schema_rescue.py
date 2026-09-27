"""``cached_fetch_api_models`` offline rescue vs. the catalog metadata schema version.

A cache row written before the capability-metadata schema bump is never served as fresh or
stale (its metadata shape is untrusted), but when the live probe returns nothing (offline) its
model ids are still the best answer: the rescue serves them with the metadata dropped instead
of forgetting every pre-upgrade custom catalog.
"""

from __future__ import annotations

import time
from unittest.mock import patch


def test_offline_rescue_serves_a_pre_upgrade_row_without_its_metadata():
    import hermes_cli.models as mod

    entry = mod._cache_entry("fp", ["m1", "m2"], at=time.time() - 2 * mod._PROVIDER_MODELS_CACHE_TTL)
    entry["metadata_schema_version"] = mod._PROVIDER_MODELS_METADATA_SCHEMA_VERSION - 1
    entry["model_metadata"] = {"m1": {"supports_vision": True}}
    cache = {"custom:https://gw.example.com/v1#fp": entry}
    with patch.object(mod, "_load_provider_models_cache", return_value=cache), \
         patch.object(mod, "_custom_endpoint_fingerprint", return_value="fp"), \
         patch.object(mod, "_save_provider_models_cache"), \
         patch.object(mod, "fetch_api_models", return_value=[]) as live:
        out = mod.cached_fetch_api_models("sk-key", "https://gw.example.com/v1")

    live.assert_called_once()  # an old-schema row is never trusted as a fresh/stale hit
    assert list(out) == ["m1", "m2"]
    assert not getattr(out, "model_metadata", None)
