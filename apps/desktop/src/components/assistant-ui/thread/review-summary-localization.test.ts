import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'

import { localizeReviewSummaryDetail } from './review-summary-localization'

const copy = zh.assistant.thread.reviewSummary

describe('review summary localization', () => {
  it('localizes the generic memory action from the screenshot', () => {
    expect(localizeReviewSummaryDetail('Memory updated', copy)).toBe('记忆已更新')
  })

  it('localizes named skill actions while preserving names and detail', () => {
    expect(localizeReviewSummaryDetail("Skill 'hermes-release' patched", copy)).toBe('技能“hermes-release”已修补')
    expect(localizeReviewSummaryDetail("📝 Skill 'deploy' created: release workflow", copy)).toBe(
      '技能“deploy”已创建：release workflow'
    )
  })

  it('localizes every action in a combined summary and preserves unknown actions', () => {
    expect(localizeReviewSummaryDetail('User profile updated · Memory ➕ prefers concise replies', copy)).toBe(
      '用户资料已更新 · 记忆 ➕ prefers concise replies'
    )
    expect(localizeReviewSummaryDetail('Future backend action', copy)).toBe('Future backend action')
  })
})
