import type { TranslationOverride } from '@hermes/shared/i18n'

import type { GatewayMenuTranslations } from './types_gateway_menu'

/** The statusbar gateway menu (shell): connection states, inference readiness and its actions. */
export const jaGatewayMenu: TranslationOverride<GatewayMenuTranslations> = {
  gateway: 'ゲートウェイ',
  connected: '接続済み',
  connecting: '接続中',
  offline: 'オフライン',
  closed: '切断済み',
  error: 'エラー',
  inferenceReady: '推論準備完了',
  inferenceNotReady: '推論準備未完了',
  checkingInference: '推論を確認中',
  disconnected: '切断済み',
  reconnectGateway: 'ゲートウェイに再接続',
  openSystem: 'システムパネルを開く',
  connection: label => `接続: ${label}`,
  recentActivity: '最近のアクティビティ',
  viewAllLogs: 'すべてのログを見る →',
  messagingPlatforms: 'メッセージングプラットフォーム'
}
