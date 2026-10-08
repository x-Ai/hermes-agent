import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'
import { $goalsBySession, applyGoalStatusText, type SessionGoal } from '@/store/goals'

import { ComposerStatusStack } from './index'

// The stack measures itself into a surface var — jsdom has no ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub)

const SID = 'sess-goal-1'

const goal = (status: SessionGoal['status'], title = 'ship the feature', detail?: string): SessionGoal => ({
  detail,
  status,
  title,
  updatedAt: Date.now()
})

function renderStack(sessionId: null | string = SID, locale: 'en' | 'zh' = 'en') {
  return render(
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale={locale}>
        <ComposerStatusStack queue={null} sessionId={sessionId} />
      </I18nProvider>
    </MemoryRouter>
  )
}

describe('ComposerStatusStack goal indicator', () => {
  beforeEach(() => {
    $goalsBySession.set({})
  })

  afterEach(() => {
    cleanup()
    $goalsBySession.set({})
  })

  it('shows an active goal with its title', () => {
    $goalsBySession.set({ [SID]: goal('active') })

    renderStack()

    expect(screen.getByText('Goal active')).toBeTruthy()
    expect(screen.queryByText('ship the feature')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Goal (active|paused)/ }))
    expect(screen.getByText('ship the feature')).toBeTruthy()
  })

  it('labels a paused goal as paused', () => {
    $goalsBySession.set({ [SID]: goal('paused') })

    renderStack()

    expect(screen.getByText('Goal paused')).toBeTruthy()
    expect(screen.queryByText('ship the feature')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Goal (active|paused)/ }))
    expect(screen.getByText('ship the feature')).toBeTruthy()
  })

  it('speaks the UI language for a parked goal that only the backend has described', () => {
    // The judge parked the loop before any line named the goal: the store holds
    // the backend's English detail and no title (store/goals.ts).
    $goalsBySession.set({ [SID]: goal('waiting', '', 'Goal parked — waiting on session abc123: deploy finished') })

    renderStack(SID, 'zh')

    const zh = TRANSLATIONS.zh

    expect(screen.getByText(zh.statusStack.goalWaiting)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(zh.statusStack.goalWaiting) }))
    expect(screen.getByText(zh.goalStatus.standingGoal)).toBeTruthy()
    expect(
      screen.getByText(
        zh.goalStatus.parkedWaitingOn(zh.goalStatus.waitTargets.session('abc123'), 'deploy finished', false)
      )
    ).toBeTruthy()
    expect(screen.queryByText(/Goal parked/)).toBeNull()
  })

  it('flips to paused when the judge declares the goal unachievable', () => {
    $goalsBySession.set({ [SID]: goal('active') })
    applyGoalStatusText(
      SID,
      '🚫 Goal judged unachievable — paused: the repo has no tests. Re-scope with /goal set, or override with /goal resume.'
    )

    renderStack(SID, 'zh')

    const zh = TRANSLATIONS.zh

    expect(screen.getByText(zh.statusStack.goalPaused)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(zh.statusStack.goalPaused) }))
    expect(screen.getByText('ship the feature')).toBeTruthy()
    expect(screen.getByText(zh.goalStatus.unachievable('the repo has no tests.'))).toBeTruthy()
  })

  it('scopes the indicator to the goal-owning session', () => {
    $goalsBySession.set({ 'other-session': goal('active') })

    const view = renderStack()

    expect(view.container.firstChild).toBeNull()
  })
})
