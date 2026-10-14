import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import { translateBots } from './i18n-test-helper'

// A room log is the members' stored rows, so the agent's English placeholder for a turn stopped
// while the model was still silent reaches the room verbatim. The room hands member rows to the
// thread's own localizer (the SDK export) and leaves the user's lines alone.
vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock, createGroupGateway } = await import('./group-test-utils')
  const { localizeAssistantTranscriptText } = await import('@/components/assistant-ui/thread/transcript-localization')
  const { TRANSLATIONS } = await import('@/i18n')
  const base = await pluginSdkMock(createGroupGateway().host)

  const Button = ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  )

  return {
    ...base,
    Button,
    RowButton: Button,
    cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
    Codicon: () => null,
    CopyButton: () => null,
    ConfirmDialog: () => null,
    Dialog: () => null,
    DialogContent: () => null,
    DialogDescription: () => null,
    DialogFooter: () => null,
    DialogHeader: () => null,
    DialogTitle: () => null,
    Input: () => null,
    localizeAssistantTranscriptText,
    MessageTextContent: ({ text }: { text: string }) => <span data-testid="message-text-content">{text}</span>,
    ToggleRow: () => null,
    Tip: ({ children }: { children: ReactNode }) => children,
    relativeTime: () => 'now',
    useI18n: () => ({ locale: 'zh', t: TRANSLATIONS.zh }),
    usePluginI18n: () => translateBots
  }
})
vi.mock('./avatar', () => ({ avatarColor: () => '#888', botAppearance: () => ({}), BotFace: () => null }))
vi.mock('./group-chat-parts', () => ({
  GroupClarifyCard: () => null,
  GroupImageControls: () => null,
  GroupMentionInput: () => null
}))
afterEach(cleanup)

const INTERRUPTED = 'Operation interrupted: waiting for model response (513.2s elapsed).'

it("renders a member's interrupted-turn placeholder in the UI language and the user's own line verbatim", async () => {
  Element.prototype.scrollIntoView = vi.fn()
  const { $groupChats } = await import('./group-chat')
  const { GroupChatWorkspace } = await import('./group-chat-view')

  const log = [
    { id: 'u1', thread: 'a', from: { kind: 'user' as const, name: 'You' }, text: INTERRUPTED, at: 1 },
    { id: 'm1', thread: 'a', from: { kind: 'member' as const, name: 'builder' }, text: INTERRUPTED, at: 2 }
  ]

  $groupChats.set({ Room: { log, watermarks: {}, sessions: {} } })
  const { getAllByTestId } = render(<GroupChatWorkspace group="Room" members={[{ name: 'builder' }] as never} />)

  expect(getAllByTestId('message-text-content').map(el => el.textContent)).toEqual([
    INTERRUPTED,
    '操作已中断：正在等待模型响应（已等待 513.2 秒）'
  ])
})
