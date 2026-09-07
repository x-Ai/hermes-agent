import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'

import { assistantMessage, stubThreadEnvironment, ThreadRuntime, userMessage } from '../test-utils'

import { parseProcessNotification, ProcessNotificationNote } from './user-message'

import { Thread } from '.'

afterEach(cleanup)
stubThreadEnvironment()

const notification = '[IMPORTANT: Background process proc_123 completed normally.\nCommand: scan\nOutput:\ndone]'

function Harness() {
  return (
    <I18nProvider configClient={null} initialLocale="en">
      <ProcessNotificationNote text={notification} />
    </I18nProvider>
  )
}

describe('background process notification placement', () => {
  it('uses the terminal tool-card disclosure without a redundant output label', () => {
    const { container } = render(<Harness />)

    const notice = container.querySelector('[data-slot="aui_process-notification"]')

    expect(notice).toBeTruthy()
    expect(notice?.classList.contains('self-start')).toBe(true)
    expect(notice?.classList.contains('self-center')).toBe(false)
    expect(container.querySelector('[data-slot="aui_process-notification-command"]')).toBeNull()

    const icon = container.querySelector('[data-slot="aui_process-notification-icon"]')

    expect(icon?.querySelector('svg')).toBeTruthy()
    expect(icon?.querySelector('.codicon')).toBeNull()

    const disclosure = container.querySelector<HTMLButtonElement>('[data-slot="aui_process-notification"] button')!

    expect(disclosure.disabled).toBe(false)
    act(() => fireEvent.click(disclosure))

    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[data-slot="aui_process-notification"]')?.classList.contains('border')).toBe(true)
    expect(container.querySelector('[data-slot="aui_process-notification-command"]')?.textContent).toBe('$ scan')
    expect(container.querySelector('[data-slot="aui_process-notification-result"]')?.textContent).toBe('done')
    expect(container.textContent).not.toMatch(/\boutput\b/i)
    expect(container.querySelector('summary')).toBeNull()
  })

  it('uses the same reading-column indent as assistant tool rows', () => {
    const { container } = render(
      <I18nProvider configClient={null} initialLocale="en">
        <ThreadRuntime messages={[userMessage('process-1', notification)]}>
          <Thread />
        </ThreadRuntime>
      </I18nProvider>
    )

    const root = container.querySelector('[data-slot="aui_user-message-root"]')

    expect(root?.classList.contains('pl-(--message-text-indent)')).toBe(true)
  })

  it('exposes the adjacent message-group hooks that collapse the preceding action-bar gap', () => {
    const { container } = render(
      <I18nProvider configClient={null} initialLocale="en">
        <ThreadRuntime messages={[assistantMessage(), userMessage('process-1', notification)]}>
          <Thread />
        </ThreadRuntime>
      </I18nProvider>
    )

    const groups = container.querySelectorAll('[data-slot="aui_message-group"]')

    expect(groups).toHaveLength(2)
    expect(groups[0]?.querySelector('[data-slot="aui_assistant-footer"]')).toBeTruthy()
    expect(groups[1]?.querySelector('[data-slot="aui_process-notification"]')).toBeTruthy()
  })

  it('separates watch metadata, command and matched content', () => {
    expect(
      parseProcessNotification(
        '[IMPORTANT: Background process proc_456 matched watch pattern "ready".\nStarted by subagent child-1.\nCommand: npm run dev\nMatched output:\nready on :5174]'
      )
    ).toEqual({
      command: 'npm run dev',
      headline: 'Background process proc_456 matched watch pattern "ready".',
      metadata: 'Started by subagent child-1.',
      output: 'ready on :5174'
    })
  })
})
