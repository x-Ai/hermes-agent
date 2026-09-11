import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import type { CustomEndpoint, CustomEndpointsResponse } from '@/types/hermes'

import { CustomEndpointsSettings } from './custom-endpoints-settings'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  notify: vi.fn(),
  notifyError: vi.fn(),
  save: vi.fn(),
  validate: vi.fn()
}))

vi.mock('@/hermes', () => ({
  activateCustomEndpoint: vi.fn(),
  deleteCustomEndpoint: vi.fn(),
  getCustomEndpoints: () => mocks.get(),
  saveCustomEndpoint: (endpoint: unknown) => mocks.save(endpoint),
  validateCustomEndpoint: (endpoint: unknown) => mocks.validate(endpoint)
}))

vi.mock('@/lib/haptics', () => ({
  triggerHaptic: vi.fn()
}))

vi.mock('@/store/notifications', () => ({
  notify: (...args: unknown[]) => mocks.notify(...args),
  notifyError: (...args: unknown[]) => mocks.notifyError(...args)
}))

const EMPTY_RESPONSE: CustomEndpointsResponse = {
  current: { base_url: '', model: '', provider: '' },
  endpoints: []
}

const SAVED_ENDPOINT: CustomEndpoint = {
  api_key_preview: '${HERMES_CUSTOM_ENDPOINT_GMI_API_KEY}',
  base_url: 'https://api.gmi.example/v1',
  discover_models: true,
  has_api_key: true,
  id: 'gmi',
  is_current: true,
  max_output_tokens: 128000,
  model: 'gmi/model-1',
  model_context_lengths: {
    'gmi/model-1': 204800,
    'gmi/model-2': 1048576
  },
  models: ['gmi/model-1', 'gmi/model-2'],
  name: 'GMI Cloud MaaS',
  source: 'providers'
}

function renderSettings() {
  return render(
    <I18nProvider configClient={null} initialLocale="en">
      <CustomEndpointsSettings />
    </I18nProvider>
  )
}

describe('CustomEndpointsSettings', () => {
  beforeEach(() => {
    mocks.get.mockResolvedValue(EMPTY_RESPONSE)
    mocks.save.mockResolvedValue({
      ...EMPTY_RESPONSE,
      current: {
        base_url: SAVED_ENDPOINT.base_url,
        model: SAVED_ENDPOINT.model,
        provider: SAVED_ENDPOINT.id
      },
      endpoints: [SAVED_ENDPOINT],
      id: SAVED_ENDPOINT.id,
      ok: true
    })
    mocks.validate.mockResolvedValue({ message: '', models: [], ok: true, reachable: true })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('top-aligns the name and provider fields when the provider hint adds a third row', async () => {
    renderSettings()

    const nameInput = await screen.findByLabelText('Name')
    const fieldRow = nameInput.closest('label')?.parentElement

    expect(fieldRow?.classList.contains('items-start')).toBe(true)
    expect(screen.getByLabelText(/Provider ID/)).toBeTruthy()
  })

  it('tests a saved endpoint by id after its API key has been cleared from the form', async () => {
    renderSettings()

    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: SAVED_ENDPOINT.name } })
    fireEvent.change(screen.getByLabelText(/Provider ID/), { target: { value: SAVED_ENDPOINT.id } })
    fireEvent.change(screen.getByLabelText('Endpoint URL'), { target: { value: SAVED_ENDPOINT.base_url } })
    fireEvent.change(screen.getByLabelText('Default Model'), { target: { value: SAVED_ENDPOINT.model } })
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'sk-new-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByLabelText('API Key')).toHaveProperty('value', ''))

    fireEvent.click(screen.getByRole('button', { name: 'Test' }))

    await waitFor(() =>
      expect(mocks.validate).toHaveBeenCalledWith(
        expect.objectContaining({ api_key: undefined, id: SAVED_ENDPOINT.id })
      )
    )
  })

  it('round-trips output limits and clears one model context back to auto', async () => {
    mocks.get.mockResolvedValue({ ...EMPTY_RESPONSE, endpoints: [SAVED_ENDPOINT] })
    renderSettings()

    const maxOutput = await screen.findByLabelText(/Max Output Tokens/)
    expect(maxOutput).toHaveProperty('value', '128000')
    fireEvent.change(maxOutput, { target: { value: '64000' } })
    const firstContext = screen.getByLabelText('Model Context: gmi/model-1')
    const secondContext = screen.getByLabelText('Model Context: gmi/model-2')
    expect(firstContext).toHaveProperty('value', '204800')
    expect(secondContext).toHaveProperty('value', '1048576')
    fireEvent.change(firstContext, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          max_output_tokens: 64000,
          model_context_lengths: {
            'gmi/model-1': null,
            'gmi/model-2': 1048576
          }
        })
      )
    )
  })
})
