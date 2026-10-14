/**
 * The room's working line while a turn runs — "<member> is thinking…", or the
 * wait for the user's answer — with the running member's live thinking/tool
 * disclosure under it (`group-trace-view.tsx`). Split out of
 * `GroupChatWorkspace` so the disclosure could join without growing that
 * function, which sits at the code-health line cap.
 */

import { GroupLiveTurnTrace } from './group-trace-view'
import { useBots } from './i18n'
import { displayName } from './labels'
import { botRosterMeta } from './routing'
import type { BotMeta, GroupMember } from './types'

interface GroupWorkingLineProps {
  allMeta: Record<string, BotMeta>
  group: string
  room: { running?: boolean; turn?: GroupMember | null }
  /** A member's question or command approval is waiting on the user. */
  waiting: boolean
}

export function GroupWorkingLine({ allMeta, group, room, waiting }: GroupWorkingLineProps) {
  const b = useBots()

  if (!room.running) {
    return null
  }

  const label = waiting
    ? b.group.waitingForAnswer
    : room.turn
      ? b.group.memberThinking(displayName(room.turn, botRosterMeta(room.turn, allMeta)))
      : b.group.roomWorking

  return (
    <>
      <div className="px-2 py-1 text-[0.7rem] italic text-(--ui-text-quaternary)">{label}</div>
      <GroupLiveTurnTrace group={group} room={room} />
    </>
  )
}
