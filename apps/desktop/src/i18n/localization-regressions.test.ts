import { afterEach, describe, expect, it } from 'vitest'

import { fieldCopyForSchemaKey } from '@/app/settings/field-copy'
import {
  localizedBadge,
  localizedModelDescription,
  localizedModelLabel,
  localizedModelSpeed
} from '@/app/settings/toolset-config-panel'
import { setRuntimeI18nLocale, translateForLocale } from '@/i18n'

import { TRANSLATIONS } from './catalog'
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
  'openai/gpt-image-2.5/flare/text-to-image',
  'openai/gpt-image-2.5/sunburst/text-to-image',
  'xai/grok-imagine-image/v2.0/text-to-image',
  'ltx-2.3',
  'pixverse-v6',
  'seedance-2.0-mini',
  'veo3.1',
  'seedance-2.0',
  'seedance-2.5',
  'minimax-h3',
  'minimax-h3-max',
  'flux-3',
  'grok-imagine-1.5',
  'gemini-omni-flash',
  'kling-v3-4k',
  'happy-horse'
] as const

const SCREENSHOT_MESSAGING_PLATFORM_IDS = [
  'google_chat',
  'yuanbao',
  'photon',
  'irc',
  'line',
  'teams',
  'ntfy',
  'simplex',
  'whatsapp_cloud',
  'relay',
  'msgraph_webhook'
] as const

const SCREENSHOT_MODEL_IDS = [
  'grok-imagine-image',
  'grok-imagine-image-2.0',
  'grok-imagine-image-quality',
  'gpt-image-2-low',
  'gpt-image-2-medium',
  'gpt-image-2-high',
  'gpt-image-2.5-flare',
  'gpt-image-2.5-flare-low',
  'gpt-image-2.5-flare-medium',
  'gpt-image-2.5-flare-high',
  'gpt-image-2.5-flare-xhigh',
  'gpt-image-2.5-flare-max',
  'gpt-image-2.5-sunburst',
  'gpt-image-2.5-sunburst-low',
  'gpt-image-2.5-sunburst-medium',
  'gpt-image-2.5-sunburst-high',
  'gpt-image-2.5-sunburst-xhigh',
  'gpt-image-2.5-sunburst-max',
  'openai/gpt-5.4-image-2',
  'google/gemini-3-pro-image',
  'google/gemini-3.1-flash-lite-image',
  'google/gemini-3.1-flash-image',
  'openai/gpt-image-2',
  'openai/gpt-image-1-mini',
  'microsoft/mai-image-2.5',
  'microsoft/mai-image-2.5-pro',
  'x-ai/grok-imagine-image-quality',
  'krea/krea-2-medium',
  'krea/krea-2-medium-turbo',
  'qwen/qwen-image-3-pro',
  'krea-2-medium',
  'krea-2-large',
  'krea-2-medium-turbo',
  'muse-image-1.0',
  'grok-imagine-video',
  'grok-imagine-video-1.5',
  'black-forest-labs/FLUX-1-schnell',
  'black-forest-labs/FLUX-2-klein-9b',
  'PrunaAI/p-image',
  'black-forest-labs/FLUX-1-dev',
  'black-forest-labs/FLUX-2-pro',
  'stabilityai/sdxl-turbo',
  'google/nano-banana-2-lite',
  'google/nano-banana-2',
  'google/nano-banana-pro',
  'Qwen/Qwen-Image-Max',
  'Wan-AI/Wan2.6-T2I',
  'Bria/fibo_edit',
  'black-forest-labs/FLUX-2-klein-4b',
  'black-forest-labs/FLUX-2-max',
  'black-forest-labs/FLUX-2-dev',
  'Bria/fibo',
  'ByteDance/Seedream-4',
  'Bria/Bria-3.2-vector',
  'Bria/Bria-3.2',
  'Bria/blur_background',
  'Bria/erase_foreground',
  'Bria/remove_background',
  'Bria/expand',
  'Qwen/Qwen-Image-Edit',
  'black-forest-labs/FLUX.1-Kontext-dev',
  'black-forest-labs/FLUX-1-Redux-dev',
  'black-forest-labs/FLUX-1.1-pro',
  'ByteDance/Seedance-1.5-Pro',
  'PrunaAI/p-video',
  'Wan-AI/Wan2.2-T2V-A14B',
  'Pixverse/Pixverse-6-T2V',
  'ByteDance/Seedance-2.0',
  'Wan-AI/Wan2.6-T2V',
  'nvidia/Cosmos3-Super',
  'nvidia/Cosmos3-Nano',
  'Pixverse/Pixverse-T2V-HD',
  'Pixverse/Pixverse-T2V',
  'google/veo-3.1-fast',
  'google/veo-3.1'
] as const

