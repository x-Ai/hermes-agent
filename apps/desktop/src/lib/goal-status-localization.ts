import type { Translations } from '@/i18n'

type GoalStatusCopy = Translations['goalStatus']

interface GoalLine {
  pattern: RegExp
  format: (match: RegExpMatchArray, t: Translations) => string
}

// hermes_cli/goals.py names a wait target as `session {id}` / `pid {n}`
// (GoalManager._waiting_decision, status_line), `{n}s remaining`
// (_waiting_decision) or `{n}s` (_apply_wait_directive, status_line's
// countdown fallback). Anything else is the free-text waiting reason.
const WAIT_TARGETS: ReadonlyArray<{
  pattern: RegExp
  render: (match: RegExpMatchArray, copy: GoalStatusCopy) => string
}> = [
  { pattern: /^session (\S+)$/, render: (match, copy) => copy.waitTargets.session(match[1]) },
  { pattern: /^pid (\d+)$/, render: (match, copy) => copy.waitTargets.pid(match[1]) },
  { pattern: /^(\d+)s remaining$/, render: (match, copy) => copy.waitTargets.remaining(match[1]) },
  { pattern: /^(\d+)s$/, render: (match, copy) => copy.waitTargets.seconds(match[1]) }
]

function localizeWaitTarget(target: string, copy: GoalStatusCopy): string {
  const trimmed = target.trim()

  for (const { pattern, render } of WAIT_TARGETS) {
    const match = pattern.exec(trimmed)

    if (match) {
      return render(match, copy)
    }
  }

  return trimmed
}

// status_line()'s budget summary: "{used}/{max} turns" then any of
// ", {n} subgoal(s)", ", contract", ", {n} gate(s)".
const META_ITEMS: ReadonlyArray<{
  pattern: RegExp
  render: (match: RegExpMatchArray, copy: GoalStatusCopy) => string
}> = [
  { pattern: /^(\d+) subgoals?$/, render: (match, copy) => copy.meta.subgoals(Number(match[1])) },
  { pattern: /^contract$/, render: (_match, copy) => copy.meta.contract },
  { pattern: /^(\d+) gates?$/, render: (match, copy) => copy.meta.gates(Number(match[1])) }
]

function localizeMeta(used: string, max: string, tail: string, copy: GoalStatusCopy): string {
  const items = [copy.meta.turns(used, max)]

  for (const part of tail.split(', ').filter(Boolean)) {
    const item = META_ITEMS.find(({ pattern }) => pattern.test(part))

    items.push(item ? item.render(item.pattern.exec(part)!, copy) : part)
  }

  return items.join(copy.meta.separator)
}

// The meta's optional items are a closed set, so a paused reason that follows
// them (" — user-paused") cannot be mistaken for one.
const META = String.raw`(\d+)\/(\d+) turns((?:, (?:\d+ subgoals?|contract|\d+ gates?))*)`

// GoalContract.render_block() labels, shared with the structured goal card.
const CONTRACT_LABELS: Readonly<Record<string, keyof Translations['statusStack']['control']>> = {
  Outcome: 'contractOutcome',
  Verification: 'contractVerification',
  Constraints: 'contractConstraints',
  Boundaries: 'contractBoundaries',
  'Stop when blocked': 'contractStopWhen'
}

