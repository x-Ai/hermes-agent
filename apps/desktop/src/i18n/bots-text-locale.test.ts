import { afterEach, expect, it } from 'vitest'

import { BOTS_LOCALES, botsText, resetBotsText } from '@/plugins/hermes-bots/i18n'
import { setPluginCtx } from '@/plugins/hermes-bots/shared'

import { createPluginI18n } from './plugin-i18n'
import { setRuntimeI18nLocale } from './runtime'

afterEach(() => {
  setPluginCtx(null)
  resetBotsText()
  setRuntimeI18nLocale('en')
})

// `bind` resolves string leaves eagerly and `ctx.i18n.t` keeps one identity for
// the plugin's whole life, so a translator-identity cache alone froze every
// module-level botsText() string (roster toasts, activity feed, dialogs) in
// the locale active at first call. `register` subscribes resetBotsText to
// ctx.i18n.onLocaleChange; this exercises that exact wiring.
it('botsText() follows a locale switch through the onLocaleChange reset', () => {
  const disposers: Array<() => void> = []

  const i18n = createPluginI18n('hermes-bots', dispose => {
    disposers.push(dispose)

    return dispose
  })

  i18n.register(BOTS_LOCALES)
  i18n.onLocaleChange(resetBotsText)
  setPluginCtx({ i18n } as never)

  setRuntimeI18nLocale('en')
  const english = botsText()
  const englishLeaf = english.group.activityLabels.queued
  const englishFn = english.roster.newMessageFor('X')

  setRuntimeI18nLocale('zh')
  const chinese = botsText()

  expect(chinese).not.toBe(english)
  expect(chinese.group.activityLabels.queued).toBe(i18n.t('group.activityLabels.queued'))
  expect(chinese.group.activityLabels.queued).not.toBe(englishLeaf)
  expect(chinese.roster.newMessageFor('X')).not.toBe(englishFn)

  // Same locale, same translator: the cache is reused, not rebuilt per call.
  expect(botsText()).toBe(chinese)

  for (const dispose of disposers) {
    dispose()
  }
})
