/**
 * The statusbar's session readouts follow the focused SESSION; a plugin whose
 * main-area workspace is not a session registers a `STATUSBAR_CONTEXT_USAGE_AREA`
 * override and, while its `active` atom is true, the context chip, the cache-hit
 * rate and the tokens-per-second figure are its — handed back the moment it isn't.
 */

import { act, render, renderHook, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { isValidElement } from 'react'
import { afterEach, expect, it } from 'vitest'

import { registry } from '@/contrib/registry'
import { STATUSBAR_CONTEXT_USAGE_AREA } from '@/sdk/areas'
import type { UsageStats } from '@/types/hermes'

import { useStatusbarReadouts } from './use-statusbar-readouts'

const usage: UsageStats = {
  avg_tps: 41.6,
  cache_hit_pct: 87.4,
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
  const { result } = renderHook(() => useStatusbarReadouts(null, false, usage, usage))

  expect(result.current.contextChip.label).toBe('200k/1M')
  expect(isValidElement(result.current.contextChip.detail)).toBe(true)
  expect(isValidElement(result.current.contextChip.menuContent)).toBe(true)
  expect(result.current.cacheHit).toBe('87%')
  expect(result.current.tokensPerSecond).toBe('42 t/s')
})

it('an active override takes every readout and hands them back when it goes inactive', () => {
  const $active = atom(false)
  const $label = atom('~45k/1M')
  const $detail = atom('[░░░░░░░░░░] 4%')
  const $cacheHit = atom('30%')
  const $tokensPerSecond = atom('12 t/s')

  dispose = registry.register({
    id: 'plugin:test:room',
    area: STATUSBAR_CONTEXT_USAGE_AREA,
    data: {
      active: $active,
      cacheHit: $cacheHit,
      detail: $detail,
      label: $label,
      panel: () => <div data-testid="room-panel">room</div>,
      tokensPerSecond: $tokensPerSecond
    }
  })

  const { result } = renderHook(() => useStatusbarReadouts(null, false, usage, usage))

  // Registered but inactive: the focused session keeps the items.
  expect(result.current.contextChip.label).toBe('200k/1M')
  expect(result.current.cacheHit).toBe('87%')

  act(() => $active.set(true))

  expect(result.current.contextChip.label).toBe('~45k/1M')
  expect(result.current.contextChip.detail).toBe('[░░░░░░░░░░] 4%')
  expect(result.current.cacheHit).toBe('30%')
  expect(result.current.tokensPerSecond).toBe('12 t/s')

  render(<>{result.current.contextChip.menuContent}</>)
  expect(screen.getByTestId('room-panel')).toBeTruthy()

  // The override's own live atoms drive the items: another member takes over.
  act(() => {
    $tokensPerSecond.set('55 t/s')
    $label.set('')
  })
  expect(result.current.tokensPerSecond).toBe('55 t/s')
  expect(result.current.contextChip.label).toBe('—')

  act(() => $active.set(false))
  expect(result.current.contextChip.label).toBe('200k/1M')
  expect(result.current.tokensPerSecond).toBe('42 t/s')
})

it('an override without the rate atoms leaves those items on their placeholder, not the focused session', () => {
  dispose = registry.register({
    id: 'plugin:test:context-only',
    area: STATUSBAR_CONTEXT_USAGE_AREA,
    data: { active: atom(true), label: atom('1k/8k'), panel: () => null }
  })

  const { result } = renderHook(() => useStatusbarReadouts(null, false, usage, usage))

  expect(result.current.contextChip.label).toBe('1k/8k')
  expect(result.current.cacheHit).toBe('')
  expect(result.current.tokensPerSecond).toBe('')
})

it('ignores a contribution that does not carry the override shape', () => {
  dispose = registry.register({ id: 'plugin:test:broken', area: STATUSBAR_CONTEXT_USAGE_AREA, data: { active: true } })

  const { result } = renderHook(() => useStatusbarReadouts(null, false, usage, usage))

  expect(result.current.contextChip.label).toBe('200k/1M')
})
