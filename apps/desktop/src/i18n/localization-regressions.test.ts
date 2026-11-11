import { describe, expect, it } from 'vitest'

import { resolveDesktopCommand } from '@/lib/desktop-slash-commands'
import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'
import botsPlugin from '@/plugins/hermes-bots/plugin'

import { BUNDLED_LOCALES, TRANSLATIONS } from './catalog'
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

type Template = (...args: unknown[]) => unknown

// Every template function under a catalog node as [path, template].
function collectTemplates(node: unknown, path = '', out: [string, Template][] = []): [string, Template][] {
  if (typeof node === 'function') {
    out.push([path, node as Template])
  } else if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [key, value] of Object.entries(node)) {
      collectTemplates(value, path ? `${path}.${key}` : key, out)
    }
  }

  return out
}

// Numbers only, so no Latin word comes from an argument; 0 and 1 reach both sides of
// a count or flag branch.
function renderTemplate(template: Template): string[] {
  return [
    [1, 1, 1, 1],
    [2, 2, 2, 2],
    [0, 0, 0, 0]
  ].flatMap(args => {
    try {
      const text = template(...args)

      return typeof text === 'string' ? [text] : []
    } catch {
      return [] // A template that needs structured arguments; nothing to inspect.
    }
  })
}

const latinWords = (text: string) => (text.match(/[A-Za-z][A-Za-z']{2,}/g) ?? []).map(word => word.toLowerCase())

// Names Chinese copy keeps in Latin script, spelled as the catalogs spell them: products,
// units and keys, terms of art (shell, sudo, Cookie), the `main` branch and the clarify
// tool's `questions` / `question` parameters.
const LATIN_NAMES =
  /\b(?:Team Gateway|Tailscale Serve|Hermes Desktop|Hermes Cloud|Hermes|Nous|OpenAI|ElevenLabs|Stripe|Telegram|Cloudflare|Git|JavaScript|WebSocket|OAuth|MoA|Webapp|Portal|Tokens?|Mtok|MiB|Ctrl|Cmd|shell|sudo|Cookie|main|questions?)\b/g

// The Latin words a Chinese rendering keeps once names, acronyms, code spans, URLs,
// slash commands with their arguments, `hermes …` invocations, identifiers
// (`execute_code`, `cron.model`, `.env`, `desktop-plugins`) and argument values are set aside.
function untranslatedWords(text: string): string[] {
  const prose = text
    .replace(/`[^`]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(LATIN_NAMES, ' ')
    .replace(/\bhermes(?: [a-z][\w-]*)+/g, ' ')
    .replace(/(?<![\w.])\/[a-z][\w-]*(?: (?:<[^>]+>|[a-z][\w-]*))*/g, ' ')
    .replace(/\w+(?:[._:/=[\]-]+\w+)+|\w*_\w*|(?<!\w)\.[A-Za-z]\w*/g, ' ')
    .replace(/(?<![A-Za-z])[A-Z]{2,}(?![a-z])|\b(?:undefined|null|true|false|NaN)\b/g, ' ')

  return latinWords(prose)
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

  // Machine translation that could not parse a template kept the English words around
  // its arguments and translated at most the tail ("1 tool call failed", "Exit code 1",
  // "Connected — 3 tools available"). A word a Chinese template shares with its English
  // template has to be a name.
  it('translates every template around its arguments, keeping only names in Latin script', () => {
    for (const [name, locale] of [
      ['zh', zh],
      ['zh-hant', zhHant]
    ] as const) {
      const faults = collectTemplates(locale).flatMap(([path, template]) => {
        const english = path
          .split('.')
          .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], en)

        if (typeof english !== 'function') {
          return []
        }

        const englishWords = new Set(renderTemplate(english as Template).flatMap(latinWords))
        const kept = new Set(renderTemplate(template).flatMap(untranslatedWords))
        const shared = [...kept].filter(word => englishWords.has(word))

        return shared.length ? [`${path}: ${shared.join(', ')}`] : []
      })

      expect(faults, name).toEqual([])
    }
  })
})

