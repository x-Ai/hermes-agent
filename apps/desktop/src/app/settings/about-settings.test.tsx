import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DesktopUpdateStatus } from '@/global'
import { I18nProvider } from '@/i18n'
import { $desktopVersion, $updateStatus, resetUpdateApplyState } from '@/store/updates'

import { AboutSettings } from './about-settings'

const check = vi.fn<() => Promise<DesktopUpdateStatus>>()
const originalDesktop = window.hermesDesktop

beforeEach(() => {
  check.mockReset().mockResolvedValue({ behind: 0, fetchedAt: Date.now(), supported: true })
  $desktopVersion.set(null)
  $updateStatus.set(null)
  resetUpdateApplyState()
  Object.defineProperty(window, 'hermesDesktop', {
    configurable: true,
    value: { updates: { check } }
  })
})

afterEach(() => {
  cleanup()
  $desktopVersion.set(null)
  $updateStatus.set(null)
  resetUpdateApplyState()
  Object.defineProperty(window, 'hermesDesktop', { configurable: true, value: originalDesktop })
})

describe('AboutSettings update check', () => {
  it('shows the freshly checked relative time exactly once', async () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <AboutSettings />
      </I18nProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '立即检查' }))
      await Promise.resolve()
    })

    expect(check).toHaveBeenCalledOnce()
    expect(screen.getByText('上次检查:刚刚')).toBeTruthy()
  })
})
