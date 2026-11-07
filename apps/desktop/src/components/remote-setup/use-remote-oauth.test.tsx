import { act, cleanup, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'
import type { NotificationInput } from '@/store/notifications'

import { useRemoteSetup } from './use-remote-setup'

afterEach(() => {
  cleanup()
  Reflect.deleteProperty(window, 'hermesDesktop')
})

function russian({ children }: { children: ReactNode }) {
  return (
    <I18nProvider configClient={null} initialLocale="ru">
      {children}
    </I18nProvider>
  )
}

describe('remote OAuth sign-in toast', () => {
  // With no probe answer the provider is boot.failure.identityProvider's phrase,
  // which Russian declines for «через»; the URL-shaped connectedTo put it after «к».
  it('names the identity provider in the UI language', async () => {
    const onNotice = vi.fn<(notice: NotificationInput) => void>()
    const oauthLoginConnectionConfig = vi.fn().mockResolvedValue({ connected: true })

    Object.defineProperty(window, 'hermesDesktop', { configurable: true, value: { oauthLoginConnectionConfig } })
    const { result } = renderHook(() => useRemoteSetup({ host: 'registry', onNotice }), { wrapper: russian })
    act(() => {
      result.current.setAuthMode('oauth')
      result.current.setUrl('https://gateway.example')
    })
    await act(async () => {
      await result.current.signIn()
    })

    const { boot, settings } = TRANSLATIONS.ru

    expect(onNotice).toHaveBeenCalledExactlyOnceWith({
      kind: 'success',
      title: settings.gateway.signedIn,
      message: settings.gateway.signedInMessage(boot.failure.identityProvider)
    })
  })
})
