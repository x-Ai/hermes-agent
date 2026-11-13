import { describe, expect, it } from 'vitest'

import { en } from '@/i18n/en'
import { zh } from '@/i18n/zh'

import { localizeBootFailureDetail } from './boot-failure-detail'

describe('localizeBootFailureDetail', () => {
  it('re-renders the backend connection timeout in the UI language, with the wait when reported', () => {
    expect(localizeBootFailureDetail('Timed out connecting to Hermes backend', zh.runtimeErrors)).toBe(
      zh.runtimeErrors.backendConnectTimedOut(null)
    )
    expect(localizeBootFailureDetail('Timed out connecting to Hermes backend after 45000ms', en.runtimeErrors)).toBe(
      en.runtimeErrors.backendConnectTimedOut(45)
    )
    expect(zh.runtimeErrors.backendConnectTimedOut(45)).not.toMatch(/Timed out|backend/)
  })

  // The renderer raises these in the UI language of the moment, which can change on the overlay.
  it('re-renders a WebSocket URL timeout in the UI language, whichever language raised it', () => {
    expect(localizeBootFailureDetail(zh.runtimeErrors.gatewayWsUrlTimedOut, en.runtimeErrors)).toBe(
      en.runtimeErrors.gatewayWsUrlTimedOut
    )
    expect(localizeBootFailureDetail(en.runtimeErrors.gatewayWsUrlRemintTimedOut, zh.runtimeErrors)).toBe(
      zh.runtimeErrors.gatewayWsUrlRemintTimedOut
    )
  })

  // Main aborts every backend start with this sentence once quit begins. Its boot progress reports it
  // bare; the renderer's failed getConnection() carries it behind the IPC wrap.
  it('re-renders the quitting abort in the UI language, bare or behind the IPC wrap', () => {
    expect(localizeBootFailureDetail('Hermes Desktop is quitting.', zh.runtimeErrors)).toBe(
      zh.runtimeErrors.desktopQuitting
    )
    expect(
      localizeBootFailureDetail(
        "Error invoking remote method 'hermes:connection': Error: Hermes Desktop is quitting.",
        zh.runtimeErrors
      )
    ).toBe(zh.runtimeErrors.desktopQuitting)
    expect(zh.runtimeErrors.desktopQuitting).not.toMatch(/quitting/)
  })

  it('leaves unknown lines verbatim and maps line by line', () => {
    const raw = 'exited before it became ready (1)\nTimed out connecting to Hermes backend after 500ms'
    expect(localizeBootFailureDetail(raw, en.runtimeErrors)).toBe(
      `exited before it became ready (1)\n${en.runtimeErrors.backendConnectTimedOut(1)}`
    )
    expect(localizeBootFailureDetail(null, en.runtimeErrors)).toBeNull()
    expect(localizeBootFailureDetail('', en.runtimeErrors)).toBe('')
  })
})
