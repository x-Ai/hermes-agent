/**
 * The context popover for a group room in front: one row per member with its
 * room session's occupancy, a placeholder for a member that has not spoken,
 * and a measuring pass for the rows this window has no reading for yet.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { $botMeta, $lastRoster } from './data'
import { $groupChats } from './group-chat'
import { $groupRoomInFront, _resetGroupContextUsageForTests, noteGroupSessionSnapshot } from './group-context-usage'
import { GroupContextUsagePanel, groupUsageSegments } from './group-context-usage-panel'
import { groupSessionKey } from './group-membership'
import { translateBots } from './i18n-test-helper'
import type * as Routing from './routing'
import type { GroupMember, RosterRow } from './types'

const { host, requestForBot } = vi.hoisted(() => ({
  host: {} as Record<string, unknown>,
  requestForBot: vi.fn()
}))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')
  const { compactNumber } = await import('@hermes/shared')
  const { useStore } = await import('@nanostores/react')
  const Passthrough = ({ children }: { children?: ReactNode }) => <>{children}</>

  return {
    ...(await pluginSdkMock(host)),
    Codicon: () => null,
    compactNumber,
    Tip: Passthrough,
    usePluginI18n: () => translateBots,
    useValue: useStore
  }
})
vi.mock('./routing', async importOriginal => ({
  ...(await importOriginal<typeof Routing>()),
  requestForBot
}))

const alpha = { name: 'alpha' } as GroupMember
const beta = { name: 'beta' } as GroupMember

beforeEach(() => {
  _resetGroupContextUsageForTests()
  requestForBot.mockReset()
  requestForBot.mockRejectedValue(Object.assign(new Error('session not found'), { code: 4007 }))
  $lastRoster.set([{ name: 'alpha' }, { name: 'beta' }] as RosterRow[])
  $botMeta.set({ alpha: { groups: ['Alpha'] }, beta: { groups: ['Alpha'] } } as never)
  $groupChats.set({
    Alpha: {
      log: [],
      members: [],
      roomId: 'room-alpha',
      sessions: { [groupSessionKey('main', alpha)]: 'sid-alpha', [groupSessionKey('main', beta)]: 'sid-beta' }
    } as never
  })
  $groupRoomInFront.set('Alpha')
})

afterEach(() => {
  cleanup()
})

it('lists every member: the measured occupancy, or the placeholder for one that has not spoken', async () => {
  noteGroupSessionSnapshot('Alpha', 'main', alpha, {
    info: {
      usage: {
        avg_tps: 41.6,
        cache_hit_pct: 87.4,
        compressions: 2,
        context_max: 200_000,
        context_percent: 6,
        context_used: 12_000
      }
    },
    session_id: 'rt-a1'
  })

  render(<GroupContextUsagePanel />)

  expect(screen.getByText('Context usage · Alpha')).toBeTruthy()

  const figures = screen.getAllByTestId('group-context-usage-figure').map(node => node.textContent)

  expect(figures).toEqual(['12k/200k · 6%', 'No turn yet'])
  expect(screen.getByText('2 compressions · cache hit 87% · 42 t/s')).toBeTruthy()

  // Opening the popover measures only the member without a reading.
  await waitFor(() => expect(requestForBot).toHaveBeenCalled())
  expect(requestForBot.mock.calls.map(([member, method]) => [(member as GroupMember).name, method])).toEqual([
    ['beta', 'session.resume']
  ])
})

it('projects a measured split onto the live occupancy for the bar', () => {
  const entry = {
    at: 0,
    seq: 1,
    categories: [
      { color: 'c1', id: 'system_prompt', label: 'System prompt', tokens: 4_000 },
      { color: 'c2', id: 'conversation', label: 'Conversation', tokens: 1_000 }
    ],
    group: 'Alpha',
    memberKey: 'alpha',
    runtime: 'rt-a1',
    thread: 'main',
    usage: { context_max: 100_000, context_used: 9_000 }
  }

  // The conversation bucket absorbs what grew since the measurement.
  expect(groupUsageSegments(entry).map(segment => [segment.id, segment.tokens])).toEqual([
    ['system_prompt', 4_000],
    ['conversation', 5_000]
  ])
  // No split yet: one conversation-coloured fill of the occupancy.
  expect(groupUsageSegments({ ...entry, categories: [] }).map(segment => [segment.id, segment.tokens])).toEqual([
    ['conversation', 9_000]
  ])
})
