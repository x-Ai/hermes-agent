/**
 * The room mutations of a canonical room, routed to its gateway: send (an
 * optimistic user entry, then `groups.send`), stop, Continue at the discussion
 * cap, rename, the room's purpose / notes / routing (`groups.context`), this
 * fork's room settings, disband, and creation with those settings. The engine
 * (`group-rounds.ts`) and the room view branch here when a room record carries
 * `canonical`; everything they return keeps the legacy contract.
 */

import { host, randomUuid } from '@hermes/plugin-sdk'

import { registerCanonicalGroup } from './canonical-group-registry'
import {
  type CanonicalGroupBinding,
  canonicalGroupRequest,
  type CanonicalGroupRoute,
  type CanonicalRoomContext,
  createCanonicalGroup,
  disbandCanonicalGroup,
  type GroupCreationIntent
} from './canonical-groups'
import { ROOM_ATTACHMENTS_FEATURE, uploadCanonicalAttachments } from './canonical-room-attachments'
import {
  canonicalRouteFeatures,
  dropPendingCanonicalSend,
  forgetCanonicalRoom,
  notePendingCanonicalSend,
  rekeyPendingCanonicalSend,
  syncCanonicalRoom
} from './canonical-room-sync'
import { recordGroupActivity } from './group-activity'
import { $groupChatWorkspace, groupChatDisplayName, type GroupChatRoom } from './group-chat'
import { groupMemberKey } from './group-membership'
import { normalizeGroupWorkspacePath, sameGroupWorkspace } from './group-workspace'
import { botsText } from './i18n'
import type { Attachment, GroupMember, RosterRow } from './types'

export interface CanonicalSendOptions {
  /** Pin the (new) thread to this folder before the first member turn runs in it. */
  workspace?: null | string
}

export interface CanonicalRoomSettingsPatch {
  handle?: null | string
  hold_detection?: boolean
  member_workspaces?: Record<string, null | string>
  thread_workspaces?: Record<string, null | string>
  workspace?: null | string
}

function canonicalOf(room: GroupChatRoom) {
  const binding = room.canonical

  if (!binding) {
    throw new Error('not a canonical room')
  }

  return binding
}

function fail(message: string): void {
  host.notify({ kind: 'error', message })
}

/** A refused room action, in the gateway's own words. */
function failAction(error: unknown): void {
  fail(botsText().group.canonicalActionFailed(error instanceof Error ? error.message : String(error)))
}

/** A user send into a canonical room. Returns the thread id at once (the entry
 *  shows optimistically); the gateway call runs behind it and a refusal removes
 *  the entry again with a notice. Attachments are uploaded to the room first and
 *  bound to the message (`canonical-room-attachments.ts`); a room with a member
 *  on another machine refuses them up front, since the peer route carries text
 *  only and the driver would settle that member's turn as a proven failure. */
