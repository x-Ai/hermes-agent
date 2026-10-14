/**
 * A member reply's folded "thinking & actions" disclosure — the room's echo of
 * the 1:1 chat's thinking/tool rows. Collapsed by default (the room stays a
 * readable conversation); the user opens it to read the reasoning the member
 * wrote and the tools it ran on the way to the answer. The trace is built by
 * `group-trace-capture.ts` and rides the room entry (`group-trace.ts`).
 */

import * as sdk from '@hermes/plugin-sdk'
import { cn, Codicon, RowButton } from '@hermes/plugin-sdk'
import { useState } from 'react'

import { groupTraceCounts, isGroupTurnTrace } from './group-trace'
import type { GroupTraceStep, GroupTurnTrace } from './group-trace'
import { useBots } from './i18n'

// The 1:1 chat's renderer (markdown, code cards); feature-detected like the
// room body so an older shell falls back to plain text (#91878/#93728).
const MessageTextContent = typeof sdk === 'undefined' ? undefined : sdk.MessageTextContent

function TraceBody({ text }: { text: string }) {
  if (MessageTextContent) {
    return <MessageTextContent media={false} text={text} />
  }

  return <span className="whitespace-pre-wrap">{text}</span>
}

function TraceStepView({ step }: { step: GroupTraceStep }) {
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
    <div className="grid gap-0.5">
      <div className="flex items-center gap-1">
        <Codicon
          className={cn('shrink-0 text-[0.7rem]', step.failed ? 'text-destructive' : 'text-(--ui-text-tertiary)')}
          name={step.failed ? 'error' : 'tools'}
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

/** `hidden` (a user row) and a malformed/empty trace both render nothing — the
 *  guard lives here, not in the room's `renderEntry`, so the room keeps calling
 *  this unconditionally for every entry (group-chat-view.tsx). */
export function GroupTurnTraceView({ hidden, trace }: { hidden?: boolean; trace?: GroupTurnTrace | null }) {
  const b = useBots()
  const [open, setOpen] = useState(false)

  if (hidden || !isGroupTurnTrace(trace) || !trace.steps.length) {
    return null
  }

  const { reasoning, tools } = groupTraceCounts(trace)
  const counts = [reasoning ? b.group.traceThought : null, tools ? b.group.traceTools(tools) : null].filter(Boolean)

  return (
    <div className="mt-0.5" data-slot="group-trace">
      <RowButton
        aria-expanded={open}
        className="flex min-w-0 items-center gap-1 text-[0.65rem] text-(--ui-text-quaternary) transition-colors hover:text-foreground"
        onClick={() => setOpen(prev => !prev)}
      >
        <Codicon className="shrink-0 text-[0.6rem]" name={open ? 'chevron-down' : 'chevron-right'} />
        <span className="shrink-0 font-medium">{b.group.traceLabel}</span>
        {counts.length ? <span className="min-w-0 truncate">{counts.join(' · ')}</span> : null}
      </RowButton>
      {open ? (
        <div
          className="mt-1 grid gap-1.5 border-l border-(--ui-stroke-secondary) pl-2 text-[0.7rem] text-(--ui-text-tertiary)"
          data-selectable-text="true"
          data-testid="group-trace-steps"
        >
          {trace.dropped ? (
            <div className="text-[0.65rem] italic text-(--ui-text-quaternary)">
              {b.group.traceOmitted(trace.dropped)}
            </div>
          ) : null}
          {trace.steps.map((step, index) => (
            <TraceStepView key={index} step={step} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
