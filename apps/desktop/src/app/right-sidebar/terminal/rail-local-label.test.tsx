import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { DesktopConnectionsRegistry } from '@/global'
import { I18nProvider } from '@/i18n'
import { zh } from '@/i18n/zh'
import { $connectionsRegistry } from '@/store/connections'

import { TerminalRail } from './rail'
import { $activeTerminalId, $terminals } from './terminals'

// The terminal rail, read in Chinese. The local gateway's registry label is
// English data ("This device"); wherever the rail names a host, it must name
// this machine in the UI language.

function mountInChinese() {
  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      <TerminalRail />
    </I18nProvider>
  )
}

beforeEach(() => {
  $connectionsRegistry.set({
    connections: [
      { id: 'local', kind: 'local', label: 'This device' },
      { id: 'nas', kind: 'ssh', label: 'NAS' }
    ],
    primary: 'local',
    version: 2
  } as unknown as DesktopConnectionsRegistry)
})

afterEach(() => {
  cleanup()
  $terminals.set([])
  $activeTerminalId.set(null)
  $connectionsRegistry.set(null)
})

describe('TerminalRail host names in Chinese', () => {
  it('names This device in the UI language on a tab once tabs run on more than one host', () => {
    $terminals.set([
      { auto: true, connectionId: 'local', cwd: '/repo', id: 'term-1', kind: 'user', title: 'zsh' },
      { auto: true, connectionId: 'nas', cwd: '', id: 'term-2', kind: 'user', profile: 'default', title: 'bash' }
    ])
    $activeTerminalId.set('term-1')

    mountInChinese()

    // The tab's name is also its hover tip.
    expect(screen.getAllByRole('tab').map(tab => tab.getAttribute('aria-label'))).toEqual([
      '1. zsh · 本设备',
      '2. bash · NAS'
    ])
  })

  it('names This device in the UI language in the new-terminal gateway menu', async () => {
    mountInChinese()

    fireEvent.contextMenu(screen.getByRole('button', { name: zh.rightSidebar.terminalNew }))

    const items = await screen.findAllByRole('menuitem')

    expect(items.map(item => item.textContent)).toEqual(['本设备', 'NAS'])
  })
})
