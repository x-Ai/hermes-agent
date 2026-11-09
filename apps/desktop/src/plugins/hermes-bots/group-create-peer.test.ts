/**
 * New group chat's engine: upstream's peer plan decides a selection with bots on other computers
 * only on a gateway that keeps this fork's room settings and seats peers; everything else is the
 * fork's choice between a settings-hosted room and a Desktop room.
 */

import { expect, it } from 'vitest'

import type { GroupCreationPlan } from './canonical-group-capabilities'
import { PEER_HOME } from './canonical-group-contract-test-utils'
import { groupCreateEngine, groupCreateView, hostsRoomSettings } from './group-create-peer'
import type { RosterRow } from './types'

const here: RosterRow = { name: 'alpha', connectionId: 'local' }
const local: RosterRow[] = [here, { name: 'beta', connectionId: 'local' }]
const mixed: RosterRow[] = [here, { name: 'default', connectionId: 'mini', remoteSource: true }]
const settingsHome = { ...PEER_HOME, features: [...PEER_HOME.features, 'room_settings'] }
const plan = (engine: GroupCreationPlan['engine'], reason?: string): GroupCreationPlan => ({ engine, reason })

it('hosts a room seating bots from other computers only where the gateway keeps room settings', () => {
  expect(hostsRoomSettings(settingsHome)).toBe(true)
  expect(groupCreateEngine(plan('gateway-peer'), mixed, 'local', settingsHome)).toBe('gateway-peer')
  // Upstream's gateway seats peers but keeps none of this fork's room settings: a Desktop room.
  expect(groupCreateEngine(plan('gateway-peer'), mixed, 'local', PEER_HOME)).toBe('desktop')
  // A gateway that seats no peers: a Desktop room, whatever upstream's plan says (upstream now refuses
  // it as `unavailable` instead of planning a Desktop room itself).
  expect(
    groupCreateEngine(plan('unavailable', 'peer_owner_unavailable'), mixed, 'local', { features: ['room_settings'] })
  ).toBe('desktop')
})

it('holds Create back with Retry only for a lender that could not be checked, is not connected or changed installation', () => {
  for (const reason of ['unreachable', 'route_unavailable', 'peer_gateway_changed']) {
    expect(groupCreateEngine(plan('unavailable', reason), mixed, 'local', settingsHome)).toBe('unavailable')
    expect(groupCreateView(plan('unavailable', reason), 'unavailable', mixed, 'local', settingsHome)).toMatchObject({
      noteReason: reason,
      retry: true,
      waits: true
    })
  }

  // Upstream refuses a lender that answered but cannot lend its bot; this fork runs that room here.
  for (const reason of ['api_server_required', 'peer_target_unsupported', 'endpoint_required']) {
    expect(groupCreateEngine(plan('unavailable', reason), mixed, 'local', settingsHome)).toBe('desktop')
  }
})

it('waits only on a peer plan still being read, or a lender that could not be read', () => {
  expect(groupCreateEngine(plan('checking'), mixed, 'local', settingsHome)).toBe('checking')
  expect(groupCreateEngine(plan('unavailable', 'unreachable'), mixed, 'local', settingsHome)).toBe('unavailable')
  // The gateway's own capabilities still pending or unreadable never hold a Desktop room back.
  expect(groupCreateEngine(plan('checking'), mixed, 'local', undefined)).toBe('desktop')
  expect(groupCreateEngine(plan('unavailable', 'owner_unavailable'), local, 'local', null)).toBe('desktop')
  expect(groupCreateView(plan('unavailable', 'owner_unavailable'), 'desktop', mixed, 'local', null)).toMatchObject({
    retry: true,
    waits: false
  })
})

it('keeps a selection on this connection on the fork rule: hosted with room settings, else a Desktop room', () => {
  expect(groupCreateEngine(plan('gateway'), local, 'local', { features: ['room_settings'] })).toBe('gateway')
  expect(groupCreateEngine(plan('gateway'), local, 'local', { driver: true, persistent_process: true })).toBe('desktop')
  // Upstream refuses a selection wholly on another connection; this fork makes it a Desktop room.
  expect(groupCreateEngine(plan('elsewhere', 'other_connection'), [mixed[1]], 'local', settingsHome)).toBe('desktop')
})

it('names a lender that cannot host its bot only where that is why the room runs on this Desktop', () => {
  const declined = plan('unavailable', 'api_server_required')
  expect(groupCreateView(declined, 'desktop', mixed, 'local', settingsHome).noteReason).toBe('api_server_required')
  expect(groupCreateView(declined, 'desktop', mixed, 'local', PEER_HOME).noteReason).toBeUndefined()
  expect(groupCreateView(plan('gateway-peer'), 'gateway-peer', mixed, 'local', settingsHome)).toMatchObject({
    hosted: true,
    retry: false,
    waits: false
  })
})
