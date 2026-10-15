import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from '@/i18n'

import { localizeAssistantTranscriptText } from './transcript-localization'

const NOTICE = 'Your request was not processed. Send it again if you still want me to carry it out.'
const PARTIAL = 'This turn did not complete. Some actions may already have run; verify their effects before resending.'

describe('localizeAssistantTranscriptText', () => {
  it('renders the stored failed-turn boundary rows in the UI language', () => {
    for (const locale of ['zh', 'zh-hant'] as const) {
      const copy = TRANSLATIONS[locale].assistant.thread

      expect(localizeAssistantTranscriptText(NOTICE, copy, locale)).toBe(copy.failedTurnNotice)
      expect(localizeAssistantTranscriptText(`${PARTIAL}\n`, copy, locale)).toBe(copy.failedTurnPartialNotice)
      expect(copy.failedTurnNotice).not.toBe(NOTICE)
    }
  })

  it('keeps English and a reply that merely quotes the notice verbatim', () => {
    const copy = TRANSLATIONS.en.assistant.thread

    expect(localizeAssistantTranscriptText(NOTICE, copy, 'en')).toBe(NOTICE)

    const quoted = `Earlier you saw "${NOTICE}" — that was a provider outage.`

    expect(localizeAssistantTranscriptText(quoted, TRANSLATIONS.zh.assistant.thread, 'zh')).toBe(quoted)
  })
})
