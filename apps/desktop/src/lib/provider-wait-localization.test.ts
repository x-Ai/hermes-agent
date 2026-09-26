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
    const model = `model/${variant}-${kind}`
    const thinking = kind === 'output' ? ', or the model is thinking' : ''
    const reconnect = reconnectSeconds ? `; auto-reconnect at ${reconnectSeconds}s` : ''

    const wait =
      variant === 'stream-first' ? `no stream ${kind} for ${elapsedSeconds}s` : `${elapsedSeconds}s with no ${kind} yet`

    const raw = `⏳ waiting on ${model} — ${wait} (provider may be slow or overloaded${thinking}${reconnect})`
    const localized = `localized:${model}:${elapsedSeconds}:${kind}:${reconnectSeconds ?? 'none'}`
    const providerWaiting = vi.fn(() => localized)

    expect(localizeProviderWaitText(raw, { ...copy, providerWaiting })).toBe(localized)
    expect(providerWaiting).toHaveBeenCalledWith(model, elapsedSeconds, kind, reconnectSeconds)
  })

  it('keeps unknown provider text verbatim', () => {
    const raw = '↻ provider supplied a new wait state'

    expect(localizeProviderWaitText(raw, copy)).toBe(raw)
  })
})
