/**
 * "@<group>" in the main composer: completion rows for the user's group chats
 * and the route that hands an addressed draft to the room.
 *
 * The bot @-mention is identification-only (the agent then messages the bot
 * with its own tool); a room has no backend target — the room engine runs in
 * this renderer — so the only way to "use" a group from a normal composer is
 * to route the draft into it here. A draft whose FIRST token is a room tag
 * becomes a new thread in that room, pinned to the composer's workspace (the
 * project a Sessions-page draft was started under, `host.state.cwd`), and the
 * send is reported consumed so the composer clears instead of also starting a
 * normal session. Mentions further into the text are left alone: the room's
 * own parser addresses members, and a mid-sentence room name is prose.
 */

import { host } from '@hermes/plugin-sdk'

import { mentionNameForms } from './data'
import { normalizeGroupWorkspacePath } from './group-workspace'
import { botsText } from './i18n'
import type { GroupChat, RosterRow } from './types'

/** The tags a room completes and resolves on — the slug forms a bot title gets. */
export function groupMentionTags(name: string): string[] {
  return mentionNameForms(name)
}

export interface GroupMentionItem {
  display: string
  insert: string
  meta: string
}

export function groupMentionCompletions(
  query: string,
  rooms: Record<string, GroupChat | undefined>,
  meta: (memberCount: number) => string
): GroupMentionItem[] {
  const q = (query || '').toLowerCase()
  const items: GroupMentionItem[] = []

  for (const [name, room] of Object.entries(rooms || {})) {
    if (!room || room.tombstone) {
      continue
    }

    const tag = groupMentionTags(name)[0]

    if (!tag || (q && !tag.startsWith(q) && !name.toLowerCase().startsWith(q))) {
      continue
    }

    const insert = `@${tag}`
    const label = meta((room.members || []).length)
    items.push({ insert, display: insert, meta: tag === name.toLowerCase() ? label : `${label} · ${name}` })
  }

  return items
}

export interface GroupMentionHit {
  group: string
  /** The draft without its leading tag. */
  rest: string
  tag: string
}

/** A draft addressed to a room: `@<tag>` as the FIRST token. */
export function matchLeadingGroupMention(
  text: string,
  rooms: Record<string, GroupChat | undefined>
): GroupMentionHit | null {
  const match = /^\s*@([a-z0-9][a-z0-9_-]*)(?=\s|$)/i.exec(text || '')

  if (!match) {
    return null
  }

  const tag = match[1].toLowerCase()

  for (const [name, room] of Object.entries(rooms || {})) {
    if (room && !room.tombstone && groupMentionTags(name).includes(tag)) {
      return { group: name, rest: (text || '').slice(match[0].length).trim(), tag }
    }
  }

  return null
}

export interface GroupRouteDeps {
  /** The composer's live workspace ('' when detached). */
  cwd: () => string
  members: (group: string) => RosterRow[]
  open: (group: string) => void
  /** `sendToGroupChat` — returns the thread id, or null when nothing was sent. */
  send: (group: string, members: RosterRow[], text: string, workspace: null | string) => null | string
}

/** `consumed`: the room has the message (or was opened for a bare tag) and the
 *  composer must clear. `cancel`: nothing was delivered; the draft goes back
 *  to the user with a notice already shown. */
export type GroupRouteVerdict = 'cancel' | 'consumed'

export function routeDraftToGroup(
  hit: GroupMentionHit,
  draft: { attachments?: unknown[]; text: string },
  deps: GroupRouteDeps
): GroupRouteVerdict {
  const copy = botsText().group

  // Composer attachments are staged refs/paths, not the data URLs the room
  // engine forwards to members; rather than drop them silently, keep the draft.
  if (Array.isArray(draft.attachments) && draft.attachments.length) {
    host.notify({ kind: 'info', message: copy.routedAttachmentsBlocked(hit.group) })

    return 'cancel'
  }

  if (!hit.rest) {
    deps.open(hit.group)

    return 'consumed'
  }

  const workspace = normalizeGroupWorkspacePath(deps.cwd())
  // sendToGroupChat raises its own notice when the room has no members.
  const thread = deps.send(hit.group, deps.members(hit.group), hit.rest, workspace)

  if (!thread) {
    return 'cancel'
  }

  deps.open(hit.group)
  host.notify({ kind: 'success', message: copy.routedToGroup(hit.group, workspace) })

  return 'consumed'
}

export interface LeadingGroupRouteDeps extends GroupRouteDeps {
  /** True when a bot (not a room) owns this tag — bots win a tie, so the draft
   *  then falls through to the identification middleware instead of routing. */
  botOwnsTag: (tag: string) => boolean
  rooms: Record<string, GroupChat | undefined>
}

/** Route a draft whose FIRST token is a room tag into that room. Returns the
 *  route verdict when it handled the draft, or null when the leading token is
 *  not a room tag (or a bot owns it) and the caller should continue. Keeping
 *  the match + tie-break + route together here holds the composer middleware's
 *  own complexity flat. */
export function maybeRouteDraftToGroup(
  draft: { attachments?: unknown[]; text: string },
  deps: LeadingGroupRouteDeps
): GroupRouteVerdict | null {
  const hit = matchLeadingGroupMention(draft.text, deps.rooms)

  if (!hit || deps.botOwnsTag(hit.tag)) {
    return null
  }

  return routeDraftToGroup(hit, draft, deps)
}
