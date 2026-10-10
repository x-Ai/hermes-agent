import { describe, expect, it, vi } from 'vitest'

// group-handle.ts reaches the roster helpers in data.ts, which import the SDK
// at module level; the room harness's mock covers it, and a deterministic i18n
// stub keeps the asserted copy independent of the shipped wording.
const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

vi.mock('./i18n', () => ({
  botsText: () => ({
    group: {
      handleInvalid: 'invalid',
      handleTaken: (handle: string, owner: string) => `taken:${handle}:${owner}`
    }
  })
}))

import {
  checkGroupHandleInput,
  groupHandleFromName,
  groupHandleOwner,
  groupMentionHandle,
  isValidGroupHandle,
  normalizeGroupHandle
} from './group-handle'
import type { GroupChat, RosterRow } from './types'

function room(partial: Partial<GroupChat> = {}): GroupChat {
  return { log: [], watermarks: {}, members: [], ...partial }
}

const ROOMS: Record<string, GroupChat> = {
  'Build Crew': room(),
  大模型管家: room({ handle: 'llm-butler' }),
  Disbanded: room({ handle: 'gone', tombstone: true })
}

const ROSTER = [{ name: 'qa' }, { name: 'auditor', title: 'Ming Jian' }, { name: 'default' }] as RosterRow[]

describe('groupHandleFromName', () => {
  it('slugs a name with ASCII in it, the way a renamed bot is tagged', () => {
    expect(groupHandleFromName('Build Crew')).toBe('build-crew')
    expect(groupHandleFromName('dev_team 2')).toBe('dev_team-2')
  })

  it('escapes a name without ASCII the way a CJK bot name becomes a profile id', () => {
    expect(groupHandleFromName('大模型管家')).toBe('u5927-u6a21-u578b-u7ba1-u5bb6')
  })

  it('yields nothing for a reserved word or a name with nothing to build on', () => {
    expect(groupHandleFromName('Hermes')).toBe('')
    expect(groupHandleFromName('everyone')).toBe('')
    expect(groupHandleFromName('!!!')).toBe('')
    expect(groupHandleFromName('')).toBe('')
  })
})

describe('groupMentionHandle', () => {
  it('prefers a valid explicit handle, normalized, over the derived one', () => {
    expect(groupMentionHandle('大模型管家', { handle: 'llm-butler' })).toBe('llm-butler')
    expect(groupMentionHandle('大模型管家', { handle: ' @LLM-Butler ' })).toBe('llm-butler')
  })

  it('falls back to the derived handle when the stored one is unusable', () => {
    expect(groupMentionHandle('Build Crew', { handle: 'everyone' })).toBe('build-crew')
    expect(groupMentionHandle('Build Crew', { handle: 'bad handle!' })).toBe('build-crew')
    expect(groupMentionHandle('Build Crew', null)).toBe('build-crew')
  })
})

describe('handle grammar', () => {
  it('normalizes what the user typed and validates the profile-id grammar', () => {
    expect(normalizeGroupHandle('  @Dev-Team ')).toBe('dev-team')
    expect(isValidGroupHandle('dev-team')).toBe(true)
    expect(isValidGroupHandle('u5927-u6a21')).toBe(true)
    expect(isValidGroupHandle('-dev')).toBe(false)
    expect(isValidGroupHandle('dev team')).toBe(false)
    expect(isValidGroupHandle('a'.repeat(65))).toBe(false)
    expect(isValidGroupHandle('hermes')).toBe(false)
  })
})

describe('groupHandleOwner', () => {
  it('finds a room by its derived or explicit handle, skipping tombstones and the room itself', () => {
    expect(groupHandleOwner('build-crew', { rooms: ROOMS, roster: [] })).toEqual({ kind: 'room', name: 'Build Crew' })
    expect(groupHandleOwner('llm-butler', { rooms: ROOMS, roster: [] })).toEqual({ kind: 'room', name: '大模型管家' })
    expect(groupHandleOwner('gone', { rooms: ROOMS, roster: [] })).toBeNull()
    expect(groupHandleOwner('build-crew', { except: 'Build Crew', rooms: ROOMS, roster: [] })).toBeNull()
  })

  it('finds a bot by its profile name, handle or renamed tag', () => {
    expect(groupHandleOwner('qa', { rooms: {}, roster: ROSTER })).toMatchObject({ kind: 'bot', bot: { name: 'qa' } })
    expect(groupHandleOwner('ming-jian', { rooms: {}, roster: ROSTER })).toMatchObject({ bot: { name: 'auditor' } })
    expect(groupHandleOwner('hermes', { rooms: {}, roster: ROSTER })).toMatchObject({ bot: { name: 'default' } })
    expect(groupHandleOwner('nobody', { rooms: ROOMS, roster: ROSTER })).toBeNull()
  })
})

describe('checkGroupHandleInput', () => {
  const context = { meta: {}, rooms: ROOMS, roster: ROSTER }

  it('treats an empty field as "derive from the name"', () => {
    expect(checkGroupHandleInput('', context)).toEqual({ handle: null, problem: null })
    expect(checkGroupHandleInput('  @ ', context)).toEqual({ handle: null, problem: null })
  })

  it('rejects the grammar and reserved words', () => {
    expect(checkGroupHandleInput('Dev Team!', context)).toEqual({ handle: 'dev team!', problem: 'invalid' })
    expect(checkGroupHandleInput('everyone', context)).toEqual({ handle: 'everyone', problem: 'invalid' })
  })

  it('names the room or bot that already answers to the handle', () => {
    expect(checkGroupHandleInput('Build-Crew', context).problem).toBe('taken:build-crew:Build Crew')
    expect(checkGroupHandleInput('qa', context).problem).toBe('taken:qa:Qa')
  })

  it('accepts a free handle, normalized', () => {
    expect(checkGroupHandleInput(' @Dev-Team ', context)).toEqual({ handle: 'dev-team', problem: null })
    expect(checkGroupHandleInput('build-crew', { ...context, except: 'Build Crew' })).toEqual({
      handle: 'build-crew',
      problem: null
    })
  })
})