export function sendToCanonicalRoom(
  group: string,
  room: GroupChatRoom,
  text: string,
  thread: null | string | undefined,
  images: Attachment[],
  options: CanonicalSendOptions = {}
): null | string {
  const binding = canonicalOf(room)
  const trimmed = String(text || '').trim()
  const name = groupChatDisplayName(group, room)

  if (!trimmed && !images.length) {
    return null
  }

  if (images.length && (room.members || []).some(member => member.remoteSource)) {
    fail(botsText().group.canonicalAttachmentsUnsupported(name))

    return null
  }

  const target = thread || randomUuid()
  const eventId = randomUuid()
  notePendingCanonicalSend(group, {
    at: Date.now(),
    from: { kind: 'user', name: 'You' },
    id: eventId,
    text: trimmed,
    thread: target,
    ...(images.length ? { images } : {})
  })
  recordGroupActivity(group, { kind: 'queued', member: 'You', thread: target })

  void (async () => {
    const features = await canonicalRouteFeatures(binding)
    const workspace = options.workspace ? String(options.workspace).trim() : ''

    if (workspace && features.has('room_settings')) {
      await canonicalGroupRequest(binding, 'groups.settings.set', {
        patch: { thread_workspaces: { [target]: workspace } },
        room_id: binding.roomId
      })
    }

    const payload: Record<string, unknown> = { text: trimmed, thread_id: target }

    if (images.length) {
      if (!features.has(ROOM_ATTACHMENTS_FEATURE)) {
        throw new Error(botsText().group.canonicalAttachmentsUnsupported(name))
      }

      payload.attachments = await uploadCanonicalAttachments(binding, images)
    }

    const sent = await canonicalGroupRequest<{ event?: { event_id?: string } }>(binding, 'groups.send', {
      event_id: eventId,
      payload,
      room_id: binding.roomId
    })

    if (sent?.event?.event_id) {
      rekeyPendingCanonicalSend(group, eventId, sent.event.event_id)
    }

    await syncCanonicalRoom(group, binding)
  })().catch((error: unknown) => {
    dropPendingCanonicalSend(group, eventId)
    fail(botsText().group.canonicalSendFailed(error instanceof Error ? error.message : String(error)))
  })

  return target
}

export async function stopCanonicalRoom(group: string, room: GroupChatRoom, thread: null | string): Promise<void> {
  const binding = canonicalOf(room)

  try {
    await canonicalGroupRequest(binding, 'groups.stop', { cancel_id: randomUuid(), room_id: binding.roomId })
    recordGroupActivity(group, { kind: 'stopped', member: 'You', thread })
    await syncCanonicalRoom(group, binding)
  } catch (error) {
    failAction(error)
  }
}

/** Continue on a discussion paused at its cap (`groups.continue`): one more budget of rounds and messages.
 *  False when the gateway refused it (the pause moved on meanwhile, or every Continue is used). */
export async function continueCanonicalRoom(
  group: string,
  room: GroupChatRoom,
  discussionEventId: string
): Promise<boolean> {
  const binding = canonicalOf(room)

  try {
    await canonicalGroupRequest(binding, 'groups.continue', {
      discussion_event_id: discussionEventId,
      room_id: binding.roomId
    })
  } catch (error) {
    failAction(error)

    return false
  }

  // Granted: the next poll brings `room.continued` if this read fails, and a Continue retried
  // because of a failed read would be refused as no longer paused.
  await syncCanonicalRoom(group, binding).catch(() => undefined)

  return true
}

/** Rename on the gateway; the record keeps its key, only `displayName` moves. */
export async function renameCanonicalRoom(group: string, room: GroupChatRoom, name: string): Promise<boolean> {
  const binding = canonicalOf(room)

  const next = String(name || '')
    .trim()
    .slice(0, 64)

  if (!next || next === groupChatDisplayName(group, room)) {
    return true
  }

  try {
    await canonicalGroupRequest(binding, 'groups.rename', {
      event_id: randomUuid(),
      name: next,
      room_id: binding.roomId
    })
    await syncCanonicalRoom(group, binding)

    return true
  } catch (error) {
    failAction(error)

    return false
  }
}

/** Room settings as the gateway stores them (`hosted_room_context.validate_context`): a lead only on lead routing. */
function normalizedContext(context: CanonicalRoomContext): CanonicalRoomContext {
  return {
    purpose: context.purpose.split(/\s+/).filter(Boolean).join(' '),
    notes: context.notes.trim(),
    ...(context.routing && {
      routing: context.routing,
      lead_member_id: context.routing === 'lead' ? (context.lead_member_id || '').trim() : ''
    })
  }
}

const sameContext = (a: CanonicalRoomContext, b: CanonicalRoomContext) =>
  JSON.stringify(normalizedContext(a)) === JSON.stringify(normalizedContext(b))

/** A settings dialog's edit of the room's purpose, notes and routing: what it opened with, and what it holds now. */
export interface CanonicalContextEdit {
  base: CanonicalRoomContext
  draft: CanonicalRoomContext
}

