/**
 * The room mutations of a canonical room, routed to its gateway: send (an
 * optimistic user entry, then `groups.send`), stop, rename, this fork's room
 * settings, disband, and creation with those settings. The engine
 * (`group-rounds.ts`) and the room view branch here when a room record carries
 * `canonical`; everything they return keeps the legacy contract.
 */

import { host, randomUuid } from '@hermes/plugin-sdk'

import { registerCanonicalGroup } from './canonical-group-registry'
import { canonicalGroupRequest, type CanonicalGroupRoute, createCanonicalGroup } from './canonical-groups'
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
    fail(botsText().group.canonicalActionFailed(error instanceof Error ? error.message : String(error)))
  }
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
    fail(botsText().group.canonicalActionFailed(error instanceof Error ? error.message : String(error)))

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
    fail(botsText().group.canonicalActionFailed(error instanceof Error ? error.message : String(error)))

    return false
  }
}

export interface CanonicalSettingsDraft {
  handle: null | string
  holdDetection: boolean
  /** Member folders as the dialog's draft holds them, keyed by member key (= member id). */
  memberWorkspaces: Record<string, string>
  members: GroupMember[]
  name: string
  workspace: string
}

/** The settings dialog's Save for a hosted room: rename, then one settings patch holding only what
 *  changed (handle, hold switch, room folder, member folders). False when the gateway refused. */
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

  return setCanonicalRoomSettings(group, room, patch)
}

export async function disbandCanonicalRoom(group: string, room: GroupChatRoom): Promise<boolean> {
  const binding = canonicalOf(room)

  try {
    await canonicalGroupRequest(binding, 'groups.disband', { cancel_id: randomUuid(), room_id: binding.roomId })
    forgetCanonicalRoom(group)

    // This fork renders a hosted room through the legacy view, not upstream's
    // CanonicalGroupWorkspace, so no onBack fires to leave the open room: a
    // disbanded room would keep the pane pointed at a record that no longer exists.
    if ($groupChatWorkspace.get() === group) {
      $groupChatWorkspace.set(null)
    }

    return true
  } catch (error) {
    fail(botsText().group.canonicalActionFailed(error instanceof Error ? error.message : String(error)))

    return false
  }
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

/** Create the room on the gateway, apply the draft's settings, register and project it. */
export async function createCanonicalRoomWithSettings(
  route: CanonicalGroupRoute,
  name: string,
  members: GroupMember[] | RosterRow[],
  settings: CanonicalRoomSettingsPatch
): Promise<string> {
  const { binding, room } = await createCanonicalGroup(route, name, members as GroupMember[])
  const key = registerCanonicalGroup(route, room)
  const patch = creationPatch(settings)

  if (Object.keys(patch).length) {
    await canonicalGroupRequest(binding, 'groups.settings.set', { patch, room_id: binding.roomId })
  }

  await syncCanonicalRoom(key, binding, { full: true })

  return key
}
