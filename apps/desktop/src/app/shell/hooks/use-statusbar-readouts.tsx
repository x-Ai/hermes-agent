import { useStore } from '@nanostores/react'
import { atom, computed } from 'nanostores'
import { useMemo } from 'react'

import { ContextMeterDetail, ContextUsagePanel } from '@/app/shell/context-usage-panel'
import type { StatusbarItem } from '@/app/shell/statusbar-controls'
import { ContribBoundary, ContribRender } from '@/contrib/react/boundary'
import { useContributions } from '@/contrib/react/use-contributions'
import type { Contribution } from '@/contrib/types'
import { cacheHitLabel, contextBarLabel, tokensPerSecondLabel, usageContextLabel } from '@/lib/statusbar'
import { type ContextUsageOverrideContribution, STATUSBAR_CONTEXT_USAGE_AREA } from '@/sdk/areas'
import type { ContextBreakdown, UsageStats } from '@/types/hermes'

export type ContextUsageChipFace = Pick<StatusbarItem, 'detail' | 'label' | 'menuContent'>

/** The three per-session statusbar readouts; '' is each item's waiting placeholder. */
export interface StatusbarReadouts {
  /** `87%` for the `cache-hit-rate` item. */
  cacheHit: string
  /** Label, `[bar] N%` detail and popover of the `context-usage` item. */
  contextChip: ContextUsageChipFace
  /** `42 t/s` for the `tokens-per-second` item. */
  tokensPerSecond: string
}

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

/** The statusbar's session readouts — the context-usage chip (label, `[bar] N%`
 *  detail, category popover), the cache-hit rate and the tokens-per-second
 *  figure: the focused session's, unless a `STATUSBAR_CONTEXT_USAGE_AREA`
 *  contribution is active, in which case that plugin's. The statusbar follows
 *  the focused SESSION, so a main-area workspace that is not a session (a
 *  group room whose members run in hidden sessions) had no way to be described
 *  here: the chip kept measuring the idle primary chat and the rate items its
 *  last call. The first active contribution in area order wins; a readout it
 *  does not provide shows the placeholder rather than the focused session's
 *  figure; the focused session's figures return the moment none is active. */
export function useStatusbarReadouts(
  breakdown: ContextBreakdown | null,
  loading: boolean,
  gaugeUsage: UsageStats,
  currentUsage: UsageStats
): StatusbarReadouts {
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
  const cacheHit = useStore(active?.data.cacheHit ?? $blank)
  const tokensPerSecond = useStore(active?.data.tokensPerSecond ?? $blank)

  return useMemo<StatusbarReadouts>(() => {
    // Never self-hide: the user opted these items in (they're hidden-by-default),
    // so an empty label renders as a waiting placeholder, not a vanished item —
    // an enabled-but-invisible toggle reads as "another item took its spot".
    if (active) {
      return {
        cacheHit,
        contextChip: {
          detail: detail || undefined,
          label: label || '—',
          menuContent: (
            <ContribBoundary id={active.contribution.id} variant="chip">
              <ContribRender render={active.data.panel} />
            </ContribBoundary>
          )
        },
        tokensPerSecond
      }
    }

    const bar = contextBarLabel(gaugeUsage)

    return {
      // Both ride the same usage payload the context meter does (session.usage
      // ticks mid-turn, message.complete after) — no extra RPC, no polling.
      cacheHit: cacheHitLabel(currentUsage),
      contextChip: {
        detail: bar ? <ContextMeterDetail bar={bar} compressions={gaugeUsage.compressions} /> : undefined,
        label: usageContextLabel(gaugeUsage) || '—',
        menuContent: <ContextUsagePanel breakdown={breakdown} loading={loading} usage={gaugeUsage} />
      },
      tokensPerSecond: tokensPerSecondLabel(currentUsage)
    }
  }, [active, breakdown, cacheHit, currentUsage, detail, gaugeUsage, label, loading, tokensPerSecond])
}
