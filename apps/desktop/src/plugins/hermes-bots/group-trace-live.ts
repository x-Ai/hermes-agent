/**
 * The trace of a member turn IN FLIGHT — what the 1:1 chat shows while a turn
 * streams, for a room member whose session is hidden.
 *
 * Assembled from the gateway's own frames for the runtime ids the turn owns
 * (`reasoning.delta` / `reasoning.available`, `tool.start` / `tool.complete`,
 * `message.interim`; `tui_gateway/agent_callbacks.py`, `tool_progress.py`),
 * which reach the plugin through `host.onEvent` on the socket the turn holds.
 * A gateway that streams no tool progress (`display.tool_progress` off) still
 * shows its progress: each turn poll hands the transcript-so-far in, and it is
 * adopted while no frame has arrived.
 *
 * Runtime-only: the entry lives in `$groupLiveTraces` while the turn runs and
 * is removed when it ends. The finished turn's trace is captured from the
 * transcript (`group-trace-capture.ts`); the tool outcomes heard here are
 * joined into it, since the transcript projection carries no tool output.
 */

import { atom, host } from '@hermes/plugin-sdk'

import { groupMemberKey } from './group-membership'
import {
  clampTraceText,
  GROUP_TRACE_ARGS_CHARS,
  GROUP_TRACE_NOTE_CHARS,
  GROUP_TRACE_REASONING_CHARS,
  GROUP_TRACE_STEP_LIMIT,
  GROUP_TRACE_TEXT_CHARS
} from './group-trace'
import type { GroupToolOutcome, GroupTraceStep, GroupTraceToolStep, GroupTurnTrace } from './group-trace'
import { tracePassText, traceToolArgsText } from './group-trace-capture'
import type { GroupMember } from './types'

export interface GroupLiveTrace {
  group: string
  memberKey: string
  thread: string
  startedAt: number
  steps: GroupTraceStep[]
  /** Index of the tool step whose `tool.complete` has not arrived; null when none is running. */
  runningIndex: null | number
}

/** Live traces by `${group}::${memberKey}` — at most one turn per member runs at a time. */
export const $groupLiveTraces = atom<Record<string, GroupLiveTrace>>({})

export function groupLiveTraceKey(group: string, member: GroupMember): string {
  return `${group}::${groupMemberKey(member)}`
}

/** A gateway frame as the plugin event tap hands it over. */
interface LiveFrame {
  payload?: unknown
  session_id?: string
  type?: string
}

type EventTap = (type: string, listener: (event: LiveFrame) => void) => () => void

export interface GroupLiveTraceDeps {
  /** The event tap; `host.onEvent` by default (absent on a shell without it — the poll fallback still works). */
  onEvent?: EventTap
}

export interface GroupLiveTraceRecorder {
  /** Tool outcomes heard on the stream, by `tool_call_id`, for the finished trace. */
  outcomes(): Record<string, GroupToolOutcome>
  /** A poll's transcript view of the turn so far — adopted only while no frame has arrived. */
  notePoll(trace: GroupTurnTrace | null): void
  stop(): void
}

const LIVE_EVENTS = ['reasoning.delta', 'reasoning.available', 'tool.start', 'tool.complete', 'message.interim']
// Reasoning deltas arrive per token; coalesce them so the room repaints a few
// times a second, while tool and text frames flush at once (a step appearing
// is the transition the user is watching for).
const DELTA_FLUSH_MS = 120

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown

      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function firstLine(value: unknown): string {
  const text = textOf(value).trim()

  return text ? text.split('\n', 1)[0].trim() : ''
}

/** What a `tool.complete` frame says the call came back with: the gateway's
 *  summary when it sent one, else the error or the first line of the output;
 *  failed when the frame or the result says so (the shape `toolCallFailed`
 *  reads in the 1:1 chat). */
export function groupToolOutcomeFromFrame(payload: Record<string, unknown>): GroupToolOutcome {
  const result = asRecord(payload.result)
  const succeeded = result.success === true || result.ok === true
  const frameError = textOf(payload.error).trim()
  const resultError = succeeded ? '' : textOf(result.error).trim()

  const failed =
    Boolean(frameError) || (!succeeded && (result.success === false || result.ok === false || Boolean(resultError)))

  const note =
    textOf(payload.summary).trim() ||
    frameError ||
    resultError ||
    firstLine(result.output) ||
    firstLine(result.message) ||
    firstLine(result.content) ||
    firstLine(typeof payload.result === 'string' ? payload.result : '')

  return {
    ...(failed ? { failed: true } : {}),
    ...(note ? { note: clampTraceText(note, GROUP_TRACE_NOTE_CHARS) } : {})
  }
}

function toolStepFromFrame(payload: Record<string, unknown>): GroupTraceToolStep {
  const context = textOf(payload.context).trim()
  const args = traceToolArgsText(payload.args)

  return {
    kind: 'tool',
    name: textOf(payload.name) || 'tool',
    ...(context ? { context: clampTraceText(context, GROUP_TRACE_ARGS_CHARS) } : {}),
    ...(args ? { args: clampTraceText(args, GROUP_TRACE_ARGS_CHARS) } : {})
  }
}

