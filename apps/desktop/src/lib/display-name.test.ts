import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'

import { displayEntityName } from './display-name'

describe('displayEntityName', () => {
  it('localizes the reserved default identity and generated suffixes without changing other names', () => {
    const localized = zh.common.defaultName

    expect(localized).not.toBe('default')
    expect(displayEntityName('default', zh)).toBe(localized)
    expect(displayEntityName('default-2', zh)).toBe(`${localized}-2`)
    expect(displayEntityName('default_workspace', zh)).toBe(`${localized}_workspace`)
    expect(displayEntityName('my-default', zh)).toBe('my-default')
  })
})
