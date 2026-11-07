import type { ClarifyCopy } from './types_clarify'

export const ruClarify: Partial<ClarifyCopy> = {
  notReady: 'Запрос уточнения ещё не готов',
  gatewayDisconnected: 'Hermes сейчас недоступен. Переподключитесь и отправьте ещё раз.',
  sendFailed: 'Не удалось отправить ответ на уточнение',
  loadingQuestion: 'Загрузка вопроса…',
  other: 'Другое (введите ответ)',
  placeholder: 'Введите ответ…',
  skip: 'Пропустить',
  skipped: 'Пропущено',
  noAnswer: 'Нет ответа',
  confirmAndContinueLabel: 'Подтвердить и продолжить',
  recommendedSuffix: ' (рекомендуется)',
  singleSelectHint: 'Выберите один вариант',
  multiSelectHint: 'Выберите все подходящие варианты',
  oneQuestion: '1 вопрос',
  questionProgress: (answered, total) => `Отвечено: ${answered} из ${total}`,
  notDelivered:
    'Этот вопрос не дошёл до приложения, поэтому ответить здесь нельзя. Нажмите «Стоп», чтобы завершить ход, и ответьте в чате.'
}
