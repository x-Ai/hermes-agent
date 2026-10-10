import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { $activeConnectionId } from '@/store/connections'
import { requestGatewayForAgent } from '@/store/gateway'
import { notify, notifyError } from '@/store/notifications'
import { $settingsScopeEditsNonDefault } from '@/store/settings-scope'

import { ToggleRow } from '../primitives'

/** Entries per built-in store (`MemoryEntryCounts` in the gateway contract). */
interface MemoryEntryCounts {
  memory?: number
  user?: number
}
/** The two `profiles.describe` fields this row reads. */
interface MemoryIsolationDescribe {
  inherited_memory?: MemoryEntryCounts
  isolated_memory?: boolean
}
/** `profiles.configure` → `memory_isolation`: what the flip did (`MemoryIsolationChange`). */
interface MemoryIsolationChange {
  added?: MemoryEntryCounts
  chars?: number
  error?: string
  failure_class?: string
  isolated: boolean
  limit?: number
  ok: boolean
  removed?: MemoryEntryCounts
  target?: string
}
interface ConfigureResult {
  memory_isolation?: MemoryIsolationChange
}

const total = (counts?: MemoryEntryCounts) => (counts?.memory ?? 0) + (counts?.user ?? 0)
// Store target -> the file the user knows; `overBudget` names the file, a marker rather than copy.
const FILE_FOR_TARGET: Record<string, string> = { memory: 'MEMORY.md', user: 'USER.md' }

/**
 * Settings › Memory & Context › Persistent memory, for a profile other than the default one:
 * profile.yaml `isolated_memory`. A clone copies the default profile's MEMORY.md/USER.md at
 * creation, so every bot starts with the main profile's notes; on removes the entries the profile
 * still shares with the default profile and keeps its own, off copies the default profile's missing
 * entries back in. Hidden for the default profile (it is the source) and on a gateway without the
 * flag (older backend: `profiles.describe` has no `isolated_memory`).
 */
export function MemoryIsolationSetting({
  profile,
  section,
  subpage
}: {
  profile: string | undefined
  /** The config section and subpage on screen: the row belongs to Memory › Persistent memory. */
  section: string
  subpage?: string
}) {
  const { t } = useI18n()
  const copy = t.memoryIsolation
  const onPage = section === 'memory' && (subpage === undefined || subpage === 'persistent')
  const nonDefault = useStore($settingsScopeEditsNonDefault) && onPage
  const connectionId = useStore($activeConnectionId)
  const [state, setState] = useState<{ inherited: number; isolated: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const request = useCallback(
    <T,>(method: string, params: Record<string, unknown>) =>
      requestGatewayForAgent<T>(connectionId, profile ?? '', method, params, undefined, undefined, {
        spawnPriority: 'foreground'
      }),
    [connectionId, profile]
  )

  const load = useCallback(async () => {
    const res = await request<MemoryIsolationDescribe>('profiles.describe', { name: profile })

    return typeof res.isolated_memory === 'boolean'
      ? { isolated: res.isolated_memory, inherited: total(res.inherited_memory) }
      : null
  }, [profile, request])

  useEffect(() => {
    if (!nonDefault || !profile) {
      return
    }

    let cancelled = false

    setState(null)
    load()
      .then(next => {
        if (!cancelled) {
          setState(next)
        }
      })
      .catch(() => {
        // Unreachable backend: the page's config fields already report that; no row.
      })

    return () => void (cancelled = true)
  }, [load, nonDefault, profile])

  if (!nonDefault || !profile || !state) {
    return null
  }

  const failureMessage = (change?: MemoryIsolationChange) => {
    if (change?.failure_class === 'over_budget') {
      const target = change.target ?? ''

      return copy.overBudget(FILE_FOR_TARGET[target] ?? target, change.chars ?? 0, change.limit ?? 0)
    }

    if (change?.failure_class === 'default_profile') {
      return copy.defaultProfile
    }

    return change?.error ? `${copy.failed} ${change.error}` : copy.failed
  }

  const flip = async (on: boolean) => {
    setBusy(true)

    try {
      const res = await request<ConfigureResult>('profiles.configure', { name: profile, isolated_memory: on })
      const change = res.memory_isolation

      if (!change?.ok) {
        notify({ kind: 'error', message: failureMessage(change) })

        return
      }

      notify({
        kind: 'success',
        message: on ? copy.isolated(total(change.removed)) : copy.shared(total(change.added))
      })
      // The flip moved entries: re-read the counts instead of guessing at them.
      setState((await load()) ?? { isolated: change.isolated, inherited: 0 })
    } catch (err) {
      notifyError(err, copy.failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToggleRow
      checked={state.isolated}
      description={copy.description}
      disabled={busy}
      hint={state.isolated ? undefined : state.inherited ? copy.inherited(state.inherited) : copy.noneInherited}
      id="setting-memory-isolation"
      label={copy.title}
      onChange={on => void flip(on)}
    />
  )
}
