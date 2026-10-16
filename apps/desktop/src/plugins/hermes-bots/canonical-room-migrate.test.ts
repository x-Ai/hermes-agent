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
      canonicalActionFailed: (error: string) => error,
      canonicalSendFailed: (error: string) => error,
      legacyRoomName: (name: string) => `${name} (Desktop)`,
      routedAttachmentsBlocked: (group: string) => group
    }
  }),
  useBots: () => ({})
}))

import { canHostRoomOnGateway, hostRoomOnGateway } from './canonical-room-migrate'
import { _resetCanonicalRoomSyncForTests } from './canonical-room-sync'
import { $groupChats, type GroupChatRoom } from './group-chat'
import type { GroupMember } from './types'

const members: GroupMember[] = [
  { name: 'alpha', connectionId: 'local' },
  { name: 'beta', connectionId: 'local' }
]

const ROOM = {
  room_id: 'r2',
  name: 'Release room',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta' }
  ]
}

function script(features = ['room_settings', 'member_sessions', 'room_live', 'activity_watch']) {
  const calls: Array<[string, Record<string, unknown>]> = []
  host.requestProfile.mockImplementation(async (_route: unknown, method: string, params: Record<string, unknown>) => {
    calls.push([method, params])

    switch (method) {
      case 'groups.capabilities':
        return { driver: true, features, methods: [] }

      case 'groups.create':
        return { room: { ...ROOM, name: String(params.name) } }

      case 'groups.state':
        return { room: ROOM, driver_status: { working: false } }

      case 'groups.log':
        return { events: [], has_more: false }

      case 'groups.settings.get':
        return {
          revision: 1,
          settings: {
            workspace: '/srv/room',
            member_workspaces: { alpha: '/srv/alpha' },
            thread_workspaces: {},
            handle: 'rel',
            hold_detection: false
          }
        }

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

const desktopRoom = (): GroupChatRoom => ({
  handle: 'rel',
  holdDetection: false,
  image: 'data:img',
  log: [],
  memberWorkspaces: { alpha: '/srv/alpha' },
  members,
  pinned: true,
  running: false,
  sectionId: 's1',
  watermarks: {},
  workspace: '/srv/room'
})

beforeEach(() => {
  host.state = { connectionId: atom('local'), gateway: atom('open'), profile: atom('default') }
  host.requestProfile.mockReset()
  _resetCanonicalRoomSyncForTests()
  $groupChats.set({})
})

afterEach(() => {
  _resetCanonicalRoomSyncForTests()
})

describe('hostRoomOnGateway', () => {
  it('creates the hosted room with the Desktop room settings, moves the row preferences over and steps the old room aside', async () => {
    const calls = script()
    $groupChats.set({ 'Release room': desktopRoom() })
    const rename = vi.fn(async (_old: string, next: string) => next)

    const key = await hostRoomOnGateway('Release room', $groupChats.get()['Release room'], members, { rename })

    expect(key).toBe('canonical:local:default:r2')
    expect(calls.find(([method]) => method === 'groups.create')?.[1]).toMatchObject({ name: 'Release room' })
    expect(calls.find(([method]) => method === 'groups.settings.set')?.[1]).toMatchObject({
      patch: {
        handle: 'rel',
        hold_detection: false,
        member_workspaces: { alpha: '/srv/alpha' },
        workspace: '/srv/room'
      },
      room_id: 'r2'
    })
    expect($groupChats.get()[key]).toMatchObject({
      canonical: { roomId: 'r2' },
      displayName: 'Release room',
      handle: 'rel',
      holdDetection: false,
      image: 'data:img',
      pinned: true,
      sectionId: 's1',
      workspace: '/srv/room'
    })
    // One tag routes to one room: the Desktop room gave up the handle and the name.
    expect($groupChats.get()['Release room'].handle ?? null).toBeNull()
    expect(rename).toHaveBeenCalledWith('Release room', 'Release room (Desktop)', members)
  })

  it('picks a free name for the Desktop room when the suffixed one is taken', async () => {
    script()
    $groupChats.set({
      'Release room': desktopRoom(),
      'Release room (Desktop)': { log: [], running: false, watermarks: {} }
    })
    const rename = vi.fn(async (_old: string, next: string) => next)

    await hostRoomOnGateway('Release room', $groupChats.get()['Release room'], members, { rename })

    expect(rename).toHaveBeenCalledWith('Release room', 'Release room (Desktop) 2', members)
  })

  it('leaves the Desktop room untouched when the gateway refuses the room', async () => {
    script()
    host.requestProfile.mockImplementation(async (_route: unknown, method: string) => {
      if (method === 'groups.capabilities') {
        return { driver: true, features: ['room_settings'], methods: [] }
      }

      throw new Error('room limit reached')
    })
    $groupChats.set({ 'Release room': desktopRoom() })
    const rename = vi.fn(async (_old: string, next: string) => next)

    await expect(
      hostRoomOnGateway('Release room', $groupChats.get()['Release room'], members, { rename })
    ).rejects.toThrow('room limit reached')

    expect($groupChats.get()['Release room'].handle).toBe('rel')
    expect(rename).not.toHaveBeenCalled()
    expect(Object.keys($groupChats.get())).toEqual(['Release room'])
  })
})

describe('canHostRoomOnGateway', () => {
  it('offers hosting for a Desktop room the active gateway can seat, and for nothing else', async () => {
    script()
    expect(await canHostRoomOnGateway(desktopRoom(), members)).toBe(true)
    expect(
      await canHostRoomOnGateway(
        { ...desktopRoom(), canonical: { connectionId: 'local', profile: 'default', roomId: 'r9' } },
        members
      )
    ).toBe(false)
    expect(await canHostRoomOnGateway(desktopRoom(), [members[0], { name: 'far', connectionId: 'other' }])).toBe(false)
    host.state = { connectionId: atom(null), gateway: atom('open'), profile: atom('default') }
    expect(await canHostRoomOnGateway(desktopRoom(), members)).toBe(false)
  })

  it('is withheld when the gateway hosts no room settings', async () => {
    script(['room_identity'])
    expect(await canHostRoomOnGateway(desktopRoom(), members)).toBe(false)
  })
})
