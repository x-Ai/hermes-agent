import { describe, expect, it } from 'vitest'

import { localizeDefaultIdentifier } from './default-identifier'

describe('localizeDefaultIdentifier', () => {
  it('localizes only the canonical default identifier', () => {
    expect(localizeDefaultIdentifier('default', '默认')).toBe('默认')
    expect(localizeDefaultIdentifier('default-worker', '默认')).toBe('default-worker')
    expect(localizeDefaultIdentifier('Default', '默认')).toBe('Default')
  })
})
