import { host } from '@hermes/plugin-sdk'
import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { groupCreationEngine, groupExecutionMode } from './canonical-group-capabilities'
import {
  answerGroupRequests, CANONICAL_GROUP_CAPABILITIES, DISBAND_FAILURES, PEER_MINI as MINI, PEER_HOME, PEER_REGISTERED, peerInvitation, peerRosterRow,
  STANDALONE_GROUP_CAPABILITIES, strictGroupCreation
} from './canonical-group-contract-test-utils'
import { CANONICAL_GROUP_LOCALES } from './canonical-group-locales'
import { $peerJoinErrors, peerJoinKey, peerJoinText, peerSetupText, peerTargetState } from './canonical-group-peers'
import { $canonicalGroupBindings, publishCanonicalGroup } from './canonical-group-registry'
import { canonicalGroupCreateError, canonicalGroupRoster } from './canonical-groups'
import { CreateGroupChatDialog } from './create-dialog'
import { CROSS_GATEWAY_GROUP_LOCALES } from './cross-gateway-locales'
import { $botMeta } from './data'
import { renderGatewayRooms } from './gateway-group-rooms-test-harness'
import { $groupChats, $groupChatWorkspace, updateGroupChat } from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { scriptedStorage } from './group-test-utils'
import { translateBots } from './i18n-test-helper'
import { setPluginCtx } from './shared'
import type { RosterRow } from './types'

const { request, notify } = vi.hoisted(() => ({ request: vi.fn(), notify: vi.fn() }))
vi.mock('@hermes/plugin-sdk', async importOriginal => (await import('./canonical-group-contract-test-utils'))
  .localGatewaySdkMock(await importOriginal<typeof HermesSdk>(), request, () => translateBots, { notify }))
vi.mock('./group-chat-parts', async importOriginal => ({ ...await importOriginal<typeof GroupChatParts>(), GroupImageControls: () => null }))

const words = CANONICAL_GROUP_LOCALES.en

// Fork: a gateway hosts a room, with or without bots from other computers, only when it keeps this
// fork's room settings (folder, @handle, stop detection); anywhere else New group chat makes a
// Desktop room. The home here is such a gateway.
const HOME = { ...PEER_HOME, features: [...PEER_HOME.features, 'room_settings'] }
const roomKey = (roomId: string) => `canonical:local:default:${roomId}`

const roster: RosterRow[] = [{ name: 'default', connectionId: 'local' }, peerRosterRow('mini', 'Mac Mini'), peerRosterRow('mini', 'Mac Mini', 'coder'),
  peerRosterRow('nas', 'NAS'), { name: 'beta', connectionId: 'local' }]

type Answer = (method: string, params: Record<string, any>) => unknown

const home = (overrides: Answer = () => undefined): Answer => (method, params) => overrides(method, params) ?? ({
  'groups.capabilities': HOME,
  'groups.create': { room: { room_id: params.room_id, name: params.name, members: params.members, authority_gateway_id: 'install:a18b0000000000000000000000000000', authority_epoch: 1 } },
  'groups.peer.register': PEER_REGISTERED
} as Record<string, unknown>)[method]

const mini = (capabilities: unknown = MINI, invitation: unknown = peerInvitation('grant-for-linked')): Answer => method =>
  ({ 'groups.capabilities': capabilities, 'groups.peer.invite': invitation } as Record<string, unknown>)[method]

const nas: Answer = method => method === 'groups.capabilities'
  ? { ...STANDALONE_GROUP_CAPABILITIES, room_link: { enabled: false, reason: 'gateway_roomlink_secret_unavailable' } } : undefined

const gateways = (local = home(method => method === 'groups.capabilities' ? { ...HOME, room_link: { enabled: false } } : undefined), peer = mini()) => answerGroupRequests(request, { local, mini: peer, nas })

