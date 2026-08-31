import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ContextBreakdown, UsageStats } from '@/types/hermes'

import { ContextUsagePanel, projectLiveContextBreakdown } from './context-usage-panel'
import { useContextBreakdown } from './hooks/use-context-breakdown'

const usage: UsageStats = {
  calls: 1,
  context_max: 272_000,
  context_percent: 47,
  context_used: 128_200,
  input: 0,
  output: 0,
  total: 0
}

const breakdown: ContextBreakdown = {
  categories: [{ color: 'teal', id: 'conversation', label: 'Conversation', tokens: 241_400 }],
  context_max: 272_000,
  context_percent: 89,
  context_used: 241_400,
  estimated_total: 286_600,
  model: 'test-model'
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useContextBreakdown', () => {
  it('fetches for a session that has not run a turn yet', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { result } = renderHook(() =>
      useContextBreakdown({ busy: false, enabled: true, requestGateway, sessionId: 'runtime-1' })
    )

    await waitFor(() => expect(result.current.breakdown).toEqual(breakdown))
    expect(requestGateway).toHaveBeenCalledWith('session.context_breakdown', { session_id: 'runtime-1' })
  })

  it('does not fetch while the gauge is hidden, and fetches once it is shown', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { rerender } = renderHook(
      ({ enabled }) => useContextBreakdown({ busy: false, enabled, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { enabled: false } }
    )

    expect(requestGateway).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(1))
  })

  it('lets an in-flight baseline request finish when the turn becomes busy', async () => {
    let resolveRequest: ((value: ContextBreakdown) => void) | undefined

    const requestGateway = vi
      .fn()
      .mockImplementation(() => new Promise<ContextBreakdown>(resolve => (resolveRequest = resolve)))

    const { rerender, result } = renderHook(
      ({ busy }) => useContextBreakdown({ busy, enabled: true, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { busy: false } }
    )

    rerender({ busy: true })
    resolveRequest?.(breakdown)

    await waitFor(() => expect(result.current.breakdown).toEqual(breakdown))
    expect(result.current.loading).toBe(false)
    expect(requestGateway).toHaveBeenCalledTimes(1)
  })

  it('refetches the authoritative breakdown when a turn ends', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { rerender } = renderHook(
      ({ busy }) => useContextBreakdown({ busy, enabled: true, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { busy: true } }
    )

    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(1))
    rerender({ busy: false })
    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(2))
  })

  it('refetches on a session switch and never reports the previous session numbers', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { rerender, result } = renderHook(
      ({ sessionId }) => useContextBreakdown({ busy: false, enabled: true, requestGateway, sessionId }),
      { initialProps: { sessionId: 'runtime-1' } }
    )

    await waitFor(() => expect(result.current.breakdown).toEqual(breakdown))

    // Switching sessions must drop the numbers immediately — painting them
    // under the new session's name would be a lie until its own fetch lands.
    requestGateway.mockImplementation(() => new Promise(() => undefined))
    rerender({ sessionId: 'runtime-2' })

    expect(result.current.breakdown).toBeNull()
    expect(requestGateway).toHaveBeenLastCalledWith('session.context_breakdown', { session_id: 'runtime-2' })
  })

  it('reports the measured occupancy the backend sends, not just the estimate', async () => {
    // `context_used` on the payload is already the measured figure once a turn
    // has run — the estimate is the backend's own fallback, not a second value
    // the client has to choose between.
    const measured: ContextBreakdown = { ...breakdown, context_used: 12_000 }
    const requestGateway = vi.fn().mockResolvedValue(measured)

    const { result } = renderHook(() =>
      useContextBreakdown({ busy: false, enabled: true, requestGateway, sessionId: 'runtime-1' })
    )

    await waitFor(() => expect(result.current.breakdown?.context_used).toBe(12_000))
  })
})

describe('ContextUsagePanel', () => {
  it('projects live context growth into the conversation category', () => {
    const baseline: ContextBreakdown = {
      ...breakdown,
      categories: [
        { color: 'gray', id: 'system_prompt', label: 'System prompt', tokens: 20_000 },
        { color: 'teal', id: 'conversation', label: 'Conversation', tokens: 100_000 }
      ],
      context_used: 128_000,
      estimated_total: 120_000
    }

    const projected = projectLiveContextBreakdown(baseline, {
      ...usage,
      context_max: 272_000,
      context_used: 148_000
    })

    expect(projected?.categories.find(category => category.id === 'system_prompt')?.tokens).toBe(20_000)
    expect(projected?.categories.find(category => category.id === 'conversation')?.tokens).toBe(120_000)
    expect(projected?.context_used).toBe(148_000)
    expect(projected?.context_percent).toBe(54)
    expect(projected?.estimated_total).toBe(140_000)
  })

  it('renders the usage it is handed, so the popover matches the bar', () => {
    render(<ContextUsagePanel breakdown={breakdown} loading={false} usage={usage} />)

    expect(screen.getByText('47% Full')).toBeTruthy()
    expect(screen.getByText('Conversation')).toBeTruthy()
  })

  it('says so when there is no breakdown rather than painting an empty bar', () => {
    render(<ContextUsagePanel breakdown={null} loading={false} usage={usage} />)

    expect(screen.getByText('No context data yet')).toBeTruthy()
  })
})
