/**
 * A member reply's folded "thinking & actions" disclosure — the room's echo of
 * the 1:1 chat's thinking/tool rows. Collapsed by default (the room stays a
 * readable conversation); the user opens it to read the reasoning the member
 * wrote and the tools it ran on the way to the answer. The trace is built by
 * `group-trace-capture.ts` and rides the room entry (`group-trace.ts`); while a
 * member's turn is still running, `GroupLiveTurnTrace` shows the same
 * disclosure growing under the working line from `group-trace-live.ts`,
 * opened at the newest output and following it until the user scrolls up.
 */

import * as sdk from '@hermes/plugin-sdk'
import { cn, Codicon, RowButton, useValue } from '@hermes/plugin-sdk'
import { useEffect, useRef, useState } from 'react'

import { groupTraceCounts, isGroupTurnTrace } from './group-trace'
import type { GroupTraceStep, GroupTurnTrace } from './group-trace'
import { $groupLiveTraces, groupLiveTraceKey } from './group-trace-live'
import { useBots } from './i18n'
import type { GroupMember } from './types'

// The 1:1 chat's renderer (markdown, code cards); feature-detected like the
// room body so an older shell falls back to plain text (#91878/#93728).
const MessageTextContent = typeof sdk === 'undefined' ? undefined : sdk.MessageTextContent

function TraceBody({ text }: { text: string }) {
  if (MessageTextContent) {
    return <MessageTextContent media={false} text={text} />
  }

  return <span className="whitespace-pre-wrap">{text}</span>
}

function TraceStepView({ running = false, step }: { running?: boolean; step: GroupTraceStep }) {
  const b = useBots()

  if (step.kind === 'reasoning') {
    return (
      <div className="border-l-2 border-(--ui-stroke-secondary) pl-2">
        <div className="mb-0.5 text-[0.6rem] uppercase tracking-wide text-(--ui-text-quaternary)">
          {b.group.traceThought}
        </div>
        <TraceBody text={step.text} />
      </div>
    )
  }

  if (step.kind === 'text') {
    return <TraceBody text={step.text} />
  }

  return (
    <div className="grid gap-0.5" data-running={running ? 'true' : undefined} data-testid="group-trace-tool">
      <div className="flex items-center gap-1">
        <Codicon
          className={cn('shrink-0 text-[0.7rem]', step.failed ? 'text-destructive' : 'text-(--ui-text-tertiary)')}
          name={running ? 'loading' : step.failed ? 'error' : 'tools'}
          spinning={running}
        />
        <span className="font-medium text-(--ui-text-secondary)">{step.name}</span>
        {step.context ? <span className="min-w-0 truncate text-(--ui-text-quaternary)">{step.context}</span> : null}
      </div>
      {step.args ? (
        <pre className="ml-[1.1rem] overflow-x-auto whitespace-pre-wrap wrap-anywhere rounded bg-(--chrome-action-hover) px-1.5 py-1 text-[0.65rem] text-(--ui-text-tertiary)">
          {step.args}
        </pre>
      ) : null}
      {step.note ? (
        <div
          className={cn('ml-[1.1rem] text-[0.65rem]', step.failed ? 'text-destructive' : 'text-(--ui-text-quaternary)')}
        >
          {step.failed ? `${b.group.traceFailed}: ${step.note}` : step.note}
        </div>
      ) : null}
    </div>
  )
}

// How close to the bottom (px) still counts as "reading the latest": scrolling
// back within it resumes following, as the 1:1 chat's thinking preview does.
const TRACE_RELOCK_THRESHOLD_PX = 24

interface GroupTraceStepsProps {
  dropped?: number
  /** Live disclosure: open at the newest output and keep following growth
   *  until the user scrolls up to read; scrolling back down resumes. */
  follow?: boolean
  /** Index of the tool step still running (live disclosure only). */
  runningIndex?: null | number
  steps: GroupTraceStep[]
}

/** The "follow the newest output" latch of one live disclosure. Plain closure
 *  state, not React state: it flips on every wheel tick and must never repaint.
 *  Following is on from the moment the box opens, off once the reader scrolls
 *  up, on again when they come back within reach of the bottom. */
function createScrollFollower() {
  let following = true

  const atBottom = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight < TRACE_RELOCK_THRESHOLD_PX

  return {
    /** Jump to the newest output and keep the box pinned there while the
     *  reader stays at the bottom. Markdown and code cards settle their height
     *  after paint; the observer keeps the pin through that too. */
    attach(el: HTMLElement | null, content: HTMLElement | null): (() => void) | undefined {
      if (!el || !content) {
        return undefined
      }

      following = true
      el.scrollTop = el.scrollHeight

      const trackScroll = () => {
        following = atBottom(el)
      }

      const pin = () => {
        if (following) {
          el.scrollTop = el.scrollHeight
        }
      }

      const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(pin) : null
      observer?.observe(content)
      el.addEventListener('scroll', trackScroll, { passive: true })

      return () => {
        observer?.disconnect()
        el.removeEventListener('scroll', trackScroll)
      }
    },
    /** A flush of the live trace (a new step, a longer reasoning block) landed. */
    pin(el: HTMLElement | null) {
      if (el && following) {
        el.scrollTop = el.scrollHeight
      }
    }
  }
}

