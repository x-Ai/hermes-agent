import type * as HermesSdk from '@hermes/plugin-sdk'
import { host } from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { WritableAtom } from 'nanostores'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { CANONICAL_GROUP_LOCALES } from './canonical-group-locales'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { forgetCanonicalRouteFeatures } from './canonical-room-sync'
import { CreateGroupChatDialog } from './create-dialog'
import { CROSS_GATEWAY_GROUP_LOCALES } from './cross-gateway-locales'
import { $botMeta } from './data'
import {
  $groupChats,
  $groupChatWorkspace,
  groupChatSyncSnapshot,
  mergeGroupChatSyncSnapshots,
  mergeRemoteGroupChatSnapshotIntoRooms,
  updateGroupChat
} from './group-chat'
import type * as GroupChatModule from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { setGroupChatMembers } from './group-chat-view-members'
import { translateBots, translateBotsIn } from './i18n-test-helper'
import type { RosterRow } from './types'

// Group chats whose bots live on different connected machines (#141178, #142248):
// upstream runs every new group chat on a gateway and never makes a Desktop-driven
// room. This fork keeps one wherever the gateway here cannot host the selection,
// so a selection spanning connections becomes a Desktop-driven room instead of a
// refused groups.create, unless that gateway seats the other computers' bots.
//
// Fork contract: the gateway here hosts a room only when it advertises the fork's
// `room_settings` (canonical-room-actions.ts canCreateCanonicalRoom), so this
// fixture's gateway does; and a selection wholly on another connection is never
// refused, it becomes a Desktop room like any selection the gateway cannot host.

const { request, notify, openWorkspace } = vi.hoisted(() => ({
  request: vi.fn(),
  notify: vi.fn(),
  openWorkspace: vi.fn()
}))

// The dialog reads its strings per render, so a test can pick the UI language.
const i18n = vi.hoisted(() => ({ locale: 'en' as 'en' | 'zh' }))

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
    usePluginI18n: () => (i18n.locale === 'zh' ? translateZh : translateBots)
  }
})
vi.mock('./group-chat', async importOriginal => {
  const actual = await importOriginal<typeof GroupChatModule>()

  return {
    ...actual,
    updateGroupChat: vi.fn((group, mutate) => actual.updateGroupChat(group, mutate, { sync: false }))
  }
})
vi.mock('./group-chat-parts', async importOriginal => ({
  ...(await importOriginal<typeof GroupChatParts>()),
  GroupImageControls: () => null
}))

const connectionId = host.state.connectionId as WritableAtom<string | null>
// One identity per language: the dialog rebinds its strings whenever the translator changes.
const translateZh = translateBotsIn('zh')

const alpha: RosterRow = { name: 'alpha', connectionId: 'local', connectionLabel: 'This device' }
const beta: RosterRow = { name: 'beta', connectionId: 'local', connectionLabel: 'This device' }

const remote: RosterRow = {
  name: 'remote',
  connectionId: 'other-box',
  connectionLabel: 'Other box',
  remoteSource: true
}

const scout: RosterRow = { name: 'scout', connectionId: 'other-box', connectionLabel: 'Other box', remoteSource: true }
const unreachable: RosterRow = { ...remote, name: 'offline', sourceReachable: false }

const desktopDriven = CROSS_GATEWAY_GROUP_LOCALES.en.desktopDriven

beforeEach(() => {
  i18n.locale = 'en'
  connectionId.set('local')
  $canonicalGroupBindings.set({})
  $groupChats.set({})
  $groupChatWorkspace.set(null)
  $botMeta.set({})
  forgetCanonicalRouteFeatures()
  request.mockReset().mockImplementation(async (_route, method, params) => {
    if (method === 'groups.capabilities') {
      return {
        driver: true,
        persistent_process: true,
        seatable_profiles: ['alpha', 'beta'],
        features: ['room_settings']
      }
    }

    if (method === 'groups.create') {
      return { room: { room_id: params.room_id, name: params.name, members: params.members } }
    }

    // Fork: a hosted room is synced into the room store right after creation (canonical-room-sync.ts).
    if (method === 'groups.state') {
      return { room: { room_id: params.room_id, name: 'Room', members: [] }, driver_status: {} }
    }

    if (method === 'groups.log') {
      return { events: [], has_more: false }
    }

    if (method === 'groups.settings.get') {
      return { revision: 1, settings: {} }
    }

    if (method === 'groups.list') {
      return { rooms: [], next_offset: null }
    }

    if (method === 'profiles.configure') {
      return {}
    }

    return {}
  })
  notify.mockReset()
  openWorkspace.mockReset().mockReturnValue(() => undefined)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  $groupChats.set({})
  localStorage.clear()
})

