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
      routedAttachmentsBlocked: (group: string) => `blocked:${group}`,
      routedAttachmentsUnreadable: (group: string, names: string[]) => `unreadable:${group}:${names.join('+')}`
    }
  })
}))

import { groupMentionCompletions, matchLeadingGroupMention, routeDraftToGroup } from './group-mention-route'
import type { GroupMentionHit, GroupRouteDeps } from './group-mention-route'
import type { Attachment, GroupChat, RosterRow } from './types'

function room(partial: Partial<GroupChat> = {}): GroupChat {
  return { log: [], watermarks: {}, members: [], ...partial }
}

const ROOMS: Record<string, GroupChat> = {
  'Build Crew': room({ members: [{ name: 'dev' }, { name: 'qa' }] as RosterRow[] }),
  Disbanded: room({ tombstone: true })
}

interface Sent {
  group: string
  images: Attachment[]
  text: string
  workspace: null | string
}

function deps(overrides: Partial<GroupRouteDeps> = {}): GroupRouteDeps & { opened: string[]; sent: Sent[] } {
  const opened: string[] = []
  const sent: Sent[] = []

  return {
    opened,
    sent,
    cwd: () => '/projects/app',
    files: null,
    members: () => [{ name: 'dev' }] as RosterRow[],
    open: group => opened.push(group),
    send: (group, _members, text, workspace, images) => {
      sent.push({ group, images, text, workspace })

      return 'thread-1'
    },
    ...overrides
  }
}

const PNG = 'data:image/png;base64,iVBORw0KGgo='
/** A desktop with the file door: every path reads as the PNG, images pass through undownscaled. */
const files = { normalizeImage: async (dataUrl: string) => dataUrl, read: async () => PNG }

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

  it('sends the remainder as a thread pinned to the composer cwd, then opens the room', async () => {
    const d = deps()
    const verdict = await routeDraftToGroup(hit, { text: '@build-crew ship it' }, d)

    expect(verdict).toBe('consumed')
    expect(d.sent).toEqual([{ group: 'Build Crew', images: [], text: 'ship it', workspace: '/projects/app' }])
    expect(d.opened).toEqual(['Build Crew'])
  })

  it('opens the room without sending for a bare tag', async () => {
    const d = deps()
    const verdict = await routeDraftToGroup({ ...hit, rest: '' }, { text: '@build-crew' }, d)

    expect(verdict).toBe('consumed')
    expect(d.sent).toEqual([])
    expect(d.opened).toEqual(['Build Crew'])
  })

  it('cancels (keeps the draft) when the send delivers nothing', async () => {
    const d = deps({ send: () => null })
    const verdict = await routeDraftToGroup(hit, { text: '@build-crew ship it' }, d)

    expect(verdict).toBe('cancel')
    expect(d.opened).toEqual([])
  })

  it('keeps a draft with attachments, with a notice, on a desktop without the file door', async () => {
    notes.length = 0
    const d = deps()
    const draft = { text: '@build-crew ship it', attachments: [{ kind: 'image', label: 'a.png', path: '/a.png' }] }
    const verdict = await routeDraftToGroup(hit, draft, d)

    expect(verdict).toBe('cancel')
    expect(d.sent).toEqual([])
    expect(notes.at(-1)?.message).toBe('blocked:Build Crew')
  })

  it('converts the chips: files ride as room attachments, references lead the text', async () => {
    const d = deps({ files })

    const draft = {
      text: '@build-crew ship it',
      attachments: [
        { kind: 'image', label: 'a.png', path: '/a.png' },
        { kind: 'folder', label: 'src', refText: '@folder:src' }
      ]
    }

    const verdict = await routeDraftToGroup(hit, draft, d)

    expect(verdict).toBe('consumed')
    expect(d.sent).toEqual([
      {
        group: 'Build Crew',
        images: [{ data: PNG, kind: 'image', name: 'a.png' }],
        text: '@folder:src\n\nship it',
        workspace: '/projects/app'
      }
    ])
    expect(d.opened).toEqual(['Build Crew'])
  })

  it('sends attachments alone when the draft is a bare tag plus a file', async () => {
    const d = deps({ files })
    const draft = { text: '@build-crew', attachments: [{ kind: 'image', label: 'a.png', path: '/a.png' }] }
    const verdict = await routeDraftToGroup({ ...hit, rest: '' }, draft, d)

    expect(verdict).toBe('consumed')
    expect(d.sent[0]).toMatchObject({ images: [{ name: 'a.png' }], text: '' })
  })

  it('cancels with the unreadable names when one chip cannot be converted', async () => {
    notes.length = 0
    const d = deps({ files: { ...files, read: async () => null } })

    const draft = {
      text: '@build-crew ship it',
      attachments: [
        { kind: 'image', label: 'gone.png', path: '/gone.png' },
        { kind: 'file', label: 'spec.pdf', path: '/spec.pdf' }
      ]
    }

    const verdict = await routeDraftToGroup(hit, draft, d)

    expect(verdict).toBe('cancel')
    expect(d.sent).toEqual([])
    expect(d.opened).toEqual([])
    expect(notes.at(-1)).toEqual({ kind: 'error', message: 'unreadable:Build Crew:gone.png+spec.pdf' })
  })

  it('pins no folder when the composer is detached', async () => {
    const d = deps({ cwd: () => '' })
    await routeDraftToGroup(hit, { text: '@build-crew ship it' }, d)

    expect(d.sent[0].workspace).toBeNull()
  })
})
