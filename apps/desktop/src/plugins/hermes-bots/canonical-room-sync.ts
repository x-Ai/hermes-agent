/**
 * Keeps a canonical room's projection (`canonical-room-model.ts`) in the room
 * store: `groups.state` + `groups.log` (incremental), plus this fork's
 * `groups.settings.get` / `groups.member_sessions` / `groups.live` when the
 * gateway advertises them. While a window shows the room it also watches it
 * (`groups.watch`), so its members' activity frames arrive as `room.activity`
 * events and feed the live trace, the usage chips and the working line
 * (`canonical-room-live.ts`); a 2 s poll covers the durable log the way
 * upstream's skeleton view did. Discovery registers every room the gateway
 * lists so canonical rooms get roster rows like Desktop rooms.
 */

import { host } from '@hermes/plugin-sdk'
import { useEffect } from 'react'

import { $canonicalGroupBindings, registerCanonicalGroup } from './canonical-group-registry'
import {
  type CanonicalGroupBinding,
  canonicalGroupRequest,
  type CanonicalGroupRoute,
  type CanonicalRoom,
  captureCanonicalGroupRoute,
  discoverCanonicalGroups
} from './canonical-groups'
import {
  canonicalLiveTurn,
  canonicalTurnTraces,
  handleRoomActivity,
  noteCanonicalMemberReply,
  type RoomActivityFrame,
  stopCanonicalRoomLive
} from './canonical-room-live'
import {
  CANONICAL_USAGE_THREAD,
  canonicalActivityFromEvent,
  type CanonicalLiveTurn,
  type CanonicalMemberSession,
  type CanonicalRoomEvent,
  canonicalRoomMembers,
  type CanonicalRoomSettings,
  projectCanonicalRoom
} from './canonical-room-model'
import { canonicalRoomPrefs, forgetCanonicalRoomPrefs, loadCanonicalRoomPrefs } from './canonical-room-prefs'
import { dropCanonicalPrompts, mirrorCanonicalPendingActions } from './canonical-room-prompts'
import { recordGroupActivity } from './group-activity'
import { $groupChats, type GroupChatRoom, updateGroupChat } from './group-chat'
import { noteGroupSessionRuntime } from './group-context-usage'
import type { GroupMessage } from './types'

export const CANONICAL_POLL_MS = 2000
const EVENTS_RETAINED = 600

interface RoomSyncState {
  activitySeq: number
  binding: CanonicalGroupBinding
  events: CanonicalRoomEvent[]
  latestSeq: number
  live: CanonicalLiveTurn | null
  pending: Map<string, GroupMessage>
  room: CanonicalRoom | null
  sessions: CanonicalMemberSession[] | null
  settings: CanonicalRoomSettings | null
  syncing: null | Promise<void>
  timer: null | ReturnType<typeof setTimeout>
  viewers: number
  watching: boolean
  working: boolean
}

const rooms = new Map<string, RoomSyncState>()
const featureCache = new Map<string, Promise<Set<string>>>()
let activityTap: (() => void) | null = null

function routeKey(route: CanonicalGroupRoute): string {
  return `${route.connectionId}::${route.profile}`
}

/** What the room's gateway advertises in `groups.capabilities.features`, once per route. */
export function canonicalRouteFeatures(route: CanonicalGroupRoute): Promise<Set<string>> {
  const key = routeKey(route)
  let cached = featureCache.get(key)

  if (!cached) {
    cached = canonicalGroupRequest<{ features?: unknown }>(route, 'groups.capabilities')
      .then(answer => new Set(Array.isArray(answer?.features) ? answer.features.map(String) : []))
      .catch(error => {
        featureCache.delete(key)
        throw error
      })
    featureCache.set(key, cached)
  }

  return cached
}

export function forgetCanonicalRouteFeatures(route?: CanonicalGroupRoute): void {
  if (route) {
    featureCache.delete(routeKey(route))
  } else {
    featureCache.clear()
  }
}

