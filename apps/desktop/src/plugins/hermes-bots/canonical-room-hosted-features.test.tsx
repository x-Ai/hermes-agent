import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { declaredGroupMethod } from './canonical-group-contract-test-utils'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { _resetCanonicalRoomSyncForTests, syncCanonicalRoom } from './canonical-room-sync'
import { $botMeta } from './data'
import { $groupChats, $groupChatWorkspace } from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { botsText } from './i18n'
import { translateBots } from './i18n-test-helper'
import type { RosterRow } from './types'

const { request, notify } = vi.hoisted(() => ({ request: vi.fn(), notify: vi.fn() }))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()
  const { en } = await import('@/i18n/en')

  return {
    ...sdk,
    host: {
      ...sdk.host,
      // Fork: the hosted-room path calls this fork's groups.settings.* / member_sessions / live /
      // watch methods, which upstream's contract checker (captureGroupRequests) does not declare;
      // the hosted-room features under test are checked against the contract one by one below.
      requestProfile: request,
      notify,
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
    usePluginI18n: () => translateBots,
    // A native <select> stands in for the Radix one: same value/onValueChange contract.
    Select: ({
      children,
      disabled,
      onValueChange,
      value
    }: {
      children: ReactNode
      disabled?: boolean
      onValueChange: (value: string) => void
      value: string
    }) => (
      <select
        aria-label="routing"
        disabled={disabled}
        onChange={event => onValueChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    ),
    SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
    SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
      <option value={value}>{children}</option>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null
  }
})
vi.mock('./group-chat-parts', async importOriginal => ({
  ...(await importOriginal<typeof GroupChatParts>()),
  // Avatar generation is unrelated to these features; never request a model.
  GroupImageControls: () => null
}))

const KEY = 'canonical:local:default:r1'
const BINDING = { connectionId: 'local', profile: 'default', roomId: 'r1' }

const ROOM = {
  room_id: 'r1',
  name: 'Release room',
  members: [
    { member_id: 'alpha', profile: 'alpha', handle: 'alpha', display_name: 'Alpha' },
    { member_id: 'beta', profile: 'beta', handle: 'beta', display_name: 'Beta' }
  ]
}

// The room view seats the roster rows its messages are named by (GroupChatMainView).
const ROSTER: RosterRow[] = [
  { name: 'alpha', connectionId: 'local', title: 'Alpha' },
  { name: 'beta', connectionId: 'local', title: 'Beta' }
]

// `groups.capabilities.methods` as the standalone server lists them (tui_gateway/methods_groups.py).
const METHODS = [
  'groups.capabilities',
  'groups.state',
  'groups.log',
  'groups.send',
  'groups.rename',
  'groups.context',
  'groups.disband',
  'groups.stop',
  'groups.continue',
  'groups.settings.get',
  'groups.settings.set'
]

type RoomEvent = {
  seq: number
  event_id?: string
  kind: string
  actor?: Record<string, string>
  payload: Record<string, unknown>
}

/** A discussion the router gave to Alpha that hit its cap after two replies, then a scheduled job's post. */
const EVENTS: RoomEvent[] = [
  {
    seq: 1,
    event_id: 'u1',
    kind: 'message.user',
    actor: { kind: 'user', id: 'desktop' },
    payload: { text: 'Plan the release', thread_id: 't1' }
  },
  {
    seq: 2,
    event_id: 'droute:u1',
    kind: 'room.routed',
    actor: { kind: 'gateway', id: 'install:test' },
    payload: { discussion_event_id: 'u1', thread_id: 't1', member_ids: ['alpha'], everyone: false, fallback: false }
  },
  {
    seq: 3,
    event_id: 'm1',
    kind: 'message.member',
    actor: { kind: 'member', id: 'alpha' },
    payload: { text: 'First reply', thread_id: 't1', member_id: 'alpha', discussion_event_id: 'u1' }
  },
  {
    seq: 4,
    event_id: 'm2',
    kind: 'message.member',
    actor: { kind: 'member', id: 'beta' },
    payload: { text: 'Second reply', thread_id: 't1', member_id: 'beta', discussion_event_id: 'u1' }
  },
  {
    seq: 5,
    event_id: 'cap:u1:0',
    kind: 'room.activity',
    payload: { status: 'bounded', discussion_event_id: 'u1', thread_id: 't1' }
  },
  {
    seq: 6,
    event_id: 'cron-post:1',
    kind: 'message.user',
    actor: { kind: 'user', id: 'cron:digest', display_name: 'Daily digest' },
    payload: { text: 'Digest is ready', thread_id: 'cron-1' }
  }
]

