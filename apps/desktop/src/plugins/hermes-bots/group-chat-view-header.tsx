/**
 * The Desktop room view's header: upstream's `RoomHeader` with the room picture,
 * display name, member count, this fork's working-directory chip and a hosted
 * room's lead in the title, and the settings / members / disband actions. Split
 * out of `LegacyGroupChatWorkspace` (`group-chat-view.tsx`) to hold that function
 * under its code-health line cap.
 */

import { Button, Codicon, Tip, useI18n } from '@hermes/plugin-sdk'

import { HostedLeadChip } from './canonical-room-view'
import type { GroupChatRoom } from './group-chat'
import { LegacyRoomTitle } from './group-chat-legacy-parts'
import { RoomHeader } from './group-room-ui'
import { GroupWorkspaceChip } from './group-workspace-settings'
import { useBots } from './i18n'
import type { GroupMember } from './types'

interface LegacyRoomHeaderProps {
  availabilityLabel: string
  availableMembers: number
  memberNames: string
  members: GroupMember[]
  onBack: () => void
  onDisband: () => void
  onManageMembers: () => void
  onSettings: () => void
  room: GroupChatRoom
  roomName: string
}

export function LegacyRoomHeader({
  availabilityLabel,
  availableMembers,
  memberNames,
  members,
  onBack,
  onDisband,
  onManageMembers,
  onSettings,
  room,
  roomName
}: LegacyRoomHeaderProps) {
  const { t } = useI18n()
  const b = useBots()
  const memberCount = members.length

  return (
    <RoomHeader
      backLabel={t.common.back}
      onBack={onBack}
      stopLabel={b.group.stopHint}
      title={
        <span className="flex min-w-0 items-center gap-2">
          <LegacyRoomTitle
            availabilityLabel={availabilityLabel}
            countLabel={b.group.memberCount(memberCount)}
            group={roomName}
            image={room.image}
            memberNames={memberNames}
            short={memberCount > 0 && availableMembers < memberCount}
          />
          <GroupWorkspaceChip path={room.workspace} testId="group-workspace-chip" />
          <HostedLeadChip members={members} room={room} />
        </span>
      }
      trailing={
        <>
          <Tip label={b.group.settingsHint(roomName)}>
            <Button
              aria-label={b.group.settingsLabel(roomName)}
              className="shrink-0 text-(--ui-text-tertiary) hover:text-foreground"
              onClick={onSettings}
              size="icon-sm"
              variant="ghost"
            >
              <Codicon name="gear" />
            </Button>
          </Tip>
          <Tip label={b.group.manageMembers}>
            <Button
              aria-label={b.group.manageMembersAria}
              className="shrink-0 text-(--ui-text-tertiary) hover:text-foreground"
              onClick={onManageMembers}
              size="icon-sm"
              variant="ghost"
            >
              <Codicon name="organization" />
            </Button>
          </Tip>
          <Tip label={b.group.disbandHint(roomName)}>
            <Button
              aria-label={b.group.disbandLabel(roomName)}
              className="shrink-0 text-(--ui-text-tertiary) hover:text-destructive"
              onClick={onDisband}
              size="icon-sm"
              variant="ghost"
            >
              <Codicon name="trash" />
            </Button>
          </Tip>
        </>
      }
      working={Boolean(room.running)}
    />
  )
}
