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
  model: 'gmi/model-1',
  model_context_lengths: {
    'gmi/model-1': 204800,
    'gmi/model-2': 1048576
  },
  model_token_limits: {
    'gmi/model-1': {
      context_length: 204800,
      max_input_tokens: 180000,
      max_output_tokens: 128000
    },
    'gmi/model-2': {
      context_length: 1048576,
      max_input_tokens: 900000,
      max_output_tokens: 64000
    }
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

  it('round-trips all three exact-model limits and clears one value back to auto', async () => {
    mocks.get.mockResolvedValue({ ...EMPTY_RESPONSE, endpoints: [SAVED_ENDPOINT] })
    renderSettings()

    const maxOutput = await screen.findByLabelText('Max Output: gmi/model-1')
    expect(maxOutput).toHaveProperty('value', '128000')
    fireEvent.change(maxOutput, { target: { value: '64000' } })
    const maxInput = screen.getByLabelText('Max Input: gmi/model-1')
    expect(maxInput).toHaveProperty('value', '180000')
    fireEvent.change(maxInput, { target: { value: '160000' } })
    const firstContext = screen.getByLabelText('Total Context: gmi/model-1')
    const secondContext = screen.getByLabelText('Total Context: gmi/model-2')
    expect(firstContext).toHaveProperty('value', '204800')
    expect(secondContext).toHaveProperty('value', '1048576')
    fireEvent.change(firstContext, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1))
    const payload = mocks.save.mock.calls[0][0]
    expect(payload).not.toHaveProperty('max_output_tokens')
    expect(payload).not.toHaveProperty('model_context_lengths')
    expect(payload.model_token_limits).toEqual({
      'gmi/model-1': {
        context_length: null,
        max_input_tokens: 160000,
        max_output_tokens: 64000
      },
      'gmi/model-2': {
        context_length: 1048576,
        max_input_tokens: 900000,
        max_output_tokens: 64000
      }
    })
  })

  it('keeps same-name model limits scoped to the endpoint when switching, saving and clearing', async () => {
    const model = 'shared-model'

    const first: CustomEndpoint = {
      ...SAVED_ENDPOINT,
      model,
      model_context_lengths: {},
      model_token_limits: { [model]: SAVED_ENDPOINT.model_token_limits[SAVED_ENDPOINT.model] },
      models: [model]
    }

    const second: CustomEndpoint = {
      ...first,
      base_url: 'https://second.example/v1',
      id: 'second',
      is_current: false,
      model_token_limits: {},
      name: 'Second provider'
    }

    const secondLimits = { context_length: 96000, max_input_tokens: 80000, max_output_tokens: 16000 }
    const savedSecond = { ...second, model_token_limits: { [model]: secondLimits } }
    const fields = ['Total Context', 'Max Input', 'Max Output']

    const expectLimits = (values: (number | string)[]) => {
      fields.forEach((field, index) => {
        expect(screen.getByLabelText(`${field}: ${model}`)).toHaveProperty('value', String(values[index]))
      })
    }

    mocks.get.mockResolvedValue({ ...EMPTY_RESPONSE, endpoints: [first, second] })
    mocks.save
      .mockResolvedValueOnce({
        ...EMPTY_RESPONSE,
        endpoints: [first, savedSecond],
        id: second.id,
        ok: true
      })
      .mockResolvedValueOnce({
        ...EMPTY_RESPONSE,
        endpoints: [{ ...first, model_token_limits: {} }, savedSecond],
        id: first.id,
        ok: true
      })
    renderSettings()

    await screen.findByLabelText(`Total Context: ${model}`)
    expectLimits(Object.values(first.model_token_limits[model]))
    fireEvent.click(screen.getByRole('button', { name: /Second provider/ }))
    expectLimits(['', '', ''])
    fields.forEach((field, index) => {
      fireEvent.change(screen.getByLabelText(`${field}: ${model}`), {
        target: { value: String(Object.values(secondLimits)[index]) }
      })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mocks.save).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: second.id, model_token_limits: { [model]: secondLimits } })
      )
    )

    fireEvent.click(screen.getByRole('button', { name: /GMI Cloud MaaS/ }))
    expectLimits(Object.values(first.model_token_limits[model]))
    fields.forEach(field => {
      fireEvent.change(screen.getByLabelText(`${field}: ${model}`), { target: { value: '' } })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mocks.save).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: first.id,
          model_token_limits: {
            [model]: { context_length: null, max_input_tokens: null, max_output_tokens: null }
          }
        })
      )
    )

    fireEvent.click(screen.getByRole('button', { name: /Second provider/ }))
    expectLimits(Object.values(secondLimits))
    fireEvent.click(screen.getByRole('button', { name: /GMI Cloud MaaS/ }))
    expectLimits(['', '', ''])
  })
})