beforeEach(() => {
  ;(host.state.gateway as ReturnType<typeof HermesSdk.atom<string>>).set('open')
  $canonicalGroupBindings.set({})
  $botMeta.set({})
  $groupChats.set({})
  request.mockReset()
  notify.mockReset()
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => { cleanup(); setPluginCtx(null); localStorage.clear() })

const box = (row: Element | undefined) => row?.closest('label')?.querySelector('button[role="checkbox"]') as HTMLButtonElement
const localOnly = () => request.mock.calls.every(call => call[0]?.connectionId === 'local')

async function openDialog(onCreated = vi.fn()) {
  const view = render(<CreateGroupChatDialog onClose={vi.fn()} onCreated={onCreated} open roster={roster} />)
  await waitFor(() => expect(request.mock.calls.some(call => call[0]?.connectionId === 'local')).toBe(true))
  await act(async () => {})

  return { ...view, onCreated, rows: [...view.baseElement.querySelectorAll('[data-bot-face="default"]')] }
}

/** Pick this connection's and the Mac Mini's default Bots, create, and wait for the room. */
async function createWithMini({ rows, onCreated }: Awaited<ReturnType<typeof openDialog>>) {
  fireEvent.click(box(rows[0]))
  fireEvent.click(box(rows[1]))
  expect(await screen.findByText('Runs on this device, including when this Desktop is closed. Only text is sent to bots on other computers.')).toBeTruthy()
  fireEvent.change(screen.getByRole('textbox', { name: 'Group name' }), { target: { value: 'Team' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })
  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
}

it('seats a named profile from another computer on that gateway, pinned to that profile', async () => {
  const coder = { ...MINI, room_link: { ...MINI.room_link, profile: 'coder', catalog: { ...MINI.room_link.catalog,
    execution_policy: { ...MINI.room_link.catalog.execution_policy, target_profile: 'coder' } } } }

  gateways(undefined, (method, params) => method === 'groups.capabilities' && params.profile === 'coder' ? coder
    : method === 'groups.peer.invite' ? { ...peerInvitation('grant-for-coder'), target_profile: 'coder', catalog: coder.room_link.catalog }
      : mini()(method, params))
  const dialog = await openDialog()
  fireEvent.click(box(dialog.rows[0]))
  fireEvent.click(box(dialog.baseElement.querySelector('[data-bot-face="coder"]')!))
  expect(await screen.findByText('Runs on this device, including when this Desktop is closed. Only text is sent to bots on other computers.')).toBeTruthy()
  expect(dialog.baseElement.querySelector('[data-group-engine="desktop"]')).toBeNull()
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })
  await waitFor(() => expect(dialog.onCreated).toHaveBeenCalledOnce())

  const calls = request.mock.calls.map(([route, method, params]) => [route, method, params])
  const create = calls.find(call => call[1] === 'groups.create')![2]
  expect(create.members[1]).toMatchObject({ profile: 'coder', target: { kind: 'peer', profile: 'coder' } })
  const invite = calls.find(call => call[1] === 'groups.peer.invite')!
  expect([invite[0].connectionId, invite[0].targetProfile, invite[2].profile]).toEqual(['mini', 'coder', 'coder'])
  expect(calls.find(call => call[1] === 'groups.peer.register')![2]).toMatchObject({ target_profile: 'coder', grant: 'grant-for-coder' })
  // Fork: a hosted room opens by its `canonical:` key, which names its owner; no Desktop room is written.
  expect(dialog.onCreated).toHaveBeenCalledWith(roomKey(create.room_id), 'key')
  expect(Object.keys($groupChats.get()).filter(name => !name.startsWith('canonical:'))).toEqual([])
})

// A named profile whose gateway answers with another profile's catalog cannot be lent yet: this
// fork keeps its Desktop room for it, and the note says what to change on that computer (the
// removed "named profiles can't join yet" note is no longer true: the test above seats one).
it('says why a named profile on another computer keeps the group chat on Desktop', async () => {
  gateways()
  const { baseElement, rows } = await openDialog()
  fireEvent.click(box(rows[0]))
  fireEvent.click(box(baseElement.querySelector('[data-bot-face="coder"]')!))
  const note = await waitFor(() => baseElement.querySelector('[data-group-engine="desktop"]')!)
  expect(note.textContent).toContain(CROSS_GATEWAY_GROUP_LOCALES.en.desktopDriven)
  expect(note.textContent).toContain(peerSetupText('peer_target_unsupported', 'Mac Mini', CANONICAL_GROUP_LOCALES.en))
})

