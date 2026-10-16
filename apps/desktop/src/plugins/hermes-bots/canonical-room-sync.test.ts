import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Listener = (event: { payload?: unknown; session_id?: string; type?: string }) => void

const { host, listeners } = vi.hoisted(() => {
  const listeners = new Map<string, Set<Listener>>()

  return {
    host: {
      notify: vi.fn(),
      onEvent: (type: string, listener: Listener) => {
        const set = listeners.get(type) ?? new Set<Listener>()
        set.add(listener)
        listeners.set(type, set)

        return () => {
          set.delete(listener)
        }
      },
      request: vi.fn(),
      requestProfile: vi.fn(),
      state: {} as Record<string, unknown>
    },
    listeners
  }
})

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

import { $canonicalGroupBindings } from './canonical-group-registry'
import {
  _resetCanonicalRoomPrefsForTests,
  canonicalRoomPrefs,
  rememberCanonicalRoomPrefs
} from './canonical-room-prefs'
import {
  _resetCanonicalRoomSyncForTests,
  discoverCanonicalRooms,
  forgetCanonicalRoom,
  hydrateCanonicalRoomPrefs,
  notePendingCanonicalSend,
  startCanonicalRoomViewer,
  syncCanonicalRoom
} from './canonical-room-sync'
import { $groupActivity } from './group-activity'
import { $groupChats, setGroupChatImage } from './group-chat'
import { $groupLiveTraces } from './group-trace-live'

const binding = { connectionId: 'local', profile: 'default', roomId: 'r1' }
const KEY = 'canonical:local:default:r1'

const ROOM = {
  room_id: 'r1',
  name: 'Release room',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha', display_name: 'Alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta' }
  ]
}

function emit(type: string, payload: unknown) {
  for (const listener of listeners.get(type) ?? []) {
    listener({ payload, type })
  }
}

function script(options: { events?: Array<Record<string, unknown>>; working?: boolean; live?: unknown } = {}) {
  const events = options.events ?? [
    { seq: 1, event_id: 'e1', kind: 'message.user', created_at: 1, payload: { text: 'Hello', thread_id: 't1' } },
    {
      seq: 2,
      event_id: 'e2',
      kind: 'message.member',
      created_at: 2,
      payload: { text: 'Hi', thread_id: 't1', member_id: 'alpha', turn_id: 'turn-1' }
    },
    {
      seq: 3,
      event_id: 'e3',
      kind: 'turn.failed',
      created_at: 3,
      payload: { member_id: 'beta', thread_id: 't1', error: 'boom' }
    }
  ]

  const calls: Array<[string, Record<string, unknown>]> = []
  host.requestProfile.mockImplementation(async (_route: unknown, method: string, params: Record<string, unknown>) => {
    calls.push([method, params])

    switch (method) {
      case 'groups.capabilities':
        return {
          driver: true,
          features: ['room_identity', 'room_settings', 'member_sessions', 'room_live', 'activity_watch'],
          methods: []
        }

      case 'groups.state':
        return { room: ROOM, driver_status: { working: options.working ?? false } }

      case 'groups.log':
        return { events: events.filter(event => Number(event.seq) > Number(params.since_seq || 0)), has_more: false }

      case 'groups.settings.get':
        return {
          revision: 2,
          settings: {
            workspace: '/srv/room',
            member_workspaces: { beta: '/srv/beta' },
            thread_workspaces: {},
            handle: 'release',
            hold_detection: false
          }
        }

      case 'groups.member_sessions':
        return {
          sessions: [
            { member_id: 'alpha', profile: 'alpha', local: true, session_id: 'sid-alpha' },
            { member_id: 'beta', profile: 'beta', local: true, session_id: null }
          ]
        }

      case 'groups.live':
        return { current: options.live ?? null, watching: false }

      case 'groups.watch':
        return { room_id: 'r1', watching: params.on !== false }

      case 'groups.list':
        return { rooms: [ROOM], next_offset: null }

      default:
        throw new Error(`unexpected ${method}`)
    }
  })

  return calls
}

beforeEach(() => {
  host.state = { connectionId: atom('local'), gateway: atom('open'), profile: atom('default') }
  _resetCanonicalRoomSyncForTests()
  $groupChats.set({})
  $groupActivity.set({})
  $groupLiveTraces.set({})
  listeners.clear()
  host.requestProfile.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  _resetCanonicalRoomSyncForTests()
})

