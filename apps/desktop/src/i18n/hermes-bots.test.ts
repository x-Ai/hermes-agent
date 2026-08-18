import { afterEach, describe, expect, it } from 'vitest'

import { registerPluginLocales, translatePlugin } from '@/i18n/plugin-i18n'
import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'

let dispose: null | (() => void) = null

afterEach(() => {
  dispose?.()
  dispose = null
})

describe('Hermes Bots i18n', () => {
  it('registers Simplified Chinese UI copy and interpolators under the plugin id', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'zh', 'bots', [])).toBe('智能体')
    expect(translatePlugin('hermes-bots', 'zh', 'searchBots', [])).toBe('搜索 Bot…')
    expect(translatePlugin('hermes-bots', 'zh', 'newCronjob', [])).toBe('新建定时任务')
    expect(translatePlugin('hermes-bots', 'zh', 'noBotsMatch', ['研究'])).toBe('没有匹配"研究"的 Bot')
  })

  it('falls back to the plugin English bundle for locales it does not ship', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'ja', 'newAgent', [])).toBe('New Agent')
  })
})
