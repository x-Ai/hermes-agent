import { describe, expect, it } from 'vitest'

import {
  currentPickerSelection,
  displayModelName,
  displayProviderLabel,
  formatModelStatusLabel,
  providerCatalogName,
  reasoningEffortLabel
} from './model-status-label'

describe('model-status-label', () => {
  it('formats display names consistently', () => {
    expect(displayModelName('anthropic/claude-opus-4.8-fast')).toBe('Opus 4.8')
    expect(displayModelName('openai/gpt-5.5-fast')).toBe('GPT-5.5')
    expect(displayModelName('deepseek/deepseek-v4-pro-thinking')).toBe('Deepseek V4 Pro')
    expect(displayModelName('openai/gpt-5.5')).toBe('GPT-5.5')
  })

  it('strips trailing date-pin snapshots from the display name', () => {
    expect(displayModelName('claude-opus-4-5-20251101')).toBe('Opus 4 5')
    expect(displayModelName('anthropic/claude-haiku-4-5-20251001')).toBe('Haiku 4 5')
  })

  it('maps reasoning effort to compact labels', () => {
    expect(reasoningEffortLabel('high')).toBe('High')
    expect(reasoningEffortLabel('xhigh')).toBe('XHigh')
    expect(reasoningEffortLabel('max')).toBe('Max')
    expect(reasoningEffortLabel('ultra')).toBe('Ultra')
    expect(reasoningEffortLabel('')).toBe('')
  })

  it('appends fast + effort session state to the status label', () => {
    expect(formatModelStatusLabel('openai/gpt-5.5', { fastMode: true, reasoningEffort: 'high' })).toBe(
      'GPT-5.5 · Fast High'
    )
  })

  it('always surfaces the effort (default medium) so the level is visible', () => {
    expect(formatModelStatusLabel('openai/gpt-5.5', { reasoningEffort: 'medium' })).toBe('GPT-5.5 · Med')
    expect(formatModelStatusLabel('openai/gpt-5.5')).toBe('GPT-5.5 · Med')
  })

  it('returns just the placeholder name when there is no model', () => {
    expect(formatModelStatusLabel('')).toBe('No model')
  })

  describe('displayProviderLabel', () => {
    it('prefers the catalog display name (custom endpoints show their user-chosen name)', () => {
      expect(displayProviderLabel('custom', 'My Relay')).toBe('My Relay')
      expect(displayProviderLabel('axet-proxy', 'Axet Proxy')).toBe('Axet Proxy')
    })

    it('strips the custom: scheme so the endpoint id shows when no catalog name exists', () => {
      expect(displayProviderLabel('custom:local-ollama')).toBe('local-ollama')
      expect(displayProviderLabel('custom:local-ollama', '  ')).toBe('local-ollama')
    })

    it('falls back to the raw slug', () => {
      expect(displayProviderLabel('custom')).toBe('custom')
      expect(displayProviderLabel('anthropic', undefined)).toBe('anthropic')
      // Degenerate scheme-only slug never renders as an empty label.
      expect(displayProviderLabel('custom:')).toBe('custom:')
    })
  })

  describe('providerCatalogName', () => {
    const providers = [
      { name: 'Fable', slug: 'ying' },
      { name: 'Nous', slug: 'nous' }
    ]

    it('matches a plain slug case-insensitively', () => {
      expect(providerCatalogName('YING', providers)).toBe('Fable')
      expect(providerCatalogName('nous', providers)).toBe('Nous')
    })

    it('matches the durable custom:<id> identity against the bare catalog id', () => {
      // The backend reports custom endpoints as `custom:<id>` (the routable
      // identity), while catalog rows carry the bare endpoint id — the pill
      // must still resolve the user-chosen endpoint name after a restart.
      expect(providerCatalogName('custom:ying', providers)).toBe('Fable')
      expect(providerCatalogName('CUSTOM:YING', providers)).toBe('Fable')
    })

    it('returns undefined for unknown, bare-custom, or empty slugs', () => {
      expect(providerCatalogName('custom', providers)).toBeUndefined()
      expect(providerCatalogName('unknown', providers)).toBeUndefined()
      expect(providerCatalogName('', providers)).toBeUndefined()
      expect(providerCatalogName('custom:ying', undefined)).toBeUndefined()
    })
  })

  describe('currentPickerSelection', () => {
    const store = { model: 'opus', provider: 'anthropic' }
    const options = { model: 'hermes-4', provider: 'nous' }

    it('prefers the sticky composer pick over the profile default pre-session', () => {
      expect(currentPickerSelection(false, store, options)).toEqual(store)
    })

    it('lets the live session model.options win when a session exists', () => {
      expect(currentPickerSelection(true, store, options)).toEqual(options)
    })

    it('falls back to options when the store is empty', () => {
      expect(currentPickerSelection(false, { model: '', provider: '' }, options)).toEqual(options)
    })

    it('falls back to the store while options are still loading', () => {
      expect(currentPickerSelection(true, store, undefined)).toEqual(store)
    })
  })
})
