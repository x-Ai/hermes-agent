import { act, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'
import * as nativeNotifications from '@/store/native-notifications'
import { clearNotifications } from '@/store/notifications'

import { renderMessageStream } from './test-harness'

afterEach(() => {
  cleanup()
  clearNotifications()
  setRuntimeI18nLocale('en')
  vi.restoreAllMocks()
})

// agent/turn_failure_copy.py::exhausted_copy for a rate-limited turn, composed
// from the backend's format strings (see lib/api-error-messages.test.ts).
const SUMMARY = 'ERROR_GPT_4_VISION_PREVIEW_RATE_LIMIT: Your included Grok Bot usage limit has been reached.'

const EXHAUSTED =
  'OpenRouter rate-limited every one of 3 attempts — it looks temporarily unavailable. ' +
  'Wait a minute and send /retry, or switch models with /model. ' +
  'To avoid this in future, add a backup provider with `hermes fallback add`.\n\n' +
  `Provider said: ${SUMMARY}`

it.each(['message.complete', 'error', 'normal'] as const)(
  'localizes API error framing for %s before notification truncation without changing the title or normal replies',
  mode => {
    setRuntimeI18nLocale('zh')
    const notify = vi.spyOn(nativeNotifications, 'dispatchNativeNotification').mockReturnValue(true)
    const stream = renderMessageStream('api-error-session')
    const copy = TRANSLATIONS.zh.notifications
    const normalReply = `Example response: ${EXHAUSTED}`
    const localized = `${copy.errors.providerRetriesExhausted('rate_limit', 'OpenRouter', '3', null)}\n\n${copy.errors.providerSaid(SUMMARY)}`

    act(() => {
      stream.handleEvent({ payload: {}, session_id: 'api-error-session', type: 'message.start' })
      stream.handleEvent({
        payload: mode === 'error' ? { message: EXHAUSTED } : { text: mode === 'normal' ? normalReply : EXHAUSTED },
        session_id: 'api-error-session',
        type: mode === 'error' ? 'error' : 'message.complete'
      })
    })

    expect(stream.state().messages.at(-1)?.error).toBe(mode === 'normal' ? undefined : localized)
    expect(notify).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: mode === 'error' ? localized : (mode === 'normal' ? normalReply : localized).slice(0, 140),
        title: mode === 'error' ? copy.native.turnErrorTitle : copy.native.turnDoneTitle,
        kind: mode === 'error' ? 'turnError' : 'turnDone'
      })
    )
  }
)

it('uses the terminal frame reason code for the notification body and keeps the provider summary as the bubble error', () => {
  setRuntimeI18nLocale('zh')
  const notify = vi.spyOn(nativeNotifications, 'dispatchNativeNotification').mockReturnValue(true)
  const stream = renderMessageStream('api-error-session')
  const copy = TRANSLATIONS.zh.notifications

  act(() => {
    stream.handleEvent({ payload: {}, session_id: 'api-error-session', type: 'message.start' })
    stream.handleEvent({
      payload: {
        error: SUMMARY,
        error_surface: { code: 'upstream_rate_limit', layer: 'provider', retryable: true },
        status: 'error',
        text: EXHAUSTED
      },
      session_id: 'api-error-session',
      type: 'message.complete'
    })
  })

  // The structured `error` is the raw provider summary: nothing Hermes-owned to translate.
  expect(stream.state().messages.at(-1)?.error).toBe(SUMMARY)
  expect(notify).toHaveBeenLastCalledWith(
    expect.objectContaining({
      body: `${copy.errors.providerRetriesExhausted('rate_limit', 'OpenRouter', '3', null)}\n\n${copy.errors.providerSaid(SUMMARY)}`.slice(
        0,
        140
      )
    })
  )
})
