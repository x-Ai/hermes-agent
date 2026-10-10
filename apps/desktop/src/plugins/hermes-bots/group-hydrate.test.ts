import { describe, expect, it, vi } from 'vitest'

// group-hydrate.ts reaches group-chat.ts (for the legacy-thread pass), which
// imports the SDK at module level; the room harness's mock covers it.
const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

import { hydrateStoredGroupChat } from './group-hydrate'

const stored = {
  log: [{ at: 1, from: { kind: 'user', name: 'You' }, text: 'hi' }],
  watermarks: { dev: 1 },
  members: [{ name: 'dev' }],
  roomId: 'r-abc',
  image: 'data:image/png;base64,room',
  workspace: '/projects/app',
  memberWorkspaces: { dev: '/projects/dev' },
  threadWorkspaces: { 't-1': '/projects/thread' },
  holdDetection: false,
  heldMessages: { dev: ['m-1'] },
  holds: { dev: { since: 5 } },
  epoch: 9,
  running: true
}

describe('hydrateStoredGroupChat', () => {
  it('restores every persisted field, not just the ones in the old whitelist', () => {
    const room = hydrateStoredGroupChat(stored)!

    // The fields the whitelist used to drop, which then came back only once
    // the gateway mirror was pulled (and never offline or for a preserved room).
    expect(room.workspace).toBe('/projects/app')
    expect(room.memberWorkspaces).toEqual({ dev: '/projects/dev' })
    expect(room.threadWorkspaces).toEqual({ 't-1': '/projects/thread' })
    expect(room.holdDetection).toBe(false)
    expect(room.heldMessages).toEqual({ dev: ['m-1'] })

    // What it always restored.
    expect(room.roomId).toBe('r-abc')
    expect(room.image).toBe('data:image/png;base64,room')
    expect(room.holds).toEqual({ dev: { since: 5 } })
    expect(room.members).toEqual([{ name: 'dev' }])
    expect(room.watermarks).toEqual({ dev: 1 })
  })

  it('resets runtime-only coordination state and assigns legacy thread ids', () => {
    const room = hydrateStoredGroupChat(stored)!

    expect(room.epoch).toBe(0)
    expect(room.running).toBe(false)
    expect(room.log[0].thread).toBeTruthy()
  })

  it('defaults a record from an older build and guards every map shape', () => {
    const room = hydrateStoredGroupChat({ log: [], watermarks: 'oops', holds: ['nope'], heldMessages: 3 })!

    expect(room.watermarks).toEqual({})
    expect(room.holds).toEqual({})
    expect(room.heldMessages).toEqual({})
    expect(room.holdDetection).toBe(true)
    expect(room.workspace).toBeNull()
    expect(room.memberWorkspaces).toEqual({})
    expect(room.roomId).toBeNull()
  })

  it('rejects anything that is not a room record', () => {
    expect(hydrateStoredGroupChat(null)).toBeNull()
    expect(hydrateStoredGroupChat('room')).toBeNull()
    expect(hydrateStoredGroupChat({ watermarks: {} })).toBeNull()
  })
})
