import type { RuntimeErrorsCopy } from '@/i18n/types_runtime'

/**
 * The main process's backend requests fail with one English sentence, "Timed out connecting to
 * Hermes backend after 30000ms" (electron/main.ts, under hardening.ts's 30 s default), and
 * use-gateway-boot.ts's `withTimeout` raises its bare form. Logs and the cause classifiers keep that
 * English; a surface that shows it to the user reads it in the UI language.
 */
const BACKEND_TIMEOUT = /^Timed out connecting to Hermes backend(?: after (\d+)\s*ms)?\.?$/i

export function isBackendTimeout(text: string): boolean {
  return BACKEND_TIMEOUT.test(text.trim())
}

/** `text` in the UI language when it is that timeout; any other text verbatim. */
export function localizeBackendTimeout(text: string, copy: Pick<RuntimeErrorsCopy, 'backendConnectTimedOut'>): string {
  const match = BACKEND_TIMEOUT.exec(text.trim())

  if (!match) {
    return text
  }

  return copy.backendConnectTimedOut(match[1] ? Math.max(1, Math.round(Number(match[1]) / 1000)) : null)
}
