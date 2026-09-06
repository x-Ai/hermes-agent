import { afterEach, expect, it } from 'vitest'

import { setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'

import { localizeApiErrorMessage } from './api-error-messages'

afterEach(() => {
  setRuntimeI18nLocale('en')
})

it.each(['en', 'zh', 'zh-hant', 'ja', 'ar', 'ru'] as const)(
  'localizes only retry and reset framing in %s, preserving upstream text and time units',
  locale => {
    setRuntimeI18nLocale(locale)
    const copy = TRANSLATIONS[locale].notifications.errors
    const upstream = 'ERROR_GPT_4_VISION_PREVIEW_RATE_LIMIT: Your included Grok Bot usage limit has been reached.'

    for (const retries of ['3', '7']) {
      for (const suffix of ['', ' hours.']) {
        const raw = `API call failed after ${retries} retries: ${upstream} It resets in 2${suffix}`

        expect(localizeApiErrorMessage(raw)).toBe(
          `${copy.apiRetriesExhausted(retries)}: ${upstream} ${copy.resetsIn('2')}${suffix}`
        )
      }
    }

    expect(localizeApiErrorMessage(upstream)).toBe(upstream)
    expect(localizeApiErrorMessage('Unrecognized upstream diagnostic')).toBe('Unrecognized upstream diagnostic')
  }
)
