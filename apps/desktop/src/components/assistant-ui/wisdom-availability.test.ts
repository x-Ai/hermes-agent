// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as HermesApi from '@/hermes'

const getWisdomEntitlement = vi.fn()
const getWisdomStatus = vi.fn()

vi.mock('@/hermes', async importOriginal => ({
  ...(await importOriginal<typeof HermesApi>()),
  getWisdomEntitlement,
  getWisdomStatus
}))

const entitled = { entitled: true, expires_at: null, org_id: 'org-1', scopes: ['wisdom:read'] }

beforeEach(async () => {
  vi.resetAllMocks()
  const { resetWisdomChatSurfaceCache } = await import('./wisdom-availability')
  resetWisdomChatSurfaceCache()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('wisdomChatSurfaceReady', () => {
  it('never asks for status (which 422s) when the profile is not entitled', async () => {
    getWisdomEntitlement.mockResolvedValue({ ...entitled, entitled: false })
    const { wisdomChatSurfaceReady } = await import('./wisdom-availability')

    expect(await wisdomChatSurfaceReady({ profile: 'research' })).toBe(false)
    expect(getWisdomStatus).not.toHaveBeenCalled()
  })

  it('treats an expired entitlement as not ready', async () => {
    getWisdomEntitlement.mockResolvedValue({ ...entitled, expires_at: 1 })
    const { wisdomChatSurfaceReady } = await import('./wisdom-availability')

    expect(await wisdomChatSurfaceReady({ profile: 'research' })).toBe(false)
    expect(getWisdomStatus).not.toHaveBeenCalled()
  })

  it('requires setup on top of entitlement and shares one probe per profile scope', async () => {
    getWisdomEntitlement.mockResolvedValue(entitled)
    getWisdomStatus.mockResolvedValueOnce({ configured: false }).mockResolvedValue({ configured: true })
    const { wisdomChatSurfaceReady } = await import('./wisdom-availability')

    const [first, second] = await Promise.all([
      wisdomChatSurfaceReady({ profile: 'research' }),
      wisdomChatSurfaceReady({ profile: 'research' })
    ])

    expect([first, second]).toEqual([false, false])
    expect(getWisdomEntitlement).toHaveBeenCalledTimes(1)
    // The remembered answer serves the next minute without another request.
    expect(await wisdomChatSurfaceReady({ profile: 'research' })).toBe(false)
    expect(getWisdomStatus).toHaveBeenCalledTimes(1)
    // A different scope is probed on its own and sees the configured backend.
    expect(await wisdomChatSurfaceReady({ connectionId: 'remote', profile: 'research' })).toBe(true)
  })

  it('reports not ready when a probe fails instead of throwing into the thread', async () => {
    getWisdomEntitlement.mockRejectedValue(new Error('gateway unavailable'))
    const { wisdomChatSurfaceReady } = await import('./wisdom-availability')

    expect(await wisdomChatSurfaceReady(undefined)).toBe(false)
  })
})
