/**
 * The identity keys the room mirror's merges (`group-chat.ts`) dedupe log entries and members
 * by. Pure functions of one entry or member.
 */

import { botRosterKey } from './data'
import type { GroupMember, GroupMessage } from './types'

export function groupChatSyncEntryKey(entry: GroupMessage) {
  if (entry?.id) {
    return `id:${String(entry.id)}`
  }

  return JSON.stringify([
    Number(entry?.at || 0),
    String(entry?.from?.kind || ''),
    String(entry?.from?.name || ''),
    String(entry?.from?.source || ''),
    // Threadless entries (pre-thread rooms, older Desktop builds) get
    // SYNTHETIC `legacy-N` ids from assignLegacyThreads. Those ids are
    // position-derived — not stable across a gateway round-trip (the
    // projection copy may be threadless or numbered differently). Collapse
    // the whole synthetic family to one bucket, or the merge duplicates
    // every id-less entry — shifting watermarks and manufacturing phantom
    // member turns that re-submit into busy sessions.
    String(entry?.thread || 'legacy').replace(/^legacy-\d+$/, 'legacy'),
    String(entry?.text || '')
  ])
}

/** Members dedupe on durable identity — the same (connectionId, name) pair
 *  botRosterKey seats them by everywhere else. `connectionLabel` and `handle`
 *  are display strings each machine re-derives (a connection rename, an older
 *  build with no handle), so keying on them seats one bot twice; both copies
 *  then answer to a single groupMemberKey in watermarks/sessions/stranded and
 *  the round engine gives that bot two turns. Deliberately unconditional,
 *  unlike groupMemberKey: the projection stamps `remoteSource` onto members it
 *  merges in, so a scoped/unscoped branch would fork a member from its own
 *  previously-merged copy. */
export function groupChatSyncMemberKey(member: GroupMember) {
  return botRosterKey(member)
}
