import { mergeTranslations, type TranslationOverride } from '@hermes/shared/i18n'

import { en } from './en'
import type { Translations } from './types'

export type TranslationOverrides = TranslationOverride<Translations>

export const defineLocale = (overrides: TranslationOverrides): Translations =>
  mergeTranslations<Translations>(en, overrides)

/** Bundled locales use this stricter form: every English key is required, while
 * locale-specific lookup-table entries may still extend open records. */
export const defineCompleteLocale = <T extends Translations>(translations: T): Translations => translations
