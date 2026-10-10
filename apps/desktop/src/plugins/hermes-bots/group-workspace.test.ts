import { describe, expect, it, vi } from 'vitest'

// group-workspace.ts reaches the SDK (host) and, through group-membership →
// data → shared, the real `atom`. Use the room harness's SDK mock, which
// supplies a real nanostores `atom`, exactly as the other pure room tests do.
const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

import {
  memberFollowsRoomWorkspace,
  normalizeGroupWorkspacePath,
  resolveGroupMemberWorkspace,
  sameGroupWorkspace,
  withGroupThreadWorkspace
} from './group-workspace'
import { groupWorkspaceProjection, mergeGroupWorkspaceFields } from './group-workspace-sync'
import type { GroupChat, GroupMember, GroupMessage } from './types'

const LOCAL: GroupMember = { name: 'dev', title: '' }
const REMOTE: GroupMember = { name: 'dev', connectionId: 'box', remoteSource: true, sourceScoped: true }

function room(partial: Partial<GroupChat> = {}): GroupChat {
  return { log: [], watermarks: {}, ...partial }
}

describe('normalizeGroupWorkspacePath', () => {
  it('trims, blanks to null, and drops a trailing separator', () => {
    expect(normalizeGroupWorkspacePath('  /a/b/  ')).toBe('/a/b')
    expect(normalizeGroupWorkspacePath('/a/b')).toBe('/a/b')
    expect(normalizeGroupWorkspacePath('   ')).toBeNull()
    expect(normalizeGroupWorkspacePath(null)).toBeNull()
  })

  it('keeps a drive root intact', () => {
    expect(normalizeGroupWorkspacePath('C:\\')).toBe('C:\\')
    expect(normalizeGroupWorkspacePath('C:')).toBe('C:\\')
    expect(normalizeGroupWorkspacePath('C:\\work\\')).toBe('C:\\work')
  })

  it('sameGroupWorkspace compares normalized forms', () => {
    expect(sameGroupWorkspace('/a/b/', '/a/b')).toBe(true)
    expect(sameGroupWorkspace('/a', '/b')).toBe(false)
    expect(sameGroupWorkspace('', null)).toBe(true)
  })
})

describe('resolveGroupMemberWorkspace ladder', () => {
  it('prefers the member folder over the thread, and the thread over the room', () => {
    const r = room({
      workspace: '/room',
      threadWorkspaces: { t1: '/thread' },
      memberWorkspaces: { dev: '/own' }
    })

    expect(resolveGroupMemberWorkspace(r, LOCAL, 't1')).toEqual({ cwd: '/own', source: 'member' })
  })

  it('falls to the thread folder when the member has none', () => {
    const r = room({ workspace: '/room', threadWorkspaces: { t1: '/thread' } })

    expect(resolveGroupMemberWorkspace(r, LOCAL, 't1')).toEqual({ cwd: '/thread', source: 'thread' })
  })

  it('falls to the room folder when neither member nor thread applies', () => {
    const r = room({ workspace: '/room' })

    expect(resolveGroupMemberWorkspace(r, LOCAL, 't1')).toEqual({ cwd: '/room', source: 'room' })
  })

  it('returns nothing when no rung is set', () => {
    expect(resolveGroupMemberWorkspace(room(), LOCAL, 't1')).toEqual({ cwd: null, source: null })
  })

  it('gives a remote member ONLY its own folder — never the thread or room', () => {
    const r = room({ workspace: '/room', threadWorkspaces: { t1: '/thread' } })

    expect(memberFollowsRoomWorkspace(REMOTE)).toBe(false)
    expect(resolveGroupMemberWorkspace(r, REMOTE, 't1')).toEqual({ cwd: null, source: null })

    const withOwn = room({ workspace: '/room', memberWorkspaces: { 'box::dev': '/remote/own' } })
    expect(resolveGroupMemberWorkspace(withOwn, REMOTE, 't1')).toEqual({ cwd: '/remote/own', source: 'member' })
  })
})

describe('withGroupThreadWorkspace', () => {
  it('pins and unpins a thread folder', () => {
    const pinned = withGroupThreadWorkspace(room(), 't1', '/x')
    expect(pinned.threadWorkspaces).toEqual({ t1: '/x' })

    const cleared = withGroupThreadWorkspace(pinned, 't1', '')
    expect(cleared.threadWorkspaces).toEqual({})
  })

  it('bounds the thread map, dropping the oldest', () => {
    let r = room()

    for (let i = 0; i < 70; i++) {
      r = withGroupThreadWorkspace(r, `t${i}`, `/dir${i}`)
    }

    const keys = Object.keys(r.threadWorkspaces || {})
    expect(keys.length).toBe(64)
    expect(keys).toContain('t69')
    expect(keys).not.toContain('t0')
  })
})

const logWith = (...threads: string[]): GroupMessage[] =>
  threads.map((thread, index) => ({ at: index, from: { kind: 'user', name: 'You' }, text: 'hi', thread }))

describe('groupWorkspaceProjection', () => {
  it('always names workspace (null when cleared) so a clear propagates', () => {
    expect(groupWorkspaceProjection(room(), [], 8).workspace).toBeNull()
    expect(groupWorkspaceProjection(room({ workspace: '/room' }), [], 8).workspace).toBe('/room')
  })

  it('carries only the thread folders the compact log still references', () => {
    const r = room({ threadWorkspaces: { t1: '/one', t2: '/two' } })
    const projection = groupWorkspaceProjection(r, logWith('t1'), 8)

    expect(projection.threadWorkspaces).toEqual({ t1: '/one' })
  })
})

describe('mergeGroupWorkspaceFields', () => {
  it('adopts a newer mirror folder and keeps a preserved room its own', () => {
    const existing = room({ workspace: '/local', memberWorkspaces: { dev: '/local-own' } })
    const projected = { workspace: '/remote', memberWorkspaces: { dev: '/remote-own' } }

    expect(mergeGroupWorkspaceFields(existing, projected, { adoptRemote: true })).toMatchObject({
      workspace: '/remote',
      memberWorkspaces: { dev: '/remote-own' }
    })
    expect(mergeGroupWorkspaceFields(existing, projected, { adoptRemote: false })).toMatchObject({
      workspace: '/local',
      memberWorkspaces: { dev: '/local-own' }
    })
  })

  it('unions thread folders either way (each thread is written once)', () => {
    const existing = room({ threadWorkspaces: { t1: '/one' } })
    const projected = { workspace: null, threadWorkspaces: { t2: '/two' } }

    expect(mergeGroupWorkspaceFields(existing, projected, { adoptRemote: false }).threadWorkspaces).toEqual({
      t1: '/one',
      t2: '/two'
    })
  })
})
