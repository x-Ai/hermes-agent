import { afterEach, describe, expect, it } from 'vitest'

import { registerPluginLocales, translatePlugin } from '@/i18n/plugin-i18n'
import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'

let dispose: null | (() => void) = null

afterEach(() => {
  dispose?.()
  dispose = null
})

describe('Hermes Bots i18n', () => {
  it('registers the restored Simplified Chinese Bot UI copy under the plugin id', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'zh', 'roster.activityToastsOn', [])).toBe('活动通知已开启 — 点击静音')
    expect(translatePlugin('hermes-bots', 'zh', 'roster.newMenu', [])).toBe('新建…')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.newDescription', [])).toBe(
      '一个拥有自己记忆、技能和聊天的具名队友。它可以向你的其他智能体发送消息'
    )
    expect(translatePlugin('hermes-bots', 'zh', 'bot.nameLabel', [])).toBe('名称')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.createAction', [])).toBe('创建机器人')
    expect(translatePlugin('hermes-bots', 'zh', 'avatar.auto', [])).toBe('自动')
    expect(translatePlugin('hermes-bots', 'zh', 'avatar.lockFace', [])).toBe('锁定头像')
    expect(translatePlugin('hermes-bots', 'zh', 'avatar.followsNameHint', [])).toBe('头像随名称变化')
    expect(translatePlugin('hermes-bots', 'zh', 'cron.stopAfter', [])).toBe('停止条件')
    expect(translatePlugin('hermes-bots', 'zh', 'cron.runsForeverHint', [])).toBe('次运行（留空 = 永久）')
    expect(translatePlugin('hermes-bots', 'zh', 'roster.newMessageFor', ['研究助手'])).toBe('🤖 研究助手 收到新消息')
  })

  it('falls back to the plugin English bundle for locales it does not ship', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'ar', 'bot.newTitle', [])).toBe('New bot')
  })
})
