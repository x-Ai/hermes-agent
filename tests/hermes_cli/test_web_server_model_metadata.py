"""Resolved limits/capabilities for a custom endpoint's discovered models (``hermes_cli.web_server_model_metadata``).

The Desktop limits table shows, per model, the value each blank cell resolves to and where it came
from, in the runtime's own precedence: the endpoint's ``/models`` self-description, then the entry's
``catalog_provider`` catalog, then a cross-provider models.dev suggestion. The alias metadata
``_parse_model_entries`` keeps (#93622) must survive the enrichment verbatim.
"""

from __future__ import annotations

import pytest
from starlette.testclient import TestClient

from agent import model_metadata, models_dev, models_dev_search
from hermes_cli.web_server_model_metadata import (
    SOURCE_CATALOG_MATCH, SOURCE_CATALOG_PROVIDER, SOURCE_ENDPOINT, raw_model_rows,
    resolve_custom_endpoint_model_details, saved_endpoint_model_details,
)

REGISTRY = {
    "zai": {"models": {"glm-5.3": {
        "reasoning": True, "limit": {"context": 200_000, "output": 128_000}, "modalities": {"input": ["text"]},
        "reasoning_options": [{"type": "effort", "values": ["low", "high", "max"]}],
    }}},
    "deepseek": {"models": {"deepseek-v4-pro": {"reasoning": True, "limit": {"context": 1_000_000, "output": 384_000}}}},
    "openai": {"models": {"gpt-5.6": {
        "reasoning": True, "limit": {"context": 400_000, "input": 272_000, "output": 128_000},
        "modalities": {"input": ["text", "image"]},
    }}},
}


@pytest.fixture(autouse=True)
def registry(monkeypatch):
    monkeypatch.setattr(models_dev, "fetch_models_dev", lambda *a, **k: REGISTRY)
    monkeypatch.setattr(models_dev_search, "_index_cache", None)


def _by_id(details):
    return {d["id"]: d for d in details}


def test_endpoint_self_description_outranks_the_catalog_field_by_field():
    rows = {"glm-5.3": {"id": "glm-5.3", "context_length": 131_072, "max_output_tokens": 8_192}}
    detail = _by_id(resolve_custom_endpoint_model_details([{"id": "glm-5.3"}], endpoint_rows=rows))["glm-5.3"]
    assert (detail["context_length"], detail["max_output_tokens"]) == (131_072, 8_192)
    assert detail["sources"]["context_length"] == SOURCE_ENDPOINT
    assert detail["sources"]["max_output_tokens"] == SOURCE_ENDPOINT
    # Fields the endpoint does not state still come from the catalog, marked as such.
    assert detail["supports_reasoning"] is True
    assert detail["supported_efforts"] == ["low", "high", "max"]
    assert detail["sources"]["supports_reasoning"] == SOURCE_CATALOG_MATCH
    assert detail["catalog_ref"] == "zai/glm-5.3"


def test_catalog_provider_hit_is_the_runtime_source_and_a_miss_is_a_suggestion():
    details = _by_id(resolve_custom_endpoint_model_details(
        [{"id": "glm-5.3"}, {"id": "gpt-5.6"}], catalog_provider="zai"))
    assert set(details["glm-5.3"]["sources"].values()) == {SOURCE_CATALOG_PROVIDER}
    assert details["gpt-5.6"]["sources"]["context_length"] == SOURCE_CATALOG_MATCH
    assert (details["gpt-5.6"]["max_input_tokens"], details["gpt-5.6"]["catalog_ref"]) == (272_000, "openai/gpt-5.6")


def test_openrouter_schema_rows_state_vision_reasoning_and_the_effort_list():
    rows = {
        "vendor/reasoner": {
            "id": "vendor/reasoner", "context_length": 200_000, "top_provider": {"max_completion_tokens": 16_000},
            "architecture": {"input_modalities": ["text", "image"]}, "supported_parameters": ["reasoning", "tools"],
            "reasoning": {"supported_efforts": ["low", "high"], "mandatory": False},
        },
        "vendor/plain": {"id": "vendor/plain", "supported_parameters": ["tools"], "architecture": {"modality": "text->text"}},
    }
    details = _by_id(resolve_custom_endpoint_model_details([{"id": m} for m in rows], endpoint_rows=rows))
    reasoner = details["vendor/reasoner"]
    assert (reasoner["context_length"], reasoner["max_output_tokens"]) == (200_000, 16_000)
    assert (reasoner["supports_vision"], reasoner["supports_reasoning"]) == (True, True)
    assert reasoner["supported_efforts"] == ["low", "high"]
    assert set(reasoner["sources"].values()) == {SOURCE_ENDPOINT}
    plain = details["vendor/plain"]
    assert (plain["supports_vision"], plain["supports_reasoning"]) == (False, False)


