import { describe, expect, it } from 'vitest'

import { displayBoardName, displayProfileName, KANBAN_LOCALES, storedBoardName } from './i18n'

describe('Kanban reserved-name localization', () => {
  it('renders the Simplified Chinese nav and built-in default names', () => {
    const zh = KANBAN_LOCALES.zh as { defaultBoardName: string; defaultProfileName: string; nav: string }

    expect(zh.nav).toBe('看板')
    expect(displayBoardName(zh, { name: 'Default', slug: 'default' })).toBe('默认')
    expect(displayBoardName(zh, { name: 'default', slug: 'default' })).toBe('默认')
    expect(displayProfileName(zh, 'default')).toBe('默认')
    expect(storedBoardName(zh, { name: 'Default', slug: 'default' }, '默认')).toBe('Default')
  })

  it('keeps user-defined board and profile names verbatim', () => {
    const k = { defaultBoardName: '默认', defaultProfileName: '默认' }

    expect(displayBoardName(k, { name: 'Release', slug: 'default' })).toBe('Release')
    expect(displayBoardName(k, { name: 'Default', slug: 'release' })).toBe('Default')
    expect(displayProfileName(k, 'coder')).toBe('coder')
    expect(storedBoardName(k, { name: 'Default', slug: 'default' }, '发布计划')).toBe('发布计划')
  })
})
