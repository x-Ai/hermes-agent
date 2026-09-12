import { describe, expect, it, vi } from 'vitest'

import { TRANSLATIONS } from '@/i18n'

import { localizeProviderWaitText } from './provider-wait-localization'

const copy = TRANSLATIONS.zh.assistant.thread

describe('localizeProviderWaitText', () => {
  it.each([
    { variant: 'elapsed-first', kind: 'output' as const, elapsedSeconds: '57', reconnectSeconds: '900' },
    { variant: 'elapsed-first', kind: 'response' as const, elapsedSeconds: '30', reconnectSeconds: null },
    { variant: 'stream-first', kind: 'output' as const, elapsedSeconds: '61', reconnectSeconds: '347' },
    { variant: 'stream-first', kind: 'response' as const, elapsedSeconds: '43', reconnectSeconds: null }
  ])('passes every $variant $kind field from the wire to the locale formatter', testCase => {
    const { variant, kind, elapsedSeconds, reconnectSeconds } = testCase
    const modelFromWire = `model-from-wire/${variant}-${kind}-${elapsedSeconds}`
    const thinkingSuffix = kind === 'output' ? ', or the model is thinking' : ''
    const reconnectSuffix = reconnectSeconds ? `; auto-reconnect at ${reconnectSeconds}s` : ''

    const waitDetail =
      variant === 'stream-first' ? `no stream ${kind} for ${elapsedSeconds}s` : `${elapsedSeconds}s with no ${kind} yet`

    const raw = `⏳ waiting on ${modelFromWire} — ${waitDetail} (provider may be slow or overloaded${thinkingSuffix}${reconnectSuffix})`
    const localizedNotice = `localized:${modelFromWire}:${elapsedSeconds}:${kind}:${reconnectSeconds ?? 'none'}`
    const providerWaiting = vi.fn(() => localizedNotice)

    expect(localizeProviderWaitText(raw, { ...copy, providerWaiting })).toBe(localizedNotice)
    expect(providerWaiting).toHaveBeenCalledWith(modelFromWire, elapsedSeconds, kind, reconnectSeconds)
  })

  it.each([
    ['⚠ no output from provider for 120s — reconnecting...', '服务商持续 120 秒未返回输出，正在重新连接…'],
    ['⚠ no response from provider in 90s — reconnecting...', '服务商持续 90 秒未返回响应，正在重新连接…']
  ])('localizes a reconnect notice without changing its dynamic fields', (raw, localized) => {
    expect(localizeProviderWaitText(raw, copy)).toBe(localized)
  })

  it('leaves an unknown future notice visible verbatim', () => {
    const raw = '↻ provider supplied a new wait state'

    expect(localizeProviderWaitText(raw, copy)).toBe(raw)
  })

  it('localizes the same notice with or without a presentation glyph', () => {
    const notices = [
      '⏳ waiting on provider — retrying in 3s (attempt 1/6)',
      '⏳ waiting on model-from-wire — 37s with no response yet (provider may be slow or overloaded)',
      '⏳ waiting on model-from-wire — no stream output for 72s (provider may be slow or overloaded, or the model is thinking)',
      '⏳ waiting on model-from-wire — 88s with no stream events (provider may be slow or overloaded; auto-reconnect at 417s total elapsed)',
      '⚠ no output from provider for 137s — reconnecting...',
      '↻ model returned reasoning with no final answer — asking it to continue (2/7)'
    ]

    for (const raw of notices) {
      const body = raw.slice(1).trimStart()
      const localized = localizeProviderWaitText(raw, copy)

      expect(localized).not.toBe(raw)
      expect(localizeProviderWaitText(body, copy)).toBe(localized)
      expect(localizeProviderWaitText(`${raw[0]}\uFE0F ${body}`, copy)).toBe(localized)
    }
  })

  it('forwards recovery fields to each locale without falling back to English', () => {
    const cases = [
      {
        raw: '⏳ waiting on provider — retrying in 41s (attempt 5/6)',
        formatter: 'providerRetrying' as const,
        fields: ['41', '5', '6']
      },
      {
        raw: '⏳ waiting on provider — retrying in 0s (attempt 2/12)',
        formatter: 'providerRetrying' as const,
        fields: ['0', '2', '12']
      },
      {
        raw: '↻ model returned reasoning with no final answer — asking it to continue (4/9)',
        formatter: 'modelContinuing' as const,
        fields: ['4', '9']
      },
      {
        raw: '⏳ waiting on model-from-wire/events — 73s with no stream events (provider may be slow or overloaded)',
        formatter: 'providerWaitingAfterActivity' as const,
        fields: ['model-from-wire/events', '73', 'events', null]
      },
      {
        raw: '⏳ waiting on model-from-wire/reconnect — 89s with no response after reconnect (provider may be slow or overloaded; auto-reconnect at 431s total elapsed)',
        formatter: 'providerWaitingAfterActivity' as const,
        fields: ['model-from-wire/reconnect', '89', 'response', '431']
      }
    ]

    for (const { raw, formatter, fields } of cases) {
      const localizedNotice = `localized:${fields.join(':')}`
      const format = vi.fn(() => localizedNotice)

      expect(localizeProviderWaitText(raw, { ...copy, [formatter]: format })).toBe(localizedNotice)
      expect(format).toHaveBeenCalledWith(...fields)

      const english = localizeProviderWaitText(raw, TRANSLATIONS.en.assistant.thread)

      for (const [locale, translations] of Object.entries(TRANSLATIONS)) {
        const localized = localizeProviderWaitText(raw, translations.assistant.thread)

        expect(localized).not.toBe(raw)

        for (const field of fields) {
          if (field !== null && field !== 'events' && field !== 'response') {
            expect(localized).toContain(field)
          }
        }

        if (locale !== 'en') {
          expect(localized).not.toBe(english)
        }
      }
    }
  })
})
