"""Tests for per-provider ``extra_headers`` in providers / custom_providers config.

PR #3526 salvage — user-configurable extra HTTP headers on LLM API calls
(reverse proxies, gateways, custom auth such as Cloudflare Access tokens).
"""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import threading

import pytest

from hermes_cli.config import (
    _normalize_custom_provider_entry,
    apply_custom_provider_extra_headers_to_client_kwargs,
    get_custom_provider_extra_headers,
    normalize_extra_headers,
)
from hermes_cli import models as models_mod


def test_normalize_extra_headers_stringifies_and_drops_none():
    assert normalize_extra_headers({"X-Int": 7, "X-Str": "v", "X-None": None}) == {
        "X-Int": "7",
        "X-Str": "v",
    }


def test_normalize_extra_headers_rejects_non_dict_and_empty():
    for bad in (None, "x", 42, ["a"], {}):
        assert normalize_extra_headers(bad) == {}


def test_normalize_entry_keeps_extra_headers():
    normalized = _normalize_custom_provider_entry(
        {
            "name": "my-proxy",
            "base_url": "https://llm.internal.example.com/v1",
            "extra_headers": {"X-Custom-Auth": "tok", "X-Client-Name": "hermes"},
        }
    )
    assert normalized is not None
    assert normalized["extra_headers"] == {
        "X-Custom-Auth": "tok",
        "X-Client-Name": "hermes",
    }


def test_normalize_entry_drops_invalid_extra_headers():
    for bad in ("not-a-dict", {}, 42, ["a"]):
        normalized = _normalize_custom_provider_entry(
            {
                "name": "my-proxy",
                "base_url": "https://llm.internal.example.com/v1",
                "extra_headers": bad,
            }
        )
        assert normalized is not None
        assert "extra_headers" not in normalized




def test_get_custom_provider_extra_headers_matches_base_url():
    """Match by normalized base_url returns the entry's extra_headers."""
    providers = [
        {
            "name": "my-proxy",
            "base_url": "https://llm.internal.example.com/v1",
            "extra_headers": {"CF-Access-Client-Id": "xxxx.access"},
        }
    ]
    # trailing-slash and case insensitive match, mirroring the TLS helper
    headers = get_custom_provider_extra_headers(
        "https://LLM.internal.example.com/v1/",
        custom_providers=providers,
    )
    assert headers == {"CF-Access-Client-Id": "xxxx.access"}


def test_get_custom_provider_extra_headers_no_match_returns_empty():
    """No matching base_url yields empty dict."""
    providers = [
        {
            "name": "my-proxy",
            "base_url": "https://llm.internal.example.com/v1",
            "extra_headers": {"X-Secret": "s"},
        }
    ]
    assert get_custom_provider_extra_headers(
        "https://other.example.com/v1", custom_providers=providers,
    ) == {}
    # prefix look-alike host must not match (no substring bypass)
    assert get_custom_provider_extra_headers(
        "https://llm.internal.example.com.attacker.test/v1",
        custom_providers=providers,
    ) == {}


def test_get_custom_provider_extra_headers_preserves_extra_path_segment():
    """Extra path segment after normalisation is still a mismatch."""
    providers = [
        {
            "base_url": "https://llm.internal.example.com/v1//",
            "extra_headers": {"Authorization": "secret"},
        }
    ]
    assert get_custom_provider_extra_headers(
        "https://llm.internal.example.com/v1",
        custom_providers=providers,
    ) == {}


def test_get_custom_provider_extra_headers_skips_alias_without_headers():
    """Bug #74465: an earlier entry matching the same URL but without
    extra_headers must not shadow a later entry that DOES have headers."""
    providers = [
        {
            "name": "direct",
            "base_url": "http://127.0.0.1:8787/v1",
            # no extra_headers
        },
        {
            "name": "aether-router",
            "base_url": "http://127.0.0.1:8787/v1",
            "extra_headers": {"X-Aether-Route": "my-route"},
        },
    ]
    headers = get_custom_provider_extra_headers(
        "http://127.0.0.1:8787/v1",
        custom_providers=providers,
    )
    assert headers == {"X-Aether-Route": "my-route"}


def test_get_custom_provider_extra_headers_skips_empty_header_dict_alias():
    """An earlier entry with an explicit but empty extra_headers dict must
    not shadow a later entry that carries real headers."""
    providers = [
        {
            "name": "bare-alias",
            "base_url": "http://127.0.0.1:8787/v1",
            "extra_headers": {},
        },
        {
            "name": "proxied",
            "base_url": "http://127.0.0.1:8787/v1",
            "extra_headers": {"Authorization": "Bearer tok"},
        },
    ]
    headers = get_custom_provider_extra_headers(
        "http://127.0.0.1:8787/v1",
        custom_providers=providers,
    )
    assert headers == {"Authorization": "Bearer tok"}


def test_apply_extra_headers_merges_onto_existing_defaults():
    """apply_custom_provider_extra_headers_to_client_kwargs merges headers,
    with provider-specific values winning over existing defaults."""
    client_kwargs = {
        "api_key": "x",
        "base_url": "https://llm.internal.example.com/v1",
        "default_headers": {"User-Agent": "curl/8.7.1", "X-Keep": "1"},
    }
    providers = [
        {
            "name": "my-proxy",
            "base_url": "https://llm.internal.example.com/v1",
            "extra_headers": {"User-Agent": "override", "X-New": "2"},
        }
    ]
    apply_custom_provider_extra_headers_to_client_kwargs(
        client_kwargs,
        "https://llm.internal.example.com/v1",
        custom_providers=providers,
    )
    assert client_kwargs["default_headers"] == {
        "User-Agent": "override",  # provider-specific value wins
        "X-Keep": "1",             # untouched defaults preserved
        "X-New": "2",
    }


