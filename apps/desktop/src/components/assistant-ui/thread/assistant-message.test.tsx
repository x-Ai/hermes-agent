// Bug #2: the Branch-in-new-chat button used to render unconditionally even
// when its handler was a no-op (session-tile.tsx passed `() => undefined`
// for branched/tiled chats, where nested branching isn't supported). That
// left a visibly clickable button that silently did nothing. The fix makes
// AssistantMessage's action bar hide the button entirely when no handler is
// supplied, matching how onDismissError/onRestoreToMessage already behave.
import { AssistantRuntimeProvider, type ThreadMessage, useExternalStoreRuntime } from '@assistant-ui/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'
import { $displayTimestamps } from '@/store/display-timestamps'

import { stubThreadEnvironment } from '../test-utils'

import { formatTimelineRange, formatTimelineTimestamp } from './timestamp'

import { Thread } from '.'

// Timeline timestamps render only when `display.timestamps` is enabled.
$displayTimestamps.set(true)

const createdAt = new Date('2026-05-01T00:00:00.000Z')
const completedAt = createdAt.getTime() / 1000 + 1.25
stubThreadEnvironment()

afterEach(() => {
  cleanup()
})

function userMessage(): ThreadMessage {
  return {
    id: 'user-1',
    role: 'user',
    content: [{ type: 'text', text: 'question one' }],
    attachments: [],
    createdAt,
    metadata: { custom: { timelineTimestamp: createdAt.getTime() / 1000 } }
  } as unknown as ThreadMessage
}

function assistantMessage(): ThreadMessage {
  return {
    id: 'assistant-1',
    role: 'assistant',
    content: [
      {
        type: 'reasoning',
        text: 'checked carefully',
        timestamp: createdAt.getTime() / 1000 + 0.05,
        completedAt: createdAt.getTime() / 1000 + 0.1
      },
      {
        type: 'text',
        text: 'done',
        timestamp: createdAt.getTime() / 1000 + 0.125,
        completedAt: createdAt.getTime() / 1000 + 0.5
      }
    ],
    status: { type: 'complete', reason: 'stop' },
    createdAt,
    metadata: {
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: { timelineCompletedAt: completedAt, timelineTimestamp: createdAt.getTime() / 1000 }
    }
  } as unknown as ThreadMessage
}

function Harness({
  assistant = assistantMessage(),
  locale = 'en',
  onBranchInNewChat
}: {
  assistant?: ThreadMessage
  locale?: string
  onBranchInNewChat?: (messageId: string) => void
}) {
  const runtime = useExternalStoreRuntime<ThreadMessage>({
    messages: [userMessage(), assistant],
    isRunning: false,
    onNew: async () => {}
  })

  return (
    <I18nProvider configClient={null} initialLocale={locale}>
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread onBranchInNewChat={onBranchInNewChat} />
      </AssistantRuntimeProvider>
    </I18nProvider>
  )
}

describe('AssistantMessage branch button visibility (bug #2 fix)', () => {
  it('shows the Branch in new chat button when a handler is provided (open chat)', async () => {
    render(<Harness onBranchInNewChat={() => undefined} />)

    expect(await screen.findByRole('button', { name: 'Branch in new chat' })).toBeTruthy()
  })

  it('hides the Branch in new chat button when no handler is provided (session-tile / branched chat)', async () => {
    render(<Harness />)

    // Wait for the assistant message to actually mount before asserting
    // absence, so a missing button isn't just a false negative from an
    // unrendered message.
    await screen.findByText('done')

    expect(screen.queryByRole('button', { name: 'Branch in new chat' })).toBeNull()
  })
})

