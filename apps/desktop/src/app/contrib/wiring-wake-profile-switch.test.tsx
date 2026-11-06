import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALE, setRuntimeI18nLocale } from '@/i18n'
import { $notifications, clearNotifications } from '@/store/notifications'
import { $activeGatewayProfile } from '@/store/profile'

type WakeEvent = { payload?: unknown; type: string }

// Mount the actual controller: the voice-path profile switch lives inline in its gateway-event
// handler, which the boot hook receives. Stub unrelated chrome, boot and the profile dial.
const fixture = vi.hoisted(() => ({
  ensureGatewayProfile: vi.fn(async (_profile: string): Promise<void> => {
    throw new Error('backend unreachable')
  }),
  handleGatewayEvent: null as ((event: WakeEvent) => void) | null
}))

vi.mock('@/store/profile', async importActual => ({
  ...(await importActual<Record<string, unknown>>()),
  ensureGatewayProfile: fixture.ensureGatewayProfile
}))
vi.mock('../gateway/hooks/use-gateway-boot', () => ({
  useGatewayBoot: ({ handleGatewayEvent }: { handleGatewayEvent: (event: WakeEvent) => void }) => {
    fixture.handleGatewayEvent = handleGatewayEvent

    return {}
  }
}))
vi.mock('../gateway/hooks/use-gateway-request', () => ({
  useGatewayRequest: () => ({
    connectionRef: { current: null },
    gateway: null,
    gatewayRef: { current: null },
    requestGateway: vi.fn(async () => ({}))
  })
}))
vi.mock('../session/hooks/use-prompt-actions', () => ({ usePromptActions: () => ({ submitText: vi.fn() }) }))
vi.mock('@/components/boot-failure-overlay', () => ({ StartupOverlay: () => null }))
vi.mock('@/components/confirm-host', () => ({ ConfirmHost: () => null }))
vi.mock('@/components/desktop-install-overlay', () => ({ DesktopInstallOverlay: () => null }))
vi.mock('@/components/find-bar', () => ({ FindBar: () => null }))
vi.mock('@/components/gateway-connecting-overlay', () => ({ GatewayConnectingOverlay: () => null }))
vi.mock('@/components/notifications', () => ({ NotificationStack: () => null }))
vi.mock('@/components/onboarding', () => ({ DesktopOnboardingOverlay: () => null }))
vi.mock('@/components/pet/floating-pet', () => ({ FloatingPet: () => null }))
vi.mock('@/components/remote-display-banner', () => ({ RemoteDisplayBanner: () => null }))
vi.mock('@/components/send-diagnostics-dialog', () => ({ SendDiagnosticsHost: () => null }))
vi.mock('@/components/tips', () => ({ TipHost: () => null }))
vi.mock('../command-palette', () => ({ CommandPalette: () => null }))
vi.mock('../model-picker-overlay', () => ({ ModelPickerOverlay: () => null }))
vi.mock('../model-visibility-overlay', () => ({ ModelVisibilityOverlay: () => null }))
vi.mock('../pet-generate/pet-generate-overlay', () => ({ PetGenerateOverlay: () => null }))
vi.mock('../right-sidebar/file-actions', () => ({ FileActionDialogs: () => null }))
vi.mock('../right-sidebar/files/remote-picker', () => ({ RemoteFolderPicker: () => null }))
vi.mock('../right-sidebar/terminal/persistent', () => ({ PersistentTerminal: () => null }))
vi.mock('../session-import', () => ({ SessionImportView: () => null }))
vi.mock('../session-picker-overlay', () => ({ SessionPickerOverlay: () => null }))
vi.mock('../session-switcher', () => ({ SessionSwitcher: () => null }))
vi.mock('../settings/plugin-install-modal', () => ({ PluginInstallModal: () => null }))
vi.mock('../shell/titlebar-controls', () => ({ TitlebarControls: () => null }))
vi.mock('../updates-overlay', () => ({ UpdatesOverlay: () => null }))
vi.mock('./mcp-install-deeplink-dialog', () => ({ McpInstallDeepLinkDialog: () => null }))
vi.mock('./surfaces', () => ({
  ChatRoutesSurface: () => null,
  SidebarSurface: () => null,
  StatusbarSurface: () => null,
  TerminalSurface: () => null
}))
vi.mock('../session/hooks/use-context-suggestions', () => ({ useContextSuggestions: () => ({}) }))
vi.mock('../session/hooks/use-cwd-actions', () => ({ useCwdActions: () => ({}) }))
vi.mock('../session/hooks/use-hermes-config', () => ({ useHermesConfig: () => ({}) }))
vi.mock('../session/hooks/use-message-stream', () => ({ useMessageStream: () => ({}) }))
vi.mock('../session/hooks/use-model-controls', () => ({ useModelControls: () => ({}) }))
vi.mock('../session/hooks/use-preview-routing', () => ({ usePreviewRouting: () => ({}) }))
vi.mock('../session/hooks/use-route-resume', () => ({ useRouteResume: () => ({}) }))
vi.mock('../session/hooks/use-session-actions', () => ({ useSessionActions: () => ({}) }))
vi.mock('../session/hooks/use-session-list-actions', () => ({ useSessionListActions: () => ({}) }))
vi.mock('../chat/hooks/use-composer-actions', () => ({ useComposerActions: () => ({}) }))
vi.mock('../hooks/use-keybinds', () => ({ useKeybinds: () => ({}) }))
vi.mock('../hud/handoff', () => ({ useHudHandoff: () => ({}) }))
vi.mock('../shell/hooks/use-overlay-routing', () => ({ useOverlayRouting: () => ({}) }))
vi.mock('./hooks/use-background-sync', () => ({ useBackgroundSync: () => ({}) }))
vi.mock('./hooks/use-desktop-integrations', () => ({ useDesktopIntegrations: () => ({}) }))
vi.mock('./hooks/use-pet-bridge', () => ({ usePetBridge: () => ({}) }))
vi.mock('./hooks/use-quick-entry-bridge', () => ({ useQuickEntryBridge: () => ({}) }))
vi.mock('./hooks/use-session-tile-delegate', () => ({ useSessionTileDelegate: () => ({}) }))
vi.mock('@/themes/use-skin-command', () => ({ useSkinCommand: () => ({}) }))
vi.mock('../hooks/use-config-record', () => ({ useHermesConfigRecord: () => ({}) }))
vi.mock('./dev/credits-notice-demo', () => ({ installCreditsNoticeDemo: () => undefined }))
vi.mock('./panes', async () => {
  const { atom } = await import('nanostores')

  return { $restartPreviewServer: atom(null), useTitlebarToolContributions: () => [] }
})
vi.mock('../shell/hooks/use-window-controls-overlay-width', () => ({ useWindowControlsOverlayWidth: () => 0 }))

