"""The availability-probe stub (``agent/auxiliary_client_probe.py``) stands in for a real client
during ``aux_probe_mode()``, so it must take the provider tags the auxiliary client writes on the
clients it builds (``_tag_backend``) and refreshes (``_hermes_aux_effective_provider``), and read
as untagged before that, instead of failing the probe."""

import pytest

import agent.auxiliary_client as aux


@pytest.fixture(autouse=True)
def _no_cached_clients():
    aux.shutdown_cached_clients()
    yield
    aux.shutdown_cached_clients()


def test_probe_of_a_discovered_api_key_provider_answers_a_tagged_stub(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-probe")
    with aux.aux_probe_mode():
        client, model = aux._resolve_api_key_provider()
    assert isinstance(client, aux._AuxProbeClientStub)
    assert model
    # A failure on this client classifies on the provider it was built for.
    assert aux._classification_provider(client, "auto") == "deepseek"


def test_probe_stub_reads_untagged_and_takes_a_refresh_tag():
    stub = aux._AuxProbeClientStub(api_key="k", base_url="https://x.invalid/v1")
    assert aux._effective_provider_for_client(stub, "custom") == "custom"
    stub._hermes_aux_effective_provider = "nous"  # what a Nous refresh writes on the client it rebuilt
    assert aux._effective_provider_for_client(stub, "auto") == "nous"
    assert aux._tag_backend(stub, "openrouter") is stub
    assert aux._classification_provider(stub, "auto") == "openrouter"
