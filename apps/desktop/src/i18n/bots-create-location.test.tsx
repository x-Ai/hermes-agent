import type * as HermesSdk from '@hermes/plugin-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { HermesConnection } from '@/global'
import { I18nProvider } from '@/i18n'
import { registerPluginLocales } from '@/i18n/plugin-i18n'
import { $imagenAvailable } from '@/plugins/hermes-bots/avatar-image'
import { CreateAgentDialog } from '@/plugins/hermes-bots/create-dialog'
import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'
import { translateBotsIn } from '@/plugins/hermes-bots/i18n-test-helper'
import { $connection } from '@/store/session'

// New Bot's "Create on" picker lists the registry's connections. The local
// entry's label is stored as English "This device"; it is registry data, so
// the picker, its "(current)" marker and every sentence naming the picked
// target must read it in the UI language.

const mocks = vi.hoisted(() => ({
  request: vi.fn(async () => ({ skills: [], toolsets: [], mcp_servers: [] })),
  connections: vi.fn(async () => [
    { id: 'local', kind: 'local', label: 'This device' },
    { id: 'homelab', kind: 'ssh', label: 'Homelab' }
  ])
}))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const sdk = await importOriginal<typeof HermesSdk>()

  return { ...sdk, host: { ...sdk.host, request: mocks.request, connections: mocks.connections } }
})

const zh = translateBotsIn('zh')
let dispose: (() => void) | undefined

function mount() {
  dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CreateAgentDialog onClose={() => undefined} open roster={[{ connectionId: 'local', name: 'default' }]} />
      </QueryClientProvider>
    </I18nProvider>
  )
}

/** The picker appears once the registry rows arrive. */
async function createOnPicker(): Promise<HTMLElement> {
  const label = await screen.findByText(zh('editor.createOn'))

  return within(label.parentElement!).getByRole('combobox')
}

beforeAll(() => {
  // Radix Select scrolls and captures the pointer when it opens; jsdom has neither.
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
  $imagenAvailable.set(false)
})

afterEach(() => {
  cleanup()
  dispose?.()
  $connection.set(null)
})

describe('New Bot "Create on" picker', () => {
  it('names This device in the UI language when the window runs on it', async () => {
    mount()
    const picker = await createOnPicker()

    expect(picker.textContent).toBe('本设备（当前）')

    fireEvent.click(picker)

    expect(screen.getByRole('option', { name: '本设备（当前）' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Homelab' })).toBeTruthy()
    expect(screen.queryAllByText(/This device/)).toEqual([])
  })

  it('names This device in the UI language as the target from another gateway', async () => {
    $connection.set({ connectionId: 'homelab', mode: 'remote' } as HermesConnection)
    mount()
    const picker = await createOnPicker()

    expect(picker.textContent).toBe('Homelab（当前）')

    fireEvent.click(picker)
    fireEvent.click(screen.getByRole('option', { name: '本设备' }))

    expect(picker.textContent).toBe('本设备')
    expect(screen.getByText(zh('editor.remoteHint', '本设备'))).toBeTruthy()
    expect(screen.queryAllByText(/This device/)).toEqual([])
  })
})
