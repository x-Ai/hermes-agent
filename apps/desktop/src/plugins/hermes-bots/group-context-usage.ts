/**
 * Per-member context usage of a group room, for the statusbar's context chip
 * while a room tab is in front.
 *
 * The statusbar follows the focused SESSION. A room is a plugin workspace tab
 * and its members run in hidden plumbing sessions, so the core chip kept
 * measuring the idle primary chat while the room worked. The gateway already
 * reports every member session's occupancy to the room engine — `info.usage`
 * on each `session.resume` answer the turn poll makes, `usage` on the
 * `message.complete` / `session.usage` frames — so the engine notes them here,
 * and `session.context_breakdown` fills in the per-category split on demand.
 *
 * Window-local by design: a live reading of THIS backend process, never room
 * metadata to sync to other Desktops.
 */

import { atom, compactNumber, computed, host } from '@hermes/plugin-sdk'
import type { ReadableAtom } from 'nanostores'

import { $groupChats, $groupChatWorkspace, groupChatRoomKey } from './group-chat'
import type { GroupChatRoom } from './group-chat'
import { groupMemberKey, groupSessionKey, groupSessionMemberKey, groupSessionThread } from './group-membership'
import { $groupMainTabsRev, groupChatMainTabs } from './group-panes'
import { slugifyProfileName } from './labels'
import { requestForBot } from './routing'
import { ID } from './shared'
import type { GroupMember } from './types'

/** The occupancy fields of a gateway usage snapshot (`_get_usage`) kept per session. */
export interface GroupSessionUsageStats {
  /** Rolling output tokens per second over the last ~10 calls (`_get_usage`). */
  avg_tps?: number
  /** Session prompt-cache hit rate, 0–100; omitted while the provider reports no cache reads. */
  cache_hit_pct?: number
  compressions?: number
  context_estimated?: boolean
  context_max?: number
  /** A compaction invalidated the occupancy until the provider reports again. */
  context_pending?: boolean
  context_percent?: number
  context_used?: number
}

export interface GroupSessionUsageCategory {
  color: string
  id: string
  label: string
  tokens: number
}

export interface GroupSessionUsage {
  /** Wall clock of the last reading. */
  at: number
  /** Order of the last reading across every session (two in one millisecond still order). */
  seq: number
  /** Per-category split from `session.context_breakdown`; empty until asked. */
  categories: GroupSessionUsageCategory[]
  group: string
  memberKey: string
  runtime: null | string
  thread: string
  usage: GroupSessionUsageStats
}

/** What this store reads off a `session.resume` / `session.create` answer. */
export interface GroupSessionUsageSnapshot {
  info?: { usage?: unknown }
  session_id?: string
}

/** A `session.context_breakdown` answer, loosely typed: older gateways omit fields. */
export interface GroupSessionBreakdownAnswer {
  categories?: unknown
  context_estimated?: unknown
  context_max?: unknown
  context_percent?: unknown
  context_used?: unknown
  ready?: unknown
}

/** Readings keyed `${roomKey}|${sessionKey}` (`groupSessionKey`: thread + member). */
export const $groupSessionUsage = atom<Record<string, GroupSessionUsage>>({})
/** Rooms with a `refreshGroupSessionUsage` pass in flight. */
export const $groupUsageRefreshing = atom<Record<string, boolean>>({})
/** The group whose MAIN-window tab is on screen, or null: the chat, a page,
 *  or a room open only in the Bots pane fallback (the main chat stays in
 *  front there, so the chip keeps describing it). */
export const $groupRoomInFront = atom<null | string>(null)

/** Runtime session id → reading key, so a usage frame keyed by runtime id
 *  (message.complete, session.usage) finds the member it belongs to. */
const runtimeOwners = new Map<string, string>()
let readingSeq = 0

const finite = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const flag = (value: unknown): boolean | undefined => (typeof value === 'boolean' ? value : undefined)

function roomKeyOf(group: string): string {
  return groupChatRoomKey(group, ($groupChats.get()[group] || {}) as GroupChatRoom)
}

function usageKey(group: string, thread: string, member: GroupMember): string {
  return `${roomKeyOf(group)}|${groupSessionKey(thread, member)}`
}

