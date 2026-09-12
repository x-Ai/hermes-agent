import type { Translations } from '@/i18n'

type AssistantThreadCopy = Translations['assistant']['thread']
type ProviderWaitKind = 'output' | 'response'

interface ProviderWaitPattern {
  pattern: RegExp
  format: (match: RegExpMatchArray, copy: AssistantThreadCopy) => string
}

const NOTICE_PATTERNS: ProviderWaitPattern[] = [
  {
    pattern:
      /^waiting on (.+?) — (\d+)s with no (output|response) yet \(provider may be slow or overloaded(?:, or the model is thinking)?(?:; auto-reconnect at (\d+)s)?\)$/i,
    format: (match, copy) =>
      copy.providerWaiting(match[1], match[2], match[3].toLowerCase() as ProviderWaitKind, match[4] ?? null)
  },
  {
    pattern:
      /^waiting on (.+?) — no stream (output|response) for (\d+)s \(provider may be slow or overloaded(?:, or the model is thinking)?(?:; auto-reconnect at (\d+)s)?\)$/i,
    format: (match, copy) =>
      copy.providerWaiting(match[1], match[3], match[2].toLowerCase() as ProviderWaitKind, match[4] ?? null)
  },
  {
    pattern: /^no (output|response) from provider (?:for|in) (\d+)s — reconnecting\.\.\.$/i,
    format: (match, copy) => copy.providerReconnecting(match[2], match[1].toLowerCase() as ProviderWaitKind)
  },
  {
    pattern: /^waiting on provider — retrying in (\d+)s \(attempt (\d+)\/(\d+)\)$/i,
    format: (match, copy) => copy.providerRetrying(match[1], match[2], match[3])
  },
  {
    pattern: /^model returned reasoning with no final answer — asking it to continue \((\d+)\/(\d+)\)$/i,
    format: (match, copy) => copy.modelContinuing(match[1], match[2])
  },
  {
    pattern:
      /^waiting on (.+?) — (\d+)s with no (stream events|response after reconnect) \(provider may be slow or overloaded(?:; auto-reconnect at (\d+)s total elapsed)?\)$/i,
    format: (match, copy) =>
      copy.providerWaitingAfterActivity(
        match[1],
        match[2],
        match[3].toLowerCase() === 'stream events' ? 'events' : 'response',
        match[4] ?? null
      )
  }
]

function matchProviderWaitNotice(text: string) {
  const body = text.trim().replace(/^[⏳⚠↻]\uFE0F?\s*/, '')

  for (const notice of NOTICE_PATTERNS) {
    const match = body.match(notice.pattern)

    if (match) {
      return { match, format: notice.format }
    }
  }

  return null
}

export function isProviderWaitNotice(text: string): boolean {
  return matchProviderWaitNotice(text) !== null
}

/**
 * Main-thread status and delegated activity surfaces share these notice bodies.
 * Match the body independently of its presentation glyph and localize at render
 * time so language changes also update activity already held in the stores.
 * Unknown text remains verbatim, including its whitespace and glyphs.
 */
export function localizeProviderWaitText(text: string, copy: AssistantThreadCopy): string {
  const notice = matchProviderWaitNotice(text)

  return notice ? notice.format(notice.match, copy) : text
}
