import { describe, expect, it } from 'vitest'

import { localizeBlueprintField } from './blueprint-metadata'
import { localizeEnvDescription } from './env-metadata'
import { localizePluginDescription } from './plugin-metadata'

const CJK = /[㐀-鿿]/

/**
 * Backend metadata localizers either return a curated translation for the exact
 * key/text they know, or the backend's own English unchanged. They never build a
 * sentence from the key, so a new field, variable, or plugin reads correctly in
 * every locale on the day the backend ships it.
 */
describe('backend metadata pass-through', () => {
  it('blueprint slot help is translated only for known catalog sentences', () => {
    const known = { name: 'time', type: 'time' as const, label: 'What time?', default: '08:00', options: [], optional: false, help: '24h local time, e.g. 08:00' }
    const novel = { ...known, name: 'deliver', label: 'Where to deliver?', help: 'origin = the chat you set this up from; local = save only; or a platform name plus thread id' }

    const localizedKnown = localizeBlueprintField(known, 'zh')
    expect(localizedKnown.label).not.toBe(known.label)
    expect(localizedKnown.help).not.toBe(known.help)
    expect(localizedKnown.help).toContain('08:00')
    expect(CJK.test(localizedKnown.help)).toBe(true)

    const localizedNovel = localizeBlueprintField(novel, 'zh')
    expect(localizedNovel.label).not.toBe(novel.label)
    expect(localizedNovel.help).toBe(novel.help)
    expect(localizeBlueprintField(known, 'en')).toEqual({ label: known.label, help: known.help })
  })

  it('environment descriptions are translated per exact key and otherwise kept verbatim', () => {
    const curated = localizeEnvDescription('OPENROUTER_API_KEY', 'OpenRouter API key', 'zh')
    expect(curated).not.toBe('OpenRouter API key')
    expect(curated).toContain('OpenRouter')

    const prompt = 'MCP Server URL (n8n Settings > Instance-level MCP > Connect; ends in /mcp-server/http)'
    expect(localizeEnvDescription('N8N_MCP_SERVER_URL', prompt, 'zh')).toBe(prompt)
    expect(localizeEnvDescription('TELEGRAM_ALLOWED_USERS', 'Optional comma-separated numeric Telegram user IDs', 'zh')).toBe(
      'Optional comma-separated numeric Telegram user IDs'
    )
    expect(localizeEnvDescription('MY_CUSTOM_VAR', '', 'zh')).toBe('')
    expect(localizeEnvDescription('OPENROUTER_API_KEY', 'OpenRouter API key', 'en')).toBe('OpenRouter API key')
  })

  it('plugin descriptions are translated per plugin name and never guessed from keywords', () => {
    const webish = 'Publishes a weekly web digest of your notes'
    expect(localizePluginDescription('notes-digest', webish, 'zh')).toBe(webish)
    expect(localizePluginDescription('notes-digest', webish, 'en')).toBe(webish)

    const kanban = 'Multi-agent collaboration board — drag-drop cards across columns'
    const localized = localizePluginDescription('kanban', kanban, 'zh')
    expect(localized).not.toBe(kanban)
    expect(CJK.test(localized)).toBe(true)
    expect(localizePluginDescription('kanban', '', 'zh')).toBe('')

    // Catalog installs carry their repo's English manifest; a curated entry covers them the same way.
    const homeassistant = 'Home Assistant for Hermes Agent: a gateway platform adapter plus four smart-home tools.'
    expect(localizePluginDescription('homeassistant', homeassistant, 'zh')).not.toBe(homeassistant)
    expect(CJK.test(localizePluginDescription('homeassistant', homeassistant, 'zh'))).toBe(true)
    expect(localizePluginDescription('homeassistant', homeassistant, 'en')).toBe(homeassistant)
  })
})
