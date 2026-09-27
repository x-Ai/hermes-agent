import { type Locale, type ProviderExhaustedReason, translateForLocale, translateNow, TRANSLATIONS } from '@/i18n'

import { localizeProviderWaitText } from './provider-wait-localization'

// ── Backend copy this module recognises ─────────────────────────────────────
//
// agent/turn_failure_copy.py::exhausted_copy — the chat text once retries and
// fallback are exhausted: "{lead} — {situation} To avoid this in future, add a
// backup provider with `hermes fallback add`.\n\nProvider said: {summary}".
// One lead per classifier reason (`_EXHAUSTED_LEADS`, `unknown` = the default
// lead); both rate-limit reasons share a lead, so a sniffed lead maps to a
// copy key, never back to a reason.
//
// The label is provider_label(): a catalog name ("OpenRouter", "Nous Portal",
// "xAI Grok OAuth (SuperGrok / Premium+)") or the raw provider id
// ("custom:lab"). Neither carries prose punctuation, so a lead is only
// recognised when the label has no ": " / ". " and no newline — a model reply
// quoting the copy mid-sentence ("Example response: OpenRouter rate-limited…")
// must not be classified as a failed turn by the legacy text heuristic.
const LABEL = String.raw`((?:(?!: |\. )[^\n]){1,80}?)`

const EXHAUSTED_LEADS: ReadonlyArray<{ reason: ProviderExhaustedReason; pattern: RegExp }> = [
  { reason: 'rate_limit', pattern: new RegExp(`^${LABEL} rate-limited every one of (\\d+) attempts$`) },
  { reason: 'overloaded', pattern: new RegExp(`^${LABEL} reported it was overloaded on all (\\d+) attempts$`) },
  { reason: 'server_error', pattern: new RegExp(`^${LABEL} returned a server error on all (\\d+) attempts$`) },
  { reason: 'timeout', pattern: new RegExp(`^${LABEL} didn't respond in time on any of (\\d+) attempts$`) },
  { reason: 'unknown', pattern: new RegExp(`^${LABEL} didn't answer after (\\d+) attempts$`) }
]

// The situation sentence names the reset window (agent/retry_utils.py::
// format_reset_window → `~9h` / `~45 min`) when the quota reset is known.
const EXHAUSTED_TAIL =
  /^(?:its usage limit resets in (~\d+(?:h| min))\. Send \/retry after that, or switch models with \/model\.|it looks temporarily unavailable\. Wait a minute and send \/retry, or switch models with \/model\.) To avoid this in future, add a backup provider with `hermes fallback add`\.$/

const EXHAUSTED_COPY =
  /^(.+?) — ((?:its usage limit resets in|it looks temporarily unavailable)[^\n]*)(?:\n\nProvider said: ([\s\S]*))?$/

// agent/turn_failure_copy.py `invalid_response` site copy.
const INVALID_RESPONSE_COPY = new RegExp(
  `^${LABEL} sent back an empty or broken reply (\\d+) times — it is probably overloaded or rate-limiting you\\. Wait a minute and send /retry, or switch models with /model\\.(?:\\n\\nDetails: ([\\s\\S]*))?$`
)

// `error`-field shapes: agent/turn_response_check.py still stamps the first;
// the second is the pre-September lead, kept for stored transcripts.
const RETRY_ERROR_FIELD = /^(?:API call failed|Invalid API response) after \d+ retries:/i

// Classifier reasons (agent/error_classifier.py FailoverReason) the terminal
// frame's error_surface.code / failure_reason can carry for an exhausted turn.
const REASON_BY_CODE: Record<string, ProviderExhaustedReason> = {
  rate_limit: 'rate_limit',
  upstream_rate_limit: 'rate_limit',
  overloaded: 'overloaded',
  server_error: 'server_error',
  timeout: 'timeout'
}

interface ExhaustedCopy {
  reason: ProviderExhaustedReason
  label: string
  attempts: string
  resetWindow: string | null
  summary: string | null
}

function matchExhausted(text: string): ExhaustedCopy | null {
  const copy = EXHAUSTED_COPY.exec(text)

  if (!copy) {
    return null
  }

  const [, leadText, tail, summary] = copy
  const tailMatch = EXHAUSTED_TAIL.exec(tail)

  if (!tailMatch) {
    return null
  }

  for (const { reason, pattern } of EXHAUSTED_LEADS) {
    const lead = pattern.exec(leadText)

    if (lead) {
      return { reason, label: lead[1], attempts: lead[2], resetWindow: tailMatch[1] ?? null, summary: summary ?? null }
    }
  }

  return null
}

