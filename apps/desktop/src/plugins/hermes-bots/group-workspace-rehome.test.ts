import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as groupChat from './group-chat'
import { createGroupGateway, drain, runTimersInline, scriptedStorage } from './group-test-utils'
import type { GatewayOptions, ScriptedGateway } from './group-test-utils'
import type * as groupTurns from './group-turns'
import type * as groupWorkspace from './group-workspace'
import { translateBots } from './i18n-test-helper'
import type { GroupMember } from './types'

// Saving the room settings re-homes the member sessions of an IDLE room right
// away — by stored key through `session.workspace.move`, never a resume — so
// the new folder holds before anyone speaks. A running room is left to the
// turn-start reconcile, and only a session whose ladder answer changed moves.

const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

// `translateBots` comes in statically: the i18n helper reaches the SDK, and
// an import of it from INSIDE the mock factory waits on the factory itself.
vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return { ...(await pluginSdkMock(host)), usePluginI18n: () => translateBots }
})

interface Room {
  chat: typeof groupChat
  gateway: ScriptedGateway
  turns: typeof groupTurns
  workspace: typeof groupWorkspace
}

async function loadRoom(options: GatewayOptions = {}): Promise<Room> {
  vi.resetModules()
  const gateway = createGroupGateway(options)

  for (const key of Object.keys(host)) {
    delete host[key]
  }

  Object.assign(host, gateway.host)

  const [chat, turns, workspace, shared] = await Promise.all([
    import('./group-chat'),
    import('./group-turns'),
    import('./group-workspace'),
    import('./shared')
  ])

  shared.setPluginCtx(scriptedStorage(gateway.storage))

  return { chat, gateway, turns, workspace }
}

const DEV: GroupMember = { name: 'dev', title: '' }
const OPS: GroupMember = { name: 'ops', title: '' }
// A distinct profile name: the harness is ONE gateway, so a remote twin of `dev`
// would resume the local dev's session by its identical title.
const REMOTE: GroupMember = { connectionId: 'box', name: 'ops-remote', remoteSource: true, sourceScoped: true }

/** A room at `/projects/app` with one session per (member, thread), minted the
 *  way a turn mints it. Returns the stored ids keyed `<source>:<member>:<thread>`. */
async function seedRoom(room: Room, members: GroupMember[], threads: string[]) {
  room.chat.updateGroupChat('Ws', current => {
    current.roomId = 'r-ws'
    current.workspace = '/projects/app'

    return current
  })

  const stored: Record<string, string> = {}

  for (const member of members) {
    for (const thread of threads) {
      const handle = await room.turns.ensureGroupChatSession('Ws', member, thread)
      stored[`${member.connectionId || 'local'}:${member.name}:${thread}`] = String(handle.stored)
    }
  }

  return stored
}

/** The ladder's inputs as the settings draft snapshots them. */
function ladder(room: Room) {
  const record = room.chat.$groupChats.get().Ws || {}

  return {
    workspace: record.workspace ?? null,
    memberWorkspaces: record.memberWorkspaces || {},
    threadWorkspaces: record.threadWorkspaces || {}
  }
}

const cwdOf = (room: Room, stored: string) => room.gateway.sessions.get(stored)?.cwd

beforeEach(() => {
  runTimersInline()
})

