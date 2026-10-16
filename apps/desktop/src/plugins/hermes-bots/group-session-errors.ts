/**
 * Whether a session RPC failed because the target session is not there: the legacy sidecar's
 * JSON-RPC 4007 ("genuinely never existed") or the canonical owner's `not_found` reason (its
 * errors share code 4001 and carry the reason in `data`; a bare `not_found` message is the same
 * verdict after a bridge dropped the frame's structure). Both leave the room engine free to mint
 * the member's session anew; every other failure must fail closed, since the real session may
 * still be there. Duck-typed: gateway errors can cross realm boundaries.
 */

interface SessionErrorLike {
  code?: unknown
  data?: unknown
  message?: unknown
}

const LEGACY_NOT_FOUND_CODE = 4007
const CANONICAL_ERROR_CODE = 4001

export function isMissingSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const { code, data, message } = error as SessionErrorLike

  if (code === LEGACY_NOT_FOUND_CODE) {
    return true
  }

  const reason = data && typeof data === 'object' ? (data as { reason?: unknown }).reason : undefined

  if (reason !== undefined) {
    return reason === 'not_found'
  }

  return (code === CANONICAL_ERROR_CODE || code === undefined) && message === 'not_found'
}
