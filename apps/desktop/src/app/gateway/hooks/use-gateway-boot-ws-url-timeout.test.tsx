import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALE, setRuntimeI18nLocale } from '@/i18n'
import { zh } from '@/i18n/zh'
import { isTimeoutError, RECONNECT_ATTEMPT_TIMEOUT_MS } from '@/lib/with-timeout'
import { $desktopBoot } from '@/store/boot'
import { closeSecondaryGateways } from '@/store/gateway'
import { endGatewaySwitch } from '@/store/gateway-switch'
import { notifyError } from '@/store/notifications'
import { $activeGatewayProfile } from '@/store/profile'
import { $connection, $gatewayState } from '@/store/session'

import { FakeWebSocket } from '../../../test/fake-gateway-socket'

import { takeGatewaySurvivor } from './gateway-hmr-survivor'
import { useGatewayBoot } from './use-gateway-boot'

// A primary WebSocket URL mint that never answers (#93454) fails the boot or the connection
// switch. Its message is the boot failure overlay's detail and the detail of the
// "Hermes couldn't start" toast, so it is raised in the UI language.

vi.mock(import('@/store/notifications'), async importOriginal => ({
  ...(await importOriginal()),
  notifyError: vi.fn()
}))

vi.mock(import('@/store/terminal-backend-warning'), () => ({
  warnIfTerminalBackendUnavailable: vi.fn(async () => false)
}))

const remoteConn = {
  authMode: 'token' as const,
  baseUrl: 'https://vps.example.com',
  connectionId: 'primary-vps',
  mode: 'remote',
  profile: 'default',
  token: 't',
  wsUrl: 'wss://vps.example.com/api/ws?token=t'
}

const localConn = { ...remoteConn, baseUrl: 'http://127.0.0.1:9191', connectionId: 'local', mode: 'local' }

const neverAnswers = () => new Promise<string>(() => undefined)

// The boot boundary's mint answers; every later one (dial retry, connection switch) never does.
function answersOnce(url: string) {
  let calls = 0

  return () => (calls++ === 0 ? Promise.resolve(url) : neverAnswers())
}

let connectionApplied: (() => void) | null = null

function fakeDesktop(conn: typeof remoteConn, mint: () => Promise<string>) {
  const unsubscribe = () => () => undefined

  return {
    getConnection: vi.fn(async () => conn),
    getGatewayWsUrl: vi.fn(mint),
    getBootProgress: vi.fn(async () => ({
      error: null,
      fakeMode: false,
      message: '',
      phase: 'init',
      progress: 0,
      retryable: false,
      running: true,
      timestamp: Date.now()
    })),
    onBootProgress: vi.fn(unsubscribe),
    onBackendExit: vi.fn(unsubscribe),
    onConnectionApplied: vi.fn((callback: () => void) => {
      connectionApplied = callback

      return () => {
        connectionApplied = null
      }
    }),
    onPowerResume: vi.fn(unsubscribe),
    revalidateConnection: vi.fn(async () => ({ ok: true, rebuilt: false })),
    onWindowStateChanged: vi.fn(unsubscribe),
    profile: { get: vi.fn(async () => ({ profile: 'default' })) }
  }
}

function Harness() {
  useGatewayBoot({
    beforeConnectionSwitch: () => undefined,
    handleGatewayEvent: () => undefined,
    handleServerRequest: () => false,
    onConnectionReady: () => undefined,
    onGatewayReady: () => undefined,
    refreshHermesConfig: async () => undefined,
    refreshSessions: async () => undefined
  })

  return null
}

function closeSurvivor() {
  try {
    takeGatewaySurvivor()?.gateway.close()
  } catch {
    // ignore
  }
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

// Both surfaces read the same message; the protocol name stays Latin, as across the zh bundle.
function expectFailureIn(message: string) {
  const [error] = vi.mocked(notifyError).mock.calls.at(-1) ?? []

  expect($desktopBoot.get().error).toBe(message)
  expect(isTimeoutError(error) && error.message).toBe(message)
  expect(message.replace('WebSocket URL', '')).not.toMatch(/[A-Za-z]/)
}

const originalWebSocket = globalThis.WebSocket

beforeEach(() => {
  closeSurvivor()
  closeSecondaryGateways()
  $activeGatewayProfile.set('default')
  $connection.set(null)
  vi.useFakeTimers()
  FakeWebSocket.mode = 'open'
  FakeWebSocket.instances = []
  FakeWebSocket.pingMode = 'pong'
  connectionApplied = null
  vi.mocked(notifyError).mockReset()
  ;(globalThis as { WebSocket: unknown }).WebSocket = FakeWebSocket
  $gatewayState.set('idle')
  $desktopBoot.set({
    error: null,
    fakeMode: false,
    message: '',
    phase: 'init',
    progress: 0,
    running: true,
    timestamp: Date.now(),
    visible: true
  })
  setRuntimeI18nLocale('zh')
})

afterEach(() => {
  setRuntimeI18nLocale(DEFAULT_LOCALE)
  cleanup()
  closeSurvivor()
  closeSecondaryGateways()
  endGatewaySwitch()
  $connection.set(null)
  FakeWebSocket.mode = 'open'
  vi.useRealTimers()
  ;(globalThis as { WebSocket: unknown }).WebSocket = originalWebSocket
  delete (window as { hermesDesktop?: unknown }).hermesDesktop
})

it('reports a cold-boot WebSocket URL mint that never answers in the UI language', async () => {
  ;(window as { hermesDesktop?: unknown }).hermesDesktop = fakeDesktop(remoteConn, neverAnswers)
  render(<Harness />)
  await advance(RECONNECT_ATTEMPT_TIMEOUT_MS)

  expectFailureIn(zh.runtimeErrors.gatewayWsUrlTimedOut)
})

it('reports a local dial retry whose WebSocket URL mint never answers in the UI language', async () => {
  // The boot boundary's URL is refused, so connectInitialGateway re-mints on every later attempt
  // and rethrows the last attempt's timeout once its retries run out.
  FakeWebSocket.mode = 'fail'
  ;(window as { hermesDesktop?: unknown }).hermesDesktop = fakeDesktop(localConn, answersOnce(localConn.wsUrl))
  render(<Harness />)
  await advance(8 * (RECONNECT_ATTEMPT_TIMEOUT_MS + 3_000))

  expectFailureIn(zh.runtimeErrors.gatewayWsUrlTimedOut)
})

it('reports a connection switch whose WebSocket URL re-mint never answers in the UI language', async () => {
  ;(window as { hermesDesktop?: unknown }).hermesDesktop = fakeDesktop(remoteConn, answersOnce(remoteConn.wsUrl))
  render(<Harness />)
  await advance(0)
  expect($gatewayState.get()).toBe('open')

  act(() => connectionApplied?.())
  await advance(RECONNECT_ATTEMPT_TIMEOUT_MS)

  expectFailureIn(zh.runtimeErrors.gatewayWsUrlRemintTimedOut)
})
