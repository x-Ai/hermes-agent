import { describe, expect, it } from "vitest";

import { formatSessionPruneResult } from "./session-prune";

describe("formatSessionPruneResult", () => {
  it("reports open sessions skipped by the prune safety guard", () => {
    expect(formatSessionPruneResult({ removed: 0, skipped_open: 2 })).toBe(
      "Pruned 0 sessions. Skipped 2 open sessions; prune only removes ended sessions."
    );
  });

  it("keeps the existing success message when nothing was skipped", () => {
    expect(formatSessionPruneResult({ removed: 1, skipped_open: 0 })).toBe("Pruned 1 session");
  });

  it("localizes the complete prune result for the Chinese dashboard", () => {
    expect(formatSessionPruneResult({ removed: 3, skipped_open: 1 }, "zh")).toBe(
      "已清理 3 个会话。已跳过 1 个仍打开的会话；清理操作只会移除已结束的会话。"
    );
  });
});
