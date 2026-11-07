import { describe, expect, it } from 'vitest'

import { arOverrides } from './ar'
import { AR_PLURAL } from './ar_plural'
import { en } from './en'
import { ruOverrides } from './ru'

// The ru and ar overlays came from machine translation, which glued `${…}`
// arguments to the words around them ("Профили включены${gateway}", "انتقل إلى${name}")
// and dropped some of them. These blocks have been reviewed against English in
// both locales; a value the overlay leaves out falls back to English and is not
// read here.
const REVIEWED_BLOCKS = [
  'billingBlock',
  'billingPage',
  'notifications',
  'sendDiagnostics',
  'fileMenu',
  'titlebar',
  'keybinds',
  'paletteCommands',
  'findInPage',
  'sidebar',
  'shell',
  'rightSidebar',
  'zones',
  'contextMenu',
  'commandCenter',
  'messaging',
  'profiles',
  'cron',
  'connectors',
  'sessionImport',
  'webhooks',
  'assistant',
  'skillDeepLink',
  'skills',
  'starmap',
  'agents',
  'language',
  'settings',
  'modelPicker',
  'modelVisibility',
  'interfaceMode',
  'modelAssignment',
  'timelineEvents',
  'quickEntry',
  'petOverlay',
  'composer',
  'statusStack',
  'prompts',
  'desktop',
  'tips',
  'goalStatus',
  'boot',
  'keepAwakeOffer',
  'remoteDisplayBanner',
  'butterbar',
  'promptNotices',
  'updates',
  'install',
  'onboarding',
  'freeTier'
] as const

// Arabic blocks written against English from the start (no machine-translated
// past); the Russian overlay still leaves them in English.
const AR_ONLY_BLOCKS = ['connectorsPage', 'appTour', 'sharedProviders', 'connectorOffer'] as const

const BLOCKS: Record<'ru' | 'ar', readonly string[]> = {
  ru: REVIEWED_BLOCKS,
  ar: [...REVIEWED_BLOCKS, ...AR_ONLY_BLOCKS]
}

// Arguments that are identifiers rather than display text ('audio' | 'video');
// a translation names the choice in its own words instead of echoing it. The
// same exemptions as IDENTIFIER_ARGS in catalog-completeness.test.ts.
const IDENTIFIER_ARGS: Record<string, readonly number[]> = {
  'assistant.media.openMediaFile': [0],
  'assistant.thread.providerReconnecting': [1],
  'settings.toolsets.webCapabilitySelectedMessage': [1],
  'starmap.editNode': [0]
}

const OVERLAYS = { ru: ruOverrides, ar: arOverrides } as Record<string, Record<string, unknown>>

type Leaf = { path: string; value: unknown }

function leaves(value: unknown, path: string): Leaf[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, `${path}.${key}`))
  }

  return [{ path, value }]
}

const at = (root: unknown, path: string) =>
  path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], root)

// A one-element array reads as its marker in a template and still takes the
// `.map` / `.join` / `.at` a list argument gets; as a count it is NaN, which
// sends plural helpers to the form that prints the number.
const probes = (arity: number) => Array.from({ length: Math.max(arity, 1) }, (_, index) => [`⟦${index}⟧`])

function render(value: unknown, args: unknown[]): string | undefined {
  try {
    const out = (value as (...params: unknown[]) => unknown)(...args)

    return typeof out === 'string' ? out : undefined
  } catch {
    return undefined // needs a structured argument; nothing to inspect
  }
}

// An Arabic one-letter proclitic (و، ف، ب، ل، ك, optionally with a tatweel) is
// written joined to the word it governs, a number included: "و${count} أخرى".
const PROCLITIC = /^[وفبلك]ـ?$/u
const LETTER = /[\p{L}\p{N}]/u

/** Markers written flush against a word, on either side. */
function gluedMarkers(text: string): Set<string> {
  const glued = new Set<string>()

  for (const match of text.matchAll(/⟦\d+⟧/g)) {
    const start = match.index ?? 0
    const before = text.slice(0, start)
    const after = text[start + match[0].length] ?? ''
    const word = /[\p{L}\p{N}ـ]+$/u.exec(before)?.[0] ?? ''

    if ((word && !PROCLITIC.test(word)) || LETTER.test(after)) {
      glued.add(match[0])
    }
  }

  return glued
}

function interpolationFaults(path: string, value: unknown): string[] {
  if (typeof value !== 'function') {
    return []
  }

  const args = probes(value.length)
  const translated = render(value, args)
  const english = render(at(en, path), args)

  if (translated === undefined || english === undefined) {
    return []
  }

  const identifiers = IDENTIFIER_ARGS[path] ?? []

  const dropped = args
    .map(([marker]) => marker)
    .filter((marker, index) => !identifiers.includes(index) && english.includes(marker) && !translated.includes(marker))
    .map(marker => `drops ${marker}: ${translated}`)

  // English itself writes a few markers flush (`v${version}`, `failed${detail}`).
  const englishGlued = gluedMarkers(english)

  const glued = [...gluedMarkers(translated)]
    .filter(marker => !englishGlued.has(marker))
    .map(marker => `glues ${marker} to a word: ${translated}`)

  return [...dropped, ...glued]
}

describe.each(['ru', 'ar'] as const)('the reviewed %s core copy', locale => {
  it('keeps every argument English shows, set apart from the words around it', () => {
    const overlay = OVERLAYS[locale]

    const faults = BLOCKS[locale]
      .flatMap(block => leaves(overlay[block], block))
      .flatMap(({ path, value }) => interpolationFaults(path, value).map(fault => `${path} ${fault}`))

    expect(faults).toEqual([])
  })
})

describe('AR_PLURAL', () => {
  const forms = { one: 'one', two: 'two', few: 'few', many: 'many' }

  it('picks the Arabic noun form for each count', () => {
    expect([1, 2, 3, 10, 11, 99, 103, 111].map(count => AR_PLURAL(count, forms))).toEqual([
      'one',
      'two',
      'few',
      'few',
      'many',
      'many',
      'few',
      'many'
    ])
  })

  it('reads zero and the hundreds like the counted form unless told otherwise', () => {
    expect(AR_PLURAL(0, forms)).toBe('many')
    expect(AR_PLURAL(100, forms)).toBe('many')
    expect(AR_PLURAL(0, { ...forms, other: 'other' })).toBe('other')
    expect(AR_PLURAL(0, { ...forms, zero: 'zero', other: 'other' })).toBe('zero')
    expect(AR_PLURAL(200, { ...forms, other: 'other' })).toBe('other')
  })

  it('accepts a count passed as a string', () => {
    expect(AR_PLURAL('2', forms)).toBe('two')
    expect(AR_PLURAL('5', forms)).toBe('few')
  })

  it('reads a count that is not a number as the counted form, never as zero', () => {
    expect(AR_PLURAL('1,234', { ...forms, zero: 'zero' })).toBe('many')
    expect(AR_PLURAL('1,234', { ...forms, zero: 'zero', other: 'other' })).toBe('other')
  })
})
