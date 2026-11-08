/**
 * The Bots pane with only its gateway transport mocked. The bot list
 * (`profiles.list` / `host.agents`) failing must not hide gateway Group Chats
 * that `groups.list` returned: rooms are part of the list, so the pane shows
 * them instead of the bot-list error, with no Refresh button.
 *
 * Fork: discovery (canonical-room-sync.ts, run when the gateway opens) projects
 * a gateway room into the room store and the roster lists it as a room row, in
 * place of upstream's gateway-room rows; so the rooms are discovered first.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, expect, it, vi } from 'vitest'

import { translateBotsIn } from './i18n-test-helper'

const { request, requestProfile } = vi.hoisted(() => ({ request: vi.fn(), requestProfile: vi.fn() }))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()

  return {
    ...sdk,
    host: {
      ...sdk.host,
      agents: vi.fn(async () => {
        throw new Error('profiles.list exploded')
      }),
      request,
      requestProfile,
      state: {
        ...sdk.host.state,
        connectionId: atom<null | string>('local'),
        gateway: atom('open'),
        profile: atom('default')
      }
    },
    usePluginI18n: () => translateBotsIn('en')
  }
})

import { _resetCanonicalRoomSyncForTests, discoverActiveCanonicalRooms } from './canonical-room-sync'
import { botsText } from './i18n'
import { BotsPane } from './roster-pane'

const room = {
  room_id: 'room-1',
  name: 'Launch crew',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta' }
  ],
  updated_at: Date.now() / 1000
}

afterEach(() => {
  cleanup()
  _resetCanonicalRoomSyncForTests()
  vi.clearAllMocks()
})

it('shows gateway Group Chats when the bot list fails', async () => {
  request.mockRejectedValue(new Error('profiles.list exploded'))
  requestProfile.mockImplementation(async (_route: unknown, method: string) => {
    switch (method) {
      case 'groups.capabilities':
        return { driver: true, features: [] }

      case 'groups.list':
        return { rooms: [room], next_offset: null }

      case 'groups.state':
        return { room, driver_status: { working: false } }

      case 'groups.log':
        return { events: [], has_more: false }
    }

    throw new Error(`unexpected ${method}`)
  })

  await discoverActiveCanonicalRooms()
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <BotsPane />
    </QueryClientProvider>
  )

  // A room row is named by the room, then its member count and availability.
  expect(await screen.findByRole('button', { name: /^Launch crew, / })).toBeTruthy()
  expect(screen.queryByText(/exploded/)).toBeNull()
  expect(screen.queryByRole('button', { name: /refresh/i })).toBeNull()

  // Still listed once the bot list has failed for good (its retries spent), not only while it loads.
  expect(await screen.findByText(botsText().roster.refreshFailed)).toBeTruthy()
  expect(screen.getByRole('button', { name: /^Launch crew, / })).toBeTruthy()
  expect(screen.queryByText(/exploded/)).toBeNull()
})
