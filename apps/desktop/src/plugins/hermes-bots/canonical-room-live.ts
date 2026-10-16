/**
 * `room.activity` frames (a watched canonical room's members at work, see
 * `tui_gateway/hosted_room_activity_feed.py`) turned into what the legacy room
 * already renders: the live trace box under the working line
 * (`$groupLiveTraces`, through the same recorder the legacy turn poll feeds),
 * the per-member usage rows of the context chips, the finished trace a member
 * reply folds under its speaker line, and a transient "who is working now"
 * between two polls of `groups.live`.
 */

import { noteGroupSessionRuntime, recordGroupSessionUsageEvent } from './group-context-usage'
import { groupMemberKey } from './group-membership'
import { boundGroupTrace, type GroupTurnTrace } from './group-trace'
import { $groupLiveTraces, type GroupLiveTraceRecorder, startGroupLiveTrace } from './group-trace-live'
import type { GroupMember } from './types'

export interface RoomActivityFrame {
  execution_generation?: null | number
  kind: string
  member_id?: null | string
  payload?: Record<string, unknown>
  room_id: string
  seq?: null | number
  session_id: string
  task_id?: null | string
  thread_id?: null | string
  turn_id?: null | string
}

type FrameHandler = (frame: { payload?: unknown; session_id?: string; type: string }) => void

interface LiveTurn {
  handlers: Map<string, Set<FrameHandler>>
  member: GroupMember
  recorder: GroupLiveTraceRecorder
  sessionId: string
  thread: string
  turnId: null | string
}

/** Activity kind → the session frame type the legacy recorder understands. */
const FRAME_TYPE_BY_KIND: Record<string, string> = {
  'message.interim': 'message.interim',
  'reasoning.available': 'reasoning.available',
  'reasoning.delta': 'reasoning.delta',
  'tool.completed': 'tool.complete',
  'tool.started': 'tool.start'
}

const FINISHED_TRACES_PER_ROOM = 64
/** Usage rows of canonical members share the pre-thread session key legacy rooms use. */
const USAGE_THREAD = 'legacy'

const liveTurns = new Map<string, Map<string, LiveTurn>>()
const finishedTraces = new Map<string, Map<string, GroupTurnTrace>>()

export interface RoomActivityHooks {
  onTurnComplete?: (member: GroupMember) => void
  onTurnStarted?: (member: GroupMember, thread: string) => void
}

/** Finished member traces recorded for `group`, by turn id (newest kept). */
export function canonicalTurnTraces(group: string): Record<string, GroupTurnTrace> {
  return Object.fromEntries(finishedTraces.get(group) || [])
}

/** The member a watched room is hearing from right now, from its frames alone. */
export function canonicalLiveTurn(group: string): { member: GroupMember; thread: string } | null {
  const turn = liveTurns.get(group)?.values().next().value

  return turn ? { member: turn.member, thread: turn.thread } : null
}

function ensureLiveTurn(
  group: string,
  member: GroupMember,
  frame: RoomActivityFrame,
  hooks: RoomActivityHooks
): LiveTurn {
  const byMember = liveTurns.get(group) || new Map<string, LiveTurn>()
  const memberKey = groupMemberKey(member)
  const existing = byMember.get(memberKey)
  const thread = frame.thread_id || 'legacy'

  if (
    existing &&
    existing.sessionId === frame.session_id &&
    (existing.turnId === null || existing.turnId === (frame.turn_id || null))
  ) {
    existing.turnId = frame.turn_id || existing.turnId

    return existing
  }

  existing?.recorder.stop()
  const handlers = new Map<string, Set<FrameHandler>>()

  const recorder = startGroupLiveTrace(group, member, thread, new Set([frame.session_id]), {
    onEvent: (type, handler) => {
      const set = handlers.get(type) || new Set<FrameHandler>()
      set.add(handler as FrameHandler)
      handlers.set(type, set)

      return () => {
        set.delete(handler as FrameHandler)
      }
    }
  })

  const turn: LiveTurn = {
    handlers,
    member,
    recorder,
    sessionId: frame.session_id,
    thread,
    turnId: frame.turn_id || null
  }

  byMember.set(memberKey, turn)
  liveTurns.set(group, byMember)
  hooks.onTurnStarted?.(member, thread)

  return turn
}

function finishLiveTurn(group: string, member: GroupMember, turnId: null | string): void {
  const byMember = liveTurns.get(group)
  const memberKey = groupMemberKey(member)
  const turn = byMember?.get(memberKey)

  if (!turn) {
    return
  }

  const liveKey = `${group}::${memberKey}`
  const steps = $groupLiveTraces.get()[liveKey]?.steps || []
  const trace = boundGroupTrace(steps)
  const id = turnId || turn.turnId

  if (trace && id) {
    const traces = finishedTraces.get(group) || new Map<string, GroupTurnTrace>()
    traces.set(id, trace)

    while (traces.size > FINISHED_TRACES_PER_ROOM) {
      const oldest = traces.keys().next().value

      if (oldest === undefined) {
        break
      }

      traces.delete(oldest)
    }

    finishedTraces.set(group, traces)
  }

  turn.recorder.stop()
  byMember?.delete(memberKey)

  if (byMember && byMember.size === 0) {
    liveTurns.delete(group)
  }
}

/** Route one `room.activity` frame for `group` (its members as the projection seats them). */
export function handleRoomActivity(
  group: string,
  members: GroupMember[],
  frame: RoomActivityFrame,
  hooks: RoomActivityHooks = {}
): void {
  const memberId = String(frame.member_id || '')
  const member = members.find(m => m.name === memberId || m.targetProfile === memberId)

  if (!member || !frame.session_id) {
    return
  }

  if (frame.kind === 'turn.complete' || frame.kind === 'session.usage') {
    noteGroupSessionRuntime(group, USAGE_THREAD, member, frame.session_id)
    recordGroupSessionUsageEvent({ payload: frame.payload, session_id: frame.session_id })

    if (frame.kind === 'turn.complete') {
      finishLiveTurn(group, member, frame.turn_id || null)
      hooks.onTurnComplete?.(member)
    }

    return
  }

  const type = FRAME_TYPE_BY_KIND[frame.kind]

  if (!type) {
    return
  }

  const turn = ensureLiveTurn(group, member, frame, hooks)

  for (const handler of turn.handlers.get(type) || []) {
    handler({ payload: frame.payload, session_id: frame.session_id, type })
  }
}

/** A member message landed in the log: the turn it closes is finished even
 *  when its `message.complete` frame was not seen (window opened mid-turn). */
export function noteCanonicalMemberReply(group: string, member: GroupMember, turnId: null | string): void {
  finishLiveTurn(group, member, turnId)
}

/** Stop every recorder of a room (the viewer closed or the room was disbanded). */
export function stopCanonicalRoomLive(group: string): void {
  for (const turn of liveTurns.get(group)?.values() || []) {
    turn.recorder.stop()
  }

  liveTurns.delete(group)
}

export function _resetCanonicalRoomLiveForTests(): void {
  for (const group of [...liveTurns.keys()]) {
    stopCanonicalRoomLive(group)
  }

  finishedTraces.clear()
}