async function pick(roster: RosterRow[], names: string[], previous?: ReturnType<typeof render>) {
  const onCreated = vi.fn()
  const dialog = <CreateGroupChatDialog onClose={vi.fn()} onCreated={onCreated} open roster={roster} />
  const view = previous ?? render(dialog)

  if (previous) {
    view.rerender(<CreateGroupChatDialog onClose={vi.fn()} open={false} roster={roster} />)
    view.rerender(dialog)
  }

  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})

  for (const name of names) {
    const face = view.baseElement.querySelector(`[data-bot-face="${name}"]`)
    fireEvent.click(face!.closest('label')!.querySelector('[role="checkbox"]')!)
  }

  return { onCreated, view }
}

it('offers bots from every reachable connection, each with its device badge', async () => {
  const { view } = await pick([alpha, beta, remote, unreachable], [])
  const badges = [...view.baseElement.querySelectorAll('[data-device-badge]')].map(node => node.textContent)

  expect(view.baseElement.querySelector('[data-bot-face="remote"]')).not.toBeNull()
  expect(view.baseElement.querySelector('[data-bot-face="offline"]')).toBeNull()
  expect(badges).toEqual(['This device', 'This device', 'Other box'])
})

it('names the local machine on its device badge in the UI language, never by its registry label', async () => {
  i18n.locale = 'zh'
  // The registry labels the local connection "This device" whatever language the UI is in.
  const { view } = await pick([alpha, beta, remote], [])
  const badges = [...view.baseElement.querySelectorAll('[data-device-badge]')].map(node => node.textContent)

  expect(badges).toEqual(['本设备', '本设备', 'Other box'])
})

it('a selection spanning two connections creates a Desktop-driven room, never a refused groups.create', async () => {
  const { onCreated } = await pick([alpha, beta, remote], ['alpha', 'remote'])

  expect(screen.getByRole('note').textContent).toBe(desktopDriven)
  const submit = screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement
  expect(submit.disabled).toBe(false)
  await act(async () => {
    fireEvent.click(submit)
  })

  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  expect($canonicalGroupBindings.get()).toEqual({})
  const [[group, origin]] = onCreated.mock.calls
  expect(origin).toBe('name')
  const members = $groupChats.get()[group].members ?? []
  expect(members.map((member: RosterRow) => [member.name, member.connectionId])).toEqual([
    ['alpha', 'local'],
    ['remote', 'other-box']
  ])
})

// Upstream never makes a spanning selection a Desktop-driven room. This fork still does wherever the
// gateway here cannot host it (the test above), but on a gateway that seats bots from other computers
// and keeps this fork's room settings, a lender that could not be checked holds Create back: the
// dialog names that computer, keeps the draft and offers Retry, and no Desktop room is made.
it('a selection spanning two connections never becomes a Desktop-driven room: it says which computer must change', async () => {
  const normal = request.getMockImplementation()!
  request.mockImplementation(async (route, method, params) => {
    if (method === 'groups.capabilities' && route?.connectionId === 'other-box') {
      throw new Error('request timed out')
    }

    if (method === 'groups.capabilities') {
      return {
        driver: true,
        persistent_process: true,
        seatable_profiles: ['alpha', 'beta'],
        features: ['room_settings'],
        methods: ['groups.peer.register']
      }
    }

    return normal(route, method, params)
  })
  const { onCreated } = await pick([alpha, beta, remote], ['alpha', 'remote'])

  await waitFor(() =>
    expect(screen.getByRole('note').textContent).toBe(CROSS_GATEWAY_GROUP_LOCALES.en.peerCheckFailed('Other box'))
  )
  const submit = screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement
  expect(submit.disabled).toBe(true)
  await act(async () => {
    fireEvent.click(submit)
  })

  expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  expect(onCreated).not.toHaveBeenCalled()
  expect($groupChats.get()).toEqual({})
})

