import { afterEach, describe, expect, it } from 'vitest'

import {
  type Locale,
  type ProviderExhaustedReason,
  resolveTranslations,
  setRuntimeI18nLocale,
  TRANSLATIONS
} from '@/i18n'

import {
  isApiRetryFailure,
  localizeAgentStatusText,
  localizeApiErrorMessage,
  localizeAsyncDelegationResultText
} from './api-error-messages'

afterEach(() => {
  setRuntimeI18nLocale('en')
})

// ── agent/turn_failure_copy.py + agent/retry_utils.py, mirrored as format
// strings (the desktop has no Python import path). Fixtures are composed from
// these exactly as exhausted_copy / site_copy compose them.
const EXHAUSTED_LEADS: Record<string, string> = {
  rate_limit: '{label} rate-limited every one of {attempts} attempts',
  upstream_rate_limit: '{label} rate-limited every one of {attempts} attempts',
  overloaded: '{label} reported it was overloaded on all {attempts} attempts',
  server_error: '{label} returned a server error on all {attempts} attempts',
  timeout: "{label} didn't respond in time on any of {attempts} attempts"
}

const EXHAUSTED_DEFAULT_LEAD = "{label} didn't answer after {attempts} attempts"
const NEXT_STEPS_RETRY = 'Wait a minute and send /retry, or switch models with /model.'

const INVALID_RESPONSE =
  '{label} sent back an empty or broken reply {attempts} times — it is probably overloaded or rate-limiting you. ' +
  NEXT_STEPS_RETRY +
  '\n\nDetails: {detail}'

const format = (template: string, fields: Record<string, number | string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(fields[key]))

// format_reset_window: ceilinged `~Nh` at an hour or more, else `~N min`.
const formatResetWindow = (seconds: number) =>
  seconds >= 3600 ? `~${Math.ceil(seconds / 3600)}h` : `~${Math.ceil(seconds / 60)} min`

function exhaustedCopy(
  reason: string,
  fields: { label: string; attempts: number; summary: string; resetSeconds?: null | number }
): string {
  const lead = format(EXHAUSTED_LEADS[reason] ?? EXHAUSTED_DEFAULT_LEAD, {
    label: fields.label,
    attempts: fields.attempts
  })

  const situation =
    fields.resetSeconds != null && fields.resetSeconds >= 120
      ? `its usage limit resets in ${formatResetWindow(fields.resetSeconds)}. Send /retry after that, or switch models with /model.`
      : `it looks temporarily unavailable. ${NEXT_STEPS_RETRY}`

  return `${lead} — ${situation} To avoid this in future, add a backup provider with \`hermes fallback add\`.\n\nProvider said: ${fields.summary}`
}

// Reason → the lead copy key the desktop renders (two rate-limit reasons share one lead).
const COPY_REASON: Record<string, ProviderExhaustedReason> = {
  rate_limit: 'rate_limit',
  upstream_rate_limit: 'rate_limit',
  overloaded: 'overloaded',
  server_error: 'server_error',
  timeout: 'timeout',
  context_overflow: 'unknown'
}

const LOCALES = Object.keys(TRANSLATIONS) as Locale[]
const SUMMARY = 'HTTP 429: {"error": {"message": "Rate limit exceeded", "type": "rate_limit_error"}}'