it('seats a Bot from another connection: the room on this gateway, the invitation on its own, the registration here', async () => {
  gateways()
  const dialog = await openDialog()
  const { baseElement, rows } = dialog
  expect(baseElement.querySelector('[data-bot-face="coder"]')).toBeTruthy()
  expect(rows).toHaveLength(3)
  expect(box(rows[2]).disabled).toBe(false)
  await createWithMini(dialog)

  const calls = request.mock.calls.map(([route, method, params]) => [route?.connectionId, method, params])
  const create = calls.find(call => call[1] === 'groups.create')![2]
  expect(calls.filter(call => call[1] !== 'groups.capabilities').map(call => [call[0], call[1]])).toEqual([
    ['local', 'groups.create'], ['mini', 'groups.peer.invite'], ['local', 'groups.peer.register']])
  // Two default Bots: the one from Mac Mini joins under a handle and name that say where it runs.
  expect(create.members).toEqual([
    { member_id: 'default', profile: 'default', handle: 'hermes', target: { kind: 'local', profile: 'default' } },
    { member_id: 'hermes-mac-mini', profile: 'default', handle: 'hermes-mac-mini', display_name: 'Hermes · Mac Mini',
      target: { kind: 'peer', peer_id: 'install:3f2a0000000000000000000000000000', installation_id: 'install:3f2a0000000000000000000000000000', profile: 'default',
        capability_digest: MINI.room_link.catalog.catalog_digest } }])
  expect(calls.find(call => call[1] === 'groups.peer.invite')![2]).toEqual({
    profile: 'default', room_id: create.room_id, member_id: 'hermes-mac-mini', home_install_id: 'install:a18b0000000000000000000000000000',
    authority_gateway_id: 'install:a18b0000000000000000000000000000', authority_epoch: 1, ttl_seconds: 86400, status_ttl_seconds: 2592000 })
  // The grant goes only to the endpoint in the catalog the room pinned.
  expect(calls.find(call => call[1] === 'groups.peer.register')![2]).toEqual({
    profile: 'default', room_id: create.room_id, member_id: 'hermes-mac-mini', target_url: MINI.room_link.catalog.endpoint.url,
    target_profile: 'default', grant: 'grant-for-linked', catalog: MINI.room_link.catalog })
  expect(Object.values($canonicalGroupBindings.get()).map(binding => binding.roomId)).toEqual([create.room_id])
  // Fork: New group chat announces the room it made; nothing went wrong.
  expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }))
  // Fork: a hosted room opens by its `canonical:` key, which names its owner; no Desktop room is written.
  expect(dialog.onCreated).toHaveBeenCalledWith(roomKey(create.room_id), 'key')
  expect(Object.keys($groupChats.get()).filter(name => !name.startsWith('canonical:'))).toEqual([])
})

it.each([
  ['the home cannot reach its computer', home(method => method === 'groups.peer.register'
    ? Object.assign(new Error('peer_unreachable'), { code: 4001, data: { reason: 'peer_unreachable' } }) : undefined), mini(),
  words.peerJoinUnreachable, true],
  // The grant goes nowhere but the endpoint in the catalog the room pinned.
  ['its invitation names another endpoint than its catalog', home(), mini(MINI, peerInvitation('grant-for-linked',
    { available: true, url: 'https://other.example.ts.net' })), words.peerJoinChanged, false]
])('opens the room even when a Bot does not join (%s), and says why', async (_case, local, peer, why, registers) => {
  gateways(local, peer)
  const dialog = await openDialog()
  await createWithMini(dialog)
  // The opened group chat's row says why; one notice names who is missing, so a failed seat is never silent.
  // Fork: that notice stands in for New group chat's "created" announcement, so it is the only one.
  expect(notify.mock.calls).toEqual([[{ kind: 'warning', message: words.createdNotJoined.replace('{names}', 'Hermes · Mac Mini') }]])
  const [binding] = Object.values($canonicalGroupBindings.get())
  expect(peerJoinText($peerJoinErrors.get()[peerJoinKey(binding, 'hermes-mac-mini')], 'Hermes · Mac Mini', words)).toBe(why.replace('{name}', 'Hermes · Mac Mini'))
  expect(request.mock.calls.some(call => call[1] === 'groups.peer.register')).toBe(registers)
  expect(Object.values($canonicalGroupBindings.get())).toHaveLength(1)
  const creates = request.mock.calls.filter(call => call[1] === 'groups.create')
  expect(creates).toHaveLength(1)
  // Fork: the room opens by its `canonical:` key; no Desktop room is written.
  expect(dialog.onCreated).toHaveBeenCalledWith(roomKey(creates[0][2].room_id), 'key')
  expect(Object.keys($groupChats.get()).filter(name => !name.startsWith('canonical:'))).toEqual([])
})