/** Every key a call sends is one the gateway declares for it, and every required key is sent. */
function expectDeclared(method: string, params: Record<string, unknown>) {
  const declared = declaredGroupMethod(method)?.params
  const sent = Object.keys(params).filter(key => params[key] !== undefined)

  expect(declared, `${method} is declared`).toBeDefined()
  expect(sent.filter(key => !declared!.fields.includes(key))).toEqual([])
  expect(declared!.required.filter(key => !sent.includes(key))).toEqual([])
}

/** A stateful stand-in for the room's gateway, answering as `HostedRoomService` does: Continue appends
 *  `room.continued` onto a paused discussion (and refuses one that is not paused), a context save appends
 *  `room.context_set`, and both show up on the next `groups.state` / `groups.log` read. */
function gateway({ methods = METHODS }: { methods?: string[] } = {}) {
  const events = EVENTS.map(event => ({ ...event }))

  const state = {
    calls: [] as Array<[string, Record<string, unknown>]>,
    context: { purpose: 'Ship v2', notes: 'Fridays only', routing: 'lead', lead_member_id: 'alpha' } as Record<
      string,
      unknown
    >
  }

  const append = (kind: string, payload: Record<string, unknown>, event_id: string) => {
    const event = { seq: events.length + 1, event_id, kind, payload }
    events.push(event)

    return event
  }

  request.mockImplementation(async (_route: unknown, method: string, params: Record<string, unknown> = {}) => {
    state.calls.push([method, params])

    switch (method) {
      case 'groups.capabilities':
        return { driver: true, features: ['room_identity', 'room_settings'], methods }

      case 'groups.state':
        return {
          room: ROOM,
          context: state.context,
          driver_status: { working: false, max_continues: 5, routing_modes: ['everyone', 'lead', 'auto'] }
        }

      case 'groups.log':
        return { events: events.filter(event => event.seq > Number(params.since_seq || 0)), has_more: false }

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
      case 'groups.continue': {
        expectDeclared(method, params)
        const discussion = String(params.discussion_event_id)

        const latest = events
          .filter(event => event.payload.discussion_event_id === discussion)
          .filter(event => event.kind === 'room.continued' || event.kind === 'room.activity')
          .at(-1)

        if (latest?.payload.status !== 'bounded') {
          throw new Error('This discussion is not paused.')
        }

        const grant = events.filter(event => event.kind === 'room.continued').length + 1

        const event = append(
          'room.continued',
          { discussion_event_id: discussion, thread_id: 't1', grant },
          `dcontinue:${discussion}:${grant}`
        )

        return { continued: true, event }
      }

      case 'groups.context': {
        expectDeclared(method, params)
        const { event_id: eventId, room_id: _room, profile: _profile, ...context } = params
        state.context = { ...state.context, ...context }

        return { context: state.context, event: append('room.context_set', state.context, String(eventId)) }
      }

      default:
        throw new Error(`Unexpected RPC: ${method}`)
    }
  })

  return state
}

const sent = (state: ReturnType<typeof gateway>, method: string) =>
  state.calls.filter(([name]) => name === method).map(([, params]) => params)

/** The view reads the gateway's method list beside the room sync: wait until both have answered. */
async function openRoom(state: ReturnType<typeof gateway>) {
  render(<GroupChatWorkspace group={KEY} members={ROSTER} origin="key" />)
  await screen.findByText('Paused after 2 messages')
  await waitFor(() => expect(sent(state, 'groups.capabilities').length).toBeGreaterThanOrEqual(2))
  await act(async () => {})
}

beforeEach(() => {
  _resetCanonicalRoomSyncForTests()
  $canonicalGroupBindings.set({ [KEY]: BINDING })
  $groupChats.set({})
  $groupChatWorkspace.set(null)
  $botMeta.set({})
  request.mockReset()
  notify.mockReset()
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  _resetCanonicalRoomSyncForTests()
  $groupChats.set({})
  localStorage.clear()
})

it('a hosted room paused at its cap offers Continue, and Continue reopens the discussion on its gateway', async () => {
  const state = gateway()
  await openRoom(state)

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  })

  expect(sent(state, 'groups.continue')).toEqual([{ discussion_event_id: 'u1', profile: 'default', room_id: 'r1' }])
  // The gateway's `room.continued` retires this pause: its buttons go, the notice stays as history.
  expect(await screen.findByText('Continued')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  expect(screen.getByText('Paused after 2 messages')).toBeTruthy()
  expect(notify).not.toHaveBeenCalled()
})

it('offers no Continue where the gateway does not list groups.continue', async () => {
  const state = gateway({ methods: METHODS.filter(method => method !== 'groups.continue') })
  await openRoom(state)

  expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  expect(screen.queryByTestId('room-paused-stop')).toBeNull()
  expect(sent(state, 'groups.continue')).toEqual([])
})

