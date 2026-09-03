import { describe, expect, it } from 'vitest'

import type { UsageStats } from '@/types/hermes'

import { cacheHitLabel, tokensPerSecondLabel, usageContextLabel } from './statusbar'

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

describe('statusbar usage readouts', () => {
  it('paints the backend cache-hit and throughput fields, and stays blank when they are absent', () => {
    // The backend omits both fields (rather than sending 0) when it has no data
    // — a provider with no cache reads, or a session before its first call.
    expect(cacheHitLabel(usage())).toBe('')
    expect(tokensPerSecondLabel(usage())).toBe('')

    expect(cacheHitLabel(usage({ cache_hit_pct: 87 }))).toBe('87%')
    expect(tokensPerSecondLabel(usage({ avg_tps: 41.6 }))).toBe('42 t/s')
  })
})