it('a selection on this connection alone still creates the gateway-owned room (control)', async () => {
  const { onCreated } = await pick([alpha, beta, remote], ['alpha', 'beta'])

  expect(screen.queryByRole('note')).toBeNull()
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' }))
  })

  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(1)
  expect(onCreated.mock.calls[0][1]).toBe('key')
  expect(Object.values($canonicalGroupBindings.get())).toHaveLength(1)
})

it.each(['unchanged', 'reopened after disband', 'disbanded', 'renamed', 'disbanded, named refusal'])(
  'keeps an uncertain create only for its open dialog and live identity: %s',
  async scenario => {
    const stored = new Map<string, { room_id: string; name: string; members: unknown; ended?: boolean }>()
    const normal = request.getMockImplementation()!
    let loseReply = true
    request.mockImplementation(async (route, method, params) => {
      if (method !== 'groups.create') {
        return normal(route, method, params)
      }

      const previous = stored.get(params.room_id)

      const reason = previous?.ended
        ? 'room_id belongs to a disbanded room'
        : previous &&
            (previous.name !== params.name || JSON.stringify(previous.members) !== JSON.stringify(params.members))
          ? 'room_id already exists with different state'
          : null

      // A canonical gateway only says invalid_params; a standalone one names the conflict.
      if (reason && scenario.includes('named')) {
        throw Object.assign(new Error(reason), { code: 4110 })
      }

      if (reason) {
        throw Object.assign(new Error('invalid_params'), { code: 4001, data: { reason: 'invalid_params' } })
      }

      const room = previous ?? { room_id: params.room_id, name: params.name, members: params.members }
      stored.set(params.room_id, room)

      if (loseReply) {
        loseReply = false
        throw new Error('request timed out')
      }

      return { room }
    })
    let { view, onCreated } = await pick([alpha, beta], ['alpha', 'beta'])

    const submit = () =>
      act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' }))
      })

    await submit()
    expect(onCreated).not.toHaveBeenCalled()
    screen.getByText(CANONICAL_GROUP_LOCALES.en.createUncertain)
    expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }))
    const first = [...stored.values()][0]

    if (scenario.includes('disband')) {
      first.ended = true
    }

    if (scenario === 'renamed') {
      first.name = 'Changed elsewhere'
    }

    if (scenario === 'reopened after disband') {
      ;({ view, onCreated } = await pick([alpha, beta], ['alpha', 'beta'], view))
    }

    await submit()

    if (scenario.includes('disbanded') || scenario === 'renamed') {
      expect(onCreated).not.toHaveBeenCalled()
      screen.getByText(CANONICAL_GROUP_LOCALES.en.createEnded)
      await submit()
    }

    expect(onCreated).toHaveBeenCalledTimes(1)
    const creates = request.mock.calls.filter(call => call[1] === 'groups.create')

    if (scenario === 'unchanged') {
      expect(creates[1][2]).toEqual(creates[0][2])
      expect(stored.size).toBe(1)
    } else {
      expect(creates.at(-1)![2].room_id).not.toBe(first.room_id)
      expect(stored.size).toBe(2)
    }
  }
)

it.each(['reopened', 'edited'])('a late answer says nothing about the current draft: %s', async change => {
  const normal = request.getMockImplementation()!
  let fail: (error: Error) => void = () => undefined
  request.mockImplementation(async (route, method, params) =>
    method === 'groups.create'
      ? new Promise((_, reject) => {
          fail = reject
        })
      : normal(route, method, params)
  )
  const { view } = await pick([alpha, beta], ['alpha', 'beta'])
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' }))
  })

  if (change === 'reopened') {
    await pick([alpha, beta], ['alpha', 'beta'], view)
  } else {
    fireEvent.change(screen.getByRole('textbox', { name: translateBots('group.nameLabel') }), {
      target: { value: 'Other' }
    })
  }

  await act(async () => {
    fail(new Error('request timed out'))
  })
  expect(screen.queryByText(CANONICAL_GROUP_LOCALES.en.createUncertain)).toBeNull()
})

