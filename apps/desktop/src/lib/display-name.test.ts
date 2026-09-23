import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'

import { displayEntityName } from './display-name'

describe('displayEntityName', () => {
  it('localizes the reserved default identity and generated suffixes without changing other names', () => {
    expect(displayEntityName('default', zh)).toBe('默认')
    expect(displayEntityName('default-2', zh)).toBe('默认-2')
    expect(displayEntityName('default_workspace', zh)).toBe('默认_workspace')
    expect(displayEntityName('my-default', zh)).toBe('my-default')
  })
})
