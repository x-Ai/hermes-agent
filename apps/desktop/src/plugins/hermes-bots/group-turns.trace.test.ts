import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as groupChat from './group-chat'
import type * as groupRounds from './group-rounds'
import { createGroupGateway, drain, runTimersInline, scriptedStorage } from './group-test-utils'
import type { GatewayOptions, ScriptedGateway, TurnScript } from './group-test-utils'
import type { GroupTurnTraceSink } from './group-trace'
import type * as groupTraceLive from './group-trace-live'
import type * as groupTurns from './group-turns'
import type { GroupMember } from './types'

const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

interface Room {
  chat: typeof groupChat
  gateway: ScriptedGateway
  rounds: typeof groupRounds
  turns: typeof groupTurns
}

async function loadRoom(options: GatewayOptions = {}): Promise<Room> {
  vi.resetModules()
  const gateway = createGroupGateway(options)

  for (const key of Object.keys(host)) {
    delete host[key]
  }

  Object.assign(host, gateway.host)

  const [chat, rounds, turns, shared] = await Promise.all([
    import('./group-chat'),
    import('./group-rounds'),
    import('./group-turns'),
    import('./shared')
  ])

  shared.setPluginCtx(scriptedStorage(gateway.storage))

  return { chat, gateway, rounds, turns }
}

const LOCAL_MEMBER: GroupMember = { name: 'helper', title: '' }

// A turn that thinks, reads a file, then answers — the transcript `session.resume`
// hands back after it finishes.
const THINKING_TURN: TurnScript = () => [
  { role: 'assistant', reasoning: 'I should read the config first.', content: '' },
  { content: '', role: 'tool', name: 'read_file', context: 'read config.yaml', args: { path: 'config.yaml' } },
  { role: 'assistant', content: 'Config looks right.' }
]

beforeEach(() => {
  runTimersInline()
})

describe('group turn trace', () => {
  it('fills the caller sink with the reasoning and tool behind the reply', async () => {
    const room = await loadRoom({ turn: THINKING_TURN })
    const sink: GroupTurnTraceSink = {}

    const reply = await room.turns.runGroupChatMemberTurn('Room', LOCAL_MEMBER, 'hi', 't1', [], sink)

    expect(reply).toBe('Config looks right.')
    expect(sink.trace).toEqual({
      steps: [
        { kind: 'reasoning', text: 'I should read the config first.' },
        { kind: 'tool', name: 'read_file', context: 'read config.yaml', args: '{\n  "path": "config.yaml"\n}' }
      ]
    })
  })

  it('leaves the sink empty when the member passes', async () => {
    const room = await loadRoom({ turn: () => '(pass)' })
    const sink: GroupTurnTraceSink = {}

    const reply = await room.turns.runGroupChatMemberTurn('Room', LOCAL_MEMBER, 'hi', 't1', [], sink)

    expect(reply).toBe('(pass)')
    expect(sink.trace).toBeUndefined()
  })

  it('appends the member reply to the room with its trace through a full send', async () => {
    const room = await loadRoom({ turn: THINKING_TURN })

    room.rounds.sendToGroupChat('Room', [LOCAL_MEMBER], '@helper check the config')
    await drain(() => Boolean(room.chat.$groupChats.get().Room?.running))

    const reply = room.chat.$groupChats.get().Room?.log.find(entry => entry.from.kind === 'member')

    expect(reply?.text).toBe('Config looks right.')
    expect(reply?.trace?.steps.map(step => step.kind)).toEqual(['reasoning', 'tool'])
  })

  it('shows the turn live from the gateway stream and joins the tool outcome into the reply', async () => {
    const listeners = new Map<string, Set<(event: unknown) => void>>()

    const emit = (type: string, session_id: string, payload: unknown) => {
      for (const listener of listeners.get(type) ?? []) {
        listener({ payload, session_id, type })
      }
    }

    let seenLive: unknown = null
    let liveModule: typeof groupTraceLive | null = null

    const room = await loadRoom({
      turn: ({ session }) => {
        // Frames stream while the member works, keyed by the runtime id the turn owns.
        emit('tool.start', session.runtime, { tool_id: 'c1', name: 'read_file', context: 'read config.yaml' })
        seenLive = liveModule?.$groupLiveTraces.get()['Room::helper'] ?? null
        emit('tool.complete', session.runtime, { tool_id: 'c1', name: 'read_file', summary: 'read 12 lines' })

        return [
          { content: '', role: 'tool', name: 'read_file', context: 'read config.yaml', tool_call_id: 'c1' },
          { role: 'assistant', content: 'Config looks right.' }
        ]
      }
    })

    // A tap on the scripted host (loadRoom rebuilt the record, so it goes on
    // afterwards): the recorder subscribes through host.onEvent at turn start.
    host.onEvent = (type: string, listener: (event: unknown) => void) => {
      const set = listeners.get(type) ?? new Set<(event: unknown) => void>()
      set.add(listener)
      listeners.set(type, set)

      return () => set.delete(listener)
    }

    // The same module registry the engine uses (loadRoom reset it).
    liveModule = await import('./group-trace-live')
    const sink: GroupTurnTraceSink = {}

    const reply = await room.turns.runGroupChatMemberTurn('Room', LOCAL_MEMBER, 'hi', 't1', [], sink)

    expect(reply).toBe('Config looks right.')
    // Mid-turn, the live store carried the running tool.
    expect((seenLive as { steps?: unknown[]; runningIndex?: unknown } | null)?.steps).toEqual([
      { kind: 'tool', name: 'read_file', context: 'read config.yaml' }
    ])
    expect((seenLive as { runningIndex?: unknown } | null)?.runningIndex).toBe(0)
    // After the turn the live entry is gone and the reply's trace carries the outcome by tool_call_id.
    expect(liveModule.$groupLiveTraces.get()['Room::helper']).toBeUndefined()
    expect(sink.trace?.steps).toEqual([
      { kind: 'tool', name: 'read_file', context: 'read config.yaml', note: 'read 12 lines' }
    ])
  })
})
