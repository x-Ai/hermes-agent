import { describe, expect, it } from 'vitest'

import { APP_MENU_COPY, type AppMenuCopy, appMenuCopy, resolveAppMenuLocale } from './app-menu-copy'

const CJK = /[㐀-鿿]/u

const render = (copy: AppMenuCopy, key: keyof AppMenuCopy): string => {
  const value = copy[key]

  return typeof value === 'function' ? value('Hermes') : value
}

describe('application menu copy', () => {
  it('serves Chinese renderer locales from their own table and everything else in English', () => {
    expect(resolveAppMenuLocale('zh')).toBe('zh')
    expect(resolveAppMenuLocale('zh-Hans')).toBe('zh')
    expect(resolveAppMenuLocale('zh-CN')).toBe('zh')
    expect(resolveAppMenuLocale('zh-hant')).toBe('zh-hant')
    expect(resolveAppMenuLocale('zh-TW')).toBe('zh-hant')
    expect(resolveAppMenuLocale('zh-Hant-HK')).toBe('zh-hant')
    expect(resolveAppMenuLocale('ja')).toBe('en')
    expect(resolveAppMenuLocale('')).toBe('en')
    expect(resolveAppMenuLocale(undefined)).toBe('en')
    expect(resolveAppMenuLocale(42)).toBe('en')
  })

  it('translates every menu label for both Chinese variants and keeps the app name in the ones that carry it', () => {
    const english = appMenuCopy('en')
    const keys = Object.keys(english) as (keyof AppMenuCopy)[]

    for (const locale of ['zh', 'zh-hant'] as const) {
      const copy = appMenuCopy(locale)

      expect(Object.keys(copy).sort()).toEqual([...keys].sort())

      for (const key of keys) {
        const text = render(copy, key)

        expect(text, `${locale}.${key}`).toMatch(CJK)
        expect(text, `${locale}.${key}`).not.toBe(render(english, key))
      }

      for (const key of ['about', 'hide', 'quit', 'trayShow', 'trayQuit'] as const) {
        expect(copy[key]('Hermes Canary')).toContain('Hermes Canary')
      }
    }
  })

  it('keeps the English menu as the platform showed it before the tables existed', () => {
    expect(APP_MENU_COPY.en.about('Hermes')).toBe('About Hermes')
    expect(APP_MENU_COPY.en.checkForUpdates).toBe('Check for Updates…')
    expect(APP_MENU_COPY.en.trayShow('Hermes')).toBe('Show Hermes')
  })
})
