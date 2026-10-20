import type { StatusResponse } from '@/types/hermes'

/** Profiles a gateway restart would blip when the polled profile is carried by the shared
 *  multiplexer, in display order (default first, then as recorded). `null` for a standalone
 *  gateway or an older backend that does not report `gateway_shared_with` — those keep the
 *  plain no-dialog restart. A record naming only one profile is not shared either. */
export function sharedGatewayProfiles(
  status: Pick<StatusResponse, 'gateway_shared_with'> | null | undefined
): null | string[] {
  const shared = status?.gateway_shared_with

  if (!Array.isArray(shared)) {
    return null
  }

  const names = [...new Set(shared.map(name => String(name).trim()).filter(Boolean))]

  if (names.length < 2) {
    return null
  }

  return names.sort((left, right) => (left === 'default' ? -1 : right === 'default' ? 1 : left.localeCompare(right)))
}

/** The names as the restart dialog shows them: the root profile under its localized label
 *  (`default` is its canonical id, not a name anyone chose), every other profile as recorded.
 *  Display only; callers keep the canonical names for the restart itself. */
export function sharedGatewayProfileLabels(names: readonly string[], defaultLabel: string): string[] {
  const label = defaultLabel.trim()

  return names.map(name => (label && /^default$/i.test(name) ? label : name))
}
