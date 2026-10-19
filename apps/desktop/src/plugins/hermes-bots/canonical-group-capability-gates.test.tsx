import type * as HermesSdk from '@hermes/plugin-sdk'
import { host } from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { WritableAtom } from 'nanostores'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { CANONICAL_GROUP_LOCALES } from './canonical-group-locales'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { _resetCanonicalRoomSyncForTests } from './canonical-room-sync'
import { CreateGroupChatDialog } from './create-dialog'
import { $botMeta } from './data'
import { $groupChats, $groupChatWorkspace, updateGroupChat } from './group-chat'
import type * as GroupChatModule from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { translateBots } from './i18n-test-helper'

const { request, notify, openWorkspace, activation } = vi.hoisted(() => ({
  request: vi.fn(),
  notify: vi.fn(),
  openWorkspace: vi.fn(),
  activation: { epoch: 1 }
}))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()
  const { en } = await import('@/i18n/en')

  return {
    ...sdk,
    gatewayActivationEpoch: () => activation.epoch,
    host: {
      ...sdk.host,
      requestProfile: request,
      notify,
      openWorkspace,
      request: (method: string, params?: Record<string, unknown>) => request(null, method, params),
      connections: vi.fn(async () => []),
      state: {
        ...sdk.host.state,
        connectionId: sdk.atom<string | null>('local'),
        profile: sdk.atom('default'),
        gateway: sdk.atom('open')
      }
    },
    useI18n: () => ({ locale: 'en', t: en }),
    usePluginI18n: () => translateBots
  }
})
vi.mock('./canonical-group-workspace', () => ({
  CanonicalGroupWorkspace: () => <div data-testid="canonical-group-workspace" />
}))
vi.mock('./group-chat', async importOriginal => {
  const actual = await importOriginal<typeof GroupChatModule>()

  return {
    ...actual,
    // Keep actual local creation, but do not schedule the unrelated remote mirror.
    updateGroupChat: vi.fn((group, mutate) => actual.updateGroupChat(group, mutate, { sync: false }))
  }
})
vi.mock('./group-chat-parts', async importOriginal => ({
  ...(await importOriginal<typeof GroupChatParts>()),
  // Avatar generation is unrelated to the capability decision; never request a model.
  GroupImageControls: () => null
}))

const state = {
  connectionId: host.state.connectionId as WritableAtom<string | null>,
  profile: host.state.profile as WritableAtom<string>,
  gateway: host.state.gateway as WritableAtom<string>
}

const roster = [
  { name: 'alpha', connectionId: 'local' },
  { name: 'beta', connectionId: 'local' }
]

const unavailable = CANONICAL_GROUP_LOCALES.en.driverUnavailable

// Decision-relevant fields emitted by the actual canonical capabilities producer.
const canonicalUnavailable = {
  driver: false,
  persistent_process: true,
  features: ['room_identity', 'monotonic_log', 'replayable_disband']
}

// App-managed hosted capabilities keep their protocol/authority when the driver stops.
// Their RoomLink catalog deliberately reports persistent_process:false.
const appManagedUnavailable = {
  driver: false,
  persistent_process: false,
  protocol_version: 2,
  authority_gateway_id: 'installation:app-managed',
  features: ['authority_epoch', 'coordinator_fencing', 'room_identity', 'monotonic_log'],
  methods: ['groups.capabilities', 'groups.create', 'groups.state', 'groups.send']
}

const legacy = { driver: false, persistent_process: false }

beforeEach(() => {
  _resetCanonicalRoomSyncForTests()
  activation.epoch = 1
  state.connectionId.set('local')
  state.profile.set('default')
  state.gateway.set('open')
  $canonicalGroupBindings.set({})
  $groupChats.set({})
  $groupChatWorkspace.set(null)
  $botMeta.set({})
  request.mockReset()
  notify.mockReset()
  openWorkspace.mockReset().mockReturnValue(() => undefined)
  vi.mocked(updateGroupChat).mockClear()
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
})
afterEach(() => {
  cleanup()
  $groupChats.set({})
  localStorage.clear()
  vi.restoreAllMocks()
})

function answer(capabilities: unknown) {
  request.mockImplementation(async (_route, method, params) => {
    if (method === 'groups.capabilities') {
      return capabilities
    }

    if (method === 'groups.create') {
      return { room: { room_id: params.room_id, name: params.name, members: params.members } }
    }

    if (method === 'profiles.configure') {
      return {}
    }

    throw new Error(`Unexpected RPC: ${method}`)
  })
}

async function submitDialog() {
  const onCreated = vi.fn()
  const onClose = vi.fn()
  render(<CreateGroupChatDialog onClose={onClose} onCreated={onCreated} open roster={roster} />)

  for (const checkbox of screen.getAllByRole('checkbox')) {
    fireEvent.click(checkbox)
  }

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create Group (2)' }))
  })

  return { onCreated, onClose }
}

