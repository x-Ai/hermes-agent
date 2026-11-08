import { renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

const active = vi.hoisted(() => ({ locale: 'en' }))

vi.mock('@hermes/plugin-sdk', () => ({
  useI18n: () => ({ t: TRANSLATIONS[active.locale as keyof typeof TRANSLATIONS] }),
  usePluginI18n: () => (key: string) =>
    key
      .split('.')
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)?.[part],
        BOTS_LOCALES[active.locale as keyof typeof TRANSLATIONS]
      )
}))
vi.mock('../plugins/hermes-bots/shared', () => ({ getPluginCtx: () => null }))

import { useCanonicalGroupLabels } from '../plugins/hermes-bots/canonical-group-labels'
import { BOTS_LOCALES } from '../plugins/hermes-bots/i18n'

import { TRANSLATIONS } from './catalog'

it('provides translated canonical group controls and recovery copy in every supported locale', () => {
  const english = BOTS_LOCALES.en?.canonical as Record<string, string> | undefined
  expect(english).toBeDefined()

  for (const locale of Object.keys(TRANSLATIONS) as Array<keyof typeof TRANSLATIONS>) {
    active.locale = locale
    const { result, unmount } = renderHook(useCanonicalGroupLabels)
    expect(result.current.back).toBe(TRANSLATIONS[locale].common.back)
    expect(result.current.download).toBe(TRANSLATIONS[locale].fileMenu.download)
    const messages = BOTS_LOCALES[locale]?.canonical as Record<string, string> | undefined
    expect(messages, locale).toBeDefined()
    expect(Object.keys(messages!).sort(), locale).toEqual(Object.keys(english!).sort())

    for (const [key, value] of Object.entries(messages!)) {
      expect(result.current[key as keyof typeof result.current]).toBe(value)
      expect(value.trim(), `${locale}.${key}`).not.toBe('')

      if (locale !== 'en') {
        expect(value, `${locale}.${key}`).not.toBe(english![key])
      }
    }

    unmount()
  }
})


// This fork opens every group chat in its own room view, so core's gatewayGroupOpen block has no
// reader and was retired (174dc4de18); the feedback a reader sees while one opens is the plugin's
// loading copy.
it('translates group chat opening feedback in every supported locale', () => {
  const english = BOTS_LOCALES.en?.canonical as Record<string, string>

  for (const locale of Object.keys(TRANSLATIONS)) {
    if (locale === 'en') {continue}

    const copy = BOTS_LOCALES[locale]?.canonical as Record<string, string> | undefined

    for (const key of ['loadingGroup', 'loadingGroups'] as const) {
      expect(copy?.[key]?.trim(), `${locale}.${key}`).toBeTruthy()
      expect(copy?.[key], `${locale}.${key}`).not.toBe(english[key])
    }
  }
})
