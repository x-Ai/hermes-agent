/**
 * The statusbar context popover while a group room tab is in front: one row
 * per member — its room session's occupancy, the per-category split once
 * measured — instead of the focused session's single breakdown. Rows fill
 * from the readings the room engine notes (`group-context-usage.ts`); opening
 * the popover measures the sessions this window has no reading for yet.
 */

import { Codicon, Tip, useValue } from '@hermes/plugin-sdk'
import { useEffect } from 'react'

import { $botMeta, $lastRoster } from './data'
import { $groupChats } from './group-chat'
import {
  $groupRoomInFront,
  $groupSessionUsage,
  $groupUsageRefreshing,
  groupRoomUsageEntries,
  groupUsageLabel,
  groupUsagePercent,
  refreshGroupSessionUsage
} from './group-context-usage'
import type { GroupSessionUsage, GroupSessionUsageCategory } from './group-context-usage'
import { groupChatMemberBots, groupMemberKey } from './group-membership'
import { useBots } from './i18n'
import { displayName } from './labels'
import { botRosterMeta } from './routing'
import type { RosterRow } from './types'

const CONVERSATION_COLOR = 'var(--context-usage-conversation)'

/** The bar's segments: the measured split projected onto the live occupancy
 *  (the conversation bucket absorbs what grew since the measurement, as the
 *  core panel does), or one conversation-coloured fill before any split. */
export function groupUsageSegments(entry: GroupSessionUsage): GroupSessionUsageCategory[] {
  const used = entry.usage.context_used ?? 0

  if (!entry.categories.length) {
    return [{ color: CONVERSATION_COLOR, id: 'conversation', label: 'Conversation', tokens: used }]
  }

  const fixed = entry.categories.reduce(
    (total, category) => total + (category.id === 'conversation' ? 0 : category.tokens),
    0
  )

  const conversation = Math.max(0, used - fixed)

  const projected = entry.categories.map(category =>
    category.id === 'conversation' ? { ...category, tokens: conversation } : category
  )

  return projected.some(category => category.id === 'conversation') || conversation === 0
    ? projected
    : [...projected, { color: CONVERSATION_COLOR, id: 'conversation', label: 'Conversation', tokens: conversation }]
}

/** The reading a member's row shows: its most recently measured thread session. */
export function latestMemberUsage(
  entries: readonly GroupSessionUsage[],
  member: RosterRow
): { latest: GroupSessionUsage | null; threads: number } {
  const memberKey = groupMemberKey(member)
  const mine = entries.filter(entry => entry.memberKey === memberKey).sort((a, b) => b.seq - a.seq)

  return { latest: mine[0] ?? null, threads: mine.length }
}

function UsageBar({ entry }: { entry: GroupSessionUsage | null }) {
  const percent = entry ? groupUsagePercent(entry.usage) : null

  if (entry === null || percent === null) {
    return <div className="dither h-1.5 rounded-full bg-(--ui-bg-elevated)" data-slot="group-context-usage-bar" />
  }

  const segments = groupUsageSegments(entry)
  const total = segments.reduce((sum, segment) => sum + segment.tokens, 0) || 1

  return (
    <div
      className="flex h-1.5 overflow-hidden rounded-full bg-(--ui-stroke-tertiary)"
      data-slot="group-context-usage-bar"
    >
      <div className="flex h-full" style={{ width: `${Math.max(percent, 1)}%` }}>
        {segments.map(segment => (
          <span
            className="h-full min-w-px"
            key={segment.id}
            style={{ background: segment.color, width: `${(segment.tokens / total) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function GroupContextUsagePanel() {
  const b = useBots()
  const group = useValue($groupRoomInFront)
  const all = useValue($groupSessionUsage)
  const refreshing = useValue($groupUsageRefreshing)
  // Membership rides bot meta AND the room record.
  useValue($groupChats)
  const roster = useValue($lastRoster)
  const meta = useValue($botMeta)
  const members = group ? groupChatMemberBots(group, roster, meta) : []
  const entries = group ? groupRoomUsageEntries(group, all) : []
  const busy = Boolean(group && refreshing[group])

  // Opening the popover measures the sessions this window has no reading for
  // yet (a room resumed after a backend restart); rows with a reading stay
  // live through the turn polls and usage frames instead.
  useEffect(() => {
    if (group) {
      void refreshGroupSessionUsage(group, groupChatMemberBots(group, $lastRoster.get(), $botMeta.get()), {
        onlyMissing: true
      })
    }
  }, [group])

  if (!group) {
    return null
  }

  return (
    <div className="flex w-80 flex-col gap-3 p-3 text-[0.75rem]" data-slot="group-context-usage-panel">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate font-medium text-foreground">{b.group.contextUsageTitle(group)}</p>

        <Tip label={b.group.contextUsageRefresh}>
          <button
            aria-label={b.group.contextUsageRefresh}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-(--chrome-action-hover) hover:text-foreground disabled:opacity-50"
            disabled={busy}
            onClick={() => void refreshGroupSessionUsage(group, members)}
            type="button"
          >
            <Codicon aria-hidden="true" name="refresh" size="0.75rem" />
          </button>
        </Tip>
      </div>

      <p className="text-[0.6875rem] text-muted-foreground">
        {busy ? b.group.contextUsageRefreshing : b.group.contextUsageHint}
      </p>

      {members.length === 0 ? (
        <p className="text-[0.6875rem] text-muted-foreground">{b.group.contextUsageNoMembers}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {members.map(member => {
            const { latest, threads } = latestMemberUsage(entries, member)
            const percent = latest ? groupUsagePercent(latest.usage) : null
            const compressions = latest?.usage.compressions ?? 0
            const cacheHit = latest?.usage.cache_hit_pct
            const tps = latest?.usage.avg_tps ?? 0

            const hints = [
              threads > 1 ? b.group.contextUsageThreads(threads) : '',
              compressions > 0 ? b.group.contextUsageCompressions(compressions) : '',
              cacheHit !== undefined ? b.group.contextUsageCacheHit(Math.round(cacheHit)) : '',
              tps > 0 ? b.group.contextUsageTokensPerSecond(Math.round(tps)) : ''
            ].filter(Boolean)

            return (
              <li className="flex flex-col gap-1" data-testid="group-context-usage-row" key={groupMemberKey(member)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-foreground">
                    {displayName(member, botRosterMeta(member, meta))}
                  </span>

                  <span
                    className="shrink-0 tabular-nums text-muted-foreground"
                    data-testid="group-context-usage-figure"
                  >
                    {latest && percent !== null
                      ? `${groupUsageLabel(latest.usage)} · ${latest.usage.context_estimated ? '~' : ''}${percent}%`
                      : b.group.contextUsageNone}
                  </span>
                </div>

                <UsageBar entry={latest} />

                {hints.length > 0 && <p className="text-[0.6875rem] text-muted-foreground">{hints.join(' · ')}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
