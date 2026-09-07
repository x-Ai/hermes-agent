import { describe, expect, it } from "vitest";

import { dashboardZh } from "./dashboard";
import { localizeMcpSetup, localizeMcpTestError } from "./mcp-metadata";

describe("MCP catalog setup localization", () => {
  it("localizes the shared OAuth setup template while preserving the command", () => {
    const setup =
      "On first connection Hermes opens a browser to authorize with Asana (or run `hermes mcp login asana`). Approve access, then restart the session so tools load.";
    expect(localizeMcpSetup("asana", setup, "zh")).toBe(
      "首次连接时，Hermes 会打开浏览器授权 Asana（也可运行 `hermes mcp login asana`）。批准访问后重启会话以加载工具。"
    );
  });

  it("localizes credential-free and service-specific setup notes", () => {
    expect(
      localizeMcpSetup(
        "deepwiki",
        "No account or credentials needed — tools are available as soon as the session restarts.",
        "zh"
      )
    ).toBe("无需账号或凭据；重启会话后工具即可使用。");
    expect(localizeMcpSetup("n8n", "English source text", "zh")).toContain("真实修改在线 n8n 实例");
  });

  it("keeps English copy unchanged outside the Chinese locale", () => {
    expect(localizeMcpSetup("asana", "Setup text", "en")).toBe("Setup text");
  });
});

describe("MCP connection Toast localization", () => {
  it("localizes the stable OAuth-required result and older backend prose", () => {
    const copy = dashboardZh.mcp;
    expect(localizeMcpTestError({
      ok: false, code: "oauth_required",
      error: "OAuth authentication required — no token found.", tools: []
    }, copy, "zh")).toBe("需要 OAuth 验证，请先完成授权")
    expect(localizeMcpTestError({
      ok: false, error: "OAuth authentication required — no token found.", tools: []
    }, copy, "zh")).toBe("需要 OAuth 验证，请先完成授权")
  });
});
