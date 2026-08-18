import { afterEach, describe, expect, it } from 'vitest'

import { setRuntimeI18nLocale, translateForLocale } from '@/i18n'

import { zh } from './zh'

const GLOBAL_SETTING_KEYS = [
  'GATEWAY_ALLOW_ALL_USERS',
  'API_SERVER_ENABLED',
  'API_SERVER_KEY',
  'API_SERVER_PORT',
  'API_SERVER_HOST',
  'API_SERVER_MODEL_NAME',
  'GATEWAY_PROXY_URL',
  'GATEWAY_PROXY_KEY',
  'WEBHOOK_ENABLED',
  'WEBHOOK_PORT',
  'WEBHOOK_SECRET',
  'SUDO_PASSWORD',
  'HERMES_PREFILL_MESSAGES_FILE',
  'HERMES_EPHEMERAL_SYSTEM_PROMPT'
] as const

const MEDIA_MODEL_IDS = [
  'fal-ai/flux-2/klein/9b',
  'fal-ai/flux-2-pro',
  'fal-ai/z-image/turbo',
  'fal-ai/nano-banana-pro',
  'fal-ai/nano-banana-2',
  'fal-ai/gpt-image-1.5',
  'fal-ai/gpt-image-2',
  'fal-ai/ideogram/v3',
  'fal-ai/recraft/v4/pro/text-to-image',
  'fal-ai/qwen-image',
  'fal-ai/krea/v2/medium/text-to-image',
  'fal-ai/krea/v2/large/text-to-image',
  'bytedance/seedream/v5/pro/text-to-image',
  'bytedance/seedream/v5/lite/text-to-image',
  'ideogram/v4/instant',
  'ideogram/v4/fast',
  'alibaba/qwen-image-3/text-to-image',
  'microsoft/mai-image-2.5-pro',
  'google/nano-banana-2-lite',
  'fal-ai/recraft/v4.1/text-to-image',
  'ltx-2.3',
  'pixverse-v6',
  'seedance-2.0-mini',
  'veo3.1',
  'seedance-2.0',
  'seedance-2.5',
  'minimax-h3',
  'flux-3',
  'grok-imagine-1.5',
  'gemini-omni-flash',
  'kling-v3-4k',
  'happy-horse'
] as const

afterEach(() => setRuntimeI18nLocale('en'))

describe('Simplified Chinese localization regressions', () => {
  it('renders compact task ages as complete relative-time phrases', () => {
    expect(`5${zh.sidebar.row.ageHour}`).toBe('5小时前')
    expect(`2${zh.sidebar.row.ageDay}`).toBe('2天前')
    expect(`3${zh.sidebar.row.ageMin}`).toBe('3分钟前')
  })

  it('covers the command palette and task-list filter menu', () => {
    expect(zh.paletteCommands.reloadDesktopPlugins).toBe('重新加载桌面插件')
    expect(zh.paletteCommands.resetLayout).toBe('重置布局')
    expect(zh.sidebar.filterMenu.grouping).toBe('分组方式')
    expect(zh.sidebar.filterMenu.options.project).toBe('项目')
    expect(zh.sidebar.filterMenu.markAllRead).toBe('全部标记为已读')
  })

  it('covers every global setting rendered under Tools & Keys', () => {
    for (const key of GLOBAL_SETTING_KEYS) {
      expect(zh.settings.envKeys[key]?.prompt, `${key} label`).toBeTruthy()
      expect(zh.settings.envKeys[key]?.description, `${key} description`).toBeTruthy()
    }
  })

  it('uses 定时任务 consistently instead of 排程', () => {
    expect(zh.cron.title).toBe('定时任务')
    expect(zh.shell.statusbar.cron).toBe('定时任务')
    expect(JSON.stringify(zh)).not.toContain('排程')
  })

  it('covers every bundled FAL image and video model description', () => {
    for (const id of MEDIA_MODEL_IDS) {
      expect(zh.settings.toolsets.modelDescriptions[id], `${id} description`).toBeTruthy()
      expect(zh.settings.toolsets.modelPrices[id], `${id} price`).toBeTruthy()
    }
  })

  it('localizes terminal backend descriptions and setup guidance', () => {
    const copy = zh.settings.toolsets.terminalBackend

    for (const backend of ['local', 'docker', 'singularity', 'modal', 'daytona', 'ssh']) {
      expect(copy.descriptions[backend], `${backend} description`).toBeTruthy()
    }

    expect(copy.details['Neither singularity nor apptainer found on PATH.']).toContain('未找到')
    expect(copy.details['Set DAYTONA_API_KEY to use the Daytona backend.']).toContain('请设置')
  })

  it('resolves contribution labels from the renderer locale', () => {
    const label = (locale: 'en' | 'zh') => translateForLocale(locale, 'paletteCommands.resetLayout')

    expect(label('en')).toBe('Reset layout')
    expect(label('zh')).toBe('重置布局')
  })
})
