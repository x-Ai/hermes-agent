/**
 * Counted nouns for the fork's Russian and Arabic Bot Mode copy. English picks
 * between two forms with `count === 1`; Russian needs three and Arabic five,
 * which `Intl.PluralRules` names by CLDR category. The plugin fence keeps the
 * app's own `RU_PLURAL` out of reach, so the bundles share these.
 */

const RU = new Intl.PluralRules('ru')
const AR = new Intl.PluralRules('ar')

/** `one` 1, 21, 31…; `few` 2–4, 22–24…; `many` 0, 5–20, 25–30… */
export function ruPlural(count: number, one: string, few: string, many: string): string {
  const rule = RU.select(count)

  return rule === 'one' ? one : rule === 'few' ? few : many
}

/** Whole phrases, `#` standing for the number: Arabic drops the numeral for
 *  one and two ("روبوت واحد", "روبوتان"), counts 3–10 with a plural noun and
 *  11–99 with a singular one; `other` covers 0 and the hundreds. */
export interface ArabicCount {
  one: string
  two: string
  few: string
  many: string
  other: string
}

export function arPlural(count: number, forms: ArabicCount): string {
  const rule = AR.select(count)
  const form = rule === 'one' || rule === 'two' || rule === 'few' || rule === 'many' ? forms[rule] : forms.other

  return form.replace('#', String(count))
}