const SCREENSHOT_PRICE_IDS = [
  'openai/gpt-image-2.5/flare/text-to-image',
  'gpt-image-2.5-flare',
  'krea-2-medium',
  'muse-image-1.0',
  'grok-imagine-video',
  'black-forest-labs/FLUX-1-schnell',
  'minimax-h3-max'
] as const

describe('Container persistence setting localization', () => {
  it('ships a label and description in every desktop locale', () => {
    const englishDescription = fieldCopyForSchemaKey(
      TRANSLATIONS.en.settings.fieldDescriptions,
      'terminal.container_persistent'
    )

    for (const [locale, copy] of Object.entries(TRANSLATIONS)) {
      expect(
        fieldCopyForSchemaKey(copy.settings.fieldLabels, 'terminal.container_persistent'),
        `${locale} label`
      ).toBeTruthy()

      const description = fieldCopyForSchemaKey(copy.settings.fieldDescriptions, 'terminal.container_persistent')

      expect(description, `${locale} description`).toBeTruthy()

      if (locale !== 'en') {
        expect(description, `${locale} description falls back to English`).not.toBe(englishDescription)
      }
    }
  })
})

describe('Execution environment probe setting localization', () => {
  it('ships a label and description in every desktop locale', () => {
    const englishDescription = fieldCopyForSchemaKey(
      TRANSLATIONS.en.settings.fieldDescriptions,
      'agent.environment_probe'
    )

    for (const [locale, copy] of Object.entries(TRANSLATIONS)) {
      expect(
        fieldCopyForSchemaKey(copy.settings.fieldLabels, 'agent.environment_probe'),
        `${locale} label`
      ).toBeTruthy()

      const description = fieldCopyForSchemaKey(copy.settings.fieldDescriptions, 'agent.environment_probe')
      expect(description, `${locale} description`).toBeTruthy()

      if (locale !== 'en') {
        expect(description, `${locale} description falls back to English`).not.toBe(englishDescription)
      }
    }
  })
})

describe('Pool slot recovery localization', () => {
  it('names the same localized setting that the recovery action opens', () => {
    for (const [locale, copy] of Object.entries(TRANSLATIONS)) {
      expect(copy.desktop.poolSlotTimeoutBody, `${locale} recovery setting label`).toContain(
        copy.settings.poolLimits.warmBackends
      )
    }
  })
})

describe('Real browser profile setting localization', () => {
  it('ships its section, label, and description in every desktop locale', () => {
    const englishSection = TRANSLATIONS.en.settings.sections.browser
    const englishLabel = fieldCopyForSchemaKey(TRANSLATIONS.en.settings.fieldLabels, 'browser.use_real_profile')

    const englishDescription = fieldCopyForSchemaKey(
      TRANSLATIONS.en.settings.fieldDescriptions,
      'browser.use_real_profile'
    )

    for (const [locale, copy] of Object.entries(TRANSLATIONS)) {
      const label = fieldCopyForSchemaKey(copy.settings.fieldLabels, 'browser.use_real_profile')
      const description = fieldCopyForSchemaKey(copy.settings.fieldDescriptions, 'browser.use_real_profile')

      expect(copy.settings.sections.browser, `${locale} section`).toBeTruthy()
      expect(label, `${locale} label`).toBeTruthy()
      expect(description, `${locale} description`).toBeTruthy()

      if (locale !== 'en') {
        expect(copy.settings.sections.browser, `${locale} section falls back to English`).not.toBe(englishSection)
        expect(label, `${locale} label falls back to English`).not.toBe(englishLabel)
        expect(description, `${locale} description falls back to English`).not.toBe(englishDescription)
      }
    }
  })
})

const PROVIDER_CARD_NAMES = [
  'Actual Computer',
  'CommandCode',
  'GitHub Copilot',
  'Kilo Code',
  'Meta Model API',
  'OpenAI API',
  'Tencent TokenHub',
  'Vercel AI Gateway'
] as const

