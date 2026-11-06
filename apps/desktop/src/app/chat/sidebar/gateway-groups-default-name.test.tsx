// @vitest-environment jsdom
import { cleanup, render, within } from '@testing-library/react'
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

import { ChatSidebar } from './index'

// The sessions sidebar, read in Chinese, across every profile and grouped by profile. `default` is
// Hermes' reserved profile name, a stable value rather than copy: every group header that names it
// must read in the UI language, as the profile groups under a gateway section already do.

const noop = () => {}

const noopAsync = async () => {}

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

const chat = (title: string, owner: { connection_id?: string; source?: string } = {}) =>
  makeSessionInfo({ id: title, last_active: Date.now() / 1000, profile: 'default', title, ...owner })

// A group's header names it on the label that folds it; the caret beside it carries its own aria-label.
const groupHeader = (root: HTMLElement, id: string) => {
  const group = [...root.querySelectorAll<HTMLElement>('[data-gateway-group]')].find(
    node => node.dataset.gatewayGroup === id
  )!

  return within(group)
    .getAllByRole('button', { expanded: true })
    .find(button => !button.hasAttribute('aria-label'))?.textContent
}

const messagingGroup = (platform: string, connectionId: null | string) =>
  JSON.stringify([`messaging:${platform}`, JSON.stringify([connectionId, 'default'])])

beforeEach(() => {
  $profiles.set([{ name: 'default', is_default: true }] as typeof $profiles.value)
  $showAllProfiles.set(true)
  setSidebarGrouping('profile')
})

afterEach(() => {
  cleanup()
  setSidebarGrouping('date')
  $showAllProfiles.set(false)
  $sidebarMessagingOpenIds.set([])
  $messagingSessions.set([])
  $sessions.set([])
  $profiles.set([])
  $connectionsRegistry.set(null)
})

it('names the default profile in the UI language on messaging platform groups, mixed or not', () => {
  // A remote base: This device is a secondary, so its rows carry `local` and the NAS pool's are bare.
  $connectionsRegistry.set({
    connections: [
      { id: 'local', kind: 'local', label: 'This device', tokenPreview: null, tokenSet: false },
      { id: 'nas', kind: 'ssh', label: 'NAS', tokenPreview: null, tokenSet: false }
    ],
    primary: 'nas',
    secureTokenStorage: true,
    version: 2
  } as DesktopConnectionsRegistry)
  $messagingSessions.set([
    chat('local thread', { connection_id: 'local', source: 'telegram' }),
    chat('nas thread', { source: 'telegram' }),
    chat('discord thread', { source: 'discord' })
  ])
  $messagingTruncated.set(false)
  $sidebarMessagingOpenIds.set(['telegram', 'discord'])

  const root = mountInChinese()

  expect(groupHeader(root, messagingGroup('telegram', 'local'))).toBe('本设备 · 默认')
  expect(groupHeader(root, messagingGroup('telegram', null))).toBe('默认')
  expect(groupHeader(root, messagingGroup('discord', null))).toBe('默认')
})

it('names the default profile in the UI language on a recents group no gateway section holds', () => {
  // No registry names a gateway, so bare rows' groups sit at the top level.
  $sessions.set([chat('desk chat')])

  const root = mountInChinese()

  expect(groupHeader(root, JSON.stringify([null, 'default']))).toBe('默认')
})
