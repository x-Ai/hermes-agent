import { describe, expect, it } from 'vitest'

import { type Locale, resolveTranslations, TRANSLATIONS } from '@/i18n'

import { localizeGoalStatusText } from './goal-status-localization'

const en = TRANSLATIONS.en
const zh = TRANSLATIONS.zh
const LOCALES = Object.keys(TRANSLATIONS) as Locale[]
const CJK = /[一-鿿]/u

// Lines exactly as hermes_cli/goals.py / goal_command.py write them, with the
// facts a rendering must keep whatever the language.
const BACKEND_LINES: ReadonlyArray<[line: string, facts: string[]]> = [
  // GoalManager._waiting_decision / _apply_wait_directive (status.update kind "goal")
  ['⏳ Goal parked — waiting on session abc123: deploy finished', ['abc123', 'deploy finished']],
  ['⏳ Goal parked (judge) — waiting on 30s: let CI settle', ['30', 'let CI settle']],
  ['⏳ Goal parked — waiting on pid 4242: build running', ['4242', 'build running']],
  ['⏳ Goal parked — waiting on 45s remaining: cooldown', ['45', 'cooldown']],
  // goal_command.py::_wait
  ['⏳ Goal parked on pid 4242 (wait for the build). Loop pauses until it exits.', ['4242', 'wait for the build']],
  // status_line() while parked
  [
    '⏳ Goal (parked on session abc123, 3/20 turns, 2 subgoals, contract, 1 gate): ship it',
    ['abc123', '3', '20', 'ship it']
  ],
  ['⏳ Goal (parked 42s — 42s, 3/20 turns, 1 subgoal): ship it', ['42', '3', '20', 'ship it']],
  // goal_command.py::_set
  ['⊙ Goal set (20-turn budget): ship the feature', ['20', 'ship the feature']],
  ['(replaced the previous goal)', []],
  ['  was: fix the tests', ['fix the tests']],
  ['Completion contract:', []],
  ['Drafted completion contract:', []],
  ['- Verification: npm test passes', ['npm test passes']],
  ['- Stop when blocked: ask before deleting data', ['ask before deleting data']],
  [
    'After each turn, a judge model checks if the goal is done against the contract above. Hermes keeps working until it is, you pause/clear it, or the budget is exhausted. Use /goal status, /goal show, /goal pause, /goal resume, /goal clear.',
    ['/goal status', '/goal clear']
  ],
  [
    'After each turn, a judge model checks if the goal is done. Hermes keeps working until it is, you pause/clear it, or the budget is exhausted. Use /goal status, /goal show, /goal pause, /goal resume, /goal clear.',
    ['/goal resume']
  ],
  [
    'Tighten any field by re-setting the goal with inline lines (e.g. verify: <command>), then /goal resume. Use /goal show to review.',
    ['/goal resume', '/goal show']
  ],
  [
    "Couldn't draft a contract (aux model unavailable) — running as a free-form goal. The per-turn judge still applies.",
    []
  ],
  [
    "(ignored 'last goal': a control command never sets goal text — use /goal -- <text> when the goal really starts with a control word.)",
    ["'last goal'", '/goal --']
  ],
  // pause / resume / clear / unwait
  ['⏸ Goal paused: ship the feature', ['ship the feature']],
  ['▶ Goal resumed: ship the feature', ['ship the feature']],
  ['✓ Goal cleared.', []],
  ['No active goal.', []],
  ['No active goal. Set one with /goal <text>.', ['/goal']],
  ['No goal set.', []],
  ['No goal to resume.', []],
  ['▶ Wait barrier cleared — goal loop resumes.', []],
  ['No wait barrier set.', []],
  // status_line() / render_contract()
  ['⊙ Goal (active, 3/20 turns, contract): ship it', ['3', '20', 'ship it']],
  [
    '⏸ Goal (paused, 20/20 turns — turn budget exhausted (20/20)): ship it',
    ['20', 'turn budget exhausted (20/20)', 'ship it']
  ],
  ['⏸ Goal (paused, 2/20 turns): ship it', ['2', '20', 'ship it']],
  ['✓ Goal done (7/20 turns, 1 gate): ship it', ['7', '20', 'ship it']],
  ['(no completion contract — set one with /goal draft <objective> or inline field: value lines)', ['/goal draft']],
  ['(no active goal)', []],
  // the post-turn judge
  ['↻ Continuing toward goal (1/20): next step is tests', ['1', '20', 'next step is tests']],
  ['✓ Goal achieved: tests pass', ['tests pass']],
  ['⏸ Goal paused — 20/20 turns used. Use /goal resume to keep going, or /goal clear to stop.', ['20', '/goal resume']],
  [
    '⏸ Goal paused — 20/20 turns used (a quality gate is still failing). Use /goal resume to keep going, or /goal clear to stop.',
    ['20', '/goal clear']
  ],
  [
    '⏸ Goal paused — quality gates not run: workspace is not a git checkout. Fix the workspace or /goal gate remove the gates, then /goal resume.',
    ['workspace is not a git checkout', '/goal gate remove']
  ],
  [
    '⏸ Goal paused — quality gate still failing after 3 retries: $ npm test (exit 1). Fix it manually or /goal gate remove it, then /goal resume.',
    ['3', 'npm test', '1']
  ],
  [
    '⏸ Goal paused — judge API returned errors (3 turns). Check the goal_judge provider/key in ~/.hermes/config.yaml:',
    ['3', '~/.hermes/config.yaml:']
  ],
  [
    "⏸ Goal paused — the judge model (3 turns) isn't returning the required JSON verdict. Route the judge to a stricter model in ~/.hermes/config.yaml:",
    ['3', '~/.hermes/config.yaml:']
  ],
  ['Then /goal resume to continue.', ['/goal resume']],
  [
    '🚫 Goal judged unachievable — paused: the repo has no tests. Re-scope with /goal set, or override with /goal resume.',
    ['the repo has no tests', '/goal set']
  ],
  // /goal gate
  [
    '⚿ Gate added: $ npm test (3 retries, 600s timeout). It must pass before the goal can complete.',
    ['npm test', '3', '600']
  ],
  ['✓ Gate removed: $ npm test', ['npm test']],
  ['✓ Cleared 2 gates.', ['2']],
  ['(no quality gates — use /goal gate add <command> to require one)', ['/goal gate add']],
  ['- 1. $ npm test ✓ passing', ['1', 'npm test']],
  ['- 2. $ make lint ✗ failing (exit 2, attempt 1/3)', ['2', 'make lint', '1/3']],
  ['- 3. $ cargo check', ['3', 'cargo check']]
]

