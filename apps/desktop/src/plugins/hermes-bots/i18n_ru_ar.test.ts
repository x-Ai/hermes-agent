import { describe, expect, it } from 'vitest'

import { CANONICAL_GROUP_LOCALES } from './canonical-group-locales'
import { CROSS_GATEWAY_GROUP_LOCALES } from './cross-gateway-locales'
import { en } from './i18n_locales'
import { arOverrides, ruOverrides } from './i18n_ru_ar'

// ru and ar lie over the English bundle, so a leaf they leave out falls back to
// English by design. These contracts read only the leaves each bundle writes
// itself: the overlay (with the group siblings it spreads) and the two catalogs
// composed into it.
const OWN = {
  ru: { canonical: CANONICAL_GROUP_LOCALES.ru, crossGateway: CROSS_GATEWAY_GROUP_LOCALES.ru, ...ruOverrides },
  ar: { canonical: CANONICAL_GROUP_LOCALES.ar, crossGateway: CROSS_GATEWAY_GROUP_LOCALES.ar, ...arOverrides }
}

// Names every locale keeps in English, and words the user types as they are.
const PRODUCT_TERMS = new Set(['hermes', 'desktop', 'cloud', 'soul', 'mcp', 'api', 'oauth', 'cron', 'petdex'])
// A lender's setup advice names the `approvals.mode` values to set (manual, smart) and the command
// that runs its gateway on its own (hermes gateway run): typed as they are, in every locale.
const TYPED_LITERALS = new Set(['hermes model', 'resume', 'every', 'everyone', 'manual', 'smart', 'hermes gateway run'])
// What Bot Screen needs on the gateway host, and the protocols that reach it.
const HOST_TERMS = new Set(['linux', 'tigervnc', 'xfce', 'sudo', 'apt', 'dnf', 'pacman', 'https', 'ssh'])

// Arguments that pick a branch instead of being echoed.
const IDENTIFIER_ARGS: Record<string, unknown[]> = {
  'group.workspaceSource': ['member', 'profile', 'room', 'thread']
}

type Leaf = { path: string; value: unknown }

function leaves(value: unknown, path = ''): Leaf[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, path ? `${path}.${key}` : key))
  }

  return [{ path, value }]
}

const at = (root: unknown, path: string) =>
  path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], root)

// A one-element array reads as its marker in a template and still takes the
// `.map` / `.join` a list argument gets.
const probes = (arity: number) => Array.from({ length: arity }, (_, index) => [`⟦${index}⟧`])

function render(value: unknown, args: unknown[]): string | undefined {
  try {
    const out = (value as (...params: unknown[]) => unknown)(...args)

    return typeof out === 'string' ? out : undefined
  } catch {
    return undefined // needs another argument shape; another sample covers it
  }
}

/** Every text a leaf can show: the marker render plus counts that walk the plural branches. */
function texts(path: string, value: unknown): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  if (typeof value !== 'function') {
    return []
  }

  const samples = IDENTIFIER_ARGS[path]?.map(arg => [arg]) ?? [
    probes(value.length),
    ...[0, 1, 2, 3, 5, 11, 21, 100].map(count => Array.from({ length: value.length }, () => count))
  ]

  return samples.map(args => render(value, args)).filter((text): text is string => text !== undefined)
}

// `SOUL.md`, `profiles.list`, `deliver:`, `[bot:<name>]`, `Ctrl+K`, `@all`, `1d`, `dev-team`:
// syntax the user reads or types literally, never prose.
const isCodeToken = (chunk: string) =>
  /[A-Za-z]/.test(chunk) &&
  (/[@/+_<>[\]:\d]/.test(chunk) || /[A-Za-z]\.[A-Za-z]/.test(chunk) || /^[a-z]+(?:-[a-z]+)+$/.test(chunk))

function englishRuns(text: string): string[] {
  const prose = text
    .replace(/⟦\d+⟧|\{\w+\}/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .split(/\s+/)
    .filter(chunk => !isCodeToken(chunk))
    .join(' ')

  return (prose.match(/[A-Za-z]+(?:[\s&’'-]+[A-Za-z]+)*/g) ?? []).filter(run => {
    const phrase = run.toLowerCase().replace(/\s+/g, ' ')
    const allProductTerms = phrase.split(/[^a-z]+/).every(word => PRODUCT_TERMS.has(word) || HOST_TERMS.has(word))

    return !allProductTerms && !TYPED_LITERALS.has(phrase)
  })
}

const GLUED_ARGUMENT = /[\p{L}\p{N}]⟦\d+⟧|⟦\d+⟧[\p{L}\p{N}]/u
const GLUED_TOKEN = /[\p{L}\p{N}]\{\w+\}|\{\w+\}[\p{L}\p{N}]/u

/** What a leaf loses or fuses from the arguments English interpolates. */
function interpolationFaults(path: string, value: unknown): string[] {
  const english = at(en, path)

  if (typeof value === 'string') {
    // Call sites substitute `{name}` tokens with .replace(): the token set is a contract.
    const tokens = (typeof english === 'string' && english.match(/\{\w+\}/g)) || []
    const dropped = tokens.filter(token => !value.includes(token)).map(token => `drops ${token}`)

    return GLUED_TOKEN.test(value) ? [...dropped, 'glues a {token} to a word'] : dropped
  }

  if (typeof value !== 'function' || IDENTIFIER_ARGS[path]) {
    return []
  }

  const args = probes(value.length)
  const translated = render(value, args)
  const shown = render(english, args) ?? ''

  if (translated === undefined) {
    return ['does not render']
  }

  const dropped = args
    .map(([marker]) => marker)
    .filter(marker => shown.includes(marker) && !translated.includes(marker))
    .map(marker => `drops ${marker}`)

  return GLUED_ARGUMENT.test(translated) ? [...dropped, `glues an argument to a word: ${translated}`] : dropped
}

describe.each(['ru', 'ar'] as const)('the %s Bot Mode bundle', locale => {
  const own = leaves(OWN[locale])

  it('says nothing in English beyond product names and typed commands', () => {
    const english = own.flatMap(({ path, value }) => {
      const runs = new Set(texts(path, value).flatMap(englishRuns))

      return runs.size ? [`${path}: ${[...runs].join(' | ')}`] : []
    })

    expect(english).toEqual([])
  })

  it('keeps every argument English shows, set apart from the words around it', () => {
    const faults = own.flatMap(({ path, value }) => interpolationFaults(path, value).map(fault => `${path} ${fault}`))

    expect(faults).toEqual([])
  })
})
