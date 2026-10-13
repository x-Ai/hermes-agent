import { useStore } from '@nanostores/react'
import { atom, computed } from 'nanostores'
import { useMemo } from 'react'

import { ContextMeterDetail, ContextUsagePanel } from '@/app/shell/context-usage-panel'
import type { StatusbarItem } from '@/app/shell/statusbar-controls'
import { ContribBoundary, ContribRender } from '@/contrib/react/boundary'
import { useContributions } from '@/contrib/react/use-contributions'
import type { Contribution } from '@/contrib/types'
import { contextBarLabel, usageContextLabel } from '@/lib/statusbar'
import { type ContextUsageOverrideContribution, STATUSBAR_CONTEXT_USAGE_AREA } from '@/sdk/areas'
import type { ContextBreakdown, UsageStats } from '@/types/hermes'

export type ContextUsageChipFace = Pick<StatusbarItem, 'detail' | 'label' | 'menuContent'>

interface ActiveOverride {
  contribution: Contribution
  data: ContextUsageOverrideContribution
}

const $noOverride = atom<ActiveOverride | null>(null)
const $blank = atom('')

function isOverride(data: unknown): data is ContextUsageOverrideContribution {
  const candidate = data as Partial<ContextUsageOverrideContribution> | null

  return Boolean(
    candidate &&
    typeof candidate.panel === 'function' &&
    typeof candidate.active?.subscribe === 'function' &&
    typeof candidate.label?.subscribe === 'function'
  )
}

/** The face of the statusbar's `context-usage` item: the focused session's
 *  label, `[bar] N%` detail and category popover — unless a
 *  `STATUSBAR_CONTEXT_USAGE_AREA` contribution is active, in which case that
 *  plugin's. The statusbar follows the focused SESSION, so a main-area
 *  workspace that is not a session (a group room whose members run in hidden
 *  sessions) had no way to be described here: its chip kept measuring the
 *  idle primary chat. The first active contribution in area order wins; the
 *  focused session's figures return the moment none is active. */
export function useContextUsageChip(
  breakdown: ContextBreakdown | null,
  loading: boolean,
  usage: UsageStats
): ContextUsageChipFace {
  const contributions = useContributions(STATUSBAR_CONTEXT_USAGE_AREA)

  const $active = useMemo(() => {
    const overrides = contributions
      .filter(contribution => isOverride(contribution.data))
      .map(contribution => ({ contribution, data: contribution.data as ContextUsageOverrideContribution }))

    if (!overrides.length) {
      return $noOverride
    }

    return computed(
      overrides.map(override => override.data.active),
      (...flags: boolean[]) => overrides.find((_, index) => flags[index]) ?? null
    )
  }, [contributions])

  const active = useStore($active)
  const label = useStore(active?.data.label ?? $blank)
  const detail = useStore(active?.data.detail ?? $blank)

  return useMemo<ContextUsageChipFace>(() => {
    // Never self-hide: the user opted this item in (it's hidden-by-default),
    // so an empty label renders as a waiting placeholder, not a vanished item —
    // an enabled-but-invisible toggle reads as "another item took its spot".
    if (active) {
      return {
        detail: detail || undefined,
        label: label || '—',
        menuContent: (
          <ContribBoundary id={active.contribution.id} variant="chip">
            <ContribRender render={active.data.panel} />
          </ContribBoundary>
        )
      }
    }

    const bar = contextBarLabel(usage)

    return {
      detail: bar ? <ContextMeterDetail bar={bar} compressions={usage.compressions} /> : undefined,
      label: usageContextLabel(usage) || '—',
      menuContent: <ContextUsagePanel breakdown={breakdown} loading={loading} usage={usage} />
    }
  }, [active, breakdown, detail, label, loading, usage])
}
