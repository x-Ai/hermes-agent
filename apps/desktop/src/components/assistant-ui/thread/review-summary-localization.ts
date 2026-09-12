import type { Translations } from '@/i18n'

type ReviewSummaryCopy = Translations['assistant']['thread']['reviewSummary']
type SkillOperation = 'created' | 'patched' | 'rewritten'

interface SkillAction {
  name: string
  operation: SkillOperation
  details: string[]
}

const SKILL_FORMATTERS = {
  created: 'skillNamedCreated',
  patched: 'skillNamedPatched',
  rewritten: 'skillNamedRewritten'
} as const

const NAMED_SKILL_RE =
  /^Skill ['“”]([^'“”]+)['“”] (created|patched|rewritten|updated \(full rewrite\))[.:]?\s*([\s\S]*)$/i

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

  const labeled = value.match(/^(Memory|User profile)\s+(➕|✏️|➖)\s*([\s\S]*)$/i)

  if (labeled) {
    const label = labeled[1].toLowerCase() === 'memory' ? copy.memoryLabel : copy.userProfileLabel

    return `${label} ${labeled[2]} ${labeled[3]}`.trim()
  }

  return value
}

function detailFiles(detail: string): string[] | null {
  const match = detail.match(/^\(([^()\r\n]+)\)$/u)

  if (!match) {
    return null
  }

  // Old summaries have no structured paths; a comma can also belong to a
  // filename. Split only before the default file or another relative path.
  const files = match[1].split(/,\s+(?=SKILL\.md(?:,|$)|[^,()\r\n]+[/\\])/u)

  return files.every(file => /[/\\]|\.[^.\s]+$/u.test(file)) ? files : null
}

function mergeSkillDetails(action: SkillAction): string {
  const hasFiles = action.details.some(detail => detailFiles(detail) !== null)
  const paths = new Set<string>()
  const parts: string[] = []
  let filesIndex = -1

  for (const detail of action.details) {
    // Legacy standalone patches omit the path for the default SKILL.md.
    const files = !detail && hasFiles && action.operation !== 'created' ? ['SKILL.md'] : detailFiles(detail)

    if (files) {
      if (filesIndex < 0) {
        filesIndex = parts.length
        parts.push('')
      }

      files.forEach(file => paths.add(file))
    } else if (detail && !parts.includes(detail)) {
      parts.push(detail)
    }
  }

  if (filesIndex >= 0) {
    parts[filesIndex] = `(${[...paths].join(', ')})`
  }

  return parts.join(' · ')
}

/** Localize the fixed action vocabulary emitted by background_review.py while
 * preserving skill names and model-authored previews. Unknown text is kept so
 * a new backend action remains visible instead of being mislabeled. */
export function localizeReviewSummaryDetail(detail: string, copy: ReviewSummaryCopy): string {
  const actions: (string | SkillAction)[] = []
  const skills = new Map<string, SkillAction>()

  for (const raw of detail.split(/\s+·\s+/u)) {
    const named = raw
      .trim()
      .replace(/^📝\s*/u, '')
      .match(NAMED_SKILL_RE)

    if (!named) {
      actions.push(raw)

      continue
    }

    const [, name, verb, detail] = named
    const operation = verb.toLowerCase()
    const kind = operation === 'created' || operation === 'patched' ? operation : 'rewritten'
    const key = JSON.stringify([name, kind])
    let action = skills.get(key)

    if (!action) {
      action = { name, operation: kind, details: [] }
      skills.set(key, action)
      actions.push(action)
    }

    action.details.push(detail.trim())
  }

  return actions
    .map(action =>
      typeof action === 'string'
        ? localizeAction(action, copy)
        : copy[SKILL_FORMATTERS[action.operation]](action.name, mergeSkillDetails(action))
    )
    .join(' · ')
}
