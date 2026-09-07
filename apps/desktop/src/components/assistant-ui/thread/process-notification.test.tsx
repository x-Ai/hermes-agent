import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'

import { parseProcessNotification, ProcessNotificationNote } from './user-message'

afterEach(cleanup)

function Harness() {
  return (
    <I18nProvider configClient={null} initialLocale="en">
      <ProcessNotificationNote
        text={'[IMPORTANT: Background process proc_123 completed normally.\nCommand: scan\nOutput:\ndone]'}
      />
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
