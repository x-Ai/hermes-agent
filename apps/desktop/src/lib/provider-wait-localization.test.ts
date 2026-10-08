import { describe, expect, it } from 'vitest'

import {
  type Locale,
  type ProviderRetryReason,
  type ProviderWaitPhase,
  resolveTranslations,
  TRANSLATIONS
} from '@/i18n'

import { isProviderWaitNotice, localizeProviderWaitText } from './provider-wait-localization'

// ── agent/chat_completion_wait_notice.py, mirrored as its format strings ──
// (`_PHASE_TEXT` + `wait_notice_text`), so every fixture below is composed the
// way the backend composes it rather than hand-typed prose.
const PHASE_TEXT: Record<ProviderWaitPhase, string> = {
  first_event: '{n}s waiting for the first provider event',
  reconnect: '{n}s waiting for the first provider event after reconnect',
  pre_progress: 'provider stream open; {n}s without substantive model progress',
  post_event: 'provider stream active; {n}s without stream events',
  first_chunk: '{n}s waiting for the first stream chunk',
  post_chunk: 'stream open; {n}s without stream output'
}

const NEAR_DEADLINE_SECS = 15

type Watchdog = [label: string, remaining: number] | null

function waitNoticeText(model: string, silenceSecs: number, phase: ProviderWaitPhase, watchdog: Watchdog): string {
  const nearDeadline = watchdog !== null && watchdog[1] <= NEAR_DEADLINE_SECS
  const lead = nearDeadline ? 'still waiting on' : 'waiting on'
  let text = `⏳ ${lead} ${model} — ${PHASE_TEXT[phase].replace('{n}', String(Math.trunc(silenceSecs)))}`

  if (watchdog !== null) {
    text += ` (auto-reconnect: ${watchdog[0]} watchdog in ${Math.max(0, Math.trunc(watchdog[1]))}s)`
  }

  return text
}

const PHASES = Object.keys(PHASE_TEXT) as ProviderWaitPhase[]
// Labels the backend hands wait_notice_text (codex_watchdog_deadline / the
// stream monitor): far from and inside the near-deadline window.
const WATCHDOGS: Watchdog[] = [null, ['stream stale', 240.4], ['TTFB', 9.6]]
const LOCALES = Object.keys(TRANSLATIONS) as Locale[]

describe('current wait notices', () => {
  it.each(PHASES.flatMap(phase => WATCHDOGS.map(watchdog => ({ phase, watchdog }))))(
    'renders $phase with watchdog $watchdog from the phase copy and keeps the numbers',
    ({ phase, watchdog }) => {
      const raw = waitNoticeText('gpt-5.5-codex', 61.9, phase, watchdog)
      const still = watchdog !== null && watchdog[1] <= NEAR_DEADLINE_SECS

      expect(isProviderWaitNotice(raw)).toBe(true)

      for (const locale of LOCALES) {
        const copy = resolveTranslations(locale).assistant.thread

        const expected = copy.providerWaitNotice(
          'gpt-5.5-codex',
          copy.providerWaitPhases[phase]('61'),
          watchdog ? { label: watchdog[0], seconds: String(Math.trunc(watchdog[1])) } : null,
          still
        )

        expect(localizeProviderWaitText(raw, copy)).toBe(expected)
        expect(expected).toContain('gpt-5.5-codex')
        expect(expected).toContain('61')

        if (watchdog) {
          expect(expected).toContain(watchdog[0])
          expect(expected).toContain(String(Math.trunc(watchdog[1])))
        }
      }
    }
  )

  it('translates the notice for every locale that overrides the thread copy', () => {
    const raw = waitNoticeText('claude-fable-5-1', 90, 'first_chunk', ['stream stale', 500])

    for (const locale of LOCALES) {
      const copy = resolveTranslations(locale).assistant.thread
      const localized = localizeProviderWaitText(raw, copy)

      if (copy.providerWaitNotice !== TRANSLATIONS.en.assistant.thread.providerWaitNotice) {
        expect(localized).not.toBe(localizeProviderWaitText(raw, TRANSLATIONS.en.assistant.thread))
      }

      expect(localized).not.toBe(raw)
    }
  })

  it('still-waiting leads and far watchdogs render distinct copy', () => {
    const copy = TRANSLATIONS.zh.assistant.thread
    const near = localizeProviderWaitText(waitNoticeText('m', 100, 'post_event', ['stream idle', 5]), copy)
    const far = localizeProviderWaitText(waitNoticeText('m', 100, 'post_event', ['stream idle', 200]), copy)

    expect(near).not.toBe(far)
  })
})

describe('other core status rewrites', () => {
  it.each(['output', 'response'] as const)('localizes the %s reconnect frame', kind => {
    // chat_completion_helpers.py / chat_completion_nonstream.py
    const raw =
      kind === 'output'
        ? '⚠ no output from provider for 45s — reconnecting...'
        : '⚠ no response from provider in 45s — reconnecting...'

    const copy = TRANSLATIONS.zh.assistant.thread

    expect(isProviderWaitNotice(raw)).toBe(true)
    expect(localizeProviderWaitText(raw, copy)).toBe(copy.providerReconnecting('45', kind))
  })

  it('localizes the retry countdown and the continue nudge', () => {
    const copy = TRANSLATIONS.zh.assistant.thread

    // turn_recovery.py
    const retry = '⏳ waiting on provider — retrying in 30s (attempt 2/5)'
    expect(localizeProviderWaitText(retry, copy)).toBe(copy.providerRetrying('30', '2', '5'))

    // turn_truncation.py
    const nudge = '↻ model returned reasoning with no final answer — asking it to continue (1/3)'
    expect(localizeProviderWaitText(nudge, copy)).toBe(copy.modelContinuing('1', '3'))
  })
})

