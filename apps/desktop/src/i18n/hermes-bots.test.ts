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

    expect(translatePlugin('hermes-bots', 'zh', 'roster.title', [])).toBe('智能体')
    expect(translatePlugin('hermes-bots', 'zh', 'roster.activityToastsOn', [])).toBe('活动通知已开启 — 点击静音')
    expect(translatePlugin('hermes-bots', 'zh', 'roster.newMenu', [])).toBe('新建…')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.newTitle', [])).toBe('新建智能体')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.newDescription', [])).toBe(
      '一个拥有自己记忆、技能和聊天的具名队友。它可以向你的其他智能体发送消息'
    )
    expect(translatePlugin('hermes-bots', 'zh', 'bot.nameLabel', [])).toBe('名称')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.createAction', [])).toBe('创建智能体')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.openBotChat', [])).toBe('打开智能体聊天')
    expect(translatePlugin('hermes-bots', 'zh', 'bot.deleteTitle', [])).toBe('删除智能体和配置档案？')
    expect(translatePlugin('hermes-bots', 'zh', 'roster.couldNotOpenChat', ['默认 2'])).toBe(
      '无法打开“默认 2”的聊天 — 请重试'
    )
    expect(translatePlugin('hermes-bots', 'zh', 'avatar.auto', [])).toBe('自动')
    expect(translatePlugin('hermes-bots', 'zh', 'avatar.lockFace', [])).toBe('锁定头像')
    expect(translatePlugin('hermes-bots', 'zh', 'avatar.followsNameHint', [])).toBe('头像随名称变化')
    expect(translatePlugin('hermes-bots', 'zh', 'group.manageDesc', [])).toBe(
      '一个智能体可以加入多个群聊。成员关系会同步到每台设备。'
    )
    expect(translatePlugin('hermes-bots', 'zh', 'cron.stopAfter', [])).toBe('停止条件')
    expect(translatePlugin('hermes-bots', 'zh', 'cron.runsForeverHint', [])).toBe('次运行（留空 = 永久）')
    expect(translatePlugin('hermes-bots', 'zh', 'roster.newMessageFor', ['研究助手'])).toBe('🤖 研究助手 收到新消息')
  })

  it('uses 智慧體 consistently for Traditional Chinese Bot Mode copy', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'zh-hant', 'roster.title', [])).toBe('智慧體')
    expect(translatePlugin('hermes-bots', 'zh-hant', 'bot.newTitle', [])).toBe('新增智慧體')
    expect(translatePlugin('hermes-bots', 'zh-hant', 'bot.createAction', [])).toBe('建立智慧體')
    expect(translatePlugin('hermes-bots', 'zh-hant', 'bot.openBotChat', [])).toBe('開啟智慧體聊天')
    expect(translatePlugin('hermes-bots', 'zh-hant', 'bot.deleteTitle', [])).toBe('刪除智慧體和設定檔？')
  })

  it('falls back to the plugin English bundle for locales it does not ship', () => {
    dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

    expect(translatePlugin('hermes-bots', 'ar', 'bot.newTitle', [])).toBe('New bot')
  })
})