function pickUsage(raw: unknown): GroupSessionUsageStats | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const usage = raw as Record<string, unknown>

  return {
    avg_tps: finite(usage.avg_tps),
    cache_hit_pct: finite(usage.cache_hit_pct),
    compressions: finite(usage.compressions),
    context_estimated: flag(usage.context_estimated),
    context_max: finite(usage.context_max),
    context_pending: flag(usage.context_pending),
    context_percent: finite(usage.context_percent),
    context_used: finite(usage.context_used)
  }
}

function pickCategories(raw: unknown): GroupSessionUsageCategory[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.flatMap(entry => {
    const category = (entry || {}) as Record<string, unknown>
    const tokens = finite(category.tokens)

    return typeof category.id === 'string' && tokens !== undefined
      ? [
          {
            color: typeof category.color === 'string' ? category.color : 'var(--context-usage-conversation)',
            id: category.id,
            label: typeof category.label === 'string' ? category.label : category.id,
            tokens
          }
        ]
      : []
  })
}

function defined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as Partial<T>
}

/** A snapshot without an occupancy — a session that has not run a turn in this
 *  backend process yet answers `{context_max, context_pending}` or nothing at
 *  all — must not erase a reading already held; its window size and
 *  compression count still apply. */
function mergeUsage(previous: GroupSessionUsageStats, incoming: GroupSessionUsageStats): GroupSessionUsageStats {
  if (incoming.context_used === undefined) {
    return {
      ...previous,
      ...defined({
        avg_tps: incoming.avg_tps,
        cache_hit_pct: incoming.cache_hit_pct,
        compressions: incoming.compressions,
        context_max: incoming.context_max
      })
    }
  }

  return { ...previous, ...defined(incoming) }
}

interface UsageIdentity {
  group: string
  memberKey: string
  runtime: null | string
  thread: string
}

function sameReading(previous: GroupSessionUsage, next: GroupSessionUsage): boolean {
  return (
    previous.runtime === next.runtime &&
    JSON.stringify(previous.usage) === JSON.stringify(next.usage) &&
    JSON.stringify(previous.categories) === JSON.stringify(next.categories)
  )
}

function commit(
  key: string,
  identity: UsageIdentity,
  usage: GroupSessionUsageStats | null,
  categories: GroupSessionUsageCategory[] | null
): void {
  const all = $groupSessionUsage.get()
  const previous = all[key]
  const mergedUsage = usage ? mergeUsage(previous?.usage ?? {}, usage) : (previous?.usage ?? {})
  // A compaction rewrote the transcript: the split measured before it is no
  // longer the truth; keep only the occupancy until the next measurement.
  const compacted = (mergedUsage.compressions ?? 0) > (previous?.usage.compressions ?? 0)

  const next: GroupSessionUsage = {
    at: Date.now(),
    seq: readingSeq + 1,
    categories: categories ?? (compacted ? [] : (previous?.categories ?? [])),
    group: identity.group,
    memberKey: identity.memberKey,
    runtime: identity.runtime ?? previous?.runtime ?? null,
    thread: identity.thread,
    usage: mergedUsage
  }

  if (previous && sameReading(previous, next)) {
    return
  }

  readingSeq = next.seq
  $groupSessionUsage.set({ ...all, [key]: next })
}

/** Note what a `session.resume` (or `session.create`) answer says about a
 *  member's session in `thread`: its runtime id and, when the session has run
 *  a turn in this backend process, its occupancy (`info.usage`). */
export function noteGroupSessionSnapshot(
  group: string,
  thread: string,
  member: GroupMember,
  snapshot: GroupSessionUsageSnapshot | null | undefined
): void {
  if (!snapshot || typeof snapshot !== 'object') {
    return
  }

  const key = usageKey(group, thread, member)
  const runtime = typeof snapshot.session_id === 'string' && snapshot.session_id ? snapshot.session_id : null

  if (runtime) {
    runtimeOwners.set(runtime, key)
  }

  commit(key, { group, memberKey: groupMemberKey(member), runtime, thread }, pickUsage(snapshot.info?.usage), null)
}

/** Index a runtime id minted for a member's session (a fresh `session.create`
 *  carries no usage yet) so its first usage frame lands on the right row. */
