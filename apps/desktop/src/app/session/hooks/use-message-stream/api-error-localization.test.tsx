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

it.each(['message.complete', 'error', 'normal'] as const)(
  'localizes API error framing for %s before notification truncation without changing the title or normal replies',
  mode => {
    setRuntimeI18nLocale('zh')
    const notify = vi.spyOn(nativeNotifications, 'dispatchNativeNotification').mockReturnValue(true)
    const stream = renderMessageStream('api-error-session')
    const copy = TRANSLATIONS.zh.notifications
    const upstream = 'ERROR_GPT_4_VISION_PREVIEW_RATE_LIMIT: Your included Grok Bot usage limit has been reached.'
    const raw = `API call failed after 3 retries: ${upstream} It resets in 2 hours.`
    const normalReply = `Example response: ${raw}`
    const localized = `${copy.errors.apiRetriesExhausted('3')}: ${upstream} ${copy.errors.resetsIn('2')} hours.`

    act(() => {
      stream.handleEvent({ payload: {}, session_id: 'api-error-session', type: 'message.start' })
      stream.handleEvent({
        payload: mode === 'error' ? { message: raw } : { text: mode === 'normal' ? normalReply : raw },
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
