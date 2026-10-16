/**
 * A gateway-hosted ("canonical") room projected into the record shape the room
 * view, the roster and the engine already read — `GroupChatRoom` — so every
 * room feature (timeline, threads, folder chips, @handle, the folded trace, the
 * context chips) works unchanged on a canonical room. Pure: sources in, record
 * out. The record is keyed by the opaque `canonical:` key; `displayName` is the
 * room's name, `canonical` the binding the actions route through.
 */

import type { CanonicalGroupBinding, CanonicalRoom, CanonicalRoomMember } from './canonical-groups'
import type { GroupChatRoom } from './group-chat'
import type { GroupTurnTrace } from './group-trace'
import type { GroupActivityKind, GroupMember, GroupMessage, HostedAttachment } from './types'

export interface CanonicalRoomEvent {
  seq: number
  event_id?: string
  kind: string
  /** Seconds (the gateway's clock). */
  created_at?: number
  actor?: { display_name?: string; id?: string; kind?: string; profile?: string }
  payload?: Record<string, unknown>
}

export interface CanonicalRoomSettings {
  handle?: null | string
  hold_detection?: boolean
  member_workspaces?: Record<string, string>
  thread_workspaces?: Record<string, string>
  workspace?: null | string
}

export interface CanonicalMemberSession {
  local: boolean
  member_id: string
  profile: string
  root_id?: null | string
  session_id?: null | string
}

export interface CanonicalLiveTurn {
  member_id?: null | string
  started_at?: null | number
  status: string
  task_id: string
  thread_id: string
  turn_id: string
}

export interface CanonicalRoomSources {
  binding: CanonicalGroupBinding
  events: CanonicalRoomEvent[]
  live?: CanonicalLiveTurn | null
  /** Optimistic user entries the gateway has not echoed yet (`id` = the send's event id). */
  pending?: GroupMessage[]
  previous?: GroupChatRoom | null
  room: CanonicalRoom
  sessions?: CanonicalMemberSession[] | null
  settings?: CanonicalRoomSettings | null
  /** Finished member traces by `turn_id` (recorded live while this window watched). */
  traces?: Record<string, GroupTurnTrace>
  working: boolean
}

/** Usage rows of canonical members ride the same thread key legacy pre-thread sessions use. */
export const CANONICAL_USAGE_THREAD = 'legacy'

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function seconds(value: unknown): number {
  const at = Number(value)

  return Number.isFinite(at) && at > 0 ? Math.round(at * 1000) : Date.now()
}

/** The room's members as the roster seats them: `name` is the member's profile
 *  (the id every room surface keys on), `handle` the tag the gateway resolves
 *  mentions against, `title` the display name the row shows. */
export function canonicalRoomMembers(
  room: Pick<CanonicalRoom, 'members'>,
  binding: CanonicalGroupBinding
): GroupMember[] {
  return (room.members || [])
    .filter((member): member is CanonicalRoomMember => Boolean(member && typeof member === 'object' && member.profile))
    .map(member => {
      const target = (member.target || {}) as { kind?: string }
      const remote = target.kind === 'peer'

      return {
        name: member.profile,
        handle: member.handle || member.profile,
        title: member.display_name || null,
        ...(member.display_name ? { display_name: member.display_name } : {}),
        targetProfile: member.profile,
        ...(remote ? { remoteSource: true } : { connectionId: binding.connectionId })
      }
    })
}

function memberById(members: GroupMember[], memberId: unknown): GroupMember | null {
  const id = text(memberId)

  return (id && members.find(member => member.name === id || member.targetProfile === id)) || null
}

/** The message's file manifest, bound to the event the files were committed under. */
function hostedAttachments(value: unknown, eventId: string | undefined): HostedAttachment[] {
  if (!Array.isArray(value)) {
    return []
  }

  const files: HostedAttachment[] = []

  for (const item of value) {
    const record = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>

    if (typeof record.attachment_id !== 'string' || typeof record.name !== 'string') {
      continue
    }

    files.push({
      attachment_id: record.attachment_id,
      event_id: eventId,
      kind: text(record.kind) || 'file',
      mime: text(record.mime) || 'application/octet-stream',
      name: record.name,
      ...(typeof record.size === 'number' ? { size: record.size } : {})
    })
  }

  return files
}

/** The log entry one durable room event becomes; null for events that are not
 *  messages (terminal turns and room status feed the activity list instead). */
