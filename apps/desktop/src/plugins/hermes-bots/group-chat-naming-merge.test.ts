import { afterEach, expect, it, vi } from 'vitest'

import type * as roomActions from './canonical-room-actions'

// Two resolutions of the "one name for group chats" merge (upstream 90dae2a7e3):
//  - upstream re-worded the `canonical:` guard in `sendToGroupChat`; this fork had dropped that
//    guard because its composer sends a gateway-hosted room's message through `sendToGroupChat`
//    (canonical-room-actions.ts), so the guard must stay out;
//  - French, German and Spanish read upstream's shared group surface through this fork's key names
//    and shapes (`createAction(count)`, `deleted`, `deletedGroup(name)`, roster filter labels).

const { host, sendToCanonicalRoom } = vi.hoisted(() => ({
  host: {} as Record<string, unknown>,
  sendToCanonicalRoom: vi.fn(() => 'thread-1')
}))

vi.mock('@hermes/plugin-sdk', async () => (await import('./group-test-utils')).pluginSdkMock(host))
vi.mock('./canonical-room-actions', async importOriginal => ({
  ...(await importOriginal<typeof roomActions>()),
  sendToCanonicalRoom
}))

import { $groupChats } from './group-chat'
import { sendToGroupChat } from './group-rounds'
import { BOTS_LOCALES } from './i18n'
import { translateBotsIn } from './i18n-test-helper'

afterEach(() => {
  $groupChats.set({})
  sendToCanonicalRoom.mockClear()
})

it('sends a message for a group chat hosted on its gateway through the hosted action, not a refusal', () => {
  const key = 'canonical:local:team:room-1'

  const room = {
    canonical: { connectionId: 'local', profile: 'team', roomId: 'room-1' },
    log: [],
    members: [],
    running: false
  }

  $groupChats.set({ [key]: room } as never)

  expect(sendToGroupChat(key, [], 'hello there')).toBe('thread-1')
  expect(sendToCanonicalRoom).toHaveBeenCalledOnce()
  expect(sendToCanonicalRoom.mock.calls[0]?.slice(0, 3)).toEqual([key, room, 'hello there'])
})

it.each(['fr', 'de', 'es'] as const)('reads the shared %s group surface through the dialogs’ key shapes', locale => {
  const t = translateBotsIn(locale)
  const surface = BOTS_LOCALES[locale] as { group: Record<string, unknown>; roster: Record<string, unknown> }
  const label = surface.group.createAction as (count: number) => string

  expect(label(0)).not.toContain('(')
  expect(t('group.createAction', 2)).toBe(`${label(0)} (2)`)
  expect(typeof surface.group.deleted).toBe('string')
  expect(t('group.deletedGroup', 'Notes')).toContain('Notes')
  expect(t('group.inGroups', ['Notes', 'Ops'])).toContain('“Ops”')
  expect(t('roster.filterRosterActive', 3)).toContain('3')
  expect(t('group.createAction', 2)).not.toBe(translateBotsIn('en')('group.createAction', 2))
})
