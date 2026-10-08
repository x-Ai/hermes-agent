import type { TranslationOverrides } from './define-locale'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into ru.ts.
export const ruGoalStatus = {
  goalStatus: {
    standingGoal: 'Текущая цель',
    waitTargets: {
      session: id => `сессия ${id}`,
      pid: pid => `процесс ${pid}`,
      remaining: seconds => `осталось ${seconds} с`,
      seconds: seconds => `${seconds} с`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `Цель ожидает${byJudge ? ' (решение судьи)' : ''} — ${target}: ${reason}`,
    parkedOnPid: (pid, reason) =>
      `Цель ожидает процесс ${pid}${reason ? ` (${reason})` : ''}. Цикл приостановлен до его завершения.`,
    parkedStatus: (reason, meta, goal) => `Цель (ожидает: ${reason}, ${meta}): ${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) => `Цель (ожидает ${seconds} с — ${reason}, ${meta}): ${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} ходов`,
      subgoals: count => `подцелей: ${count}`,
      contract: 'с контрактом',
      gates: count => `проверок: ${count}`,
      separator: ', '
    },
    set: (budget, goal) => `Цель задана (бюджет ${budget} ходов): ${goal}`,
    replacedPrevious: '(предыдущая цель заменена)',
    previousWas: previous => `было: ${previous}`,
    contractLabel: 'Контракт завершения:',
    draftedContractLabel: 'Черновик контракта завершения:',
    judgeTrailer: againstContract =>
      `После каждого хода модель-судья проверяет, достигнута ли цель${againstContract ? ' по контракту выше' : ''}. Hermes продолжает работать, пока она не будет достигнута, пока вы не поставите её на паузу или не очистите, либо пока не исчерпается бюджет. Используйте /goal status, /goal show, /goal pause, /goal resume, /goal clear.`,
    draftTightenHint:
      'Уточните любое поле, задав цель заново строками вида verify: <команда>, затем /goal resume. Для просмотра используйте /goal show.',
    draftFailed:
      'Не удалось составить контракт (вспомогательная модель недоступна) — цель выполняется в свободной форме. Судья по ходам по-прежнему применяется.',
    ignoredControlWords: rest =>
      `(${rest} проигнорировано: управляющая команда никогда не задаёт текст цели — используйте /goal -- <текст>, если цель действительно начинается с управляющего слова.)`,
    paused: goal => `Цель на паузе: ${goal}`,
    resumed: goal => `Цель возобновлена: ${goal}`,
    cleared: 'Цель очищена.',
    noActiveGoal: 'Нет активной цели.',
    noActiveGoalHint: 'Нет активной цели. Задайте её командой /goal <текст>.',
    noGoalSet: 'Цель не задана.',
    noGoalToResume: 'Нет цели для возобновления.',
    waitBarrierCleared: 'Барьер ожидания снят — цикл цели возобновляется.',
    noWaitBarrier: 'Барьер ожидания не задан.',
    activeStatus: (meta, goal) => `Цель (активна, ${meta}): ${goal}`,
    pausedStatus: (meta, reason, goal) => `Цель (на паузе, ${meta}${reason ? ` — ${reason}` : ''}): ${goal}`,
    doneStatus: (meta, goal) => `Цель выполнена (${meta}): ${goal}`,
    noContract: '(нет контракта завершения — задайте его через /goal draft <цель> или строками вида поле: значение)',
    noActiveGoalParen: '(нет активной цели)',
    continuing: (used, max, reason) => `Продолжаем движение к цели (${used}/${max}): ${reason}`,
    achieved: reason => `Цель достигнута: ${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `Цель на паузе — использовано ${used}/${max} ходов${gateStillFailing ? ' (одна из проверок качества всё ещё не проходит)' : ''}. /goal resume — продолжить, /goal clear — остановить.`,
    pausedGatesNotRun: refusal =>
      `Цель на паузе — проверки качества не запущены: ${refusal}. Исправьте рабочее пространство или удалите проверки через /goal gate remove, затем /goal resume.`,
    pausedGateFailing: (retries, command, exitCode) =>
      `Цель на паузе — проверка качества всё ещё не проходит после ${retries} повторов: $ ${command} (код выхода ${exitCode}). Исправьте вручную или удалите её через /goal gate remove, затем /goal resume.`,
    pausedJudgeErrors: (turns, configPath) =>
      `Цель на паузе — API судьи вернул ошибки (${turns} ходов). Проверьте провайдера/ключ goal_judge в ${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `Цель на паузе — модель-судья (${turns} ходов) не возвращает требуемый JSON-вердикт. Переключите судью на более строгую модель в ${configPath}`,
    thenResume: 'Затем /goal resume, чтобы продолжить.',
    unachievable: reason =>
      `Цель признана недостижимой — пауза: ${reason} Переопределите её через /goal set или продолжите принудительно через /goal resume.`,
    gateAdded: (command, retries, timeout) =>
      `Проверка добавлена: $ ${command} (${retries} повторов, таймаут ${timeout} с). Она должна пройти до завершения цели.`,
    gateRemoved: command => `Проверка удалена: $ ${command}`,
    gatesCleared: count => `Удалено проверок: ${count}.`,
    noGates: '(нет проверок качества — добавьте через /goal gate add <команда>)',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ проходит',
    gateFailing: (exitCode, attempt, maxRetries) =>
      `✗ не проходит (код выхода ${exitCode}, попытка ${attempt}/${maxRetries})`
  }
} satisfies Pick<TranslationOverrides, 'goalStatus'>
