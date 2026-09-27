import { describe, expect, it } from "vitest";

import { dashboardZh } from "./dashboard";
import { localizeMcpSetup, localizeMcpTestError } from "./mcp-metadata";

describe("MCP catalog setup localization", () => {
  it("localizes the shared OAuth setup template while preserving the command", () => {
    const setup =
      "On first connection Hermes opens a browser to authorize with Notion (or run `hermes mcp login notion`). Approve access, then restart the session so tools load.";
    const localized = localizeMcpSetup("notion", setup, "zh");
    expect(localized).not.toBe(setup);
    expect(localized).toContain("Notion");
    expect(localized).toContain("`hermes mcp login notion`");
  });

  it("localizes credential-free and service-specific setup notes", () => {
    expect(
      localizeMcpSetup(
        "deepwiki",
        "No account or credentials needed — tools are available as soon as the session restarts.",
        "zh"
      )
    ).toBe("无需账号或凭据；重启会话后工具即可使用。");
    // Curated notes are keyed by the catalog manifest id and keep the remediation commands intact.
    expect(localizeMcpSetup("n8n-official", "English source text", "zh")).toContain("hermes mcp login n8n-official");
    expect(localizeMcpSetup("asana", "English source text", "zh")).toContain("http://localhost:27890/callback");
  });

  it("keeps English copy unchanged outside the Chinese locale", () => {
    expect(localizeMcpSetup("asana", "Setup text", "en")).toBe("Setup text");
    expect(localizeMcpSetup("some-new-server", "Setup text", "zh")).toBe("Setup text");
  });
});

describe("MCP connection Toast localization", () => {
  it("localizes the stable OAuth-required result and older backend prose", () => {
    const copy = dashboardZh.mcp;
    expect(localizeMcpTestError({
      ok: false, code: "oauth_required",
      error: "OAuth authentication required — no token found.", tools: []
    }, copy, "zh")).toBe(copy.oauthRequired)
    expect(localizeMcpTestError({
      ok: false, error: "OAuth authentication required — no token found.", tools: []
    }, copy, "zh")).toBe(copy.oauthRequired)
  });
});
