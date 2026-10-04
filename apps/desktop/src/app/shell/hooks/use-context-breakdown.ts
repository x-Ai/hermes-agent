import { useStore } from '@nanostores/react'
import { useEffect, useRef, useState } from 'react'

import { $contextBreakdownConfigRevision } from '@/store/context-breakdown'
import type { ContextBreakdown } from '@/types/hermes'

interface ContextBreakdownOptions {
  busy: boolean
  compressionCount?: number
  enabled: boolean
  requestGateway: <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>
  sessionId: null | string
}

/** Re-asks for a snapshot the backend reports as not ready (`ready: false`: a
 *  resumed session whose AIAgent is still being built in the background) this
 *  many times, backing off 250ms → 2s (about 12s in total). After that the
 *  gauge rides the streamed usage until the next trigger. */
export const DEFERRED_AGENT_RETRY_LIMIT = 8

/** While a turn runs, a ready snapshot is re-measured on this cadence so the
 *  per-category rows follow a long agentic turn (tool results piling into the
 *  conversation bucket, a mid-turn compaction shrinking it) instead of freezing
 *  at the pre-turn split. The RPC is a local chars/4 pass over the live
 *  transcript — no provider call, no prompt-cache impact — so the cost is a
 *  few milliseconds of backend CPU every refresh. */
export const BUSY_REFRESH_MS = 15_000

function deferredAgentRetryDelayMs(attempt: number): number {
  return Math.min(2_000, 250 * 2 ** attempt)
}

/** The focused session's context breakdown, fetched as soon as the statusbar
 *  gauge is on screen rather than when its popover opens.
 *
 *  The backend only reports measured context occupancy (`last_prompt_tokens`)
 *  once a turn has run in THIS process, so a resumed session reports none —
 *  which is why turning the gauge on used to do nothing at all until you sent
 *  a message. `session.context_breakdown` estimates the same figure from the
 *  live system prompt + tools + transcript, so it answers for a session that
 *  hasn't spoken yet. It is a read-only chars/4 pass: no provider call, no
 *  prompt-cache impact.
 *
 *  Refetches when the focused session changes, when a turn starts and ends,
 *  on a throttle while the turn runs (`BUSY_REFRESH_MS`), after an idle
 *  compression and after a saved config change. Held keyed by the session it
 *  describes so switching sessions drops the previous numbers instead of
 *  painting them under the new session's name.
 *
 *  A running turn does NOT blank the breakdown. The backend measures the live
 *  (per-tool-round, compacted) message list for a running session, and the
 *  statusbar projects the last snapshot onto the streamed `session.usage`
 *  ticks (`projectLiveContextBreakdown`), so the categories a long agentic turn
 *  shows are current rather than stale — the concern that once made the hook
 *  suspend mid-turn (#70871). Going dark for the whole turn left the popover
 *  on "no context data" for ten-minute runs, which is the worse failure.
 *
 *  Two events change the transcript WITHOUT a busy toggle, so the refetch
 *  must be driven explicitly:
 *
 *  - **Compression** — manual `/compress` runs the `session.compress` RPC
 *    outside any turn (busy never flips), and auto-compression can commit
 *    mid-turn. The post-compression transcript measures a fraction of the
 *    pre-compression size, so a served pre-compression breakdown is not
 *    merely stale, it is wrong by 5-10x (#94001).
 *  - **Reclaim** (`session.reclaimed`) — the runtime is reaped and the
 *    session re-resumes; the first refetch can race the agent rebuild.
 *
 *  `invalidateContextBreakdown` bumps a per-session generation that both
 *  call sites (slash.ts after a successful compress, lifecycle.ts on
 *  reclaim) fire, forcing an immediate refetch. An untrustworthy answer —
 *  an outright failure, or a ZEROED breakdown from the backend's
 *  agent-is-None branch (`context_max: 0`) — retries on a bounded backoff;
 *  once the ladder is exhausted the cached breakdown is EVICTED so the
 *  meter goes dark honestly rather than showing numbers known to be
 *  stale. */

/** A breakdown the backend computed from a live agent carries a real
 *  context_max (the compressor's context_length). Zero means the
 *  `agent is None` branch answered from empty metadata — not data. */
function isZeroedBreakdown(breakdown: ContextBreakdown): boolean {
  return !(breakdown.context_max > 0)
}

const RETRY_DELAYS_MS = [1_000, 4_000, 12_000]

/** Per-session invalidation generations. `invalidateContextBreakdown` bumps
 *  the generation for one session and notifies subscribers; the hook
 *  subscribes for its own session, so a bump re-runs the fetch immediately. */
const invalidationGenerations = new Map<string, number>()
const invalidationListeners = new Set<(sessionId: string, generation: number) => void>()

/** Force a refetch of the context breakdown for `sessionId` on the next
 *  render. Call when the transcript is known to have changed outside a
 *  turn: after a successful `session.compress`, and on
 *  `session.reclaimed`. */
export function invalidateContextBreakdown(sessionId: string): void {
  const id = sessionId.trim()

  if (id) {
    const generation = (invalidationGenerations.get(id) ?? 0) + 1

    invalidationGenerations.set(id, generation)

    for (const listener of invalidationListeners) {
      listener(id, generation)
    }
  }
}

/** Clear all invalidation generations (test isolation — the Map is
 *  module-level and would otherwise leak across tests). */
