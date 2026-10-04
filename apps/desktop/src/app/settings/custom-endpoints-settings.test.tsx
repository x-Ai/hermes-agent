// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type I18nContextValue, I18nProvider, useI18n } from '@/i18n'
import { en } from '@/i18n/en'
import type { CustomEndpointsResponse } from '@/types/hermes'

const getCustomEndpoints = vi.fn()
const saveCustomEndpoint = vi.fn()
const validateCustomEndpoint = vi.fn()
const notify = vi.fn()
const notifyError = vi.fn()
const triggerHaptic = vi.fn()

vi.mock('@/store/profile', () => ({
  $activeGatewayProfile: atom('default'),
  $profiles: atom([]),
  refreshProfiles: async () => {},
  normalizeProfileKey: (p: string | null) => p || 'default',
  profileLabel: (p: { display_name?: string; name: string }) => p.display_name || p.name
}))

vi.mock('@/hermes', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  activateCustomEndpoint: vi.fn(),
  deleteCustomEndpoint: vi.fn(),
  getCustomEndpoints: (...args: unknown[]) => getCustomEndpoints(...args),
  getProfiles: async () => ({ profiles: (await import('@/store/profile')).$profiles.get() }),
  saveCustomEndpoint: (...args: unknown[]) => saveCustomEndpoint(...args),
  setApiRequestProfile: vi.fn(),
  validateCustomEndpoint: (...args: unknown[]) => validateCustomEndpoint(...args)
}))
vi.mock('@/lib/haptics', () => ({ triggerHaptic: (...args: unknown[]) => triggerHaptic(...args) }))
vi.mock('@/store/notifications', () => ({
  notify: (...args: unknown[]) => notify(...args),
  notifyError: (...args: unknown[]) => notifyError(...args)
}))

// Load once at module scope so no test's 15s budget pays the heavy transform
// + import (the first-test timeout flake under CI load).
const { CustomEndpointsSettings } = await import('./custom-endpoints-settings')
const { $activeGatewayProfile, $profiles } = await import('@/store/profile')
const { $settingsScopeOverride } = await import('@/store/settings-scope')

const emptyResponse: CustomEndpointsResponse = {
  current: { base_url: '', model: '', provider: '' },
  endpoints: []
}

const savedResponse: CustomEndpointsResponse = {
  current: { base_url: 'http://profile-a.test/v1', model: 'model-a', provider: 'profile-a-endpoint' },
  endpoints: [
    {
      base_url: 'http://profile-a.test/v1',
      discover_models: true,
      has_api_key: false,
      id: 'profile-a-endpoint',
      is_current: true,
      model: 'model-a',
      models: ['model-a'],
      name: 'Profile A'
    }
  ],
  id: 'profile-a-endpoint',
  ok: true
}

beforeEach(() => {
  $activeGatewayProfile.set('default')
  $settingsScopeOverride.set(null)
  $profiles.set([])
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  $settingsScopeOverride.set(null)
})

