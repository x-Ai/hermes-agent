import { describe, expect, it } from 'vitest'

import { type Locale, resolveTranslations, TRANSLATIONS } from '@/i18n'

import shippedCatalog from '../../../../../hermes_cli/local_runtime/catalog.json'

import { localizeLocalModelText } from './local-models-localization'

const LOCALES = Object.keys(TRANSLATIONS) as Locale[]

// The catalog API serves each model's description as English prose, and the
// row translates it through `catalogDescriptions`, keyed by the exact sentence.
// A model the catalog gains upstream arrives with no entry and renders in
// English beside localized pills, so a locale that translates catalog
// descriptions has to cover every one the app ships.
describe('local model catalog descriptions', () => {
  it('translates every shipped description in each locale that translates them', () => {
    const untranslated = LOCALES.flatMap(locale => {
      const copy = resolveTranslations(locale).settings.localModels

      if (Object.keys(copy.catalogDescriptions).length === 0) {
        return []
      }

      return shippedCatalog.models
        .filter(({ description }) => localizeLocalModelText(description, copy) === description)
        .map(({ id }) => `${locale}: ${id}`)
    })

    expect(untranslated).toEqual([])
  })
})

// The same API writes each row's build and fit reasons in English too
// (`_catalog_row` in hermes_cli/web_routers/local_models.py), and the memory
// pill's tooltip translates them by matching these exact sentences. A locale
// without the copy shows the English sentence. A translation that drops a value
// or ignores a branch hides the build, the size, the large window or the
// slowdown that the tooltip is there to explain.
const RECOMMENDED = 'Recommended build (Q4_K_M) — the quant class this engine is optimized for; runs fully on your GPU'
const FULL_CONTEXT = 'runs at its full 128K context'
const GROWING_CONTEXT = 'starts at 32K and grows toward 128K as you use it'
const SPILLED = ' (larger than your GPU memory — runs slower)'

const REASONS: readonly { text: string; values: readonly string[] }[] = [
  { text: RECOMMENDED, values: ['Q4_K_M'] },
  { text: `${RECOMMENDED} with a large context window`, values: ['Q4_K_M'] },
  { text: 'Compact build sized for this machine (Q3_K_M) — larger than GPU memory, runs slower', values: ['Q3_K_M'] },
  { text: 'even the most compact build (Q2_K, 48.2 GB) exceeds GPU + system memory', values: ['Q2_K', '48.2 GB'] },
  { text: 'Needs more memory than this machine has', values: [] },
  { text: FULL_CONTEXT, values: ['128K'] },
  { text: GROWING_CONTEXT, values: ['32K', '128K'] },
  { text: FULL_CONTEXT + SPILLED, values: ['128K'] },
  { text: GROWING_CONTEXT + SPILLED, values: ['32K', '128K'] }
]

const BRANCHES: readonly (readonly [plain: string, branch: string])[] = [
  [RECOMMENDED, `${RECOMMENDED} with a large context window`],
  [FULL_CONTEXT, FULL_CONTEXT + SPILLED],
  [GROWING_CONTEXT, GROWING_CONTEXT + SPILLED]
]

describe('local model build and fit reasons', () => {
  it('translates every backend reason in each locale and keeps its values and branches', () => {
    const problems = LOCALES.filter(locale => locale !== 'en').flatMap(locale => {
      const copy = resolveTranslations(locale).settings.localModels
      const render = (text: string) => localizeLocalModelText(text, copy)

      return [
        ...REASONS.filter(({ text }) => render(text) === text).map(({ text }) => `${locale}: stays English: ${text}`),
        ...REASONS.flatMap(({ text, values }) =>
          values.filter(value => !render(text).includes(value)).map(value => `${locale}: drops ${value}: ${text}`)
        ),
        ...BRANCHES.filter(([plain, branch]) => render(plain) === render(branch)).map(
          ([, branch]) => `${locale}: reads like the plain form: ${branch}`
        )
      ]
    })

    expect(problems).toEqual([])
  })
})
