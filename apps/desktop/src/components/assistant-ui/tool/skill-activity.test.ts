import { afterEach, describe, expect, it } from 'vitest'

import { BUNDLED_LOCALES, setRuntimeI18nLocale } from '@/i18n'

import { summarizeToolRun } from './run-summary'
import { skillActivityTitle } from './skill-activity'

const skill = { type: 'tool-call' as const, toolName: 'skill_view', args: { name: 'research-notes' } }

const MIXED_RUN = [
  { ...skill, result: 'instructions' },
  { ...skill, args: { name: 'second-skill' }, result: { error: 'not found' } },
  { toolName: 'terminal', args: { command: 'echo ok' }, result: { stdout: 'ok' } }
]

describe('skill activity identity', () => {
  afterEach(() => setRuntimeI18nLocale('en'))

  it('keeps each skill identity and failed outcome in mixed collapsed summaries', () => {
    const summary = summarizeToolRun(MIXED_RUN, false)

    expect(summary).toContain('Loaded skill: research-notes')
    expect(summary).toContain('failed to load skill: second-skill')
    expect(summary).toContain('ran 1 command')
    expect(summary).toContain('1 tool call failed')
  })

  // The skill names are identifiers; every other word on the line is copy, the
  // failed-call count included.
  it('reads the mixed collapsed summary in Chinese around the skill names', () => {
    for (const locale of ['zh', 'zh-hant'] as const) {
      setRuntimeI18nLocale(locale)

      const copy = summarizeToolRun(MIXED_RUN, false).replace(/research-notes|second-skill/g, '')

      expect(copy, locale).not.toMatch(/[A-Za-z]/)
    }
  })

  // A skill row still loading must not read like one that already finished.
  it('tells an in-progress skill action from a finished one in every bundled locale', () => {
    const calls = [
      { toolName: 'skill_view', args: { name: 'research-notes' } },
      { toolName: 'skill_view', args: { name: 'research-notes', file_path: 'references/api.md' } },
      { toolName: 'skills_list', args: {} }
    ]

    for (const locale of BUNDLED_LOCALES) {
      setRuntimeI18nLocale(locale)

      for (const call of calls) {
        expect(skillActivityTitle(call), `${locale} ${call.toolName}`).not.toBe(
          skillActivityTitle({ ...call, result: 'ok' })
        )
      }
    }
  })
})
