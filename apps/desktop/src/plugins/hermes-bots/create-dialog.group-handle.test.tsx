/**
 * The @handle field of the New group chat dialog: an explicit handle is
 * checked before the room is minted (grammar, reserved words, a bot or room
 * that already answers to it), and a valid one lands on the room record.
 */

import type * as HermesSdk from '@hermes/plugin-sdk'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as DataModule from './data'
import { translateBots } from './i18n-test-helper'
import type { RosterRow } from './types'

const mocks = vi.hoisted(() => ({
  notify: vi.fn(),
  request: vi.fn(async () => ({})),
  requestProfile: vi.fn(async () => ({})),
  saveBotMeta: vi.fn()
}))

vi.mock('@hermes/plugin-sdk', async importOriginal => {
  const original = await importOriginal<typeof HermesSdk>()

  return {
    ...original,
    host: { ...original.host, notify: mocks.notify, request: mocks.request, requestProfile: mocks.requestProfile },
    // The plugin bundle normally lands via `ctx.i18n.register` at load.
    usePluginI18n: () => translateBots
  }
})

vi.mock('./data', async importOriginal => {
  const original = await importOriginal<typeof DataModule>()

  return { ...original, saveBotMeta: mocks.saveBotMeta }
})

import { $imagenAvailable } from './avatar-image'
import { CreateGroupChatDialog } from './create-dialog'
import { $botMeta } from './data'
import { $groupChats } from './group-chat'

const roster: RosterRow[] = [
  { connectionId: 'local', name: 'alpha' },
  { connectionId: 'local', name: 'beta' }
]

/** The dialog with both bots picked, so Create is live and the default name is "alpha, beta". */
function mount() {
  const view = render(<CreateGroupChatDialog onClose={() => undefined} open roster={roster} />)

  for (const checkbox of screen.getAllByRole('checkbox')) {
    fireEvent.click(checkbox)
  }

  return view
}

const handleField = () => screen.getByLabelText(translateBots('group.handleLabel')) as HTMLInputElement
const createButton = () => screen.getByRole('button', { name: translateBots('group.createAction', 2) })
const rooms = () => $groupChats.get()

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined
  $imagenAvailable.set(false)
})

beforeEach(() => {
  vi.clearAllMocks()
  $botMeta.set({})
  $groupChats.set({})
})

afterEach(() => {
  cleanup()
  $groupChats.set({})
})

describe('the @handle field on New group chat', () => {
  it('shows the handle the default name would get as its placeholder', () => {
    mount()

    expect(handleField().placeholder).toBe('alpha-beta')
  })

  it('keeps the dialog open, with a notice, for a handle outside the grammar', async () => {
    mount()
    fireEvent.change(handleField(), { target: { value: 'Dev Team!' } })
    fireEvent.click(createButton())

    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith({ kind: 'error', message: translateBots('group.handleInvalid') })
    )
    expect(Object.keys(rooms())).toEqual([])
  })

  it('refuses a handle a bot already answers to', async () => {
    mount()
    fireEvent.change(handleField(), { target: { value: 'alpha' } })
    fireEvent.click(createButton())

    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith({
        kind: 'error',
        message: translateBots('group.handleTaken', 'alpha', 'Alpha')
      })
    )
    expect(Object.keys(rooms())).toEqual([])
  })

  it('stores a valid handle, normalized, on the new room', async () => {
    mount()
    fireEvent.change(handleField(), { target: { value: ' @Dev-Team ' } })
    fireEvent.click(createButton())

    await waitFor(() => expect(rooms()['Alpha, Beta']?.handle).toBe('dev-team'))
    expect(rooms()['Alpha, Beta']?.members?.map(member => member.name)).toEqual(['alpha', 'beta'])
  })

  it('leaves the handle derived from the name when the field is empty', async () => {
    mount()
    fireEvent.click(createButton())

    await waitFor(() => expect(rooms()['Alpha, Beta']).toBeTruthy())
    expect(rooms()['Alpha, Beta']?.handle ?? null).toBeNull()
  })
})
