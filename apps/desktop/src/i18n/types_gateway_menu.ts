/** The statusbar gateway menu (shell): connection states, inference readiness and its actions. */
export interface GatewayMenuTranslations {
  gateway: string
  connected: string
  connecting: string
  offline: string
  closed: string
  error: string
  inferenceReady: string
  inferenceNotReady: string
  checkingInference: string
  disconnected: string
  reconnectGateway: string
  openSystem: string
  connection: (label: string) => string
  recentActivity: string
  viewAllLogs: string
  messagingPlatforms: string
}
