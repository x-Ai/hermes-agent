import type * as HermesSdk from '@hermes/plugin-sdk'
import { host } from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { WritableAtom } from 'nanostores'
import { useSyncExternalStore } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { groupCreationEngine } from './canonical-group-capabilities'
import { CANONICAL_GROUP_LOCALES } from './canonical-group-locales'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { canonicalGroupCreateError } from './canonical-groups'
import { HostOnGatewayButton } from './canonical-room-migrate'
import { _resetCanonicalRoomSyncForTests } from './canonical-room-sync'
import { CreateGroupChatDialog } from './create-dialog'
import { CROSS_GATEWAY_GROUP_LOCALES } from './cross-gateway-locales'
import { $botMeta } from './data'
import { $groupChats, $groupChatWorkspace, updateGroupChat } from './group-chat'
import type * as GroupChatModule from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { botsText } from './i18n'
import { translateBots } from './i18n-test-helper'
import { renderRosterToolbar } from './roster-pane-toolbar'
import type { RosterRow } from './types'

const { request, notify, openWorkspace, activation } = vi.hoisted(() => ({
  request: vi.fn(),
  notify: vi.fn(),
  openWorkspace: vi.fn(),
  activation: { epoch: 1, listeners: new Set<() => void>() }
}))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()
  const { en } = await import('@/i18n/en')

  return {
    ...sdk,
    gatewayActivationEpoch: () => activation.epoch,
    // The hook subscribes, like the real store: an epoch that moves re-renders its readers.
    useGatewayActivationEpoch: () =>
      useSyncExternalStore(
        listener => {
          activation.listeners.add(listener)

          return () => {
            activation.listeners.delete(listener)
          }
        },
        () => activation.epoch
      ),
    host: {
      ...sdk.host,
      // Fork: the hosted-room path calls this fork's groups.settings.* / member_sessions / live /
      // watch methods, which upstream's contract checker (captureGroupRequests) does not declare.
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

const roster: RosterRow[] = [
  { name: 'alpha', connectionId: 'local' },
  { name: 'beta', connectionId: 'local' }
]

const mixedRoster: RosterRow[] = [
  ...roster,
  { name: 'remote', connectionId: 'other-box', connectionLabel: 'Other box', remoteSource: true },
  {
    name: 'spoofed',
    connectionId: 'local',
    remoteSource: true,
    route: { connectionId: 'other-box', mode: 'remote', profile: 'spoofed', targetProfile: 'spoofed' }
  }
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
      if (capabilities instanceof Error) {
        throw capabilities
      }

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

  // The picker's capability read has landed before Create is pressed, so the
  // call counts below are deterministic.
  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' }))
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

it.each(reported)(
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
    // Upstream disables Create and shows the driver status here; a Desktop room needs no driver.
    expect(screen.queryByText(unavailable)).toBeNull()
  }
)

// Upstream's positive classifications on the fork's two ways to create: a legacy gateway renders
// and creates a Desktop room; a gateway that hosts this fork's room settings creates a gateway room,
// recorded under its `canonical:` key (upstream records the owner on a record named like the room;
// this fork's hosted rooms carry their owner in that key) and never as a Desktop room.
it('keeps positive classifications working: legacy renders and creates locally, canonical creates a gateway room', async () => {
  answer(legacy)
  await act(async () => {
    render(<GroupChatWorkspace group="Existing" members={roster} />)
  })
  expect(screen.getByRole('textbox')).toBeTruthy()
  cleanup()
  expect((await submitDialog()).onCreated).toHaveBeenCalledOnce()
  expect(updateGroupChat).toHaveBeenCalledOnce()
  cleanup()
  vi.mocked(updateGroupChat).mockClear()
  $groupChats.set({})
  // The gateway's features are cached per route: the second half reads them afresh.
  _resetCanonicalRoomSyncForTests()

  request.mockImplementation(async (_route, method, params) => {
    const answers: Record<string, unknown> = {
      'groups.capabilities': { driver: true, persistent_process: true, features: ['room_settings'], methods: [] },
      'groups.create': { room: { room_id: 'hosted-2', name: params?.name, members: params?.members } },
      'groups.state': { room: { room_id: 'hosted-2', name: 'Alpha, Beta', members: [] }, driver_status: {} },
      'groups.log': { events: [], has_more: false },
      'groups.settings.get': { revision: 1, settings: { workspace: null, member_workspaces: {}, handle: null } },
      'groups.member_sessions': { sessions: [] },
      'groups.live': { current: null, watching: false },
      'profiles.configure': {}
    }

    if (Object.hasOwn(answers, method)) {
      return answers[method]
    }

    throw new Error(`Unexpected RPC: ${method}`)
  })
  const { onCreated } = await submitDialog()
  await act(async () => {
    await Promise.resolve()
  })
  expect(onCreated).toHaveBeenCalledWith('canonical:local:default:hosted-2', 'key')
  expect(Object.values($canonicalGroupBindings.get())).toHaveLength(1)
  expect($groupChats.get()['canonical:local:default:hosted-2']?.canonical).toMatchObject({
    connectionId: 'local',
    roomId: 'hosted-2'
  })
  expect(Object.keys($groupChats.get()).filter(name => !name.startsWith('canonical:'))).toEqual([])
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(1)
})

// A bot on another connection is offered: its own gateway seats it in the group chat
// (cross-gateway-group-creation.test.tsx). A row whose route disagrees with its own
// connection is still never offered.
it('canonical creation offers this connection and reachable other-connection bots, never a contradictory row', async () => {
  answer({ driver: true, persistent_process: true })
  const { baseElement } = render(<CreateGroupChatDialog onClose={vi.fn()} open roster={mixedRoster} />)

  expect(baseElement.querySelector('[data-bot-face="spoofed"]')).toBeNull()
  await waitFor(() => {
    expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities')
    expect(baseElement.querySelector('[data-bot-face="alpha"]')).not.toBeNull()
    expect(baseElement.querySelector('[data-bot-face="beta"]')).not.toBeNull()
  })

  for (const checkbox of screen.getAllByRole('checkbox').slice(0, 2)) {
    fireEvent.click(checkbox)
  }

  const submit = screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement
  await waitFor(() => expect(submit.disabled).toBe(false))
  expect(baseElement.querySelector('[data-bot-face="remote"]')).not.toBeNull()
  expect(baseElement.querySelector('[data-bot-face="spoofed"]')).toBeNull()
})

it('offers only the bots the authority says this caller can seat (#141178)', async () => {
  // `parked` is on this connection but not served (or a sibling this socket may
  // not seat): neither room kind can drive it, so the picker must not offer it.
  const withParked: RosterRow[] = [...roster, { name: 'parked', connectionId: 'local' }]
  answer({ driver: true, persistent_process: true, seatable_profiles: ['alpha', 'beta', 'default'] })
  const { baseElement } = render(<CreateGroupChatDialog onClose={vi.fn()} open roster={withParked} />)

  // Wait on the state only a settled capability produces: while the read is in flight the
  // dialog is in `checking` with `seatable` null, so every bot on the connection — `parked`
  // included — is offered. Alpha and beta are already rendered then, so waiting for them
  // returns on the first check and the assertions below race the answer.
  await waitFor(() => expect(screen.getAllByRole('checkbox')).toHaveLength(2))
  expect(baseElement.querySelector('[data-bot-face="parked"]')).toBeNull()
})

// Fork contract: Desktop rooms seat bots from other registered connections (their turns route to
// their own machines), so the picker keeps offering them on a canonical gateway, and a
// cross-connection pick creates a Desktop room even when the gateway hosts room settings. A row
// whose route disagrees with its own connection is never offered (upstream's seatableGroupBots).
it('keeps offering bots from other connections; a cross-connection pick creates a Desktop room', async () => {
  answer({
    driver: true,
    features: ['room_settings', 'member_sessions'],
    seatable_profiles: ['alpha', 'beta', 'default']
  })
  const onCreated = vi.fn()

  const { baseElement } = render(
    <CreateGroupChatDialog onClose={vi.fn()} onCreated={onCreated} open roster={mixedRoster} />
  )

  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})
  expect(baseElement.querySelector('[data-bot-face="remote"]')).not.toBeNull()
  expect(baseElement.querySelector('[data-bot-face="spoofed"]')).toBeNull()

  const checkboxes = screen.getAllByRole('checkbox')
  expect(checkboxes).toHaveLength(3)
  fireEvent.click(checkboxes[0])
  fireEvent.click(checkboxes[2])
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' }))
  })

  expect(onCreated).toHaveBeenCalledWith(expect.any(String), 'name')
  expect(updateGroupChat).toHaveBeenCalledOnce()
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
})

