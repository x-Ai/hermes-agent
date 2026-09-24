import { describe, expect, it } from 'vitest'

import { en } from './en'
import { zh } from './zh'
import { zhHant } from './zh-hant'

describe('Chinese localization regressions', () => {
  it('keeps protocol names verbatim while localizing user-facing tier and bundled-plugin copy', () => {
    expect(zh.settings.mcp.catalogAuthOAuth).toBe('OAuth')
    expect(zh.shell.statusbar.toggleFreeTier).toBe('免费套餐')
    expect(zh.shell.statusbar.toggleFreeTier).not.toBe(en.shell.statusbar.toggleFreeTier)
    expect(zh.skills.plugins.bundledDescriptions['disk-cleanup']).not.toBe('')
    expect(zh.skills.plugins.bundledDescriptions['security-guidance']).not.toBe('')
  })

  it('ships localized intro pools instead of falling through to generated English slogans', () => {
    expect(zh.intro.stock.none).toHaveLength(5)
    expect(zh.intro.stock.none?.every(line => /[\u3400-\u9fff]/u.test(line))).toBe(true)
  })

  it('keeps newly added capability and error surfaces localized in Chinese', () => {
    for (const locale of [zh, zhHant]) {
      expect(locale.connectorsPage.title).not.toBe(en.connectorsPage.title)
      expect(locale.connectorsPage.page.loading).not.toBe(en.connectorsPage.page.loading)
      expect(locale.settings.customEndpoints.authSchemeLabel).not.toBe(en.settings.customEndpoints.authSchemeLabel)
      expect(locale.assistant.thread.errorCodes.context_overflow.title).not.toBe(
        en.assistant.thread.errorCodes.context_overflow.title
      )
      expect(locale.assistant.catalogInstall.securityHeading).not.toBe(en.assistant.catalogInstall.securityHeading)
    }
  })

  it('localizes the connectors directory and custom MCP form while preserving protocol names', () => {
    for (const locale of [zh, zhHant]) {
      const page = locale.connectorsPage

      expect(page.title).not.toBe(en.connectorsPage.title)
      expect(page.searchPlaceholder(65)).not.toBe(en.connectorsPage.searchPlaceholder(65))
      expect(page.page.managedUnavailable).not.toBe(en.connectorsPage.page.managedUnavailable)
      expect(page.group.available).not.toBe(en.connectorsPage.group.available)
      expect(page.add.action).not.toBe(en.connectorsPage.add.action)
      expect(page.add.title).not.toBe(en.connectorsPage.add.title)
      expect(page.add.pasteLabel).not.toBe(en.connectorsPage.add.pasteLabel)
      expect(page.add.command).not.toBe(en.connectorsPage.add.command)
      expect(page.add.args).not.toBe(en.connectorsPage.add.args)
      expect(page.add.envVars).not.toBe(en.connectorsPage.add.envVars)
      expect(page.add.passthrough).not.toBe(en.connectorsPage.add.passthrough)
      expect(page.add.cwd).not.toBe(en.connectorsPage.add.cwd)
      expect(page.add.headers).not.toBe(en.connectorsPage.add.headers)
      expect(page.add.auth).not.toBe(en.connectorsPage.add.auth)
      expect(page.add.editJson).not.toBe(en.connectorsPage.add.editJson)
      expect(page.add.typeStdio).toBe('STDIO')
      expect(page.add.typeHttp).toBe('Streamable HTTP')
      expect(page.add.url).toBe('URL')
      expect(page.add.authOauth).toBe('OAuth')
      expect(page.add.authBearer).toBe('Bearer token')
    }
  })
})