it('says in the UI language that a create whose reply was lost is safe to try again', async () => {
  i18n.locale = 'zh'
  const normal = request.getMockImplementation()!

  request.mockImplementation(async (route, method, params) => {
    if (method === 'groups.create') {
      throw new Error('request timed out')
    }

    return normal(route, method, params)
  })
  await pick([alpha, beta], ['alpha', 'beta'])
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: translateZh('group.createAction', 2) }))
  })

  expect(screen.getByText(CANONICAL_GROUP_LOCALES.zh.createUncertain)).toBeTruthy()
  expect(screen.queryByText(CANONICAL_GROUP_LOCALES.en.createUncertain)).toBeNull()
  expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }))
})

it('a selection wholly on another connection creates a Desktop room here, never refused (fork)', async () => {
  const { onCreated } = await pick([alpha, remote, scout], ['remote', 'scout'])

  expect(screen.getByRole('note').textContent).toBe(desktopDriven)
  const submit = screen.getByRole('button', { name: 'Create group (2)' }) as HTMLButtonElement
  expect(submit.disabled).toBe(false)
  await act(async () => {
    fireEvent.click(submit)
  })

  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  const [[group, origin]] = onCreated.mock.calls
  expect(origin).toBe('name')
  expect(($groupChats.get()[group].members ?? []).map((member: RosterRow) => member.name)).toEqual(['remote', 'scout'])
})

it('a room whose members span connections opens in the Desktop-driven view on a gateway-owned install', async () => {
  await act(async () => {
    render(<GroupChatWorkspace group="Mixed" members={[alpha, remote]} />)
  })

  expect(screen.queryByRole('button', { name: 'Start gateway group' })).toBeNull()
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  expect(request.mock.calls.filter(call => call[1] === 'groups.list')).toHaveLength(0)
})

it('a room created across connections stays Desktop-driven after its remote member is removed', async () => {
  const { onCreated, view } = await pick([alpha, beta, remote], ['alpha', 'beta', 'remote'])
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create group (3)' }))
  })
  view.unmount()
  const [[group]] = onCreated.mock.calls

  expect($groupChats.get()[group].engine).toBe('desktop')

  // Manage groups removed the remote bot: every remaining member is on this connection.
  await act(async () => {
    render(<GroupChatWorkspace group={group} members={[alpha, beta]} />)
  })

  expect(screen.queryByRole('button', { name: 'Start gateway group' })).toBeNull()
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  expect(request.mock.calls.filter(call => call[1] === 'groups.list')).toHaveLength(0)
})

it('an existing Desktop-driven room stays Desktop-driven after its remote member is removed', async () => {
  // Saved before this edit (an older build, or this fork's Desktop room): the edit keeps its engine.
  updateGroupChat('Mixed', room => ({ ...room, engine: 'desktop', members: [alpha, beta, remote], roomId: 'old-room' }))
  await act(async () => {
    await setGroupChatMembers('Mixed', [alpha, beta])
  })

  expect($groupChats.get().Mixed.engine).toBe('desktop')

  // Manage groups removed the remote bot: every remaining member is on this connection.
  await act(async () => {
    render(<GroupChatWorkspace group="Mixed" members={[alpha, beta]} />)
  })

  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  expect(request.mock.calls.filter(call => call[1] === 'groups.list')).toHaveLength(0)
})

it("a room's Desktop engine rides room sync, so another Desktop keeps driving it too", () => {
  const room = {
    engine: 'desktop' as const,
    log: [{ at: 1, from: { kind: 'user' as const, name: 'You' }, id: 'm1', text: 'hi' }],
    members: [alpha, beta],
    roomId: 'r1',
    watermarks: {}
  }

  const published = groupChatSyncSnapshot({ Mixed: room })
  const merged = mergeGroupChatSyncSnapshots({ version: 3, rooms: {} }, published)

  expect(Object.values(merged.rooms)[0].engine).toBe('desktop')
  expect(mergeRemoteGroupChatSnapshotIntoRooms(merged, {}).Mixed.engine).toBe('desktop')
})