import { ContribWiring } from './wiring'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

afterEach(() => {
  cleanup()
  queryClient.clear()
  clearNotifications()
  $activeGatewayProfile.set('default')
  fixture.handleGatewayEvent = null
  vi.clearAllMocks()
})

describe('ContribWiring wake word in another profile', () => {
  // A failed switch toasts its title, and a non-English toast also shows that title as its
  // message: the whole title is copy, and it names the profile the way the sidebar does.
  it('names the default profile in the UI language when the switch without a new chat fails', async () => {
    $activeGatewayProfile.set('work')
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ContribWiring>{null}</ContribWiring>
        </QueryClientProvider>
      </MemoryRouter>
    )
    setRuntimeI18nLocale('zh')

    try {
      act(() => {
        fixture.handleGatewayEvent!({
          payload: { profile: 'default', start_new_session: false },
          type: 'wake.detected'
        })
      })
      await vi.waitFor(() => expect($notifications.get()).toHaveLength(1))

      const title = $notifications.get()[0].title ?? ''

      expect(fixture.ensureGatewayProfile).toHaveBeenCalledWith('default')
      expect(title).toContain('默认')
      // No English sentence around the name, and never the raw key "default".
      expect(title).not.toMatch(/[A-Za-z]/)
    } finally {
      setRuntimeI18nLocale(DEFAULT_LOCALE)
    }
  })
})
