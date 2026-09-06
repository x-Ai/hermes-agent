import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { clearNotifications, notify } from '@/store/notifications'

import { NotificationStack, toastTitleClassName } from './notifications'

const LONG_TITLE = 'This turn is no longer in server history (it may have been compressed away).'
const DETAIL = 'target user message is no longer in session history'

describe('toast titles', () => {
  beforeEach(() => {
    clearNotifications()
  })

  afterEach(() => {
    cleanup()
    clearNotifications()
  })

  it('drops the one-line clamp so a long error title can wrap', () => {
    const className = toastTitleClassName()

    expect(className).toMatch(/\bline-clamp-none\b/)
    expect(className).not.toMatch(/\bline-clamp-1\b/)
    expect(className).toMatch(/\bwhitespace-normal\b/)
    expect(className).toContain('max-h-[4.5em]')
    expect(className).toMatch(/\boverflow-y-auto\b/)
  })

  it('renders the full title and body instead of truncating them', () => {
    notify({ kind: 'error', title: LONG_TITLE, message: DETAIL })

    render(
      <I18nProvider configClient={null} initialLocale="en">
        <NotificationStack />
      </I18nProvider>
    )

    const title = screen.getByText(LONG_TITLE)

    expect(title.textContent).toBe(LONG_TITLE)
    expect(title.getAttribute('title')).toBe(LONG_TITLE)
    expect(title.className).toMatch(/\bline-clamp-none\b/)
    expect(title.className).not.toMatch(/\bline-clamp-1\b/)
    expect(title.className).toMatch(/\boverflow-y-auto\b/)
    expect(screen.getByText(DETAIL)).toBeTruthy()
  })

  it.each(['default', 'bottom-right'] as const)(
    'renders matching title and message only once in the %s stack while keeping details and actions',
    placement => {
      const onClick = vi.fn()
      notify({
        kind: 'error',
        title: LONG_TITLE,
        message: LONG_TITLE,
        detail: DETAIL,
        meta: 'Additional context',
        action: { label: 'Retry', onClick },
        placement
      })

      render(
        <I18nProvider configClient={null} initialLocale="en">
          <NotificationStack />
        </I18nProvider>
      )

      expect(screen.getAllByText(LONG_TITLE)).toHaveLength(1)
      expect(screen.getByText(LONG_TITLE).getAttribute('title')).toBe(LONG_TITLE)
      expect(screen.getByText(DETAIL)).toBeTruthy()
      expect(screen.getByText('Additional context')).toBeTruthy()

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

      expect(onClick).toHaveBeenCalledOnce()
      expect(screen.queryByRole('alert')).toBeNull()
    }
  )
})
