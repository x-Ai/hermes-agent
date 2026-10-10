/**
 * Working directories for group chats.
 *
 * A member's per-thread plumbing session needs a cwd like any other session,
 * but the room engine never passed one, so every member landed in its
 * backend's launch directory (the Desktop's default project folder, else
 * $HOME) whatever project the room was about. The ladder, most specific first:
 *
 *   1. the member's own folder in THIS room (`room.memberWorkspaces[memberKey]`)
 *   2. the thread's folder (a thread started from a project via `@<group>`)
 *   3. the room folder (`room.workspace`)
 *   4. nothing — the backend falls back to the member profile's `terminal.cwd`,
 *      then to its own launch directory.
 *
 * Rungs 2–3 are paths on THIS window's gateway host, so they apply only to
 * members on the active connection; a member on another machine follows its
 * own folder (rung 1) or nothing. Every picked folder is sent with
 * `cwd_explicit`, the provenance a deliberate per-session workspace pick
 * carries in the main chat, so it beats the member profile's configured
 * `terminal.cwd` (#52589) — the profile value is a default, the room is a
 * choice.
 *
 * Application point: `ensureGroupChatSession` (every member turn passes
 * through it). A fresh session is created with the folder; a resumed one is
 * re-homed with `session.cwd.set` when its cwd disagrees — at turn start the
 * session is idle, so the busy refusal (4009) only means "a turn is still
 * running, retry next turn". Nothing chases live sessions on save.
 */

import { host } from '@hermes/plugin-sdk'

import { updateGroupChat } from './group-chat'
import { groupMemberKey } from './group-membership'
import { botsText } from './i18n'
import { requestForBot } from './routing'
import type { GroupChat, GroupMember } from './types'

export type GroupWorkspaceSource = 'member' | 'room' | 'thread'

export interface GroupWorkspaceResolution {
  cwd: null | string
  source: GroupWorkspaceSource | null
}

type GroupWorkspaceRoom = Pick<GroupChat, 'memberWorkspaces' | 'threadWorkspaces' | 'workspace'>

const GROUP_THREAD_WORKSPACES_MAX = 64

/** Trim and drop trailing separators (a root stays a root); blank → null. */
export function normalizeGroupWorkspacePath(raw: null | string | undefined): null | string {
  const trimmed = String(raw ?? '').trim()

  if (!trimmed) {
    return null
  }

  const stripped = trimmed.replace(/([^/\\])[/\\]+$/, '$1')

  // `C:` is not a directory; the drive root keeps its separator.
  return /^[A-Za-z]:$/.test(stripped) ? `${stripped}\\` : stripped
}

export function sameGroupWorkspace(left: null | string | undefined, right: null | string | undefined): boolean {
  return normalizeGroupWorkspacePath(left) === normalizeGroupWorkspacePath(right)
}

/** Rungs 2–3 name folders on this window's gateway host: only a member on the
 *  active connection can be sent there. */
export function memberFollowsRoomWorkspace(member: Partial<GroupMember> | null | undefined): boolean {
  return !member?.remoteSource
}

export function resolveGroupMemberWorkspace(
  room: GroupWorkspaceRoom | null | undefined,
  member: GroupMember,
  thread?: null | string
): GroupWorkspaceResolution {
  const own = normalizeGroupWorkspacePath(room?.memberWorkspaces?.[groupMemberKey(member)])

  if (own) {
    return { cwd: own, source: 'member' }
  }

  if (!memberFollowsRoomWorkspace(member)) {
    return { cwd: null, source: null }
  }

  const threadCwd = thread ? normalizeGroupWorkspacePath(room?.threadWorkspaces?.[thread]) : null

  if (threadCwd) {
    return { cwd: threadCwd, source: 'thread' }
  }

  const roomCwd = normalizeGroupWorkspacePath(room?.workspace)

  return roomCwd ? { cwd: roomCwd, source: 'room' } : { cwd: null, source: null }
}

export function setGroupChatWorkspace(group: string, path: null | string | undefined) {
  const next = normalizeGroupWorkspacePath(path)

  updateGroupChat(group, room => ({ ...room, workspace: next }))
}

