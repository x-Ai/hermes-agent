import { type Locale, translateForLocale, translateNow } from '@/i18n'

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

export function localizeApiErrorMessage(message: string, locale?: Locale): string {
  // Translate only Hermes-owned framing and recognized retry hints; preserve
  // unknown upstream codes and explanations verbatim.
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
  ).replace(/\bIt resets in\s+(\d+(?:\.\d+)?)/gi, (_, remaining: string) =>
    translate(locale, 'notifications.errors.resetsIn', remaining)
  )
}

/** Localize producer-owned delegation framing while leaving partial model
 * output untouched. The backend stores this result as display text, so the
 * desktop translates only exact protocol lines it owns. */
export function localizeAsyncDelegationResultText(message: string, locale?: Locale): string {
  return message
    .replace(/^\(failed: ([^\r\n]+)\)$/gim, (_, detail: string) =>
      translate(locale, 'assistant.thread.asyncDelegationFailure', localizeApiErrorMessage(detail, locale))
    )
    .replace(/^Partial output:$/gm, translate(locale, 'assistant.thread.asyncDelegationPartialOutput'))
}
