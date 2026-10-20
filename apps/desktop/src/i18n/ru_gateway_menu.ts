import type { TranslationOverride } from '@hermes/shared/i18n'

import type { GatewayMenuTranslations } from './types_gateway_menu'

/** The statusbar gateway menu (shell): connection states, inference readiness and its actions. */
export const ruGatewayMenu: TranslationOverride<GatewayMenuTranslations> = {
  gateway: 'Шлюз',
  connected: 'Подключён',
  connecting: 'Подключение',
  offline: 'Недоступен',
  closed: 'Закрыто',
  error: 'Ошибка',
  inferenceReady: 'Инференс готов',
  inferenceNotReady: 'Инференс не готов',
  checkingInference: 'Проверка инференса',
  disconnected: 'Отключён',
  reconnectGateway: 'Переподключить шлюз',
  openSystem: 'Открыть системную панель',
  connection: label => `Соединение: ${label}`,
  recentActivity: 'Недавняя активность',
  viewAllLogs: 'Все журналы →',
  messagingPlatforms: 'Платформы сообщений'
}
