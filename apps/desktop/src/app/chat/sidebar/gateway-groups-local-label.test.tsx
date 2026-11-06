// @vitest-environment jsdom
import { act, cleanup, render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { SidebarProvider } from '@/components/ui/sidebar'
import type { DesktopConnectionsRegistry } from '@/global'
import { I18nProvider } from '@/i18n'
import { $connectionsRegistry } from '@/store/connection-registry-state'
import { $sidebarMessagingOpenIds, setSidebarGrouping } from '@/store/layout'
import { $profiles, $showAllProfiles } from '@/store/profile'
import { $messagingSessions, $messagingTruncated, $sessions } from '@/store/session'
import { makeSessionInfo } from '@/test/session-info'

import { renameGatewayGroup } from './gateway-group-preferences'

import { ChatSidebar } from './index'

// The sessions sidebar, read in Chinese, across every profile and grouped by profile. The local
// gateway's registry label is English data ("This device"); wherever the sidebar names a gateway it
// must name this machine in the UI language, and a name the user gave the section still wins.

const noop = () => {}

const noopAsync = async () => {}

const LOCAL_SECTION = JSON.stringify(['gateway', 'local'])

function mountInChinese() {
  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      <MemoryRouter>
        <SidebarProvider>
          <ChatSidebar
            currentView="chat"
            onArchiveSession={noop}
            onBranchSession={noop}
            onDeleteSession={noop}
            onLoadMoreSessions={noop}
            onManageCronJob={noop}
            onNavigate={noop}
            onNewSessionInWorkspace={noop}
            onNewSessionSplit={noop}
            onResumeSession={noop}
            onRetrySessions={noopAsync}
            onTriggerCronJob={noopAsync}
          />
        </SidebarProvider>
      </MemoryRouter>
    </I18nProvider>
  ).container
}

function setRegistry(primary: string) {
  $connectionsRegistry.set({
    connections: [
      { id: 'local', kind: 'local', label: 'This device', tokenPreview: null, tokenSet: false },
      { id: 'nas', kind: 'ssh', label: 'NAS', tokenPreview: null, tokenSet: false }
    ],
    primary,
    secureTokenStorage: true,
    version: 2
  } as DesktopConnectionsRegistry)
}

const chat = (title: string, owner: { connection_id?: string; source?: string } = {}) =>
  makeSessionInfo({ id: title, last_active: Date.now() / 1000, profile: 'work', title, ...owner })

// Group ids are JSON (a messaging group nests its owner's id), so match them as data, not selectors.
const byData = (root: HTMLElement, key: 'gatewayGroup' | 'gatewaySection', id: string) =>
  [...root.querySelectorAll<HTMLElement>('[data-gateway-group], [data-gateway-section]')].find(
    node => node.dataset[key] === id
  )!

beforeEach(() => {
  $profiles.set([{ name: 'work', is_default: true }] as typeof $profiles.value)
  $showAllProfiles.set(true)
  setSidebarGrouping('profile')
})

afterEach(() => {
  cleanup()
  renameGatewayGroup(LOCAL_SECTION, '')
  setSidebarGrouping('date')
  $showAllProfiles.set(false)
  $sidebarMessagingOpenIds.set([])
  $messagingSessions.set([])
  $sessions.set([])
  $profiles.set([])
  $connectionsRegistry.set(null)
})

it("names This device in the UI language on its gateway section, under the user's own name when set", () => {
  // This device is the registry primary: its pool's bare rows file under its section.
  setRegistry('local')
  $sessions.set([chat('desk chat'), chat('nas chat', { connection_id: 'nas' })])

  const root = mountInChinese()
  const section = byData(root, 'gatewaySection', LOCAL_SECTION)

  expect(within(section).getByText('本设备')).toBeTruthy()
  expect(within(section).getByText('desk chat')).toBeTruthy()
  expect(root.innerHTML).not.toContain('This device')

  act(() => renameGatewayGroup(LOCAL_SECTION, '书房 Mac'))

  expect(within(section).getByText('书房 Mac')).toBeTruthy()
  expect(within(section).queryByText('本设备')).toBeNull()
})

it('names This device in the UI language on a messaging platform group when the platform mixes gateways', () => {
  // A remote base: This device is a secondary, so its rows carry `local`.
  setRegistry('nas')
  $messagingSessions.set([
    chat('local thread', { connection_id: 'local', source: 'telegram' }),
    chat('nas thread', { source: 'telegram' })
  ])
  $messagingTruncated.set(false)
  $sidebarMessagingOpenIds.set(['telegram'])

  const root = mountInChinese()
  const group = byData(root, 'gatewayGroup', JSON.stringify(['messaging:telegram', JSON.stringify(['local', 'work'])]))

  expect(within(group).getByText('本设备 · work')).toBeTruthy()
  expect(within(group).getByText('local thread')).toBeTruthy()
  expect(root.innerHTML).not.toContain('This device')
})