const routingOf = ({ lead_member_id: lead, routing }: CanonicalRoomContext) =>
  routing ? { routing, lead_member_id: lead ?? '' } : {}

/** The edit over the room's latest settings: a field left as the dialog opened keeps the room's current
 *  value, so a change another client made meanwhile is not written back over. */
function editedContext({ base, draft }: CanonicalContextEdit, current: CanonicalRoomContext): CanonicalRoomContext {
  const rerouted =
    (draft.routing ?? '') !== (base.routing ?? '') || (draft.lead_member_id ?? '') !== (base.lead_member_id ?? '')

  return {
    purpose: draft.purpose === base.purpose ? current.purpose : draft.purpose,
    notes: draft.notes === base.notes ? current.notes : draft.notes,
    ...routingOf(rerouted ? draft : current)
  }
}

/** Save the room's purpose, notes and routing (`groups.context`) when the edit changes them. Routing rides
 *  along only when the runtime reported it; without it the gateway keeps the room's own. False when the
 *  gateway refused, so the dialog keeps the draft for another try. */
export async function setCanonicalRoomContext(
  group: string,
  room: GroupChatRoom,
  edit: CanonicalContextEdit
): Promise<boolean> {
  const binding = canonicalOf(room)
  const current = room.hosted?.context
  const next = current ? editedContext(edit, current) : edit.draft

  if (current && sameContext(next, current)) {
    return true
  }

  try {
    await canonicalGroupRequest(binding, 'groups.context', {
      event_id: randomUuid(),
      room_id: binding.roomId,
      ...normalizedContext(next)
    })
    await syncCanonicalRoom(group, binding)

    return true
  } catch (error) {
    failAction(error)

    return false
  }
}

export async function setCanonicalRoomSettings(
  group: string,
  room: GroupChatRoom,
  patch: CanonicalRoomSettingsPatch
): Promise<boolean> {
  const binding = canonicalOf(room)

  if (!Object.keys(patch).length) {
    return true
  }

  try {
    await canonicalGroupRequest(binding, 'groups.settings.set', { patch, room_id: binding.roomId })
    await syncCanonicalRoom(group, binding)

    return true
  } catch (error) {
    failAction(error)

    return false
  }
}

export interface CanonicalSettingsDraft {
  /** Purpose, notes and routing; null when the gateway does not offer them (`groups.context`). */
  context?: CanonicalContextEdit | null
  handle: null | string
  holdDetection: boolean
  /** Member folders as the dialog's draft holds them, keyed by member key (= member id). */
  memberWorkspaces: Record<string, string>
  members: GroupMember[]
  name: string
  workspace: string
}

/** The settings dialog's Save for a hosted room: rename, then one settings patch holding only what
 *  changed (handle, hold switch, room folder, member folders), then purpose / notes / routing when
 *  they changed. False when the gateway refused. */
export async function saveCanonicalRoomSettings(
  group: string,
  room: GroupChatRoom,
  draft: CanonicalSettingsDraft
): Promise<boolean> {
  if (!(await renameCanonicalRoom(group, room, draft.name))) {
    return false
  }

  const patch: CanonicalRoomSettingsPatch = {}

  if (draft.holdDetection !== (room.holdDetection !== false)) {
    patch.hold_detection = draft.holdDetection
  }

  if ((draft.handle || '') !== (room.handle || '')) {
    patch.handle = draft.handle || null
  }

  if (!sameGroupWorkspace(draft.workspace, room.workspace || '')) {
    patch.workspace = normalizeGroupWorkspacePath(draft.workspace) || null
  }

  const folders: Record<string, null | string> = {}

  for (const member of draft.members) {
    const key = groupMemberKey(member)

    if (!sameGroupWorkspace(draft.memberWorkspaces[key], (room.memberWorkspaces || {})[key])) {
      folders[key] = normalizeGroupWorkspacePath(draft.memberWorkspaces[key]) || null
    }
  }

  if (Object.keys(folders).length) {
    patch.member_workspaces = folders
  }

  if (!(await setCanonicalRoomSettings(group, room, patch))) {
    return false
  }

  return draft.context ? setCanonicalRoomContext(group, room, draft.context) : true
}

