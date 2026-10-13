/**
 * The room's per-member context readings: noted from what the engine already
 * receives (resume answers, usage frames), measured on demand, summarised for
 * the statusbar chip while the room's tab is in front.
 */

import type { PluginContext } from '@hermes/plugin-sdk'
import { atom, type WritableAtom } from 'nanostores'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { $groupChats, $groupChatWorkspace } from './group-chat'
import {
  $groupRoomInFront,
  $groupSessionUsage,
  $groupUsageRefreshing,
  _resetGroupContextUsageForTests,
  fullestGroupUsage,
  groupContextChipStores,
  groupRoomPaneId,
  groupRoomUsageEntries,
  groupUsageDetail,
  groupUsageLabel,
  noteGroupSessionBreakdown,
  noteGroupSessionSnapshot,
  recordGroupSessionUsageEvent,
  refreshGroupSessionUsage,
  trackGroupRoomInFront
} from './group-context-usage'
import { startGroupContextUsage } from './group-context-usage-contrib'
import { groupSessionKey } from './group-membership'
import { dropGroupMainTab, groupChatMainTabs, recordGroupMainTab } from './group-panes'
import type * as Routing from './routing'
import type { GroupMember } from './types'

const { host, listeners, requestForBot, visibility } = vi.hoisted(() => ({
  host: {} as Record<string, unknown>,
  listeners: new Map<string, Set<(event: unknown) => void>>(),
  requestForBot: vi.fn(),
  visibility: new Map<string, WritableAtom<boolean>>()
}))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')
  const { compactNumber } = await import('@hermes/shared')

  return { ...(await pluginSdkMock(host)), compactNumber, STATUSBAR_CONTEXT_USAGE_AREA: 'statusBar.contextUsage' }
})
vi.mock('./routing', async importOriginal => ({
  ...(await importOriginal<typeof Routing>()),
  requestForBot
}))
vi.mock('./group-context-usage-panel', () => ({ GroupContextUsagePanel: () => null }))

const alpha = { name: 'alpha' } as GroupMember
const beta = { name: 'beta' } as GroupMember

function seatRoom(group: string, sessions: Record<string, string>) {
  $groupChats.set({
    ...$groupChats.get(),
    [group]: { log: [], members: [], roomId: `room-${group}`, sessions } as never
  })
}

function fire(type: string, event: unknown) {
  for (const listener of listeners.get(type) ?? []) {
    listener(event)
  }
}

beforeEach(() => {
  _resetGroupContextUsageForTests()
  requestForBot.mockReset()
  visibility.clear()
  listeners.clear()
  $groupChats.set({})
  $groupChatWorkspace.set(null)

  for (const group of [...groupChatMainTabs.keys()]) {
    dropGroupMainTab(group)
  }

  host.paneVisibility = (paneId: string) => visibility.get(paneId) ?? atom(false)

  host.onEvent = (type: string, listener: (event: unknown) => void) => {
    const set = listeners.get(type) ?? new Set()
    set.add(listener)
    listeners.set(type, set)

    return () => set.delete(listener)
  }

  seatRoom('Alpha', {
    [groupSessionKey('main', alpha)]: 'sid-alpha-main',
    [groupSessionKey('t2', alpha)]: 'sid-alpha-t2',
    [groupSessionKey('main', beta)]: 'sid-beta-main'
  })
})

