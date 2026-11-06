/**
 * The Desktop room view's header: upstream's `RoomHeader` with the room picture,
 * display name, member count and this fork's working-directory chip in the
 * title, and the settings / members / disband actions. Split out of
 * `LegacyGroupChatWorkspace` (`group-chat-view.tsx`) to hold that function
 * under its code-health line cap.
 */

import { Button, Codicon, Tip, useI18n } from '@hermes/plugin-sdk'

import { LegacyRoomTitle } from './group-chat-legacy-parts'
import { RoomHeader } from './group-room-ui'
import { GroupWorkspaceChip } from './group-workspace-settings'
import { useBots } from './i18n'

interface LegacyRoomHeaderProps {
  availabilityLabel: string
  availableMembers: number
  image?: null | string
  memberCount: number
  memberNames: string
  onBack: () => void
  onDisband: () => void
  onManageMembers: () => void
  onSettings: () => void
  roomName: string
  running: boolean
  workspace?: null | string
}

export function LegacyRoomHeader({
  availabilityLabel,
  availableMembers,
  image,
  memberCount,
  memberNames,
  onBack,
  onDisband,
  onManageMembers,
  onSettings,
  roomName,
  running,
  workspace
}: LegacyRoomHeaderProps) {
  const { t } = useI18n()
  const b = useBots()

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
            image={image}
            memberNames={memberNames}
            short={memberCount > 0 && availableMembers < memberCount}
          />
          <GroupWorkspaceChip path={workspace} testId="group-workspace-chip" />
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
      working={running}
    />
  )
}
