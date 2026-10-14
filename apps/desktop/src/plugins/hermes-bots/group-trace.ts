/**
 * What a member DID during a room turn, kept beside its reply: the reasoning
 * blocks and the tool calls its hidden room session recorded between the room
 * prompt and the answer. The room folds it under the speaker line
 * (`group-trace-view.tsx`) the way the 1:1 chat folds thinking and tool rows;
 * `group-trace-capture.ts` builds it from the transcript the turn poll already
 * reads, so nothing extra is fetched.
 *
 * A trace is window-local richness like an entry's images: it rides the
 * plugin-storage room log and never the bounded ui_meta mirror. The room log
 * persists to localStorage under GROUP_CHAT_LOG_RETAIN_CHARS, so traces carry
 * their own per-room budget and the oldest are dropped first — the
 * conversation itself never pays for its traces. Budgets are String.length
 * code units.
 */

export interface GroupTraceReasoningStep {
  kind: 'reasoning'
  text: string
}

/** Words the member wrote before a tool call — interim text, not its reply. */
export interface GroupTraceTextStep {
  kind: 'text'
  text: string
}

export interface GroupTraceToolStep {
  kind: 'tool'
  name: string
  /** The gateway's one-line preview of the call (`tool_progress.py::_tool_ctx`). */
  context?: string
  /** Pretty-printed arguments, cut to GROUP_TRACE_ARGS_CHARS. */
  args?: string
  failed?: boolean
  /** The gateway's display summary of the result, when it sent one. */
  note?: string
}

export type GroupTraceStep = GroupTraceReasoningStep | GroupTraceTextStep | GroupTraceToolStep

export interface GroupTurnTrace {
  steps: GroupTraceStep[]
  /** Steps cut from the FRONT to fit the per-entry budget; the newest are kept. */
  dropped?: number
}

/** A caller-owned slot the turn engine fills with the finished turn's trace —
 *  threaded instead of returned so the turn's public `string | null` contract
 *  (and its tests) stay unchanged. */
export interface GroupTurnTraceSink {
  trace?: GroupTurnTrace | null
}

/** What a tool call came back with, as the gateway's `tool.complete` frame
 *  told it (`group-trace-live.ts`): the transcript projection a finished turn
 *  is captured from carries no tool output, so these are joined in by
 *  `tool_call_id`. */
export interface GroupToolOutcome {
  failed?: boolean
  note?: string
}

export const GROUP_TRACE_REASONING_CHARS = 4_000
export const GROUP_TRACE_TEXT_CHARS = 2_000
export const GROUP_TRACE_ARGS_CHARS = 600
export const GROUP_TRACE_NOTE_CHARS = 200
export const GROUP_TRACE_STEP_LIMIT = 60
/** One entry's trace, after the per-step cuts. */
export const GROUP_TRACE_CHARS = 8_000
/** All traces of one room log: dozens of ordinary traces, and a fixed ceiling
 *  on what traces add to the log's own character budget. */
export const GROUP_CHAT_TRACE_RETAIN_CHARS = 96_000
export const GROUP_TRACE_TRUNCATION_MARK = '… [truncated]'

const STEP_KINDS = new Set(['reasoning', 'text', 'tool'])
// JSON overhead of one step beyond its strings (`{"kind":"tool","name":…}`).
const STEP_OVERHEAD_CHARS = 32

export function clampTraceText(text: string, limit: number): string {
  const raw = String(text || '')

  if (raw.length <= limit) {
    return raw
  }

  return `${raw.slice(0, Math.max(0, limit - GROUP_TRACE_TRUNCATION_MARK.length))}${GROUP_TRACE_TRUNCATION_MARK}`
}

/** Shape guard for a trace read back from storage or an entry written by a
 *  future build: an object whose every step has a known kind and string fields. */
export function isGroupTurnTrace(value: unknown): value is GroupTurnTrace {
  if (!value || typeof value !== 'object' || !Array.isArray((value as GroupTurnTrace).steps)) {
    return false
  }

  return (value as GroupTurnTrace).steps.every(
    step =>
      step &&
      typeof step === 'object' &&
      STEP_KINDS.has(String(step.kind)) &&
      (step.kind === 'tool' ? typeof step.name === 'string' : typeof step.text === 'string')
  )
}

function stepChars(step: GroupTraceStep): number {
  if (step.kind === 'tool') {
    return (
      STEP_OVERHEAD_CHARS +
      step.name.length +
      (step.context?.length || 0) +
      (step.args?.length || 0) +
      (step.note?.length || 0)
    )
  }

  return STEP_OVERHEAD_CHARS + step.text.length
}

/** Rough stored size of a trace: its strings plus a little JSON per step. */
export function groupTraceChars(trace: GroupTurnTrace | null | undefined): number {
  return trace ? trace.steps.reduce((sum, step) => sum + stepChars(step), 0) : 0
}

/** Fit a turn's steps into the per-entry budget — the newest kept, the count
 *  of the cut remembered — or null when the turn left no steps at all. */
export function boundGroupTrace(steps: GroupTraceStep[]): GroupTurnTrace | null {
  if (!steps.length) {
    return null
  }

  let total = 0
  let keep = 0

  for (let i = steps.length - 1; i >= 0 && keep < GROUP_TRACE_STEP_LIMIT; i--) {
    total += stepChars(steps[i])

    if (keep && total > GROUP_TRACE_CHARS) {
      break
    }

    keep++
  }

  const dropped = steps.length - keep

  return dropped ? { steps: steps.slice(dropped), dropped } : { steps }
}

/** The collapsed header's account of a trace: whether it thought, how many
 *  tools it called. */
export function groupTraceCounts(trace: GroupTurnTrace): { reasoning: boolean; tools: number } {
  let reasoning = false
  let tools = 0

  for (const step of trace.steps) {
    if (step.kind === 'reasoning') {
      reasoning = true
    } else if (step.kind === 'tool') {
      tools++
    }
  }

  return { reasoning, tools }
}

/** Keep the newest traces of a room log within `budget`; older entries lose
 *  their trace, never their text. The same array comes back when nothing
 *  changes, and only entries that lose a trace are rebuilt. */
export function retainGroupTraces<T extends { trace?: GroupTurnTrace | null }>(
  log: T[],
  budget = GROUP_CHAT_TRACE_RETAIN_CHARS
): T[] {
  let total = 0
  let cut = -1

  for (let i = log.length - 1; i >= 0; i--) {
    const trace = log[i].trace

    if (!trace) {
      continue
    }

    total += groupTraceChars(trace)

    if (total > budget) {
      cut = i

      break
    }
  }

  if (cut === -1) {
    return log
  }

  return log.map((entry, index) => {
    if (index > cut || !entry.trace) {
      return entry
    }

    const { trace: _dropped, ...rest } = entry

    return rest as T
  })
}
