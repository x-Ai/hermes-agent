import { host } from '@hermes/plugin-sdk'
import type * as HermesSdk from '@hermes/plugin-sdk'
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { answerGroupRequests, PEER_MINI as MINI, PEER_HOME, peerRosterRow } from './canonical-group-contract-test-utils'
import { CANONICAL_GROUP_LOCALES } from './canonical-group-locales'
import { peerSetupText } from './canonical-group-peers'
import { $canonicalGroupBindings } from './canonical-group-registry'
import { CreateGroupChatDialog } from './create-dialog'
import { CROSS_GATEWAY_GROUP_LOCALES } from './cross-gateway-locales'
import { $botMeta } from './data'
import { $groupChats } from './group-chat'
import type * as GroupChatParts from './group-chat-parts'
import { translateBotsIn } from './i18n-test-helper'
import type { RosterRow } from './types'

// Fork: New group chat's setup note reads in the UI language. The note is the fork's own
// (`groupEngineNoteText`), so upstream's English-only check does not cover a translated UI.
const { request, active } = vi.hoisted(() => ({ request: vi.fn(), active: { locale: 'zh' as 'zh' | 'zh-hant' } }))
vi.mock('@hermes/plugin-sdk', async importOriginal => (await import('./canonical-group-contract-test-utils'))
  .localGatewaySdkMock(await importOriginal<typeof HermesSdk>(), request, () => TRANSLATORS[active.locale]))
vi.mock('./group-chat-parts', async importOriginal => ({ ...await importOriginal<typeof GroupChatParts>(), GroupImageControls: () => null }))

const TRANSLATORS = { zh: translateBotsIn('zh'), 'zh-hant': translateBotsIn('zh-hant') }
// A home that keeps this fork's room settings asks the lender (see canonical-group-peer-setup-copy.test.tsx).
const HOME = { ...PEER_HOME, features: [...PEER_HOME.features, 'room_settings'] }
const roster: RosterRow[] = [{ name: 'default', connectionId: 'local' }, peerRosterRow('mini', 'Mac Mini')]

beforeEach(() => {
  ;(host.state.gateway as ReturnType<typeof HermesSdk.atom<string>>).set('open')
  $canonicalGroupBindings.set({})
  $botMeta.set({})
  $groupChats.set({})
  request.mockReset()
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => { cleanup(); localStorage.clear() })

const box = (row: Element | undefined) => row?.closest('label')?.querySelector('button[role="checkbox"]') as HTMLButtonElement

it.each([
  ['zh', 'api_server_required', 'peerSetupApiServer'],
  ['zh-hant', 'gateway_roomlink_secret_unavailable', 'peerSetupRoomKey'],
  ['zh-hant', 'a_future_reason', 'peerSetupGeneric']
] as const)('explains a lender refusal in the %s UI (%s), not in English or as its code', async (locale, code, key) => {
  active.locale = locale
  answerGroupRequests(request, {
    local: method => method === 'groups.capabilities' ? { ...HOME, room_link: { enabled: false } } : undefined,
    mini: method => method === 'groups.capabilities' ? { ...MINI, room_link: { enabled: false, reason: code } } : undefined
  })
  const { baseElement } = render(<CreateGroupChatDialog onClose={vi.fn()} open roster={roster} />)
  await waitFor(() => expect(request.mock.calls.some(call => call[0]?.connectionId === 'mini')).toBe(true))
  await act(async () => {})
  const rows = [...baseElement.querySelectorAll('[data-bot-face="default"]')]
  fireEvent.click(box(rows[0]))
  fireEvent.click(box(rows[1]))
  const note = await waitFor(() => baseElement.querySelector('[data-group-engine="desktop"]')!)
  const words = CANONICAL_GROUP_LOCALES[locale]
  expect(note.textContent).toContain(CROSS_GATEWAY_GROUP_LOCALES[locale].desktopDriven)
  expect(note.textContent).toContain(peerSetupText(code, 'Mac Mini', words))
  expect(note.textContent).toContain(words[key])
  expect(note.textContent).not.toContain(CANONICAL_GROUP_LOCALES.en[key])
  expect(note.textContent).not.toContain(code)
  expect(note.textContent).not.toMatch(/[{}]/)
})
