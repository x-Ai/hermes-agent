import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import type { EnvVarInfo } from '@/types/hermes'

import { CredentialKeyCard, type KeyRowProps } from './credential-key-ui'

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

  it('keeps setting descriptions visible while the row is collapsed', () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <CredentialKeyCard
          descriptionAlwaysVisible
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

    expect(screen.getByText('Sudo Password')).toBeTruthy()
    expect(screen.getByText('本地化后的设置说明')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Sudo Password/ })).toBeNull()
  })

  it('preserves collapsed descriptions for credential rows by default', () => {
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
})
