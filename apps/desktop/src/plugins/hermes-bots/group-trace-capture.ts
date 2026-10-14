/**
 * Build a member turn's trace from the transcript the turn poll already read.
 *
 * A member's hidden room session is an ordinary Hermes session, so `session.resume`
 * reports the same rows the 1:1 chat hydrates: assistant rows carry reasoning
 * sidecars (`reasoning` / `reasoning_content` / `reasoning_details`), and each
 * tool call is its own `role: 'tool'` row with a name, an 80-char `context`
 * preview, its `args`, and a `display_metadata` result summary
 * (`session_history.py::_history_to_messages`, `tool_progress.py`). We walk the
 * rows this turn appended (after the submit baseline) and keep the reasoning,
 * the tool calls, and any interim text the member wrote before a tool — the
 * answer itself is the room entry's own text, never a trace step. The
 * projection carries no tool OUTPUT, so the outcomes the live stream heard
 * (`group-trace-live.ts`) are joined in by `tool_call_id`.
 *
 * The SDK does not export the core reasoning-details reader, so the small
 * extractor below mirrors `lib/chat-messages/parts.ts::reasoningTextFromDetails`
 * for the kinds that carry display text.
 */

import { failedTurnBoundaryRow, groupTranscriptRowText, syntheticGroupUserRow } from './group-external-writes'
import type { GroupTranscriptRow } from './group-external-writes'
import { GROUP_PROMPT_HEADER_PREFIX } from './group-round-prompt'
import {
  boundGroupTrace,
  clampTraceText,
  GROUP_TRACE_ARGS_CHARS,
  GROUP_TRACE_NOTE_CHARS,
  GROUP_TRACE_REASONING_CHARS,
  GROUP_TRACE_TEXT_CHARS
} from './group-trace'
import type { GroupToolOutcome, GroupTraceStep, GroupTraceToolStep, GroupTurnTrace } from './group-trace'

/** The assistant/tool fields a trace reads, on top of the plain transcript row. */
export interface GroupTraceSourceRow extends GroupTranscriptRow {
  name?: string
  tool_name?: string
  tool_call_id?: string
  context?: unknown
  args?: unknown
  display_metadata?: unknown
  /** The gateway's display projection of `reasoning` with Codex commentary
   *  removed (`agent/history_commentary.py`); wins over the raw field, as in
   *  the 1:1 chat, and an empty string means "nothing to show". */
  display_reasoning?: unknown
  reasoning?: unknown
  reasoning_content?: unknown
  reasoning_details?: unknown
}

const PASS_RE = /^\(?\s*pass\s*\)?\.?$/i

/** "(pass)" and its spellings — the member stayed silent, not a thing it said. */
export function tracePassText(text: string): boolean {
  return PASS_RE.test(text)
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

/** Reasoning text off an assistant row: the plain fields first, then the
 *  structured `reasoning_details` envelope (string, JSON string, or an array of
 *  `{ type: 'reasoning.summary' | 'reasoning.text', … }` / `{ thinking }` parts). */
export function traceReasoningText(row: GroupTraceSourceRow): string {
  if (typeof row.display_reasoning === 'string') {
    return row.display_reasoning.trim()
  }

  const direct = firstString(row.reasoning, row.reasoning_content)

  if (direct) {
    return direct
  }

  return reasoningFromDetails(row.reasoning_details)
}

function reasoningFromDetails(details: unknown): string {
  let blocks = details

  if (typeof blocks === 'string') {
    const trimmed = blocks.trim()

    if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
      return trimmed
    }

    try {
      blocks = JSON.parse(trimmed) as unknown
    } catch {
      return ''
    }
  }

  const out: string[] = []

  const push = (value: unknown) => {
    const prose = typeof value === 'string' ? value.trim() : ''

    if (prose && !out.includes(prose)) {
      out.push(prose)
    }
  }

  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk)

      return
    }

    if (!node || typeof node !== 'object') {
      return
    }

    const record = node as Record<string, unknown>
    const kind = typeof record.type === 'string' ? record.type : ''

    if (kind === 'reasoning.summary') {
      push(record.summary)
    } else if (kind === 'reasoning.text' || kind === 'reasoning') {
      push(record.text)
    } else if (typeof record.thinking === 'string') {
      push(record.thinking)
    }

    for (const [key, value] of Object.entries(record)) {
      if (key === 'signature' || key === 'projection' || key === 'data' || key === 'type') {
        continue
      }

      if (value && typeof value === 'object') {
        walk(value)
      }
    }
  }

  walk(blocks)

  return out.join('\n\n')
}

