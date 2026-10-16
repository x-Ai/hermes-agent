/**
 * A hosted member's pending command approval, mirrored into the room's prompt
 * store so a hosted room shows the approval card and the needs-you badge a
 * Desktop room shows (`$groupClarify`, `GroupClarifyCard`). The gateway's
 * driver reports approvals in `groups.state` → `driver_status.pending_actions`;
 * the answer goes back through `groups.approve` with the action's exact
 * coordinates, never to the member session directly, so the driver pops the
 * action and wakes the room.
 */

import { $canonicalGroupBindings } from './canonical-group-registry'
import { actCanonicalGroup } from './canonical-groups'
import { CANONICAL_USAGE_THREAD } from './canonical-room-model'
import { $groupClarify } from './group-chat'
import { groupMemberKey } from './group-membership'
import type { GroupMember, GroupPrompt } from './types'

interface PendingApproval {
  approval?: { choices?: unknown; command?: unknown; description?: unknown }
  execution_generation?: unknown
  kind?: unknown
  member_id?: unknown
  request_id?: unknown
  session_id?: unknown
  task_id?: unknown
}

function promptKey(group: string, memberKey: string): string {
  return `${group}::${CANONICAL_USAGE_THREAD}::${memberKey}`
}

function approvalEntry(group: string, member: GroupMember, action: PendingApproval): GroupPrompt | null {
  const requestId = typeof action.request_id === 'string' ? action.request_id : ''
  const taskId = typeof action.task_id === 'string' ? action.task_id : ''
  const generation = Number(action.execution_generation)

  if (action.kind !== 'approval' || !requestId || !taskId || !Number.isSafeInteger(generation) || generation < 1) {
    return null
  }

  const approval = action.approval || {}

  const choices = Array.isArray(approval.choices)
    ? approval.choices.filter((choice): choice is string => typeof choice === 'string' && Boolean(choice))
    : []

  return {
    at: Date.now(),
    choices: choices.length ? choices : ['once', 'deny'],
    command: typeof approval.command === 'string' ? approval.command : '',
    group,
    hostedAction: { executionGeneration: generation, memberId: member.name, taskId },
    kind: 'approval',
    member: member.name,
    memberKey: groupMemberKey(member),
    question: typeof approval.description === 'string' ? approval.description : '',
    requestId,
    sessionId: typeof action.session_id === 'string' ? action.session_id : null,
    thread: CANONICAL_USAGE_THREAD
  }
}

/** Mirror the room's pending approvals; cards the gateway no longer reports are dropped. */
export function mirrorCanonicalPendingActions(group: string, members: GroupMember[], actions: unknown): void {
  const all = $groupClarify.get()
  const next: Record<string, GroupPrompt> = { ...all }
  const seen = new Set<string>()
  let changed = false

  for (const action of Array.isArray(actions) ? (actions as PendingApproval[]) : []) {
    const member = members.find(m => m.name === action?.member_id || m.targetProfile === action?.member_id)
    const entry = member ? approvalEntry(group, member, action) : null

    if (!entry) {
      continue
    }

    const key = promptKey(group, entry.memberKey)
    seen.add(key)

    // The same request already mirrored keeps its object, so the card keeps its state.
    if (next[key]?.requestId !== entry.requestId) {
      next[key] = entry
      changed = true
    }
  }

  for (const [key, entry] of Object.entries(all)) {
    if (entry?.group === group && entry.hostedAction && !seen.has(key)) {
      delete next[key]
      changed = true
    }
  }

  if (changed) {
    $groupClarify.set(next)
  }
}

/** Answer a mirrored approval on the gateway and drop its card. */
export async function answerCanonicalApproval(entry: GroupPrompt, choice: string): Promise<void> {
  const action = entry.hostedAction
  const binding = $canonicalGroupBindings.get()[entry.group]

  if (!action || !binding) {
    throw new Error('hosted approval without a room binding')
  }

  await actCanonicalGroup(
    binding,
    {
      execution_generation: action.executionGeneration,
      kind: 'approval',
      member_id: action.memberId,
      request_id: entry.requestId,
      task_id: action.taskId
    },
    choice === 'once' ? 'once' : 'deny'
  )

  const all = $groupClarify.get()
  const key = promptKey(entry.group, entry.memberKey)

  if (all[key]?.requestId === entry.requestId) {
    const { [key]: _answered, ...rest } = all
    $groupClarify.set(rest)
  }
}

/** Disband / forget: a hosted room's mirrored prompts go with it. */
export function dropCanonicalPrompts(group: string): void {
  const all = $groupClarify.get()
  const rest = Object.fromEntries(Object.entries(all).filter(([, entry]) => entry?.group !== group))

  if (Object.keys(rest).length !== Object.keys(all).length) {
    $groupClarify.set(rest)
  }
}