/** The steps in their own bounded scroll box: a long trace never takes the
 *  room over, and a wheel inside it scrolls the trace alone — `overscroll-
 *  contain` stops the room list from taking the wheel at either edge, so the
 *  header stays where it was and one click still folds the block. */
function GroupTraceSteps({ dropped, follow = false, runningIndex = null, steps }: GroupTraceStepsProps) {
  const b = useBots()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [follower] = useState(createScrollFollower)

  useEffect(() => (follow ? follower.attach(scrollRef.current, contentRef.current) : undefined), [follow, follower])

  useEffect(() => {
    if (follow) {
      follower.pin(scrollRef.current)
    }
  }, [follow, follower, steps])

  return (
    <div
      className="mt-1 max-h-[45vh] overflow-y-auto overscroll-contain border-l border-(--ui-stroke-secondary) pl-2 text-[0.7rem] text-(--ui-text-tertiary)"
      data-selectable-text="true"
      data-testid="group-trace-steps"
      ref={scrollRef}
    >
      <div className="grid gap-1.5" ref={contentRef}>
        {dropped ? (
          <div className="text-[0.65rem] italic text-(--ui-text-quaternary)">{b.group.traceOmitted(dropped)}</div>
        ) : null}
        {steps.map((step, index) => (
          <TraceStepView key={index} running={index === runningIndex} step={step} />
        ))}
      </div>
    </div>
  )
}

/** Opening a disclosure is the user's own click: bring the whole block —
 *  header included, so it can be folded again — into the room's view. */
function useRevealOnOpen(open: boolean) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [open])

  return ref
}

/** The collapsed header's count chips: "thought · 3 tools". */
function useTraceCounts(steps: GroupTraceStep[]): string[] {
  const b = useBots()
  const { reasoning, tools } = groupTraceCounts({ steps })

  return [reasoning ? b.group.traceThought : null, tools ? b.group.traceTools(tools) : null].filter(
    (chip): chip is string => Boolean(chip)
  )
}

/** `hidden` (a user row) and a malformed/empty trace both render nothing — the
 *  guard lives here, not in the room's `renderEntry`, so the room keeps calling
 *  this unconditionally for every entry (group-chat-view.tsx). */
export function GroupTurnTraceView({ hidden, trace }: { hidden?: boolean; trace?: GroupTurnTrace | null }) {
  const b = useBots()
  const [open, setOpen] = useState(false)
  const counts = useTraceCounts(isGroupTurnTrace(trace) ? trace.steps : [])
  const blockRef = useRevealOnOpen(open)

  if (hidden || !isGroupTurnTrace(trace) || !trace.steps.length) {
    return null
  }

  return (
    <div className="mt-0.5" data-slot="group-trace" ref={blockRef}>
      <RowButton
        aria-expanded={open}
        className="flex min-w-0 items-center gap-1 text-[0.65rem] text-(--ui-text-quaternary) transition-colors hover:text-foreground"
        onClick={() => setOpen(prev => !prev)}
      >
        <Codicon className="shrink-0 text-[0.6rem]" name={open ? 'chevron-down' : 'chevron-right'} />
        <span className="shrink-0 font-medium">{b.group.traceLabel}</span>
        {counts.length ? <span className="min-w-0 truncate">{counts.join(' · ')}</span> : null}
      </RowButton>
      {open ? <GroupTraceSteps dropped={trace.dropped} steps={trace.steps} /> : null}
    </div>
  )
}

interface GroupLiveTurnTraceProps {
  group: string
  /** The room's live fields: whether a turn runs, and whose. */
  room: { running?: boolean; turn?: GroupMember | null }
}

/** The disclosure of the member turn in flight, under the room's working line:
 *  the reasoning and tool calls as they happen, collapsed by default like a
 *  finished reply's, gone when the turn ends (its reply then carries the
 *  final trace). Renders nothing until the first step lands — the working
 *  line already says who is thinking. */
export function GroupLiveTurnTrace({ group, room }: GroupLiveTurnTraceProps) {
  const b = useBots()
  const live = useValue($groupLiveTraces)
  const [open, setOpen] = useState(false)
  const entry = room.running && room.turn ? live[groupLiveTraceKey(group, room.turn)] : undefined
  const counts = useTraceCounts(entry?.steps ?? [])
  const blockRef = useRevealOnOpen(open)

  if (!entry || !entry.steps.length) {
    return null
  }

  return (
    <div className="px-2 pb-1" data-slot="group-trace-live" data-testid="group-trace-live" ref={blockRef}>
      <RowButton
        aria-expanded={open}
        className="flex min-w-0 items-center gap-1 text-[0.65rem] text-(--ui-text-quaternary) transition-colors hover:text-foreground"
        onClick={() => setOpen(prev => !prev)}
      >
        <Codicon className="shrink-0 text-[0.6rem]" name={open ? 'chevron-down' : 'chevron-right'} />
        <Codicon className="shrink-0 text-[0.65rem]" name="loading" spinning />
        <span className="shrink-0 font-medium">{b.group.traceLive}</span>
        {counts.length ? <span className="min-w-0 truncate">{counts.join(' · ')}</span> : null}
      </RowButton>
      {open ? <GroupTraceSteps follow runningIndex={entry.runningIndex} steps={entry.steps} /> : null}
    </div>
  )
}