export function setGroupMemberWorkspace(group: string, member: GroupMember, path: null | string | undefined) {
  const key = groupMemberKey(member)
  const next = normalizeGroupWorkspacePath(path)

  updateGroupChat(group, room => {
    const all = { ...(room.memberWorkspaces || {}) }

    if (next) {
      all[key] = next
    } else {
      delete all[key]
    }

    return { ...room, memberWorkspaces: all }
  })
}

/** The room with `thread` pinned to `path` (or unpinned), oldest pins dropped
 *  past the cap. Pure, so the send path can fold it into its own room write. */
export function withGroupThreadWorkspace<T extends GroupWorkspaceRoom>(
  room: T,
  thread: string,
  path: null | string | undefined
): T {
  const next = normalizeGroupWorkspacePath(path)
  const all = { ...(room.threadWorkspaces || {}) }
  delete all[thread]

  if (next) {
    all[thread] = next
  }

  const keys = Object.keys(all)

  for (const stale of keys.slice(0, Math.max(0, keys.length - GROUP_THREAD_WORKSPACES_MAX))) {
    delete all[stale]
  }

  return { ...room, threadWorkspaces: all }
}

// One notice per (room, member, folder): a folder that stopped existing would
// otherwise toast on every turn of every thread.
const workspaceFailureNotices = new Set<string>()

/** Re-home a live member session whose cwd disagrees with the ladder. Returns
 *  whether a re-home was sent. A busy refusal (4009) is not a failure: the
 *  member is still finishing another thread's turn and the next turn retries. */
export async function reconcileGroupSessionWorkspace(
  group: string,
  member: GroupMember,
  runtime: string,
  current: null | string | undefined,
  desired: null | string
): Promise<boolean> {
  if (!desired || sameGroupWorkspace(current, desired)) {
    return false
  }

  try {
    await requestForBot(member, 'session.cwd.set', { session_id: runtime, cwd: desired })

    return true
  } catch (error: any) {
    if (error?.code === 4009) {
      return false
    }

    const notice = `${group}::${groupMemberKey(member)}::${desired}`

    if (!workspaceFailureNotices.has(notice)) {
      workspaceFailureNotices.add(notice)
      host.notify({
        kind: 'error',
        message: botsText().group.workspaceApplyFailed(
          member.name,
          desired,
          error instanceof Error ? error.message : String(error)
        )
      })
    }

    return false
  }
}

/** Ask the gateway that will run the member whether it can see `path`:
 *  `config.get project` answers with the normalized directory when it exists
 *  and with the gateway's fallback cwd when it does not. Returns the
 *  normalized path to store, or null when the folder is not reachable there.
 *  `member` null probes the active gateway (the room's own host). */
export async function probeGroupWorkspace(member: GroupMember | null, path: string): Promise<null | string> {
  const wanted = normalizeGroupWorkspacePath(path)

  if (!wanted) {
    return null
  }

  const params = { key: 'project', cwd: wanted, ...(member ? { profile: member.name } : {}) }

  const info = member
    ? await requestForBot<{ cwd?: string }>(member, 'config.get', params)
    : await host.request<{ cwd?: string }>('config.get', params)

  const resolved = normalizeGroupWorkspacePath(info?.cwd)

  if (!resolved) {
    return null
  }

  if (sameGroupWorkspace(resolved, wanted)) {
    return resolved
  }

  // `~/x` comes back expanded; accept the expansion when its tail is ours.
  if (wanted.startsWith('~') && resolved.endsWith(wanted.slice(1))) {
    return resolved
  }

  return null
}

/** `session.create` params for a member's folder: an explicit per-session
 *  workspace pick (beats the profile's configured `terminal.cwd`, #52589), or
 *  nothing when no rung applies (the backend's own fallback decides). */
export function groupSessionCreateCwdParams(workspace: null | string): Record<string, unknown> {
  return workspace ? { cwd: workspace, cwd_explicit: true } : {}
}
