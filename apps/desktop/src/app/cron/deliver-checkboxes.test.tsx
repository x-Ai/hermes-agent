import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Field } from '@/components/ui/field'
import { en } from '@/i18n/en'
import { zh } from '@/i18n/zh'

import { DeliverCheckboxes } from './index'

afterEach(cleanup)

// Regression for the delivery-target group losing its accessible name: `Field`
// renders the visible label as `<label htmlFor>`, which only associates with
// labelable elements (input, select, ...) — not a `div[role="group"]`. The
// group must pick up the label via `aria-labelledby` instead.
describe('DeliverCheckboxes accessible name', () => {
  it('exposes the Field label as the group name', () => {
    render(
      <Field htmlFor="cron-deliver" label={en.cron.deliverLabel}>
        <DeliverCheckboxes
          c={en.cron}
          id="cron-deliver"
          onChange={() => {}}
          targets={[{ home_env_var: null, home_target_set: true, id: 'local', name: 'This desktop' }]}
          value="local"
        />
      </Field>
    )

    expect(screen.getByRole('group', { name: en.cron.deliverLabel })).toBeTruthy()
  })

  it('localizes Bot Chat targets and the default profile', () => {
    render(
      <DeliverCheckboxes
        c={zh.cron}
        id="cron-deliver"
        onChange={() => {}}
        targets={[
          {
            home_env_var: null,
            home_target_set: true,
            id: 'bot-chat:default',
            name: 'Bot Chat (default)'
          },
          {
            home_env_var: null,
            home_target_set: true,
            id: 'bot-chat:research',
            name: 'Bot Chat (research)'
          }
        ]}
        value="bot-chat:default"
      />
    )

    expect(screen.getByText('Bot 聊天 (默认)')).toBeTruthy()
    expect(screen.getByText('Bot 聊天 (research)')).toBeTruthy()
    expect(screen.queryByText('Bot Chat (default)')).toBeNull()
  })
})