describe('syncCanonicalRoom', () => {
  it('projects the gateway room into the room store with settings, sessions and activity', async () => {
    const calls = script()
    await syncCanonicalRoom(KEY, binding)

    const room = $groupChats.get()[KEY]
    expect(room.canonical).toEqual(binding)
    expect(room.displayName).toBe('Release room')
    expect(room.roomId).toBe('r1')
    expect(room.members?.map(member => [member.name, member.title])).toEqual([
      ['alpha', 'Alpha'],
      ['beta', null]
    ])
    expect(room.log.map(entry => [entry.from.kind, entry.text, entry.thread])).toEqual([
      ['user', 'Hello', 't1'],
      ['member', 'Hi', 't1']
    ])
    expect(room.handle).toBe('release')
    expect(room.workspace).toBe('/srv/room')
    expect(room.memberWorkspaces).toEqual({ beta: '/srv/beta' })
    expect(room.holdDetection).toBe(false)
    expect(room.sessions).toEqual({ alpha: 'sid-alpha' })
    expect(room.running).toBe(false)
    const kinds = ($groupActivity.get()[KEY]?.events || []).map(event => [event.kind, event.member, event.reason])
    // Message events are log entries; terminal events feed the activity list.
    expect(kinds).toEqual([['failed', 'beta', 'boom']])
    expect(calls.map(([method]) => method)).toEqual([
      'groups.capabilities',
      'groups.state',
      'groups.log',
      'groups.settings.get',
      'groups.member_sessions',
      'groups.live'
    ])

    // Every request rode the room's authority, never the foreground gateway.
    for (const call of host.requestProfile.mock.calls) {
      expect(call[0]).toMatchObject({ connectionId: 'local', profile: 'default', targetProfile: 'default' })
      expect(call[2].profile).toBe('default')
    }

    expect(host.request).not.toHaveBeenCalled()
  })

  it('reads the log incrementally and drops an optimistic send once the gateway echoes it', async () => {
    const events = [
      { seq: 1, event_id: 'e1', kind: 'message.user', created_at: 1, payload: { text: 'Hello', thread_id: 't1' } }
    ]

    const calls = script({ events })
    await syncCanonicalRoom(KEY, binding)
    notePendingCanonicalSend(KEY, {
      at: 5,
      from: { kind: 'user', name: 'You' },
      id: 'e9',
      text: 'Pending',
      thread: 't2'
    })
    expect($groupChats.get()[KEY].log.map(entry => entry.id)).toEqual(['e1', 'e9'])

    events.push({
      seq: 2,
      event_id: 'e9',
      kind: 'message.user',
      created_at: 6,
      payload: { text: 'Pending', thread_id: 't2' }
    })
    await syncCanonicalRoom(KEY, binding)
    expect($groupChats.get()[KEY].log.map(entry => entry.id)).toEqual(['e1', 'e9'])
    const logReads = calls.filter(([method]) => method === 'groups.log').map(([, params]) => params.since_seq)
    expect(logReads).toEqual([0, 1])
  })

  it('names the working member from the live turn and from activity frames between polls', async () => {
    script({
      live: { member_id: 'beta', status: 'running', task_id: 'task', thread_id: 't1', turn_id: 'turn-2' },
      working: true
    })
    await syncCanonicalRoom(KEY, binding)
    expect($groupChats.get()[KEY].running).toBe(true)
    expect($groupChats.get()[KEY].turn?.name).toBe('beta')
  })
})

describe('startCanonicalRoomViewer', () => {
  it('watches the room while a view is up, polls its log, and routes activity frames into the live trace', async () => {
    vi.useFakeTimers()
    const calls = script()
    const stop = startCanonicalRoomViewer(KEY, binding)
    await vi.advanceTimersByTimeAsync(0)
    await vi.waitFor(() => expect(calls.some(([method]) => method === 'groups.state')).toBe(true))
    expect(calls.find(([method]) => method === 'groups.watch')?.[1]).toMatchObject({ on: true, room_id: 'r1' })

    emit('room.activity', {
      kind: 'tool.started',
      member_id: 'alpha',
      payload: { tool_id: 'c1', name: 'terminal' },
      room_id: 'r1',
      session_id: 'sid-alpha',
      thread_id: 't1',
      turn_id: 'turn-2'
    })
    expect($groupLiveTraces.get()[`${KEY}::alpha`]?.steps.map(step => step.kind)).toEqual(['tool'])
    expect($groupChats.get()[KEY].turn?.name).toBe('alpha')

    const stateReads = () => calls.filter(([method]) => method === 'groups.state').length
    const before = stateReads()
    await vi.advanceTimersByTimeAsync(2100)
    expect(stateReads()).toBeGreaterThan(before)

    stop()
    await vi.advanceTimersByTimeAsync(0)
    expect(calls.filter(([method]) => method === 'groups.watch').at(-1)?.[1]).toMatchObject({ on: false })
    expect($groupLiveTraces.get()[`${KEY}::alpha`]).toBeUndefined()
  })
})

describe('discoverCanonicalRooms', () => {
  it('registers and projects every room the gateway lists', async () => {
    script()
    const keys = await discoverCanonicalRooms({ connectionId: 'local', profile: 'default' })
    expect(keys).toEqual([KEY])
    expect($canonicalGroupBindings.get()[KEY]).toEqual({ ...binding, roomName: 'Release room' })
    expect($groupChats.get()[KEY].displayName).toBe('Release room')
  })
})

describe('row preferences of a hosted room', () => {
  beforeEach(() => {
    _resetCanonicalRoomPrefsForTests()
  })

  it('seed a room projected for the first time this window, and follow its record from then on', async () => {
    script()
    rememberCanonicalRoomPrefs(KEY, { image: 'data:img', pinned: true, sectionId: 's1' })
    await syncCanonicalRoom(KEY, binding)
    expect($groupChats.get()[KEY]).toMatchObject({ image: 'data:img', pinned: true, sectionId: 's1' })

    setGroupChatImage(KEY, 'data:next')
    expect(canonicalRoomPrefs(KEY)?.image).toBe('data:next')

    forgetCanonicalRoom(KEY)
    expect(canonicalRoomPrefs(KEY)).toBeNull()
  })

  it('reach a room projected before they were loaded', async () => {
    script()
    await syncCanonicalRoom(KEY, binding)
    expect($groupChats.get()[KEY].image ?? null).toBeNull()

    hydrateCanonicalRoomPrefs({ [KEY]: { image: 'data:img', sectionId: 's1' } })

    expect($groupChats.get()[KEY]).toMatchObject({ image: 'data:img', sectionId: 's1' })
    // A later sync keeps them: the record is now the projection's "previous".
    await syncCanonicalRoom(KEY, binding)
    expect($groupChats.get()[KEY]).toMatchObject({ image: 'data:img', sectionId: 's1' })
  })
})