it.each([
  ['uses classic groups', { driver: false, persistent_process: false }],
  ['ends with Desktop', { ...HOME, persistent_process: false }]
])('keeps the courier and its full picker when the owner %s', async (_case, capabilities) => {
  gateways(home(method => method === 'groups.capabilities' ? capabilities : undefined))
  const { baseElement } = render(<CreateGroupChatDialog onClose={vi.fn()} open roster={roster} />)
  await waitFor(() => expect(request).toHaveBeenCalled())
  await act(async () => {})
  expect(baseElement.querySelector('[data-bot-face="coder"]')).toBeTruthy()
  const rows = [...baseElement.querySelectorAll('[data-bot-face="default"]')]
  fireEvent.click(box(rows[0]))
  fireEvent.click(box(rows[1]))
  expect(baseElement.querySelector('[data-group-engine="desktop"]')).toBeTruthy()
  expect((screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement).disabled).toBe(false)
  expect(localOnly()).toBe(true)
})

// Upstream's planner never plans a Desktop-driven group chat for these owners: it names what to change
// there (the words below), which upstream's dialog shows with Retry. This fork's dialog keeps its
// Desktop room for them instead (the courier test above), so the planner and its words are checked.
it.each([
  ['uses classic groups', { driver: false, persistent_process: false }, 'Hermes on This device is too old to run group chats. Update Hermes there, then retry.'],
  ['ends with Desktop', { ...HOME, persistent_process: false },
    'Hermes on This device can’t seat bots from other computers yet. Update Hermes there and run its gateway (hermes gateway run), then retry.']
])('never makes a Desktop-driven group chat when the owner %s: it says what to change and offers Retry', async (_case, capabilities, words) => {
  const plan = groupCreationEngine(groupExecutionMode(capabilities), [roster[0], roster[1]], 'local', capabilities)
  const say = { owner_update_required: CROSS_GATEWAY_GROUP_LOCALES.en.ownerUpdateRequired, peer_owner_unavailable: CROSS_GATEWAY_GROUP_LOCALES.en.ownerCannotSeatPeers }
  expect(plan.engine).toBe('unavailable')
  expect(say[plan.reason as keyof typeof say]('This device')).toBe(words)
  expect(request).not.toHaveBeenCalled()
  expect($groupChats.get()).toEqual({})
})

it.each([['owner', false], ['lender', false], ['seatable', false], ['owner', true], ['lender', true]] as const)(
  'refreshes changed %s capabilities (enabled: %s) before another deliberate Create', async (kind, enabled) => {
    let changed = false
    const ready = () => enabled ? changed : !changed
    gateways(home(method => method === 'groups.capabilities'
      ? (!ready() && kind === 'owner' ? CANONICAL_GROUP_CAPABILITIES : !ready() && kind === 'seatable' ? { ...HOME, seatable_profiles: [] } : HOME) : undefined),
    method => method === 'groups.capabilities' && !ready() && kind === 'lender' ? CANONICAL_GROUP_CAPABILITIES : mini()(method, {}))
    const dialog = await openDialog()
    fireEvent.click(box(dialog.rows[0]))
    fireEvent.click(box(dialog.rows[1]))
    expect(dialog.baseElement.querySelector(`[data-group-engine="${enabled ? 'desktop' : 'gateway-peer'}"]`)).toBeTruthy()
    changed = true
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })
    expect(request.mock.calls.some(call => call[1] === 'groups.create')).toBe(false)
    expect($groupChats.get()).toEqual({})
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }))
    expect(dialog.onCreated).not.toHaveBeenCalled()

    if (kind === 'seatable') {
      expect((screen.getByRole('button', { name: 'Create group (1)' }) as HTMLButtonElement).disabled).toBe(true)

      return
    }

    await waitFor(() => expect(dialog.baseElement.querySelector(`[data-group-engine="${enabled ? 'gateway-peer' : 'desktop'}"]`)).toBeTruthy())
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })
    expect(dialog.onCreated).toHaveBeenCalledOnce()
  })

const route = { connectionId: 'local', profile: 'default' }
const pin = () => ({ installationId: 'install:3f2a0000000000000000000000000000', catalogDigest: 'c'.repeat(64), profile: 'default' })
const peer = (connectionId: string, connectionLabel: string) => ({ name: 'default', handle: 'hermes', connectionId, connectionLabel, remoteSource: true })

