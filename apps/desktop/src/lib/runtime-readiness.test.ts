import { afterEach, describe, expect, it } from 'vitest'

import { setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'

import {
  evaluateRuntimeReadiness,
  fetchRuntimeReadinessSignals,
  interpretRuntimeReadiness,
  runtimeReadinessDisplay
} from './runtime-readiness'

afterEach(() => {
  setRuntimeI18nLocale('en')
})

describe('interpretRuntimeReadiness', () => {
  it('prefers runtime_check when both signals exist', () => {
    const result = interpretRuntimeReadiness({
      setup: { provider_configured: false },
      setupError: null,
      runtime: { ok: true },
      runtimeError: null
    })

    expect(result).toEqual({
      checksDisagree: true,
      ready: true,
      reason: null,
      source: 'runtime_check'
    })
  })

  it('surfaces runtime mismatch details when runtime_check fails', () => {
    const result = interpretRuntimeReadiness({
      setup: { provider_configured: true },
      setupError: null,
      runtime: { error: 'No provider can serve the selected model.', ok: false },
      runtimeError: null
    })

    expect(result.ready).toBe(false)
    expect(result.source).toBe('runtime_check')
    expect(result.checksDisagree).toBe(true)
    expect(result.reason).toContain('No provider can serve the selected model.')
    expect(result.reason).toContain('setup.status reports configured credentials')
  })

  it('falls back to setup.status when runtime_check has no boolean result', () => {
    const result = interpretRuntimeReadiness({
      setup: { provider_configured: true },
      setupError: null,
      runtime: null,
      runtimeError: 'runtime check RPC unavailable'
    })

    expect(result).toEqual({
      checksDisagree: false,
      ready: true,
      reason: null,
      source: 'setup_status'
    })
  })

  it('uses explicit fallback when both checks are missing', () => {
    const result = interpretRuntimeReadiness({
      setup: null,
      setupError: 'setup.status timeout',
      runtime: null,
      runtimeError: 'setup.runtime_check timeout'
    })

    expect(result.ready).toBe(false)
    expect(result.source).toBe('fallback')
    expect(result.reason).toBe('setup.runtime_check timeout')
  })
})

describe('fetchRuntimeReadinessSignals', () => {
  it('scopes setup.runtime_check to the requested provider', async () => {
    const calls: Array<{ method: string; params?: Record<string, unknown> }> = []

    const requestGateway = async <T = unknown>(method: string, params?: Record<string, unknown>) => {
      calls.push({ method, params })

      if (method === 'setup.status') {
        return { provider_configured: true } as T
      }

      if (method === 'setup.runtime_check') {
        return { ok: true } as T
      }

      throw new Error(`unexpected method: ${method}`)
    }

    await fetchRuntimeReadinessSignals(requestGateway, 'nous')

    expect(calls).toEqual([{ method: 'setup.status' }, { method: 'setup.runtime_check', params: { provider: 'nous' } }])
  })
})

describe('evaluateRuntimeReadiness', () => {
  it.each(['en', 'zh', 'zh-hant', 'ja', 'ar', 'ru'] as const)(
    'localizes unknown-provider readiness failures in %s while preserving the provider and diagnostic commands',
    async locale => {
      setRuntimeI18nLocale(locale)
      const copy = TRANSLATIONS[locale]

      for (const provider of ['fable', 'custom-test']) {
        const requestGateway = async <T = unknown>(method: string) => {
          if (method === 'setup.status') {
            return { provider_configured: true } as T
          }

          return {
            ok: false,
            error: `Unknown provider '${provider}'. Check 'hermes\nmodel' for available providers, or run 'hermes\ndoctor' to diagnose config issues.`
          } as T
        }

        const result = await evaluateRuntimeReadiness(requestGateway)

        expect(result).toMatchObject({ ready: false, checksDisagree: true, source: 'runtime_check' })
        expect(result.reason).toBe(
          `${copy.notifications.errors.unknownProvider(provider)} ${copy.desktop.readinessChecksDisagree}`
        )
        expect(result.reason).toContain(provider)
        expect(result.reason).toContain('hermes model')
        expect(result.reason).toContain('hermes doctor')

        if (locale !== 'en') {
          expect(result.reason).not.toContain('Unknown provider')
          expect(result.reason).not.toContain(TRANSLATIONS.en.desktop.readinessChecksDisagree)
        }
      }
    }
  )

  it('forwards requestedProvider to setup.runtime_check', async () => {
    const requestGateway = async <T = unknown>(method: string, params?: Record<string, unknown>) => {
      if (method === 'setup.status') {
        return { provider_configured: true } as T
      }

      if (method === 'setup.runtime_check') {
        expect(params).toEqual({ provider: 'nous' })

        return { ok: true } as T
      }

      throw new Error(`unexpected method: ${method}`)
    }

    const result = await evaluateRuntimeReadiness(requestGateway, { requestedProvider: 'nous' })

    expect(result.ready).toBe(true)
  })
})

describe('runtimeReadinessDisplay', () => {
  it('does not call configured credentials setup when runtime resolution fails', () => {
    expect(
      runtimeReadinessDisplay({
        checksDisagree: true,
        ready: false,
        reason: 'Anthropic cannot serve the selected model.',
        source: 'runtime_check'
      })
    ).toBe('unavailable')
  })

  it('keeps needs-setup for an authoritative unconfigured result', () => {
    expect(
      runtimeReadinessDisplay({
        checksDisagree: false,
        ready: false,
        reason: 'No provider configured.',
        source: 'setup_status'
      })
    ).toBe('needs_setup')
  })
})
