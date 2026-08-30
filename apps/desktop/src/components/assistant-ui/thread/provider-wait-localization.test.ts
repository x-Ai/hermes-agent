import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from '@/i18n'

import { localizeProviderWaitText } from './provider-wait-localization'

const copy = TRANSLATIONS.zh.assistant.thread

describe('localizeProviderWaitText', () => {
  it.each([
    [
      '⏳ waiting on kimi-k3 — 57s with no output yet (provider may be slow or overloaded, or the model is thinking; auto-reconnect at 900s)',
      '正在等待 kimi-k3 输出——已持续 57 秒（服务商可能响应较慢或负载过高，模型也可能仍在思考；若持续无输出，将在 900 秒时自动重连）'
    ],
    [
      '⏳ waiting on gpt-5 — 30s with no response yet (provider may be slow or overloaded)',
      '正在等待 gpt-5 响应——已持续 30 秒（服务商可能响应较慢或负载过高）'
    ],
    ['⚠ no output from provider for 120s — reconnecting...', '服务商持续 120 秒未返回输出，正在重新连接…'],
    ['⚠ no response from provider in 90s — reconnecting...', '服务商持续 90 秒未返回响应，正在重新连接…']
  ])('localizes a core provider-wait notice without changing its dynamic fields', (raw, localized) => {
    expect(localizeProviderWaitText(raw, copy)).toBe(localized)
  })

  it('leaves an unknown future notice visible verbatim', () => {
    const raw = '↻ provider supplied a new wait state'

    expect(localizeProviderWaitText(raw, copy)).toBe(raw)
  })
})
