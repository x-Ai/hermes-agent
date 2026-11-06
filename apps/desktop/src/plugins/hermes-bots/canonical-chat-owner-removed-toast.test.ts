/**
 * A bot whose connection was removed fails its open before any RPC: prepareBotSource's strict
 * route lookup refuses it, and notifyBotOpenFailure shows that refusal as the toast's detail. In
 * a zh UI the detail reads in the UI language too, around the bot's own name. The real routing
 * module runs here, so the refusal is the one the app throws.
 */

import { expect, it, vi } from 'vitest'

import { translateBotsIn } from './i18n-test-helper'
import type { RosterRow } from './types'

const { hostMock, pluginCtx } = vi.hoisted(() => ({
  hostMock: { navigate: vi.fn(), notify: vi.fn() },
  pluginCtx: { current: null as null | { i18n?: { t: (key: string, ...args: unknown[]) => string } } }
}))

vi.mock('@hermes/plugin-sdk', () => ({
  BOT_CHAT_SESSION_HYDRATION_TIMEOUT_MS: 15_000,
  host: hostMock,
  usePluginI18n: () => (key: string) => key
}))

vi.mock('./data', () => ({
  $botMeta: { get: () => ({}), set: vi.fn() },
  botMetaKey: (bot: { name?: string }) => bot?.name ?? '',
  botOwner: (owner: RosterRow | string) =>
    typeof owner === 'string'
      ? { bot: { name: owner }, key: owner, name: owner, route: null }
      : { bot: owner, key: owner?.name, name: owner?.name, route: null },
  persistBotMetaSnapshot: vi.fn(),
  saveBotMeta: vi.fn()
}))

vi.mock('./shared', () => ({ getPluginCtx: () => pluginCtx.current }))

it('names a removed connection in the UI language in the failed-open toast', async () => {
  pluginCtx.current = { i18n: { t: translateBotsIn('zh') } }
  const { notifyBotOpenFailure, prepareBotSource } = await import('./canonical-chat')
  // A source-scoped row with no connection left to route through, as after its source was deleted.
  const orphan = { name: 'ops', remoteSource: true, sourceScoped: true } as RosterRow

  const error = await prepareBotSource(orphan).then(
    () => null,
    (failure: unknown) => failure
  )

  expect(error).not.toBeNull()

  // The bot-open flow (roster-actions) toasts a failed source prep exactly like this.
  notifyBotOpenFailure(error, orphan, 'reach')

  const toast = hostMock.notify.mock.calls.at(-1)?.[0] as { detail?: string }

  expect(toast.detail).toContain('ops')
  // No English sentence around the name.
  expect(toast.detail?.replace('ops', '')).not.toMatch(/[A-Za-z]/)
})
