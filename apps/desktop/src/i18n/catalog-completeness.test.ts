import { describe, expect, it } from 'vitest'

import { arOverrides } from './ar'
import { TRANSLATIONS } from './catalog'
import { deOverrides } from './de'
import { esOverrides } from './es'
import { frOverrides } from './fr'
import { jaOverrides } from './ja'
import { ruOverrides } from './ru'
import type { BundledLocale } from './types'
import { zhOverrides } from './zh'
import { zhHantOverrides } from './zh-hant'

// Every non-English locale is a `defineLocale` overlay: a leaf missing from
// the overlay silently falls back to English at runtime, so the MERGED catalog
// can never show coverage. Coverage is read from the RAW overlays; shape
// checks (kinds, arities, interpolations, list lengths) run on the merged
// catalogs the UI actually reads. Registered runtime packs (`Locale` is open)
// are covered by registry.test.ts; this file is about the bundled set.
type Overlay = Exclude<BundledLocale, 'en'>

const OVERRIDES: Record<Overlay, unknown> = {
  zh: zhOverrides,
  'zh-hant': zhHantOverrides,
  ja: jaOverrides,
  ru: ruOverrides,
  ar: arOverrides,
  fr: frOverrides,
  de: deOverrides,
  es: esOverrides
}

// Guarded at 100%: a new English leaf fails here until these carry it.
const COMPLETE_LOCALES = ['zh', 'zh-hant'] as const satisfies readonly Overlay[]
// Not fully translated yet: the fallback surface is reported, never asserted,
// so adding an English key does not block a change. Bulk translation is its
// own PR.
const REPORTED_LOCALES = ['ja', 'ru', 'ar', 'fr', 'de', 'es'] as const satisfies readonly Overlay[]
const ALL_OVERLAYS = Object.keys(OVERRIDES) as Overlay[]

type Leaf = { path: string; value: unknown }

function leaves(value: unknown, path = ''): Leaf[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, path ? `${path}.${key}` : key))
  }

  return [{ path, value }]
}

// Arguments that are identifiers rather than display text; translations
// branch on them (`capability === 'search' ? … : …`) instead of echoing them.
const IDENTIFIER_ARGS: Record<string, number[]> = {
  'assistant.media.openMediaFile': [0],
  'assistant.thread.providerReconnecting': [1],
  'settings.toolsets.webCapabilitySelectedMessage': [1],
  'starmap.editNode': [0]
}

const kindOf = (value: unknown) => (Array.isArray(value) ? 'array' : typeof value)

// `intro` is display-only: English lives in intro-copy.jsonl, so its catalog
// entry is an empty shell. intro.test.tsx covers the translated rotation.
const catalogLeaves = (source: unknown) =>
  new Map(
    leaves(source)
      .filter(leaf => !leaf.path.startsWith('intro.'))
      .map(leaf => [leaf.path, leaf.value])
  )

const english = catalogLeaves(TRANSLATIONS.en)

const missingLeaves = (locale: Overlay): string[] => {
  const raw = catalogLeaves(OVERRIDES[locale])

  return [...english.keys()].filter(path => !raw.has(path))
}

it.each(ALL_OVERLAYS)('%s renders localized retirement copy instead of English fallback', locale => {
  expect(TRANSLATIONS[locale].updates.discontinuedTitle).not.toBe(TRANSLATIONS.en.updates.discontinuedTitle)
  expect(TRANSLATIONS[locale].updates.discontinuedBody).not.toBe(TRANSLATIONS.en.updates.discontinuedBody)
})

describe.each(COMPLETE_LOCALES)('%s overlay', locale => {
  it('carries every English leaf, so nothing falls back to English', () => {
    expect(missingLeaves(locale)).toEqual([])
  })
})

describe.each(REPORTED_LOCALES)('%s overlay', locale => {
  const missing = missingLeaves(locale)

  it.skip(`is missing ${missing.length} of ${english.size} English leaves (they fall back to English)`, () => {
    expect(missing).toEqual([])
  })
})

describe.each(ALL_OVERLAYS)('%s catalog shape', locale => {
  const catalog = catalogLeaves(TRANSLATIONS[locale])

  // The merged catalog may carry more than English (open lookup records such
  // as fieldLabels or tagCopy); every English leaf must be present with the
  // same kind, or a component reading it gets a function where it expects text.
  it('covers the English key set with matching value kinds', () => {
    for (const [path, value] of english) {
      expect({ path, kind: kindOf(catalog.get(path)) }).toEqual({ path, kind: kindOf(value) })
    }
  })

  it('keeps every interpolated argument that English renders', () => {
    for (const [path, value] of english) {
      if (typeof value !== 'function') {
        continue
      }

      const translated = catalog.get(path) as (...args: unknown[]) => unknown
      const probes = Array.from({ length: value.length }, (_, index) => `⟦${index}⟧`)
      let englishOut: string

      try {
        englishOut = JSON.stringify(value(...probes))
      } catch {
        continue // needs structured arguments; the type checker covers the signature
      }

      expect(translated.length, path).toBe(value.length)
      const translatedOut = JSON.stringify(translated(...probes))

      const identifiers = new Set(IDENTIFIER_ARGS[path]?.map(index => probes[index]))

      for (const probe of probes.filter(probe => englishOut.includes(probe) && !identifiers.has(probe))) {
        expect(translatedOut, `${path} drops ${probe}`).toContain(probe)
      }
    }
  })

  // Call sites substitute `{name}`-style tokens with .replace(); a translated
  // token (`{имя}`) renders literally in the toast, so the exact token set is a
  // contract, whatever the surrounding words say.
  it('keeps every {token} placeholder English interpolates at call sites', () => {
    for (const [path, value] of english) {
      if (typeof value !== 'string') {
        continue
      }

      const tokens = value.match(/\{[A-Za-z_][A-Za-z0-9_]*\}/g)

      if (!tokens) {
        continue
      }

      const translated = catalog.get(path)

      expect(typeof translated, path).toBe('string')

      for (const token of new Set(tokens)) {
        expect(translated, `${path} lost ${token}`).toContain(token)
      }
    }
  })

  it('keeps list-shaped copy the same length as English', () => {
    for (const [path, value] of english) {
      if (Array.isArray(value)) {
        expect((catalog.get(path) as unknown[]).length, path).toBe(value.length)
      }
    }
  })
})

describe.each(['fr', 'de', 'es'] as const)('%s Updates overlay', locale => {
  it('keeps Updates copy in the locale overlay rather than falling back to English', () => {
    const overlay = OVERRIDES[locale] as { updates: Record<string, unknown> }

    expect(Object.keys(overlay.updates).sort()).toEqual(Object.keys(TRANSLATIONS.en.updates).sort())
  })
})
