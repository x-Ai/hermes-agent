// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import type * as Hermes from '@/hermes'
import type { ProfileInfo } from '@/types/hermes'

// Same inert seams as profile-scope.test.tsx. `@/hermes` keeps its real
// surface because the i18n provider imports its config helpers at module
// scope; with `configClient={null}` it never calls them.
vi.mock('@/store/gateway', () => ({
  $gateway: atom<unknown>(null),
  ensureGatewayForAgent: vi.fn(async () => undefined),
  ensureGatewayForProfile: vi.fn(async () => undefined),
  openGatewayForProfile: vi.fn(async () => undefined)
}))
vi.mock('@/hermes', async importOriginal => ({
  ...(await importOriginal<typeof Hermes>()),
  getProfiles: vi.fn(async () => ({ profiles: [] })),
  setApiRequestProfile: vi.fn()
}))
vi.mock('@/lib/query-client', () => ({ invalidateProfileScopedQueries: vi.fn() }))
vi.mock('@/store/starmap', () => ({ resetStarmapGraph: vi.fn() }))

const { I18nProvider } = await import('@/i18n')
const { zh } = await import('@/i18n/zh')
const { $activeGatewayProfile, $profiles } = await import('@/store/profile')
const { $settingsScopeOverride } = await import('@/store/settings-scope')
const { ActiveProfileNote, SettingsProfileScope } = await import('./profile-scope')

const profile = (name: string, isDefault = false): ProfileInfo =>
  ({ has_env: false, is_default: isDefault, model: null, name }) as ProfileInfo

function mountZh(children: React.ReactNode) {
  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      {children}
    </I18nProvider>
  )
}

beforeEach(() => {
  $activeGatewayProfile.set('scout')
  $settingsScopeOverride.set(null)
  $profiles.set([profile('default', true), profile('scout')])
})

afterEach(cleanup)

// The root profile's chip and the "applies to" note showed the canonical slug
// `default` beside localized bot names; every other profile surface (rail,
// Profiles page, model picker) already renders it through displayEntityName.
it('names the root profile by the localized default name, chip and note alike, keyed on the slug', () => {
  mountZh(<SettingsProfileScope />)

  expect(screen.queryByRole('button', { name: 'default' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: zh.common.defaultName }))

  expect($settingsScopeOverride.get()).toBe('default')
  expect(screen.getByRole('status').textContent).toBe(zh.settings.profileScope.editsProfile(zh.common.defaultName))
})

it('names an active root profile the same way in the read-only note', () => {
  $activeGatewayProfile.set('default')

  mountZh(<ActiveProfileNote />)

  expect(screen.getByRole('status').textContent).toBe(zh.settings.profileScope.editsProfile(zh.common.defaultName))
})
