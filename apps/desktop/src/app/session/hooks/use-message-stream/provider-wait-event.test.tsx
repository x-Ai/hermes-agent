import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ResponseLoadingIndicator } from '@/components/assistant-ui/thread/status'
import { I18nProvider } from '@/i18n'
import { $providerWaitSessions } from '@/store/provider-wait'
import { $activeSessionId } from '@/store/session'
import { clearAllSessionStates, dropSessionState } from '@/store/session-states'
import type { RpcEvent } from '@/types/hermes'

import { type MessageStreamHarness, renderMessageStream } from './test-harness'

const SID = 'session-1'
let stream: MessageStreamHarness

function emit(type: RpcEvent['type'], payload: RpcEvent['payload'] = {}) {
  act(() => stream.handleEvent({ payload, session_id: SID, type }))
}

describe('provider wait visibility', () => {
  beforeEach(async () => {
    $providerWaitSessions.set({})
    stream = renderMessageStream(SID)
  })

  afterEach(() => {
    cleanup()
    $activeSessionId.set(null)
    $providerWaitSessions.set({})
    vi.restoreAllMocks()
  })

  it('surfaces explained waits but ignores generic spinner rewrites', () => {
    emit('thinking.delta', { text: '⏳ waiting on local-model — 30s with no output yet' })
    expect($providerWaitSessions.get()).toEqual({
      [SID]: '⏳ waiting on local-model — 30s with no output yet'
    })

    emit('thinking.delta', { text: '◉_◉ cogitating...' })
    expect($providerWaitSessions.get()).toEqual({})
  })

  it('renders localized retry notices from gateway events and clears them when output resumes', () => {
    $activeSessionId.set(SID)
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <ResponseLoadingIndicator />
      </I18nProvider>
    )

    const notices = [
      [
        '⏳ waiting on provider — retrying in 41s (attempt 5/6)',
        '正在等待服务商，41 秒后重试（第 5/6 次）'
      ],
      [
        '↻ model returned reasoning with no final answer — asking it to continue (2/3)',
        '模型仅返回了思考内容，未给出最终回答，正在请求继续（第 2/3 次）'
      ]
    ]

    for (const [raw, localized] of notices) {
      emit('thinking.delta', { text: raw })

      expect(screen.getByRole('status', { name: localized }).textContent).toContain(localized)
      expect(screen.queryByText(raw)).toBeNull()

      emit('message.delta', { text: 'progress' })

      expect(screen.queryByText(localized)).toBeNull()
      expect($providerWaitSessions.get()).toEqual({})
    }
  })

  it.each(['message.delta', 'reasoning.delta', 'tool.start', 'message.complete', 'error'] as const)(
    'clears the wait when %s proves the turn progressed or ended',
    type => {
      emit('thinking.delta', { text: '⚠ no output from provider for 900s — reconnecting...' })
      emit(type, type === 'tool.start' ? { name: 'terminal', tool_id: 'tool-1' } : { text: 'progress' })

      expect($providerWaitSessions.get()).toEqual({})
    }
  )

  it('clears the wait when its runtime session is dropped', () => {
    emit('thinking.delta', { text: '⏳ waiting on local-model — 30s with no output yet' })

    dropSessionState(SID)

    expect($providerWaitSessions.get()).toEqual({})
  })

  it('clears every wait when gateway session state is reset', () => {
    emit('thinking.delta', { text: '⏳ waiting on local-model — 30s with no output yet' })

    clearAllSessionStates()

    expect($providerWaitSessions.get()).toEqual({})
  })
})