def test_apply_extra_headers_noop_without_match():
    """No matching base_url -> no default_headers key added."""
    client_kwargs = {"api_key": "x", "base_url": "https://other.example.com/v1"}
    providers = [
        {
            "name": "my-proxy",
            "base_url": "https://llm.internal.example.com/v1",
            "extra_headers": {"X-Secret": "s"},
        }
    ]
    apply_custom_provider_extra_headers_to_client_kwargs(
        client_kwargs,
        "https://other.example.com/v1",
        custom_providers=providers,
    )
    assert "default_headers" not in client_kwargs


def test_fetch_api_models_sends_extra_headers_to_models_probe(monkeypatch):
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self):
            return json.dumps({"data": [{"id": "proxy-model"}]}).encode()

    def fake_urlopen(request, timeout=0):
        captured["url"] = request.full_url
        captured["timeout"] = timeout
        captured["headers"] = {
            key.lower(): value
            for key, value in request.header_items()
        }
        return FakeResponse()

    monkeypatch.setattr(models_mod, "_urlopen_model_catalog_request", fake_urlopen)

    models = models_mod.fetch_api_models(
        "proxy-key",
        "https://llm.internal.example.com/v1",
        headers={
            "sleeve-harness": "hermes",
            "sleeve-base-url": "http://localhost:8081/v1",
        },
    )

    assert models == ["proxy-model"]
    assert captured["url"] == "https://llm.internal.example.com/v1/models"
    assert captured["headers"]["authorization"] == "Bearer proxy-key"
    assert captured["headers"]["sleeve-harness"] == "hermes"
    assert captured["headers"]["sleeve-base-url"] == "http://localhost:8081/v1"


@pytest.fixture
def x_api_key_relay():
    """A Chat Completions relay on 127.0.0.1 that records the headers of every completion request."""
    seen = []

    class Relay(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_POST(self):
            self.rfile.read(int(self.headers.get("Content-Length") or 0))
            if not self.path.endswith("/chat/completions"):  # e.g. the agent's own Ollama metadata probe
                self.send_error(404)
                return
            seen.append({key.lower(): value for key, value in self.headers.items()})
            body = json.dumps({"id": "c", "object": "chat.completion", "created": 0, "model": "m", "choices": [
                {"index": 0, "finish_reason": "stop", "message": {"role": "assistant", "content": "ok"}}]}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Relay)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/v1", seen
    finally:
        server.shutdown()
        server.server_close()


_HI = [{"role": "user", "content": "hi"}]


def _assert_x_api_key_only(seen, count):
    assert len(seen) == count
    for headers in seen:
        assert "authorization" not in headers
        assert headers["x-api-key"] == "sk-secret" and headers["x-tenant"] == "a"


def test_x_api_key_scheme_replaces_bearer_on_openai_wire_clients(x_api_key_relay):
    """``auth_scheme: x-api-key`` governs Chat Completions / Responses clients too, not only the
    Anthropic transport: the static key goes out as ``x-api-key`` and no bearer header is sent.
    The main client's kwargs get the policy as on every route swap, then the real constructor."""
    from agent.agent_runtime_helpers import create_openai_client
    from agent.endpoint_auth import apply_auth_scheme_to_client_kwargs, auth_scheme_default_headers
    from run_agent import AIAgent

    url, seen = x_api_key_relay
    entries = [{"name": "gw", "provider_key": "gw", "base_url": url, "auth_scheme": "x-api-key"}]
    kwargs = {"api_key": "sk-secret", "base_url": url, "default_headers": {"X-Tenant": "a"}}
    apply_auth_scheme_to_client_kwargs(kwargs, url, entries)
    agent = AIAgent(api_key="sk-secret", base_url=url, provider="custom", model="m", quiet_mode=True,
                    skip_context_files=True, skip_memory=True)
    client = create_openai_client(agent, kwargs, reason="test", shared=False)
    client.chat.completions.create(model="m", messages=_HI)
    client.with_options(timeout=30).chat.completions.create(model="m", messages=_HI)
    _assert_x_api_key_only(seen, 2)

    # Unpinned routes and command-minted (callable) keys keep the SDK bearer path untouched.
    assert auth_scheme_default_headers("https://other.example.test/v1", "sk-secret", entries) == {}
    assert auth_scheme_default_headers(url, lambda: "minted", entries) == {}


def test_x_api_key_scheme_reaches_auxiliary_clients_and_their_async_twins(x_api_key_relay):
    """A named custom endpoint's auxiliary client resolves the scheme from config.yaml, and the async
    rebuild async auxiliary calls use carries it over."""
    import asyncio

    import hermes_yaml as yaml

    import agent.auxiliary_client as aux
    from hermes_constants import get_hermes_home

    url, seen = x_api_key_relay
    (get_hermes_home() / "config.yaml").write_text(yaml.safe_dump(
        {"providers": {"gw": {"base_url": url, "auth_scheme": "x-api-key"}}}), encoding="utf-8")
    client = aux._named_custom_openai_wire_client(url, "sk-secret", {"X-Tenant": "a"})
    client.chat.completions.create(model="m", messages=_HI)
    twin, _ = aux._to_async_client(client, "m")

    async def _ask():
        await twin.chat.completions.create(model="m", messages=_HI)
        await twin.close()

    asyncio.run(_ask())
    _assert_x_api_key_only(seen, 2)
