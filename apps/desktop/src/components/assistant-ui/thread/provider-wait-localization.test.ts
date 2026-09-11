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
})
