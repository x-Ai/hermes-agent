import { describe, expect, it } from 'vitest'

import { botGatewayLabel, gatewayDisplayLabel } from './labels'

// The local registry entry is labelled "This device" in English whatever
// language the UI runs in. Every surface that names a row's gateway shows the
// translated label instead, while a remote gateway keeps the name the user
// gave it and an unannotated single-source row names no gateway at all.
describe('gateway labels', () => {
  it('names the local gateway in the UI language, never by its registry label', () => {
    expect(
      botGatewayLabel({ connectionId: 'local', connectionKind: 'local', connectionLabel: 'This device' }, '本设备')
    ).toBe('本设备')
    // Rows annotated by an older Electron carry the id but no kind.
    expect(botGatewayLabel({ connectionId: 'local', connectionLabel: 'This device' }, '本设备')).toBe('本设备')
    expect(gatewayDisplayLabel({ connectionId: 'local', kind: 'local', label: 'This device' }, '本设备')).toBe('本设备')
  })

  it('keeps a remote gateway under the name the user gave it', () => {
    expect(
      botGatewayLabel({ connectionId: 'homelab', connectionKind: 'remote', connectionLabel: 'Homelab' }, '本设备')
    ).toBe('Homelab')
    expect(gatewayDisplayLabel({ connectionId: 'homelab', label: 'Homelab' }, '本设备')).toBe('Homelab')
  })

  it('names nothing for an unannotated single-source row', () => {
    expect(botGatewayLabel({}, '本设备')).toBe('')
    expect(botGatewayLabel(null, '本设备')).toBe('')
    expect(gatewayDisplayLabel({ connectionId: 'homelab' }, '本设备')).toBe('')
  })

  it('falls back to the caller-supplied name only when the gateway has no label', () => {
    expect(gatewayDisplayLabel({ connectionId: 'homelab' }, '本设备', 'homelab')).toBe('homelab')
    expect(gatewayDisplayLabel({ connectionId: 'homelab', label: 'Homelab' }, '本设备', 'homelab')).toBe('Homelab')
    // A local gateway never shows its id or registry label, fallback or not.
    expect(gatewayDisplayLabel({ connectionId: 'local', label: 'This device' }, '本设备', 'local')).toBe('本设备')
  })
})