export function noteGroupSessionRuntime(
  group: string,
  thread: string,
  member: GroupMember,
  runtime: null | string | undefined
): void {
  if (!runtime) {
    return
  }

  const key = usageKey(group, thread, member)
  runtimeOwners.set(runtime, key)
  commit(key, { group, memberKey: groupMemberKey(member), runtime, thread }, null, null)
}

/** A `message.complete` or `session.usage` frame (or a `session.compress`
 *  result) for a runtime id this store knows: adopt its `usage`. */
export function recordGroupSessionUsageEvent(
  event: { payload?: unknown; session_id?: string } | null | undefined
): void {
  const key = runtimeOwners.get(String(event?.session_id || ''))
  const previous = key ? $groupSessionUsage.get()[key] : undefined
  const usage = pickUsage((event?.payload as { usage?: unknown } | null | undefined)?.usage)

  if (!key || !previous || !usage) {
    return
  }

  commit(
    key,
    { group: previous.group, memberKey: previous.memberKey, runtime: previous.runtime, thread: previous.thread },
    usage,
    null
  )
}

/** Adopt a `session.context_breakdown` answer: the per-category split and the
 *  estimate it is anchored on. A zeroed answer (`context_max: 0`, the
 *  backend's agent-is-None branch during a rebuild) is not data; a
 *  `ready: false` one carries the stored occupancy without categories. */
export function noteGroupSessionBreakdown(
  group: string,
  thread: string,
  member: GroupMember,
  runtime: string,
  answer: GroupSessionBreakdownAnswer | null | undefined
): void {
  if (!answer || typeof answer !== 'object') {
    return
  }

  const contextMax = finite(answer.context_max) ?? 0

  if (contextMax <= 0) {
    return
  }

  const key = usageKey(group, thread, member)
  runtimeOwners.set(runtime, key)
  const deferred = answer.ready === false
  const used = finite(answer.context_used)

  const usage: GroupSessionUsageStats = {
    context_estimated: flag(answer.context_estimated),
    context_max: contextMax,
    context_percent: finite(answer.context_percent),
    // The deferred branch answers 0 for "unknown"; a live estimate is never 0.
    context_used: deferred && !used ? undefined : used
  }

  commit(
    key,
    { group, memberKey: groupMemberKey(member), runtime, thread },
    usage,
    deferred ? null : pickCategories(answer.categories)
  )
}

const REFRESH_RESUME_OPTIONS = { timeoutMs: 180_000 } as const

function setRefreshing(group: string, refreshing: boolean): void {
  const current = $groupUsageRefreshing.get()

  if (Boolean(current[group]) !== refreshing) {
    $groupUsageRefreshing.set({ ...current, [group]: refreshing })
  }
}

/** Measure the room's member sessions on demand: resume each stored session
 *  (`omit_messages`, the same call the room's compress action makes) for its
 *  runtime id and occupancy, then ask `session.context_breakdown` for the
 *  split. `onlyMissing` skips sessions that already hold an occupancy — the
 *  turn polls and usage frames keep those current without a round trip. One
 *  pass per room at a time; a session the gateway no longer has (4007), a
 *  busy refusal or an older gateway without the RPC leaves its row as it was. */
export async function refreshGroupSessionUsage(
  group: string,
  members: GroupMember[],
  options: { onlyMissing?: boolean } = {}
): Promise<void> {
  if ($groupUsageRefreshing.get()[group]) {
    return
  }

  const room = ($groupChats.get()[group] || {}) as GroupChatRoom
  const byKey = new Map(members.map(member => [groupMemberKey(member), member] as const))
  const targets: Array<{ member: GroupMember; stored: string; thread: string }> = []

  for (const [sessionKey, stored] of Object.entries(room.sessions || {})) {
    const member = typeof stored === 'string' ? byKey.get(groupSessionMemberKey(sessionKey)) : undefined

    if (!member || member.sourceMissing || member.sourceReachable === false) {
      continue
    }

    const thread = groupSessionThread(sessionKey)
    const known = $groupSessionUsage.get()[usageKey(group, thread, member)]

    if (options.onlyMissing && known?.usage.context_used !== undefined) {
      continue
    }

    targets.push({ member, stored: stored as string, thread })
  }

  if (!targets.length) {
    return
  }

  setRefreshing(group, true)

  try {
    for (const { member, stored, thread } of targets) {
      try {
        const snapshot = await requestForBot<GroupSessionUsageSnapshot>(
          member,
          'session.resume',
          { omit_messages: true, profile: member.name, session_id: stored },
          REFRESH_RESUME_OPTIONS
        )

        noteGroupSessionSnapshot(group, thread, member, snapshot)

        if (!snapshot?.session_id) {
          continue
        }

        const answer = await requestForBot<GroupSessionBreakdownAnswer>(member, 'session.context_breakdown', {
          session_id: snapshot.session_id
        })

        noteGroupSessionBreakdown(group, thread, member, snapshot.session_id, answer)
      } catch {
        /* gone (4007), busy, or an older gateway: the live path still feeds this row */
      }
    }
  } finally {
    setRefreshing(group, false)
  }
}

