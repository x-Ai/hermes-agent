import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALE, setRuntimeI18nLocale } from '@/i18n'
import { $defaultProfileRoute } from '@/store/default-profile'
import { $notifications, clearNotifications } from '@/store/notifications'

import { prepareDefaultNewSession } from './new-session-route'

const { ensureGatewayProfile } = vi.hoisted(() => ({
  ensureGatewayProfile: vi.fn(async (_profile: string, _options?: { forceLegacyRoute?: boolean }) => {
    throw new Error('backend unreachable')
  })
}))

vi.mock('@/store/profile', async importActual => ({
  ...(await importActual<Record<string, unknown>>()),
  ensureGatewayProfile
}))

afterEach(() => {
  $defaultProfileRoute.set(null)
  clearNotifications()
  vi.clearAllMocks()
})

describe('prepareDefaultNewSession', () => {
  // A failed open toasts its title, and a non-English toast also shows that title as its
  // message: the whole title is copy, and it names the profile the way the sidebar does.
  it('names the default profile in the UI language when the saved default fails to open', async () => {
    $defaultProfileRoute.set({ connectionId: null, profile: 'default' })
    setRuntimeI18nLocale('zh')

    try {
      prepareDefaultNewSession()
      await vi.waitFor(() => expect($notifications.get()).toHaveLength(1))

      const title = $notifications.get()[0].title ?? ''

      expect(ensureGatewayProfile).toHaveBeenCalledWith('default', { forceLegacyRoute: true })
      expect(title).toContain('默认')
      // No English sentence around the name, and never the raw key "default".
      expect(title).not.toMatch(/[A-Za-z]/)
    } finally {
      setRuntimeI18nLocale(DEFAULT_LOCALE)
    }
  })
})
