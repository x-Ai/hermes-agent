import type { Unstable_TriggerItem } from '@assistant-ui/core'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderCommandsCatalog } from '@/app/session/hooks/use-prompt-actions/utils'
import type { HermesGateway } from '@/hermes'
import { I18nProvider, useI18n } from '@/i18n'
import { BUNDLED_LOCALES, TRANSLATIONS } from '@/i18n/catalog'
import { setRuntimeI18nLocale } from '@/i18n/runtime'
import type { Locale } from '@/i18n/types'
import {
  type CommandsCatalogLike,
  desktopSkinSlashCompletions,
  desktopSlashDescription,
  isDesktopSlashSuggestion,
  rememberDesktopCommandsCatalog
} from '@/lib/desktop-slash-commands'
import desktopSlashRegistry from '@/lib/desktop-slash-registry.json'
import { queryClient } from '@/lib/query-client'

import { useSlashCompletions } from './use-slash-completions'

const catalog: CommandsCatalogLike = {
  canon: { '/reset': '/new' },
  categories: [
    {
      name: 'Session',
      pairs: [
        ['/new', 'Backend description'],
        ['/retry', 'Retry the last message']
      ]
    }
  ],
  pairs: [
    ['/new', 'Backend description'],
    ['/retry', 'Retry the last message'],
    ['/my-skill', 'Author-owned description']
  ]
}

afterEach(() => {
  cleanup()
  queryClient.clear()
  setRuntimeI18nLocale('en')
  rememberDesktopCommandsCatalog(undefined)
})

describe('desktop slash description localization', () => {
  it('uses the active catalog across aliases and help while preserving unknown descriptions and usage syntax', () => {
    for (const [locale, copy] of Object.entries(TRANSLATIONS)) {
      setRuntimeI18nLocale(locale as Locale)

      for (const command of [
        '/new',
        '/save',
        '/retry',
        '/undo',
        '/title',
        '/branch',
        '/worktree',
        '/compress',
        '/stop'
      ]) {
        const expected = copy.composer.commandDescs[command]
        expect(expected, `${locale}: ${command}`).toBeTruthy()
        expect(desktopSlashDescription(command, 'backend')).toBe(expected)
      }

      for (const command of Object.keys(TRANSLATIONS.en.composer.commandDescs)) {
        expect(copy.composer.commandDescs[command], `${locale}: ${command}`).toBeTruthy()

        if (locale !== 'en') {
          expect(copy.composer.commandDescs[command], `${locale}: ${command}`).not.toBe(
            TRANSLATIONS.en.composer.commandDescs[command]
          )
        }
      }

      expect(desktopSlashDescription('/reset')).toBe(copy.composer.commandDescs['/new'])
      expect(desktopSlashDescription('/my-skill', 'Author-owned description')).toBe('Author-owned description')
      const syntax = '/retry [instructions]'
      expect(desktopSlashDescription('/retry', `Retry (usage: ${syntax})`)).toContain(syntax)
      const help = renderCommandsCatalog(catalog, copy.desktop)
      expect(help).toContain(copy.composer.commandDescs['/new'])
      expect(help).toContain(copy.composer.commandDescs['/retry'])
    }
  })

  it('never shows another locale the English the desktop writes for a built-in', () => {
    // A built-in with a DESKTOP_COMMAND_SPECS description but no commandDescs key
    // rendered that English everywhere, over the backend's own localized text
    // (/config, /history, /skills).
    const backend = 'backend description'
    const offered = Object.keys(desktopSlashRegistry).filter(isDesktopSlashSuggestion)
    const english = new Map(offered.map(command => [command, desktopSlashDescription(command, backend)]))
    const desktopWritten = offered.filter(command => english.get(command) !== backend)

    expect(desktopWritten).not.toHaveLength(0)

    for (const locale of BUNDLED_LOCALES.filter(locale => locale !== 'en')) {
      setRuntimeI18nLocale(locale)

      const leaked = desktopWritten.filter(
        command => desktopSlashDescription(command, backend) === english.get(command)
      )

      expect(leaked, locale).toEqual([])
    }
  })

  it('describes the desktop-owned /skin rows in the active locale and keeps theme text verbatim', () => {
    const themes = [
      { name: 'mono', label: 'Mono', description: 'Clean grayscale' },
      { name: 'slate', label: 'Slate', description: 'Cool slate blue' }
    ]

    const rows = () => new Map(desktopSkinSlashCompletions(themes, 'mono', '').map(row => [row.text, row.meta]))
    const english = rows()

    for (const locale of BUNDLED_LOCALES.filter(locale => locale !== 'en')) {
      setRuntimeI18nLocale(locale)
      const local = rows()

      for (const command of ['/skin list', '/skin next', '/skin mono']) {
        expect(local.get(command), `${locale}: ${command}`).not.toBe(english.get(command))
      }

      expect(local.get('/skin mono'), locale).toMatch(/Mono.* - Clean grayscale$/)
      expect(local.get('/skin slate'), locale).toBe(english.get('/skin slate'))
    }
  })

  it('refreshes both cached bare and typed suggestions when the UI locale changes', async () => {
    const request = vi.fn(async (method: string) =>
      method === 'commands.catalog'
        ? catalog
        : {
            items: [
              { text: '/new', meta: 'Backend description', kind: 'command' },
              { text: '/my-skill', meta: 'Author-owned description', kind: 'skill' }
            ]
          }
    )

    const api: {
      search?: (query: string) => readonly Unstable_TriggerItem[]
      setLocale?: ReturnType<typeof useI18n>['setLocale']
    } = {}

    function Probe() {
      api.setLocale = useI18n().setLocale
      api.search = useSlashCompletions({ gateway: { request } as unknown as HermesGateway }).adapter?.search

      return null
    }

    render(
      <I18nProvider configClient={null} initialLocale="en">
        <Probe />
      </I18nProvider>
    )

    for (const query of ['', 'ne']) {
      for (const locale of ['en', 'zh', 'ja', 'zh-hant', 'ar', 'ru', 'fr', 'de', 'es', 'en'] as const) {
        await act(async () => {
          await api.setLocale!(locale)
        })
        await waitFor(
          () => {
            const items = api.search!(query)

            expect(items.find(item => item.metadata?.command === '/new')?.description).toBe(
              TRANSLATIONS[locale].composer.commandDescs['/new']
            )
            expect(items.find(item => item.metadata?.command === '/my-skill')?.description).toBe(
              'Author-owned description'
            )
          },
          { timeout: 2000 }
        )
      }
    }

    expect(request).toHaveBeenCalledTimes(2)
  })
})
