/**
 * New group chat's choice between a gateway-hosted room and a Desktop room, with
 * upstream's bots-from-other-computers rooms (`canonical-group-peers.ts`) folded in.
 *
 * Upstream seats a bot from another computer in a room on the gateway here when that
 * gateway seats peers and the bot's own gateway can lend it (`gateway-peer`), and
 * otherwise refuses or waits. This fork never waits on the group driver and makes a
 * Desktop room whenever the gateway here cannot host one, and it hosts a room only on a
 * gateway that keeps this fork's room settings (`room_settings`): the room's folder,
 * @handle and stop-detection setting live there. So a selection with bots on other
 * computers becomes a hosted room only on such a gateway, after every lender answered;
 * anything else is a Desktop room, as before.
 */

import type { GroupCapabilityState, GroupCreationEngine, GroupCreationPlan } from './canonical-group-capabilities'
import {
  groupCreationEngine,
  groupExecutionMode,
  groupSeatsPeers,
  groupSpansConnections,
  revalidateGroupCreation
} from './canonical-group-capabilities'
import type { CanonicalGroupMessages } from './canonical-group-locales'
import { createGroupAcrossConnections, readPeerTargets } from './canonical-group-peers'
import { refreshGatewayGroupRooms, registerCanonicalGroup } from './canonical-group-registry'
import type { CanonicalGroupRoute, CanonicalRoomMember, GroupCreationIntent } from './canonical-groups'
import { canonicalGroupRequest } from './canonical-groups'
import { applyCanonicalCreationSettings, type CanonicalRoomSettingsPatch } from './canonical-room-actions'
import { durableGroupChatMembers } from './group-membership'
import type { RosterRow } from './types'

/** What New group chat shows and creates for a selection. Upstream never plans a Desktop-driven
 *  room any more; this fork keeps `desktop` for every selection the gateway here cannot host. */
export type GroupCreateEngine =
  | Extract<GroupCreationEngine, 'checking' | 'gateway' | 'gateway-peer' | 'unavailable'>
  | 'desktop'

/** Peer-plan reasons that hold Create back until Retry: a lender that could not be read, a bot whose
 *  computer is not connected, or one whose computer now runs another Hermes installation. Any other
 *  lender reason means it answered and cannot lend its bot yet, which keeps a Desktop room here. */
const PEER_PLAN_WAITS = new Set(['unreachable', 'route_unavailable', 'peer_gateway_changed'])

/** Whether a `groups.capabilities` answer comes from a gateway that keeps this fork's room settings. */
export function hostsRoomSettings(snapshot: unknown): boolean {
  const features = snapshot && typeof snapshot === 'object' ? (snapshot as { features?: unknown }).features : undefined

  return Array.isArray(features) && features.includes('room_settings')
}

/** Whether the gateway answering `snapshot` can host a room seating bots from other computers the
 *  way this fork hosts rooms: it seats peers (upstream's `groupSeatsPeers`) and keeps room settings. */
export function hostsPeerRooms(snapshot: unknown): boolean {
  return groupSeatsPeers(snapshot) && hostsRoomSettings(snapshot)
}

/** Upstream's `plan` for `selection`, read the way this fork creates rooms. */
export function groupCreateEngine(
  plan: GroupCreationPlan,
  selection: RosterRow[],
  connectionId: null | string,
  snapshot: unknown
): GroupCreateEngine {
  if (!groupSpansConnections(selection, connectionId)) {
    return plan.engine === 'gateway' && hostsRoomSettings(snapshot) ? 'gateway' : 'desktop'
  }

  if (!hostsPeerRooms(snapshot)) {
    return 'desktop'
  }

  if (plan.engine === 'gateway-peer' || plan.engine === 'checking') {
    return plan.engine
  }

  // Upstream refuses a lender that answered but cannot lend its bot; this fork runs that room here.
  return plan.engine === 'unavailable' && PEER_PLAN_WAITS.has(plan.reason ?? '') ? 'unavailable' : 'desktop'
}

/** Before a Desktop room with bots on other computers, ask the gateway here once more whether it
 *  can now host that room (upstream refreshes a changed plan before another deliberate Create). A
 *  read that fails keeps the Desktop room: this fork's creation never waits on the gateway. */
export async function hostedPeerRoomNowPossible(route: CanonicalGroupRoute, selection: RosterRow[]): Promise<boolean> {
  try {
    const snapshot = await canonicalGroupRequest<unknown>(route, 'groups.capabilities')

    if (!hostsPeerRooms(snapshot)) {
      return false
    }

    const targets = await readPeerTargets(selection, route.connectionId)
    const plan = groupCreationEngine(groupExecutionMode(snapshot), selection, route.connectionId, snapshot, targets)

    return groupCreateEngine(plan, selection, route.connectionId, snapshot) === 'gateway-peer'
  } catch {
    return false
  }
}

