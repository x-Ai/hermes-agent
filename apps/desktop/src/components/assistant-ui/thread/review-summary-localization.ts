import type { Translations } from '@/i18n'

type ReviewSummaryCopy = Translations['assistant']['thread']['reviewSummary']

const trimSentence = (text: string) => text.trim().replace(/[.。]$/u, '')

function localizeAction(action: string, copy: ReviewSummaryCopy): string {
  const value = action.trim().replace(/^📝\s*/u, '')
  const simple = trimSentence(value).toLowerCase()

  if (simple === 'memory updated') {
    return copy.memoryUpdated
  }

  if (simple === 'memory entry created') {
    return copy.memoryCreated
  }

  if (simple === 'user profile updated') {
    return copy.userProfileUpdated
  }

  if (simple === 'skill created') {
    return copy.skillCreated
  }

  const named = value.match(
    /^Skill ['“”]([^'“”]+)['“”] (created|patched|rewritten|updated \(full rewrite\))[.:]?\s*([\s\S]*)$/i
  )

  if (named) {
    const [, name, operation, detail] = named
    const cleanDetail = detail.trim()

    if (operation.toLowerCase() === 'created') {
      return copy.skillNamedCreated(name, cleanDetail)
    }

    if (operation.toLowerCase() === 'patched') {
      return copy.skillNamedPatched(name, cleanDetail)
    }

    return copy.skillNamedRewritten(name, cleanDetail)
  }

  const labeled = value.match(/^(Memory|User profile)\s+(➕|✏️|➖)\s*([\s\S]*)$/i)

  if (labeled) {
    const label = labeled[1].toLowerCase() === 'memory' ? copy.memoryLabel : copy.userProfileLabel

    return `${label} ${labeled[2]} ${labeled[3]}`.trim()
  }

  return value
}

/** Localize the fixed action vocabulary emitted by background_review.py while
 * preserving skill names and model-authored previews. Unknown text is kept so
 * a new backend action remains visible instead of being mislabeled. */
export function localizeReviewSummaryDetail(detail: string, copy: ReviewSummaryCopy): string {
  return detail
    .split(/\s+·\s+/u)
    .map(action => localizeAction(action, copy))
    .join(' · ')
}
