import type { AuxTaskCopyMap } from './types_aux_tasks'

export const ruAuxTasks: AuxTaskCopyMap = {
  vision: { label: 'Зрение', hint: 'Анализ изображений' },
  compression: { label: 'Сжатие', hint: 'Компрессия контекста' },
  skills_hub: { label: 'Хаб навыков', hint: 'Поиск навыков' },
  approval: { label: 'Одобрение', hint: 'Умное авто-одобрение' },
  mcp: { label: 'MCP', hint: 'Маршрутизация MCP-инструментов' },
  title_generation: { label: 'Ген. заголовка', hint: 'Заголовки сеансов' },
  review: { label: 'Обзор', hint: '/review субагент рецензента' },
  voice_chat: { label: 'Голосовой чат', hint: 'Ответы в голосовом режиме' },
  triage_specifier: { label: 'Спецификатор сортировки', hint: 'Доработка спецификации Канбана' },
  kanban_decomposer: { label: 'Канбан-декомпозер', hint: 'Декомпозиция задачи' },
  profile_describer: { label: 'Описатель профиля', hint: 'Описания автопрофилей' },
  curator: { label: 'Куратор', hint: 'Просмотр использования навыков' }
}
