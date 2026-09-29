import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { invalidateContextBreakdownForConfig } from '@/store/context-breakdown'
import type { ContextBreakdown, UsageStats } from '@/types/hermes'

import { ContextMeterDetail, ContextUsagePanel, projectLiveContextBreakdown } from './context-usage-panel'
import { DEFERRED_AGENT_RETRY_LIMIT, useContextBreakdown } from './hooks/use-context-breakdown'

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

/** What the backend answers for a resumed session whose agent is still being built. */
const unavailable: ContextBreakdown = { ...breakdown, categories: [], ready: false }

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** Flush resolved gateway promises and fire due timers under fake timers. */
async function elapse(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

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

  it('suspends while a turn runs, drops the idle snapshot on the first busy render, and refetches at turn end', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { rerender, result } = renderHook(
      ({ busy }) => useContextBreakdown({ busy, enabled: true, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { busy: false } }
    )

    await waitFor(() => expect(result.current.breakdown).toEqual(breakdown))

    rerender({ busy: true })

    // Synchronously null: the streamed usage owns the gauge from the first busy frame.
    expect(result.current.breakdown).toBeNull()
    expect(requestGateway).toHaveBeenCalledTimes(1)

    rerender({ busy: false })

    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.breakdown).toEqual(breakdown))
  })

  it('never re-asks mid-turn, even when a compression or config save lands during the turn', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { rerender } = renderHook(
      ({ compressionCount }) =>
        useContextBreakdown({ busy: true, compressionCount, enabled: true, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { compressionCount: 0 } }
    )

    rerender({ compressionCount: 1 })
    invalidateContextBreakdownForConfig()
    await act(async () => undefined)

    expect(requestGateway).not.toHaveBeenCalled()
  })

  it('retries a not-ready deferred-agent snapshot with backoff until it is ready', async () => {
    vi.useFakeTimers()

    const requestGateway = vi
      .fn()
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValue(breakdown)

    const { result } = renderHook(() =>
      useContextBreakdown({ busy: false, enabled: true, requestGateway, sessionId: 'runtime-1' })
    )

    await elapse(0)
    expect(result.current.breakdown).toEqual(unavailable)
    expect(result.current.loading).toBe(true)
    expect(requestGateway).toHaveBeenCalledTimes(1)

    await elapse(250)
    expect(requestGateway).toHaveBeenCalledTimes(2)

    await elapse(500)
    expect(requestGateway).toHaveBeenCalledTimes(3)
    expect(result.current.breakdown).toEqual(breakdown)
    expect(result.current.loading).toBe(false)

    // Ready snapshots are not polled.
    await elapse(30_000)
    expect(requestGateway).toHaveBeenCalledTimes(3)
  })

  it('stops retrying after the bounded attempt count', async () => {
    vi.useFakeTimers()
    const requestGateway = vi.fn().mockResolvedValue(unavailable)

    const { result } = renderHook(() =>
      useContextBreakdown({ busy: false, enabled: true, requestGateway, sessionId: 'runtime-1' })
    )

    await elapse(120_000)

    expect(requestGateway).toHaveBeenCalledTimes(DEFERRED_AGENT_RETRY_LIMIT + 1)
    expect(result.current.breakdown).toEqual(unavailable)
    expect(result.current.loading).toBe(false)
  })

  it('cancels a pending retry when the turn starts', async () => {
    vi.useFakeTimers()
    const requestGateway = vi.fn().mockResolvedValue(unavailable)

    const { rerender } = renderHook(
      ({ busy }) => useContextBreakdown({ busy, enabled: true, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { busy: false } }
    )

    await elapse(0)
    expect(requestGateway).toHaveBeenCalledTimes(1)

    rerender({ busy: true })
    await elapse(30_000)

    expect(requestGateway).toHaveBeenCalledTimes(1)
  })

  it('refetches after an idle compression', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    const { rerender } = renderHook(
      ({ compressionCount }) =>
        useContextBreakdown({ busy: false, compressionCount, enabled: true, requestGateway, sessionId: 'runtime-1' }),
      { initialProps: { compressionCount: 0 } }
    )

    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(1))
    rerender({ compressionCount: 1 })
    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(2))
  })

  it('refetches after a saved context configuration change', async () => {
    const requestGateway = vi.fn().mockResolvedValue(breakdown)

    renderHook(() => useContextBreakdown({ busy: false, enabled: true, requestGateway, sessionId: 'runtime-1' }))

    await waitFor(() => expect(requestGateway).toHaveBeenCalledTimes(1))
    invalidateContextBreakdownForConfig()
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
    expect(projected?.categories.find(category => category.id === 'conversation')?.tokens).toBe(128_000)
    expect(projected?.context_used).toBe(148_000)
    expect(projected?.context_percent).toBe(54)
    expect(projected?.estimated_total).toBe(148_000)
  })

  it('re-baselines conversation from the current window after compression', () => {
    const baseline: ContextBreakdown = {
      ...breakdown,
      categories: [
        { color: 'gray', id: 'system_prompt', label: 'System prompt', tokens: 20_000 },
        { color: 'teal', id: 'conversation', label: 'Conversation', tokens: 500_000 }
      ],
      context_used: 520_000,
      estimated_total: 520_000
    }

    const compressed = projectLiveContextBreakdown(baseline, {
      ...usage,
      context_used: 90_000
    })

    const regrown = projectLiveContextBreakdown(compressed, {
      ...usage,
      context_used: 153_600
    })

    expect(compressed?.categories.find(category => category.id === 'conversation')?.tokens).toBe(70_000)
    expect(regrown?.categories.find(category => category.id === 'conversation')?.tokens).toBe(133_600)
    expect(regrown?.estimated_total).toBe(153_600)
  })

  it('does not mislabel live usage as conversation while the deferred agent is unavailable', () => {
    const projected = projectLiveContextBreakdown(
      { ...unavailable, context_used: 0, estimated_total: 0 },
      { ...usage, context_used: 185_600 }
    )

    expect(projected?.categories).toEqual([])
  })

  it('marks estimates but preserves the provider-usage header', () => {
    for (const estimated of [true, false]) {
      const { container, unmount } = render(
        <ContextUsagePanel breakdown={breakdown} loading={false} usage={{ ...usage, context_estimated: estimated }} />
      )

      const header = container.querySelector('[data-slot="context-usage-panel"] > div')?.textContent ?? ''

      expect(header.includes('~')).toBe(estimated)
      expect(container.querySelector('li')?.textContent).toContain('~')
      unmount()
    }
  })

  it('renders the usage it is handed, so the popover matches the bar', () => {
    render(<ContextUsagePanel breakdown={breakdown} loading={false} usage={usage} />)

    expect(screen.getByText('47% Full')).toBeTruthy()
    expect(screen.getByText('Conversation')).toBeTruthy()
  })

  it('reports the live compression count, zero included, and never invents one', () => {
    const { rerender } = render(<ContextUsagePanel breakdown={breakdown} loading={false} usage={usage} />)

    expect(screen.queryByTestId('context-panel-compressions')).toBeNull()

    for (const compressions of [0, 3]) {
      rerender(<ContextUsagePanel breakdown={breakdown} loading={false} usage={{ ...usage, compressions }} />)
      expect(screen.getByTestId('context-panel-compressions').textContent).toBe(`Compressions: ${compressions}`)
    }
  })
})

describe('ContextMeterDetail', () => {
  it('adds the count to the meter only once the session has compacted', () => {
    for (const compressions of [undefined, 0]) {
      const { container, unmount } = render(<ContextMeterDetail bar="[██░░] 47%" compressions={compressions} />)

      expect(container.textContent).toBe('[██░░] 47%')
      unmount()
    }

    render(<ContextMeterDetail bar="[██░░] 47%" compressions={2} />)

    expect(screen.getByTestId('context-meter-compressions').textContent).toBe('2')
  })
})
