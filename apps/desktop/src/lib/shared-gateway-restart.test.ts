import { describe, expect, it } from 'vitest'

import { sharedGatewayProfileLabels, sharedGatewayProfiles } from './shared-gateway-restart'

describe('sharedGatewayProfiles', () => {
  it('lists every bot the shared multiplexer carries, default first, when the profile is served', () => {
    expect(sharedGatewayProfiles({ gateway_shared_with: ['beta', 'alpha', 'default'] })).toEqual([
      'default',
      'alpha',
      'beta'
    ])
  })

  it('keeps the plain restart for standalone gateways and older backends', () => {
    // Standalone profile: the backend answers null.
    expect(sharedGatewayProfiles({ gateway_shared_with: null })).toBeNull()
    // Older backend: the key does not exist at all.
    expect(sharedGatewayProfiles({})).toBeNull()
    expect(sharedGatewayProfiles(null)).toBeNull()
    // A multiplexer carrying nobody else restarts only itself: no "all bots" copy.
    expect(sharedGatewayProfiles({ gateway_shared_with: ['default'] })).toBeNull()
  })
})

describe('sharedGatewayProfileLabels', () => {
  it('shows the root profile under its localized label and every other bot as recorded', () => {
    expect(sharedGatewayProfileLabels(['default', 'auditor', 'Default-2'], '默认')).toEqual([
      '默认',
      'auditor',
      'Default-2'
    ])
    // No label to show: the canonical id stays.
    expect(sharedGatewayProfileLabels(['default', 'qa'], '  ')).toEqual(['default', 'qa'])
  })
})
