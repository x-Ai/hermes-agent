import type { UsageStats } from '@/types/hermes'

/** Merge a gateway usage snapshot without carrying a pre-compaction context
 * occupancy across the backend's explicit measurement gap. Lifetime counters
 * remain merge-friendly; only the current-window fields are invalidated. */
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
