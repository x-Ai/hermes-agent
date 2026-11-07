import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as ConfigApi from '@/api/config'
import { I18nProvider, TRANSLATIONS } from '@/i18n'
import { clearNotifications } from '@/store/notifications'

import { ModelSettings } from './model-settings'

const getGlobalModelInfo = vi.fn()
const getGlobalModelOptions = vi.fn()
const setEnvVar = vi.fn()

// Same seam as model-settings.test.tsx: the real read-origin helpers stay live.
vi.mock('@/hermes', async () => ({
  ...(await vi.importActual<typeof ConfigApi>('@/api/config')),
  getGlobalModelInfo: () => getGlobalModelInfo(),
  getGlobalModelOptions: () => getGlobalModelOptions(),
  getAuxiliaryModels: () => Promise.resolve({ main: { provider: 'mistral', model: '' }, tasks: [] }),
  getApiRequestProfile: () => 'default',
  getMoaModels: () => Promise.resolve(null),
  profileScopeKey: (scope?: null | string) => (scope ?? '').trim() || 'default',
  setModelAssignment: vi.fn(),
  getRecommendedDefaultModel: vi.fn(),
  saveMoaModels: vi.fn(),
  setEnvVar: (key: string, value: string) => setEnvVar(key, value),
  getHermesConfigRecord: () => Promise.resolve({}),
  saveHermesConfig: () => Promise.resolve({ ok: true }),
  setApiRequestProfile: () => {}
}))

vi.mock('@/store/onboarding', () => ({
  startManualLocalEndpoint: vi.fn(),
  startManualOnboarding: vi.fn(),
  startManualProviderOAuth: vi.fn()
}))

vi.mock('../hooks/use-on-profile-switch', () => ({ useOnProfileSwitch: () => {} }))

const ru = TRANSLATIONS.ru.settings.model
const en = TRANSLATIONS.en.settings.model

// A provider picked before it is configured: no models to choose yet.
function pickUnconfigured(provider: Record<string, unknown>) {
  getGlobalModelInfo.mockResolvedValue({ provider: 'mistral', model: '' })
  getGlobalModelOptions.mockResolvedValue({
    providers: [{ name: 'Mistral', slug: 'mistral', models: [], authenticated: false, ...provider }]
  })
}

function renderInRussian() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="ru">
        <QueryClientProvider client={client}>
          <ModelSettings />
        </QueryClientProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  setEnvVar.mockResolvedValue({ ok: true })
})

afterEach(() => {
  cleanup()
  clearNotifications()
  vi.clearAllMocks()
})

describe('ModelSettings provider setup copy', () => {
  it('asks for the key and activates the provider in the UI language', async () => {
    pickUnconfigured({ auth_type: 'api_key', key_env: 'MISTRAL_API_KEY' })
    // Held open so the button stays in its in-progress state.
    setEnvVar.mockReturnValue(new Promise(() => {}))

    renderInRussian()

    const input = await screen.findByPlaceholderText(ru.pasteKeyPlaceholder('MISTRAL_API_KEY'))
    expect(screen.queryByPlaceholderText(en.pasteKeyPlaceholder('MISTRAL_API_KEY'))).toBeNull()

    fireEvent.change(input, { target: { value: 'test-key' } })
    fireEvent.click(screen.getByRole('button', { name: ru.activate }))

    expect(await screen.findByRole('button', { name: ru.activating })).toBeTruthy()
    expect(screen.queryByText(en.activating)).toBeNull()
  })

  it.each([
    ['an API key without an inline field', { auth_type: 'api_key' }, 'needsApiKeyHint'],
    ['a browser sign-in', { auth_type: 'oauth' }, 'oauthHint']
  ] as const)('explains that the provider needs %s in the UI language', async (_, provider, hint) => {
    pickUnconfigured(provider)

    renderInRussian()

    expect(await screen.findByText(ru[hint]('Mistral'))).toBeTruthy()
    expect(screen.queryByText(en[hint]('Mistral'))).toBeNull()
  })
})
