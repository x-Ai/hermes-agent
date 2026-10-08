import type { Translations } from './types'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into en.ts.
export const enGoalStatus = {
  goalStatus: {
    standingGoal: 'Standing goal',
    waitTargets: {
      session: id => `session ${id}`,
      pid: pid => `process ${pid}`,
      remaining: seconds => `${seconds}s remaining`,
      seconds: seconds => `${seconds}s`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `Goal parked${byJudge ? ' (judge)' : ''} — waiting on ${target}: ${reason}`,
    parkedOnPid: (pid, reason) =>
      `Goal parked on process ${pid}${reason ? ` (${reason})` : ''}. The loop pauses until it exits.`,
    parkedStatus: (reason, meta, goal) => `Goal (parked on ${reason}, ${meta}): ${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) => `Goal (parked ${seconds}s — ${reason}, ${meta}): ${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} turns`,
      subgoals: count => `${count} subgoal${count === 1 ? '' : 's'}`,
      contract: 'contract',
      gates: count => `${count} gate${count === 1 ? '' : 's'}`,
      separator: ', '
    },
    set: (budget, goal) => `Goal set (${budget}-turn budget): ${goal}`,
    replacedPrevious: '(replaced the previous goal)',
    previousWas: previous => `was: ${previous}`,
    contractLabel: 'Completion contract:',
    draftedContractLabel: 'Drafted completion contract:',
    judgeTrailer: againstContract =>
      `After each turn, a judge model checks if the goal is done${againstContract ? ' against the contract above' : ''}. Hermes keeps working until it is, you pause/clear it, or the budget is exhausted. Use /goal status, /goal show, /goal pause, /goal resume, /goal clear.`,
    draftTightenHint:
      'Tighten any field by re-setting the goal with inline lines (e.g. verify: <command>), then /goal resume. Use /goal show to review.',
    draftFailed:
      "Couldn't draft a contract (aux model unavailable) — running as a free-form goal. The per-turn judge still applies.",
    ignoredControlWords: rest =>
      `(ignored ${rest}: a control command never sets goal text — use /goal -- <text> when the goal really starts with a control word.)`,
    paused: goal => `Goal paused: ${goal}`,
    resumed: goal => `Goal resumed: ${goal}`,
    cleared: 'Goal cleared.',
    noActiveGoal: 'No active goal.',
    noActiveGoalHint: 'No active goal. Set one with /goal <text>.',
    noGoalSet: 'No goal set.',
    noGoalToResume: 'No goal to resume.',
    waitBarrierCleared: 'Wait barrier cleared — goal loop resumes.',
    noWaitBarrier: 'No wait barrier set.',
    activeStatus: (meta, goal) => `Goal (active, ${meta}): ${goal}`,
    pausedStatus: (meta, reason, goal) => `Goal (paused, ${meta}${reason ? ` — ${reason}` : ''}): ${goal}`,
    doneStatus: (meta, goal) => `Goal done (${meta}): ${goal}`,
    noContract: '(no completion contract — set one with /goal draft <objective> or inline field: value lines)',
    noActiveGoalParen: '(no active goal)',
    continuing: (used, max, reason) => `Continuing toward goal (${used}/${max}): ${reason}`,
    achieved: reason => `Goal achieved: ${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `Goal paused — ${used}/${max} turns used${gateStillFailing ? ' (a quality gate is still failing)' : ''}. Use /goal resume to keep going, or /goal clear to stop.`,
    pausedGatesNotRun: refusal =>
      `Goal paused — quality gates not run: ${refusal}. Fix the workspace or /goal gate remove the gates, then /goal resume.`,
    pausedGateFailing: (retries, command, exitCode) =>
      `Goal paused — quality gate still failing after ${retries} retries: $ ${command} (exit ${exitCode}). Fix it manually or /goal gate remove it, then /goal resume.`,
    pausedJudgeErrors: (turns, configPath) =>
      `Goal paused — judge API returned errors (${turns} turns). Check the goal_judge provider/key in ${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `Goal paused — the judge model (${turns} turns) isn't returning the required JSON verdict. Route the judge to a stricter model in ${configPath}`,
    thenResume: 'Then /goal resume to continue.',
    unachievable: reason =>
      `Goal judged unachievable — paused: ${reason} Re-scope with /goal set, or override with /goal resume.`,
    gateAdded: (command, retries, timeout) =>
      `Gate added: $ ${command} (${retries} retries, ${timeout}s timeout). It must pass before the goal can complete.`,
    gateRemoved: command => `Gate removed: $ ${command}`,
    gatesCleared: count => `Cleared ${count} gate${count === 1 ? '' : 's'}.`,
    noGates: '(no quality gates — use /goal gate add <command> to require one)',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ passing',
    gateFailing: (exitCode, attempt, maxRetries) => `✗ failing (exit ${exitCode}, attempt ${attempt}/${maxRetries})`
  }
} satisfies Pick<Translations, 'goalStatus'>
