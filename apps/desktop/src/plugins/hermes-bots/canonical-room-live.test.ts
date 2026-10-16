import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

import {
  _resetCanonicalRoomLiveForTests,
  canonicalLiveTurn,
  canonicalTurnTraces,
  handleRoomActivity,
  noteCanonicalMemberReply
} from './canonical-room-live'
import { $groupSessionUsage, _resetGroupContextUsageForTests } from './group-context-usage'
import { runTimersInline } from './group-test-utils'
import { $groupLiveTraces } from './group-trace-live'
import type { GroupMember } from './types'

const GROUP = 'canonical:local:default:r1'
const ALPHA: GroupMember = { name: 'alpha', handle: 'alpha', title: 'Alpha', connectionId: 'local' }
const members = [ALPHA, { name: 'beta', handle: 'beta', title: null, connectionId: 'local' }]
const LIVE_KEY = `${GROUP}::alpha`

function frame(kind: string, payload: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  return {
    kind,
    member_id: 'alpha',
    payload,
    room_id: 'r1',
    session_id: 'sid-alpha',
    thread_id: 't1',
    turn_id: 'turn-1',
    ...extra
  }
}

beforeEach(() => {
  runTimersInline()
  _resetCanonicalRoomLiveForTests()
  _resetGroupContextUsageForTests()
  $groupLiveTraces.set({})
})

afterEach(() => {
  _resetCanonicalRoomLiveForTests()
})

describe('handleRoomActivity', () => {
  it('feeds the live trace box from a watched member turn and names who is working', () => {
    const started: string[] = []
    handleRoomActivity(
      GROUP,
      members,
      frame('tool.started', { tool_id: 'c1', name: 'terminal', args: { command: 'ls' } }),
      {
        onTurnStarted: member => started.push(member.name)
      }
    )
    handleRoomActivity(GROUP, members, frame('reasoning.delta', { text: 'hm' }))
    handleRoomActivity(GROUP, members, frame('tool.completed', { tool_id: 'c1', name: 'terminal', summary: 'done' }))
    handleRoomActivity(GROUP, members, frame('message.interim', { text: 'half way' }))

    expect(started).toEqual(['alpha'])
    expect(canonicalLiveTurn(GROUP)).toEqual({ member: ALPHA, thread: 't1' })
    const live = $groupLiveTraces.get()[LIVE_KEY]
    expect(live?.steps.map(step => step.kind)).toEqual(['tool', 'reasoning', 'text'])
    expect(live?.runningIndex).toBeNull()
  })

  it("folds the recorded steps under the reply on the member's message.complete and adopts its usage", () => {
    handleRoomActivity(GROUP, members, frame('tool.started', { tool_id: 'c1', name: 'terminal' }))
    const completed: string[] = []
    handleRoomActivity(GROUP, members, frame('turn.complete', { usage: { context_used: 1200, context_max: 8000 } }), {
      onTurnComplete: member => completed.push(member.name)
    })

    expect(completed).toEqual(['alpha'])
    expect(canonicalLiveTurn(GROUP)).toBeNull()
    expect($groupLiveTraces.get()[LIVE_KEY]).toBeUndefined()
    const traces = canonicalTurnTraces(GROUP)
    expect(traces['turn-1']?.steps.map(step => step.kind)).toEqual(['tool'])
    const row = Object.values($groupSessionUsage.get()).find(entry => entry.memberKey === 'alpha')
    expect(row?.usage.context_used).toBe(1200)
  })

  it('finishes a turn from the durable reply when no complete frame was seen', () => {
    handleRoomActivity(GROUP, members, frame('message.interim', { text: 'working' }))
    noteCanonicalMemberReply(GROUP, ALPHA, 'turn-1')

    expect(canonicalLiveTurn(GROUP)).toBeNull()
    expect(canonicalTurnTraces(GROUP)['turn-1']?.steps.map(step => step.kind)).toEqual(['text'])
  })

  it('ignores frames for members outside the room', () => {
    handleRoomActivity(
      GROUP,
      members,
      frame('tool.started', { tool_id: 'c1', name: 'terminal' }, { member_id: 'stranger' })
    )

    expect(canonicalLiveTurn(GROUP)).toBeNull()
    expect($groupLiveTraces.get()).toEqual({})
  })
})
