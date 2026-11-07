import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'

import { ProjectMenu } from './project-menu'
import type { SidebarProjectTree } from './workspace-groups'

const app: SidebarProjectTree = { id: '/code/app', label: 'app', path: '/code/app', repos: [], sessionCount: 0 }

// Where the project's name sits in the sentence, and which marks quote it, is
// each language's call. Code that glued `${menuDelete} "${label}"?` showed
// every locale in English order: ja read 削除 "app"?.
const TITLES = {
  de: '„app“ löschen?',
  ja: '「app」を削除しますか？'
} as const

afterEach(cleanup)

describe('delete-project dialog title', () => {
  it.each(['ja', 'de'] as const)(
    'names the project inside the %s sentence',
    async locale => {
      const p = TRANSLATIONS[locale].sidebar.projects

      render(
        <I18nProvider configClient={null} initialLocale={locale}>
          <ProjectMenu isActive={false} project={app} />
        </I18nProvider>
      )

      // Radix's dropdown trigger opens on pointerdown, not on a bare click.
      const trigger = screen.getByRole('button', { name: p.menu })
      fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })
      fireEvent.pointerUp(trigger, { button: 0, pointerType: 'mouse' })
      fireEvent.click(trigger)
      fireEvent.click(await screen.findByRole('menuitem', { name: `${p.menuDelete}…` }))

      expect(await screen.findByRole('dialog', { name: TITLES[locale] })).toBeTruthy()
    },
    15000
  )
})
