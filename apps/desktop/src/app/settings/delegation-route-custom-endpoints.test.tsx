/** The fork's custom endpoints in the subagent route: `delegation.use_custom_endpoints` offers the
 *  owner's `providers:` entries as a labelled group with their models (probing one the normal catalog
 *  load left empty, as the Model page does); off, they are withheld with a hint, except a route
 *  already saved on one, which stays readable. */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HermesConfigRecord } from '@/types/hermes'

const getGlobalModelOptions = vi.fn()
vi.mock('@/hermes', async () => ({
  ...(await vi.importActual('@/api/client')),
  getGlobalModelOptions: (...args: unknown[]) => getGlobalModelOptions(...args)
}))
const { DelegationRouteRow } = await import('./delegation-route-row')

const relay = {
  aliases: ['custom:my-relay', 'my relay', 'my-relay'],
  api_url: 'https://relay.invalid/v1',
  is_user_defined: true,
  models: ['relay-a', 'relay-b'],
  name: 'My Relay',
  slug: 'my-relay',
  source: 'user-config'
}

// Not the current endpoint: the normal load lists it without models.
const bare = { ...relay, aliases: ['custom:bare-relay'], models: [], name: 'Bare Relay', slug: 'bare-relay' }
const catalog = { providers: [{ name: 'OpenAI', slug: 'openai', models: ['gpt-5.1'] }, relay, bare] }
const refreshed = { providers: [...catalog.providers.slice(0, 2), { ...bare, models: ['bare-1'] }] }

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
})
beforeEach(() => {
  getGlobalModelOptions
    .mockReset()
    .mockImplementation((opts?: { refresh?: boolean }) => Promise.resolve(opts?.refresh ? refreshed : catalog))
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function mount(config: HermesConfigRecord) {
  const onConfigChange = vi.fn()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } })

  render(
    <QueryClientProvider client={client}>
      <DelegationRouteRow config={config} onConfigChange={onConfigChange} />
    </QueryClientProvider>
  )

  return onConfigChange
}

async function openProviders() {
  fireEvent.click(screen.getByLabelText('Subagent Provider'))
  await screen.findByRole('option', { name: 'OpenAI' })
}

async function pickModel(name: string) {
  fireEvent.click(screen.getByLabelText('Subagent Model'))
  fireEvent.click(await screen.findByRole('option', { name }))
}

describe('the subagent route offers the custom endpoints', () => {
  it('lists them as their own group and routes to one with a model it serves', async () => {
    const onConfigChange = mount({ delegation: { use_custom_endpoints: true } })
    await openProviders()
    expect(screen.getByText('Custom endpoints')).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'My Relay' }))
    await pickModel('relay-b')
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onConfigChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ delegation: expect.objectContaining({ model: 'relay-b', provider: 'my-relay' }) })
    )
    expect(getGlobalModelOptions).not.toHaveBeenCalledWith({ refresh: true }, undefined)
  })

  it('probes an endpoint the normal catalog load left without models, once', async () => {
    mount({ delegation: { use_custom_endpoints: true } })
    await openProviders()
    fireEvent.click(screen.getByRole('option', { name: 'Bare Relay' }))
    await pickModel('bare-1')
    expect(getGlobalModelOptions.mock.calls.filter(([opts]) => opts?.refresh)).toHaveLength(1)
    expect((screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('withholds them while the setting is off, keeps the built-in providers and says why', async () => {
    mount({ delegation: { use_custom_endpoints: false } })
    await openProviders()
    expect(screen.queryByRole('option', { name: 'My Relay' })).toBeNull()
    expect(screen.queryByText('Custom endpoints')).toBeNull()
    expect(screen.getByText(/Suggest Custom Endpoints for Subagents/)).toBeTruthy()
    expect(getGlobalModelOptions).not.toHaveBeenCalledWith({ refresh: true }, undefined)
  })

  it('keeps a route already saved on a custom endpoint readable while the setting is off', async () => {
    mount({ delegation: { model: 'relay-a', provider: 'my-relay' } })
    await waitFor(() => expect(screen.getByText('My Relay')).toBeTruthy())
    await pickModel('relay-b')
    expect((screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(false)
    expect(screen.queryByText(/Suggest Custom Endpoints for Subagents/)).toBeTruthy()
  })
})
