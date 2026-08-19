import { describe, expect, it } from 'vitest'

import type { UsageStats } from '@/types/hermes'

import { usageContextLabel } from './statusbar'

const usage = (patch: Partial<UsageStats> = {}): UsageStats => ({
  calls: 0,
  input: 0,
  output: 0,
  total: 0,
  ...patch
})

describe('usageContextLabel', () => {
  it('spells out Token when only total usage is available', () => {
    expect(usageContextLabel(usage({ total: 50_300 }))).toBe('50.3k Token')
  })

  it('keeps the context-window fraction when the backend reports it', () => {
    expect(usageContextLabel(usage({ context_max: 128_000, context_used: 50_300, total: 60_000 }))).toBe('50.3k/128k')
  })
})
