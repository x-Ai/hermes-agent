import { describe, expect, it } from 'vitest'

import { en } from './en'
import { zh } from './zh'

describe('Chinese localization regressions', () => {
  it('keeps protocol names verbatim while localizing user-facing tier and bundled-plugin copy', () => {
    expect(zh.settings.mcp.catalogAuthOAuth).toBe('OAuth')
    expect(zh.shell.statusbar.toggleFreeTier).toBe('免费套餐')
    expect(zh.shell.statusbar.toggleFreeTier).not.toBe(en.shell.statusbar.toggleFreeTier)
    expect(zh.skills.plugins.bundledDescriptions['disk-cleanup']).not.toBe('')
    expect(zh.skills.plugins.bundledDescriptions['security-guidance']).not.toBe('')
  })

  it('ships localized intro pools instead of falling through to generated English slogans', () => {
    expect(zh.intro.stock.none).toHaveLength(5)
    expect(zh.intro.stock.none?.every(line => /[\u3400-\u9fff]/u.test(line))).toBe(true)
  })
})
