/**
 * The room's working line while a turn runs — the member on turn as the same
 * typing row a gateway-owned room shows (`group-chat-legacy-parts.tsx`), or the
 * wait for the user's answer — with the running member's live thinking/tool
 * disclosure under it (`group-trace-view.tsx`). Split out of
 * `GroupChatWorkspace` so the disclosure could join without growing that
 * function, which sits at the code-health line cap.
 */

import type { ReactNode } from 'react'

import type { GroupActivityEntry } from './group-activity'
import { LegacyWorkingRow } from './group-chat-legacy-parts'
import { GroupLiveTurnTrace } from './group-trace-view'
import { useBots } from './i18n'
import { displayName } from './labels'
import { botRosterMeta } from './routing'
import type { BotMeta, GroupMember } from './types'

interface GroupWorkingLineProps {
  /** The room's activity log: the typing row's elapsed time counts from the turn's latest `working`. */
  activity: GroupActivityEntry[]
  allMeta: Record<string, BotMeta>
  avatar: (turn: GroupMember) => ReactNode
  group: string
  room: { running?: boolean; turn?: GroupMember | null }
  /** A member's question or command approval is waiting on the user. */
  waiting: boolean
}

export function GroupWorkingLine({ activity, allMeta, avatar, group, room, waiting }: GroupWorkingLineProps) {
  const b = useBots()

  if (!room.running) {
    return null
  }

  return (
    <>
      <LegacyWorkingRow
        activity={activity}
        avatar={avatar}
        clarifying={waiting}
        labels={{ roomWorking: b.group.roomWorking, waitingForAnswer: b.group.waitingForAnswer }}
        nameOf={turn => displayName(turn, botRosterMeta(turn, allMeta))}
        running
        turn={room.turn}
      />
      <GroupLiveTurnTrace group={group} room={room} />
    </>
  )
}