describe('retries-exhausted chat copy', () => {
  const cases = Object.keys(COPY_REASON).flatMap(reason =>
    [null, 10_805, 2_700, 60].map(resetSeconds => ({ reason, resetSeconds }))
  )

  it.each(cases)(
    '$reason with resetSeconds=$resetSeconds round-trips in English and localizes elsewhere',
    ({ reason, resetSeconds }) => {
      const raw = exhaustedCopy(reason, { label: 'OpenRouter', attempts: 3, summary: SUMMARY, resetSeconds })
      const window = resetSeconds != null && resetSeconds >= 120 ? formatResetWindow(resetSeconds) : null

      expect(isApiRetryFailure(raw)).toBe(true)
      // The English catalog IS the backend copy: rendering it back must be lossless.
      expect(localizeApiErrorMessage(raw, 'en')).toBe(raw)

      for (const locale of LOCALES) {
        const errors = resolveTranslations(locale).notifications.errors
        const expected = `${errors.providerRetriesExhausted(COPY_REASON[reason], 'OpenRouter', '3', window)}\n\n${errors.providerSaid(SUMMARY)}`
        const localized = localizeApiErrorMessage(raw, locale)

        expect(localized).toBe(expected)
        expect(localized).toContain('OpenRouter')
        expect(localized).toContain(SUMMARY)

        if (window) {
          expect(localized).toContain(window)
        }

        if (errors.providerRetriesExhausted !== TRANSLATIONS.en.notifications.errors.providerRetriesExhausted) {
          expect(localized).not.toBe(raw)
        }
      }
    }
  )

  it('prefers the terminal frame reason code over the sniffed lead, and falls back without one', () => {
    const raw = exhaustedCopy('rate_limit', { label: 'Nous', attempts: 5, summary: SUMMARY })
    const errors = TRANSLATIONS.zh.notifications.errors

    expect(localizeApiErrorMessage(raw, 'zh', 'upstream_rate_limit')).toBe(
      `${errors.providerRetriesExhausted('rate_limit', 'Nous', '5', null)}\n\n${errors.providerSaid(SUMMARY)}`
    )
    expect(localizeApiErrorMessage(raw, 'zh', 'timeout')).toBe(
      `${errors.providerRetriesExhausted('timeout', 'Nous', '5', null)}\n\n${errors.providerSaid(SUMMARY)}`
    )
    expect(localizeApiErrorMessage(raw, 'zh', 'not_a_reason')).toBe(localizeApiErrorMessage(raw, 'zh'))
  })

  it('does not classify a reply that quotes the copy mid-sentence, but accepts raw-id labels', () => {
    const quoted = `Example response: ${exhaustedCopy('rate_limit', { label: 'OpenRouter', attempts: 3, summary: SUMMARY })}`

    expect(isApiRetryFailure(quoted)).toBe(false)
    expect(localizeApiErrorMessage(quoted, 'zh')).toBe(quoted)

    // provider_label() falls back to the provider id itself, colon included.
    const rawId = exhaustedCopy('timeout', { label: 'custom:lab', attempts: 2, summary: SUMMARY })
    expect(isApiRetryFailure(rawId)).toBe(true)
    expect(localizeApiErrorMessage(rawId, 'zh')).toContain('custom:lab')
  })

  it('keeps guidance paragraphs the backend appends after the provider summary', () => {
    const guidance = '\n\nThe connection kept dropping while the model was writing.'
    const raw = exhaustedCopy('server_error', { label: 'DeepSeek', attempts: 3, summary: SUMMARY }) + guidance

    expect(localizeApiErrorMessage(raw, 'en')).toBe(raw)
    expect(localizeApiErrorMessage(raw, 'zh')).toContain(guidance)
  })
})

describe('invalid-response chat copy and error fields', () => {
  it.each(LOCALES)('localizes the invalid_response site copy in %s while keeping the detail', locale => {
    const detail = 'slow response (217s) — likely upstream timeout'
    const raw = format(INVALID_RESPONSE, { label: 'Nous', attempts: 3, detail })
    const t = resolveTranslations(locale)
    const localizedDetail = t.assistant.thread.operationInterruptedRetryReasons.slowResponseLikelyUpstreamTimeout('217')

    expect(isApiRetryFailure(raw)).toBe(true)
    expect(localizeApiErrorMessage(raw, locale)).toBe(
      `${t.notifications.errors.providerInvalidResponse('Nous', '3')}\n\n${t.notifications.errors.errorDetailsLine(localizedDetail)}`
    )
  })

  it.each(LOCALES)('localizes the Invalid API response error field in %s', locale => {
    // agent/turn_response_check.py stamps this in the result's `error`.
    const raw = 'Invalid API response after 3 retries: slow response (175s) — likely upstream timeout'
    const t = resolveTranslations(locale)
    const reason = t.assistant.thread.operationInterruptedRetryReasons.slowResponseLikelyUpstreamTimeout('175')

    expect(localizeApiErrorMessage(raw, locale)).toBe(
      t.notifications.errors.invalidApiResponseAfterRetries('3', reason)
    )
  })

  it('names the reset window the gateway notice carries and keeps unknown text verbatim', () => {
    const errors = TRANSLATIONS.zh.notifications.errors

    // gateway/run_turn.py usage-limit hint.
    const notice =
      "⚠️ Something went wrong and I couldn't finish this reply. Your plan's usage limit has been reached. It resets in ~3h."

    expect(localizeApiErrorMessage(notice, 'zh')).toContain(errors.resetsIn('~3h'))
    expect(localizeApiErrorMessage(notice, 'zh')).not.toContain('It resets in')
    // Pre-September notices spelled a bare number with the unit after it.
    expect(localizeApiErrorMessage('API call failed after 3 retries: x It resets in 2 hours.', 'zh')).toBe(
      `${errors.apiRetriesExhausted('3')}: x ${errors.resetsIn('2')} hours.`
    )

    const upstream = 'ERROR_GPT_4_VISION_PREVIEW_RATE_LIMIT: Your included Grok Bot usage limit has been reached.'
    expect(localizeApiErrorMessage(upstream, 'zh')).toBe(upstream)
    expect(isApiRetryFailure(upstream)).toBe(false)
  })
})

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

it.each(LOCALES)('localizes delegation failure framing in %s', locale => {
  const translations = resolveTranslations(locale)
  const thread = translations.assistant.thread
  const rawDetail = 'Invalid API response after 3 retries: slow response (175s) — likely upstream timeout'
  const localizedDetail = localizeApiErrorMessage(rawDetail, locale)

  expect(localizeAsyncDelegationResultText(`(failed: ${rawDetail})\nPartial output:\n{ "answer": 42 }`, locale)).toBe(
    `${thread.asyncDelegationFailure(localizedDetail)}\n${thread.asyncDelegationPartialOutput}\n{ "answer": 42 }`
  )
})