// Upstream's planner (`groupCreationEngine`) never plans a room on a legacy gateway: it names
// `owner_update_required` so the dialog can say to update Hermes there. This fork reads that answer
// as its Desktop-room fallback (the positive-classification test above creates one), so here the
// existing room keeps rendering, the planner's own answers are checked, and nothing reaches the
// gateway's groups.create.
it('keeps positive classifications working: legacy renders its existing rooms but never creates one, canonical creates a gateway room', async () => {
  answer(legacy)
  await act(async () => {
    render(<GroupChatWorkspace group="Existing" members={roster} />)
  })
  expect(screen.getByRole('textbox')).toBeTruthy()
  expect(groupCreationEngine('legacy', roster, 'local')).toEqual({ engine: 'unavailable', reason: 'owner_update_required' })
  expect(groupCreationEngine('canonical', roster, 'local', { driver: true, persistent_process: true })).toEqual({
    engine: 'gateway'
  })
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
})

// Upstream refuses a mixed selection on a legacy gateway and, once Retry reads a gateway that runs
// group chats but cannot seat bots from other computers, says that instead. This fork runs both as a
// Desktop room (its own Desktop note, never groups.create on the gateway), so the planner's answers
// are checked against the words upstream shows for them, and the dialog's fallback beside them.
it('never offers Create for a mixed selection on a legacy gateway, and finds a gateway that can run it on Retry', async () => {
  const mixed = mixedRoster.slice(0, 3)
  expect(groupCreationEngine('legacy', mixed, 'local')).toEqual({ engine: 'unavailable', reason: 'owner_update_required' })
  expect(groupCreationEngine('canonical', mixed, 'local', { driver: true, persistent_process: true })).toEqual({
    engine: 'unavailable',
    reason: 'peer_owner_unavailable'
  })
  expect(CROSS_GATEWAY_GROUP_LOCALES.en.ownerUpdateRequired('This device')).toBe(
    'Hermes on This device is too old to run group chats. Update Hermes there, then retry.'
  )
  expect(CROSS_GATEWAY_GROUP_LOCALES.en.ownerCannotSeatPeers('This device')).toBe(
    'Hermes on This device can’t seat bots from other computers yet. Update Hermes there and run its gateway (hermes gateway run), then retry.'
  )

  answer(legacy)
  const { baseElement } = render(<CreateGroupChatDialog onClose={vi.fn()} open roster={mixedRoster} />)
  await waitFor(() => expect(baseElement.querySelector('[data-bot-face="remote"]')).not.toBeNull())

  for (const checkbox of screen.getAllByRole('checkbox').slice(0, 3)) {
    fireEvent.click(checkbox)
  }

  expect(screen.getByRole('note').textContent).toBe(CROSS_GATEWAY_GROUP_LOCALES.en.desktopDriven)
  expect(baseElement.querySelector('[data-group-engine="desktop"]')).not.toBeNull()
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
})

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

