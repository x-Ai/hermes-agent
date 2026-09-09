import { AssistantRuntimeProvider, type ThreadMessage, useExternalStoreRuntime } from '@assistant-ui/react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { toRuntimeMessage } from '@/lib/chat-runtime'
import { $displayTimestamps } from '@/store/display-timestamps'

import { assistantMessage, stubThreadEnvironment, ThreadRuntime, userMessage } from '../test-utils'

import { Thread } from '.'

// Timeline timestamps render only when `display.timestamps` is enabled.
$displayTimestamps.set(true)

const timestamp = new Date('2026-05-01T00:00:00.000Z')
stubThreadEnvironment()

function Harness({ asyncResult, displayKind, text }: { asyncResult?: string; displayKind?: string; text: string }) {
  const message = toRuntimeMessage({
    id: 'system-1',
    role: 'system',
    parts: [{ type: 'text', text }],
    timestamp: timestamp.getTime() / 1000,
    ...(asyncResult ? { asyncResult } : {}),
    ...(displayKind ? { displayKind } : {})
  })

  const runtime = useExternalStoreRuntime<ThreadMessage>({
    messages: [message],
    isRunning: false,
    onNew: async () => {}
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  )
}

function expectTimestampSeparated(container: HTMLElement, precedingText: string) {
  const row = container.querySelector('[data-role="system"]')
  const stamp = row?.querySelector('[data-slot="timeline-timestamp"]')?.textContent

  expect(stamp).toBeTruthy()
  expect(row?.textContent).toContain(`${precedingText} ${stamp}`)
}

afterEach(cleanup)

describe('background report disclosure', () => {
  it('keeps result bodies out of the transcript until opened and removes them when collapsed', () => {
    const report = '{"blockers":[{"title":"Local-model readiness uses the wrong endpoint"}]}'
    const { container, getByRole } = render(<Harness asyncResult={report} text="2 background agents finished" />)

    expect(container.textContent).not.toContain('blockers')
    expectTimestampSeparated(container, '2 background agents finished')
    const toggle = getByRole('button', { name: '2 background agents finished' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    const output = container.querySelector('[data-slot="aui_assistant-message-content"]')
    expect(output).toBeTruthy()
    expect(container.textContent).toContain(report)

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(container.textContent).not.toContain('blockers')
  })
})

describe('system message timestamp text separation', () => {
  it('separates an ordinary system row timestamp in accessible and copied text', () => {
    const { container } = render(<Harness text="Review saved." />)

    expectTimestampSeparated(container, 'Review saved.')
  })

  it('separates a slash-status timestamp in accessible and copied text', () => {
    const { container } = render(<Harness text={'slash:/model\nmodel changed'} />)

    expectTimestampSeparated(container, 'model changed')
  })

  it('separates a steer timestamp in accessible and copied text', () => {
    const { container } = render(<Harness text="steer:rerun tests" />)

    expectTimestampSeparated(container, 'rerun tests')
  })
})

describe('system timeline placement', () => {
  it('places delegation completion output on the left reading edge', () => {
    const { container } = render(
      <Harness displayKind="async_delegation_complete" text="4 background agents finished" />
    )

    const row = container.querySelector('[data-role="system"]')

    expect(row?.classList.contains('self-start')).toBe(true)
    expect(row?.classList.contains('text-left')).toBe(true)
    expect(row?.classList.contains('px-(--message-text-indent)')).toBe(true)
    expect(row?.hasAttribute('data-conversation-scaffold')).toBe(true)
    expect(row?.classList.contains('text-[length:var(--conversation-tool-font-size)]')).toBe(true)
    expect(row?.classList.contains('leading-(--conversation-line-height)')).toBe(true)
    expect(row?.classList.contains('self-center')).toBe(false)
    expect(row?.classList.contains('text-center')).toBe(false)
    expect(row?.getAttribute('data-display-kind')).toBe('async_delegation_complete')
  })

  it('aligns an async report heading and partial output to the assistant reading edge', () => {
    const { container, getByRole } = render(
      <Harness
        asyncResult="Partial output"
        displayKind="async_delegation_complete"
        text="4 background agents finished"
      />
    )

    const root = container.querySelector('[data-role="system"]')
    const heading = root?.querySelector('[data-slot="aui_async-result-heading"]')

    expect(heading?.classList.contains('px-(--message-text-indent)')).toBe(true)
    expect(heading?.classList.contains('text-[length:var(--conversation-tool-font-size)]')).toBe(true)
    expect(heading?.classList.contains('leading-(--conversation-line-height)')).toBe(true)
    expect(root?.getAttribute('data-display-kind')).toBe('async_delegation_complete')
    fireEvent.click(getByRole('button', { name: '4 background agents finished' }))
    const output = root?.querySelector('[data-slot="aui_assistant-message-content"]')
    expect(output).toBeTruthy()
  })

  it('keeps the first delegation completion adjacent to a footer-bearing assistant message', () => {
    const completion = toRuntimeMessage({
      id: 'system-1',
      role: 'system',
      parts: [{ type: 'text', text: '4 background agents finished' }],
      timestamp: timestamp.getTime() / 1000,
      displayKind: 'async_delegation_complete'
    })

    const { container } = render(
      <ThreadRuntime messages={[userMessage(), assistantMessage(), completion]}>
        <Thread />
      </ThreadRuntime>
    )

    const assistant = container.querySelector('[data-slot="aui_assistant-message-root"]')
    const system = container.querySelector('[data-display-kind="async_delegation_complete"]')

    expect(assistant?.querySelector('[data-slot="aui_assistant-footer"]')).toBeTruthy()
    expect(assistant?.nextElementSibling).toBe(system)
  })

  it('keeps ordinary one-line timeline statuses centered', () => {
    const { container } = render(<Harness text="model changed" />)
    const row = container.querySelector('[data-role="system"]')

    expect(row?.classList.contains('self-center')).toBe(true)
    expect(row?.classList.contains('text-center')).toBe(true)
  })
})