const PROVIDER_ENV_KEYS = [
  'ACTUAL_API_KEY',
  'ACTUAL_BASE_URL',
  'AI_GATEWAY_API_KEY',
  'AI_GATEWAY_BASE_URL',
  'ANTHROPIC_BASE_URL',
  'COMMANDCODE_API_KEY',
  'COMMANDCODE_BASE_URL',
  'COPILOT_GITHUB_TOKEN',
  'COPILOT_API_BASE_URL',
  'KILOCODE_BASE_URL',
  'MODEL_API_KEY',
  'META_BASE_URL',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'TOKENHUB_API_KEY',
  'TOKENHUB_BASE_URL'
] as const

const WEB_PROVIDER_TAGS = [
  'Perplexity Search API — ranked, date-stamped web results plus query-relevant page snippets for extract.',
  'Search + extract. Opt-in keyless; set TAVILY_API_KEY for higher limits.',
  'Zig headless browser spawned by Hermes, text-only (no screenshots)',
  'LTX, Pixverse, Seedance 2.0/2.5/Mini, Veo 3.1, MiniMax H3, FLUX 3, Kling 4K, Happy Horse, Grok Imagine, Gemini Omni — text-to-video & image-to-video',
  'Muse Image via Meta Model API (api.meta.ai)',
  'Gemini Flash Image, gpt-image-2, Krea 2, Qwen Image 3 & more via OpenRouter; uses OPENROUTER_API_KEY',
  'Semantic + neural web search with content extraction via the Exa SDK. Unthrottled, guaranteed service.',
  "Semantic + neural web search with content extraction on Exa's anonymous free tier. Rate-limited under burst load.",
  'Full search + extract; supports keyless cloud, direct API, and Nous tool-gateway routing.',
  "Independent web index for AI apps — fast search + page fetch on Keenable's anonymous free tier.",
  'Independent web index for AI apps. Keyed access with higher limits and guaranteed service.',
  "Objective-tuned search + page extraction on Parallel's anonymous free tier. Rate-limited under burst load.",
  'Objective-tuned search + parallel page extraction via the Parallel SDK. Unthrottled, guaranteed service.',
  'Search + extract. Works keyless; set TAVILY_API_KEY for higher limits.'
] as const

afterEach(() => setRuntimeI18nLocale('en'))