it('refuses a roster whose Bots would share a handle or id even after naming their computer', () => {
  const here = { name: 'default', handle: 'hermes', connectionId: 'local' }
  const mac = peer('mini', 'Mac Mini')
  expect(canonicalGroupRoster(route, [here, mac])).toEqual({ problem: 'otherConnection' })
  expect(canonicalGroupRoster(route, [here, { name: 'hermes-mac-mini', connectionId: 'local' }, mac], pin))
    .toEqual({ problem: 'duplicateMember' })
  const seated = canonicalGroupRoster(route, [{ name: 'alpha', connectionId: 'local' }, { ...mac, title: 'Reviewer' }], pin)
  expect('roster' in seated && seated.roster[1]).toMatchObject({ member_id: 'hermes', handle: 'hermes', display_name: 'Reviewer · Mac Mini' })
})

it('gives Bots from distinct connections distinct handles, whatever script their connections are named in', () => {
  for (const [first, second] of [[peer('home-box', '自宅'), peer('office-box', '会社')], [peer('mini', 'Mac Mini'), peer('mini-2', 'Mac-Mini')]]) {
    const seated = canonicalGroupRoster(route, [{ name: 'alpha', connectionId: 'local' }, first, second], pin)
    const handles = 'roster' in seated ? seated.roster.map(member => member.handle) : []
    expect(new Set(handles).size).toBe(3)
    expect(handles.every(handle => /^[a-z0-9][a-z0-9_-]*$/.test(handle))).toBe(true)
  }
})

it('reads whether another gateway can host a Bot here from its own capabilities', () => {
  const catalog = MINI.room_link.catalog
  const link = (change: Record<string, unknown>) => ({ ...MINI, room_link: { ...MINI.room_link, catalog: { ...catalog, ...change } } })
  expect([
    CANONICAL_GROUP_CAPABILITIES, { ...MINI, room_link: { enabled: false, reason: 'api_server_required' } },
    link({ protocol_versions: [1] }), link({ link_modes: ['relay'] }), link({ persistent_process: false }), link({ attachments: true }), link({ execution_policy: { target_profile: 'coder' } }),
    link({ endpoint: { available: false, reason: 'room_link_url_required' } }), link({ installation_id: 'install:other' })
  ].map(answer => (peerTargetState(answer, 'default') as { reason?: string }).reason)).toEqual(['peer_invite_unsupported', 'api_server_required',
    'peer_target_unsupported', 'peer_target_unsupported', 'persistent_process_required', 'text_only_required', 'peer_target_unsupported', 'endpoint_required', 'room_link_unavailable'])
  // A lender lends the profile it was asked for: a catalog for that named profile is ready.
  expect(peerTargetState(link({ execution_policy: { target_profile: 'coder' } }), 'coder')).toMatchObject({ ready: true, profile: 'coder' })
  // A lender without the renewal feature gets no extended horizon.
  expect(peerTargetState({ ...MINI, features: STANDALONE_GROUP_CAPABILITIES.features }, 'default')).toMatchObject({ ready: true, renewal: false })
})

/** Canonical lifecycle behind the creation dialog; all writes use the requested room identity. */
function lifecycleGateway(older: Array<{ room_id: string; name: string; members: never[] }> = [], disband = 'matching') {
  const state = { room: { room_id: '', name: 'Team', members: [], authority_gateway_id: HOME.authority_gateway_id, authority_epoch: 1 }, ended: false }
  gateways(home((method, params) => {
    if (method === 'groups.create') {state.room = { ...state.room, room_id: params.room_id, name: params.name, members: params.members }}

    if (method === 'groups.disband') {
      if (disband === 'empty') {return {}}

      const failure = DISBAND_FAILURES.find(({ name }) => name === disband)

      if (failure) {return failure.error}

      if (disband === 'another room') {return { tombstone: { room_id: 'another-room', disbanded_at: 1 } }}
      state.ended = true
    }

    return ({
      'groups.create': { room: state.room },
      'groups.list': { rooms: state.ended ? [] : [...older, state.room], next_offset: null },
      'groups.state': { room: { ...state.room, room_id: params.room_id, latest_seq: 0 }, driver_status: {} },
      'groups.log': { events: [] },
      // Fork: a hosted room's view also reads this fork's room settings.
      'groups.settings.get': { revision: 1, settings: { workspace: null, member_workspaces: {}, handle: null } },
      'groups.send': { event: {}, client_event_id: params.event_id, accepted: true, driver_started: true },
      'groups.disband': { tombstone: { room_id: params.room_id, disbanded_at: 1 } }
    } as Record<string, unknown>)[method]
  }))

  return state
}

