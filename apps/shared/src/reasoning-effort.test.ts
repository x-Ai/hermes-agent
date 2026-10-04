import { describe, expect, it } from 'vitest'

import {
  clampEffort,
  DEFAULT_REASONING_EFFORT,
  EFFORT_LADDER,
  isReasoningEffort,
  normalizeSupportedEfforts,
  REASONING_EFFORT_VALUES,
  REASONING_EFFORTS
} from './reasoning-effort'

describe('reasoning-effort', () => {
  it('is one duplicate-free value set with `none` as the only non-level', () => {
    expect(new Set(REASONING_EFFORT_VALUES).size).toBe(REASONING_EFFORT_VALUES.length)
    expect(REASONING_EFFORT_VALUES.filter(v => !isReasoningEffort(v))).toEqual(['none'])
  })

  it('defaults to a real level and recognizes it case-insensitively', () => {
    expect(REASONING_EFFORTS).toContain(DEFAULT_REASONING_EFFORT)
    expect(isReasoningEffort(DEFAULT_REASONING_EFFORT.toUpperCase())).toBe(true)
  })

  it('orders the ladder from off to the strongest level', () => {
    expect(EFFORT_LADDER[0]).toBe('none')
    expect(EFFORT_LADDER.indexOf('low')).toBeLessThan(EFFORT_LADDER.indexOf('max'))
  })

  it('normalizes a published set onto the ladder and treats an empty one as unknown', () => {
    expect(normalizeSupportedEfforts([' Low', 'HIGH', 'high', 'bespoke'])).toEqual(['low', 'high'])
    expect(normalizeSupportedEfforts(['bespoke'])).toBeNull()
    expect(normalizeSupportedEfforts(null)).toBeNull()
    expect(normalizeSupportedEfforts(undefined)).toBeNull()
  })

  // Mirrors agent/reasoning_effort.py::clamp_effort — the picker annotates a
  // dimmed level with the SAME target the route will actually send.
  describe('clampEffort', () => {
    const glm = ['low', 'high', 'max']

    it('passes accepted, unknown-set and bespoke levels through verbatim', () => {
      expect(clampEffort('high', glm)).toBe('high')
      expect(clampEffort('xhigh', null)).toBe('xhigh')
      expect(clampEffort('turbo', glm)).toBe('turbo')
      expect(clampEffort('', glm)).toBe('')
    })

    it('clamps onto the nearest weaker accepted level, never escalating', () => {
      expect(clampEffort('medium', glm)).toBe('low')
      expect(clampEffort('xhigh', glm)).toBe('high')
      expect(clampEffort('ultra', glm)).toBe('max')
    })

    it('falls back to the weakest accepted level when nothing weaker exists', () => {
      expect(clampEffort('minimal', glm)).toBe('low')
    })

    it('never degrades an enabled ask onto none', () => {
      expect(clampEffort('minimal', ['none', 'low', 'high'])).toBe('low')
      expect(clampEffort('minimal', ['none'])).toBe('minimal')
    })
  })
})
