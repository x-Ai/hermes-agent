import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { answerGroupRequests, PEER_MINI as MINI, PEER_HOME, PEER_REGISTERED, peerInvitation, peerRosterRow, strictGroupCreation } from './canonical-group-contract-test-utils'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { $lastRoster } from './data'
import { $groupChats } from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { GroupChatWorkspace } from './group-chat-view'
import { translateBotsIn } from './i18n-test-helper'
import type { GroupMember } from './types'

const { request, notify, openWorkspace, language } = vi.hoisted(() => ({ request: vi.fn(), notify: vi.fn(), openWorkspace: vi.fn(), language: { value: 'en' as 'en' | 'fr' } }))
vi.mock('@hermes/plugin-sdk', async importOriginal => (await import('./canonical-group-contract-test-utils'))
  .localGatewaySdkMock(await importOriginal<typeof HermesSdk>(), request, () => translateBotsIn(language.value), { notify, openWorkspace, connections: vi.fn(async () => []) }))
vi.mock('./group-chat-parts', async importOriginal => ({ ...await importOriginal<typeof GroupChatParts>(), GroupImageControls: () => null }))

const mini = { ...peerRosterRow('mini', 'Mac Mini'), handle: 'hermes' }

// A classic room from before #106742: a Bot here and the default Bot of another computer (#142926).
const members: GroupMember[] = [{ name: 'default', handle: 'hermes', connectionId: 'local' }, mini]
const log = [{ at: 1, from: { kind: 'user', name: 'You' }, id: 'u1', text: 'Earlier question', thread: 't1' }]

function gateways(miniCapabilities: unknown = MINI, create = strictGroupCreation().create) {
  answerGroupRequests(request, {
    mini: method => ({ 'groups.capabilities': miniCapabilities, 'groups.peer.invite': peerInvitation() } as Record<string, unknown>)[method],
    local: (method, params) => method === 'groups.create' ? create(params) : ({
      'groups.capabilities': PEER_HOME, 'groups.list': { rooms: [], next_offset: null }, 'groups.peer.register': PEER_REGISTERED
    } as Record<string, unknown>)[method]
  })
}

beforeEach(() => {
  language.value = 'en'
  Element.prototype.scrollIntoView = vi.fn()
  $canonicalGroupBindings.set({})
  $groupChats.set({ Pair: { log, running: false, members, sessions: {}, watermarks: {}, engine: 'desktop' } } as never)
  $lastRoster.set([{ name: 'default', connectionId: 'local' }, mini])
  request.mockReset()
  notify.mockReset()
  openWorkspace.mockReset().mockReturnValue(() => undefined)
})
afterEach(() => { cleanup(); $groupChats.set({}); $lastRoster.set([]) })

// Upstream removed the "Start a group chat that runs without Desktop" offer (canonical-group-upgrade.tsx)
// with the copy only it used: an existing Desktop-driven room keeps its history and composer and is
// never converted on its own. In this fork such a room moves onto its gateway through Group settings'
// Host on the gateway… (canonical-room-migrate.tsx). These cases keep the old offer's scenarios and
// check that the room stays usable and that nothing is created behind the person's back.
const OLD_OFFER = 'Start a group chat that runs without Desktop'

it.each([
  ['ready', MINI, true],
  ['lender unavailable', { ...MINI, room_link: { enabled: false } }, false],
  ['checks pending', new Promise(() => undefined), false]
])('keeps the Desktop room usable and offers a separate gateway group only when ready (%s)', async (_case, capabilities, _ready) => {
  gateways(capabilities)
  await act(async () => { render(<GroupChatWorkspace group="Pair" members={members} />) })
  await screen.findByText('Earlier question')
  expect(screen.getByRole('textbox', { name: 'Message Pair' })).toBeTruthy()
  // Even a lender that is ready gets no separate offer: the room is never converted on its own.
  await act(async () => {})
  expect(screen.queryByRole('button', { name: OLD_OFFER })).toBeNull()
  expect(request.mock.calls.some(call => call[1] === 'groups.create')).toBe(false)
  expect($groupChats.get().Pair).toMatchObject({ engine: 'desktop', log, members })
  expect(Object.values($canonicalGroupBindings.get())).toHaveLength(0)
  expect(notify).not.toHaveBeenCalled()
})

it.each(['lost', 'refused'])('keeps the upgrade creation intent only while uncertain (%s)', async outcome => {
  const { rooms, create } = strictGroupCreation()
  let lost = true
  gateways(MINI, params => {
    if (lost && outcome === 'refused') {lost = false; throw Object.assign(new Error('invalid_params'), { code: 4001 })}
    const answer = create(params)

    if (lost) {lost = false; throw new Error('reply lost')}

    return answer
  })
  render(<GroupChatWorkspace group="Pair" members={members} />)
  await screen.findByText('Earlier question')
  await act(async () => {})
  // No upgrade means no creation intent at all: nothing is sent, so nothing can be lost or refused.
  expect(screen.queryByRole('button', { name: OLD_OFFER })).toBeNull()
  expect(screen.queryByRole('alert')).toBeNull()
  expect(rooms.size).toBe(0)
  expect(request.mock.calls.filter(call => call[1] === 'groups.create')).toHaveLength(0)
  expect($groupChats.get().Pair).toMatchObject({ engine: 'desktop', log, members })
})

it.each(['en', 'fr'] as const)('localizes upgrade roster refusals (%s)', async locale => {
  language.value = locale
  const collision = [...members, { name: 'hermes-mac-mini', connectionId: 'local' }]
  gateways()
  render(<GroupChatWorkspace group="Pair" members={collision} />)
  await screen.findByText('Earlier question')
  await act(async () => {})
  // The offer and its words are gone in every language; the room keeps its composer and asks nothing.
  expect(screen.queryByRole('button', { name: OLD_OFFER })).toBeNull()
  expect(screen.queryByRole('alert')).toBeNull()
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  expect(translateBotsIn(locale)('crossGateway.startGatewayGroup')).toBe('crossGateway.startGatewayGroup')
  expect(request.mock.calls.some(call => call[1] === 'groups.create')).toBe(false)
})
