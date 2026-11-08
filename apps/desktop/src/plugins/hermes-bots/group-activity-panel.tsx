/**
 * The room view's collapsible Activity disclosure: quiet and collapsed by default, its row shows the
 * latest event (or, once the room settles, a member that failed to answer); expanding lists the
 * current run's events newest-first, with Stop while the room runs. Split out of
 * `LegacyGroupChatWorkspace` (`group-chat-view.tsx`) to hold that function under its code-health caps.
 */

import { Button, cn, Codicon, relativeTime, RowButton, Tip, useI18n } from '@hermes/plugin-sdk'
import { useState } from 'react'

import { GROUP_ACTIVITY_GLYPHS, type GroupActivityEntry, groupActivityLabel, groupActivityTone } from './group-activity'
import { useBots } from './i18n'

/** The latest member failure no later success cleared: a later "settled" must not hide a member that
 *  failed to answer, and that member's own successful completion clears it. */
function unresolvedFailure(events: readonly GroupActivityEntry[]): GroupActivityEntry | undefined {
  const failures = new Map<string, GroupActivityEntry>()

  for (const event of events) {
    const key = event.member || ''

    if (event.kind === 'failed' || event.kind === 'timed-out') {
      failures.delete(key)
      failures.set(key, event)
    } else if (event.kind === 'replied' || event.kind === 'passed' || event.kind === 'delivered') {
      failures.delete(key)
    }
  }

  return [...failures.values()].at(-1)
}

export function GroupActivityPanel({
  activity,
  group,
  onStop,
  running
}: {
  /** The current run's events, oldest first (epoch-tagged: a superseded run's history is gone). */
  activity: GroupActivityEntry[]
  group: string
  onStop: () => void
  running: boolean
}) {
  const b = useBots()
  const { locale } = useI18n()
  // Opening it is always an explicit user action: it never steals focus and never auto-scrolls.
  const [open, setOpen] = useState(false)
  const latest = activity.length ? activity[activity.length - 1] : null
  const summary = (!running && unresolvedFailure(activity)) || latest

  return (
    <div className="border-b border-(--ui-stroke-tertiary) px-4">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1">
        <RowButton
          aria-controls={`group-activity:${group}`}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1.5 px-1 py-1.5 text-left text-xs text-(--ui-text-tertiary) transition-colors hover:text-foreground"
          onClick={() => setOpen(prev => !prev)}
        >
          <Codicon className="shrink-0 text-[0.65rem]" name={open ? 'chevron-down' : 'chevron-right'} />
          <span className="shrink-0 font-medium">{b.group.activity}</span>
          {summary ? (
            <span
              className={cn('min-w-0 flex-1 truncate', groupActivityTone(summary.kind))}
            >{`${groupActivityLabel(summary, group)} · ${relativeTime(summary.at, undefined, locale)}`}</span>
          ) : null}
        </RowButton>
        {running ? (
          <Tip label={b.group.stopHint}>
            <Button className="shrink-0 text-(--ui-accent)" onClick={onStop} size="xs" variant="ghost">
              <Codicon name="debug-stop" />
              {b.group.stop}
            </Button>
          </Tip>
        ) : null}
      </div>
      {open ? (
        <div className="mx-auto grid w-full max-w-3xl gap-0.5 px-2.5 pb-1.5" id={`group-activity:${group}`}>
          {activity.length ? (
            [...activity].reverse().map((event, i) => (
              <div className="flex items-center gap-1.5 text-[0.7rem]" key={`${event.at}:${i}`}>
                <Codicon
                  className={cn('shrink-0 text-[0.65rem]', groupActivityTone(event.kind))}
                  name={GROUP_ACTIVITY_GLYPHS[event.kind] || 'circle-outline'}
                />
                <span className={cn('min-w-0 flex-1 truncate', groupActivityTone(event.kind))}>
                  {groupActivityLabel(event, group)}
                </span>
                <span className="shrink-0 text-[0.625rem] text-(--ui-text-quaternary)">{relativeTime(event.at, undefined, locale)}</span>
                {running && event.kind === 'working' ? (
                  <Tip label={b.group.stopHint}>
                    <Button className="shrink-0 text-(--ui-accent)" onClick={onStop} size="micro" variant="ghost">
                      <Codicon name="debug-stop" />
                      {b.group.stop}
                    </Button>
                  </Tip>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-0.5 pb-0.5 text-[0.625rem] text-(--ui-text-quaternary)">{b.group.noActivityYet}</div>
          )}
        </div>
      ) : null}
    </div>
  )
}
