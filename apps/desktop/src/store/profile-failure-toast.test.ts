import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALE, setRuntimeI18nLocale } from '@/i18n'

// A failed profile switch or open toasts its title, and a non-English toast also shows that
// title as its message (#81094 made these failures visible). The whole title is copy, and it
// names the profile the way the sidebar does, so a Chinese UI reads 默认, never "default".

const ensureGatewayForProfile = vi.fn(async (_profile: string): Promise<void> => {
  throw new Error('backend unreachable')
})

const ensureGatewayForAgent = vi.fn(async (_connectionId: null | string, _profile: string): Promise<boolean> => {
  throw new Error('backend unreachable')
})

vi.mock('@/store/gateway', () => ({
  $gateway: atom<unknown>({ id: 'live-socket' }),
  activeGatewayConnectionId: () => null,
  activeGatewayProfileKey: () => 'work',
  ensureGatewayForAgent,
  ensureGatewayForProfile,
  openGatewayForProfile: vi.fn(async () => undefined)
}))
vi.mock('@/hermes', () => ({
  getProfiles: vi.fn(async () => ({ profiles: [] })),
  setApiRequestProfile: vi.fn()
}))
vi.mock('@/lib/query-client', () => ({ invalidateProfileScopedQueries: vi.fn() }))
vi.mock('@/store/starmap', () => ({ reloadOpenStarmapGraph: vi.fn(), resetStarmapGraph: vi.fn() }))

const { $activeGatewayProfile, newSessionInAgent, newSessionInProfile, selectProfile } = await import('./profile')
const { $notifications, clearNotifications } = await import('./notifications')

async function toastTitleInChinese(fail: () => void): Promise<string> {
  setRuntimeI18nLocale('zh')

  try {
    fail()
    await vi.waitFor(() => expect($notifications.get()).toHaveLength(1))

    return $notifications.get()[0].title ?? ''
  } finally {
    setRuntimeI18nLocale(DEFAULT_LOCALE)
  }
}

beforeEach(() => {
  // The window serves `work`, so every pick of `default` dials it.
  $activeGatewayProfile.set('work')
})

afterEach(() => {
  clearNotifications()
  vi.clearAllMocks()
})

describe('failed profile switch and open toasts in a Chinese UI', () => {
  it('names the default profile in Chinese when a profile pick fails', async () => {
    const title = await toastTitleInChinese(() => selectProfile('default'))

    expect(ensureGatewayForProfile).toHaveBeenCalledWith('default')
    expect(title).toContain('默认')
    // No English sentence around the name, and never the raw key "default".
    expect(title).not.toMatch(/[A-Za-z]/)
  })

  it('names the default profile in Chinese when a new chat in it fails to open', async () => {
    const title = await toastTitleInChinese(() => newSessionInProfile('default'))

    expect(ensureGatewayForProfile).toHaveBeenCalledWith('default')
    expect(title).toContain('默认')
    expect(title).not.toMatch(/[A-Za-z]/)
  })

  it('names the default profile in Chinese when a new chat on a registry agent fails to open', async () => {
    const title = await toastTitleInChinese(() => newSessionInAgent({ connectionId: 'mini', profile: 'default' }))

    expect(ensureGatewayForAgent).toHaveBeenCalledWith('mini', 'default')
    expect(title).toContain('默认')
    expect(title).not.toMatch(/[A-Za-z]/)
  })
})
