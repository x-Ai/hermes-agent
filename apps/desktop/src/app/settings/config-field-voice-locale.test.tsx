import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'

import { ConfigField } from './config-field'
import { fieldCopyForSchemaKey } from './field-copy'

afterEach(cleanup)

it('renders the translated Echo Transcripts copy without changing its toggle value', () => {
  for (const locale of ['zh', 'zh-hant'] as const) {
    const onChange = vi.fn()
    const t = TRANSLATIONS[locale]

    const { unmount } = render(
      <I18nProvider configClient={null} initialLocale={locale}>
        <ConfigField onChange={onChange} schema={{ type: 'boolean' }} schemaKey="stt.echo_transcripts" value={false} />
      </I18nProvider>
    )

    expect(screen.getByText(fieldCopyForSchemaKey(t.settings.fieldLabels, 'stt.echo_transcripts')!)).toBeTruthy()
    expect(screen.getByText(fieldCopyForSchemaKey(t.settings.fieldDescriptions, 'stt.echo_transcripts')!)).toBeTruthy()
    expect(screen.queryByText('Echo Transcripts')).toBeNull()
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
    unmount()
  }
})

it('preserves distinct Unicode descriptions but suppresses label and schema-key repetitions', () => {
  const cases = [
    ['説明', '音声を表示します'],
    ['Голос', 'Показывать текст'],
    ['الصوت', 'عرض النص'],
    ['किताब', 'कताब'],
    ['café', 'cafe']
  ]

  for (const [label, description] of cases) {
    const schemaKey = `custom.${label}`

    const field = (copy: string) => (
      <ConfigField
        onChange={() => {}}
        schema={{ type: 'boolean', description: copy }}
        schemaKey={schemaKey}
        value={false}
      />
    )

    const { rerender, unmount } = render(field(description))
    expect(screen.getByText(description)).toBeTruthy()

    for (const duplicate of [`${label.toUpperCase()}!`, `${schemaKey}!`, `${label.normalize('NFD')}!`]) {
      rerender(field(duplicate))
      expect(screen.queryByText(duplicate)).toBeNull()
    }

    rerender(field(''))
    expect(screen.queryByText(description)).toBeNull()
    unmount()
  }

  const { unmount } = render(
    <ConfigField
      descriptionExtra={<span>Extra help</span>}
      onChange={() => {}}
      schema={{ type: 'boolean', description: 'CUSTOM setting!' }}
      schemaKey="custom_setting"
      value={false}
    />
  )

  expect(screen.queryByText('CUSTOM setting!')).toBeNull()
  expect(screen.getByText('Extra help')).toBeTruthy()
  unmount()
})

// `tts.deepinfra.voice` is seeded with the literal sentinel "default", which
// the runtime forwards to DeepInfra as the voice name. The row must not print
// that wire value as if it were copy: it reads as an empty field behind the
// locale's "provider default" placeholder, and edits keep raw voice names.
it('shows the DeepInfra voice sentinel as a localized placeholder, not as text', () => {
  for (const locale of ['zh', 'zh-hant'] as const) {
    const t = TRANSLATIONS[locale]

    const { unmount } = render(
      <I18nProvider configClient={null} initialLocale={locale}>
        <ConfigField onChange={() => {}} schema={{ type: 'string' }} schemaKey="tts.deepinfra.voice" value="default" />
      </I18nProvider>
    )

    const input = screen.getByPlaceholderText(t.settings.config.providerDefault) as HTMLInputElement
    expect(input.value).toBe('')
    expect(screen.queryByDisplayValue('default')).toBeNull()
    expect(t.settings.config.providerDefault).not.toBe(TRANSLATIONS.en.settings.config.providerDefault)
    unmount()
  }
})

it('restores the DeepInfra voice sentinel when the field is cleared and keeps typed voice names raw', () => {
  const onChange = vi.fn()

  render(
    <I18nProvider configClient={null} initialLocale="zh">
      <ConfigField onChange={onChange} schema={{ type: 'string' }} schemaKey="tts.deepinfra.voice" value="af_bella" />
    </I18nProvider>
  )

  const input = screen.getByDisplayValue('af_bella')
  fireEvent.change(input, { target: { value: 'af_sky' } })
  expect(onChange).toHaveBeenLastCalledWith('af_sky')

  fireEvent.change(input, { target: { value: '' } })
  expect(onChange).toHaveBeenLastCalledWith('default')
})
