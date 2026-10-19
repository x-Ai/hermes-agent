import type { Locale, Translations } from '@/i18n'
import { localizeAgentStatusText } from '@/lib/api-error-messages'

type AssistantThreadCopy = Translations['assistant']['thread']

interface TranscriptLocalizationPattern {
  format: (match: RegExpMatchArray, copy: AssistantThreadCopy) => string
  pattern: RegExp
}

const RETRY_FAILURE_HINT_PATTERNS: TranscriptLocalizationPattern[] = [
  {
    pattern: /^upstream provider timed out \(Cloudflare 524, (\d+(?:\.\d+)?)s\)$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.upstreamProviderTimedOut(match[1])
  },
  {
    pattern: /^upstream gateway timeout \(504, (\d+(?:\.\d+)?)s\)$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.upstreamGatewayTimedOut(match[1])
  },
  {
    pattern: /^rate limited by upstream provider \(429\)$/,
    format: (_match, copy) => copy.operationInterruptedRetryReasons.rateLimited
  },
  {
    pattern: /^upstream server error \((\d+), (\d+(?:\.\d+)?)s\)$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.upstreamServerError(match[1], match[2])
  },
  {
    pattern: /^upstream provider overloaded \((\d+)\)$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.upstreamProviderOverloaded(match[1])
  },
  {
    pattern: /^upstream error \(code (\d+), (\d+(?:\.\d+)?)s\)$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.upstreamError(match[1], match[2])
  },
  {
    pattern: /^fast response \((\d+(?:\.\d+)?)s\) — likely rate limited$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.fastResponseLikelyRateLimited(match[1])
  },
  {
    pattern: /^slow response \((\d+(?:\.\d+)?)s\) — likely upstream timeout$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.slowResponseLikelyUpstreamTimeout(match[1])
  },
  {
    pattern: /^response time (\d+(?:\.\d+)?)s$/,
    format: (match, copy) => copy.operationInterruptedRetryReasons.responseTime(match[1])
  }
]

function localizeRetryFailureHint(hint: string, copy: AssistantThreadCopy): string {
  for (const candidate of RETRY_FAILURE_HINT_PATTERNS) {
    const match = hint.match(candidate.pattern)

    if (match) {
      return candidate.format(match, copy)
    }
  }

  return hint
}

const INTERRUPTED_TRANSCRIPT_PATTERNS: TranscriptLocalizationPattern[] = [
  {
    pattern: /^Operation interrupted\.$/,
    format: (_match, copy) => copy.operationInterrupted
  },
  {
    pattern: /^Operation interrupted: waiting for model response \((\d+(?:\.\d+)?)s elapsed\)\.$/,
    format: (match, copy) => copy.operationInterruptedWaitingForModel(match[1])
  },
  {
    pattern: /^Operation interrupted during retry \(([\s\S]+), attempt (\d+)\/(\d+)\)\.$/,
    format: (match, copy) =>
      copy.operationInterruptedDuringRetry(localizeRetryFailureHint(match[1], copy), match[2], match[3])
  },
  {
    pattern: /^Operation interrupted: handling API error \(([^:\r\n]+): ([\s\S]+)\)\.$/,
    format: (match, copy) => copy.operationInterruptedHandlingApiError(match[1], match[2])
  },
  {
    pattern: /^Operation interrupted: retrying API call after error \(retry (\d+)\/(\d+)\)\.$/,
    format: (match, copy) => copy.operationInterruptedRetryingApiCall(match[1], match[2])
  },
  {
    pattern: /^Operation interrupted: retrying empty response from model \(retry (\d+)\/(\d+)\)\.$/,
    format: (match, copy) => copy.operationInterruptedRetryingEmptyResponse(match[1], match[2])
  }
]

// The boundary rows Hermes writes when a turn ends without a reply
// (`agent/turn_failure_copy.py`, `display_kind: failed_turn`). The backend
// authors them in the connection's announced language, but a row written on a
// socket that had not announced yet (a reconnect after a backend restart) is
// stored in English for good — so the stored English is mapped here as well.
const FAILED_TURN_TRANSCRIPT_PATTERNS: TranscriptLocalizationPattern[] = [
  {
    pattern: /^Your request was not processed\. Send it again if you still want me to carry it out\.$/,
    format: (_match, copy) => copy.failedTurnNotice
  },
  {
    pattern:
      /^This turn did not complete\. Some actions may already have run; verify their effects before resending\.$/,
    format: (_match, copy) => copy.failedTurnPartialNotice
  },
  {
    pattern:
      /^An automated delivery was interrupted and was not run again\. Some actions may already have run; verify their effects\.$/,
    format: (_match, copy) => copy.failedTurnAutomationNotice
  }
]

export function localizeAssistantTranscriptText(text: string, copy: AssistantThreadCopy, locale: Locale): string {
  const trimmed = text.trim()

  for (const candidate of [...INTERRUPTED_TRANSCRIPT_PATTERNS, ...FAILED_TURN_TRANSCRIPT_PATTERNS]) {
    const match = trimmed.match(candidate.pattern)

    if (match) {
      return candidate.format(match, copy)
    }
  }

  return localizeAgentStatusText(text, locale)
}