describe('localized backend transcript copy', () => {
  const renderInterrupted = async (text: string, expected: string) => {
    const assistant = {
      ...assistantMessage(),
      content: [{ text, type: 'text' }]
    } as unknown as ThreadMessage

    render(<Harness assistant={assistant} locale="zh" />)

    expect(await screen.findByText(expected)).toBeTruthy()
    expect(screen.queryByText(text)).toBeNull()
  }

  it.each([
    ['generic', 'Operation interrupted.', '操作已中断'],
    [
      'waiting for the model',
      'Operation interrupted: waiting for model response (2.2s elapsed).',
      '操作已中断：正在等待模型响应（已等待 2.2 秒）'
    ],
    [
      'during an invalid-response retry',
      'Operation interrupted during retry (upstream provider timed out (Cloudflare 524, 12s), attempt 2/4).',
      '操作已中断：重试过程中（上游提供商超时（Cloudflare 524，12 秒），第 2/4 次尝试）'
    ],
    [
      'while handling an API error',
      'Operation interrupted: handling API error (TimeoutError: request timed out).',
      '操作已中断：正在处理 API 错误（TimeoutError：request timed out）'
    ],
    [
      'while retrying an API call',
      'Operation interrupted: retrying API call after error (retry 3/5).',
      '操作已中断：API 调用出错后正在重试（第 3/5 次）'
    ],
    [
      'while retrying an empty response',
      'Operation interrupted: retrying empty response from model (retry 1/2).',
      '操作已中断：正在重试模型的空响应（第 1/2 次）'
    ]
  ])('localizes the %s interruption sentinel', async (_label, text, expected) => {
    await renderInterrupted(text, expected)
  })

  it.each([
    ['upstream gateway timeout (504, 12s)', '上游网关超时（504，12 秒）'],
    ['rate limited by upstream provider (429)', '上游提供商限流（429）'],
    ['upstream server error (502, 12s)', '上游服务器错误（502，12 秒）'],
    ['upstream provider overloaded (529)', '上游提供商过载（529）'],
    ['upstream error (code 418, 12s)', '上游错误（代码 418，12 秒）'],
    ['fast response (1.2s) — likely rate limited', '响应较快（1.2 秒）——可能受到限流'],
    ['slow response (61s) — likely upstream timeout', '响应较慢（61 秒）——可能是上游超时'],
    ['response time 12.3s', '响应耗时 12.3 秒']
  ])('localizes the emitted retry reason “%s”', async (reason, localizedReason) => {
    await renderInterrupted(
      `Operation interrupted during retry (${reason}, attempt 2/4).`,
      `操作已中断：重试过程中（${localizedReason}，第 2/4 次尝试）`
    )
  })
})

describe('message timeline timestamps', () => {
  it('always renders precise user and assistant lifecycle times', async () => {
    const { container } = render(<Harness />)

    await screen.findByText('done')

    const stamps = Array.from(container.querySelectorAll('[data-slot="timeline-timestamp"]')).map(node =>
      node.textContent?.trim()
    )

    const startedAt = createdAt.getTime() / 1000

    expect(stamps).toContain(formatTimelineTimestamp(startedAt))
    expect(stamps).toContain(formatTimelineRange(startedAt, completedAt))
    expect(stamps).toContain(formatTimelineRange(startedAt + 0.05, startedAt + 0.1))
    expect(stamps).toContain(formatTimelineRange(startedAt + 0.125, startedAt + 0.5))
  })

  it('suppresses an aggregate assistant stamp that exactly duplicates its sole part', async () => {
    const startedAt = createdAt.getTime() / 1000

    const assistant = {
      ...assistantMessage(),
      content: [{ completedAt, text: 'done', timestamp: startedAt, type: 'text' }]
    } as unknown as ThreadMessage

    const { container } = render(<Harness assistant={assistant} />)

    await screen.findByText('done')

    const stamps = Array.from(container.querySelectorAll('[data-slot="timeline-timestamp"]')).map(node =>
      node.textContent?.trim()
    )

    expect(stamps.filter(stamp => stamp === formatTimelineRange(startedAt, completedAt))).toHaveLength(1)
  })
})
