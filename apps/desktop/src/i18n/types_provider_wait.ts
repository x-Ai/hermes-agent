// Backend-owned wait / retry status lines: the core rewrites the live status
// line (`thinking.delta`) in English while a provider is silent, backing off or
// in the auto-recovery ladder; lib/provider-wait-localization.ts recognises
// each shape and re-renders it from this copy. `assistant.thread` spreads it in.

/** Silence phases named by agent/chat_completion_wait_notice.py (`_PHASE_TEXT`). */
export type ProviderWaitPhase =
  'first_event' | 'reconnect' | 'pre_progress' | 'post_event' | 'first_chunk' | 'post_chunk'

/** Why agent/turn_recovery.py is backing off before the next attempt — the
 *  lead of its live retry countdown (`compute_error_backoff`). */
export type ProviderRetryReason = 'rate_limited' | 'overloaded' | 'free_model_busy'

/** How the user stops the auto-recovery wait on this surface
 *  (agent/turn_recovery_autorecover.py `_STOP_HINTS`). */
export type ProviderStopHint = 'esc' | 'cancelRequest' | 'stopCommand'

export interface ProviderWaitThreadCopy {
  modelContinuing: (attempt: string, maxAttempts: string) => string
  providerReconnecting: (elapsedSeconds: string, kind: 'output' | 'response') => string
  providerRetrying: (retrySeconds: string, attempt: string, maxAttempts: string) => string
  /** The lead of a retry countdown, one per backoff reason. */
  providerRetryReasons: Record<ProviderRetryReason, string>
  /** `⏳ {reason} — [resets in {window},] retrying in {n}s (attempt {a}/{b})`.
   *  `reason` is the rendered `providerRetryReasons` entry; `resetWindow` is the
   *  backend's compact duration (`~13m`, `~1h 5m`) or null when unknown. */
  providerRetryingAfter: (
    reason: string,
    resetWindow: string | null,
    retrySeconds: string,
    attempt: string,
    maxAttempts: string
  ) => string
  /** `⏳ Provider temporarily unavailable — retrying automatically in {n}s (cycle {c}/{t})[; {hint}]`.
   *  `stopHint` is the rendered `providerStopHints` entry (or the backend's text
   *  when it names a hint this build does not know); null on surfaces with none. */
  providerAutoRecovering: (retrySeconds: string, cycle: string, total: string, stopHint: string | null) => string
  providerStopHints: Record<ProviderStopHint, string>
  /** One rendering per backend silence phase, given the seconds of silence. */
  providerWaitPhases: Record<ProviderWaitPhase, (seconds: string) => string>
  /** `⏳ waiting on {model} — {phase} (auto-reconnect: {label} watchdog in {n}s)`;
   *  `stillWaiting` is the backend's near-deadline lead. The watchdog label is
   *  the backend's own identifier (TTFB, stream idle, …) and stays verbatim. */
  providerWaitNotice: (
    model: string,
    phaseText: string,
    watchdog: { label: string; seconds: string } | null,
    stillWaiting: boolean
  ) => string
}
