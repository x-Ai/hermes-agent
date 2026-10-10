/**
 * Pure helpers for carrying a room's working directories through the gateway
 * `ui_meta` mirror (`group-chat.ts`). Kept import-free of the room store so the
 * projection builder and the pull merge can use them without a module cycle.
 *
 * The projection always names `workspace` (null when cleared): a clear on one
 * Desktop must reach the others, and a mirror written by an older build simply
 * lacks the key, which the merge reads as "nothing to adopt". Thread folders
 * ride only for the threads the compact log still carries, so the field stays
 * bounded like the log itself.
 */

import type { GroupChat, GroupMessage } from './types'

export const GROUP_WORKSPACE_PATH_MAX = 1024

type GroupWorkspaceFields = Pick<GroupChat, 'memberWorkspaces' | 'threadWorkspaces' | 'workspace'>

export interface GroupWorkspaceProjection {
  memberWorkspaces?: Record<string, string>
  threadWorkspaces?: Record<string, string>
  workspace: null | string
}

function boundedPaths(
  all: Record<string, string> | null | undefined,
  limit: number,
  keep: (key: string) => boolean = () => true
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(all || {})
      .filter(([key, path]) => key && typeof path === 'string' && path.trim() && keep(key))
      .slice(0, limit)
      .map(([key, path]) => [key.slice(0, 160), path.slice(0, GROUP_WORKSPACE_PATH_MAX)])
  )
}

/** The compact mirror's view of a room's folders. */
export function groupWorkspaceProjection(
  room: GroupWorkspaceFields | null | undefined,
  log: GroupMessage[],
  maxMembers: number
): GroupWorkspaceProjection {
  const workspace =
    typeof room?.workspace === 'string' && room.workspace.trim()
      ? room.workspace.slice(0, GROUP_WORKSPACE_PATH_MAX)
      : null

  const memberWorkspaces = boundedPaths(room?.memberWorkspaces, maxMembers)
  const threads = new Set(log.map(entry => String(entry?.thread || '')).filter(Boolean))
  const threadWorkspaces = boundedPaths(room?.threadWorkspaces, threads.size, key => threads.has(key))

  return {
    workspace,
    ...(Object.keys(memberWorkspaces).length ? { memberWorkspaces } : {}),
    ...(Object.keys(threadWorkspaces).length ? { threadWorkspaces } : {})
  }
}

/** Fold a mirrored room's folders into the local record. `adoptRemote` is the
 *  same verdict the picture uses (newer or equal revision, room not locally
 *  preserved); thread folders union either way because each thread's folder
 *  is written once, by the Desktop that started the thread. */
export function mergeGroupWorkspaceFields(
  existing: GroupWorkspaceFields | null | undefined,
  projected: Partial<GroupWorkspaceProjection> | null | undefined,
  { adoptRemote }: { adoptRemote: boolean }
): Required<GroupWorkspaceFields> {
  const has = (key: keyof GroupWorkspaceProjection) =>
    Boolean(projected) && Object.prototype.hasOwnProperty.call(projected, key)

  const workspace = adoptRemote && has('workspace') ? projected?.workspace || null : existing?.workspace || null

  const memberWorkspaces =
    adoptRemote && has('memberWorkspaces')
      ? { ...(projected?.memberWorkspaces || {}) }
      : { ...(existing?.memberWorkspaces || {}) }

  const threadWorkspaces = adoptRemote
    ? { ...(existing?.threadWorkspaces || {}), ...(projected?.threadWorkspaces || {}) }
    : { ...(projected?.threadWorkspaces || {}), ...(existing?.threadWorkspaces || {}) }

  return { workspace, memberWorkspaces, threadWorkspaces }
}

/** The working-directory slice of a room's durable (plugin-storage) record.
 *  Spread into the persisted room object so the `||` normalization lives here,
 *  not in `updateGroupChat`. */
export function durableGroupWorkspaceFields(
  room: GroupWorkspaceFields | null | undefined
): Required<GroupWorkspaceFields> {
  return {
    workspace: room?.workspace || null,
    memberWorkspaces: room?.memberWorkspaces || {},
    threadWorkspaces: room?.threadWorkspaces || {}
  }
}