export function isApiRetryFailure(message: string): boolean {
  const text = message.trim()

  return RETRY_ERROR_FIELD.test(text) || matchExhausted(text) !== null || INVALID_RESPONSE_COPY.test(text)
}

function translate(locale: Locale | undefined, key: string, ...args: unknown[]): string {
  return locale ? translateForLocale(locale, key, ...args) : translateNow(key, ...args)
}

function localizeRetryHints(message: string, locale?: Locale): string {
  return message.replace(
    /\bslow response \((\d+(?:\.\d+)?)s\) — likely upstream timeout\b/gi,
    (_, durationSeconds: string) =>
      translate(
        locale,
        'assistant.thread.operationInterruptedRetryReasons.slowResponseLikelyUpstreamTimeout',
        durationSeconds
      )
  )
}

/** Translate Hermes-owned failure framing; provider text and unknown copy stay
 *  verbatim. `reasonCode` is the terminal frame's `error_surface.code`
 *  (= the result's `failure_reason`): when present it picks the lead sentence
 *  instead of sniffing it from the English prose. */
export function localizeApiErrorMessage(message: string, locale?: Locale, reasonCode?: null | string): string {
  const text = message.trim()
  const exhausted = matchExhausted(text)

  if (exhausted) {
    const reason = (reasonCode && REASON_BY_CODE[reasonCode]) || exhausted.reason

    const head = translate(
      locale,
      'notifications.errors.providerRetriesExhausted',
      reason,
      exhausted.label,
      exhausted.attempts,
      exhausted.resetWindow
    )

    return exhausted.summary === null
      ? head
      : `${head}\n\n${translate(locale, 'notifications.errors.providerSaid', exhausted.summary)}`
  }

  const invalid = INVALID_RESPONSE_COPY.exec(text)

  if (invalid) {
    const head = translate(locale, 'notifications.errors.providerInvalidResponse', invalid[1], invalid[2])

    return invalid[3] === undefined
      ? head
      : `${head}\n\n${translate(locale, 'notifications.errors.errorDetailsLine', localizeRetryHints(invalid[3], locale))}`
  }

  return localizeRetryHints(
    message
      .replace(/^API call failed after (\d+) retries(?=:)/i, (_, retries: string) =>
        translate(locale, 'notifications.errors.apiRetriesExhausted', retries)
      )
      .replace(/^Invalid API response after (\d+) retries:\s*(.+)$/i, (_, retries: string, detail: string) =>
        translate(
          locale,
          'notifications.errors.invalidApiResponseAfterRetries',
          retries,
          localizeRetryHints(detail, locale)
        )
      ),
    locale
    // gateway/run_turn.py: "It resets in ~3h." (ceilinged window) — older
    // notices spelled a bare number whose unit followed the sentence.
  ).replace(/\bIt resets in\s+(~?\d+(?:\.\d+)?(?:h\b| min\b)?)/gi, (_, remaining: string) =>
    translate(locale, 'notifications.errors.resetsIn', remaining)
  )
}

/** Activity and persisted transcript text can also contain model output. Only
 * a complete, unquoted status line belongs to the error translation path. */
export function localizeAgentStatusText(message: string, locale: Locale): string {
  if (message === message.trim() && !/[\r\n]/u.test(message) && isApiRetryFailure(message)) {
    return localizeApiErrorMessage(message, locale)
  }

  return localizeProviderWaitText(message, TRANSLATIONS[locale].assistant.thread)
}

/** Localize producer-owned delegation framing while leaving partial model
 * output untouched. The backend stores this result as display text, so the
 * desktop translates only exact protocol lines it owns. */
export function localizeAsyncDelegationResultText(message: string, locale?: Locale): string {
  let fence = ''

  return message
    .split(/(\r?\n)/u)
    .map(line => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/u)

      if (marker) {
        if (!fence) {
          fence = marker[1]
        } else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) {
          fence = ''
        }

        return line
      }

      if (fence) {
        return line
      }

      const failed = line.match(/^\(failed: ([^\r\n]+)\)$/i)

      if (failed) {
        return translate(locale, 'assistant.thread.asyncDelegationFailure', localizeApiErrorMessage(failed[1], locale))
      }

      if (line === 'Partial output:') {
        return translate(locale, 'assistant.thread.asyncDelegationPartialOutput')
      }

      return line === line.trimStart() && isApiRetryFailure(line) ? localizeApiErrorMessage(line, locale) : line
    })
    .join('')
}
