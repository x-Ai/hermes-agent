import { act, cleanup, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { $notifications, clearNotifications } from '@/store/notifications'

import { useLocalDeviceSwitch } from './local-device-switch'

vi.mock('@/components/remote-setup/first-run', () => ({ FirstRunRemoteSetup: () => null }))

function inChinese({ children }: { children: ReactNode }) {
  return (
    <I18nProvider configClient={null} initialLocale="zh">
      {children}
    </I18nProvider>
  )
}

function toastText(): string {
  return $notifications
    .get()
    .map(toast => [toast.title, toast.message, toast.detail].join('\n'))
    .join('\n')
}

afterEach(() => {
  cleanup()
  clearNotifications()
  delete (window as { hermesDesktop?: unknown }).hermesDesktop
})

// The statusbar switcher, the profile dropdown and the fleet rail all hand the
// hook the local registry label as it is stored: English "This device". The
// toast is presentation, so it must name the machine in the UI language.
describe('useLocalDeviceSwitch', () => {
  it('names This device in the UI language when the install probe fails', async () => {
    ;(window as { hermesDesktop?: unknown }).hermesDesktop = {
      probeLocalBackend: vi.fn().mockRejectedValue(new Error('probe unavailable'))
    }

    const { result } = renderHook(() => useLocalDeviceSwitch(), { wrapper: inChinese })
    let accepted: boolean | undefined

    await act(async () => {
      accepted = await result.current.request({ connectionId: 'local', label: 'This device' })
    })

    expect(accepted).toBe(false)
    expect($notifications.get()).toEqual([expect.objectContaining({ kind: 'error', title: '无法连接到 本设备' })])
    expect(toastText()).not.toContain('This device')
  })
})
