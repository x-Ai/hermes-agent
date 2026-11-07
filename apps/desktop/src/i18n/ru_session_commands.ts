import { RU_PLURAL } from './ru_plural'

// Typed /undo /retry /steer /queue lines (en_session_commands.ts is the source).
export const ruSessionCommands = {
  undoUsage: 'использование: /undo [N]',
  undoNothing: 'нечего отменять',
  undidOne: (count: string) =>
    `отменено ${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')} — текст возвращён в композер`,
  undidOther: (count: string) =>
    `отменено ${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')} — текст возвращён в композер`,
  retryNothing: 'нечего повторять',
  retryUnsupported: '/retry: нельзя повторить медиа или неизвестные части содержимого',
  busy: (command: string) =>
    `сеанс занят — Hermes ещё отвечает. Сначала остановите текущий ответ (кнопка «Стоп» или Ctrl+C в терминале), затем выполните /${command}.`,
  busyCompressing: (command: string) =>
    `сеанс занят — выполняется /compress; выполните /${command}, когда он завершится.`,
  steerUsage: 'использование: /steer <промпт>',
  steerQueued: (preview: string) => `уточнение в очереди — придёт после следующего вызова инструмента: «${preview}»`,
  steerNoActiveTurn: (preview: string) => `нет активного хода — поставлено в очередь на следующий: «${preview}»`,
  steerRejected: 'уточнение отклонено — нет активного хода, поставлено в очередь на следующий ход',
  queued: (preview: string) => `в очереди: «${preview}»`,
  queueFailed: 'не удалось поставить сообщение в очередь',
  countOne: (count: string) => `${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')} в очереди`,
  countOther: (count: string) => `${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')} в очереди`,
  queueEditKeptTitle: 'Сообщение в очереди не изменено',
  queueEditKept:
    'Оно уже начало обрабатываться или было отклонено до сохранения правки. Отредактированный текст остался в композере.',
  queueEditUnconfirmedTitle: 'Правка не подтверждена',
  queueEditUnconfirmed:
    'Hermes не смог подтвердить правку. Сохраните ещё раз, чтобы повторить ту же правку; дважды в очередь она не попадёт.'
}
