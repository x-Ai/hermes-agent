/**
 * The two room-membership entry points offer only what the room can seat:
 * Manage members uses New Group Chat's seatable predicate for add candidates,
 * and New Group Chat is not offered when every seatable bot is on ONE other
 * connection (each selection there is refused), saying why instead.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { host } from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { WritableAtom } from 'nanostores'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { GroupDialog } from './create-dialog'
import { $botMeta, $lastRoster } from './data'
import { GroupMemberPicker } from './group-chat-view-members'
import { botsText } from './i18n'
import { translateBots, translateBotsIn } from './i18n-test-helper'
import { renderRosterToolbar } from './roster-pane-toolbar'
import type { RosterRow } from './types'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))

// The dialogs read their strings per render, so a test can pick the UI language.
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

const connectionId = host.state.connectionId as WritableAtom<string | null>
// One identity per language: the dialogs rebind their strings whenever the translator changes.
const translateZh = translateBotsIn('zh')

const remote = (name: string): RosterRow => ({
  name,
  connectionId: 'other-box',
  connectionLabel: 'Other box',
  remoteSource: true,
  route: { connectionId: 'other-box', mode: 'remote', profile: name, targetProfile: name }
})

// A row on this connection whose route names another one: New Group Chat hides it.
const spoofed: RosterRow = {
  name: 'spoofed',
  connectionId: 'local',
  remoteSource: true,
  route: { connectionId: 'other-box', mode: 'remote', profile: 'spoofed', targetProfile: 'spoofed' }
}

const alpha: RosterRow = { name: 'alpha', connectionId: 'local' }
const beta: RosterRow = { name: 'beta', connectionId: 'local' }

beforeEach(() => {
  i18n.locale = 'en'
  connectionId.set('local')
  request.mockReset().mockImplementation(async (_route, method) => {
    if (method === 'groups.capabilities') {
      return { driver: true, persistent_process: true, seatable_profiles: ['alpha', 'beta'] }
    }

    throw new Error(`Unexpected RPC: ${method}`)
  })
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
})
afterEach(() => {
  cleanup()
  $lastRoster.set([])
})

it('Manage members offers the seatable rows plus the current members, never a route-disagreeing row', async () => {
  $lastRoster.set([alpha, beta, remote('scout'), spoofed])

  const { baseElement } = render(
    <GroupMemberPicker group="Core" members={[alpha, remote('scout')]} onClose={vi.fn()} open />
  )

  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})

  const offered = [...baseElement.querySelectorAll('[data-testid="group-member-picker"] [role="checkbox"]')]
    .map(node => node.textContent || '')
    .join('\n')

  expect(offered).toContain('@alpha')
  expect(offered).toContain('@beta')
  expect(offered).toContain('Other box')
  expect(offered).not.toContain('spoofed')
})

it('Manage members will not uncheck a member whose machine is offline, and says why', async () => {
  const homelab: RosterRow = { ...remote('scout'), connectionLabel: 'Homelab', sourceReachable: false }
  $lastRoster.set([alpha, beta, homelab])

  const { baseElement } = render(
    <GroupMemberPicker group="Core" members={[alpha, beta, homelab]} onClose={vi.fn()} open />
  )

  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})

  const row = [...baseElement.querySelectorAll('[data-testid="group-member-picker"] [role="checkbox"]')].find(node =>
    node.textContent?.includes('@scout')
  ) as HTMLElement

  expect(row.textContent).toContain(botsText().crossGateway.memberOffline('Homelab', 'Scout'))
  expect(row.hasAttribute('disabled')).toBe(true)
  fireEvent.click(row)
  expect(row.getAttribute('aria-checked')).toBe('true')
})

it('Manage groups disables every change for a bot whose machine is offline, and says why', () => {
  const homelab: RosterRow = { ...remote('scout'), connectionLabel: 'Homelab', sourceReachable: false }
  $lastRoster.set([alpha, beta, homelab])
  $botMeta.set({ alpha: { groups: ['Core'] } })
  render(<GroupDialog bot={homelab} onClose={vi.fn()} />)

  expect(screen.getByTestId('group-dialog-locked').textContent).toBe(
    botsText().crossGateway.groupsOffline('Homelab', 'Scout')
  )
  expect(screen.getByRole('checkbox').hasAttribute('disabled')).toBe(true)
  expect(screen.getByRole('textbox').hasAttribute('disabled')).toBe(true)
})

it('Manage groups labels its create-and-join button in the UI language', () => {
  i18n.locale = 'zh'
  $lastRoster.set([alpha])
  render(<GroupDialog bot={alpha} onClose={vi.fn()} />)

  expect(screen.getByRole('button', { name: '创建并加入' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Create & join' })).toBeNull()
})

it('Manage members names This device in the UI language on a window that runs on another machine', async () => {
  i18n.locale = 'zh'
  connectionId.set('other-box')

  // From that window, this computer's agents are another source, and the registry labels
  // it "This device" whatever language the UI is in.
  const local: RosterRow = {
    name: 'alpha',
    connectionId: 'local',
    connectionKind: 'local',
    connectionLabel: 'This device',
    remoteSource: true,
    sourceReachable: false,
    route: { connectionId: 'local', mode: 'local', profile: 'alpha', targetProfile: 'alpha' }
  }

  $lastRoster.set([local])

  const { baseElement } = render(<GroupMemberPicker group="Core" members={[local]} onClose={vi.fn()} open />)

  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})

  const row = [...baseElement.querySelectorAll('[data-testid="group-member-picker"] [role="checkbox"]')].find(node =>
    node.textContent?.includes('@alpha')
  ) as HTMLElement

  expect(row.textContent).toContain('@alpha · 本设备')
  expect(row.textContent).toContain(translateZh('crossGateway.memberOffline', '本设备', 'Alpha'))
  expect(row.textContent).not.toContain('This device')
})

function renderToolbar(roster: RosterRow[]) {
  const setGroupCreateOpen = vi.fn()

  render(
    renderRosterToolbar({
      activeFilterCount: 0,
      activeSourceRoster: roster,
      activityFilter: 'all',
      activityToasts: false,
      b: botsText(),
      gatewayFilter: 'all',
      gatewayOptions: [],
      query: '',
      roster,
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

  return setGroupCreateOpen
}

// Fork contract: a selection wholly on another connection is never refused here; it becomes a
// Desktop room (create-dialog.tsx), so the menu item stays offered with no "elsewhere" note.
it('New Group Chat stays offered when every seatable bot is on one other connection', async () => {
  // This connection's only bot is one the authority will not seat.
  const setGroupCreateOpen = renderToolbar([
    { name: 'parked', connectionId: 'local' },
    remote('scout'),
    remote('scribe')
  ])

  const item = await screen.findByRole('menuitem', { name: botsText().group.newTitle })
  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})
  expect(item.hasAttribute('data-disabled')).toBe(false)
  expect(item.textContent).not.toContain(botsText().crossGateway.selectionElsewhere('Other box'))
  fireEvent.click(item)
  expect(setGroupCreateOpen).toHaveBeenCalledOnce()
})

it('New Group Chat stays offered for a selection that can span connections', async () => {
  const setGroupCreateOpen = renderToolbar([alpha, remote('scout'), remote('scribe')])

  const item = await screen.findByRole('menuitem', { name: botsText().group.newTitle })
  await waitFor(() => expect(request.mock.calls.map(call => call[1])).toContain('groups.capabilities'))
  await act(async () => {})
  expect(item.hasAttribute('data-disabled')).toBe(false)
  fireEvent.click(item)
  expect(setGroupCreateOpen).toHaveBeenCalledOnce()
})
