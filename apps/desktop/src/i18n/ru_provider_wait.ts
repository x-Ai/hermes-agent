import type { ProviderWaitThreadCopy } from './types_provider_wait'

// Backend wait / retry status lines (see types_provider_wait.ts), spread into
// `assistant.thread` in ru.ts.
export const ruProviderWait: ProviderWaitThreadCopy = {
  modelContinuing: (attempt, maxAttempts) =>
    `Модель вернула рассуждения без итогового ответа — запрашиваем продолжение (${attempt}/${maxAttempts})`,
  providerReconnecting: (elapsedSeconds, kind) =>
    `No ${kind} from the provider after ${elapsedSeconds}s - воссоединение..`,
  providerRetrying: (retrySeconds, attempt, maxAttempts) =>
    `Ожидание провайдера — повтор через ${retrySeconds} с (попытка ${attempt}/${maxAttempts})`,
  providerRetryReasons: {
    rate_limited: 'Превышен лимит запросов',
    overloaded: 'Провайдер перегружен',
    free_model_busy: 'Бесплатная модель занята'
  },
  providerRetryingAfter: (reason, resetWindow, retrySeconds, attempt, maxAttempts) =>
    `${reason} — ${resetWindow ? `сброс через ${resetWindow}, ` : ''}повтор через ${retrySeconds} с (попытка ${attempt}/${maxAttempts})`,
  providerAutoRecovering: (retrySeconds, cycle, total, stopHint) =>
    `Провайдер временно недоступен — автоматический повтор через ${retrySeconds} с (цикл ${cycle}/${total})${
      stopHint ? `; ${stopHint}` : ''
    }`,
  providerStopHints: {
    esc: 'нажмите Esc, чтобы остановить',
    cancelRequest: 'отмените запрос, чтобы остановить',
    stopCommand: 'отправьте /stop, чтобы отменить'
  },
  providerWaitPhases: {
    first_event: seconds => `${seconds} с ожидания первого события провайдера`,
    reconnect: seconds => `${seconds} с ожидания первого события провайдера после переподключения`,
    pre_progress: seconds => `поток провайдера открыт; ${seconds} с без существенного прогресса модели`,
    post_event: seconds => `поток провайдера активен; ${seconds} с без событий потока`,
    first_chunk: seconds => `${seconds} с ожидания первого фрагмента потока`,
    post_chunk: seconds => `поток открыт; ${seconds} с без вывода потока`
  },
  providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
    `${stillWaiting ? 'Всё ещё ожидаем' : 'Ожидаем'} ${model} — ${phaseText}${
      watchdog ? ` (автопереподключение: сторожевой таймер «${watchdog.label}» через ${watchdog.seconds} с)` : ''
    }`
}
