import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'

import { NodeContextMenu, type NodeMenuTarget } from './node-context-menu'

vi.mock('@/app/learning/archive-skill-confirm-dialog', () => ({
  ArchiveSkillConfirmDialog: () => null,
  fireOptimistic: vi.fn()
}))
vi.mock('@/components/chat/code-editor', () => ({ CodeEditor: () => null }))
vi.mock('@/hermes', () => ({
  deleteLearningNode: vi.fn(),
  editLearningNode: vi.fn(),
  getLearningNode: vi.fn()
}))
vi.mock('@/store/notifications', () => ({ notifyError: vi.fn() }))
vi.mock('@/store/starmap', () => ({ evictStarmapNode: vi.fn(), loadStarmapGraph: vi.fn() }))
vi.mock('../hooks/use-on-profile-switch', () => ({ useOnProfileSwitch: vi.fn() }))

const target: NodeMenuTarget = { id: 'memory-1', kind: 'memory', label: 'Test memory', x: 1000, y: 750 }

afterEach(cleanup)

describe('NodeContextMenu', () => {
  it('keeps the destructive row functional through the shared menu', async () => {
    const onClose = vi.fn()

    render(<NodeContextMenu onClose={onClose} onNodeRemoved={vi.fn()} target={target} />)

    const row = await screen.findByRole('menuitem', { name: 'Delete memory' })

    // Radix selects on pointer-up (or Enter); the confirm dialog must replace the menu.
    fireEvent.keyDown(row, { key: 'Enter' })

    expect(await screen.findByText('Delete Test memory?')).toBeTruthy()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  // Last: the provider leaves its locale in the runtime and in storage.
  it('asks to delete the memory in the UI language', async () => {
    const copy = TRANSLATIONS.ru.starmap

    render(
      <I18nProvider configClient={null} initialLocale="ru">
        <NodeContextMenu onClose={vi.fn()} onNodeRemoved={vi.fn()} target={target} />
      </I18nProvider>
    )

    fireEvent.keyDown(await screen.findByRole('menuitem', { name: copy.deleteMemory }), { key: 'Enter' })

    expect(await screen.findByText(copy.deleteTitle('Test memory'))).toBeTruthy()
    expect(screen.queryByText('Delete Test memory?')).toBeNull()
  })
})
