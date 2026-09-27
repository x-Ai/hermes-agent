import { describe, expect, it } from "vitest";

import {
  localizeConfigDescription,
  localizeConfigLabel,
  localizeConfigOption,
  localizeConfigSection
} from "./config-metadata";

const CJK = /[㐀-鿿]/;

describe("dashboard config metadata localization", () => {
  it("derives Chinese labels for generated fields instead of echoing the schema key", () => {
    for (const key of [
      "agent.gateway_turn_lease_timeout",
      "monitoring.gateway_health_export.export_interval_seconds",
      "secrets.onepassword.cache_ttl_seconds"
    ]) {
      const label = localizeConfigLabel(key, "zh");
      expect(label, key).not.toBe(key);
      expect(label, key).not.toBe(key.split(".").pop());
      expect(label, key).not.toContain("_");
      expect(CJK.test(label), key).toBe(true);
      expect(label, key).not.toBe(localizeConfigLabel(key, "en"));
    }
  });

  it("falls back to a localized breadcrumb when a field has no curated description", () => {
    const description = localizeConfigDescription("agent.gateway_turn_lease_timeout", "generated", "zh");
    expect(description).toContain(localizeConfigSection("agent", "zh"));
    expect(description).toContain(localizeConfigLabel("agent.gateway_turn_lease_timeout", "zh"));
  });

  it("localizes every non-brand category and common enum state", () => {
    for (const section of ["tool_loop_guardrails", "wake_word"]) {
      const label = localizeConfigSection(section, "zh");
      expect(label, section).not.toBe(section);
      expect(CJK.test(label), section).toBe(true);
    }
    // Brand sections keep the brand and add the translated noun; the same copy is used
    // whether the page asks for the section or for a field named after it.
    const brandSection = localizeConfigSection("x_search", "zh");
    expect(brandSection).toContain("X");
    expect(CJK.test(brandSection)).toBe(true);

    for (const option of ["warning", "small"]) {
      const label = localizeConfigOption(option, "zh");
      expect(label, option).not.toBe(option);
      expect(CJK.test(label), option).toBe(true);
    }
    expect(localizeConfigOption("some-vendor-only-value", "zh")).toBe("some-vendor-only-value");
  });

  it("uses curated wording for primary settings in both languages", () => {
    for (const key of ["agent.output_truncation_retries", "agent.empty_response_retries"]) {
      const english = localizeConfigLabel(key, "en");
      expect(english, key).not.toContain("_");
      expect(english, key).not.toBe(key.split(".").pop());
      expect(localizeConfigLabel(key, "zh"), key).not.toBe(english);
    }
    for (const key of [
      "agent.thinking_prefill_retries",
      "delegation.use_custom_endpoints",
      "terminal.docker_mount_cwd_to_workspace"
    ]) {
      const chinese = localizeConfigLabel(key, "zh");
      expect(CJK.test(chinese), key).toBe(true);
      expect(chinese, key).not.toBe(localizeConfigLabel(key, "en"));
    }

    const english = "Display reasoning content";
    expect(localizeConfigDescription("display.show_reasoning", english, "en")).toBe(english);
    const chinese = localizeConfigDescription("display.show_reasoning", english, "zh");
    expect(chinese).not.toBe(english);
    expect(CJK.test(chinese)).toBe(true);
  });
});
