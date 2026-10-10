import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const requestGatewayForAgent = vi.fn()
const notify = vi.fn()
const notifyError = vi.fn()
const editsNonDefault = atom(true)

vi.mock('@/store/gateway', () => ({
  requestGatewayForAgent: (...args: unknown[]) => requestGatewayForAgent(...args)
}))

vi.mock('@/store/connections', async () => {
  const { atom: makeAtom } = await import('nanostores')

  return { $activeConnectionId: makeAtom<null | string>(null) }
})

vi.mock('@/store/settings-scope', () => ({ $settingsScopeEditsNonDefault: editsNonDefault }))

vi.mock('@/store/notifications', () => ({
  notify: (...args: unknown[]) => notify(...args),
  notifyError: (...args: unknown[]) => notifyError(...args)
}))

// The i18n context reaches the config API through the barrel; the default (English) context
// needs none of it at render time.
vi.mock('@/hermes', () => ({
  getHermesConfigRecord: vi.fn(),
  retainConfigReadOrigin: vi.fn(),
  saveHermesConfig: vi.fn()
}))

const { MemoryIsolationSetting } = await import('./isolation-setting')

const FOREGROUND = { spawnPriority: 'foreground' }

/** A gateway whose bot holds three entries copied from the default profile until it is isolated. */
function gatewayWith(configure: (params: Record<string, unknown>) => Record<string, unknown>) {
  let isolated = false

  requestGatewayForAgent.mockImplementation(async (_connection, _profile, method, params) => {
    if (method === 'profiles.describe') {
      return isolated
        ? { isolated_memory: true, inherited_memory: { memory: 0, user: 0 } }
        : { isolated_memory: false, inherited_memory: { memory: 2, user: 1 } }
    }

    const result = configure(params as Record<string, unknown>)
    const change = result.memory_isolation as { isolated?: boolean; ok?: boolean } | undefined

    if (change?.ok) {
      isolated = change.isolated === true
    }

    return result
  })
}

beforeEach(() => {
  editsNonDefault.set(true)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('MemoryIsolationSetting', () => {
  it('shows how many entries came from the default profile and isolates the profile on toggle', async () => {
    gatewayWith(() => ({
      ok: true,
      applied: { isolated_memory: true },
      memory_isolation: { ok: true, isolated: true, removed: { memory: 2, user: 1 } }
    }))

    render(<MemoryIsolationSetting profile="tech-lead" section="memory" subpage="persistent" />)

    const toggle = await screen.findByRole('switch', { name: 'Isolated memory' })
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    expect(screen.getByText("3 entries are identical to the default profile's memory.")).toBeTruthy()
    expect(requestGatewayForAgent).toHaveBeenCalledWith(
      null,
      'tech-lead',
      'profiles.describe',
      { name: 'tech-lead' },
      undefined,
      undefined,
      FOREGROUND
    )

    fireEvent.click(toggle)

    await waitFor(() =>
      expect(requestGatewayForAgent).toHaveBeenCalledWith(
        null,
        'tech-lead',
        'profiles.configure',
        { name: 'tech-lead', isolated_memory: true },
        undefined,
        undefined,
        FOREGROUND
      )
    )
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith({ kind: 'success', message: 'Memory isolated: 3 inherited entries removed.' })
    )
    // The counts are re-read after the flip, never guessed.
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Isolated memory' }).getAttribute('aria-checked')).toBe('true')
    )
    expect(screen.queryByText("3 entries are identical to the default profile's memory.")).toBeNull()
  })

  it('reports an overflow in the file the backend names and leaves the switch where it was', async () => {
    gatewayWith(() => ({
      ok: false,
      applied: { isolated_memory: false },
      memory_isolation: {
        ok: false,
        isolated: true,
        failure_class: 'over_budget',
        target: 'memory',
        chars: 2600,
        limit: 2200
      }
    }))
    // Start from an isolated profile: the overflow happens on the way back.
    requestGatewayForAgent.mockImplementationOnce(async () => ({
      isolated_memory: true,
      inherited_memory: { memory: 0, user: 0 }
    }))

    render(<MemoryIsolationSetting profile="tech-lead" section="memory" />)

    const toggle = await screen.findByRole('switch', { name: 'Isolated memory' })
    expect(toggle.getAttribute('aria-checked')).toBe('true')

    fireEvent.click(toggle)

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith({
        kind: 'error',
        message:
          'MEMORY.md would hold 2600 characters, over its 2200-character budget. Raise the budget or trim entries first.'
      })
    )
    expect(screen.getByRole('switch', { name: 'Isolated memory' }).getAttribute('aria-checked')).toBe('true')
    expect(notifyError).not.toHaveBeenCalled()
  })

  it('renders nothing for the default profile scope, another page, and a gateway without the flag', async () => {
    editsNonDefault.set(false)
    const { container, unmount } = render(<MemoryIsolationSetting profile="default" section="memory" />)

    expect(container.firstChild).toBeNull()
    expect(requestGatewayForAgent).not.toHaveBeenCalled()
    unmount()

    editsNonDefault.set(true)
    const elsewhere = render(<MemoryIsolationSetting profile="tech-lead" section="memory" subpage="context" />)

    expect(elsewhere.container.firstChild).toBeNull()
    expect(requestGatewayForAgent).not.toHaveBeenCalled()
    elsewhere.unmount()

    requestGatewayForAgent.mockResolvedValue({ skills: [], toolsets: [] })
    const older = render(<MemoryIsolationSetting profile="tech-lead" section="memory" />)

    await waitFor(() => expect(requestGatewayForAgent).toHaveBeenCalled())
    expect(older.container.firstChild).toBeNull()
  })
})
