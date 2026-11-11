import { afterEach, expect, it, vi } from 'vitest'

import type * as HermesApi from '@/hermes'
import { getActionStatus, installMcpCatalogEntry, type McpCatalogEntry } from '@/hermes'
import { BUNDLED_LOCALES, setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'

import { installBundledEntry } from './install-catalog-entry'

vi.mock('@/hermes', async importOriginal => ({
  ...(await importOriginal<typeof HermesApi>()),
  getActionStatus: vi.fn(),
  installMcpCatalogEntry: vi.fn()
}))

afterEach(() => {
  vi.useRealTimers()
  setRuntimeI18nLocale('en')
})

// The Connectors page shows this message in its install-failed toast once the
// background install outlives the wait.
it.each(BUNDLED_LOCALES)('names the entry in %s copy when it stops waiting on an install', async locale => {
  vi.useFakeTimers()
  setRuntimeI18nLocale(locale)
  vi.mocked(installMcpCatalogEntry).mockResolvedValue({ action: 'mcp-install', background: true, ok: true })
  vi.mocked(getActionStatus).mockResolvedValue({
    exit_code: null,
    lines: [],
    name: 'mcp-install',
    pid: 1,
    running: true
  })

  const outcome = installBundledEntry({ name: 'Linear' } as McpCatalogEntry, {}).catch((error: unknown) => error)
  await vi.runAllTimersAsync()
  const { message } = (await outcome) as Error

  expect(message).toContain('Linear')
  expect(message).toBe(TRANSLATIONS[locale].settings.mcp.catalogInstallTimeout('Linear'))
})
