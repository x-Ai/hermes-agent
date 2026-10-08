import { useStore } from '@nanostores/react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { createSessionRpcDispatcher } from '@/app/contrib/session-rpc-dispatcher'
import { sessionRoute } from '@/app/routes'
import { textPart } from '@/lib/chat-messages'
import { requestGatewayForAgent } from '@/store/gateway'
import { $notifications, clearNotifications } from '@/store/notifications'
import {
  $activeSessionId,
  $selectedStoredSessionId,
  setActiveSessionId,
  setAwaitingResponse,
  setBusy,
  setMessages,
  setSelectedStoredSessionId,
  setSessions
} from '@/store/session'
import { clearAllSessionStates } from '@/store/session-states'
import type { SessionInfo } from '@/types/hermes'

import { useSessionStateCache } from '../use-session-state-cache'

import { clearSingleFlightSessionResumeState } from './single-flight-resume'

import { usePromptActions } from '.'

// Real prompt hooks, cache and dispatcher; only the gateway edge is substituted.
vi.mock('@/store/gateway', async original => ({
  ...(await original<Record<string, unknown>>()),
  requestGatewayForAgent: vi.fn(),
  requestGatewayForProfile: vi.fn(),
  retainGatewayForSessionTurn: vi.fn(async () => () => undefined)
}))

const busyRef = { current: false }
let handle: { actions: ReturnType<typeof usePromptActions>; cache: ReturnType<typeof useSessionStateCache> }

function Harness() {
  const activeSessionId = useStore($activeSessionId)
  const selectedStoredSessionId = useStore($selectedStoredSessionId)

  const cache = useSessionStateCache({
    activeSessionId,
    selectedStoredSessionId,
    busyRef,
    setAwaitingResponse,
    setBusy,
    setMessages
  })

  const requestGateway = createSessionRpcDispatcher({
    ...cache,
    ambientRequest: async () => {
      throw new Error('unexpected ambient request')
    }
  })

  const actions = usePromptActions({
    activeSessionId,
    ...cache,
    busyRef,
    branchCurrentSession: async () => false,
    createBackendSessionForSend: async () => {
      throw new Error('unexpected create')
    },
    getRoutedStoredSessionId: () => 'stored-B',
    getRouteToken: () => `${sessionRoute('stored-B')}::`,
    handleSkinCommand: () => '',
    openMemoryGraph: () => undefined,
    refreshSessions: async () => undefined,
    requestGateway,
    resumeStoredSession: async () => {
      throw new Error('unexpected foreground resume')
    },
    startFreshSessionDraft: () => undefined,
    sttEnabled: false
  })

  handle = { actions, cache }

  return null
}

function seed() {
  busyRef.current = false
  setSessions([
    { id: 'stored-B', connection_id: 'connection-B', profile: 'default', source: 'desktop', message_count: 1 }
  ] as SessionInfo[])
  setSelectedStoredSessionId('stored-B')
  setActiveSessionId('rt-B')
  render(<Harness />)
  act(() => {
    handle.cache.updateSessionState(
      'rt-B',
      state => ({ ...state, messages: [{ id: 'history-B', role: 'assistant', parts: [textPart('history B')] }] }),
      'stored-B'
    )
  })
}

const transcriptText = () =>
  (handle.cache.sessionStateByRuntimeIdRef.current.get('rt-B')?.messages ?? [])
    .flatMap(message => message.parts.map(part => ('text' in part ? part.text : '')))
    .join('\n')

afterEach(() => {
  cleanup()
  clearAllSessionStates()
  clearSingleFlightSessionResumeState()
  clearNotifications()
  setActiveSessionId(null)
  setSelectedStoredSessionId(null)
  setSessions([])
  setBusy(false)
  setAwaitingResponse(false)
  setMessages([])
  vi.clearAllMocks()
})

// methods_session answers a /compress that met another compressor's lock with
// `lock_held` + the backend's sentence instead of a summary. The handler used
// to fall through to the no-op success line "nothing to compress".
it('reports a held compression lock as a warning with the backend sentence', async () => {
  const lockMessage =
    '⏳ Compression already in progress for this session (holder: pid=12345). Please wait for it to finish.'

  vi.mocked(requestGatewayForAgent).mockImplementation(async (_connection, _profile, method) =>
    method === 'session.compress' ? { compressed: false, lock_held: true, message: lockMessage } : {}
  )
  seed()

  await act(async () => {
    await handle.actions.submitText('/compress')
  })

  // The dedicated RPC ran on this session (the slash metric call precedes it).
  expect(
    vi
      .mocked(requestGatewayForAgent)
      .mock.calls.some(
        call => call[2] === 'session.compress' && (call[3] as { session_id?: string }).session_id === 'rt-B'
      )
  ).toBe(true)

  const transcript = transcriptText()

  expect(transcript).toContain(lockMessage)
  expect(transcript).not.toContain('nothing to compress')

  const notice = $notifications.get().find(entry => entry.id === 'session-compress:rt-B')

  expect(notice?.kind).toBe('warning')
  expect(notice?.message).toBe(lockMessage)
})
