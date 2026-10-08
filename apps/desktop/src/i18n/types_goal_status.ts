// hermes_cli/goals.py + goal_command.py status lines (`/goal …` output, the
// post-turn judge's `status.update kind:"goal"`) are English on the wire —
// store/goals.ts parses them — and lib/goal-status-localization.ts re-renders
// them from this copy for the composer's goal row and the `/goal` transcript
// line. Values carry no leading glyph: the localizer keeps the backend's.
// `Translations` spreads this in.
export interface GoalStatusTranslations {
  goalStatus: {
    /** Row title when a parked / continuing / finished line arrives before any line named the goal. */
    standingGoal: string
    /** The wait targets the backend names: `session {id}`, `pid {n}`, `{n}s remaining`, `{n}s`. */
    waitTargets: {
      session: (id: string) => string
      pid: (pid: string) => string
      remaining: (seconds: string) => string
      seconds: (seconds: string) => string
    }
    /** `⏳ Goal parked[ (judge)] — waiting on {target}: {reason}`; `target` is already rendered. */
    parkedWaitingOn: (target: string, reason: string, byJudge: boolean) => string
    /** `⏳ Goal parked on pid {pid}[ ({reason})]. Loop pauses until it exits.` */
    parkedOnPid: (pid: string, reason: string | null) => string
    /** `⏳ Goal (parked on {reason}, {meta}): {goal}` — `reason` is the wait reason or a rendered target. */
    parkedStatus: (reason: string, meta: string, goal: string) => string
    /** `⏳ Goal (parked {n}s — {reason}, {meta}): {goal}` */
    parkedCountdownStatus: (seconds: string, reason: string, meta: string, goal: string) => string
    /** The status line's budget summary: `{used}/{max} turns[, {n} subgoal(s)][, contract][, {n} gate(s)]`. */
    meta: {
      turns: (used: string, max: string) => string
      subgoals: (count: number) => string
      contract: string
      gates: (count: number) => string
      separator: string
    }
    // ── /goal <text> (goal_command.py::_set) ──
    /** `⊙ Goal set ({budget}-turn budget): {goal}` */
    set: (budget: string, goal: string) => string
    replacedPrevious: string
    previousWas: (previous: string) => string
    contractLabel: string
    draftedContractLabel: string
    /** The trailer after a goal is set; `againstContract` adds "against the contract above". */
    judgeTrailer: (againstContract: boolean) => string
    draftTightenHint: string
    draftFailed: string
    /** `(ignored {rest!r}: a control command never sets goal text …)`; `rest` is the backend's quoted text. */
    ignoredControlWords: (rest: string) => string
    // ── pause / resume / clear / unwait ──
    paused: (goal: string) => string
    resumed: (goal: string) => string
    cleared: string
    noActiveGoal: string
    noActiveGoalHint: string
    noGoalSet: string
    noGoalToResume: string
    waitBarrierCleared: string
    noWaitBarrier: string
    // ── /goal status / show (GoalManager.status_line, render_contract) ──
    activeStatus: (meta: string, goal: string) => string
    pausedStatus: (meta: string, reason: string | null, goal: string) => string
    doneStatus: (meta: string, goal: string) => string
    noContract: string
    noActiveGoalParen: string
    // ── the post-turn judge (GoalManager.evaluate_after_turn) ──
    continuing: (used: string, max: string, reason: string) => string
    achieved: (reason: string) => string
    /** `gateStillFailing` is the backend's one note: "(a quality gate is still failing)". */
    pausedBudget: (used: string, max: string, gateStillFailing: boolean) => string
    pausedGatesNotRun: (refusal: string) => string
    pausedGateFailing: (retries: string, command: string, exitCode: string) => string
    /** `configPath` is the backend's config pointer ("~/.hermes/config.yaml:"), kept verbatim. */
    pausedJudgeErrors: (turns: string, configPath: string) => string
    pausedJudgeUnparseable: (turns: string, configPath: string) => string
    thenResume: string
    unachievable: (reason: string) => string
    // ── /goal gate (goal_command.py, GoalManager.render_gates) ──
    gateAdded: (command: string, retries: string, timeout: string) => string
    gateRemoved: (command: string) => string
    gatesCleared: (count: number) => string
    noGates: string
    /** `- {index}. $ {command}[ {status}]`; `status` is a rendered gatePassing / gateFailing or empty. */
    gateListItem: (index: string, command: string, status: string) => string
    gatePassing: string
    gateFailing: (exitCode: string, attempt: string, maxRetries: string) => string
  }
}
