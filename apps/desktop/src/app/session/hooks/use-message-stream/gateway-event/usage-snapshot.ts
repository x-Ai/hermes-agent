import type { UsageStats } from '@/types/hermes'

/** Merge lifetime counters while invalidating stale pre-compaction occupancy. */
export function mergeUsageSnapshot(current: UsageStats, incoming: Partial<UsageStats> | undefined): UsageStats {
  if (!incoming) {
    return current
  }

  const next = { ...current, ...incoming }

  if (incoming.context_pending === true) {
    delete next.context_used
    delete next.context_percent
  }

  return next
}
