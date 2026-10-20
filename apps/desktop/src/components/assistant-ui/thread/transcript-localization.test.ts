import { describe, expect, it } from 'vitest'

import { TRANSLATIONS } from '@/i18n'

import { localizeAssistantTranscriptText } from './transcript-localization'

const NOTICE = 'Your request was not processed. Send it again if you still want me to carry it out.'
const PARTIAL = 'This turn did not complete. Some actions may already have run; verify their effects before resending.'

const AUTOMATION =
  'An automated delivery was interrupted and was not run again. Some actions may already have run; verify their effects.'

const RESTART =
  'Gateway restarting: this turn was interrupted and will not be run again. Send your message again once Hermes reconnects.'

const SHUTDOWN =
  'Gateway shutting down: this turn was interrupted and will not be run again. Send your message again once Hermes is back.'

describe('localizeAssistantTranscriptText', () => {
  it('renders the stored failed-turn boundary rows in the UI language', () => {
    for (const locale of ['zh', 'zh-hant'] as const) {
      const copy = TRANSLATIONS[locale].assistant.thread

      expect(localizeAssistantTranscriptText(NOTICE, copy, locale)).toBe(copy.failedTurnNotice)
      expect(localizeAssistantTranscriptText(`${PARTIAL}\n`, copy, locale)).toBe(copy.failedTurnPartialNotice)
      expect(localizeAssistantTranscriptText(AUTOMATION, copy, locale)).toBe(copy.failedTurnAutomationNotice)
      expect(copy.failedTurnAutomationNotice).not.toBe(AUTOMATION)
      expect(localizeAssistantTranscriptText(RESTART, copy, locale)).toBe(copy.failedTurnRestartNotice)
      expect(localizeAssistantTranscriptText(SHUTDOWN, copy, locale)).toBe(copy.failedTurnShutdownNotice)
      expect(copy.failedTurnRestartNotice).not.toBe(RESTART)
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
