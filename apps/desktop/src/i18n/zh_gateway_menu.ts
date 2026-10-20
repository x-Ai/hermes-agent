import type { TranslationOverride } from '@hermes/shared/i18n'

import type { GatewayMenuTranslations } from './types_gateway_menu'

/** 状态栏网关菜单（shell）的文案：连接状态、推理就绪及其操作。 */
export const zhGatewayMenu: TranslationOverride<GatewayMenuTranslations> = {
  gateway: '网关',
  connected: '已连接',
  connecting: '连接中',
  offline: '离线',
  closed: '已关闭',
  error: '错误',
  inferenceReady: '推理已就绪',
  inferenceNotReady: '推理未就绪',
  checkingInference: '正在检查推理',
  disconnected: '已断开',
  reconnectGateway: '重连网关',
  openSystem: '打开系统面板',
  connection: label => `连接：${label}`,
  recentActivity: '最近活动',
  viewAllLogs: '查看全部日志 →',
  messagingPlatforms: '消息平台'
}
