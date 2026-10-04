"""Resolved limits and capabilities for a custom endpoint's discovered models (Desktop limits table).

The runtime resolves a custom route's budgets lazily and silently, so the settings table showed
blank "Auto" cells: the user could not tell what Hermes will use, nor whether a non-standard relay
needs a correction. This sibling computes, per model, the value each cell would resolve to and
where it came from, in the runtime's own order — the endpoint's ``/models`` self-description, then
the entry's ``catalog_provider`` catalog — and, as a SUGGESTION the runtime never applies on its own,
a cross-provider models.dev match on the id. Cache-only: the live ``/models`` payload is the only
network the caller already paid for.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Dict, Iterable, List, Optional

_log = logging.getLogger("hermes_cli.web_server")

SOURCE_ENDPOINT = "endpoint"
SOURCE_CATALOG_PROVIDER = "catalog_provider"
SOURCE_CATALOG_MATCH = "catalog"

_LIMIT_KEYS = ("context_length", "max_input_tokens", "max_output_tokens")
_CAPABILITY_KEYS = ("supports_vision", "supports_reasoning")
_FIELD_KEYS = _LIMIT_KEYS + _CAPABILITY_KEYS + ("supported_efforts",)


def raw_model_rows(resp: Any) -> Dict[str, Dict[str, Any]]:
    """``{id: row}`` for the dict rows of an OpenAI-compatible ``/v1/models`` response; ``{}`` on any
    parse error (the id list from ``_parse_model_entries`` is the contract, this is the enrichment)."""
    try:
        payload = resp.json() if resp.is_success else None
    except Exception:
        return {}
    data = payload.get("data") if isinstance(payload, dict) else payload
    rows: Dict[str, Dict[str, Any]] = {}
    for item in data if isinstance(data, list) else []:
        model_id = str(item.get("id") or "").strip() if isinstance(item, dict) else ""
        if model_id:
            rows.setdefault(model_id, item)
    return rows


def _row_bool(row: Dict[str, Any], keys: tuple) -> Optional[bool]:
    capabilities = row.get("capabilities")
    for scope in (row, capabilities if isinstance(capabilities, dict) else {}):
        for key in keys:
            value = scope.get(key)
            if isinstance(value, bool):
                return value
    return None


def _row_vision(row: Dict[str, Any]) -> Optional[bool]:
    """OpenRouter-schema ``architecture`` first (``input_modalities`` / ``"text+image->text"``), else a
    boolean the server states outright."""
    architecture = row.get("architecture")
    if isinstance(architecture, dict):
        modalities = architecture.get("input_modalities")
        if isinstance(modalities, list):
            return any(str(m).strip().lower() == "image" for m in modalities)
        modality = architecture.get("modality")
        if isinstance(modality, str) and "->" in modality:
            return "image" in modality.split("->", 1)[0].lower()
    return _row_bool(row, ("supports_vision", "vision"))


def endpoint_row_metadata(row: Dict[str, Any]) -> Dict[str, Any]:
    """What a ``/models`` row (live, or the runtime's cached extract of one) states about the model.
    Limits go through the runtime's own readers so the table shows the value the agent will use."""
    from agent.model_metadata import _MAX_COMPLETION_KEYS, _context_length_from_model_payload, _extract_first_int
    from hermes_cli.models_reasoning_caps import parse_openrouter_reasoning_capabilities

    out: Dict[str, Any] = {}
    context = _context_length_from_model_payload(row)
    if context is not None:
        out["context_length"] = context
    output = _extract_first_int(row, _MAX_COMPLETION_KEYS)
    if output is not None:
        out["max_output_tokens"] = output
    vision = _row_vision(row)
    if vision is not None:
        out["supports_vision"] = vision
    reasoning_caps = parse_openrouter_reasoning_capabilities(row)
    if reasoning_caps is not None:
        out["supports_reasoning"] = bool(reasoning_caps.get("supports_reasoning"))
        efforts = reasoning_caps.get("supported_efforts")
        if efforts:
            out["supported_efforts"] = list(efforts)
    else:
        reasoning = _row_bool(row, ("supports_reasoning", "reasoning"))
        if reasoning is not None:
            out["supports_reasoning"] = reasoning
    return out


def _catalog_metadata(
    model_id: str, canonical: Optional[str], catalog_provider: Optional[str],
) -> tuple[Dict[str, Any], str, str]:
    """``(metadata, source, ref)`` from models.dev: a hit under the configured ``catalog_provider`` is
    what the runtime itself resolves; any other hit is a cross-provider suggestion. A reasoning alias
    (``gpt-5.6-sol-high`` → ``gpt-5.6-sol``) is looked up by its canonical id first."""
    from agent.models_dev_search import _mdev_provider_id, find_catalog_model, match_metadata

    hint = (catalog_provider or "").strip() or None
    hinted_provider = _mdev_provider_id(hint) if hint else None
    for candidate in dict.fromkeys(c for c in ((canonical or "").strip(), model_id) if c):
        match = find_catalog_model(candidate, provider_hint=hint)
        if match is None:
            continue
        source = SOURCE_CATALOG_PROVIDER if hinted_provider and match.provider_id == hinted_provider else SOURCE_CATALOG_MATCH
        return match_metadata(match), source, match.ref
    return {}, "", ""


def resolve_custom_endpoint_model_details(
    entries: Iterable[Dict[str, Any]], *, endpoint_rows: Optional[Dict[str, Dict[str, Any]]] = None,
    catalog_provider: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Enrich ``_parse_model_entries`` rows with the resolved limits/capabilities and a ``sources`` map
    (field → ``endpoint`` / ``catalog_provider`` / ``catalog``). A field is set from the first layer that
    states it, in the runtime's precedence; ``catalog_ref`` names the catalog entry a suggestion came from."""
    details: List[Dict[str, Any]] = []
    rows = endpoint_rows or {}
    for entry in entries:
        model_id = str(entry.get("id") or "").strip()
        if not model_id:
            continue
        detail: Dict[str, Any] = dict(entry)
        layers: List[tuple[Dict[str, Any], str]] = []
        row = rows.get(model_id)
        if isinstance(row, dict):
            layers.append((endpoint_row_metadata(row), SOURCE_ENDPOINT))
        try:
            catalog_meta, catalog_source, ref = _catalog_metadata(model_id, entry.get("canonical_model"), catalog_provider)
        except Exception as exc:  # the catalog is an enrichment; a broken cache must not fail discovery
            _log.debug("catalog lookup for %r failed: %s", model_id, exc)
            catalog_meta, catalog_source, ref = {}, "", ""
        if catalog_meta:
            layers.append((catalog_meta, catalog_source))
            detail["catalog_ref"] = ref
        sources: Dict[str, str] = {}
        for meta, source in layers:
            for key in _FIELD_KEYS:
                if key in meta and key not in sources:
                    detail[key] = meta[key]
                    sources[key] = source
        if sources:
            detail["sources"] = sources
        details.append(detail)
    return details


def saved_endpoint_model_details(base_url: str, models: Iterable[str], entry: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Details for a SAVED endpoint's model list without any probe: the runtime's on-disk memo of its
    last ``/models`` read (when still fresh) plus the catalogs. Never raises — the endpoint row must list
    even when the enrichment cannot."""
    rows = None
    try:
        from agent.model_metadata import _endpoint_disk_cache_get, _normalize_base_url

        normalized = _normalize_base_url(base_url) if base_url else ""
        rows = _endpoint_disk_cache_get(normalized) if normalized else None
    except Exception as exc:
        _log.debug("endpoint metadata memo unavailable for %s: %s", base_url, exc)
    try:
        return resolve_custom_endpoint_model_details(
            [{"id": model} for model in models], endpoint_rows=rows,
            catalog_provider=str(entry.get("catalog_provider") or ""),
        )
    except Exception as exc:
        _log.debug("model detail resolution failed for %s: %s", base_url, exc)
        return []


def warm_models_dev_async() -> None:
    """Kick a background models.dev refresh when no cache exists yet, so the first Test after a fresh
    install does not stay catalog-blind; a no-op under pytest and whenever a cache is already held."""
    if os.environ.get("PYTEST_CURRENT_TEST"):
        return
    try:
        from agent import models_dev

        if not models_dev.fetch_models_dev(allow_network=False):
            models_dev._start_background_refresh_models_dev()
    except Exception as exc:
        _log.debug("models.dev warm-up skipped: %s", exc)