def test_a_reasoning_alias_resolves_through_its_canonical_model_and_keeps_its_alias_keys():
    entry = {"id": "gpt-5.6-high", "canonical_model": "gpt-5.6", "reasoning_effort": "high"}
    detail = resolve_custom_endpoint_model_details([entry])[0]
    assert {k: detail[k] for k in entry} == entry
    assert (detail["catalog_ref"], detail["context_length"]) == ("openai/gpt-5.6", 400_000)


def test_an_unknown_model_keeps_only_its_id():
    assert resolve_custom_endpoint_model_details([{"id": "mystery-7b"}, {"id": ""}]) == [{"id": "mystery-7b"}]


def test_raw_rows_tolerate_bare_id_lists_and_failures():
    class Ok:
        is_success = True

        def json(self):
            return {"data": [{"id": "a", "context_length": 1}, "b", {"id": ""}]}

    class Broken:
        is_success = True

        def json(self):
            raise ValueError("not json")

    assert raw_model_rows(Ok()) == {"a": {"id": "a", "context_length": 1}}
    assert raw_model_rows(Broken()) == {}


def test_saved_endpoint_details_read_the_runtime_memo_and_never_probe(monkeypatch):
    memo = {"glm-5.3": {"name": "glm-5.3", "context_length": 65_536}}
    seen = {}

    def fake_memo(normalized):
        seen["key"] = normalized
        return memo

    monkeypatch.setattr(model_metadata, "_endpoint_disk_cache_get", fake_memo)
    monkeypatch.setattr(model_metadata, "fetch_endpoint_model_metadata", lambda *a, **k: pytest.fail("must not probe"))
    detail = saved_endpoint_model_details("https://relay.example/v1", ["glm-5.3"], {"catalog_provider": ""})[0]
    assert seen["key"] == model_metadata._normalize_base_url("https://relay.example/v1")
    assert (detail["context_length"], detail["sources"]["context_length"]) == (65_536, SOURCE_ENDPOINT)
    assert (detail["max_output_tokens"], detail["sources"]["max_output_tokens"]) == (128_000, SOURCE_CATALOG_MATCH)


def test_saved_endpoint_details_never_raise(monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("cache on fire")

    monkeypatch.setattr(model_metadata, "_endpoint_disk_cache_get", boom)
    assert saved_endpoint_model_details("https://relay.example/v1", ["glm-5.3"], {})[0]["catalog_ref"] == "zai/glm-5.3"


@pytest.fixture
def client():
    from hermes_cli.web_server import _SESSION_HEADER_NAME, _SESSION_TOKEN, app
    from hermes_constants import get_hermes_home, reset_hermes_home_override, set_hermes_home_override

    token = set_hermes_home_override(str(get_hermes_home()))
    client = TestClient(app, headers={_SESSION_HEADER_NAME: _SESSION_TOKEN})
    try:
        yield client
    finally:
        client.close()
        reset_hermes_home_override(token)


def test_listed_endpoints_carry_resolved_details_for_their_saved_models(client):
    """The table shows placeholders when a saved endpoint is opened, before any Test — from the catalog
    (and the runtime's memo), with no probe of the endpoint itself."""
    saved = client.post("/api/providers/custom-endpoints", json={
        "id": "relay", "name": "Relay", "base_url": "https://relay.example/v1", "model": "glm-5.3",
        "models": ["glm-5.3", "mystery-7b"], "make_default": False, "catalog_provider": "zai",
    })
    assert saved.status_code == 200, saved.text
    rows = {row["id"]: row for row in client.get("/api/providers/custom-endpoints").json()["endpoints"]}
    details = _by_id(rows["relay"]["model_details"])
    assert details["glm-5.3"]["context_length"] == 200_000
    assert details["glm-5.3"]["sources"]["context_length"] == SOURCE_CATALOG_PROVIDER
    assert details["mystery-7b"] == {"id": "mystery-7b"}
