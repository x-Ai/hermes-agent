import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'

import { ProcessNotificationNote } from './user-message'

afterEach(cleanup)

function Harness() {
  return (
    <I18nProvider configClient={null} initialLocale="en">
      <ProcessNotificationNote text="[IMPORTANT: Background process proc_123 completed normally.\nCommand: scan\nOutput:\ndone]" />
    </I18nProvider>
  )
}

describe('background process notification placement', () => {
  it('anchors operational output to the assistant reading edge instead of centering it', () => {
    const { container } = render(<Harness />)

    const notice = container.querySelector('[data-slot="aui_process-notification"]')

    expect(notice).toBeTruthy()
    expect(notice?.classList.contains('self-start')).toBe(true)
    expect(notice?.classList.contains('self-center')).toBe(false)
  })
})