/** Pretty JSON of a tool call's arguments, with the display-only `context` and
 *  label keys dropped so the row shows the real call. */
export function traceToolArgsText(args: unknown): string {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return typeof args === 'string' ? args.trim() : ''
  }

  const record = { ...(args as Record<string, unknown>) }

  delete record.context

  for (const key of Object.keys(record)) {
    if (key.startsWith('__')) {
      delete record[key]
    }
  }

  if (!Object.keys(record).length) {
    return ''
  }

  try {
    return JSON.stringify(record, null, 2)
  } catch {
    return ''
  }
}

/** A tool row as a step. The row's own `display_metadata` (what the gateway
 *  persisted) comes first; the outcome heard live for the same call fills in
 *  what the projection omits — the result summary, a failure. */
function toolStep(row: GroupTraceSourceRow, outcome?: GroupToolOutcome): GroupTraceToolStep {
  const meta =
    row.display_metadata && typeof row.display_metadata === 'object'
      ? (row.display_metadata as Record<string, unknown>)
      : null

  const errText = typeof meta?.error === 'string' ? meta.error : meta?.error === true ? 'error' : ''
  const note = errText || firstString(meta?.summary, meta?.message, meta?.preview, outcome?.note)
  const failed = Boolean(errText || outcome?.failed)
  const context = typeof row.context === 'string' ? row.context.trim() : ''
  const args = traceToolArgsText(row.args)

  return {
    kind: 'tool',
    name: String(row.name || row.tool_name || 'tool'),
    ...(context ? { context: clampTraceText(context, GROUP_TRACE_ARGS_CHARS) } : {}),
    ...(args ? { args: clampTraceText(args, GROUP_TRACE_ARGS_CHARS) } : {}),
    ...(failed ? { failed: true } : {}),
    ...(note ? { note: clampTraceText(note, GROUP_TRACE_NOTE_CHARS) } : {})
  }
}

function pushReasoning(steps: GroupTraceStep[], text: string) {
  const last = steps[steps.length - 1]

  // A provider that repeats its last summary verbatim adds nothing.
  if (last?.kind === 'reasoning' && last.text === text) {
    return
  }

  steps.push({ kind: 'reasoning', text: clampTraceText(text, GROUP_TRACE_REASONING_CHARS) })
}

/**
 * The reasoning, tool calls and interim text of the turn whose submit left the
 * transcript at `before`, up to (but excluding) its `reply`. `outcomes` are the
 * tool results the live stream heard, by `tool_call_id`. Returns null when the
 * turn left no process to show — a bare answer with no thinking or tools.
 */
export function captureGroupTurnTrace(
  messages: GroupTraceSourceRow[] | null | undefined,
  before: number,
  reply: null | string,
  outcomes: Record<string, GroupToolOutcome> = {}
): GroupTurnTrace | null {
  const rows = Array.isArray(messages) ? messages : []
  const answer = String(reply || '').trim()
  const steps: GroupTraceStep[] = []
  let started = false

  for (let i = Math.max(0, before); i < rows.length; i++) {
    const row = rows[i]
    const role = row?.role

    if (role === 'user') {
      const text = groupTranscriptRowText(row)

      // The turn's own prompt opens it; synthetic scaffolding (auto-continue,
      // steer markers) is not a boundary. A real outside user row ends it.
      if (text.startsWith(GROUP_PROMPT_HEADER_PREFIX)) {
        started = true
      } else if (!syntheticGroupUserRow(row, text) && (started || steps.length)) {
        break
      }

      continue
    }

    if (role === 'tool') {
      steps.push(toolStep(row, outcomes[String(row.tool_call_id || '')]))

      continue
    }

    if (role !== 'assistant') {
      continue
    }

    if (failedTurnBoundaryRow(row)) {
      break
    }

    const reasoning = traceReasoningText(row)

    if (reasoning) {
      pushReasoning(steps, reasoning)
    }

    const text = groupTranscriptRowText(row)

    if (text && text !== answer && !tracePassText(text)) {
      steps.push({ kind: 'text', text: clampTraceText(text, GROUP_TRACE_TEXT_CHARS) })
    }
  }

  return boundGroupTrace(steps)
}
