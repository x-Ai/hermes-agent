import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { registry } from '@/contrib/registry'

import { COMPOSER_AREAS, type ComposerMiddleware } from '../contrib'
import type { ChatBarProps } from '../types'

import { useMiddlewareSubmit } from './use-middleware-submit'

const disposers: Array<() => void> = []

function addMiddleware(id: string, handler: ComposerMiddleware['handler']) {
  disposers.push(
    registry.register({ id, area: COMPOSER_AREAS.middleware, data: { handler } satisfies ComposerMiddleware })
  )
}

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
})

/** Mount the hook around `onSubmit` and send `text` through it once. */
async function submitThrough(onSubmit: ChatBarProps['onSubmit'], text: string): Promise<boolean | undefined> {
  const { result } = renderHook(() => useMiddlewareSubmit(onSubmit))
  let accepted: boolean | undefined

  await act(async () => {
    accepted = await result.current.onSubmit(text)
  })

  return accepted
}

// The submit engine reads the wrapper's boolean as "accepted → clear the
// draft" / "rejected → restore it", so each middleware verdict must map to the
// right one: a rewrite reaches the app submit, a cancel restores, and a
// consumed draft (delivered elsewhere by the plugin) clears WITHOUT a turn.
describe('useMiddlewareSubmit', () => {
  it('hands the rewritten draft to the app submit and returns its verdict', async () => {
    addMiddleware('rewrite', draft => ({ ...draft, text: `${draft.text}!` }))
    const onSubmit = vi.fn(async () => true)

    expect(await submitThrough(onSubmit, 'hi')).toBe(true)
    expect(onSubmit).toHaveBeenCalledWith('hi!', { attachments: undefined })
  })

  it('reports a cancelled send as rejected so the composer restores the draft', async () => {
    addMiddleware('gate', () => null)
    const onSubmit = vi.fn(async () => true)

    expect(await submitThrough(onSubmit, 'hi')).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('reports a consumed draft as accepted without starting a session turn', async () => {
    addMiddleware('router', () => ({ consumed: true }))
    const onSubmit = vi.fn(async () => true)

    expect(await submitThrough(onSubmit, '@room hi')).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
