import { afterEach, expect, it } from 'vitest'

import { CONNECTOR_LEAD_ORDER } from '@/components/onboarding-chat/options'
import { buildFirstTaskRunbook } from '@/components/onboarding-chat/setup-profile'
import { declinedLookAround } from '@/components/onboarding-chat/signpost'
import { getRuntimeI18nLocale, type Locale, setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'
import type { ChatMessage } from '@/lib/chat-messages'
import { connectorTitle } from '@/lib/connector-tools'
import { $machine } from '@/store/machine'
import { DEFAULT_ANSWERS } from '@/store/onboarding-answers'
import { buildChatOnboardingPrompt, forkOptions, tourOptions } from '@/store/onboarding-script'

const initialLocale = getRuntimeI18nLocale()
const initialMachine = $machine.get()

afterEach(() => {
  setRuntimeI18nLocale(initialLocale)
  $machine.set(initialMachine)
})

function message(text: string, role: ChatMessage['role'] = 'user'): ChatMessage {
  return { id: 'answer', parts: [{ text, type: 'text' }], role }
}

it('keeps localized tour answers actionable after the app language changes', () => {
  $machine.set(null)

  for (const locale of Object.keys(TRANSLATIONS) as Locale[]) {
    setRuntimeI18nLocale(locale)

    const copy = TRANSLATIONS[locale].guidedOnboarding.script
    const tour = tourOptions()
    const prompt = buildChatOnboardingPrompt()

    expect(prompt).toContain(
      `::ask{question="${copy.tourQuestion}" options="${tour.basics}|${tour.tour}|${tour.none}"}`
    )
    expect(prompt).toContain(`::ask{question="${copy.forkQuestion}" options="${forkOptions().join('|')}"`)

    setRuntimeI18nLocale(locale === 'en' ? 'zh' : 'en')
    expect(declinedLookAround([message(` ${tour.none} `)])).toBe(true)
    expect(declinedLookAround([message(tour.basics), message(tour.tour)])).toBe(false)
    expect(declinedLookAround([message(tour.none, 'assistant')])).toBe(false)
  }

  // Saved replies remain authoritative when a release changes the displayed pill labels.
  for (const savedDecline of ["I'll figure it out", '我自己摸索']) {
    expect(declinedLookAround([message(savedDecline)])).toBe(true)
  }
})

it('connects supported picks for build plans while preserving localized review and the account-free machine path', () => {
  setRuntimeI18nLocale('zh')
  $machine.set(null)

  const picks = CONNECTOR_LEAD_ORDER.slice(0, 2)
  const unsupported = 'not-in-onboarding-catalog'
  const answers = { ...DEFAULT_ANSWERS, connectors: [...picks, unsupported] }
  const copy = TRANSLATIONS.zh.guidedOnboarding.script

  expect(picks.length).toBeGreaterThan(0)

  for (const plan of ['build', 'plugin'] as const) {
    const runbook = buildFirstTaskRunbook('Make a useful dashboard', answers, plan, '/plugins')

    expect(runbook).toContain(
      `exact gateway slugs: ${picks.map(slug => `${slug} (${connectorTitle(slug)})`).join(', ')}`
    )
    expect(runbook).toContain('action="connect"')
    expect(runbook).toContain('action="wait"')
    expect(runbook).not.toContain(unsupported)
    expect(runbook).toContain(
      `::ask{question="${copy.buildReviewQuestion}" options="${copy.buildReviewLooksRight}|${copy.buildReviewChange}|${copy.buildReviewFurther}"}`
    )
  }

  const machine = buildFirstTaskRunbook('Set up this computer', answers, 'machine-setup')

  const withoutPicks = buildFirstTaskRunbook('Make a useful dashboard', {
    ...DEFAULT_ANSWERS,
    connectors: [unsupported]
  })

  expect(machine).not.toContain('action="connect"')
  expect(withoutPicks).not.toContain('action="connect"')
  expect(machine).toContain(
    `::ask{question="${copy.machineRunQuestion}" options="${copy.machineRunGoAhead}|${copy.machineRunChangeList}|${copy.machineRunEssentials}"}`
  )
})