describe('Simplified Chinese localization regressions', () => {
  it('localizes Marketplace theme discovery and conversion failures', () => {
    expect(zh.settings.appearance.noInstalledThemeMatches('Trae Theme')).toBe(
      '已安装的主题中没有与“Trae Theme”匹配的项目'
    )
    expect(zh.settings.appearance.marketplaceThemeSource).toBe('来自 VS Code Marketplace')
    expect(zh.commandCenter.installTheme.installError).toBe('无法安装该主题')
    expect(zh.commandCenter.installTheme.invalidColorTheme).toMatch(/不是有效的 VS Code 颜色主题/u)
  })

  it('keeps the Fast model-row badge distinct from the localized option label', () => {
    expect(zh.shell.modelMenu.fast).toBe('Fast')
    expect(zh.shell.modelOptions.fast).toBe('快速')
  })

  it('renders compact task ages as complete relative-time phrases', () => {
    expect(`5${zh.sidebar.row.ageHour}`).toBe('5小时前')
    expect(`2${zh.sidebar.row.ageDay}`).toBe('2天前')
    expect(`3${zh.sidebar.row.ageMin}`).toBe('3分钟前')
  })

  it('keeps process exit codes in conventional English', () => {
    expect(zh.statusStack.exit(-1)).toBe('Exit code -1')
  })

  it('covers the command palette and task-list filter menu', () => {
    expect(zh.paletteCommands.reloadDesktopPlugins).toBe('重新加载桌面插件')
    expect(zh.paletteCommands.resetLayout).toBe('重置布局')
    expect(zh.sidebar.filterMenu.grouping).toBe('分组方式')
    expect(zh.sidebar.filterMenu.options.project).toBe('项目')
    expect(zh.sidebar.filterMenu.markAllRead).toBe('全部标记为已读')
  })

  it('keeps Slash as the literal command term throughout Simplified Chinese chrome', () => {
    const labels = [
      zh.keybinds.actions['composer.slash'],
      zh.composer.hotkeyDescs['composer.slash'],
      zh.desktop.emptySlashCommand
    ]

    for (const label of labels) {
      expect(label).toContain('Slash 命令')
      expect(label).not.toContain('斜杠命令')
    }
  })

  it('covers every global setting rendered under Tools & Keys', () => {
    for (const key of GLOBAL_SETTING_KEYS) {
      expect(zh.settings.envKeys[key]?.description, `${key} description`).toBeTruthy()
      expect(zh.settings.envKeys[key]?.prompt, `${key} label stays unlocalized`).toBeUndefined()
    }
  })

  it('localizes the voice model and provider-card descriptions', () => {
    expect(zh.settings.fieldDescriptions['stt.local.model']).toMatch(/[\u3400-\u9fff]/u)

    for (const name of PROVIDER_CARD_NAMES) {
      expect(zh.settings.providers.providerDescriptions[name], `${name} description`).toMatch(/[\u3400-\u9fff]/u)
    }

    for (const key of PROVIDER_ENV_KEYS) {
      expect(zh.settings.envKeys[key]?.description, `${key} description`).toMatch(/[\u3400-\u9fff]/u)
    }
  })

  it('localizes the current web-provider setup copy', () => {
    expect(zh.settings.envKeys.HASS_TOKEN?.description).toMatch(/[\u3400-\u9fff]/u)
    expect(zh.skills.toolsetDescriptions.web).toMatch(/[\u3400-\u9fff]/u)

    for (const tag of WEB_PROVIDER_TAGS) {
      expect(zh.settings.toolsets.tagCopy[tag], tag).toMatch(/[\u3400-\u9fff]/u)
    }

    expect(localizedBadge('free tier · key optional · no Chromium', zh.settings.toolsets.badgeTokens)).toBe(
      '免费档 · 密钥可选 · 无需 Chromium'
    )
    expect(
      localizedModelDescription(
        { id: 'live/openrouter-model', strengths: 'Image API model (from live OpenRouter catalog)' },
        zh.settings.toolsets.modelDescriptions,
        zh.settings.toolsets.tagCopy
      )
    ).toBe('图像 API 模型（来自 OpenRouter 实时目录）')
  })

  it('localizes the messaging and media copy shown in the reported screens', () => {
    for (const id of SCREENSHOT_MESSAGING_PLATFORM_IDS) {
      expect(zh.messaging.platformDescription[id], `${id} description`).toMatch(/[\u3400-\u9fff]/u)
    }

    for (const key of ['BUZZ_REPLY_IN_THREAD', 'PHOTON_READ_RECEIPTS']) {
      expect(zh.messaging.fieldCopy[key]?.label, `${key} label`).toMatch(/[\u3400-\u9fff]/u)
      expect(zh.messaging.fieldCopy[key]?.help, `${key} help`).toMatch(/[\u3400-\u9fff]/u)
    }

    for (const id of SCREENSHOT_MODEL_IDS) {
      expect(zh.settings.toolsets.modelDescriptions[id], `${id} description`).toMatch(/[\u3400-\u9fff]/u)
    }

    for (const id of ['gpt-image-2-low', 'gpt-image-2-medium', 'gpt-image-2-high', ...SCREENSHOT_PRICE_IDS]) {
      expect(zh.settings.toolsets.modelPrices[id], `${id} price`).toMatch(/[\u3400-\u9fff]/u)
    }

    expect(
      localizedModelLabel(
        { id: 'gpt-image-2.5-flare', display: 'GPT Image 2.5 Flare (Auto)' },
        zh.settings.toolsets.modelLabels
      )
    ).toBe('GPT Image 2.5 Flare（自动）')
    expect(localizedModelSpeed('Fast', zh.settings.toolsets.modelSpeeds)).toBe('快速')
    expect(fieldCopyForSchemaKey(zh.settings.fieldLabels, 'tts.deepinfra.model')).toBe('DeepInfra TTS 模型')
    expect(fieldCopyForSchemaKey(zh.settings.fieldLabels, 'tts.deepinfra.voice')).toBe('DeepInfra 语音')
    expect(zh.skills.toolsetLabels.connections).toBe('连接')
    expect(zh.skills.toolsetDescriptions.connections).toBe('远程连接器工具与账户授权')
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
