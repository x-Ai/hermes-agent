import type { Translations } from '@/i18n'

type LocalModelsCopy = Translations['settings']['localModels']

/** The shared catalog API supplies English prose, including on older backends.
 * Translate only known forms and preserve their dynamic values. New catalog
 * descriptions and unfamiliar fit reasons stay visible verbatim. */
export function localizeLocalModelText(text: string, copy: LocalModelsCopy): string {
  if (Object.hasOwn(copy.catalogDescriptions, text)) {
    return copy.catalogDescriptions[text]
  }

  const recommended = text.match(
    /^Recommended build \(([^)]+)\) — the quant class this engine is optimized for; runs fully on your GPU( with a large context window)?$/
  )

  if (recommended) {
    return copy.recommendedBuild(recommended[1], Boolean(recommended[2]))
  }

  const compact = text.match(/^Compact build sized for this machine \(([^)]+)\) — larger than GPU memory, runs slower$/)

  if (compact) {
    return copy.compactBuild(compact[1])
  }

  const tooLarge = text.match(/^even the most compact build \(([^,]+), ([^)]+)\) exceeds GPU \+ system memory$/)

  if (tooLarge) {
    return copy.fitTooLarge(tooLarge[1], tooLarge[2])
  }

  if (text === 'Needs more memory than this machine has') {
    return copy.fitNeedsMemory
  }

  const spillSuffix = ' (larger than your GPU memory — runs slower)'
  const spilled = text.endsWith(spillSuffix)
  const summary = spilled ? text.slice(0, -spillSuffix.length) : text
  const full = summary.match(/^runs at its full (\S+) context$/)
  const growing = summary.match(/^starts at (\S+) and grows toward (\S+) as you use it$/)

  const localized = full
    ? copy.fitFullContext(full[1])
    : growing
      ? copy.fitGrowingContext(growing[1], growing[2])
      : null

  return localized === null ? text : spilled ? copy.fitSpilled(localized) : localized
}
