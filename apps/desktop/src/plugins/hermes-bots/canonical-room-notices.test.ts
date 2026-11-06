import { describe, expect, it, vi } from 'vitest'

// The notice rows' modules import SDK components; this file reads only their pure helpers.
vi.mock('@hermes/plugin-sdk', async () => (await import('./group-test-utils')).pluginSdkMock({}))

import type { CanonicalRoomEvent } from './canonical-room-model'
import { canonicalRoomNotices } from './canonical-room-notices'

const ask = (seq: number, id: string, thread = 't1'): CanonicalRoomEvent => ({
  seq,
  event_id: id,
  kind: 'message.user',
  actor: { kind: 'user', id: 'desktop' },
  payload: { text: 'Plan the release', thread_id: thread }
})

const reply = (seq: number, id: string, member: string, discussion = 'u1'): CanonicalRoomEvent => ({
  seq,
  event_id: id,
  kind: 'message.member',
  payload: { text: 'ok', thread_id: 't1', member_id: member, discussion_event_id: discussion }
})

const routed = (seq: number, discussion = 'u1'): CanonicalRoomEvent => ({
  seq,
  event_id: `droute:${discussion}`,
  kind: 'room.routed',
  payload: { discussion_event_id: discussion, thread_id: 't1', member_ids: ['alpha'], everyone: false, fallback: false }
})

const capped = (seq: number, discussion = 'u1'): CanonicalRoomEvent => ({
  seq,
  event_id: `cap:${seq}`,
  kind: 'room.activity',
  payload: { status: 'bounded', discussion_event_id: discussion, thread_id: 't1' }
})

const continued = (seq: number, grant: number, discussion = 'u1'): CanonicalRoomEvent => ({
  seq,
  event_id: `dcontinue:${discussion}:${grant}`,
  kind: 'room.continued',
  payload: { discussion_event_id: discussion, thread_id: 't1', grant }
})

const kindsAfter = (notices: ReturnType<typeof canonicalRoomNotices>) =>
  Object.fromEntries(Object.entries(notices).map(([after, list]) => [after, list.map(notice => notice.event.kind)]))

describe('canonicalRoomNotices', () => {
  it('keys each notice by the message entry it follows, whatever order the log arrived in', () => {
    const events = [capped(5), reply(3, 'm1', 'alpha'), ask(1, 'u1'), routed(2), reply(4, 'm2', 'beta')]

    expect(kindsAfter(canonicalRoomNotices(events, 5))).toEqual({
      u1: ['room.routed'],
      m2: ['room.activity']
    })
  })

  it("keeps a notice older than every retained message under ''", () => {
    expect(kindsAfter(canonicalRoomNotices([routed(7), reply(8, 'm1', 'alpha')]))).toEqual({ '': ['room.routed'] })
  })

  it('offers Continue on the latest pause until a Continue, a Stop or a newer message in its thread moves it on', () => {
    const paused = [ask(1, 'u1'), reply(2, 'm1', 'alpha'), reply(3, 'm2', 'beta'), capped(4)]
    expect(canonicalRoomNotices(paused, 5).m2[0].paused).toEqual({ count: 2, actionable: true })

    const afterContinue = canonicalRoomNotices([...paused, continued(5, 1)], 5)
    expect(afterContinue.m2.map(notice => [notice.event.kind, notice.paused?.actionable])).toEqual([
      ['room.activity', false],
      ['room.continued', undefined]
    ])

    const stopped = [...paused, { seq: 5, event_id: 'stop', kind: 'room.stop_requested', payload: {} }]
    expect(canonicalRoomNotices(stopped, 5).m2[0].paused?.actionable).toBe(false)

    expect(canonicalRoomNotices([...paused, ask(5, 'u2')], 5).m2[0].paused?.actionable).toBe(false)
    // A message in another thread (a scheduled post, a new topic) leaves the pause standing.
    expect(canonicalRoomNotices([...paused, ask(5, 'u2', 'cron-1')], 5).m2[0].paused?.actionable).toBe(true)
  })

  it('stops offering Continue once the discussion used every Continue the runtime grants', () => {
    const events = [
      ask(1, 'u1'),
      reply(2, 'm1', 'alpha'),
      capped(3),
      continued(4, 1),
      reply(5, 'm2', 'beta'),
      capped(6)
    ]

    expect(canonicalRoomNotices(events, 2).m2[0].paused?.actionable).toBe(true)
    expect(canonicalRoomNotices(events, 1).m2[0].paused?.actionable).toBe(false)
  })

  it('leaves the cap to the Activity list on a runtime that reports no Continue budget', () => {
    expect(canonicalRoomNotices([ask(1, 'u1'), reply(2, 'm1', 'alpha'), capped(3)])).toEqual({})
  })

  it('shows only the notice kinds the room view renders', () => {
    const events = [
      ask(1, 'u1'),
      { seq: 2, kind: 'turn.failed', payload: { member_id: 'beta', error: 'boom' } },
      { seq: 3, kind: 'room.context_set', payload: { purpose: 'x', notes: '' } },
      { seq: 4, kind: 'room.assignment', payload: { lead_member_id: 'alpha', member_ids: ['beta'] } },
      { seq: 5, kind: 'room.activity', payload: { status: 'settled', discussion_event_id: 'u1' } }
    ]

    expect(kindsAfter(canonicalRoomNotices(events, 5))).toEqual({ u1: ['room.assignment'] })
  })
})
