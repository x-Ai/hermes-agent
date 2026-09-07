import { describe, expect, it } from "vitest";

import {
  localizeConfigDescription,
  localizeConfigLabel,
  localizeConfigOption,
  localizeConfigSection
} from "./config-metadata";

describe("dashboard config metadata localization", () => {
  it("localizes generated fields from secondary category pages", () => {
    expect(localizeConfigLabel("agent.gateway_turn_lease_timeout", "zh")).toBe("网关轮次租约超时");
    expect(localizeConfigLabel("x_search", "zh")).toBe("X (Twitter) 搜索");
    expect(localizeConfigDescription("agent.gateway_turn_lease_timeout", "generated", "zh")).toBe(
      "代理 → 网关轮次租约超时"
    );
    expect(localizeConfigLabel("monitoring.gateway_health_export.export_interval_seconds", "zh")).toBe(
      "导出间隔秒数"
    );
    expect(localizeConfigLabel("secrets.onepassword.cache_ttl_seconds", "zh")).toBe("缓存有效期秒数");
  });

  it("localizes every non-brand category and common enum state", () => {
    expect(localizeConfigSection("tool_loop_guardrails", "zh")).toBe("工具循环护栏");
    expect(localizeConfigSection("wake_word", "zh")).toBe("唤醒词");
    expect(localizeConfigSection("x_search", "zh")).toBe("X (Twitter) 搜索");
    expect(localizeConfigOption("warning", "zh")).toBe("警告");
    expect(localizeConfigOption("small", "zh")).toBe("小");
  });

  it("uses the curated Desktop wording for primary settings", () => {
    expect(localizeConfigLabel("terminal.docker_mount_cwd_to_workspace", "zh")).toBe(
      "将项目目录挂载进 Docker"
    );
    expect(
      localizeConfigDescription("display.show_reasoning", "Display reasoning content", "zh")
    ).toBe("当后端提供推理内容时予以显示");
  });
});
