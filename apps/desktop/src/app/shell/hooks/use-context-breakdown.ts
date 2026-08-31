import { useEffect, useState } from 'react'

import type { ContextBreakdown } from '@/types/hermes'

interface ContextBreakdownOptions {
  busy: boolean
  compressionCount?: number
  enabled: boolean
  requestGateway: <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>
  sessionId: null | string
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
 *  A new session is created before its deferred AIAgent is ready. The first
 *  request can therefore return an explicitly unavailable category snapshot.
 *  When a turn is running, retry that cheap read with bounded backoff until the
 *  agent exists; otherwise the live occupancy delta would be mislabeled as one
 *  giant Conversation bucket for the whole turn. Busy transitions and turn
 *  completion also trigger an immediate read. Held keyed by the session it
 *  describes so switching sessions drops the previous numbers instead of
 *  painting them under the new session's name. */
export function useContextBreakdown({
  busy,
  compressionCount,
  enabled,
  requestGateway,
  sessionId
}: ContextBreakdownOptions) {
  const [fetched, setFetched] = useState<{ breakdown: ContextBreakdown; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !sessionId) {
      setLoading(false)

      return
    }

    let cancelled = false
    let retryCount = 0
    let retryTimer: null | ReturnType<typeof setTimeout> = null

    const fetchBreakdown = () => {
      setLoading(true)

      void requestGateway<ContextBreakdown>('session.context_breakdown', { session_id: sessionId })
        .then(breakdown => {
          if (cancelled || !breakdown) {
            return
          }

          setFetched({ breakdown, sessionId })

          // `ready` is explicit on current gateways. Treat an empty legacy
          // payload the same way so a new desktop can recover against the
          // immediately preceding backend contract too.
          const categoriesReady = breakdown.ready !== false && breakdown.categories.length > 0

          if (busy && !categoriesReady) {
            const delay = Math.min(2_000, 250 * 2 ** retryCount)
            retryCount += 1
            retryTimer = setTimeout(fetchBreakdown, delay)

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
  }, [busy, compressionCount, enabled, requestGateway, sessionId])

  return {
    breakdown: fetched && fetched.sessionId === sessionId ? fetched.breakdown : null,
    loading
  }
}
