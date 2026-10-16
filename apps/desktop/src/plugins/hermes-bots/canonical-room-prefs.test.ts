import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  _resetCanonicalRoomPrefsForTests,
  CANONICAL_ROOM_PREFS_KEY,
  canonicalRoomPrefs,
  forgetCanonicalRoomPrefs,
  loadCanonicalRoomPrefs,
  rememberCanonicalRoomPrefs
} from './canonical-room-prefs'
import { scriptedStorage } from './group-test-utils'
import { setPluginCtx } from './shared'

const KEY = 'canonical:local:default:r1'
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('canonical room prefs', () => {
  let storage: Map<string, unknown>
  let writes: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    storage = new Map()
    const ctx = scriptedStorage(storage)
    writes = vi.spyOn(ctx.storage!, 'set')
    setPluginCtx(ctx)
    _resetCanonicalRoomPrefsForTests()
  })

  afterEach(() => {
    setPluginCtx(null)
    _resetCanonicalRoomPrefsForTests()
  })

  it('keeps only the row preferences of a hosted room and writes them once per change', async () => {
    rememberCanonicalRoomPrefs(KEY, { image: 'data:img', log: [], pinned: true, running: true, sectionId: 's1' })
    rememberCanonicalRoomPrefs(KEY, { image: 'data:img', log: [], pinned: true, running: false, sectionId: 's1' })
    await flush()
    expect(canonicalRoomPrefs(KEY)).toEqual({ image: 'data:img', pinned: true, sectionId: 's1' })
    expect(storage.get(CANONICAL_ROOM_PREFS_KEY)).toEqual({
      [KEY]: { image: 'data:img', pinned: true, sectionId: 's1' }
    })
    expect(writes).toHaveBeenCalledTimes(1)
  })

  it('drops a room on forget, and when its record no longer carries a preference', async () => {
    rememberCanonicalRoomPrefs(KEY, { pinned: true })
    rememberCanonicalRoomPrefs(KEY, { pinned: false })
    expect(canonicalRoomPrefs(KEY)).toBeNull()
    rememberCanonicalRoomPrefs(KEY, { rosterOrder: 2 })
    forgetCanonicalRoomPrefs(KEY)
    await flush()
    expect(canonicalRoomPrefs(KEY)).toBeNull()
    expect(storage.get(CANONICAL_ROOM_PREFS_KEY)).toEqual({})
  })

  it('loads the stored map under what this window already decided, field by field', async () => {
    rememberCanonicalRoomPrefs(KEY, { pinned: true })

    const keys = loadCanonicalRoomPrefs({
      [KEY]: { image: 'data:old', sectionId: 's9' },
      other: { rosterOrder: 1 },
      junk: 3
    })

    expect([...keys].sort()).toEqual([KEY, 'other'])
    expect(canonicalRoomPrefs(KEY)).toEqual({ image: 'data:old', pinned: true, sectionId: 's9' })
    expect(canonicalRoomPrefs('other')).toEqual({ rosterOrder: 1 })
    await flush()
    // The merge is written back: the early write had replaced the stored picture.
    expect((storage.get(CANONICAL_ROOM_PREFS_KEY) as Record<string, unknown>)[KEY]).toEqual({
      image: 'data:old',
      pinned: true,
      sectionId: 's9'
    })
  })
})