describe('readings', () => {
  it('notes a resume answer and keeps the occupancy when a later one carries none', () => {
    noteGroupSessionSnapshot('Alpha', 'main', alpha, {
      info: { usage: { compressions: 0, context_max: 200_000, context_percent: 6, context_used: 12_000 } },
      session_id: 'rt-a1'
    })

    expect(groupRoomUsageEntries('Alpha')).toMatchObject([
      { memberKey: 'alpha', runtime: 'rt-a1', thread: 'main', usage: { context_used: 12_000 } }
    ])

    // A session that has not run a turn in this backend process answers
    // `{context_max, context_pending}`: a new runtime id, no occupancy.
    noteGroupSessionSnapshot('Alpha', 'main', alpha, {
      info: { usage: { context_max: 250_000, context_pending: true } },
      session_id: 'rt-a2'
    })

    expect(groupRoomUsageEntries('Alpha')[0]).toMatchObject({
      runtime: 'rt-a2',
      usage: { context_max: 250_000, context_used: 12_000 }
    })
  })

  it('adopts a usage frame by runtime id and drops the measured split after a compaction', () => {
    noteGroupSessionSnapshot('Alpha', 'main', alpha, { session_id: 'rt-a1' })
    noteGroupSessionBreakdown('Alpha', 'main', alpha, 'rt-a1', {
      categories: [{ color: 'c1', id: 'system_prompt', label: 'System prompt', tokens: 4_000 }],
      context_max: 100_000,
      context_percent: 5,
      context_used: 5_000,
      ready: true
    })

    expect(groupRoomUsageEntries('Alpha')[0].categories).toHaveLength(1)

    recordGroupSessionUsageEvent({
      payload: { usage: { compressions: 0, context_max: 100_000, context_percent: 30, context_used: 30_000 } },
      session_id: 'rt-a1'
    })
    expect(groupRoomUsageEntries('Alpha')[0]).toMatchObject({
      categories: [{ id: 'system_prompt' }],
      usage: { context_used: 30_000 }
    })

    // Unknown runtime: not ours.
    recordGroupSessionUsageEvent({ payload: { usage: { context_used: 1 } }, session_id: 'rt-elsewhere' })
    expect(groupRoomUsageEntries('Alpha')[0].usage.context_used).toBe(30_000)

    // The compaction rewrote the transcript: the split measured before it is gone.
    recordGroupSessionUsageEvent({
      payload: { usage: { compressions: 1, context_max: 100_000, context_percent: 8, context_used: 8_000 } },
      session_id: 'rt-a1'
    })
    expect(groupRoomUsageEntries('Alpha')[0]).toMatchObject({
      categories: [],
      usage: { compressions: 1, context_used: 8_000 }
    })
  })

  it('treats a zeroed breakdown as no data and a deferred one as occupancy without a split', () => {
    noteGroupSessionSnapshot('Alpha', 'main', alpha, {
      info: { usage: { context_max: 100_000, context_used: 9_000 } },
      session_id: 'rt-a1'
    })

    noteGroupSessionBreakdown('Alpha', 'main', alpha, 'rt-a1', { categories: [], context_max: 0, context_used: 0 })
    expect(groupRoomUsageEntries('Alpha')[0].usage.context_used).toBe(9_000)

    noteGroupSessionBreakdown('Alpha', 'main', alpha, 'rt-a1', {
      categories: [],
      context_max: 100_000,
      context_used: 0,
      ready: false
    })
    expect(groupRoomUsageEntries('Alpha')[0]).toMatchObject({ categories: [], usage: { context_used: 9_000 } })
  })
})

describe('summary', () => {
  it('names the fullest member and formats like the core chip', () => {
    noteGroupSessionSnapshot('Alpha', 'main', alpha, {
      info: { usage: { context_max: 1_000_000, context_percent: 4, context_used: 40_000 } },
      session_id: 'rt-a1'
    })
    noteGroupSessionSnapshot('Alpha', 'main', beta, {
      info: { usage: { context_estimated: true, context_max: 200_000, context_percent: 23, context_used: 45_200 } },
      session_id: 'rt-b1'
    })

    const best = fullestGroupUsage(groupRoomUsageEntries('Alpha'))

    expect(best?.memberKey).toBe('beta')
    expect(groupUsageLabel(best!.usage)).toBe('~45.2k/200k')
    expect(groupUsageDetail(best!.usage)).toBe('[██░░░░░░░░] ~23%')
    expect(groupUsageDetail({ context_max: 1_000_000, context_used: 40_000 })).toBe('[░░░░░░░░░░] 4%')
    expect(groupUsageLabel({ context_max: 1_000_000 })).toBe('')
  })
})