function ensure(key: string, binding: CanonicalGroupBinding): RoomSyncState {
  let state = rooms.get(key)

  if (!state) {
    state = {
      activitySeq: 0,
      binding,
      events: [],
      latestSeq: 0,
      live: null,
      pending: new Map(),
      room: null,
      sessions: null,
      settings: null,
      syncing: null,
      timer: null,
      viewers: 0,
      watching: false,
      working: false
    }
    rooms.set(key, state)
  }

  return state
}

export function canonicalBindingFor(group: string): CanonicalGroupBinding | undefined {
  return $canonicalGroupBindings.get()[group]
}

/** A room projected for the first time this window starts from the row preferences stored for it. */
function seededPrevious(key: string): GroupChatRoom | null {
  const stored = canonicalRoomPrefs(key)

  return stored ? { epoch: 0, log: [], running: false, watermarks: {}, ...stored } : null
}

/** Publish the projection from what this module holds for `key`. */
export function publishCanonicalRoom(key: string): void {
  const state = rooms.get(key)

  if (!state?.room) {
    return
  }

  const previous = $groupChats.get()[key] || seededPrevious(key)
  const liveFromFrames = canonicalLiveTurn(key)

  const live =
    state.live ||
    (liveFromFrames
      ? {
          member_id: liveFromFrames.member.name,
          status: 'running',
          task_id: '',
          thread_id: liveFromFrames.thread,
          turn_id: ''
        }
      : null)

  const projection = projectCanonicalRoom({
    binding: state.binding,
    events: state.events,
    live,
    pending: [...state.pending.values()],
    previous,
    room: state.room,
    sessions: state.sessions,
    settings: state.settings,
    traces: canonicalTurnTraces(key),
    working: state.working
  })

  updateGroupChat(key, () => projection, { sync: false })

  // Usage rows resolve by runtime id: index each member's hidden session once it is known.
  for (const session of state.sessions || []) {
    const member = projection.members?.find(m => m.name === session.member_id)

    if (member && session.session_id) {
      noteGroupSessionRuntime(key, CANONICAL_USAGE_THREAD, member, session.session_id)
    }
  }
}

export function notePendingCanonicalSend(key: string, entry: GroupMessage): void {
  const state = rooms.get(key)

  if (state && entry.id) {
    state.pending.set(String(entry.id), entry)
    publishCanonicalRoom(key)
  }
}

/** The gateway named the durable event of a pending send: key the optimistic entry by it, so the
 *  echo retires it (`hosted_rooms.user_event_id` derives the stored id from the client's). */
export function rekeyPendingCanonicalSend(key: string, from: string, to: string): void {
  const state = rooms.get(key)
  const entry = state?.pending.get(from)

  if (!state || !entry || from === to) {
    return
  }

  state.pending.delete(from)
  state.pending.set(to, { ...entry, id: to })
  publishCanonicalRoom(key)
}

export function dropPendingCanonicalSend(key: string, id: string): void {
  const state = rooms.get(key)

  if (state?.pending.delete(id)) {
    publishCanonicalRoom(key)
  }
}

async function readLog(state: RoomSyncState, since: number): Promise<CanonicalRoomEvent[]> {
  const events: CanonicalRoomEvent[] = []
  let cursor = since

  for (;;) {
    const page = await canonicalGroupRequest<{ events: CanonicalRoomEvent[]; has_more?: boolean }>(
      state.binding,
      'groups.log',
      { limit: 100, room_id: state.binding.roomId, since_seq: cursor }
    )

    const fresh = (page.events || []).filter(event => Number(event?.seq) > cursor)
    events.push(...fresh)

    if (!page.has_more || !fresh.length) {
      break
    }

    cursor = Number(fresh[fresh.length - 1].seq)
  }

  return events
}

function recordNewActivity(key: string, state: RoomSyncState, fresh: CanonicalRoomEvent[]): void {
  if (!state.room) {
    return
  }

  const members = canonicalRoomMembers(state.room, state.binding)

  for (const event of fresh) {
    if (Number(event.seq) <= state.activitySeq) {
      continue
    }

    if (event.kind === 'message.member') {
      const payload = event.payload || {}
      const member = members.find(m => m.name === String(payload.member_id || ''))

      if (member) {
        noteCanonicalMemberReply(key, member, typeof payload.turn_id === 'string' ? payload.turn_id : null)
      }
    }

    const activity = canonicalActivityFromEvent(event, members)

    if (activity) {
      recordGroupActivity(key, activity)
    }
  }

  state.activitySeq = Math.max(state.activitySeq, ...fresh.map(event => Number(event.seq) || 0))
}

