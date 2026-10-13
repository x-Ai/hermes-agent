/**
 * The Bot Mode model picker's catalog is cached (#95279), so it must still
 * refresh when the app says the inventory changed: Settings invalidates the
 * core `['model-options']` prefix after every config save (a custom endpoint
 * deleted or edited), a main-model change and a free-tier sign-in. Keyed under
 * its own prefix, the picker kept offering a deleted endpoint for two minutes
 * and only dropped it on a cold reopen.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'

import { translateBots } from './i18n-test-helper'
import { ModelPicker } from './model-picker'
import type { RosterRow } from './types'

const { hostMock } = vi.hoisted(() => ({
  hostMock: {
    request: vi.fn(),
    requestProfile: vi.fn(),
    state: { connectionId: { get: () => 'local' }, gateway: { get: () => 'open' }, profile: { get: () => 'default' } }
  }
}))

vi.mock('@hermes/plugin-sdk', async () => {
  const { useQuery } = await import('@tanstack/react-query')
  const { catalogProviderMatches, useI18n } = await vi.importActual<typeof HermesSdk>('@hermes/plugin-sdk')

  return {
    Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
    catalogProviderMatches,
    GlyphSpinner: () => <span data-testid="spinner" />,
    host: hostMock,
    Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
    Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectValue: () => null,
    useI18n,
    usePluginI18n: () => translateBots,
    useQuery
  }
})

vi.mock('./shared', () => ({ ID: 'hermes-bots' }))

let client: QueryClient

beforeEach(() => {
  vi.clearAllMocks()
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

function mount() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  return render(
    <ModelPicker bot={{ name: 'default' } as RosterRow} onChange={vi.fn()} value={{ model: '', provider: '' }} />,
    { wrapper }
  )
}

it('drops a deleted custom endpoint as soon as the app invalidates the core model-options prefix', async () => {
  hostMock.request.mockResolvedValueOnce({
    providers: [
      { models: ['m1'], name: 'Magpie', slug: 'magpie' },
      { models: ['m2'], name: 'Keeper', slug: 'keeper' }
    ]
  })

  mount()

  await waitFor(() => expect(screen.getByText(/Magpie/)).toBeTruthy())
  expect(hostMock.request).toHaveBeenCalledTimes(1)

  // Settings deleted "magpie": the save handler invalidates ['model-options'].
  hostMock.request.mockResolvedValueOnce({ providers: [{ models: ['m2'], name: 'Keeper', slug: 'keeper' }] })
  await client.invalidateQueries({ queryKey: ['model-options'] })

  await waitFor(() => expect(screen.queryByText(/Magpie/)).toBeNull())
  expect(screen.getByText(/Keeper/)).toBeTruthy()
  expect(hostMock.request).toHaveBeenCalledTimes(2)
})

it('keeps its cache entry apart from the core picker rows for the same gateway', async () => {
  hostMock.request.mockResolvedValue({ providers: [{ models: ['m1'], name: 'Magpie', slug: 'magpie' }] })

  mount()
  await waitFor(() => expect(hostMock.request).toHaveBeenCalledTimes(1))

  const keys = client
    .getQueryCache()
    .getAll()
    .map(query => query.queryKey)

  // Core prefix first (so core invalidations reach it), then a segment no
  // profile id can collide with — the local-runtime job watcher matches
  // `queryKey[1]` against a profile name.
  expect(keys).toEqual([['model-options', 'plugin:hermes-bots', 'active']])
})
