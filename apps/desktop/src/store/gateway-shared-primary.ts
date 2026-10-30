import { RECONNECT_ATTEMPT_TIMEOUT_MS, withTimeout } from '@/lib/with-timeout'

// the second dial fails (tunnel/token are per-backend) and the closed socket
// poisons the active gateway with "not connected" even though the primary is
// open right next to it.
export async function sharedPrimaryRoute(profile: string): Promise<boolean> {
  const desktop = window.hermesDesktop

  if (!desktop) {
    return false
  }

  try {
    // Unbounded IPC round-trip into main (#93454) — a wedge here must reject
    // like any other failure, not hang the route decision forever, since
    // every caller (gatewayForProfile → requestGatewayForProfile/Agent) awaits
    // this before it can fall back to dialing a secondary.
    const conn = await withTimeout(
      desktop.getConnection(profile),
      RECONNECT_ATTEMPT_TIMEOUT_MS,
      `Timed out resolving the shared-primary route for profile "${profile}"`
    )

    return Boolean(conn && typeof conn === 'object' && (conn as { sharedPrimary?: boolean }).sharedPrimary === true)
  } catch {
    return false
  }
}
