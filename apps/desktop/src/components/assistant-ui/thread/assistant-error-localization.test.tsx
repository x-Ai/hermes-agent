import { ReadonlyThreadProvider, type ThreadMessage, ThreadPrimitive } from '@assistant-ui/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { I18nProvider, setRuntimeI18nLocale } from '@/i18n'

import { createdAt, stubThreadEnvironment, userMessage } from '../test-utils'

import { AssistantMessage } from './assistant-message'

stubThreadEnvironment()

afterEach(() => {
  cleanup()
  setRuntimeI18nLocale('en')
})

it.each(['transcript', 'error card'] as const)('localizes a restored API retry failure in the %s', async surface => {
  const raw = 'Invalid API response after 6 retries: slow response (217s) — likely upstream timeout'

  const assistant: ThreadMessage = {
    id: 'restored-failure',
    role: 'assistant',
    content: surface === 'transcript' ? [{ type: 'text', text: raw }] : [],
    createdAt,
    metadata: { unstable_state: null, unstable_annotations: [], unstable_data: [], steps: [], custom: {} },
    status:
      surface === 'error card'
        ? { type: 'incomplete', reason: 'error', error: raw }
        : { type: 'complete', reason: 'stop' }
  }

  const messages = [userMessage(), assistant, userMessage('follow-up', 'Continue investigating')]

  // Restored history uses a read-only runtime; the viewport context gives
  // the real message components their layout scope without a scrolling thread.
  render(
    <I18nProvider configClient={null} initialLocale="zh">
      <ReadonlyThreadProvider messages={messages}>
        <ThreadPrimitive.ViewportProvider>
          <ThreadPrimitive.MessageByIndex components={{ Message: AssistantMessage }} index={1} />
        </ThreadPrimitive.ViewportProvider>
      </ReadonlyThreadProvider>
    </I18nProvider>
  )

  expect(await screen.findByText('API 响应无效，重试 6 次后仍失败：响应较慢（217 秒） — 可能是上游超时')).toBeTruthy()
  expect(screen.queryByText(raw)).toBeNull()
  expect(assistant).toMatchObject(surface === 'transcript' ? { content: [{ text: raw }] } : { status: { error: raw } })
})
