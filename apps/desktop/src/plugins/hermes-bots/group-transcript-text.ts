import * as sdk from '@hermes/plugin-sdk'

import type { GroupMessage } from './types'

type TranscriptLocalizer = typeof sdk.localizeAssistantTranscriptText

/** What the room reads off `useI18n()`: the active locale and the thread copy the localizer renders with. */
interface RoomI18n {
  locale: Parameters<TranscriptLocalizer>[2]
  t: { assistant: { thread: Parameters<TranscriptLocalizer>[1] } }
}

// The 1:1 thread re-renders the agent's own English placeholders ("Operation interrupted: waiting
// for model response (…)", the wait/retry frames) in the UI language at paint time; a room log and
// its roster preview show the same stored rows, so a member whose turn was stopped mid-request
// otherwise answers in English in a zh room. Feature-detected like MessageTextContent — `in`, not a
// property read, because a shell (or test double) without the export must simply show the stored
// text rather than throw.
const localizeTranscriptText: TranscriptLocalizer | undefined =
  typeof sdk === 'undefined' || !('localizeAssistantTranscriptText' in sdk)
    ? undefined
    : sdk.localizeAssistantTranscriptText

/** A room entry's text as the UI shows it: member rows in the UI language, the user's own lines verbatim. */
export function groupMemberBodyText(entry: Pick<GroupMessage, 'from' | 'text'>, { locale, t }: RoomI18n): string {
  if (entry.from?.kind === 'user' || !localizeTranscriptText) {
    return entry.text
  }

  return localizeTranscriptText(entry.text, t.assistant.thread, locale)
}
