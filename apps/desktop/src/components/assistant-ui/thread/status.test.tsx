import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetElapsedTimerRegistryForTests } from '@/components/chat/activity-timer'
import { I18nProvider } from '@/i18n'
import { $compactingSessions, setSessionCompacting } from '@/store/compaction'
import { $providerWaitSessions, setSessionProviderWait } from '@/store/provider-wait'
import { $activeSessionId, $turnStartedAt } from '@/store/session'

import { ResponseLoadingIndicator } from './status'

function renderIndicator(initialLocale = 'en') {
  return render(
    <I18nProvider configClient={null} initialLocale={initialLocale}>
      <ResponseLoadingIndicator />
    </I18nProvider>
  )
}

describe('ResponseLoadingIndicator timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    // useViewedInterval gates ticking on document focus + visibility; jsdom's
    // hasFocus() is unreliable across runners, so pin it (same as the
    // background-sync backstop tests).
    vi.spyOn(globalThis.document, 'hasFocus').mockReturnValue(true)
    __resetElapsedTimerRegistryForTests()
  })

  afterEach(() => {
    cleanup()
    $activeSessionId.set(null)
    $turnStartedAt.set(null)
    $compactingSessions.set({})
    $providerWaitSessions.set({})
    __resetElapsedTimerRegistryForTests()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('preserves each running session timer while switching between sessions', () => {
    $activeSessionId.set('session-a')
    $turnStartedAt.set(Date.now())
    const sessionA = renderIndicator()

    act(() => vi.advanceTimersByTime(5_000))
    expect(screen.getAllByText((_, node) => node?.textContent === '5s').length).toBeGreaterThan(0)
    sessionA.unmount()

    $activeSessionId.set('session-b')
    $turnStartedAt.set(Date.now())
    const sessionB = renderIndicator()

    act(() => vi.advanceTimersByTime(3_000))
    expect(screen.getAllByText((_, node) => node?.textContent === '3s').length).toBeGreaterThan(0)
    sessionB.unmount()

    $activeSessionId.set('session-a')
    $turnStartedAt.set(new Date('2026-01-01T00:00:00.000Z').getTime())
    renderIndicator()

    expect(screen.getAllByText((_, node) => node?.textContent === '8s').length).toBeGreaterThan(0)
  })

  it('names a prolonged provider wait in the existing response status row', () => {
    $activeSessionId.set('session-a')
    $turnStartedAt.set(Date.now())
    setSessionProviderWait(
      'session-a',
      '⏳ waiting on local-model — 30s with no output yet (provider may be slow or overloaded, or the model is thinking; auto-reconnect at 900s)'
    )

    renderIndicator()

    expect(
      screen.getByText(
        'Waiting for local-model output — 30s elapsed (the provider may be slow or overloaded, or the model may still be thinking; automatically reconnecting at 900s)'
      )
    ).toBeTruthy()
  })

  it('localizes the shared provider-wait protocol text at the renderer boundary', () => {
    $activeSessionId.set('session-a')
    $turnStartedAt.set(Date.now())
    setSessionProviderWait(
      'session-a',
      '⏳ waiting on kimi-k3 — 57s with no output yet (provider may be slow or overloaded, or the model is thinking; auto-reconnect at 900s)'
    )

    renderIndicator('zh')

    expect(
      screen.getByText(
        '正在等待 kimi-k3 输出——已持续 57 秒（服务商可能响应较慢或负载过高，模型也可能仍在思考；若持续无输出，将在 900 秒时自动重连）'
      )
    ).toBeTruthy()
  })

  it('localizes the structured compaction status without translating the protocol marker', () => {
    $activeSessionId.set('session-a')
    $turnStartedAt.set(Date.now())
    setSessionCompacting('session-a', true)

    renderIndicator('zh')

    expect(screen.getByText('正在整理对话')).toBeTruthy()
  })
})

// The status line sits between tool rows and thinking headers, which the
// transcript rests at a fade. Without the mark it reads a shade brighter than
// both — the one line in the column claiming emphasis it hasn't earned.
describe('status line', () => {
  afterEach(cleanup)

  it('is marked as transcript scaffolding', () => {
    $activeSessionId.set('session-a')
    $turnStartedAt.set(Date.now())
    const { container } = renderIndicator()

    expect(container.querySelector('[role="status"]')?.hasAttribute('data-conversation-scaffold')).toBe(true)
  })
})
