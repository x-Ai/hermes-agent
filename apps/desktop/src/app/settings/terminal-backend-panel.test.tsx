import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileScope } from '@/api/client'
import { I18nProvider } from '@/i18n'
import { zh } from '@/i18n/zh'
import { zhHant } from '@/i18n/zh-hant'
import { deferred } from '@/test/deferred'
import type { TerminalBackendsResponse } from '@/types/hermes'

const getTerminalBackends = vi.fn()
const selectTerminalBackend = vi.fn()
const confirmMock = vi.fn()

vi.mock('@/hermes', () => ({
  getTerminalBackends: (profile?: ProfileScope) => getTerminalBackends(profile),
  selectTerminalBackend: (backend: string, profile?: ProfileScope) => selectTerminalBackend(backend, profile)
}))

vi.mock('@/store/confirm', () => ({
  confirm: (...args: Parameters<typeof confirmMock>) => confirmMock(...args)
}))

vi.mock('@/store/notifications', () => ({
  notify: vi.fn(),
  notifyError: vi.fn()
}))

// Load once at module scope so no test's 15s budget pays the heavy transform
// + import (the first-test timeout flake under CI load).
const { TerminalBackendPanel } = await import('./terminal-backend-panel')

function backends(overrides: Partial<TerminalBackendsResponse> = {}): TerminalBackendsResponse {
  return {
    active: 'local',
    backends: [
      {
        name: 'local',
        label: 'Local',
        description: 'Run commands directly on this machine. No isolation.',
        active: true,
        status: 'ready',
        detail: ''
      },
      {
        name: 'docker',
        label: 'Docker',
        description: 'Run commands in an isolated Docker container.',
        active: false,
        status: 'needs_setup',
        detail: 'Docker not reachable — start Docker and retry.'
      },
      {
        name: 'ssh',
        label: 'SSH',
        description: 'Run commands on a remote host over SSH.',
        active: false,
        status: 'ready',
        detail: 'hermes@devbox'
      }
    ],
    ...overrides
  }
}

beforeEach(() => {
  getTerminalBackends.mockResolvedValue(backends())
  selectTerminalBackend.mockResolvedValue({ ok: true, backend: 'ssh' })
  confirmMock.mockReset()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('TerminalBackendPanel', () => {
  it('reads and writes the profile currently selected by Capabilities', async () => {
    const { TerminalBackendPanel } = await import('./terminal-backend-panel')
    const { rerender } = render(<TerminalBackendPanel profile="research" />)

    for (const profile of ['research', 'coder', 'research']) {
      rerender(<TerminalBackendPanel profile={profile} />)
      await waitFor(() => expect(getTerminalBackends).toHaveBeenLastCalledWith(profile))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Local/ }).getAttribute('aria-pressed')).toBe('true')
      )
      fireEvent.click(screen.getByRole('button', { name: /SSH/ }))
      await waitFor(() => expect(selectTerminalBackend).toHaveBeenLastCalledWith('ssh', profile))
      await waitFor(() => expect(screen.getByRole('button', { name: /SSH/ }).getAttribute('aria-pressed')).toBe('true'))
    }
  })

  it('marks the active backend as pressed', async () => {
    render(<TerminalBackendPanel onConfiguredChange={vi.fn()} />)

    const local = await screen.findByRole('button', { name: /Local/ })
    expect(local.getAttribute('aria-pressed')).toBe('true')
  })

  it('selects a backend when clicked and reports the change', async () => {
    const onConfiguredChange = vi.fn()
    render(<TerminalBackendPanel onConfiguredChange={onConfiguredChange} />)

    fireEvent.click(await screen.findByRole('button', { name: /SSH/ }))

    await waitFor(() => expect(selectTerminalBackend).toHaveBeenCalledWith('ssh', undefined))
    await waitFor(() => expect(onConfiguredChange).toHaveBeenCalled())
    // Active highlight moves without a refetch.
    const ssh = screen.getByRole('button', { name: /SSH/ })
    expect(ssh.getAttribute('aria-pressed')).toBe('true')
  })

  it('gates a needs_setup backend behind a confirm dialog before selecting it', async () => {
    const confirmGate = deferred<boolean>()
    confirmMock.mockReturnValue(confirmGate.promise)
    selectTerminalBackend.mockResolvedValue({ ok: true, backend: 'docker' })
    render(<TerminalBackendPanel onConfiguredChange={vi.fn()} />)

    fireEvent.click(await screen.findByRole('button', { name: /Docker/ }))

    await waitFor(() => expect(confirmMock).toHaveBeenCalled())
    expect(confirmMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Docker'),
        description: expect.stringContaining('Docker not reachable')
      })
    )
    // Must not select while the confirm dialog is still pending.
    expect(selectTerminalBackend).not.toHaveBeenCalled()

    confirmGate.resolve(true)

    await waitFor(() => expect(selectTerminalBackend).toHaveBeenCalledWith('docker', undefined))
    // The guidance detail stays visible on the now-active row.
    expect(screen.getByText(/Docker not reachable/)).toBeTruthy()
  })

  it('does not select a needs_setup backend when the confirm dialog is declined', async () => {
    const confirmGate = deferred<boolean>()
    confirmMock.mockReturnValue(confirmGate.promise)
    render(<TerminalBackendPanel onConfiguredChange={vi.fn()} />)

    fireEvent.click(await screen.findByRole('button', { name: /Docker/ }))

    await waitFor(() => expect(confirmMock).toHaveBeenCalled())

    // Resolve inside act() and await the same promise handleSelect is
    // awaiting, so its post-await early return has actually run (no
    // arbitrary-duration sleep — deterministic on the real microtask queue).
    await act(async () => {
      confirmGate.resolve(false)
      await confirmGate.promise
    })

    expect(selectTerminalBackend).not.toHaveBeenCalled()
  })

  // The dashboard router (hermes_cli/web_routers/tools.py) reports probe outcomes
  // as English prose and the Chinese catalogs match that prose verbatim, so every
  // outcome the Docker / Podman probe emits must render localized, never fall through.
  const DOCKER_PROBE_DETAILS = [
    'Docker CLI not found — install Docker Desktop, docker-ce, or Podman.',
    'Docker not reachable — start Docker and retry.',
    'Podman not reachable — run `podman machine start` and retry.',
    'Docker not responding (timed out).',
    'Podman not responding (timed out).'
  ]

  it.each([
    ['zh', zh],
    ['zh-hant', zhHant]
  ] as const)('localizes every Docker / Podman probe outcome in %s', async (locale, catalog) => {
    const [local, docker] = backends().backends

    for (const detail of DOCKER_PROBE_DETAILS) {
      const localized = catalog.settings.toolsets.terminalBackend.details[detail] ?? ''
      expect(localized, detail).toMatch(/[㐀-鿿]/u)
      getTerminalBackends.mockResolvedValue(backends({ backends: [local, { ...docker, detail }] }))
      render(
        <I18nProvider configClient={null} initialLocale={locale}>
          <TerminalBackendPanel onConfiguredChange={vi.fn()} />
        </I18nProvider>
      )

      expect(await screen.findByText(localized)).toBeTruthy()
      expect(screen.queryByText(detail)).toBeNull()
      cleanup()
    }
  })

  it('does not re-select the already active backend', async () => {
    render(<TerminalBackendPanel onConfiguredChange={vi.fn()} />)

    fireEvent.click(await screen.findByRole('button', { name: /Local/ }))

    await new Promise(resolve => setTimeout(resolve, 50))
    expect(selectTerminalBackend).not.toHaveBeenCalled()
  })
})
