"""A live /models re-probe owns the advertised fields of a discovered row and nothing else."""

from hermes_cli.model_switch_providers import _discovered_catalog_stale, _discovered_rows


def test_reprobe_refreshes_advertised_fields_and_keeps_user_added_ones():
    existing = {
        "glm-5.2": {"max_output_tokens": 64_000, "supports_vision": True, "canonical_model": "glm-5.2-pro"},
        "gone-model": {},
    }
    rows = _discovered_rows(["glm-5.2", "new-model"], {"glm-5.2": {"max_output_tokens": 128_000}}, existing)
    assert rows == {
        "glm-5.2": {"max_output_tokens": 128_000, "supports_vision": True, "canonical_model": "glm-5.2-pro"},
        "new-model": {},
    }


def test_user_added_row_fields_do_not_make_a_discovered_catalog_stale():
    entry = {
        "models_discovered": True,
        "models": {"glm-5.2": {"max_output_tokens": 128_000, "supports_vision": True}},
    }
    same = {"glm-5.2": {"max_output_tokens": 128_000}}
    assert _discovered_catalog_stale(entry, ["glm-5.2"], same) is False
    assert _discovered_catalog_stale(entry, ["glm-5.2"], {"glm-5.2": {"max_output_tokens": 131_072}}) is True
    assert _discovered_catalog_stale(entry, ["glm-5.2", "other"], same) is True
    assert _discovered_catalog_stale({"models": {"glm-5.2": {}}}, ["glm-5.2", "other"], same) is False
