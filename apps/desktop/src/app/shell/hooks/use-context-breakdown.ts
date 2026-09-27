import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'

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
 *  Refetches when the focused session changes, when a turn ends (the
 *  transcript just grew), after an idle compression and after a saved config
 *  change. Held keyed by the session it describes so switching sessions drops
 *  the previous numbers instead of painting them under the new session's
 *  name. */
export function useContextBreakdown({
  busy,
  compressionCount,
  enabled,
  requestGateway,
  sessionId
}: ContextBreakdownOptions) {
  const [fetched, setFetched] = useState<{ breakdown: ContextBreakdown; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const configRevision = useStore($contextBreakdownConfigRevision)

  useEffect(() => {
    // Mid-turn the transcript changes on every delta and the gateway already
    // streams measured usage, so an estimate would be both stale and wasteful.
    if (!enabled || !sessionId || busy) {
      // A turn invalidates the idle snapshot. Do not let it reappear between
      // busy=false and the next RPC response (or survive a failed refresh).
      setFetched(null)
      setLoading(false)

      return
    }

    let cancelled = false
    let attempt = 0
    let retryTimer: null | ReturnType<typeof setTimeout> = null

    const fetchBreakdown = () => {
      setLoading(true)

      void requestGateway<ContextBreakdown>('session.context_breakdown', { session_id: sessionId })
        .then(breakdown => {
          if (cancelled) {
            return
          }

          if (breakdown) {
            setFetched({ breakdown, sessionId })
          }

          if (breakdown?.ready === false && attempt < DEFERRED_AGENT_RETRY_LIMIT) {
            retryTimer = setTimeout(fetchBreakdown, deferredAgentRetryDelayMs(attempt))
            attempt += 1

            return
          }

          setLoading(false)
        })
        .catch(() => {
          if (!cancelled) {
            setLoading(false)
          }
        })
    }

    fetchBreakdown()

    return () => {
      cancelled = true

      if (retryTimer !== null) {
        clearTimeout(retryTimer)
      }
    }
  }, [busy, compressionCount, configRevision, enabled, requestGateway, sessionId])

  return {
    // The effect clears `fetched` only after commit, so gate on `busy` here too:
    // the first busy render must not hand out the pre-turn snapshot.
    breakdown: !busy && fetched?.sessionId === sessionId ? fetched.breakdown : null,
    loading
  }
}