describe('unknown text', () => {
  it('keeps model prose and unrecognised frames verbatim', () => {
    const copy = TRANSLATIONS.zh.assistant.thread

    expect(localizeProviderWaitText('Let me look at the file first.', copy)).toBe('Let me look at the file first.')
    expect(isProviderWaitNotice('Let me look at the file first.')).toBe(false)

    // A wait frame with phase text this build does not know stays a wait
    // frame (ephemeral in watch windows) and is shown as written.
    const future = '⏳ waiting on some-model — 30s doing something new'
    expect(isProviderWaitNotice(future)).toBe(true)
    expect(localizeProviderWaitText(future, copy)).toBe(future)
  })
})

describe('retry countdowns and the auto-recovery ladder', () => {
  // agent/turn_recovery.py::compute_error_backoff — the `_live_reason` leads of
  // its countdown; "waiting on provider" is covered above.
  const RETRY_LEADS: Record<ProviderRetryReason, string> = {
    rate_limited: 'rate limited',
    overloaded: 'provider overloaded',
    free_model_busy: 'the free model is busy'
  }

  it.each(Object.entries(RETRY_LEADS) as [ProviderRetryReason, string][])(
    'localizes the %s countdown with and without a reset window',
    (reason, lead) => {
      const withReset = `⏳ ${lead} — resets in ~13m, retrying in 30s (attempt 2/5)`
      const bare = `⏳ ${lead} — retrying in 6s (attempt 1/3)`

      expect(isProviderWaitNotice(withReset)).toBe(true)
      expect(isProviderWaitNotice(bare)).toBe(true)

      for (const locale of LOCALES) {
        const copy = resolveTranslations(locale).assistant.thread
        const reasonText = copy.providerRetryReasons[reason]
        const localizedReset = localizeProviderWaitText(withReset, copy)

        expect(localizedReset).toBe(copy.providerRetryingAfter(reasonText, '~13m', '30', '2', '5'))
        expect(localizedReset).toContain('~13m')
        expect(localizedReset).toContain('30')
        expect(localizedReset).toContain('2/5')
        expect(localizeProviderWaitText(bare, copy)).toBe(copy.providerRetryingAfter(reasonText, null, '6', '1', '3'))
      }
    }
  )

  // agent/turn_recovery_autorecover.py::ladder_notice with each `_STOP_HINTS` entry.
  it.each([
    ['press Esc to stop', 'esc'],
    ['cancel the request to stop', 'cancelRequest'],
    ['send /stop to cancel', 'stopCommand']
  ] as const)('localizes the ladder notice ending in "%s"', (hint, key) => {
    const raw = `⏳ Provider temporarily unavailable — retrying automatically in 18s (cycle 1/5); ${hint}`

    expect(isProviderWaitNotice(raw)).toBe(true)

    for (const locale of LOCALES) {
      const copy = resolveTranslations(locale).assistant.thread
      const localized = localizeProviderWaitText(raw, copy)

      expect(localized).toBe(copy.providerAutoRecovering('18', '1', '5', copy.providerStopHints[key]))
      expect(localized).toContain(copy.providerStopHints[key])
      expect(localized).toContain('18')
      expect(localized).toContain('1/5')
    }
  })

  it('keeps an unknown stop hint verbatim and renders the hintless cron form', () => {
    const copy = TRANSLATIONS.zh.assistant.thread
    const unknown = '⏳ Provider temporarily unavailable — retrying automatically in 18s (cycle 1/5); tap Stop'
    const cron = '⏳ Provider temporarily unavailable — retrying automatically in 60s (cycle 3/5)'

    expect(localizeProviderWaitText(unknown, copy)).toBe(copy.providerAutoRecovering('18', '1', '5', 'tap Stop'))
    expect(localizeProviderWaitText(cron, copy)).toBe(copy.providerAutoRecovering('60', '3', '5', null))
  })

  it('renders these frames in the locale rather than the backend English', () => {
    const frames = [
      '⏳ rate limited — resets in ~2m, retrying in 30s (attempt 2/3)',
      '⏳ the free model is busy — retrying in 6s (attempt 1/3)',
      '⏳ Provider temporarily unavailable — retrying automatically in 18s (cycle 1/5); press Esc to stop'
    ]

    for (const locale of LOCALES) {
      const copy = resolveTranslations(locale).assistant.thread

      if (copy.providerRetryingAfter === TRANSLATIONS.en.assistant.thread.providerRetryingAfter) {
        continue
      }

      for (const frame of frames) {
        expect(localizeProviderWaitText(frame, copy)).not.toBe(
          localizeProviderWaitText(frame, TRANSLATIONS.en.assistant.thread)
        )
      }
    }
  })
})