// The New… menu opens New Group Chat. It is offered only when the dialog can
// seat two bots by the SAME rule the dialog's picker uses; counting the whole
// roster opened a dialog with one checkbox and a Create button that never woke.
it.each([
  ['one seatable bot', ['alpha', 'default'], true],
  ['two seatable bots', ['alpha', 'beta'], false]
])('New Group Chat in the New… menu, with %s', async (_label, seatable, disabled) => {
  const withParked: RosterRow[] = [...roster, { name: 'parked', connectionId: 'local' }]
  answer({ driver: true, persistent_process: true, seatable_profiles: seatable })
  const setGroupCreateOpen = vi.fn()

  render(
    renderRosterToolbar({
      activeFilterCount: 0,
      activeSourceRoster: withParked,
      activityFilter: 'all',
      activityToasts: false,
      b: botsText(),
      gatewayFilter: 'all',
      gatewayOptions: [],
      query: '',
      roster: withParked,
      rowKindFilter: 'all',
      setActivityFilter: vi.fn(),
      setCreateOpen: vi.fn(),
      setGatewayFilter: vi.fn(),
      setGroupCreateOpen,
      setQuery: vi.fn(),
      setRowKindFilter: vi.fn(),
      setSectionDialog: vi.fn(),
      showRosterFilters: false,
      showRosterSearch: false,
      showRosterTools: false
    })
  )

  fireEvent.keyDown(screen.getByRole('button', { name: botsText().roster.newBotOrGroup }), { key: 'Enter' })
  const item = await screen.findByRole('menuitem', { name: botsText().group.newTitle })

  // Settles once the authority's seatable roster is in: all three bots are on
  // this connection, but only the ones it will seat count.
  await waitFor(() => expect(item.hasAttribute('data-disabled')).toBe(disabled))
  fireEvent.click(item)
  expect(setGroupCreateOpen).toHaveBeenCalledTimes(disabled ? 0 : 1)
})

