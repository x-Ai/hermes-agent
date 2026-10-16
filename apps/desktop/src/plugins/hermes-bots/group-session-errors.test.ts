import { describe, expect, it } from 'vitest'

import { isMissingSessionError } from './group-session-errors'

const withShape = (message: string, shape: Record<string, unknown>) => Object.assign(new Error(message), shape)

describe('isMissingSessionError', () => {
  it('accepts the sidecar 4007 and the canonical owner not_found, by reason or by bare message', () => {
    expect(isMissingSessionError(withShape('session not found: sid', { code: 4007 }))).toBe(true)
    expect(isMissingSessionError(withShape('not_found', { code: 4001, data: { reason: 'not_found' } }))).toBe(true)
    expect(isMissingSessionError(withShape('not_found', { code: 4001 }))).toBe(true)
    expect(isMissingSessionError({ message: 'not_found' })).toBe(true)
  })

  it('fails closed on everything else: the real session may still be there', () => {
    expect(isMissingSessionError(withShape('not_found', { code: 4001, data: { reason: 'permission_denied' } }))).toBe(
      false
    )
    expect(isMissingSessionError(withShape('session_busy', { code: 4001, data: { reason: 'session_busy' } }))).toBe(
      false
    )
    expect(isMissingSessionError(withShape('resume too large', { code: 4012 }))).toBe(false)
    expect(isMissingSessionError(withShape('not_found', { code: 5000 }))).toBe(false)
    expect(isMissingSessionError(withShape('the tool said not_found', {}))).toBe(false)
    expect(isMissingSessionError(new Error('socket closed'))).toBe(false)
    expect(isMissingSessionError(null)).toBe(false)
    expect(isMissingSessionError('not_found')).toBe(false)
  })
})
