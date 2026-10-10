/**
 * A group chat's `@handle`: the room's counterpart of a bot's profile id.
 *
 * Mention tags are ASCII by contract — the same grammar as a profile id, a
 * `message_agent` target and a relay stamp — so a room named in another
 * script ("大模型管家") could never be completed or routed from the main
 * composer: `mentionNameForms` yields nothing for it, and unlike a bot a room
 * has no profile id to fall back on. The handle fills that gap the way the
 * Create Bot dialog does for a CJK bot name: derived from the name when it
 * can be, and otherwise the same deterministic `u<hex>` escape the profile id
 * gets, so every room answers to SOME tag; the user may set a friendlier one
 * in the create and settings dialogs.
 *
 * Only an explicit handle is validated against the roster: bots win a tie in
 * the composer middleware, so a room sharing a bot's tag would be unreachable.
 */

import { botHandle, botMentionTag, mentionNameForms } from './data'
import { botsText } from './i18n'
import { displayName, slugifyProfileName } from './labels'
import { botRosterMeta } from './routing'
import type { BotMeta, GroupChat, RosterRow } from './types'

/** The profile-id grammar (`hermes_constants.PROFILE_ID_RE`). */
export const GROUP_HANDLE_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/

/** Tags a rename can never claim — the same list `mentionNameForms` drops. */
const RESERVED_HANDLES = new Set(['all', 'everyone', 'user', 'default', 'hermes'])

/** What the user typed, as a candidate handle: trimmed, `@`-less, lowercase. */
export function normalizeGroupHandle(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
}

export function isValidGroupHandle(handle: string): boolean {
  return GROUP_HANDLE_RE.test(handle) && !RESERVED_HANDLES.has(handle)
}

/** The handle a room gets from its name alone: the mention slug of a name
 *  with ASCII in it ("Build Crew" → build-crew), else the code-point escape
 *  a CJK bot name gets as its profile id ("大模型管家" →
 *  u5927-u6a21-u578b-u7ba1-u5bb6). '' when the name has nothing to build on
 *  (a reserved word, punctuation only). */
export function groupHandleFromName(name: string): string {
  const slug = mentionNameForms(name)[0]

  if (slug && GROUP_HANDLE_RE.test(slug)) {
    return slug
  }

  const escaped = slugifyProfileName(String(name || ''))

  return isValidGroupHandle(escaped) ? escaped : ''
}

/** The handle the room answers to: its explicit one when set and valid, else
 *  the one derived from its name. */
export function groupMentionHandle(name: string, room?: Pick<GroupChat, 'handle'> | null): string {
  const explicit = normalizeGroupHandle(room?.handle)

  return explicit && isValidGroupHandle(explicit) ? explicit : groupHandleFromName(name)
}

export type GroupHandleOwner = { bot: RosterRow; kind: 'bot' } | { kind: 'room'; name: string }

export interface GroupHandleContext {
  /** The room being edited — its own handle is not a collision. */
  except?: null | string
  meta: Record<string, BotMeta>
  rooms: Record<string, GroupChat | undefined>
  roster: RosterRow[]
}

/** Who already answers to `handle`: another live room (by its explicit or
 *  derived handle), or a bot on the roster by its tag, handle or profile name. */
export function groupHandleOwner(
  handle: string,
  { except = null, rooms, roster }: Omit<GroupHandleContext, 'meta'>
): GroupHandleOwner | null {
  const want = normalizeGroupHandle(handle)

  if (!want) {
    return null
  }

  for (const [name, room] of Object.entries(rooms || {})) {
    if (room && !room.tombstone && name !== except && groupMentionHandle(name, room) === want) {
      return { kind: 'room', name }
    }
  }

  for (const bot of roster || []) {
    if (!bot?.name) {
      continue
    }

    const forms = [botMentionTag(bot), botHandle(bot.name, bot), bot.name].map(form => String(form || '').toLowerCase())

    if (forms.includes(want)) {
      return { bot, kind: 'bot' }
    }
  }

  return null
}

export interface GroupHandleVerdict {
  /** The value to store: null when the field was left empty (derive from the name). */
  handle: null | string
  /** A notice for the user when the input cannot be stored; null when it can. */
  problem: null | string
}

/** The create and settings dialogs' shared check of the handle field. */
export function checkGroupHandleInput(input: string, context: GroupHandleContext): GroupHandleVerdict {
  const handle = normalizeGroupHandle(input)
  const copy = botsText().group

  if (!handle) {
    return { handle: null, problem: null }
  }

  if (!isValidGroupHandle(handle)) {
    return { handle, problem: copy.handleInvalid }
  }

  const owner = groupHandleOwner(handle, context)

  if (owner) {
    const label = owner.kind === 'room' ? owner.name : displayName(owner.bot, botRosterMeta(owner.bot, context.meta))

    return { handle, problem: copy.handleTaken(handle, label) }
  }

  return { handle, problem: null }
}
