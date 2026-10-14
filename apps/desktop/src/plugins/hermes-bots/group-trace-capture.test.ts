import { describe, expect, it, vi } from 'vitest'

// The capture module reaches `@hermes/plugin-sdk` transitively (group-external-writes
// → group-chat). The pure helper under test needs none of it, but the import graph
// must resolve, so stand the SDK up with the shared gateway mock.
const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

const HEADER = '[Group chat: "Room"] You are @member, one participant in a group chat with Beta and the user.'

async function capture(messages: unknown[], before: number, reply: null | string) {
  const { captureGroupTurnTrace } = await import('./group-trace-capture')

  return captureGroupTurnTrace(messages as never, before, reply)
}

describe('captureGroupTurnTrace', () => {
  it('keeps reasoning and tool calls and leaves the reply text out', async () => {
    const messages = [
      { role: 'user', content: HEADER },
      { role: 'assistant', reasoning: 'I should read the file first.', content: '' },
      { role: 'tool', name: 'read_file', context: 'read src/app.ts', args: { path: 'src/app.ts' } },
      { role: 'assistant', content: 'Here is the answer.' }
    ]

    const trace = await capture(messages, 0, 'Here is the answer.')

    expect(trace?.steps).toEqual([
      { kind: 'reasoning', text: 'I should read the file first.' },
      { kind: 'tool', name: 'read_file', context: 'read src/app.ts', args: '{\n  "path": "src/app.ts"\n}' }
    ])
  })

  it('captures interim assistant text written before a tool as a step, not the reply', async () => {
    const messages = [
      { role: 'user', content: HEADER },
      { role: 'assistant', content: 'Let me check that.' },
      { role: 'tool', name: 'terminal', context: 'ls' },
      { role: 'assistant', content: 'Done — all good.' }
    ]

    const trace = await capture(messages, 0, 'Done — all good.')

    expect(trace?.steps).toEqual([
      { kind: 'text', text: 'Let me check that.' },
      { kind: 'tool', name: 'terminal', context: 'ls' }
    ])
  })

  it('returns null for a bare answer with no thinking or tools', async () => {
    const messages = [
      { role: 'user', content: HEADER },
      { role: 'assistant', content: 'Short reply.' }
    ]

    expect(await capture(messages, 0, 'Short reply.')).toBeNull()
  })

  it('reads reasoning from reasoning_content and the reasoning_details envelope', async () => {
    const detailsOnly = [
      { role: 'user', content: HEADER },
      { role: 'assistant', reasoning_content: 'plain field thinking', content: 'A' }
    ]

    const envelope = [
      { role: 'user', content: HEADER },
      {
        role: 'assistant',
        reasoning_details: [{ type: 'reasoning.text', text: 'structured thinking' }],
        content: 'B'
      }
    ]

    expect((await capture(detailsOnly, 0, 'A'))?.steps).toEqual([{ kind: 'reasoning', text: 'plain field thinking' }])
    expect((await capture(envelope, 0, 'B'))?.steps).toEqual([{ kind: 'reasoning', text: 'structured thinking' }])
  })

  it('flags a failed tool call and carries the gateway result note', async () => {
    const messages = [
      { role: 'user', content: HEADER },
      { role: 'tool', name: 'patch', context: 'edit foo', display_metadata: { error: 'no such file' } },
      { role: 'assistant', content: 'That did not work.' }
    ]

    const trace = await capture(messages, 0, 'That did not work.')

    expect(trace?.steps).toEqual([
      { kind: 'tool', name: 'patch', context: 'edit foo', failed: true, note: 'no such file' }
    ])
  })

  it('stops at a failed-turn boundary row', async () => {
    const messages = [
      { role: 'user', content: HEADER },
      { role: 'assistant', reasoning: 'early thought', content: '' },
      { role: 'tool', name: 'read_file', context: 'read x' },
      { role: 'assistant', display_kind: 'failed_turn', content: 'This turn did not complete.' }
    ]

    const trace = await capture(messages, 0, null)

    // Everything up to the boundary is kept; the failed-turn notice is not a step.
    expect(trace?.steps).toEqual([
      { kind: 'reasoning', text: 'early thought' },
      { kind: 'tool', name: 'read_file', context: 'read x' }
    ])
  })

  it('only reads rows after the submit baseline', async () => {
    const messages = [
      { role: 'assistant', reasoning: 'OLD turn thinking', content: 'old answer' },
      { role: 'user', content: HEADER },
      { role: 'tool', name: 'web_search', context: 'search hermes' },
      { role: 'assistant', content: 'new answer' }
    ]

    const trace = await capture(messages, 1, 'new answer')

    expect(trace?.steps).toEqual([{ kind: 'tool', name: 'web_search', context: 'search hermes' }])
  })
})
