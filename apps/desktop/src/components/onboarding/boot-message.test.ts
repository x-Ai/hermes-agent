import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/en'
import { zh } from '@/i18n/zh'
import { zhHant } from '@/i18n/zh-hant'

import { localizedBootMessage } from './boot-message'

const LOCALES = [
  ['zh', zh.boot.steps],
  ['zh-hant', zhHant.boot.steps]
] as const

describe('localizedBootMessage', () => {
  it('uses localized copy for stable boot phases and preserves unknown diagnostics', () => {
    for (const [locale, steps] of LOCALES) {
      const localized = localizedBootMessage('backend.port', 'Waiting for Hermes backend to launch', steps)

      expect(localized, locale).toBe(steps.waitingBackendLaunch)
      expect(localized, locale).not.toBe(en.boot.steps.waitingBackendLaunch)
      expect(localizedBootMessage('custom.phase', 'Provider-specific diagnostic', steps)).toBe(
        'Provider-specific diagnostic'
      )
    }
  })

  it('names the first-run setup choice main emits as bootstrap.choice', () => {
    // electron/main.ts: updateBootProgress({ phase: 'bootstrap.choice', message: 'Waiting for first-run setup choice' })
    const fallback = 'Waiting for first-run setup choice'

    for (const [locale, steps] of LOCALES) {
      const localized = localizedBootMessage('bootstrap.choice', fallback, steps)

      expect(localized, locale).toBe(steps.waitingSetupChoice)
      expect(localized, locale).not.toBe(en.boot.steps.waitingSetupChoice)
    }

    expect(localizedBootMessage('bootstrap.choice', fallback, en.boot.steps)).toBe(en.boot.steps.waitingSetupChoice)
  })
})
