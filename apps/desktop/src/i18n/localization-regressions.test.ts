import { describe, expect, it } from 'vitest'

import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'
import botsPlugin from '@/plugins/hermes-bots/plugin'

import { en } from './en'
import { resolveTranslations } from './registry'
import { zh } from './zh'
import { zhHant } from './zh-hant'

const CJK = /[㐀-鿿]/u
const CHINESE = [zh, zhHant]

// Every user-facing string under a catalog node as [path, text], template
// functions included (rendered with placeholder arguments).
function collectCopy(node: unknown, path = '', out: [string, string][] = []): [string, string][] {
  if (typeof node === 'string') {
    out.push([path, node])
  } else if (typeof node === 'function') {
    try {
      const text = (node as (...args: unknown[]) => unknown)('样例', '样例', 2)

      if (typeof text === 'string') {
        out.push([path, text])
      }
    } catch {
      // A template that needs structured arguments; nothing to inspect.
    }
  } else if (Array.isArray(node)) {
    node.forEach((item, index) => collectCopy(item, `${path}[${index}]`, out))
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      collectCopy(value, path ? `${path}.${key}` : key, out)
    }
  }

  return out
}

// Contracts between the Chinese catalogs and English: protocol names stay
// identical, user-facing copy must differ from English and be written in
// Chinese. No literal wording is frozen here — re-polishing a string must
// not fail these.
describe('Chinese localization regressions', () => {
  it('keeps protocol names verbatim while localizing user-facing tier and plugin manifest copy', () => {
    for (const locale of CHINESE) {
      expect(locale.settings.mcp.catalogAuthOAuth).toBe(en.settings.mcp.catalogAuthOAuth)
      expect(locale.shell.statusbar.toggleFreeTier).not.toBe(en.shell.statusbar.toggleFreeTier)
      expect(locale.shell.statusbar.toggleFreeTier).toMatch(CJK)

      for (const plugin of ['disk-cleanup', 'security-guidance', 'homeassistant'] as const) {
        expect(locale.skills.plugins.bundledDescriptions[plugin], plugin).toMatch(CJK)
        expect(locale.skills.plugins.bundledDescriptions[plugin], plugin).not.toBe(
          en.skills.plugins.bundledDescriptions[plugin]
        )
      }

      for (const key of [
        'alwaysExternalLinksTitle',
        'alwaysExternalLinksDesc',
        'voiceShortcutHintTitle',
        'voiceShortcutHintDesc'
      ] as const) {
        expect(locale.settings.config[key], key).not.toBe(en.settings.config[key])
        expect(locale.settings.config[key], key).toMatch(CJK)
      }
    }

    // zh and zh-hant curate the same set of plugin titles.
    expect(Object.keys(zhHant.skills.plugins.bundledNames).sort()).toEqual(
      Object.keys(zh.skills.plugins.bundledNames).sort()
    )
  })

  it('ships localized intro pools instead of falling through to generated English slogans', () => {
    for (const locale of CHINESE) {
      const pool = locale.intro.stock.none ?? []

      expect(pool.length).toBeGreaterThan(0)
      expect(pool.every(line => CJK.test(line))).toBe(true)
    }
  })

  it('localizes bundled layout preset names instead of rendering their English titles', () => {
    for (const locale of CHINESE) {
      for (const [id, title] of Object.entries(en.zones.layoutNames)) {
        expect(locale.zones.layoutNames[id], id).toMatch(CJK)
        expect(locale.zones.layoutNames[id], id).not.toBe(title)
      }
    }
  })

  it('keeps newly added capability and error surfaces localized in Chinese', () => {
    for (const locale of CHINESE) {
      expect(locale.connectorsPage.title).not.toBe(en.connectorsPage.title)
      expect(locale.connectorsPage.page.loading).not.toBe(en.connectorsPage.page.loading)
      expect(locale.settings.customEndpoints.authSchemeLabel).not.toBe(en.settings.customEndpoints.authSchemeLabel)
      expect(locale.assistant.thread.errorCodes.context_overflow.title).not.toBe(
        en.assistant.thread.errorCodes.context_overflow.title
      )
      expect(locale.assistant.catalogInstall.securityHeading).not.toBe(en.assistant.catalogInstall.securityHeading)

      // Every backend tag English knows has a Chinese rendering that is not the tag itself.
      for (const tag of Object.keys(en.settings.toolsets.tagCopy)) {
        expect(locale.settings.toolsets.tagCopy[tag], tag).toBeTruthy()
        expect(locale.settings.toolsets.tagCopy[tag], tag).not.toBe(tag)
      }
    }
  })

  it('titles the Bots plugin row with the same word the Bots pane and tab use', () => {
    // The Capabilities ▸ Plugins row reads the manifest's `localizedName`; the pane and
    // tab titles read `common.bots`. One feature, one name per locale — and in zh that
    // name must stay clear of 智能体, which is the kind pill of every agent-half plugin.
    const names = botsPlugin.localizedName

    expect(Object.keys(names).length).toBeGreaterThan(0)

    for (const [locale, name] of Object.entries(names)) {
      expect(name, locale).toBe(resolveTranslations(locale).common.bots)
    }
  })

  it('calls the bots 机器人 / 機器人 throughout Bot Mode, never 智能体 / 智慧體', () => {
    // 智能体 is what the kind pill calls every agent-half plugin; inside Bot Mode the
    // roster entries are bots and share the name of the pane, tab and plugin row.
    const bundles = BOTS_LOCALES as Record<string, unknown>
    const forbidden: Record<string, RegExp> = { zh: /智能体/u, 'zh-hant': /智慧體|智慧代理/u }

    for (const [locale, pattern] of Object.entries(forbidden)) {
      const offenders = collectCopy(bundles[locale]).filter(([, text]) => pattern.test(text))

      expect(offenders, locale).toEqual([])
    }

    // Shell copy that talks about bots outside the plugin follows the same word.
    expect(zh.composer.botSelectionRequired).toContain('机器人')
    expect(zh.composer.botChatUnsupported).toContain('机器人')
    expect(zh.settings.about.bundleOutOfSyncDesc).toContain('机器人模式')
    expect(zhHant.composer.botSelectionRequired).toContain('機器人')
    expect(zhHant.composer.botChatUnsupported).toContain('機器人')
    expect(zhHant.settings.about.bundleOutOfSyncDesc).toContain('機器人模式')
  })

  it('localizes the connectors directory and custom MCP form while preserving protocol names', () => {
    for (const locale of CHINESE) {
      const page = locale.connectorsPage

      expect(page.title).not.toBe(en.connectorsPage.title)
      expect(page.searchPlaceholder(65)).not.toBe(en.connectorsPage.searchPlaceholder(65))
      expect(page.page.managedUnavailable).not.toBe(en.connectorsPage.page.managedUnavailable)
      expect(page.group.available).not.toBe(en.connectorsPage.group.available)

      for (const key of [
        'action',
        'title',
        'pasteLabel',
        'command',
        'args',
        'envVars',
        'passthrough',
        'cwd',
        'headers',
        'auth',
        'editJson'
      ] as const) {
        expect(page.add[key], key).not.toBe(en.connectorsPage.add[key])
      }

      // Protocol and scheme names are identifiers, kept exactly as English spells them.
      for (const key of ['typeStdio', 'typeHttp', 'url', 'authOauth', 'authBearer'] as const) {
        expect(page.add[key], key).toBe(en.connectorsPage.add[key])
      }
    }
  })
})
