import { seatableGroupBots } from './canonical-group-capabilities'
import type { GroupExecutionMode } from './canonical-group-capabilities'
import type { RosterRow } from './types'

interface GroupOffer {
  connectionId: null | string
  mode: 'checking' | GroupExecutionMode
  seatable: null | Set<string>
}

/** The bots New Group Chat offers, shared by the dialog's picker and the New… menu gate.
 *  Upstream's `seatableGroupBots` offers this connection's bots the authority will seat plus
 *  reachable bots on other connections. A window with no registry connection id (an env or
 *  legacy remote) has no authority to consult, so upstream offers it nothing outside legacy mode;
 *  this fork's creation never waits on the group driver and makes a Desktop room whenever the
 *  gateway cannot host one, so such a window offers every bot, as legacy mode does. */
export function offerableGroupBots(roster: RosterRow[], offer: GroupOffer): RosterRow[] {
  return seatableGroupBots(roster, String(offer.connectionId || '').trim() ? offer : { ...offer, mode: 'legacy' })
}
