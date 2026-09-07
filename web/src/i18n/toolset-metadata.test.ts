import { describe, expect, it } from "vitest";

import {
  localizeToolsetBadge,
  localizeToolsetDescription,
  localizeToolsetEnvPrompt,
  localizeToolsetLabel,
  localizeToolsetProviderTag
} from "./toolset-metadata";

describe("toolset metadata localization", () => {
  it("matches the Desktop Chinese toolset identity copy", () => {
    expect(localizeToolsetLabel("web", "🔍 Web Search & Scraping", "zh")).toBe("网页搜索与抓取");
    expect(localizeToolsetDescription("web", "web_search, web_extract", "zh")).toBe("网页搜索与内容提取");
    expect(localizeToolsetDescription("a2a", "A2A protocol", "zh")).toContain("双向代理间通信");
  });

  it("localizes provider explanation, badge tokens, and credential prompts", () => {
    expect(localizeToolsetBadge("★ recommended · free · local", "zh")).toBe("★ 推荐 · 免费 · 本地");
    expect(localizeToolsetProviderTag("Headless Chromium, no API key needed", "zh")).toBe(
      "无头 Chromium，无需 API 密钥"
    );
    expect(
      localizeToolsetProviderTag("voice transcription (gateway voice messages voice mode)", "zh")
    ).toBe("语音转写（网关语音消息与语音模式）");
    expect(
      localizeToolsetProviderTag(
        "A2A (Agent-to-Agent) protocol v1.0 support for Hermes Agent — both directions of the open Linux Foundation standard for inter-agent communication. OUTBOUND (client tools): a2a_discover, a2a_call, a2a_list, a2a_history, and a2a_orchestrate let the agent fetch another agent's Agent Card and send it tasks over JSON-RPC — works with any A2A-compliant peer (Hermes, LangChain, CrewAI, Google ADK, OpenClaw, ...). INBOUND (platform adapter): exposes Hermes as an A2A-discoverable agent. An Agent Card is served at /.well-known/agent-card.json (v1.0 canonical path; legacy agent.json also answers) and incoming tasks are routed into the agent's live gateway session like any other platform — so the agent that replies is the same one talking to its user, with full memory and context, not a throwaway clone. Security is on by default: no bearer Token configured => localhost-only bind. Inbound task text passes through prompt-injection filters; outbound text is scrubbed of credential-shaped strings; every exchange is audit-logged and persisted to disk outside the context-compaction pipeline so conversations survive compaction and restarts. Pure stdlib transport (http.server + urllib) — no a2a-sdk dependency required.",
        "zh"
      )
    ).toContain("双向智能体间通信");
    expect(localizeToolsetEnvPrompt("HASS_TOKEN", "Home Assistant Long-Lived Access Token", "zh")).toBe(
      "Home Assistant 长期访问令牌"
    );
    expect(localizeToolsetEnvPrompt("VENDOR_API_KEY", "Vendor API key", "zh")).toBe(
      "VENDOR API 密钥"
    );
  });

  it("keeps plugin metadata and stable identifiers when no overlay exists", () => {
    expect(localizeToolsetLabel("plugin", "🔌 Vendor Tools", "zh")).toBe("Vendor Tools");
    expect(localizeToolsetProviderTag("Vendor-specific setup", "zh")).toBe("Vendor-specific setup");
  });
});
