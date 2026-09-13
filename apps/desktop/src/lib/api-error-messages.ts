import { type Locale, translateForLocale, translateNow, TRANSLATIONS } from '@/i18n'

import { localizeProviderWaitText } from './provider-wait-localization'

const API_RETRY_FAILURE_PATTERN = /^(?:API call failed|Invalid API response) after \d+ retries:/i

export function isApiRetryFailure(message: string): boolean {
  return API_RETRY_FAILURE_PATTERN.test(message.trim())
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
