import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { SidebarProvider } from '@/components/ui/sidebar'
import type { DesktopConnectionsRegistry, HermesConnection } from '@/global'
import { I18nProvider } from '@/i18n'
import { $connectionsRegistry } from '@/store/connection-registry-state'
import { $connection } from '@/store/session'
import { makeSessionInfo } from '@/test/session-info'
import type { SessionInfo } from '@/types/hermes'

import { ProjectOverviewRow } from './overview-row'
import { useGatewayProjectTree } from './use-gateway-project-tree'
import type { SidebarProjectTree } from './workspace-groups'

// The project overview, read in Chinese, in a window on the NAS. This device holds a chat in a
// folder named like one of the NAS's projects, so its project row carries its gateway's name: the
// local registry label is English data ("This device") and must read in the UI language.

const nasApp: SidebarProjectTree = { id: '/srv/app', label: 'app', path: '/srv/app', repos: [], sessionCount: 0 }

const localChat = makeSessionInfo({
  connection_id: 'local',
  cwd: '/Users/me/app',
  git_repo_root: '/Users/me/app',
  id: 'local-chat',
  title: 'local chat'
})

function ProjectRows({ live, tree }: { live: SessionInfo[]; tree: SidebarProjectTree[] }) {
  const { tree: merged } = useGatewayProjectTree(tree, live)

  return merged.map(project => <ProjectOverviewRow key={project.id} project={project} />)
}

beforeEach(() => {
  $connectionsRegistry.set({
    connections: [
      { id: 'local', kind: 'local', label: 'This device', tokenPreview: null, tokenSet: false },
      { id: 'nas', kind: 'ssh', label: 'NAS', tokenPreview: null, tokenSet: false }
    ],
    primary: 'local',
    secureTokenStorage: true,
    version: 2
  } as DesktopConnectionsRegistry)
  $connection.set({ connectionId: 'nas', mode: 'remote' } as HermesConnection)
})

afterEach(() => {
  cleanup()
  $connection.set(null)
  $connectionsRegistry.set(null)
})

it("names This device in the UI language on a project row that shares another gateway's project name", () => {
  const { container } = render(
    <I18nProvider configClient={null} initialLocale="zh">
      <SidebarProvider>
        <ProjectRows live={[localChat]} tree={[nasApp]} />
      </SidebarProvider>
    </I18nProvider>
  )

  expect(screen.getByText('app')).toBeTruthy()
  expect(screen.getByText('app · 本设备')).toBeTruthy()
  expect(container.innerHTML).not.toContain('This device')
})
