import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

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
