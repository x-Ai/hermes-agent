import { atom } from 'nanostores'

import { keyedTimeouts } from '@/lib/keyed-timeouts'

import { $gateway } from './gateway'
import { isSessionGone, isSessionGoneForBackgroundPolling, markSessionGone } from './runtime-gone'
import { ambientRequestFor } from './session-gone-latch'
import { requestForOwnedSession } from './session-states'

export type GoalStatus = 'active' | 'done' | 'paused' | 'waiting'

export interface SessionGoal {
  detail?: string
  status: GoalStatus
  title: string
  updatedAt: number
}

export const $goalsBySession = atom<Record<string, SessionGoal>>({})

const DONE_LINGER_MS = 8_000
const clearTimers = keyedTimeouts()

export function setSessionGoal(sid: string, goal: SessionGoal) {
  if (!sid) {
    return
  }

  clearTimers.cancel(sid)
  $goalsBySession.set({ ...$goalsBySession.get(), [sid]: goal })

  if (goal.status === 'done') {
    clearTimers.schedule(sid, DONE_LINGER_MS, () => clearSessionGoal(sid))
  }
}

export function clearSessionGoal(sid: string) {
  clearTimers.cancel(sid)

  const map = $goalsBySession.get()

  if (!(sid in map)) {
    return
  }

  const { [sid]: _drop, ...rest } = map
  $goalsBySession.set(rest)
}

const clean = (value: string): string => value.replace(/\r/g, '').trim()

const firstLine = (value: string): string => clean(value).split('\n')[0]?.trim() ?? ''

function goalTitleFromLine(line: string, pattern: RegExp): string {
  return (line.match(pattern)?.[1] ?? '').trim()
}

// GoalManager.status_line() while paused: "⏸ Goal (paused, {meta}[ — {reason}]): {goal}".
// The paused reason may itself hold parentheses ("turn budget exhausted (3/20)"), so
// the budget summary is matched as the closed set it is and the reason greedily, up
// to the last "): ".
const PAUSED_STATUS_LINE =
  /^⏸ Goal \(paused, \d+\/\d+ turns(?:, (?:\d+ subgoals?|contract|\d+ gates?))*(?: — [\s\S]+)?\): ([\s\S]+)$/

// Judge / loop lines about the standing goal that do not name it: the detail is
// the line minus its glyph, the title carries over (empty before any line set
// one; the row shows its localized placeholder).
const DETAIL_LINES: ReadonlyArray<{ pattern: RegExp; status: GoalStatus }> = [
  { pattern: /^↻ Continuing toward goal\b/i, status: 'active' },
  { pattern: /^⏳ Goal parked\b/i, status: 'waiting' },
  { pattern: /^⏸ Goal paused\b/i, status: 'paused' },
  // GoalManager.evaluate_after_turn: a goal judged unachievable is parked as paused.
  { pattern: /^🚫 Goal judged unachievable\b/iu, status: 'paused' },
  { pattern: /^✓ Goal achieved\b/i, status: 'done' }
]

function nextGoalFromText(text: string, previous?: SessionGoal): SessionGoal | null | undefined {
  const body = clean(text)
  const line = firstLine(body)

  if (!line) {
    return undefined
  }

  if (
    /^No active goal\b/i.test(line) ||
    /^No goal (?:set|to resume)\b/i.test(line) ||
    /^✓ Goal cleared\b/i.test(line)
  ) {
    return null
  }

  const now = Date.now()
  const fromSet = goalTitleFromLine(line, /^⊙ Goal set(?:\s*\([^)]*\))?:\s*(.+)$/)
  const fromActive = goalTitleFromLine(line, /^⊙ Goal\s*\([^)]*active[^)]*\):\s*(.+)$/)
  const fromResume = goalTitleFromLine(line, /^▶ Goal resumed:\s*(.+)$/)

  if (fromSet || fromActive || fromResume) {
    return { status: 'active', title: fromSet || fromActive || fromResume, updatedAt: now }
  }

  const fromWaiting = goalTitleFromLine(line, /^⏳ Goal\s*\([^)]*(?:parked|active)[^)]*\):\s*(.+)$/)

  if (fromWaiting) {
    return { status: 'waiting', title: fromWaiting, updatedAt: now }
  }

  const fromPaused =
    goalTitleFromLine(line, PAUSED_STATUS_LINE) || goalTitleFromLine(line, /^⏸ Goal(?:\s*\([^)]*\)| paused)?:\s*(.+)$/)

  if (fromPaused) {
    return { status: 'paused', title: fromPaused, updatedAt: now }
  }

  const fromDone = goalTitleFromLine(line, /^✓ Goal done\s*\([^)]*\):\s*(.+)$/)

  if (fromDone) {
    return { status: 'done', title: fromDone, updatedAt: now }
  }

  const detailLine = DETAIL_LINES.find(({ pattern }) => pattern.test(line))

  if (detailLine) {
    return {
      detail: line.replace(/^[↻⏳⏸🚫✓]\s*/u, ''),
      status: detailLine.status,
      title: previous?.title ?? '',
      updatedAt: now
    }
  }

  return undefined
}

export function applyGoalStatusText(sid: string, text: string, opts?: { hydrate?: boolean }) {
  if (!sid) {
    return
  }

  const next = nextGoalFromText(text, $goalsBySession.get()[sid])

  if (next === null) {
    clearSessionGoal(sid)
  } else if (next) {
    // A done goal is terminal state in the backend DB — it stays "done"
    // forever (only /goal clear or a new goal replaces it). The 8s linger is
    // for the LIVE completion moment; re-hydrating "✓ Goal done" on every
    // mount would resurrect the chip indefinitely. Bot Mode is the worst
    // case: one endless session means the completed layover would never go
    // away. On hydration, a terminal goal is the same as no goal.
    if (opts?.hydrate && next.status === 'done') {
      clearSessionGoal(sid)

      return
    }

    setSessionGoal(sid, next)
  }
}

export async function refreshSessionGoal(sid: string): Promise<void> {
  const gateway = $gateway.get()

  if (!sid || !gateway || isSessionGone(sid)) {
    return
  }

  try {
    const result = await requestForOwnedSession<{ output?: string }>(sid, ambientRequestFor(gateway), 'slash.exec', {
      command: 'goal status',
      session_id: sid
    })

    applyGoalStatusText(sid, result?.output ?? '', { hydrate: true })
  } catch (error) {
    if (isSessionGoneForBackgroundPolling(error)) {
      markSessionGone(sid)

      return
    }

    // Best-effort: older gateways or a transport blip simply won't hydrate it.
  }
}
