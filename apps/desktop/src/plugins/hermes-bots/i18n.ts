/**
 * Plugin-scoped i18n for Bot Mode — the translator every Bot Mode component reads.
 * The catalogs live in `i18n_locales.ts` and `i18n_locales_zh.ts` (siblings): moving them out
 * of this module keeps it a facade, and keeps the test helper's import graph free of the SDK
 * edge that made a mocked `usePluginI18n` resolve to the real hook.
 */
import { type PluginTranslate, usePluginI18n } from '@hermes/plugin-sdk'
import { useMemo } from 'react'

import { bind, type Bound } from './i18n-bind'
import { type BotsMessages } from './i18n-messages'
import { BOTS_LOCALES, en } from './i18n_locales'
import { getPluginCtx } from './shared'

export { BOTS_LOCALES }

export type BotsText = Bound<BotsMessages>

/** The Bot Mode strings for the active locale — one hook every component reads. */
export function useBots(): BotsText {
  const t = usePluginI18n('hermes-bots')

  return useMemo(() => bind(t, en), [t])
}

/** Resolve a dotted path against the English bundle — the floor for a read
 *  that beats `ctx.i18n` into existence, so an unresolved key never ships as
 *  the literal `cron.runsHourly`. */
function english(key: string, ...args: unknown[]): string {
  const leaf = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], en)

  return typeof leaf === 'function' ? (leaf as (...a: unknown[]) => string)(...args) : String(leaf ?? key)
}

let bound: { text: BotsText; translate: PluginTranslate } | null = null

/** Drop the cached binding. `bind` resolves string leaves eagerly against the
 *  locale active at bind time and `ctx.i18n.t` keeps one identity for the
 *  plugin's whole life, so without this every `botsText()` string stayed in
 *  the first locale after the saved language loaded or the user switched.
 *  `register` wires it to `ctx.i18n.onLocaleChange`. */
export function resetBotsText(): void {
  bound = null
}

/** `useBots` for the module-level functions a hook can't reach — the schedule
 *  summarizers and label helpers that render inside components but aren't
 *  components. Non-reactive on its own; every caller is invoked during a
 *  render that a core `useI18n()` already subscribes to, so a locale switch
 *  still repaints. Cached on translator identity (`bind` walks the whole tree,
 *  and these run per row) and dropped by `resetBotsText` on a locale change. */
export function botsText(): BotsText {
  const translate = getPluginCtx()?.i18n?.t ?? english

  if (bound?.translate !== translate) {
    bound = { text: bind(translate, en), translate }
  }

  return bound.text
}
