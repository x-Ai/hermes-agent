import { describe, expect, it } from 'vitest'

import { en } from './en'
import { zh } from './zh'
import { zhHant } from './zh-hant'
import { ja } from './ja'
import { de } from './de'
import { es } from './es'
import { fr } from './fr'
import { tr } from './tr'
import { uk } from './uk'
import { af } from './af'
import { ko } from './ko'
import { it as italian } from './it'
import { ga } from './ga'
import { pt } from './pt'
import { ru } from './ru'
import { hu } from './hu'
import { ar } from './ar'
import { dashboardEn, dashboardZh } from './dashboard'
import { localizeBlueprintDescription } from './blueprint-metadata'
import { localizeChannelDescription } from './channel-metadata'
import { localizeConfigLabel, localizeConfigOption } from './config-metadata'
import { localizeEnvDescription } from './env-metadata'
import { localizePluginLabel } from './plugin-metadata'

function leafPaths(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key))
}

function leafAt(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (node, key) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined),
    root
  )
}

/** `{name}`-style tokens a caller substitutes at render time. */
function placeholders(text: string): string[] {
  return [...text.matchAll(/\{[A-Za-z0-9_]+\}/g)].map(match => match[0]).sort()
}

// `{s}` is the English plural suffix (`key{s}` → "keys"); languages without that
// inflection drop it, so it is the one token a translation may omit.
const PLURAL_SUFFIX = '{s}'

const CJK = /[㐀-鿿]/
/** Two consecutive lowercase words is an English sentence, not a brand, acronym, or format string. */
const ENGLISH_PROSE = /\b[a-z]+\s+[a-z]+\b/

const TRANSLATED_LOCALES = { zh, 'zh-hant': zhHant, ja, de, es, fr, tr, uk, af, ko, it: italian, ga, pt, ru, hu, ar }
const PEER_LOCALES = { ja, de, es, fr, tr, uk, af, ko, it: italian, ga, pt, ru, hu }

describe('Dashboard catalog parity', () => {
  const englishPaths = leafPaths(en)

  it('Simplified Chinese provides every interface key shipped by the English catalog', () => {
    const chinesePaths = new Set(leafPaths(zh))
    expect(englishPaths.filter(path => !chinesePaths.has(path))).toEqual([])

    const dashboardChinesePaths = new Set(leafPaths(dashboardZh))
    expect(leafPaths(dashboardEn).filter(path => !dashboardChinesePaths.has(path))).toEqual([])
  })

  it('Traditional Chinese covers every English key any peer locale covers', () => {
    // Keys typed optional may be absent from every partial locale (consumers fall back
    // with `??`); zh-hant must never be the one locale that falls behind its peers.
    const traditionalPaths = new Set(leafPaths(zhHant))
    const coveredByPeers = englishPaths.filter(path =>
      Object.values(PEER_LOCALES).some(locale => leafAt(locale, path) !== undefined)
    )
    expect(coveredByPeers.filter(path => !traditionalPaths.has(path))).toEqual([])
  })

  it('every locale keeps the placeholder tokens of the English string it translates', () => {
    const problems: string[] = []
    for (const [name, locale] of Object.entries(TRANSLATED_LOCALES)) {
      for (const path of englishPaths) {
        const english = leafAt(en, path)
        const translated = leafAt(locale, path)
        if (typeof english !== 'string' || typeof translated !== 'string') continue
        const expected = placeholders(english)
        const actual = placeholders(translated)
        const introduced = actual.filter(token => !expected.includes(token))
        const dropped = expected.filter(token => token !== PLURAL_SUFFIX && !actual.includes(token))
        if (introduced.length || dropped.length) {
          problems.push(`${name} ${path}: introduced [${introduced}] dropped [${dropped}]`)
        }
      }
    }
    for (const path of leafPaths(dashboardEn)) {
      const english = leafAt(dashboardEn, path)
      const translated = leafAt(dashboardZh, path)
      if (typeof english !== 'string' || typeof translated !== 'string') continue
      if (placeholders(english).join() !== placeholders(translated).join()) problems.push(`dashboard zh ${path}`)
    }
    expect(problems).toEqual([])
  })
})

describe('Simplified Chinese resolved values', () => {
  function assertTranslatedLeaves(english: unknown, chinese: unknown) {
    const untranslated: string[] = []
    const rawKeys: string[] = []
    for (const path of leafPaths(english)) {
      const source = leafAt(english, path)
      const value = leafAt(chinese, path)
      if (typeof source !== 'string' || typeof value !== 'string') continue
      if (value === path.split('.').pop()) rawKeys.push(path)
      if (value === source && ENGLISH_PROSE.test(source)) untranslated.push(path)
    }
    expect(rawKeys).toEqual([])
    expect(untranslated).toEqual([])
  }

  it('never surface a raw key or an untranslated English sentence', () => {
    assertTranslatedLeaves(en, zh)
    assertTranslatedLeaves(dashboardEn, dashboardZh)
  })

  it('keep every sidebar label distinct from its English source unless it is an acronym', () => {
    for (const [key, english] of Object.entries(en.app.nav)) {
      const chinese = zh.app.nav[key as keyof typeof zh.app.nav]
      expect(chinese, key).toBeTruthy()
      expect(chinese, key).not.toBe(key)
      if (!/^[A-Z0-9]+$/.test(english)) expect(chinese, key).not.toBe(english)
    }
    expect(localizePluginLabel('kanban', 'Kanban', 'zh')).not.toBe('Kanban')
    expect(localizePluginLabel('hermes-achievements', 'Achievements', 'zh')).not.toBe('Achievements')
  })

  it('translate the canonical default identifier consistently across surfaces', () => {
    expect(CJK.test(zh.profiles.defaultBadge)).toBe(true)
    expect(zh.kanban.defaultLabel).toBe(zh.profiles.defaultBadge)
    expect(zh.kanban.defaultValue).toContain('{name}')
    expect(zh.kanban.defaultValue).toContain(zh.kanban.defaultLabel)
    for (const key of ['orchestrationSettings', 'orchestrationAuto', 'orchestrationManual'] as const) {
      const value = zh.kanban[key]
      expect(value, key).toBeDefined()
      expect(CJK.test(value ?? ''), key).toBe(true)
      expect(value, key).not.toBe(en.kanban[key])
    }
  })

  it('localize backend metadata without changing its identifiers or English source copy', () => {
    const channelDescription = 'Expose Hermes as an OpenAI-compatible HTTP API.'
    expect(localizeChannelDescription('api_server', channelDescription, 'en')).toBe(channelDescription)
    const chineseChannel = localizeChannelDescription('api_server', channelDescription, 'zh')
    expect(chineseChannel).not.toBe(channelDescription)
    expect(CJK.test(chineseChannel)).toBe(true)

    const configLabel = localizeConfigLabel('updates.non_interactive_local_changes', 'zh')
    expect(configLabel).not.toBe('updates.non_interactive_local_changes')
    expect(CJK.test(configLabel)).toBe(true)
    expect(CJK.test(localizeConfigOption('stash', 'zh'))).toBe(true)

    expect(localizeEnvDescription('OPENROUTER_API_KEY', 'OpenRouter API key', 'zh')).not.toBe('OpenRouter API key')
    expect(localizeEnvDescription('OPENROUTER_API_KEY', 'OpenRouter API key', 'zh')).toContain('OpenRouter')
    expect(localizeBlueprintDescription('morning-brief', 'Morning briefing', 'zh')).not.toBe('Morning briefing')
    expect(CJK.test(localizeBlueprintDescription('morning-brief', 'Morning briefing', 'zh'))).toBe(true)
  })
})
