import type { ProviderRetryReason, ProviderStopHint, ProviderWaitPhase, Translations } from '@/i18n'

type AssistantThreadCopy = Translations['assistant']['thread']
type Format = (copy: AssistantThreadCopy) => string

// agent/chat_completion_wait_notice.py::_PHASE_TEXT — one regex per template
// (`{n}` → the seconds of silence). `reconnect` precedes `first_event`
// because the first_event text is a prefix of it.
const PHASE_TEXT: ReadonlyArray<{ phase: ProviderWaitPhase; pattern: RegExp }> = [
  { phase: 'reconnect', pattern: /^(\d+)s waiting for the first provider event after reconnect$/i },
  { phase: 'first_event', pattern: /^(\d+)s waiting for the first provider event$/i },
  { phase: 'pre_progress', pattern: /^provider stream open; (\d+)s without substantive model progress$/i },
  { phase: 'post_event', pattern: /^provider stream active; (\d+)s without stream events$/i },
  { phase: 'first_chunk', pattern: /^(\d+)s waiting for the first stream chunk$/i },
  { phase: 'post_chunk', pattern: /^stream open; (\d+)s without stream output$/i }
]

// wait_notice_text(): "⏳ {waiting on|still waiting on} {model} — {phase}
// [ (auto-reconnect: {label} watchdog in {n}s)]". "still" is the lead the
// backend switches to within NEAR_DEADLINE_SECS of the watchdog.
const WAIT_NOTICE = /^(still )?waiting on (.+?) — (.+?)(?: \(auto-reconnect: (.+?) watchdog in (\d+)s\))?$/i

// agent/turn_recovery.py::compute_error_backoff names why it is backing off in
// the lead of its live countdown; the bare "waiting on provider" lead has its
// own entry below.
const RETRY_REASONS: Readonly<Record<string, ProviderRetryReason>> = {
  'rate limited': 'rate_limited',
  'provider overloaded': 'overloaded',
  'the free model is busy': 'free_model_busy'
}

// agent/turn_recovery_autorecover.py `_STOP_HINTS`: how the user ends the wait
// on the surface that owns the session. A hint this build does not know is
// shown as the backend wrote it.
const STOP_HINTS: Readonly<Record<string, ProviderStopHint>> = {
  'press esc to stop': 'esc',
  'cancel the request to stop': 'cancelRequest',
  'send /stop to cancel': 'stopCommand'
}

// The other live status rewrites the core still emits verbatim
// (chat_completion_helpers / chat_completion_nonstream / turn_recovery /
// turn_recovery_autorecover / turn_truncation).
const OTHER_NOTICES: ReadonlyArray<{ pattern: RegExp; format: (match: RegExpMatchArray) => Format }> = [
  {
    pattern: /^no (output|response) from provider (?:for|in) (\d+)s — reconnecting\.\.\.$/i,
    format: match => copy => copy.providerReconnecting(match[2], match[1].toLowerCase() as 'output' | 'response')
  },
  {
    pattern: /^waiting on provider — retrying in (\d+)s \(attempt (\d+)\/(\d+)\)$/i,
    format: match => copy => copy.providerRetrying(match[1], match[2], match[3])
  },
  {
    // "⏳ {reason} — [resets in {window},] retrying in {n}s (attempt {a}/{b})"; the
    // reset window is reset_hint()'s compact duration ("~13m", "~1h 5m").
    pattern:
      /^(rate limited|provider overloaded|the free model is busy) — (?:resets in (.+?), )?retrying in (\d+)s \(attempt (\d+)\/(\d+)\)$/i,
    format: match => copy =>
      copy.providerRetryingAfter(
        copy.providerRetryReasons[RETRY_REASONS[match[1].toLowerCase()]],
        match[2] ?? null,
        match[3],
        match[4],
        match[5]
      )
  },
  {
    // ladder_notice(): "⏳ Provider temporarily unavailable — retrying automatically
    // in {n}s (cycle {c}/{t})[; {stop hint}]" — no hint on cron.
    pattern: /^provider temporarily unavailable — retrying automatically in (\d+)s \(cycle (\d+)\/(\d+)\)(?:; (.+))?$/i,
    format: match => copy => {
      const hint = match[4] === undefined ? null : STOP_HINTS[match[4].toLowerCase()]

      return copy.providerAutoRecovering(
        match[1],
        match[2],
        match[3],
        hint ? copy.providerStopHints[hint] : (match[4] ?? null)
      )
    }
  },
  {
    pattern: /^model returned reasoning with no final answer — asking it to continue \((\d+)\/(\d+)\)$/i,
    format: match => copy => copy.modelContinuing(match[1], match[2])
  }
]

function matchProviderWaitNotice(text: string): Format | null {
  const body = text.trim().replace(/^[⏳⚠↻]️?\s*/u, '')

  for (const notice of OTHER_NOTICES) {
    const match = body.match(notice.pattern)

    if (match) {
      return notice.format(match)
    }
  }

  const wait = WAIT_NOTICE.exec(body)

  if (!wait) {
    return null
  }

  const [, still, model, phaseText, label, watchdogSeconds] = wait

  for (const { phase, pattern } of PHASE_TEXT) {
    const match = pattern.exec(phaseText)

    if (match) {
      return copy =>
        copy.providerWaitNotice(
          model,
          copy.providerWaitPhases[phase](match[1]),
          label ? { label, seconds: watchdogSeconds } : null,
          Boolean(still)
        )
    }
  }

  // A wait frame whose phase text this build does not know is still a status
  // rewrite (ephemeral in watch windows), shown as the backend wrote it.
  return () => text
}

/** True for the core's explained wait / reconnect / retry status rewrites —
 *  the frames a child watch window keeps ephemeral instead of appending to
 *  the reasoning transcript. */
export function isProviderWaitNotice(text: string): boolean {
  return matchProviderWaitNotice(text) !== null
}

/** Translate only backend-owned wait notices; arbitrary model text is kept. */
export function localizeProviderWaitText(text: string, copy: AssistantThreadCopy): string {
  const format = matchProviderWaitNotice(text)

  return format ? format(copy) : text
}
