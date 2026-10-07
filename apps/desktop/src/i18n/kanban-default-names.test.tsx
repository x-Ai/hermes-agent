import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { registerPluginLocales } from '@/i18n/plugin-i18n'
import type * as KanbanApi from '@/plugins/kanban/api'
import { $boardSlug } from '@/plugins/kanban/api'
import { BoardSwitcher } from '@/plugins/kanban/board-switcher'
import { KANBAN_LOCALES } from '@/plugins/kanban/i18n'
import { OrchestrationPanel } from '@/plugins/kanban/orchestration'
import type { BoardMeta, KanbanProfile } from '@/plugins/kanban/types'

const boards = vi.fn<() => Promise<{ boards: BoardMeta[]; current: string }>>()
const profiles = vi.fn<() => Promise<{ profiles: KanbanProfile[] }>>()

vi.mock('@/plugins/kanban/api', async importOriginal => ({
  ...(await importOriginal<typeof KanbanApi>()),
  fetchBoards: () => boards(),
  fetchOrchestration: async () => ({
    auto_decompose: false,
    default_assignee: '',
    orchestrator_profile: '',
    resolved_default_assignee: 'default',
    resolved_orchestrator_profile: 'default'
  }),
  fetchProfiles: () => profiles()
}))

let dispose: (() => void) | undefined

// The plugin reads two catalogs: its own bundle for the board chrome and
// core's `common.defaultName` for the reserved profile. Both ride the app's
// I18nProvider, so the tests mount the real one.
function mount(locale: 'en' | 'zh', node: ReactNode) {
  dispose = registerPluginLocales('kanban', KANBAN_LOCALES)

  return render(
    <I18nProvider configClient={null} initialLocale={locale}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {node}
      </QueryClientProvider>
    </I18nProvider>
  )
}

const defaultBoard = (name: string, total = 0): BoardMeta => ({ name, project_id: null, slug: 'default', total })

const profile = (name: string, is_default = false): KanbanProfile => ({
  description: '',
  description_auto: false,
  is_default,
  name
})

afterEach(() => {
  cleanup()
  dispose?.()
  $boardSlug.set('')
  vi.clearAllMocks()
})

// The backend titles the always-present board after its slug ("Default") and
// every card falls back to the profile literally named `default`. Neither is
// copy the user wrote, so both read in the UI language like the sidebar's
// profile rows do — while a board someone renamed keeps its own name.
describe('reserved default names in the kanban plugin', () => {
  it('shows the synthesized default board name in the UI language', async () => {
    boards.mockResolvedValue({ boards: [defaultBoard('Default')], current: 'default' })
    mount('zh', <BoardSwitcher />)

    expect(await screen.findByText('默认')).toBeTruthy()
    expect(screen.queryByText('Default')).toBeNull()
  })

  it('keeps the English name for an English UI', async () => {
    boards.mockResolvedValue({ boards: [defaultBoard('Default')], current: 'default' })
    mount('en', <BoardSwitcher />)

    expect(await screen.findByText('Default')).toBeTruthy()
  })

  it('leaves a renamed default board under the name it was given', async () => {
    boards.mockResolvedValue({ boards: [defaultBoard('Ops', 2)], current: 'default' })
    mount('zh', <BoardSwitcher />)

    expect(await screen.findByText('Ops')).toBeTruthy()
    expect(screen.queryByText('默认')).toBeNull()
  })

  it('names the default profile in the UI language without repeating the default marker', async () => {
    profiles.mockResolvedValue({ profiles: [profile('default', true), profile('coder')] })
    mount('zh', <OrchestrationPanel />)

    // An exact match: the row would read 默认（默认） if the marker survived.
    expect(await screen.findByText('默认')).toBeTruthy()
    expect(screen.getByText('coder')).toBeTruthy()
    expect(screen.queryByText('default')).toBeNull()
  })

  it('still marks a non-reserved profile that is the default', async () => {
    profiles.mockResolvedValue({ profiles: [profile('coder', true)] })
    mount('zh', <OrchestrationPanel />)

    expect((await screen.findByText('coder')).textContent).toBe('coder（默认）')
  })
})
