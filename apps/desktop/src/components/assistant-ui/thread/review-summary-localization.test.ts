import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from '@/i18n'
import { zh } from '@/i18n/zh'

import { localizeReviewSummaryDetail } from './review-summary-localization'

const copy = zh.assistant.thread.reviewSummary

describe('review summary localization', () => {
  it('localizes the generic memory action from the screenshot', () => {
    expect(localizeReviewSummaryDetail('Memory updated', copy)).toBe('记忆已更新')
  })

  it('localizes named skill actions while preserving names and detail', () => {
    expect(localizeReviewSummaryDetail("Skill 'hermes-release' patched", copy)).toBe(
      copy.skillNamedPatched('hermes-release', '')
    )
    const created = localizeReviewSummaryDetail("📝 Skill 'deploy' created: release workflow", copy)
    expect(created).toBe(copy.skillNamedCreated('deploy', 'release workflow'))
    expect(created).toContain('deploy')
    expect(created).toContain('release workflow')
  })

  it('localizes every action in a combined summary and preserves unknown actions', () => {
    expect(localizeReviewSummaryDetail('User profile updated · Memory ➕ prefers concise replies', copy)).toBe(
      '用户资料已更新 · 记忆 ➕ prefers concise replies'
    )
    expect(localizeReviewSummaryDetail('Future backend action', copy)).toBe('Future backend action')
  })

  it('merges repeated skill operations across calls while retaining files and distinct actions', () => {
    const name = 'skill-from-review'
    const otherName = 'other-skill-from-review'

    const actions = [
      `Skill '${name}' patched`,
      'Memory updated',
      `Skill '${name}' patched (references/one.md)`,
      `Skill '${name}' patched (SKILL.md, references/one.md)`,
      `Skill '${name}' patched (references/two.md)`,
      `Skill '${name}' patched (references/accounts, and gates.md)`,
      `Skill '${name}' patched: preserve this explanation`,
      `Skill '${otherName}' patched`,
      `Skill '${name}' updated (full rewrite).`,
      'Future backend action'
    ]

    for (const translations of Object.values(TRANSLATIONS)) {
      const localeCopy = translations.assistant.thread.reviewSummary

      const grouped = localeCopy.skillNamedPatched(
        name,
        '(SKILL.md, references/one.md, references/two.md, references/accounts, and gates.md) · preserve this explanation'
      )

      expect(localizeReviewSummaryDetail(actions.join(' · '), localeCopy)).toBe(
        [
          grouped,
          localeCopy.memoryUpdated,
          localeCopy.skillNamedPatched(otherName, ''),
          localeCopy.skillNamedRewritten(name, ''),
          'Future backend action'
        ].join(' · ')
      )
    }
  })
})
