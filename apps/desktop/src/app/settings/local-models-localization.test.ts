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
