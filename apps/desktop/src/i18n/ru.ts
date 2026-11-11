// health: allow FILE_LINES -- locale data: translated copy for the usage-window plan UI (allowance gauges, Large/Free tags, the limit card), one key per string
import { defineFieldCopy } from '@/app/settings/field-copy'

import { defineLocale, type TranslationOverrides } from './define-locale'
import { ruBilling } from './ru_billing'
import { ruBoot } from './ru_boot'
import { ruCatalog, ruSkillDeepLink } from './ru_catalog'
import { ruClarify } from './ru_clarify'
import { ruConnectors } from './ru_connectors'
import { ruCronControl } from './ru_cron_control'
import { ruCustomEndpoints } from './ru_custom_endpoints'
import { ruDelegationFieldLabels } from './ru_delegation_fields'
import { ruDropWarning } from './ru_drop_warning'
import { ruFirstRun } from './ru_first_run'
import { ruGatewayMenu } from './ru_gateway_menu'
import { ruGoalStatus } from './ru_goal_status'
import { ruLocalModels } from './ru_local_models'
import { ruMemoryLayers } from './ru_memory_layers'
import { ruModelMenu } from './ru_model_menu'
import { ruModelSettings } from './ru_model_settings'
import { ruNotices } from './ru_notices'
import { ruNotifications } from './ru_notifications'
import { ruOnboarding } from './ru_onboarding'
import { ruPluginUpdateAll } from './ru_plugin_update_all'
import { ruPluginSettings } from './ru_plugins'
import { ruProjects } from './ru_projects'
import { ruProviderWait } from './ru_provider_wait'
import { ruRuntime } from './ru_runtime'
import { ruSharedMetrics } from './ru_shared_metrics'
import { ruThemePicker } from './ru_theme_picker'
import { ruUninstallSection } from './ru_uninstall_section'
import { ruUpdateChannel } from './ru_update_channel'

// RU_PLURAL: (count, one, few, many) — русские формы сущ. падежа
// RU_NOUN: (count, one, few, many) — формы род. множественного
// count может быть number или string (часть подписей en.ts передаёт строки)
const ruNum = (count: number | string) => (typeof count === 'string' ? Number(count) || 0 : count)

const RU_PLURAL = (count: number | string, one: string, few: string, many: string) => {
  const c = ruNum(count)
  const n = Math.abs(c) % 10
  const nn = Math.abs(c) % 100

  return n === 1 && nn !== 11 ? one : n >= 2 && n <= 4 && (nn < 12 || nn > 14) ? few : many
}

const RU_NOUN = (count: number | string, one: string, few: string, many: string) => {
  const c = ruNum(count)
  const n = Math.abs(c) % 10
  const nn = Math.abs(c) % 100

  return n === 1 && nn !== 11 ? one : n >= 2 && n <= 4 && (nn < 12 || nn > 14) ? few : many
}

export const ruOverrides = {
  catalog: ruCatalog,
  connectors: ruConnectors.connectors,
  sharedMetrics: ruSharedMetrics,
  firstRun: ruFirstRun,
  sessionImport: ruConnectors.sessionImport,
  common: {
    apply: 'Применить',
    back: 'Назад',
    save: 'Сохранить',
    saving: 'Сохранение…',
    cancel: 'Отмена',
    change: 'Изменить',
    choose: 'Выбрать',
    clear: 'Очистить',
    close: 'Закрыть',
    collapse: 'Свернуть',
    confirm: 'Подтвердить',
    connect: 'Подключить',
    connecting: 'Подключение',
    continue: 'Продолжить',
    copied: 'Скопировано',
    copy: 'Копировать',
    copyFailed: 'Не удалось скопировать',
    defaultName: 'по умолчанию',
    delete: 'Удалить',
    docs: 'Документация',
    done: 'Готово',
    error: 'Ошибка',
    expand: 'Развернуть',
    failed: 'Ошибка',
    failedToRender: name => `Не удалось отобразить «${name}»`,
    formatJson: 'Форматировать JSON',
    free: 'Бесплатно',
    loading: 'Загрузка…',
    loadingStatus: 'Загрузка',
    moreActions: 'Ещё действия',
    notSet: 'Не задано',
    openFullView: 'Открыть в полном размере',
    refresh: 'Обновить',
    remove: 'Удалить',
    replace: 'Заменить',
    retry: 'Повторить',
    reset: 'Сбросить',
    run: 'Запустить',
    search: 'Поиск',
    send: 'Отправить',
    set: 'Установить',
    showOptions: 'Показать параметры',
    skip: 'Пропустить',
    update: 'Обновить',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    tryHint: term => `Попробуйте «${term}»`,
    on: 'Вкл',
    off: 'Выкл',
    bots: 'Боты'
  },
  media: {
    displayLabel: (kind, name) => {
      const labels = { audio: 'Аудио', file: 'Файл', image: 'Изображение', video: 'Видео' }

      return `${labels[kind]}: ${name}`
    }
  },
  fileMenu: {
    revealFinder: 'Показать в Finder',
    revealExplorer: 'Показать в Проводнике',
    revealFileManager: 'Показать в папке',
    revealInSidebar: 'Показать в дереве файлов',
    copyPath: 'Копировать путь',
    copyRelativePath: 'Копировать относительный путь',
    download: 'Скачать',
    downloadSaved: 'Сохранено',
    downloadFailed: 'Не удалось скачать',
    rename: 'Переименовать…',
    delete: 'Удалить',
    renameTitle: 'Переименование',
    renameLabel: 'Новое имя',
    deleteTitle: name => `Удалить ${name}?`,
    deleteBody: 'Элемент будет перемещён в корзину — его можно восстановить оттуда.',
    pathCopied: 'Путь скопирован',
    revealMissing: 'Этой папки нет на этом компьютере',
    revealUnavailable:
      'Этот путь отсутствует на этом компьютере — он находится на серверной машине. Используйте «Показать в дереве файлов».'
  },
  boot: ruBoot.boot,
  notifications: {
    sharedProfileWarning:
      'Другая установка Hermes использует этот профиль. Обе установки используют общие настройки и данные, поэтому изменения могут конфликтовать. Можно продолжить работу или закрыть другую установку перед внесением изменений.',
    region: 'Уведомления',
    hide: 'Скрыть',
    show: 'Показать',
    more: count =>
      `Ещё ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'уведомление' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'уведомления' : 'уведомлений'}`,
    clearAll: 'Очистить всё',
    dismiss: 'Закрыть уведомление',
    details: 'Подробности',
    copyDetail: 'Копировать подробность',
    copyDetailFailed: 'Не удалось скопировать подробность уведомления',
    backendOutOfDateTitle: 'Устаревший бэкенд',
    backendOutOfDateMessage:
      'Ваш бэкенд Hermes старше этой сборки приложения и может работать некорректно. Обновите их, чтобы они совпали.',
    desktopOutOfDateTitle: 'Устаревшее приложение',
    desktopOutOfDateMessage:
      'Это приложение Hermes старше подключённого бэкенда и может работать некорректно. Обновите приложение, чтобы они совпали.',
    updateDesktopApp: 'Обновить приложение',
    installMethodUnsupportedTitle: 'Неподдерживаемый способ установки',
    updateHermes: 'Обновить Hermes',
    updateReadyTitle: 'Обновление готово',
    updateReadyMessage: count =>
      `Доступно ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'новое изменение' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'новых изменения' : 'новых изменений'}.`,
    updateReadyMessageUnknown: 'Доступно новое обновление.',
    seeWhatsNew: 'Смотреть, что нового',
    toast: {
      artifactPartialLoad: (failed, total) =>
        `При индексации артефактов пропущено ${failed} из ${total} ${RU_PLURAL(total, 'недавнего сеанса', 'недавних сеансов', 'недавних сеансов')}.`,
      artifactSafeLimitExceeded: count =>
        `${count} ${RU_PLURAL(count, 'превысил', 'превысили', 'превысили')} безопасный лимит загрузки истории.`,
      artifactUnreadable: count => `${count} не удалось прочитать.`,
      attachmentLimitSaveFailed: 'Не удалось сохранить максимальный размер вложения',
      localEndpointSaveFailed: 'Не удалось сохранить локальную конечную точку',
      memoryConnectionStartFailed: 'Не удалось начать соединение',
      memoryFieldSaveFailed: label => `Не удалось сохранить ${label}`,
      memoryProviderSavedMessage: 'Конфигурация провайдера памяти обновлена.',
      memoryProviderSavedTitle: label => `${label}: сохранено`,
      memoryProviderSettingsSaveFailed: label => `Не удалось сохранить настройки ${label}`,
      modelChangeFailed: 'Не удалось сменить модель',
      onboardingReadyTitle: 'Hermes готов',
      openBrowserWindowFailed: 'Не удалось открыть браузер в отдельном окне',
      openNewWindowFailed: 'Не удалось открыть новое окно',
      openSessionTerminalFailed: 'Не удалось открыть чат в терминале',
      openSessionWindowFailed: 'Не удалось открыть чат в новом окне',
      petDraftsReadyMessage: 'Питомец почти готов — выберите вариант, который вылупится.',
      petDraftsReadyTitle: 'Эскизы питомца готовы',
      petGenerationFailedTitle: 'Не удалось создать питомца',
      petHatchedMessage: 'Откройте снова, чтобы дать ему имя и забрать его.',
      petHatchedTitle: 'Ваш питомец вылупился',
      petHatchingFailedTitle: 'Питомец не вылупился',
      petReopenTryAgain: 'Откройте, чтобы попробовать снова.',
      pluginLoadFailed: origin => `Не удалось загрузить плагин «${origin}»`,
      pluginRegisterFailed: name => `Не удалось зарегистрировать плагин «${name}»`,
      pluginsFolderOpenFailed: 'Не удалось открыть папку плагинов',
      pluginsFolderResolveFailed: 'Не удалось определить папку плагинов',
      pluginsFolderUnavailable: 'Плагины приложения недоступны',
      pluginsHomeUnavailable: 'Бэкенд не сообщил свой домашний каталог',
      gatewayConnectFailed: 'Не удалось подключиться к шлюзу Hermes',
      processStopFailed: 'Не удалось остановить процесс',
      providerConnected: provider => `${provider}: подключено.`,
      providerSaveFailed: label => `Не удалось сохранить ${label}`,
      reactionFailed: 'Не удалось поставить реакцию',
      runtimeNotReadyMessage:
        'Hermes Desktop не смог проверить работоспособность бэкенда при запуске. Некоторые функции могут быть недоступны, пока шлюз не будет доступен.',
      runtimeNotReadyTitle: 'Среда выполнения не готова',
      toolGatewayEnabledMessage: labels => {
        const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} и ${labels.at(-1)}`

        return `${list}: теперь через вашу подписку Nous — отдельные API-ключи не нужны.`
      },
      toolGatewayEnabledTitle: 'Tool Gateway включён',
      toolGatewayTools: {
        browser: 'автоматизация браузера',
        image_gen: 'генерация изображений',
        tts: 'синтез речи',
        video_gen: 'генерация видео',
        web: 'веб-поиск и извлечение'
      },
      unknownError: 'Неизвестная ошибка',
      view: 'Просмотр'
    },
    mcp: {
      needsAuthTitle: 'Серверу MCP требуется повторная аутентификация',
      needsAuthMessage: name => `Для MCP ${name} требуется повторная аутентификация.`,
      errorTitle: 'Сервер MCP недоступен',
      errorMessage: name => `MCP ${name} не прошёл проверку работоспособности.`,
      signIn: 'Войти',
      view: 'Просмотр',
      disable: 'Отключить',
      disabledMessage: name => `${name} MCP отключён. Включить снова можно в любой момент в разделе Возможности → MCP.`,
      disableFailed: name => `Не удалось отключить ${name} MCP.`
    },
    errors: {
      agentInitUnknownProvider: provider =>
        `Не удалось инициализировать агента: неизвестный провайдер «${provider}». Запустите «hermes model», чтобы посмотреть доступных провайдеров, или «hermes doctor» для диагностики проблем конфигурации.`,
      unknownProvider: provider =>
        `Неизвестный провайдер «${provider}». Запустите «hermes model», чтобы посмотреть доступных провайдеров, или «hermes doctor» для диагностики проблем конфигурации.`,
      fastModeUnavailable: 'Быстрый режим недоступен для этой модели.',
      apiRetriesExhausted: retries =>
        `Вызов API завершился ошибкой после ${retries} ${RU_PLURAL(retries, 'повторной попытки', 'повторных попыток', 'повторных попыток')}`,
      invalidApiResponseAfterRetries: (retries, detail) =>
        `Недопустимый ответ API после ${retries} ${RU_PLURAL(retries, 'повторной попытки', 'повторных попыток', 'повторных попыток')}: ${detail}`,
      resetsIn: remaining => `До сброса: ${remaining}`,
      providerRetriesExhausted: (reason, label, attempts, resetWindow) => {
        const lead = {
          rate_limit: `${label} ограничил частоту запросов во всех ${attempts} попытках`,
          overloaded: `${label} сообщил о перегрузке во всех ${attempts} попытках`,
          server_error: `${label} вернул ошибку сервера во всех ${attempts} попытках`,
          timeout: `${label} не ответил вовремя ни в одной из ${attempts} попыток`,
          unknown: `${label} не ответил после ${attempts} попыток`
        }[reason]

        const situation = resetWindow
          ? `его лимит использования сбросится через ${resetWindow}. После этого отправьте /retry или смените модель командой /model.`
          : 'похоже, он временно недоступен. Подождите минуту и отправьте /retry или смените модель командой /model.'

        return `${lead} — ${situation} Чтобы избежать этого в будущем, добавьте резервного провайдера командой \`hermes fallback add\`.`
      },
      providerSaid: summary => `Ответ провайдера: ${summary}`,
      providerInvalidResponse: (label, attempts) =>
        `${label} ${attempts} ${RU_PLURAL(attempts, 'раз', 'раза', 'раз')} подряд вернул пустой или повреждённый ответ — вероятно, он перегружен или ограничивает ваши запросы. Подождите минуту и отправьте /retry или смените модель командой /model.`,
      errorDetailsLine: detail => `Подробности: ${detail}`,
      elevenLabsNeedsKey: 'Для голосового ввода нужен ключ ElevenLabs. Добавьте его в разделе Настройки → Ключи.',
      elevenLabsRejectedKey:
        'ElevenLabs не принял ваш API-ключ. Обновите его в разделе Настройки → Ключи и попробуйте снова.',
      diskFull: 'Диск заполнен — освободите место и повторите.',
      fileNotFound: target => (target ? `Файл не найден: ${target}` : 'Файл не найден'),
      gatewayAuthFailed:
        'Этот Hermes больше не принимает сохранённый вход. Откройте «Шлюзы» и войдите снова (или вставьте новый токен доступа), затем повторите.',
      invalidExternalUrl: 'Недействительный внешний URL',
      invalidPreviewUrl: 'Недопустимый URL предпросмотра.',
      methodNotAllowed:
        'Фоновая служба Hermes не согласована с приложением — вероятно, после обновления. Перезапустите её, чтобы это исправить.',
      microphonePermission: 'Доступ к микрофону запрещён.',
      openaiRejectedApiKey:
        'OpenAI не принял ваш API-ключ. Обновите его в разделе Настройки → Ключи и попробуйте снова.',
      openaiRejectedApiKeyWithStatus: status => `OpenAI отклонил API-ключ (${status} invalid_api_key).`,
      openaiTtsNeedsKey: 'Для голоса нужен ключ OpenAI. Добавьте его в разделе Настройки → Ключи.',
      restoreTargetMissing: 'Целевого сообщения больше нет в истории этого сеанса. Обновите сеанс и попробуйте снова.',
      restoreTargetUnsafe: 'Эту контрольную точку нельзя безопасно восстановить. Обновите сеанс и попробуйте снова.',
      sessionStoppedBeforeAgentReady: 'Сеанс остановился до того, как агент был готов.',
      turnCancelledBeforeAgentReady: 'Ход отменён до того, как агент был готов.',
      codeSkewRestartRequired:
        'Hermes был обновлен, но все еще использует старую версию. Перезапустите его, чтобы завершить обновление.',
      storageFailure:
        'Hermes не удалось сохранить данные в свою папку. Откройте «Обслуживание», чтобы проверить и восстановить её.',
      rpcOutOfSync: 'У приложения и бэкенда разные версии. Обновите оба.',
      restartHermesFailed: 'Не удалось перезапустить Hermes.'
    },
    voice: {
      configureSpeechToText: 'Настройте распознавание речи, чтобы использовать голосовой режим.',
      couldNotStartSession: 'Не удалось начать голосовой сеанс',
      microphoneAccessDenied: 'Доступ к микрофону запрещён.',
      microphoneConstraintsUnsupported: 'Ограничения микрофона не поддерживаются этим устройством.',
      microphoneFailed: 'Ошибка микрофона',
      microphoneInUse: 'Микрофон уже используется другим приложением.',
      microphonePermissionDenied: 'Доступ к микрофону запрещён.',
      microphoneStartFailed: 'Не удалось начать запись с микрофона.',
      microphoneUnsupported: 'Это окружение не поддерживает запись с микрофона.',
      noMicrophone: 'Микрофон не найден.',
      noSpeechDetected: 'Речь не обнаружена',
      playbackFailed: 'Не удалось воспроизвести голос',
      recordingFailed: 'Не удалось записать голос',
      sayStopToEnd: phrase => `Скажите «${phrase}», чтобы закончить голосовой чат.`,
      transcriptionFailed: 'Не удалось расшифровать речь',
      transcriptionUnavailable: 'Расшифровка речи пока недоступна.',
      tryRecordingAgain: 'Попробуйте записать ещё раз.',
      unavailable: 'Голос недоступен',
      liveEnded: 'Голосовой чат в реальном времени завершён',
      liveError: 'Голосовой чат в реальном времени',
      liveDelegationFailed: 'Не удалось передать запрос Hermes.',
      liveUnavailable: reason =>
        `Голосовой чат GPT-Live недоступен: ${reason}. Вместо него используется распознавание речи.`,
      liveEndedConnectionLost: 'Голосовой чат в реальном времени потерял соединение.',
      liveEndedClosed: 'Сервис закрыл голосовой чат в реальном времени.',
      microphoneNeedsHttps:
        'Микрофону нужно защищённое соединение. Откройте Webapp по HTTPS или через SSH-туннель к 127.0.0.1, чтобы им пользоваться.'
    },
    native: {
      approvalTitle: 'Требуется одобрение',
      approveAction: 'Одобрить',
      rejectAction: 'Отклонить',
      inputTitle: 'Требуется ввод',
      inputBody: 'Hermes ожидает ваш ответ.',
      turnDoneTitle: 'Hermes завершил',
      turnDoneBody: 'Сообщение завершено.',
      turnErrorTitle: 'Ход не удался',
      backgroundDoneTitle: 'Фоновая задача завершена',
      backgroundFailedTitle: 'Фоновая задача не удалась',
      creditsTitle: 'Кредиты',
      approvalTitleNamed: session => `Требуется одобрение — ${session}`,
      inputTitleNamed: session => `Требуется ввод — ${session}`
    },
    gatewayErrorTitle: 'Ошибка Hermes',
    gatewayErrorFallback: 'Hermes сообщил об ошибке',
    actions: {
      restartHermes: 'Перезапустить Hermes',
      openKeys: 'Открыть ключи',
      openGateways: 'Открыть шлюзы',
      openMaintenance: 'Открыть обслуживание'
    }
  },
  ...ruNotices,
  ...ruGoalStatus,
  billingPage: {
    title: 'Оплата',
    paymentAndCredits: 'Оплата и кредиты',
    usage: 'Использование',
    balance: 'Баланс',
    plan: 'План',
    autoRefill: 'Автопополнение',
    openPortal: 'Открыть портал',
    connectNousTitle: 'Подключите аккаунт Nous',
    connectNousBody: 'Выполните /portal в TUI или откройте портал Nous, чтобы подключить аккаунт.',
    freeTierNoticeTitle: 'Вы на бесплатном тарифе Nous',
    openPortalArrow: 'Открыть портал ↗',
    customCreditAmount: 'Своя сумма кредитов',
    buy: 'Купить',
    processingSettlement: 'Обработка… проверяем зачисление',
    creditsAdded: amount => `Добавлено: ${amount}. Баланс обновляется.`,
    creditsAddedShort: amount => `Добавлено: ${amount}`,
    creditsAddedTitle: 'Кредиты добавлены',
    usageFallback: label => `Использование: ${label}`,
    invoices: 'Счета',
    preview: 'предпросмотр',
    previewFixture: 'Тестовые данные для предпросмотра оплаты (только для разработки)',
    live: 'реальные данные',
    openVerification: 'Открыть страницу проверки',
    dismiss: 'Закрыть',
    waitingVerification: 'Ждём ссылку для проверки…',
    verifyToContinue: 'Пройдите проверку, чтобы продолжить',
    autoRefillUpdated: 'Автопополнение обновлено.',
    autoRefillOff: 'Автопополнение выключено.',
    threshold: 'Порог',
    reloadTo: 'Пополнять до',
    autoRefillThresholdLabel: 'Порог автопополнения',
    autoRefillReloadToLabel: 'Сумма, до которой пополнять',
    turnOffConfirm: 'Выключить автопополнение?',
    turnOff: 'Выключить',
    disable: 'Отключить',
    manage: 'Управлять',
    checkingChange: 'Проверяем это изменение…',
    changeBlocked: 'Это изменение нельзя внести здесь.',
    alreadyOnPlan: name => `Вы уже на плане ${name} — менять нечего.`,
    scheduledChange: (name, date, creditsDelta) =>
      `Переход на ${name} вступит в силу ${date}. Сейчас ничего не списывается, до этого момента остаётся текущий план.${creditsDelta ? ` Изменение ежемесячных кредитов: ${creditsDelta}.` : ''}`,
    cannotSchedule: 'Это изменение нельзя запланировать здесь.',
    tryAgain: 'Повторить',
    scheduling: 'Планирование…',
    confirmDowngrade: 'Подтвердить понижение',
    downgrade: 'Понизить',
    currentPlan: 'Текущий план',
    scheduled: 'Запланировано',
    perMonth: price => `${price}/мес.`,
    backToBilling: 'Назад к оплате',
    plans: 'Планы',
    noPlans: 'Сейчас нет планов, на которые можно перейти.',
    undoing: 'Отмена…',
    undo: 'Отменить',
    addCardArrow: 'Добавить карту ↗',
    noPaymentMethodTitle: 'Нет сохранённого способа оплаты',
    noCardBody: 'Покупка кредитов и автопополнение недоступны, пока не сохранена карта. Добавьте её на портале.',
    enabled: 'Включено',
    subscriptionUnavailable: 'Данные о подписке недоступны, но портал по-прежнему можно открыть.',
    changesToOn: (name, date) => `Смена плана на ${name}: ${date}.`,
    cancelsOn: date => `Отмена: ${date}.`,
    renewsOn: date => `Продление: ${date}`,
    noActiveSubscription: 'Нет активной подписки — платные модели расходуют кредиты пополнения.',
    changePlan: 'Сменить план',
    viewPlans: 'Посмотреть планы',
    adjustPlanArrow: 'Изменить план ↗',
    creditsPerMonth: amount => `${amount} ${RU_PLURAL(amount, 'кредит', 'кредита', 'кредитов')}/мес.`,
    chooseArrow: 'Выбрать ↗',
    addPaymentMethod: 'Добавить способ оплаты',
    paymentMethod: 'Способ оплаты',
    manageCardDescription: 'Карта, с которой оплачиваются пополнения и продление подписки.',
    cardSourceAutoRefill: 'карта автопополнения',
    cardSourceCustomerDefault: 'карта по умолчанию',
    cardSourceSubscription: 'карта подписки',
    buyCreditsNow: 'Купить кредиты сейчас',
    singleChargeDescription: 'Разовое списание с карты, кредиты поступят на баланс сегодня.',
    autoRefillDescription: 'Пополнять баланс, когда он опускается ниже порога.',
    manageAutoRefillPortal: 'Автопополнение настраивается на портале.',
    enableAutoRefillPortal: 'Включить автопополнение на портале',
    differentCard: 'другую карту',
    reconcileArrow: 'Сверить ↗',
    reconcileAutoRefill: card => `Автопополнение использует ${card} — сверьте на портале`,
    refillWhenLow: 'Пополнять при низком балансе',
    autoRefillChargeDescription: (reloadTo, threshold) =>
      `Автоматически списывает ${reloadTo}, когда баланс опускается ниже ${threshold}.`,
    creditsLeft: (remaining, total) => `Осталось ${remaining} из ${total}`,
    creditsOver: (remaining, total, over) => `Осталось ${remaining} из ${total} · сверх лимита ${over}`,
    subscriptionCreditsRemaining: 'Осталось кредитов по подписке',
    resetsOn: date => `Сброс: ${date}`,
    subscriptionCredits: 'Кредиты по подписке',
    doesNotExpire: 'Бессрочно',
    topUpCredits: 'Кредиты пополнения',
    monthlySpendCapUsed: 'Использовано из месячного лимита расходов',
    amountUsed: (spent, limit) => `Использовано ${spent} из ${limit}`,
    defaultCeiling: 'Лимит по умолчанию',
    monthlyRemoteSpending: 'Удалённые траты за месяц',
    monthlySpendCap: 'Месячный лимит расходов',
    model: 'Модель',
    connectors: 'Коннекторы',
    freeTier: 'Бесплатный тариф',
    included: 'Включено',
    freeTierName: 'Nous · бесплатный тариф',
    freeTierCaption:
      'Работает на nous/welcome, коннекторы включены. После входа коннекторы сохранятся, и станут доступны инструменты, которым нужен аккаунт, и все остальные модели.',
    freeTierFootnote:
      'На бесплатном тарифе нет баланса и ничего не нужно платить. Оплата и использование появятся после входа с аккаунтом Nous.',
    chargeFailed: 'Списание не удалось',
    chargeUnconfirmedBody: 'Платёж ещё может пройти. Проверьте портал, прежде чем повторять.',
    chargeUnconfirmedTitle: 'Результат списания не подтверждён',
    chargeCheckFailedBody: 'Не удалось подтвердить списание. Проверьте портал, прежде чем повторять.',
    chargeCheckFailedTitle: 'Не удалось проверить списание',
    chargeMaySettle: 'Платёж ещё может пройти. Проверьте портал, прежде чем повторять.',
    stillProcessing: 'Всё ещё обрабатывается спустя 5 минут',
    chargeNeedsVerification: 'Карте нужна проверка. Пройдите её и попробуйте снова.',
    cardExpired: 'Срок действия карты истёк. Обновите её на портале и попробуйте снова.',
    cardDeclined: 'Карта отклонена. Попробуйте другую карту на портале.',
    chargeFailedReason: reason =>
      `Списание не удалось (${reason}). Попробуйте снова или используйте другую карту на портале.`,
    verificationNotApprovedTitle: 'Проверка не пройдена',
    verificationNotApprovedBody: 'Проверка карты не пройдена. Попробуйте снова или используйте другую карту.',
    verificationCompleteTitle: 'Проверка пройдена',
    verificationCompleteBody: 'Карта подтверждена. Теперь можно повторить списание.',
    refusal: {
      consentTitle: 'Нужно подтвердить карту',
      consentMessage: 'Подтвердите на портале эту карту для списаний из терминала',
      scopeTitle: 'Удалённые траты требуют одобрения',
      scopeMessage: 'Для этого нужно разрешить удалённые траты. Начните пополнение, чтобы разрешить их, и повторите.',
      revokedTitle: 'Удалённые траты остановлены',
      revokedByAdmin: 'Администратор остановил удалённые траты для этого терминала.',
      revokedByUser: 'Вы остановили удалённые траты для этого терминала.',
      revokedReconnect: actor =>
        `${actor} Переподключитесь в разделе Настройки → Шлюз, чтобы снова авторизовать это устройство.`,
      sessionTitle: 'Сеанс завершён',
      sessionMessage: 'Вы вышли из сеанса. Войдите снова в разделе Настройки → Шлюз.',
      remoteSpendingOffTitle: 'Удалённые траты выключены',
      remoteSpendingOffMessage:
        'Удалённые траты для этого аккаунта выключены — администратор оплаты может включить их на странице Hermes Agent на портале.',
      roleTitle: 'Нужна роль администратора',
      roleMessage:
        'Пополнять баланс может только администратор или владелец организации. Обратитесь к администратору или управляйте на портале.',
      freshTopUpTitle: 'Начните новое пополнение',
      freshTopUpMessage: '🔴 Этот ключ списания уже использован для другой суммы. Начните новое пополнение.',
      noSavedCardTitle: 'Нет сохранённой карты',
      noSavedCardMessage:
        '💳 Карта для списаний из терминала ещё не сохранена. Добавьте её на портале (разовые покупки кредитов не сохраняют карту для повторного использования).',
      orgAccessTitle: 'Нет доступа к организации',
      orgAccessMessage: 'Этот токен не привязан к организации, которой вы можете управлять',
      monthlyCapTitle: 'Достигнут месячный лимит расходов',
      monthlyCapRemaining: remaining => `🔴 Достигнут месячный лимит расходов — осталось $${remaining}.`,
      monthlyCapMessage: '🔴 Достигнут месячный лимит расходов.',
      rateLimitTitle: 'Слишком много списаний',
      rateLimitMessage: minutes =>
        `🟡 Слишком много списаний${minutes ? ` (повторите примерно через ${minutes} мин)` : ''}. Это не ошибка оплаты.`,
      stripeTitle: 'Проблемы на стороне Stripe',
      stripeMessage: minutes =>
        `Проблемы на стороне Stripe — повторите ${minutes ? `примерно через ${minutes} мин` : 'чуть позже'}`,
      planLimitTitle: 'Достигнут дневной лимит смены плана',
      planLimitMessage: 'Достигнут дневной лимит смены плана — попробуйте завтра',
      endpointTitle: 'Сервис оплаты недоступен',
      endpointMessage: 'Сервис оплаты вернул ответ не в формате JSON (возможно, он недоступен в этом развёртывании).',
      timeoutTitle: 'Истекло время ожидания запроса оплаты',
      timeoutMessage: 'Истекло время ожидания запроса оплаты.',
      transportTitle: 'Не удалось связаться с сервисом оплаты',
      transportMessage: 'Запрос оплаты не дошёл до шлюза.',
      genericTitle: 'Запрос оплаты не удался',
      genericMessage: 'Запрос оплаты не удался.'
    }
  },
  sendDiagnostics: {
    title: 'Отправить диагностику на Nous',
    privacyNotice:
      'Пакет отладки загружается во внутреннее хранилище Nous (а не на публичный сервис вставок). В него входят сведения о системе (ОС, версии, провайдер, какие API-ключи настроены — но не сами ключи) и полные журналы агента, шлюза и приложения (до 512 КБ каждый), в которых, скорее всего, есть текст разговоров, результаты инструментов и пути к файлам. Секреты скрываются перед загрузкой. Пакет могут просматривать только сотрудники Nous и модераторы Discord из белого списка; через 14 дней он удаляется автоматически.',
    upload: 'Загрузить',
    uploading: 'Загрузка…',
    cancel: 'Отменить',
    close: 'Закрыть',
    copyLink: 'Скопировать ссылку',
    uploadIdFallback: id => `Ссылка на просмотр не получена — сообщите в поддержку ID загрузки ${id}`,
    doneTitle: 'Диагностика отправлена',
    doneDescription:
      'Ваш пакет был загружен конфиденциально. Поделитесь ссылкой ниже в своей теме поддержки, чтобы команда могла видеть ваши журналы.',
    failedTitle: 'Загрузка не удалась',
    failedHint:
      'Можно также выполнить в терминале `hermes debug share --nous` или `hermes debug share --local`, чтобы вывести отчёт без загрузки.',
    handoffLead: 'Продолжайте обсуждение в:',
    links: {
      github: 'GitHub Issues',
      portal: 'Поддержка портала Nous',
      discord: 'Discord'
    }
  },
  titlebar: {
    hideSidebar: 'Скрыть боковую панель',
    showSidebar: 'Показать боковую панель',
    search: 'Поиск',
    searchTitle: 'Поиск сеансов, видов и действий',
    swapSidebarSides: 'Поменять панели местами',
    hideRightSidebar: 'Скрыть правую панель',
    showRightSidebar: 'Показать правую панель',
    unreadSessions: count =>
      count === 1
        ? '1 непрочитанный сеанс'
        : `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'непрочитанный сеанс' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'непрочитанных сеанса' : 'непрочитанных сеансов'}`,
    muteHaptics: 'Выключить вибрацию',
    unmuteHaptics: 'Включить вибрацию',
    openSettings: 'Открыть настройки',
    openStarmap: 'Открыть граф памяти',
    enterHud: 'Режим HUD',
    exitHud: 'Выйти из режима HUD',
    resetHudLayout: 'Сбросить размер и положение HUD',
    layoutEditor: 'Редактор раскладки',
    layoutEditorTitle: mod => `Редактор раскладки — ${mod}-клик сбрасывает раскладку`,
    minimizeWindow: 'Свернуть окно',
    restoreWindow: 'Восстановить окно',
    maximizeWindow: 'Развернуть окно',
    closeWindow: 'Закрыть окно'
  },
  keybinds: {
    title: 'Горячие клавиши',
    subtitle: open => `Нажмите на сочетание, чтобы переназначить · ${open} снова открывает эту панель.`,
    search: 'Поиск горячих клавиш…',
    rebind: 'Переназначить',
    reset: 'Сбросить по умолчанию',
    resetAll: 'Сбросить всё',
    pressKey: 'Нажмите клавишу…',
    set: 'задано',
    conflictWith: label => `Также назначено на «${label}»`,
    categories: {
      composer: 'Композер',
      profiles: 'Профили',
      session: 'Сеанс',
      navigation: 'Навигация',
      view: 'Вид'
    },
    actions: {
      'keybinds.openPanel': 'Открыть горячие клавиши',
      'nav.commandPalette': 'Открыть палитру команд',
      'nav.commandCenter': 'Открыть центр команд',
      'nav.settings': 'Открыть настройки',
      'nav.profiles': 'Открыть профили',
      'nav.skills': 'Открыть навыки',
      'nav.messaging': 'Открыть мессенджеры',
      'nav.artifacts': 'Открыть артефакты',
      'nav.cron': 'Открыть запланированные задачи',
      'nav.agents': 'Открыть агенты',
      'session.new': 'Новый сеанс',
      'session.newTab': 'Новая вкладка сеанса',
      'session.newWindow': 'Новое окно',
      'session.next': 'Следующий сеанс',
      'session.prev': 'Предыдущий сеанс',
      'session.slot.1': 'Переключить на недавний сеанс 1',
      'session.slot.2': 'Переключить на недавний сеанс 2',
      'session.slot.3': 'Переключить на недавний сеанс 3',
      'session.slot.4': 'Переключить на недавний сеанс 4',
      'session.slot.5': 'Переключить на недавний сеанс 5',
      'session.slot.6': 'Переключить на недавний сеанс 6',
      'session.slot.7': 'Переключить на недавний сеанс 7',
      'session.slot.8': 'Переключить на недавний сеанс 8',
      'session.slot.9': 'Переключить на недавний сеанс 9',
      'session.focusSearch': 'Поиск по сеансам',
      'session.togglePin': 'Закрепить / открепить текущий сеанс',
      'session.archive': 'Архивировать текущий сеанс',
      'conversation.scrollPageUp': 'Прокрутить диалог на страницу вверх',
      'conversation.scrollPageDown': 'Прокрутить диалог на страницу вниз',
      'workspace.newWorktree': 'Новый worktree',
      'workspace.openFolder': 'Открыть папку как проект',
      'composer.focus': 'Сфокусировать композер',
      'composer.modelPicker': 'Открыть выбор модели',
      'composer.voice': 'Начать / остановить голосовой диалог',
      'composer.dictate': 'Начать / остановить диктовку',
      'composer.reasoningUp': 'Повысить уровень размышлений',
      'composer.reasoningDown': 'Понизить уровень размышлений',
      'view.toggleSidebar': 'Показать / скрыть панель сеансов',
      'view.toggleRightSidebar': 'Показать / скрыть браузер файлов',
      'view.toggleReview': 'Показать / скрыть панель ревью',
      'view.toggleStatusbar': 'Показать / скрыть строку состояния',
      'view.toggleTabStrip': 'Показать / скрыть вкладки',
      'view.showFiles': 'Показать браузер файлов',
      'view.showBrowser': 'Показать / скрыть браузер',
      'view.toggleHud': 'Включить / выключить режим HUD',
      'hud.snapToPointer': 'Переместить HUD под курсор (глобально, пока HUD открыт)',
      'view.showTerminal': 'Показать / скрыть терминал',
      'view.newTerminal': 'Новый терминал',
      'view.nextTerminal': 'Следующий терминал',
      'view.prevTerminal': 'Предыдущий терминал',
      'view.closeTerminal': 'Закрыть терминал',
      'view.selectionToComposer': 'Отправить выделение в композер',
      'view.terminalCopy': 'Копировать выделенное из терминала',
      'view.terminalPaste': 'Вставить в терминал',
      'view.closeTab': 'Закрыть вкладку',
      'view.reopenTab': 'Восстановить закрытую вкладку',
      'view.flipPanes': 'Поменять панели местами',
      'view.findInPage': 'Найти на странице',
      'view.findNext': 'Следующее вхождение',
      'view.findPrevious': 'Предыдущее вхождение',
      'appearance.toggleMode': 'Сменить светлую / тёмную тему',
      'layout.editMode': 'Включить / выключить редактирование раскладки',
      'profile.default': 'Переключить на профиль по умолчанию',
      'profile.switch.1': 'Переключить на профиль 1',
      'profile.switch.2': 'Переключить на профиль 2',
      'profile.switch.3': 'Переключить на профиль 3',
      'profile.switch.4': 'Переключить на профиль 4',
      'profile.switch.5': 'Переключить на профиль 5',
      'profile.switch.6': 'Переключить на профиль 6',
      'profile.switch.7': 'Переключить на профиль 7',
      'profile.switch.8': 'Переключить на профиль 8',
      'profile.switch.9': 'Переключить на профиль 9',
      'profile.switch.10': 'Переключить на профиль 10',
      'profile.switch.11': 'Переключить на профиль 11',
      'profile.switch.12': 'Переключить на профиль 12',
      'profile.switch.13': 'Переключить на профиль 13',
      'profile.switch.14': 'Переключить на профиль 14',
      'profile.switch.15': 'Переключить на профиль 15',
      'profile.switch.16': 'Переключить на профиль 16',
      'profile.switch.17': 'Переключить на профиль 17',
      'profile.switch.18': 'Переключить на профиль 18',
      'profile.next': 'Следующий профиль',
      'profile.prev': 'Предыдущий профиль',
      'profile.toggleAll': 'Показать все профили',
      'profile.create': 'Создать профиль',
      'composer.send': 'Отправить сообщение',
      'composer.newline': 'Вставить перенос строки',
      'composer.steer': 'Направить текущий ход',
      'composer.queue': 'Поставить сообщение в очередь',
      'composer.sendQueued': 'Отправить следующий ход из очереди',
      'composer.mention': 'Ссылка на файлы, папки, URL',
      'composer.slash': 'Палитра slash-команд',
      'composer.help': 'Быстрая справка',
      'composer.history': 'Переключить поповер / историю',
      'composer.cancel': 'Закрыть поповер · отменить запуск',
      'nav.capabilities': 'Открыть навыки',
      'view.cycleSidebarGrouping': 'Переключить группировку сеансов',
      'view.toggleProfileRail': 'Показать / скрыть панель профилей',
      'view.terminalSelection': 'Отправить выделенное из терминала в композер',
      'view.toggleSimpleMode': 'Переключить простой режим'
    }
  },
  paletteCommands: {
    reloadDesktopPlugins: 'Перезагрузить плагины приложения',
    resetLayout: 'Сбросить раскладку',
    toggleStatusBar: 'Переключить строку состояния',
    keyboardShortcuts: 'Сочетания клавиш',
    exportProfile: 'Экспорт профиля…',
    importProfile: 'Импорт профиля…',
    toggleTerminal: 'Переключить терминал',
    toggleLogs: 'Показать / скрыть журналы',
    toggleYolo: 'Включить / выключить YOLO'
  },
  ...ruRuntime,
  findInPage: {
    next: 'Следующее вхождение',
    previous: 'Предыдущее вхождение'
  },
  language: {
    label: 'Язык',
    description: 'Выберите язык интерфейса приложения.',
    saving: 'Сохранение языка…',
    saveError: 'Не удалось сменить язык',
    switchTo: 'Сменить язык',
    searchPlaceholder: 'Поиск языка…',
    noResults: 'Языки не найдены'
  },
  quickEntry: {
    label: 'Быстрый ввод',
    askPlaceholder: 'Спросите Hermes…',
    disconnectedPlaceholder: 'Нет подключения — откройте Hermes, чтобы переподключиться',
    sendTo: 'Отправить в',
    targetSession: 'Целевой сеанс',
    currentChat: 'Текущий чат',
    newSession: 'Новый сеанс'
  },
  petOverlay: {
    messagePlaceholder: 'Сообщение…',
    openInHermes: 'Открыть в Hermes'
  },
  settings: {
    billing: ruBilling,
    closeSettings: 'Закрыть настройки',
    exportConfig: 'Экспортировать конфигурацию',
    importConfig: 'Импортировать конфигурацию',
    resetToDefaults: 'Сбросить к значениям по умолчанию',
    resetConfirm: 'Сбросить все настройки к значениям Hermes по умолчанию?',
    exportFailed: 'Не удалось экспортировать',
    resetFailed: 'Не удалось сбросить',
    pluginPages: ruPluginSettings.pluginPages,
    nav: {
      providers: 'Провайдеры',
      providerAccounts: 'Аккаунты',
      providerApiKeys: 'API-ключи',
      providerCustomEndpoints: 'Свои эндпоинты',
      providerLocalModels: 'Локальные модели',
      gateway: 'Шлюзы',
      apiKeys: 'Инструменты и ключи',
      keybinds: 'Горячие клавиши',
      keysTools: 'Инструменты',
      keysSettings: 'Настройки',
      mcp: 'MCP',
      archivedChats: 'Архив чатов',
      sessions: 'Сеансы',
      about: 'О программе',
      billing: 'Оплата',
      notifications: 'Уведомления',
      vault: 'Пароли и логины',
      plugins: 'Плагины'
    },
    plugins: {
      title: 'Плагины приложения',
      openFolder: 'Открыть папку плагинов приложения',
      rescan: 'Пересканировать',
      reveal: 'Показать в файловом менеджере',
      failed: 'ошибка',
      kinds: {
        bundled: 'встроенный',
        disk: 'на диске',
        runtime: 'рантайм'
      },
      installModal: {
        installFromGit: 'Установить из Git',
        reviewRepository: 'Просмотреть репозиторий',
        repoPlaceholder: 'https://github.com/owner/repo',
        title: 'Установка плагина',
        description: 'Перед установкой посмотрите, что содержит этот репозиторий.',
        repoLabel: 'Репозиторий',
        includesHeading: 'Состав пакета',
        agentLabel: 'Плагин агента',
        desktopLabel: 'Интерфейс приложения',
        agentTargetLocal: (profile, dir) => `Устанавливается в бэкенд профиля «${profile}» (${dir})`,
        agentTargetRemote: profile => `Устанавливается в подключённый бэкенд профиля «${profile}»`,
        restartToApply: 'Перезапустите шлюз, чтобы плагин вступил в силу.',
        restartNow: 'Перезапустить шлюз',
        missingEnvAction: 'Настроить',
        alreadyInstalled: (name: string) => `${name} уже установлен.`,
        desktopTarget: 'Устанавливается в локальную папку desktop-plugins этого приложения',
        desktopTargetFromPackage: 'Загружается в это приложение из пакета выше — одинаково для всех профилей',
        desktopOnlyNote: 'Пакеты только для приложения не устанавливают плагин агента в бэкенд.',
        insecureWarning:
          'Этот URL использует небезопасную или локальную схему. Для рабочих установок используйте https:// или git@.',
        securityIntro:
          'Устанавливайте только из проверенных источников — при желании просмотрите репозиторий ниже, чтобы увидеть, что будет добавлено.',
        sourceHeading: 'Исходный код',
        viewRepository: 'Посмотреть репозиторий',
        viewPluginFiles: 'Посмотреть файлы плагина',
        enableAgent: 'Включить плагин агента после установки',
        forceReinstall: 'Принудительная переустановка (заменить, если уже установлен)',
        pinToCommit: 'Закрепить на коммите (необязательно)',
        pinToCommitPlaceholder: 'Полный SHA коммита (40 символов)',
        pinToCommitHint:
          'Все, кто устанавливает этот SHA, получают один и тот же код; после этого плагин не принимает обновления, пока его не закрепят заново. Оставьте пустым, чтобы установить последний коммит.',
        pinToCommitInvalid: 'Нужен полный SHA коммита из 40 символов (ветки и теги не принимаются).',
        install: 'Установить',
        installing: 'Установка…',
        probing: 'Анализ репозитория…',
        probeUnavailable: 'Анализ плагинов недоступен в этом окружении.',
        desktopUnavailable: 'Установка плагинов приложения недоступна в этом окружении.',
        selectComponent: 'Выберите хотя бы один компонент для установки.',
        agentSuccess: name => `Плагин агента ${name} установлен`,
        desktopSuccess: name => `Плагин приложения ${name} установлен`,
        agentFailed: 'Не удалось установить плагин агента',
        installUncertain:
          'Hermes перестал ждать результата установки, но плагин, возможно, всё ещё устанавливается. Закройте это окно и нажмите «Пересканировать» на вкладке «Плагины», прежде чем снова нажимать «Установить».',
        desktopFailed: 'Не удалось установить плагин приложения',
        missingEnv: (name, vars) =>
          `${name} установлен, но для работы ему нужен ключ: ${vars}. Добавьте его сейчас, иначе инструменты плагина не будут работать.`,
        profileLabel: 'Установить для профиля',
        nextChat: 'остальные инструменты появятся в следующем чате',
        serverNotConnected: (server, reason) => `MCP-сервер ${server} не подключён${reason ? `: ${reason}` : '.'}`,
        verified: 'Проверен',
        unverified: 'Не проверен',
        reviewedByNous: 'Проверен командой Nous.',
        installsAndEnables: profile => `Установится для профиля «${profile}» и сразу включится.`,
        installsOnly: profile => `Установится для профиля «${profile}».`,
        advanced: 'Дополнительно',
        versionLabel: 'Версия',
        reviewedPin: sha => (sha ? `Проверенный коммит ${sha}` : 'Проверенный коммит'),
        latestCommit: 'Последний коммит',
        nothingToInstall: 'Из этого пакета здесь нечего устанавливать.',
        skillsReady: names =>
          names.length === 1
            ? `навык «${names[0]}» готов`
            : `${names.length} ${RU_PLURAL(names.length, 'навык готов', 'навыка готовы', 'навыков готово')}`,
        toolsConnected: n =>
          `${n} ${RU_PLURAL(n, 'инструмент подключён', 'инструмента подключены', 'инструментов подключено')}`,
        partialInstall: sha =>
          sha
            ? `Плагин установлен лишь частично: часть для агента установлена на коммите ${sha}, но часть для приложения установить не удалось — репозиторий изменился после вашего просмотра. Включите параметр «Принудительная переустановка» в разделе «Дополнительно», чтобы заменить обе части показанной версией, или нажмите «Отмена», чтобы оставить только часть для агента.`
            : 'Плагин установлен лишь частично: часть для агента установлена, но часть для приложения установить не удалось — репозиторий изменился после вашего просмотра. Включите параметр «Принудительная переустановка» в разделе «Дополнительно», чтобы заменить обе части показанной версией, или нажмите «Отмена», чтобы оставить только часть для агента.',
        installAnyway: 'Всё равно установить',
        legacyBackendConfirm:
          'Этот бэкенд старше приложения, поэтому не может гарантировать, что установится именно та версия, которую вы просмотрели: если репозиторий с тех пор изменился, установится более новая версия. Обновите бэкенд, чтобы получить эту гарантию.',
        sourceMoved: sha =>
          sha
            ? `Репозиторий изменился после вашего просмотра. Просмотрите новую версию (коммит ${sha}), прежде чем устанавливать её.`
            : 'Репозиторий изменился после вашего просмотра. Чтение новой версии…'
      }
    },
    vault: {
      title: 'Пароли и логины',
      blurb:
        'Скажите «войди в GitHub», и агент выполнит вход за вас. Впервые встретив страницу входа, он сразу спросит у вас логин, а дальше всё будет работать само. Пароли шифруются на этом компьютере и вводятся прямо на страницу — модель их никогда не видит.',
      count: n => `${n} ${RU_PLURAL(n, 'запись', 'записи', 'записей')}`,
      loadFailed: 'Не удалось загрузить записи хранилища',
      empty: 'Ещё ничего не сохранено',
      emptyDesc:
        'Добавлять сюда ничего не обязательно. Попросите агента войти на сайт — он один раз спросит у вас логин прямо на месте. Если хотите ввести логин заранее, нажмите «Добавить».',
      add: 'Добавить',
      addTitle: 'Добавить логин, карту или адрес',
      addDescription: 'Хранится в зашифрованном виде на этом компьютере. Агент никогда не видит пароль.',
      added: 'Сохранено.',
      adding: 'Сохранение…',
      addConfirm: 'Сохранить',
      kindField: 'Тип',
      kinds: {
        login: 'Логин',
        payment: 'Платёжная карта',
        address: 'Адрес'
      },
      labelField: 'Название',
      labelPlaceholder: 'например, рабочий аккаунт GitHub',
      labelRequired: 'Укажите название.',
      originField: 'Адрес сайта',
      originPlaceholder: 'https://github.com',
      originPlaceholderCheckout: 'https://shop.example.com',
      originInvalid: 'Введите корректный URL, например https://example.com.',
      identifierTypeField: 'Тип идентификатора',
      identifierTypes: {
        email: 'Электронная почта',
        phone: 'Телефон',
        username: 'Имя пользователя'
      },
      identifierField: 'Идентификатор',
      identifierShown: identifier => identifier,
      passwordField: 'Пароль',
      loginFieldsRequired: 'Укажите идентификатор и пароль.',
      cardNumberField: 'Номер карты',
      cardNameField: 'Имя на карте',
      expMonthField: 'Срок действия: месяц',
      expYearField: 'Срок действия: год',
      cvcField: 'CVC',
      postalField: 'Почтовый индекс',
      addressLine1Field: 'Адрес, строка 1',
      addressLine2Field: 'Адрес, строка 2',
      cityField: 'Город',
      stateField: 'Штат / регион',
      countryField: 'Страна',
      optional: '(необязательно)',
      createdOn: date => `Добавлено ${date}`,
      deleteAction: 'Удалить сохранённую запись',
      otpField: 'Ключ аутентификатора',
      otpPlaceholder: 'Секрет Base32 или ссылка otpauth://',
      otpHint:
        '«Ключ настройки», который отображается на сайте при включении 2FA. После его сохранения Hermes сам генерирует коды.',
      twoFactorBadge: '2FA авто',
      deleteTitle: 'Удалить эту запись?',
      deleteDescription: label => `Запись «${label}» будет удалена. Это действие нельзя отменить.`,
      deleteConfirm: 'Удалить',
      sources: {
        title: 'Менеджеры паролей',
        blurb:
          'Установленные менеджеры паролей подключаются автоматически. Когда агенту впервые понадобится логин из менеджера, он попросит вас разблокировать его (один раз за сеанс). В памяти остаётся только токен сеанса; ваш мастер-пароль и логины агент никогда не видит.',
        toggleFailed: 'Не удалось переключить менеджер паролей',
        notInstalled: name =>
          `Не обнаружен. Установите инструмент командной строки ${name} и войдите в него — Hermes подключит его автоматически.`,
        disabledDesc: 'Обнаружен, но отключён для Hermes.',
        lockedDesc:
          'Обнаружен. Агент попросит разблокировать его, когда понадобится логин, — или разблокируйте сейчас.',
        unlockedDesc:
          'Разблокирован на этот сеанс. Блокируется автоматически после 30 минут простоя или при закрытии Hermes.',
        statusLocked: 'Заблокирован',
        statusNotDetected: 'Не обнаружен',
        statusOff: 'Отключён',
        statusUnlocked: 'Разблокирован',
        unlock: 'Разблокировать',
        unlocking: 'Разблокировка…',
        lock: 'Заблокировать',
        unlocked: name => `Менеджер паролей ${name} разблокирован на этот сеанс.`,
        unlockTitle: name => `Разблокировать ${name}`,
        unlockDescription:
          'Введите мастер-пароль. Он передаётся менеджеру паролей на этом компьютере и сразу удаляется — он нигде не хранится, не попадает в журналы и не показывается агенту.',
        masterPasswordPlaceholder: 'Мастер-пароль'
      }
    },
    notifications: ruNotifications,
    memoryProvider: {
      loadFailed: detail => `Не удалось загрузить настройки провайдера памяти: ${detail}`,
      loadFailedFallback: 'Не удалось загрузить настройки провайдера памяти',
      loading: 'Загрузка настроек провайдера памяти…',
      settingsTitle: label => `Настройки ${label}`,
      fieldSet: label => `${label}: задано`,
      fieldNotSet: label => `${label}: не задано`,
      fullConfig: 'Полная конфигурация…',
      fullConfigTitle: label => `${label} — полная конфигурация`,
      fullConfigDescription: (label, profile) =>
        `Все параметры ${label} для профиля «${profile}». В пустых полях используется значение определённого хоста или встроенное значение по умолчанию.`,
      reference: label => `Справочник по конфигурации ${label}`,
      otherGroup: 'Прочее',
      saveChanges: 'Сохранить изменения',
      fieldAbout: label => `О поле «${label}»`,
      leaveBlankToKeep: 'Оставьте пустым, чтобы сохранить текущее значение',
      valueSet: 'задано',
      connectionStartFailed: 'Не удалось начать подключение.',
      connectionTimedOut: 'Время ожидания истекло — попробуйте ещё раз.',
      connectionFailed: 'Не удалось подключиться.',
      connectViaOAuth: 'Подключить через OAuth',
      reconnect: 'Переподключиться',
      connect: 'Подключиться',
      apiKeySet: 'API-ключ задан',
      oauthSet: 'OAuth настроен',
      waitingForConsent: 'Ожидание подтверждения в браузере…',
      saved: label => `Настройки ${label} сохранены`,
      updated: 'Конфигурация провайдера памяти обновлена.',
      saveFailed: label => `Не удалось сохранить настройки ${label}`
    },
    sections: {
      model: 'Модель',
      chat: 'Чат',
      appearance: 'Внешний вид',
      workspace: 'Рабочее пространство',
      safety: 'Безопасность',
      memory: 'Память и контекст',
      voice: 'Голос',
      advanced: 'Дополнительно',
      browser: 'Браузер'
    },
    searchPlaceholder: {
      about: 'О Hermes Desktop',
      config: 'Поиск настроек...',
      gateway: 'Подключение шлюза...',
      keys: 'Поиск API-ключей...',
      mcp: 'Поиск MCP-серверов...',
      sessions: 'Поиск архивных сеансов...'
    },
    modeOptions: {
      light: {
        label: 'Светлая',
        description: 'Яркие поверхности'
      },
      dark: {
        label: 'Тёмная',
        description: 'Рабочее пространство без бликов'
      },
      system: {
        label: 'Системная',
        description: 'Следовать настройкам ОС'
      }
    },
    appearance: {
      chatTextScaleTitle: 'Размер текста чата',
      chatTextScaleDesc:
        'Масштабирует текст беседы и композер относительно масштаба интерфейса. Размер боковых панелей и элементов управления не меняется.',
      title: 'Внешний вид',
      intro: 'Только для приложения. Режим — это яркость, тема — палитра и оформление чата.',
      themeSearchPlaceholder: 'Поиск по вашим темам и в VS Code Marketplace…',
      noInstalledThemeMatches: query => `Нет установленных тем по запросу «${query}».`,
      marketplaceThemeSource: 'Из VS Code Marketplace',
      colorMode: 'Цветовой режим',
      colorModeDesc: 'Выберите фиксированный режим или позвольте Hermes следовать настройкам системы.',
      toolViewTitle: 'Отображение вызовов инструментов',
      toolViewDesc:
        'В режиме «Обычный» сырые данные инструментов скрыты, «Технический» показывает полный ввод и вывод.',
      reasoningCollapsedTitle: 'Сворачивать рассуждения по умолчанию',
      reasoningCollapsedDesc:
        'Потоковые рассуждения остаются доступными, но не разворачиваются, пока вы их не откроете.',
      uiScaleTitle: 'Масштаб интерфейса',
      uiScaleDesc: percent =>
        `Масштабирует текст и элементы управления во всём приложении. Также работает Cmd/Ctrl с +, − и 0. Сейчас: ${percent}%.`,
      sessionDensityTitle: 'Плотность списка сеансов',
      sessionDensityDesc: 'Выберите, сколько контекста показывать под заголовками сеансов в боковой панели.',
      sessionDensityCompact: 'Компактно',
      sessionDensityComfortable: 'Комфортно',
      sessionDensityDetailed: 'Подробно',
      tabStripTitle: 'Панель вкладок',
      tabStripDesc:
        'Показывать вкладки над зоной. В режиме «Авто» они скрыты, если панель одна и не открыта другая зона чата или плиток.',
      tabStripAuto: 'Авто',
      tabStripAlways: 'Всегда',
      tabStripNever: 'Никогда',
      appActionsTitle: 'Действия приложения',
      appActionsDesc:
        'Где в заголовке окна располагаются кнопки настроек, редактора раскладки и HUD. Вариант «Справа» оставляет место для вкладок слева.',
      appActionsLeft: 'Слева',
      appActionsRight: 'Справа',
      terminalFontTitle: 'Шрифт терминала',
      terminalFontDesc:
        'Выберите установленный шрифт для терминалов приложения. Nerd Fonts отображают Powerlevel10k и иконки оболочки; оставьте пустым, чтобы использовать встроенный JetBrains Mono.',
      terminalFontPlaceholder: 'MesloLGS NF или CSS-стек шрифтов',
      terminalFontPreview: 'Предпросмотр глифов',
      terminalFontReset: 'Использовать шрифт по умолчанию',
      translucencyTitle: 'Полупрозрачность окна',
      translucencyDesc:
        'Рабочий стол виден сквозь всё окно, включая текст. Настраивается отдельно для светлого и тёмного режимов.',
      translucencyGlassDesc:
        'Матовое стекло: рабочий стол просвечивает плавным размытием, а текст остаётся чётким. Настраивается отдельно для светлого и тёмного режимов.',
      translucencyModeClear: 'Прозрачное',
      translucencyModeGlass: 'Матовое',
      translucencyTintTitle: 'Тон',
      translucencyFadeTitle: 'Затухание',
      translucencyFrostTitle: 'Матовость',
      translucencyFrost: {
        'under-window': 'Глубина',
        popover: 'Мягкость',
        titlebar: 'Яркость',
        header: 'Отблеск'
      },
      translucencyScopeTitle: 'Область',
      translucencyScope: {
        window: 'Всё окно',
        sidebar: 'Только боковая панель'
      },
      backdropTitle: 'Фон чата',
      backdropDesc: 'Едва заметное изображение статуи за перепиской.',
      userBubbleTitle: 'Облачко сообщения',
      userBubbleDesc: 'Насколько прозрачны ваши сообщения. 0 — сплошная заливка, 100 — остаётся только контур.',
      textDirectionTitle: 'Направление текста',
      textDirectionDesc:
        'Как сообщения чата и композер выбирают направление. «Авто» ориентируется на первую букву каждого абзаца; выберите направление, если смешанный текст выстраивается неправильно. Код всегда остаётся слева направо.',
      textDirection: { auto: 'Авто', rtl: 'Справа налево', ltr: 'Слева направо' },
      introSplashTitle: 'Экран приветствия',
      introSplashDesc: 'Логотип и приглашение, которые показываются в пустом чате.',
      modelPricingTitle: 'Цены моделей',
      modelPricingDesc: 'Показывать в выборе модели цены за миллион токенов: ввод, вывод и чтение из кэша.',
      reactionsTitle: 'Реакции на сообщения',
      reactionsDesc: 'Эмодзи-реакции в стиле iMessage: реагируйте на сообщения, а Hermes сможет реагировать на ваши.',
      tipsTitle: 'Советы в приложении',
      tipsDesc:
        'Время от времени приложение и Hermes дают подсказки. Каждый совет показывается один раз. Советы отключаются автоматически по истечении первых 30 дней; их можно включить снова.',
      tipsReset: (count: number) => `Снова показать ${count} ${RU_PLURAL(count, 'совет', 'совета', 'советов')}`,
      toursTitle: 'Интерактивные туры',
      toursDesc:
        'Hermes подсвечивает каждый шаг, проводя вас по приложению. Туры отключаются автоматически по истечении первых 30 дней; их можно включить снова.',
      composerPopoutTitle: 'Плавающий композер',
      composerPopoutDesc:
        'Позволяет вытягивать композер из его док-зоны. Когда выключено, он остаётся закреплённым внизу.',
      fileBrowserTitle: 'Файловый браузер',
      fileBrowserDesc:
        'Показывает файловый браузер рядом с чатом, когда открыто рабочее пространство. Кнопка в заголовке окна меняет эту настройку.',
      vibeHeartsTitle: 'Летающие сердечки',
      vibeHeartsDesc:
        'Сердечки взлетают, когда вы пишете «thanks», «ily», «good bot» или отправляете сердечко. Не зависит от реакций на сообщения выше.',
      embedsTitle: 'Встроенные превью',
      embedsDesc:
        'Расширенные превью загружаются со сторонних сайтов (YouTube, X, …). «Спрашивать» показывает заглушку, пока вы не разрешите каждый сервис; «Всегда» загружает их автоматически; «Выкл.» оставляет обычные ссылки.',
      embedsAsk: 'Спрашивать',
      embedsAlways: 'Всегда',
      embedsOff: 'Выкл.',
      embedsReset: count =>
        `Сбросить ${count} ${RU_NOUN(count, 'разрешённый сервис', 'разрешённых сервиса', 'разрешённых сервисов')}`,
      resumeLastSessionTitle: 'Открывать последний чат при запуске',
      resumeLastSessionDesc:
        'Если включено, приложение при запуске открывает последний чат. Выключите, чтобы всегда начинать с нового чата.',
      product: 'Обычный',
      productDesc: 'Понятный показ работы инструментов с краткими сводками.',
      technical: 'Технический',
      technicalDesc: 'Показывать сырые аргументы/результаты инструментов и низкоуровневые детали.',
      themeTitle: 'Тема',
      themeDesc: 'Только палитры для приложения. Выбранный режим применяется поверх.',
      themeProfileNote: profile => `Сохранено для профиля «${profile}» — у каждого профиля своя тема.`,
      installTitle: 'Установить из VS Code',
      installDesc:
        'Вставьте id расширения с Marketplace (например, dracula-theme.theme-dracula), чтобы преобразовать его цветовую тему в палитру приложения.',
      installPlaceholder: 'publisher.extension',
      installButton: 'Установить',
      installing: 'Установка…',
      installError: 'Не удалось установить эту тему.',
      installed: name => `Установлена «${name}».`,
      removeTheme: 'Удалить тему',
      importedBadge: 'Импортирована',
      pet: {
        title: 'Питомец',
        intro:
          'Заведите анимированного питомца из petdex: он парит над приложением и реагирует на то, что делает Hermes, — бегает, пока выполняются инструменты, радуется успеху и дуется при ошибках.',
        restartHint:
          'Питомцам нужен быстрый перезапуск — запущенное приложение стартовало до появления этой функции. Закройте Hermes, откройте его снова и вернитесь сюда.',
        on: 'Вкл.',
        off: 'Выкл.',
        scaleTitle: 'Размер',
        scaleDesc: 'Меняет размер парящего питомца. Применяется мгновенно везде.',
        roamTitle: 'Блуждание',
        roamDesc: 'Питомец сам бродит по окну, пока ничего не происходит.',
        chooseTitle: 'Выбрать питомца',
        chooseDesc: 'Выбранный питомец устанавливается (при необходимости) и становится активным.',
        searchPlaceholder: 'Поиск питомцев…',
        unreachable: 'Не удалось связаться с галереей petdex. Проверьте соединение и откройте страницу заново.',
        noMatch: query => `Нет питомцев, подходящих под «${query}».`,
        installedTag: 'установлен',
        generatedTag: 'Сгенерирован',
        countCapped: (cap, total) =>
          `${RU_PLURAL(cap, 'Показан', 'Показаны', 'Показано')} ${cap} из ${total} — начните вводить, чтобы сузить выбор.`,
        count: n => `${n} ${RU_PLURAL(n, 'питомец', 'питомца', 'питомцев')}.`,
        uninstall: name => `Удалить ${name}`,
        delete: name => `Удалить ${name} навсегда`,
        deleteTitle: name => `Удалить ${name}?`,
        deleteBody: 'Питомец будет удалён безвозвратно — переустановить его будет нельзя.',
        deleteConfirm: 'Удалить',
        rename: name => `Переименовать ${name}`,
        renameTitle: 'Переименовать питомца',
        renamePlaceholder: 'Имя вашего питомца',
        renameSave: 'Сохранить',
        exportPet: name => `Экспортировать ${name}`,
        adoptFailed: slug => `Не удалось завести питомца «${slug}»`,
        uninstallFailed: slug => `Не удалось удалить ${slug}`,
        renameFailed: slug => `Не удалось переименовать ${slug}`,
        exportFailed: slug => `Не удалось экспортировать ${slug}`,
        noneAvailable: 'Сейчас нет доступных питомцев для включения.',
        turnOnFailed: 'Не удалось включить питомца.',
        turnOffFailed: 'Не удалось выключить питомца.'
      },
      hideCodeDiffsTitle: 'Скрывать изменения кода',
      hideCodeDiffsDesc:
        'Показывать правки файлов строками инструментов с числом добавленных и удалённых строк, без кода.',
      hideThreadTimelineTitle: 'Скрывать полоски хронологии диалога',
      hideThreadTimelineDesc: 'Скрывать полоски навигации вдоль правого края каждого диалога.',
      chatFontTitle: 'Шрифт чата',
      chatFontDesc:
        'Выберите установленный шрифт для чата и всего интерфейса. Удобно для шрифтов повышенной читаемости, например OpenDyslexic; оставьте пустым, чтобы использовать шрифт темы.',
      chatFontPlaceholder: 'OpenDyslexic или CSS-стек шрифтов',
      chatFontPreview: 'Предпросмотр',
      chatFontSample: 'Съешь же ещё этих мягких французских булок. 0123456789',
      chatFontReset: 'Использовать шрифт темы'
    },
    fieldLabels: defineFieldCopy({
      model: 'Модель по умолчанию',
      modelContextLength: 'Контекстное окно основной модели (переопределение)',
      fallbackProviders: 'Резервные модели',
      toolsets: 'Включённые наборы инструментов',
      timezone: 'Часовой пояс',
      display: {
        personality: 'Личность',
        showReasoning: 'Блоки рассуждений'
      },
      desktop: {
        repoScanEnabled: 'Автоматическое обнаружение репозиториев',
        repoScanRoots: 'Корневые папки для обнаружения репозиториев',
        repoScanExcludePaths: 'Исключаемые пути репозиториев'
      },
      agent: {
        maxTurns: 'Максимум шагов агента',
        imageInputMode: 'Вложения изображений',
        apiMaxRetries: 'Повторные запросы к API',
        serviceTier: 'Уровень сервиса',
        toolUseEnforcement: 'Принудительное использование инструментов',
        environmentProbe: 'Проверка среды выполнения',
        outputTruncationRetries: 'Повторы при лимите вывода',
        postToolEmptyRetries: 'Повторы пустого ответа после инструмента',
        thinkingPrefillRetries: 'Повторы с подстановкой рассуждений',
        emptyResponseRetries: 'Повторы пустого ответа'
      },
      terminal: {
        cwd: 'Рабочий каталог',
        backend: 'Бэкенд выполнения',
        timeout: 'Тайм-аут команд',
        persistentShell: 'Постоянная оболочка',
        envPassthrough: 'Проброс переменных окружения',
        dockerImage: 'Образ Docker',
        dockerMountCwdToWorkspace: 'Монтировать проект в Docker',
        dockerWorkspacePerSession: 'Следовать за проектом каждого сеанса',
        dockerWorkspaceMountPath: 'Путь монтирования в Docker',
        singularityImage: 'Образ Singularity',
        singularityMountCwdToWorkspace: 'Монтировать проект в Singularity',
        singularityWorkspacePerSession: 'Следовать за проектом каждого сеанса (Singularity)',
        singularityWorkspaceMountPath: 'Путь монтирования в Singularity',
        modalImage: 'Образ Modal',
        daytonaImage: 'Образ Daytona',
        containerPersistent: 'Сохранять файловую систему контейнера'
      },
      fileReadMaxChars: 'Лимит чтения файла',
      toolOutput: {
        maxBytes: 'Лимит вывода терминала',
        maxLines: 'Лимит строк на страницу файла',
        maxLineLength: 'Лимит длины строки'
      },
      codeExecution: {
        mode: 'Режим выполнения кода'
      },
      approvals: {
        mode: 'Режим подтверждения',
        timeout: 'Тайм-аут подтверждения',
        mcpReloadConfirm: 'Подтверждать перезагрузку MCP'
      },
      commandAllowlist: 'Список разрешённых команд',
      security: {
        redactSecrets: 'Скрывать секреты',
        allowPrivateUrls: 'Разрешать частные URL'
      },
      browser: {
        allowPrivateUrls: 'Частные URL браузера',
        autoLocalForPrivateUrls: 'Локальный браузер для частных URL',
        useRealProfile: 'Использовать мой настоящий профиль браузера'
      },
      checkpoints: {
        enabled: 'Контрольные точки файлов',
        maxSnapshots: 'Лимит контрольных точек'
      },
      voice: {
        maxRecordingSeconds: 'Макс. длительность записи',
        autoTts: 'Зачитывать ответы вслух',
        clientDirect: 'Прямое голосовое подключение',
        voiceChatMode: 'Режим голосового чата',
        gptLive: {
          voice: 'Голос GPT-Live',
          instructions: 'Персона GPT-Live'
        }
      },
      stt: {
        enabled: 'Распознавание речи',
        echoTranscripts: 'Показывать расшифровки в чате',
        provider: 'Провайдер распознавания речи',
        streaming: 'Расшифровка в реальном времени',
        local: {
          model: 'Локальная модель распознавания',
          language: 'Язык распознавания'
        },
        openai: {
          model: 'Модель STT OpenAI',
          streamingModel: 'Модель расшифровки в реальном времени OpenAI'
        },
        groq: {
          model: 'Модель STT Groq'
        },
        mistral: {
          model: 'Модель STT Mistral'
        },
        xai: {
          model: 'Модель STT xAI'
        },
        deepinfra: {
          model: 'Модель STT DeepInfra'
        },
        elevenlabs: {
          modelId: 'Модель STT ElevenLabs',
          languageCode: 'Язык ElevenLabs',
          tagAudioEvents: 'Помечать звуковые события',
          diarize: 'Разделение по говорящим'
        }
      },
      tts: {
        provider: 'Провайдер синтеза речи',
        edge: {
          voice: 'Голос Edge'
        },
        openai: {
          model: 'Модель TTS OpenAI',
          voice: 'Голос OpenAI'
        },
        elevenlabs: {
          voiceId: 'Голос ElevenLabs',
          modelId: 'Модель ElevenLabs'
        },
        xai: {
          voiceId: 'Голос xAI (Grok)',
          language: 'Язык xAI',
          speed: 'Скорость воспроизведения xAI',
          autoSpeechTags: 'Автоматические звуковые теги xAI',
          optimizeStreamingLatency: 'Оптимизация задержки стриминга xAI',
          sampleRate: 'Частота дискретизации xAI',
          bitRate: 'Битрейт xAI'
        },
        minimax: {
          model: 'Модель TTS MiniMax',
          voiceId: 'Голос MiniMax'
        },
        mistral: {
          model: 'Модель TTS Mistral',
          voiceId: 'Голос Mistral'
        },
        gemini: {
          model: 'Модель TTS Gemini',
          voice: 'Голос Gemini'
        },
        neutts: {
          model: 'Модель NeuTTS',
          device: 'Устройство NeuTTS'
        },
        kittentts: {
          model: 'Модель KittenTTS',
          voice: 'Голос KittenTTS'
        },
        piper: {
          voice: 'Голос Piper'
        },
        deepinfra: {
          model: 'Модель TTS DeepInfra',
          voice: 'Голос DeepInfra'
        }
      },
      memory: {
        memoryEnabled: 'Постоянная память',
        userProfileEnabled: 'Профиль пользователя',
        memoryCharLimit: 'Бюджет памяти',
        userCharLimit: 'Бюджет профиля',
        provider: 'Провайдер памяти'
      },
      context: {
        engine: 'Движок контекста'
      },
      compression: {
        enabled: 'Автосжатие',
        threshold: 'Порог сжатия',
        codexGpt55Autoraise: 'Автоповышение порога сжатия Codex',
        targetRatio: 'Целевое сжатие',
        protectLastN: 'Защищённые недавние сообщения'
      },
      auxiliary: {
        compression: {
          timeout: 'Тайм-аут модели сжатия (с)'
        }
      },
      delegation: ruDelegationFieldLabels,
      updates: {
        nonInteractiveLocalChanges: 'Локальные изменения при обновлении из приложения'
      }
    }),
    fieldDescriptions: defineFieldCopy({
      model: 'Используется для новых чатов, если вы не выберете другую модель в композере.',
      modelContextLength:
        'Переопределяет обнаруженное контекстное окно только ОСНОВНОЙ модели чата (в токенах). Оставьте 0, чтобы использовать обнаруженное значение выбранной модели. Не влияет на вспомогательные модели и модели MoA.',
      fallbackProviders: 'Резервные записи provider:model, которые пробуются, если модель по умолчанию даёт сбой.',
      display: {
        personality: 'Стиль ассистента по умолчанию для новых сеансов.',
        showReasoning: 'Показывать блоки рассуждений, когда бэкенд их предоставляет.'
      },
      desktop: {
        repoScanEnabled: 'Искать Git-репозитории в локальных папках, чтобы показывать их в разделе «Проекты».',
        repoScanRoots: 'Папки для сканирования. Оставьте пустым, чтобы сканировать домашний каталог.',
        repoScanExcludePaths: 'Папки (вместе с вложенными), которые нужно пропускать при обнаружении репозиториев.'
      },
      timezone: 'Идентификатор часового пояса IANA. Пустое значение — системный часовой пояс.',
      agent: {
        imageInputMode: 'Управляет тем, как вложения изображений отправляются модели.',
        maxTurns: 'Максимальное число шагов с вызовами инструментов, после которого Hermes прерывает ход.',
        outputTruncationRetries:
          'Сколько раз продолжать ответ, оборванный на лимите выходных токенов провайдера (0–3). Каждое продолжение заново отправляет весь промпт, и он оплачивается повторно; 0 сразу возвращает частичный ответ. По умолчанию 3.',
        postToolEmptyRetries:
          'Отправлять подсказку на продолжение, если после вызова инструментов нет видимого текста. Каждый повтор может тарифицироваться. 0 — выключить; максимум 3.',
        thinkingPrefillRetries:
          'Подставлять ответ только с рассуждением, чтобы модель продолжила до видимого текста. Каждый повтор может тарифицироваться. 0 — выключить; максимум 3.',
        emptyResponseRetries:
          'Повторять запрос, если предыдущие уровни восстановления так и не дали видимого текста. Каждый повтор может тарифицироваться; защита от перерасхода может остановить повторы раньше. 0 — выключить; максимум 3.',
        environmentProbe:
          'Определять параметры среды выполнения для новых сеансов. Для контейнеров используется временная песочница, удаляемая после проверки; при отключении используется статическое описание.'
      },
      terminal: {
        cwd: 'Папка проекта по умолчанию для инструментов и терминала.',
        persistentShell:
          'Бэкенд SSH: сохранять экспортированные переменные между командами. Если выключено, каждая команда запускается в окружении входа; рабочий каталог сохраняется всегда.',
        envPassthrough: 'Переменные окружения, которые передаются инструментам при выполнении.',
        dockerImage: 'Образ контейнера, используемый, когда бэкенд выполнения — Docker.',
        dockerMountCwdToWorkspace:
          'Монтировать папку проекта (bind mount) в песочницу Docker по заданному пути (по умолчанию /workspace). Если выключено, песочница полностью изолирована. Изменение вступит в силу для следующего контейнера после перезапуска бэкенда.',
        dockerWorkspacePerSession:
          'Использовать папку, выбранную в каждом сеансе, а не только папку запуска. Каждый проект получает собственный контейнер. Изменение вступит в силу после перезапуска бэкенда.',
        dockerWorkspaceMountPath:
          'Полный путь внутри контейнера, куда монтируется проект. По умолчанию /workspace. Изменение вступит в силу для следующего контейнера после перезапуска бэкенда и не удалит текущий.',
        singularityImage: 'Образ, используемый, когда бэкенд выполнения — Singularity.',
        singularityMountCwdToWorkspace:
          'Монтировать папку проекта (bind mount) в песочницу Singularity по заданному пути (по умолчанию /workspace). Если выключено, песочница полностью изолирована. Изменение вступит в силу для следующего экземпляра после перезапуска бэкенда.',
        singularityWorkspacePerSession:
          'Использовать папку, выбранную в каждом сеансе, а не только папку запуска. Каждый проект получает собственный экземпляр. Изменение вступит в силу после перезапуска бэкенда.',
        singularityWorkspaceMountPath:
          'Полный путь внутри контейнера, к которому подключается проект. По умолчанию /workspace. Изменение вступит в силу для следующего экземпляра после перезапуска бэкенда и не удалит текущий.',
        modalImage:
          'Образ, используемый, когда бэкенд выполнения — Modal. Работает в облаке: папки проекта синхронизируются копиями, а не монтируются.',
        daytonaImage:
          'Образ, используемый, когда бэкенд выполнения — Daytona. Работает в облаке: папки проекта синхронизируются копиями, а не монтируются.',
        containerPersistent:
          'Сохранять файловую систему контейнера между сеансами. Изменение вступит в силу после перезапуска бэкенда и не удалит текущий контейнер или экземпляр.'
      },
      codeExecution: {
        mode: 'Насколько строго выполнение кода ограничено текущим проектом.'
      },
      fileReadMaxChars: 'Максимальное число символов, которые Hermes может прочитать из одного запроса к файлу.',
      approvals: {
        mode: 'Как Hermes обрабатывает команды, требующие явного подтверждения.',
        timeout: 'Как долго запросы подтверждения ждут перед тайм-аутом.'
      },
      security: {
        redactSecrets: 'Скрывать обнаруженные секреты из видимого для модели содержимого, когда это возможно.',
        allowPrivateUrls:
          'Разрешить инструментам, загружающим URL, обращаться к localhost и адресам частной сети. Эндпоинты облачных метаданных остаются заблокированными.'
      },
      checkpoints: {
        enabled: 'Создавать снимки для отката перед правкой файлов.'
      },
      memory: {
        memoryEnabled: 'Сохранять долговременные воспоминания, которые могут помочь будущим сеансам.',
        userProfileEnabled: 'Поддерживать компактный профиль предпочтений пользователя.'
      },
      context: {
        engine: 'Стратегия управления длинными диалогами у предела контекста.'
      },
      compression: {
        enabled: 'Сжимать более старый контекст, когда диалоги становятся большими.',
        codexGpt55Autoraise: 'Повышает порог сжатия до 85% для поддерживаемых моделей ChatGPT Codex OAuth.'
      },
      auxiliary: {
        compression: {
          timeout:
            'Сколько секунд ждать вспомогательную модель сжатия за один вызов (по умолчанию 120). Увеличьте для медленных локальных моделей.'
        }
      },
      delegation: {
        model: 'Модель для субагентов, которым делегируются задачи. Пустое значение — наследовать модель родителя.',
        provider:
          'Провайдер для субагентов — встроенное имя или ID своего эндпоинта. Пустое значение — наследовать от родителя.',
        useCustomEndpoints:
          'Показывать свои эндпоинты в списке провайдеров субагента, а найденные у них модели — в списке моделей.'
      },
      voice: {
        clientDirect:
          'По возможности подключать это приложение напрямую к провайдерам речи, а не передавать звук через шлюз.',
        autoTts: 'Автоматически зачитывать ответы ассистента.',
        voiceChatMode:
          'chained: распознавание речи → Hermes → синтез речи с провайдерами ниже. gpt-live: одна полнодуплексная голосовая модель OpenAI (gpt-live-1) слушает и говорит, а каждый настоящий запрос передаёт Hermes — отвечает любая выбранная вами модель с полным набором инструментов. Нужен API-ключ OpenAI; голосовой слой стоит $0.05 в минуту.',
        gptLive: {
          voice: 'Голос для режима GPT-Live. Можно указать ID своего голоса.',
          instructions:
            'Дополнительные предложения для голосовой персоны (тон, темп, язык). Hermes сохраняет свой системный промпт.'
        }
      },
      tts: {
        xai: {
          voiceId: 'ID голоса xAI (например, eve) или ID пользовательского голоса.',
          language: 'Код языка речи (например, en, pt-BR) или «auto» для автоопределения.',
          speed: 'Скорость воспроизведения. 0.7 = медленнее, 1.0 = нормально, 1.5 = быстрее.',
          autoSpeechTags:
            'Позволить LLM вставлять выразительные звуковые теги ([laughing], [sighs]) в сценарий перед синтезом.',
          optimizeStreamingLatency:
            'Компромисс между задержкой и качеством. 0 = лучшее качество, 2 = минимальная задержка.',
          sampleRate: 'Частота дискретизации аудио в Гц. Чем выше, тем лучше качество и больше файлы.',
          bitRate: 'Битрейт MP3 в бит/с. Действует, только когда кодек — mp3.'
        },
        neutts: {
          device: 'Локальное устройство инференса для NeuTTS.'
        },
        deepinfra: {
          voice:
            'Имя голоса, которое отправляется в API синтеза речи DeepInfra. Оставьте пустым, чтобы использовать голос модели по умолчанию.'
        }
      },
      stt: {
        enabled: 'Включить локальное распознавание речи или распознавание через провайдера.',
        echoTranscripts: 'Возвращать в чат «сырую» 🎙️ расшифровку голосовых сообщений.',
        streaming: 'Показывать текст, пока вы говорите (OpenAI, xAI, ElevenLabs). При любом сбое используется запись.',
        elevenlabs: {
          languageCode: 'Необязательный код языка ISO-639-3. Пустое значение — автоопределение ElevenLabs.'
        }
      },
      updates: {
        nonInteractiveLocalChanges:
          'Когда Hermes обновляет себя из приложения (без запроса в терминале), сохранять локальные правки исходников (stash) или выбрасывать (discard). Обновления из терминала всегда спрашивают.'
      },
      browser: {
        useRealProfile:
          'Локальный браузер использует ваши настоящие логины. Hermes копирует профиль вашего браузера по умолчанию (файлы cookie, логины, настройки) в собственный снимок и запускает с ним встроенный Chromium — сам рабочий профиль никогда не открывается напрямую, а копия обновляется из него при каждом запуске. Также позволяет агенту по запросу открыть локальный сеанс с настоящим профилем, даже если настроен облачный бэкенд браузера. Поддерживаются только браузеры на Chromium (Chrome, Edge, Brave, Brave Origin, Chromium); если браузер по умолчанию не на Chromium, появится понятное сообщение об ошибке. По умолчанию выключено.'
      }
    }),
    about: {
      heading: 'Hermes Desktop',
      version: value => `Версия ${value}`,
      versionUnavailable: 'Версия недоступна',
      bundleOutOfSync: 'Сборка приложения устарела',
      bundleOutOfSyncDesc:
        'Среда выполнения Hermes обновлена, но само приложение — ещё старая сборка: новые функции интерфейса (например, Bot Mode) не появятся, пока оно не обновится. Запустите обновление ниже, чтобы пересобрать приложение. Если предупреждение не исчезнет, скачайте последнюю версию установщика и переустановите приложение.',
      bundleOutOfSyncAction: 'Скачать установщик',
      bundleSwapPending: 'Перезапустите, чтобы завершить обновление',
      bundleSwapPendingDesc:
        'Обновлённое приложение уже установлено — Hermes нужно только перезапуститься, чтобы загрузить его. Чаты и настройки не затронуты.',
      bundleSwapPendingAction: 'Перезапустить Hermes',
      updates: 'Обновления',
      channel: ruUpdateChannel,
      checkNow: 'Проверить сейчас',
      checking: 'Проверка…',
      seeWhatsNew: 'Смотреть, что нового',
      updateNow: 'Обновить сейчас',
      releaseNotes: 'Заметки о выпуске',
      onLatest: 'У вас последняя версия.',
      installing: 'Сейчас устанавливается обновление.',
      cantUpdate: 'Эта сборка не может обновляться изнутри приложения.',
      cantReach: 'Не удалось связаться с сервером обновлений.',
      tapCheck: 'Нажмите «Проверить сейчас», чтобы найти обновления.',
      updateReady: count =>
        `Готово новое обновление (включено ${count} ${RU_PLURAL(count, 'изменение', 'изменения', 'изменений')}).`,
      updateReadyUnknown: 'Готово новое обновление.',
      lastChecked: age => `Последняя проверка: ${age}`,
      automaticUpdates: 'Автоматические обновления',
      automaticUpdatesDesc:
        'Hermes автоматически проверяет наличие обновлений в фоне и сообщает, когда обновление готово.',
      branchCommit: (branch, commit) => `Ветка ${branch} · Коммит ${commit}`,
      never: 'никогда',
      justNow: 'только что',
      minAgo: count => `${count} ${RU_NOUN(count, 'минуту', 'минуты', 'минут')} назад`,
      hoursAgo: count => `${count} ${RU_NOUN(count, 'час', 'часа', 'часов')} назад`,
      daysAgo: count => `${count} ${RU_NOUN(count, 'день', 'дня', 'дней')} назад`
    },
    config: {
      none: 'Нет',
      noneParen: '(нет)',
      builtinOnly: 'Только встроенные',
      notSet: 'Не задано',
      commaSeparated: 'значения через запятую',
      searchPlaceholder: 'Поиск…',
      noResults: 'Ничего не найдено',
      systemDefault: 'Как в системе',
      providerDefault: 'По умолчанию у провайдера',
      loading: 'Загрузка конфигурации Hermes...',
      emptyTitle: 'Настраивать нечего',
      emptyDesc: 'В этом разделе нет настраиваемых параметров.',
      failedLoad: 'Не удалось загрузить настройки',
      autosaveFailed: 'Не удалось сохранить автоматически',
      imported: 'Конфигурация импортирована',
      invalidJson: 'Неверный JSON конфигурации',
      toolsetsWipeConfirm:
        'Удалить все включённые наборы инструментов? Это отключит память, терминал, веб-поиск, делегирование и большинство других инструментов, пока вы не включите их снова.',
      keepAwakeTitle: 'Не давать компьютеру засыпать',
      keepAwakeDesc:
        'Не даёт этому компьютеру уходить в сон. В режиме «Во время работы» он не засыпает, только пока выполняется ход: ночные запуски доработают до конца, а ноутбук не будет бодрствовать всю неделю. Экран при этом может затемняться.',
      keepAwakeOff: 'Выкл',
      keepAwakeWhileWorking: 'Во время работы',
      keepAwakeAlways: 'Всегда',
      disableF12Title: 'Отключить инструменты разработчика по F12',
      disableF12Desc:
        'Не даёт клавише F12 открывать инструменты разработчика. Ctrl+Shift+I (на Mac — Cmd+Opt+I) по-прежнему работает.',
      alwaysExternalLinksTitle: 'Всегда открывать ссылки во внешнем браузере',
      alwaysExternalLinksDesc:
        'Открывать каждую ссылку в системном браузере вместо встроенного. Пункт «Открыть во встроенном браузере» в контекстном меню продолжает работать.',
      attachmentSizeTitle: 'Макс. размер превью / загрузки изображений',
      attachmentSizeDesc:
        'Максимальный размер локального файла в МБ, который приложение загружает для превью и прикрепления изображений. По умолчанию 16. Для удалённых вложений, кроме изображений, действует отдельный лимит — 256 МБ. При очень большом значении файл целиком загружается в память, и приложение может зависнуть или аварийно завершиться.',
      attachmentSizeUnit: 'МБ',
      attachmentSizeLabel: 'Макс. размер превью / загрузки изображений в мегабайтах',
      minimizeToTrayTitle: 'Сворачивать в трей',
      minimizeToTrayDesc:
        'Сворачивание окон или закрытие главного окна скрывает их в системном трее (строке меню macOS), оставляя Hermes работать. Для выхода выберите «Quit Hermes» в меню трея или нажмите Cmd+Q. По умолчанию выключено; действует только на этом устройстве.',
      minimizeToTrayUnavailable:
        'Системный трей недоступен. Окна будут сворачиваться и закрываться как обычно. Выключите и снова включите настройку, чтобы повторить попытку.',
      showOptions: 'Показать параметры',
      voiceShortcutHintTitle: 'Горячая клавиша записи голоса',
      voiceShortcutHintDesc:
        'Настройте горячую клавишу записи голоса в разделе Настройки → Горячие клавиши («Начать / остановить голосовой диалог»). Параметр voice.record_key действует только в CLI и TUI.'
    },
    quickEntry: {
      enabledTitle: 'Быстрый ввод',
      enabledDesc:
        'Вызывайте небольшой композер из любого места глобальным сочетанием клавиш и отправляйте промпт, не открывая Hermes.',
      shortcutTitle: 'Сочетание клавиш быстрого ввода',
      shortcutDesc: 'Нужен хотя бы один модификатор, например CommandOrControl+Shift+Space.',
      active: 'Сочетание клавиш активно.',
      takenBy: 'Это сочетание уже занято другим приложением — выберите другое.',
      invalidShortcut: 'Недопустимое сочетание. Добавьте хотя бы одну клавишу-модификатор.'
    },
    credentials: {
      pasteKey: 'Вставить ключ',
      pasteLabelKey: label => `Вставить ключ ${label}`,
      optional: 'Необязательно',
      enterValueFirst: 'Сначала введите значение.',
      couldNotSave: 'Не удалось сохранить учётные данные.',
      remove: 'Удалить',
      getKey: 'Получить ключ',
      saving: 'Сохранение'
    },
    envActions: {
      actions: 'Действия',
      manageInKeys: 'Управлять в разделе «API-ключи»',
      docs: 'Документация',
      hideValue: 'Скрыть значение',
      revealValue: 'Показать значение',
      replace: 'Заменить',
      set: 'Задать',
      clear: 'Очистить'
    },
    connections: {
      title: 'Зарегистрированные шлюзы',
      intro:
        'Управляйте этим устройством и всеми шлюзами Hermes, к которым оно может подключиться через удалённые, SSH- или Cloud-соединения.',
      stagedNote:
        'Все шлюзы остаются подключёнными. Профили, чаты, мессенджеры и Cron-задачи привязаны к своему шлюзу, а раздел «Сеансы» может показывать их все сразу.',
      launchModeTitle: 'При запуске открывать «Сеансы» на последнем использованном шлюзе',
      launchModeDesc: 'Если выключено, «Сеансы» открываются на основном шлюзе.',
      searchPlaceholder: 'Поиск шлюзов…',
      noSearchResults: 'По вашему запросу шлюзы не найдены.',
      loadFailed: 'Не удалось загрузить соединения',
      currentPill: 'Текущий',
      primaryPill: 'Основной',
      managedPill: 'Управляется приложением',
      addConnection: 'Добавить соединение',
      editConnection: 'Изменить',
      removeConnection: 'Удалить',
      removeConfirmTitle: 'Удалить это соединение?',
      removeConfirmDesc: label =>
        `Соединение «${label}» будет удалено из этого приложения. Сам экземпляр не затрагивается — его можно снова добавить в любой момент.`,
      makePrimary: 'Сделать основным',
      testConnection: 'Проверить',
      testOk: 'Доступен',
      testFailed: 'Проверка соединения не пройдена',
      saveFailed: 'Не удалось сохранить соединение',
      removeFailed: 'Не удалось удалить соединение',
      updateAll: 'Обновить все экземпляры',
      updateAllRunning: 'Обновление всех экземпляров…',
      updateAllDone: 'Обновления разосланы',
      updateAllFailed: 'Не удалось разослать обновления',
      updateSkippedCloud: 'Управляется Hermes Cloud',
      thisDevice: 'Это устройство',
      kindLocal: 'Локальный',
      kindRemote: 'Удалённый шлюз',
      kindCloud: 'Hermes Cloud',
      kindSsh: 'SSH',
      kindLocalDesc: 'Среда выполнения Hermes, которой управляет это приложение.',
      kindRemoteDesc: 'Шлюз Hermes, доступный по HTTP(S) — в локальной сети, через Tailscale или интернет.',
      kindCloudDesc: 'Размещённый экземпляр, найденный через ваш аккаунт Hermes Cloud.',
      kindSshDesc: 'Установка Hermes, доступная по SSH.',
      labelTitle: 'Название',
      labelDesc:
        'Обязательное поле. Показывается везде, где встречается этот экземпляр; должно быть уникальным (например, «Домашний сервер», «Рабочий ноутбук»).',
      labelPlaceholder: 'Домашний сервер',
      urlTitle: 'URL шлюза',
      sshHostTitle: 'SSH-хост',
      headersTitle: 'Дополнительные заголовки шлюза',
      headersDesc:
        'Отправляются с каждым HTTP- и WebSocket-запросом к этому шлюзу — для прокси-серверов доступа, таких как Cloudflare Access (CF-Access-Client-Id / CF-Access-Client-Secret). Значения хранятся в зашифрованном виде. Заголовки, которыми управляет Hermes (Authorization, Cookie, Host…), игнорируются.',
      headerValuePlaceholder: 'Значение',
      headerValueSaved: 'Сохранено — оставьте пустым, чтобы не менять',
      headerAdd: 'Добавить заголовок',
      headerRemove: 'Удалить',
      duplicateLocal: 'Это приложение уже управляет локальным соединением — их может быть только одно.',
      duplicateUrl: label => `Соединение с этим URL шлюза уже есть («${label}»).`,
      duplicateSsh: label => `Соединение с этим SSH-хостом уже есть («${label}»).`,
      sameBackendHint: label => `Тот же бэкенд, что и «${label}»`,
      localAddHint:
        'Локальное соединение недоступно: управляемое локальное соединение уже существует (оно может быть только одно).',
      cloudAddHint:
        'Подсказка: после входа в Hermes Cloud выше ваши агенты найдутся автоматически — эта форма нужна только для ручной регистрации известного URL экземпляра.',
      save: 'Сохранить соединение',
      saving: 'Сохранение…',
      cancel: 'Отмена',
      empty: 'Соединения пока не зарегистрированы.'
    },
    managedUpdates: {
      title: 'Управляемые обновления',
      intro:
        'Транзакционное обновление SSH-установок, которыми управляет приложение: сеансы завершаются, удалённая рабочая копия обновляется, затем восстанавливается каждый профиль, а результат записывается в отчёт с идентификатором обновления.',
      sshConnection: 'SSH-установка под управлением приложения',
      update: 'Обновить',
      updating: 'Обновление…',
      progress: 'Завершение сеансов, обновление удалённой установки и восстановление профилей…',
      updated: 'Обновлено',
      partial: 'Обновлено — не удалось восстановить профили',
      refused: 'Отклонено',
      failed: 'Не удалось обновить',
      alreadyRunning: 'Обновление уже выполняется',
      receipt: (id: string, outcome: string) => `Отчёт ${id} · ${outcome}`,
      receiptVersions: (pre: string, post: string) => `${pre} → ${post}`,
      scopesRestored: (profiles: string) => `Восстановленные профили: ${profiles}`,
      scopeNotRestored: (profile: string, error: string) => `Профиль «${profile}» не восстановлен: ${error}`
    },
    gateway: {
      loading: 'Загрузка настроек шлюза...',
      unavailableTitle: 'Настройки шлюза недоступны',
      unavailableDesc:
        'Настройки подключения можно изменить только в приложении Hermes Desktop на компьютере, где оно запущено.',
      title: 'Подключение к шлюзу',
      envOverride: 'переопределено через env',
      intro:
        'По умолчанию шлюз локальный. Выберите удалённый, если приложение должно работать с бэкендом Hermes в другом месте. Подключения к шлюзам задаются для всего компьютера; профили берутся из подключённых шлюзов.',
      envOverrideTitle: 'Это подключение задано способом запуска Hermes.',
      envOverrideDesc:
        'Подключение выбрано параметром запуска вне приложения, поэтому настройки ниже доступны только для чтения. Чтобы изменить их здесь, перезапустите Hermes без этого параметра или обратитесь к тому, кто его настроил.',
      modeTitle: 'Режим подключения',
      localTitle: 'Локальный шлюз',
      localDesc: 'Запускает собственный бэкенд Hermes на localhost. Это вариант по умолчанию; работает без интернета.',
      remoteTitle: 'Удалённый шлюз',
      remoteDesc: 'Подключает это приложение к удалённому бэкенду Hermes.',
      remoteAuthHint:
        'Размещённые шлюзы используют OAuth или логин и пароль; шлюзы на собственном сервере могут использовать токен сеанса.',
      cloudTitle: 'Hermes Cloud',
      cloudDesc: 'Войдите в Hermes Cloud один раз и выбирайте агентов из своего аккаунта — вставлять URL не нужно.',
      cloudSignInTitle: 'Hermes Cloud',
      cloudSignIn: 'Войти в Hermes Cloud',
      cloudSignedIn: 'Вход в Hermes Cloud выполнен',
      cloudNeedsSignIn: 'Войдите в Hermes Cloud, чтобы обнаружить агентов в вашем аккаунте.',
      cloudSignedInDesc: 'Вход выполнен. Выберите агента ниже; сеанс обновляется автоматически.',
      cloudAgentsTitle: 'Ваши агенты',
      cloudOrgPickerTitle: 'Выберите организацию',
      cloudOrgSelect: 'Выбрать',
      cloudOrgChange: 'Сменить организацию',
      cloudOrgRole: role => `Роль: ${role}`,
      cloudLoadingAgents: 'Загрузка ваших агентов…',
      cloudNoAgents: {
        before: 'В этом аккаунте нет агентов. Создайте агента в ',
        linkText: 'Nous Portal',
        after: ', затем обновите список.'
      },
      cloudRefresh: 'Обновить',
      cloudConnect: 'Подключиться',
      cloudSavedTitle: 'Сохранённые облачные шлюзы',
      cloudSavedDesc:
        'Используйте сохранённый шлюз без изменения шлюза по умолчанию. Войдите ниже, чтобы добавить экземпляры. Имена и вход — в списке сохранённых подключений.',
      cloudUseSaved: 'Использовать шлюз',
      cloudActive: 'Активен в этом окне',
      cloudConnecting: 'Подключение…',
      cloudDiscoverFailed: 'Не удалось загрузить агентов Hermes Cloud',
      cloudConnectFailed: 'Не удалось подключиться к этому агенту',
      cloudSignInFailed: 'Не удалось войти в Hermes Cloud',
      cloudSignedOutTitle: 'Выход из Hermes Cloud выполнен',
      cloudSignedOutMessage: 'Сеанс Hermes Cloud сброшен.',
      cloudConnectedTitle: 'Подключено',
      cloudConnectedPill: 'Подключено',
      cloudConnectedTo: name => `Подключено к ${name}.`,
      cloudAgentProvisioning: 'Развёртывание…',
      cloudStatusLabel: status => `Статус: ${status}`,
      remoteUrlTitle: 'Удалённый URL',
      remoteUrlDesc: 'Базовый URL удалённого бэкенда дашборда. Поддерживаются префиксы пути, например /hermes.',
      probing: 'Проверка способа аутентификации шлюза…',
      probeError:
        'Hermes не может связаться с этим адресом. Проверьте URL и убедитесь, что на другом компьютере запущен Hermes, — способы входа появятся, когда он ответит.',
      signedIn: 'Вход выполнен',
      signedInMessage: provider => `Подключено через ${provider}`,
      signIn: 'Войти',
      signOut: 'Выйти',
      signInWith: provider => `Войти через ${provider}`,
      authTitle: 'Аутентификация',
      authSignedInPassword: 'Этот шлюз использует логин и пароль. Вход выполнен; сеанс обновляется автоматически.',
      authSignedInOauth: 'Этот шлюз использует OAuth. Вход выполнен; сеанс обновляется автоматически.',
      authNeedsPassword: 'Этот шлюз использует логин и пароль. Войдите, чтобы авторизовать это приложение.',
      authNeedsOauth: provider =>
        `Этот шлюз использует OAuth. Войдите через ${provider}, чтобы авторизовать это приложение.`,
      tokenTitle: 'Токен сеанса',
      tokenDesc:
        'Токен сеанса дашборда для доступа через REST и WebSocket. Оставьте поле пустым, чтобы сохранить текущий токен.',
      existingToken: value => `Текущий токен ${value}`,
      savedToken: 'сохранён',
      pasteSessionToken: 'Вставьте токен сеанса',
      plainTextConfirmTitle: 'Хранить токен шлюза в открытом виде?',
      plainTextConfirmDesc:
        'Служба системного хранилища ключей на этом компьютере не найдена, поэтому токен будет сохранён без шифрования в файле настроек соединения приложения, и его сможет прочитать любой процесс, работающий от вашего имени. Для шифрованного хранения установите или включите системное хранилище ключей (в Linux — GNOME Keyring или KWallet).',
      plainTextConfirmAction: 'Сохранить в открытом виде',
      plainTextStoredTitle: 'Токен сохранён в открытом виде',
      plainTextStoredDesc:
        'Безопасное хранилище недоступно, поэтому сохранённый токен хранится без шифрования в файле настроек соединения приложения на этом компьютере. Чтобы зашифровать его, установите или включите системное хранилище ключей (в Linux — GNOME Keyring или KWallet).',
      keychainEncryptionTitle: 'Шифровать сохранённые секреты с помощью системного хранилища ключей',
      keychainEncryptionDesc:
        'По умолчанию выключено. Если включено, токены шлюза и учётные данные для входа шифруются с помощью системного хранилища ключей («Связка ключей», GNOME Keyring или Windows DPAPI) — система может запросить разрешение или пароль. Если выключено, они хранятся в обычных файлах, доступных для чтения только вашей учётной записи.',
      keychainEncryptionFailed: 'Не удалось изменить шифрование секретов',
      testRemote: 'Проверить удалённый шлюз',
      saveForRestart: 'Сохранить для следующего перезапуска',
      saveAndReconnect: 'Сохранить и переподключиться',
      diagnostics: 'Диагностика',
      diagnosticsDesc: 'Показать desktop.log в файловом менеджере — полезно, если шлюз не запускается.',
      openLogs: 'Открыть журналы',
      incompleteTitle: 'Настройки удалённого шлюза неполные',
      incompleteSignIn: 'Введите удалённый URL и войдите, прежде чем переключаться на удалённый режим.',
      incompleteToken: 'Введите удалённый URL и токен сеанса, прежде чем переключаться на удалённый режим.',
      incompleteSignInTest: 'Введите удалённый URL и войдите, прежде чем проверять.',
      incompleteTokenTest: 'Введите удалённый URL и токен сеанса, прежде чем проверять.',
      enterUrlFirst: 'Сначала введите удалённый URL.',
      restartingTitle: 'Перезапуск подключения к шлюзу',
      savedTitle: 'Настройки шлюза сохранены',
      restartingMessage:
        'Hermes Desktop переподключится с сохранёнными настройками — окно приложения останется открытым.',
      savedMessage: 'Сохранено для следующего перезапуска.',
      connectedTo: (baseUrl, version) => `Подключено к ${baseUrl}${version ? ` · Hermes ${version}` : ''}`,
      reachableTitle: 'Удалённый шлюз доступен',
      signedOutTitle: 'Выход выполнен',
      signedOutMessage: 'Сеанс удалённого шлюза сброшен.',
      failedLoad: 'Не удалось загрузить настройки шлюза',
      signInFailed: 'Не удалось войти',
      signOutFailed: 'Не удалось выйти',
      testFailed: 'Проверка удалённого шлюза не пройдена',
      applyFailed: 'Не удалось применить настройки шлюза',
      saveFailed: 'Не удалось сохранить настройки шлюза',
      sshTitle: 'Подключение по SSH',
      sshDesc:
        'Hermes запускается на удалённом компьютере по SSH, а связь с этим приложением идёт через туннель — самому ничего запускать или открывать наружу не нужно. Требуется рабочий SSH-доступ к хосту по ключу.',
      sshTrustHint:
        'Ключ хоста, предъявленный при первом подключении, считается доверенным и закрепляется; если он изменится, подключение будет заблокировано.',
      sshHostTitle: 'Хост',
      sshHostDesc: 'user@host или псевдоним Host из ~/.ssh/config.',
      sshHostPick: 'Выберите хост…',
      sshHostPickTitle: 'Хост',
      sshHostPickDesc: 'Псевдоним Host из ~/.ssh/config, либо «Свой», чтобы ввести вручную.',
      sshHostCustom: 'Свой (ввести вручную)…',
      sshUserTitle: 'Пользователь',
      sshUserDesc: 'Пусто = ~/.ssh/config или ваш текущий пользователь.',
      sshUserPlaceholder: 'из ~/.ssh/config',
      sshPortTitle: 'Порт',
      sshPortDesc: 'Пусто = 22 или порт из ~/.ssh/config.',
      sshKeyTitle: 'Файл ключа',
      sshKeyDesc: 'Путь к закрытому ключу. Пусто = ssh-agent или ~/.ssh/config.',
      sshHermesPathTitle: 'Путь к Hermes (необязательно)',
      sshHermesPathDesc: 'Полный путь к исполняемому файлу hermes на удалённом хосте. Пусто = автоопределение.',
      sshHermesPathPlaceholder: 'автоопределение',
      sshTestConnection: 'Проверить SSH',
      sshConnect: 'Подключиться',
      sshButtonsHint: '«Сохранить» применяет настройки при следующем запуске, «Подключиться» — переподключает сразу.',
      sshReachable: (host, platform) => `Доступен: ${host} (${platform}) — Hermes найден`,
      sshIncompleteHost: 'Введите SSH-хост перед подключением.',
      sshErrUnreachable: 'Не удалось подключиться к этому хосту по SSH. Проверьте хост, порт и сеть.',
      sshErrAuth:
        'Не удалось пройти SSH-аутентификацию. Загрузите ключ в ssh-agent (ssh-add) или задайте IdentityFile в ~/.ssh/config — Hermes запускает ssh в неинтерактивном режиме.',
      sshErrHostKey:
        'Ключ хоста ИЗМЕНИЛСЯ с момента последнего подключения. Убедитесь, что так и должно быть, затем выполните ssh-keygen -R <host> и подключитесь снова.',
      sshErrNotInstalled:
        'Hermes не установлен на удалённом хосте. Установите его там (curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh) или задайте путь к Hermes.',
      sshErrPlatform:
        'Неподдерживаемая удалённая платформа. SSH-режим Hermes Desktop поддерживает удалённые хосты Linux, macOS и Windows.',
      sshErrTimeout:
        'Истекло время ожидания SSH-подключения. Хост может быть недоступен или находиться в спящем режиме.',
      sshErrUpdateRequired: 'Перед подключением через SSH обновите Hermes на удалённом хосте.',
      sshErrInteractiveAuth:
        'Tailscale SSH требует интерактивной проверки в браузере. Выполните `ssh <host> true` в терминале, завершите проверку и повторите попытку — Hermes запускает SSH неинтерактивно.',
      sshErrUnknown: 'Не удалось установить SSH-подключение.',
      webAccess: {
        title: 'Веб-доступ',
        intro:
          'Открывайте Hermes на этом компьютере с телефона или другого компьютера, войдя через аккаунт Nous. Любой, кто войдёт, сможет выполнять команды на этом компьютере.',
        failed: 'Не удалось изменить веб-доступ',
        running: 'Работает',
        stopped: 'Остановлен',
        starting: 'Запускается',
        stopping: 'Останавливается',
        restartNeeded: 'Нужен перезапуск',
        unavailable: 'Недоступен',
        notRunningDetail: 'Запустите его, чтобы открыть Hermes с другого устройства.',
        needsNous: 'Сначала войдите в аккаунт Nous в разделе «Провайдеры».',
        runningLan: 'Откройте этот адрес на устройстве в той же сети.',
        runningPublic: 'Доступен через ваш URL.',
        runningLocal:
          'Открыть его можно только на этом компьютере. Остановите и снова запустите его, чтобы открыть с других устройств.',
        pendingOn: 'Сохранено. Шлюз начнёт обслуживать веб-приложение после перезапуска.',
        pendingOff: 'Выключено, но шлюз продолжит обслуживать веб-приложение до перезапуска.',
        unavailableDetail: reason => `Шлюзу не удалось запустить веб-приложение: ${reason}`,
        restartBusy:
          'Сохранено. Идёт чат, поэтому шлюз не перезапущен. Когда он закончится, нажмите «Перезапустить шлюз».',
        restartFailed:
          'Сохранено, но не удалось перезапустить шлюз. Нажмите «Перезапустить шлюз», чтобы попробовать снова.',
        restartFailedBecause: reason => `Не удалось перезапустить шлюз: ${reason}`,
        startTimedOut: 'Шлюз не запустил веб-приложение за 90 секунд.',
        stopTimedOut: 'Шлюз не остановил веб-приложение за 90 секунд.',
        startStages: {
          preparing: 'Подготовка веб-приложения. Сборка может занять несколько минут.',
          building: 'Сборка веб-приложения. Это может занять несколько минут.',
          registering: 'Настройка входа через Nous для этого адреса.',
          restarting: 'Перезапуск шлюза для запуска веб-приложения.'
        },
        startElapsed: time => `Прошло: ${time}`,
        start: 'Запустить',
        stop: 'Остановить',
        restartGateway: 'Перезапустить шлюз',
        modeLan: 'Эта сеть',
        modeLanDetail: url =>
          `Устройства в вашей сети Wi-Fi могут открыть ${url}. Используйте этот режим только в доверенной сети.`,
        lanUnencrypted:
          'Соединение не зашифровано: другие пользователи этой сети могут прочитать то, что вы отправляете и получаете.',
        noLan: 'У этого компьютера нет сетевого адреса, доступного другим устройствам.',
        modePublic: 'Мой собственный URL',
        modePublicDetail: port =>
          `Уже работающий HTTPS-адрес, например Tailscale Serve или туннель, который перенаправляет на http://127.0.0.1:${port}.`
      },
      webappHostDesc:
        'Webapp всегда работает на хосте Hermes, который его обслуживает. Сохранённые подключения ниже — список этого компьютера, общий с приложением Hermes Desktop; другие шлюзы доступны через этот хост.',
      webappHostTitle: 'Хост Hermes',
      webappOauthPaste: {
        title: 'Завершить вход',
        description:
          'Если вкладка входа остановилась на адресе, который не открывается (этот браузер не на компьютере шлюза), вставьте этот адрес сюда.',
        placeholder: 'http://127.0.0.1:…/webapp/gateway-connections/oauth/callback?…',
        finish: 'Завершить',
        failed: 'Не удалось завершить вход'
      },
      webappRelay: {
        signInElsewhere: 'Вход в другой шлюз здесь недоступен.',
        signOutHereOnly: 'Здесь можно выйти только из этого шлюза.',
        testFromRow:
          'Сохраните это подключение, затем нажмите «Проверить» в его строке: Webapp проверяет его через этот шлюз.',
        nameBeforeSignIn: 'Назовите это подключение, затем войдите.',
        signInUnfinished: 'Вход не завершён',
        noSignInForAddress: 'Ни одно сохранённое подключение не входит по этому адресу.',
        listUnreadable: 'Hermes не вернул сохранённые подключения',
        relayTicketMissing: 'Hermes не вернул билет ретрансляции',
        sshUnreached: label => `«${label}» — подключение по SSH, к которому Webapp пока не подключается`,
        noAnswer: label => `«${label}» не ответил`,
        chatOpensInTab: 'Чат на другом шлюзе открывается в этой вкладке, а не в новом окне.'
      }
    },
    keys: {
      loading: 'Загрузка API-ключей и учётных данных...',
      failedLoad: 'Не удалось загрузить API-ключи',
      empty: 'В этой категории пока ничего не настроено.'
    },
    search: {
      placeholder: 'Поиск по всем настройкам…',
      pill: 'Поиск'
    },
    profileScope: {
      appliesTo: 'Применяется к профилю',
      editsProfile: profile => `Изменения на этой странице применяются к профилю «${profile}».`
    },
    mcp: {
      loading: 'Загрузка MCP-серверов...',
      invalidJson: 'Неверный JSON MCP',
      saveFailed: 'Не удалось сохранить',
      removeFailed: 'Не удалось удалить',
      reloadFailed: 'Не удалось перезагрузить MCP',
      savedTitle: 'MCP-сервер сохранён',
      savedMessage: name => `${name}: изменения вступят в силу после перезагрузки MCP.`,
      disabled: 'отключён',
      name: 'Имя',
      serverJson: 'JSON сервера',
      remove: 'Удалить',
      test: 'Проверить соединение',
      catalogLoading: 'Загрузка каталога MCP...',
      catalogInstallFailed: name => `Не удалось установить ${name}`,
      catalogInstallTimeout: name =>
        `Hermes перестал ждать завершения установки ${name}, но она, возможно, ещё продолжается.`,
      catalogEnvRequired: 'Заполните обязательные значения перед установкой.',
      capabilitySummary: (tools, prompts, resources) =>
        [
          `${tools} ${RU_PLURAL(tools, 'инструмент', 'инструмента', 'инструментов')} ${RU_PLURAL(tools, 'включён', 'включено', 'включено')}`,
          ...(prompts ? [`${prompts} ${RU_PLURAL(prompts, 'промпт', 'промпта', 'промптов')}`] : []),
          ...(resources ? [`${resources} ${RU_PLURAL(resources, 'ресурс', 'ресурса', 'ресурсов')}`] : [])
        ].join(', '),
      costTokens: tokens => `~${tokens} ${RU_PLURAL(tokens, 'токен', 'токена', 'токенов')}/вызов`,
      usage30d: uses => `${uses} ${RU_PLURAL(uses, 'использование', 'использования', 'использований')} за 30 дн.`,
      statusConnecting: 'Подключение…',
      statusNeedsAuth: 'Нужна аутентификация',
      statusError: 'Ошибка',
      statusOff: 'Выкл',
      allServers: 'Все серверы',
      authenticatedTitle: 'Аутентификация выполнена',
      authenticatedMessage: (server, count) =>
        `${server}: ${count} ${RU_PLURAL(count, 'инструмент', 'инструмента', 'инструментов')}`,
      authenticate: 'Пройти аутентификацию',
      noOutput: 'Вывода пока нет.',
      deepLinkTitle: 'Добавить MCP-сервер?',
      deepLinkDescription:
        'Ссылка запросила добавить этот MCP-сервер в Hermes. Проверьте конфигурацию ниже — она пришла из ссылки, а не из Hermes.',
      deepLinkStdioWarning:
        'Этот сервер запускает на вашем компьютере локальный процесс командой, показанной ниже. Продолжайте, только если доверяете источнику.',
      deepLinkConfirm: 'Добавить сервер',
      deepLinkNameInvalid: 'Имя: 1–64 символа — буквы, цифры, точки, дефисы или подчёркивания.',
      deepLinkNameConflict: name => `Сервер с именем ${name} уже существует — выберите другое имя или отмените.`,
      deepLinkErrorTitle: 'Ссылка на установку MCP отклонена',
      deepLinkErrorName: 'Имя сервера в ссылке отсутствует или некорректно.',
      deepLinkErrorConfig: 'Конфигурация в ссылке не является корректным JSON в base64.',
      deepLinkErrorShape: 'Конфигурация должна быть JSON-объектом со строковым полем `url` или `command`.',
      deepLinkErrorUrl: 'Разрешены только URL серверов http:// и https://.',
      deepLinkErrorTooLarge: 'Размер конфигурации превышает лимит 32 КБ.',
      importButton: 'Импортировать',
      importPlaceholder:
        'Вставьте фрагмент mcp.json, команду npx/docker, строку claude mcp add, URL или ссылку Cursor…',
      importNoMatch: 'Во вставленном тексте не найдено конфигурации сервера.',
      importConfirm: 'Добавить в mcp.json',
      importConfirmMany: count => `Добавить ${count} ${RU_PLURAL(count, 'сервер', 'сервера', 'серверов')} в mcp.json`,
      catalogAuthOAuth: 'OAuth',
      catalogAuthApiKey: 'API-ключ'
    },
    model: ruModelSettings,
    customEndpoints: ruCustomEndpoints,
    uninstall: {
      dangerZone: 'Опасная зона',
      checking: 'Проверка установленных компонентов…',
      confirmTitle: 'Подтвердите удаление',
      confirmBody: consequence => `Будет удалено: ${consequence}. Это нельзя отменить.`,
      appPathLabel: path => `Приложение: ${path}`,
      uninstalling: 'Удаление…',
      confirmYes: 'Да, удалить',
      heading: 'Удаление Hermes',
      chooseBody:
        'Выберите, что удалить. Приложение закроется, чтобы завершить удаление; вернуться можно в любой момент, снова открыв установщик.',
      startFailed: 'Не удалось начать удаление.',
      options: {
        gui: {
          title: 'Удалить только Chat GUI',
          description: 'Удаляет это приложение. Агент Hermes, ваша конфигурация и чаты остаются.',
          consequence: 'настольный Chat GUI (это приложение и его данные)'
        },
        lite: {
          title: 'Удалить GUI + агента, сохранить мои данные',
          description:
            'Удаляет приложение и агента Hermes, но сохраняет конфигурацию, чаты и секреты для будущей переустановки.',
          consequence: 'Chat GUI и агент Hermes (конфигурация, чаты и секреты сохранятся)'
        },
        full: {
          title: 'Удалить всё',
          description:
            'Удаляет приложение, агента и все пользовательские данные — конфигурацию, чаты, запланированные задачи, секреты, журналы.',
          consequence: 'ВСЁ — Chat GUI, агент Hermes и вся ваша конфигурация, чаты, секреты и журналы'
        }
      }
    },
    localModels: ruLocalModels,
    providers: {
      connectAccount: 'Подключить аккаунт',
      haveApiKey: 'У вас есть API-ключ?',
      intro:
        'Войдите по подписке — копировать API-ключ не нужно. Hermes проведёт вход в браузере прямо здесь, в приложении.',
      connected: 'Подключено',
      collapse: 'Свернуть',
      connectAnother: 'Подключить другого провайдера',
      otherProviders: 'Другие провайдеры',
      disconnect: 'Отключить',
      disconnectInTerminal: 'Отключить (выполнит команду удаления в терминале)',
      removeConfirm: provider => `Удалить ${provider}?`,
      removeExternalGeneric: provider => `${provider} управляется собственным CLI — удалите его там.`,
      removeKeyManaged: provider => `${provider} настроен по API-ключу. Удалите его в разделе API-ключи.`,
      removeTerminalConfirm: (provider, command) =>
        `Отключить ${provider}? В терминале будет выполнена команда "${command}" для сброса учётных данных.`,
      removeTerminalRunning: provider => `Выполняется отключение ${provider} в терминале…`,
      removedTitle: 'Аккаунт удалён',
      removedMessage: provider => `${provider} удалён.`,
      failedRemove: provider => `Не удалось удалить ${provider}`,
      noProviderKeys: 'API-ключи провайдеров недоступны.',
      searchKeys: 'Поиск провайдеров…',
      noKeysMatch: 'По вашему запросу провайдеры не найдены.',
      localEndpoint: {
        title: 'Локальный / свой эндпоинт',
        description: 'Направьте Hermes на любой OpenAI-совместимый эндпоинт (Zyphra, vLLM, llama.cpp, Ollama и т. д.).'
      },
      loading: 'Загрузка провайдеров...',
      providerLabels: {},
      providerDescriptions: {}
    },
    sessions: {
      loading: 'Загрузка архивных сеансов…',
      archivedTitle: 'Архивные сеансы',
      archivedIntro:
        'Архивные чаты скрыты с боковой панели, но все их сообщения сохраняются. Чтобы архивировать чат, щёлкните его на боковой панели с нажатыми Alt/⌥+Shift.',
      emptyArchivedTitle: 'Архив пуст',
      emptyArchivedDesc: 'Архивируйте чат, чтобы убрать его сюда.',
      unarchive: 'Восстановить',
      deletePermanently: 'Удалить безвозвратно',
      messages: count => `${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')}`,
      restored: 'Восстановлено',
      deleteConfirm: title => `Безвозвратно удалить «${title}»? Это действие необратимо.`,
      autoArchiveTitle: 'Автоархивация неактивных чатов',
      autoArchiveDesc:
        'Автоматически архивирует чаты, к которым вы давно не возвращались. Закреплённые чаты никогда не архивируются, и ничего не удаляется — архивные чаты просто переносятся сюда.',
      autoArchiveDaysLabel: 'Архивировать через',
      autoArchiveDaysUnit: 'дн. бездействия',
      autoArchiveFailed: 'Не удалось изменить автоархивацию',
      defaultDirTitle: 'Папка проекта по умолчанию',
      defaultDirDesc:
        'Новые сеансы начинаются в этой папке, если вы не выберете другую. Оставьте поле пустым, чтобы использовать домашнюю папку.',
      defaultDirUpdated: shortcut =>
        `Папка проекта по умолчанию обновлена — начните новый чат${shortcut ? ` (${shortcut})` : ''}, чтобы изменение вступило в силу`,
      defaultsTo: label => `По умолчанию: ${label}.`,
      change: 'Изменить',
      choose: 'Выбрать',
      clear: 'Очистить',
      notSet: 'Не задано',
      failedLoad: 'Не удалось загрузить архивные сеансы',
      unarchiveFailed: 'Не удалось восстановить',
      deleteFailed: 'Не удалось удалить',
      updateDirFailed: 'Не удалось обновить папку по умолчанию',
      clearDirFailed: 'Не удалось очистить папку по умолчанию'
    },
    toolsets: {
      loadingConfig: 'Загрузка конфигурации',
      savedTitle: 'Учётные данные сохранены',
      savedMessage: key => `Обновлено: ${key}.`,
      removedTitle: 'Учётные данные удалены',
      removedMessage: key => `Удалено: ${key}.`,
      failedSave: key => `Не удалось сохранить ${key}`,
      failedRemove: key => `Не удалось удалить ${key}`,
      failedReveal: key => `Не удалось показать ${key}`,
      removeConfirm: key => `Удалить ${key} из .env?`,
      set: 'Задано',
      notSet: 'Не задано',
      selectedTitle: 'Провайдер выбран',
      selectedMessage: provider => `Сейчас активен ${provider}.`,
      failedSelect: provider => `Не удалось выбрать ${provider}`,
      failedLoad: 'Не удалось загрузить конфигурацию инструментов',
      noProviderOptions:
        'У этого набора инструментов нет вариантов провайдера — включите его, и он будет работать с вашей текущей конфигурацией.',
      noProviders: 'Для этого набора инструментов сейчас нет доступных провайдеров.',
      ready: 'Готов',
      needsSignIn: 'Нужен вход',
      needsSetup: 'Требуется настройка',
      badgeTokens: {},
      tagCopy: {},
      activeBackend: 'Активен',
      activeBackendHint: 'Это активный бэкенд',
      useBackend: 'Использовать этот бэкенд',
      nousIncluded: 'Входит в подписку Nous — войдите в аккаунт Nous, чтобы активировать.',
      nousAuthNeededTitle: 'Войдите в аккаунт Nous',
      nousAuthNeededMessage: provider =>
        `Провайдер «${provider}» сохранён, но заработает только после входа в аккаунт Nous.`,
      nousAuthSignIn: 'Войти',
      nousAuthDoneTitle: 'Аккаунт Nous подключён',
      nousAuthDoneMessage: 'Бэкенды по подписке теперь активны.',
      nousAuthFailed: 'Вход в аккаунт Nous не завершён',
      noApiKeyRequired: 'API-ключ не требуется.',
      postSetupHint: step =>
        `Этому бэкенду нужна однократная установка (${step}). Она выполняется на этом компьютере и может занять несколько минут.`,
      postSetupInstalledHint: 'Установлено. Повторяйте настройку, только если что-то не работает.',
      postSetupRun: 'Запустить настройку',
      postSetupRerun: 'Повторить настройку',
      postSetupInstalled: 'Установлено',
      postSetupRunning: 'Установка…',
      postSetupStarting: 'Запуск…',
      postSetupCompleteTitle: 'Настройка завершена',
      postSetupCompleteMessage: step => `Установлено: ${step}.`,
      postSetupErrorTitle: 'Настройка завершилась с ошибками',
      postSetupErrorMessage: step =>
        `Настройка ${step} не завершилась. Откройте журнал, чтобы узнать причину, затем запустите настройку снова.`,
      postSetupFailed: step => `Не удалось запустить настройку ${step}`,
      webSearchActive: backend => `Поиск: ${backend}`,
      webExtractActive: backend => `Извлечение: ${backend}`,
      webCapabilityUnset: 'не задано',
      webUseForSearch: 'Использовать для поиска',
      webUseForExtract: 'Использовать для извлечения',
      webUsedForSearch: 'Бэкенд поиска',
      webUsedForExtract: 'Бэкенд извлечения',
      webCapabilitySelectedMessage: (provider, capability) =>
        `${provider} теперь отвечает за ${capability === 'search' ? 'поиск в вебе' : 'извлечение веб-контента'}.`,
      failedSelectCapability: provider => `Не удалось назначить ${provider}`,
      loadingModels: 'Загрузка каталога моделей...',
      modelSectionTitle: 'Модель',
      modelCount: count => `${count} ${RU_PLURAL(count, 'модель', 'модели', 'моделей')}`,
      modelInUse: 'Используется',
      modelDefault: 'по умолчанию',
      modelInactiveHint: 'Сначала выберите этот бэкенд, чтобы изменить его модель.',
      modelSelectedTitle: 'Модель выбрана',
      modelSelectedMessage: model => `${model} применится к новым сеансам.`,
      failedSelectModel: model => `Не удалось выбрать ${model}`,
      modelLabels: {},
      modelSpeeds: {},
      modelDescriptions: {},
      modelPrices: {},
      terminalBackend: {
        sectionTitle: 'Бэкенд выполнения',
        loading: 'Проверка бэкендов выполнения…',
        failedLoad: 'Не удалось загрузить бэкенды терминала',
        ready: 'Готов',
        needsSetup: 'Нужна настройка',
        unavailable: 'Недоступен',
        inUse: 'Используется',
        selectedTitle: 'Бэкенд выбран',
        selectedMessage: backend =>
          `Команды терминала теперь выполняются через ${backend}. Применяется к новым сеансам.`,
        failedSelect: backend => `Не удалось выбрать ${backend}`,
        needsSetupHint: 'Этот бэкенд выбран без полной настройки — команды не будут работать, пока она не завершится.',
        descriptions: {},
        details: {},
        needsSetupConfirmTitle: backend => `Всё равно выбрать ${backend}?`,
        needsSetupConfirmDescription: detail =>
          `${detail} Сеансы, запущенные после этого изменения, останутся без терминала и файловых инструментов, пока настройка не завершена.`,
        needsSetupConfirmDescriptionGeneric:
          'Этот бэкенд ещё не настроен. Сеансы, запущенные после этого изменения, останутся без терминала и файловых инструментов, пока настройка не завершена.',
        needsSetupConfirmAction: 'Выбрать всё равно',
        unavailableTitle: 'Команды терминала недоступны',
        unavailableMessage: backend =>
          `Hermes сейчас не может выполнять команды оболочки: бэкенд ${backend} не готов. Переключитесь на локальный бэкенд или завершите настройку ${backend} и попробуйте снова.`,
        openBackendSettings: 'Открыть настройки терминала',
        useLocal: 'Использовать локальный',
        switchedToLocal: 'Команды терминала теперь выполняются локально. Применяется к новым сеансам.'
      },
      computerUse: {
        checking: 'Проверка состояния Computer Use…',
        statusReadFailed: 'Не удалось прочитать состояние Computer Use',
        unsupported: platform => `Computer Use не поддерживается на этой платформе (${platform}).`,
        installHint: 'Установите ниже бэкенд cua-driver, чтобы управлять этим компьютером.',
        installGrantHint: ' Затем выдайте здесь разрешения «Универсальный доступ» и «Запись экрана».',
        platformNotes: {
          linux: 'Управляет рабочим столом через стек специальных возможностей X11/XWayland — без запроса разрешений.',
          win32:
            'При первом запуске Windows SmartScreen может запросить разрешение для процесса UIAccess из cua-driver — разрешите его.'
        },
        macGrantNote:
          'Разрешения выдаются самому CuaDriver (com.trycua.driver), а не Hermes, поэтому в диалоге указан процесс, который управляет вашим Mac.',
        recheck: 'Проверить снова',
        accessibility: 'Универсальный доступ',
        accessibilityHint: 'Позволяет cua-driver отправлять клики и нажатия клавиш, а также читать дерево доступности.',
        screenRecording: 'Запись экрана',
        screenRecordingHint: 'Позволяет cua-driver делать снимки окон приложений.',
        driverHealth: 'Состояние драйвера',
        granted: 'Предоставлено',
        notGranted: 'Не предоставлено',
        ready: 'Готов',
        notReady: 'Не готов',
        unknown: 'Неизвестно',
        readyMessage: 'Computer Use готов. Попросите агента сделать снимок окна приложения и покликать по нему.',
        grantPermissions: 'Предоставить разрешения',
        waitingApproval: 'Ожидание подтверждения…',
        grantFailed: 'Не удалось запросить разрешения',
        approveTitle: 'Подтвердите в Системных настройках',
        approveMessage: 'macOS покажет запрос разрешения от имени CuaDriver. Подтвердите его и вернитесь сюда.'
      },
      browserRealProfile: {
        label: 'Использовать мой настоящий профиль браузера',
        description:
          'Копирует логины и файлы cookie из браузера по умолчанию в управляемый снимок, с которым работает агент, и выполняет с ними вход во вкладке встроенного браузера. Сам профиль браузера никогда не открывается напрямую. Применяется к новым сеансам.',
        enabledTitle: 'Настоящий профиль браузера включён',
        enabledMessage: 'В новых сеансах браузер будет работать со снимком профиля вашего браузера по умолчанию.',
        disabledTitle: 'Настоящий профиль браузера отключён',
        disabledMessage:
          'Снимок профиля будет удалён, а встроенный браузер выйдет из этих аккаунтов; в новых сеансах используется чистый браузер.',
        failedSave: 'Не удалось сохранить настройку настоящего профиля',
        reimportSignins: 'Импортировать входы заново',
        signinsImportedTitle: 'Входы во встроенном браузере',
        signinsImported: count => `Встроенный браузер вошёл с cookie из профиля браузера: ${count}.`,
        signinsRemote:
          'Этот бэкенд работает на другом компьютере, поэтому его профиль браузера не импортируется во встроенный браузер.',
        signinsFailed: 'Не удалось импортировать входы во встроенный браузер',
        prompt: {
          title: 'Сохраните вход на своих сайтах',
          body: 'Разрешите Hermes работать в браузере со снимком профиля вашего браузера по умолчанию, чтобы на сайтах уже был выполнен вход — и для агента, и во вкладке встроенного браузера.',
          bulletSnapshot: 'Файлы cookie и логины копируются в управляемый снимок.',
          bulletLiveProfile: 'Сам профиль браузера никогда не открывается напрямую.',
          bulletLocal: 'Никакие данные не покидают этот компьютер.',
          dontShowAgain: 'Больше не показывать',
          notNow: 'Не сейчас',
          enable: 'Использовать мой профиль'
        }
      },
      nousAuthFailedMessage: 'Попробуйте ещё раз.',
      nousAuthTryAgain: 'Повторить',
      postSetupOpenLogs: 'Открыть журналы',
      postSetupRunAgain: 'Запустить снова'
    },
    subpages: {
      appearanceTheme: 'Тема',
      appearanceTypography: 'Шрифты и масштаб',
      appearanceWindowLayout: 'Окно и раскладка',
      appearanceChatDisplay: 'Отображение чата',
      appearancePet: 'Питомец',
      appearanceGeneral: 'Общие',
      modelMain: 'Основная модель',
      modelAuxiliary: 'Вспомогательные модели',
      modelMoa: 'Mixture of Agents',
      modelFallbacks: 'Резервные модели',
      chatBehavior: 'Поведение',
      chatAttachments: 'Вложения',
      workspaceProjects: 'Проекты и обнаружение',
      workspaceShell: 'Среда оболочки',
      workspaceFiles: 'Файлы и выполнение',
      safetyApprovals: 'Подтверждения',
      safetyPrivacy: 'Приватность и сеть',
      safetyCheckpoints: 'Контрольные точки',
      browserProfile: 'Профиль браузера',
      browserNetwork: 'Локальные и частные URL',
      memoryPersistent: 'Постоянная память',
      memoryContext: 'Контекст и сжатие',
      voiceConversation: 'Голосовой разговор',
      voiceTranscription: 'Распознавание речи',
      voiceSpeech: 'Синтез речи',
      advancedRuntime: 'Ограничения агента',
      advancedTools: 'Доступ к инструментам',
      advancedTerminal: 'Бэкенд терминала',
      advancedOutput: 'Ограничения вывода',
      advancedDelegation: 'Субагенты',
      advancedDesktop: 'Приложение и запуск',
      gatewayConnection: 'Основной шлюз',
      gatewayDevices: 'Сохранённые подключения',
      gatewayManagedUpdates: 'Удалённые обновления',
      gatewayManagedUpdatesUnavailable:
        'Для удалённых обновлений нужна версия приложения с поддержкой управляемых обновлений по SSH.',
      gatewayManagedUpdatesEmpty:
        'Добавьте SSH-подключение в разделе «Сохранённые подключения», чтобы управлять его обновлениями здесь.',
      keyboardShortcuts: 'Сочетания клавиш',
      hudGesture: 'Жест HUD',
      screenCapture: 'Захват экрана',
      notificationAlerts: 'Системные уведомления',
      notificationSounds: 'Звуки',
      archivedSessions: 'Архив и хранение',
      defaultDirectory: 'Папка проекта по умолчанию',
      vaultCredentials: 'Сохранённые учётные данные',
      vaultSources: 'Менеджеры паролей',
      appUpdates: 'Версия и обновления',
      uninstall: 'Удаление',
      billingOverview: 'Обзор',
      billingPlans: 'Тарифы'
    },
    uninstallSection: ruUninstallSection,
    computerUse: {
      accessibility: 'Универсальный доступ',
      screenRecording: 'Запись экрана',
      driverHealth: 'Состояние драйвера'
    },
    hudModifier: {
      title: 'Вызов HUD коротким нажатием',
      description:
        'Нажмите и отпустите ⌘ + Option на Mac или Ctrl + Alt на Windows/Linux, чтобы вызвать HUD из любого приложения. По умолчанию выключено; действует только на этом устройстве.',
      permission:
        'Разрешите Hermes доступ в Системных настройках → Конфиденциальность и безопасность → Мониторинг ввода, затем повторите попытку. Жест не записывает нажатия клавиш и не снимает экран.',
      unavailable:
        'Вспомогательная программа жеста HUD не запустилась или неожиданно остановилась. Повторите попытку или перезапустите Hermes. Обычное сочетание HUD по-прежнему работает внутри Hermes.',
      missingHelper:
        'В этой установке Hermes отсутствует вспомогательная программа жеста HUD. Обновите или переустановите Hermes и повторите попытку.',
      unsupportedSession:
        'Этот сеанс рабочего стола не поддерживает глобальные нажатия модификаторов. В Linux требуется X11; Wayland не поддерживается.'
    },
    screenshot: {
      enabledTitle: 'Сочетание клавиш для снимка окна',
      enabledDesc:
        'Нажмите обе клавиши Command одновременно в любом приложении, чтобы снять его активное окно и прикрепить снимок к текущему черновику Hermes. Автоматической отправки нет. По умолчанию выключено; действует только на этом Mac. Окно может содержать конфиденциальные данные — проверьте вложение перед отправкой.',
      statusTitle: 'Состояние сочетания для снимка окна',
      checking: 'Проверка сочетания для снимка окна…',
      disabled: 'Сочетание для снимка окна выключено.',
      starting: 'Запускается отслеживание сочетания. Оно пока не готово.',
      ready: 'Сочетание готово. Снимки прикрепляются к текущему черновику без отправки.',
      inputPermission:
        'Разрешение на мониторинг ввода позволяет Hermes распознавать обе клавиши Command, когда активно другое приложение. Разрешите Hermes доступ в Системных настройках → Конфиденциальность и безопасность → Мониторинг ввода, затем вернитесь сюда и повторите попытку.',
      screenPermission:
        'Разрешение на запись экрана позволяет Hermes снимать активное окно приложения при использовании этого сочетания. Разрешите Hermes доступ в Системных настройках → Конфиденциальность и безопасность → Запись экрана, затем вернитесь сюда и повторите попытку. Перезапустите Hermes, если macOS попросит.',
      openSettings: 'Открыть Системные настройки',
      retry: 'Повторить',
      unavailable: 'Сочетание для снимка окна недоступно. Повторите попытку или выключите его.',
      errorTitle: 'Ошибка сочетания для снимка окна',
      loadFailed: 'Не удалось прочитать состояние сочетания. Повторите попытку, чтобы проверить текущую настройку.',
      saveFailed: 'Не удалось подтвердить изменение сочетания. Повторите попытку, чтобы проверить текущую настройку.',
      permissionFailed:
        'Не удалось открыть Системные настройки. Откройте раздел «Конфиденциальность и безопасность» вручную и повторите попытку.',
      captureFailed: 'Не удалось снять активное окно. Ничего не прикреплено и не отправлено.',
      contextChanged: 'Текущий черновик изменился во время съёмки. Снимок не прикреплён и не отправлен.'
    },
    envKeys: {},
    memoryLayers: ruMemoryLayers
  },
  skillDeepLink: ruSkillDeepLink,
  skills: {
    tabSkills: 'Навыки',
    tabToolsets: 'Инструменты',
    configuringProfile: 'Настройка профиля:',
    all: 'Все',
    searchSkills: 'Поиск навыков...',
    searchToolsets: 'Поиск инструментов...',
    refresh: 'Обновить навыки',
    refreshing: 'Обновление навыков',
    loading: 'Загрузка возможностей...',
    noSkillsTitle: 'Навыки не найдены',
    noSkillsDesc: 'Попробуйте более широкий поиск или другую категорию.',
    noToolsetsTitle: 'Наборы инструментов не найдены',
    noToolsetsDesc: 'Попробуйте более широкий запрос.',
    noDescription: 'Без описания.',
    configured: 'Настроено',
    needsKeys: 'Нужны ключи',
    visionModelHint:
      'Для зрения используются настройки вспомогательной модели: модель с поддержкой изображений выбирается там, а не здесь для каждого провайдера.',
    visionModelLink: 'Выбрать модель зрения в разделе Настройки → Модель',
    toolsetsEnabled: (enabled, total) => `Включено наборов инструментов: ${enabled}/${total}`,
    configureToolset: label => `Настроить ${label}`,
    toggleToolset: (label, enabled) => `${enabled ? 'Включить' : 'Отключить'} набор инструментов ${label}`,
    toolsCount: count => `${count} ${RU_NOUN(count, 'инструмент', 'инструмента', 'инструментов')}`,
    skillsLoadFailed: 'Не удалось загрузить навыки',
    toolsetsRefreshFailed: 'Не удалось обновить наборы инструментов',
    skillEnabled: 'Навык включён',
    skillDisabled: 'Навык отключён',
    toolsetEnabled: 'Набор инструментов включён',
    toolsetDisabled: 'Набор инструментов отключён',
    appliesToNewSessions: name => `${name}: изменения применятся к новым сеансам.`,
    failedToUpdate: name => `Не удалось обновить «${name}»`,
    sortMostUsed: 'По частоте использования',
    sortAlpha: 'А–Я',
    sortMostUsedDesc: '↓ Чаще всего используемые',
    sortLeastUsedAsc: '↑ Реже всего используемые',
    enableAll: 'Включить все',
    disableAll: 'Отключить все',
    disableUnused: 'Отключить неиспользуемые',
    bulkUpdated: count =>
      `${RU_PLURAL(count, 'Обновлён', 'Обновлено', 'Обновлено')} ${count} ${RU_PLURAL(count, 'элемент', 'элемента', 'элементов')} для новых сеансов.`,
    bulkNoChange: 'Менять нечего.',
    usageCount: count => `использован ${count}×`,
    provenance: {
      agent: 'Освоенный',
      bundled: 'Встроенный',
      hub: 'Хаб'
    },
    emptyNoneFound: noun => `Не найдено: ${noun}`,
    emptyNothingMatches: query => `По запросу «${query}» ничего не найдено.`,
    emptyNoneAvailable: noun => `Пока недоступно: ${noun}.`,
    emptyToolsNoun: 'инструменты',
    changesApplyNewSessions: 'Изменения применяются к новым сеансам.',
    skillUpdated: 'Навык обновлён',
    edit: 'Изменить',
    lock: 'Заблокировать',
    locked: 'Заблокирован',
    lockHint: 'Пока навык заблокирован, агент не может его менять. Вы по-прежнему можете редактировать его сами.',
    unlockedHint: 'Заблокируйте навык, чтобы агент не мог его менять. Вы по-прежнему можете редактировать его сами.',
    archive: 'В архив',
    archiveSkillTitle: name => `Архивировать навык «${name}»?`,
    archiveSkillDescription: 'Навык будет архивирован; его можно восстановить командой `hermes curator restore`.',
    skillArchivedTitle: 'Навык в архиве',
    skillArchivedMessage: 'Его можно восстановить командой hermes curator restore.',
    tabPlugins: 'Плагины',
    plugins: {
      ...ruPluginUpdateAll,
      agentTitle: 'Плагины агента',
      agentBlurb:
        'Расширьте возможности агента в выбранном профиле: инструменты, хуки, провайдеры. Изменения вступают в силу после перезапуска шлюза.',
      pageBlurb: 'Плагин может расширять это приложение, агента или и то и другое — у каждой части свой переключатель.',
      halfDesktop: 'Приложение',
      halfDesktopHint: 'это приложение, общее для всех профилей',
      halfAgent: 'Агент',
      halfAgentIn: (profile: string) => `Агент в профиле «${profile}»`,
      defaultProfile: 'Hermes (по умолчанию)',
      kindAgent: 'Агент',
      kindDesktop: 'Приложение',
      kindBoth: 'Агент + приложение',
      installAgentHere: 'Установить здесь',
      installAgentHereTip: (profile: string) =>
        `Часть плагина для приложения загружена, а часть для агента не установлена в профиле «${profile}». Установите её туда.`,
      installAgentHereNoOrigin:
        'Часть для агента не установлена в этом профиле, а пакет был скопирован вручную (нет ни записи в каталоге, ни удалённого Git-репозитория), поэтому установить её отсюда нельзя. Скопируйте папку пакета в профиль или переустановите его из Git.',
      desktopHalfPending: 'копирование…',
      desktopHalfPendingTip:
        'Этот пакет содержит часть для приложения, которая ещё не скопирована. Нажмите «Пересканировать» или перезапустите приложение.',
      emptyAll: 'Плагинов пока нет.',
      empty: 'Для этого профиля не установлены плагины агента.',
      emptyHint: 'Просмотрите каталог ниже и установите проверенный плагин одним щелчком мыши.',
      loadFailed: 'Не удалось загрузить плагины агента',
      toggleFailed: (name: string) => `Не удалось переключить «${name}»`,
      toolsetOn: (name: string, profile: string) =>
        `Инструменты агента плагина «${name}» включены для профиля «${profile}»`,
      toolsetOff: (name: string, profile: string) =>
        `Инструменты агента плагина «${name}» отключены для профиля «${profile}»`,
      toolsetToggleFailed: (name: string) =>
        `Не удалось переключить инструменты агента плагина «${name}»; панель приложения осталась без изменений`,
      legacyBackend:
        'Этот бэкенд старше переключателей плагинов по ключу — обновите Hermes, чтобы управлять плагином здесь.',
      portableBadge: 'переносимый',
      serverStates: {
        connected: 'подключён',
        app_not_running: 'приложение не запущено',
        hermes_not_connected: 'нет подключения MCP',
        endpoint_unavailable: 'эндпоинт недоступен',
        no_interactive_session: 'нет интерактивного сеанса',
        version_too_old: 'слишком старая версия',
        missing_app: 'приложение не найдено',
        unsupported_gpu: 'GPU не поддерживается',
        unknown: 'состояние неизвестно'
      },
      bundledNames: {},
      bundledDescriptions: {},
      sourceLabels: {
        bundled: 'встроенный',
        user: 'пользовательский',
        git: 'Git',
        project: 'из проекта',
        entrypoint: 'точка входа'
      },
      alreadyInstalled: (name: string) => `Плагин «${name}» уже установлен в этом профиле.`,
      catalogProvenance: (sha: string) => `Установлен из каталога Hermes${sha ? ` (коммит ${sha})` : ''}.`,
      pinnedProvenance: (sha: string) =>
        `Закреплён на коммите ${sha}. Обновления не принимаются, пока плагин не будет переустановлен с новым закреплённым коммитом.`,
      pinnedBadge: (sha: string) => `закреплён @ ${sha}`,
      updateToPin: (sha: string) => `Обновить до ${sha}`,
      updateFailed: (name: string) => `Не удалось обновить «${name}»`,
      updated: (name: string) =>
        `Плагин «${name}» обновлён до текущего коммита из каталога. Перезапустите шлюз, чтобы применить обновление.`,
      desktopHalfRemote: 'недоступно (удалённый бэкенд)',
      desktopHalfRemoteTip:
        'Часть этого пакета для приложения находится на диске удалённого бэкенда, а это приложение не может его прочитать. Чтобы использовать её здесь, нажмите «Установить из Git», укажите URL репозитория пакета и отметьте «Интерфейс приложения» — часть для приложения будет склонирована на этот компьютер.',
      updateConsentTitle: (name: string) => `Плагин «${name}» запрашивает больше возможностей`,
      updateConsentBody: (name: string, sha: string) =>
        `Новый коммит плагина «${name}» в каталоге (${sha}) добавляет возможности, которых нет в установленной версии. Применяйте его, только если доверяете им:`,
      updateConsentConfirm: 'Применить обновление',
      updateScanTitle: (name: string) => `Проверка безопасности нашла замечания в «${name}»`,
      updateScanBody: (name: string, count: number) =>
        `Обновление «${name}» получило вердикт «осторожно» (${count} ${RU_PLURAL(count, 'замечание', 'замечания', 'замечаний')}). Каждое обновление проверяется. Применяйте его, только если доверяете источнику:`,
      updateScanMore: (count: number) => `+ ещё ${count}`,
      updateScanConfirm: 'Всё равно обновить',
      updateScanBlocked: (name: string) =>
        `Проверка безопасности заблокировала обновление «${name}» (вердикт «опасно»). Это ограничение нельзя обойти.`,
      updatedGit: (name: string) => `Плагин «${name}» обновлён до последнего коммита.`,
      uninstall: 'Удалить',
      uninstallTip: (name: string, profile: string) => `Удалить «${name}» из профиля «${profile}»`,
      uninstallConfirmTitle: (name: string) => `Удалить «${name}»?`,
      uninstallConfirmBody: (name: string, profile: string) =>
        `Файлы плагина будут удалены из профиля «${profile}». Часть для приложения, если она есть в пакете, тоже будет удалена. Переустановить плагин можно в любой момент из каталога или из Git.`,
      uninstallFailed: (name: string) => `Не удалось удалить «${name}»`,
      uninstalled: (name: string) => `Плагин «${name}» удалён. Перезапустите шлюз, чтобы выгрузить его.`,
      uninstallDesktopTip: (name: string) => `Удалить «${name}» из этого приложения`,
      uninstallDesktopConfirmBody: (name: string) =>
        `Плагин «${name}» будет удалён из папки desktop-plugins на этом компьютере и сразу выгружен. Переустановить его можно в любой момент из Git или вернув папку на место.`,
      uninstalledDesktop: (name: string) => `Плагин «${name}» удалён.`,
      deepLinkErrorTitle: 'Ссылка для установки плагина отклонена',
      deepLinkCatalogInvalidName: 'В ссылке нет имени из каталога, или оно недопустимо.',
      deepLinkCatalogUnknown: (name: string) => `«${name}» нет в каталоге плагинов Hermes. Ничего не установлено.`,
      deepLinkCatalogUnavailable:
        'Не удалось загрузить каталог плагинов Hermes. Проверьте подключение и откройте ссылку ещё раз.',
      settingsToggle: (name: string) => `Настройки: ${name}`,
      settingsForm: {
        save: 'Сохранить настройки',
        saved: (name: string) => `Настройки «${name}» сохранены.`,
        saveFailed: (name: string) => `Не удалось сохранить настройки «${name}»`,
        required: 'Обязательно',
        optional: '(необязательно)',
        secretSet: '•••••••• (задано)',
        secretStoredAs: (env: string) =>
          `Хранится в файле .env профиля под именем ${env}, а не в config.yaml; оставьте пустым, чтобы сохранить текущее значение.`
      },
      previewScriptRevokeUnsaved: (plugin: string, origin: string) =>
        `Не удалось сохранить изменение, поэтому оно действует только до перезапуска Hermes. Пока ${plugin} заблокирован на ${origin}.`,
      previewScriptRevoked: (plugin: string, origin: string) =>
        `${plugin} больше не может запускать скрипты на ${origin}.`,
      previewScriptRevoke: (origin: string) => `Отозвать доступ к ${origin}`,
      previewScriptAccessNone: 'Спрашивает перед запуском скриптов на странице',
      previewScriptAccessLabel: 'Скрипты страниц',
      previewScriptDeny: 'Не разрешать',
      previewScriptAllow: 'Разрешить на этом сайте',
      previewScriptPromptRevokeHint:
        'Действует только для этого сайта. Отозвать можно в разделе Возможности ▸ Плагины.',
      previewScriptPromptRisk:
        'Скрипты могут читать и изменять всё на этом сайте, включая страницы аккаунтов, в которые вы там вошли.',
      previewScriptPromptBody: (plugin: string, origin: string) =>
        `${plugin} хочет выполнить JavaScript во встроенном браузере на ${origin}.`,
      previewScriptPromptTitle: (plugin: string) => `Разрешить ${plugin} запускать скрипты на этой странице?`,
      folderAccess: {
        title: 'Доступ к папкам',
        hint: (name: string) =>
          `Плагин «${name}» может читать и изменять файлы в этих папках. Отзыв доступа действует сразу.`,
        revoke: 'Отозвать',
        revokeLabel: (path: string) => `Отозвать доступ к ${path}`,
        revoked: (name: string, path: string) => `Плагин «${name}» больше не может использовать ${path}.`,
        revokeFailed: (name: string) => `Не удалось отозвать доступ к папкам у плагина «${name}»`,
        pickerTitle: (name: string) => `Выберите папку для плагина «${name}»`,
        pickerButton: 'Разрешить доступ',
        refusedProtected: (name: string) =>
          `Плагин «${name}» не может использовать эту папку: в ней хранятся настройки, ключи или данные плагинов Hermes. Выберите папку, в которой их нет.`,
        loadFailed: (name: string) => `Не удалось загрузить папки, к которым открыт доступ плагину «${name}».`
      }
    },
    officialCatalog: 'Доступно для установки',
    officialPill: 'Официальный',
    hub: {
      searchPlaceholder: 'Поиск в хабе навыков',
      search: 'Поиск',
      searching: 'Поиск...',
      connectingHubs: 'Подключение к хабам навыков...',
      connectedHubs: 'Подключённые хабы:',
      featured: 'Рекомендуемые навыки',
      landingHint:
        'Ищите в хабе, чтобы просматривать устанавливаемые навыки из официального индекса, GitHub и источников сообщества.',
      noResults: 'Подходящих навыков в хабе не найдено.',
      resultCount: (count, ms) =>
        `${count} ${RU_PLURAL(count, 'результат', 'результата', 'результатов')}${ms !== null ? ` за ${ms} мс` : ''}`,
      timedOut: sources => `Тайм-аут: ${sources}`,
      installed: 'Установлен',
      install: 'Установить',
      installing: 'Установка...',
      uninstall: 'Удалить',
      uninstalling: 'Удаление...',
      updateAll: 'Обновить установленные',
      updating: 'Обновление...',
      preview: 'Предпросмотр',
      scan: 'Сканировать',
      scanning: 'Сканирование...',
      close: 'Закрыть',
      files: 'Файлы',
      noReadme: 'Для этого навыка нет предпросмотра SKILL.md.',
      trust: {
        builtin: 'встроенный',
        trusted: 'доверенный',
        community: 'сообщество'
      },
      verdictSafe: 'Безопасен',
      verdictCaution: 'Осторожно',
      verdictDangerous: 'Опасен',
      policyAllow: 'Установка разрешена',
      policyAsk: 'Проверьте перед установкой',
      policyBlock: 'Установка заблокирована политикой',
      findings: count => `${count} ${RU_PLURAL(count, 'замечание', 'замечания', 'замечаний')}`,
      noFindings: 'Замечаний по безопасности нет.',
      installStarted: name => `Установка «${name}»...`,
      uninstallStarted: name => `Удаление «${name}»...`,
      updateStarted: 'Обновление установленных навыков...',
      actionFailed: 'Не удалось выполнить действие с навыком',
      actionLog: 'Журнал действий',
      alreadyInstalled: name => `«${name}» уже установлен`,
      pickerTitle: 'Хаб навыков',
      pickerBrowse: 'Открыть весь хаб',
      pickerHide: 'Скрыть браузер хаба',
      pickerHint: 'Нажмите «+ Add to this Agent» у любого навыка — он установится и появится в списке выше.',
      loadFailed: 'Не удалось загрузить хаб навыков',
      previewFailed: 'Не удалось получить предпросмотр навыка',
      scanFailed: 'Не удалось выполнить проверку безопасности',
      searchFailed: 'Не удалось выполнить поиск в хабе',
      installBlockedTitle: name => `Не удалось установить «${name}»`,
      installBlockedMessage: (findings, unverified) =>
        `Проверка безопасности отметила ${findings > 0 ? `${findings} ${RU_PLURAL(findings, 'пункт, требующий', 'пункта, требующих', 'пунктов, требующих')} внимания` : 'рискованные шаблоны, требующие внимания'}${unverified ? ', а сам навык получен из непроверенного источника' : ''}. Изучите результаты проверки, прежде чем решать, доверять ли автору.`,
      viewScan: 'Показать результаты проверки',
      openLog: 'Открыть журнал'
    },
    toolsetDescriptions: {
      a2a: 'Поддержка протокола A2A (Agent-to-Agent) v1.0 для Hermes Agent — двусторонний обмен между агентами по открытому стандарту Linux Foundation. Исходящие инструменты находят других агентов, получают их Agent Card и отправляют задачи по JSON-RPC. Входящий адаптер публикует Hermes по адресу /.well-known/agent-card.json и направляет задачи в его активный сеанс шлюза с полной памятью и контекстом. Если bearer-токен не настроен, Hermes принимает подключения только с localhost; входящий текст фильтруется, исходящие учётные данные вычищаются, а весь обмен записывается в журнал аудита вне сжатия контекста. Использует только стандартную библиотеку Python; зависимость a2a-sdk не нужна.',
      stt: 'расшифровка речи (голосовые сообщения через шлюз + голосовой режим)'
    },
    toolsetLabels: {
      stt: 'Распознавание речи'
    }
  },
  starmap: {
    title: 'Граф памяти',
    subtitle: (nodes, clusters) =>
      `${nodes} ${RU_PLURAL(nodes, 'навык', 'навыка', 'навыков')} в ${clusters} ${RU_PLURAL(clusters, 'категории', 'категориях', 'категориях')}`,
    close: 'Закрыть граф памяти',
    refresh: 'Обновить',
    memory: 'Память',
    skill: 'навык',
    pauseTimeline: 'Приостановить временную шкалу',
    playTimeline: 'Воспроизвести временную шкалу',
    timelineScrubber: 'Ползунок временной шкалы',
    ageLegend: 'центр = самые старые · края = новее',
    editNode: kind => (kind === 'memory' ? 'Изменить запись памяти…' : 'Изменить навык…'),
    archiveSkill: 'Архивировать навык',
    deleteMemory: 'Удалить запись памяти',
    editTitle: label => `Изменить «${label}»`,
    deleteTitle: label => `Удалить «${label}»?`,
    deleteMemoryDescription: 'Эта запись памяти будет удалена навсегда.',
    filterAll: 'Все',
    filterUsed: 'Использованные',
    filterLearned: 'Освоенные',
    viewGraph: 'Граф',
    loadFailed: 'Не удалось загрузить граф памяти',
    loading: 'Загрузка…',
    emptyTitle: 'Пока ничего не изучено',
    emptyDesc: 'По мере того как Hermes создаёт навыки и записи памяти о вашей работе, они появляются здесь.',
    share: 'Поделиться картой',
    shareHint:
      'Скопируйте код, чтобы поделиться этой картой, или вставьте код, чтобы загрузить карту. Код содержит только раскладку — без вашей памяти и текстов навыков.',
    shareTitle: 'Импорт / экспорт карты',
    sharePlaceholder: 'Вставьте код карты…',
    copy: 'Скопировать код карты',
    copied: 'Скопировано!',
    importMap: 'Импортировать карту',
    importBtn: 'Загрузить',
    importEmpty: 'Вставьте код карты для загрузки.',
    importSuccess: nodes => `Загружена карта с ${nodes} ${RU_PLURAL(nodes, 'узлом', 'узлами', 'узлами')}.`,
    importedBadge: 'импортированная карта',
    resetToMine: 'Вернуться к моей карте'
  },
  agents: {
    extendedTranscript: 'Подробная история',
    transcriptTruncated: 'Показаны последние 16 КиБ',
    transcriptUnavailable: 'История в реальном времени недоступна',
    close: 'Закрыть панель агентов',
    title: 'Дерево субагентов',
    subtitle: 'Активные субагенты текущего хода в реальном времени.',
    emptyTitle: 'Нет активных субагентов',
    emptyDesc: 'Когда ход делегирует работу, здесь в реальном времени отображается прогресс дочерних агентов.',
    running: 'Выполняется',
    failed: 'Ошибка',
    done: 'Готово',
    streaming: 'Потоковая передача',
    files: 'Файлы',
    moreFiles: count => `ещё ${count} ${RU_PLURAL(count, 'файл', 'файла', 'файлов')}`,
    moreAgents: count => `ещё ${count} ${RU_PLURAL(count, 'агент', 'агента', 'агентов')}`,
    queued: 'В очереди',
    waitingActivity: 'Ожидание активности',
    steer: 'Уточнить',
    steerPlaceholder: 'Инструкции для этого субагента',
    steerQueued: 'В очереди до следующей контрольной точки',
    stopRequested: 'Запрошена остановка',
    requestRejected: 'Субагент не принял запрос',
    delegation: index => `Делегирование ${index}`,
    workers: count => `${count} ${RU_PLURAL(count, 'исполнитель', 'исполнителя', 'исполнителей')}`,
    workersActive: count => `${count} ${RU_PLURAL(count, 'активный', 'активных', 'активных')}`,
    agentsCount: count => `${count} ${RU_PLURAL(count, 'агент', 'агента', 'агентов')}`,
    activeCount: count => `${count} ${RU_PLURAL(count, 'активный', 'активных', 'активных')}`,
    failedCount: count => `${count} ${RU_NOUN(count, 'с ошибкой', 'с ошибками', 'с ошибками')}`,
    toolsCount: count => `${count} ${RU_NOUN(count, 'инструмент', 'инструмента', 'инструментов')}`,
    filesCount: count => `${count} ${RU_NOUN(count, 'файл', 'файла', 'файлов')}`,
    updatedAgo: age => `обновлено ${age}`,
    ageNow: 'только что',
    ageSeconds: seconds => `${seconds} с назад`,
    ageMinutes: minutes => `${minutes} мин назад`,
    ageHours: hours => `${hours} ч назад`,
    ageDays: days => `${days} дн. назад`,
    durationSeconds: seconds => `${seconds} с`,
    durationMinutes: (minutes, seconds) => `${minutes} мин ${seconds} с`,
    tokens: value => `${value} ${RU_PLURAL(value, 'токен', 'токена', 'токенов')}`
  },
  commandCenter: {
    close: 'Закрыть командный центр',
    paletteTitle: 'Палитра команд',
    back: 'Назад',
    searchPlaceholder: 'Поиск сеансов, представлений и действий',
    goTo: 'Перейти',
    goToSession: 'Перейти к сеансу',
    branches: 'Ветви',
    projects: 'Проекты',
    openFolder: 'Открыть папку как проект…',
    openFolderAt: path => `Открыть папку как проект — ${path}`,
    newSessionInProject: project => `Новый сеанс в ${project}`,
    commands: 'Команды',
    startInBranch: branch => `Новый диалог в ${branch}`,
    commandCenter: 'Командный центр',
    appearance: 'Внешний вид',
    settings: 'Настройки',
    changeTheme: 'Сменить тему',
    changeColorMode: 'Сменить цветовой режим…',
    pets: {
      title: 'Питомцы',
      placeholder: 'Поиск питомцев…',
      loading: 'Загрузка галереи petdex…',
      error: 'Не удалось подключиться к галерее petdex.',
      staleBackend: 'Перезапустите Hermes, чтобы использовать питомцев — бэкенд старше этой функции.',
      empty: 'Совпадающих питомцев нет.',
      turnOff: 'Отключить',
      turnOn: 'Включить',
      installed: 'Установлен',
      generatedTag: 'Сгенерирован',
      adoptFailed: 'Не удалось забрать этого питомца.',
      toggleFailed: enabled => `Не удалось ${enabled ? 'включить' : 'отключить'} питомца.`,
      noneAvailable: 'Питомцев пока нет — выберите ниже для установки.'
    },
    generatePet: {
      title: 'Сгенерировать питомца',
      placeholder: 'Опишите питомца для генерации…',
      promptHint: 'Введите описание и нажмите Enter, чтобы получить четыре варианта облика.',
      readyHint: 'Нажмите Enter, чтобы получить четыре варианта облика по вашему описанию.',
      generate: 'Сгенерировать',
      generating: 'Генерация…',
      retry: 'Повторить',
      hatch: 'Вылупить',
      spawning: 'Создаём…',
      hatching: 'Вылупливаем вашего питомца…',
      hatchingSub: 'Оживляем его…',
      hatched: 'Он вылупился!',
      hatchRow: (_state, done, total) => `Рисуем кадр ${done} из ${total}…`,
      hatchComposing: 'Собираем по частям…',
      hatchSaving: 'Почти готово…',
      namePlaceholder: 'Имя для вашего питомца',
      staleBackend: 'Обновите Hermes, чтобы генерировать питомцев.',
      backgroundHint: 'Можно закрыть — Hermes уведомит, когда будет готово.',
      slowProviderHint: 'Это может занять несколько минут',
      remix: 'Ремикс',
      remixConfirmTitle: 'Сделать ремикс из этого облика?',
      remixConfirmBody:
        'Будет сгенерирован новый набор вариантов с этим как отправной точкой. Это может занять несколько минут.',
      genericError: 'Генерация не удалась — попробуйте снова или выберите подсказку.',
      referenceImageTooLarge: 'Изображение-референс слишком большое. Используйте меньше 16 МБ.',
      referenceImageInvalid: 'Не удалось прочитать это изображение-референс. Попробуйте PNG, JPG, WebP или GIF.',
      adopt: 'Забрать',
      startOver: 'Начать заново',
      hatchingProgress: 'Достижение прогресса',
      referenceFallback: 'Ссылка',
      removeReference: 'Удалить ссылку',
      unavailableTitle: 'Добавить бэкэнд изображения для создания',
      unavailableDesc:
        'Для поиска пользовательского питомца нужен поставщик, который может использовать эталонное изображение.',
      setupImageGeneration: 'Настройка генерации изображений',
      getKeyFrom: 'Получить ключ от',
      addReference: 'Добавить ссылку'
    },
    installTheme: {
      title: 'Установить тему…',
      pageTitle: 'Установка темы',
      placeholder: 'Поиск в VS Code Marketplace...',
      loading: 'Поиск в Marketplace...',
      error: 'Не удалось подключиться к Marketplace.',
      installError: 'Не удалось установить эту тему.',
      invalidColorTheme: 'В теме нет карты «colors», поэтому это не цветовая тема VS Code.',
      empty: 'Совпадающих тем нет.',
      install: 'Установить',
      installing: 'Установка...',
      installed: 'Установлена',
      installs: count => `${count} ${RU_NOUN(count, 'установка', 'установки', 'установок')}`
    },
    settingsFields: 'Поля настроек',
    mcpServers: 'MCP-серверы',
    archivedChats: 'Архивные чаты',
    sections: { maintenance: 'Обслуживание', sessions: 'Сеансы', system: 'Система', usage: 'Использование' },
    nav: {
      newChat: {
        title: 'Новый сеанс',
        detail: 'Начать новый сеанс'
      },
      settings: {
        title: 'Настройки',
        detail: 'Настройка Hermes desktop'
      },
      messaging: {
        title: 'Сообщения',
        detail: 'Настройка Telegram, Slack, Discord и других'
      },
      artifacts: {
        title: 'Артефакты',
        detail: 'Просмотр сгенерированных результатов'
      },
      capabilities: {
        title: 'Возможности',
        detail: 'Навыки, инструменты и MCP-серверы'
      }
    },
    sectionEntries: {
      sessions: {
        title: 'Панель сеансов',
        detail: 'Поиск, закрепление и управление сеансами'
      },
      system: {
        title: 'Системная панель',
        detail: 'Статус шлюза, журналы, перезапуск/обновление'
      },
      usage: {
        title: 'Панель использования',
        detail: 'Токены, стоимость и активность навыков'
      }
    },
    providerNavigate: 'Перейти',
    providerSessions: 'Сеансы',
    refresh: 'Обновить',
    refreshing: 'Обновление...',
    noResults: 'Совпадающие результаты не найдены.',
    pinSession: 'Закрепить сеанс',
    unpinSession: 'Открепить сеанс',
    exportSession: 'Экспортировать сеанс',
    deleteSession: 'Удалить сеанс',
    noSessions: 'Сеансов пока нет.',
    gatewayRunning: 'Шлюз сообщений работает',
    gatewayStopped: 'Шлюз сообщений остановлен',
    hermesActiveSessions: (version, count) => `Hermes ${version} · Активные сеансы: ${count}`,
    restartGateway: 'Перезапустить шлюз',
    openBrowser: 'Переключить браузер',
    toggleBrowser: 'Переключить браузер',
    gatewayRestartFailed: 'Не удалось перезапустить шлюз.',
    updateHermes: 'Обновить Hermes',
    reloadWindow: 'Перезагрузить окно',
    actionRunning: 'выполняется',
    actionDone: 'готово',
    actionFailed: 'ошибка',
    actionStartedWaiting: 'Действие запущено, ожидание статуса...',
    loadingStatus: 'Загрузка статуса...',
    recentLogs: 'Последние записи журнала',
    noLogs: 'Журналы ещё не загружены.',
    days: count => `${count} дн.`,
    statSessions: 'Сеансы',
    statApiCalls: 'Вызовы API',
    statTokens: 'Токены вход/выход',
    statCost: 'Оценка стоимости',
    actualCost: cost => `фактически ${cost}`,
    loadingUsage: 'Загрузка использования...',
    noUsage: period => `Нет использования за последние ${period} ${RU_NOUN(period, 'день', 'дня', 'дней')}.`,
    retry: 'Повторить',
    dailyTokens: 'Токены за день',
    input: 'вход',
    output: 'выход',
    noDailyActivity: 'Ежедневной активности нет.',
    topModels: 'Топ моделей',
    noModelUsage: 'Использование моделей пока отсутствует.',
    topSkills: 'Топ навыков',
    noSkillActivity: 'Активности навыков пока нет.',
    actions: count => `${count} ${RU_NOUN(count, 'действие', 'действия', 'действий')}`,
    logFile: 'Файл журнала',
    logLevel: 'Уровень',
    logSearchPlaceholder: 'Поиск по строкам журнала...',
    maintenance: {
      runOps: 'Диагностика',
      doctor: 'Запустить doctor',
      doctorDesc: 'Проверка работоспособности установки, конфигурации и провайдеров',
      securityAudit: 'Аудит безопасности',
      securityAuditDesc: 'Сканирование конфигурации и навыков на предмет рискованных настроек',
      backup: 'Создать резервную копию',
      backupDesc: 'Сжатие конфигурации, памяти, навыков и сеансов в zip',
      debugShare: 'Поделиться отладкой',
      debugShareDesc: 'Загрузка анонимизированного отчёта + журналов, получение ссылок (автоудаление через 6 ч)',
      debugShareRunning: 'Загрузка отладочного отчёта...',
      debugShareLinks: 'Ссылки для отправки',
      debugShareFailed: 'Не удалось поделиться отладкой',
      copyLink: 'Скопировать ссылку',
      linkCopied: 'Ссылка скопирована',
      curator: 'Куратор навыков',
      curatorDesc: 'Фоновый обзор, архивирующий устаревшие навыки, созданные агентом',
      curatorPaused: 'Приостановлен',
      curatorActive: 'Активен',
      curatorDisabled: 'Отключён',
      curatorLastRun: when => `Последний запуск ${when}`,
      curatorNeverRan: 'Никогда не запускался',
      pause: 'Приостановить',
      resume: 'Продолжить',
      runNow: 'Запустить сейчас',
      memoryData: 'Данные памяти',
      memoryDataDesc: 'Встроенные файлы памяти, внедряемые в каждый сеанс',
      memoryProvider: name => `Активный провайдер: ${name}`,
      builtinMemory: 'встроенный',
      memoryFile: 'Память агента (MEMORY.md)',
      userFile: 'Профиль пользователя (USER.md)',
      bytes: size => size,
      empty: 'пусто',
      resetMemory: 'Сбросить память',
      resetUser: 'Сбросить профиль',
      resetAll: 'Сбросить оба',
      resetConfirm: target => `Удалить ${target}? Это действие необратимо.`,
      resetDone: files => `Удалено: ${files}.`,
      resetFailed: 'Не удалось сбросить память',
      actionStarted: name => `${name} запущен — следим за журналом...`,
      actionFailed: name => `Не удалось запустить ${name}`,
      running: 'Выполняется...',
      viewLog: 'Журнал действия'
    },
    sharedGatewayRestartTitle: 'Перезапустить общий шлюз?',
    sharedGatewayRestartDescription: bots => `Все боты на этом устройстве переподключатся: ${bots}`,
    sharedGatewayRestartConfirm: 'Перезапустить все',
    sharedGatewayRestarted: count => `Общий шлюз перезапущен (ботов: ${count})`
  },
  messaging: {
    search: 'Поиск в сообщениях...',
    statusFilter: {
      all: 'Все',
      bad: 'Ошибки',
      good: 'Подключено',
      muted: 'Неактивно',
      warn: 'Требует внимания'
    },
    loading: 'Загрузка платформ сообщений...',
    loadFailed: 'Не удалось загрузить платформы сообщений',
    states: {
      connected: 'Подключено',
      connecting: 'Подключение',
      disabled: 'Отключено',
      fatal: 'Ошибка',
      gateway_stopped: 'Шлюз сообщений остановлен',
      not_configured: 'Нужна настройка',
      pending_restart: 'Нужен перезапуск',
      retrying: 'Повторная попытка',
      startup_failed: 'Не удалось запустить'
    },
    unknown: 'Неизвестно',
    hintPendingRestart: 'Перезапустите шлюз из строки состояния, чтобы применить это изменение.',
    hintGatewayStopped: 'Запустите шлюз из строки состояния для подключения.',
    credentialsSet: 'Учётные данные заданы',
    needsSetup: 'Нужна настройка',
    gatewayStopped: 'Шлюз сообщений остановлен',
    getCredentials: 'Получить учётные данные',
    openSetupGuide: 'Открыть руководство по настройке',
    required: 'Обязательно',
    recommended: 'Рекомендуется',
    advanced: count => `Расширенные (${count})`,
    noTokenNeeded: 'Этой платформе здесь не нужен токен. Используйте руководство выше, затем включите её ниже.',
    enabled: 'Включено',
    disabled: 'Отключено',
    unsavedChanges: 'Несохранённые изменения',
    saving: 'Сохранение...',
    saveChanges: 'Сохранить изменения',
    saved: 'Сохранено',
    replaceValue: 'Заменить текущее значение',
    openDocs: 'Открыть документацию',
    clearField: key => `Очистить ${key}`,
    addListEntry: 'Добавить ещё',
    removeListEntry: 'Удалить',
    listEntryPlaceholder: 'Введите ID',
    enableAria: name => `Включить ${name}`,
    disableAria: name => `Отключить ${name}`,
    platformEnabled: name => `${name} включено`,
    platformDisabled: name => `${name} отключено`,
    restartToApply: 'Это изменение вступит в силу после перезапуска шлюза.',
    setupSaved: name => `Настройка ${name} сохранена`,
    restartToReconnect: 'Новые учётные данные вступят в силу после перезапуска шлюза.',
    appliedLive: 'Применено к работающему шлюзу.',
    connectingLive: 'Работающий шлюз подключается с новыми учётными данными.',
    keyCleared: key => `${key} очищено`,
    setupUpdated: name => `Настройка ${name} обновлена.`,
    failedUpdate: name => `Не удалось обновить ${name}`,
    failedSave: name => `Не удалось сохранить ${name}`,
    failedClear: key => `Не удалось очистить ${key}`,
    pendingRequests: count => `Ожидающие запросы (${count})`,
    pendingAria: count =>
      `${count} ${RU_NOUN(count, 'ожидающий запрос на сопряжение', 'ожидающих запроса на сопряжение', 'ожидающих запросов на сопряжение')}`,
    approvedUsers: count => `Одобрённые пользователи (${count})`,
    approve: 'Одобрить',
    approving: 'Одобрение...',
    revoke: 'Отозвать',
    revoking: 'Отзыв...',
    revokeAria: name => `Отозвать ${name}`,
    revokeTitle: 'Отозвать доступ',
    revokeDesc: name => `${name} потеряет доступ и перестанет распознаваться начиная со следующего сообщения.`,
    approvedUser: name => `${name} одобрен`,
    approvedHint: 'Они распознаются автоматически начиная с их следующего сообщения.',
    revokedUser: name => `${name} отозван`,
    failedApprove: name => `Не удалось одобрить ${name}`,
    failedRevoke: name => `Не удалось отозвать ${name}`,
    pairingLockedOut: 'Слишком много неудачных одобрений — эта платформа заблокирована. Попробуйте позже.',
    waitingSince: minutes => (minutes < 1 ? 'только что' : `${minutes} мин назад`),
    restartNeeded: 'Сохранено. Перезапустите шлюз сообщений, чтобы применить новые настройки.',
    restartNow: 'Перезапустить',
    restarting: 'Перезапуск…',
    restartFailedManual: 'Не удалось перезапустить шлюз — перезапустите его вручную и проверьте журналы.',
    relayLink: {
      title: 'Team Gateway',
      badge: 'Токен бота не нужен',
      intro: (platform: string) =>
        `${platform} связывается с этим агентом через общий бот Hermes. Привяжите свой аккаунт ${platform} и напишите боту, чтобы говорить с агентом.`,
      link: (platform: string) => `Привязать ${platform}`,
      linkAnother: (platform: string) => `Привязать ещё один аккаунт ${platform}`,
      linkedAccounts: 'Привязанные аккаунты',
      unlink: 'Отвязать',
      unlinkFailed: 'Не удалось отвязать аккаунт',
      stepOpen: (platform: string) => `1. Отсканируйте код телефоном или откройте бота в ${platform}.`,
      stepSend: '2. Отправьте боту это сообщение с аккаунта, который хотите привязать:',
      open: (platform: string) => `Открыть ${platform}`,
      copy: 'Скопировать сообщение',
      copied: 'Скопировано',
      copyFailed: (command: string) => `Не удалось скопировать. Введите ${command} вручную.`,
      waiting: 'Ждём, пока бот получит сообщение. Код действует один раз.',
      linked: (platform: string) => `Аккаунт ${platform} привязан. Напишите боту, чтобы говорить с агентом.`,
      expired: 'Срок действия кода истёк до использования. Получите новый код и попробуйте снова.',
      refused: (platform: string) => `${platform} отклонил привязку. Получите новый код и попробуйте снова.`,
      qrAlt: (platform: string) => `QR-код общего бота ${platform}`,
      managed: 'Под управлением Team Gateway',
      managedNote: (platform: string) =>
        `На этом экземпляре сообщения идут через Team Gateway, поэтому шлюз отключает прямое подключение ${platform} при каждом запуске. Чтобы использовать его вместе с ретранслятором, задайте GATEWAY_RELAY_ALLOW_DIRECT_PLATFORMS=true в окружении шлюза (прямое подключение не даёт экземпляру масштабироваться до нуля и может доставлять сообщения дважды).`,
      managedIntro: 'Аккаунты этого агента привязываются в Nous Portal.',
      openPortal: 'Привязать аккаунты в Nous Portal',
      noNewAccount: (platform: string) =>
        `Код больше не активен, и новый аккаунт не появился. Если вашего аккаунта ${platform} нет в списке, получите новый код и попробуйте снова.`
    },
    telegramQr: {
      title: 'Выберите способ подключения Telegram-бота',
      subtitle:
        'Оба способа подключают бота под вашим контролем и сохраняют его данные только в этой установке Hermes.',
      quickSetup: 'Быстрая настройка',
      recommended: 'Рекомендуется',
      qrCodeAlt: 'QR-код для настройки Telegram',
      quickHelp:
        'Отсканируйте QR-код и подтвердите в Telegram. Hermes создаст бота и определит ваш Telegram ID автоматически.',
      createWithQr: 'Создать по QR',
      starting: 'Запуск…',
      replaceWarning:
        'Данные Telegram уже настроены. Новая QR-настройка или токен заменят текущего бота при сохранении.',
      scanHint: 'Отсканируйте в приложении Telegram на телефоне или откройте ссылку на этом компьютере.',
      waiting: 'Ожидание Telegram…',
      expiresIn: remaining => `Истекает через ${remaining}`,
      expired: 'Истёк',
      openTelegram: 'Открыть Telegram',
      ready: 'Бот создан',
      allowedUsers: 'Разрешённые пользователи',
      ownerDetected: 'Владелец определён',
      addAtLeastOne: 'Добавьте хотя бы один Telegram ID.',
      userIdPlaceholder: 'Telegram ID пользователя',
      add: 'Добавить',
      numericOnly: 'Telegram ID должны быть числовыми.',
      saveAndRestart: 'Сохранить и перезапустить',
      applying: 'Сохранение…',
      pairingExpired: 'Срок QR-настройки истёк. Начните новую.',
      stillWaiting: detail => `Всё ещё ждём Telegram. Повтор после: ${detail}`,
      savedRestarting: 'Telegram сохранён; шлюз перезапускается…',
      savedRestartFailed: detail => `Telegram сохранён; перезапуск шлюза не удался${detail}`
    },
    fieldCopy: {
      TELEGRAM_BOT_TOKEN: {
        label: 'Токен бота',
        help: 'Создайте бота через @BotFather и вставьте выданный им токен.',
        placeholder: 'Вставьте токен бота Telegram'
      },
      TELEGRAM_ALLOWED_USERS: {
        label: 'Разрешённые ID пользователей Telegram',
        help: 'Рекомендуется. Числовые ID через @userinfobot (по одному в поле). Без этого писать вашему боту может кто угодно.'
      },
      TELEGRAM_PROXY: {
        label: 'URL прокси',
        help: 'Нужен только в сетях, где Telegram заблокирован.'
      },
      DISCORD_BOT_TOKEN: {
        label: 'Токен бота',
        help: 'Создайте приложение в Discord Developer Portal, добавьте бота и вставьте его токен.'
      },
      DISCORD_ALLOWED_USERS: {
        label: 'Разрешённые ID пользователей Discord',
        help: 'Рекомендуется. ID пользователей Discord (по одному в поле).'
      },
      DISCORD_REPLY_TO_MODE: {
        label: 'Стиль ответов',
        help: 'first, all или off.'
      },
      DISCORD_ALLOW_ALL_USERS: {
        label: 'Разрешить всех пользователей Discord',
        help: 'Только для разработки. Если true, писать боту в ЛС может кто угодно без allowlist.'
      },
      DISCORD_HOME_CHANNEL: {
        label: 'ID домашнего канала',
        help: 'Канал, куда бот шлёт проактивные сообщения (результаты cron, напоминания).'
      },
      DISCORD_HOME_CHANNEL_NAME: {
        label: 'Название домашнего канала',
        help: 'Отображаемое имя домашнего канала в журналах и выводе статуса.'
      },
      BLUEBUBBLES_ALLOW_ALL_USERS: {
        label: 'Разрешить всех пользователей iMessage',
        help: 'Если true, allowlist BlueBubbles пропускается.'
      },
      MATTERMOST_ALLOW_ALL_USERS: {
        label: 'Разрешить всех пользователей Mattermost'
      },
      MATTERMOST_HOME_CHANNEL: {
        label: 'Домашний канал'
      },
      QQ_ALLOW_ALL_USERS: {
        label: 'Разрешить всех пользователей QQ'
      },
      QQBOT_HOME_CHANNEL: {
        label: 'Домашний канал QQ',
        help: 'Канал или группа по умолчанию для доставки cron.'
      },
      QQBOT_HOME_CHANNEL_NAME: {
        label: 'Название домашнего канала QQ'
      },
      SLACK_BOT_TOKEN: {
        label: 'Токен бота Slack',
        help: 'Используйте токен бота из OAuth & Permissions после установки вашего приложения Slack.',
        placeholder: 'Вставьте токен бота Slack'
      },
      SLACK_APP_TOKEN: {
        label: 'Токен приложения Slack',
        help: 'Используйте токен уровня приложения, необходимый для Socket Mode.',
        placeholder: 'Вставьте токен приложения Slack'
      },
      SLACK_ALLOWED_USERS: {
        label: 'Разрешённые ID пользователей Slack',
        help: 'Рекомендуется. ID пользователей Slack (по одному в поле).'
      },
      MATTERMOST_URL: {
        label: 'URL сервера',
        placeholder: 'https://mattermost.example.com'
      },
      MATTERMOST_TOKEN: {
        label: 'Токен бота'
      },
      MATTERMOST_ALLOWED_USERS: {
        label: 'Разрешённые ID пользователей',
        help: 'Рекомендуется. ID пользователей Mattermost (по одному в поле).'
      },
      MATRIX_HOMESERVER: {
        label: 'URL homeserver',
        placeholder: 'https://matrix.org'
      },
      MATRIX_ACCESS_TOKEN: {
        label: 'Токен доступа'
      },
      MATRIX_USER_ID: {
        label: 'ID пользователя бота',
        placeholder: '@hermes:example.org'
      },
      MATRIX_ALLOWED_USERS: {
        label: 'Разрешённые ID пользователей Matrix',
        help: 'Рекомендуется. ID пользователей (по одному в поле) в формате @user:server.'
      },
      SIGNAL_HTTP_URL: {
        label: 'URL моста Signal',
        placeholder: 'http://127.0.0.1:8080',
        help: 'URL работающего REST-моста signal-cli.'
      },
      SIGNAL_ACCOUNT: {
        label: 'Номер телефона',
        help: 'Номер, зарегистрированный в вашем мосте signal-cli.'
      },
      SIGNAL_ALLOWED_USERS: {
        label: 'Разрешённые пользователи Signal',
        help: 'Рекомендуется. Идентификаторы Signal (по одному в поле).'
      },
      WHATSAPP_ENABLED: {
        label: 'Включить мост WhatsApp',
        help: 'Устанавливается автоматически переключателем ниже. Не меняйте, если точно не нужно.'
      },
      WHATSAPP_MODE: {
        label: 'Режим моста'
      },
      WHATSAPP_ALLOWED_USERS: {
        label: 'Разрешённые пользователи WhatsApp',
        help: 'Рекомендуется. Номера телефонов или ID WhatsApp (по одному в поле).'
      }
    },
    platformIntro: {},
    sharedListenerUrl: 'Обслуживается общим слушателем шлюза по адресу',
    restartFailedManualDetail:
      'Попробуйте перезагрузить еще раз; если все равно не получится, откройте логи и отправьте диагностику.',
    restartAgain: 'Перезагрузить снова',
    openLogs: 'Открыть журналы',
    platformDescription: {
      telegram: 'Use Hermes in Telegram private chats, groups, and topics.',
      discord: 'Connect Hermes to Discord DMs, channels, and threads.',
      slack:
        'Use Hermes in Slack via Socket Mode. The bot only responds to connected users after adding allowed Slack member IDs.',
      mattermost: 'Connect Hermes to Mattermost channels and DMs.',
      matrix: 'Use Hermes in Matrix rooms and DMs.',
      signal: 'Connect via signal-cli REST bridge.',
      whatsapp: 'Use Hermes with WhatsApp via bundled bridge — scan to auth.',
      bluebubbles: 'Use Hermes in iMessage via BlueBubbles server.',
      homeassistant: 'Control your smart home from Hermes via Home Assistant.',
      email: 'Talk to Hermes via IMAP/SMTP mailbox.',
      sms: 'Send and receive SMS via Twilio.',
      dingtalk: 'Connect Hermes to DingTalk groups.',
      feishu: 'Use Hermes in Feishu / Lark.',
      google_chat: 'Connect Hermes to Google Chat via Cloud Pub/Sub.',
      wecom: 'Send-only WeCom group bot (webhook style).',
      wecom_callback: 'Two-way WeCom integration via callback app.',
      weixin: 'Connect personal WeChat account via Tencent iLink Bot API.',
      qqbot: 'Connect Hermes to QQ Open Platform bots.',
      yuanbao: 'Connect Hermes to Tencent Yuanbao.',
      api_server: 'Expose Hermes as an OpenAI-compatible HTTP API for tools like Open WebUI.',
      webhook: 'Receive events from webhook sources like GitHub, GitLab.',
      a2a: "A2A (Agent-to-Agent) protocol v1.0 support for Hermes Agent — both directions of the open Linux Foundation standard for inter-agent communication.\n\nOUTBOUND (client tools): a2a_discover, a2a_call, a2a_list, a2a_history, and a2a_orchestrate let the agent fetch another agent's Agent Card and send it tasks over JSON-RPC — works with any A2A-compliant peer (Hermes, LangChain, CrewAI, Google ADK, OpenClaw, ...).\n\nINBOUND (platform adapter): exposes Hermes as an A2A-discoverable agent. An Agent Card is served at /.well-known/agent-card.json (v1.0 canonical path; legacy agent.json also answers) and incoming tasks are routed into the agent's live gateway session like any other platform — so the agent that replies is the same one talking to its user, with full memory and context, not a throwaway clone.\n\nSecurity is on by default: no bearer token configured => localhost-only bind. Inbound task text passes through prompt-injection filters; outbound text is scrubbed of credential-shaped strings; every exchange is audit-logged and persisted to disk outside the context-compaction pipeline so conversations survive compaction and restarts.\n\nPure stdlib transport (http.server + urllib) — no a2a-sdk dependency required.",
      buzz: 'Connect to decentralized Buzz community via Nostr relays (requires buzz CLI).',
      raft: 'Join a Raft workspace as an external agent to collaborate on tasks.'
    }
  },
  webhooks: {
    search: 'Поиск вебхуков...',
    loading: 'Загрузка вебхуков...',
    loadFailed: 'Не удалось загрузить вебхуки',
    subscriptions: count => `Подписки (${count})`,
    hint: 'Изменения подписок применяются на лету, когда приёмник запущен. Отключённые подписки отклоняют входящие события.',
    empty: 'Подписок вебхуков пока нет.',
    disabledTitle: 'Приёмник вебхуков отключён',
    disabledBody:
      'Вебхуки — это отдельная платформа шлюза. Включите их здесь, чтобы принимать входящие HTTP-события; чат-каналы нужны, только если подписка доставляет события в Telegram, Discord, Slack или другой канал.',
    enable: 'Включить вебхуки',
    enabling: 'Включение...',
    enabled: name => `Включено: «${name}»`,
    disabled: name => `Отключено: «${name}»`,
    enableRow: 'Включить',
    disableRow: 'Отключить',
    delete: 'Удалить',
    deleting: 'Удаление...',
    deleted: 'Вебхук удалён',
    deleteTitle: 'Удалить вебхук',
    deleteDescPrefix: 'Это навсегда удалит ',
    deleteDescSuffix: '. Это действие необратимо.',
    deleteFailed: name => `Не удалось удалить «${name}»`,
    toggleFailed: (name, enabled) => `Не удалось ${enabled ? 'включить' : 'отключить'} «${name}»`,
    newSubscription: 'Новая подписка',
    restarting: 'Перезапуск шлюза...',
    restartNeeded: 'Вебхуки включены, но шлюз всё ещё нужно перезапустить, чтобы приёмник заработал.',
    restartGateway: 'Перезапустить шлюз',
    restartingGateway: 'Перезапуск...',
    restartFailed: detail => `Не удалось перезапустить шлюз${detail}`,
    enabledRestarting: 'Вебхуки включены; шлюз перезапускается...',
    all: '(все)',
    deliverOnly: 'только доставка',
    createdTitle: 'Подписка создана',
    createdSecretHint: 'Скопируйте секрет сейчас — он показывается только один раз.',
    webhookUrl: 'URL вебхука',
    secretOnce: 'Секрет (показывается один раз)',
    done: 'Готово',
    fieldName: 'Имя',
    fieldNamePlaceholder: 'например, github-push',
    fieldDescription: 'Описание',
    fieldDescriptionPlaceholder: 'Что делает этот вебхук (необязательно)',
    fieldEvents: 'События',
    fieldEventsPlaceholder: 'через запятую, пусто — все',
    fieldSkills: 'Навыки',
    fieldSkillsPlaceholder: 'имена навыков через запятую (необязательно)',
    fieldDeliver: 'Канал доставки',
    fieldDeliverOnly: 'Доставлять только содержимое',
    fieldPrompt: 'Промпт',
    fieldPromptPlaceholder: 'Инструкции для агента при срабатывании этого вебхука (необязательно)',
    nameRequired: 'Имя обязательно',
    create: 'Создать',
    creating: 'Создание...',
    created: 'Создано',
    createFailed: detail => `Не удалось создать: ${detail}`,
    copy: 'Копировать',
    deliverOptions: {
      log: 'Журнал',
      telegram: 'Telegram',
      discord: 'Discord',
      slack: 'Slack',
      email: 'Email',
      github_comment: 'Комментарий GitHub'
    }
  },
  profiles: {
    close: 'Закрыть профили',
    openFailed: profile => `Не удалось открыть профиль «${profile}»`,
    switchFailed: profile => `Не удалось переключиться на профиль «${profile}»`,
    nameHint: 'Строчные буквы, цифры, дефисы и подчёркивания. Должно начинаться с буквы или цифры.',
    title: 'Профили',
    count: count => `${count} ${RU_PLURAL(count, 'профиль', 'профиля', 'профилей')}`,
    search: 'Поиск профилей...',
    loading: 'Загрузка профилей...',
    newProfile: 'Новый профиль',
    importProfile: 'Импортировать профиль…',
    exportProfile: 'Экспортировать профиль…',
    imported: 'Профиль импортирован',
    exported: 'Профиль экспортирован',
    failedImport: 'Не удалось импортировать профиль',
    failedExport: 'Не удалось экспортировать профиль',
    allProfiles: 'Все профили',
    showAllProfiles: 'Показать все профили',
    switchToProfile: name => `Переключиться на ${name}`,
    switchToConnection: name => `Переключиться на ${name}`,
    switchConnectionFailed: name => `Не удалось подключиться к ${name}`,
    manageProfiles: 'Управлять профилями…',
    connectGateway: 'Управлять шлюзами…',
    fleet: {
      allOnGateway: 'Все профили на этом шлюзе',
      gateway: gateway => `Профили на ${gateway}`,
      gatewayUnreachable: gateway => `${gateway} · недоступен`,
      rosterTimedOut: 'Истекло время ожидания получения списка профилей',
      onGateway: (name, gateway) => `${name} · ${gateway}`,
      switchTo: (name, gateway) => `Открыть ${name} на ${gateway}`,
      deleteOn: gateway => ` на ${gateway}`,
      connectExistingInstead: 'Вместо этого подключиться к существующему',
      installDeviceConfirm: 'Установить локально',
      installDeviceDesc:
        'Hermes будет установлен локально, затем на этом компьютере откроется новый сеанс. Установка не начнётся, пока вы не подтвердите.',
      installDeviceTitle: 'Установить Hermes на это устройство?',
      localDevice: 'Это устройство (локальный бэкенд — установит Hermes, если его нет, иначе откроет новый сеанс)'
    },
    remoteOverride: {
      menuItem: 'Подключиться к удаленному хосту…',
      badge: (host: string) => `Работает на ${host}`,
      title: (profile: string) => `Подключить ${profile} к удалённому хосту`,
      description:
        'Сеансы этого профиля будут выполняться на удалённом Hermes, который вы укажете, а не на этом компьютере.',
      urlLabel: 'Удаленный адрес',
      urlPlaceholder: 'https://hermes.example.com',
      urlInvalid: 'Введите полный адрес, начиная с http:// или https://.',
      tokenLabel: 'Токен доступа',
      tokenPlaceholder: 'Вставьте токен удаленного сеанса',
      tokenSavedHint: 'Токен уже сохранён. Оставьте поле пустым, чтобы не менять его.',
      plainTextOptIn:
        'На этом компьютере нет безопасного хранилища ключей, поэтому токен будет сохранён на диске в незашифрованном виде. Всё равно сохранить.',
      collisionWarning: (label: string) =>
        `Шлюз под названием «${label}» уже существует в настройках. Это подключение к профилю является отдельным и не изменит его.`,
      confirmTitle: 'Подключить этот профиль к удаленному хосту?',
      confirmNote: (profile: string, host: string) =>
        `Новые чаты в ${profile} будут выполняться на ${host}. Тот компьютер будет выполнять команды и читать файлы у себя, а не здесь. Подключайтесь только к хосту, которому доверяете.`,
      confirmBack: 'Назад',
      connect: 'Подключиться',
      connecting: 'Подключение…',
      disconnect: 'Удалить удаленное подключение',
      savedTitle: 'Профиль подключен',
      savedMessage: (profile: string, host: string) => `${profile} теперь работает на ${host}`,
      removedTitle: 'Удаленное подключение удалено',
      removedMessage: (profile: string) => `${profile} теперь работает на этом компьютере`,
      removeFailed: 'Не удалось удалить удаленное подключение',
      authFailedTitle: 'Удаленный хост отклонил сохраненный токен',
      authFailedMessage: (profile: string, host: string) =>
        `${host} отклонил токен, сохранённый для ${profile}. Возможно, его изменили на удалённой стороне.`,
      updateToken: 'Введите новый токен…'
    },
    actions: 'Действия',
    color: 'Цвет…',
    colorFor: 'Цвет',
    setColor: color => `Установить цвет ${color}`,
    autoColor: 'Авто',
    noProfiles: 'Профилей пока нет.',
    selectPrompt: 'Выберите профиль, чтобы посмотреть его детали.',
    refresh: 'Обновить профили',
    refreshing: 'Обновление профилей',
    default: 'по умолчанию',
    skills: count => `${count} ${RU_PLURAL(count, 'навык', 'навыка', 'навыков')}`,
    env: 'env',
    defaultBadge: 'По умолчанию',
    rename: 'Переименовать',
    renameMenu: 'Переименовать…',
    exportMenu: 'Экспортировать…',
    editSoul: 'Изменить SOUL.md…',
    copySetup: 'Скопировать команду установки',
    copying: 'Копирование...',
    modelLabel: 'Модель',
    skillsLabel: 'Навыки',
    notSet: 'Не задано',
    soulDesc: 'Системный промпт и инструкции по персоне, встроенные в этот профиль.',
    soulMissing:
      'В этом профиле ещё нет файла SOUL.md. Введите инструкции ниже и сохраните, чтобы создать его. Настройки персонажей в config.yaml управляются отдельно.',
    soulOptional: 'необязательно',
    soulPlaceholder: mode =>
      `Системный промпт / персона этого профиля.\nОставьте пустым, чтобы сохранить ${mode} по умолчанию.`,
    soulPlaceholderCloned: 'склонированный',
    soulPlaceholderEmpty: 'пустой',
    unsavedChanges: 'Несохранённые изменения',
    loadingSoul: 'Загрузка SOUL.md...',
    emptySoul: 'Пустой SOUL.md — начните писать персону...',
    saving: 'Сохранение...',
    saveSoul: 'Сохранить SOUL.md',
    deleteTitle: 'Удалить профиль?',
    deleteDescPrefix: 'Это удалит ',
    deleteDescMid: ' и сотрёт его ',
    deleteDescSuffix: ' каталог. Это действие необратимо.',
    deleting: 'Удаление...',
    createDesc: 'Профили — это независимые среды Hermes: отдельные настройки, навыки и SOUL.md.',
    nameLabel: 'Имя',
    cloneFrom: 'Клонировать из',
    cloneFromNone: 'Нет (пустой)',
    cloneFromDesc: 'Копирует настройки, навыки и SOUL.md из выбранного исходного профиля.',
    cloneFromDefault: 'Клонировать из профиля по умолчанию',
    cloneFromDefaultDesc: 'Скопируйте настройки, навыки и SOUL.md из вашего профиля по умолчанию.',
    invalidName: hint => `Некорректное имя. ${hint}`,
    nameRequired: 'Имя обязательно.',
    creating: 'Создание...',
    createAction: 'Создать профиль',
    renameTitle: 'Переименовать профиль',
    renameDescPrefix: 'Переименование обновляет каталог профиля и все wrapper-скрипты в ',
    renameDescSuffix: '.',
    displayNameTitle: 'Назовите этого агента',
    displayNameDesc:
      'Устанавливает отображаемое имя, показываемое во всём приложении. Внутренний ID профиля остаётся «default».',
    displayNameLabel: 'Отображаемое имя',
    newNameLabel: 'Новое имя',
    renaming: 'Переименование...',
    created: 'Профиль создан',
    renamed: 'Профиль переименован',
    deleted: 'Профиль удалён',
    setupCopied: 'Команда установки скопирована',
    soulSaved: 'SOUL.md сохранён',
    failedLoad: 'Не удалось загрузить профили',
    failedDelete: 'Не удалось удалить профиль',
    failedCopy: 'Не удалось скопировать команду установки',
    failedLoadSoul: 'Не удалось загрузить SOUL.md',
    failedSaveSoul: 'Не удалось сохранить SOUL.md',
    failedCreate: 'Не удалось создать профиль',
    failedRename: 'Не удалось переименовать профиль',
    openInNewWindow: 'Открыть в новом окне',
    setAsDefault: 'Сделать по умолчанию',
    defaultProfile: 'Профиль по умолчанию',
    defaultSet: name => `${name} теперь используется по умолчанию`,
    defaultDescription:
      'Используется при запуске Hermes и для новых чатов. Существующие сеансы остаются в своих профилях.',
    failedSetDefault: 'Не удалось установить профиль по умолчанию',
    notServedHere: 'Здесь не обслуживается',
    exportNeedsHost: name =>
      `Браузер не может сохранить архив профиля. На хосте Hermes выполните: hermes profile export ${name}`
  },
  cron: {
    control: ruCronControl,
    close: 'Закрыть cron',
    title: 'Запланированные задачи',
    count: count => `${count} ${RU_PLURAL(count, 'задача', 'задачи', 'задач')}`,
    search: 'Поиск cron-задач...',
    loading: 'Загрузка cron-задач...',
    states: {
      enabled: 'включено',
      scheduled: 'запланировано',
      running: 'выполняется',
      paused: 'приостановлено',
      disabled: 'отключено',
      error: 'ошибка',
      completed: 'завершено'
    },
    deliveryLabels: {
      local: 'Это приложение',
      telegram: 'Telegram',
      discord: 'Discord',
      slack: 'Slack',
      email: 'Email'
    },
    scheduleLabels: {
      daily: 'Ежедневно',
      weekdays: 'Будни',
      weekly: 'Еженедельно',
      monthly: 'Ежемесячно',
      hourly: 'Каждый час',
      'every-15-minutes': 'Каждые 15 минут',
      custom: 'Свой'
    },
    scheduleHints: {
      daily: 'Каждый день в 9:00',
      weekdays: 'С понедельника по пятницу в 9:00',
      weekly: 'Каждый понедельник в 9:00',
      monthly: 'В первый день каждого месяца в 9:00',
      hourly: 'В начале каждого часа',
      'every-15-minutes': 'Каждые 15 минут',
      custom: 'Синтаксис cron или естественный язык'
    },
    days: {
      '0': 'Воскресенье',
      '1': 'Понедельник',
      '2': 'Вторник',
      '3': 'Среда',
      '4': 'Четверг',
      '5': 'Пятница',
      '6': 'Суббота',
      '7': 'Воскресенье'
    },
    dayFallback: value => `день ${value}`,
    everyDayAt: time => `Каждый день в ${time}`,
    weekdaysAt: time => `Будни в ${time}`,
    everyDayOfWeekAt: (day, time) => `Каждый ${day} в ${time}`,
    monthlyOnDayAt: (dayOfMonth, time) => `Ежемесячно ${dayOfMonth}-го числа в ${time}`,
    topOfHour: 'В начале каждого часа',
    everyHourAt: minute => `Каждый час на :${minute}`,
    newCron: 'Новый cron',
    emptyDescNew:
      'Запланируйте промпт, который будет выполняться по cron-выражению. Hermes выполнит его и доставит результаты в выбранное вами место.',
    emptyDescSearch: 'Попробуйте более широкий запрос.',
    emptyTitleNew: 'Запланированных задач пока нет',
    emptyTitleSearch: 'Нет совпадений',
    last: 'Последний:',
    next: 'Следующий:',
    noRuns: 'Запусков пока не было',
    queuedRun: 'Запуск в очереди',
    manage: 'Управлять',
    showRuns: 'Показать запуски',
    hideRuns: 'Скрыть запуски',
    runHistory: 'История запусков',
    actionsTitle: 'Действия с cron-задачей',
    resume: 'Продолжить cron',
    pause: 'Приостановить cron',
    resumeTitle: 'Продолжить',
    pauseTitle: 'Приостановить',
    triggerNow: 'Запустить сейчас',
    edit: 'Изменить cron',
    deleteTitle: 'Удалить cron-задачу?',
    deleteDescPrefix: 'Это навсегда удалит ',
    deleteDescSuffix: '. Она перестанет срабатывать сразу.',
    deleting: 'Удаление...',
    resumed: 'Cron продолжен',
    paused: 'Cron приостановлен',
    triggered: 'Cron запущен',
    deleted: 'Cron удалён',
    created: 'Cron создан',
    updated: 'Cron обновлён',
    failedLoad: 'Не удалось загрузить cron-задачи',
    failedUpdate: 'Не удалось обновить cron-задачу',
    failedTrigger: 'Не удалось запустить cron-задачу',
    failedDelete: 'Не удалось удалить cron-задачу',
    failedSave: 'Не удалось сохранить cron-задачу',
    editTitle: 'Изменить cron-задачу',
    createTitle: 'Новая cron-задача',
    editDesc: 'Обновите расписание, промпт или место доставки. Изменения вступят в силу при следующем запуске.',
    createDesc:
      'Запланируйте промпт для автоматического выполнения. Используйте синтаксис cron или фразу вроде «каждые 15 минут».',
    nameLabel: 'Название',
    namePlaceholder: 'Утренний брифинг',
    promptLabel: 'Промпт',
    scriptLabel: 'Скрипт',
    scriptBadge: 'скрипт',
    promptPlaceholder: 'Суммируй мои непрочитанные треды Slack и пришли топ-5 на почту...',
    frequencyLabel: 'Частота',
    deliverLabel: 'Доставить в',
    deliverNeedsHomeChannel: 'сначала задайте домашний канал',
    modelLabel: 'Модель',
    modelDefault: 'По умолчанию (глобальная модель)',
    customScheduleLabel: 'Своё расписание',
    customPlaceholder: '0 9 * * * или будни в 9:00',
    customHint: 'Cron-выражение или фразы вроде «каждый час» или «будни в 9:00».',
    optional: 'Необязательно',
    promptRequired: 'Промпт обязателен.',
    promptScheduleRequired: 'Промпт и расписание обязательны.',
    scheduleRequired: 'Расписание обязательно.',
    scriptOnlyEditHint: 'Задача только со скриптом (без AI-промпта). ID задачи:',
    saveChanges: 'Сохранить изменения',
    createAction: 'Создать cron',
    tabs: {
      jobs: 'Задачи',
      blueprints: 'Шаблоны'
    },
    blueprints: {
      tab: 'Шаблоны',
      startFrom: 'Начать с',
      custom: 'Свой',
      subtitle: 'Готовые автоматизации',
      dialogDesc: 'Заполните детали и запланируйте.',
      scheduleIt: 'Запланировать',
      scheduling: 'Планирование...',
      scheduled: 'Шаблон запланирован',
      loading: 'Загрузка шаблонов...',
      failedLoad: 'Не удалось загрузить шаблоны',
      emptyTitle: 'Шаблоны недоступны',
      emptyDesc: 'На этом бэкенде нет шаблонов автоматизации.',
      titles: {
        'Morning briefing': 'Утренняя сводка',
        'Important-mail monitor': 'Контроль важных писем',
        'Weekly review': 'Еженедельный обзор',
        'Workday start reminder': 'Напоминание о начале рабочего дня',
        'Custom reminder': 'Своё напоминание',
        'Evening wind-down': 'Вечернее подведение итогов',
        'Topic news digest': 'Дайджест новостей по теме',
        'Bills & renewals reminder': 'Напоминание о счетах и продлениях',
        'Price & availability watch': 'Контроль цены и наличия',
        'Competitor news watch': 'Мониторинг новостей конкурентов',
        'Habit check-in': 'Проверка привычки',
        'Hydration & movement nudge': 'Напоминание о воде и движении',
        'Weekly meal plan': 'Еженедельный план питания',
        'Daily learning drip': 'Ежедневная порция знаний',
        'Gratitude & reflection prompt': 'Практика благодарности и рефлексии',
        'On-this-day discovery': 'Открытие дня в истории'
      },
      descriptions: {
        'Morning briefing': 'Короткая ежедневная сводка: календарь на сегодня, погода и срочные незавершённые дела.',
        'Important-mail monitor':
          'Периодически проверяет входящие и сообщает только о письмах, действительно требующих внимания.',
        'Weekly review': 'Итоги недели: что сделано, что осталось и что предстоит.',
        'Workday start reminder': 'Напоминание о рабочем дне с повесткой и главными приоритетами.',
        'Custom reminder': 'Повторяющееся напоминание по вашему расписанию.',
        'Evening wind-down': 'Вечерняя проверка: расписание на завтра и то, что стоит подготовить сегодня.',
        'Topic news digest':
          'Периодическая сводка по интересующим темам без повторов — только действительно новые материалы.',
        'Bills & renewals reminder':
          'Заранее предупреждает о регулярных платежах, продлениях подписок и сроках оплаты.',
        'Price & availability watch':
          'Следит за товарами, рейсами, отелями или объявлениями и сообщает при достижении нужной цены или доступности.',
        'Competitor news watch':
          'Отслеживает важные новости выбранных компаний — запуски, цены, финансирование и отчётность — со ссылками на источники.',
        'Habit check-in': 'Периодически напоминает поддерживать привычку и отмечать результат.',
        'Hydration & movement nudge': 'В течение дня напоминает пить воду, вставать и разминаться.',
        'Weekly meal plan': 'План питания на неделю с общим списком покупок с учётом диеты и времени на готовку.',
        'Daily learning drip': 'Один небольшой урок в день по выбранной теме — знания накапливаются постепенно.',
        'Gratitude & reflection prompt': 'Ежедневный или еженедельный вопрос для благодарности и осмысления.',
        'On-this-day discovery': 'Интересные исторические события этого дня с учётом ваших интересов.'
      },
      labels: {
        'What time?': 'В какое время?',
        'Where to deliver?': 'Куда доставлять?',
        'How often?': 'Как часто?',
        'Remind me to…': 'Напомнить мне…',
        'Which day?': 'В какой день?',
        'Repeat on': 'Повторять по',
        'What topic?': 'Какая тема?',
        'How many bullets?': 'Сколько пунктов?',
        "What's due?": 'О чём напомнить?',
        'What exactly to watch?': 'За чем именно следить?',
        'Alert me when…': 'Сообщить, когда…',
        'Which companies?': 'Какие компании?',
        'Which events matter?': 'Какие события важны?',
        'Which habit?': 'Какая привычка?',
        'Start hour': 'Час начала',
        'End hour': 'Час окончания',
        'Diet?': 'Диета?',
        'Meals per day?': 'Приёмов пищи в день?',
        'Cooking effort?': 'Сложность готовки?',
        'Only notify me if the mail…': 'Сообщать, только если письмо…',
        'Learn about…': 'Изучать…',
        'What kind?': 'Какого типа?'
      },
      helps: {
        '24h local time, e.g. 08:00': 'местное время в 24-часовом формате, например 08:00',
        'minutes between checks': 'минут между проверками',
        'hours between checks — be gentle with rate limits': 'часов между проверками — учитывайте ограничения частоты',
        'hours between nudges': 'часов между напоминаниями',
        'first hour of the active window (24h)': 'первый час активного периода (24 ч)',
        'last hour of the active window (24h)': 'последний час активного периода (24 ч)'
      },
      options: {
        everyday: 'ежедневно',
        weekdays: 'по будням',
        weekends: 'по выходным',
        sunday: 'воскресенье',
        monday: 'понедельник',
        tuesday: 'вторник',
        wednesday: 'среда',
        thursday: 'четверг',
        friday: 'пятница',
        saturday: 'суббота',
        'dinner only': 'только ужин',
        'lunch and dinner': 'обед и ужин',
        'all three': 'все три',
        quick: 'быстро',
        medium: 'средне',
        ambitious: 'сложно',
        'no restrictions': 'без ограничений',
        vegetarian: 'вегетарианская',
        vegan: 'веганская',
        'high-protein': 'высокобелковая',
        'low-carb': 'низкоуглеводная',
        'on this day in history': 'этот день в истории',
        'word of the day': 'слово дня',
        'science fact': 'научный факт',
        'quote of the day': 'цитата дня',
        auto: 'автоматически',
        websocket: 'WebSocket',
        poll: 'опрос'
      }
    },
    lastRunFailed: 'Последний запуск не удался:',
    editJob: 'Изменить задачу',
    runAgain: 'Запустить снова',
    overdueSince: 'Просрочено с:',
    modelImpact: {
      title: 'Запланированные задачи остаются на исходной модели',
      message: count =>
        `${count} ${RU_PLURAL(count, 'незакреплённая запланированная задача продолжит', 'незакреплённые запланированные задачи продолжат', 'незакреплённых запланированных задач продолжат')} работать на модели, с которой ${RU_PLURAL(count, 'была создана', 'были созданы', 'были созданы')}. Закрепите ${RU_PLURAL(count, 'её', 'их', 'их')} или задайте cron.model, чтобы перевести.`,
      detailMore: (names, remaining) => `${names} и ещё ${remaining}`,
      review: 'Проверить запланированные задачи',
      saveFailed: 'Hermes не сохранил это изменение модели.',
      confirmTitle: 'Предупреждение о выборе модели',
      confirmDetail: 'Подтвердите, только если принимаете этот компромисс.',
      confirmAction: 'Подтвердить',
      declined: 'Изменение модели отменено — вы отклонили предупреждение об уровне обучения на данных.'
    }
  },
  artifacts: {
    search: 'Поиск артефактов...',
    refresh: 'Обновить артефакты',
    refreshing: 'Обновление артефактов',
    indexing: 'Индексация недавних артефактов сеансов',
    tabAll: 'Все',
    tabImages: 'Изображения',
    tabFiles: 'Файлы',
    tabLinks: 'Ссылки',
    noArtifactsTitle: 'Артефакты не найдены',
    noArtifactsDesc: 'Здесь появятся изображения и файлы, которые создают сеансы.',
    failedLoad: 'Не удалось загрузить артефакты',
    openFailed: 'Не удалось открыть',
    // Read after "1–24 из 120" and in goToPage ("…списка изображений"): genitive plural.
    itemsImage: 'изображений',
    itemsLink: 'ссылок',
    itemsFile: 'файлов',
    itemsGeneric: 'элементов',
    zero: '0',
    rangeOf: (start, end, total) => `${start}–${end} из ${total}`,
    goToPage: (itemLabel, page) => `Перейти на страницу ${page} списка ${itemLabel}`,
    colTitleLink: 'Название ссылки',
    colTitleFile: 'Имя',
    colTitleDefault: 'Название / имя',
    colLocationLink: 'URL',
    colLocationFile: 'Путь',
    colLocationDefault: 'Расположение',
    colSession: 'Сеанс',
    kindImage: 'изображение',
    kindFile: 'файл',
    kindLink: 'ссылка',
    chat: 'Чат',
    copyUrl: 'Копировать URL',
    copyPath: 'Копировать путь'
  },
  artifactCard: {
    kind: {
      code: 'Код',
      html: 'Интерактивная страница',
      svg: 'Графика'
    },
    generating: lines => `Генерация… ${lines} ${RU_NOUN(lines, 'строка', 'строки', 'строк')}`,
    versionBadge: (current, total) => `v${current}/${total}`,
    open: 'Открыть'
  },
  artifactPreview: {
    versionOf: (current, total) => `v${current} из ${total}`,
    olderVersion: 'Предыдущая версия',
    newerVersion: 'Следующая версия',
    latest: 'Последняя',
    copyContent: 'Копировать содержимое',
    download: 'Скачать',
    openInBrowser: 'Открыть в браузере',
    openInBrowserFailed: 'Не удалось открыть в браузере',
    missingTitle: 'Артефакт недоступен',
    missingBody: 'Этого артефакта больше нет в локальном реестре.'
  },
  sidebar: {
    profileRail: 'Панель профилей',
    filter: {
      grouping: 'Группировка',
      ordering: 'Сортировка',
      show: 'Показывать',
      inboxStyle: 'Стиль «Входящие»',
      status: 'Статус',
      pullRequest: 'Запрос на слияние',
      profile: 'Профиль',
      project: 'Проект',
      archived: 'Архивные',
      expandAll: 'Развернуть все',
      collapseAll: 'Свернуть все',
      updated: 'Обновлено',
      created: 'Создано',
      tokens: 'Токены',
      cost: 'Стоимость',
      manual: 'Вручную',
      preview: 'Превью',
      pr: 'PR',
      open: 'Открыт',
      draft: 'Черновик',
      merged: 'Слит',
      closed: 'Закрыт',
      needsInput: 'Нужен ввод',
      working: 'В работе',
      unread: 'Непрочитанные',
      idle: 'Бездействие',
      filters: 'Фильтры',
      resetToDefaults: 'Сбросить настройки',
      noPR: 'Без PR'
    },
    gatewayGroups: {
      grouping: 'Шлюз и профиль',
      rename: 'Переименовать группу',
      aliasLabel: 'Отображаемое имя',
      aliasHint: 'Меняется только отображаемое имя; имена шлюза и профиля остаются прежними.',
      resetName: 'Сбросить имя',
      moveUp: 'Переместить вверх',
      moveDown: 'Переместить вниз',
      reorder: 'Изменить порядок групп',
      actions: 'Действия с группой'
    },
    nav: {
      'new-session': 'Новый сеанс',
      skills: 'Возможности',
      messaging: 'Сообщения',
      artifacts: 'Артефакты',
      cron: 'Запланированные задачи',
      capabilities: 'Возможности'
    },
    searchAria: 'Поиск сеансов',
    searchPlaceholder: 'Поиск сеансов…',
    clearSearch: 'Очистить поиск',
    noMatch: query => `Нет сеансов по запросу «${query}».`,
    results: 'Результаты',
    pinned: 'Закреплённые',
    sessions: 'Сеансы',
    cronJobs: 'Cron-задачи',
    groupAriaGrouped: 'Показать сеансы одним списком',
    groupAriaUngrouped: 'Сгруппировать сеансы по рабочим пространствам',
    showProjects: 'Показать проекты',
    showSessions: 'Показать сеансы',
    groupTitleGrouped: 'Не группировать сеансы',
    groupTitleUngrouped: 'Группировать по рабочему пространству',
    allPinned: 'Здесь всё закреплено. Открепите чат, чтобы он появился в недавних.',
    shiftClickHint: 'Shift-клик по чату, чтобы закрепить',
    noWorkspace: 'Без рабочего пространства',
    projectEmpty: 'Сеансов пока нет',
    projectLoadFailed: 'Не удалось загрузить сеансы',
    noSessions: 'Сеансов пока нет',
    noFilterMatches: 'Нет сеансов по этим фильтрам',
    projects: ruProjects,
    newSessionIn: label => `Новый сеанс в ${label}`,
    showMoreIn: (count, label) => `Показать ещё ${count} в ${label}`,
    loading: 'Загрузка…',
    loadMore: 'Загрузить ещё',
    loadCount: step => `Загрузить ещё ${step}`,
    messageCount: count => `${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')}`,
    toolCallCount: count =>
      `${count} ${RU_PLURAL(count, 'вызов инструмента', 'вызова инструмента', 'вызовов инструмента')}`,
    row: {
      pin: 'Закрепить',
      unpin: 'Открепить',
      markUnread: 'Отметить как непрочитанное',
      markRead: 'Отметить как прочитанное',
      unreadFailed: 'Не удалось обновить состояние непрочитанных',
      copyId: 'Копировать ID',
      export: 'Экспорт',
      branchFrom: 'Ветка',
      rename: 'Переименовать…',
      archive: 'В архив',
      unarchive: 'Восстановить',
      newWindow: 'Новое окно',
      openInTerminal: 'Открыть в терминале',
      hideTabBar: 'Скрыть панель вкладок',
      openInNewTab: 'Открыть в новой вкладке',
      openInSplit: 'Открыть в сплит-виде',
      splitDirections: {
        right: 'Вправо',
        bottom: 'Вниз',
        left: 'Влево',
        top: 'Вверх'
      },
      copyIdFailed: 'Не удалось скопировать ID сеанса',
      sessionActions: 'Действия с сеансом',
      sessionRunning: 'Сеанс выполняется',
      needsInput: 'Нужен ваш ввод',
      waitingForAnswer: 'Ждёт вашего ответа',
      finishedUnread: 'Завершён — не прочитан',
      backgroundRunning: 'Фоновая задача выполняется',
      draftSession: 'Черновик — ещё ничего не отправлено',
      handoffOrigin: platform => `Передано из ${platform}`,
      ownedByProfile: profile => `Профиль: ${profile}`,
      renamed: 'Переименовано',
      renameFailed: 'Переименование не удалось',
      renameTitle: 'Переименовать сеанс',
      untitledPlaceholder: 'Сеанс без названия',
      deleteTitle: 'Удалить сеанс?',
      deleteDesc: title => `Это навсегда удалит «${title}». Это действие необратимо.`,
      deleting: 'Удаление…',
      deleted: 'Сеанс удалён',
      untitledChat: id => `Чат ${id}`,
      messageCount: count => `${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')}`,
      todoProgress: 'Задачи выполнены',
      ageNow: 'сейчас',
      ageDay: 'д',
      ageHour: 'ч',
      ageMin: 'м',
      renameDesc: 'Оставьте пустым, чтобы очистить.'
    },
    dateDivider: {
      today: 'Ранее сегодня',
      yesterday: 'Вчера',
      thisWeek: 'Ранее на этой неделе',
      lastWeek: 'На прошлой неделе',
      thisMonth: 'Ранее в этом месяце'
    },
    statusDivider: {
      working: 'Работает',
      done: 'Готово'
    },
    filterMenu: {
      ariaLabel: 'Фильтры',
      grouping: 'Группировка',
      ordering: 'Сортировка',
      show: 'Показывать',
      inboxStyle: 'Стиль «Входящие»',
      filters: 'Фильтры',
      status: 'Статус',
      pullRequest: 'Запрос на слияние',
      profile: 'Профиль',
      project: 'Проект',
      archived: 'Архивные',
      resetToDefaults: 'Сбросить настройки',
      expandAll: 'Развернуть все',
      collapseAll: 'Свернуть все',
      markAllRead: 'Отметить все как прочитанное',
      options: {
        updated: 'Обновлено',
        project: 'Проект',
        status: 'Статус',
        profile: 'Профиль',
        created: 'Создано',
        tokens: 'Токены',
        cost: 'Стоимость',
        manual: 'Вручную',
        preview: 'Превью',
        pr: 'PR',
        open: 'Открыт',
        draft: 'Черновик',
        merged: 'Слит',
        closed: 'Закрыт',
        noPr: 'Без PR',
        needsInput: 'Нужен ввод',
        working: 'В работе',
        unread: 'Непрочитанные',
        idle: 'Бездействие'
      }
    },
    markAllRead: 'Отметить все как прочитанные',
    terminal: 'Терминал',
    files: 'Файлы',
    review: 'Проверка',
    logs: 'Журналы'
  },
  composer: {
    message: 'Сообщение',
    botSelectionRequired: 'Выберите бота, прежде чем начинать другой чат.',
    botChatUnsupported: 'Обновите Hermes Desktop, чтобы открыть ещё один чат с ботом.',
    addContext: 'Добавить контекст',
    wakingProfile: profile => `Пробуждение профиля «${profile}»…`,
    placeholderStarting: 'Запуск Hermes...',
    placeholderReconnecting: 'Переподключение к Hermes…',
    placeholderFollowUp: 'Отправить продолжение',
    newSessionPlaceholders: [
      'Что будем делать?',
      'Дайте Hermes задачу',
      'О чём вы думаете?',
      'Опишите, что нужно',
      'За что возьмёмся?',
      'Спросите о чём угодно',
      'Начните с цели'
    ],
    followUpPlaceholders: [
      'Напишите следующее сообщение',
      'Добавьте контекст',
      'Уточните запрос',
      'Что дальше?',
      'Продолжаем',
      'Развивайте дальше',
      'Скорректируйте или продолжите'
    ],
    startVoice: 'Начать голосовой диалог',
    openDirective: 'Открыть',
    queueMessage: 'Поставить сообщение в очередь',
    steer: 'Уточнить текущий ход',
    redirect: 'Перенаправить текущий ход',
    stop: 'Остановить',
    send: 'Отправить',
    speaking: 'Говорит',
    transcribing: 'Расшифровка',
    thinking: 'Думает',
    muted: 'Микрофон выключен',
    listening: 'Слушает',
    muteMic: 'Выключить микрофон',
    unmuteMic: 'Включить микрофон',
    stopListening: 'Перестать слушать и отправить',
    stopShort: 'Стоп',
    endConversation: 'Завершить голосовой диалог',
    endShort: 'Завершить',
    stopDictation: 'Остановить диктовку',
    transcribingDictation: 'Расшифровка диктовки',
    voiceControls: 'Голос',
    voiceEngine: 'Движок голосового чата',
    voiceEngineChained: 'Распознавание речи + голос Hermes',
    voiceEngineLive: 'GPT-Live (полный дуплекс, передаёт задачи Hermes)',
    voiceEngineLiveNeedsKey: 'Нужен API-ключ OpenAI',
    voiceEngineChangeFailed: 'Не удалось сменить движок голосового чата',
    voiceEngineChainedShort: 'распознавание речи',
    voiceEngineLiveShort: 'GPT-Live',
    voiceDictation: 'Голосовая диктовка',
    speakReplies: 'Зачитывать ответы вслух',
    stopSpeakingReplies: 'Перестать зачитывать ответы вслух',
    wakeWordListening: phrase => `Слово активации: «${phrase}» — слушает`,
    wakeWordOff: phrase => `Слово активации: «${phrase}» — отключено`,
    wakeWordPausedVoice: phrase => `Слово активации: «${phrase}» — приостановлено на время голосового чата`,
    wakeWordClickToEnable: 'нажмите, чтобы включить',
    lookupLoading: 'Поиск…',
    lookupNoMatches: 'Нет совпадений.',
    lookupTry: 'Попробуйте',
    lookupOr: 'или',
    atStarters: {
      file: 'Прикрепить ссылку на файл',
      folder: 'Прикрепить ссылку на папку',
      url: 'Прикрепить ссылку на URL',
      image: 'Прикрепить ссылку на изображение',
      tool: 'Прикрепить ссылку на инструмент',
      git: 'Прикрепить контекст git'
    },
    atScopes: {
      file: 'Файлы',
      folder: 'Папки',
      url: 'Ссылки',
      image: 'Изображения',
      tool: 'Инструменты',
      git: 'Git'
    },
    commonCommands: 'Частые команды',
    hotkeys: 'Горячие клавиши',
    helpFooter: 'открывает полную панель · backspace закрывает',
    commandDescs: {
      '/help': 'Показать слеш-команды приложения',
      '/clear': 'начать новый сеанс',
      '/resume': 'Возобновить сохранённый сеанс',
      '/details': 'управлять уровнем детализации истории',
      '/copy': 'скопировать выделенное или последнее сообщение ассистента',
      '/quit': 'выйти из hermes',
      '/start': 'Подтверждать стартовые пинги платформы без ответа',
      '/new': 'Начать новый чат в приложении',
      '/topic': 'Включить или просмотреть сеансы по темам в личных сообщениях Telegram',
      '/history': 'Показать историю разговора',
      '/save': 'Сохранить текущую историю в JSON',
      '/retry': 'Повторно отправить последнее сообщение агенту',
      '/prompt': 'Написать следующий промпт в $EDITOR (Markdown) и отправить',
      '/undo': 'Откатить N ходов пользователя и отправить промпт заново (по умолчанию 1)',
      '/title': 'Переименовать текущий сеанс',
      '/handoff': 'Передать этот сеанс в мессенджер',
      '/branch': 'Создать новый чат из последнего сообщения',
      '/worktree': 'Показать, перечислить, создать или очистить изолированные git worktrees',
      '/compress': 'Сжать контекст текущей беседы',
      '/rollback':
        'Показать или восстановить контрольные точки файловой системы (ручные правки при восстановлении сохраняются; --all перезаписывает и их)',
      '/export': 'Экспортировать профиль (конфигурацию, навыки, тему) в архив, которым можно поделиться',
      '/import': 'Импортировать общий архив профиля как новый профиль',
      '/stop': 'Остановить текущий ход и фоновые процессы',
      '/pause': 'Глобально приостановить новую работу (аварийная остановка); «/pause off» возобновляет её',
      '/bg': 'Выполнить промпт в отдельном фоновом сеансе',
      '/btw': 'Задать побочный вопрос о беседе, не прерывая её',
      '/agents': 'Показать активных агентов и выполняемые задачи',
      '/journey': 'Открыть граф памяти — навыки и воспоминания во времени',
      '/queue': 'Поставить промпт в очередь на следующий ход или управлять очередью (list/edit/rm/move/clear)',
      '/steer': 'Добавить сообщение после следующего вызова инструмента без прерывания',
      '/goal': 'Задать постоянную цель, над которой Hermes работает из хода в ход, пока она не будет достигнута',
      '/heartbeat': 'Задать повторяющийся промпт, который возвращается в этот сеанс при простое',
      '/refine': 'Проанализировать беседу и сохранить выводы в памяти или навыках',
      '/review': 'Запустить независимого субагента для проверки только что обсуждённой работы (PR, код, документация)',
      '/loop': 'Повторять промпт с заданным интервалом в этом сеансе',
      '/plan': 'Записать план реализации в Markdown в .hermes/plans/ без выполнения',
      '/moa': 'Выполнить один промпт через пресет Mixture of Agents по умолчанию, затем вернуть прежнюю модель',
      '/subgoal': 'Добавить дополнительные критерии к активной цели или управлять ими',
      '/status': 'Показать состояние текущего сеанса',
      '/egress': 'Показать состояние исходящего прокси Docker',
      '/context':
        'Подробно показать контекстное окно: шкалу заполнения, разбивку по категориям, статистику сжатия и скорость обработки',
      '/whoami': 'Показать уровень доступа к слеш-командам (администратор / пользователь)',
      '/profile': 'Переключить активный профиль Hermes',
      '/config': 'Показать текущую конфигурацию',
      '/codex-runtime': 'Переключить среду Codex app-server для моделей OpenAI/Codex',
      '/personality': 'Выбрать готовую личность',
      '/battery': 'Переключить цветной индикатор батареи в строке состояния',
      '/timestamps': 'Переключить метки времени [HH:MM] в сообщениях и /history',
      '/diff': 'Показать изменения Git в рабочем каталоге',
      '/focus': 'Переключить режим фокуса — показывать только промпт и итоговый ответ',
      '/yolo': 'Переключить YOLO — автоматически одобрять опасные команды',
      '/approvals': 'Показать или задать постоянный режим подтверждения опасных команд',
      '/reasoning': 'Глубина или отображение рассуждений [<level> [--global]|show|hide|full|clamp]',
      '/skin': 'Переключить тему приложения или выбрать следующую',
      '/skin list': 'Показать доступные темы приложения',
      '/skin next': 'Перейти к следующей теме приложения',
      '/wake': 'Управлять прослушиванием слова активации в приложении [on|off|status]',
      '/autoprune': 'Включить или отключить автоматическую очистку старых сеансов',
      '/tools': 'Управлять инструментами: /tools [list|disable|enable] [name...]',
      '/skills': 'Просмотреть отложенные записи навыков и режим подтверждения',
      '/memory': 'Просмотреть ожидающие записи в память или переключить обязательное подтверждение',
      '/bundles': 'Показать наборы навыков (псевдонимы /<name> для нескольких навыков)',
      '/pet': 'Включить или завести питомца из petdex (/pet, /pet list, /pet boba)',
      '/hatch': 'Создать нового питомца (открывает генератор питомцев)',
      '/learn': 'Создать многоразовый навык из всего, что вы опишете (папки, URL, этот чат, заметки)',
      '/init': 'Просканировать репозиторий и создать или обновить инструкции AGENTS.md',
      '/suggestions': 'Просмотреть, принять или отклонить предложенные автоматизации',
      '/blueprint': 'Настроить автоматизацию по шаблону',
      '/browser': 'Управлять браузером агента [connect|disconnect|status]',
      '/palette': 'Открыть палитру команд с нечётким поиском (также Ctrl+P)',
      '/usage': 'Показать расход токенов и лимиты запросов; `reset` использует накопленный сброс лимита Codex',
      '/subscription': 'Показать план Nous и изменить его в браузере',
      '/topup': 'Показать баланс Nous и управлять оплатой на портале',
      '/platform': 'Приостановить, возобновить или перечислить сбоящие платформы шлюза',
      '/version': 'Показать версию Hermes Agent',
      '/debug':
        'Выгрузить отладочный отчёт (сведения о системе + журналы) и получить ссылки, которыми можно поделиться',
      '/model': 'Переключить модель для этого сеанса'
    },
    slashGroups: {
      Session: 'Сеанс',
      Configuration: 'Конфигурация',
      Info: 'Информация',
      'Tools & Skills': 'Инструменты и навыки',
      'User commands': 'Пользовательские команды',
      'Plugin commands': 'Команды плагинов',
      Commands: 'Команды',
      Skills: 'Навыки',
      Options: 'Параметры',
      Themes: 'Темы',
      Sessions: 'Сеансы'
    },
    browseAllSessions: 'Просмотреть все сеансы…',
    currentThemeLabel: label => `${label} (текущая)`,
    hotkeyDescs: {
      'composer.mention': 'ссылки на файлы, папки, URL, git',
      'composer.slash': 'палитра слеш-команд',
      'composer.help': 'эта быстрая справка (удалите, чтобы закрыть)',
      'composer.sendNewline': 'отправить · Shift+Enter — новая строка',
      'composer.sendQueued': 'отправить следующий ход из очереди',
      'keybinds.openPanel': 'все горячие клавиши',
      'composer.cancel': 'закрыть поповер · отменить запуск',
      'composer.history': 'переключать поповер / историю'
    },
    attachUrlTitle: 'Прикрепить URL',
    attachUrlDesc: 'Hermes загрузит страницу и добавит её как контекст для этого хода.',
    urlPlaceholder: 'https://example.com/post',
    urlHintPre: 'Укажите полный URL, например ',
    attach: 'Прикрепить',
    queued: count => `${count} в очереди`,
    queuedPaused: count => `${count} в очереди — пауза`,
    attachmentOnly: 'Ход только с вложениями',
    emptyTurn: 'Пустой ход',
    hiddenQueued: 'Примечание по настройке',
    attachments: count => `${count} ${RU_NOUN(count, 'вложение', 'вложения', 'вложений')}`,
    editingInComposer: 'Редактирование в композере',
    editingQueuedInComposer: 'Редактирование хода в очереди в композере',
    restoredDraftNotice: 'Неотправленное сообщение восстановлено',
    restoredDraftUndo: 'Отменить',
    queueEdit: 'Изменить',
    queueExpand: 'Раскрыть',
    queueCollapse: 'Свернуть',
    queueSendNext: 'Отправить следующим',
    queueSteer: 'Уточнить — перенаправить текущий ход прямо сейчас',
    queueSend: 'Отправить',
    queueDelete: 'Удалить',
    queueLostNote: 'Ход потерян при перезапуске',
    restoreImageDraft: 'Восстановить черновик с изображением',
    queueCancelFailed: 'Не удалось удалить ход из очереди',
    queueLostDiscard: 'Отбросить',
    queueLostDiscardTip:
      'Шлюз перезапустился посреди хода и не может его завершить. Отбросьте его, чтобы очередь продолжилась.',
    queueResume: 'Продолжить',
    queueResumeTip: 'Приостановлено кнопкой «Остановить» — возобновить отправку ходов из очереди',
    queueStuckTitle: 'Сообщение из очереди не отправлено',
    queueStuckBody:
      'Ход из очереди несколько раз не удалось отправить. Он всё ещё в очереди — попробуйте отправить снова.',
    queueDroppedTitle: 'Промпт из очереди отброшен',
    queueDroppedBody:
      'Эта запись фоновой очереди отброшена: её сеанс не удалось возобновить после нескольких попыток. Остальные записи очереди не затронуты.',
    terminalSelectionMissingTitle: 'Выделение из терминала недоступно',
    terminalSelectionMissingBody:
      'Выделите строки терминала заново (Ctrl/Cmd+L) перед отправкой — у этого вложения нет исходного текста.',
    queuedTerminalSelectionExpiredBody:
      'Это выделение из терминала в очереди больше недоступно. Выделите строки заново (Ctrl/Cmd+L) и снова поставьте сообщение в очередь.',
    previewUnavailable: 'Предпросмотр недоступен',
    previewLabel: label => `Предпросмотр ${label}`,
    couldNotPreview: label => `Не удалось предпросмотреть ${label}`,
    removeAttachment: label => `Удалить ${label}`,
    dictating: 'Диктовка',
    preparingAudio: 'Подготовка аудио',
    speakingResponse: 'Зачитывает ответ',
    readingAloud: 'Читает вслух',
    themeSuggestions: 'Варианты тем приложения',
    noMatchingThemes: 'Нет совпадающих тем.',
    themeTryPre: 'Попробуйте ',
    themeTryPost: '.',
    attachLabel: 'Прикрепить',
    files: 'Файлы…',
    folder: 'Папка…',
    images: 'Изображения…',
    pasteImage: 'Вставить изображение',
    url: 'URL…',
    promptSnippets: 'Фрагменты промптов…',
    tipPre: 'Подсказка: введите ',
    tipPost: ', чтобы ссылаться на файлы прямо в тексте.',
    snippetsTitle: 'Фрагменты промптов',
    snippetsDesc: 'Выберите стартовый промпт, чтобы вставить в композер.',
    dropFiles: 'Отпустите файлы, чтобы прикрепить',
    dropSession: 'Отпустите, чтобы связать этот чат',
    snippets: {
      codeReview: {
        label: 'Проверка кода',
        description: 'Аудит текущих изменений на предмет регрессий, упущенных граничных случаев и недостающих тестов.',
        text: 'Пожалуйста, проверьте это на баги, регрессии и недостающие тесты.'
      },
      implementationPlan: {
        label: 'План реализации',
        description: 'Опишите подход перед правкой кода, чтобы diff остался сфокусированным.',
        text: 'Пожалуйста, составьте краткий план реализации перед изменением кода.'
      },
      explainThis: {
        label: 'Объяснить это',
        description: 'Разберите, как работает выделенный код, и дайте ссылки на ключевые файлы.',
        text: 'Пожалуйста, объясните, как это работает, и укажите ключевые файлы.'
      }
    },
    wakeWord: phrase => `Слово активации «${phrase}»`
  },
  statusStack: {
    agents: 'Агенты',
    background: count => `${count} ${RU_NOUN(count, 'фоновая задача', 'фоновые задачи', 'фоновых задач')}`,
    goalActive: 'Цель активна',
    goalBlocked: 'Цель заблокирована',
    goalDone: 'Цель выполнена',
    goalPaused: 'Цель на паузе',
    goalWaiting: 'Цель ожидает',
    subagents: count => `${count} ${RU_PLURAL(count, 'субагент', 'субагента', 'субагентов')}`,
    todos: (done, total) => `Задачи ${done}/${total}`,
    previousTodos: (done, total) => `Прошлые задачи ${done}/${total}`,
    running: 'Выполняется',
    stop: 'Остановить',
    dismiss: 'Скрыть',
    exit: code => `exit ${code}`,
    control: {
      goalActiveTurns: (turn, maxTurns) => `Ход ${turn}/${maxTurns}`,
      goalDoneTurns: turns => `${turns} ${RU_PLURAL(turns, 'ход', 'хода', 'ходов')}`,
      goalTurn: turn => `Ход ${turn}`,
      goalActions: 'Действия с целью',
      viewDetails: 'Подробнее',
      addCriterion: 'Добавить критерий',
      addCriterionDialogTitle: 'Добавить критерий',
      addCriterionPlaceholder: 'Введите текст критерия...',
      criterionLabel: 'Критерий',
      pauseGoal: 'Приостановить цель',
      resumeGoal: 'Возобновить цель',
      resumeNow: 'Возобновить сейчас',
      clearGoal: 'Удалить цель',
      clearGoalConfirmTitle: 'Удалить цель?',
      clearGoalConfirmBody: 'Вы уверены, что хотите удалить активную цель? Это действие необратимо.',
      copyCriterion: index => `Скопировать критерий ${index}`,
      removeCriterion: index => `Удалить критерий ${index}`,
      removeCriterionConfirmTitle: index => `Удалить критерий ${index}?`,
      removeCriterionConfirmBody: index => `Вы уверены, что хотите удалить критерий ${index}?`,
      clearCriteria: 'Очистить все критерии',
      clearCriteriaConfirmTitle: 'Очистить все критерии?',
      clearCriteriaConfirmBody: 'Вы уверены, что хотите удалить все критерии этой цели?',
      criteriaHeader: count => `Критерии · ${count}`,
      noCriteria: 'Нет критериев',
      goalDetailsTitle: 'Детали цели',
      objectiveLabel: 'Задача',
      contractOutcome: 'Результат',
      contractVerification: 'Проверка',
      contractConstraints: 'Ограничения',
      contractBoundaries: 'Границы',
      contractStopWhen: 'Условие остановки',
      waitBarrierTitle: 'Условие ожидания',
      waitUntil: target => `Ожидание до ${target}`,
      waitSession: target => `Ожидание сеанса ${target}`,
      waitPid: pid => `Ожидание процесса ${pid}`,
      qualityGatesTitle: 'Проверки качества',
      gateCommand: 'Команда',
      gateAttempts: (attempts, max) => `попыток: ${attempts}/${max}`,
      gateTimeout: seconds => `тайм-аут ${seconds} с`,
      gateLastExit: code => (code === null ? 'В ожидании' : `Код возврата: ${code}`),
      loopActive: 'Цикл активен',
      loopPaused: 'Цикл приостановлен',
      loopDeferred: 'Цикл отложен',
      loopFinished: 'Цикл завершён',
      loopRuns: runs => `${runs} ${RU_PLURAL(runs, 'запуск', 'запуска', 'запусков')}`,
      loopRunCount: (current, total) => `Запуск ${current}/${total}`,
      loopNext: time => `следующий через ${time}`,
      loopEverySeconds: seconds => `${RU_PLURAL(seconds, 'каждую', 'каждые', 'каждые')} ${seconds} с`,
      loopEveryMinutes: minutes => `${RU_PLURAL(minutes, 'каждую', 'каждые', 'каждые')} ${minutes} мин`,
      loopEveryHours: hours => `${RU_PLURAL(hours, 'каждый', 'каждые', 'каждые')} ${hours} ч`,
      loopSelfPaced: 'в своём темпе',
      loopActions: 'Действия цикла',
      pauseLoop: 'Приостановить цикл',
      resumeLoop: 'Возобновить цикл',
      stopLoop: 'Остановить цикл',
      stopLoopConfirmTitle: 'Остановить цикл?',
      stopLoopConfirmBody: 'Вы уверены, что хотите остановить этот цикл?',
      dismissLoop: 'Убрать цикл',
      loopPromptLabel: 'Промпт',
      loopCadenceLabel: 'Интервал',
      loopUntilLabel: 'Условие окончания',
      loopDeferredNotice: 'Сейчас сеансом управляет активная цель.',
      loopAwaitingResponse: 'Ожидание ответа',
      heartbeatActive: 'Пульс активен',
      heartbeatPaused: 'Пульс приостановлен',
      heartbeatEveryMinutes: minutes => `${RU_PLURAL(minutes, 'каждую', 'каждые', 'каждые')} ${minutes} мин`,
      heartbeatEveryHours: hours => `${RU_PLURAL(hours, 'каждый', 'каждые', 'каждые')} ${hours} ч`,
      heartbeatEverySeconds: seconds => `${RU_PLURAL(seconds, 'каждую', 'каждые', 'каждые')} ${seconds} с`,
      heartbeatNext: time => `следующий через ${time}`,
      dueWaitingForIdle: 'пора — ожидание простоя',
      heartbeatActions: 'Действия пульса',
      pauseHeartbeat: 'Приостановить пульс',
      resumeHeartbeat: 'Возобновить пульс',
      clearHeartbeat: 'Удалить пульс',
      clearHeartbeatConfirmTitle: 'Удалить пульс?',
      clearHeartbeatConfirmBody: 'Вы уверены, что хотите удалить этот пульс?',
      heartbeatFiredCount: count => `Сработал ${count} ${RU_PLURAL(count, 'раз', 'раза', 'раз')}`,
      actionFailed: msg => `Не удалось выполнить действие: ${msg}`,
      actionSucceeded: 'Действие выполнено успешно',
      copySuccess: 'Критерий скопирован в буфер обмена',
      copyFailure: 'Не удалось скопировать критерий в буфер обмена',
      continuationFailed: 'Не удалось отправить продолжение цели',
      continuationQueued: 'Цель возобновлена — продолжение поставлено в очередь до конца текущего хода',
      continuationBusy:
        'Цель возобновлена — сеанс занят; сначала остановите текущий ответ (кнопка «Остановить» или Esc), чтобы продолжить',
      controlUnavailable: msg => `Управление сеансом недоступно: ${msg}`,
      dismissError: 'Скрыть ошибку',
      add: 'Добавить'
    },
    coding: {
      title: 'Рабочее дерево',
      noBranch: 'Без ветки',
      detached: 'отсоединённый HEAD',
      clean: 'Чисто',
      changed: count => `${count} ${RU_PLURAL(count, 'изменение', 'изменения', 'изменений')}`,
      ahead: count => `Впереди на ${count} ${RU_PLURAL(count, 'коммит', 'коммита', 'коммитов')}`,
      behind: count => `Позади на ${count} ${RU_PLURAL(count, 'коммит', 'коммита', 'коммитов')}`,
      review: 'Проверка',
      close: 'Закрыть',
      openChanges: 'Открыть изменения',
      openFile: 'Открыть файл',
      stage: 'Добавить в индекс',
      unstage: 'Убрать из индекса',
      stageAll: 'Добавить всё в индекс',
      viewAsTree: 'Показать деревом',
      viewAsList: 'Показать списком',
      revert: 'Откатить',
      revertAll: 'Откатить всё',
      revertConfirm:
        'Сбросить изменения в этом файле и вернуть его в закоммиченное состояние? Это действие необратимо.',
      revertAllConfirm: 'Сбросить все изменения и вернуть файлы в закоммиченное состояние? Это действие необратимо.',
      staged: 'В индексе',
      noChanges: 'Изменений нет',
      notRepo: 'Не git-репозиторий',
      noDiff: 'Нет изменений для показа',
      scopeUncommitted: 'Незакоммиченные',
      scopeBranch: 'Ветка',
      scopeLastTurn: 'Последний ход',
      readOnlyScope: 'Только просмотр — добавление в индекс, откат и коммит доступны в режиме «Незакоммиченные»',
      commit: 'Коммит',
      commitAndPush: 'Коммит и отправка',
      commitPlaceholder: shortcut => `Сообщение (${shortcut} — коммит)`,
      generateCommitMessage: 'Сгенерировать сообщение коммита',
      stopGenerating: 'Остановить генерацию',
      createPr: 'Создать PR',
      openPr: 'Открыть PR',
      ghMissing: 'Установите GitHub CLI (gh) и войдите, чтобы открывать PR',
      agentShip: 'Попросить Hermes открыть PR',
      agentShipUnavailable: 'Чат, к которому относятся эти изменения, сейчас не открыт.',
      agentShipPrompt:
        'Проверьте текущие изменения, закоммитьте их с понятным сообщением в формате Conventional Commits, отправьте ветку в удалённый репозиторий и создайте pull request.',
      newBranch: 'Новая ветка',
      branchOffFrom: base => `Новая ветка от ${base}`,
      switchTo: branch => `Переключиться на ${branch}`,
      switchFailed: branch => `Не удалось переключиться на ${branch}`,
      worktrees: 'Worktrees'
    },
    hideStack: 'Скрыть панель состояния',
    showStack: 'Показать панель состояния'
  },
  updates: {
    discontinuedTitle: 'Эта сборка Hermes больше не поддерживается',
    discontinuedBody:
      'Эта сборка Hermes больше не поддерживается и может перестать работать — удалите её. Ваши данные останутся на диске.',
    channels: { stable: 'Стабильный', canary: 'Тестовый' },
    bundleSwapPending: 'Перезапустите, чтобы завершить обновление',
    bundleSwapPendingDesc:
      'Обновлённое приложение уже установлено — достаточно перезапустить Hermes, чтобы загрузить его. Чаты и настройки не пострадают.',
    bundleSwapPendingAction: 'Перезапустить Hermes',
    stages: {
      idle: 'Подготовка…',
      prepare: 'Подготовка…',
      fetch: 'Загрузка…',
      pull: 'Почти готово…',
      pydeps: 'Завершение…',
      update: 'Обновление Hermes…',
      rebuild: 'Пересборка приложения…',
      restart: 'Перезапуск Hermes…',
      done: 'Обновление завершено',
      manual: 'Обновление из терминала',
      guiSkew: 'Обновите приложение',
      error: 'Обновление приостановлено'
    },
    checking: 'Поиск обновлений…',
    checkFailedTitle: 'Не удалось проверить обновления',
    tryAgain: 'Попробовать снова',
    notAvailableTitle: 'Обновление недоступно',
    unsupportedMessage: 'Эту версию Hermes нельзя обновить из самого приложения.',
    connectionRetry:
      'Hermes не смог связаться с сервером обновлений. Проверьте подключение к интернету и попробуйте снова. Если вы используете удалённый Hermes, убедитесь, что он в сети.',
    latestBody: 'У вас последняя версия.',
    versionDetailsDistributionStore: 'Microsoft Store',
    latestBodyBackend: 'Бэкенд работает на последней версии.',
    allSetTitle: 'Всё готово',
    availableTitle: 'Доступно новое обновление',
    availableBody: 'Новая версия Hermes готова к установке.',
    availableTitleBackend: 'Доступно обновление бэкенда',
    availableBodyBackend: 'Новая версия подключённого бэкенда Hermes готова к установке.',
    availableBodyNoChangelog: 'Новая версия готова. Заметки о выпуске недоступны для этого типа установки.',
    availableBodyAppInstaller:
      'Новая версия Hermes готова. Hermes закроется, Windows завершит обновление, и Hermes снова откроется сам.',
    updateNow: 'Обновить сейчас',
    maybeLater: 'Позже',
    moreChanges: count => `+ ещё ${count} ${RU_PLURAL(count, 'изменение', 'изменения', 'изменений')}.`,
    changelogGroups: {
      new: 'Что нового',
      fixed: 'Исправления',
      faster: 'Быстрее',
      improved: 'Улучшения',
      other: 'Другие улучшения'
    },
    changelogFallbackTitle: 'В этом обновлении',
    changelogFallback: 'Улучшения и исправления',
    copyFullLog: 'Скопировать полный список изменений',
    manualTitle: 'Обновление из терминала',
    manualUnavailableTitle: 'Обновление здесь недоступно',
    manualBody:
      'Hermes установлен из командной строки, поэтому обновления тоже выполняются там. Вставьте это в терминал:',
    manualPickedUp: 'Hermes подхватит новую версию при следующем запуске.',
    manualBodyBackend: 'Бэкенд Hermes управляется вне этого приложения. Выполните это на сервере, где он размещён:',
    manualPickedUpBackend: 'Бэкенд загрузит новую версию после завершения обновления.',
    guiSkewTitle: 'Обновите приложение',
    guiSkewBody:
      'Бэкенд обновлён, но пакет этого приложения не изменился. Обновите или переустановите приложение Hermes Desktop (ваш AppImage / .deb / .rpm), чтобы версии совпали.',
    copy: 'Копировать',
    copied: 'Скопировано',
    done: 'Готово',
    applyingBody:
      'Программа обновления Hermes продолжит работу в своём окне и сама откроет Hermes снова, когда закончит. Не открывайте Hermes вручную, пока идёт обновление.',
    applyingBodyBackend:
      'Удалённый бэкенд применяет обновление и перезапустится. Hermes переподключится автоматически, когда бэкенд снова станет доступен.',
    applyingClose: 'Это окно закроется во время обновления, затем Hermes откроется сам.',
    applyingBodyAppInstaller:
      'Hermes закроется, и Windows завершит обновление. Когда всё будет готово, Hermes откроется снова — вам ничего не нужно делать.',
    checkUnknownTitleAppInstaller: 'Не удалось проверить обновления',
    checkUnknownBodyAppInstaller:
      'Windows сейчас не удалось проверить обновления. Обновления также устанавливаются автоматически при перезапуске Hermes.',
    errorTitle: 'Обновление не завершилось',
    errorBody: 'Не переживайте — ничего не потеряно. Можно попробовать снова прямо сейчас.',
    blockerTitle: 'Закрыть локальные предпросмотры, чтобы обновить Hermes?',
    blockerBody:
      'Перед обновлением Hermes должен остановить эти локальные предпросмотры. Ваши файлы не будут изменены или удалены.',
    foreignBlockerTitle: 'Закройте другие процессы, чтобы обновить Hermes',
    foreignBlockerBody:
      'Hermes не может безопасно закрыть эти процессы автоматически. Закройте приложение, терминал или службу, которой принадлежит каждый из них, и повторите обновление.',
    mixedBlockerBody:
      'Hermes может закрыть локальные предпросмотры, перечисленные ниже. Остальные процессы нужно закрыть вручную, прежде чем обновление сможет продолжиться.',
    closePreviewsAndUpdate: 'Закрыть предпросмотры и обновить',
    closePreviewsAndCheckAgain: 'Закрыть предпросмотры и проверить снова',
    localPreview: 'Локальный предпросмотр',
    portLabel: port => `Порт ${port}`,
    pidLabel: pid => `PID ${pid}`,
    technicalDetails: 'Технические подробности',
    notNow: 'Не сейчас',
    clientAlsoBehindTitle: 'Приложение отстаёт от бэкенда',
    clientAlsoBehindMessage:
      'Бэкенд в актуальном состоянии, но это приложение ещё на старой версии. Обновите его, чтобы получить последние исправления.',
    clientAlsoBehindAction: 'Обновить приложение',
    everythingDispatched: 'Обновление запущено',
    everythingSkipped: 'Пропущено',
    everythingRowFailed: 'Не удалось обновить',
    everythingFanoutFailedTitle: 'Не удалось обновить другие экземпляры',
    changeLogNew: 'Новое',
    changeLogFixed: 'Исправления',
    changeLogFaster: 'Быстродействие',
    changeLogImproved: 'Улучшения',
    changeLogOther: 'Другие улучшения',
    changeLogFallbackLabel: 'В этом обновлении',
    changeLogFallbackItem: 'Улучшения и исправления',
    applyStatus: {
      preparing: 'Обновление бэкенда…',
      pulling: 'Бэкенд обновляется…',
      restarting: 'Бэкенд перезапускается для загрузки обновления…',
      notAvailable: 'Обновление недоступно для этого бэкенда.',
      failed: 'Не удалось обновить бэкенд.',
      noReturn: 'Бэкенд не вернулся в сеть. Обновление могло не завершиться — проверьте хост бэкенда.',
      owed: steps =>
        `Бэкенд обновлён, но не завершены шаги: ${steps}. Снова выполните \`hermes update\`, чтобы закончить их.`
    },
    gitUnusable: 'Hermes не смог запустить Git на этом компьютере, поэтому проверить обновления не удалось.',
    connectionSettings: 'Настройки подключения',
    openDownloadPage: 'Открыть страницу загрузки',
    justNowSuffix: ' · только что',
    bundleOutOfSync: 'Сборка приложения устарела',
    bundleOutOfSyncAction: 'Скачать установщик',
    bundleOutOfSyncDesc:
      'Среда выполнения Hermes обновлена, но само приложение — ещё старая сборка. Обновите его, чтобы получить последние исправления.',
    cantReach: 'Не удалось связаться с сервером обновлений.',
    checkNow: 'Проверить сейчас',
    checkingShort: 'Проверка…',
    daysAgo: count => `${count} ${RU_NOUN(count, 'день', 'дня', 'дней')} назад`,
    hoursAgo: count => `${count} ${RU_NOUN(count, 'час', 'часа', 'часов')} назад`,
    installing: 'Сейчас устанавливается обновление.',
    justNow: 'только что',
    lastChecked: age => `Последняя проверка: ${age}`,
    minAgo: count => `${count} ${RU_NOUN(count, 'минуту', 'минуты', 'минут')} назад`,
    never: 'никогда',
    onLatest: 'У вас последняя версия.',
    releaseNotes: 'Заметки о выпуске',
    seeWhatsNew: 'Посмотреть, что нового',
    tapCheck: 'Нажмите «Проверить сейчас», чтобы найти обновления.',
    updateReady: count =>
      `Готово новое обновление (включено ${count} ${RU_PLURAL(count, 'изменение', 'изменения', 'изменений')}).`,
    updateReadyUnknown: 'Готово новое обновление.',
    appName: 'Hermes',
    availableBodyRelease: tag => `Версия ${tag} готова к установке.`,
    version: value => `Версия ${value}`,
    versionUnavailable: 'Версия недоступна',
    versionDetailsVersion: 'Версия',
    versionDetailsCommit: 'Коммит',
    versionDetailsBuildOrigin: 'Источник сборки',
    versionDetailsBuildOriginLocal: 'Локальный',
    versionDetailsDistribution: 'Способ установки',
    versionDetailsDistributionDesktop: 'Приложение Hermes Desktop',
    versionDetailsDistributionDesktopMsix: 'Приложение Hermes Desktop (MSIX)',
    versionDetailsDistributionDesktopInstaller: 'Приложение Hermes Desktop (установщик)',
    versionDetailsDistributionSourceInstaller: 'Исходный код (скрипт установки)',
    versionDetailsDistributionSourceInstallerDesktop: 'Исходный код (скрипт установки) + hermes desktop',
    versionDetailsDistributionSource: 'Исходный код',
    versionDetailsDistributionSourceDesktop: 'Исходный код + hermes desktop',
    versionDetailsRuntime: 'Среда выполнения',
    versionDetailsRuntimeEmbedded: 'Встроенная среда выполнения',
    versionDetailsRuntimeExternal: 'Внешняя (среда выполнения компьютера)',
    versionDetailsInstallId: 'ID установки',
    versionDetailsUncommittedChanges: 'незакоммиченные изменения',
    versionDetailsBackend: 'Подключённый бэкенд',
    versionDetailsClient: 'Это устройство'
  },
  install: {
    stageStates: {
      pending: 'Ожидает',
      running: 'Установка',
      succeeded: 'Готово',
      skipped: 'Пропущено',
      failed: 'Ошибка'
    },
    stageNames: {
      uv: 'Установка uv',
      python: 'Проверка Python',
      git: 'Установка Git',
      node: 'Определение Node.js',
      'system-packages': 'Установка системных пакетов',
      prerequisites: 'Проверка системных требований',
      repository: 'Загрузка Hermes Agent',
      venv: 'Создание виртуального окружения Python',
      dependencies: 'Установка зависимостей Python',
      'python-deps': 'Установка зависимостей Python',
      'node-deps': 'Установка зависимостей браузерных инструментов',
      desktop: 'Сборка приложения',
      path: 'Установка команды hermes',
      'config-templates': 'Запись шаблонов конфигурации',
      config: 'Подготовка конфигурации и навыков',
      'platform-sdks': 'Установка SDK платформ сообщений',
      'bootstrap-marker': 'Отметка завершения установки',
      configure: 'Настройка API-ключей и моделей',
      setup: 'Настройка API-ключей и параметров',
      gateway: 'Настройка службы шлюза',
      repo: 'Загрузка Hermes Agent',
      complete: 'Завершение установки'
    },
    unknownError: 'Неизвестная ошибка',
    oneTimeTitle: 'Требуется однократная установка Hermes',
    unsupportedDesc: platform =>
      `Автоматическая установка при первом запуске пока недоступна на ${platform}. Откройте Терминал и выполните команду ниже, затем перезапустите это приложение. При следующих запусках этот шаг будет пропущен.`,
    installCommand: 'Команда установки',
    copyCommand: 'Копировать команду',
    viewDocs: 'Открыть документацию по установке',
    installTo: 'Будет установлено в',
    retryAfterRun: 'Команда выполнена — повторить',
    setupChoiceTitle: 'Настройка Hermes Desktop',
    setupChoiceDesc:
      'Подключите это приложение к уже работающему шлюзу Hermes или установите Hermes локально на этот компьютер.',
    setupChoiceDescLocal: 'Установите Hermes на этот компьютер или подключитесь к уже работающему шлюзу Hermes.',
    connectExistingTitle: 'Подключиться к существующему Hermes',
    connectExistingShort: 'Подключить существующий',
    connectExistingDesc:
      'Использовать удалённый бэкенд с токеном сеанса или входом через браузер. Локальная установка не начнётся.',
    installLocalTitle: 'Установить Hermes локально',
    installLocalDesc: 'Скачать Hermes, создать для него окружение Python и запустить бэкенд на этом компьютере.',
    useLocalTitle: 'Использовать Hermes на этом компьютере',
    useLocalDesc:
      'Среда выполнения Hermes здесь уже установлена — запустить её можно одним нажатием. Ничего скачивать не нужно.',
    bundledLocalDesc:
      'Использовать среду выполнения Hermes, входящую в это приложение, — встроенный бэкенд и есть локальная установка.',
    localStartUnavailable: 'Не удалось начать локальную установку. Перезапустите Hermes Desktop и попробуйте снова.',
    remoteSetupTitle: 'Подключиться к существующему Hermes',
    remoteSetupDesc: 'Введите URL вашего шлюза. Hermes Desktop определит, нужен токен или вход через браузер.',
    remoteUrlTitle: 'URL шлюза',
    remoteUrlDesc: 'Укажите базовый URL шлюза Hermes; для удалённого шлюза — вместе с https://.',
    remoteUrlPlaceholder: 'https://gateway.example.com/hermes',
    probing: 'Определение способа аутентификации шлюза...',
    probeError:
      'Hermes не может связаться с этим адресом. Проверьте URL и убедитесь, что на другом компьютере запущен Hermes. Варианты входа появятся, когда он ответит.',
    identityProvider: 'ваш провайдер аутентификации',
    authTitle: 'Аутентификация',
    authNeedsOauth: provider => `Сначала войдите через ${provider}, чтобы проверить этот шлюз.`,
    authSignedIn: 'Вход через браузер завершён.',
    connected: 'Подключено',
    signIn: 'Войти',
    signInWith: provider => `Войти через ${provider}`,
    enterUrlFirst: 'Сначала введите URL шлюза.',
    signInIncomplete: 'Окно входа закрылось до завершения аутентификации.',
    tokenTitle: 'Токен сеанса',
    tokenDesc: 'Вставьте токен сеанса из файла .env удалённого шлюза.',
    pasteSessionToken: 'Вставьте токен сеанса',
    incompleteSignInTest: 'Войдите, чтобы проверить этот шлюз с OAuth-защитой.',
    incompleteTokenTest: 'Введите токен сеанса, прежде чем проверять этот шлюз.',
    testConnection: 'Проверить соединение',
    testSucceeded: (baseUrl, version) => `Подключено к ${baseUrl}${version ? ` (${version})` : ''}.`,
    applyRemote: 'Применить и переподключиться',
    backToSetup: 'Назад',
    failedTitle: 'Не удалось завершить установку',
    settingUpTitle: 'Настройка Hermes Agent',
    finishingTitle: 'Завершение установки',
    failedDesc:
      'Один из шагов установки не завершился. Так бывает, если запущена другая копия Hermes, пропало подключение к интернету или антивирус заблокировал установщик. Закройте другие окна Hermes и нажмите «Перезагрузить и повторить». Если ошибка повторится, откройте журналы и отправьте их в поддержку.',
    activeDesc:
      'Это однократная настройка. Установщик Hermes скачивает зависимости и настраивает ваш компьютер. При следующих запусках этот шаг будет пропущен.',
    progress: (completed, total) => `Выполнено ${completed} из ${total} ${RU_PLURAL(total, 'шага', 'шагов', 'шагов')}`,
    currentStage: stage => ` — сейчас: ${stage}`,
    fetchingManifest: 'Загрузка манифеста установщика...',
    error: 'Ошибка',
    hideOutput: 'Скрыть вывод установщика',
    showOutput: 'Показать вывод установщика',
    lines: count => `${count} ${RU_PLURAL(count, 'строка', 'строки', 'строк')}`,
    noOutput: 'Вывода пока нет.',
    cancelling: 'Отмена...',
    cancelInstall: 'Отменить установку',
    transcriptSaved: 'Полный журнал сохранён в',
    copiedOutput: 'Скопировано!',
    copyOutput: 'Копировать вывод',
    reloadRetry: 'Перезагрузить и повторить',
    probeErrorDetails: 'Подробности',
    openLogs: 'Открыть журналы'
  },
  onboarding: ruOnboarding,
  freeTier: {
    providerRowTitle: 'Nous · бесплатный тариф',
    providerRowPitch: 'Войдите с аккаунтом Nous, чтобы получить больше моделей и инструментов.',
    readyTitle: 'Hermes готов.',
    readyCaption: 'Бесплатно · коннекторы включены',
    begin: 'Начать',
    signInInstead: 'Войти с аккаунтом Nous',
    otherProviders: 'Другие провайдеры',
    stripTitle: 'Теперь доступны бесплатный инференс Nous и коннекторы.',
    stripBody: 'Откройте выбор модели, чтобы попробовать их, или войдите с аккаунтом Nous.',
    openModelPicker: 'Открыть выбор модели',
    dismiss: 'Скрыть',
    providerName: 'Nous',
    statusLabel: model => `Nous · ${model}`,
    signIn: 'Войти',
    signInHeading: 'Войдите с аккаунтом Nous, чтобы получить больше моделей и инструментов.',
    settingUp: 'Настройка бесплатного инференса…',
    finishInBrowser: 'Завершите вход в браузере',
    doNotShare: 'Не делитесь этим кодом.',
    openPageAgain: 'Открыть страницу снова',
    waiting: 'Ожидание входа в систему…',
    finishingHeading: 'Завершение входа в систему…',
    finishingBody: 'Вход подтверждён в браузере. Получаем токены вашего аккаунта.',
    signedInAsLabel: 'Вы вошли как',
    signedIn: 'Вход выполнен.',
    completedBody: 'Теперь ваш аккаунт даёт доступ к инференсу и инструментам.',
    reconnect: 'Переподключить',
    openConnectors: 'Открыть коннекторы',
    defaultModel: 'Модель по умолчанию',
    change: 'Изменить',
    done: 'Готово',
    notNow: 'Не сейчас',
    tryAgain: 'Попробовать снова',
    didNotComplete: 'Вход не завершён',
    timedOutHeading: 'Срок действия ссылки для входа истёк',
    timedOutBody: 'Начните снова, когда будете готовы. Вы по-прежнему пользуетесь бесплатным сервисом Nous.',
    errorBody: 'Вход не завершён. Попробуйте ещё раз, когда будете готовы.',
    alreadySignedInHeading: 'Вход уже выполнен.',
    alreadySignedInBody: 'Этот Hermes уже вошёл в аккаунт Nous.',
    offer: {
      heading: 'Продолжайте с Hermes',
      body: 'Вы пользуетесь бесплатным лимитом. Если продолжите работать с Hermes, скоро начнёте упираться в ограничения. Войдите с бесплатным аккаунтом Nous, чтобы получить больший лимит.',
      signIn: 'Войти',
      notNow: 'Не сейчас'
    },
    busyHeading: 'Почти готово',
    busyBody: wait =>
      `Hermes не смог завершить вход: сервис Nous сейчас перегружен. Попробуйте снова чуть позже (ожидание: ${wait}). Ваш сеанс пока сохраняется.`,
    unreachableBody:
      'Hermes не смог связаться с сервисом Nous, чтобы завершить вход. Проверьте подключение к интернету и попробуйте снова. Ваш сеанс сохраняется.',
    setupFailed: {
      gateClosed:
        'Эту версию Hermes нельзя запустить без аккаунта Nous. Войдите или создайте его — это бесплатно и займёт всего минуту.',
      paused:
        'Работа с Hermes без входа ненадолго приостановлена. Hermes продолжит проверять. Вход бесплатный и позволяет начать прямо сейчас.',
      rateLimited: wait =>
        `Сейчас очень многие начинают работу с Hermes, поэтому он повторит попытку позже (ожидание: ${wait}). Вход бесплатный и позволяет не ждать.`,
      unreachable:
        'Hermes не смог связаться с сервисом Nous. Проверьте подключение к интернету и нажмите «Попробовать снова» или пока подключите другого провайдера.',
      serverError:
        'В сервисе Nous произошёл сбой. Чуть позже нажмите «Попробовать снова» или пока подключите другого провайдера.',
      powRequired:
        'Сервер Nous запросил доказательство выполнения работы (proof of work), но ваш агент пока этого не поддерживает. Войдите или создайте бесплатный аккаунт Nous, чтобы продолжить.',
      locked: 'Этот сеанс нельзя продолжить без входа. Войдите или создайте бесплатный аккаунт Nous, чтобы продолжить.',
      generic:
        'Hermes не смог настроить бесплатный доступ без входа. Войдите (это бесплатно) или подключите другого провайдера.',
      signInBelow: 'Вход бесплатный. Выберите Nous ниже.',
      tryAgain: 'Попробовать снова',
      retrying: 'Повторная попытка…'
    },
    // friendlyWait(): the phrase after «ожидание:» in busyBody and setupFailed.rateLimited.
    wait: {
      fewSeconds: 'несколько секунд',
      aboutMinute: 'около минуты',
      aboutMinutes: count => `около ${count} ${RU_PLURAL(count, 'минуты', 'минут', 'минут')}`,
      aboutHour: 'около часа',
      aboutHours: count => `около ${count} ${RU_PLURAL(count, 'часа', 'часов', 'часов')}`
    }
  },
  modelPicker: {
    title: 'Сменить модель',
    current: 'текущая:',
    unknown: '(неизвестно)',
    search: 'Поиск провайдеров и моделей...',
    noModels: 'Модели не найдены.',
    addProvider: 'Добавить провайдера',
    loadFailed: 'Не удалось загрузить модели',
    loadingIntoMemory: 'Загрузка в память',
    downloading: 'Скачивание',
    localDownloadsHeading: 'Локальные',
    noAuthenticatedProviders: 'Нет подключённых провайдеров.',
    pro: 'Pro',
    proNeedsSubscription: 'Модели Pro требуют платной подписки Nous.',
    free: 'Бесплатно',
    freeTier: 'Бесплатный тариф',
    priceTitle: 'Цена ввода / вывода за миллион токенов',
    wasPrice: 'было',
    customModel: 'Своя модель',
    addCustomModelAction: 'Добавить свою модель…',
    customModelPlaceholder: 'Введите ID модели, например, openai/gpt-5',
    today: 'Сегодня',
    week: 'Неделя',
    month: 'Месяц',
    topTier: 'Крупные модели (в месяц)',
    included: 'Все модели ниже входят в тариф',
    pausedRenewal: 'приостановлено: продление не оплачено',
    pausedOther: 'приостановлено',
    includedUsedUp: 'Включённый объём исчерпан',
    limitReached: name => `Достигнут ${name}`,
    limitNames: {
      day: 'дневной лимит',
      month: 'месячный лимит',
      top_tier: 'месячный лимит крупных моделей',
      week: 'недельный лимит'
    },
    limitThenCredits: 'платные модели теперь используют ваши кредиты (оплата по факту)',
    limitThenCreditsLarge: 'крупные модели теперь используют ваши кредиты (оплата по факту)',
    limitThenWait: 'до сброса только бесплатные модели',
    limitThenWaitLarge: 'крупные модели приостановлены до сброса',
    percentUsed: percent => `${percent} использовано`,
    resetsIn: duration => `сброс через ${duration}`,
    usageLevels: { free: 'Бесплатно', top_tier: 'Крупная' },
    sectionRecommended: 'Рекомендуемые',
    sectionOther: 'Другие модели',
    largeFootnote: 'Крупные модели также расходуют месячный лимит крупных моделей.'
  },
  modelVisibility: {
    title: 'Модели',
    search: 'Поиск моделей',
    noAuthenticatedProviders: 'Нет подключённых провайдеров.',
    addProvider: 'Добавить провайдера…',
    addCustomModel: 'Добавить свою модель',
    removeCustomModel: 'Удалить свою модель',
    resetToDefaults: 'Сбросить к значениям по умолчанию',
    resetConfirm: 'Сбросить видимость моделей к значениям по умолчанию?',
    resetDescription:
      'Ваш выбор показанных и скрытых моделей будет очищен, и у каждого провайдера вернётся список по умолчанию. Добавленные вами модели сохранятся и будут показаны.',
    resetAction: 'Сбросить'
  },
  shell: {
    windowControls: 'Управление окном',
    paneControls: 'Управление панелями',
    appControls: 'Управление приложением',
    modelMenu: ruModelMenu,
    modelOptions: {
      noOptions: 'Для этой модели нет опций',
      options: 'Опции',
      thinking: 'Размышление',
      fast: 'Быстрая',
      ultrafast: 'Ultrafast',
      useStandardSpeed: 'Использовать стандартную скорость',
      effort: 'Усилия',
      minimal: 'Минимально',
      low: 'Низкое',
      medium: 'Среднее',
      high: 'Высокое',
      xhigh: 'Очень высокое',
      max: 'Максимум',
      ultra: 'Ультра',
      updateFailed: 'Не удалось обновить опцию модели',
      fastFailed: 'Не удалось обновить быстрый режим',
      sendsOnRoute: (level: string) => `на этом маршруте отправляется ${level}`,
      daybreak: 'Daybreak',
      daybreakFailed: 'Не удалось обновить Daybreak'
    },
    gatewayMenu: ruGatewayMenu,
    approvalMode: {
      title: 'Режим подтверждения',
      ariaLabel: mode => `Режим подтверждения: ${mode}`,
      manual: 'Ручной',
      manualDescription: 'Спрашивать перед действиями, требующими подтверждения',
      smart: 'Умный',
      smartDescription: 'Автоматически оценивать действия и спрашивать при необходимости',
      off: 'Выкл',
      offDescription: 'Выполнять без запросов подтверждения'
    },
    statusbar: {
      unknown: 'неизвестно',
      restart: 'перезапуск',
      update: 'обновление',
      updateInProgress: 'Обновление выполняется',
      commitsBehind: (count, branch) => `${count} ${RU_NOUN(count, 'коммит', 'коммита', 'коммитов')} позади ${branch}`,
      desktopVersion: version => `Hermes Desktop v${version}`,
      backendVersion: version => `Бэкенд v${version}`,
      clientLabel: version => `клиент v${version}`,
      connectionSsh: host => `SSH: ${host}`,
      connectionRemote: host => `Удалённый: ${host}`,
      connectionCloud: host => `Облако: ${host}`,
      connectionCloudTooltip: host => `Hermes Cloud · ${host}`,
      connectionSshTooltip: host => `SSH · ${host}`,
      connectionRemoteTooltip: host => `Удалённый · ${host}`,
      backendLabel: version => `бэкенд v${version}`,
      commit: sha => `коммит ${sha}`,
      branch: branch => `ветка ${branch}`,
      closeCommandCenter: 'Закрыть командный центр',
      openCommandCenter: 'Открыть командный центр',
      showTerminal: 'Показать терминал',
      hideTerminal: 'Скрыть терминал',
      gateway: 'Шлюз',
      backend: 'Бэкенд',
      messagingStopped: 'шлюз сообщений остановлен',
      messagingDegraded: name => `${name} недоступен`,
      gatewayReady: 'готов',
      gatewayNeedsSetup: 'нужна настройка',
      gatewayUnavailable: 'вывод недоступен',
      gatewayChecking: 'проверка',
      gatewayConnecting: 'подключение',
      gatewayOffline: 'недоступен',
      gatewayRestarting: 'перезапуск…',
      gatewayTitle: 'Шлюз',
      customizeTitle: 'Показывать в статус-баре',
      hideStatusbar: 'Скрыть статус-бар',
      resetStatusbar: 'Сбросить к значениям по умолчанию',
      toggleApprovalMode: 'Подтверждения',
      toggleBackendVersion: 'Версия бэкенда',
      toggleCacheHitRate: 'Попадания в кэш',
      toggleCommandCenter: 'Командный центр',
      toggleContextUsage: 'Шкала контекста',
      toggleRunningTimer: 'Таймер хода',
      toggleSessionTimer: 'Таймер сеанса',
      toggleTerminal: 'Терминал',
      toggleTokensPerSecond: 'Токенов в секунду',
      toggleVersion: 'Версия и обновления',
      toggleFreeTier: 'Бесплатный тариф',
      toggleWorkspace: 'Рабочее пространство',
      cacheHitRateTitle: 'Доля попаданий в кэш промпта за сеанс — кэшированные токены дешевле, чем выше, тем дешевле',
      tokensPerSecondTitle: 'Выходных токенов в секунду, среднее за последние 10 вызовов модели',
      session: 'Сеанс',
      agents: 'Агенты',
      closeAgents: 'Закрыть агентов',
      openAgents: 'Открыть агентов',
      subagents: count => `${count} ${RU_PLURAL(count, 'субагент', 'субагента', 'субагентов')}`,
      failed: count => `${count} ${RU_NOUN(count, 'сбой', 'сбоя', 'сбоев')}`,
      running: count => `${count} ${RU_NOUN(count, 'выполняется', 'выполняются', 'выполняется')}`,
      cron: 'Cron',
      openCron: 'Открыть cron-задачи',
      webhooks: 'Вебхуки',
      openWebhooks: 'Открыть вебхуки',
      starmap: 'Граф памяти',
      openStarmap: 'Открыть граф памяти',
      turnRunning: 'Выполняется',
      contextUsage: 'Использование контекста',
      systemResources: {
        title: 'Системные ресурсы',
        loading: 'Ресурсы…',
        gpuUtilization: 'Использование GPU',
        gpuMemory: 'Память GPU',
        ram: 'RAM',
        unifiedNote: 'Единая память — GPU и система совместно используют этот пул.',
        toggle: 'Системные ресурсы'
      },
      compressions: count => `Сжатий: ${count}`,
      contextUsagePanel: {
        categories: {
          conversation: 'Диалог',
          mcp: 'MCP',
          memory: 'Память',
          rules: 'Правила',
          skills: 'Навыки',
          subagent_definitions: 'Определения субагентов',
          system_prompt: 'Системный промпт',
          tool_definitions: 'Определения инструментов'
        },
        compact: {
          action: 'Сжать диалог',
          busyHint: 'Сначала завершите или остановите текущий ответ',
          confirm: 'Сжать',
          hint: 'Сожмите старый контекст, чтобы освободить место. Разговор продолжится здесь же.',
          question: 'Сжать этот диалог в краткое изложение?',
          questionNamed: title => `Сжать «${title}» в краткое изложение?`,
          working: 'Сжимаю…'
        },
        empty: 'Данных контекста пока нет',
        loading: 'Загрузка разбивки…',
        percentFull: percent => `${percent}% занято`,
        title: 'Использование контекста',
        tokenSummary: (used, max) => `${used} / ${max} токенов`
      },
      focusedSince: 'В фокусе с',
      focusedSinceTitle: 'Время с момента фокуса этого чата — не длительность хода',
      yoloOn: 'YOLO включён — автоматическое подтверждение опасных команд. Shift-клик переключает глобально.',
      yoloOff: 'YOLO выключен. Shift-клик переключает глобально.',
      modelNone: 'нет',
      noModel: 'модель не выбрана',
      switchModel: 'Сменить модель',
      openModelPicker: 'Открыть выбор модели',
      modelPinned: 'закреплено вами; новые чаты используют её вместо модели по умолчанию из настроек',
      modelTitle: (provider, model) => `Модель · ${provider}: ${model}`,
      providerModelTitle: (provider, model) => `${provider} · ${model}`
    }
  },
  rightSidebar: {
    terminalReadOnly: 'Вывод только для чтения',
    terminalReadOnlyHelp:
      'Чтобы ответить на запрос, остановите фоновую команду и запустите её в новом терминале. Он откроет отдельную оболочку и не подключится к этому процессу.',
    terminalOpenInteractive: 'Открыть новый терминал',
    aria: 'Правая боковая панель',
    panelsAria: 'Панели правой боковой панели',
    files: 'Файловая система',
    terminal: 'Терминал',
    noFolderSelected: 'Папка не выбрана',
    changeCwdTitle: 'Изменить рабочий каталог',
    remotePickerTitle: 'Выбрать удалённую папку',
    remotePickerDescription: 'Просмотрите папки на подключённом бэкенде.',
    remotePickerSelect: 'Выбрать папку',
    remotePickerNewFolder: 'Новая папка',
    remotePickerFolderName: 'Имя папки',
    remotePickerCreateFolder: 'Создать папку',
    remotePickerInvalidFolderName: 'Введите одно имя папки без косых черт.',
    remotePickerCreateFolderFailed: error => `Не удалось создать папку (${error}).`,
    folderTip: cwd => cwd,
    openFolder: 'Открыть папку',
    refreshTree: 'Обновить дерево',
    collapseAll: 'Свернуть все папки',
    previewUnavailable: 'Предпросмотр недоступен',
    couldNotPreview: path => `Не удалось предпросмотреть ${path}`,
    noProjectTitle: 'Проект не открыт',
    noProjectBody: 'Откройте проект, чтобы просматривать его файлы и проверять изменения.',
    noProjectOpen: 'Проект не открыт',
    noDiffs: 'Нет изменений',
    unreadableTitle: 'Недоступно',
    unreadableBody: error => `Не удалось прочитать эту папку (${error}).`,
    emptyTitle: 'Пусто',
    emptyBody: 'Эта папка пуста.',
    treeErrorTitle: 'Ошибка дерева',
    treeErrorBody: 'Дерево файлов столкнулось с ошибкой при отображении этой папки.',
    tryAgain: 'Попробовать снова',
    loadingTree: 'Загрузка дерева файлов',
    loadingFiles: 'Загрузка файлов',
    terminalHide: 'Скрыть терминал',
    terminalsAria: 'Терминалы',
    terminalNew: 'Новый терминал',
    terminalCloseOthers: 'Закрыть другие',
    terminalCloseAll: 'Закрыть все',
    terminalNewOn: 'Новый терминал на…',
    terminalGatewayRemoved: 'Удалённый шлюз',
    terminalGatewayRemovedBody:
      'Шлюз, на котором работал этот терминал, удалён, поэтому его нельзя открыть снова. Закройте эту вкладку.',
    terminalGatewayNoShellBody:
      'У этого шлюза нет доступа к оболочке, поэтому терминал нельзя открыть снова. Закройте эту вкладку.',
    terminalDisconnectedBody:
      'Терминал отключён. Нажмите Enter, чтобы запустить новую оболочку; история прокрутки сохранена.',
    addToChat: 'Добавить в чат',
    showIgnored: 'Показать файлы из gitignore',
    hideIgnored: 'Скрыть файлы из gitignore',
    terminalDropUnquotable: (shell, paths) => `Эти имена нельзя безопасно ввести в ${shell}: ${paths}`
  },
  preview: {
    tab: 'Предпросмотр',
    pin: 'Закрепить в рабочем пространстве',
    unpin: 'Открепить от рабочего пространства',
    closePane: 'Закрыть панель предпросмотра',
    loading: 'Загрузка предпросмотра',
    unavailable: 'Предпросмотр недоступен',
    missingTarget: 'Такого пути нет на этом компьютере',
    missingTitle: 'Файл больше не существует',
    missingBody: label =>
      `Файл ${label} удалён или перемещён, либо очищена временная папка, в которой он хранился. Эта вкладка не будет восстановлена при следующем запуске.`,
    opening: 'Открытие...',
    hide: 'Скрыть',
    openPreview: 'Открыть предпросмотр',
    openInBrowser: 'Открыть в браузере',
    openInExternal: 'Открыть во внешнем браузере',
    popIn: 'Вернуть в главное окно',
    popOut: 'Открыть в отдельном окне',
    linkHint: '⌘/Ctrl-клик — панель предпросмотра',
    sourceLineTitle: 'Клик — выбрать · Shift-клик — расширить · перетащите в композер',
    source: 'КОД',
    renderedPreview: 'ПРЕДПРОСМОТР',
    diff: 'DIFF',
    unknownSize: 'размер неизвестен',
    binaryTitle: 'Похоже на бинарный файл',
    binaryBody: label => `Предпросмотр ${label} может показать нечитаемый текст.`,
    largeTitle: 'Этот файл большой',
    largeBody: (label, size) => `${label} — ${size}. Hermes покажет только первые 512 КБ.`,
    previewAnyway: 'Всё равно показать',
    truncated: 'Показаны первые 512 КБ.',
    noInlineTitle: 'Нет встроенного предпросмотра',
    noInlineBody: mimeType => `${mimeType || 'Этот тип файла'} всё равно можно прикрепить как контекст.`,
    edit: 'Изменить',
    editing: 'Редактирование',
    unsavedChanges: 'Несохранённые изменения',
    saveFailed: message => `Не удалось сохранить: ${message}`,
    saveScopeChanged: 'Чтобы сохранить этот черновик, вернитесь к исходному подключению и профилю.',
    diskChangedTitle: 'Файл изменился на диске',
    diskChangedBody:
      'Этот файл изменился с момента открытия. Перезаписать его вашей версией или сбросить правки и перезагрузить?',
    overwrite: 'Перезаписать',
    discardReload: 'Сбросить и перезагрузить',
    console: {
      deselect: 'Отменить выбор записи',
      select: 'Выбрать запись',
      copyFailed: 'Не удалось скопировать вывод консоли',
      copyEntry: 'Скопировать эту запись',
      sendEntry: 'Отправить эту запись в чат',
      messages: count => `${count} ${RU_PLURAL(count, 'сообщение консоли', 'сообщения консоли', 'сообщений консоли')}`,
      resize: 'Изменить размер консоли предпросмотра',
      title: 'Консоль предпросмотра',
      selected: count =>
        `${RU_PLURAL(count, 'Выбрана', 'Выбрано', 'Выбрано')} ${count} ${RU_PLURAL(count, 'запись', 'записи', 'записей')}`,
      sendToChat: 'Отправить в чат',
      copySelected: 'Скопировать выбранное в буфер обмена',
      copyAll: 'Скопировать всё в буфер обмена',
      copy: 'Копировать',
      clear: 'Очистить',
      empty: 'Сообщений консоли пока нет.',
      promptHeader: 'Консоль предпросмотра:',
      sentTitle: 'Отправлено в чат',
      sentMessage: count =>
        `${count} ${RU_PLURAL(count, 'запись журнала', 'записи журнала', 'записей журнала')} ${RU_PLURAL(count, 'добавлена', 'добавлены', 'добавлено')} в композер`
    },
    web: {
      appFailedToBoot: 'Приложение предпросмотра не запустилось',
      serverNotFound: 'Сервер не найден',
      remoteLoopback:
        'Этот адрес указывает на компьютер, на котором работает агент, а не на этот. Панель браузера загружает страницы локально, поэтому удалённому dev-серверу нужен проброс порта или доступное имя хоста.',
      failedToLoad: 'Не удалось загрузить предпросмотр',
      tryAgain: 'Попробовать снова',
      restarting: 'Hermes перезапускает сервер...',
      askRestart: 'Попросить Hermes перезапустить сервер',
      lookingRestart: taskId => `Hermes ищет сервер предпросмотра для перезапуска (${taskId})`,
      restartingTitle: 'Перезапуск сервера предпросмотра',
      restartingMessage: 'Hermes работает в фоне. Следите за прогрессом в консоли предпросмотра.',
      startRestartFailed: message => `Не удалось запустить перезапуск сервера: ${message}`,
      restartFailed: 'Не удалось перезапустить сервер',
      hideConsole: 'Скрыть консоль предпросмотра',
      showConsole: 'Показать консоль предпросмотра',
      hideDevTools: 'Скрыть DevTools предпросмотра',
      openDevTools: 'Открыть DevTools предпросмотра',
      goBack: 'Назад',
      goForward: 'Вперёд',
      reload: 'Перезагрузить страницу',
      address: 'Адрес',
      addressPlaceholder: 'Введите адрес',
      blankPageBody: 'Чтобы начать просмотр, введите адрес выше или попросите Hermes открыть страницу.',
      finishedRestarting: message => `Hermes завершил перезапуск сервера предпросмотра${message ? `: ${message}` : ''}`,
      failedRestarting: message => `Не удалось перезапустить сервер: ${message}`,
      unknownError: 'неизвестная ошибка',
      restartedTitle: 'Сервер предпросмотра перезапущен',
      reloadingNow: 'Перезагружаем предпросмотр.',
      restartFailedTitle: 'Не удалось перезапустить предпросмотр',
      restartFailedMessage: 'Hermes не смог перезапустить сервер.',
      stillWorking:
        'Hermes всё ещё работает, но результата перезапуска пока нет. Возможно, команда сервера выполняется на переднем плане.',
      workspaceReloading: 'Рабочее пространство изменилось, перезагружаем предпросмотр',
      fileChanged: url => `Файл изменился, перезагружаем предпросмотр: ${url}`,
      filesChanged: (count, url) =>
        `${count} ${RU_PLURAL(count, 'изменение', 'изменения', 'изменений')} в файлах, перезагружаем предпросмотр: ${url}`,
      watchFailed: message => `Не удалось отслеживать файл предпросмотра: ${message}`,
      moduleMimeDescription:
        'Модульные скрипты раздаются с неверным MIME-типом. Обычно это значит, что статический файловый сервер раздаёт Vite/React-приложение вместо dev-сервера проекта.',
      loadFailedConsole: (code, message) => `Не удалось загрузить${code ? ` (${code})` : ''}: ${message}`,
      unreachableDescription: 'Страница предпросмотра недоступна.',
      openTarget: url => `Открыть ${url}`,
      fallbackTitle: 'Предпросмотр',
      annotate: 'Комментировать',
      annotateOn: 'Завершить комментирование',
      annotateNeedPage: 'Сначала откройте страницу во встроенном браузере.',
      annotateFailed: 'Не удалось включить режим комментариев',
      commenting: 'Комментирование',
      addComments: count => `Добавить ${count} ${RU_PLURAL(count, 'комментарий', 'комментария', 'комментариев')}`,
      commentPlaceholder: 'Добавьте комментарий...',
      commentTitle: n => `Комментарий ${n}`,
      saveComment: 'Сохранить',
      cancelComment: 'Отменить комментарий',
      embeddedPreviewHint:
        'Некоторые сайты блокируют встроенный предпросмотр. Откройте исходную страницу во вкладке браузера.',
      vaultFill: 'Подставить сохранённый вход',
      vaultTitle: site => `Сохранённые входы для ${site}`,
      vaultLoading: 'Загрузка сохранённых входов…',
      vaultEmpty: 'Для этого сайта нет сохранённого входа',
      vaultUnlock: name => `Разблокировать ${name}`,
      vaultOpenSettings: 'Открыть настройки хранилища учётных данных',
      vaultFilled: label => `${label}: данные подставлены. Проверьте форму и войдите.`,
      vaultFillFailed: 'Не удалось подставить вход',
      vaultLoadFailed: 'Не удалось загрузить сохранённые входы',
      vaultPageNotReady: 'Страница ещё загружается. Повторите, когда загрузка завершится.'
    }
  },
  interfaceMode: {
    title: 'Режим интерфейса',
    hint: 'Меняет то, что показано, а не то, что умеет Hermes.',
    sessionNote:
      'Задано простым режимом. Изменение здесь действует до конца сеанса; чтобы сохранить его насовсем, переключитесь в расширенный режим.',
    simple: {
      label: 'Простой',
      description: 'Для общения с Hermes. Боковая панель и чат; без терминала, файлов и панелей diff.'
    },
    advanced: {
      label: 'Расширенный',
      description: 'Для разработчиков. Терминал, файлы, diff, строка состояния и раскладки — как вы их настроили.'
    }
  },
  zones: {
    toggleLayoutEditMode: 'Включить / выключить редактирование раскладки',
    showTabStrip: 'Показать вкладки',
    hideTabStrip: 'Скрыть вкладки',
    showStripTab: title => `Показать ${title}`,
    hideStripTab: title => `Скрыть ${title}`,
    zoneMenuLabel: title => `Параметры зоны для ${title}`,
    lastTabKeptTitle: 'Последняя вкладка остаётся',
    lastTabKeptBody:
      'В этой зоне нужна хотя бы одна видимая вкладка. Сначала покажите другую вкладку или сверните всю боковую панель.',
    toggleStripTab: title => `Переключить вкладку ${title}`,
    minimize: 'Свернуть',
    restore: 'Восстановить',
    closeRunningTitle: 'Закрыть работающую вкладку?',
    closeRunningBody:
      'Этот чат ещё работает (или ждёт вашего ввода). Закрытие вкладки скроет его — сеанс сохранит прогресс и можно будет открыть снова из боковой панели.',
    closeRunningConfirm: 'Закрыть вкладку',
    reload: 'Перезагрузить',
    closeOthers: 'Закрыть другие',
    closeToRight: 'Закрыть справа',
    closeAll: 'Закрыть все',
    newSessionTab: 'Вкладка нового сеанса',
    newTab: 'Новая вкладка',
    pluginDisabled: pluginId => `Плагин «${pluginId}» отключён`,
    pluginDisabledBody: 'Включите его снова в Возможности → Плагины, чтобы вернуть панель.',
    missingPane: paneId => `нет панели: ${paneId}`,
    editTitle: 'Раскладки',
    editHint: 'Выберите раскладку или перетащите панели между зонами.',
    reset: 'Сбросить',
    templates: 'Шаблоны',
    custom: 'Свои',
    newGridLayout: 'Новая сеточная раскладка',
    saveCurrentAs: 'Сохранить текущую расстановку как шаблон',
    nameLayoutPlaceholder: 'Название этой раскладки…',
    deletePreset: name => `Удалить ${name}`,
    zoneEditorTitle: 'Редактор зон',
    editorHintPre: 'клик — разделить · ',
    editorHintPost:
      ' переворачивает линию · перетаскивание между зонами — слить · перетаскивание общих граней — изменить размер',
    templateColumns: 'Колонки',
    templateRows: 'Строки',
    templateGrid: 'Сетка',
    templatePriority: 'Приоритет',
    zoneTag: index => `зона ${index}`,
    mergeZones: count => `Слить ${count} ${RU_NOUN(count, 'зона', 'зоны', 'зон')}`,
    customZoneName: count => `Своя ${count}-зонная`,
    layoutNamePlaceholder: fallback => `Название раскладки (${fallback})`,
    saveApply: 'Сохранить и применить',
    notExpressible: 'эта расстановка зацеплена (pinwheel) — пока не выразима как вложенные разделения',
    zoneCount: count => `${count} ${RU_NOUN(count, 'зона', 'зоны', 'зон')}`,
    tabCount: count => `${count} ${RU_NOUN(count, 'вкладка', 'вкладки', 'вкладок')}`,
    layoutNames: {
      default: 'По умолчанию',
      focus: 'Фокус',
      'terminal-deck': 'Терминальная панель',
      quad: 'Четыре панели'
    },
    tabActions: title => `Действия: ${title}`
  },
  contextMenu: {
    link: {
      openInApp: 'Открыть во встроенном браузере',
      openExternal: 'Открыть во внешнем браузере',
      copyUrl: 'Копировать URL',
      copyResolvedUrl: 'Копировать разрешённый URL'
    },
    image: {
      copyImage: 'Копировать изображение',
      copyImageAddress: 'Копировать адрес изображения',
      saveImageAs: 'Сохранить изображение как…'
    },
    edit: {
      cut: 'Вырезать',
      paste: 'Вставить',
      selectAll: 'Выделить всё',
      addToDictionary: 'Добавить в словарь'
    },
    page: {
      copyPageUrl: 'Копировать URL страницы',
      inspectElement: 'Исследовать элемент'
    }
  },
  assistant: {
    media: {
      gatewayFetchFailed: name =>
        `Не удалось получить «${name}» от шлюза (файл отсутствует, не читается или слишком велик).`,
      openMediaFile: kind => (kind === 'audio' ? 'Открыть аудиофайл' : 'Открыть видеофайл'),
      openNamed: name => `Открыть «${name}»`,
      loadingNamed: name => `Загрузка «${name}»…`,
      couldNotLoad: name => `Не удалось загрузить «${name}».`,
      openImage: 'Открыть изображение',
      imageFallbackName: 'изображение'
    },
    embeds: {
      load: label => `Загрузить ${label}`,
      alwaysAllow: label => `Всегда разрешать ${label}`,
      holdToZoom: 'Удерживайте Ctrl/⌘ для масштабирования',
      failedToLoad: label => `Не удалось загрузить встроенный контент ${label}`,
      openDiagram: 'Открыть диаграмму',
      embedTitle: label => `Встроенный контент ${label}`
    },
    thread: {
      errorSwitchToModel: (model: string, note?: string) =>
        note ? `Переключиться на ${model} (${note})` : `Переключиться на ${model}`,
      errorSwitchModelFailed: 'Не удалось переключить модель',
      errorUseCredits: 'Включить «Продолжать за кредиты»',
      errorUseCreditsFailed: 'Не удалось включить «Продолжать за кредиты»',
      errorAddCredits: 'Пополнить кредиты',
      errorOpenBillingSettings: 'Открыть настройки оплаты',
      loadingSession: 'Загрузка сеанса',
      openSessionFailed: 'Не удалось открыть этот сеанс',
      showEarlier: 'Показать более ранние сообщения',
      loadingResponse: 'Hermes загружает ответ',
      steered: 'уточнение',
      asyncDelegationFailure: detail => `(ошибка: ${detail})`,
      asyncDelegationPartialOutput: 'Частичный вывод:',
      messagingAgent: name => `Отправка сообщения агенту ${name}…`,
      messagedAgent: name => `Сообщение отправлено агенту ${name}`,
      messageFrom: name => `Сообщение от агента ${name}`,
      showMessage: 'показать сообщение',
      repliedTo: name => `Ответ агенту ${name}`,
      showReply: 'показать ответ',
      processOutput: 'вывод',
      emojiSearch: 'Поиск…',
      emojiLoading: 'Загрузка эмодзи…',
      emojiEmpty: 'Эмодзи не найдены.',
      moreEmoji: 'Другие эмодзи',
      removeReaction: emoji => `Убрать реакцию ${emoji}`,
      reactedByHermes: 'Реакция от Hermes',
      conversationTimeline: 'Хронология разговора',
      reviewSummary: {
        label: 'Обзор самосовершенствования',
        memoryUpdated: 'Память обновлена',
        memoryCreated: 'Создана запись в памяти',
        userProfileUpdated: 'Профиль пользователя обновлён',
        skillCreated: 'Навык создан',
        skillNamedCreated: (name, detail) => `Навык «${name}» создан${detail ? `: ${detail}` : ''}`,
        skillNamedPatched: (name, detail) => `Навык «${name}» изменён${detail ? `: ${detail}` : ''}`,
        skillNamedRewritten: (name, detail) => `Навык «${name}» переписан${detail ? `: ${detail}` : ''}`,
        memoryLabel: 'Память',
        userProfileLabel: 'Профиль пользователя'
      },
      operationInterrupted: 'Операция прервана.',
      operationInterruptedDuringRetry: (reason, attempt, maxAttempts) =>
        `Операция прервана во время повторной попытки (${reason}, попытка ${attempt}/${maxAttempts}).`,
      operationInterruptedHandlingApiError: (errorType, detail) =>
        `Операция прервана: обработка ошибки API (${errorType}: ${detail}).`,
      operationInterruptedRetryingApiCall: (retry, maxRetries) =>
        `Операция прервана: повторный вызов API после ошибки (повтор ${retry}/${maxRetries}).`,
      operationInterruptedRetryingEmptyResponse: (retry, maxRetries) =>
        `Операция прервана: повторный запрос после пустого ответа модели (повтор ${retry}/${maxRetries}).`,
      operationInterruptedRetryReasons: {
        fastResponseLikelyRateLimited: durationSeconds =>
          `быстрый ответ (${durationSeconds} с) — вероятно, сработал лимит запросов`,
        rateLimited: 'вышестоящий провайдер ограничил запросы (429)',
        responseTime: durationSeconds => `время ответа ${durationSeconds} с`,
        slowResponseLikelyUpstreamTimeout: durationSeconds =>
          `медленный ответ (${durationSeconds} с) — вероятно, тайм-аут вышестоящего сервиса`,
        upstreamError: (code, durationSeconds) => `ошибка вышестоящего сервиса (код ${code}, ${durationSeconds} с)`,
        upstreamGatewayTimedOut: durationSeconds => `тайм-аут вышестоящего шлюза (504, ${durationSeconds} с)`,
        upstreamProviderOverloaded: code => `вышестоящий провайдер перегружен (${code})`,
        upstreamProviderTimedOut: durationSeconds =>
          `истекло время ожидания вышестоящего провайдера (Cloudflare 524, ${durationSeconds} с)`,
        upstreamServerError: (code, durationSeconds) => `ошибка вышестоящего сервера (${code}, ${durationSeconds} с)`
      },
      operationInterruptedWaitingForModel: elapsedSeconds =>
        `Операция прервана: ожидание ответа модели (прошло ${elapsedSeconds} с).`,
      ...ruProviderWait,
      summarizingThread: 'Составление сводки разговора',
      moaAggregating: 'MoA: агрегация ответов…',
      moaReference: (label, index, count) =>
        `Референс${index && count ? ` ${index}/${count}` : ''}${label ? ` — ${label}` : ''}`,
      moaReferencesProgress: (done, total, label) => `MoA: референсы ${done}/${total}${label ? ` — ${label}` : ''}`,
      loadingLocalModel: model => `Загрузка модели ${model} в память`,
      processingPrompt: 'Обработка промпта',
      resumeWhenBackgroundDone: count =>
        `Продолжится, когда ${RU_PLURAL(count, 'завершится', 'завершатся', 'завершатся')} ${count} ${RU_PLURAL(count, 'фоновая задача', 'фоновые задачи', 'фоновых задач')}`,
      thinking: 'Думает',
      thought: 'Подумал',
      thoughtBriefly: 'Кратко подумал',
      thoughtFor: duration => `Думал ${duration}`,
      turnDuration: duration => `Этот ход занял ${duration}`,
      today: time => `Сегодня, ${time}`,
      yesterday: time => `Вчера, ${time}`,
      copy: 'Копировать',
      refresh: 'Обновить',
      moreActions: 'Ещё действия',
      branchNewChat: 'Ответвить в новый чат',
      react: 'Добавить реакцию',
      dismissError: 'Скрыть ошибку',
      responseStopped: 'Ответ остановлен',
      errorLayers: {
        auth: 'Проблема со входом',
        billing: 'Закончились кредиты',
        disk: 'Диск заполнен',
        endpoint: 'Не удаётся связаться с сервером модели',
        gateway: 'Не удалось отправить сообщение',
        generic: 'Hermes не смог закончить этот ответ',
        provider: 'ИИ-сервис вернул ошибку',
        runtime: 'Hermes столкнулся с проблемой',
        streaming: 'Ответ был прерван'
      },
      errorRetry: 'Повторить попытку',
      errorStartNewSession: 'Начать новый сеанс',
      errorSwitchProvider: 'Сменить провайдера',
      errorSignInAgain: provider => `Войти в ${provider} снова`,
      errorOauthExpired: provider =>
        `Срок действия входа в ${provider} истёк, или вход был отозван. Войдите снова, чтобы продолжить разговор.`,
      errorOpenLogs: 'Открыть журналы',
      errorOpenLogsFailed: 'Не удалось открыть папку журналов',
      errorOpenDesktopLogs: 'Открыть журналы приложения',
      errorCopyDiagnostics: 'Скопировать сведения об ошибке',
      errorSendDiagnostics: 'Отправить диагностику',
      filesChanged: count => `${count} ${RU_PLURAL(count, 'файл изменён', 'файла изменено', 'файлов изменено')}`,
      reviewChanges: 'Проверить',
      readAloudFailed: 'Не удалось зачитать вслух',
      preparingAudio: 'Подготовка аудио...',
      stopReading: 'Остановить чтение',
      readAloud: 'Зачитать вслух',
      copyFullResponse: 'Копировать весь ответ',
      readAloudFullResponseHint: 'Shift+клик: прочитать весь ответ',
      contentRefusedNotice: 'Это сообщение отклонено фильтром безопасности модели — попробуйте другой запрос.',
      editMessage: 'Изменить сообщение',
      expandMessage: 'Развернуть сообщение',
      scrollToBottom: 'Прокрутить вниз',
      stop: 'Стоп',
      restorePrevious: 'Восстановить предыдущую контрольную точку',
      restoreCheckpoint: 'Восстановить контрольную точку',
      restoreFromHere: 'Восстановить контрольную точку — перезапустить с этого промпта',
      restoreFailed: 'Не удалось восстановить',
      restoreTitle: 'Вернуться к этой контрольной точке?',
      restoreBody: 'Всё, что было после этого промпта, будет удалено из разговора, и промпт запустится снова отсюда.',
      restoreConfirm: 'Восстановить и перезапустить',
      restoreNext: 'Восстановить следующую контрольную точку',
      goForward: 'Вперёд',
      sendEdited: 'Отправить изменённое сообщение',
      attachingFile: 'Прикрепление…',
      errorLayerBodies: {
        auth: 'ИИ-сервис отклонил вход. Проверьте учётные данные этого провайдера и отправьте сообщение ещё раз.',
        billing:
          'На аккаунте не осталось кредитов для этого провайдера. Пополните баланс или смените провайдера, затем отправьте сообщение ещё раз.',
        disk: 'Диск заполнен, поэтому Hermes не смог сохранить этот разговор. Освободите место и повторите попытку.',
        endpoint:
          'Hermes не может связаться с вашим сервером модели. Убедитесь, что он запущен, и отправьте сообщение ещё раз.',
        gateway:
          'Hermes столкнулся с внутренней проблемой при запуске этого ответа. Отправьте сообщение ещё раз; если ошибка повторится, отправьте диагностику.',
        generic:
          'Во время ответа Hermes что-то пошло не так. Повторите попытку, а если ошибка повторится, скопируйте подробности.',
        provider: 'ИИ-сервис не смог выполнить этот запрос. Повторите попытку чуть позже или смените провайдера.',
        runtime:
          'Hermes столкнулся с внутренней проблемой при запуске этого ответа. Отправьте сообщение ещё раз; если ошибка повторится, отправьте диагностику.',
        streaming: 'Соединение прервалось до завершения ответа. Повторите попытку, чтобы отправить сообщение ещё раз.'
      },
      errorCodes: {
        auth: {
          title: provider => `${provider} отклонил ваш API-ключ`,
          body: () => 'Сохранённый ключ недействителен или был отозван. Обновите его и отправьте сообщение ещё раз.'
        },
        auth_permanent: {
          title: provider => `${provider} отклонил ваш API-ключ`,
          body: () => 'Сохранённый ключ недействителен или был отозван. Обновите его и отправьте сообщение ещё раз.'
        },
        billing: {
          title: provider => `${provider}: закончились кредиты`,
          body: provider => `Пополните кредиты, чтобы и дальше пользоваться платными моделями в ${provider}.`
        },
        rate_limit: {
          title: provider => `${provider} сейчас занят`,
          body: provider => `Вы достигли лимита запросов ${provider}. Подождите немного и повторите попытку.`
        },
        upstream_rate_limit: {
          title: (_provider, model) => `${model ? `Модель ${model}` : 'Эта модель'} сейчас занята`,
          body: (provider, model) =>
            `Лимит запросов для ${model ? `модели ${model}` : 'этой модели'} исчерпан у провайдера, стоящего за ${provider}, а не в вашем аккаунте. Повторите попытку чуть позже.`
        },
        overloaded: {
          title: provider => `${provider} сейчас занят`,
          body: provider => `${provider} перегружен и не смог принять этот запрос. Повторите попытку чуть позже.`
        },
        server_error: {
          title: provider => `У сервиса ${provider} неполадки`,
          body: provider => `${provider} вернул ошибку сервера. Повторите попытку чуть позже.`
        },
        timeout: {
          title: provider => `Не удаётся связаться с ${provider}`,
          body: provider => `Hermes не смог связаться с ${provider}. Проверьте подключение к сети и повторите попытку.`
        },
        stream_drop: {
          title: 'Ответ был прерван',
          body: 'Соединение прервалось до завершения ответа. Повторите попытку, чтобы отправить сообщение ещё раз.'
        },
        no_reply: {
          title: 'Ответ не пришёл',
          body: 'Hermes завершил этот ход, но ответ не дошёл до этого окна. Повторите попытку, чтобы отправить сообщение ещё раз.'
        },
        upstream_blocked: {
          title: provider => `${provider} заблокировал этот запрос`,
          body: provider =>
            `Брандмауэр перед ${provider} отклонил запрос, прежде чем тот дошёл до модели. Смените провайдера или задайте для него собственный User-Agent.`
        },
        ssl_cert_verification: {
          title: provider => `Не удаётся проверить соединение с ${provider}`,
          body: provider =>
            `Прокси или устаревшее хранилище сертификатов заблокировало безопасное соединение с ${provider}. В руководстве по настройке показано, как это исправить.`
        },
        context_overflow: {
          title: 'Этот разговор слишком длинный',
          body: (_provider, model) =>
            `Разговор больше не помещается в контекстное окно ${model ? `модели ${model}` : 'модели'}. Сожмите его, чтобы продолжить.`
        },
        payload_too_large: {
          title: 'Это сообщение слишком велико',
          body: provider =>
            `Запрос вместе с вложениями превышает ограничение ${provider} на размер. Сожмите разговор или удалите вложения.`
        },
        model_not_found: {
          title: (_provider, model) => `${model ? `Модель ${model}` : 'Эта модель'} недоступна`,
          body: (provider, model) =>
            `${provider} не предоставляет ${model ? `модель ${model}` : 'эту модель'} для вашего аккаунта. Выберите другую модель.`
        },
        provider_policy_blocked: {
          title: (provider, model) => `Настройки ${provider} блокируют ${model ? `модель ${model}` : 'эту модель'}`,
          body: provider =>
            `Настройки конфиденциальности ${provider} исключают все эндпоинты для этой модели. Измените их в ${provider} или выберите другую модель.`
        },
        content_policy_blocked: {
          title: provider => `${provider} отклонил это сообщение`,
          body: provider => `Фильтр безопасности ${provider} отклонил сообщение. Измените его и отправьте ещё раз.`
        },
        format_error: {
          title: provider => `${provider} отклонил этот запрос`,
          body: provider =>
            `${provider} не принял структуру этого разговора. Смените провайдера или начните новый чат, если это повторяется.`
        },
        truncated: {
          title: 'Ответ оборвался',
          body: (_provider, model) =>
            `${model ? `Модель ${model}` : 'Модель'} остановилась, не закончив ответ. Нажмите «Продолжить», чтобы возобновить ответ с места остановки.`
        },
        invalid_response: {
          title: 'Не удалось прочитать ответ',
          body: provider => `${provider} вернул пустой или повреждённый ответ. Повторите попытку чуть позже.`
        },
        empty_response: {
          title: 'Не удалось получить ответ',
          body: provider => `${provider} ничего не вернул на это сообщение. Повторите попытку чуть позже.`
        },
        loop_error: {
          title: 'Hermes не смог завершить этот шаг',
          body: 'При обработке ответа что-то пошло не так. Повторите попытку; если ошибка повторится, отправьте диагностику из подробностей.'
        },
        SESSION_OWNER_BUSY: {
          title: 'Hermes занят в этом чате',
          body: 'Здесь уже выполняется другой ход, и ваше сообщение не удалось поставить в его очередь. Ничего не отправлено. Повторите попытку, когда этот ход завершится.'
        },
        SESSION_OWNER_UNCONFIRMED: {
          title: 'Возможно, ваше сообщение уже в очереди',
          body: 'Шлюз вовремя не подтвердил ваше сообщение. Если оно попало в очередь, оно выполнится, когда предыдущий ход завершится или будет разрешён. Проверьте чат, прежде чем отправлять сообщение снова.'
        },
        SESSION_NOT_OWNED: {
          title: 'Чат открыт в другом месте',
          body: 'Этот чат открыт в другом окне Hermes или в терминале. Начните новый чат здесь или сначала закройте его там.'
        },
        disk_full: {
          title: 'Диск заполнен',
          body: 'Hermes не смог сохранить этот разговор. Освободите место и повторите попытку.'
        },
        free_tier_disabled: {
          title: 'Войдите, чтобы продолжить общение',
          body: 'Войдите с аккаунтом Nous, чтобы продолжить общение. Это бесплатно.'
        },
        free_tier_rate_limited: {
          title: 'Бесплатный лимит исчерпан',
          body: 'Лимит скоро обновится. Войдите с аккаунтом Nous, чтобы получить больший лимит. Это бесплатно.'
        },
        free_tier_at_capacity: {
          title: 'Бесплатный тариф перегружен',
          body: 'Войдите, чтобы не ждать в очереди (это бесплатно), или попробуйте чуть позже.'
        },
        free_tier_model_not_free: {
          title: 'Для этой модели нужно войти',
          body: 'Пока Hermes использует бесплатную модель. Войдите с аккаунтом Nous, чтобы получить доступ к другим моделям. Это бесплатно.'
        },
        free_tier_route: {
          title: 'Не удаётся связаться с бесплатной моделью',
          body: 'Войдите с аккаунтом Nous (это бесплатно) или проверьте настройку NOUS_INFERENCE_BASE_URL.'
        },
        free_tier_outage: {
          title: 'Бесплатная модель работает со сбоями',
          body: 'Попробуйте отправить сообщение ещё раз через минуту.'
        },
        free_tier_refused: {
          title: 'Войдите, чтобы продолжить общение',
          body: 'Вход с аккаунтом Nous бесплатный.'
        },
        cron_session_read_only: {
          title: 'Этот чат относится к запланированной задаче',
          body: 'Он только выполняет эту задачу, поэтому ваше сообщение не было выполнено. Начните новый чат, чтобы отправить его.'
        },
        workspace_unavailable: {
          title: 'Папка этого чата пропала',
          body: 'Папка, в которой работает этот чат, была перемещена или удалена, поэтому ваше сообщение не было выполнено. Создайте папку заново или назначьте чату другую через «Переместить в проект», затем повторите попытку.'
        },
        usage_window: {
          title: 'Включённый объём исчерпан',
          body: 'Включённый объём вашего плана исчерпан до сброса. Пополните кредиты в /topup, чтобы продолжить.'
        },
        agent_init_failed: {
          title: 'Не удалось начать этот чат',
          body: provider =>
            `Hermes не смог подключиться к ${provider} для этого чата. Повторите попытку; если ошибка повторится, проверьте провайдера в настройках.`
        },
        launch_credentials_unavailable: {
          title: 'API-ключ этого чата изменился',
          body: 'Этот чат был начат с API-ключом, который с тех пор изменили или удалили, поэтому ваше сообщение не отправлено. Открытый чат никогда сам не переключается на другой ключ. Начните новый сеанс, чтобы использовать текущий ключ.'
        },
        local_runtime_unavailable: {
          title: 'Не удаётся связаться с локальным сервером моделей',
          body: 'Локальный сервер моделей ещё не работает: возможно, он ещё запускается. Повторите попытку через минуту или переключитесь на другую модель.',
          bodyNoRetry:
            'Локальный сервер моделей выключен. Запустите его в приложении Hermes Desktop или командой `hermes model` в терминале, либо переключитесь на другую модель.'
        },
        session_read_only: {
          title: 'Этот чат только для чтения',
          body: 'Это сохранённая история, которую Hermes может показать, но не может продолжить, поэтому ваше сообщение не было выполнено. Начните новый чат, чтобы отправить его.'
        }
      },
      errorAuthKinds: {
        api_key: {
          title: provider => `${provider} отклонил ваш API-ключ`,
          body: provider =>
            `Ключ, сохранённый для ${provider}, недействителен или был отозван. Обновите его, затем попробуйте снова.`
        },
        oauth: {
          title: provider => `Срок действия вашего входа в ${provider} истёк`
        }
      },
      errorDetails: 'Показать подробности ошибки',
      errorGenericProvider: 'ИИ-сервис',
      errorToastTitle: 'Hermes не смог закончить ответ',
      errorLimitResets: time => `Лимит сбросится в ${time}`,
      errorRetryAtReset: time => `Повторите попытку, когда лимит будет сброшен (${time})`,
      errorRetryScheduled: (time, wait) => `Повтор в ${time} — через ${wait}`,
      errorRetryScheduledCancel: 'Отмена',
      errorChooseModel: 'Выбрать модель',
      errorCompressConversation: 'Сжать разговор',
      errorCompressFailed: 'Не удалось сжать разговор',
      errorOpenHermesFolder: 'Открыть папку Hermes',
      errorOpenHermesFolderFailed: 'Не удалось открыть папку Hermes',
      errorUpdateApiKey: 'Обновить API-ключ',
      errorSignInFreeTier: 'Войти с аккаунтом Nous',
      errorRateLimitResetBody: (provider, time) => `Вы достигли лимита запросов ${provider}. Он сбросится в ${time}.`,
      errorRetryAtResetShort: time => `Повторить в ${time}`,
      errorChooseModelLink: 'Выбрать другую модель',
      errorStartNewChatLink: 'Начать новый чат',
      errorOpenModelSettings: 'Открыть настройки модели',
      errorSetupGuideLink: 'Руководство по настройке',
      errorOpenSetupGuide: 'Открыть руководство по настройке',
      errorOpenProviderSettings: provider => `Открыть настройки ${provider}`,
      errorContinue: 'Продолжить',
      errorCopyRaw: 'Копировать ошибку',
      errorDetailsCopy: 'Копировать подробности',
      errorHideDetails: 'Скрыть подробности ошибки'
    },
    approval: {
      gatewayDisconnected:
        'Hermes сейчас недоступен. Команда всё ещё ждёт вашего ответа (до истечения тайм-аута подтверждения). Переподключитесь и отправьте ответ ещё раз.',
      sendFailed: 'Не удалось отправить ответ',
      run: 'Выполнить',
      command: 'Команда',
      commandDetails: 'Подробности команды',
      moreOptions: 'Другие варианты подтверждения',
      allowSession: 'Разрешить в этом сеансе',
      alwaysAllowMenu: 'Всегда разрешать…',
      jumpToApproval: 'Нужно подтверждение',
      reject: 'Отклонить',
      alwaysTitle: 'Всегда разрешать эту команду?',
      alwaysDescription: pattern =>
        `Это добавит паттерн «${pattern}» в ваш постоянный список разрешений (~/.hermes/config.yaml). Hermes больше не будет спрашивать о подобных командах — ни в этом сеансе, ни в будущем.`,
      alwaysAllow: 'Всегда разрешать',
      reconnect: 'Переподключиться',
      timedOutSystemLine:
        'Время на подтверждение истекло — команда не выполнена. Попросите Hermes попробовать снова или увеличьте лимит в разделе Настройки → Безопасность → Тайм-аут подтверждения.',
      openSafetySettings: 'Открыть настройки безопасности'
    },
    clarify: ruClarify,
    themePicker: ruThemePicker,
    catalogInstall: {
      preparing: 'Подготовка установки…',
      install: 'Установить',
      advanced: 'Дополнительно',
      skip: 'Пропустить',
      installing: 'Установка…',
      installed: 'Установлено',
      notInstalled: 'Не установлено',
      failed: 'Ошибка',
      showNames: 'показать имена',
      hideNames: 'скрыть имена',
      skill: name => `навык ${name}`,
      kind: { plugin: 'плагин', skill: 'навык' },
      tier: { official: 'официальный', verified: 'проверенный', community: 'сообщество' },
      targetProfile: profile => `Устанавливается в профиль ${profile}`,
      sendFailed: 'Не удалось отправить ответ. Попробуйте ещё раз.',
      commitLabel: 'Коммит',
      subdirLabel: 'Папка',
      securityHeading: 'Безопасность',
      scan: { passed: 'Проверка пройдена', warnings: 'Проверка нашла предупреждения', failed: 'Проверка не пройдена' },
      requirementsLabel: 'Требования',
      requiresHermes: range => `Hermes ${range}`,
      envVar: name => `Переменная окружения ${name}`,
      credentialsHeading: 'Учётные данные',
      phase: {
        downloading: 'Скачивание…',
        python_packages: 'Установка пакетов Python…',
        loading_tools: 'Загрузка инструментов…'
      },
      serverNotConnected: (server, reason) => `MCP-сервер ${server} не подключён${reason ? `: ${reason}` : ''}`,
      notEnabled: 'Установлено, но не включено',
      missingEnv: names => `Задайте ${names}, чтобы завершить настройку`,
      alreadyInstalled: 'Уже установлено; оставлено как есть'
    },
    mcpSetup: {
      installTitle: 'Добавить MCP-серверы',
      enableTitle: 'Включить MCP-серверы',
      authorizeTitle: 'Авторизовать MCP-серверы',
      installAction: 'Установить',
      enableAction: 'Включить',
      authorizeAction: 'Авторизовать',
      installed: server => `${server} установлен`,
      enabled: server => `${server} включён`,
      authorized: server => `${server} авторизован`,
      failed: server => `Не удалось настроить ${server}`,
      toolCount: count => `${count} ${RU_NOUN(count, 'инструмент', 'инструмента', 'инструментов')}`,
      launchCommand: target => `Запускает: ${target}`,
      launchRemote: target => `Подключается к: ${target}`,
      launchEnv: keys => `Окружение: ${keys}`,
      launchCwd: dir => `Рабочая папка: ${dir}`,
      envRequired: 'Сначала заполните обязательные учётные данные',
      sendFailed: 'Не удалось отправить ответ на настройку MCP',
      reloadFailed: 'Сервер сохранён, но перезагрузка MCP-инструментов не удалась — они загрузятся в следующем сеансе',
      gatewayDisconnected: 'Hermes сейчас недоступен. Переподключитесь и отправьте ещё раз.'
    },
    tool: {
      copyCode: 'Копировать код',
      renderingImage: 'Рендеринг изображения',
      copyOutput: 'Копировать вывод',
      copyCommand: 'Копировать команду',
      copyContent: 'Копировать содержимое',
      copyUrl: 'Копировать URL',
      copyResults: 'Копировать результаты',
      copyQuery: 'Копировать запрос',
      copyFile: 'Копировать файл',
      copyPath: 'Копировать путь',
      outputAlt: 'Вывод инструмента',
      rawResponse: 'Сырой ответ',
      copyActivity: 'Копировать активность',
      toolPayload: 'Данные вызова инструмента',
      searchResults: 'Результаты поиска',
      recoveredOne: 'Восстановлено после 1 неудачного шага',
      recoveredMany: count =>
        `Восстановлено после ${count} ${RU_NOUN(count, 'неудачного шага', 'неудачных шагов', 'неудачных шагов')}`,
      failedOne: '1 шаг не удался',
      failedMany: count => `${count} ${RU_NOUN(count, 'шаг не удался', 'шага не удалось', 'шагов не удалось')}`,
      statusRunning: 'Выполняется',
      statusError: 'Ошибка',
      statusRecovered: 'Восстановлено',
      statusDone: 'Готово',
      memoryWriteNoted: 'Запрос на запись в память учтён',
      failedToWriteFile: detail => `Не удалось записать файл: ${detail}`,
      sensitiveSystemPathWriteRefused: path =>
        `Отказано в записи в защищённый системный путь: ${path}\nЕсли нужно изменить системные файлы, используйте инструмент terminal с sudo.`,
      returnedError: 'Инструмент вернул ошибку.',
      returnedSuccessFalse: 'Инструмент вернул success=false.',
      returnedStatus: status => `Инструмент вернул статус «${status}».`,
      commandFailedWithExitCode: exitCode => `Команда завершилась с кодом выхода ${exitCode}.`,
      sessionKernelTimedOut: (timeoutSeconds, remote) =>
        `Время выполнения ячейки истекло через ${timeoutSeconds} с; ${remote ? 'удалённое ' : ''}ядро сеанса остановлено, его состояние потеряно. Следующий вызов execute_code запустит новое ядро.`,
      clarifyErrors: {
        questionsMustBeArray: 'Параметр questions должен быть массивом объектов-вопросов.',
        questionsLimit: limit =>
          `Параметр questions поддерживает не более ${limit} ${RU_PLURAL(limit, 'элемента', 'элементов', 'элементов')}.`,
        questionMustBeObject: index => `Элемент questions[${index}] должен быть объектом с полем question.`,
        questionMustNotBeEmpty: index => `Поле questions[${index}].question должно содержать непустой текст.`,
        choicesMustBeArray: field => `Поле ${field} должно быть массивом.`,
        choicesMustBeStringArray: 'Параметр choices должен быть массивом строк.',
        noQuestion:
          'Вопрос не задан. Добавьте в questions хотя бы один объект с полем question; поля choices и multi_select необязательны.',
        unavailable: 'Инструмент уточнения недоступен в этом контексте.',
        inputFailed: detail => `Не удалось получить ввод пользователя: ${detail}`
      },
      countLabel: (count, _noun, displayNoun) => `${count} ${displayNoun}`,
      runSummary: {
        analyze: {
          count: (count, live) =>
            live
              ? `Анализирую ${count} ${RU_PLURAL(count, 'изображение', 'изображения', 'изображений')}`
              : `Проанализировано ${count} ${RU_PLURAL(count, 'изображение', 'изображения', 'изображений')}`,
          present: 'Анализирую',
          target: (target, live) => (live ? `Анализирую ${target}` : `Проанализировано: ${target}`)
        },
        browse: {
          count: (count, live) =>
            live
              ? `Открываю ${count} ${RU_PLURAL(count, 'страницу', 'страницы', 'страниц')}`
              : `${RU_PLURAL(count, 'Открыта', 'Открыто', 'Открыто')} ${count} ${RU_PLURAL(count, 'страница', 'страницы', 'страниц')}`,
          present: 'Открываю',
          target: (target, live) => (live ? `Открываю ${target}` : `Открыт ${target}`)
        },
        delegate: {
          count: (count, live) =>
            live
              ? `Делегирую ${count} ${RU_PLURAL(count, 'задачу', 'задачи', 'задач')}`
              : `${RU_PLURAL(count, 'Делегирована', 'Делегировано', 'Делегировано')} ${count} ${RU_PLURAL(count, 'задача', 'задачи', 'задач')}`,
          present: 'Делегирую',
          target: (target, live) => (live ? `Делегирую ${target}` : `Делегировано: ${target}`)
        },
        edit: {
          count: (count, live) =>
            live
              ? `Изменяю ${count} ${RU_PLURAL(count, 'файл', 'файла', 'файлов')}`
              : `${RU_PLURAL(count, 'Изменён', 'Изменено', 'Изменено')} ${count} ${RU_PLURAL(count, 'файл', 'файла', 'файлов')}`,
          present: 'Изменяю',
          target: (target, live) => (live ? `Изменяю ${target}` : `Изменён ${target}`)
        },
        explore: {
          count: (count, live) =>
            live
              ? `Просматриваю ${count} ${RU_PLURAL(count, 'файл', 'файла', 'файлов')}`
              : `${RU_PLURAL(count, 'Просмотрен', 'Просмотрено', 'Просмотрено')} ${count} ${RU_PLURAL(count, 'файл', 'файла', 'файлов')}`,
          present: 'Просматриваю',
          target: (target, live) => (live ? `Просматриваю ${target}` : `Просмотрен ${target}`)
        },
        interact: {
          count: (count, live) =>
            live
              ? `Выполняю ${count} ${RU_PLURAL(count, 'действие', 'действия', 'действий')} в браузере`
              : `Выполнено ${count} ${RU_PLURAL(count, 'действие', 'действия', 'действий')} в браузере`,
          present: 'Работаю в браузере',
          target: (target, live) => (live ? `Выполняю ${target}` : `Выполнено: ${target}`)
        },
        other: {
          count: (count, live) =>
            live
              ? `Использую ${count} ${RU_PLURAL(count, 'инструмент', 'инструмента', 'инструментов')}`
              : `${RU_PLURAL(count, 'Использован', 'Использовано', 'Использовано')} ${count} ${RU_PLURAL(count, 'инструмент', 'инструмента', 'инструментов')}`,
          present: 'Использую',
          target: (target, live) => (live ? `Использую ${target}` : `Использовано: ${target}`)
        },
        read: {
          count: (count, live) =>
            live
              ? `Читаю ${count} ${RU_PLURAL(count, 'страницу', 'страницы', 'страниц')}`
              : `${RU_PLURAL(count, 'Прочитана', 'Прочитано', 'Прочитано')} ${count} ${RU_PLURAL(count, 'страница', 'страницы', 'страниц')}`,
          present: 'Читаю',
          target: (target, live) => (live ? `Читаю ${target}` : `Прочитан ${target}`)
        },
        run: {
          count: (count, live) =>
            live
              ? `Выполняю ${count} ${RU_PLURAL(count, 'команду', 'команды', 'команд')}`
              : `${RU_PLURAL(count, 'Выполнена', 'Выполнено', 'Выполнено')} ${count} ${RU_PLURAL(count, 'команда', 'команды', 'команд')}`,
          present: 'Выполняю',
          target: (target, live) => (live ? `Выполняю ${target}` : `Выполнена команда ${target}`)
        },
        search: {
          count: (count, live) =>
            live
              ? `Выполняю ${count} ${RU_PLURAL(count, 'поисковый запрос', 'поисковых запроса', 'поисковых запросов')}`
              : `${RU_PLURAL(count, 'Выполнен', 'Выполнено', 'Выполнено')} ${count} ${RU_PLURAL(count, 'поисковый запрос', 'поисковых запроса', 'поисковых запросов')}`,
          present: 'Ищу',
          target: (target, live) => (live ? `Ищу ${target}` : `Выполнен поиск по запросу ${target}`)
        },
        separator: ', '
      },
      actions: {
        read: 'Прочитан',
        reading: 'Читаю',
        opened: 'Открыт',
        opening: 'Открываю',
        failedToOpen: 'Не удалось открыть',
        searched: 'Выполнен поиск по запросу',
        searching: 'Ищу',
        ran: 'Выполнена команда',
        running: 'Выполняю',
        ranCode: 'Выполнен код',
        runningCode: 'Выполняю код'
      },
      prefixes: {
        browser: 'Браузер',
        web: 'Веб'
      },
      titleTemplates: {
        actionCommand: (action, command) => `${action} ${command}`,
        actionQuoted: (action, value) => `${action} «${value}»`,
        actionTarget: (action, target) => `${action} ${target}`,
        completedTool: action => `Выполнено: ${action}`,
        prefixedDone: (prefix, action) => `${prefix}: ${action}`,
        runningPrefixedTool: (prefix, action) => `Выполняю: ${prefix.toLowerCase()} ${action.toLowerCase()}`,
        runningTool: action => `Выполняю: ${action.toLowerCase()}`
      },
      titles: {
        browser_click: {
          done: 'Нажат элемент страницы',
          pending: 'Нажимаю элемент страницы',
          pendingAction: 'Нажимаю'
        },
        browser_fill: {
          done: 'Заполнено поле формы',
          pending: 'Заполняю поле формы',
          pendingAction: 'Заполняю'
        },
        browser_navigate: {
          done: 'Открыта страница',
          pending: 'Открываю страницу',
          pendingAction: 'Открываю'
        },
        browser_snapshot: {
          done: 'Сделан снимок страницы',
          pending: 'Делаю снимок страницы',
          pendingAction: 'Делаю'
        },
        browser_take_screenshot: {
          done: 'Сделан скриншот',
          pending: 'Делаю скриншот',
          pendingAction: 'Делаю'
        },
        browser_type: {
          done: 'Введён текст на странице',
          pending: 'Ввожу текст на странице',
          pendingAction: 'Ввожу'
        },
        clarify: {
          done: 'Задан вопрос',
          pending: 'Задаю вопрос',
          pendingAction: 'Задаю'
        },
        cronjob: {
          done: 'Cron-задача',
          pending: 'Планирую cron-задачу',
          pendingAction: 'Планирую'
        },
        edit_file: {
          done: 'Файл изменён',
          pending: 'Изменяю файл',
          pendingAction: 'Изменяю'
        },
        execute_code: {
          done: 'Код выполнен',
          pending: 'Выполняю код',
          pendingAction: 'Выполняю'
        },
        image_generate: {
          done: 'Изображение сгенерировано',
          pending: 'Генерирую изображение',
          pendingAction: 'Генерирую'
        },
        list_files: {
          done: 'Получен список файлов',
          pending: 'Получаю список файлов',
          pendingAction: 'Получаю'
        },
        memory: {
          done: 'Сохранено в память',
          pending: 'Сохраняю в память',
          pendingAction: 'Сохраняю'
        },
        patch: {
          done: 'Применён патч к файлу',
          pending: 'Применяю патч к файлу',
          pendingAction: 'Применяю'
        },
        read_file: {
          done: 'Файл прочитан',
          pending: 'Читаю файл',
          pendingAction: 'Читаю'
        },
        search_files: {
          done: 'Выполнен поиск по файлам',
          pending: 'Ищу по файлам',
          pendingAction: 'Ищу'
        },
        session_search_recall: {
          done: 'Выполнен поиск по истории сеансов',
          pending: 'Ищу в истории сеансов',
          pendingAction: 'Ищу'
        },
        skill_view: {
          done: 'Навык загружен',
          pending: 'Загружаю навык',
          pendingAction: 'Загружаю'
        },
        terminal: {
          done: 'Команда выполнена',
          pending: 'Выполняю команду',
          pendingAction: 'Выполняю'
        },
        todo: {
          done: 'Список дел обновлён',
          pending: 'Обновляю список дел',
          pendingAction: 'Обновляю'
        },
        vision_analyze: {
          done: 'Изображение проанализировано',
          pending: 'Анализирую изображение',
          pendingAction: 'Анализирую'
        },
        web_extract: {
          done: 'Веб-страница прочитана',
          pending: 'Читаю веб-страницу',
          pendingAction: 'Читаю'
        },
        web_search: {
          done: 'Выполнен поиск в интернете',
          pending: 'Ищу в интернете',
          pendingAction: 'Ищу'
        },
        write_file: {
          done: 'Файл изменён',
          pending: 'Изменяю файл',
          pendingAction: 'Изменяю'
        }
      },
      failedCalls: (count: number) => `Вызовов с ошибкой: ${count}`,
      skillActivity: {
        loading: 'Загружаю навык',
        loaded: 'Навык загружен',
        loadFailed: 'Не удалось загрузить навык',
        readingResource: 'Читаю ресурс навыка',
        readResource: 'Прочитан ресурс навыка',
        resourceFailed: 'Не удалось прочитать ресурс навыка',
        listing: 'Получаю список навыков',
        listed: 'Получен список навыков',
        listFailed: 'Не удалось получить список навыков',
        unavailable: 'Результат навыка недоступен'
      },
      resultUnavailable: 'Результат недоступен',
      resultInterrupted: 'Прервано'
    }
  },
  prompts: {
    gatewayDisconnected: 'Hermes сейчас недоступен. Переподключитесь и отправьте ещё раз.',
    sudoSendFailed: 'Не удалось отправить пароль sudo',
    secretSendFailed: 'Не удалось отправить секрет',
    sudoTitle: 'Пароль администратора',
    sudoDesc:
      'Проверьте команду перед вводом пароля sudo. Пароль отправляется агенту, который её выполняет, и кэшируется на время сеанса.',
    sudoPlaceholder: 'пароль sudo',
    secretTitle: 'Требуется секрет',
    secretDesc: 'Hermes нужны учётные данные, чтобы продолжить.',
    secretPlaceholder: 'значение секрета',
    vaultUnlockSendFailed: 'Не удалось отправить мастер-пароль',
    vaultUnlockTitle: name => `Разблокировать ${name}`,
    vaultUnlockDesc: name =>
      `Агент хочет войти на сайт с логином, сохранённым в ${name}. Введите мастер-пароль, чтобы разблокировать хранилище на этот сеанс — пароль передаётся напрямую в ${name} на этом компьютере, нигде не хранится и не показывается агенту.`,
    vaultUnlockPlaceholder: 'Мастер-пароль',
    vaultUnlockKeepLocked: 'Оставить заблокированным',
    vaultUnlockConfirm: 'Разблокировать',
    vaultSaveSendFailed: 'Не удалось сохранить логин',
    vaultSaveTitle: site => `Сохранить логин для ${site}?`,
    vaultSaveDesc: origin =>
      `Hermes дошёл до страницы входа на ${origin}, но логина для неё нет. Введите его здесь один раз: он будет зашифрован на этом компьютере и подставлен на страницу так, что модель ни разу не увидит пароль.`,
    vaultSaveIdentifierLabel: 'Электронная почта или имя пользователя',
    vaultSaveIdentifierPlaceholder: 'you@example.com',
    vaultSavePasswordPlaceholder: 'Пароль',
    vaultSaveFootnote: 'Сохранёнными логинами можно управлять в разделе Настройки → Пароли и логины.',
    vaultSaveDecline: 'Не сохранять',
    vaultSaveConfirm: 'Сохранить и войти',
    vaultCodeSendFailed: 'Не удалось отправить код',
    vaultCodeTitle: site => `Код подтверждения для ${site}`,
    vaultCodeDesc: site =>
      `${site} запрашивает одноразовый код (из SMS, письма или приложения-аутентификатора). Введите его здесь, и Hermes введёт его на странице; модель его не увидит.`,
    vaultCodeLabel: 'Код',
    vaultCodeFootnote:
      'Совет: сохраните ключ аутентификатора вместе с этим логином в разделе Настройки → Пароли и логины, и Hermes будет вводить коды за вас.',
    vaultCodeSkip: 'Пропустить',
    vaultCodeConfirm: 'Ввести код',
    reconnect: 'Переподключиться',
    sudoCommandUnavailable: 'Агент не предоставил команду. Отмените запрос, если не можете проверить её в разговоре.',
    sudoInstallDesc:
      'Hermes нужен ваш пароль sudo, чтобы установить пакеты Bot Screen (TigerVNC + Xfce) на хосте шлюза. Он отправляется только на этот хост.'
  },
  desktop: {
    audioReadFailed: 'Не удалось прочитать записанное аудио',
    compressingContext: 'Сжатие контекста…',
    compressingContextFor: topic => `Сжатие контекста для темы: ${topic}`,
    compressLockHeld: 'Для этого сеанса уже выполняется другое сжатие. Дождитесь его завершения и повторите попытку.',
    sessionUnavailable: 'Сеанс недоступен',
    createSessionFailed: 'Не удалось создать новый сеанс',
    promptFailed: 'Не удалось отправить промпт',
    providerCredentialRequired: 'Добавьте учётные данные провайдера перед отправкой первого сообщения.',
    readinessChecksDisagree:
      'setup.status сообщает, что учётные данные настроены, но определить рабочую конфигурацию по-прежнему не удалось.',
    emptySlashCommand: 'пустая слеш-команда',
    slashCommandIgnoredTitle: 'Команда не отправлена',
    slashCommandIgnoredBody:
      'Слеш-команды нельзя совмещать с вложениями. Удалите вложение или отправьте команду отдельно.',
    desktopCommands: 'Команды приложения',
    skillCommandsAvailable: count => `Доступно команд навыков: ${count}.`,
    warningLine: message => `предупреждение: ${message}`,
    yoloArmed: 'YOLO включён для этого чата',
    yoloOff: 'YOLO отключён',
    yoloSystem: active => `YOLO ${active ? 'включён' : 'отключён'} для этого сеанса`,
    yoloTitle: 'YOLO',
    yoloToggleFailed: 'Не удалось переключить YOLO',
    profileStatus: current =>
      `Профиль: ${current}. Чтобы начать чат в другом профиле, используйте /profile <имя> или меню «Новый сеанс».`,
    unknownProfile: 'Неизвестный профиль',
    noProfileNamed: (target, available) => `Нет профиля «${target}». Доступны: ${available}`,
    newChatsProfile: name => `Новые чаты будут использовать профиль ${name}.`,
    setProfileFailed: 'Не удалось сменить профиль',
    sttDisabled: 'Распознавание речи отключено в настройках.',
    stopFailed: 'Не удалось остановить',
    regenerateFailed: 'Не удалось сгенерировать ответ заново',
    editFailed: 'Не удалось изменить сообщение',
    editTurnUnavailable: 'Этого хода больше нет в истории сервера (возможно, он был сжат).',
    resumeFailed: 'Не удалось возобновить сеанс',
    readOnlyTranscriptTitle: 'Открыт только для чтения',
    readOnlyTranscriptBody:
      'Ни один подключённый бэкенд пока не взял на себя этот старый чат, поэтому он открыт только для чтения. История сохранена полностью; отправка отключена, пока чат не возьмёт на себя какой-либо бэкенд.',
    readOnlyTranscriptSendBlocked: 'Этот чат открыт только для чтения — отправка отключена.',
    resumeStrandedTitle: 'Не удалось загрузить этот сеанс',
    resumeStrandedBody:
      'Соединение с этим сеансом оборвалось, и автоматические повторные попытки исчерпаны. Проверьте, что шлюз работает, и попробуйте снова.',
    poolSlotTimeoutBody:
      'Все слоты локальных бэкендов профилей заняты. Увеличьте «Число работающих бэкендов ботов» в разделе «Настройки» → «Дополнительно» или повторите попытку после освобождения неактивного бэкенда.',
    poolSlotTimeoutOpenSettings: 'Открыть расширенные настройки',
    resumeRetry: 'Повторить',
    nothingToBranch: 'Нечего ветвить',
    branchNeedsChat: 'Начните или возобновите чат перед ветвлением.',
    sessionBusy: 'Сеанс занят',
    sessionBusyQueuedCommand:
      'Сеанс занят — сообщение поставлено в очередь и будет отправлено, когда завершится текущий ход',
    sessionBusyInterruptCommand:
      'Сеанс занят — остановите текущий ответ (кнопка «Остановить» или Esc), затем отправьте эту команду',
    steerQueued: text => `Уточнение · «${text}» — в очереди до следующего вызова инструмента`,
    steerQueuedNextToolCall: 'Уточнение придёт после следующего вызова инструмента',
    steerRejected: 'Уточнение отклонено — агент не принял ввод',
    sessionTitleSet: (title, queued) =>
      `Название сеанса задано: ${title}${queued ? ' (в очереди, пока сеанс инициализируется)' : ''}`,
    sessionTitleCleared: 'Название сеанса сброшено.',
    branchStopCurrent: 'Остановите текущий ход перед ветвлением этого чата.',
    branchNoText: 'В этом сообщении нет текста, от которого можно ответвить.',
    branchTitle: n => `Черновик: Ветка #${n}`,
    branchFailed: 'Не удалось ответвить чат',
    deleteFailed: 'Не удалось удалить',
    archived: 'Перемещено в архив',
    archiveFailed: 'Не удалось переместить в архив',
    restored: 'Восстановлено',
    unarchiveFailed: 'Не удалось восстановить',
    cwdChangeFailed: 'Не удалось сменить рабочий каталог',
    cwdStagedTitle: 'Смена рабочего каталога отложена',
    cwdStagedMessage:
      'Перезапустите бэкенд приложения, чтобы смена рабочего каталога применилась к этому активному сеансу.',
    modelSwitchFailed: 'Не удалось сменить модель',
    hydrationSyncing: (profile: string) => `Синхронизация профиля «${profile}»…`,
    sessionExported: 'Сеанс экспортирован',
    sessionExportFailed: 'Не удалось экспортировать сеанс',
    imageSaved: 'Изображение сохранено',
    downloadStarted: 'Скачивание началось',
    restartToUseSaveImage: 'Перезапустите Hermes Desktop, чтобы использовать «Сохранить изображение».',
    restartToSaveImages: 'Перезапустите Hermes Desktop, чтобы сохранять изображения',
    imageDownloadFailed: 'Не удалось скачать изображение',
    openImage: 'Открыть изображение',
    generatedImageAlt: 'Сгенерированное изображение',
    downloadImage: 'Скачать изображение',
    savingImage: 'Сохранение изображения',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    resetZoom: 'Сбросить масштаб',
    imagePreviewFailed: 'Не удалось показать предпросмотр изображения',
    imageAttach: 'Прикрепление изображения',
    imageWriteFailed: 'Не удалось записать изображение на диск.',
    imageAttachFailed: 'Не удалось прикрепить изображение',
    pastedContent: 'Вставленный текст',
    pasteAttachFailed: 'Не удалось прикрепить вставленный текст',
    attachImages: 'Прикрепить изображения',
    clipboard: 'Буфер обмена',
    noClipboardImage: 'Изображение в буфере обмена не найдено',
    clipboardPasteFailed: 'Не удалось вставить из буфера обмена',
    ...ruDropWarning,
    handoff: {
      pickPlatform: 'Выберите, куда передать сеанс',
      success: platform => `Сеанс передан в ${platform}. Продолжить здесь можно в любой момент.`,
      systemNote: platform => `↻ Сеанс передан в ${platform} — продолжить здесь можно в любой момент.`,
      failed: error => `Не удалось передать сеанс: ${error}`,
      timedOut:
        'Hermes не смог связаться со шлюзом сообщений. Запустите его в разделе «Сообщения» и повторите передачу.',
      startMessaging: 'Запустить шлюз сообщений'
    },
    noPageAt: path => `нет страницы по адресу ${path}`,
    logUnavailable: detail => `Журнал недоступен: ${detail}`,
    modelSwitchConfirmBody: 'Эта смена модели требует подтверждения.',
    modelSwitchConfirmLabel: 'Всё равно переключить',
    modelSwitchConfirmTitle: (model: string) => `Переключиться на ${model}?`,
    modelSwitchConfirmTitleFallback: 'Сменить модель?',
    modelSwitchKeepLabel: 'Оставить текущую модель',
    modelSwitchStaleNotice: 'Выбор изменился — смена модели не применена.',
    attachFailed: 'Не удалось прикрепить'
  },
  tips: {
    close: 'Больше не показывать этот совет',
    items: {
      'new-session': {
        title: 'С чистого листа',
        text: 'Новый чат получает собственный контекст, терминал и рабочий каталог.'
      },
      skills: {
        title: 'Научите один раз',
        text: 'Навыки — это папки с инструкциями, которые Hermes загружает, когда они нужны для работы.'
      },
      messaging: {
        title: 'Hermes, когда вы не за компьютером',
        text: 'Подключите Telegram, Discord, Slack и другие — тот же агент, та же память.'
      },
      artifacts: {
        title: 'Всё, что сделал Hermes',
        text: 'Изображения, файлы и ссылки из каждого сеанса проиндексированы в одном месте.'
      },
      cron: {
        title: 'Работа, которая выполняется сама собой',
        text: 'Запланируйте промпт: каждый час, каждую ночь или по cron-выражению.'
      },
      'command-palette': {
        title: 'Одно поле для всего',
        text: 'Сеансы, настройки, навыки и команды — всё доступно в палитре команд.'
      },
      profiles: {
        title: 'Профили независимы',
        text: 'Каждый профиль — отдельный Hermes: свои ключи, своя память, свои сеансы.'
      },
      'composer-mentions': {
        title: 'Файлы и команды',
        text: 'Введите @, чтобы добавить файл в разговор, или /, чтобы выполнить команду.'
      },
      'right-pane': {
        title: 'Рабочая панель',
        text: 'Файлы, терминал, проверка изменений и встроенный браузер — на правой панели.'
      },
      'local-runtime-update': {
        title: 'Доступно обновление локального движка',
        text: 'Обновите движок, на котором работают локальные модели. Активные локальные запросы могут быть прерваны.',
        action: 'Обновить сейчас'
      }
    }
  },
  errors: {
    genericFailure: 'Что-то пошло не так',
    boundaryTitle: 'Что-то сломалось в интерфейсе',
    boundaryDesc: 'Не удалось отобразить экран из-за непредвиденной ошибки. Чаты и настройки в безопасности.',
    reloadWindow: 'Перезагрузить окно',
    openLogs: 'Открыть журналы',
    boundaryDetails: 'Подробности',
    sendDiagnostics: 'Отправить диагностику'
  },
  ui: {
    search: {
      clear: 'Очистить поиск'
    },
    logs: {
      bottom: 'В конец журнала',
      search: 'Поиск в журналах…',
      top: 'В начало журнала'
    },
    pagination: {
      label: 'Навигация по страницам',
      previous: 'Назад',
      previousAria: 'Перейти на предыдущую страницу',
      next: 'Дальше',
      nextAria: 'Перейти на следующую страницу'
    },
    sidebar: {
      title: 'Боковая панель',
      description: 'Показывает мобильную боковую панель.',
      toggle: open => `${open ? 'Показать' : 'Скрыть'} боковую панель`
    }
  },
  modelAssignment: {
    saveFailed: 'Hermes не сохранил это изменение модели.',
    confirmTitle: 'Предупреждение о выборе модели',
    confirmDetail: 'Подтвердите, только если вы согласны на этот компромисс.',
    confirmAction: 'Подтвердить',
    declined: 'Смена модели отменена — вы отклонили предупреждение о тарифе с обучением на ваших данных.'
  }
} satisfies TranslationOverrides

export const ru = defineLocale(ruOverrides)
