import { JsonRpcGatewayError } from '@hermes/shared'
import { beforeEach, expect, test, vi } from 'vitest'

import { setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'
import { en } from '@/i18n/en'

import { $notifications, clearNotifications, isDiskFullErrorMessage, notifyError } from './notifications'
import { $backendRestartRequest, $routeRequest } from './recovery-requests'

beforeEach(() => {
  clearNotifications()
  setRuntimeI18nLocale('en')
})

function lastMessage(): string {
  return $notifications.get()[0]?.message ?? ''
}

// Regression for #39365: a gateway auth 401 (bad API_SERVER_KEY) must not be
// summarized as a provider (OpenAI/OpenRouter) API key problem. The toast says
// "sign in again" in plain words and opens Gateways — no env-var names.
test('gateway_auth_failed error is summarized as sign-in, with an Open Gateways action', () => {
  notifyError(
    new Error(
      '401 {"error": {"message": "Invalid gateway API key (API_SERVER_KEY)", "type": "gateway_auth_error", "code": "gateway_auth_failed"}}'
    ),
    'Request failed'
  )

  expect(lastMessage()).not.toMatch(/API_SERVER_KEY|OpenAI|authentication failed/i)

  const action = $notifications.get()[0]?.action
  expect(action?.label).toBe(en.notifications.actions.openGateways)
  action?.onClick()
  expect($routeRequest.get()?.path).toBe('/settings?tab=gateway')
})

// Regression for the lost fix 03ea411994: the backend's provider-setup error
// reaches many surfaces through notifyError (session creation, model loading,
// settings), not just the gateway 'error' event; every toast shows the same
// localized credential copy and keeps the raw text as the detail line.
test.each([
  "No inference provider configured. Run 'hermes model' to set one up.",
  '503 {"detail": {"message": "no provider configured", "code": "no_provider_configured"}}'
])('provider-setup error %s toasts the credential-required copy in the active locale', raw => {
  setRuntimeI18nLocale('zh')
  notifyError(new Error(raw), 'Could not create session')

  expect(lastMessage()).toBe(TRANSLATIONS.zh.desktop.providerCredentialRequired)
  expect(lastMessage()).not.toBe(en.desktop.providerCredentialRequired)
  expect($notifications.get()[0]?.detail).toContain(raw.includes('503') ? 'no provider configured' : 'hermes model')
})

test('provider invalid_api_key error maps to the OpenAI summary and deep-links to Keys', () => {
  notifyError(
    new Error('401 {"error": {"message": "Incorrect API key provided", "code": "invalid_api_key"}}'),
    'Request failed'
  )

  expect(lastMessage()).not.toMatch(/401|invalid_api_key/)
  $notifications.get()[0]?.action?.onClick()
  expect($routeRequest.get()?.path).toBe('/settings?tab=keys&key=OPENAI_API_KEY')
})

test('ELEVENLABS_API_KEY not set toasts plain copy with an Open Keys action for that key', () => {
  notifyError(new Error('ELEVENLABS_API_KEY not set'), 'Voice failed')

  expect(lastMessage()).not.toMatch(/ELEVENLABS_API_KEY|STT/)
  $notifications.get()[0]?.action?.onClick()
  expect($routeRequest.get()?.path).toBe('/settings?tab=keys&key=ELEVENLABS_API_KEY')
})

test('structured storage_* error codes route to Maintenance', () => {
  notifyError(new Error('500 {"detail":{"message":"database is locked","code":"storage_locked"}}'), 'Prompt failed')

  $notifications.get()[0]?.action?.onClick()
  expect($routeRequest.get()?.path).toBe('/command-center?section=maintenance')
})

test('405 method-not-allowed toasts a restart in plain words with a Restart Hermes action', () => {
  const before = $backendRestartRequest.get()
  notifyError(new Error('405 Method Not Allowed'), 'Request failed')

  expect(lastMessage()).not.toMatch(/405|Method Not Allowed|backend/i)
  expect($notifications.get()[0]?.action?.label).toBe(en.notifications.actions.restartHermes)
  $notifications.get()[0]?.action?.onClick()
  expect($backendRestartRequest.get()).toBe(before + 1)
})

test('disk-full / ENOSPC phrasings are classified as disk-full, other storage failures are not', () => {
  expect(isDiskFullErrorMessage('OSError: [Errno 28] No space left on device')).toBe(true)
  expect(isDiskFullErrorMessage('sqlite3.OperationalError: database or disk is full')).toBe(true)
  expect(isDiskFullErrorMessage('disk full: session storage could not be written — free some disk space')).toBe(true)
  expect(isDiskFullErrorMessage('This is often a full disk — free some space')).toBe(true)
  expect(isDiskFullErrorMessage('session storage could not be written: permission denied')).toBe(false)
  expect(isDiskFullErrorMessage('network timeout')).toBe(false)
})

test('preview URL errors use localized copy without repeating raw details', () => {
  setRuntimeI18nLocale('zh')
  notifyError(new Error('Invalid preview URL'), TRANSLATIONS.zh.rightSidebar.previewUnavailable)

  expect($notifications.get()[0]).toMatchObject({
    title: TRANSLATIONS.zh.rightSidebar.previewUnavailable,
    message: TRANSLATIONS.zh.notifications.errors.invalidPreviewUrl,
    detail: undefined
  })
})

// The custom-endpoint save route refuses an id that names a built-in provider
// with an English `detail`; the toast re-renders it in the display language
// with the id and the suggested replacement instead of showing the raw line.
test('a built-in provider id refusal from the custom endpoint route is localized with both ids', () => {
  const detail = "'gmi' is a built-in provider id; choose another id for this endpoint (for example 'gmi-relay')"
  const error = new Error(`Error invoking remote method 'hermes:api': Error: 422: {"detail":"${detail}"}`)

  setRuntimeI18nLocale('zh')
  notifyError(error, TRANSLATIONS.zh.settings.customEndpoints.saveFailed)

  expect($notifications.get()[0]).toMatchObject({
    title: TRANSLATIONS.zh.settings.customEndpoints.saveFailed,
    message: TRANSLATIONS.zh.runtimeErrors.builtinProviderId('gmi', 'gmi-relay'),
    detail: undefined
  })
  expect(lastMessage()).toContain('gmi-relay')
  expect(lastMessage()).not.toContain('built-in provider id')

  clearNotifications()
  setRuntimeI18nLocale('en')
  notifyError(error, en.settings.customEndpoints.saveFailed)

  expect($notifications.get()[0]).toMatchObject({ message: detail, detail: undefined })
})

// A profile that shares providers reads its custom endpoints through from the
// default profile; the route refuses to edit one of those with an English
// `detail` naming the endpoint. The toast re-renders it in the display language.
test('a shared-endpoint refusal from the custom endpoint route is localized with the endpoint id', () => {
  const detail =
    "'magpie' is shared from the default profile; edit it there, or stop sharing providers in this profile first"

  const error = new Error(`Error invoking remote method 'hermes:api': Error: 422: {"detail":"${detail}"}`)

  setRuntimeI18nLocale('zh')
  notifyError(error, TRANSLATIONS.zh.settings.customEndpoints.saveFailed)

  expect($notifications.get()[0]).toMatchObject({
    title: TRANSLATIONS.zh.settings.customEndpoints.saveFailed,
    message: TRANSLATIONS.zh.runtimeErrors.sharedProviderEndpoint('magpie'),
    detail: undefined
  })
  expect(lastMessage()).toContain('magpie')
  expect(lastMessage()).not.toContain('shared from the default profile')

  clearNotifications()
  setRuntimeI18nLocale('en')
  notifyError(error, en.settings.customEndpoints.saveFailed)

  expect($notifications.get()[0]).toMatchObject({ message: detail, detail: undefined })
})

test('the delete refusal naming the sharing profiles pinned to an endpoint is localized with both', () => {
  const detail =
    "'magpie' is the model provider of sharing profile(s) auditor, qa; repoint them (or stop sharing providers there) before deleting it"

  const error = new Error(`Error invoking remote method 'hermes:api': Error: 422: {"detail":"${detail}"}`)

  setRuntimeI18nLocale('zh')
  notifyError(error, TRANSLATIONS.zh.settings.customEndpoints.deleteFailed)

  expect($notifications.get()[0]).toMatchObject({
    title: TRANSLATIONS.zh.settings.customEndpoints.deleteFailed,
    message: TRANSLATIONS.zh.runtimeErrors.sharedEndpointPinned('magpie', 'auditor, qa'),
    detail: undefined
  })
  expect(lastMessage()).toContain('auditor, qa')
  expect(lastMessage()).not.toContain('sharing profile(s)')
  clearNotifications()
  setRuntimeI18nLocale('en')
})

test('a borrowed sign-in refusal from the OAuth disconnect route is localized with the provider id', () => {
  const detail =
    "'openai-codex' is signed in from the default profile; sign out there, or sign in on this profile first"

  const error = new Error(`Error invoking remote method 'hermes:api': Error: 422: {"detail":"${detail}"}`)

  setRuntimeI18nLocale('zh')
  notifyError(error, TRANSLATIONS.zh.settings.providers.failedRemove('OpenAI Codex'))

  expect($notifications.get()[0]).toMatchObject({
    message: TRANSLATIONS.zh.runtimeErrors.sharedProviderAccount('openai-codex'),
    detail: undefined
  })
  expect(lastMessage()).not.toContain('signed in from the default profile')
  clearNotifications()
  setRuntimeI18nLocale('en')
})

test('notifyError posts the full error to desktop.log, not the summary', () => {
  const logLine = vi.fn()

  const previous = (window as unknown as { hermesDesktop?: unknown }).hermesDesktop

  ;(window as unknown as { hermesDesktop: { logLine: typeof logLine } }).hermesDesktop = { logLine }

  try {
    const error = new Error('sqlite3.OperationalError: database is locked')
    error.stack = 'Error: sqlite3.OperationalError: database is locked\n    at saveSession (session.ts:12)'

    notifyError(error, 'Prompt failed')

    expect(logLine).toHaveBeenCalledTimes(1)
    expect(logLine.mock.calls[0][0]).toContain('Prompt failed')
    expect(logLine.mock.calls[0][0]).toContain('database is locked')
    expect(logLine.mock.calls[0][0]).toContain('session.ts:12')
  } finally {
    if (previous === undefined) {
      delete (window as unknown as { hermesDesktop?: unknown }).hermesDesktop
    } else {
      ;(window as unknown as { hermesDesktop: unknown }).hermesDesktop = previous
    }
  }
})

test.each(['missing', 'closed'] as const)(
  'notifyError still shows a toast when the log bridge is %s',
  (state: 'missing' | 'closed'): void => {
    vi.stubGlobal(
      'hermesDesktop',
      state === 'missing'
        ? undefined
        : {
            logLine: (): never => {
              throw new Error('IPC channel closed')
            }
          }
    )

    try {
      const id: string = notifyError(new Error('database is locked'), 'Prompt failed')

      expect($notifications.get()[0]).toMatchObject({ id, kind: 'error', message: 'database is locked' })
    } finally {
      vi.unstubAllGlobals()
    }
  }
)

test('code-skew 503 unwraps to a restart-required summary, not raw IPC JSON', () => {
  notifyError(
    new Error(
      'Error invoking remote method \'hermes:api\': Error: 503: {"detail":"Restart required: This process is running code from 08b4875f4a but the checkout on disk is now 48d2528066."}'
    ),
    'Could not load models'
  )

  expect(lastMessage()).not.toMatch(/hermes:api|systemctl|backend/i)
  const before = $backendRestartRequest.get()
  expect($notifications.get()[0]?.action?.label).toBe(en.notifications.actions.restartHermes)
  $notifications.get()[0]?.action?.onClick()
  expect($backendRestartRequest.get()).toBe(before + 1)
})

// RT-39: an edit/restore aimed above a compaction boundary is refused by the owner with
// invalid_params on target_message_id and a `compacted:` detail. The toast says so in plain words.
test('a rewind refused for a compacted target says the message was summarized', () => {
  const refused = new JsonRpcGatewayError('invalid_params', {
    code: 4001,
    data: {
      reason: 'invalid_params',
      field: 'target_message_id',
      detail: 'compacted: target user message was summarized when the session was compressed'
    }
  })

  notifyError(refused, 'Restore failed')

  const toast = $notifications.get()[0]
  expect(toast?.title).toBe('Restore failed')
  expect(toast?.message).toBe(en.promptNotices.compactedTurnUnavailable)
  expect(toast?.message).not.toMatch(/invalid_params/)
  expect(toast?.detail).toBeUndefined()
})

// The same refusal without the marker (a turn another window undid, an assistant row, an unknown id)
// never claims a compression happened.
test('a rewind refused for any other stale target says it is no longer in the history', () => {
  notifyError(
    new JsonRpcGatewayError('invalid_params', {
      code: 4001,
      data: {
        reason: 'invalid_params',
        field: 'target_message_id',
        detail: 'target user message is no longer in session history'
      }
    }),
    'Restore failed'
  )

  const toast = $notifications.get()[0]
  expect(toast?.title).toBe('Restore failed')
  expect(toast?.message).toBe(en.promptNotices.staleTurnUnavailable)
  expect(toast?.message).not.toBe(en.promptNotices.compactedTurnUnavailable)
  expect(toast?.detail).toBeUndefined()
})

test('an unrelated invalid_params keeps the generic toast', () => {
  notifyError(
    new JsonRpcGatewayError('invalid_params', { code: 4001, data: { reason: 'invalid_params', field: 'title' } }),
    'Restore failed'
  )
  expect(lastMessage()).toBe('invalid_params')

  clearNotifications()
  notifyError(
    new JsonRpcGatewayError('invalid_params', { code: 4001, data: { reason: 'invalid_params' } }),
    'Edit failed'
  )
  expect(lastMessage()).toBe('invalid_params')
})

// #143133: a model pick or option change on a chat whose launch API key changed showed the raw
// `launch_credentials_unavailable` code. Every retry repeats it; a new chat runs on the current key.
test('a launch-credentials refusal says the key changed and offers a new chat', () => {
  notifyError(
    new JsonRpcGatewayError('launch_credentials_unavailable', {
      code: 4001,
      data: {
        reason: 'launch_credentials_unavailable',
        field: 'model.api_key',
        detail: 'changed in config.yaml since this session started'
      }
    }),
    en.shell.modelOptions.updateFailed
  )

  const toast = $notifications.get()[0]
  expect(toast?.message).toBe(en.assistant.thread.errorCodes.launch_credentials_unavailable.body)
  expect(toast?.message).not.toContain('launch_credentials_unavailable')
  expect(toast?.action?.label).toBe(en.assistant.thread.errorStartNewSession)

  // A deferred pick's refusal event carries only the bare code.
  clearNotifications()
  notifyError(new Error('launch_credentials_unavailable'), en.desktop.modelSwitchFailed)
  expect(lastMessage()).toBe(en.assistant.thread.errorCodes.launch_credentials_unavailable.body)
})
