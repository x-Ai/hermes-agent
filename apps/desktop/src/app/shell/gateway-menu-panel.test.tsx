import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { StatusResponse } from '@/types/hermes'

const mocks = vi.hoisted(() => ({
  notifyError: vi.fn(),
  reconnectGateway: vi.fn<() => Promise<void>>()
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tip: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('@/hermes', () => ({
  getLogs: vi.fn().mockResolvedValue({ lines: [] })
}))

vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: {
      commandCenter: { restartGateway: 'Restart gateway' },
      messaging: {
        states: {
          connected: '已连接',
          disconnected: '已断开'
        }
      },
      shell: {
        gatewayMenu: {
          checkingInference: 'Checking inference',
          connected: 'Connected',
          connecting: 'Connecting',
          disconnected: 'Disconnected',
          inferenceNotReady: 'Inference not ready',
          inferenceReady: 'Inference ready',
          messagingPlatforms: 'Messaging platforms',
          offline: 'Offline',
          openSystem: 'Open system panel',
          recentActivity: 'Recent activity',
          reconnectGateway: 'Reconnect gateway',
          viewAllLogs: 'View all logs'
        }
      }
    }
  })
}))

vi.mock('@/store/gateway-reconnect', () => ({
  reconnectGateway: mocks.reconnectGateway
}))

vi.mock('@/store/notifications', () => ({
  notifyError: mocks.notifyError
}))

vi.mock('@/store/system-actions', () => ({
  runGatewayRestart: vi.fn()
}))

import { GatewayMenuPanel } from './gateway-menu-panel'

const statusWithPlatform = (state: string): StatusResponse => ({
  active_sessions: 0,
  config_path: '',
  config_version: 0,
  env_path: '',
  gateway_exit_reason: null,
  gateway_health_url: null,
  gateway_pid: null,
  gateway_platforms: { webhook: { state, updated_at: '' } },
  gateway_running: true,
  gateway_state: 'running',
  gateway_updated_at: '',
  hermes_home: '',
  latest_config_version: 0,
  release_date: '',
  version: ''
})

const renderPanel = (gatewayState: string, platformState?: string) =>
  render(
    <GatewayMenuPanel
      gatewayState={gatewayState}
      inferenceStatus={null}
      onClose={vi.fn()}
      onOpenSystem={vi.fn()}
      statusSnapshot={platformState ? statusWithPlatform(platformState) : null}
    />
  )

describe('GatewayMenuPanel reconnect action', () => {
  beforeEach(() => {
    mocks.reconnectGateway.mockReset().mockResolvedValue(undefined)
    mocks.notifyError.mockReset()
  })

  afterEach(() => cleanup())

  it('shows reconnect only while disconnected and disables it in flight', async () => {
    let finish: (() => void) | undefined
    mocks.reconnectGateway.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        })
    )

    renderPanel('closed')

    const reconnect = screen.getByRole('button', { name: 'Reconnect gateway' })
    fireEvent.click(reconnect)
    fireEvent.click(reconnect)

    expect(mocks.reconnectGateway).toHaveBeenCalledOnce()
    expect((reconnect as HTMLButtonElement).disabled).toBe(true)

    await act(async () => finish?.())
  })

  it('hides reconnect while the socket is open', async () => {
    renderPanel('open')
    await act(async () => undefined)

    expect(screen.queryByRole('button', { name: 'Reconnect gateway' })).toBeNull()
  })

  it.each([
    ['Connected', '已连接'],
    ['Disconnected', '已断开']
  ])('normalizes and localizes a platform state reported as %s', async (state, label) => {
    renderPanel('open', state)
    await act(async () => undefined)

    const platformRow = screen.getByText('webhook').closest('li')
    expect(platformRow).toBeTruthy()
    expect(within(platformRow!).getByText(label)).toBeTruthy()
    expect(within(platformRow!).queryByText(state)).toBeNull()
  })
})
