import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/en'
import { zh } from '@/i18n/zh'

import { localizeReviewSummaryDetail } from './review-summary-localization'

const copy = zh.assistant.thread.reviewSummary
const english = en.assistant.thread.reviewSummary

describe('review summary localization', () => {
  it('localizes the generic memory action from the screenshot', () => {
    expect(localizeReviewSummaryDetail('Memory updated', copy)).toBe(copy.memoryUpdated)
    expect(copy.memoryUpdated).not.toBe(english.memoryUpdated)
  })

  it('localizes named skill actions while preserving names and detail', () => {
    expect(localizeReviewSummaryDetail("Skill 'hermes-release' patched", copy)).toBe(
      copy.skillNamedPatched('hermes-release', '')
    )
    expect(localizeReviewSummaryDetail("📝 Skill 'deploy' created: release workflow", copy)).toBe(
      copy.skillNamedCreated('deploy', 'release workflow')
    )
    expect(copy.skillNamedCreated('deploy', 'release workflow')).toContain('deploy')
    expect(copy.skillNamedCreated('deploy', 'release workflow')).toContain('release workflow')
  })

  it('localizes every action in a combined summary and preserves unknown actions', () => {
    expect(localizeReviewSummaryDetail('User profile updated · Memory ➕ prefers concise replies', copy)).toBe(
      `${copy.userProfileUpdated} · ${copy.memoryLabel} ➕ prefers concise replies`
    )
    expect(copy.userProfileUpdated).not.toBe(english.userProfileUpdated)
    expect(copy.memoryLabel).not.toBe(english.memoryLabel)
    expect(localizeReviewSummaryDetail('Future backend action', copy)).toBe('Future backend action')
  })
})