describe('the room in front', () => {
  it('follows the visible main-window tab, preferring the selected room in a split', () => {
    const stop = trackGroupRoomInFront()
    const chip = groupContextChipStores()
    const $alpha = atom(false)
    visibility.set(groupRoomPaneId('Alpha'), $alpha)

    expect($groupRoomInFront.get()).toBeNull()

    recordGroupMainTab('Alpha', () => undefined)
    expect($groupRoomInFront.get()).toBeNull()

    $alpha.set(true)
    expect($groupRoomInFront.get()).toBe('Alpha')
    expect(chip.active.get()).toBe(true)

    const $beta = atom(true)
    visibility.set(groupRoomPaneId('Beta'), $beta)
    recordGroupMainTab('Beta', () => undefined)
    expect($groupRoomInFront.get()).toBe('Alpha')

    $groupChatWorkspace.set('Beta')
    expect($groupRoomInFront.get()).toBe('Beta')

    $beta.set(false)
    expect($groupRoomInFront.get()).toBe('Alpha')

    dropGroupMainTab('Alpha')
    expect($groupRoomInFront.get()).toBeNull()

    $beta.set(true)
    expect($groupRoomInFront.get()).toBe('Beta')

    stop()
    expect($groupRoomInFront.get()).toBeNull()
  })
})

describe('measuring on demand', () => {
  it('resumes each stored member session, asks for its breakdown, and skips rows that already have a reading', async () => {
    requestForBot.mockImplementation(async (_member: GroupMember, method: string, params: Record<string, unknown>) => {
      if (method === 'session.resume') {
        if (params.session_id === 'sid-alpha-t2') {
          throw Object.assign(new Error('session not found'), { code: 4007 })
        }

        return {
          info: { usage: { context_max: 100_000, context_percent: 5, context_used: 5_000 } },
          session_id: `rt-${String(params.session_id)}`
        }
      }

      if (method === 'session.context_breakdown') {
        return {
          categories: [
            { color: 'c1', id: 'system_prompt', label: 'System prompt', tokens: 4_000 },
            { color: 'c2', id: 'conversation', label: 'Conversation', tokens: 1_200 }
          ],
          context_max: 100_000,
          context_percent: 5,
          context_used: 5_200,
          ready: true
        }
      }

      return {}
    })

    noteGroupSessionSnapshot('Alpha', 'main', beta, {
      info: { usage: { context_max: 100_000, context_percent: 1, context_used: 1_000 } },
      session_id: 'rt-b-known'
    })

    const pass = refreshGroupSessionUsage('Alpha', [alpha, beta], { onlyMissing: true })

    expect($groupUsageRefreshing.get().Alpha).toBe(true)
    await pass
    expect($groupUsageRefreshing.get().Alpha).toBe(false)

    const resumed = requestForBot.mock.calls
      .filter(([, method]) => method === 'session.resume')
      .map(([, , params]) => (params as { session_id: string }).session_id)

    // Beta already had a reading; alpha's two thread sessions were measured
    // (the one the gateway no longer has stayed as it was).
    expect(resumed.sort()).toEqual(['sid-alpha-main', 'sid-alpha-t2'])
    expect(requestForBot).toHaveBeenCalledWith(alpha, 'session.context_breakdown', { session_id: 'rt-sid-alpha-main' })

    const all = $groupSessionUsage.get()

    const alphaMain = groupRoomUsageEntries('Alpha', all).find(
      entry => entry.thread === 'main' && entry.memberKey === 'alpha'
    )

    expect(alphaMain).toMatchObject({
      categories: [{ id: 'system_prompt' }, { id: 'conversation' }],
      runtime: 'rt-sid-alpha-main',
      usage: { context_used: 5_200 }
    })
    expect(groupRoomUsageEntries('Alpha', all).find(entry => entry.thread === 't2')).toBeUndefined()
  })
})

