"""Custom Messages endpoints may put the event type only inside SSE data."""

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest
import yaml


def _frames(events, wire):
    frames = []
    for index, event in enumerate(events):
        name = f"event: {event['type']}\r\n" if wire == "named" or (wire == "mixed" and index % 2) else ""
        frames.append(name + "data: " + json.dumps(event, ensure_ascii=False) + "\r\n\r\n")
    return (": keepalive\r\n\r\n" + "".join(frames)).encode()


@pytest.fixture
def endpoint(tmp_path, monkeypatch):
    requests = []
    response = {"body": b"", "content_type": "text/event-stream"}

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/relay/v1/messages":
                self.send_error(404)
                return
            requests.append((self.path, dict(self.headers), json.loads(self.rfile.read(int(self.headers['Content-Length'])))))
            self.send_response(200)
            self.send_header("Content-Type", response["content_type"])
            self.send_header("Content-Length", str(len(response["body"])))
            self.end_headers()
            # Split UTF-8 and SSE fields across writes: framing stays the SDK's job.
            for offset in range(0, len(response["body"]), 7):
                self.wfile.write(response["body"][offset:offset + 7])
            self.wfile.flush()

        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}/relay/v1"
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    monkeypatch.setenv("NO_PROXY", "127.0.0.1")
    monkeypatch.setenv("HERMES_STREAM_RETRIES", "0")
    (tmp_path / "config.yaml").write_text(yaml.safe_dump({
        "providers": {"relay": {
            "base_url": base_url, "transport": "anthropic_messages",
            "extra_headers": {"User-Agent": "test-endpoint-agent"},
        }},
    }), encoding="utf-8")
    try:
        yield base_url, response, requests
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _events():
    return [
        {"type": "message_start", "message": {
            "id": "msg_test", "type": "message", "role": "assistant", "model": "relay-model",
            "content": [], "stop_reason": None, "stop_sequence": None,
            "usage": {"input_tokens": 2, "output_tokens": 0},
        }},
        {"type": "content_block_start", "index": 0, "content_block": {"type": "thinking", "thinking": ""}},
        {"type": "ping"},
        {"type": "content_block_delta", "index": 0, "delta": {"type": "thinking_delta", "thinking": "Check the city."}},
        {"type": "content_block_stop", "index": 0},
        {"type": "content_block_start", "index": 1, "content_block": {"type": "text", "text": ""}},
        {"type": "content_block_delta", "index": 1, "delta": {"type": "text_delta", "text": "你好"}},
        {"type": "content_block_stop", "index": 1},
        {"type": "content_block_start", "index": 2, "content_block": {
            "type": "tool_use", "id": "tool_test", "name": "weather", "input": {},
        }},
        {"type": "content_block_delta", "index": 2, "delta": {"type": "input_json_delta", "partial_json": '{"city":'}},
        {"type": "content_block_delta", "index": 2, "delta": {"type": "input_json_delta", "partial_json": '"上海"}'}},
        {"type": "content_block_stop", "index": 2},
        {"type": "message_delta", "delta": {"stop_reason": "tool_use", "stop_sequence": None}, "usage": {"output_tokens": 4}},
        {"type": "message_stop"},
    ]


@pytest.mark.parametrize("wire", ["named", "data_only", "mixed"])
def test_custom_stream_preserves_messages_in_main_and_auxiliary_calls(endpoint, wire):
    pytest.importorskip("anthropic")
    from agent.anthropic_adapter import build_anthropic_client, create_anthropic_message
    from run_agent import AIAgent

    base_url, response, requests = endpoint
    response["body"] = _frames(_events(), wire)
    kwargs = {"model": "relay-model", "max_tokens": 128, "messages": [{"role": "user", "content": "Hello"}]}
    deltas = []
    agent = AIAgent(
        api_key="test-key", base_url=base_url, provider="custom:relay", api_mode="anthropic_messages",
        model="relay-model", enabled_toolsets=[], quiet_mode=True, skip_context_files=True,
        skip_memory=True, stream_delta_callback=deltas.append,
    )
    try:
        result = agent._interruptible_streaming_api_call(kwargs)
    finally:
        agent.close()
    with build_anthropic_client("test-key", base_url=base_url) as client:
        auxiliary = create_anthropic_message(client, kwargs)

    assert result.model_dump() == auxiliary.model_dump()
    assert result.stop_reason == "tool_use"
    assert result.content[0].thinking == "Check the city."
    assert result.content[1].text == "你好" == "".join(deltas)
    assert result.content[2].input == {"city": "上海"}
    assert result.usage.output_tokens == _events()[-2]["usage"]["output_tokens"]
    assert len(requests) == 2
    assert all(path == "/relay/v1/messages" and headers["User-Agent"] == "test-endpoint-agent"
               and body["stream"] is True for path, headers, body in requests)


@pytest.mark.parametrize("wire", ["named", "data_only"])
def test_custom_stream_propagates_provider_errors(endpoint, wire):
    anthropic = pytest.importorskip("anthropic")
    from agent.anthropic_adapter import build_anthropic_client, create_anthropic_message

    base_url, response, _requests = endpoint
    error = {"type": "error", "error": {"type": "overloaded_error", "message": "Try again later"}}
    response["body"] = _frames([error], wire)
    with build_anthropic_client("test-key", base_url=base_url) as client:
        with pytest.raises(anthropic.APIStatusError) as caught:
            create_anthropic_message(client, {
                "model": "relay-model", "max_tokens": 128, "messages": [{"role": "user", "content": "Hello"}],
            })
    assert caught.value.body == error
