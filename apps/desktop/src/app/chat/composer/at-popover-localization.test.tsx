import type { Unstable_TriggerItem } from '@assistant-ui/core'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { TRANSLATIONS } from '@/i18n/catalog'
import { setRuntimeI18nLocale } from '@/i18n/runtime'
import { queryClient } from '@/lib/query-client'

import { useAtCompletions } from './hooks/use-at-completions'
import { ComposerTriggerPopover } from './trigger-popover'

// The `@` popover's own copy (the `@kind:` starter rows and the header over a
// browse) was English in every UI language, beside rows the backend localizes.

afterEach(() => {
  cleanup()
  queryClient.clear()
  setRuntimeI18nLocale('en')
  vi.useRealTimers()
})

describe('the @ popover in a Chinese UI', () => {
  it('describes the @kind: starter rows in the UI language', async () => {
    vi.useFakeTimers()
    // A gateway with nothing to list leaves the popover its own starter rows.
    const gateway = { request: vi.fn(async () => ({ items: [] })) }
    const api: { search?: (query: string) => readonly Unstable_TriggerItem[] } = {}

    function Probe() {
      api.search = useAtCompletions({ gateway: gateway as never, sessionId: 's1', cwd: '/repo' }).adapter.search

      return null
    }

    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <Probe />
      </I18nProvider>
    )

    act(() => {
      api.search?.('')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    let rows: readonly Unstable_TriggerItem[] = []
    act(() => {
      rows = api.search?.('') || []
    })

    expect(rows.map(row => row.description)).not.toContain('Attach a file reference')

    const zh = TRANSLATIONS.zh.composer.atStarters

    expect(rows.map(row => [row.label, row.description])).toEqual(
      ['file', 'folder', 'url', 'image', 'tool', 'git'].map(kind => [`@${kind}:`, zh[kind]])
    )
  })

  it('names the @kind: it browses in the UI language', () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <ComposerTriggerPopover
          activeIndex={0}
          items={[]}
          kind="@"
          loading={false}
          onHover={vi.fn()}
          onPick={vi.fn()}
          scope="folder"
        />
      </I18nProvider>
    )

    expect(screen.queryByText('Folders')).toBeNull()
    expect(screen.getByText(TRANSLATIONS.zh.composer.atScopes.folder)).toBeTruthy()
  })
})
