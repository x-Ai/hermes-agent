import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'

import { I18nProvider, useI18n } from '@/i18n'
import type { I18nContextValue } from '@/i18n'
import { registerPluginLocales } from '@/i18n/plugin-i18n'
import { $imagenAvailable } from '@/plugins/hermes-bots/avatar-image'
import { CreateGroupChatDialog } from '@/plugins/hermes-bots/create-dialog'
import { $botMeta } from '@/plugins/hermes-bots/data'
import { GROUP_CHAT_MAX_MEMBERS } from '@/plugins/hermes-bots/group-chat'
import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'
import { translateBotsIn } from '@/plugins/hermes-bots/i18n-test-helper'

let i18n: I18nContextValue
let dispose: (() => void) | undefined

function Controls() {
  i18n = useI18n()

  return null
}

function mount() {
  dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      <Controls />
      <CreateGroupChatDialog
        onClose={() => undefined}
        open
        roster={[
          { connectionId: 'local', name: 'alpha' },
          { connectionId: 'local', name: 'beta' }
        ]}
      />
    </I18nProvider>
  )
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined
  $imagenAvailable.set(false)
})
beforeEach(() => {
  $botMeta.set({ alpha: { groups: ['研究'] } })
})
afterEach(() => {
  cleanup()
  dispose?.()
  $botMeta.set({})
})

// The sheet used to hardcode its description, each row's "in <rooms>" note, the
// empty state and the Create Group button in English, so a zh Desktop showed
// a half-translated dialog under a translated title.
it('renders the New group chat dialog from the catalog and follows a locale switch', async () => {
  mount()
  const zh = translateBotsIn('zh')
  expect(screen.getByText(zh('group.newDescription', GROUP_CHAT_MAX_MEMBERS))).toBeTruthy()
  expect(screen.getByText(`@alpha · ${zh('group.inGroups', ['研究'])}`)).toBeTruthy()
  expect(screen.getByRole('button', { name: zh('group.createAction', 0) }).hasAttribute('disabled')).toBe(true)

  for (const checkbox of screen.getAllByRole('checkbox')) {
    fireEvent.click(checkbox)
  }

  expect(screen.getByRole('button', { name: zh('group.createAction', 2) }).hasAttribute('disabled')).toBe(false)

  fireEvent.change(screen.getByPlaceholderText(zh('group.searchToAddPlaceholder')), { target: { value: 'nobody' } })
  expect(screen.getByText(zh('group.noBotsMatch', 'nobody'))).toBeTruthy()

  await act(() => i18n.setLocale('ja'))
  const ja = translateBotsIn('ja')
  expect(screen.getByText(ja('group.newDescription', GROUP_CHAT_MAX_MEMBERS))).toBeTruthy()
  expect(screen.getByRole('button', { name: ja('group.createAction', 2) })).toBeTruthy()
})
