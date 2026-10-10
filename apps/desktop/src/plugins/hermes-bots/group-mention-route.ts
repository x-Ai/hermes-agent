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
 *
 * A room's tag is its `@handle` (`group-handle.ts`): explicit when the user
 * set one, else derived from the name — which is what gives a room named in
 * another script a tag at all. The name's own ASCII forms stay aliases, so
 * `@build-crew` keeps working after "Build Crew" is given a shorter handle.
 *
 * The draft's composer attachments ride along as room attachments
 * (`group-route-attachments.ts`): files become the data URLs members receive,
 * reference chips become leading text. One chip that cannot be converted
 * cancels the whole send — a kept draft the user can fix beats a message
 * delivered in half.
 */

import { host } from '@hermes/plugin-sdk'

import { mentionNameForms } from './data'
import { groupMentionHandle } from './group-handle'
import { routedGroupAttachments } from './group-route-attachments'
import type { RoutedAttachmentDeps } from './group-route-attachments'
import { normalizeGroupWorkspacePath } from './group-workspace'
import { botsText } from './i18n'
import type { Attachment, GroupChat, RosterRow } from './types'

/** The tags a room completes and resolves on: its handle first (the form the
 *  popover inserts), then the slug forms its name yields, as aliases. */
export function groupMentionTags(name: string, room?: Pick<GroupChat, 'handle'> | null): string[] {
  return [...new Set([groupMentionHandle(name, room), ...mentionNameForms(name)])].filter(Boolean)
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

    const tag = groupMentionTags(name, room)[0]

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
    if (room && !room.tombstone && groupMentionTags(name, room).includes(tag)) {
      return { group: name, rest: (text || '').slice(match[0].length).trim(), tag }
    }
  }

  return null
}

export interface GroupRouteDeps {
  /** The composer's live workspace ('' when detached). */
  cwd: () => string
  /** The host's file door for the draft's attachments; null on a desktop without one. */
  files: null | RoutedAttachmentDeps
  members: (group: string) => RosterRow[]
  open: (group: string) => void
  /** `sendToGroupChat` — returns the thread id, or null when nothing was sent. */
  send: (
    group: string,
    members: RosterRow[],
    text: string,
    workspace: null | string,
    images: Attachment[]
  ) => null | string
}

/** `consumed`: the room has the message (or was opened for a bare tag) and the
 *  composer must clear. `cancel`: nothing was delivered; the draft goes back
 *  to the user with a notice already shown. */
export type GroupRouteVerdict = 'cancel' | 'consumed'

export async function routeDraftToGroup(
  hit: GroupMentionHit,
  draft: { attachments?: unknown[]; text: string },
  deps: GroupRouteDeps
): Promise<GroupRouteVerdict> {
  const copy = botsText().group
  const chips = Array.isArray(draft.attachments) ? draft.attachments.filter(Boolean) : []
  let images: Attachment[] = []
  let refs: string[] = []

  if (chips.length) {
    // Chips are local paths and thumbnails; the room forwards data URLs. A
    // desktop without the file door keeps the draft rather than drop them.
    if (!deps.files) {
      host.notify({ kind: 'info', message: copy.routedAttachmentsBlocked(hit.group) })

      return 'cancel'
    }

    const routed = await routedGroupAttachments(chips, deps.files)

    if (routed.failed.length) {
      host.notify({ kind: 'error', message: copy.routedAttachmentsUnreadable(hit.group, routed.failed) })

      return 'cancel'
    }

    images = routed.images
    refs = routed.refs
  }

  // Reference chips lead the text, as they do in the 1:1 chat's prompt.
  const body = [refs.join('\n'), hit.rest].filter(Boolean).join('\n\n')

  if (!body && !images.length) {
    deps.open(hit.group)

    return 'consumed'
  }

  const workspace = normalizeGroupWorkspacePath(deps.cwd())
  // sendToGroupChat raises its own notice when the room has no members.
  const thread = deps.send(hit.group, deps.members(hit.group), body, workspace, images)

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
export async function maybeRouteDraftToGroup(
  draft: { attachments?: unknown[]; text: string },
  deps: LeadingGroupRouteDeps
): Promise<GroupRouteVerdict | null> {
  const hit = matchLeadingGroupMention(draft.text, deps.rooms)

  if (!hit || deps.botOwnsTag(hit.tag)) {
    return null
  }

  return routeDraftToGroup(hit, draft, deps)
}