it('opens and sends to the created owner despite a cached same-name alias', async () => {
  const route = { connectionId: 'local', profile: 'default' }
  const old = { room_id: 'old-room', name: 'Team', members: [] }
  const state = lifecycleGateway([old])
  publishCanonicalGroup(route, 'Team', { authority: route, room: old }, 'name')
  const dialog = await openDialog()
  await createWithMini(dialog)
  dialog.unmount()
  // Fork: the created room opens by the key New group chat hands its opener (its roster row is that
  // key's projection), so the cached alias for "Team" never answers for it.
  const [key, origin] = dialog.onCreated.mock.calls[0]
  render(<GroupChatWorkspace group={key} members={roster} origin={origin} />)
  await waitFor(() => expect(request.mock.calls.some(call => call[1] === 'groups.state')).toBe(true))
  expect(request.mock.calls.filter(call => call[1] === 'groups.state').map(call => call[2].room_id)).toEqual([state.room.room_id])
  const input = screen.getByRole('textbox') as HTMLTextAreaElement
  await waitFor(() => expect(input.disabled).toBe(false))
  fireEvent.change(input, { target: { value: 'To the newly created room' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  await waitFor(() => expect(request.mock.calls.find(call => call[1] === 'groups.send')?.[2]).toMatchObject({ room_id: state.room.room_id }))
})

it.each(['header', 'sidebar'].flatMap(entry => ['empty', 'another room', 'peer unreachable', 'matching'].map(answer => [entry, answer])))('retires ownership only after confirmed %s Disband (%s)', async (entry, answer) => {
  const values = new Map<string, unknown>()
  setPluginCtx(scriptedStorage(values))
  lifecycleGateway([], answer)
  const first = await openDialog()
  await createWithMini(first)
  first.unmount()
  // Fork: the hosted room is the `canonical:` key New group chat opened (this fork writes no record
  // named like the room). A room another gateway or profile owns, recorded the way upstream records
  // an owner, is not this room and survives its Disband.
  const [key] = first.onCreated.mock.calls[0]
  const { roomId } = $canonicalGroupBindings.get()[key]

  const otherOwner = { kind: 'gateway' as const, connectionId: entry === 'header' ? 'another-gateway' : 'local',
    profile: entry === 'header' ? 'default' : 'another-profile', roomId }

  updateGroupChat('Other owner', () => ({ log: [], watermarks: {}, engine: otherOwner }), { sync: false })
  $groupChatWorkspace.set(key)
  // The room's own header (Disband from its trash button), or its row in the Bots roster.
  const view = entry === 'header' ? render(<GroupChatWorkspace group={key} members={roster} origin="key" />) : renderGatewayRooms()

  if (entry === 'header') {
    fireEvent.click(await screen.findByRole('button', { name: 'Disband Team' }))
  } else {
    fireEvent.contextMenu(await screen.findByRole('button', { name: 'Team' }))
    // Upstream names the roster row's action Disband, like the room header's.
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Disband' }))
  }

  const confirm = within(await screen.findByRole('dialog')).getByRole('button', { name: 'Disband' })
  // Fork: the hosted room's record is the projection its open view keeps (canonical-room-sync.ts),
  // so it is read once the view is up; New group chat's own "created" notice is not the Disband's.
  const saved = $groupChats.get()[key]
  const stored = structuredClone((values.get('group-chats') as ReturnType<typeof $groupChats.get> | undefined)?.[key])
  notify.mockClear()
  await act(async () => { fireEvent.click(confirm) })

  if (answer !== 'matching') {
    expect($groupChats.get()[key]).toEqual(saved)
    const failure = DISBAND_FAILURES.find(({ name }) => name === answer)
    await within(screen.getByRole('dialog')).findByText(failure ? words.disbandKept.replace('{reason}', words[failure.detail]) : words.disbandUnconfirmed)
    expect((values.get('group-chats') as ReturnType<typeof $groupChats.get> | undefined)?.[key]).toEqual(stored)
    expect(Object.values($canonicalGroupBindings.get()).some(binding => binding.roomId === roomId)).toBe(true)
    expect($groupChatWorkspace.get()).toBe(key)
    expect(notify).not.toHaveBeenCalled()

    return
  }

  await waitFor(() => expect(request.mock.calls.some(call => call[1] === 'groups.disband')).toBe(true))
  await waitFor(() => expect($groupChats.get()[key]).toBeUndefined())
  view.unmount()
  $canonicalGroupBindings.set({})
  $groupChats.set(structuredClone(values.get('group-chats')) as ReturnType<typeof $groupChats.get>)
  expect(Object.keys($groupChats.get())).toEqual(['Other owner'])
  expect($groupChats.get()['Other owner'].engine).toEqual(otherOwner)
  const second = await openDialog()
  await createWithMini(second)
  expect(request.mock.calls.filter(call => call[1] === 'groups.create').map(call => call[2].name)).toEqual(['Team', 'Team'])
})

it('retries a lost create reply with one immutable intent; changing the name or reopening starts another', async () => {
  const { rooms, create } = strictGroupCreation()
  let lost = true
  gateways(home((method, params) => {
    if (method !== 'groups.create') {return undefined}
    const answer = create(params)

    if (lost) {lost = false; throw new Error('reply lost')}

    return answer
  }))
  const dialog = await openDialog()
  fireEvent.click(box(dialog.rows[0]))
  fireEvent.click(box(dialog.rows[1]))
  const name = screen.getByRole('textbox', { name: 'Group name' })
  fireEvent.change(name, { target: { value: 'Team' } })
  const submit = async () => act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Create group/ })) })
  await submit()
  // A lost reply says trying again is safe, in the dialog, instead of an error toast (095dbdb996).
  expect(screen.getByText(words.createUncertain)).toBeTruthy()
  expect(notify).not.toHaveBeenCalled()
  await act(async () => { (host.state.gateway as ReturnType<typeof HermesSdk.atom<string>>).set('closed') })
  expect(screen.getByRole('dialog')).toBeTruthy()
  await act(async () => { (host.state.gateway as ReturnType<typeof HermesSdk.atom<string>>).set('open') })
  await waitFor(() => expect(dialog.baseElement.querySelector('[data-group-engine="gateway-peer"]')).toBeTruthy())
  expect(name).toHaveProperty('value', 'Team')
  await submit()
  expect(dialog.onCreated).toHaveBeenCalledOnce()
  const creates = request.mock.calls.filter(call => call[1] === 'groups.create')
  expect(creates[1][2]).toEqual(creates[0][2])
  expect(rooms.size).toBe(1)
  lost = true
  await submit()
  fireEvent.change(name, { target: { value: 'Other team' } })
  await submit()
  expect(rooms.size).toBe(3)
  lost = true
  await submit()
  fireEvent.click(box(dialog.baseElement.querySelector('[data-bot-face="beta"]')!))
  await submit()
  expect(rooms.size).toBe(5)
  dialog.unmount()
  await createWithMini(await openDialog())
  expect(rooms.size).toBe(6)
})

