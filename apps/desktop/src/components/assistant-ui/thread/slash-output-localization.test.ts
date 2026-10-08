import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from '@/i18n'

import { localizeSlashOutput } from './slash-output-localization'

describe('localizeSlashOutput', () => {
  const t = TRANSLATIONS.zh
  const output = '⏳ Goal parked on pid 7 (build). Loop pauses until it exits.\n⊙ Goal (active, 1/20 turns): ship it'

  it('rewrites /goal output line by line', () => {
    expect(localizeSlashOutput('/goal', output, t)).toBe(
      `⏳ ${t.goalStatus.parkedOnPid('7', 'build')}\n⊙ ${t.goalStatus.activeStatus(t.goalStatus.meta.turns('1', '20'), 'ship it')}`
    )
  })

  it('keeps the lines of a /goal reply it does not own and the output of other commands', () => {
    const mixed = '✓ Goal cleared.\nsome backend footnote'

    expect(localizeSlashOutput('/goal', mixed, t)).toBe(`✓ ${t.goalStatus.cleared}\nsome backend footnote`)
    expect(localizeSlashOutput('/status', output, t)).toBe(output)
  })
})
