/**
 * The room mutations of a canonical room, routed to its gateway: send (an
 * optimistic user entry, then `groups.send`), stop, rename, this fork's room
 * settings, disband, and creation with those settings. The engine
 * (`group-rounds.ts`) and the room view branch here when a room record carries
 * `canonical`; everything they return keeps the legacy contract.
 */

import { host } from '@hermes/plugin-sdk'

import { registerCanonicalGroup } from './canonical-group-registry'
import { canonicalGroupRequest, type CanonicalGroupRoute, createCanonicalGroup } from './canonical-groups'
import type { CanonicalRoomSettings } from './canonical-room-model'
import {
  canonicalRouteFeatures,
  dropPendingCanonicalSend,
  forgetCanonicalRoom,
  notePendingCanonicalSend,
  syncCanonicalRoom
} from './canonical-room-sync'
import { recordGroupActivity } from './group-activity'
import { groupChatDisplayName, type GroupChatRoom } from './group-chat'
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
 *  the entry again with a notice. Attachments are refused: the in-process member
 *  route cannot carry files yet (`HostedRoomServerRPC.accepts_attachments`). */
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

  if (images.length) {
    fail(botsText().group.routedAttachmentsBlocked(groupChatDisplayName(group, room)))

    return null
  }

  if (!trimmed) {
    return null
  }

  const target = thread || crypto.randomUUID()
  const eventId = crypto.randomUUID()
  notePendingCanonicalSend(group, {
    at: Date.now(),
    from: { kind: 'user', name: 'You' },
    id: eventId,
    text: trimmed,
    thread: target
  })
  recordGroupActivity(group, { kind: 'queued', member: 'You', thread: target })

  void (async () => {
    const workspace = options.workspace ? String(options.workspace).trim() : ''

    if (workspace && (await canonicalRouteFeatures(binding)).has('room_settings')) {
      await canonicalGroupRequest(binding, 'groups.settings.set', {
        patch: { thread_workspaces: { [target]: workspace } },
        room_id: binding.roomId
      })
    }

    await canonicalGroupRequest(binding, 'groups.send', {
      event_id: eventId,
      payload: { text: trimmed, thread_id: target },
      room_id: binding.roomId
    })
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
    await canonicalGroupRequest(binding, 'groups.stop', { cancel_id: crypto.randomUUID(), room_id: binding.roomId })
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
      event_id: crypto.randomUUID(),
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
    await canonicalGroupRequest(binding, 'groups.disband', { cancel_id: crypto.randomUUID(), room_id: binding.roomId })
    forgetCanonicalRoom(group)

    return true
  } catch (error) {
    fail(botsText().group.canonicalActionFailed(error instanceof Error ? error.message : String(error)))

    return false
  }
}

/** Whether New group chat can create a gateway-hosted room for these members on this route. */
export async function canCreateCanonicalRoom(route: CanonicalGroupRoute, members: RosterRow[]): Promise<boolean> {
  if (
    members.length < 2 ||
    members.some(member => member.remoteSource || (member.connectionId && member.connectionId !== route.connectionId))
  ) {
    return false
  }

  const features = await canonicalRouteFeatures(route).catch(() => new Set<string>())

  return features.has('room_settings')
}

/** Create the room on the gateway, apply the dialog's handle / folder, register and project it. */
export async function createCanonicalRoomWithSettings(
  route: CanonicalGroupRoute,
  name: string,
  members: RosterRow[],
  settings: Pick<CanonicalRoomSettings, 'handle' | 'workspace'>
): Promise<string> {
  const { binding, room } = await createCanonicalGroup(route, name, members as GroupMember[])
  const key = registerCanonicalGroup(route, room)
  const patch: CanonicalRoomSettingsPatch = {}

  if (settings.handle) {
    patch.handle = settings.handle
  }

  if (settings.workspace) {
    patch.workspace = settings.workspace
  }

  if (Object.keys(patch).length) {
    await canonicalGroupRequest(binding, 'groups.settings.set', { patch, room_id: binding.roomId })
  }

  await syncCanonicalRoom(key, binding, { full: true })

  return key
}
