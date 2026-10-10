/**
 * A room as plugin storage holds it, rebuilt into the live shape on window
 * load. Runtime-only coordination state (`epoch`, `running`) always resets —
 * a loop cannot survive a reload — and every durable map gets the same shape
 * guard, so a storage record from an older build never leaks a non-object
 * into the engine.
 *
 * Every field `updateGroupChat` persists is restored here. The whitelist used
 * to skip the room's working directories, its explicit `@handle`, the hold
 * switch and the queue of messages consumed under a hold, so those came back
 * only once the gateway mirror was pulled — and never on a Desktop whose
 * gateway was unreachable, or for a room with a local edit the pull preserves.
 */

import { assignLegacyThreads } from './group-chat'
import { durableGroupHandle } from './group-handle-sync'
import { durableGroupWorkspaceFields } from './group-workspace-sync'
import type { GroupChat } from './types'

type StoredGroupChat = Partial<GroupChat> & Record<string, unknown>

function record<T>(value: unknown): T {
  return (value && typeof value === 'object' && !Array.isArray(value) ? value : {}) as T
}

/** The live record for one stored room, or null for anything that is not a room. */
export function hydrateStoredGroupChat(stored: unknown): GroupChat | null {
  if (!stored || typeof stored !== 'object' || !Array.isArray((stored as StoredGroupChat).log)) {
    return null
  }

  const room = stored as StoredGroupChat

  return {
    // Pre-thread entries get synthetic thread ids on hydrate so every
    // UI/engine path can assume entry.thread exists.
    log: assignLegacyThreads(room.log as GroupChat['log']),
    holdDetection: room.holdDetection !== false,
    heldMessages: record(room.heldMessages),
    watermarks: record(room.watermarks),
    sessions: record(room.sessions),
    sessionOwners: record(room.sessionOwners),
    stranded: record(room.stranded),
    // #93129: sticky stop holds survive a restart until explicitly released.
    holds: record(room.holds),
    externalCursors: record(room.externalCursors),
    members: Array.isArray(room.members) ? room.members : [],
    roomId: typeof room.roomId === 'string' && room.roomId ? room.roomId : null,
    image: typeof room.image === 'string' && room.image ? room.image : null,
    handle: durableGroupHandle(room),
    ...durableGroupWorkspaceFields(room),
    rosterOrder: Number.isFinite(room.rosterOrder) ? room.rosterOrder : undefined,
    pinned: Boolean(room.pinned),
    sectionId: room.sectionId ?? null,
    syncRevision: Math.max(0, Number(room.syncRevision || 0)),
    epoch: 0,
    running: false
  }
}