async function syncOnce(key: string, state: RoomSyncState, full: boolean): Promise<void> {
  const { binding } = state
  const features = await canonicalRouteFeatures(binding).catch(() => new Set<string>())

  const snapshot = await canonicalGroupRequest<{
    driver_status?: { pending_actions?: unknown[]; working?: boolean }
    room: CanonicalRoom
  }>(binding, 'groups.state', { room_id: binding.roomId })

  const since = full ? 0 : state.latestSeq
  const fresh = await readLog(state, since)
  state.room = snapshot.room
  state.working = Boolean(snapshot.driver_status?.working)
  mirrorCanonicalPendingActions(
    key,
    canonicalRoomMembers(snapshot.room, binding),
    snapshot.driver_status?.pending_actions
  )
  state.events = full ? fresh : [...state.events, ...fresh]

  if (state.events.length > EVENTS_RETAINED) {
    state.events = state.events.slice(state.events.length - EVENTS_RETAINED)
  }

  state.latestSeq = Math.max(state.latestSeq, ...fresh.map(event => Number(event.seq) || 0))

  for (const event of fresh) {
    if (event.event_id) {
      state.pending.delete(event.event_id)
    }
  }

  const params = { room_id: binding.roomId }

  const [settings, sessions, live] = await Promise.all([
    features.has('room_settings')
      ? canonicalGroupRequest<{ settings: CanonicalRoomSettings }>(binding, 'groups.settings.get', params).then(
          a => a.settings
        )
      : Promise.resolve(state.settings),
    features.has('member_sessions')
      ? canonicalGroupRequest<{ sessions: CanonicalMemberSession[] }>(binding, 'groups.member_sessions', params).then(
          a => a.sessions
        )
      : Promise.resolve(state.sessions),
    features.has('room_live')
      ? canonicalGroupRequest<{ current: CanonicalLiveTurn | null }>(binding, 'groups.live', params).then(
          a => a.current
        )
      : Promise.resolve(state.live)
  ])

  state.settings = settings
  state.sessions = sessions
  state.live = live
  // The activity list must see a room record: publish, then record what the new events say.
  publishCanonicalRoom(key)
  recordNewActivity(key, state, fresh)
}

/** Refresh one room; concurrent callers share the in-flight read. */
export function syncCanonicalRoom(
  key: string,
  binding: CanonicalGroupBinding,
  options: { full?: boolean } = {}
): Promise<void> {
  const state = ensure(key, binding)

  if (!state.syncing) {
    state.syncing = syncOnce(key, state, Boolean(options.full) || state.room === null).finally(() => {
      state.syncing = null
    })
  }

  return state.syncing
}

function onRoomActivity(frame: { payload?: unknown }): void {
  const payload = frame?.payload as RoomActivityFrame | undefined

  if (!payload || typeof payload !== 'object' || !payload.room_id) {
    return
  }

  for (const [key, state] of rooms) {
    if (state.binding.roomId !== payload.room_id || !state.room) {
      continue
    }

    const members = canonicalRoomMembers(state.room, state.binding)
    handleRoomActivity(key, members, payload, {
      onTurnComplete: () => {
        publishCanonicalRoom(key)
        void syncCanonicalRoom(key, state.binding).catch(() => undefined)
      },
      onTurnStarted: () => publishCanonicalRoom(key)
    })
  }
}

function ensureActivityTap(): void {
  if (activityTap || typeof host.onEvent !== 'function') {
    return
  }

  try {
    activityTap = host.onEvent('room.activity', onRoomActivity)
  } catch {
    activityTap = null
  }
}

