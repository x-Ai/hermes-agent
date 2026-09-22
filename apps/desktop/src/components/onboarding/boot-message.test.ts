import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'

import { localizedBootMessage } from './boot-message'

describe('localizedBootMessage', () => {
  it('uses localized copy for stable boot phases and preserves unknown diagnostics', () => {
    expect(localizedBootMessage('backend.port', 'Waiting for Hermes backend to launch', zh.boot.steps)).toBe(
      '正在等待 Hermes 后端启动'
    )
    expect(localizedBootMessage('custom.phase', 'Provider-specific diagnostic', zh.boot.steps)).toBe(
      'Provider-specific diagnostic'
    )
  })
})
