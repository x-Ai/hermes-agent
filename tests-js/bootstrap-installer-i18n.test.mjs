import { expect, test } from 'vitest'

import { installerStageName } from '../apps/bootstrap-installer/src/i18n.tsx'

test('localized installers do not expose the English products manifest title', () => {
  const manifestTitle = 'Install command and app + desktop'

  for (const locale of ['zh', 'zh-hant', 'ja', 'ar', 'ru']) {
    expect(installerStageName(locale, 'products', manifestTitle)).not.toBe(manifestTitle)
  }
})
