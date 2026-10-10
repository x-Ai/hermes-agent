import { describe, expect, it } from 'vitest'

import { durableGroupHandle, groupHandleProjection, mergeGroupHandleField } from './group-handle-sync'

describe('durableGroupHandle', () => {
  it('stores a trimmed, lowercased handle and null for anything blank', () => {
    expect(durableGroupHandle({ handle: '  LLM-Butler ' })).toBe('llm-butler')
    expect(durableGroupHandle({ handle: '' })).toBeNull()
    expect(durableGroupHandle({ handle: '   ' })).toBeNull()
    expect(durableGroupHandle({})).toBeNull()
    expect(durableGroupHandle(null)).toBeNull()
  })

  it('bounds the stored handle to the profile-id length', () => {
    expect(durableGroupHandle({ handle: 'a'.repeat(80) })).toBe('a'.repeat(64))
  })
})

describe('groupHandleProjection', () => {
  it('always names handle, null when unset, so a clear propagates', () => {
    expect(groupHandleProjection({ handle: 'crew' })).toEqual({ handle: 'crew' })
    expect(groupHandleProjection({})).toEqual({ handle: null })
  })
})

describe('mergeGroupHandleField', () => {
  it('adopts a newer mirror handle, including a remote clear', () => {
    expect(mergeGroupHandleField({ handle: 'old' }, { handle: 'new' }, { adoptRemote: true })).toEqual({
      handle: 'new'
    })
    expect(mergeGroupHandleField({ handle: 'old' }, { handle: null }, { adoptRemote: true })).toEqual({ handle: null })
  })

  it('keeps a preserved room its own handle', () => {
    expect(mergeGroupHandleField({ handle: 'mine' }, { handle: 'theirs' }, { adoptRemote: false })).toEqual({
      handle: 'mine'
    })
  })

  it('reads a mirror written by an older build (no key) as nothing to adopt', () => {
    expect(mergeGroupHandleField({ handle: 'mine' }, {}, { adoptRemote: true })).toEqual({ handle: 'mine' })
    expect(mergeGroupHandleField({ handle: 'mine' }, null, { adoptRemote: true })).toEqual({ handle: 'mine' })
  })
})
