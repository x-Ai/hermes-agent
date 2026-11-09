import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { TRANSLATIONS } from '@/i18n/catalog'
import { setRuntimeI18nLocale } from '@/i18n/runtime'

const getMemoryProviderConfig = vi.fn()

vi.mock('@/hermes', () => ({
  getMemoryProviderConfig: (provider: string) => getMemoryProviderConfig(provider),
  saveMemoryProviderConfig: vi.fn()
}))

vi.mock('@/store/profile', async () => {
  const { atom } = await import('nanostores')

  return { $activeGatewayProfile: atom('default') }
})

vi.mock('@/store/notifications', () => ({ notify: vi.fn(), notifyError: vi.fn() }))

const { ProviderConfigPanel } = await import('./provider-config-panel')

// A zh I18nProvider keeps its locale after unmount, so this file holds the panel's Chinese render.
afterEach(() => {
  cleanup()
  setRuntimeI18nLocale('en')
})

// The main process's backend timeout is one English sentence; the panel's inline load error
// printed it verbatim inside its Chinese sentence.
it('names a backend timeout in the UI language when the provider settings fail to load', async () => {
  getMemoryProviderConfig.mockRejectedValueOnce(new Error('Timed out connecting to Hermes backend after 30000ms'))

  render(
    <I18nProvider configClient={null} initialLocale="zh">
      <ProviderConfigPanel provider="honcho" />
    </I18nProvider>
  )

  const zh = TRANSLATIONS.zh

  expect(
    await screen.findByText(zh.settings.memoryProvider.loadFailed(zh.runtimeErrors.backendConnectTimedOut(30)))
  ).toBeTruthy()
  expect(screen.queryByText(/Timed out connecting/)).toBeNull()
})
