import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  $currentReasoningEfforts,
  $currentReasoningEffortWire,
  clearComposerSelectionOwner,
  markComposerSelectionManual,
  restoreComposerModelSelection,
  setConnection,
  setCurrentModel,
  setCurrentModelSource,
  setCurrentProvider,
  setCurrentProviderTransient,
  setCurrentReasoningEfforts,
  setCurrentReasoningEffortWire
} from './session'

// The accepted effort levels describe one live route (`session.info.reasoning_efforts`). A fresh draft repainted
// with the sticky pick on another route must not keep the outgoing route's set, or the effort menu dims the wrong
// levels until the new chat's first `session.info`.
describe('a fresh draft repainted with the sticky pick', () => {
  beforeEach(() => {
    setConnection({ mode: 'local', baseUrl: '' } as never)
    setCurrentModel('grok-4.7')
    setCurrentProvider('xai-oauth')
    markComposerSelectionManual()
  })

  afterEach(() => {
    clearComposerSelectionOwner()
    setCurrentModelSource('')
    setCurrentReasoningEfforts(null)
    setCurrentReasoningEffortWire('')
    setConnection(null)
    window.localStorage.clear()
  })

  it("withdraws the outgoing route's accepted effort levels", () => {
    setCurrentProviderTransient('opencode-go')
    setCurrentReasoningEfforts(['low', 'high'])
    restoreComposerModelSelection()
    expect($currentReasoningEfforts.get()).toBeNull()
  })

  it('keeps them, and the wire level, when the draft already shows the sticky route', () => {
    setCurrentReasoningEfforts(['low', 'high'])
    setCurrentReasoningEffortWire('high')
    restoreComposerModelSelection()
    expect([$currentReasoningEfforts.get(), $currentReasoningEffortWire.get()]).toEqual([['low', 'high'], 'high'])
  })
})
