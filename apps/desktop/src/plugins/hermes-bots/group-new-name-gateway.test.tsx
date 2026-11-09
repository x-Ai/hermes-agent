/**
 * A name with no room record is a new group chat, and every new group chat runs on a gateway:
 * Manage groups' Create & join goes through New group chat's gateway create, and the workspace
 * never opens such a name Desktop-driven (nor saves `engine: 'desktop'` on an edit), whether the
 * gateway is current or too old to run group chats.
 *
 * Fork contract (differs from upstream's version of this file on purpose): a gateway that keeps
 * this fork's room settings creates the room (recorded under its `canonical:` key, not by name);
 * an older gateway keeps the fork's Desktop-room fallback, and every non-canonical name renders
 * through the Desktop room view. A name with no record is still never marked `engine: 'desktop'`.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { groupDrivenByDesktop } from './canonical-group-capabilities'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { _resetCanonicalRoomSyncForTests } from './canonical-room-sync'
import { GroupDialog } from './create-dialog'
import { CROSS_GATEWAY_GROUP_LOCALES } from './cross-gateway-locales'
import { $botMeta, $lastRoster } from './data'
import { $groupChats, $groupChatWorkspace } from './group-chat'
import type * as GroupChatModule from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { translateBots } from './i18n-test-helper'
import type { RosterRow } from './types'
import { moveGroupChatsToSection } from './user-sections'

const { request, notify, openWorkspace } = vi.hoisted(() => ({ request: vi.fn(), notify: vi.fn(), openWorkspace: vi.fn() }))
vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()
  const { en } = await import('@/i18n/en')

  return {
    ...sdk,
    gatewayActivationEpoch: () => 1,
    useGatewayActivationEpoch: () => 1,
    host: {
      ...sdk.host, requestProfile: request, notify, openWorkspace,
      request: (method: string, params?: Record<string, unknown>) => request(null, method, params),
      connections: vi.fn(async () => []),
      state: { ...sdk.host.state, connectionId: sdk.atom<string | null>('local'), profile: sdk.atom('default'), gateway: sdk.atom('open') }
    },
    useI18n: () => ({ locale: 'en', t: en }),
    usePluginI18n: () => translateBots
  }
})
vi.mock('./group-chat', async importOriginal => {
  const actual = await importOriginal<typeof GroupChatModule>()

  return { ...actual, updateGroupChat: vi.fn((group, mutate) => actual.updateGroupChat(group, mutate, { sync: false })) }
})
vi.mock('./group-chat-parts', async importOriginal => ({ ...await importOriginal<typeof GroupChatParts>(), GroupImageControls: () => null }))

const alpha: RosterRow = { name: 'alpha', connectionId: 'local', connectionLabel: 'This device' }
const beta: RosterRow = { name: 'beta', connectionId: 'local', connectionLabel: 'This device' }
const remote: RosterRow = { name: 'scout', connectionId: 'other-box', connectionLabel: 'Other box', remoteSource: true }

function gateway(capabilities: unknown) {
  request.mockReset().mockImplementation(async (_route, method, params) => {
    if (method === 'groups.capabilities') {return capabilities}

    if (method === 'groups.list') {return { rooms: [], next_offset: null }}

    if (method === 'groups.create') {
      return { room: { room_id: params.room_id ?? 'research-1', name: params.name, members: params.members } }
    }

    // The fork reads a hosted room's state and log as soon as it is created.
    if (method === 'groups.state') {
      return { room: { room_id: params.room_id, name: 'Research', members: [] }, driver_status: {} }
    }

    if (method === 'groups.log') {return { events: [], has_more: false }}

    return {}
  })
}

beforeEach(() => {
  gateway({ driver: true, persistent_process: true, seatable_profiles: ['alpha', 'beta'] })
  // The gateway's features are cached per route: each case reads its own gateway afresh.
  _resetCanonicalRoomSyncForTests()
  $canonicalGroupBindings.set({})
  $groupChats.set({})
  $groupChatWorkspace.set(null)
  $botMeta.set({})
  $lastRoster.set([alpha, beta, remote])
  notify.mockReset()
  openWorkspace.mockReset().mockReturnValue(() => undefined)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  $groupChats.set({})
  localStorage.clear()
})

const desktopRecords = () => Object.values($groupChats.get()).filter(room => room.engine === 'desktop')

it('Create & join from a bot\'s Manage groups makes a gateway-run group chat, never a Desktop-run one', async () => {
  // The fork's gateway-hosted rooms need a gateway that keeps its room settings.
  gateway({ driver: true, persistent_process: true, features: ['room_settings'], seatable_profiles: ['alpha', 'beta'] })
  const onCreated = vi.fn()
  render(<GroupDialog bot={alpha} onClose={vi.fn()} onCreated={onCreated} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Research' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create & join' })) })

  // New group chat opens with this bot picked and the name filled in; the person adds the others.
  const dialog = await screen.findByRole('dialog', { name: 'New group chat' })
  expect((within(dialog).getByRole('textbox', { name: 'Group name' }) as HTMLInputElement).value).toBe('Research')
  await waitFor(() => expect(dialog.querySelector('[data-bot-face="beta"]')).not.toBeNull())
  fireEvent.click(dialog.querySelector('[data-bot-face="beta"]')!.closest('label')!.querySelector('[role="checkbox"]')!)
  const create = within(dialog).getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement
  await waitFor(() => expect(create.disabled).toBe(false))
  await act(async () => { fireEvent.click(create) })

  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
  const created = request.mock.calls.filter(call => call[1] === 'groups.create')
  expect(created).toHaveLength(1)
  expect(created[0][2]).toMatchObject({ name: 'Research', members: [{ profile: 'alpha' }, { profile: 'beta' }] })
  // The fork records a hosted room under its `canonical:` key (upstream: an engine on the name).
  const [[key, origin]] = onCreated.mock.calls
  expect(origin).toBe('key')
  expect(key).toMatch(/^canonical:local:default:/)
  expect($groupChats.get()[key]?.canonical).toMatchObject({ connectionId: 'local' })
  expect(Object.keys($groupChats.get()).filter(name => !name.startsWith('canonical:'))).toEqual([])
  expect(desktopRecords()).toEqual([])
})

it('Create & join on a gateway without room settings keeps the fork\'s Desktop room, unmarked, for this bot and the name', async () => {
  const onCreated = vi.fn()
  render(<GroupDialog bot={alpha} onClose={vi.fn()} onCreated={onCreated} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Research' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create & join' })) })

  const dialog = await screen.findByRole('dialog', { name: 'New group chat' })
  expect((within(dialog).getByRole('textbox', { name: 'Group name' }) as HTMLInputElement).value).toBe('Research')
  await waitFor(() => expect(dialog.querySelector('[data-bot-face="beta"]')).not.toBeNull())
  fireEvent.click(dialog.querySelector('[data-bot-face="beta"]')!.closest('label')!.querySelector('[role="checkbox"]')!)
  const create = within(dialog).getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement
  await waitFor(() => expect(create.disabled).toBe(false))
  await act(async () => { fireEvent.click(create) })

  await waitFor(() => expect(onCreated).toHaveBeenCalledWith('Research', 'name'))
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  expect(($groupChats.get().Research.members ?? []).map((member: RosterRow) => member.name)).toEqual(['alpha', 'beta'])
  // Both bots are on this connection: nothing pins the room Desktop-run.
  expect(desktopRecords()).toEqual([])
})

it('a name with no room record never opens Desktop-run, even when its bots span computers', async () => {
  // A group known only from Bots' memberships (what Create & join used to leave behind).
  await act(async () => { render(<GroupChatWorkspace group="Research" members={[alpha, remote]} />) })

  // Fork: every non-canonical name renders through the Desktop room view (upstream opens the
  // gateway's view and lists its rooms), but the bare name is never inferred or saved Desktop-run.
  await waitFor(() => expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0))
  expect(request.mock.calls.filter(call => call[1] === 'groups.list')).toHaveLength(0)
  expect(groupDrivenByDesktop($groupChats.get().Research, [alpha, remote], 'local')).toBe(false)
  expect(desktopRecords()).toEqual([])
})

it('a new name on a gateway too old to run group chats says to update it, as New group chat does', async () => {
  gateway({ driver: false, persistent_process: false })
  await act(async () => { render(<GroupChatWorkspace group="Research" members={[alpha, beta]} />) })

  // Fork: upstream's capability gate is unused. A gateway without this fork's `room_settings`
  // cannot host the room, so New group chat keeps the fork's Desktop room there and the name opens
  // the Desktop room view instead of upstream's update notice. The bare name is still never created
  // on the gateway nor saved Desktop-run.
  await waitFor(() => expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0))
  expect(screen.queryByText(CROSS_GATEWAY_GROUP_LOCALES.en.ownerUpdateRequired('This device'))).toBeNull()
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  expect(groupDrivenByDesktop($groupChats.get().Research, [alpha, beta], 'local')).toBe(false)
  expect(desktopRecords()).toEqual([])
})

it.each(['section', 'order'])('a membership-only name filed by a layout write (%s) still never opens Desktop-run', async write => {
  // Filing a group into a section or reordering it writes an empty record for the name.
  if (write === 'section') {moveGroupChatsToSection(['Research'], 'work')} else {
    $groupChats.set({ Research: { log: [], watermarks: {}, epoch: 0, running: false, rosterOrder: 0 } })
  }

  expect($groupChats.get().Research).toBeTruthy()
  await act(async () => { render(<GroupChatWorkspace group="Research" members={[alpha, remote]} />) })

  // Fork: every non-canonical name renders through the Desktop room view (upstream opens the
  // gateway's view and lists its rooms). The empty record a layout write left is still no room
  // record, so this name, whose bots span computers, is neither inferred nor saved Desktop-run.
  await waitFor(() => expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0))
  expect(request.mock.calls.filter(call => call[1] === 'groups.list')).toHaveLength(0)
  expect(groupDrivenByDesktop($groupChats.get().Research, [alpha, remote], 'local')).toBe(false)
  expect(desktopRecords()).toEqual([])
})
