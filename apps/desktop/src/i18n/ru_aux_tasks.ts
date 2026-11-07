import type { AuxTaskCopyMap } from './types_aux_tasks'

export const ruAuxTasks: AuxTaskCopyMap = {
  vision: { label: 'Зрение', hint: 'Анализ изображений' },
  compression: { label: 'Сжатие', hint: 'Сжатие контекста' },
  approval: { label: 'Подтверждение', hint: 'Умное автоподтверждение' },
  mcp: { label: 'MCP', hint: 'Маршрутизация MCP-инструментов' },
  title_generation: { label: 'Генерация заголовков', hint: 'Заголовки сеансов' },
  review: { label: 'Проверка', hint: 'Субагент-рецензент для /review' },
  voice_chat: { label: 'Голосовой чат', hint: 'Ответы в голосовом режиме' },
  triage_specifier: { label: 'Спецификатор сортировки', hint: 'Проработка спецификаций канбана' },
  kanban_decomposer: { label: 'Канбан-декомпозер', hint: 'Декомпозиция задачи' },
  profile_describer: { label: 'Описание профилей', hint: 'Автоописания профилей' },
  curator: { label: 'Куратор', hint: 'Анализ использования навыков' }
}
