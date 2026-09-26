import { afterEach, expect, it } from 'vitest'

import { setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'

import {
  localizeAgentStatusText,
  localizeApiErrorMessage,
  localizeAsyncDelegationResultText
} from './api-error-messages'

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

it('localizes standalone failure lines in async results while preserving prose, quotes and code', () => {
  const raw = 'Invalid API response after 6 retries: slow response (217s) — likely upstream timeout'

  const unchanged = [
    `The provider reported: ${raw}`,
    `\`${raw}\``,
    `> ${raw}`,
    `    ${raw}`,
    '```text',
    raw,
    'Partial output:',
    '```',
    '~~~text',
    raw,
    '~~~'
  ]

  const message = ['Partial output:', raw, ...unchanged].join('\r\n')

  expect(localizeAgentStatusText(raw, 'zh')).toBe(localizeApiErrorMessage(raw, 'zh'))

  for (const text of unchanged.slice(0, 4)) {
    expect(localizeAgentStatusText(text, 'zh')).toBe(text)
  }

  expect(localizeAgentStatusText(`\`\`\`text\n${raw}\n\`\`\``, 'zh')).toBe(`\`\`\`text\n${raw}\n\`\`\``)

  expect(localizeAsyncDelegationResultText(message, 'zh')).toBe(
    [
      TRANSLATIONS.zh.assistant.thread.asyncDelegationPartialOutput,
      localizeApiErrorMessage(raw, 'zh'),
      ...unchanged
    ].join('\r\n')
  )
})

it.each(['en', 'zh', 'zh-hant', 'ja', 'ar', 'ru'] as const)(
  'localizes invalid slow responses and delegation framing in %s',
  locale => {
    const translations = TRANSLATIONS[locale]
    const errors = translations.notifications.errors
    const thread = translations.assistant.thread
    const rawDetail = 'Invalid API response after 3 retries: slow response (175s) — likely upstream timeout'
    const localizedReason = thread.operationInterruptedRetryReasons.slowResponseLikelyUpstreamTimeout('175')
    const localizedDetail = errors.invalidApiResponseAfterRetries('3', localizedReason)

    expect(localizeApiErrorMessage(rawDetail, locale)).toBe(localizedDetail)
    expect(localizeAsyncDelegationResultText(`(failed: ${rawDetail})\nPartial output:\n{ "answer": 42 }`, locale)).toBe(
      `${thread.asyncDelegationFailure(localizedDetail)}\n${thread.asyncDelegationPartialOutput}\n{ "answer": 42 }`
    )
  }
)
