/**
 * A gateway-hosted room's purpose, shared notes and who answers a message that names nobody, in the
 * Desktop room's Group settings dialog (`group-chat-view.tsx`). Upstream's room view edits them in its
 * own Room settings dialog (`canonical-group-room-settings.tsx`); here they join the dialog's one Save
 * (`saveCanonicalRoomSettings` → `groups.context`), offered only when the gateway reported them and
 * lists `groups.context`.
 */

import { Input, Textarea } from '@hermes/plugin-sdk'
import { useEffect, useState } from 'react'

import { offersGroupMethod } from './canonical-group-capabilities'
import { CanonicalGroupLeadSetting } from './canonical-group-lead'
import { roomDeliveryTarget } from './canonical-group-room-settings'
import { type CanonicalRoomContext, MAX_ROOM_NOTES_BYTES, roomNotesBytes } from './canonical-groups'
import type { CanonicalContextEdit } from './canonical-room-actions'
import { useHostedMembers, useHostedRoomMethods } from './canonical-room-view'
import type { GroupChatRoom } from './group-chat'
import { useBots } from './i18n'
import type { GroupMember } from './types'

export interface HostedContextDraft {
  /** Null while the gateway does not offer the room's purpose, notes and routing. */
  edit: CanonicalContextEdit | null
  /** The notes are past the gateway's cap: Save waits until they are shortened. */
  over: boolean
  setDraft: (draft: CanonicalRoomContext) => void
}

const seed = (context: CanonicalRoomContext): CanonicalRoomContext => ({
  purpose: context.purpose ?? '',
  notes: context.notes ?? '',
  ...(context.routing && { routing: context.routing, lead_member_id: context.lead_member_id ?? '' })
})

/** The dialog's edit of the room's purpose, notes and routing, beside the values it opened with. */
export function useHostedContextDraft(room: GroupChatRoom | undefined, open: boolean): HostedContextDraft {
  const methods = useHostedRoomMethods()
  const context = room?.canonical ? room.hosted?.context : null
  const offered = Boolean(context) && offersGroupMethod(methods, 'groups.context')
  const [edit, setEdit] = useState<CanonicalContextEdit | null>(null)

  // Seeded when the dialog opens, or when the gateway's answer arrives while it is open. A poll that
  // brings the settings again never replaces what the user is typing.
  useEffect(() => {
    const opened = open && offered && context ? seed(context) : null
    setEdit(opened && { base: opened, draft: opened })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, offered])

  return {
    edit,
    over: edit ? roomNotesBytes(edit.draft.notes) > MAX_ROOM_NOTES_BYTES : false,
    setDraft: draft => setEdit(current => current && { ...current, draft })
  }
}

/** Purpose, shared notes (counted against the gateway's cap), who answers, and the target scheduled
 *  jobs deliver to. Nothing while the gateway does not offer them. */
export function HostedContextFields({
  context,
  members,
  room
}: {
  context: HostedContextDraft
  members: readonly GroupMember[]
  room: GroupChatRoom | undefined
}) {
  const labels = useBots().canonical
  const named = useHostedMembers(members.length ? members : room?.members || [])
  const { edit, over, setDraft } = context
  const draft = edit?.draft

  if (!draft || !room?.canonical) {
    return null
  }

  return (
    <div className="grid gap-3" data-testid="group-settings-hosted-context">
      <label className="grid gap-1 text-xs">
        {labels.purposeLabel}
        <Input
          maxLength={500}
          onChange={event => setDraft({ ...draft, purpose: event.target.value })}
          placeholder={labels.purposePlaceholder}
          value={draft.purpose}
        />
      </label>
      <label className="grid gap-1 text-xs">
        {labels.notesLabel}
        <Textarea
          className="min-h-24"
          onChange={event => setDraft({ ...draft, notes: event.target.value })}
          placeholder={labels.notesPlaceholder}
          value={draft.notes}
        />
        <span className={over ? 'text-(--ui-accent)' : 'text-(--ui-text-tertiary)'} data-testid="room-notes-bytes">
          {roomNotesBytes(draft.notes)} / {MAX_ROOM_NOTES_BYTES}
        </span>
      </label>
      {draft.routing && (
        <CanonicalGroupLeadSetting
          autoRouting={Boolean(room.hosted?.routingModes.includes('auto'))}
          draft={draft}
          members={named}
          onChange={setDraft}
        />
      )}
      <p className="text-xs text-(--ui-text-secondary)">
        {labels.deliveryTarget} <code data-selectable-text="true">{roomDeliveryTarget(room.canonical)}</code>
      </p>
    </div>
  )
}
