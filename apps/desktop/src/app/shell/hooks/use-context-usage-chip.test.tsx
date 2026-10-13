/**
 * The statusbar's context chip follows the focused SESSION; a plugin whose
 * main-area workspace is not a session registers a `STATUSBAR_CONTEXT_USAGE_AREA`
 * override and the chip lends it its label, detail and popover while the
 * override's `active` atom is true — and hands them back the moment it isn't.
 */

import { act, render, renderHook, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { isValidElement } from 'react'
import { afterEach, expect, it } from 'vitest'

import { registry } from '@/contrib/registry'
import { STATUSBAR_CONTEXT_USAGE_AREA } from '@/sdk/areas'
import type { UsageStats } from '@/types/hermes'

import { useContextUsageChip } from './use-context-usage-chip'

const usage: UsageStats = {
  calls: 3,
  context_max: 1_000_000,
  context_percent: 20,
  context_used: 200_000,
  input: 0,
  output: 0,
  total: 0
}

let dispose: (() => void) | null = null

afterEach(() => {
  dispose?.()
  dispose = null
})

it('paints the focused session while no override is registered', () => {
  const { result } = renderHook(() => useContextUsageChip(null, false, usage))

  expect(result.current.label).toBe('200k/1M')
  expect(isValidElement(result.current.detail)).toBe(true)
  expect(isValidElement(result.current.menuContent)).toBe(true)
})

it('an active override takes the label, detail and popover, and hands them back when it goes inactive', () => {
  const $active = atom(false)
  const $label = atom('~45k/1M')
  const $detail = atom('[░░░░░░░░░░] 4%')

  dispose = registry.register({
    id: 'plugin:test:room',
    area: STATUSBAR_CONTEXT_USAGE_AREA,
    data: { active: $active, detail: $detail, label: $label, panel: () => <div data-testid="room-panel">room</div> }
  })

  const { result } = renderHook(() => useContextUsageChip(null, false, usage))

  // Registered but inactive: the focused session keeps the chip.
  expect(result.current.label).toBe('200k/1M')

  act(() => $active.set(true))

  expect(result.current.label).toBe('~45k/1M')
  expect(result.current.detail).toBe('[░░░░░░░░░░] 4%')

  render(<>{result.current.menuContent}</>)
  expect(screen.getByTestId('room-panel')).toBeTruthy()

  // The override's own live atoms drive the chip; an empty label is the
  // waiting placeholder, never a vanished item.
  act(() => $label.set(''))
  expect(result.current.label).toBe('—')

  act(() => $active.set(false))
  expect(result.current.label).toBe('200k/1M')
})

it('ignores a contribution that does not carry the override shape', () => {
  dispose = registry.register({ id: 'plugin:test:broken', area: STATUSBAR_CONTEXT_USAGE_AREA, data: { active: true } })

  const { result } = renderHook(() => useContextUsageChip(null, false, usage))

  expect(result.current.label).toBe('200k/1M')
})
