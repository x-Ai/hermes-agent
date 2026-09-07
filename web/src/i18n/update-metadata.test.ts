import { describe, expect, it } from "vitest";

import { dashboardZh } from "./dashboard";
import { localizeUpdateCheckNotice, localizeUpdateRefusal } from "./update-metadata";

describe("update notice localization", () => {
  const copy = dashboardZh.system;

  it("does not expose fixed backend English in update-check Toasts", () => {
    expect(localizeUpdateCheckNotice({
      install_method: "git", current_version: "1", behind: null,
      update_available: false, can_apply: true, update_command: "hermes update",
      message: "Couldn't reach the update source — try again later."
    }, copy)).toBe("无法连接更新源，请稍后重试")

    expect(localizeUpdateCheckNotice({
      install_method: "apt", current_version: "1", behind: null,
      update_available: false, can_apply: false, update_command: "pkg upgrade hermes-agent",
      message: "Hermes is managed by Termux APT"
    }, copy)).toBe("使用 pkg upgrade hermes-agent 更新")
  })

  it("localizes stable update refusal codes and keeps remediation commands", () => {
    expect(localizeUpdateRefusal({
      ok: false, name: "hermes-update", pid: null,
      error: "dashboard_update_managed_externally", message: "backend prose",
      update_command: "managed outside dashboard"
    }, copy)).toBe("无法从当前 Dashboard 应用更新")
  })
})