it("shows who the router assigned, the room's lead and a scheduled job's post", async () => {
  await openRoom(gateway())

  const routed = screen.getByTestId('room-routed')
  expect(routed.textContent).toBe('Assigned to Alpha')
  // Between the message it routed and the replies it started.
  expect(screen.getByText('Plan the release').compareDocumentPosition(routed)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  expect(routed.compareDocumentPosition(screen.getByText('First reply'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

  const lead = screen.getByTestId('group-lead-chip')
  expect(lead.textContent).toBe('AlphaLead')
  expect(lead.getAttribute('aria-label')).toBe('Lead: Alpha')

  expect(screen.getByTestId('group-scheduled-post').textContent).toBe('Scheduled')
  expect(screen.getByText('Daily digest')).toBeTruthy()
})

it("Group settings saves a hosted room's purpose, notes and routing on its gateway", async () => {
  const state = gateway()
  await openRoom(state)

  fireEvent.click(screen.getByRole('button', { name: botsText().group.settingsLabel('Release room') }))
  const purpose = await screen.findByPlaceholderText('What this group chat is for, in one line')
  expect((purpose as HTMLInputElement).value).toBe('Ship v2')
  expect((screen.getByPlaceholderText('Facts every member should keep in mind') as HTMLTextAreaElement).value).toBe(
    'Fridays only'
  )
  expect(screen.getByText('room:r1@default')).toBeTruthy()

  const routing = screen.getByRole('combobox', { name: 'routing' }) as HTMLSelectElement
  expect(routing.value).toBe('member:alpha')
  expect([...routing.options].map(option => option.textContent)).toEqual([
    'Everyone answers',
    'Pick who answers automatically',
    'Lead: Alpha',
    'Lead: Beta'
  ])

  fireEvent.change(purpose, { target: { value: '  Ship   v3 ' } })
  fireEvent.change(routing, { target: { value: 'auto' } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

  expect(sent(state, 'groups.context')).toEqual([
    {
      event_id: expect.any(String),
      lead_member_id: '',
      notes: 'Fridays only',
      profile: 'default',
      purpose: 'Ship v3',
      room_id: 'r1',
      routing: 'auto'
    }
  ])
  // The lead room is now automatic: the header's lead chip goes with it.
  await waitFor(() => expect(screen.queryByTestId('group-lead-chip')).toBeNull())
})

// The room's key is opaque (`canonical:…`): the dialog once seeded its name field with it, and Save then
// renamed the hosted room to its own key.
it("Save leaves a hosted room's name, purpose, notes and routing alone when the user did", async () => {
  const state = gateway()
  await openRoom(state)

  fireEvent.click(screen.getByRole('button', { name: botsText().group.settingsLabel('Release room') }))
  await screen.findByPlaceholderText('What this group chat is for, in one line')
  expect((screen.getByRole('textbox', { name: botsText().group.nameLabel }) as HTMLInputElement).value).toBe(
    'Release room'
  )
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

  expect(sent(state, 'groups.rename')).toEqual([])
  expect(sent(state, 'groups.context')).toEqual([])
  expect(notify).not.toHaveBeenCalled()
})

it('Save writes only what the user changed over what another client saved while the dialog was open', async () => {
  const state = gateway()
  await openRoom(state)

  fireEvent.click(screen.getByRole('button', { name: botsText().group.settingsLabel('Release room') }))
  const notes = await screen.findByPlaceholderText('Facts every member should keep in mind')
  // Another Desktop re-purposes the room and hands it to automatic routing.
  state.context = { purpose: 'Ship v3', notes: 'Fridays only', routing: 'auto', lead_member_id: '' }
  await act(async () => {
    await syncCanonicalRoom(KEY, BINDING)
  })
  fireEvent.change(notes, { target: { value: 'Fridays and Mondays' } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

  expect(sent(state, 'groups.context')).toEqual([
    expect.objectContaining({ purpose: 'Ship v3', notes: 'Fridays and Mondays', routing: 'auto', lead_member_id: '' })
  ])
})

it("Save waits while the shared notes are past the gateway's cap", async () => {
  await openRoom(gateway())

  fireEvent.click(screen.getByRole('button', { name: botsText().group.settingsLabel('Release room') }))
  const notes = await screen.findByPlaceholderText('Facts every member should keep in mind')
  fireEvent.change(notes, { target: { value: 'x'.repeat(4097) } })

  expect(screen.getByTestId('room-notes-bytes').textContent).toBe('4097 / 4096')
  expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).disabled).toBe(true)
})

it('Group settings offers no purpose, notes or routing where the gateway does not list groups.context', async () => {
  await openRoom(gateway({ methods: METHODS.filter(method => method !== 'groups.context') }))

  fireEvent.click(screen.getByRole('button', { name: botsText().group.settingsLabel('Release room') }))
  await screen.findByRole('button', { name: 'Save' })

  expect(screen.queryByTestId('group-settings-hosted-context')).toBeNull()
  expect(screen.queryByPlaceholderText('What this group chat is for, in one line')).toBeNull()
})
