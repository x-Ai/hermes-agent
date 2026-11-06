/**
 * A gateway-hosted room's own pieces in the Desktop room view (`group-chat-view.tsx`), built on
 * upstream's room view (`canonical-group-workspace.tsx`) parts: the routing, Continue and cap notices
 * between messages, the lead's chip in the header and the label on a scheduled job's post. Every
 * control here is offered only when the room's gateway lists its method (`HostedRoomMethods`, read
 * the way upstream's room view reads it). A Desktop room has none of them.
 */

import { Tip, useValue } from '@hermes/plugin-sdk'
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

import {
  type GroupMethods,
  offersGroupMethod,
  offersGroupSafetyMethod,
  useGroupMethods
} from './canonical-group-capabilities'
import type { CanonicalGroupEvent } from './canonical-group-history'
import { ASSIGNMENT_EVENT_KIND, CanonicalGroupAssignmentRow, canonicalRoomLeadId } from './canonical-group-lead'
import {
  CanonicalGroupContinuedRow,
  CanonicalGroupPausedRow,
  CanonicalGroupRoutedRow,
  type CanonicalPausedDiscussion,
  CONTINUED_EVENT_KIND,
  ROUTED_EVENT_KIND
} from './canonical-group-routed'
import type { CanonicalGroupBinding, CanonicalRoomMember } from './canonical-groups'
import { continueCanonicalRoom, stopCanonicalRoom } from './canonical-room-actions'
import type { HostedRoomNotice } from './canonical-room-model'
import { $botMeta } from './data'
import type { GroupChatRoom } from './group-chat'
import { RoomBotAvatar } from './group-room-avatar'
import { fill } from './group-room-ui'
import { useBots } from './i18n'
import { displayName } from './labels'
import { botRosterMeta } from './routing'
import type { BotMeta, GroupMember, GroupMessage } from './types'

const HostedRoomMethodsContext = createContext<GroupMethods>(undefined)

/** The room gateway's `groups.capabilities` method list, read once per opening of its socket
 *  (upstream's `useGroupMethods`), for every control in this room view. A Desktop room reads nothing. */
export function HostedRoomMethods({
  binding,
  children,
  visible
}: {
  binding?: CanonicalGroupBinding
  children: ReactNode
  visible: boolean
}) {
  const connectionId = binding?.connectionId ?? ''
  const profile = binding?.profile ?? ''
  // The hook reads again whenever its route changes identity: hold one per connection and profile.
  const route = useMemo(() => ({ connectionId, profile }), [connectionId, profile])
  const methods = useGroupMethods(route, visible && Boolean(binding))

  return <HostedRoomMethodsContext value={methods}>{children}</HostedRoomMethodsContext>
}

/** Undefined until the gateway's list is read; null when it answered without one (every control). */
export const useHostedRoomMethods = (): GroupMethods => useContext(HostedRoomMethodsContext)

/** The id a hosted room seats a member under: its profile, as `createCanonicalGroup` minted it. */
const hostedMemberId = (member: GroupMember) => member.route?.targetProfile ?? member.targetProfile ?? member.name

const memberById = (members: readonly GroupMember[] | undefined, id: string) =>
  members?.find(member => hostedMemberId(member) === id || member.name === id)

/** The room's members as upstream's room parts read them, under the names this view gives their messages. */
export function useHostedMembers(members: readonly GroupMember[]): CanonicalRoomMember[] {
  const allMeta = useValue($botMeta) as Record<string, BotMeta>

  return members.map(member => ({
    member_id: hostedMemberId(member),
    profile: hostedMemberId(member),
    handle: member.handle || member.name,
    display_name: displayName(member, botRosterMeta(member, allMeta))
  }))
}

interface NoticeRowProps {
  event: CanonicalGroupEvent
  members: readonly CanonicalRoomMember[]
}

/** Who the router picked, who the lead handed a message to, and a Continue. */
const NOTICE_ROWS: Record<string, (props: NoticeRowProps) => ReactNode> = {
  [ASSIGNMENT_EVENT_KIND]: CanonicalGroupAssignmentRow,
  [CONTINUED_EVENT_KIND]: CanonicalGroupContinuedRow,
  [ROUTED_EVENT_KIND]: CanonicalGroupRoutedRow
}

