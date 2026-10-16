/**
 * Localized reading of a raw boot-failure detail. The main process and the renderer report what
 * they saw in English ("Timed out connecting to Hermes backend after 45000ms"); the overlay keeps
 * that text under Details, so the known shapes are re-rendered in the UI language, line by line,
 * and anything else stays verbatim for whoever reads the log. Pure and table-driven, like the
 * cause classifier beside it.
 */

import type { RuntimeErrorsCopy } from '@/i18n/types_runtime'

type DetailCopy = Pick<RuntimeErrorsCopy, 'backendConnectTimedOut'>

// `withTimeout` in use-gateway-boot.ts and the main process's backend requests.
const BACKEND_TIMEOUT = /^Timed out connecting to Hermes backend(?: after (\d+)\s*ms)?\.?$/i

function localizeLine(line: string, copy: DetailCopy): string {
  const match = BACKEND_TIMEOUT.exec(line.trim())

  if (!match) {
    return line
  }

  return copy.backendConnectTimedOut(match[1] ? Math.max(1, Math.round(Number(match[1]) / 1000)) : null)
}

export function localizeBootFailureDetail(raw: null | string, copy: DetailCopy): null | string {
  if (!raw) {
    return raw
  }

  return raw
    .split('\n')
    .map(line => localizeLine(line, copy))
    .join('\n')
}