// Upstream's gate tests (a classic room held on the gate, its earlier messages, the gate's
// Retry) are not taken: this fork renders every room through the Desktop room view (the fork
// contract above) and has no gate. Its refused-creation test is kept on this fork's two ways onto
// a gateway: New group chat (a hosted room only where the gateway hosts room settings), and
// Group settings' Host on the gateway… (canonical-room-migrate.tsx) in place of the gate's Start
// new group.
it("explains a refused gateway group creation in the reader's language with the member the gateway named, from the dialog and Host on the gateway", async () => {
  const words =
    "The gateway couldn’t create this group chat. member 1 profile 'beta': only a host-scoped connection seats a served profile without an entry"

  request.mockImplementation(async (_route, method) => {
    if (method === 'groups.capabilities') {
      return { driver: true, persistent_process: true, features: ['room_settings'] }
    }

    if (method === 'groups.create') {
      throw Object.assign(new Error('invalid_params'), {
        code: 4001,
        data: {
          reason: 'invalid_params',
          field: 'members',
          detail: "member 1 profile 'beta': only a host-scoped connection seats a served profile without an entry"
        }
      })
    }

    throw new Error(`Unexpected RPC: ${method}`)
  })
  await submitDialog()
  await waitFor(() => expect(notify).toHaveBeenCalledWith({ kind: 'error', message: words }))
  cleanup()

  // And from Host on the gateway… in a Desktop room's Group settings.
  $groupChats.set({ Existing: { log: [], members: roster, running: false, watermarks: {} } })
  render(<HostOnGatewayButton group="Existing" members={roster} onHosted={vi.fn()} rename={vi.fn()} />)
  fireEvent.click(await screen.findByRole('button', { name: botsText().group.hostOnGateway }))
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: botsText().group.hostOnGatewayAction }))
  })
  expect(await screen.findByText(words)).toBeTruthy()
  expect(Object.keys($groupChats.get())).toEqual(['Existing'])
})

