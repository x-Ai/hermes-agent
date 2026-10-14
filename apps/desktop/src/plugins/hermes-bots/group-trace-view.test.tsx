import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import type { GroupTurnTrace } from './group-trace'
import { translateBots } from './i18n-test-helper'

// The disclosure renders reasoning/text through the shell message renderer and
// uses the plugin's own copy; the stub records what it was handed.
vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock, createGroupGateway } = await import('./group-test-utils')
  const base = await pluginSdkMock(createGroupGateway().host)

  const Button = ({ children, onClick, ...rest }: { children?: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  )

  return {
    ...base,
    cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
    Codicon: () => null,
    RowButton: Button,
    MessageTextContent: ({ text }: { text: string }) => <span data-testid="trace-body">{text}</span>,
    usePluginI18n: () => translateBots
  }
})

afterEach(cleanup)

// Opening a disclosure reveals it in the room; jsdom has no scrollIntoView.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const TRACE: GroupTurnTrace = {
  dropped: 2,
  steps: [
    { kind: 'reasoning', text: 'weighing the options' },
    { kind: 'tool', name: 'read_file', context: 'read src/app.ts' },
    { kind: 'tool', name: 'patch', failed: true, note: 'no such file' }
  ]
}

async function renderView(trace = TRACE) {
  const { GroupTurnTraceView } = await import('./group-trace-view')

  return render(<GroupTurnTraceView trace={trace} />)
}

it('is collapsed by default — the header shows, the steps do not', async () => {
  await renderView()

  expect(screen.getByText('Thinking & actions')).toBeTruthy()
  // Header summary: it thought and ran two tools.
  expect(screen.getByText(/thought/)).toBeTruthy()
  expect(screen.getByText(/2 tools/)).toBeTruthy()
  expect(screen.queryByTestId('group-trace-steps')).toBeNull()
})

it('reveals the reasoning, tools, failure and omitted-count when opened', async () => {
  await renderView()

  fireEvent.click(screen.getByRole('button'))

  expect(screen.getByTestId('group-trace-steps')).toBeTruthy()
  expect(screen.getByText('weighing the options')).toBeTruthy()
  expect(screen.getByText('read_file')).toBeTruthy()
  expect(screen.getByText('patch')).toBeTruthy()
  // A failed tool's note is prefixed with the localized "Failed" label.
  expect(screen.getByText(/Failed: no such file/)).toBeTruthy()
  // The earlier steps dropped to fit the budget are disclosed, not hidden silently.
  expect(screen.getByText(/2 earlier steps hidden/)).toBeTruthy()
})

it('renders nothing for an empty trace', async () => {
  const { container } = await renderView({ steps: [] })

  expect(container.firstChild).toBeNull()
})

it('shows the live disclosure while a turn runs — collapsed, with the running tool marked when opened', async () => {
  const [{ $groupLiveTraces }, { GroupLiveTurnTrace }] = await Promise.all([
    import('./group-trace-live'),
    import('./group-trace-view')
  ])

  $groupLiveTraces.set({
    'Room::helper': {
      group: 'Room',
      memberKey: 'helper',
      thread: 't1',
      startedAt: 1,
      runningIndex: 1,
      steps: [
        { kind: 'reasoning', text: 'thinking live' },
        { kind: 'tool', name: 'terminal', context: 'npm test' }
      ]
    }
  })

  render(<GroupLiveTurnTrace group="Room" room={{ running: true, turn: { name: 'helper' } }} />)

  expect(screen.getByText('Working…')).toBeTruthy()
  expect(screen.queryByTestId('group-trace-steps')).toBeNull()

  fireEvent.click(screen.getByRole('button'))

  expect(screen.getByText('thinking live')).toBeTruthy()
  expect(screen.getByTestId('group-trace-tool').dataset.running).toBe('true')
})

it('shows no live disclosure for an idle room or a member without steps yet', async () => {
  const [{ $groupLiveTraces }, { GroupLiveTurnTrace }] = await Promise.all([
    import('./group-trace-live'),
    import('./group-trace-view')
  ])

  $groupLiveTraces.set({})

  const idle = render(<GroupLiveTurnTrace group="Room" room={{ running: false, turn: null }} />)

  expect(idle.container.firstChild).toBeNull()

  const quiet = render(<GroupLiveTurnTrace group="Room" room={{ running: true, turn: { name: 'helper' } }} />)

  expect(quiet.container.firstChild).toBeNull()
})

const liveRoom = { running: true, turn: { name: 'helper' } }

function liveEntry(count: number) {
  return {
    'Room::helper': {
      group: 'Room',
      memberKey: 'helper',
      thread: 't1',
      startedAt: 1,
      runningIndex: null,
      steps: Array.from({ length: count }, (_, i) => ({ kind: 'text' as const, text: `step ${i}` }))
    }
  }
}

it('opens the live disclosure at the newest output, follows growth, and leaves a reader who scrolled up alone', async () => {
  const [{ $groupLiveTraces }, { GroupLiveTurnTrace }] = await Promise.all([
    import('./group-trace-live'),
    import('./group-trace-view')
  ])

  $groupLiveTraces.set(liveEntry(3))
  const view = render(<GroupLiveTurnTrace group="Room" room={liveRoom} />)

  fireEvent.click(screen.getByRole('button'))

  const box = screen.getByTestId('group-trace-steps')
  // The steps are their own scroll surface, and a wheel inside it stays inside it at either edge.
  expect(box.className).toContain('overflow-y-auto')
  expect(box.className).toContain('overscroll-contain')
  // Opening also brings the block (header included) into the room's view.
  expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })

  // jsdom lays nothing out: give the box a viewport and a content height that grows with the trace.
  let contentHeight = 500
  Object.defineProperty(box, 'clientHeight', { configurable: true, get: () => 100 })
  Object.defineProperty(box, 'scrollHeight', { configurable: true, get: () => contentHeight })

  // Growth while following pins the view to the bottom.
  $groupLiveTraces.set(liveEntry(4))
  contentHeight = 600
  view.rerender(<GroupLiveTurnTrace group="Room" room={liveRoom} />)
  expect(box.scrollTop).toBe(600)

  // The reader scrolls up to read: later growth must not yank them back down.
  box.scrollTop = 120
  fireEvent.scroll(box)
  $groupLiveTraces.set(liveEntry(5))
  contentHeight = 700
  view.rerender(<GroupLiveTurnTrace group="Room" room={liveRoom} />)
  expect(box.scrollTop).toBe(120)

  // Back within reach of the bottom: following resumes on the next growth.
  box.scrollTop = 700 - 100 - 10
  fireEvent.scroll(box)
  $groupLiveTraces.set(liveEntry(6))
  contentHeight = 800
  view.rerender(<GroupLiveTurnTrace group="Room" room={liveRoom} />)
  expect(box.scrollTop).toBe(800)
})

it('opens a finished disclosure at its start, never pinned to the bottom', async () => {
  await renderView()

  fireEvent.click(screen.getByRole('button'))

  const box = screen.getByTestId('group-trace-steps')
  Object.defineProperty(box, 'clientHeight', { configurable: true, get: () => 100 })
  Object.defineProperty(box, 'scrollHeight', { configurable: true, get: () => 900 })

  expect(box.scrollTop).toBe(0)
  expect(box.className).toContain('overscroll-contain')
})
