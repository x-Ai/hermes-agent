import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DesktopAgentRoster, DesktopConnectionsRegistry } from '@/global'
import { I18nProvider } from '@/i18n'

import { ProfileRail } from './profile-switcher'

// An at-rest gateway the roster could not enumerate, read in Chinese. When a
// source misses its enumeration deadline the main process reports it with its
// own fixed English message; the rail's hover tip is presentation, so that
// message reads in the UI language. A backend's or the network's own error
// text is diagnostic detail and stays as reported.

vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }))

const { sortByProfileOrder } = await import('@/lib/profile-order')

vi.mock('@/store/profile', () => ({
  $activeGatewayProfile: atom('default'),
  $profileColors: atom({}),
  $profileCreateRequest: atom(0),
  $profileOrder: atom([]),
  $profiles: atom([{ is_default: true, name: 'default' }]),
  $profileScope: atom('default'),
  $showAllProfiles: atom(false),
  ALL_PROFILES: '*',
  normalizeProfileKey: (name: string) => name,
  prewarmProfilePick: vi.fn(),
  profileLabel: (profile: { display_name?: string; name: string }) =>
    (profile.display_name ?? '').trim() || profile.name,
  refreshActiveProfile: vi.fn().mockResolvedValue(undefined),
  selectProfile: vi.fn(),
  setProfileColor: vi.fn(),
  setProfileOrder: vi.fn(),
  setShowAllProfiles: vi.fn(),
  sortByProfileOrder: (profiles: Array<{ name: string }>, order: string[]) =>
    sortByProfileOrder(profiles, order, profile => profile.name)
}))

vi.mock('@/store/connections', () => ({
  $activeConnectionId: atom<null | string>(null),
  $connectionsRegistry: atom<DesktopConnectionsRegistry | null>(null),
  $hasMultipleConnections: atom(false),
  selectConnection: vi.fn()
}))

vi.mock('@/store/profile-share', () => ({ runExportProfileFlow: vi.fn(), runImportProfileFlow: vi.fn() }))

vi.mock('./use-profile-prewarm', () => ({
  useProfilePrewarm: () => ({ cancelPrewarm: vi.fn(), notePointerMove: vi.fn(), startPrewarm: vi.fn() })
}))

vi.mock('./use-profile-rail-refresh-on-active', () => ({ useProfileRailRefreshOnActive: () => undefined }))
vi.mock('@/components/remote-setup/first-run', () => ({ FirstRunRemoteSetup: () => null }))
vi.mock('@/components/chat/code-editor', () => ({ CodeEditor: () => null }))
vi.mock('../../profiles/create-profile-dialog', () => ({ CreateProfileDialog: () => null }))
vi.mock('../../profiles/delete-profile-dialog', () => ({ DeleteProfileDialog: () => null }))
vi.mock('../../profiles/rename-profile-dialog', () => ({ RenameProfileDialog: () => null }))

const connectionsStore = await import('@/store/connections')
const hasMultipleConnections = connectionsStore.$hasMultipleConnections as ReturnType<typeof atom<boolean>>
const activeConnectionId = connectionsStore.$activeConnectionId as ReturnType<typeof atom<null | string>>

const connectionsRegistry = connectionsStore.$connectionsRegistry as ReturnType<
  typeof atom<DesktopConnectionsRegistry | null>
>

const { _resetFleetRosterForTests } = await import('@/store/fleet-roster')

const registry = {
  connections: [
    { id: 'local', kind: 'local', label: 'This device' },
    { id: 'homelab', kind: 'ssh', label: 'Homelab', host: 'homelab.example.com' }
  ],
  launchMode: 'primary',
  lastUsed: 'local',
  primary: 'local',
  version: 2
} as DesktopConnectionsRegistry

/** The roster as the main process reports it when Homelab failed with `error`. */
function rosterWithHomelabError(error: string): DesktopAgentRoster {
  return {
    agents: [
      {
        connectionId: 'local',
        connectionKind: 'local',
        connectionLabel: 'This device',
        handle: 'hermes',
        profile: 'default'
      }
    ],
    sources: [
      { connectionId: 'local', kind: 'local', label: 'This device', reachable: true },
      { connectionId: 'homelab', kind: 'ssh', label: 'Homelab', reachable: false, error }
    ]
  }
}

/** Hover Homelab's divider on the zh rail and return its tip. */
async function homelabTip(error: string): Promise<string> {
  ;(window as { hermesDesktop?: unknown }).hermesDesktop = {
    getAgentRoster: vi.fn().mockResolvedValue(rosterWithHomelabError(error)),
    probeLocalBackend: vi.fn().mockResolvedValue({ bootstrapNeeded: false })
  }

  const { container } = render(
    <I18nProvider configClient={null} initialLocale="zh">
      <ProfileRail />
    </I18nProvider>
  )

  const divider = await waitFor(() => {
    const marker = container.querySelector<HTMLElement>(
      '[data-slot="profile-rail-divider"][data-connection-id="homelab"]'
    )

    expect(marker).not.toBeNull()

    return marker!
  })

  fireEvent.pointerMove(divider)

  return (await screen.findByRole('tooltip')).textContent || ''
}

beforeEach(() => {
  hasMultipleConnections.set(true)
  connectionsRegistry.set(registry)
  activeConnectionId.set('local')
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  _resetFleetRosterForTests()
  hasMultipleConnections.set(false)
  connectionsRegistry.set(null)
  activeConnectionId.set(null)
  delete (window as { hermesDesktop?: unknown }).hermesDesktop
})

describe('ProfileRail unreachable gateway tip', () => {
  it('reads a missed roster deadline in the UI language', async () => {
    const tip = await homelabTip('roster enumeration timed out')

    expect(tip).toContain('Homelab · 无法连接')
    expect(tip).toContain('获取配置档案列表超时')
    expect(tip).not.toContain('roster enumeration timed out')
  })

  it('keeps a backend error as reported', async () => {
    const tip = await homelabTip('connect ECONNREFUSED 192.0.2.10:9119')

    expect(tip).toContain('Homelab · 无法连接')
    expect(tip).toContain('connect ECONNREFUSED 192.0.2.10:9119')
  })
})
