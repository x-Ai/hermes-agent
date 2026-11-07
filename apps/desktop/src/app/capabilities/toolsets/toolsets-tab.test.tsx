import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as HermesApi from '@/hermes'
import { I18nProvider, TRANSLATIONS } from '@/i18n'

import { ToolsetsTab } from './toolsets-tab'

vi.mock('@/hermes', async importOriginal => ({
  ...(await importOriginal<typeof HermesApi>()),
  getUsageAnalytics: vi.fn().mockResolvedValue({ tools: [] }),
  setToolsetEnabled: vi.fn()
}))

afterEach(cleanup)

describe('ToolsetsTab empty state', () => {
  // Each locale's templates take the noun in their own grammatical form
  // (de "Kein Tool", fr "Aucun outil"); Arabic used to special-case the English word.
  it.each(['ru', 'de', 'ja', 'ar'] as const)('names the missing tools in %s', async locale => {
    const skills = TRANSLATIONS[locale].skills

    render(
      <I18nProvider configClient={null} initialLocale={locale}>
        <ToolsetsTab onQueryChange={() => undefined} profile={undefined} query="" toolsets={[]} />
      </I18nProvider>
    )

    expect(await screen.findByText(skills.emptyNoneFound(skills.emptyToolsNoun))).toBeTruthy()
    expect(screen.getByText(skills.emptyNoneAvailable(skills.emptyToolsNoun))).toBeTruthy()
    expect(screen.queryByText(/tools/)).toBeNull()
  })
})