/** The pane id `openGroupChat` docks a room's main-window tab under. */
export function groupRoomPaneId(group: string): string {
  return `plugin-workspace:${ID}:group:${slugifyProfileName(group)}`
}

/** Keep `$groupRoomInFront` current: among the rooms with a main-window tab
 *  (`groupChatMainTabs`), the one whose pane is on screen — the selected room
 *  (`$groupChatWorkspace`) when several are, as in a split. Feature-detected:
 *  a shell without `host.paneVisibility` treats every open room tab as
 *  visible. Returns the stop function. */
export function trackGroupRoomInFront(): () => void {
  const visible = new Map<string, boolean>()
  let visibilityStops: Array<() => void> = []

  const recompute = () => {
    const rooms = [...groupChatMainTabs.keys()].filter(room => visible.get(room))
    const selected = $groupChatWorkspace.get()
    const next = rooms.length === 0 ? null : selected && rooms.includes(selected) ? selected : rooms[0]

    if ($groupRoomInFront.get() !== next) {
      $groupRoomInFront.set(next)
    }
  }

  const resubscribe = () => {
    for (const stop of visibilityStops.splice(0)) {
      stop()
    }

    visible.clear()

    for (const room of groupChatMainTabs.keys()) {
      const $visible =
        typeof host.paneVisibility === 'function' ? host.paneVisibility(groupRoomPaneId(room)) : atom(true)

      visibilityStops.push(
        $visible.subscribe(value => {
          visible.set(room, Boolean(value))
          recompute()
        })
      )
    }

    recompute()
  }

  // `subscribe` runs once now (the tabs already open) and on every rev bump.
  const stopTabs = $groupMainTabsRev.subscribe(resubscribe)
  const stopSelection = $groupChatWorkspace.listen(recompute)

  return () => {
    stopTabs()
    stopSelection()

    for (const stop of visibilityStops.splice(0)) {
      stop()
    }

    $groupRoomInFront.set(null)
  }
}

/** Every reading this window holds for `group`. */
export function groupRoomUsageEntries(
  group: string,
  all: Record<string, GroupSessionUsage> = $groupSessionUsage.get()
): GroupSessionUsage[] {
  const prefix = `${roomKeyOf(group)}|`

  return Object.entries(all)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, entry]) => entry)
}

/** Occupancy as a 0–100 integer, or null before the session's first reading. */
export function groupUsagePercent(usage: GroupSessionUsageStats): null | number {
  const max = usage.context_max ?? 0

  if (!(max > 0) || usage.context_used === undefined) {
    return null
  }

  const percent = usage.context_percent ?? (usage.context_used / max) * 100

  return Math.max(0, Math.min(100, Math.round(percent)))
}

/** The member session closest to its window — what the chip summarises. */
export function fullestGroupUsage(entries: readonly GroupSessionUsage[]): GroupSessionUsage | null {
  let best: GroupSessionUsage | null = null
  let bestPercent = -1

  for (const entry of entries) {
    const percent = groupUsagePercent(entry.usage)

    if (percent !== null && percent > bestPercent) {
      best = entry
      bestPercent = percent
    }
  }

  return best
}

/** The member session most recently heard from — the one running now, or the
 *  last one that did. Its throughput and cache hit are what the statusbar's
 *  `tokens-per-second` / `cache-hit-rate` items show for the room: members
 *  overwrite each other as they take turns, by design. */
