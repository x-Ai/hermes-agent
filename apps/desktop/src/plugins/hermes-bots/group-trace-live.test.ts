import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runTimersInline } from './group-test-utils'
import type { GroupMember } from './types'

const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

type Listener = (event: { payload?: unknown; session_id?: string; type?: string }) => void

/** A stand-in for `host.onEvent`: subscribe by type, emit a frame for a session. */
function gatewayStream() {
  const listeners = new Map<string, Set<Listener>>()

  return {
    onEvent: (type: string, listener: Listener) => {
      const set = listeners.get(type) ?? new Set<Listener>()
      set.add(listener)
      listeners.set(type, set)

      return () => {
        set.delete(listener)
      }
    },
    emit(type: string, session_id: string, payload: unknown) {
      for (const listener of listeners.get(type) ?? []) {
        listener({ payload, session_id, type })
      }
    },
    listening: () => [...listeners.values()].reduce((n, set) => n + set.size, 0)
  }
}

const MEMBER: GroupMember = { name: 'helper', title: '' }
const KEY = 'Room::helper'

async function load() {
  vi.resetModules()

  return import('./group-trace-live')
}

beforeEach(() => {
  runTimersInline()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('startGroupLiveTrace', () => {
  it('assembles reasoning, tool and interim frames of the turn, ignoring other sessions', async () => {
    const live = await load()
    const stream = gatewayStream()
    const recorder = live.startGroupLiveTrace('Room', MEMBER, 't1', new Set(['rt-1']), stream)

    stream.emit('reasoning.delta', 'rt-1', { text: 'Let me ' })
    stream.emit('reasoning.delta', 'rt-1', { text: 'look.' })
    stream.emit('reasoning.delta', 'rt-other', { text: 'NOT OURS' })
    stream.emit('tool.start', 'rt-1', {
      tool_id: 'c1',
      name: 'read_file',
      context: 'read a.ts',
      args: { path: 'a.ts' }
    })

    let entry = live.$groupLiveTraces.get()[KEY]

    expect(entry?.steps).toEqual([
      { kind: 'reasoning', text: 'Let me look.' },
      { kind: 'tool', name: 'read_file', context: 'read a.ts', args: '{\n  "path": "a.ts"\n}' }
    ])
    // The tool has started and not finished: it is the running step.
    expect(entry?.runningIndex).toBe(1)

    stream.emit('tool.complete', 'rt-1', {
      tool_id: 'c1',
      name: 'read_file',
      result: { success: true, output: 'line1\nline2' },
      summary: 'read 2 lines in 0.1s'
    })
    stream.emit('message.interim', 'rt-1', { text: 'Checking one more thing.' })
    // A completion whose start frame was gated off still lands as a step.
    stream.emit('tool.complete', 'rt-1', { tool_id: 'c2', name: 'patch', result: { error: 'no such file' } })

    entry = live.$groupLiveTraces.get()[KEY]

    expect(entry?.steps).toEqual([
      { kind: 'reasoning', text: 'Let me look.' },
      {
        kind: 'tool',
        name: 'read_file',
        context: 'read a.ts',
        args: '{\n  "path": "a.ts"\n}',
        note: 'read 2 lines in 0.1s'
      },
      { kind: 'text', text: 'Checking one more thing.' },
      { kind: 'tool', name: 'patch', failed: true, note: 'no such file' }
    ])
    expect(entry?.runningIndex).toBeNull()
    expect(recorder.outcomes()).toEqual({
      c1: { note: 'read 2 lines in 0.1s' },
      c2: { failed: true, note: 'no such file' }
    })
  })

  it('adopts the poll transcript only while no frame has arrived', async () => {
    const live = await load()
    const stream = gatewayStream()
    const recorder = live.startGroupLiveTrace('Room', MEMBER, 't1', new Set(['rt-1']), stream)

    recorder.notePoll({ steps: [{ kind: 'tool', name: 'terminal', context: 'ls' }] })

    expect(live.$groupLiveTraces.get()[KEY]?.steps).toEqual([{ kind: 'tool', name: 'terminal', context: 'ls' }])

    // The stream speaks: it is the authoritative, ordered account from here on.
    stream.emit('tool.start', 'rt-1', { tool_id: 'c9', name: 'web_search', context: 'search hermes' })
    recorder.notePoll({ steps: [{ kind: 'tool', name: 'IGNORED' }] })

    expect(live.$groupLiveTraces.get()[KEY]?.steps).toEqual([
      { kind: 'tool', name: 'web_search', context: 'search hermes' }
    ])
  })

  it('stop removes the entry, unsubscribes, and keeps the outcomes for the finished trace', async () => {
    const live = await load()
    const stream = gatewayStream()
    const recorder = live.startGroupLiveTrace('Room', MEMBER, 't1', new Set(['rt-1']), stream)

    stream.emit('tool.start', 'rt-1', { tool_id: 'c1', name: 'read_file' })
    stream.emit('tool.complete', 'rt-1', { tool_id: 'c1', name: 'read_file', summary: 'read 1 file' })

    expect(live.$groupLiveTraces.get()[KEY]).toBeTruthy()
    expect(stream.listening()).toBeGreaterThan(0)

    recorder.stop()

    expect(live.$groupLiveTraces.get()[KEY]).toBeUndefined()
    expect(stream.listening()).toBe(0)
    expect(recorder.outcomes()).toEqual({ c1: { note: 'read 1 file' } })

    // Late frames after the turn ended are not resurrected into the store.
    stream.emit('tool.start', 'rt-1', { tool_id: 'c3', name: 'late' })
    expect(live.$groupLiveTraces.get()[KEY]).toBeUndefined()
  })

  it('coalesces reasoning deltas into one repaint per tick', async () => {
    vi.unstubAllGlobals()
    vi.useFakeTimers()

    try {
      const live = await load()
      const stream = gatewayStream()
      live.startGroupLiveTrace('Room', MEMBER, 't1', new Set(['rt-1']), stream)

      stream.emit('reasoning.delta', 'rt-1', { text: 'a' })
      stream.emit('reasoning.delta', 'rt-1', { text: 'b' })

      // Deltas alone wait for the flush tick.
      expect(live.$groupLiveTraces.get()[KEY]).toBeUndefined()

      vi.advanceTimersByTime(200)

      expect(live.$groupLiveTraces.get()[KEY]?.steps).toEqual([{ kind: 'reasoning', text: 'ab' }])
    } finally {
      vi.useRealTimers()
    }
  })

  it('works without an event tap: the poll transcript is the whole live view', async () => {
    const live = await load()
    // The scripted host has no onEvent, and no deps are injected.
    const recorder = live.startGroupLiveTrace('Room', MEMBER, 't1', new Set(['rt-1']))

    recorder.notePoll({ steps: [{ kind: 'reasoning', text: 'from the transcript' }] })

    expect(live.$groupLiveTraces.get()[KEY]?.steps).toEqual([{ kind: 'reasoning', text: 'from the transcript' }])

    recorder.stop()

    expect(live.$groupLiveTraces.get()[KEY]).toBeUndefined()
  })
})

describe('groupToolOutcomeFromFrame', () => {
  it('reads the gateway summary first, then an error, then the first output line', async () => {
    const { groupToolOutcomeFromFrame } = await load()

    expect(groupToolOutcomeFromFrame({ summary: 'ran in 2s', result: { output: 'ignored' } })).toEqual({
      note: 'ran in 2s'
    })
    expect(groupToolOutcomeFromFrame({ result: { success: false, error: 'boom' } })).toEqual({
      failed: true,
      note: 'boom'
    })
    expect(groupToolOutcomeFromFrame({ result: { output: 'first line\nsecond' } })).toEqual({ note: 'first line' })
    expect(groupToolOutcomeFromFrame({ result: 'plain text result\nmore' })).toEqual({ note: 'plain text result' })
  })

  it('does not call a successful result failed because it carries an error field', async () => {
    const { groupToolOutcomeFromFrame } = await load()

    expect(groupToolOutcomeFromFrame({ result: { success: true, error: '', output: 'ok' } })).toEqual({ note: 'ok' })
  })
})
