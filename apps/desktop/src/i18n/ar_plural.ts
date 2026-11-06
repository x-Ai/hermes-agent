// Shared by the Arabic overlays. An Arabic count picks its noun form by plural
// category: 1 and 2 take their own words, 3–10 the plural, 11–99 the singular.
// `other` (100–102, 200–202…) and `zero` read like `many` unless a caller says otherwise.
interface ArPluralForms {
  one: string
  two: string
  few: string
  many: string
  other?: string
  zero?: string
}

const AR_RULES = new Intl.PluralRules('ar')

export const AR_PLURAL = (count: number | string, forms: ArPluralForms): string => {
  const category = AR_RULES.select(typeof count === 'string' ? Number(count) || 0 : count)

  if (category === 'zero') {
    return forms.zero ?? forms.other ?? forms.many
  }

  return category === 'other' ? (forms.other ?? forms.many) : forms[category]
}
