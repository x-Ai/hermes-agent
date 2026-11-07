import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SidebarProvider } from '@/components/ui/sidebar'
import { I18nProvider, TRANSLATIONS } from '@/i18n'

import { EnteredProjectContent } from './entered-content'
import type { SidebarProjectTree } from './workspace-groups'

const app: SidebarProjectTree = {
  id: '/code/app',
  label: 'app',
  path: '/code/app',
  repos: [
    {
      groups: [
        { id: '/code/app::branch::main', isMain: true, label: 'main', path: '/code/app', sessions: [] },
        {
          id: '/code/app/.worktrees/feature',
          isMain: false,
          label: 'feature',
          path: '/code/app/.worktrees/feature',
          sessions: []
        }
      ],
      id: '/code/app',
      label: 'app',
      path: '/code/app',
      sessionCount: 0
    }
  ],
  sessionCount: 0
}

// Where the worktree's name sits in the sentence, and which marks quote it, is
// each language's call. Code that glued `${removeWorktree} "${label}"?` showed
// every locale in English order: ja read ワークツリーを削除 "feature"?.
const TITLES = {
  de: 'Worktree „feature“ entfernen?',
  ja: 'ワークツリー「feature」を削除しますか？'
} as const

afterEach(cleanup)

describe('remove-worktree dialog title', () => {
  it.each(['ja', 'de'] as const)('names the worktree inside the %s sentence', async locale => {
    const p = TRANSLATIONS[locale].sidebar.projects

    render(
      <I18nProvider configClient={null} initialLocale={locale}>
        <SidebarProvider>
          <EnteredProjectContent project={app} renderRows={() => null} />
        </SidebarProvider>
      </I18nProvider>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: p.menu }), { button: 0, ctrlKey: false })
    fireEvent.click(await screen.findByText(`${p.removeWorktree}…`))

    expect(await screen.findByRole('dialog', { name: TITLES[locale] })).toBeTruthy()
  })
})
