import { mergeUsage } from '@hermes/shared'

import { setCurrentUsage } from '@/store/session'
import type { UsageStats } from '@/types/hermes'

import type { GatewayEventContext } from './types'

/** Merge lifetime counters: a tick without a plan gauge drops the stale one (`mergeUsage`), and a
 *  pre-compaction tick (`context_pending`) invalidates the stale occupancy. */
export function mergeUsageSnapshot(current: UsageStats, incoming: Partial<UsageStats> | undefined): UsageStats {
  if (!incoming) {
    return current
  }

  const next: UsageStats = mergeUsage(current, incoming)

  if (incoming.context_pending === true) {
    delete next.context_used
    delete next.context_percent
  }

  return next
}

/** A turn's usage payload lands on the per-session twin FIRST (the statusbar reads it for focused
 *  tiles); the primary-only global mirrors the ACTIVE session — ungated it let a background tile's
 *  turn overwrite the primary's count. */
export function applyTurnUsage(
  sessionId: string,
  usage: Partial<UsageStats>,
  isActiveEvent: boolean,
  updateSessionState: GatewayEventContext['deps']['updateSessionState']
): void {
  updateSessionState(sessionId, state => ({
    ...state,
    usage: mergeUsageSnapshot({ calls: 0, input: 0, output: 0, total: 0, ...state.usage }, usage)
  }))

  if (isActiveEvent) {
    setCurrentUsage(current => mergeUsageSnapshot(current, usage))
  }
}
