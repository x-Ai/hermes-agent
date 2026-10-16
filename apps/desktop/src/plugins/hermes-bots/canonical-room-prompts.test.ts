import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { host } = vi.hoisted(() => ({
  host: {
    notify: vi.fn(),
    onEvent: () => () => undefined,
    request: vi.fn(),
    requestProfile: vi.fn(),
    state: {} as Record<string, unknown>
  }
}))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

import { $canonicalGroupBindings } from './canonical-group-registry'
import { _resetCanonicalRoomSyncForTests, forgetCanonicalRoom, syncCanonicalRoom } from './canonical-room-sync'
import { $groupChats, $groupClarify, appendGroupChatEntry } from './group-chat'
import { answerGroupClarify, groupHasPendingClarify } from './group-turns'

const binding = { connectionId: 'local', profile: 'default', roomId: 'r1' }
const KEY = 'canonical:local:default:r1'
const CARD = `${KEY}::legacy::alpha`

const ROOM = {
  room_id: 'r1',
  name: 'Release room',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta' }
  ]
}

const approval = {
  kind: 'approval',
  member_id: 'alpha',
  task_id: 'task-1',
  execution_generation: 2,
  request_id: 'req-1',
  session_id: 'sess-a',
  approval: { description: 'Run the test suite?', command: 'npm test', choices: ['once', 'deny'] }
}

function script(pending: unknown[]) {
  const calls: Array<[string, Record<string, unknown>]> = []
  host.requestProfile.mockImplementation(async (_route: unknown, method: string, params: Record<string, unknown>) => {
    calls.push([method, params])

    switch (method) {
      case 'groups.capabilities':
        return {
          driver: true,
          features: ['room_settings', 'member_sessions', 'room_live', 'activity_watch'],
          methods: []
        }

      case 'groups.state':
        return { room: ROOM, driver_status: { working: true, pending_actions: pending } }

      case 'groups.log':
        return { events: [], has_more: false }

      case 'groups.settings.get':
        return { revision: 1, settings: {} }

      case 'groups.member_sessions':
        return { sessions: [] }

      case 'groups.live':
        return { current: null, watching: false }

      default:
        return {}
    }
  })

  return calls
}

beforeEach(() => {
  host.state = { connectionId: atom('local'), gateway: atom('open'), profile: atom('default') }
  host.requestProfile.mockReset()
  _resetCanonicalRoomSyncForTests()
  $groupChats.set({})
  $groupClarify.set({})
  $canonicalGroupBindings.set({ [KEY]: binding })
})

afterEach(() => {
  _resetCanonicalRoomSyncForTests()
  $groupClarify.set({})
})

describe('hosted member approvals', () => {
  it('mirror into the room prompt store as the approval card a Desktop room shows', async () => {
    script([approval, { kind: 'retry', task_id: 'task-9' }])
    await syncCanonicalRoom(KEY, binding)

    expect(Object.keys($groupClarify.get())).toEqual([CARD])
    expect($groupClarify.get()[CARD]).toMatchObject({
      choices: ['once', 'deny'],
      command: 'npm test',
      group: KEY,
      hostedAction: { executionGeneration: 2, memberId: 'alpha', taskId: 'task-1' },
      kind: 'approval',
      member: 'alpha',
      memberKey: 'alpha',
      question: 'Run the test suite?',
      requestId: 'req-1',
      sessionId: 'sess-a'
    })
    expect(groupHasPendingClarify($groupClarify.get(), KEY)).toBe(true)
  })

  it('keep the card object across syncs and drop it once the gateway stops reporting the request', async () => {
    script([approval])
    await syncCanonicalRoom(KEY, binding)
    const first = $groupClarify.get()[CARD]
    await syncCanonicalRoom(KEY, binding)
    expect($groupClarify.get()[CARD]).toBe(first)

    script([])
    await syncCanonicalRoom(KEY, binding)
    expect($groupClarify.get()).toEqual({})
  })

  it('answer through groups.approve with the exact action coordinates, then leave the room', async () => {
    const calls = script([approval])
    await syncCanonicalRoom(KEY, binding)
    const entry = $groupClarify.get()[CARD]

    await answerGroupClarify(entry, { name: 'alpha', connectionId: 'local' }, 'deny')

    expect(calls.find(([method]) => method === 'groups.approve')?.[1]).toMatchObject({
      choice: 'deny',
      execution_generation: 2,
      member_id: 'alpha',
      request_id: 'req-1',
      room_id: 'r1',
      task_id: 'task-1'
    })
    expect(calls.some(([method]) => method === 'approval.respond')).toBe(false)
    expect($groupClarify.get()).toEqual({})
  })

  it('go with the room when it is forgotten', async () => {
    script([approval])
    await syncCanonicalRoom(KEY, binding)
    forgetCanonicalRoom(KEY)
    expect($groupClarify.get()).toEqual({})
  })
})

describe('a hosted room log', () => {
  it('takes no local echo: the gateway is its store', async () => {
    script([])
    await syncCanonicalRoom(KEY, binding)
    const before = $groupChats.get()[KEY].log.length

    const entry = appendGroupChatEntry(KEY, { kind: 'user', name: 'You' }, 'once — npm test', 'legacy')

    expect(entry.text).toBe('once — npm test')
    expect($groupChats.get()[KEY].log).toHaveLength(before)
  })
})
