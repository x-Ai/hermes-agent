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

  it('leaves unknown lines verbatim and maps line by line', () => {
    const raw = 'exited before it became ready (1)\nTimed out connecting to Hermes backend after 500ms'
    expect(localizeBootFailureDetail(raw, en.runtimeErrors)).toBe(
      `exited before it became ready (1)\n${en.runtimeErrors.backendConnectTimedOut(1)}`
    )
    expect(localizeBootFailureDetail(null, en.runtimeErrors)).toBeNull()
    expect(localizeBootFailureDetail('', en.runtimeErrors)).toBe('')
  })
})