describe('the statusbar contribution', () => {
  it('registers the override, feeds usage frames into the readings, and retires with the plugin', () => {
    const disposeRegistration = vi.fn()
    const ctx = { register: vi.fn(() => disposeRegistration) } as unknown as PluginContext

    const stop = startGroupContextUsage(ctx)

    const registration = (ctx.register as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      area: string
      data: { active: { get: () => boolean }; detail: { get: () => string }; label: { get: () => string } }
      id: string
    }

    expect(registration).toMatchObject({ area: 'statusBar.contextUsage', id: 'group-context-usage' })
    expect(registration.data.active.get()).toBe(false)

    noteGroupSessionSnapshot('Alpha', 'main', alpha, { session_id: 'rt-a1' })
    fire('message.complete', {
      payload: { usage: { context_max: 100_000, context_percent: 20, context_used: 20_000 } },
      session_id: 'rt-a1',
      type: 'message.complete'
    })
    fire('session.usage', {
      payload: { usage: { context_max: 100_000, context_percent: 21, context_used: 21_000 } },
      session_id: 'rt-a1',
      type: 'session.usage'
    })

    expect(groupRoomUsageEntries('Alpha')[0].usage.context_used).toBe(21_000)

    visibility.set(groupRoomPaneId('Alpha'), atom(true))
    recordGroupMainTab('Alpha', () => undefined)

    expect(registration.data.active.get()).toBe(true)
    expect(registration.data.label.get()).toBe('21k/100k')
    expect(registration.data.detail.get()).toBe('[██░░░░░░░░] 21%')

    stop()

    expect(disposeRegistration).toHaveBeenCalledTimes(1)
    expect([...listeners.values()].every(set => set.size === 0)).toBe(true)
    expect($groupRoomInFront.get()).toBeNull()
  })
})

describe('the running member', () => {
  it('shows the throughput and cache hit of whichever member was heard from last', () => {
    const chip = groupContextChipStores()
    visibility.set(groupRoomPaneId('Alpha'), atom(true))
    const stop = trackGroupRoomInFront()
    recordGroupMainTab('Alpha', () => undefined)

    noteGroupSessionSnapshot('Alpha', 'main', alpha, { session_id: 'rt-a1' })
    noteGroupSessionSnapshot('Alpha', 'main', beta, { session_id: 'rt-b1' })
    expect(chip.cacheHit.get()).toBe('')
    expect(chip.tokensPerSecond.get()).toBe('')

    recordGroupSessionUsageEvent({
      payload: { usage: { avg_tps: 41.6, cache_hit_pct: 87.4, context_max: 100_000, context_used: 10_000 } },
      session_id: 'rt-a1'
    })
    expect(chip.cacheHit.get()).toBe('87%')
    expect(chip.tokensPerSecond.get()).toBe('42 t/s')

    // Beta speaks next: its figures take the items over.
    recordGroupSessionUsageEvent({
      payload: { usage: { avg_tps: 12.2, cache_hit_pct: 30, context_max: 100_000, context_used: 5_000 } },
      session_id: 'rt-b1'
    })
    expect(chip.tokensPerSecond.get()).toBe('12 t/s')
    expect(chip.cacheHit.get()).toBe('30%')

    // A snapshot without an occupancy still carries the running member's throughput;
    // its earlier cache reading stays until the provider reports again.
    noteGroupSessionSnapshot('Alpha', 'main', alpha, {
      info: { usage: { avg_tps: 55, context_max: 100_000, context_pending: true } },
      session_id: 'rt-a2'
    })
    expect(chip.tokensPerSecond.get()).toBe('55 t/s')
    expect(chip.cacheHit.get()).toBe('87%')

    stop()
  })
})
