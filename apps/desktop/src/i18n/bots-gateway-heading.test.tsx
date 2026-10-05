import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'
import { registerPluginLocales } from '@/i18n/plugin-i18n'
import { BOTS_LOCALES } from '@/plugins/hermes-bots/i18n'
import { GatewaySectionHeading } from '@/plugins/hermes-bots/roster-sections'

let dispose: (() => void) | undefined

type HeadingOption = NonNullable<Parameters<typeof GatewaySectionHeading>[0]['option']>

// The heading reads two catalogs at once: the gateway label is the plugin's
// own string, the kind word is core's Connections vocabulary. Both ride the
// app's I18nProvider, so the test mounts the real one in Chinese.
function mount(option: HeadingOption) {
  dispose = registerPluginLocales('hermes-bots', BOTS_LOCALES)

  return render(
    <I18nProvider configClient={null} initialLocale="zh">
      <GatewaySectionHeading collapsed={false} count={2} onToggle={() => undefined} option={option} />
    </I18nProvider>
  )
}

function hoverTip() {
  act(() => {
    // Radix arms its open timer on pointer movement over the trigger.
    fireEvent.pointerMove(screen.getByRole('button'))
    vi.advanceTimersByTime(700)
  })

  return screen.getByRole('tooltip').textContent || ''
}

afterEach(() => {
  cleanup()
  dispose?.()
  vi.useRealTimers()
})

// The hover tip spells out which gateway a section is and what kind of
// connection it is. Both halves come from registry data — the English
// "This device" label and the raw kind enum — so they must be translated at
// presentation time like every other word in the tip.
describe('gateway section heading tip', () => {
  it('names the local gateway and its kind in the UI language', () => {
    vi.useFakeTimers()
    mount({ connectionId: 'local', kind: 'local', label: 'This device', reachable: true })

    const tip = hoverTip()

    expect(tip).toContain('本设备')
    expect(tip).toContain('本地')
    expect(tip).not.toContain('This device')
    expect(tip).not.toMatch(/\blocal\b/)
  })

  it('keeps a remote gateway under its own name and translates only the kind', () => {
    vi.useFakeTimers()
    mount({ connectionId: 'homelab', kind: 'ssh', label: 'Homelab', reachable: true })

    const tip = hoverTip()

    expect(tip).toContain('Homelab')
    expect(tip).toContain('SSH')
    expect(tip).not.toMatch(/\bssh\b/)
  })
})
