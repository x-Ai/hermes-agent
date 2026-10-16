import { describe, expect, it } from 'vitest'

import { isMissingSessionError } from './group-session-errors'

const withShape = (message: string, shape: Record<string, unknown>) => Object.assign(new Error(message), shape)

describe('isMissingSessionError', () => {
  it('reads the gateway verdict from the reason, whichever route and code carried it', () => {
    // The canonical owner (one code for every refusal, the reason tells).
    expect(isMissingSessionError(withShape('not_found', { code: 4001, data: { reason: 'not_found' } }))).toBe(true)
    // The legacy sidecar's resume family and its stale-runtime answer, now carrying the reason.
    expect(isMissingSessionError(withShape('session not found', { code: 4007, data: { reason: 'not_found' } }))).toBe(
      true
    )
    expect(isMissingSessionError(withShape('session not found', { code: 4001, data: { reason: 'not_found' } }))).toBe(
      true
    )
    // A frame whose code was lost on the way still names its reason.
    expect(isMissingSessionError({ data: { reason: 'not_found' } })).toBe(true)
  })

  it('fails closed on every other refusal, including a code-only answer from an older gateway', () => {
    expect(isMissingSessionError(withShape('session not found', { code: 4007 }))).toBe(false)
    expect(isMissingSessionError(withShape('not_found', { code: 4001 }))).toBe(false)
    expect(isMissingSessionError(withShape('not_found', { code: 4001, data: { reason: 'permission_denied' } }))).toBe(
      false
    )
    expect(isMissingSessionError(withShape('session_busy', { code: 4001, data: { reason: 'session_busy' } }))).toBe(
      false
    )
    expect(isMissingSessionError(withShape('resume too large', { code: 4012 }))).toBe(false)
    expect(isMissingSessionError(new Error('socket closed'))).toBe(false)
    expect(isMissingSessionError(null)).toBe(false)
    expect(isMissingSessionError('not_found')).toBe(false)
  })
})
