/**
 * The events a gateway-hosted room shows between its messages, for the Desktop room view
 * (`canonical-room-view.tsx`): who the router or the lead gave a message to (`room.routed`,
 * `room.assignment`), a Continue (`room.continued`) and a discussion's pause at its cap
 * (`room.activity` `bounded`).
 *
 * The fork's room record is message-shaped (`canonical-room-model.ts`), so each notice is keyed by
 * the log entry it follows instead of riding in the log. Whether a pause still offers Continue is
 * upstream's own rule (`pausedDiscussions`), the one the gateway enforces
 * (`hosted_room_router.paused_discussion`).
 */

import type { CanonicalGroupEvent } from './canonical-group-history'
import { ASSIGNMENT_EVENT_KIND } from './canonical-group-lead'
import { CONTINUED_EVENT_KIND, isBoundedActivity, pausedDiscussions, ROUTED_EVENT_KIND } from './canonical-group-routed'
import { canonicalEntryId, type CanonicalRoomEvent, type HostedRoomNotice } from './canonical-room-model'

/** The log kinds the projection turns into entries: a notice anchors to the last one before it. */
const MESSAGE_KINDS = new Set(['message.member', 'message.user'])
const NOTICE_KINDS = new Set([ASSIGNMENT_EVENT_KIND, CONTINUED_EVENT_KIND, ROUTED_EVENT_KIND])

/** Every notice in `events`, keyed by the entry it follows. Pauses are kept only when the runtime says how
 *  many Continues a discussion gets: an older one keeps its cap in the Activity list, as before. */
export function canonicalRoomNotices(
  events: readonly CanonicalRoomEvent[],
  maxContinues?: number
): Record<string, HostedRoomNotice[]> {
  const log: CanonicalGroupEvent[] = events
    .map(event => ({ ...event, payload: event.payload || {} }))
    .sort((a, b) => a.seq - b.seq)

  const pauses = typeof maxContinues === 'number' ? pausedDiscussions(log, maxContinues) : null
  const notices: Record<string, HostedRoomNotice[]> = {}
  let after = ''

  for (const event of log) {
    if (MESSAGE_KINDS.has(event.kind)) {
      after = canonicalEntryId(event)

      continue
    }

    const paused = pauses && isBoundedActivity(event) ? pauses.get(event.seq) : undefined

    if (paused || NOTICE_KINDS.has(event.kind)) {
      const notice = paused ? { event, paused } : { event }
      notices[after] = [...(notices[after] || []), notice]
    }
  }

  return notices
}