describe('CustomEndpointsSettings', () => {
  it('localizes endpoint editing on language changes without changing transport or draft identifiers', async () => {
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    saveCustomEndpoint.mockResolvedValue(savedResponse)
    let language!: I18nContextValue

    function Surface() {
      language = useI18n()

      return <CustomEndpointsSettings />
    }

    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <Surface />
      </I18nProvider>
    )
    await screen.findByText('暂无自定义端点')
    const nameInput = screen.getByRole('textbox', { name: '名称' })
    const providerIdInput = screen.getByPlaceholderText('axet-proxy')

    expect(nameInput.closest('label')?.classList.contains('content-start')).toBe(true)
    expect(providerIdInput.closest('label')?.classList.contains('content-start')).toBe(true)
    fireEvent.change(nameInput, { target: { value: 'Fixture Ω' } })
    fireEvent.change(screen.getByRole('textbox', { name: '端点 URL' }), { target: { value: 'http://fixture.test/v1' } })
    fireEvent.change(screen.getByRole('combobox', { name: '默认模型' }), { target: { value: 'fixture-model' } })
    fireEvent.click(screen.getByRole('button', { name: 'Responses API' }))
    await act(() => language.setLocale('zh-hant'))
    expect((screen.getByRole('textbox', { name: '名稱' }) as HTMLInputElement).value).toBe('Fixture Ω')
    expect(screen.getByText(language.t.settings.customEndpoints.apiModeLabel)).toBeTruthy()
    expect(screen.getByRole('button', { name: language.t.settings.customEndpoints.apiModeAuto })).toBeTruthy()
    expect(saveCustomEndpoint).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '儲存' }))
    expect(saveCustomEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fixture Ω',
        api_mode: 'codex_responses',
        base_url: 'http://fixture.test/v1',
        model: 'fixture-model'
      }),
      'default'
    )
  })

  it('sends the chosen API mode and discovered alias metadata on Save (#93622)', async () => {
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    validateCustomEndpoint.mockResolvedValue({
      message: '',
      model_details: [
        { id: 'gpt-5.6-sol' },
        { canonical_model: 'gpt-5.6-sol', id: 'gpt-5.6-sol-high', reasoning_effort: 'high' }
      ],
      models: ['gpt-5.6-sol', 'gpt-5.6-sol-high'],
      ok: true,
      reachable: true,
      transport_checked: 'codex_responses'
    })
    saveCustomEndpoint.mockResolvedValue(savedResponse)

    render(<CustomEndpointsSettings />)

    await screen.findByText('No custom endpoints')
    fireEvent.change(screen.getByPlaceholderText('Axet Proxy'), { target: { value: 'Responses gateway' } })
    fireEvent.change(screen.getByPlaceholderText('http://127.0.0.1:8081/v1'), {
      target: { value: 'https://responses-gateway.example.com/v1' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Responses API' }))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Test' }))
    })
    fireEvent.change(screen.getByPlaceholderText('gpt-5.4'), { target: { value: 'gpt-5.6-sol-high' } })
    fireEvent.click(screen.getByRole('button', { name: en.settings.customEndpoints.save }))

    expect(validateCustomEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({ api_mode: 'codex_responses' }),
      'default'
    )
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }))
    expect(saveCustomEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        api_mode: 'codex_responses',
        model: 'gpt-5.6-sol-high',
        model_details: expect.arrayContaining([
          expect.objectContaining({ canonical_model: 'gpt-5.6-sol', id: 'gpt-5.6-sol-high', reasoning_effort: 'high' })
        ]),
        models: ['gpt-5.6-sol', 'gpt-5.6-sol-high']
      }),
      'default'
    )
  })

  it('preserves custom auth, user-agent, and per-model token limits when saving', async () => {
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    saveCustomEndpoint.mockResolvedValue(savedResponse)
    const { CustomEndpointsSettings } = await import('./custom-endpoints-settings')

    render(<CustomEndpointsSettings />)

    await screen.findByText('No custom endpoints')
    fireEvent.change(screen.getByPlaceholderText('Axet Proxy'), { target: { value: 'Private relay' } })
    fireEvent.change(screen.getByPlaceholderText('http://127.0.0.1:8081/v1'), {
      target: { value: 'https://relay.example/v1' }
    })
    fireEvent.change(screen.getByPlaceholderText('gpt-5.4'), { target: { value: 'claude-fable-5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Anthropic Messages' }))
    fireEvent.click(screen.getByRole('button', { name: 'Authorization: Bearer' }))
    fireEvent.change(screen.getByLabelText(`${en.settings.customEndpoints.contextWindowLabel}: claude-fable-5`), {
      target: { value: '200000' }
    })
    fireEvent.change(screen.getByLabelText(`${en.settings.customEndpoints.maxInputLabel}: claude-fable-5`), {
      target: { value: '180000' }
    })
    fireEvent.change(screen.getByLabelText(`${en.settings.customEndpoints.maxOutputLabel}: claude-fable-5`), {
      target: { value: '20000' }
    })
    fireEvent.change(
      screen.getByPlaceholderText(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
      ),
      {
        target: { value: 'Hermes Desktop Test' }
      }
    )
    fireEvent.change(screen.getByLabelText(`${en.settings.customEndpoints.maxOutputLabel}: All models (default)`), {
      target: { value: '32000' }
    })
    fireEvent.change(screen.getByLabelText('Vision: claude-fable-5'), { target: { value: 'yes' } })
    fireEvent.click(screen.getByRole('button', { name: en.settings.customEndpoints.addHeader }))
    fireEvent.change(screen.getByPlaceholderText(en.settings.customEndpoints.headerNamePlaceholder), {
      target: { value: 'X-Tenant' }
    })
    fireEvent.change(screen.getByPlaceholderText(en.settings.customEndpoints.headerValuePlaceholder), {
      target: { value: 't1' }
    })
    fireEvent.change(screen.getByPlaceholderText('{"chat_template_kwargs": {"enable_thinking": false}}'), {
      target: { value: '{"thinking": {"type": "disabled"}}' }
    })
    fireEvent.click(screen.getByRole('button', { name: en.settings.customEndpoints.save }))

    expect(saveCustomEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        api_mode: 'anthropic_messages',
        auth_scheme: 'bearer',
        default_token_limits: { context_length: null, max_input_tokens: null, max_output_tokens: 32000 },
        extra_body: { thinking: { type: 'disabled' } },
        extra_headers: { 'User-Agent': 'Hermes Desktop Test', 'X-Tenant': 't1' },
        model_capabilities: { 'claude-fable-5': { supports_reasoning: null, supports_vision: true } },
        model_token_limits: {
          'claude-fable-5': {
            context_length: 200000,
            max_input_tokens: 180000,
            max_output_tokens: 20000
          }
        }
      }),
      'default'
    )
    // A fresh endpoint never carries an implicit browser identity.
    expect(saveCustomEndpoint.mock.calls[0][0].extra_headers['User-Agent']).toBe('Hermes Desktop Test')
  })

  it('does not send a User-Agent unless the user set one', async () => {
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    saveCustomEndpoint.mockResolvedValue(savedResponse)
    const { CustomEndpointsSettings } = await import('./custom-endpoints-settings')

    render(<CustomEndpointsSettings />)

    await screen.findByText('No custom endpoints')
    fireEvent.change(screen.getByPlaceholderText('Axet Proxy'), { target: { value: 'Plain relay' } })
    fireEvent.change(screen.getByPlaceholderText('http://127.0.0.1:8081/v1'), {
      target: { value: 'https://relay.example/v1' }
    })
    fireEvent.change(screen.getByPlaceholderText('gpt-5.4'), { target: { value: 'm1' } })
    fireEvent.click(screen.getByRole('button', { name: en.settings.customEndpoints.save }))

    expect(saveCustomEndpoint.mock.calls[0][0].extra_headers).toEqual({})
  })

  it('loads and saves endpoints for the Settings Applies-to profile, not only the active bot', async () => {
    $activeGatewayProfile.set('carousel-director')
    $settingsScopeOverride.set('content-studio')
    $profiles.set(
      ['carousel-director', 'content-studio'].map(name => ({
        name,
        has_env: false,
        is_default: false,
        model: null,
        path: '',
        provider: null,
        skill_count: 0
      }))
    )
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    saveCustomEndpoint.mockResolvedValue(savedResponse)

    render(<CustomEndpointsSettings />)

    await waitFor(() => expect(getCustomEndpoints).toHaveBeenCalledWith('content-studio'))
    expect(screen.getByText('Applies to')).toBeTruthy()

    fireEvent.change(await screen.findByPlaceholderText('Axet Proxy'), { target: { value: 'Studio gateway' } })
    fireEvent.change(await screen.findByPlaceholderText('http://127.0.0.1:8081/v1'), {
      target: { value: 'https://studio.example.com/v1' }
    })
    fireEvent.change(await screen.findByPlaceholderText('gpt-5.4'), { target: { value: 'studio-model' } })
    fireEvent.click(screen.getByRole('button', { name: en.settings.customEndpoints.save }))

    expect(saveCustomEndpoint).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Studio gateway' }),
      'content-studio'
    )
  })

  it('hydrates the API mode from a saved endpoint', async () => {
    getCustomEndpoints.mockResolvedValue({
      ...savedResponse,
      endpoints: [
        {
          ...savedResponse.endpoints[0],
          api_mode: 'anthropic_messages',
          auth_scheme: 'bearer',
          model_token_limits: {
            'model-a': { context_length: 128000, max_input_tokens: 96000, max_output_tokens: 32000 }
          },
          user_agent: 'Existing relay agent'
        }
      ]
    })

    render(<CustomEndpointsSettings />)

    await screen.findByText('Profile A')
    expect(screen.getByRole('button', { name: 'Anthropic Messages' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Authorization: Bearer' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByPlaceholderText('axet-proxy')).toHaveProperty('disabled', true)
    expect(screen.getByLabelText(`${en.settings.customEndpoints.contextWindowLabel}: model-a`)).toHaveProperty(
      'value',
      '128000'
    )
    expect(screen.getByLabelText(`${en.settings.customEndpoints.maxInputLabel}: model-a`)).toHaveProperty(
      'value',
      '96000'
    )
    expect(screen.getByLabelText(`${en.settings.customEndpoints.maxOutputLabel}: model-a`)).toHaveProperty(
      'value',
      '32000'
    )
    expect(screen.getByDisplayValue('Existing relay agent')).toBeTruthy()
  })

  it('drops a pending save completion after its profile-scoped view unmounts', async () => {
    let resolveSave!: (value: CustomEndpointsResponse) => void
    saveCustomEndpoint.mockReturnValue(new Promise(resolve => (resolveSave = resolve)))
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    const onConfigSaved = vi.fn()
    const onMainModelChanged = vi.fn()

    const view = render(
      <CustomEndpointsSettings onConfigSaved={onConfigSaved} onMainModelChanged={onMainModelChanged} />
    )

    await screen.findByText('No custom endpoints')
    fireEvent.change(screen.getByPlaceholderText('Axet Proxy'), { target: { value: 'Profile A' } })
    fireEvent.change(screen.getByPlaceholderText('http://127.0.0.1:8081/v1'), {
      target: { value: 'http://profile-a.test/v1' }
    })
    fireEvent.change(screen.getByPlaceholderText('gpt-5.4'), { target: { value: 'model-a' } })
    fireEvent.click(screen.getByRole('button', { name: en.settings.customEndpoints.save }))
    expect(saveCustomEndpoint).toHaveBeenCalledTimes(1)

    // SettingsView keys ProvidersSettings by the selected profile, so a profile
    // switch unmounts this instance while its already-routed write is pending.
    view.unmount()
    await act(async () => resolveSave(savedResponse))

    expect(onMainModelChanged).not.toHaveBeenCalled()
    expect(onConfigSaved).not.toHaveBeenCalled()
    expect(triggerHaptic).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
    expect(notifyError).not.toHaveBeenCalled()
  })

  it('Test rewrites the URL field to the base that actually served /models (#65488)', async () => {
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    validateCustomEndpoint.mockResolvedValue({
      ok: true,
      message: '',
      models: ['model-a'],
      resolved_base_url: 'http://h.test/v1'
    })
    render(<CustomEndpointsSettings onConfigSaved={vi.fn()} onMainModelChanged={vi.fn()} />)

    await screen.findByText('No custom endpoints')
    const urlInput = screen.getByPlaceholderText<HTMLInputElement>('http://127.0.0.1:8081/v1')
    fireEvent.change(urlInput, { target: { value: 'http://h.test' } })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Test' })))

    // Save stores form.baseUrl verbatim and chat POSTs {base_url}/chat/completions, so the
    // typed bare root would 404 every request even though the test looked green.
    expect(urlInput.value).toBe('http://h.test/v1')
  })

  it('shows detected limits as placeholders by source and fills them into empty cells on request', async () => {
    getCustomEndpoints.mockResolvedValue(emptyResponse)
    validateCustomEndpoint.mockResolvedValue({
      ok: true,
      message: '',
      models: ['glm-5.3'],
      model_details: [
        {
          id: 'glm-5.3',
          catalog_ref: 'zai/glm-5.3',
          context_length: 131072,
          max_output_tokens: 128000,
          supports_reasoning: true,
          supports_vision: false,
          sources: {
            context_length: 'endpoint',
            max_output_tokens: 'catalog',
            supports_reasoning: 'catalog',
            supports_vision: 'catalog'
          }
        }
      ]
    })
    render(<CustomEndpointsSettings />)

    await screen.findByText('No custom endpoints')
    const fill = screen.getByRole<HTMLButtonElement>('button', { name: en.settings.customEndpoints.fillDetected })
    expect(fill.disabled).toBe(true)
    fireEvent.change(screen.getByPlaceholderText('http://127.0.0.1:8081/v1'), {
      target: { value: 'https://relay.example/v1' }
    })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Test' })))

    const ce = en.settings.customEndpoints
    const context = screen.getByLabelText<HTMLInputElement>(`${ce.contextWindowLabel}: glm-5.3`)
    const output = screen.getByLabelText<HTMLInputElement>(`${ce.maxOutputLabel}: glm-5.3`)
    const input = screen.getByLabelText<HTMLInputElement>(`${ce.maxInputLabel}: glm-5.3`)
    // "Auto" = what the runtime resolves on its own; "Suggested" = a catalog value that only
    // applies once filled in; nothing detected = the plain Auto placeholder.
    expect(context.placeholder).toBe('Auto · 131,072')
    expect(context.title).toBe('Source: reported by the endpoint')
    expect(output.placeholder).toBe('Suggested · 128,000')
    expect(output.title).toBe('Source: models.dev match: zai/glm-5.3')
    expect(input.placeholder).toBe('Auto')
    const vision = screen.getByLabelText<HTMLSelectElement>('Vision: glm-5.3')
    expect(vision.options[0].text).toBe('Auto (No)')
    expect(vision.value).toBe('')

    expect(fill.disabled).toBe(false)
    fireEvent.change(context, { target: { value: '100000' } })
    fireEvent.click(fill)

    // Empty cells take the detected values; the cell the user typed is left alone.
    expect(context.value).toBe('100000')
    expect(output.value).toBe('128000')
    expect(input.value).toBe('')
    expect(vision.value).toBe('no')
    expect(screen.getByLabelText<HTMLSelectElement>('Reasoning: glm-5.3').value).toBe('yes')
  })

  it("loads a saved endpoint's resolved details as placeholders without a Test", async () => {
    getCustomEndpoints.mockResolvedValue({
      ...savedResponse,
      endpoints: [
        {
          ...savedResponse.endpoints[0],
          model_details: [{ id: 'model-a', context_length: 200000, sources: { context_length: 'catalog_provider' } }]
        }
      ]
    })
    render(<CustomEndpointsSettings />)

    const context = await screen.findByLabelText<HTMLInputElement>(
      `${en.settings.customEndpoints.contextWindowLabel}: model-a`
    )

    expect(context.placeholder).toBe('Auto · 200,000')
    expect(context.title).toBe('Source: catalog provider')
  })
})
