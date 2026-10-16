/**
 * Moving a Desktop room onto its gateway ("Host on the gateway…" in Group
 * settings). A hosted room is created with the same members and this fork's
 * room settings (@handle, room and member folders, the stop-detection switch),
 * the row keeps its picture, pin and section here, and the Desktop room steps
 * aside under a "(Desktop)" name with its history, giving up the handle: one
 * tag routes to one room. History itself is not carried over — the gateway's
 * log only grows through `groups.send`.
 */

import { Button, Codicon, ConfirmDialog, host, useValue } from '@hermes/plugin-sdk'
import { useEffect, useState } from 'react'

import { type CanonicalGroupRoute, captureCanonicalGroupRoute } from './canonical-groups'
import { canCreateCanonicalRoom, createCanonicalRoomWithSettings } from './canonical-room-actions'
import {
  $groupChats,
  groupChatDisplayName,
  type GroupChatRoom,
  setGroupChatHandle,
  uniqueGroupChatName,
  updateGroupChat
} from './group-chat'
import { groupMemberKey } from './group-membership'
import { botsText, useBots } from './i18n'
import type { GroupMember } from './types'

export interface HostRoomDeps {
  /** The room surface's rename (`group-chat-view.tsx`): null when the name is taken. */
  rename: (oldName: string, newName: string, members: GroupMember[]) => Promise<null | string>
}

function activeRoute(): CanonicalGroupRoute | null {
  try {
    return captureCanonicalGroupRoute()
  } catch {
    return null
  }
}

/** Whether Group settings offers to host this room: a Desktop room whose members the active gateway can seat. */
export async function canHostRoomOnGateway(room: GroupChatRoom, members: GroupMember[]): Promise<boolean> {
  const route = activeRoute()

  if (!route || room.canonical || room.tombstone) {
    return false
  }

  return canCreateCanonicalRoom(route, members)
}

function memberFolders(room: GroupChatRoom, members: GroupMember[]): Record<string, string> {
  const folders: Record<string, string> = {}

  for (const member of members) {
    const key = groupMemberKey(member)
    const path = room.memberWorkspaces?.[key]

    if (path) {
      folders[key] = path
    }
  }

  return folders
}

/** Create the hosted successor and hand the room over to it. Returns the hosted room's key;
 *  throws when the gateway refused (the confirm dialog shows the error and stays open). */
export async function hostRoomOnGateway(
  group: string,
  room: GroupChatRoom,
  members: GroupMember[],
  deps: HostRoomDeps
): Promise<string> {
  const route = captureCanonicalGroupRoute()
  const name = groupChatDisplayName(group, room)

  const key = await createCanonicalRoomWithSettings(route, name, members, {
    handle: room.handle || null,
    hold_detection: room.holdDetection !== false,
    member_workspaces: memberFolders(room, members),
    workspace: room.workspace || null
  })

  // The row's preferences are this Desktop's, not the gateway's: they follow the room here.
  updateGroupChat(
    key,
    current => ({ ...current, image: room.image || null, pinned: room.pinned, sectionId: room.sectionId ?? null }),
    { sync: false }
  )
  setGroupChatHandle(group, null)
  const legacy = botsText().group.legacyRoomName(name).slice(0, 64)
  await deps.rename(group, uniqueGroupChatName(legacy, new Set(Object.keys($groupChats.get()))), members)

  return key
}

interface HostOnGatewayButtonProps {
  group: string
  members: GroupMember[]
  /** The hosted room's key, once it exists; the caller closes the settings dialog and opens it. */
  onHosted: (key: string) => void
  rename: HostRoomDeps['rename']
}

/** The Group settings button and its confirmation; renders nothing when hosting is not on offer. */
export function HostOnGatewayButton({ group, members, onHosted, rename }: HostOnGatewayButtonProps) {
  const b = useBots()
  const rooms: Record<string, GroupChatRoom> = useValue($groupChats)
  const room = rooms[group]
  const [available, setAvailable] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const membersKey = members.map(groupMemberKey).join('\n')
  const hosted = Boolean(room?.canonical)
  const gone = Boolean(room?.tombstone) || !room

  useEffect(() => {
    let cancelled = false

    if (hosted || gone) {
      setAvailable(false)

      return undefined
    }

    void canHostRoomOnGateway($groupChats.get()[group], members).then(ok => {
      if (!cancelled) {
        setAvailable(ok)
      }
    })

    return () => {
      cancelled = true
    }
    // The member list is compared by key: its array identity changes on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, membersKey, hosted, gone])

  if (!available || !room) {
    return null
  }

  const name = groupChatDisplayName(group, room)

  return (
    <>
      <Button className="w-fit" onClick={() => setConfirming(true)} size="sm" variant="secondary">
        <Codicon name="server" />
        {b.group.hostOnGateway}
      </Button>
      <ConfirmDialog
        busyLabel={b.group.hostOnGatewayBusy}
        confirmLabel={b.group.hostOnGatewayAction}
        description={b.group.hostOnGatewayDescription(name, b.group.legacyRoomName(name))}
        onClose={() => setConfirming(false)}
        onConfirm={async () => {
          const key = await hostRoomOnGateway(group, room, members, { rename })
          host.notify({ kind: 'success', message: b.group.hostedOnGateway(name) })
          onHosted(key)
        }}
        open={confirming}
        title={b.group.hostOnGatewayTitle}
      />
    </>
  )
}