it.each(['owner', 'lender'])('keeps the draft and a working Retry after a failed %s capability read', async failing => {
  let offline = failing === 'lender'
  gateways(home(method => method === 'groups.capabilities' && offline && failing === 'owner' ? new Error('request timed out') : undefined),
    method => method === 'groups.capabilities' && offline && failing === 'lender' ? new Error('request timed out') : mini()(method, {}))
  const dialog = await openDialog()
  fireEvent.click(box(dialog.rows[0]))
  fireEvent.click(box(dialog.rows[1]))
  const name = screen.getByRole('textbox', { name: 'Group name' })
  fireEvent.change(name, { target: { value: 'Keep this draft' } })

  if (failing === 'owner') {
    offline = true
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })
    // Fork: creation never waits on the gateway here, so a Desktop room stays on offer while its
    // capabilities cannot be read; Retry reads them again.
    await waitFor(() => expect(dialog.baseElement.querySelector('[data-group-engine="desktop"]')).toBeTruthy())
    expect((screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement).disabled).toBe(false)
  } else {
    expect(screen.getByText('Could not check Mac Mini. Make sure Hermes is running there, then retry.')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement).disabled).toBe(true)
    expect(dialog.baseElement.querySelector('[data-group-engine="desktop"]')).toBeNull()
  }

  offline = false
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await waitFor(() => expect(dialog.baseElement.querySelector('[data-group-engine="gateway-peer"]')).toBeTruthy())
  expect(name).toHaveProperty('value', 'Keep this draft')
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })
  expect(dialog.onCreated).toHaveBeenCalledOnce()
})

