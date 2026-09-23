import { compactNumber } from '@hermes/shared'
import { useMemo } from 'react'

import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { ContextBreakdown, ContextUsageCategory, UsageStats } from '@/types/hermes'

interface ContextUsagePanelProps {
  breakdown: ContextBreakdown | null
  loading: boolean
  usage: UsageStats
}

/** Project a fetched category snapshot onto the latest measured occupancy. */
export function projectLiveContextBreakdown(
  breakdown: ContextBreakdown | null,
  usage: UsageStats
): ContextBreakdown | null {
  if (!breakdown || typeof usage.context_used !== 'number' || usage.context_used < 0) {
    return breakdown
  }

  if (breakdown.ready === false || breakdown.categories.length === 0) {
    return breakdown
  }

  const contextUsed = usage.context_used
  const contextMax = usage.context_max ?? breakdown.context_max

  const nonConversationTotal = breakdown.categories.reduce(
    (total, category) => total + (category.id === 'conversation' ? 0 : category.tokens),
    0
  )

  const conversationTokens = Math.max(0, contextUsed - nonConversationTotal)
  let foundConversation = false

  const categories = breakdown.categories.map(category => {
    if (category.id !== 'conversation') {
      return category
    }

    foundConversation = true

    return { ...category, tokens: conversationTokens }
  })

  if (!foundConversation && conversationTokens > 0) {
    categories.push({
      color: 'var(--context-usage-conversation)',
      id: 'conversation',
      label: 'Conversation',
      tokens: conversationTokens
    })
  }

  return {
    ...breakdown,
    categories,
    context_max: contextMax,
    context_percent: contextMax ? Math.max(0, Math.min(100, Math.round((contextUsed / contextMax) * 100))) : 0,
    context_used: contextUsed,
    estimated_total: nonConversationTotal + conversationTokens
  }
}

/** Presentational: the breakdown is fetched by the statusbar (see
 *  `useContextBreakdown`) because the gauge's own label needs it, so the
 *  popover opens with its numbers already in hand. `usage` is the gauge's
 *  merged figure — measured occupancy when the backend has it, the estimate
 *  otherwise — so the header and the bar can never disagree. */
export function ContextUsagePanel({ breakdown, loading, usage }: ContextUsagePanelProps) {
  const { t } = useI18n()
  const copy = t.shell.statusbar.contextUsagePanel
  const contextMax = usage.context_max ?? 0
  const contextUsed = usage.context_used ?? 0
  const contextPercent = Math.max(0, Math.min(100, Math.round(usage.context_percent ?? 0)))

  const categories = useMemo(
    () =>
      (breakdown?.categories ?? []).map(category => ({
        ...category,
        label: copy.categories[category.id as keyof typeof copy.categories] ?? category.label
      })),
    [breakdown?.categories, copy]
  )

  const segmentTotal = categories.reduce((sum, category) => sum + category.tokens, 0) || contextUsed || 1

  return (
    <div className="flex w-72 flex-col gap-3 p-3 text-[0.75rem]" data-slot="context-usage-panel">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium text-foreground">{copy.title}</p>

        <span className="text-[0.6875rem] text-muted-foreground">
          {copy.tokenSummary(
            `${usage.context_estimated ? '~' : ''}${compactNumber(contextUsed)}`,
            compactNumber(contextMax)
          )}
        </span>
      </div>

      <p className="text-[0.6875rem] text-foreground">
        {usage.context_estimated ? '~' : ''}
        {copy.percentFull(contextPercent)}
      </p>

      <ContextUsageBar categories={categories} segmentTotal={segmentTotal} />

      <ul className="flex flex-col gap-1.5">
        {categories.map(category => (
          <li className="flex items-center justify-between gap-2" key={category.id}>
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-[2px]" style={{ background: category.color }} />

              <span className="truncate text-muted-foreground">{category.label}</span>
            </span>

            <span className="shrink-0 tabular-nums text-foreground">~{compactNumber(category.tokens)}</span>
          </li>
        ))}
      </ul>

      {loading && !categories.length && <p className="text-[0.6875rem] text-muted-foreground">{copy.loading}</p>}

      {!loading && !categories.length && <p className="text-[0.6875rem] text-muted-foreground">{copy.empty}</p>}
    </div>
  )
}

function ContextUsageBar({
  categories,
  segmentTotal
}: {
  categories: readonly ContextUsageCategory[]
  segmentTotal: number
}) {
  return (
    <div
      className={cn(
        'flex h-1.5 overflow-hidden rounded-full',
        categories.length ? 'bg-(--ui-stroke-tertiary)' : 'dither bg-(--ui-bg-elevated)'
      )}
      data-slot="context-usage-bar"
    >
      {categories.map(category => (
        <span
          className="h-full min-w-px"
          key={category.id}
          style={{
            background: category.color,
            width: `${(category.tokens / segmentTotal) * 100}%`
          }}
        />
      ))}
    </div>
  )
}
