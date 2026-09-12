import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from './catalog'
import type { Locale } from './types'

const LOCALIZED_LOCALES: Locale[] = ['zh', 'zh-hant', 'ja', 'ar', 'ru']

describe('guided onboarding localization', () => {
  it.each(LOCALIZED_LOCALES)('does not fall back to English for new %s surfaces', locale => {
    const english = TRANSLATIONS.en
    const localized = TRANSLATIONS[locale]

    expect(localized.connectors.title).not.toBe(english.connectors.title)
    expect(localized.introReveal.skip).not.toBe(english.introReveal.skip)
    expect(localized.introReveal.composerPlaceholder).not.toBe(english.introReveal.composerPlaceholder)
    expect(localized.guidedOnboarding.skipSetup).not.toBe(english.guidedOnboarding.skipSetup)
    expect(localized.guidedOnboarding.script.forkQuestion).not.toBe(english.guidedOnboarding.script.forkQuestion)
    expect(localized.guidedOnboarding.errors.firstBuildNeedsAttention).not.toBe(
      english.guidedOnboarding.errors.firstBuildNeedsAttention
    )
  })
})
