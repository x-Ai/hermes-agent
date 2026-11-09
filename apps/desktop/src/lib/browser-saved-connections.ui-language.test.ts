import { afterEach, expect, it, vi } from 'vitest'

import type { DesktopConnectionsRegistry, DesktopRegistryConnection } from '@/global'
import { setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'
import { $connection } from '@/store/session'

import { installBrowserDesktopBridge } from './browser-desktop-bridge'

// The Webapp reaches this machine's saved gateways through the gateway serving the page, and its
// bridge refuses what that path cannot do yet: popping a chat on another gateway out into a window
// (the window would boot on this gateway), or reading an SSH connection's roster. Those reasons are
// the Webapp's own copy, so they read in the UI language like the rest of the page.

type RelayWindow = Window & {
  __HERMES_AUTH_REQUIRED__?: boolean
  __HERMES_BASE_PATH__?: string
  __HERMES_UI_SURFACE__?: string
  hermesDesktop?: Window['hermesDesktop']
}

const win = window as unknown as RelayWindow

const row = (id: string, kind: DesktopRegistryConnection['kind'], label: string): DesktopRegistryConnection => ({
  authMode: 'token',
  headerNames: [],
  id,
  kind,
  label,
  tokenPreview: '...abcdef',
  tokenSet: true,
  url: `https://${id}.example.ts.net`
})

const registry: DesktopConnectionsRegistry = {
  connections: [
    { id: 'local', kind: 'local', label: 'Hub', tokenPreview: null, tokenSet: false },
    row('mini', 'remote', 'Mini'),
    row('lab', 'ssh', '实验室')
  ],
  lastUsed: 'local',
  launchMode: 'primary',
  primary: 'local',
  secureTokenStorage: true,
  version: 2
}

const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })

function installWebapp() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: URL) =>
      json(
        url.pathname === '/hermes/api/gateway-connections'
          ? registry
          : url.pathname.endsWith('/api/profiles')
            ? { profiles: [{ name: 'default' }] }
            : {}
      )
    )
  )
  win.__HERMES_AUTH_REQUIRED__ = true
  win.__HERMES_BASE_PATH__ = '/hermes'
  win.__HERMES_UI_SURFACE__ = 'webapp'
  expect(installBrowserDesktopBridge()).toBe(true)

  return win.hermesDesktop!
}

afterEach(() => {
  delete win.__HERMES_AUTH_REQUIRED__
  delete win.__HERMES_BASE_PATH__
  delete win.__HERMES_UI_SURFACE__
  Reflect.deleteProperty(win, 'hermesDesktop')
  document.documentElement.removeAttribute('data-hermes-desktop-host')
  window.localStorage.clear()
  $connection.set(null)
  setRuntimeI18nLocale('en')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it.each(['zh', 'zh-hant', 'ar'] as const)('refuses a relayed chat window in the UI language (%s)', async locale => {
  setRuntimeI18nLocale(locale)
  const desktop = installWebapp()
  await desktop.connections!.list()
  vi.spyOn(window, 'open').mockReturnValue(null)

  const result = await desktop.openSessionWindow('m1', { connectionId: 'mini', profile: 'default' })

  expect(result.ok).toBe(false)
  expect(result.error).toBe(TRANSLATIONS[locale].settings.gateway.webappRelay.chatOpensInTab)
  expect(result.error).not.toBe(TRANSLATIONS.en.settings.gateway.webappRelay.chatOpensInTab)
})

it.each(['zh', 'zh-hant', 'ar'] as const)('says why an SSH connection is missing from the roster in the UI language (%s)', async locale => {
  setRuntimeI18nLocale(locale)
  const roster = await installWebapp().getAgentRoster!()
  const lab = roster.sources.find(source => source.connectionId === 'lab')

  expect(lab?.reachable).toBe(false)
  expect(lab?.error).toBe(TRANSLATIONS[locale].settings.gateway.webappRelay.sshUnreached('实验室'))
  expect(lab?.error).toContain('实验室')
  expect(lab?.error).not.toBe(TRANSLATIONS.en.settings.gateway.webappRelay.sshUnreached('实验室'))
})
