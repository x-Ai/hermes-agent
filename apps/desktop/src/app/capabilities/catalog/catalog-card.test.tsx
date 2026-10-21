import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CatalogCard, type CatalogCardVariant } from './catalog-card'
import type { CatalogEntry } from './catalog-data'

const entry: CatalogEntry = {
  id: 'browser',
  name: 'Browser',
  description: 'Drive the browser.',
  overview: 'Drive the browser.',
  category: 'work',
  categoryLabel: 'work',
  source: '4 tools',
  author: '4 tools',
  identifier: 'browser',
  repo: '',
  sha: '',
  subdir: '',
  version: '',
  requiresHermes: '',
  tags: [],
  platforms: [],
  requirements: [],
  tools: [],
  hooks: [],
  sourceUrl: null,
  docsUrl: null,
  imageUrl: null,
  stars: null,
  search: ''
}

afterEach(cleanup)

function renderCard(variant: CatalogCardVariant) {
  const onOpen = vi.fn()
  const onToggle = vi.fn()
  render(
    <CatalogCard
      accentIndex={0}
      action={<button aria-label="Turn Browser toolset on" onClick={onToggle} role="switch" type="button" />}
      entry={entry}
      onCategory={vi.fn()}
      onOpen={onOpen}
      onSearch={vi.fn()}
      onTag={vi.fn()}
      variant={variant}
    />
  )

  return { onOpen, onToggle }
}

// The title button's ::after stretches over the whole card so any empty spot
// opens the detail. In the topline variants (the Tools tab's feature row and
// lists) the action slot is rendered BEFORE that button, so without an explicit
// layer the overlay painted over the switch and every click opened the dialog
// instead of toggling the toolset.
describe('CatalogCard action slot', () => {
  it.each(['compact', 'horizontal', 'showcase'] as const)(
    '%s keeps the action above the title overlay, inside the card stacking context',
    variant => {
      renderCard(variant)
      const slot = screen.getByRole('switch').parentElement!

      expect(slot.className.split(' ')).toEqual(expect.arrayContaining(['relative', 'z-10']))
      expect(slot.closest('[data-catalog-card]')!.className.split(' ')).toContain('isolate')
    }
  )

  it('a click on the action never opens the detail', () => {
    const { onOpen, onToggle } = renderCard('compact')
    fireEvent.click(screen.getByRole('switch'))

    expect(onToggle).toHaveBeenCalledOnce()
    expect(onOpen).not.toHaveBeenCalled()
  })
})
