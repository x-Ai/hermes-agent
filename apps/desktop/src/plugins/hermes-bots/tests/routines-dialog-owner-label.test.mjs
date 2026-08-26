import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// #93572: CreateRoutineDialog's "Send results to" picker built its label with
// `displayName({ name: bot }, $botMeta.get()[bot])`. The dialog's `bot` prop
// is routineCreateTarget() output — an owner OBJECT for roster-scoped bots —
// so the label rendered "[object Object]" and the meta lookup keyed the map
// with an object. The label must resolve owner objects through the
// object-aware botRosterMeta() path and only wrap bare strings.

const pluginSource = readFileSync(new URL('../plugin.js', import.meta.url), 'utf8')

test('CreateRoutineDialog bot-chat label resolves owner objects via botRosterMeta', () => {
  const start = pluginSource.indexOf('function CreateRoutineDialog(')
  assert.ok(start >= 0, 'CreateRoutineDialog must exist')
  const dialog = pluginSource.slice(start, start + 8000)

  const labelStart = dialog.indexOf("id: 'bot-chat'")
  assert.ok(labelStart >= 0, 'bot-chat picker option must exist')
  const label = dialog.slice(labelStart, labelStart + 500)
  assert.match(label, /label:\s*b\.botChatResponds\(\s*displayName\(/)

  // Owner objects pass through untouched; only bare strings are wrapped.
  assert.match(label, /typeof bot === 'string' \? \{ name: bot \} : bot/)
  // Meta lookup must go through the object-aware resolver, never index
  // $botMeta with a possibly-object key.
  assert.match(label, /botRosterMeta\(bot, \$botMeta\.get\(\)\)/)
  assert.ok(
    !/\$botMeta\.get\(\)\[bot\]/.test(dialog),
    'the dialog must not index bot meta with the raw bot prop'
  )
})