// Fork contract (differs from upstream's version of this file on purpose): a Desktop room is the
// legacy workspace whatever the gateway's group driver reports, New group chat creates a Desktop
// room, and only a canonical binding renders the canonical view. The fork's room features
// (room/member folders, @handle, the folded trace, context chips) live on the Desktop room; upstream
// gates both surfaces on groups.capabilities and offers a gateway-owned group instead.
const reported = [canonicalUnavailable, appManagedUnavailable, legacy, { driver: true, persistent_process: true }, null]

it.each(reported)('a Desktop room renders the legacy workspace when the gateway reports %j', async value => {
  answer(value)
  await act(async () => {
    render(<GroupChatWorkspace group="Existing" members={roster} />)
  })
  expect(screen.getByRole('textbox')).toBeTruthy()
  expect(screen.queryByText(unavailable)).toBeNull()
  expect(screen.queryByTestId('canonical-group-workspace')).toBeNull()
  expect(request.mock.calls.filter(call => call[1] === 'groups.capabilities')).toHaveLength(0)
})

it.each([legacy, { driver: true, persistent_process: true }])(
  'New group chat creates a Desktop room when the gateway reports %j (no room settings)',
  async value => {
    answer(value)
    const { onCreated } = await submitDialog()
    expect(onCreated).toHaveBeenCalledOnce()
    expect(updateGroupChat).toHaveBeenCalledOnce()
    expect(Object.keys($groupChats.get())).toHaveLength(1)
    expect($canonicalGroupBindings.get()).toEqual({})
    // The dialog asks what the gateway can host, and settles on a Desktop room without groups.create.
    expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  }
)

it('New group chat creates a gateway-hosted room, with the handle and folder on the gateway, when it hosts room settings', async () => {
  request.mockImplementation(async (_route, method, params) => {
    switch (method) {
      case 'groups.capabilities':
        return {
          driver: true,
          features: ['room_settings', 'member_sessions', 'room_live', 'activity_watch'],
          methods: []
        }

      case 'groups.create':
        return { room: { room_id: 'hosted-1', name: params.name, members: params.members } }

      case 'groups.settings.set':
        return { room_id: 'hosted-1', revision: 1, settings: params.patch }

      case 'groups.state':
        return {
          room: { room_id: 'hosted-1', name: params.name || 'Alpha, Beta', members: [] },
          driver_status: { working: false }
        }

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

      case 'profiles.configure':
        return {}

      default:
        throw new Error(`Unexpected RPC: ${method}`)
    }
  })
  const { onCreated } = await submitDialog()
  await act(async () => {
    await Promise.resolve()
  })
  expect(onCreated).toHaveBeenCalledWith('canonical:local:default:hosted-1', 'key')
  expect(request.mock.calls.find(call => call[1] === 'groups.create')?.[2]).toMatchObject({
    members: [
      { handle: 'alpha', member_id: 'alpha', profile: 'alpha' },
      { handle: 'beta', member_id: 'beta', profile: 'beta' }
    ]
  })
  expect($canonicalGroupBindings.get()['canonical:local:default:hosted-1']).toMatchObject({
    connectionId: 'local',
    profile: 'default',
    roomId: 'hosted-1'
  })
  expect($groupChats.get()['canonical:local:default:hosted-1']?.canonical?.roomId).toBe('hosted-1')
  // Nothing was written as a Desktop room.
  expect(Object.keys($groupChats.get()).filter(name => !name.startsWith('canonical:'))).toEqual([])
})

it('a hosted room renders the Desktop room view, fed by the gateway it is bound to', async () => {
  const key = 'canonical:local:default:r1'
  $canonicalGroupBindings.set({ [key]: { connectionId: 'local', profile: 'default', roomId: 'r1' } })
  request.mockImplementation(async (_route, method, params) => {
    switch (method) {
      case 'groups.capabilities':
        return {
          driver: true,
          features: ['room_settings', 'member_sessions', 'room_live', 'activity_watch'],
          methods: []
        }

      case 'groups.state':
        return {
          room: {
            room_id: 'r1',
            name: 'Gateway room',
            members: [{ member_id: 'alpha', profile: 'alpha', handle: 'alpha' }]
          },
          driver_status: { working: false }
        }

      case 'groups.log':
        return {
          events:
            Number(params.since_seq || 0) > 0
              ? []
              : [
                  {
                    seq: 1,
                    event_id: 'e1',
                    kind: 'message.user',
                    created_at: 1,
                    payload: { text: 'Hello from the gateway', thread_id: 't1' }
                  }
                ],
          has_more: false
        }

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

      case 'groups.watch':
        return { room_id: 'r1', watching: true }

      default:
        throw new Error(`Unexpected RPC: ${method}`)
    }
  })
  await act(async () => {
    render(<GroupChatWorkspace group={key} members={[]} origin="key" />)
  })
  expect(await screen.findByText('Gateway room')).toBeTruthy()
  expect(screen.getByText('Hello from the gateway')).toBeTruthy()
  expect(screen.getByRole('textbox')).toBeTruthy()
  expect(screen.queryByTestId('canonical-group-workspace')).toBeNull()
  expect(request.mock.calls.some(call => call[1] === 'groups.watch' && call[2].on !== false)).toBe(true)
})
