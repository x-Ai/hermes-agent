interface SessionPruneResult {
  removed: number;
  skipped_open: number;
}

export function formatSessionPruneResult(result: SessionPruneResult, locale = "en"): string {
  if (locale === "zh") {
    const removed = `已清理 ${result.removed} 个会话`;
    if (!result.skipped_open) return removed;
    return `${removed}。已跳过 ${result.skipped_open} 个仍打开的会话；清理操作只会移除已结束的会话。`;
  }
  const removed = `Pruned ${result.removed} session${result.removed === 1 ? "" : "s"}`;
  if (!result.skipped_open) return removed;

  return `${removed}. Skipped ${result.skipped_open} open session${result.skipped_open === 1 ? "" : "s"}; prune only removes ended sessions.`;
}
