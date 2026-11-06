import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DesktopConnectionsRegistry } from '@/global'
import { I18nProvider } from '@/i18n'
import { $notifications, clearNotifications } from '@/store/notifications'

import { ConnectionsRegistrySection } from './connections-registry'

// Settings → Connections toasts, read in Chinese. The local entry's registry
// label is English data ("This device"); every toast that names a connection
// must name the local one in the UI language.

const list = vi.fn()
const test = vi.fn()
const updateAll = vi.fn()

const registry: DesktopConnectionsRegistry = {
  connections: [
    { id: 'local', kind: 'local', label: 'This device', tokenPreview: null, tokenSet: false },
    {
      authMode: 'token',
      id: 'homelab',
      kind: 'remote',
      label: 'Homelab',
      tokenPreview: '...abc123',
      tokenSet: true,
      url: 'http://homelab.lan:9119'
    }
  ],
  primary: 'local',
  secureTokenStorage: true,
  version: 2
}

function mountInChinese() {
  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      <ConnectionsRegistrySection />
    </I18nProvider>
  )
}

function toastText(): string {
  return $notifications
    .get()
    .map(toast => [toast.title, toast.message, toast.detail].join('\n'))
    .join('\n')
}

beforeEach(() => {
  list.mockResolvedValue(registry)
  Object.defineProperty(window, 'hermesDesktop', {
    configurable: true,
    value: { connections: { list, test, updateAll } }
  })
})

afterEach(() => {
  cleanup()
  clearNotifications()
  vi.clearAllMocks()
})

describe('ConnectionsRegistrySection toasts name This device in the UI language', () => {
  it('titles the local row of Update all', async () => {
    updateAll.mockResolvedValue({
      ok: true,
      results: [
        { connectionId: 'local', kind: 'local', label: 'This device', ok: true },
        { connectionId: 'homelab', kind: 'remote', label: 'Homelab', ok: true }
      ]
    })
    mountInChinese()

    fireEvent.click(await screen.findByRole('button', { name: '更新所有实例' }))

    await waitFor(() => expect($notifications.get()).toHaveLength(2))
    expect($notifications.get().map(toast => toast.title)).toEqual(expect.arrayContaining(['本设备', 'Homelab']))
    expect(toastText()).not.toContain('This device')
  })

  it('names the local machine when its test fails without a reason', async () => {
    test.mockResolvedValue({ ok: false, reachable: false })
    mountInChinese()

    await screen.findByText('Homelab')
    fireEvent.click(screen.getAllByRole('button', { name: '测试' })[0])

    await waitFor(() => expect($notifications.get()).toHaveLength(1))
    expect(test).toHaveBeenCalledWith('local')
    expect($notifications.get()[0]).toMatchObject({ kind: 'error', title: '连接测试失败' })
    expect(toastText()).toContain('本设备')
    expect(toastText()).not.toContain('This device')
  })
})