export function _resetContextBreakdownInvalidationsForTests(): void {
  invalidationGenerations.clear()
}

export function useContextBreakdown({
  busy,
  compressionCount,
  enabled,
  requestGateway,
  sessionId
}: ContextBreakdownOptions) {
  const [fetched, setFetched] = useState<{ breakdown: ContextBreakdown; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(false)
  // Bounded retry: `attempt` indexes RETRY_DELAYS_MS; advancing it re-runs the
  // fetch effect. `exhausted` marks the end state — cached numbers evicted,
  // backoff stopped, meter dark until the next legitimate trigger (session
  // change, turn end, or invalidation) starts a fresh ladder.
  const [attempt, setAttempt] = useState(0)
  const [exhausted, setExhausted] = useState(false)
  const [generation, setGeneration] = useState(0)
  const configRevision = useStore($contextBreakdownConfigRevision)
  // Read by the fetch effect: a mid-turn background refresh must not flip
  // `loading` while the popover already has rows (that would flash its
  // loading line); an idle refetch or a cold session still announces itself.
  const hasSnapshotRef = useRef(false)
  hasSnapshotRef.current = fetched?.sessionId === sessionId

  // Subscribe to invalidation bumps for THIS session: a bump from
  // invalidateContextBreakdown (post-compress, reclaim) re-runs the fetch
  // effect immediately, without waiting for a busy toggle or session switch.
  useEffect(() => {
    if (!sessionId) {
      return
    }

    const listener = (id: string, next: number) => {
      if (id === sessionId) {
        setGeneration(current => (current === next ? current : next))
      }
    }

    invalidationListeners.add(listener)

    // Adopt any generation bumped before this effect subscribed (e.g. the
    // invalidation fired while the meter was hidden, or between sessions).
    const pending = invalidationGenerations.get(sessionId) ?? 0

    setGeneration(current => (current === pending ? current : pending))

    return () => {
      invalidationListeners.delete(listener)
    }
  }, [sessionId])

  // A session switch must not inherit the previous session's retry state —
  // its first successful fetch is authoritative for it. (The fetch effect's
  // own cleanup cancels any pending backoff timer from the old session.)
  useEffect(() => {
    setAttempt(0)
    setExhausted(false)
  }, [sessionId])

  useEffect(() => {
    if (!enabled || !sessionId) {
      setFetched(null)
      setLoading(false)

      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    // The deferred-agent poll is local to one trigger: a new trigger (busy
    // toggle, compression, config save, invalidation) starts a fresh count.
    let deferredAttempt = 0
    setLoading(!(busy && hasSnapshotRef.current))

    const scheduleRetry = () => {
      if (attempt < RETRY_DELAYS_MS.length) {
        timer = setTimeout(() => setAttempt(a => a + 1), RETRY_DELAYS_MS[attempt])
      } else {
        // Ladder exhausted: evict whatever is cached. A dark meter is honest;
        // pre-compression numbers are a lie (#94001).
        setFetched(null)
        setExhausted(true)
        setLoading(false)
      }
    }

    const fetchBreakdown = () => {
      void requestGateway<ContextBreakdown>('session.context_breakdown', { session_id: sessionId })
        .then(breakdown => {
          if (cancelled) {
            return
          }

          // Zeroed = the backend had no agent to measure against (post-reclaim
          // rebuild window). Don't cache it — it would blank the meter now and
          // stand in for real data later. Retry on the bounded ladder instead.
          if (!breakdown || isZeroedBreakdown(breakdown)) {
            scheduleRetry()

            return
          }

          setFetched({ breakdown, sessionId })
          setExhausted(false)

          // Not ready = a deferred session still building its AIAgent answered
          // from the stored usage (real numbers, no per-category rows). Show
          // them and keep asking on a short backoff until the live agent
          // answers; ready snapshots are never polled while idle.
          if (breakdown.ready === false && deferredAttempt < DEFERRED_AGENT_RETRY_LIMIT) {
            timer = setTimeout(fetchBreakdown, deferredAgentRetryDelayMs(deferredAttempt))
            deferredAttempt += 1

            return
          }

          setLoading(false)

          // A running turn keeps growing the transcript: re-measure on a
          // throttle so the rows follow it. The busy→idle flip re-runs this
          // effect (cancelling the timer) for the authoritative reconciliation.
          if (busy) {
            timer = setTimeout(fetchBreakdown, BUSY_REFRESH_MS)
          }
        })
        .catch(() => {
          // The fetch itself failed (rebind race after session.reclaimed, etc.).
          // Same bounded ladder; on exhaustion, evict rather than freeze.
          if (cancelled) {
            return
          }

          scheduleRetry()
        })
    }

    fetchBreakdown()

    return () => {
      cancelled = true

      if (timer) {
        clearTimeout(timer)
      }
    }
    // `attempt` + `generation` drive the refetch re-runs; everything else is a trigger.
  }, [attempt, busy, compressionCount, configRevision, enabled, generation, requestGateway, sessionId])

  // While the retry ladder is still running, the last good breakdown stays on
  // screen (the meter ticking down beats flickering dark for a transient window);
  // once exhausted the cache is gone, so this returns null and the meter goes
  // dark honestly.
  return {
    breakdown: fetched?.sessionId === sessionId ? fetched.breakdown : null,
    loading
  }
}