// English renderings that intentionally differ from the wire: the desktop says
// "process" where the backend says "pid", and labels the contract's last field
// "Stop when" like the goal card does.
const EN_DIVERGES = new Set([
  '⏳ Goal parked — waiting on pid 4242: build running',
  '⏳ Goal parked on pid 4242 (wait for the build). Loop pauses until it exits.',
  '- Stop when blocked: ask before deleting data'
])

// A gate row without a status carries no words to translate.
const LANGUAGE_NEUTRAL = new Set(['- 3. $ cargo check'])

describe('localizeGoalStatusText', () => {
  it.each(BACKEND_LINES)('renders %s in Chinese, keeping the glyph and its facts', (line, facts) => {
    const localized = localizeGoalStatusText(line, zh)
    const glyph = /^[⏳⊙⏸✓▶↻🚫⚿]/u.exec(line.trim())?.[0]

    if (!LANGUAGE_NEUTRAL.has(line)) {
      expect(localized).not.toBe(line.trim())
      expect(localized).toMatch(CJK)
    }

    if (glyph) {
      expect(localized.startsWith(glyph)).toBe(true)
    }

    for (const fact of facts) {
      expect(localized, fact).toContain(fact)
    }
  })

  it.each(BACKEND_LINES)('renders %s in English exactly as the backend wrote it', line => {
    if (!EN_DIVERGES.has(line)) {
      expect(localizeGoalStatusText(line, en)).toBe(line.trim())
    }
  })

  it('renders every line in every locale without dropping its facts', () => {
    for (const locale of LOCALES) {
      const t = resolveTranslations(locale)

      for (const [line, facts] of BACKEND_LINES) {
        const localized = localizeGoalStatusText(line, t)

        for (const fact of facts) {
          expect(localized, `${locale}: ${line} / ${fact}`).toContain(fact)
        }
      }
    }
  })

  it('composes the parked lines from the wait-target and meta copy', () => {
    const copy = zh.goalStatus

    const meta = [copy.meta.turns('3', '20'), copy.meta.subgoals(2), copy.meta.contract, copy.meta.gates(1)].join(
      copy.meta.separator
    )

    expect(localizeGoalStatusText('⏳ Goal parked on pid 4242. Loop pauses until it exits.', zh)).toBe(
      `⏳ ${copy.parkedOnPid('4242', null)}`
    )
    expect(
      localizeGoalStatusText(
        '⏳ Goal (parked on session abc123, 3/20 turns, 2 subgoals, contract, 1 gate): ship the feature',
        zh
      )
    ).toBe(`⏳ ${copy.parkedStatus(copy.waitTargets.session('abc123'), meta, 'ship the feature')}`)
    expect(localizeGoalStatusText('⏳ Goal (parked on waiting for CI, 3/20 turns): ship the feature', zh)).toBe(
      `⏳ ${copy.parkedStatus('waiting for CI', copy.meta.turns('3', '20'), 'ship the feature')}`
    )
  })

  it('keeps a paused reason with parentheses and the contract labels of the goal card', () => {
    const copy = zh.goalStatus

    expect(localizeGoalStatusText('⏸ Goal (paused, 20/20 turns — turn budget exhausted (20/20)): ship it', zh)).toBe(
      `⏸ ${copy.pausedStatus(copy.meta.turns('20', '20'), 'turn budget exhausted (20/20)', 'ship it')}`
    )
    expect(localizeGoalStatusText('- Stop when blocked: ask first', zh)).toBe(
      `- ${zh.statusStack.control.contractStopWhen}: ask first`
    )
  })

  it('renders gate list rows with their localized status', () => {
    const copy = zh.goalStatus

    expect(localizeGoalStatusText('- 1. $ npm test ✓ passing', zh)).toBe(
      copy.gateListItem('1', 'npm test', copy.gatePassing)
    )
    expect(localizeGoalStatusText('- 2. $ make lint ✗ failing (exit 2, attempt 1/3)', zh)).toBe(
      copy.gateListItem('2', 'make lint', copy.gateFailing('2', '1', '3'))
    )
    expect(localizeGoalStatusText('- 3. $ cargo check', zh)).toBe(copy.gateListItem('3', 'cargo check', ''))
  })

  it('keeps model prose and lines it does not own verbatim', () => {
    for (const line of [
      'Let me look at the file first.',
      'Context compression was exhausted. Retrying the active goal once.',
      '⊙ Goal (blocked, 3/20 turns): ship it'
    ]) {
      expect(localizeGoalStatusText(line, zh)).toBe(line)
    }
  })

  it('accepts the goal store detail, which carries no glyph', () => {
    const copy = zh.goalStatus

    expect(localizeGoalStatusText('Goal parked — waiting on pid 4242: build running', zh)).toBe(
      copy.parkedWaitingOn(copy.waitTargets.pid('4242'), 'build running', false)
    )
    expect(localizeGoalStatusText('Continuing toward goal (1/20): next step is tests', zh)).toBe(
      copy.continuing('1', '20', 'next step is tests')
    )
  })
})