const GOAL_LINES: readonly GoalLine[] = [
  // ── parked (GoalManager._waiting_decision / _apply_wait_directive, /goal wait, status_line) ──
  {
    pattern: /^Goal parked( \(judge\))? — waiting on (.+?): ([\s\S]+)$/,
    format: (match, t) =>
      t.goalStatus.parkedWaitingOn(localizeWaitTarget(match[2], t.goalStatus), match[3].trim(), Boolean(match[1]))
  },
  {
    pattern: /^Goal parked on pid (\d+)(?: \((.+)\))?\. Loop pauses until it exits\.$/,
    format: (match, t) => t.goalStatus.parkedOnPid(match[1], match[2] ?? null)
  },
  {
    pattern: new RegExp(String.raw`^Goal \(parked on (.+?), ${META}\): ([\s\S]+)$`),
    format: (match, t) =>
      t.goalStatus.parkedStatus(
        localizeWaitTarget(match[1], t.goalStatus),
        localizeMeta(match[2], match[3], match[4], t.goalStatus),
        match[5]
      )
  },
  {
    pattern: new RegExp(String.raw`^Goal \(parked (\d+)s — (.+?), ${META}\): ([\s\S]+)$`),
    format: (match, t) =>
      t.goalStatus.parkedCountdownStatus(
        match[1],
        localizeWaitTarget(match[2], t.goalStatus),
        localizeMeta(match[3], match[4], match[5], t.goalStatus),
        match[6]
      )
  },
  // ── /goal <text> (goal_command.py::_set) ──
  {
    pattern: /^Goal set \((\d+)-turn budget\): ([\s\S]+)$/,
    format: (match, t) => t.goalStatus.set(match[1], match[2])
  },
  { pattern: /^\(replaced the previous goal\)$/, format: (_match, t) => t.goalStatus.replacedPrevious },
  { pattern: /^was: ([\s\S]+)$/, format: (match, t) => t.goalStatus.previousWas(match[1]) },
  { pattern: /^Completion contract:$/, format: (_match, t) => t.goalStatus.contractLabel },
  { pattern: /^Drafted completion contract:$/, format: (_match, t) => t.goalStatus.draftedContractLabel },
  {
    pattern: /^- (Outcome|Verification|Constraints|Boundaries|Stop when blocked): ([\s\S]+)$/,
    format: (match, t) => `- ${t.statusStack.control[CONTRACT_LABELS[match[1]]]}: ${match[2]}`
  },
  {
    pattern:
      /^After each turn, a judge model checks if the goal is done( against the contract above)?\. Hermes keeps working until it is, you pause\/clear it, or the budget is exhausted\. Use \/goal status, \/goal show, \/goal pause, \/goal resume, \/goal clear\.$/,
    format: (match, t) => t.goalStatus.judgeTrailer(Boolean(match[1]))
  },
  {
    pattern:
      /^Tighten any field by re-setting the goal with inline lines \(e\.g\. verify: <command>\), then \/goal resume\. Use \/goal show to review\.$/,
    format: (_match, t) => t.goalStatus.draftTightenHint
  },
  {
    pattern:
      /^Couldn't draft a contract \(aux model unavailable\) — running as a free-form goal\. The per-turn judge still applies\.$/,
    format: (_match, t) => t.goalStatus.draftFailed
  },
  {
    pattern:
      /^\(ignored (['"].*['"]): a control command never sets goal text — use \/goal -- <text> when the goal really starts with a control word\.\)$/,
    format: (match, t) => t.goalStatus.ignoredControlWords(match[1])
  },
  // ── pause / resume / clear / unwait ──
  { pattern: /^Goal paused: ([\s\S]+)$/, format: (match, t) => t.goalStatus.paused(match[1]) },
  { pattern: /^Goal resumed: ([\s\S]+)$/, format: (match, t) => t.goalStatus.resumed(match[1]) },
  { pattern: /^Goal cleared\.$/, format: (_match, t) => t.goalStatus.cleared },
  { pattern: /^No active goal\.$/, format: (_match, t) => t.goalStatus.noActiveGoal },
  { pattern: /^No active goal\. Set one with \/goal <text>\.$/, format: (_match, t) => t.goalStatus.noActiveGoalHint },
  { pattern: /^No goal set\.$/, format: (_match, t) => t.goalStatus.noGoalSet },
  { pattern: /^No goal to resume\.$/, format: (_match, t) => t.goalStatus.noGoalToResume },
  { pattern: /^Wait barrier cleared — goal loop resumes\.$/, format: (_match, t) => t.goalStatus.waitBarrierCleared },
  { pattern: /^No wait barrier set\.$/, format: (_match, t) => t.goalStatus.noWaitBarrier },
  // ── /goal status / show (status_line, render_contract) ──
  {
    pattern: new RegExp(String.raw`^Goal \(active, ${META}\): ([\s\S]+)$`),
    format: (match, t) => t.goalStatus.activeStatus(localizeMeta(match[1], match[2], match[3], t.goalStatus), match[4])
  },
  {
    // The paused reason may itself hold parentheses ("turn budget exhausted
    // (3/20)"), so it is matched greedily up to the last "): ".
    pattern: new RegExp(String.raw`^Goal \(paused, ${META}(?: — (.+))?\): ([\s\S]+)$`),
    format: (match, t) =>
      t.goalStatus.pausedStatus(localizeMeta(match[1], match[2], match[3], t.goalStatus), match[4] ?? null, match[5])
  },
  {
    pattern: new RegExp(String.raw`^Goal done \(${META}\): ([\s\S]+)$`),
    format: (match, t) => t.goalStatus.doneStatus(localizeMeta(match[1], match[2], match[3], t.goalStatus), match[4])
  },
  {
    pattern: /^\(no completion contract — set one with \/goal draft <objective> or inline field: value lines\)$/,
    format: (_match, t) => t.goalStatus.noContract
  },
  { pattern: /^\(no active goal\)$/, format: (_match, t) => t.goalStatus.noActiveGoalParen },
  // ── the post-turn judge (evaluate_after_turn) ──
  {
    pattern: /^Continuing toward goal \((\d+)\/(\d+)\): ([\s\S]+)$/,
    format: (match, t) => t.goalStatus.continuing(match[1], match[2], match[3])
  },
  { pattern: /^Goal achieved: ([\s\S]+)$/, format: (match, t) => t.goalStatus.achieved(match[1]) },
  {
    pattern:
      /^Goal paused — (\d+)\/(\d+) turns used( \(a quality gate is still failing\))?\. Use \/goal resume to keep going, or \/goal clear to stop\.$/,
    format: (match, t) => t.goalStatus.pausedBudget(match[1], match[2], Boolean(match[3]))
  },
  {
    pattern:
      /^Goal paused — quality gates not run: ([\s\S]+?)\. Fix the workspace or \/goal gate remove the gates, then \/goal resume\.$/,
    format: (match, t) => t.goalStatus.pausedGatesNotRun(match[1])
  },
  {
    pattern:
      /^Goal paused — quality gate still failing after (\d+) retries: \$ ([\s\S]+?) \(exit (-?\d+)\)\. Fix it manually or \/goal gate remove it, then \/goal resume\.$/,
    format: (match, t) => t.goalStatus.pausedGateFailing(match[1], match[2], match[3])
  },
  {
    pattern: /^Goal paused — judge API returned errors \((\d+) turns\)\. Check the goal_judge provider\/key in (.+)$/,
    format: (match, t) => t.goalStatus.pausedJudgeErrors(match[1], match[2])
  },
  {
    pattern:
      /^Goal paused — the judge model \((\d+) turns\) isn't returning the required JSON verdict\. Route the judge to a stricter model in (.+)$/,
    format: (match, t) => t.goalStatus.pausedJudgeUnparseable(match[1], match[2])
  },
  { pattern: /^Then \/goal resume to continue\.$/, format: (_match, t) => t.goalStatus.thenResume },
  {
    pattern:
      /^Goal judged unachievable — paused: ([\s\S]+?) Re-scope with \/goal set, or override with \/goal resume\.$/,
    format: (match, t) => t.goalStatus.unachievable(match[1])
  },
  // ── /goal gate (goal_command.py, render_gates) ──
  {
    pattern:
      /^Gate added: \$ ([\s\S]+?) \((\d+) retries, (\d+)s timeout\)\. It must pass before the goal can complete\.$/,
    format: (match, t) => t.goalStatus.gateAdded(match[1], match[2], match[3])
  },
  { pattern: /^Gate removed: \$ ([\s\S]+)$/, format: (match, t) => t.goalStatus.gateRemoved(match[1]) },
  { pattern: /^Cleared (\d+) gates?\.$/, format: (match, t) => t.goalStatus.gatesCleared(Number(match[1])) },
  {
    pattern: /^\(no quality gates — use \/goal gate add <command> to require one\)$/,
    format: (_match, t) => t.goalStatus.noGates
  },
  {
    pattern: /^- (\d+)\. \$ ([\s\S]+?)(?: ✓ passing| ✗ failing \(exit (-?\d+), attempt (\d+)\/(\d+)\))?$/,
    format: (match, t) =>
      t.goalStatus.gateListItem(
        match[1],
        match[2],
        match[3] !== undefined
          ? t.goalStatus.gateFailing(match[3], match[4], match[5])
          : match[0].endsWith(' ✓ passing')
            ? t.goalStatus.gatePassing
            : ''
      )
  }
]

const GLYPH = /^([⏳⊙⏸✓▶↻🚫⚿]\s*)?([\s\S]*)$/u

/** Re-render a backend goal status line (with or without its leading glyph —
 *  the goal store strips it) in the user's language. Lines this build does not
 *  own come back unchanged. */
export function localizeGoalStatusText(text: string, t: Translations): string {
  const [, glyph = '', body = ''] = GLYPH.exec(text.trim()) ?? []

  for (const { pattern, format } of GOAL_LINES) {
    const match = pattern.exec(body)

    if (match) {
      return glyph + format(match, t)
    }
  }

  return text
}
