import { useEffect, useState } from 'react'

import { profileScopeKey } from '@/api/client'
import { getWisdomEntitlement, getWisdomStatus, type ProfileScope } from '@/hermes'

// The chat-side Wisdom cards poll three endpoints per open thread. For a profile without a
// wisdom-scoped Nous token, or one that never ran setup, every poll answers 422 and the main
// process logs each failure — so nothing may mount until BOTH answers are yes. Entitlement is
// the cheap probe that never 422s; status (which does, when unentitled) is asked only after.
// One probe per profile scope is shared by every thread and tile showing that scope.
const RECHECK_MS = 60_000
const inflight = new Map<string, Promise<boolean>>()
const known = new Map<string, { at: number; ready: boolean }>()

export function wisdomChatSurfaceReady(profile?: ProfileScope, now = Date.now()): Promise<boolean> {
  const key = profileScopeKey(profile)
  const cached = known.get(key)

  if (cached && now - cached.at < RECHECK_MS) {
    return Promise.resolve(cached.ready)
  }

  const pending = inflight.get(key)

  if (pending) {
    return pending
  }

  const probe = (async () => {
    try {
      const entitlement = await getWisdomEntitlement(profile)

      const entitled =
        entitlement.entitled === true && (entitlement.expires_at === null || entitlement.expires_at * 1000 > now)

      if (!entitled) {
        return false
      }

      return (await getWisdomStatus(profile)).configured === true
    } catch {
      return false
    }
  })()

  inflight.set(key, probe)
  void probe.then(ready => {
    known.set(key, { at: Date.now(), ready })
    inflight.delete(key)
  })

  return probe
}

/** Test seam: forget every remembered answer. */
export function resetWisdomChatSurfaceCache(): void {
  inflight.clear()
  known.clear()
}

/** True once the profile is entitled AND set up; re-checked every minute while mounted. */
export function useWisdomChatSurfaceReady(profile?: ProfileScope): boolean {
  const [ready, setReady] = useState(() => known.get(profileScopeKey(profile))?.ready ?? false)

  useEffect(() => {
    let active = true

    const check = () => {
      void wisdomChatSurfaceReady(profile).then(next => {
        if (active) {
          setReady(next)
        }
      })
    }

    check()
    const timer = window.setInterval(check, RECHECK_MS)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [profile])

  return ready
}
