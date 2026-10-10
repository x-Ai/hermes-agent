/**
 * Pure helpers for carrying a room's explicit `@handle` through the durable
 * record and the gateway `ui_meta` mirror (`group-chat.ts`). Import-free of
 * the room store, like `group-workspace-sync.ts`, so the projection builder
 * and the pull merge can use them without a module cycle. What a handle IS
 * and how a missing one is derived from the room name lives in
 * `group-handle.ts`; here the field is just a bounded string or null.
 *
 * The projection always names `handle` (null when unset): clearing it on one
 * Desktop must reach the others, and a mirror written by an older build
 * simply lacks the key, which the merge reads as "nothing to adopt".
 */

import type { GroupChat } from './types'

export const GROUP_HANDLE_MAX = 64

type GroupHandleField = Pick<GroupChat, 'handle'>

/** The stored form of a room's explicit handle: trimmed, lowercased, bounded;
 *  null when blank. Validity is the reader's business (`groupMentionHandle`
 *  falls back to the derived handle for anything that fails the grammar). */
export function durableGroupHandle(room: GroupHandleField | null | undefined): null | string {
  const raw = typeof room?.handle === 'string' ? room.handle.trim().toLowerCase().slice(0, GROUP_HANDLE_MAX) : ''

  return raw || null
}

/** The compact mirror's view of the handle. */
export function groupHandleProjection(room: GroupHandleField | null | undefined): { handle: null | string } {
  return { handle: durableGroupHandle(room) }
}

/** Fold a mirrored room's handle into the local record under the same
 *  `adoptRemote` verdict the picture and the folders use. */
export function mergeGroupHandleField(
  existing: GroupHandleField | null | undefined,
  projected: Partial<GroupHandleField> | null | undefined,
  { adoptRemote }: { adoptRemote: boolean }
): { handle: null | string } {
  const has = Boolean(projected) && Object.prototype.hasOwnProperty.call(projected, 'handle')

  return { handle: adoptRemote && has ? durableGroupHandle(projected) : durableGroupHandle(existing) }
}