export function startGroupLiveTrace(
  group: string,
  member: GroupMember,
  thread: string,
  runtimeIds: Set<string>,
  deps: GroupLiveTraceDeps = {}
): GroupLiveTraceRecorder {
  const key = groupLiveTraceKey(group, member)
  const memberKey = groupMemberKey(member)
  const startedAt = Date.now()
  const outcomes: Record<string, GroupToolOutcome> = {}
  const toolIndex = new Map<string, number>()
  let steps: GroupTraceStep[] = []
  let runningIndex: null | number = null
  let openReasoning = false
  let sawFrame = false
  let stopped = false
  let flushTimer: null | ReturnType<typeof setTimeout> = null

  const flush = () => {
    if (flushTimer !== null) {
      clearTimeout(flushTimer)
      flushTimer = null
    }

    if (stopped) {
      return
    }

    const kept = steps.length > GROUP_TRACE_STEP_LIMIT ? steps.slice(steps.length - GROUP_TRACE_STEP_LIMIT) : steps
    const dropped = steps.length - kept.length

    $groupLiveTraces.set({
      ...$groupLiveTraces.get(),
      [key]: {
        group,
        memberKey,
        thread,
        startedAt,
        steps: kept,
        runningIndex: runningIndex === null ? null : runningIndex - dropped
      }
    })
  }

  const scheduleFlush = () => {
    if (flushTimer === null && !stopped) {
      flushTimer = setTimeout(flush, DELTA_FLUSH_MS)
    }
  }

  const appendReasoning = (delta: string) => {
    const last = steps[steps.length - 1]

    if (openReasoning && last?.kind === 'reasoning') {
      steps = [
        ...steps.slice(0, -1),
        { kind: 'reasoning', text: clampTraceText(last.text + delta, GROUP_TRACE_REASONING_CHARS) }
      ]

      return
    }

    steps = [...steps, { kind: 'reasoning', text: clampTraceText(delta, GROUP_TRACE_REASONING_CHARS) }]
    openReasoning = true
  }

  // The stream is the ordered account of the turn from its first frame on: a
  // view adopted from a poll before it spoke is replaced, never appended to.
  const noteFrame = () => {
    if (!sawFrame) {
      steps = []
      runningIndex = null
    }

    sawFrame = true
  }

  const onFrame = (event: LiveFrame) => {
    if (stopped || !runtimeIds.has(String(event?.session_id || ''))) {
      return
    }

    const payload = asRecord(event.payload)
    noteFrame()

    if (event.type === 'reasoning.delta') {
      const delta = textOf(payload.text)

      if (delta) {
        appendReasoning(delta)
        scheduleFlush()
      }

      return
    }

    openReasoning = false

    if (event.type === 'reasoning.available') {
      const text = textOf(payload.text).trim()
      const last = steps[steps.length - 1]

      if (text && !(last?.kind === 'reasoning' && last.text === text)) {
        steps = [...steps, { kind: 'reasoning', text: clampTraceText(text, GROUP_TRACE_REASONING_CHARS) }]
      }
    } else if (event.type === 'tool.start') {
      toolIndex.set(textOf(payload.tool_id), steps.length)
      runningIndex = steps.length
      steps = [...steps, toolStepFromFrame(payload)]
    } else if (event.type === 'tool.complete') {
      const id = textOf(payload.tool_id)
      const outcome = groupToolOutcomeFromFrame(payload)
      const index = toolIndex.get(id)

      outcomes[id] = outcome

      if (index === undefined) {
        // The start frame was gated off (tool progress disabled for that tool); the call still happened.
        steps = [...steps, { ...toolStepFromFrame(payload), ...outcome }]
      } else {
        steps = steps.map((step, i) => (i === index ? { ...step, ...outcome } : step))
      }

      if (runningIndex === index || index === undefined) {
        runningIndex = null
      }
    } else if (event.type === 'message.interim') {
      const text = textOf(payload.text).trim()

      if (text && !tracePassText(text)) {
        steps = [...steps, { kind: 'text', text: clampTraceText(text, GROUP_TRACE_TEXT_CHARS) }]
      }
    }

    flush()
  }

  const tap = deps.onEvent ?? (typeof host.onEvent === 'function' ? (host.onEvent as EventTap) : null)
  const unsubscribes: Array<() => void> = []

  if (tap) {
    for (const type of LIVE_EVENTS) {
      try {
        unsubscribes.push(tap(type, onFrame))
      } catch {
        /* event tap unavailable — the poll fallback still shows progress */
      }
    }
  }

  return {
    outcomes: () => ({ ...outcomes }),
    notePoll(trace) {
      if (sawFrame || stopped) {
        return
      }

      const next = trace ? trace.steps : []

      if (JSON.stringify(next) === JSON.stringify(steps)) {
        return
      }

      steps = next
      runningIndex = null
      flush()
    },
    stop() {
      if (stopped) {
        return
      }

      stopped = true

      if (flushTimer !== null) {
        clearTimeout(flushTimer)
        flushTimer = null
      }

      for (const unsubscribe of unsubscribes.splice(0)) {
        try {
          unsubscribe()
        } catch {
          /* disposer already ran */
        }
      }

      const all = $groupLiveTraces.get()

      // Only our own entry: a member runs one turn at a time, but a stop that
      // lands after the next turn's first flush must not erase that turn.
      if (all[key]?.startedAt === startedAt) {
        const { [key]: _gone, ...rest } = all

        $groupLiveTraces.set(rest)
      }
    }
  }
}
