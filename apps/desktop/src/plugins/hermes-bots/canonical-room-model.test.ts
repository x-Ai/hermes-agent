import { describe, expect, it } from 'vitest'

import {
  canonicalActivityFromEvent,
  canonicalEntryFromEvent,
  canonicalRoomMembers,
  projectCanonicalRoom
} from './canonical-room-model'

const binding = { connectionId: 'local', profile: 'default', roomId: 'r1' }

const room = {
  room_id: 'r1',
  name: 'Release room',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha', display_name: 'Alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta-bot', target: { kind: 'peer', profile: 'beta' } }
  ]
}

const members = canonicalRoomMembers(room, binding)

const user = {
  seq: 1,
  event_id: 'e1',
  kind: 'message.user',
  created_at: 1_700_000_000,
  payload: { text: 'Hello', thread_id: 't1' }
}

const reply = {
  seq: 2,
  event_id: 'e2',
  kind: 'message.member',
  created_at: 1_700_000_001,
  payload: { text: 'Hi', thread_id: 't1', member_id: 'alpha', turn_id: 'turn-1' }
}

describe('canonicalRoomMembers', () => {
  it('seats local members on the binding connection and peers as remote', () => {
    expect(members).toEqual([
      {
        name: 'alpha',
        handle: 'alpha',
        title: 'Alpha',
        display_name: 'Alpha',
        targetProfile: 'alpha',
        connectionId: 'local'
      },
      { name: 'beta', handle: 'beta-bot', title: null, targetProfile: 'beta', remoteSource: true }
    ])
  })
})

describe('canonicalEntryFromEvent', () => {
  it('maps user and member messages onto log entries with their thread and the recorded trace', () => {
    const trace = { steps: [{ kind: 'text' as const, text: 'thinking' }] }
    expect(canonicalEntryFromEvent(user, members)).toEqual({
      at: 1_700_000_000_000,
      from: { kind: 'user', name: 'You' },
      id: 'e1',
      text: 'Hello',
      thread: 't1'
    })
    expect(canonicalEntryFromEvent(reply, members, { 'turn-1': trace })).toEqual({
      at: 1_700_000_001_000,
      from: { kind: 'member', name: 'alpha' },
      id: 'e2',
      text: 'Hi',
      thread: 't1',
      trace
    })
    expect(canonicalEntryFromEvent({ seq: 3, kind: 'turn.settled', payload: {} }, members)).toBeNull()
  })
})

describe('canonicalActivityFromEvent', () => {
  it('speaks the legacy activity vocabulary', () => {
    const at = (kind: string, payload: Record<string, unknown>) =>
      canonicalActivityFromEvent({ seq: 9, kind, payload }, members)

    expect(at('turn.settled', { member_id: 'alpha', thread_id: 't1', passed: true })).toEqual({
      kind: 'passed',
      member: 'alpha',
      thread: 't1'
    })
    expect(at('turn.settled', { member_id: 'alpha', thread_id: 't1' })).toEqual({
      kind: 'replied',
      member: 'alpha',
      thread: 't1'
    })
    expect(at('turn.failed', { member_id: 'beta', thread_id: 't1', error: 'boom' })).toEqual({
      kind: 'failed',
      member: 'beta',
      reason: 'boom',
      thread: 't1'
    })
    expect(at('room.activity', { status: 'bounded', thread_id: 't1' })).toEqual({
      kind: 'capped',
      member: null,
      thread: 't1'
    })
    expect(at('room.stop_requested', { cancel_id: 'c' })).toEqual({ kind: 'stopped', member: 'You', thread: null })
    expect(at('message.user', { text: 'x' })).toBeNull()
  })
})

describe('projectCanonicalRoom', () => {
  const settings = {
    workspace: '/srv/room',
    member_workspaces: { beta: '/srv/beta' },
    thread_workspaces: { t1: '/srv/t1' },
    handle: 'release',
    hold_detection: false
  }

  it('builds the room record the legacy surfaces read, keeping local preferences', () => {
    const projection = projectCanonicalRoom({
      binding,
      events: [user, reply],
      live: { member_id: 'beta', status: 'running', task_id: 'task', thread_id: 't1', turn_id: 'turn-2' },
      pending: [
        { at: 5, from: { kind: 'user', name: 'You' }, id: 'e1', text: 'Hello', thread: 't1' },
        { at: 6, from: { kind: 'user', name: 'You' }, id: 'e9', text: 'Still sending', thread: 't2' }
      ],
      previous: { image: 'data:x', log: [], pinned: true, sectionId: 'sec', watermarks: {} },
      room,
      sessions: [
        { local: true, member_id: 'alpha', profile: 'alpha', session_id: 'sid-alpha' },
        { local: true, member_id: 'beta', profile: 'beta', session_id: null }
      ],
      settings,
      working: false
    })

    expect(projection.canonical).toEqual(binding)
    expect(projection.displayName).toBe('Release room')
    expect(projection.roomId).toBe('r1')
    expect(projection.log.map(entry => [entry.id, entry.thread])).toEqual([
      ['e1', 't1'],
      ['e2', 't1'],
      ['e9', 't2']
    ])
    expect(projection.running).toBe(true)
    expect(projection.turn?.name).toBe('beta')
    expect(projection.handle).toBe('release')
    expect(projection.workspace).toBe('/srv/room')
    expect(projection.memberWorkspaces).toEqual({ beta: '/srv/beta' })
    expect(projection.threadWorkspaces).toEqual({ t1: '/srv/t1' })
    expect(projection.holdDetection).toBe(false)
    expect(projection.sessions).toEqual({ alpha: 'sid-alpha' })
    expect(projection.image).toBe('data:x')
    expect(projection.pinned).toBe(true)
    expect(projection.sectionId).toBe('sec')
    expect(projection.tombstone).toBe(false)
  })

  it('defaults without settings, idles without work, and tombstones a disbanded room', () => {
    const projection = projectCanonicalRoom({
      binding,
      events: [],
      room: { ...room, disbanded_at: 1 },
      working: false
    })

    expect(projection.running).toBe(false)
    expect(projection.turn).toBeNull()
    expect(projection.holdDetection).toBe(true)
    expect(projection.handle).toBeNull()
    expect(projection.sessions).toEqual({})
    expect(projection.tombstone).toBe(true)
  })
})