// A number in this copy states a backend fact: the connect watch lasts 10 minutes
// (OPERATION_DEADLINE_SECONDS). A merge that kept older translations left most locales at 5.
describe('backend facts stated in copy', () => {
  it('names the connect-watch deadline English names in every bundled locale', () => {
    const minutes = en.connectors.directory.receiptTimedOut.match(/\d+/g)

    for (const locale of BUNDLED_LOCALES) {
      expect(TRANSLATIONS[locale].connectors.directory.receiptTimedOut.match(/\d+/g), locale).toEqual(minutes)
    }
  })

  // The slash menu reads /browser's description from these catalogs, so its argument list is what
  // users are told they can type. Upstream dropped `/browser use`; older merges kept it everywhere.
  it('offers only the /browser subcommands the desktop registry accepts, in every bundled locale', () => {
    const accepted = resolveDesktopCommand('/browser')?.description?.match(/\[[^\]]*\]/)?.[0]

    expect(accepted).toBeTruthy()

    for (const locale of BUNDLED_LOCALES) {
      expect(TRANSLATIONS[locale].composer.commandDescs['/browser'].match(/\[[^\]]*\]/)?.[0], locale).toBe(accepted)
    }
  })
})

// What the copy tells people to do has to match what the screen and the platform do now.
describe('platform and behaviour facts stated in copy', () => {
  // GNOME Keyring and KWallet exist only on Linux; macOS and Windows keep secrets in their own keychain.
  it('scopes GNOME Keyring and KWallet to Linux in the plain-text token warnings', () => {
    for (const locale of BUNDLED_LOCALES) {
      for (const key of ['plainTextConfirmDesc', 'plainTextStoredDesc'] as const) {
        const text = TRANSLATIONS[locale].settings.gateway[key]

        if (/GNOME Keyring|KWallet/.test(text)) {
          expect(text, `${locale} ${key}`).toContain('Linux')
        }
      }
    }
  })
  // The logged-out Billing notice opens the in-app sign-in dialog (use-billing-state.ts), never a portal link.
  it('offers the in-app sign-in on the logged-out Billing notice in every bundled locale', () => {
    for (const locale of BUNDLED_LOCALES) {
      const notice = TRANSLATIONS[locale].settings.billing.state.notice.loggedOut

      expect(notice.action, locale).not.toContain('↗')
      expect(notice.message, locale).not.toContain('/portal')
    }
  })
  // The toast names the user's own New session chord (newSessionShortcut() in sessions-settings.tsx): the
  // Webapp default is not Ctrl/⌘+N, and a remapped or unbound chord must not be contradicted.
  it("names the user's New session shortcut in the default-folder toast, never a hard-coded one", () => {
    for (const locale of BUNDLED_LOCALES) {
      const toast = TRANSLATIONS[locale].settings.sessions.defaultDirUpdated

      expect(toast(null), locale).not.toMatch(/Ctrl|Strg|⌘/)
      expect(toast('Alt+N') === toast(null) || toast('Alt+N').includes('Alt+N'), locale).toBe(true)
    }

    expect(en.settings.sessions.defaultDirUpdated('Alt+N')).toContain('Alt+N')
  })
  // The up-to-date row shows whenever the configured build is the one serving (updateApplied in
  // local-models-runtime-section.tsx), and that build can be pinned, so it is not "the latest build
  // Hermes ships" (de5a1da632 retracted that claim).
  it('names the running engine build without calling it the newest Hermes ships, in every bundled locale', () => {
    for (const locale of BUNDLED_LOCALES) {
      const detail = TRANSLATIONS[locale].settings.localModels.upToDateDetail('b8000', 'metal')

      expect(detail, locale).toContain('b8000')
      expect(detail, locale).toContain('metal')
      expect(detail, locale).not.toContain('Hermes')
    }
  })
})
