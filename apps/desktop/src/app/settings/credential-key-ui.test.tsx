import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { en } from '@/i18n/en'
import type { EnvVarInfo } from '@/types/hermes'

vi.mock('@/store/profile', () => ({
  $activeGatewayProfile: atom('default'),
  $profiles: atom([
    { is_default: true, name: 'default' },
    { is_default: false, name: 'bot' }
  ]),
  normalizeProfileKey: (p: string | null) => p || 'default',
  profileLabel: (p: { display_name?: string; name: string }) => p.display_name || p.name,
  refreshProfiles: async () => {}
}))

const { CredentialKeyCard, KeyField } = await import('./credential-key-ui')
const { $settingsScopeOverride } = await import('@/store/settings-scope')

type KeyRowProps = Parameters<typeof KeyField>[0]['rowProps']

const info: EnvVarInfo = {
  advanced: false,
  category: 'setting',
  description: '本地化后的设置说明',
  is_password: false,
  is_set: false,
  redacted_value: null,
  tools: [],
  url: null
}

const rowProps: KeyRowProps = {
  edits: {},
  onClear: vi.fn(),
  onReveal: vi.fn(),
  onSave: vi.fn(),
  revealed: {},
  saving: null,
  setEdits: vi.fn()
}

describe('CredentialKeyCard', () => {
  afterEach(cleanup)

  it('shows the localized description after a setting row is expanded', () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <CredentialKeyCard
          expanded
          info={info}
          label="Sudo Password"
          onExpand={vi.fn()}
          onToggle={vi.fn()}
          placeholder="可选"
          rowProps={rowProps}
          varKey="SUDO_PASSWORD"
        />
      </I18nProvider>
    )

    expect(screen.getByText('Sudo Password')).toBeTruthy()
    expect(screen.getByText('本地化后的设置说明')).toBeTruthy()
  })

  it('keeps descriptions hidden while a setting row is collapsed', () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <CredentialKeyCard
          expanded={false}
          info={info}
          label="Sudo Password"
          onExpand={vi.fn()}
          onToggle={vi.fn()}
          placeholder="可选"
          rowProps={rowProps}
          varKey="SUDO_PASSWORD"
        />
      </I18nProvider>
    )

    expect(screen.queryByText('本地化后的设置说明')).toBeNull()
  })

  it('shows a credential shared from the main profile read-only, with the jump to that profile', () => {
    $settingsScopeOverride.set('bot')
    const setEdits = vi.fn()

    const shared: EnvVarInfo = {
      ...info,
      is_password: true,
      is_set: true,
      redacted_value: '••••1234',
      source: 'default-profile'
    }

    render(
      <I18nProvider configClient={null} initialLocale="en">
        <KeyField info={shared} rowProps={{ ...rowProps, setEdits }} varKey="OPENAI_API_KEY" />
      </I18nProvider>
    )

    const field = screen.getByRole('textbox') as HTMLInputElement
    expect(field.readOnly).toBe(true)
    fireEvent.focus(field)
    expect(setEdits).not.toHaveBeenCalled()
    expect(screen.getByText(en.sharedProviders.badge)).toBeTruthy()
    expect(screen.getByText(en.sharedProviders.keyHint)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: en.sharedProviders.editInMain }))

    expect($settingsScopeOverride.get()).toBeNull()
  })
})
