import type { Translations } from '@/i18n'

type AssistantThreadCopy = Translations['assistant']['thread']
type ProviderWaitKind = 'output' | 'response'

const WAITING_PATTERN =
  /^⏳\s*waiting on (.+?) — (\d+)s with no (output|response) yet \(provider may be slow or overloaded(?:, or the model is thinking)?(?:; auto-reconnect at (\d+)s)?\)$/i

const STREAM_WAITING_PATTERN =
  /^⏳\s*waiting on (.+?) — no stream (output|response) for (\d+)s \(provider may be slow or overloaded(?:, or the model is thinking)?(?:; auto-reconnect at (\d+)s)?\)$/i

const RECONNECTING_PATTERN = /^⚠\s*no (output|response) from provider (?:for|in) (\d+)s — reconnecting\.\.\.$/i

const RETRYING_PATTERN = /^⏳\s*waiting on provider — retrying in (\d+)s \(attempt (\d+)\/(\d+)\)$/i

const CONTINUING_PATTERN =
  /^↻\s*model returned reasoning with no final answer — asking it to continue \((\d+)\/(\d+)\)$/i

const WAITING_AFTER_ACTIVITY_PATTERN =
  /^⏳\s*waiting on (.+?) — (\d+)s with no (stream events|response after reconnect) \(provider may be slow or overloaded(?:; auto-reconnect at (\d+)s total elapsed)?\)$/i

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

  const streamWaiting = trimmed.match(STREAM_WAITING_PATTERN)

  if (streamWaiting) {
    return copy.providerWaiting(
      streamWaiting[1],
      streamWaiting[3],
      streamWaiting[2].toLowerCase() as ProviderWaitKind,
      streamWaiting[4] ?? null
    )
  }

  const reconnecting = trimmed.match(RECONNECTING_PATTERN)

  if (reconnecting) {
    return copy.providerReconnecting(reconnecting[2], reconnecting[1].toLowerCase() as ProviderWaitKind)
  }

  const retrying = trimmed.match(RETRYING_PATTERN)

  if (retrying) {
    return copy.providerRetrying(retrying[1], retrying[2], retrying[3])
  }

  const continuing = trimmed.match(CONTINUING_PATTERN)

  if (continuing) {
    return copy.modelContinuing(continuing[1], continuing[2])
  }

  const waitingAfterActivity = trimmed.match(WAITING_AFTER_ACTIVITY_PATTERN)

  if (waitingAfterActivity) {
    return copy.providerWaitingAfterActivity(
      waitingAfterActivity[1],
      waitingAfterActivity[2],
      waitingAfterActivity[3].toLowerCase() === 'stream events' ? 'events' : 'response',
      waitingAfterActivity[4] ?? null
    )
  }

  return text
}
