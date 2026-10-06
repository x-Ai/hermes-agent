import { describe, expect, it } from 'vitest'

import { en } from './en'
import { zh } from './zh'
import { zhHant } from './zh-hant'

const CJK = /[㐀-鿿]/u
const CHINESE = [zh, zhHant]

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
