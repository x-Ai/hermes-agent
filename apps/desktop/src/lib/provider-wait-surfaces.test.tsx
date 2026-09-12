import { useStore } from '@nanostores/react'
import { act, cleanup, fireEvent, render, within } from '@testing-library/react'
import { type ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SubagentRow } from '@/app/agents'
import { SubagentSection } from '@/app/chat/composer/status-stack/subagent-section'
import { type MessageStreamHarness, renderMessageStream } from '@/app/session/hooks/use-message-stream/test-harness'
import { BackgroundResumeNotice } from '@/components/assistant-ui/thread/status'
import { DelegateTool } from '@/components/assistant-ui/tool/delegate'
import { I18nProvider, useI18n } from '@/i18n'
import { $backgroundResume } from '@/store/background-delegation'
import { $activeSessionId, $busy } from '@/store/session'
import { $subagentsBySession } from '@/store/subagents'
import type { RpcEvent } from '@/types/hermes'

vi.mock('@/lib/use-enter-animation', () => ({ useEnterAnimation: () => undefined }))

const SID = 'provider-wait-parent'
const CHILD = 'provider-wait-child'
const GOAL = 'Inspect provider retry behavior'

function StreamRow() {
  const node = useStore($subagentsBySession)[SID]?.[0]

  return node ? <SubagentRow node={{ ...node, children: [] }} nowMs={node.updatedAt} /> : null
}

interface Surface {
  name: string
  Component: ComponentType
  collapsed?: boolean
}

const SURFACES: Surface[] = [
  {
    name: 'delegation tool card',
    Component: () => <DelegateTool args={{ goal: GOAL }} toolCallId="delegation-call" />
  },
  { name: 'agent activity row', Component: StreamRow },
  { name: 'composer subagents', Component: () => <SubagentSection sessionId={SID} />, collapsed: true },
  { name: 'background resume notice', Component: BackgroundResumeNotice }
]

function LanguageControls() {
  const { setLocale } = useI18n()

  return (
    <>
      <button onClick={() => void setLocale('en')} type="button">
        English
      </button>
      <button onClick={() => void setLocale('zh')} type="button">
        中文
      </button>
    </>
  )
}

function renderSurface({ Component, collapsed }: Surface) {
  const view = render(
    <I18nProvider configClient={null} initialLocale="zh">
      <LanguageControls />
      <section aria-label="activity surface">
        <Component />
      </section>
    </I18nProvider>
  )

  const region = within(view.getByRole('region', { name: 'activity surface' }))

  if (collapsed) {
    fireEvent.click(region.getByRole('button'))
  }

  return { ...view, region }
}

describe('delegated provider notices from gateway events', () => {
  let stream: MessageStreamHarness

  function emit(type: RpcEvent['type'], text?: string) {
    act(() =>
      stream.handleEvent({
        type,
        session_id: SID,
        payload: { subagent_id: CHILD, goal: GOAL, text }
      })
    )
  }

  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      }
    )
    $activeSessionId.set(SID)
    $busy.set(false)
    $subagentsBySession.set({})
    stream = renderMessageStream(SID)
    emit('subagent.start')
  })

  afterEach(() => {
    cleanup()
    $activeSessionId.set(null)
    $busy.set(false)
    $subagentsBySession.set({})
    vi.unstubAllGlobals()
  })

  it.each(SURFACES)('retranslates live retry parameters in $name without changing gateway state', async surface => {
    const view = renderSurface(surface)
    const rawHistory: string[] = []

    for (const prefix of ['⏳ ', '']) {
      for (const [seconds, attempt] of [
        [3, 1],
        [41, 5]
      ]) {
        const raw = `${prefix}waiting on provider — retrying in ${seconds}s (attempt ${attempt}/6)`
        const chinese = `正在等待服务商，${seconds} 秒后重试（第 ${attempt}/6 次）`
        const english = `Waiting for the provider — retrying in ${seconds}s (attempt ${attempt}/6)`
        rawHistory.push(raw)
        emit('subagent.thinking', raw)

        expect(view.region.getAllByText(chinese).length).toBeGreaterThan(0)
        expect(view.region.queryAllByText(raw)).toHaveLength(0)

        await act(async () => fireEvent.click(view.getByRole('button', { name: 'English' })))

        expect(view.region.getAllByText(english).length).toBeGreaterThan(0)
        expect(view.region.queryAllByText(chinese)).toHaveLength(0)

        await act(async () => fireEvent.click(view.getByRole('button', { name: '中文' })))

        expect(view.region.getAllByText(chinese).length).toBeGreaterThan(0)
        expect($subagentsBySession.get()[SID][0].stream.map(entry => entry.text)).toEqual(rawHistory)
        expect($backgroundResume.get()?.activity).toBe(raw)
      }
    }
  })

  it.each(SURFACES)('preserves unknown activity verbatim in $name across locale changes', async surface => {
    const raw = 'Inspecting retry policy in gateway source'
    emit('subagent.thinking', raw)
    const view = renderSurface(surface)

    expect(view.region.getByText(raw)).toBeTruthy()

    await act(async () => fireEvent.click(view.getByRole('button', { name: 'English' })))

    expect(view.region.getByText(raw)).toBeTruthy()
    expect($subagentsBySession.get()[SID][0].stream.at(-1)?.text).toBe(raw)
    expect($backgroundResume.get()?.activity).toBe(raw)
  })
})
