import type { ProviderWaitThreadCopy } from './types_provider_wait'

// Backend wait / retry status lines (see types_provider_wait.ts), spread into
// `assistant.thread` in en.ts.
export const enProviderWait: ProviderWaitThreadCopy = {
  modelContinuing: (attempt, maxAttempts) =>
    `The model returned reasoning without a final answer — asking it to continue (${attempt}/${maxAttempts})`,
  providerReconnecting: (elapsedSeconds, kind) =>
    `No ${kind} from the provider after ${elapsedSeconds}s — reconnecting…`,
  providerRetrying: (retrySeconds, attempt, maxAttempts) =>
    `Waiting for the provider — retrying in ${retrySeconds}s (attempt ${attempt}/${maxAttempts})`,
  providerRetryReasons: {
    rate_limited: 'Rate limited',
    overloaded: 'Provider overloaded',
    free_model_busy: 'The free model is busy'
  },
  providerRetryingAfter: (reason, resetWindow, retrySeconds, attempt, maxAttempts) =>
    `${reason} — ${resetWindow ? `resets in ${resetWindow}, ` : ''}retrying in ${retrySeconds}s (attempt ${attempt}/${maxAttempts})`,
  providerAutoRecovering: (retrySeconds, cycle, total, stopHint) =>
    `Provider temporarily unavailable — retrying automatically in ${retrySeconds}s (cycle ${cycle}/${total})${
      stopHint ? `; ${stopHint}` : ''
    }`,
  providerStopHints: {
    esc: 'press Esc to stop',
    cancelRequest: 'cancel the request to stop',
    stopCommand: 'send /stop to cancel'
  },
  providerWaitPhases: {
    first_event: seconds => `${seconds}s waiting for the first provider event`,
    reconnect: seconds => `${seconds}s waiting for the first provider event after reconnect`,
    pre_progress: seconds => `provider stream open; ${seconds}s without substantive model progress`,
    post_event: seconds => `provider stream active; ${seconds}s without stream events`,
    first_chunk: seconds => `${seconds}s waiting for the first stream chunk`,
    post_chunk: seconds => `stream open; ${seconds}s without stream output`
  },
  providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
    `${stillWaiting ? 'Still waiting' : 'Waiting'} for ${model} — ${phaseText}${
      watchdog ? ` (auto-reconnect: ${watchdog.label} watchdog in ${watchdog.seconds}s)` : ''
    }`
}