/** Disband a hosted room. Only the gateway's matching tombstone proves the room ended
 *  (upstream's disbandCanonicalGroup): a refusal or an unconfirmed answer keeps the room, its
 *  record and the open pane, and rejects with the reader's-language reason, so the confirm
 *  dialog stays open and says why. */
export async function disbandCanonicalRoom(group: string, room: GroupChatRoom): Promise<boolean> {
  const binding = canonicalOf(room)
  const labels = botsText().canonical

  if (!(await disbandCanonicalGroup(binding, labels))) {
    throw new Error(labels.disbandUnconfirmed)
  }

  forgetCanonicalRoom(group)

  // This fork renders a hosted room through the legacy view, not upstream's
  // CanonicalGroupWorkspace, so no onBack fires to leave the open room: a
  // disbanded room would keep the pane pointed at a record that no longer exists.
  if ($groupChatWorkspace.get() === group) {
    $groupChatWorkspace.set(null)
  }

  return true
}

/** Whether New group chat can create a gateway-hosted room for these members on this route. */
export async function canCreateCanonicalRoom(
  route: CanonicalGroupRoute,
  members: Array<Pick<RosterRow, 'connectionId' | 'name' | 'remoteSource'>>
): Promise<boolean> {
  if (
    members.length < 2 ||
    members.some(member => member.remoteSource || (member.connectionId && member.connectionId !== route.connectionId))
  ) {
    return false
  }

  const features = await canonicalRouteFeatures(route).catch(() => new Set<string>())

  return features.has('room_settings')
}

/** What a settings draft asks beyond a fresh room's defaults; empty when nothing. */
function creationPatch(settings: CanonicalRoomSettingsPatch): CanonicalRoomSettingsPatch {
  const patch: CanonicalRoomSettingsPatch = {}

  if (settings.handle) {
    patch.handle = settings.handle
  }

  if (settings.workspace) {
    patch.workspace = settings.workspace
  }

  if (settings.hold_detection === false) {
    patch.hold_detection = false
  }

  const folders = Object.entries(settings.member_workspaces || {}).filter(([, path]) => path)

  if (folders.length) {
    patch.member_workspaces = Object.fromEntries(folders)
  }

  return patch
}

/** Apply a creation draft's settings to a room its gateway just created; nothing beyond a fresh
 *  room's defaults sends nothing. */
export async function applyCanonicalCreationSettings(
  binding: CanonicalGroupBinding,
  settings: CanonicalRoomSettingsPatch
): Promise<void> {
  const patch = creationPatch(settings)

  if (Object.keys(patch).length) {
    await canonicalGroupRequest(binding, 'groups.settings.set', { patch, room_id: binding.roomId })
  }
}

/** Create the room on the gateway, apply the draft's settings, register and project it. `intent`
 *  is the asking surface's own creation intent: while a reply is lost it keeps the exact request
 *  (same room id), so trying again opens the room the first attempt may have made. The request is
 *  keyed on `name` as entered; `sentName` turns it into the name sent, once per request (New group
 *  chat fills a blank one from the bots' names). */
export async function createCanonicalRoomWithSettings(
  route: CanonicalGroupRoute,
  name: string,
  members: GroupMember[] | RosterRow[],
  settings: CanonicalRoomSettingsPatch,
  intent: GroupCreationIntent = {},
  sentName?: (name: string) => string
): Promise<string> {
  const { binding, room } = await createCanonicalGroup(route, name, members as GroupMember[], intent, sentName)
  const key = registerCanonicalGroup(route, room)
  await applyCanonicalCreationSettings(binding, settings)
  await syncCanonicalRoom(key, binding, { full: true })

  return key
}
