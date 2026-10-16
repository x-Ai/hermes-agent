/**
 * This Desktop's own preferences for a gateway-hosted room's roster row:
 * picture, pin, order and section filing. A hosted room is the gateway's
 * record and never enters the durable room store (`durableGroupChatRooms`),
 * so these ride plugin storage under their own key and seed the projection
 * when the room is rediscovered after a reload (`canonical-room-sync.ts`).
 */

import { getPluginCtx } from './shared'
import type { GroupChat } from './types'

export const CANONICAL_ROOM_PREFS_KEY = 'canonical-room-prefs'

export type CanonicalRoomPrefs = Pick<GroupChat, 'image' | 'pinned' | 'rosterOrder' | 'sectionId'>

let prefs: Record<string, CanonicalRoomPrefs> = {}

/** The row-preference fields of a room record worth keeping; null when it carries none. */
export function canonicalRoomPrefsOf(room: Partial<GroupChat>): CanonicalRoomPrefs | null {
  const next: CanonicalRoomPrefs = {}

  if (room.image) {
    next.image = room.image
  }

  if (room.pinned) {
    next.pinned = true
  }

  if (typeof room.rosterOrder === 'number' && Number.isFinite(room.rosterOrder)) {
    next.rosterOrder = room.rosterOrder
  }

  if (room.sectionId) {
    next.sectionId = room.sectionId
  }

  return Object.keys(next).length ? next : null
}

export function canonicalRoomPrefs(key: string): CanonicalRoomPrefs | null {
  return prefs[key] ?? null
}

/** Record what the live room record says about its row; storage is written only on a change. */
export function rememberCanonicalRoomPrefs(key: string, room: Partial<GroupChat>): void {
  const next = canonicalRoomPrefsOf(room)

  if (JSON.stringify(next) === JSON.stringify(prefs[key] ?? null)) {
    return
  }

  if (next) {
    prefs[key] = next
  } else {
    delete prefs[key]
  }

  persist()
}

export function forgetCanonicalRoomPrefs(key: string): void {
  if (key in prefs) {
    delete prefs[key]
    persist()
  }
}

function parseStored(value: unknown): Record<string, CanonicalRoomPrefs> {
  const stored: Record<string, CanonicalRoomPrefs> = {}

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, room] of Object.entries(value as Record<string, unknown>)) {
      const kept = room && typeof room === 'object' ? canonicalRoomPrefsOf(room as Partial<GroupChat>) : null

      if (kept) {
        stored[key] = kept
      }
    }
  }

  return stored
}

/** Plugin activation: merge the stored map under whatever this window already decided, field by
 *  field (a pin set before the load must not cost the stored picture). Returns the keys now held,
 *  so the caller can re-seed rooms projected before the load. */
export function loadCanonicalRoomPrefs(value: unknown): string[] {
  const stored = parseStored(value)
  const merged: Record<string, CanonicalRoomPrefs> = { ...stored }

  for (const [key, live] of Object.entries(prefs)) {
    merged[key] = { ...stored[key], ...live }
  }

  prefs = merged

  if (JSON.stringify(merged) !== JSON.stringify(stored)) {
    persist()
  }

  return Object.keys(prefs)
}

export function _resetCanonicalRoomPrefsForTests(): void {
  prefs = {}
}

function persist(): void {
  try {
    void Promise.resolve(getPluginCtx()?.storage?.set?.(CANONICAL_ROOM_PREFS_KEY, { ...prefs })).catch(() => undefined)
  } catch {
    /* no storage this window: the preferences hold until reload */
  }
}
