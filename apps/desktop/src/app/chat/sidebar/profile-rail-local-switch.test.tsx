import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DesktopAgentRoster, DesktopConnectionsRegistry } from '@/global'
import { I18nProvider } from '@/i18n'
import { $notifications, clearNotifications } from '@/store/notifications'

import { ProfileRail } from './profile-switcher'

// A failed switch onto an at-rest This device square, read in Chinese. The
// roster carries the local registry label as stored, English "This device";
// the toast is presentation and must name the machine in the UI language.

const selectConnection = vi.fn()

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
  selectConnection: (...args: unknown[]) => selectConnection(...args)
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
    { id: 'gateway-a', kind: 'remote', label: 'Gateway A', url: 'https://gateway-a.example.com' }
  ],
  launchMode: 'primary',
  lastUsed: 'gateway-a',
  primary: 'gateway-a',
  version: 2
} as DesktopConnectionsRegistry

const roster: DesktopAgentRoster = {
  agents: [
    {
      connectionId: 'gateway-a',
      connectionKind: 'remote',
      connectionLabel: 'Gateway A',
      handle: 'hermes-gateway-a',
      profile: 'default'
    },
    {
      connectionId: 'local',
      connectionKind: 'local',
      connectionLabel: 'This device',
      handle: 'hermes',
      profile: 'default'
    },
    {
      connectionId: 'local',
      connectionKind: 'local',
      connectionLabel: 'This device',
      handle: 'builder',
      profile: 'builder'
    }
  ],
  sources: [
    { connectionId: 'gateway-a', kind: 'remote', label: 'Gateway A', reachable: true },
    { connectionId: 'local', kind: 'local', label: 'This device', reachable: true }
  ]
}

function toastText(): string {
  return $notifications
    .get()
    .map(toast => [toast.title, toast.message, toast.detail].join('\n'))
    .join('\n')
}

beforeEach(() => {
  ;(window as { hermesDesktop?: unknown }).hermesDesktop = {
    getAgentRoster: vi.fn().mockResolvedValue(roster),
    probeLocalBackend: vi.fn().mockResolvedValue({ bootstrapNeeded: false })
  }
  hasMultipleConnections.set(true)
  connectionsRegistry.set(registry)
  activeConnectionId.set('gateway-a')
})

afterEach(() => {
  cleanup()
  clearNotifications()
  vi.clearAllMocks()
  _resetFleetRosterForTests()
  hasMultipleConnections.set(false)
  connectionsRegistry.set(null)
  activeConnectionId.set(null)
  delete (window as { hermesDesktop?: unknown }).hermesDesktop
})

describe('ProfileRail switch onto This device', () => {
  it('names This device in the UI language when the switch fails', async () => {
    selectConnection.mockRejectedValue(new Error('dial refused'))

    const { container } = render(
      <I18nProvider configClient={null} initialLocale="zh">
        <ProfileRail />
      </I18nProvider>
    )

    const builder = await waitFor(() => {
      const square = container.querySelector<HTMLButtonElement>(
        '[data-slot="profile-rail-rest-square"][data-connection-id="local"][data-profile="builder"]'
      )

      expect(square).not.toBeNull()

      return square!
    })

    fireEvent.click(builder)

    await waitFor(() => expect(selectConnection).toHaveBeenCalledWith('local', { profile: 'builder' }))
    await waitFor(() => expect($notifications.get()).toHaveLength(1))

    expect($notifications.get()[0]).toMatchObject({ kind: 'error', title: '无法连接到 本设备' })
    expect(toastText()).not.toContain('This device')
  })
})
