import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as groupChat from './group-chat'
import type * as groupRounds from './group-rounds'
import { createGroupGateway, drain, runTimersInline, scriptedStorage } from './group-test-utils'
import type { GatewayOptions, ScriptedGateway, TurnScript } from './group-test-utils'
import type { GroupTurnTraceSink } from './group-trace'
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
})
