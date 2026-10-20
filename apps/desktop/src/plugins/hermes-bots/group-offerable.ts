import { seatableGroupBots } from './canonical-group-capabilities'
import type { GroupExecutionMode } from './canonical-group-capabilities'
import type { RosterRow } from './types'

interface GroupOffer {
  connectionId: null | string
  mode: 'checking' | GroupExecutionMode
  seatable: null | Set<string>
}

/** The bots New Group Chat offers, shared by the dialog's picker and the New… menu gate.
 *  Upstream seats only this connection's bots the authority will seat; this fork's Desktop
 *  rooms also seat bots from other registered connections (their turns route to their own
 *  machines), so a bot that is not on this connection stays offered and only this
 *  connection's unseatable bots (parked, or refused by the authority) drop out. */
export function offerableGroupBots(roster: RosterRow[], offer: GroupOffer): RosterRow[] {
  const onThisConnection = new Set(
    seatableGroupBots(roster, { connectionId: offer.connectionId, mode: 'canonical', seatable: null })
  )

  const seatable = new Set(seatableGroupBots(roster, offer))

  return roster.filter(bot => !bot?.ghost && (seatable.has(bot) || !onThisConnection.has(bot)))
}