export function canonicalEntryFromEvent(
  event: CanonicalRoomEvent,
  members: GroupMember[],
  traces: Record<string, GroupTurnTrace> = {}
): GroupMessage | null {
  const payload = event.payload || {}
  const attachments = hostedAttachments(payload.attachments, event.event_id)

  const base = {
    at: seconds(event.created_at),
    id: event.event_id || `seq:${event.seq}`,
    text: text(payload.text),
    thread: text(payload.thread_id) || 'legacy',
    ...(attachments.length ? { attachments } : {})
  }

  if (event.kind === 'message.user') {
    return { ...base, from: { kind: 'user', name: 'You' } }
  }

  if (event.kind === 'message.member') {
    const member = memberById(members, payload.member_id)
    const trace = traces[text(payload.turn_id)]

    return {
      ...base,
      from: { kind: 'member', name: member?.name || text(payload.member_id) || 'Bot' },
      ...(trace ? { trace } : {})
    }
  }

  return null
}

export interface CanonicalActivity {
  kind: GroupActivityKind
  member?: null | string
  reason?: string
  thread?: null | string
}

const TERMINAL_ACTIVITY: Record<string, GroupActivityKind> = {
  'turn.cancelled': 'cancelled',
  'turn.deferred': 'held',
  'turn.failed': 'failed'
}

/** The activity row a non-message event contributes, in the legacy feed's vocabulary. */
export function canonicalActivityFromEvent(
  event: CanonicalRoomEvent,
  members: GroupMember[]
): CanonicalActivity | null {
  const payload = event.payload || {}
  const member = memberById(members, payload.member_id)?.name || text(payload.member_id) || null
  const thread = text(payload.thread_id) || null

  if (event.kind === 'turn.settled') {
    return { kind: payload.passed === true ? 'passed' : 'replied', member, thread }
  }

  if (event.kind in TERMINAL_ACTIVITY) {
    const reason = text(payload.error) || text(payload.reason) || text(payload.reason_code)

    return { kind: TERMINAL_ACTIVITY[event.kind], member, thread, ...(reason ? { reason } : {}) }
  }

  if (event.kind === 'room.activity') {
    return { kind: payload.status === 'bounded' ? 'capped' : 'settled', member: null, thread }
  }

  if (event.kind === 'room.stop_requested') {
    return { kind: 'stopped', member: 'You', thread: null }
  }

  return null
}

function sessionsByMember(sessions: CanonicalMemberSession[] | null | undefined): Record<string, string> {
  const map: Record<string, string> = {}

  for (const session of sessions || []) {
    if (session?.session_id && session.member_id) {
      map[session.member_id] = session.session_id
    }
  }

  return map
}

/** The live record for one canonical room. Local-only preferences (picture,
 *  pin, order, section filing) are carried over from the previous projection. */
export function projectCanonicalRoom(sources: CanonicalRoomSources): GroupChatRoom {
  const { binding, room, previous, settings } = sources
  const members = canonicalRoomMembers(room, binding)
  const traces = sources.traces || {}
  const echoed = new Set<string>()
  const log: GroupMessage[] = []

  for (const event of sources.events) {
    const entry = canonicalEntryFromEvent(event, members, traces)

    if (entry) {
      log.push(entry)
      echoed.add(String(entry.id))
    }
  }

  for (const pending of sources.pending || []) {
    if (!echoed.has(String(pending.id))) {
      log.push(pending)
    }
  }

  const live = sources.live || null
  const turn = live ? memberById(members, live.member_id) : null

  return {
    canonical: { connectionId: binding.connectionId, profile: binding.profile, roomId: binding.roomId },
    displayName: room.name,
    roomId: room.room_id,
    log,
    members,
    watermarks: {},
    epoch: previous?.epoch || 0,
    running: sources.working || Boolean(live),
    turn,
    handle: settings?.handle ?? null,
    workspace: settings?.workspace ?? null,
    memberWorkspaces: { ...(settings?.member_workspaces || {}) },
    threadWorkspaces: { ...(settings?.thread_workspaces || {}) },
    holdDetection: settings?.hold_detection !== false,
    sessions: sessionsByMember(sources.sessions),
    image: previous?.image ?? null,
    pinned: previous?.pinned,
    rosterOrder: previous?.rosterOrder,
    sectionId: previous?.sectionId ?? null,
    tombstone: Boolean(room.disbanded_at)
  }
}
