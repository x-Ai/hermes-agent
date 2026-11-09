/**
 * The room log's duplicate-append guard (#93127), kept beside `group-chat.ts`, whose
 * `appendGroupChatEntry` is its one caller. A pure function of the previous entry.
 */

import type { GroupMessage, GroupMessageAuthor } from './types'

/** #93127 insurance: byte-identical member echo detection. TRUE only when
 *  the immediately-preceding log entry has the same author (kind + name +
 *  source), same thread, and identical text, within a short recency window —
 *  a residual double-append fires back-to-back; two legitimately identical
 *  replies hours apart (or with anything in between) are never dropped. */
const GROUP_DUPLICATE_APPEND_WINDOW_MS = 10 * 60 * 1000

export function isDuplicateGroupAppend(
  lastEntry: GroupMessage | undefined,
  from: GroupMessageAuthor,
  text: string,
  thread: null | string | undefined,
  now = Date.now()
): boolean {
  if (!lastEntry || !from || from.kind !== 'member' || lastEntry.from?.kind !== 'member') {
    return false
  }

  if (String(lastEntry.from?.name || '') !== String(from.name || '')) {
    return false
  }

  if (String(lastEntry.from?.source || '') !== String(from.source || '')) {
    return false
  }

  if (String(lastEntry.thread || 'legacy') !== String(thread || 'legacy')) {
    return false
  }

  if (now - (lastEntry.at || 0) > GROUP_DUPLICATE_APPEND_WINDOW_MS) {
    return false
  }

  return String(lastEntry.text || '') === String(text || '').trim()
}