describe('rehomeIdleGroupSessions', () => {
  it('moves every stored session that followed the room folder, by stored key, without a resume', async () => {
    const room = await loadRoom()
    const stored = await seedRoom(room, [DEV, OPS], ['t1', 't2'])
    const before = ladder(room)
    const resumes = room.gateway.rpcFor('session.resume').length

    room.workspace.setGroupChatWorkspace('Ws', '/projects/moved')
    const moved = await room.workspace.rehomeIdleGroupSessions('Ws', [DEV, OPS], before, ladder(room))

    expect(moved).toBe(4)

    for (const key of Object.values(stored)) {
      expect(cwdOf(room, key)).toBe('/projects/moved')
    }

    const moves = room.gateway.rpcFor('session.workspace.move')
    expect(moves.map(call => call.params.session_key).sort()).toEqual(Object.values(stored).sort())
    // The gateway opens the member profile's store for a cold row.
    expect(moves.map(call => call.params.profile).sort()).toEqual(['dev', 'dev', 'ops', 'ops'])
    expect(room.gateway.rpcFor('session.resume')).toHaveLength(resumes)
  })

  it('leaves a thread pinned to its own folder and a member with its own folder where they are', async () => {
    const room = await loadRoom()
    room.chat.updateGroupChat('Ws', current => ({
      ...current,
      memberWorkspaces: { ops: '/projects/ops' },
      threadWorkspaces: { t2: '/projects/thread' }
    }))
    const stored = await seedRoom(room, [DEV, OPS], ['t1', 't2'])
    const before = ladder(room)

    room.workspace.setGroupChatWorkspace('Ws', '/projects/moved')
    const moved = await room.workspace.rehomeIdleGroupSessions('Ws', [DEV, OPS], before, ladder(room))

    // Only dev's t1 resolved the room rung; the others sit on higher rungs.
    expect(moved).toBe(1)
    expect(cwdOf(room, stored['local:dev:t1'])).toBe('/projects/moved')
    expect(cwdOf(room, stored['local:dev:t2'])).toBe('/projects/thread')
    expect(cwdOf(room, stored['local:ops:t1'])).toBe('/projects/ops')
    expect(cwdOf(room, stored['local:ops:t2'])).toBe('/projects/ops')
  })

  it('moves a member whose own folder changed and never sends a remote member to the room folder', async () => {
    const room = await loadRoom()
    const stored = await seedRoom(room, [DEV, REMOTE], ['t1'])
    const before = ladder(room)

    room.workspace.setGroupMemberWorkspace('Ws', DEV, '/projects/dev-own')
    room.workspace.setGroupChatWorkspace('Ws', '/projects/moved')
    const moved = await room.workspace.rehomeIdleGroupSessions('Ws', [DEV, REMOTE], before, ladder(room))

    expect(moved).toBe(1)
    expect(cwdOf(room, stored['local:dev:t1'])).toBe('/projects/dev-own')
    expect(cwdOf(room, stored['box:ops-remote:t1'])).toBeUndefined()
  })

  it('skips a running room entirely: the turn-start reconcile owns a live drive', async () => {
    const room = await loadRoom()
    const stored = await seedRoom(room, [DEV], ['t1'])
    const before = ladder(room)

    room.chat.updateGroupChat('Ws', current => ({ ...current, running: true }))
    room.workspace.setGroupChatWorkspace('Ws', '/projects/moved')
    const moved = await room.workspace.rehomeIdleGroupSessions('Ws', [DEV], before, ladder(room))

    expect(moved).toBe(0)
    expect(room.gateway.rpcFor('session.workspace.move')).toHaveLength(0)
    expect(cwdOf(room, stored['local:dev:t1'])).toBe('/projects/app')
  })

  it('reads a row the gateway no longer has (4007) as nothing to move, quietly', async () => {
    const room = await loadRoom()
    const stored = await seedRoom(room, [DEV], ['t1'])
    const before = ladder(room)

    room.chat.updateGroupChat('Ws', current => ({
      ...current,
      sessions: { ...(current.sessions || {}), 'thread:t9::dev': 'sid-gone' }
    }))
    room.workspace.setGroupChatWorkspace('Ws', '/projects/moved')
    const moved = await room.workspace.rehomeIdleGroupSessions('Ws', [DEV], before, ladder(room))

    expect(moved).toBe(1)
    expect(cwdOf(room, stored['local:dev:t1'])).toBe('/projects/moved')
    expect(host.notify).not.toHaveBeenCalled()
  })

  it('reports a refused move once per folder and keeps going', async () => {
    const room = await loadRoom({
      rejectWorkspaceMoveWith: Object.assign(new Error('directory does not exist'), { code: 4017 })
    })

    await seedRoom(room, [DEV], ['t1', 't2'])
    const before = ladder(room)

    room.workspace.setGroupChatWorkspace('Ws', '/projects/moved')
    const moved = await room.workspace.rehomeIdleGroupSessions('Ws', [DEV], before, ladder(room))

    expect(moved).toBe(0)
    expect(room.gateway.rpcFor('session.workspace.move')).toHaveLength(2)
    expect(host.notify).toHaveBeenCalledTimes(1)
    expect(String((host.notify as ReturnType<typeof vi.fn>).mock.calls[0][0].message)).toContain('/projects/moved')
  })

  it('is what a settings save fires: apply() writes the folders, then re-homes the idle room', async () => {
    const room = await loadRoom()
    const stored = await seedRoom(room, [DEV], ['t1'])

    const [{ act, renderHook }, { useGroupWorkspaceDraft }] = await Promise.all([
      import('@testing-library/react'),
      import('./group-workspace-settings')
    ])

    const { result } = renderHook(() => useGroupWorkspaceDraft('Ws', [DEV], true))
    act(() => result.current.setWorkspace('/projects/moved'))
    act(() => result.current.apply('Ws'))

    expect(room.chat.$groupChats.get().Ws.workspace).toBe('/projects/moved')
    await drain(() => room.gateway.rpcFor('session.workspace.move').length === 0, 50)

    expect(cwdOf(room, stored['local:dev:t1'])).toBe('/projects/moved')
  })
})
