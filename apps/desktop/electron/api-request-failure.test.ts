import assert from 'node:assert/strict'

import { test } from 'vitest'

import { formatApiRequestFailure } from './api-request-failure'
import { markExpectedTransition } from './crash-forensics'

test('a request that lost the race with app quit logs as one expected-transition line', () => {
  const line = formatApiRequestFailure(
    { method: 'get', path: '/api/profiles' },
    markExpectedTransition(new Error('Hermes Desktop is quitting.'))
  )

  assert.equal(line, '[hermes:api GET /api/profiles] expected shutdown transition — Hermes Desktop is quitting.')
  assert.doesNotMatch(line, /\n\s+at /)
})

test('a genuine failure keeps its stack and clamps the path', () => {
  const error = new Error('backend exploded')
  const line = formatApiRequestFailure({ method: 'post', path: `/api/${'x'.repeat(600)}` }, error)

  assert.match(line, /^\[hermes:api POST \/api\/x{495}\] Error: backend exploded/)
  assert.match(line, /\n\s+at /)
  assert.ok(line.length <= 6000)
})

test('a non-Error rejection is stringified', () => {
  assert.equal(formatApiRequestFailure(null, 'plain refusal'), '[hermes:api GET (no path)] plain refusal')
})
