/**
 * Whether a session RPC failed because the target session is not there. The gateway names that
 * verdict by reason: the canonical owner refuses with `RuntimeStoreError('not_found')`, and the
 * legacy sidecar's "session not found" answers carry the same `data.reason` beside their
 * historical codes (`tui_gateway/session_registry.py` `_session_not_found`). The reason is the
 * contract; no numeric code is read. A refusal without it, whatever its code, fails closed: the
 * real session may still be there, and minting another would fork the member's history.
 * Duck-typed: gateway errors can cross realm boundaries.
 */

export const SESSION_NOT_FOUND_REASON = 'not_found'

export function isMissingSessionError(error: unknown): boolean {
  const data = error && typeof error === 'object' ? (error as { data?: unknown }).data : undefined
  const reason = data && typeof data === 'object' ? (data as { reason?: unknown }).reason : undefined

  return reason === SESSION_NOT_FOUND_REASON
}

/** A missing-session rejection shaped like the gateway's, for a client-side resolve that finds no
 *  session to act on (a title lookup that returns no row). Throwing it lets a caller funnel "nothing
 *  to resume" through the same `isMissingSessionError` path a real not_found refusal takes, instead
 *  of a second branch that would have to be kept in step with it. */
export function missingSessionError(message: string): Error {
  return Object.assign(new Error(message), { data: { reason: SESSION_NOT_FOUND_REASON } })
}
