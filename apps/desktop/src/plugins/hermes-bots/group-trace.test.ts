import { describe, expect, it } from 'vitest'

import {
  boundGroupTrace,
  GROUP_TRACE_CHARS,
  GROUP_TRACE_STEP_LIMIT,
  groupTraceChars,
  groupTraceCounts,
  isGroupTurnTrace,
  retainGroupTraces
} from './group-trace'
import type { GroupTraceStep, GroupTurnTrace } from './group-trace'

const reasoning = (text: string): GroupTraceStep => ({ kind: 'reasoning', text })
const tool = (name: string): GroupTraceStep => ({ kind: 'tool', name })

describe('boundGroupTrace', () => {
  it('returns null when a turn left no steps', () => {
    expect(boundGroupTrace([])).toBeNull()
  })

  it('keeps every step and records no drop when within budget', () => {
    const trace = boundGroupTrace([reasoning('a'), tool('read_file')])

    expect(trace).toEqual({ steps: [reasoning('a'), tool('read_file')] })
    expect(trace?.dropped).toBeUndefined()
  })

  it('keeps the NEWEST steps and counts the cut when over the step limit', () => {
    const steps = Array.from({ length: GROUP_TRACE_STEP_LIMIT + 5 }, (_, i) => tool(`t${i}`))

    const trace = boundGroupTrace(steps)

    expect(trace?.steps).toHaveLength(GROUP_TRACE_STEP_LIMIT)
    expect(trace?.dropped).toBe(5)
    // The last tool survives; the first is dropped.
    expect(trace?.steps.at(-1)).toEqual(tool(`t${GROUP_TRACE_STEP_LIMIT + 4}`))
    expect(trace?.steps[0]).toEqual(tool('t5'))
  })

  it('drops the oldest steps when over the character budget', () => {
    const big = 'x'.repeat(GROUP_TRACE_CHARS)
    const trace = boundGroupTrace([reasoning('old'), reasoning(big)])

    expect(trace?.dropped).toBe(1)
    expect(trace?.steps).toEqual([reasoning(big)])
  })
})

describe('groupTraceCounts', () => {
  it('reports whether the turn thought and how many tools it ran', () => {
    const trace: GroupTurnTrace = {
      steps: [reasoning('a'), tool('read_file'), { kind: 'text', text: 'hm' }, tool('patch')]
    }

    expect(groupTraceCounts(trace)).toEqual({ reasoning: true, tools: 2 })
  })

  it('reports no reasoning for a tool-only trace', () => {
    expect(groupTraceCounts({ steps: [tool('terminal')] })).toEqual({ reasoning: false, tools: 1 })
  })
})

describe('isGroupTurnTrace', () => {
  it('accepts a well-formed trace', () => {
    expect(isGroupTurnTrace({ steps: [reasoning('a'), tool('x')] })).toBe(true)
  })

  it('rejects malformed shapes a stale or future build might store', () => {
    expect(isGroupTurnTrace(null)).toBe(false)
    expect(isGroupTurnTrace({})).toBe(false)
    expect(isGroupTurnTrace({ steps: 'nope' })).toBe(false)
    expect(isGroupTurnTrace({ steps: [{ kind: 'mystery', text: 'x' }] })).toBe(false)
    // A tool step without a name, or a reasoning step without text, is invalid.
    expect(isGroupTurnTrace({ steps: [{ kind: 'tool' }] })).toBe(false)
    expect(isGroupTurnTrace({ steps: [{ kind: 'reasoning' }] })).toBe(false)
  })
})

describe('retainGroupTraces', () => {
  it('returns the same array when every trace fits the budget', () => {
    const log = [{ text: 'a', trace: { steps: [reasoning('x')] } }, { text: 'b' }]

    expect(retainGroupTraces(log, 10_000)).toBe(log)
  })

  it('drops the OLDEST traces past the budget, keeping their text and the newest traces', () => {
    const heavy = (n: number): GroupTurnTrace => ({ steps: [reasoning('y'.repeat(n))] })

    const log = [
      { text: 'old', trace: heavy(5_000) },
      { text: 'mid', trace: heavy(5_000) },
      { text: 'new', trace: heavy(5_000) }
    ]

    const kept = retainGroupTraces(log, 9_000)

    // Newest trace survives; older ones lose the trace but keep their text.
    expect(kept[2].trace).toBeTruthy()
    expect(kept[0].trace).toBeUndefined()
    expect(kept[0].text).toBe('old')
    expect(groupTraceChars(kept[2].trace)).toBeGreaterThan(0)
  })
})
