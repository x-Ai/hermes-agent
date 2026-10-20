import type { GatewayMenuTranslations } from './types_gateway_menu'

/** The statusbar gateway menu (shell): connection states, inference readiness and its actions. */
export const enGatewayMenu: GatewayMenuTranslations = {
  gateway: 'Gateway',
  connected: 'Connected',
  connecting: 'Connecting',
  offline: 'Offline',
  closed: 'Closed',
  error: 'Error',
  inferenceReady: 'Inference ready',
  inferenceNotReady: 'Inference not ready',
  checkingInference: 'Checking inference',
  disconnected: 'Disconnected',
  reconnectGateway: 'Reconnect gateway',
  openSystem: 'Open system panel',
  connection: label => `Connection: ${label}`,
  recentActivity: 'Recent activity',
  viewAllLogs: 'View all logs →',
  messagingPlatforms: 'Messaging platforms'
}
