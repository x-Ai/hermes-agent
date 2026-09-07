import { describe, expect, it } from 'vitest'

import { en } from './en'
import { localizeBlueprintDescription } from './blueprint-metadata'
import { localizeChannelDescription } from './channel-metadata'
import { localizeConfigLabel, localizeConfigOption } from './config-metadata'
import { localizeEnvDescription } from './env-metadata'
import { localizePluginDescription, localizePluginLabel } from './plugin-metadata'
import { zh } from './zh'
import { dashboardEn, dashboardZh } from './dashboard'

function leafPaths(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key))
}

describe('Chinese Dashboard localization', () => {
  it('provides every interface key shipped by the English catalog', () => {
    const englishPaths = leafPaths(en)
    const chinesePaths = new Set(leafPaths(zh))

    expect(englishPaths.filter(path => !chinesePaths.has(path))).toEqual([])

    const dashboardEnglishPaths = leafPaths(dashboardEn)
    const dashboardChinesePaths = new Set(leafPaths(dashboardZh))
    expect(dashboardEnglishPaths.filter(path => !dashboardChinesePaths.has(path))).toEqual([])
  })

  it('localizes backend metadata without changing its identifiers or English source copy', () => {
    const channelDescription = 'Expose Hermes as an OpenAI-compatible HTTP API.'

    expect(localizeChannelDescription('api_server', channelDescription, 'en')).toBe(channelDescription)
    expect(localizeChannelDescription('api_server', channelDescription, 'zh')).toContain('兼容 OpenAI')
    expect(localizeConfigLabel('updates.non_interactive_local_changes', 'zh')).toContain('本地更改')
    expect(localizeConfigOption('stash', 'zh')).toBe('暂存并恢复')
    expect(localizeEnvDescription('OPENROUTER_API_KEY', 'OpenRouter API key', 'zh')).toBe('OpenRouter API 密钥')
    expect(localizeBlueprintDescription('morning-brief', 'Morning briefing', 'zh')).toContain('每日早报')
    expect(localizePluginDescription('demo-plugin', 'A browser integration', 'zh')).toContain('demo-plugin')
    expect(localizePluginLabel('kanban', 'Kanban', 'zh')).toBe('看板')
  })
})
