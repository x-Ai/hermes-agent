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
    expect(translatePlugin('hermes-bots', 'zh', 'bot', [])).toBe('形象')
    expect(translatePlugin('hermes-bots', 'zh', 'avatarRandomize', [])).toBe('随机生成')
    expect(translatePlugin('hermes-bots', 'zh', 'avatarLockFace', [])).toBe('锁定头像')
    expect(translatePlugin('hermes-bots', 'zh', 'thisDevice', [])).toBe('此设备')
    expect(translatePlugin('hermes-bots', 'zh', 'openChat', [])).toBe('打开聊天')
    expect(translatePlugin('hermes-bots', 'zh', 'openContinuousChatDescription', [])).toBe(
      '打开此 Bot 的连续聊天，切换到其他页面后，其后台工作仍会继续运行'
    )
    expect(translatePlugin('hermes-bots', 'zh', 'cronjobsUnavailableUntilRoster', [])).toBe(
      '此代理出现在智能体列表中后才能使用定时任务'
    )
    expect(translatePlugin('hermes-bots', 'zh', 'noBotsMatch', ['研究'])).toBe('没有匹配"研究"的 Bot')
  })

  it('falls back to the plugin English bundle for locales it does not ship', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'ja', 'newAgent', [])).toBe('New Agent')
  })
})