export function latestGroupUsage(entries: readonly GroupSessionUsage[]): GroupSessionUsage | null {
  let latest: GroupSessionUsage | null = null

  for (const entry of entries) {
    if (!latest || entry.seq > latest.seq) {
      latest = entry
    }
  }

  return latest
}

/** `87%` — the core `cacheHitLabel` format; '' while the provider reports no cache reads. */
export function groupCacheHitLabel(usage: GroupSessionUsageStats): string {
  const pct = usage.cache_hit_pct

  return typeof pct === 'number' && Number.isFinite(pct) ? `${Math.round(pct)}%` : ''
}

/** `42 t/s` — the core `tokensPerSecondLabel` format; '' before the first completed call. */
export function groupTokensPerSecondLabel(usage: GroupSessionUsageStats): string {
  const tps = usage.avg_tps

  return typeof tps === 'number' && Number.isFinite(tps) && tps > 0 ? `${Math.round(tps)} t/s` : ''
}

/** `~45k/1M` — the core chip's own format (`usageContextLabel`). */
export function groupUsageLabel(usage: GroupSessionUsageStats): string {
  if (groupUsagePercent(usage) === null) {
    return ''
  }

  return `${usage.context_estimated ? '~' : ''}${compactNumber(usage.context_used ?? 0)}/${compactNumber(usage.context_max ?? 0)}`
}

/** `[████░░░░░░] 4%` — the core chip's own detail (`contextBarLabel`). */
export function groupUsageDetail(usage: GroupSessionUsageStats, width = 10): string {
  const percent = groupUsagePercent(usage)

  if (percent === null) {
    return ''
  }

  const filled = Math.round((percent / 100) * width)

  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${usage.context_estimated ? '~' : ''}${percent}%`
}

function fullestInFront(room: null | string, all: Record<string, GroupSessionUsage>): GroupSessionUsage | null {
  return room ? fullestGroupUsage(groupRoomUsageEntries(room, all)) : null
}

export interface GroupContextChipStores {
  active: ReadableAtom<boolean>
  cacheHit: ReadableAtom<string>
  detail: ReadableAtom<string>
  label: ReadableAtom<string>
  tokensPerSecond: ReadableAtom<string>
}

function latestInFront(room: null | string, all: Record<string, GroupSessionUsage>): GroupSessionUsage | null {
  return room ? latestGroupUsage(groupRoomUsageEntries(room, all)) : null
}

/** The chip override's contract (`STATUSBAR_CONTEXT_USAGE_AREA`): active while
 *  a room tab is in front; label and detail follow the fullest member, cache
 *  hit and tokens per second the member heard from last. The
 *  `$groupChats` input re-keys the readings when a room record changes. Built
 *  on demand (at plugin register), not at import: the room engine imports
 *  this module too, and its test doubles of the SDK stop at `atom`. */
export function groupContextChipStores(): GroupContextChipStores {
  return {
    active: computed($groupRoomInFront, room => room !== null),
    cacheHit: computed([$groupRoomInFront, $groupSessionUsage, $groupChats], (room, all) => {
      const latest = latestInFront(room, all)

      return latest ? groupCacheHitLabel(latest.usage) : ''
    }),
    detail: computed([$groupRoomInFront, $groupSessionUsage, $groupChats], (room, all) => {
      const best = fullestInFront(room, all)

      return best ? groupUsageDetail(best.usage) : ''
    }),
    label: computed([$groupRoomInFront, $groupSessionUsage, $groupChats], (room, all) => {
      const best = fullestInFront(room, all)

      return best ? groupUsageLabel(best.usage) : ''
    }),
    tokensPerSecond: computed([$groupRoomInFront, $groupSessionUsage, $groupChats], (room, all) => {
      const latest = latestInFront(room, all)

      return latest ? groupTokensPerSecondLabel(latest.usage) : ''
    })
  }
}

/** Test isolation: readings, the runtime index and the in-front selection are module state. */
export function _resetGroupContextUsageForTests(): void {
  runtimeOwners.clear()
  $groupSessionUsage.set({})
  $groupUsageRefreshing.set({})
  $groupRoomInFront.set(null)
}
