import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'

import { voiceLiveUnavailableReason } from './voice-engine-rows'

describe('voiceLiveUnavailableReason', () => {
  it('localizes the backend missing-key explanation while preserving unknown diagnostics', () => {
    expect(
      voiceLiveUnavailableReason(
        'no OpenAI API key (set OPENAI_API_KEY or voice.gpt_live.api_key)',
        zh.composer.voiceEngineLiveNeedsKey
      )
    ).toBe(zh.composer.voiceEngineLiveNeedsKey)
    expect(voiceLiveUnavailableReason('remote policy denied access', zh.composer.voiceEngineLiveNeedsKey)).toBe(
      'remote policy denied access'
    )
  })
})
