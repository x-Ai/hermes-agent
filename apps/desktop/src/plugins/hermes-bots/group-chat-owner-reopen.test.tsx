/**
 * A group chat reopens on the gateway that owns it, whatever the foreground connection, after a
 * restart drops the in-memory bindings and after a member on another machine leaves (upstream
 * 4c7f479dd8, ported from its gate-only canonical-group-reopen-by-name.test.tsx). A record named
 * like the room carries a recorded owner (`engine`), a `canonical:` key names its own; this fork
 * renders either through the Desktop room view, synced from that owner, and never creates a room.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { $canonicalGroupBindings } from './canonical-group-registry'
import { _resetCanonicalRoomSyncForTests } from './canonical-room-sync'
import { $groupChats } from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { translateBots } from './i18n-test-helper'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()
  const { en } = await import('@/i18n/en')

  return {
    ...sdk,
    gatewayActivationEpoch: () => 1,
    useGatewayActivationEpoch: () => 1,
    host: {
      ...sdk.host,
      requestProfile: request,
      notify: vi.fn(),
      openWorkspace: vi.fn(() => () => undefined),
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
vi.mock('./group-chat-parts', async importOriginal => ({
  ...(await importOriginal<typeof GroupChatParts>()),
  GroupImageControls: () => null
}))

const owner = { kind: 'gateway' as const, connectionId: 'remote', profile: 'owner-profile', roomId: 'room-original' }
const savedOwner = { ...owner, connectionId: 'saved-owner', profile: 'default', roomId: 'saved-room' }
const roomKey = 'canonical:remote:owner-profile:room-original'

beforeEach(() => {
  _resetCanonicalRoomSyncForTests()
  $canonicalGroupBindings.set({})
  request.mockReset()
  request.mockImplementation(async (_route, method, params) => {
    if (method === 'groups.capabilities') {
      return { driver: true, persistent_process: true, features: [], methods: [] }
    }

    if (method === 'groups.state') {
      return { room: { room_id: params.room_id, name: 'Team', members: [] }, driver_status: {} }
    }

    if (method === 'groups.log') {
      return { events: [], has_more: false }
    }

    return {}
  })
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  $groupChats.set({})
})

const methods = () => request.mock.calls.map(call => call[1])
const stateCall = () => request.mock.calls.find(call => call[1] === 'groups.state')

it.each([
  { origin: 'name', group: 'Team', stored: owner, expected: owner },
  { origin: 'key', group: roomKey, stored: savedOwner, expected: owner },
  { origin: 'name', group: roomKey, stored: savedOwner, expected: savedOwner }
] as const)(
  '$origin open of $group keeps its owner after restart and peer removal',
  async ({ origin, group, stored, expected }) => {
    $groupChats.set({ [group]: { log: [], watermarks: {}, engine: stored } })

    const mixed = [
      { name: 'alpha', connectionId: 'local' },
      { name: 'default', connectionId: 'remote', remoteSource: true }
    ]

    const view = await act(async () => render(<GroupChatWorkspace group={group} members={mixed} origin={origin} />))
    await vi.waitFor(() => expect(stateCall()).toBeTruthy())
    expect(stateCall()?.[0]).toMatchObject({ connectionId: expected.connectionId, targetProfile: expected.profile })
    expect(stateCall()?.[2]).toMatchObject({ room_id: expected.roomId })
    view.unmount()
    _resetCanonicalRoomSyncForTests()
    $canonicalGroupBindings.set({})
    request.mockClear()
    await act(async () => {
      render(<GroupChatWorkspace group={group} members={mixed.slice(0, 1)} origin={origin} />)
    })
    await vi.waitFor(() => expect(stateCall()).toBeTruthy())
    expect(stateCall()?.[0]).toMatchObject({ connectionId: expected.connectionId, targetProfile: expected.profile })
    expect(stateCall()?.[2]).toMatchObject({ room_id: expected.roomId })
    expect(methods()).not.toContain('groups.create')
  }
)
