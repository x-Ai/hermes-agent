import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'

import { RemoteSetupFields } from './fields'
import { useRemoteSetup } from './use-remote-setup'

afterEach(cleanup)

function RegistryFields(): ReactElement {
  const setup = useRemoteSetup({ host: 'registry' })

  return <RemoteSetupFields setup={setup} />
}

describe('remote setup sign-in copy', () => {
  // With no provider named, boot.failure.identityProvider fills the provider slot,
  // and every German template puts that slot after „mit“, which takes the dative.
  it('declines the unnamed identity provider for German „mit“', () => {
    render(
      <I18nProvider configClient={null} initialLocale="de">
        <RegistryFields />
      </I18nProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }))

    expect(screen.getByRole('button', { name: /Identity-Provider/ }).textContent).toBe(
      'Mit Ihrem Identity-Provider anmelden'
    )
    expect(screen.getByText(/Melden Sie sich mit Ihrem Identity-Provider an/)).toBeTruthy()
  })
})
