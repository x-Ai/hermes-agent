/**
 * The typed binder behind `useBots()` / `botsText()`: turns the English message
 * SHAPE plus a plugin translator into an object components read as
 * `b.group.newTitle`, so a key resolves through `ctx.i18n` while the English
 * leaf stays the floor for a translator that does not know it yet.
 */

import type { PluginTranslate } from '@hermes/plugin-sdk'

// Bind the message SHAPE to a plugin translator: string leaves resolve now,
// function leaves forward their args through t(path, …).
export type Bound<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => string
    ? (...args: A) => string
    : T[K] extends object
      ? Bound<T[K]>
      : string
}

export function bind<T extends object>(t: PluginTranslate, template: T, prefix = ''): Bound<T> {
  const out = {} as Record<string, unknown>

  for (const [key, value] of Object.entries(template)) {
    const path = prefix ? `${prefix}.${key}` : key
    out[key] =
      typeof value === 'function'
        ? (...args: unknown[]) => {
            const translated = t(path, ...args)

            return translated === path ? value(...args) : translated
          }
        : value && typeof value === 'object'
          ? bind(t, value as object, path)
          : (() => {
              const translated = t(path)

              return translated === path ? value : translated
            })()
  }

  return out as Bound<T>
}
