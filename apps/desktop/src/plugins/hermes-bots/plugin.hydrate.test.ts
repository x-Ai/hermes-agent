/**
 * Room hydrate through the real `plugin.register()`: what plugin storage holds
 * for a room is what the room store shows after a window load.
 *
 * The register-time whitelist used to rebuild each stored room field by field
 * and skipped the working directories, the hold switch and the held-message
 * queue — all of which `updateGroupChat` persists. They
 * came back only once the gateway mirror was pulled, so a Desktop whose
 * gateway was unreachable (or a room the pull preserves because of a local
 * edit) lost them across a restart.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { cache, hostMock } = vi.hoisted(() => ({
  cache: new Map<string, { key: unknown[]; value: unknown }>(),
  hostMock: {
    notify: vi.fn(),
    request: vi.fn(async () => ({})),
    requestProfile: vi.fn(async () => ({})),
    agents: vi.fn(async () => ({ agents: [], sources: [] })),
    state: {
      connectionId: { get: () => 'local', listen: () => () => undefined },
      focusedSessionProfile: { get: () => 'default', listen: () => () => undefined },
      focusedStoredSessionId: { get: () => null, listen: () => () => undefined },
      gateway: { get: () => null, listen: () => () => undefined },
      profile: { get: () => 'default', listen: () => () => undefined }
    }
  }
}))

vi.mock('@hermes/plugin-sdk', async () => {
  const { atom } = await import('nanostores')

  const stub: unknown = new Proxy(function stubbed() {}, {
    apply: () => stub,
    get: (_target, key) => (key === 'then' ? undefined : stub)
  })

  const keyOf = (key: unknown[]) => JSON.stringify(key)

  const queryClient = {
    getQueriesData: ({ queryKey }: { queryKey: unknown[] }) =>
      [...cache.values()]
        .filter(entry => queryKey.every((part, index) => entry.key[index] === part))
        .map(entry => [entry.key, entry.value]),
    fetchQuery: async ({ queryFn, queryKey }: { queryFn: () => Promise<unknown>; queryKey: unknown[] }) => {
      const value = await queryFn()
      cache.set(keyOf(queryKey), { key: queryKey, value })

      return value
    },
    getQueryData: (key: unknown[]) => cache.get(keyOf(key))?.value,
    invalidateQueries: () => undefined,
    setQueryData: (key: unknown[], value: unknown) => cache.set(keyOf(key), { key, value })
  }

  const known: Record<string, unknown> = {
    atom,
    COMPOSER_AREAS: { atCompletions: 'composer.atCompletions', middleware: 'composer.middleware' },
    host: hostMock,
    PALETTE_AREA: 'palette',
    queryClient
  }

  return new Proxy(known, {
    get: (target, key) =>
      typeof key === 'symbol' || key in target ? target[key as string] : key === 'then' ? undefined : stub,
    has: () => true
  })
})

/** A room record exactly as `updateGroupChat` persists it under 'group-chats'. */
const STORED = {
  'Build Crew': {
    log: [{ at: 1, from: { kind: 'user', name: 'You' }, text: 'hi' }],
    holdDetection: false,
    heldMessages: { dev: ['m-1'] },
    watermarks: { dev: 1 },
    sessions: {},
    sessionOwners: {},
    stranded: {},
    holds: { dev: { since: 5 } },
    externalCursors: {},
    members: [{ name: 'dev' }],
    roomId: 'r-abc',
    image: null,
    workspace: '/projects/app',
    memberWorkspaces: { dev: '/projects/dev' },
    threadWorkspaces: {},
    sectionId: null,
    syncRevision: 3
  }
}

/** Register the plugin against storage that already holds `rooms`. */
async function registerWithStoredRooms(rooms: unknown) {
  vi.resetModules()
  cache.clear()

  const plugin = (await import('./plugin')).default

  try {
    plugin.register({
      i18n: { onLocaleChange: () => () => undefined, register: () => () => undefined },
      onDispose: () => undefined,
      register: () => undefined,
      storage: {
        get: async (key: string) => (key === 'group-chats' ? rooms : undefined),
        remove: async () => undefined,
        set: async () => undefined
      }
    } as never)
  } catch {
    // Registration walks UI surfaces the stub does not fully model; the
    // storage reads it scheduled before any throw still run.
  }

  return import('./group-chat')
}

// The plugin entry pulls in every Bot Mode surface; transforming that graph
// once costs more than a single test's budget.
beforeAll(async () => {
  await import('./plugin')
}, 120_000)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('room hydrate on window load', () => {
  it('restores the folders, hold switch and held queue plugin storage holds', async () => {
    const { $groupChats } = await registerWithStoredRooms(STORED)

    await vi.waitFor(() => expect($groupChats.get()['Build Crew']).toBeTruthy())
    const room = $groupChats.get()['Build Crew']

    expect(room.workspace).toBe('/projects/app')
    expect(room.memberWorkspaces).toEqual({ dev: '/projects/dev' })
    expect(room.holdDetection).toBe(false)
    expect(room.heldMessages).toEqual({ dev: ['m-1'] })
    // What the whitelist always carried stays intact.
    expect(room.roomId).toBe('r-abc')
    expect(room.holds).toEqual({ dev: { since: 5 } })
    expect(room.running).toBe(false)
    expect(room.epoch).toBe(0)
  })

  it('skips storage entries that are not rooms', async () => {
    const { $groupChats } = await registerWithStoredRooms({ ...STORED, Broken: { watermarks: {} }, Nope: 'x' })

    await vi.waitFor(() => expect($groupChats.get()['Build Crew']).toBeTruthy())
    expect(Object.keys($groupChats.get())).toEqual(['Build Crew'])
  })
})
