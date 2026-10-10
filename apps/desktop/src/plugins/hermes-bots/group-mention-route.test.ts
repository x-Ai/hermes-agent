import { describe, expect, it, vi } from 'vitest'

// group-mention-route.ts reaches the SDK (host.notify) and, through data /
// group-workspace, the real `atom`. Use the room harness's SDK mock with a
// capturing notify, and a deterministic i18n stub so the asserted copy is
// independent of the shipped English wording.
const { host, notes } = vi.hoisted(() => {
  const notes: Array<{ kind: string; message: string }> = []

  return {
    host: { notify: (note: { kind: string; message: string }) => notes.push(note) } as Record<string, unknown>,
    notes
  }
})

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

vi.mock('./i18n', () => ({
  botsText: () => ({
    group: {
      mentionMeta: (count: number) => `Group chat · ${count}`,
      routedToGroup: (group: string, folder: null | string) => (folder ? `sent:${group}:${folder}` : `sent:${group}`),
      routedAttachmentsBlocked: (group: string) => `blocked:${group}`
    }
  })
}))

import { groupMentionCompletions, matchLeadingGroupMention, routeDraftToGroup } from './group-mention-route'
import type { GroupMentionHit, GroupRouteDeps } from './group-mention-route'
import type { GroupChat, RosterRow } from './types'

function room(partial: Partial<GroupChat> = {}): GroupChat {
  return { log: [], watermarks: {}, members: [], ...partial }
}

const ROOMS: Record<string, GroupChat> = {
  'Build Crew': room({ members: [{ name: 'dev' }, { name: 'qa' }] as RosterRow[] }),
  Disbanded: room({ tombstone: true })
}

function deps(overrides: Partial<GroupRouteDeps> = {}): GroupRouteDeps & {
  opened: string[]
  sent: Array<{ group: string; text: string; workspace: null | string }>
} {
  const opened: string[] = []
  const sent: Array<{ group: string; text: string; workspace: null | string }> = []

  return {
    opened,
    sent,
    cwd: () => '/projects/app',
    members: () => [{ name: 'dev' }] as RosterRow[],
    open: group => opened.push(group),
    send: (group, _members, text, workspace) => {
      sent.push({ group, text, workspace })

      return 'thread-1'
    },
    ...overrides
  }
}

describe('group mention completions', () => {
  it('offers a row per live room, skipping tombstones', () => {
    const rows = groupMentionCompletions('', ROOMS, count => `Group chat · ${count}`)

    expect(rows.map(r => r.insert)).toEqual(['@build-crew'])
  })

  it('filters by the typed query against tag and display name', () => {
    expect(groupMentionCompletions('build', ROOMS, c => `${c}`).map(r => r.insert)).toEqual(['@build-crew'])
    expect(groupMentionCompletions('zzz', ROOMS, c => `${c}`)).toEqual([])
  })
})

describe('matchLeadingGroupMention', () => {
  it('matches a room tag only as the first token', () => {
    expect(matchLeadingGroupMention('@build-crew ship it', ROOMS)?.group).toBe('Build Crew')
    expect(matchLeadingGroupMention('  @build-crew', ROOMS)?.rest).toBe('')
    expect(matchLeadingGroupMention('hey @build-crew', ROOMS)).toBeNull()
  })

  it('ignores an unknown tag', () => {
    expect(matchLeadingGroupMention('@nobody hi', ROOMS)).toBeNull()
  })
})

describe('routeDraftToGroup', () => {
  const hit: GroupMentionHit = { group: 'Build Crew', rest: 'ship it', tag: 'build-crew' }

  it('sends the remainder as a thread pinned to the composer cwd, then opens the room', () => {
    const d = deps()
    const verdict = routeDraftToGroup(hit, { text: '@build-crew ship it' }, d)

    expect(verdict).toBe('consumed')
    expect(d.sent).toEqual([{ group: 'Build Crew', text: 'ship it', workspace: '/projects/app' }])
    expect(d.opened).toEqual(['Build Crew'])
  })

  it('opens the room without sending for a bare tag', () => {
    const d = deps()
    const verdict = routeDraftToGroup({ ...hit, rest: '' }, { text: '@build-crew' }, d)

    expect(verdict).toBe('consumed')
    expect(d.sent).toEqual([])
    expect(d.opened).toEqual(['Build Crew'])
  })

  it('cancels (keeps the draft) when the send delivers nothing', () => {
    const d = deps({ send: () => null })
    const verdict = routeDraftToGroup(hit, { text: '@build-crew ship it' }, d)

    expect(verdict).toBe('cancel')
    expect(d.opened).toEqual([])
  })

  it('refuses to route a draft carrying composer attachments', () => {
    notes.length = 0
    const d = deps()
    const verdict = routeDraftToGroup(hit, { text: '@build-crew ship it', attachments: [{}] }, d)

    expect(verdict).toBe('cancel')
    expect(d.sent).toEqual([])
    expect(notes.at(-1)?.message).toBe('blocked:Build Crew')
  })

  it('pins no folder when the composer is detached', () => {
    const d = deps({ cwd: () => '' })
    routeDraftToGroup(hit, { text: '@build-crew ship it' }, d)

    expect(d.sent[0].workspace).toBeNull()
  })
})