it.each(Object.keys(CANONICAL_GROUP_LOCALES) as (keyof typeof CANONICAL_GROUP_LOCALES)[])('calls a duplicate-member refusal a group chat (%s)', language => {
  // Bot Mode names a group chat one way per language: 群組聊天 in zh-hant, محادثة المجموعة in ar.
  const terms = { en: 'group chat', ja: 'グループチャット', zh: '群聊', 'zh-hant': '群組聊天', ar: 'محادثة المجموعة',
    ru: 'группового чата', fr: 'discussion de groupe', de: 'Gruppenchat', es: 'chat de grupo' }

  const message = canonicalGroupCreateError({ canonicalGroupProblem: 'duplicateMember' }, CANONICAL_GROUP_LOCALES[language])
  expect(message).toContain(terms[language])
})

it('describes membership storage for the chosen engine', async () => {
  gateways()
  const dialog = await openDialog()
  fireEvent.click(box(dialog.rows[0]))
  fireEvent.click(box(dialog.rows[1]))
  expect(screen.queryByText(/Local memberships sync/)).toBeNull()
  expect(screen.getByText('Pick 2–6 bots. Membership is saved with this group chat on its computer.')).toBeTruthy()
  fireEvent.click(box(dialog.rows[1]))
  fireEvent.click(box(dialog.baseElement.querySelector('[data-bot-face="coder"]')!))
  expect(screen.getByText('Pick 2–6 bots. Local memberships sync through each bot profile; cross-machine members stay scoped to this group chat.')).toBeTruthy()
})

// Upstream shows one membership storage for every selection; in this fork that holds for every
// selection a gateway hosts (a Desktop room keeps its own, the test above): here a bot from another
// computer and a named profile its gateway lends both join a hosted room.
it('describes one membership storage for every selection', async () => {
  const coder = { ...MINI, room_link: { ...MINI.room_link, profile: 'coder', catalog: { ...MINI.room_link.catalog,
    execution_policy: { ...MINI.room_link.catalog.execution_policy, target_profile: 'coder' } } } }

  gateways(undefined, (method, params) => method === 'groups.capabilities' && params.profile === 'coder' ? coder : mini()(method, params))
  const dialog = await openDialog()
  fireEvent.click(box(dialog.rows[0]))
  fireEvent.click(box(dialog.rows[1]))
  await waitFor(() => expect(dialog.baseElement.querySelector('[data-group-engine="gateway-peer"]')).toBeTruthy())
  expect(screen.getByText('Pick 2–6 bots. Membership is saved with this group chat on its computer.')).toBeTruthy()
  fireEvent.click(box(dialog.rows[1]))
  fireEvent.click(box(dialog.baseElement.querySelector('[data-bot-face="coder"]')!))
  await waitFor(() => expect(dialog.baseElement.querySelector('[data-group-engine="gateway-peer"]')).toBeTruthy())
  expect(screen.getByText('Pick 2–6 bots. Membership is saved with this group chat on its computer.')).toBeTruthy()
})


it.each([
  ['mixed', 'default-this-device', undefined, 'Hermes'],
  ['mixed', 'default-this-device', 'Custom name', 'Custom name'],
  ['mixed', 'hermes', undefined, undefined],
  ['local', 'default-this-device', undefined, undefined]
])('labels a default bot in a %s group without changing its handle (%s, %s)', (kind, handle, display, expected) => {
  const here = { name: 'default', handle, connectionId: 'local', connectionLabel: 'This device', display_name: display }
  const reviewer = { name: 'reviewer', handle: 'reviewer', connectionId: 'local' }
  const target = peerTargetState(MINI, 'default')

  const result = canonicalGroupRoster({ connectionId: 'local', profile: 'default' },
    [here, reviewer, ...kind === 'mixed' ? [{ ...peerRosterRow('mini', 'Mac Mini'), handle: 'default-mac-mini' }] : []], () => target.ready ? target : undefined)

  expect('roster' in result).toBe(true)

  if (!('roster' in result)) {return}
  expect(result.roster[0]).toMatchObject({ member_id: 'default', profile: 'default', handle })
  expect(result.roster[0].display_name).toBe(expected)
  expect(result.roster[1]).toEqual({ member_id: 'reviewer', profile: 'reviewer', handle: 'reviewer', target: { kind: 'local', profile: 'reviewer' } })
})
