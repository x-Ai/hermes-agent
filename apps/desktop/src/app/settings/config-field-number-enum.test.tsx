import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'

import { ConfigField } from './config-field'
import { ENUM_OPTIONS } from './constants'

// Radix Select needs these in jsdom to open its listbox.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
})

afterEach(cleanup)

// The retry-count keys carry string ENUM_OPTIONS for display but a `number`
// schema type from the backend; picking an option must store the number,
// not '2', or the config file ends up with a quoted retry count.
it.each(Object.keys(ENUM_OPTIONS).filter(key => /^agent\..*_retries$/.test(key)))(
  '%s stores the picked option with the schema type (number), not the display string',
  async key => {
    const onChange = vi.fn()
    const options = ENUM_OPTIONS[key]
    const picked = options[options.length - 1]

    render(
      <ConfigField
        enumOptions={options}
        onChange={onChange}
        schema={{ type: 'number', options: options.map(Number) }}
        schemaKey={key}
        value={1}
      />
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: picked }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(Number(picked))
    expect(typeof onChange.mock.calls[0][0]).toBe('number')
  }
)

it('keeps string values for select-typed schema keys', async () => {
  const onChange = vi.fn()

  render(
    <ConfigField
      enumOptions={['low', 'medium', 'high']}
      onChange={onChange}
      schema={{ type: 'select', options: ['low', 'medium', 'high'] }}
      schemaKey="agent.reasoning_effort"
      value="medium"
    />
  )

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(await screen.findByRole('option', { name: 'High' }))

  expect(onChange).toHaveBeenCalledWith('high')
})