async function setWatch(state: RoomSyncState, on: boolean): Promise<void> {
  const features = await canonicalRouteFeatures(state.binding).catch(() => new Set<string>())

  if (!features.has('activity_watch')) {
    return
  }

  await canonicalGroupRequest(state.binding, 'groups.watch', { on, room_id: state.binding.roomId })
  state.watching = on
}

/** A window is showing the room: watch it and poll its log; returns the stop. */
export function startCanonicalRoomViewer(key: string, binding: CanonicalGroupBinding): () => void {
  const state = ensure(key, binding)
  state.viewers += 1

  if (state.viewers === 1) {
    ensureActivityTap()
    void setWatch(state, true).catch(() => undefined)

    const poll = async () => {
      await syncCanonicalRoom(key, binding).catch(() => undefined)

      if (state.viewers > 0) {
        state.timer = setTimeout(() => void poll(), CANONICAL_POLL_MS)
      }
    }

    void poll()
  }

  return () => {
    state.viewers = Math.max(0, state.viewers - 1)

    if (state.viewers === 0) {
      if (state.timer) {
        clearTimeout(state.timer)
        state.timer = null
      }

      void setWatch(state, false).catch(() => undefined)
      stopCanonicalRoomLive(key)
    }
  }
}

/** The room view's hook: no-op for a Desktop room (no binding). */
export function useCanonicalRoomSync(
  group: string,
  binding: CanonicalGroupBinding | undefined,
  visible: boolean
): void {
  const roomId = binding?.roomId

  useEffect(() => {
    if (!binding || !roomId || !visible) {
      return undefined
    }

    return startCanonicalRoomViewer(group, binding)
    // The binding is frozen per room id; re-subscribing on every object identity would churn the watch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, roomId, visible])
}

/** Register and project every room the route's gateway lists, so they appear in the roster. */
export async function discoverCanonicalRooms(route: CanonicalGroupRoute): Promise<string[]> {
  const { rooms: listed } = await discoverCanonicalGroups(route)
  const keys: string[] = []

  for (const room of listed) {
    const key = registerCanonicalGroup(route, room)
    keys.push(key)
    await syncCanonicalRoom(key, { ...route, roomId: room.room_id }).catch(() => undefined)
  }

  return keys
}

/** Discovery for the window's active connection + profile; silent without a route or on an older gateway. */
export async function discoverActiveCanonicalRooms(): Promise<void> {
  let route: CanonicalGroupRoute

  try {
    route = captureCanonicalGroupRoute()
  } catch {
    return
  }

  await discoverCanonicalRooms(route).catch(() => undefined)
}

/** Plugin activation: load the stored row preferences and apply them to rooms projected before they arrived. */
export function hydrateCanonicalRoomPrefs(value: unknown): void {
  for (const key of loadCanonicalRoomPrefs(value)) {
    const stored = canonicalRoomPrefs(key)

    if (!stored || !$groupChats.get()[key]?.canonical) {
      continue
    }

    updateGroupChat(
      key,
      room => ({
        ...room,
        image: room.image || stored.image || null,
        pinned: room.pinned ?? stored.pinned,
        rosterOrder: room.rosterOrder ?? stored.rosterOrder,
        sectionId: room.sectionId || stored.sectionId || null
      }),
      { sync: false }
    )
  }
}

/** Drop a room's projection and sync state (disband, or the gateway no longer lists it). */
export function forgetCanonicalRoom(key: string): void {
  const state = rooms.get(key)

  if (state?.timer) {
    clearTimeout(state.timer)
  }

  stopCanonicalRoomLive(key)
  forgetCanonicalRoomPrefs(key)
  dropCanonicalPrompts(key)
  rooms.delete(key)
  const { [key]: _room, ...rest } = $groupChats.get()
  $groupChats.set(rest)
  const { [key]: _binding, ...bindings } = $canonicalGroupBindings.get()
  $canonicalGroupBindings.set(bindings)
}

export function _resetCanonicalRoomSyncForTests(): void {
  for (const key of [...rooms.keys()]) {
    forgetCanonicalRoom(key)
  }

  featureCache.clear()
  activityTap?.()
  activityTap = null
}
