import { translateNow } from '@/i18n'

export function localizeApiErrorMessage(message: string): string {
  // Translate only the framing; preserve upstream codes, explanations, and
  // duration units verbatim, including incomplete reset times.
  return message
    .replace(/^API call failed after (\d+) retries(?=:)/i, (_, retries: string) =>
      translateNow('notifications.errors.apiRetriesExhausted', retries)
    )
    .replace(/\bIt resets in\s+(\d+(?:\.\d+)?)/gi, (_, remaining: string) =>
      translateNow('notifications.errors.resetsIn', remaining)
    )
}