export interface HostedPeerRoomDraft {
  capability: GroupCapabilityState | null
  /** One creation attempt's wire payload, kept while a reply is uncertain (Retry resends it). */
  intent: GroupCreationIntent
  labels: CanonicalGroupMessages
  /** The name as entered, blank when left empty: with the picked bots it keys the request. */
  name: string
  /** Called when the plan changed since the dialog showed it, so the dialog reads it again. */
  onStalePlan: () => void
  route: CanonicalGroupRoute
  selection: RosterRow[]
  /** The room name sent, from the entered one, once per request (a blank one is filled from the
   *  bots' names), so a retry after a lost reply resends the first attempt's name. */
  sentName?: (name: string) => string
  settings: CanonicalRoomSettingsPatch
  source: string
}

/** A hosted room New group chat made: its key, and each bot from another computer that did not join. */
export interface HostedPeerRoom {
  key: string
  unjoined: { member: CanonicalRoomMember; error: unknown }[]
}

/** Re-read the plan, create the room on the gateway here, seat each bot from another computer
 *  through its own gateway, then apply the draft's room settings. A bot that did not join is
 *  named on the opened room's member row, which says why and offers Retry, and in New group chat's
 *  one notice (so a failed seat is never silent); the room opens anyway. Returns the room, or null
 *  when the window left the source that approved it (the room then stays on its owner, unopened). */
export async function createHostedPeerRoom(draft: HostedPeerRoomDraft): Promise<HostedPeerRoom | null> {
  const { capability, intent, labels, name, route, selection, sentName, settings, source } = draft

  const { targets, sourceCurrent } = await revalidateGroupCreation(
    route,
    capability,
    source,
    selection,
    'gateway-peer',
    labels.driverUnavailable
  ).catch(error => {
    draft.onStalePlan()
    throw error
  })

  if (!sourceCurrent()) {
    throw new Error(labels.driverUnavailable)
  }

  const created = await createGroupAcrossConnections(
    route,
    name,
    durableGroupChatMembers(selection),
    targets,
    intent,
    sentName
  )

  if (!sourceCurrent()) {
    return null
  }

  const key = registerCanonicalGroup(route, created.room)
  await applyCanonicalCreationSettings(created.binding, settings)
  refreshGatewayGroupRooms()

  return { key, unjoined: created.unjoined }
}

/** Whether upstream's peer-room plan decides how `selection` runs here: it spans machines and the
 *  gateway here seats peers with this fork's room settings. Only then does a lender's reason for
 *  not hosting its bot explain why the room runs on this Desktop. */
function peerRoomsApply(selection: RosterRow[], connectionId: null | string, snapshot: unknown): boolean {
  return groupSpansConnections(selection, connectionId) && hostsPeerRooms(snapshot)
}

export interface HostedPeerStep {
  draft: Omit<HostedPeerRoomDraft, 'route'>
  engine: GroupCreateEngine
  /** Before a Desktop room spanning machines, on a gateway that answered: look again first. */
  refresh: boolean
  route: CanonicalGroupRoute | null
}

/** What upstream's peer rooms add to New group chat ahead of this fork's own paths: the hosted
 *  room for a peer plan, or, before a Desktop room spanning machines, one fresh look at whether the
 *  gateway here can now host it (then the dialog reads its plan again and this Create stops).
 *  Undefined when the fork's own paths go on; the room made, or null for a room the window left
 *  behind, when the create was handled here. */
export async function hostedPeerStep({
  draft,
  engine,
  refresh,
  route
}: HostedPeerStep): Promise<HostedPeerRoom | null | undefined> {
  if (!route) {
    return undefined
  }

  if (engine === 'gateway-peer') {
    return createHostedPeerRoom({ ...draft, route })
  }

  if (refresh && (await hostedPeerRoomNowPossible(route, draft.selection))) {
    draft.onStalePlan()
    throw new Error(draft.labels.driverUnavailable)
  }

  return undefined
}

/** What New group chat shows for a selection, read off upstream's `plan` and this fork's engine. */
export function groupCreateView(
  plan: GroupCreationPlan,
  engine: GroupCreateEngine,
  selection: RosterRow[],
  connectionId: null | string,
  snapshot: unknown
) {
  const spans = groupSpansConnections(selection, connectionId)

  return {
    /** The room keeps its members on its gateway rather than in each bot's profile. */
    hosted: engine === 'gateway' || engine === 'gateway-peer',
    /** Why a lender cannot host its bot yet: shown only where that is why the room is a Desktop room. */
    noteReason: peerRoomsApply(selection, connectionId, snapshot) ? plan.reason : undefined,
    /** A peer plan is missing something Retry may find (a lender could not be read, a computer is
     *  not connected or changed installation), or the gateway here could not be read while the
     *  selection spans machines. */
    retry: engine === 'unavailable' || (spans && plan.reason === 'owner_unavailable'),
    spans,
    /** Create waits while a peer plan is still being read, or a lender could not be read. */
    waits: engine === 'checking' || engine === 'unavailable'
  }
}
