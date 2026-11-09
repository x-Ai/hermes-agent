/**
 * Fork contract: New group chat keeps its picture. Upstream dropped the picker because its gateway
 * group chats have no picture field; this fork's hosted room keeps the picture on its row, in this
 * Desktop's plugin storage (canonical-room-prefs.ts), and the gateway's create request still
 * carries none.
 */
import { host } from '@hermes/plugin-sdk'
import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import type * as AvatarImage from './avatar-image'
import { answerGroupRequests, PEER_HOME, strictGroupCreation } from './canonical-group-contract-test-utils'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { _resetCanonicalRoomPrefsForTests, canonicalRoomPrefs } from './canonical-room-prefs'
import { CreateGroupChatDialog } from './create-dialog'
import { $botMeta } from './data'
import { $groupChats } from './group-chat'
import { translateBots } from './i18n-test-helper'
import { setPluginCtx } from './shared'
import type { RosterRow } from './types'

const PICTURE = 'data:image/png;base64,iVBORw0KGgo='

const { request, notify } = vi.hoisted(() => ({ request: vi.fn(), notify: vi.fn() }))
vi.mock('@hermes/plugin-sdk', async importOriginal => (await import('./canonical-group-contract-test-utils'))
  .localGatewaySdkMock(await importOriginal<typeof HermesSdk>(), request, () => translateBots, { notify }))
vi.mock('./avatar-image', async importOriginal => ({
  ...await importOriginal<typeof AvatarImage>(),
  normalizeAvatarImage: vi.fn(async (raw: string) => raw),
  pickImageFromDevice: vi.fn(async () => PICTURE)
}))

// A gateway that keeps this fork's room settings hosts the group chat.
const HOME = { ...PEER_HOME, features: [...PEER_HOME.features, 'room_settings'] }
const here: RosterRow = { name: 'default', connectionId: 'local' }
const beta: RosterRow = { name: 'beta', connectionId: 'local' }

beforeEach(() => {
  ;(host.state.gateway as ReturnType<typeof HermesSdk.atom<string>>).set('open')
  _resetCanonicalRoomPrefsForTests()
  $canonicalGroupBindings.set({})
  $botMeta.set({})
  $groupChats.set({})
  request.mockReset()
  notify.mockReset()
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => { cleanup(); setPluginCtx(null); localStorage.clear() })

const box = (face: Element | null) => face?.closest('label')?.querySelector('button[role="checkbox"]') as HTMLButtonElement

it('keeps the picture chosen in New group chat on the hosted room it makes, and sends the gateway none', async () => {
  const { rooms, create } = strictGroupCreation()
  answerGroupRequests(request, {
    local: (method, params) => method === 'groups.create' ? create(params) : ({
      'groups.capabilities': HOME,
      'groups.state': { room: rooms.get(params.room_id), driver_status: {} },
      'groups.log': { events: [], has_more: false },
      'groups.settings.get': { revision: 1, settings: { workspace: null, member_workspaces: {}, handle: null } }
    } as Record<string, unknown>)[method]
  })
  const onCreated = vi.fn()
  const view = render(<CreateGroupChatDialog onClose={vi.fn()} onCreated={onCreated} open roster={[here, beta]} />)
  await waitFor(() => expect(request.mock.calls.some(call => call[1] === 'groups.capabilities')).toBe(true))
  await act(async () => {})
  fireEvent.click(box(view.baseElement.querySelector('[data-bot-face="default"]')))
  fireEvent.click(box(view.baseElement.querySelector('[data-bot-face="beta"]')))
  fireEvent.change(screen.getByRole('textbox', { name: 'Group name' }), { target: { value: 'Team' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Upload' })) })
  await waitFor(() => expect(view.baseElement.querySelector(`img[src="${PICTURE}"]`)).not.toBeNull())

  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create group (2)' })) })

  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce())
  const [key, origin] = onCreated.mock.calls[0]
  expect(origin).toBe('key')
  expect(key).toMatch(/^canonical:local:default:/)
  expect(canonicalRoomPrefs(key)?.image).toBe(PICTURE)
  expect($groupChats.get()[key]?.image).toBe(PICTURE)
  const [sent] = request.mock.calls.filter(call => call[1] === 'groups.create').map(call => call[2])
  expect(sent).toMatchObject({ name: 'Team' })
  expect(JSON.stringify(sent)).not.toContain(PICTURE)
})
