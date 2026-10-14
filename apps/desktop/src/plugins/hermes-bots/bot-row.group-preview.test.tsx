import type * as HermesSdk from '@hermes/plugin-sdk'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { GroupRow } from './bot-row'
import { $groupChats } from './group-chat'
import { translateBotsIn } from './i18n-test-helper'

// The plugin fence allows only the SDK statically; the test reaches the app's locale provider the
// way the other plugin tests reach app stores.
const { I18nProvider } = await import('@/i18n')

// The roster's room row previews the log's last entry: a member's stored
// "Operation interrupted…" placeholder reads in the UI language there too.
vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()

  return { ...sdk, usePluginI18n: () => translateBotsIn('zh') }
})
afterEach(cleanup)

const noop = () => undefined

it("previews a member's interrupted-turn placeholder in the UI language", () => {
  $groupChats.set({
    Room: {
      log: [
        { id: 'u1', from: { kind: 'user', name: 'You' }, text: 'go', at: 1 },
        {
          id: 'm1',
          from: { kind: 'member', name: 'builder' },
          text: 'Operation interrupted: waiting for model response (513.2s elapsed).',
          at: 2
        }
      ],
      watermarks: {},
      sessions: {}
    }
  } as never)

  render(
    <I18nProvider configClient={null} initialLocale="zh">
      <GroupRow
        active={false}
        group="Room"
        members={[{ name: 'builder' }] as never}
        needsYou={false}
        onDisband={noop}
        onNewSection={noop}
        onOpen={noop}
      />
    </I18nProvider>
  )

  expect(screen.getByText('@builder: 操作已中断：正在等待模型响应（已等待 513.2 秒）')).toBeTruthy()
})
