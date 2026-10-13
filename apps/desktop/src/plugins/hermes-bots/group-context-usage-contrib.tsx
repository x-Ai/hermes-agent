/**
 * Wires the room's context readout into the statusbar: while a group room's
 * main-window tab is in front, the core context chip shows the fullest
 * member's occupancy and opens the per-member panel (`STATUSBAR_CONTEXT_USAGE_AREA`
 * contract), and the member sessions' `message.complete` / `session.usage`
 * frames keep the readings live between turn polls.
 *
 * Feature-detected: a desktop whose SDK predates the override area keeps the
 * focused session's chip — the readings are still collected, so the room's
 * compress action and a future shell both find them.
 */

import * as sdk from '@hermes/plugin-sdk'
import { host, type PluginContext } from '@hermes/plugin-sdk'

import { groupContextChipStores, recordGroupSessionUsageEvent, trackGroupRoomInFront } from './group-context-usage'
import { GroupContextUsagePanel } from './group-context-usage-panel'

/** Frames that carry a session's `usage` keyed by runtime id. */
const USAGE_EVENTS = ['message.complete', 'session.usage'] as const

export function startGroupContextUsage(ctx: PluginContext): () => void {
  const stops: Array<() => void> = [trackGroupRoomInFront()]
  const area = (sdk as { STATUSBAR_CONTEXT_USAGE_AREA?: unknown }).STATUSBAR_CONTEXT_USAGE_AREA

  if (typeof area === 'string') {
    stops.push(
      ctx.register({
        id: 'group-context-usage',
        area,
        data: { ...groupContextChipStores(), panel: () => <GroupContextUsagePanel /> }
      })
    )
  }

  if (typeof host.onEvent === 'function') {
    for (const type of USAGE_EVENTS) {
      stops.push(
        host.onEvent(type, event => recordGroupSessionUsageEvent(event as { payload?: unknown; session_id?: string }))
      )
    }
  }

  return () => {
    for (const stop of stops.splice(0)) {
      try {
        stop()
      } catch {
        /* already retired with the plugin */
      }
    }
  }
}
