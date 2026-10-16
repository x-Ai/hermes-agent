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
vi.mock('./i18n', () => ({
  botsText: () => ({
    group: {
      canonicalActionFailed: (error: string) => `act:${error}`,
      canonicalAttachmentsUnsupported: (group: string) => `files:${group}`,
      canonicalSendFailed: (error: string) => `send:${error}`,
      routedAttachmentsBlocked: (group: string) => `blocked:${group}`
    }
  })
}))

import { $canonicalGroupBindings } from './canonical-group-registry'
import {
  canCreateCanonicalRoom,
  createCanonicalRoomWithSettings,
  disbandCanonicalRoom,
  renameCanonicalRoom,
  sendToCanonicalRoom,
  setCanonicalRoomSettings,
  stopCanonicalRoom
} from './canonical-room-actions'
import { _resetCanonicalRoomSyncForTests, syncCanonicalRoom } from './canonical-room-sync'
import { $groupChats } from './group-chat'
import { stopGroupThread } from './group-rounds'

const binding = { connectionId: 'local', profile: 'default', roomId: 'r1' }
const KEY = 'canonical:local:default:r1'

const ROOM = {
  room_id: 'r1',
  name: 'Release room',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta' }
  ]
}

function script(
  overrides: Record<string, (params: Record<string, unknown>) => unknown> = {},
  features = ['room_settings', 'member_sessions', 'room_live', 'activity_watch']
) {
  const calls: Array<[string, Record<string, unknown>]> = []
  host.requestProfile.mockImplementation(async (_route: unknown, method: string, params: Record<string, unknown>) => {
    calls.push([method, params])

    if (overrides[method]) {
      return overrides[method](params)
    }

    switch (method) {
      case 'groups.capabilities':
        return { driver: true, features, methods: [] }

      case 'groups.state':
        return { room: ROOM, driver_status: { working: false } }

      case 'groups.log':
        return { events: [], has_more: false }

      case 'groups.settings.get':
        return {
          revision: 1,
          settings: {
            workspace: null,
            member_workspaces: {},
            thread_workspaces: {},
            handle: null,
            hold_detection: true
          }
        }

      case 'groups.member_sessions':
        return { sessions: [] }

      case 'groups.live':
        return { current: null, watching: false }

      case 'groups.create':
        return { room: { ...ROOM, room_id: 'r2', name: String(params.name) } }

      default:
        return {}
    }
  })

  return calls
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

beforeEach(async () => {
  host.state = { connectionId: atom('local'), gateway: atom('open'), profile: atom('default') }
  host.notify.mockReset()
  host.requestProfile.mockReset()
  _resetCanonicalRoomSyncForTests()
  $groupChats.set({})
})

afterEach(() => {
  _resetCanonicalRoomSyncForTests()
})

describe('sendToCanonicalRoom', () => {
  it('shows the message at once, pins a thread folder first, then sends through the gateway', async () => {
    const calls = script()
    await syncCanonicalRoom(KEY, binding)
    const room = $groupChats.get()[KEY]

    const thread = sendToCanonicalRoom(KEY, room, '  hello  ', null, [], { workspace: '/srv/project' })
    expect(thread).toMatch(/[0-9a-f-]{36}/)
    const optimistic = $groupChats.get()[KEY].log.at(-1)
    expect(optimistic).toMatchObject({ from: { kind: 'user' }, text: 'hello', thread })

    await flush()
    await flush()
    const names = calls.map(([method]) => method)
    expect(names.indexOf('groups.settings.set')).toBeLessThan(names.indexOf('groups.send'))
    expect(calls.find(([method]) => method === 'groups.settings.set')?.[1]).toMatchObject({
      patch: { thread_workspaces: { [thread as string]: '/srv/project' } },
      room_id: 'r1'
    })
    expect(calls.find(([method]) => method === 'groups.send')?.[1]).toMatchObject({
      event_id: optimistic?.id,
      payload: { text: 'hello', thread_id: thread },
      room_id: 'r1'
    })
    expect(host.notify).not.toHaveBeenCalled()
  })

  it('continues an existing thread, and withdraws the entry with a notice when the gateway refuses', async () => {
    script({ 'groups.send': () => Promise.reject(new Error('room is full')) })
    await syncCanonicalRoom(KEY, binding)
    const room = $groupChats.get()[KEY]

    expect(sendToCanonicalRoom(KEY, room, 'again', 't1', [])).toBe('t1')
    expect($groupChats.get()[KEY].log.at(-1)?.text).toBe('again')
    await flush()
    await flush()
    expect($groupChats.get()[KEY].log.some(entry => entry.text === 'again')).toBe(false)
    expect(host.notify).toHaveBeenCalledWith({ kind: 'error', message: 'send:room is full' })
  })

  const picture = { data: 'data:image/png;base64,AAAA', kind: 'image' as const, name: 'a.png' }

  it('uploads attachments to the room, binds them to the send and retires the entry by its durable id', async () => {
    const calls = script(
      {
        'groups.attachment.upload': params => ({
          attachment_id: 'att_' + '1'.repeat(32),
          kind: params.kind,
          mime: params.mime,
          name: params.name,
          size: 3,
          sha256: 'x',
          state: 'uncommitted'
        }),
        'groups.send': params => ({ accepted: true, event: { event_id: `user:${params.event_id}`, seq: 1 } })
      },
      ['room_settings', 'member_sessions', 'room_live', 'activity_watch', 'room_attachments']
    )

    await syncCanonicalRoom(KEY, binding)
    const room = $groupChats.get()[KEY]

    const thread = sendToCanonicalRoom(KEY, room, 'look', null, [picture])
    expect(thread).toMatch(/[0-9a-f-]{36}/)
    // The picture shows at once, from the composer's own bytes.
    expect($groupChats.get()[KEY].log.at(-1)?.images).toEqual([picture])

    await flush()
    await flush()
    expect(calls.find(([method]) => method === 'groups.attachment.upload')?.[1]).toMatchObject({
      data_base64: 'AAAA',
      kind: 'image',
      mime: 'image/png',
      name: 'a.png',
      room_id: 'r1'
    })
    expect(calls.find(([method]) => method === 'groups.send')?.[1]).toMatchObject({
      payload: {
        attachments: [
          { attachment_id: 'att_' + '1'.repeat(32), kind: 'image', mime: 'image/png', name: 'a.png', size: 3 }
        ],
        text: 'look',
        thread_id: thread
      }
    })
    // The pending entry now carries the gateway's event id, so the log echo replaces it instead of doubling it.
    const send = calls.find(([method]) => method === 'groups.send')?.[1]
    const shown = $groupChats.get()[KEY].log.filter(entry => entry.text === 'look')
    expect(shown.map(entry => entry.id)).toEqual([`user:${send?.event_id}`])
    expect(host.notify).not.toHaveBeenCalled()
  })

  it('refuses attachments up front when a member runs on another machine', async () => {
    const calls = script({
      'groups.state': () => ({
        room: {
          ...ROOM,
          members: [...ROOM.members, { member_id: 'far', profile: 'far', handle: 'far', target: { kind: 'peer' } }]
        },
        driver_status: { working: false }
      })
    })

    await syncCanonicalRoom(KEY, binding)
    const room = $groupChats.get()[KEY]

    expect(sendToCanonicalRoom(KEY, room, 'look', null, [picture])).toBeNull()
    expect(host.notify).toHaveBeenCalledWith({ kind: 'error', message: 'files:Release room' })
    expect(calls.some(([method]) => method === 'groups.send' || method === 'groups.attachment.upload')).toBe(false)
  })

  it('withdraws the entry when the gateway does not carry room attachments', async () => {
    const calls = script()
    await syncCanonicalRoom(KEY, binding)
    const room = $groupChats.get()[KEY]

    expect(sendToCanonicalRoom(KEY, room, '', null, [picture])).toMatch(/[0-9a-f-]{36}/)
    await flush()
    await flush()
    expect($groupChats.get()[KEY].log.some(entry => entry.images?.length)).toBe(false)
    expect(host.notify).toHaveBeenCalledWith({ kind: 'error', message: 'send:files:Release room' })
    expect(calls.some(([method]) => method === 'groups.send')).toBe(false)
  })
})

describe('room mutations', () => {
  it('stop, rename and settings go to the gateway and refresh the projection', async () => {
    let name = ROOM.name

    const calls = script({
      'groups.rename': params => {
        name = String(params.name)

        return { room: { ...ROOM, name } }
      },
      'groups.state': () => ({ room: { ...ROOM, name }, driver_status: { working: false } })
    })

    await syncCanonicalRoom(KEY, binding)
    const room = $groupChats.get()[KEY]

    await stopGroupThread(KEY, 't1')
    expect(calls.find(([method]) => method === 'groups.stop')?.[1]).toMatchObject({ room_id: 'r1' })

    expect(await renameCanonicalRoom(KEY, room, 'Renamed')).toBe(true)
    expect(calls.find(([method]) => method === 'groups.rename')?.[1]).toMatchObject({ name: 'Renamed', room_id: 'r1' })
    expect($groupChats.get()[KEY].displayName).toBe('Renamed')

    expect(await setCanonicalRoomSettings(KEY, room, { handle: 'release', workspace: '/srv/room' })).toBe(true)
    expect(calls.find(([method]) => method === 'groups.settings.set')?.[1]).toMatchObject({
      patch: { handle: 'release', workspace: '/srv/room' },
      room_id: 'r1'
    })
    expect(await stopCanonicalRoom(KEY, room, null)).toBeUndefined()
    expect(host.notify).not.toHaveBeenCalled()
  })

  it('a refused rename is reported and leaves the dialog to the caller', async () => {
    script({ 'groups.rename': () => Promise.reject(new Error('taken')) })
    await syncCanonicalRoom(KEY, binding)

    expect(await renameCanonicalRoom(KEY, $groupChats.get()[KEY], 'Other')).toBe(false)
    expect(host.notify).toHaveBeenCalledWith({ kind: 'error', message: 'act:taken' })
  })

  it('disband removes the projection and the binding once the gateway agrees', async () => {
    const calls = script()
    await syncCanonicalRoom(KEY, binding)
    $canonicalGroupBindings.set({ [KEY]: binding })

    expect(await disbandCanonicalRoom(KEY, $groupChats.get()[KEY])).toBe(true)
    expect(calls.find(([method]) => method === 'groups.disband')?.[1]).toMatchObject({ room_id: 'r1' })
    expect($groupChats.get()[KEY]).toBeUndefined()
    expect($canonicalGroupBindings.get()[KEY]).toBeUndefined()
  })
})

describe('creation', () => {
  const route = { connectionId: 'local', profile: 'default' }

  const members = [
    { name: 'alpha', connectionId: 'local', handle: 'alpha' },
    { name: 'beta', connectionId: 'local', handle: 'beta' }
  ]

  it('needs two same-connection members and a gateway with room settings', async () => {
    script()
    expect(await canCreateCanonicalRoom(route, members)).toBe(true)
    expect(await canCreateCanonicalRoom(route, [members[0]])).toBe(false)
    expect(await canCreateCanonicalRoom(route, [members[0], { name: 'far', connectionId: 'other' }])).toBe(false)
    expect(await canCreateCanonicalRoom(route, [members[0], { name: 'far', remoteSource: true }])).toBe(false)
    _resetCanonicalRoomSyncForTests()
    script({}, ['room_identity'])
    expect(await canCreateCanonicalRoom(route, members)).toBe(false)
  })

  it('creates the room, applies the handle and folder, and projects it', async () => {
    const calls = script({
      'groups.state': () => ({ room: { ...ROOM, room_id: 'r2', name: 'Fresh' }, driver_status: {} })
    })

    const key = await createCanonicalRoomWithSettings(route, 'Fresh', members, {
      handle: 'fresh',
      workspace: '/srv/fresh'
    })

    expect(key).toBe('canonical:local:default:r2')
    expect(calls.find(([method]) => method === 'groups.create')?.[1]).toMatchObject({
      members: [
        { handle: 'alpha', member_id: 'alpha', profile: 'alpha', target: { kind: 'local', profile: 'alpha' } },
        { handle: 'beta', member_id: 'beta', profile: 'beta', target: { kind: 'local', profile: 'beta' } }
      ],
      name: 'Fresh'
    })
    expect(calls.find(([method]) => method === 'groups.settings.set')?.[1]).toMatchObject({
      patch: { handle: 'fresh', workspace: '/srv/fresh' },
      room_id: 'r2'
    })
    expect($canonicalGroupBindings.get()[key]).toEqual({ ...route, roomId: 'r2', roomName: 'Fresh' })
    expect($groupChats.get()[key]?.displayName).toBe('Fresh')
  })
})
