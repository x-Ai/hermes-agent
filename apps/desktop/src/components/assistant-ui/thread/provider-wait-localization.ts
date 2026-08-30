import type { Translations } from '@/i18n'

type AssistantThreadCopy = Translations['assistant']['thread']
type ProviderWaitKind = 'output' | 'response'

const WAITING_PATTERN =
  /^⏳\s*waiting on (.+?) — (\d+)s with no (output|response) yet \(provider may be slow or overloaded(?:, or the model is thinking)?(?:; auto-reconnect at (\d+)s)?\)$/i

const RECONNECTING_PATTERN = /^⚠\s*no (output|response) from provider (?:for|in) (\d+)s — reconnecting\.\.\.$/i

/**
 * The core sends these notices through the shared thinking.delta protocol, so
 * their wire text stays stable for CLI, TUI, Desktop, and messaging gateways.
 * Desktop treats the known English forms as protocol-shaped display payloads:
 * parse the dynamic fields, then rebuild the sentence with renderer-owned copy.
 * Unknown/new forms remain visible verbatim instead of being dropped.
 */
export function localizeProviderWaitText(text: string, copy: AssistantThreadCopy): string {
  const trimmed = text.trim()
  const waiting = trimmed.match(WAITING_PATTERN)

  if (waiting) {
    return copy.providerWaiting(
      waiting[1],
      waiting[2],
      waiting[3].toLowerCase() as ProviderWaitKind,
      waiting[4] ?? null
    )
  }

  const reconnecting = trimmed.match(RECONNECTING_PATTERN)

  if (reconnecting) {
    return copy.providerReconnecting(reconnecting[2], reconnecting[1].toLowerCase() as ProviderWaitKind)
  }

  return text
}