// Upstream keeps a lost create reply's exact request for the gate's Start new group (095dbdb996).
// This fork's way onto a gateway in its place, Host on the gateway…, keeps it the same way: the
// confirmation says trying again is safe, confirming again sends the same room id (so the room is
// never hosted twice), and closing the confirmation ends that request so a new one starts fresh.
it.each(['confirmed again', 'reopened'])(
  'Host on the gateway… keeps a lost create reply only for its open confirmation: %s',
  async retry => {
    const ids: string[] = []
    request.mockImplementation(async (_route, method, params) => {
      if (method === 'groups.capabilities') {
        return { driver: true, persistent_process: true, features: ['room_settings'] }
      }

      if (method === 'groups.create') {
        ids.push(params.room_id)

        if (ids.length === 1) {
          throw new Error('request timed out')
        }

        return { room: { room_id: params.room_id, name: params.name, members: params.members } }
      }

      // The hosted room is synced into the room store right after creation (canonical-room-sync.ts).
      if (method === 'groups.state') {
        return { room: { room_id: params.room_id, name: 'Existing', members: [] }, driver_status: {} }
      }

      if (method === 'groups.log') {
        return { events: [], has_more: false }
      }

      if (method === 'groups.settings.get') {
        return { revision: 1, settings: {} }
      }

      return {}
    })
    $groupChats.set({ Existing: { log: [], members: roster, running: false, watermarks: {} } })
    const onHosted = vi.fn()
    const rename = vi.fn(async (_old: string, next: string) => next)
    render(<HostOnGatewayButton group="Existing" members={roster} onHosted={onHosted} rename={rename} />)
    const host = await screen.findByRole('button', { name: botsText().group.hostOnGateway })

    const confirm = () =>
      act(async () => {
        fireEvent.click(screen.getByRole('button', { name: botsText().group.hostOnGatewayAction }))
      })

    fireEvent.click(host)
    await confirm()
    expect(await screen.findByText(CANONICAL_GROUP_LOCALES.en.createUncertain)).toBeTruthy()
    expect(onHosted).not.toHaveBeenCalled()
    expect(rename).not.toHaveBeenCalled()

    if (retry === 'reopened') {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      fireEvent.click(host)
    }

    await confirm()
    await waitFor(() => expect(onHosted).toHaveBeenCalledTimes(1))
    expect(ids).toHaveLength(2)
    expect(ids[1] === ids[0]).toBe(retry === 'confirmed again')
  }
)

// Desktop's own backend and SSH, URL and Cloud connections reach `hermes serve`
// (tui_gateway/methods_groups.py): it refuses a create with 4110, or 4123/5111 for a missing worker
// or a failure, and puts the reason in the message. The session gateway answers 4001 with data.detail.
it("keeps the gateway's own reason for a refused create from either server", () => {
  const labels = CANONICAL_GROUP_LOCALES.en
  const refused = labels.createRefused

  const rows: [unknown, string][] = [
    [
      {
        code: 4001,
        message: 'invalid_params',
        data: { reason: 'invalid_params', detail: "member 1 profile 'beta' is parked" }
      },
      `${refused} member 1 profile 'beta' is parked`
    ],
    [
      { code: 4001, message: 'permission_denied', data: { reason: 'permission_denied' } },
      `${refused} permission_denied`
    ],
    // Rejections arrive as JsonRpcGatewayError, or as plain objects across the IPC bridge.
    [
      Object.assign(new Error("member 2 profile 'gamma' is not served here"), {
        code: 4110,
        data: { reason: 'invalid_member' }
      }),
      `${refused} member 2 profile 'gamma' is not served here`
    ],
    [
      Object.assign(new Error('Group Chat worker is unavailable'), { code: 4123 }),
      `${refused} Group Chat worker is unavailable`
    ],
    [{ code: 5111, message: 'database is locked' }, `${refused} database is locked`],
    [new Error('request timed out: groups.create'), 'request timed out: groups.create'],
    [{ canonicalGroupProblem: 'otherConnection' }, labels.createOtherConnection]
  ]

  expect(rows.map(([error]) => canonicalGroupCreateError(error, labels))).toEqual(rows.map(([, words]) => words))
})