/** The notices that follow one log entry (`room.hosted.notices`). */
export function HostedRoomNotices({
  group,
  members,
  notices,
  room
}: {
  group: string
  members: readonly GroupMember[]
  notices: readonly HostedRoomNotice[]
  room: GroupChatRoom
}) {
  // The view's members are the roster rows its messages are named by; before the roster loads, the room's own.
  const named = useHostedMembers(members.length ? members : room.members || [])

  return (
    <>
      {notices.map(({ event, paused }) => {
        const Row = NOTICE_ROWS[event.kind]

        return paused ? (
          <HostedPausedRow event={event} group={group} key={event.seq} paused={paused} room={room} />
        ) : Row ? (
          <Row event={event} key={event.seq} members={named} />
        ) : null
      })}
    </>
  )
}

/** "Paused after N messages", with Continue and Stop while the pause is still its discussion's latest
 *  word and the gateway lists `groups.continue`; otherwise the plain notice. */
function HostedPausedRow({
  event,
  group,
  paused,
  room
}: {
  event: CanonicalGroupEvent
  group: string
  paused: CanonicalPausedDiscussion
  room: GroupChatRoom
}) {
  const methods = useHostedRoomMethods()
  const [continuing, setContinuing] = useState(false)
  const [stopping, setStopping] = useState(false)
  const offered = typeof room.hosted?.maxContinues === 'number' && offersGroupMethod(methods, 'groups.continue')
  const thread = typeof event.payload.thread_id === 'string' ? event.payload.thread_id : null

  const continueDiscussion = async (discussionEventId: string) => {
    setContinuing(true)

    try {
      await continueCanonicalRoom(group, room, discussionEventId)
    } finally {
      setContinuing(false)
    }
  }

  const stop = async () => {
    setStopping(true)

    try {
      await stopCanonicalRoom(group, room, thread)
    } finally {
      setStopping(false)
    }
  }

  return (
    <CanonicalGroupPausedRow
      busy={continuing}
      event={event}
      onContinue={continueDiscussion}
      onStop={offersGroupSafetyMethod(methods, 'groups.stop') ? stop : undefined}
      paused={{ ...paused, actionable: paused.actionable && offered }}
      stopping={stopping}
    />
  )
}

/** The lead's chip in the room header while the room routes a message that names nobody through a lead. */
export function HostedLeadChip({ members, room }: { members: readonly GroupMember[]; room: GroupChatRoom }) {
  const labels = useBots().canonical
  const allMeta = useValue($botMeta) as Record<string, BotMeta>
  const leadId = canonicalRoomLeadId(room.hosted?.context)
  const lead = leadId ? (memberById(members, leadId) ?? memberById(room.members, leadId)) : undefined

  if (!lead) {
    return null
  }

  const name = displayName(lead, botRosterMeta(lead, allMeta))

  return (
    <Tip label={labels.routingLeadHint}>
      <span
        aria-label={fill(labels.routingLead, { name })}
        className="inline-flex h-6 min-w-0 shrink-0 items-center gap-1.5 rounded-full bg-(--ui-bg-quaternary) pl-0.5 pr-2 text-xs font-normal"
        data-testid="group-lead-chip"
      >
        <RoomBotAvatar name={lead.name} size={18} />
        <span className="max-w-32 truncate font-medium text-foreground">{name}</span>
        <span
          className="shrink-0 rounded-sm bg-(--ui-accent)/15 px-1 text-[0.625rem] font-medium text-(--ui-accent)"
          data-member-badge=""
        >
          {labels.lead}
        </span>
      </span>
    </Tip>
  )
}

/** The name a user-side log line reads under: a scheduled job's post names the job. */
export const groupUserLabel = (entry: Pick<GroupMessage, 'scheduledBy'>, you: string) => entry.scheduledBy || you

/** "Scheduled" beside a scheduled job's post (`deliver: room:<id>`). */
export function HostedScheduledBadge({ entry }: { entry: GroupMessage }) {
  const labels = useBots().canonical

  return entry.scheduledBy ? (
    <span
      className="shrink-0 rounded bg-(--ui-surface-2) px-1 text-[0.625rem] text-(--ui-text-secondary)"
      data-testid="group-scheduled-post"
    >
      {labels.scheduledPost}
    </span>
  ) : null
}
