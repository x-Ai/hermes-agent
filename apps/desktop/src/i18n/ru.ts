import { defineFieldCopy } from '@/app/settings/field-copy'

import { defineCompleteLocale } from './define-locale'

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

export const ru = defineCompleteLocale({
  connectors: {
    title: 'Подключите приложения',
    connect: 'Подключить',
    skip: 'Не сейчас',
    cancel: 'Не ждать',
    retry: 'Повторить',
    grant: 'Подключить заново',
    connected: 'Подключено',
    checking: 'Проверка приложений…',
    waitingSignIn: 'Ждем, когда вы закончите подписывать..',
    notConnected: 'Не подключено',
    notAvailable: 'Недоступно',
    startWith: count => `Start the task with ${count} ${count === 1 ? 'приложение' : 'приложения'} connected`,
    startWithout: 'Начать без подключения',
    skipped: 'Пропущено',
    disabled: 'Недоступно',
    failed: 'Не удалось подключить',
    needsAuth: 'Доступ истёк',
    opening: 'Открываем вход…',
    waiting: 'Ожидание вашего браузера…',
    timeout: 'Всё ещё ждём авторизацию.',
    keepWaiting: 'Продолжить ждать',
    refresh: 'Обновить статус',
    statusError: 'Не удалось проверить подключения. Обновите статус.',
    connectError: 'Не удалось начать авторизацию. Повторите попытку.',
    unavailable: 'Коннекторы недоступны для этой сессии.',
    ownerMissing: 'Откройте этот разговор заново, чтобы управлять подключениями.',
    search: 'Найти приложение',
    empty: 'Подходящих приложений нет',
    continue: 'Продолжить в чате',
    continueBusy: 'Ждём завершения текущего ответа',
    continueFailed: 'Не удалось продолжить. Повторите попытку.',
    missingResult: 'Нет результата коннектора',
    disclaimer: 'Подключение необязательно. Разрешайте только те приложения, которые Hermes может использовать.',
    connectTitle: app => `Подключить${app}?`,
    describe: app => `Hermes входит в${app}в вашем браузере и спрашивает перед чтением чего-либо там.`,
    skipThis: 'Пропусти это',
    continueWith: count => `Продолжить с${count}`,
    noneOfThese: 'Ни один из этих',
    unavailableNow: 'Подключение недоступно прямо сейчас — это можно настроить позже.',
    nothingConnectedYet: 'Пока ничего не связывает.',
    connectWhenNeeded:
      'Hermes предлагает связать их, когда задача нуждается в них, и спрашивает, прежде чем читать что-либо.',
    execution: 'Инструменты коннекторов',
    connectErrorFor: (app: string) => `Не удалось начать авторизацию для${app}.`,
    setup: server => `Настроить${server}`,
    openInBrowser: 'Открыть в браузере',
    setupCancel: 'Отменить',
    authorizedToolsUnavailable: 'Авторизован. Инструменты недоступны.',
    required: 'Требуется'
  },
  sessionImport: {
    title: 'Продолжить из другого приложения',
    subtitle: 'Перенесите разговор в Hermes и продолжите с того места, где остановились.',
    action: 'Импортировать сессию',
    readingFrom: 'Читаем с',
    connectedComputer: 'подключённого компьютера',
    destination: 'Импорт в',
    all: 'Все',
    search: 'Поиск по загруженным сессиям',
    scanning: 'Поиск разговоров',
    scanError: 'Не удалось найти сессии',
    scanHelp: 'Проверьте подключение к серверу и повторите попытку. Старому серверу может требоваться обновление.',
    empty: 'Разговоров пока нет',
    emptyHelp: 'Здесь появятся сессии Claude Code и Codex с этого сервера.',
    noMatches: 'Совпадений нет',
    searchHelp: 'Попробуйте другой заголовок или папку либо загрузите ещё сессии.',
    skipped: 'Некоторые журналы пусты, недоступны или слишком велики для просмотра.',
    more: 'Загрузить ещё сессии',
    messages: 'сообщений',
    choose: 'Разговор, который стоит продолжить',
    chooseHelp: 'Выберите сессию, чтобы прочитать историю перед импортом в Hermes.',
    previewLoading: 'Открываем просмотр',
    previewError: 'Просмотр недоступен',
    previewHelp: 'Исходный файл мог переместиться или измениться. Обновите список и повторите попытку.',
    previewLimit: 'Просмотр сокращён для удобства чтения. Импортируется весь разговор.',
    you: 'Вы',
    snapshot: 'Этот разговор уже есть в Hermes. Откройте существующую копию, чтобы продолжить.',
    copyNotice:
      'Копируется текст разговора. Исходные файлы не меняются. Вывод инструментов и рассуждения не переносятся.',
    importing: 'Импорт…',
    open: 'Открыть в Hermes',
    continue: 'Продолжить в Hermes',
    importError: 'Не удалось импортировать разговор.'
  },
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
    failedToRender: name => `“${name}"не удалось`,
    formatJson: 'Форматировать JSON',
    free: 'Бесплатно',
    loading: 'Загрузка…',
    loadingStatus: 'Загрузка',
    moreActions: 'Больше действий',
    notSet: 'Не задано',
    openFullView: 'Открытый полный обзор',
    refresh: 'Обновить',
    remove: 'Убрать',
    replace: 'Заменить',
    retry: 'Повторить',
    reset: 'Сброс',
    run: 'Запустить',
    search: 'Поиск',
    send: 'Отправить',
    set: 'Установить',
    showOptions: 'Показать параметры',
    skip: 'Пропустить',
    update: 'Обновить',
    zoomIn: 'Заранее',
    zoomOut: 'Умереть',
    tryHint: term => `Попробуйте «${term}»`,
    on: 'Вкл',
    off: 'Выкл',
    bots: 'Боты'
  },
  media: {
    displayLabel: (kind, name) => {
      const labels = { audio: 'Audio', file: 'File', image: 'Image', video: 'Video' }

      return `${labels[kind]}: ${name}`
    }
  },
  fileMenu: {
    revealFinder: 'Показать в Finder',
    revealExplorer: 'Показать в Проводнике',
    revealFileManager: 'Открыть содержащую папку',
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
  boot: {
    ready: 'Hermes Desktop готов',
    connecting: 'ПОДКЛЮЧЕНИЕ',
    desktopBootFailedWithMessage: message => `Не удалось запустить приложение: ${message}`,
    steps: {
      connectingGateway: 'Подключение к шлюзу',
      loadingSettings: 'Загрузка настроек Hermes',
      loadingSessions: 'Загрузка последних сеансов',
      retryingRemoteBackend: 'Переподключение к удалённому бэкенду Hermes…',
      startingDesktopConnection: 'Запуск подключения приложения',
      startingHermesDesktop: 'Запуск Hermes Desktop…',
      backendReady: 'Бэкенд Hermes готов',
      connectingRemoteBackend: 'Подключение к удалённому бэкенду Hermes',
      resolvingBackend: 'Определение бэкенда Hermes',
      resolvingRuntime: 'Определение среды выполнения Hermes',
      restartingAfterUpdate: 'Перезапуск Hermes для завершения обновления…',
      runtimeReady: 'Среда выполнения Hermes готова',
      startingBackend: 'Запуск бэкенда Hermes',
      usingRuntime: 'Использование установленной среды Hermes',
      waitingBackendLaunch: 'Ожидание запуска бэкенда Hermes',
      waitingBackendReady: 'Ожидание готовности бэкенда Hermes',
      waitingForUpdate: 'Ожидание завершения текущего обновления…'
    },
    errors: {
      backgroundExited: 'Фоновый процесс Hermes завершён.',
      backgroundExitedDuringStartup: 'Фоновый процесс Hermes завершился при запуске.',
      backendStopped: 'Бэкенд остановлен',
      desktopBootFailed: 'Не удалось запустить приложение',
      gatewayConnectionLost: 'Соединение с шлюзом потеряно',
      gatewayConnectionLostDetail:
        'Все еще пытаюсь восстановить соединение. Вы можете продолжать читать и рисовать. Если это продолжается, переподключитесь сейчас или проверьте настройки подключения.',
      gatewaySignInRequired: 'Требуется вход в шлюз',
      ipcBridgeUnavailable: 'IPC-мост приложения недоступен.',
      restartHermes: 'Перезапустите Hermes.',
      openLogs: 'Открыть журналы',
      reconnectNow: 'Восстановить соединение сейчас',
      connectionSettings: 'Настройки подключения',
      gatewaySignInRequiredDetail:
        'Войдите еще раз, чтобы восстановить соединение. Ваши чаты и настройки в безопасности.',
      signInAgain: 'Войдите снова'
    },
    failure: {
      title: 'Hermes не удалось запустить',
      description:
        'Фоновый шлюз не запустился. Попробуйте один из шагов восстановления ниже. Ничто из этого не удаляет ваши чаты и настройки.',
      remoteTitle: 'Требуется вход в удалённый шлюз',
      remoteDescription:
        'Сессия удалённого шлюза истекла. Войдите снова, чтобы переподключиться. Ничто из этого не удаляет ваши чаты и настройки.',
      retry: 'Повторить',
      repairInstall: 'Восстановить установку',
      useLocalGateway: 'Использовать локальный шлюз',
      gatewaySettings: 'Настройки шлюза',
      back: 'Назад',
      openLogs: 'Открыть журналы',
      repairHint: 'Восстановление перезапускает установщик — на чистой машине это может занять несколько минут.',
      remoteSignInHint: signInLabel =>
        `Выход из сохранённой сессии удалённого браузера, затем открытие ${signInLabel}. Чтобы перейти на встроенный бэкенд, используйте локальный шлюз.`,
      signOutAndSignIn: 'Выйти и войти',
      remoteFailureHint: 'Проверьте URL шлюза и вход в настройках шлюза или переключитесь на локальный шлюз.',
      cloudDownTitle: 'Nous Облачный агент не работает.',
      cloudDownDescription:
        'Облачный агент, управляемый Nous, к которому подключается этот шлюз, возвращает ошибку сервера. Его нельзя перезапустить отсюда — проверьте его статус, переключитесь на локальный шлюз или обратитесь в поддержку.',
      cloudDownHint:
        'Кнопки ниже открывают портал Nous (состояние экземпляра и элементы управления) и наш Discord для поддержки.',
      cloudDownCheckPortal: 'Проверить статус портала',
      cloudDownDiscord: 'Получить помощь по Discord',
      hideRecentLogs: 'Скрыть недавние журналы',
      showRecentLogs: 'Показать недавние журналы',
      signedInTitle: 'Вы вошли в систему',
      signedInMessage: 'Переподключение к удалённому шлюзу…',
      signInIncompleteTitle: 'Вход не завершён',
      signInIncompleteMessage: 'Окно входа закрылось до завершения аутентификации.',
      signInFailed: 'Не удалось войти',
      signInToRemoteGateway: 'Войти в удалённый шлюз',
      signInWithProvider: provider => `Войти через ${provider}`,
      identityProvider: 'вашему провайдеру аутентификации',
      details: 'Детали'
    },
    causes: {
      exitedEarly: 'Фоновая служба Hermes остановилась сразу после запуска.',
      timedOut: 'Фоновая служба Hermes не ответила вовремя.',
      permission: 'Hermes не смог выполнить запись в свою папку данных (проблема с разрешениями).',
      diskFull: 'Диск заполнен, поэтому Hermes не смог запуститься.',
      portInUse: 'Другая программа использует сетевой порт, необходимый Hermes.',
      installMissing: 'Часть установки Hermes отсутствует. Выберите «Восстановить установку», чтобы вернуть ее обратно.'
    }
  },
  notifications: {
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
    installMethodUnsupportedTitle: 'Неподдерживаемый способ установки',
    updateHermes: 'Обновить Hermes',
    updateReadyTitle: 'Обновление готово',
    updateReadyMessage: count =>
      `Доступно ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'новое изменение' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'новых изменения' : 'новых изменений'}.`,
    updateReadyMessageUnknown: 'Доступно новое обновление.',
    seeWhatsNew: 'Смотреть, что нового',
    toast: {
      artifactPartialLoad: (failed, total) => `Пропущено${failed}из${total}недавние сессии при индексации артефактов.`,
      artifactSafeLimitExceeded: count => `${count}превышена безопасная допустимая нагрузка на расшифровку.`,
      artifactUnreadable: count => `${count}не может быть прочитано.`,
      attachmentLimitSaveFailed: 'Не удалось сохранить максимальный размер крепления',
      localEndpointSaveFailed: 'Не удалось сохранить локальную конечную точку',
      memoryConnectionStartFailed: 'Не удалось начать соединение',
      memoryFieldSaveFailed: label => `Не удалось сохранить${label}`,
      memoryProviderSavedMessage: 'Обновлена конфигурация поставщика памяти.',
      memoryProviderSavedTitle: label => `${label}сохранено`,
      memoryProviderSettingsSaveFailed: label => `Не удалось сохранить${label}настройки`,
      modelChangeFailed: 'Невозможно изменить модель',
      onboardingReadyTitle: 'Hermes готов',
      openBrowserWindowFailed: 'Не удалось открыть браузер в отдельном окне',
      openNewWindowFailed: 'Не удалось открыть новое окно',
      openSessionTerminalFailed: 'Не удалось открыть чат в терминале',
      openSessionWindowFailed: 'Не удалось открыть чат в новом окне',
      petDraftsReadyMessage: 'Ваш питомец выглядит законченным — выберите один для вылупления.',
      petDraftsReadyTitle: 'Пет-чертежи готовы',
      petGenerationFailedTitle: 'Поколение питомцев провалилось',
      petHatchedMessage: 'Откройте, чтобы назвать и принять его.',
      petHatchedTitle: 'Ваш питомец вылупился',
      petHatchingFailedTitle: 'Хатчинг провалился',
      petReopenTryAgain: 'Откройте, чтобы попробовать снова.',
      pluginLoadFailed: origin => `Плагин "${origin}"не удалось загрузить`,
      pluginRegisterFailed: name => `Не удалось зарегистрировать плагин «${name}»`,
      pluginsFolderOpenFailed: 'Не удалось открыть папку плагинов',
      pluginsFolderResolveFailed: 'Не удалось разрешить папку плагинов',
      pluginsFolderUnavailable: 'Настольные плагины недоступны',
      pluginsHomeUnavailable: 'Backend не сообщает свой домашний каталог',
      gatewayConnectFailed: 'Не удалось подключиться к шлюзу Hermes',
      processStopFailed: 'Не удалось остановить процесс',
      providerConnected: provider => `${provider}подключено.`,
      providerSaveFailed: label => `Не удалось сохранить${label}`,
      reactionFailed: 'Не реагировать',
      runtimeNotReadyMessage:
        'Hermes Desktop не смог проверить работоспособность бэкэнда при запуске. Некоторые функции могут быть недоступны, пока шлюз не будет доступен.',
      runtimeNotReadyTitle: 'Время выполнения не готово',
      toolGatewayEnabledMessage: labels => {
        const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`

        return `${list} now run through your Nous subscription — no separate API keys needed.`
      },
      toolGatewayEnabledTitle: 'Инструмент Gateway включен',
      toolGatewayTools: {
        browser: 'автоматизация браузера',
        image_gen: 'генерация изображений',
        tts: 'текст-речь',
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
      apiRetriesExhausted: retries => `Вызов API завершился ошибкой после ${retries} повторных попыток`,
      invalidApiResponseAfterRetries: (retries, detail) =>
        `Недопустимый ответ API после ${retries} повторных попыток: ${detail}`,
      resetsIn: remaining => `До сброса: ${remaining}`,
      elevenLabsNeedsKey: 'Для STT ElevenLabs нужен ELEVENLABS_API_KEY.',
      elevenLabsRejectedKey: 'ElevenLabs отклонил API-ключ (401).',
      diskFull: 'Диск заполнен — освободите место и повторите.',
      fileNotFound: target => (target ? `File not found: ${target}` : 'Файл не найден'),
      gatewayAuthFailed: 'Аутентификация шлюза не удалась — проверьте API_SERVER_KEY.',
      invalidExternalUrl: 'Недействительный внешний URL',
      invalidPreviewUrl: 'Недопустимый URL предпросмотра.',
      methodNotAllowed:
        'Бэкенд приложения отклонил запрос (405 Method Not Allowed). Попробуйте перезапустить Hermes Desktop.',
      microphonePermission: 'Доступ к микрофону запрещён.',
      openaiRejectedApiKey: 'OpenAI отклонил API-ключ.',
      openaiRejectedApiKeyWithStatus: status => `OpenAI отклонил API-ключ (${status} invalid_api_key).`,
      openaiTtsNeedsKey: 'Для TTS OpenAI нужен VOICE_TOOLS_OPENAI_KEY или OPENAI_API_KEY.',
      restoreTargetMissing: 'Целевой идеи больше нет в истории этой сессии. Обновите сеанс и попробуйте снова.',
      restoreTargetUnsafe:
        'Этот контрольно-пропускной пункт не может быть безопасно восстановлен. Обновите сеанс и попробуйте снова.',
      sessionStoppedBeforeAgentReady: 'Сессия закончилась до того, как агент был готов.',
      turnCancelledBeforeAgentReady: 'Поворот отменили до того, как агент был готов.',
      codeSkewRestartRequired:
        'Hermes был обновлен, но все еще использует старую версию. Перезапустите его, чтобы завершить обновление.',
      storageFailure:
        'Hermes не удалось сохранить данные в папке данных. Откройте «Обслуживание», чтобы проверить и отремонтировать его.',
      rpcOutOfSync: 'Приложение и серверная часть находятся в разных версиях. Обновите оба.',
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
      liveEnded: 'Сеанс живого голоса завершен',
      liveError: 'Живой голос',
      liveDelegationFailed: 'Не удалось передать запрос Hermes.',
      liveUnavailable: reason =>
        `GPT-Live voice chat is not available: ${reason}. Вместо этого используйте преобразование речи в текст.`,
      liveEndedConnectionLost: 'Сеанс прямой голосовой связи потерял связь.',
      liveEndedClosed: 'Сеанс живого голоса был закрыт сервисом.'
    },
    native: {
      approvalTitle: 'Требуется одобрение',
      approveAction: 'Одобрить',
      rejectAction: 'Отклонить',
      inputTitle: 'Требуется ввод',
      inputBody: 'Hermes ожидает ваш ответ.',
      turnDoneTitle: 'Hermes завершил',
      turnDoneBody: '',
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
      restartHermes: 'Перезапустите Hermes.',
      openKeys: 'Открытые ключи',
      openGateways: 'Открытые шлюзы',
      openMaintenance: 'Открытое обслуживание'
    }
  },
  remoteDisplayBanner: {
    message: reason =>
      `Включён программный рендеринг — обнаружен удалённый дисплей (${reason}). GPU-ускорение отключено, чтобы избежать мерцания.`
  },
  billingBlock: {
    titleNous: 'Кредиты Nous закончились',
    titleProvider: provider => `Кредиты закончились — ${provider}`,
    fallbackMessage: 'В вашем аккаунте закончились кредиты. Пополните баланс, чтобы продолжить.',
    openBilling: 'Открыть биллинг',
    addCredits: 'Пополнить кредиты',
    dismiss: 'Скрыть'
  },
  billingPage: {
    title: 'Выставление счетов',
    paymentAndCredits: 'Оплата и кредиты',
    usage: 'Использование',
    balance: 'Баланс',
    plan: 'План',
    autoRefill: 'Автозаправка',
    openPortal: 'Открытый портал',
    connectNousTitle: 'Подключите учетную запись Nous',
    connectNousBody: 'Запустите/портал в TUI или откройте портал Nous для подключения своей учетной записи.',
    freeTierNoticeTitle: 'Вы на бесплатном тарифе Nous',
    openPortalArrow: 'Открытый портал',
    customCreditAmount: 'Обычная сумма кредита',
    buy: 'Купить',
    processingSettlement: 'Обработка... проверка урегулирования',
    creditsAdded: amount => `${amount}добавлено. Баланс освежающий.`,
    creditsAddedShort: amount => `${amount} added`,
    creditsAddedTitle: 'Кредиты добавлены',
    usageFallback: label => `${label}использование`,
    invoices: 'Счета',
    preview: 'предварительный просмотр',
    previewFixture: 'Billing Preview (только для Dev)',
    live: 'жить',
    openVerification: 'Открытая страница проверки',
    dismiss: 'Отклонить',
    waitingVerification: 'В ожидании проверочной ссылки..',
    verifyToContinue: 'Проверить, чтобы продолжить',
    autoRefillUpdated: 'Автозаправка обновлена.',
    autoRefillOff: 'Автозаправка выключена.',
    threshold: 'Порог',
    reloadTo: 'Перезагружать',
    autoRefillThresholdLabel: 'Порог автозаправки',
    autoRefillReloadToLabel: 'Перезагрузка автозаправки на сумму',
    turnOffConfirm: 'Выключить автозаправку?',
    turnOff: 'Выключить',
    disable: 'Инвалид',
    manage: 'Управлять',
    checkingChange: 'Проверить это изменение..',
    changeBlocked: 'Это изменение не может быть сделано здесь.',
    alreadyOnPlan: name => `Вы уже включены${name}— нечего менять.`,
    scheduledChange: (name, date, creditsDelta) =>
      `Change to ${name} — takes effect ${date}Не взимайте плату сейчас; вы сохраняете свой текущий план до тех пор.${creditsDelta ? ` Monthly credits change: ${creditsDelta}.` : ''}`,
    cannotSchedule: 'Это изменение не может быть запланировано здесь.',
    tryAgain: 'Попробуйте снова',
    scheduling: 'Расписание..',
    confirmDowngrade: 'Подтвердить понижение',
    downgrade: 'Понижение',
    currentPlan: 'Текущий план',
    scheduled: 'Запланированный',
    perMonth: price => `${price}/моль`,
    backToBilling: 'Вернуться в Биллинг',
    plans: 'Планы',
    noPlans: 'На данный момент нет планов по изменению.',
    undoing: 'Уничтожить..',
    undo: 'Снять',
    addCardArrow: 'Добавить карту',
    noPaymentMethodTitle: 'Нет способа оплаты в файле',
    noCardBody:
      'Покупка пополнения кредитов и автоматического заполнения остаются отключенными до тех пор, пока карта не будет в файле. Добавить один на портале.',
    enabled: 'Включено',
    subscriptionUnavailable: 'Детали подписки недоступны, открытие портала все еще доступно.',
    changesToOn: (name, date) => `Изменения в${name}включено${date}.`,
    cancelsOn: date => `Отменяет${date}.`,
    renewsOn: date => `Продлевает${date}`,
    noActiveSubscription: 'Нет активной подписки — платные модели снимают кредиты сверху.',
    changePlan: 'План изменений',
    viewPlans: 'Посмотреть планы',
    adjustPlanArrow: 'Адаптация плана',
    creditsPerMonth: amount => `${amount}кредиты/месяц`,
    chooseArrow: 'Выберите',
    addPaymentMethod: 'Добавить способ оплаты',
    paymentMethod: 'Способ оплаты',
    manageCardDescription: 'Управляйте картой, используемой для пополнения и продления подписки.',
    cardSourceAutoRefill: 'карточка автозаполнения',
    cardSourceCustomerDefault: 'клиентский дефолт',
    cardSourceSubscription: 'подписная карточка',
    buyCreditsNow: 'Купить кредиты сейчас',
    singleChargeDescription: 'Один заряд на вашей карте, добавленный к вашему балансу сегодня.',
    autoRefillDescription: 'Держите баланс вверх, когда он падает ниже вашего порога.',
    manageAutoRefillPortal: 'Управляйте автозаправкой с портала.',
    enableAutoRefillPortal: 'Включите автозаправку с портала',
    differentCard: 'другая карта',
    reconcileArrow: 'Примирение',
    reconcileAutoRefill: card => `Автоматическое пополнение${card}— согласовать на портале`,
    refillWhenLow: 'Пополняйте при низком',
    autoRefillChargeDescription: (reloadTo, threshold) =>
      `Зарядки${reloadTo}автоматически, когда ваш баланс опускается ниже${threshold}.`,
    creditsLeft: (remaining, total) => `${remaining}из${total}левый`,
    creditsOver: (remaining, total, over) => `${remaining}из${total}левый ·${over}над`,
    subscriptionCreditsRemaining: 'Оставшиеся подписные кредиты',
    resetsOn: date => `Сбросы${date}`,
    subscriptionCredits: 'Кредиты по подписке',
    doesNotExpire: 'Не истекает',
    topUpCredits: 'Верхние кредиты',
    monthlySpendCapUsed: 'Ежемесячный лимит расходов',
    amountUsed: (spent, limit) => `${spent}из${limit}использованный`,
    defaultCeiling: 'Потолок по умолчанию',
    monthlyRemoteSpending: 'Ежемесячные дистанционные расходы',
    monthlySpendCap: 'Ежемесячная кепка',
    model: 'Модель',
    connectors: 'Соединители',
    freeTier: 'Бесплатный тариф',
    included: 'Включено',
    freeTierName: 'Nous · бесплатный тариф',
    freeTierCaption:
      'Работает на nous/welcome с включенными коннекторами. Вход сохраняет ваши коннекторы и добавляет инструменты, для которых требуется учетная запись, а также все остальные модели.',
    freeTierFootnote:
      'Бесплатный уровень не имеет баланса и ничего не нужно платить. Оплата и использование появятся, когда вы войдете в систему с аккаунтом Nous .',
    chargeFailed: 'Сбор средств не удался',
    chargeUnconfirmedBody: 'Платеж все еще может быть проведен. Проверьте портал перед повторной попыткой.',
    chargeUnconfirmedTitle: 'Результат зарядки не подтвержден',
    chargeCheckFailedBody: 'Не удалось подтвердить списание. Проверьте портал перед повторной попыткой.',
    chargeCheckFailedTitle: 'Не удалось подтвердить списание',
    chargeMaySettle: 'Платеж может еще обработаться. Проверьте портал перед повторной попыткой.',
    stillProcessing: 'Все еще обрабатывается спустя 5 минут',
    chargeNeedsVerification: 'Ваша карта нуждается в проверке. Завершите её, а затем попробуйте снова.',
    cardExpired: 'Срок действия вашей карты истёк. Обновите её на портале и попробуйте снова.',
    cardDeclined: 'Ваша карта была отклонена. Попробуйте использовать другую карту на портале.',
    chargeFailedReason: reason => `The charge failed (${reason}). Try again or use another card on the portal.`,
    verificationNotApprovedTitle: 'Проверка не одобрена',
    verificationNotApprovedBody: 'Проверка карты не была одобрена. Попробуйте снова или используйте другую карту.',
    verificationCompleteTitle: 'Проверка завершена',
    verificationCompleteBody: 'Ваша карта подтверждена. Вы можете снова попробовать совершить платёж.',
    refusal: {
      consentTitle: 'Требуется подтверждение карты',
      consentMessage: 'Подтвердите эту карту для терминальных платежей на портале',
      scopeTitle: 'Дистанционные расходы требуют одобрения',
      scopeMessage:
        'Это требует разрешенных дистанционных расходов. Начните сверху, чтобы разрешить это, а затем повторите.',
      revokedTitle: 'Дистанционные расходы были остановлены',
      revokedByAdmin: 'Администратор остановил дистанционные расходы на этот терминал.',
      revokedByUser: 'Вы остановили дистанционные расходы на этот терминал.',
      revokedReconnect: actor =>
        `${actor}Переподключитесь через Настройки → Шлюз, чтобы повторно авторизовать это устройство.`,
      sessionTitle: 'Заседание завершено',
      sessionMessage: 'Ваш сеанс был записан. Зарегистрируйтесь в Settings → Gateway.',
      remoteSpendingOffTitle: 'Дистанционные расходы отменяются',
      remoteSpendingOffMessage:
        'Дистанционные расходы на этот счет отключены - платежный администратор может включить его с портала Hermes Страница агента.',
      roleTitle: 'Необходима роль администратора',
      roleMessage:
        'Для добавления средств нужен администратор / владелец организации. Спросите администратора или управляйте на портале.',
      freshTopUpTitle: 'Начните новый топ',
      freshTopUpMessage: 'Этот ключ зарядки уже использовался на другую сумму. Начните новый топап.',
      noSavedCardTitle: 'Нет сохраненной карты',
      noSavedCardMessage:
        'Пока нет сохраненной карты для оплаты терминала. Установите его на портале (разовые покупки не сохраняют многоразовую карту).',
      orgAccessTitle: 'Доступ в организацию отказано',
      orgAccessMessage: 'Этот токен не связан с организацией, которой вы можете управлять',
      monthlyCapTitle: 'Ежемесячный лимит расходов достиг',
      monthlyCapRemaining: remaining => `Ежемесячный лимит расходов достигнут — $${remaining} headroom left.`,
      monthlyCapMessage: 'Ежемесячный лимит расходов достигнут.',
      rateLimitTitle: 'Слишком много обвинений сейчас',
      rateLimitMessage: minutes =>
        `Слишком много обвинений прямо сейчас${minutes ? ` (try again in ~${minutes} min)` : ''}Это не провал платежа.`,
      stripeTitle: 'У Стрип есть проблемы',
      stripeMessage: minutes =>
        `У Стрип есть проблемы — попробуйте снова${minutes ? ` in ~${minutes} min` : ' shortly'}`,
      planLimitTitle: 'Достигнут предел ежедневного изменения плана',
      planLimitMessage: 'Достигнут предел ежедневного изменения плана — попробуйте завтра',
      endpointTitle: 'Конечная точка оплаты недоступна',
      endpointMessage:
        'Конечная точка выставления счета вернула ответ non-JSON (он может быть недоступен в этом развертывании).',
      timeoutTitle: 'Запрос на биллинг отложен',
      timeoutMessage: 'Запрос на выставление счетов отложен.',
      transportTitle: 'Связь с биллингом провалилась',
      transportMessage: 'Запрос на выставление счетов провалился до того, как он достиг шлюза.',
      genericTitle: 'Запрос Биллинга провалился',
      genericMessage: 'Биллинговый запрос провалился.'
    }
  },
  sendDiagnostics: {
    title: 'Отправить диагностику на Nous',
    privacyNotice:
      'При этом пакет отладки загружается во внутреннее хранилище Nous (а не в общедоступную папку). Он включает в себя системную информацию (ОС, версии, поставщика, какие ключи API настроены — но не сами ключи) и полные журналы агента, шлюза и рабочего стола (до 512 КБ каждый), которые, вероятно, содержат содержимое разговора, выходные данные инструмента и пути к файлам. Перед загрузкой секреты редактируются. Пакет доступен для просмотра только сотрудникам Nous и модераторам Discord, внесенным в белый список. Он автоматически удаляется через 14 дней.',
    upload: 'Загрузить',
    uploading: 'Загрузка…',
    cancel: 'Отменить',
    close: 'Закрыть',
    copyLink: 'Скопировать ссылку',
    uploadIdFallback: id => `Ссылка на просмотр не возвращена — ID загрузки цитаты${id}поддерживать`,
    doneTitle: 'Диагностика отправлена',
    doneDescription:
      'Ваш пакет был загружен конфиденциально. Поделитесь ссылкой ниже в своей теме поддержки, чтобы команда могла видеть ваши журналы.',
    failedTitle: 'Загрузка не удалась',
    failedHint:
      'Вы также можете запустить `hermes debug share --nous` из терминала или `hermes debug share --local`, чтобы распечатать отчет без загрузки.',
    handoffLead: 'Продолжайте обсуждение в:',
    links: {
      github: 'GitHub Проблемы',
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
    minimizeWindow: 'Минимизация окна',
    restoreWindow: 'Восстановить окно',
    maximizeWindow: 'Максимизация окна',
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
      'session.archive': 'В архив текущий сеанс',
      'workspace.newWorktree': 'Новый worktree',
      'workspace.openFolder': 'Открыть папку как проект',
      'composer.focus': 'Сфокусировать композер',
      'composer.modelPicker': 'Открыть выбор модели',
      'composer.voice': 'Начать / остановить голосовой диалог',
      'view.toggleSidebar': 'Показать / скрыть панель сеансов',
      'view.toggleRightSidebar': 'Показать / скрыть браузер файлов',
      'view.toggleReview': 'Показать / скрыть панель ревью',
      'view.toggleStatusbar': 'Показать / скрыть строку состояния',
      'view.toggleTabStrip': 'Показать / скрыть вкладки',
      'view.showFiles': 'Показать браузер файлов',
      'view.showBrowser': 'Открыть браузер',
      'view.toggleHud': 'Включить / выключить режим HUD',
      'hud.snapToPointer': 'Переместить HUD под курсор (глобально, пока HUD открыт)',
      'view.showTerminal': 'Показать / скрыть терминал',
      'view.newTerminal': 'Новый терминал',
      'view.nextTerminal': 'Следующий терминал',
      'view.prevTerminal': 'Предыдущий терминал',
      'view.closeTerminal': 'Закрыть терминал',
      'view.selectionToComposer': 'Отправить выделение композитору',
      'view.terminalCopy': 'Копировать выделенное из терминала',
      'view.terminalPaste': 'Вставить в терминал',
      'view.closeTab': 'Закрыть вкладку',
      'view.reopenTab': 'Восстановить закрытую вкладку',
      'view.flipPanes': 'Поменять панели местами',
      'view.findInPage': 'Найти на странице',
      'view.findNext': 'Следующее вхождение',
      'view.findPrevious': 'Предыдущее вхождение',
      'appearance.toggleMode': 'Сменить светлую / тёмную тему',
      'layout.editMode': 'Режим редактирования макета переключателя',
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
      'view.cycleSidebarGrouping': 'Группировка циклических сессий',
      'view.toggleProfileRail': 'Показать / скрыть панель профилей',
      'view.terminalSelection': 'Отправить выделенное из терминала в композер'
    }
  },
  paletteCommands: {
    reloadDesktopPlugins: 'Перезагрузить настольные плагины',
    resetLayout: 'Сброс макета',
    toggleStatusBar: 'Переключить строку состояния',
    keyboardShortcuts: 'Сочетания клавиш',
    exportProfile: 'Экспорт профиля…',
    importProfile: 'Импорт профиля…',
    toggleTerminal: 'Переключить терминал',
    toggleLogs: 'Переключать бревна',
    toggleYolo: 'Тоггл Йоло'
  },
  timelineEvents: {
    modelChanged: 'изменилась модель',
    resumedInterruptedTurn: 'возобновленный прерванный поворот',
    personalityChanged: 'личность изменилась',
    backgroundAgentWorkFinished: 'завершилась работа агента',
    backgroundAgentsFinished: count => `${count} background agent${count === 1 ? '' : 's'} finished`
  },
  findInPage: {
    next: 'Следующее вхождение',
    previous: 'Предыдущее вхождение'
  },
  language: {
    label: 'Язык',
    description: 'Выберите язык интерфейса приложения.',
    saving: 'Сохранение языка…',
    saveError: 'Не удалось обновить язык',
    switchTo: 'Сменить язык',
    searchPlaceholder: 'Поиск языка…',
    noResults: 'Языки не найдены'
  },
  quickEntry: {
    label: 'Быстрый ввод',
    askPlaceholder: 'Задайте вопрос Hermes..',
    disconnectedPlaceholder: 'Не подключен — откройте Hermes для переподключения',
    sendTo: 'Отправить в',
    targetSession: 'Целевая сессия',
    currentChat: 'Текущий чат',
    newSession: 'Новая сессия'
  },
  petOverlay: {
    messagePlaceholder: 'Сообщение..',
    openInHermes: 'Открыть в Hermes'
  },
  settings: {
    closeSettings: 'Закрыть настройки',
    exportConfig: 'Экспорт конфигурации',
    importConfig: 'Импорт конфигурации',
    resetToDefaults: 'Сбросить к значениям по умолчанию',
    resetConfirm: 'Сбросить все настройки к значениям Hermes по умолчанию?',
    exportFailed: 'Не удалось экспортировать',
    resetFailed: 'Не удалось сбросить',
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
      about: 'О программе',
      billing: 'Оплата',
      notifications: 'Уведомления',
      vault: 'Пароли и логины'
    },
    plugins: {
      title: 'Плагины приложения',
      blurb: 'Встроенные или добавленные в папку desktop-plugins. Отключите, чтобы выгрузить без перезапуска.',
      count: n => `Установлено: ${n}`,
      openFolder: 'Открыть папку плагинов',
      rescan: 'Пересканировать',
      reveal: 'Показать в файловом менеджере',
      enable: 'Включить',
      disable: 'Отключить',
      failed: 'ошибка',
      empty: 'Плагины приложения пока не установлены.',
      kinds: {
        bundled: 'встроенный',
        disk: 'на диске',
        runtime: 'runtime'
      },
      agentHalfMissing: 'агент здесь наполовину отсутствует',
      agentHalfMissingTip:
        'Это настольная половина входящего в комплект плагина, но его агентская половина не установлена в подключенном в данный момент бэкенде/профиле. Установите его из Возможности → Плагины.',
      installModal: {
        installFromGit: 'Установить из Git',
        reviewRepository: 'Обзор репозитория',
        repoPlaceholder: 'https://github.com/owner/repo',
        title: 'Установка плагина',
        description: 'Перед установкой посмотрите, что содержит этот репозиторий.',
        repoLabel: 'Репозиторий',
        includesHeading: 'Состав пакета',
        agentLabel: 'Плагин агента',
        desktopLabel: 'UI приложения',
        agentTargetLocal: (profile, dir) => `Устанавливается в локальный бэкенд ${profile} (${dir})`,
        agentTargetRemote: profile => `Устанавливается в подключённый бэкенд ${profile}`,
        catalogPinned: (name, sha) =>
          `Запись каталога Hermes "${name}" — компонент агента устанавливается на проверенный контакт.${sha ? ` ${sha}` : ''}, а не кончик ветки.`,
        reviewedHeading: 'Проверенная запись в каталоге',
        reviewedIntro:
          'Эта запись была проверена человеком при закрепленном коммите. Вы все равно можете проверить точный код ниже.',
        restartToApply: 'Перезапустите шлюз, чтобы плагин вступил в силу.',
        restartNow: 'Перезапустить шлюз',
        missingEnvAction: 'Настройте это',
        alreadyInstalled: (name: string) => `${name}уже установлен.`,
        desktopTarget: 'Устанавливается в локальную папку desktop-plugins этого приложения',
        desktopTargetFromPackage: 'Загружено в это приложение из пакета выше — одинаково для каждого профиля.',
        desktopOnlyNote: 'Пакеты только для приложения не устанавливают плагин агента.',
        insecureWarning:
          'Этот URL использует небезопасную или локальную схему. Для боевой установки предпочитайте https:// или git@.',
        securityHeading: 'Перед установкой',
        securityIntro:
          'Устанавливайте только из проверенных источников — при желании просмотрите репозиторий ниже, чтобы увидеть, что будет добавлено.',
        sourceHeading: 'Исходный код',
        viewRepository: 'Посмотреть репозиторий',
        viewPluginFiles: 'Посмотреть файлы плагина',
        gitCloneLabel: 'URL для git clone',
        enableAgent: 'Включить плагин агента после установки',
        forceReinstall: 'Принудительная переустановка (заменить, если уже установлен)',
        pinToCommit: 'Закрепить на коммите (необязательно)',
        pinToCommitPlaceholder: 'Полный SHA коммита (40 символов)',
        pinToCommitHint:
          'Все, кто установит этот SHA, получат одинаковый код; плагин перестанет обновляться до смены пина. Оставьте пустым для последнего коммита.',
        pinToCommitInvalid: 'Нужен полный SHA коммита из 40 символов (ветки и теги не принимаются).',
        install: 'Установить',
        installing: 'Установка…',
        probing: 'Осмотр репозитория…',
        probeUnavailable: 'Осмотр плагинов недоступен в этом окружении.',
        desktopUnavailable: 'Установка плагинов приложения недоступна в этом окружении.',
        selectComponent: 'Выберите хотя бы один компонент для установки.',
        agentSuccess: name => `Плагин агента ${name} установлен`,
        desktopSuccess: name => `Плагин приложения ${name} установлен`,
        agentFailed: 'Не удалось установить плагин агента',
        desktopFailed: 'Не удалось установить плагин приложения',
        missingEnv: (_name, vars) => `Не хватает переменных окружения: ${vars}. Добавьте их в Настройки → Ключи.`,
        profileLabel: 'Установить для профиля'
      }
    },
    vault: {
      title: 'Пароли и логины',
      blurb:
        'Скажите «войдите в GitHub», и агент войдет в систему вместо вас. Когда он впервые встречает страницу входа в систему, он тут же просит вас ввести логин; после этого он просто работает. Пароли на этой машине шифруются и вводятся прямо на страницу — модель их никогда не видит.',
      count: n => `${n}сохранено`,
      loadFailed: 'Не удалось загрузить элементы хранилища.',
      empty: 'Еще ничего не сохранено',
      emptyDesc:
        'Здесь не нужно ничего добавлять. Попросите агента войти на сайт, и он сразу же попросит вас ввести логин. Используйте «Добавить», если вы предпочитаете ввести его заранее.',
      add: 'Добавить',
      addTitle: 'Добавьте логин, карту или адрес',
      addDescription: 'Хранится в зашифрованном виде на этом компьютере. Агент никогда не видит пароль.',
      added: 'Сохранено.',
      adding: 'Сохранение…',
      addConfirm: 'Сохранить',
      kindField: 'Добрый',
      kinds: {
        login: 'Войти',
        payment: 'Платежная карта',
        address: 'Адрес'
      },
      labelField: 'Этикетка',
      labelPlaceholder: 'например Рабочий аккаунт GitHub',
      labelRequired: 'Требуется этикетка.',
      originField: 'Происхождение сайта',
      originPlaceholder: 'https://github.com',
      originPlaceholderCheckout: 'https://shop.example.com',
      originInvalid: 'Введите действительный URL, например https://example.com..',
      identifierTypeField: 'Тип идентификатора',
      identifierTypes: {
        email: 'Электронная почта',
        phone: 'Телефон',
        username: 'Имя пользователя'
      },
      identifierField: 'Идентификатор',
      identifierShown: identifier => identifier,
      passwordField: 'Пароль',
      loginFieldsRequired: 'Требуется идентификатор и пароль.',
      cardNumberField: 'Номер карты',
      cardNameField: 'Имя на карточке',
      expMonthField: 'Эксп. месяц',
      expYearField: 'Эксп. год',
      cvcField: 'CVC',
      postalField: 'Почтовый индекс',
      addressLine1Field: 'Адресная строка 1',
      addressLine2Field: 'Адресная строка 2',
      cityField: 'Город',
      stateField: 'Штат/регион',
      countryField: 'Страна',
      optional: '(необязательно)',
      createdOn: date => `Добавлено${date}`,
      deleteAction: 'Удалить сохраненный элемент',
      otpField: 'Ключ аутентификации',
      otpPlaceholder: 'Секрет Base32 или ссылка otpauth://',
      otpHint:
        '«Ключ настройки», который отображается на сайте при включении 2FA. После его сохранения Hermes сам генерирует коды.',
      twoFactorBadge: '2FA авто',
      deleteTitle: 'Удалить этот элемент?',
      deleteDescription: label => `"${label}" будет удалено. Это действие нельзя отменить.`,
      deleteConfirm: 'Удалить',
      sources: {
        title: 'Менеджеры паролей',
        blurb:
          'Установленные менеджеры паролей подхватываются автоматически. Агент попросит вас разблокировать его в первый раз, когда ему потребуется войти в систему (один раз за сеанс); в памяти остается только токен сеанса, и агент никогда не видит ваш главный пароль или какой-либо логин.',
        toggleFailed: 'Не удалось обновить менеджер паролей',
        notInstalled: name =>
          `Не обнаружено. Установите${name}инструмент командной строки и войдите в него; Hermes подхватывает это автоматически.`,
        disabledDesc: 'Обнаружен, но отключен для Hermes.',
        lockedDesc:
          'Обнаружено. Агент попросит вас разблокировать его, когда ему понадобится логин, или разблокировать сейчас.',
        unlockedDesc:
          'Разблокировано для этой сессии. Блокируется автоматически после 30 минут простоя или при закрытии Hermes.',
        statusLocked: 'Заблокировано',
        statusNotDetected: 'Не обнаружено',
        statusOff: 'Выкл',
        statusUnlocked: 'Разблокировано',
        unlock: 'Разблокировать',
        unlocking: 'Разблокировка…',
        lock: 'Блокировка',
        unlocked: name => `${name}разблокировано для этой сессии.`,
        unlockTitle: name => `Разблокировать${name}`,
        unlockDescription:
          'Введите свой мастер-пароль. Он передается менеджеру паролей на этом компьютере и удаляется — он никогда не сохраняется, не регистрируется и не отображается агенту.',
        masterPasswordPlaceholder: 'Мастер-пароль'
      }
    },
    notifications: {
      title: 'Уведомления',
      intro: 'Системные уведомления (не всплывающие внутри приложения). Настраивается для каждого устройства.',
      enableAll: 'Включить уведомления',
      enableAllDesc: 'Если выключено — все уведомления ниже будут заглушены.',
      focusedHint: 'Оповещения о завершении срабатывают только пока Hermes в фоне.',
      kinds: {
        approval: {
          label: 'Нужно одобрение',
          description: 'Команда ожидает вашего одобрения или отклонения.'
        },
        input: {
          label: 'Нужен ввод',
          description: 'Hermes задал вопрос или требует пароль/секрет.'
        },
        turnDone: {
          label: 'Ответ готов',
          description: 'Ход завершился, пока Hermes был в фоне.'
        },
        turnError: {
          label: 'Ход не удался',
          description: 'Ошибки фоновых ходов.'
        },
        backgroundDone: {
          label: 'Фоновая задача завершена',
          description: 'Фоновая команда терминала выполнена.'
        },
        credits: {
          label: 'Оповещения о кредитах',
          description: 'Доступ к кредитам приостановлен или восстановлен.'
        },
        plugin: {
          label: 'Уведомления плагинов',
          description: 'Плагин приложения отправил уведомление, пока Hermes был в фоне.'
        }
      },
      test: 'Отправить тестовое уведомление',
      testTitle: 'Hermes',
      testBody: 'Уведомления работают.',
      testSent:
        'Тест отправлен. Если ничего не появилось, проверьте разрешения на уведомления в системе и режим «Не беспокоить».',
      testUnsupported: 'Эта система не поддерживает системные уведомления.',
      completionSoundTitle: 'Звук завершения',
      completionSoundDesc: 'Воспроизводится, когда ход агента завершён. Выберите пресет и прослушайте здесь.',
      completionSoundPreview: 'Прослушать'
    },
    memoryProvider: {
      loadFailed: detail => `Не удалось загрузить настройки поставщика памяти:${detail}`,
      loadFailedFallback: 'Настройки провайдера памяти не удалось загрузить',
      loading: 'Настройки провайдера памяти..',
      settingsTitle: label => `${label}настройки`,
      fieldSet: label => `${label}набор`,
      fieldNotSet: label => `${label}не задано`,
      fullConfig: 'Полная конфигурация..',
      fullConfigTitle: label => `${label}— полная конфигурация`,
      fullConfigDescription: (label, profile) =>
        `Каждый${label}вариант для${profile}профиль. Пустые поля используют разрешённый хост или встроенное значение по умолчанию.`,
      reference: label => `${label}справочник по конфигурации`,
      otherGroup: 'Другой',
      saveChanges: 'Сохранить изменения',
      fieldAbout: label => `О${label}`,
      leaveBlankToKeep: 'Оставьте пустой, чтобы сохранить текущую стоимость',
      valueSet: 'набор',
      connectionStartFailed: 'Не удалось запустить соединение.',
      connectionTimedOut: 'Время вышло — попробуйте еще раз.',
      connectionFailed: 'Связь провалилась.',
      connectViaOAuth: 'Подключение через OAuth',
      reconnect: 'Переподключиться',
      connect: 'Подключиться',
      apiKeySet: 'API ключ',
      oauthSet: 'Настройка OAuth',
      waitingForConsent: 'В ожидании согласия браузера..',
      saved: label => `${label}настройки сохранены`,
      updated: 'Конфигурация поставщика памяти была обновлена.',
      saveFailed: label => `Не удалось сохранить${label}настройки`
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
      config: 'Поиск настроек…',
      gateway: 'Подключение шлюза…',
      keys: 'Поиск API-ключей…',
      mcp: 'Поиск MCP-серверов…',
      sessions: 'Поиск архивных сеансов…'
    },
    modeOptions: {
      light: {
        label: 'Светлая',
        description: 'Яркие поверхности'
      },
      dark: {
        label: 'Тёмная',
        description: 'Мягкое рабочее пространство'
      },
      system: {
        label: 'Системная',
        description: 'Следовать настройкам ОС'
      }
    },
    appearance: {
      title: 'Внешний вид',
      intro: 'Только для приложения. Режим — это яркость, тема — палитра и оформление чата.',
      themeSearchPlaceholder: 'Выполните поиск по своим темам или на торговой площадке VS Code…',
      noInstalledThemeMatches: query => `Никаких установленных тем не соответствует"${query}”.`,
      marketplaceThemeSource: 'Торговая площадка VS Code Marketplace',
      colorMode: 'Цветовой режим',
      colorModeDesc: 'Выберите фиксированный режим или позвольте Hermes следовать настройкам системы.',
      toolViewTitle: 'Отображение вызовов инструментов',
      toolViewDesc: 'Режим «Продукт» скрывает сырые данные инструментов, «Технический» показывает полный вход/выход.',
      reasoningCollapsedTitle: 'Сворачивать «мышление» по умолчанию',
      reasoningCollapsedDesc:
        'Стриминговое рассуждение остаётся доступным, но не разворачивается, пока вы его не откроете.',
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
        'Показывать вкладки над зоной. Автоматически скрываются для одной панели, если не открыта другая зона чата или плитки.',
      tabStripAuto: 'Авто',
      tabStripAlways: 'Всегда',
      tabStripNever: 'Никогда',
      appActionsTitle: 'Действия приложения',
      appActionsDesc: 'Где в заголовке окна сидят Настройки, Макет и HUD. Справа оставляют место для вкладок слева.',
      appActionsLeft: 'Слева',
      appActionsRight: 'Справа',
      terminalFontTitle: 'Шрифт терминала',
      terminalFontDesc:
        'Выберите установленный шрифт для терминалов приложения. Nerd Fonts отображают Powerlevel10k и иконки оболочки; оставьте пустым, чтобы использовать встроенный JetBrains Mono.',
      terminalFontPlaceholder: 'MesloLGS NF или CSS-стек шрифтов',
      terminalFontPreview: 'Предпросмотр глифов',
      terminalFontReset: 'Использовать по умолчанию',
      translucencyTitle: 'Полупрозрачность окна',
      translucencyDesc:
        'Рабочий стол виден сквозь всё окно, включая текст. Отдельная настройка для светлой и тёмной тем.',
      translucencyGlassDesc:
        'Матовое стекло: рабочий стол виден как плавное размытие, а текст остаётся чётким. Отдельная настройка для светлой и тёмной тем.',
      translucencyModeClear: 'Прозрачная',
      translucencyModeGlass: 'Стекло',
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
      backdropDesc: 'Блёклый силуэт позади диалога.',
      userBubbleTitle: 'Пузырь сообщения',
      userBubbleDesc: 'Насколько прозрачны ваши сообщения. 0 — сплошная заливка, 100 — остаётся только контур.',
      introSplashTitle: 'Экран приветствия',
      introSplashDesc: 'Логотип и подсказка, показываемые на пустом чате.',
      reactionsTitle: 'Реакции на сообщения',
      reactionsDesc: 'Эмодзи-тапбеки в стиле iMessage — реагируйте на сообщения, и Hermes сможет реагировать на ваши.',
      tipsTitle: 'Советы в приложении',
      tipsDesc:
        'Случайные подсказки от приложения и Hermes. Каждый совет появляется один раз. Выключается автоматически после первых 30 дней; вы можете включить его снова.',
      tipsReset: (count: number) => `Show ${count} ${count === 1 ? 'чаевые' : 'советы'} again`,
      toursTitle: 'Экскурсии',
      toursDesc:
        'Позвольте Hermes освещать каждый шаг, помогая вам работать с приложением. Выключается автоматически после первых 30 дней; вы можете включить его снова.',
      composerPopoutTitle: 'Плавающий композер',
      composerPopoutDesc: 'Позволяет вытягивать композер из его док-зоны. Отключите, чтобы он был закреплён снизу.',
      vibeHeartsTitle: 'Вибе Сердца',
      vibeHeartsDesc:
        'Плавающие сердечки, когда вы говорите спасибо, или, добрый бот, или отправляете сердечко. Отдельно от реакций на сообщения выше.',
      embedsTitle: 'Встроенные превью',
      embedsDesc:
        'Богатые превью загружаются со сторонних сайтов (YouTube, X, …). «Спрашивать» показывает заглушку, пока вы не разрешите каждый источник; «Всегда» загружает их автоматически; «Выкл» оставляет обычные ссылки.',
      embedsAsk: 'Спрашивать',
      embedsAlways: 'Всегда',
      embedsOff: 'Выкл',
      embedsReset: count =>
        `Сбросить ${count} ${RU_NOUN(count, 'разрешённый сервис', 'разрешённых сервиса', 'разрешённых сервисов')}`,
      resumeLastSessionTitle: 'Открывать последний чат при запуске',
      resumeLastSessionDesc:
        'Продолжайте с того места, где остановились. Выключите, чтобы всегда начинать с нового чата.',
      product: 'Продукт',
      productDesc: 'Дружелюбная активность инструментов с краткими сводками.',
      technical: 'Технический',
      technicalDesc: 'Показывать сырые аргументы/результаты инструментов и низкоуровневые детали.',
      themeTitle: 'Тема',
      themeDesc: 'Только палитры для приложения. Выбранный режим применяется поверх.',
      themeProfileNote: profile => `Сохранено для профиля ${profile} — у каждого профиля своя тема.`,
      installTitle: 'Установить из VS Code',
      installDesc:
        'Вставьте id расширения с Marketplace (напр. dracula-theme.theme-dracula), чтобы преобразовать его цветовую тему в палитру приложения.',
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
          'Заберите анимированного питомца из petdex, который парит над приложением и реагирует на действия Hermes — «бегает», пока выполняются инструменты, радуется успеху и хмурится при ошибках.',
        restartHint:
          'Питомцам нужен быстрый перезапуск — текущее приложение запустилось до появления этой функции. Выйдите из Hermes и откройте снова, затем вернитесь сюда.',
        on: 'Вкл',
        off: 'Выкл',
        scaleTitle: 'Размер',
        scaleDesc: 'Меняет размер парящего питомца. Применяется мгновенно везде.',
        roamTitle: 'Блуждание',
        roamDesc: 'Позволить питомцу самому бродить по окну, пока всё бездействие.',
        chooseTitle: 'Выбрать питомца',
        chooseDesc: 'Выбор установит его (при необходимости) и сделает активным.',
        searchPlaceholder: 'Поиск питомцев…',
        unreachable: 'Не удалось связаться с галереей petdex. Проверьте соединение и откройте страницу заново.',
        noMatch: query => `Нет питомцев, подходящих под «${query}».`,
        installedTag: 'установлен',
        generatedTag: 'Сгенерирован',
        countCapped: (cap, total) => `Показаны ${cap} из ${total} — начните вводить, чтобы сузить выбор.`,
        count: n => `${n} ${RU_PLURAL(n, 'питомец', 'питомца', 'питомцев')}.`,
        uninstall: name => `Удалить ${name}`,
        delete: name => `Удалить навсегда ${name}`,
        deleteTitle: name => `Удалить ${name}?`,
        deleteBody: 'Питомец будет удалён безвозвратно — переустановить его будет нельзя.',
        deleteConfirm: 'Удалить',
        rename: name => `Переименовать ${name}`,
        renameTitle: 'Переименовать питомца',
        renamePlaceholder: 'Имя вашего питомца',
        renameSave: 'Сохранить',
        exportPet: name => `Экспортировать ${name}`,
        adoptFailed: slug => `Не удалось забрать ${slug}`,
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
      hideThreadTimelineTitle: 'Скрывать полоски истории диалога',
      hideThreadTimelineDesc: 'Скрывать полоски навигации вдоль правого края каждого диалога.',
      chatFontTitle: 'Шрифт чата',
      chatFontDesc:
        'Выберите установленный шрифт для чата и всего интерфейса. Удобно для шрифтов повышенной читаемости, например OpenDyslexic; оставьте пустым, чтобы использовать шрифт темы.',
      chatFontPlaceholder: 'OpenDyslexic или CSS-стек шрифтов',
      chatFontPreview: 'Предпросмотр',
      chatFontSample: 'Съешь же ещё этих мягких французских булок. 0123456789',
      chatFontReset: 'Шрифт темы'
    },
    fieldLabels: defineFieldCopy({
      model: 'Модель по умолчанию',
      modelContextLength: 'Окно контекста',
      fallbackProviders: 'Резервные модели',
      toolsets: 'Включённые наборы инструментов',
      timezone: 'Часовой пояс',
      display: {
        personality: 'Личность',
        showReasoning: 'Блоки рассуждений'
      },
      desktop: {
        repoScanEnabled: 'Автоматическое обнаружение репозиториев',
        repoScanRoots: 'Корни обнаружения репозиториев',
        repoScanExcludePaths: 'Исключаемые пути репозиториев'
      },
      agent: {
        maxTurns: 'Макс. шагов агента',
        imageInputMode: 'Вложения изображений',
        apiMaxRetries: 'Повторы API',
        serviceTier: 'Уровень сервиса',
        toolUseEnforcement: 'Принудительное использование инструментов',
        environmentProbe: 'Проверка среды выполнения',
        outputTruncationRetries: 'Повторы при лимите вывода',
        postToolEmptyRetries: 'Повторы пустого ответа после инструмента',
        thinkingPrefillRetries: 'Повторы префилла рассуждения',
        emptyResponseRetries: 'Повторы пустого ответа'
      },
      terminal: {
        cwd: 'Рабочий каталог',
        backend: 'Бэкенд выполнения',
        timeout: 'Тайм-аут команд',
        persistentShell: 'Персистентная оболочка',
        envPassthrough: 'Пропуск переменных окружения',
        dockerImage: 'Образ Docker',
        singularityImage: 'Образ Singularity',
        modalImage: 'Образ Modal',
        daytonaImage: 'Образ Daytona',
        containerPersistent: 'Сохранять файловую систему контейнера'
      },
      fileReadMaxChars: 'Лимит чтения файла',
      toolOutput: {
        maxBytes: 'Лимит вывода терминала',
        maxLines: 'Лимит страниц файла',
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
        enabled: 'Чекпоинты файлов',
        maxSnapshots: 'Лимит чекпоинтов'
      },
      voice: {
        recordKey: 'Горячая клавиша голосового ввода',
        maxRecordingSeconds: 'Макс. длительность записи',
        autoTts: 'Зачитывать ответы вслух',
        clientDirect: 'Прямое подключение клиента'
      },
      stt: {
        enabled: 'Распознавание речи',
        echoTranscripts: 'Повторять расшифровки',
        provider: 'Провайдер распознавания речи',
        local: {
          model: 'Локальная модель транскрипции',
          language: 'Язык транскрипции'
        },
        openai: {
          model: 'Модель STT OpenAI'
        },
        groq: {
          model: 'Модель STT Groq'
        },
        mistral: {
          model: 'Модель STT Mistral'
        },
        elevenlabs: {
          modelId: 'Модель STT ElevenLabs',
          languageCode: 'Язык ElevenLabs',
          tagAudioEvents: 'Метки звуковых событий',
          diarize: 'Разделение спикеров'
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
          autoSpeechTags: 'Автомаркеры речи xAI',
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
        memoryEnabled: 'Персистентная память',
        userProfileEnabled: 'Профиль пользователя',
        memoryCharLimit: 'Бюджет памяти',
        userCharLimit: 'Бюджет профиля',
        provider: 'Провайдер памяти'
      },
      context: {
        engine: 'Движок контекста'
      },
      compression: {
        enabled: 'Авто-сжатие',
        threshold: 'Порог сжатия',
        codexGpt55Autoraise: 'Автоповышение сжатия Codex',
        targetRatio: 'Целевое сжатие',
        protectLastN: 'Защищённые недавние сообщения'
      },
      auxiliary: {
        compression: {
          timeout: 'Таймаут модели сжатия (с)'
        }
      },
      delegation: {
        model: 'Модель субагента',
        provider: 'Провайдер субагента',
        maxIterations: 'Лимит ходов субагента',
        maxConcurrentChildren: 'Параллельные субагенты',
        childTimeoutSeconds: 'Тайм-аут субагента',
        reasoningEffort: 'Глубина рассуждений субагента'
      },
      updates: {
        nonInteractiveLocalChanges: 'Локальные изменения при обновлении из приложения'
      }
    }),
    fieldDescriptions: defineFieldCopy({
      model: 'Используется для новых чатов, если вы не выберете другую модель в композере.',
      modelContextLength: 'Оставьте 0, чтобы использовать обнаруженное окно контекста выбранной модели.',
      fallbackProviders:
        'Резервные записи provider:model, которые будут пробоваться, если модель по умолчанию не сработает.',
      display: {
        personality: 'Стиль ассистента по умолчанию для новых сеансов.',
        showReasoning: 'Показывать блоки рассуждений, когда бэкенд их предоставляет.'
      },
      desktop: {
        repoScanEnabled: 'Сканировать локальные папки на Git-репозитории, чтобы показывать их в Проектах.',
        repoScanRoots: 'Папки для сканирования. Оставьте пустым, чтобы сканировать домашний каталог.',
        repoScanExcludePaths: 'Папки и их вложенные, которые нужно пропускать при обнаружении репозиториев.'
      },
      timezone: 'Идентификатор часового пояса IANA. Пустое значение — системный часовой пояс.',
      agent: {
        imageInputMode: 'Управляет тем, как вложения изображений отправляются модели.',
        maxTurns: 'Верхний предел ходов с вызовами инструментов, после которого Hermes останавливает запуск.',
        outputTruncationRetries:
          'Повторять запрос только когда провайдер сообщает о лимите выходных токенов до появления видимого текста. Каждый повтор заново отправляет тот же запрос и может тарифицироваться повторно. Оставьте 0 (рекомендуется); максимум 3.',
        postToolEmptyRetries:
          'Отправлять подсказку на продолжение, если после вызова инструментов нет видимого текста. Каждый повтор может тарифицироваться. 0 — выключить; максимум 3.',
        thinkingPrefillRetries:
          'Подставлять ответ только с рассуждением, чтобы модель продолжила до видимого текста. Каждый повтор может тарифицироваться. 0 — выключить; максимум 3.',
        emptyResponseRetries:
          'Повторять, если предыдущие уровни восстановления не дали видимого текста. Возможна повторная тарификация; защита стоимости может завершить раньше. 0 — выключить; максимум 3.',
        environmentProbe:
          'Определять параметры среды выполнения для новых сеансов. Для контейнеров используется временная песочница, удаляемая после проверки; при отключении используется статическое описание.'
      },
      terminal: {
        cwd: 'Папка проекта по умолчанию для инструментов и терминала.',
        persistentShell: 'Сохранять состояние оболочки между командами, если бэкенд это поддерживает.',
        envPassthrough: 'Переменные окружения, которые передавать в выполнение инструментов.',
        dockerImage: 'Образ контейнера, используемый, когда бэкенд выполнения — Docker.',
        singularityImage: 'Образ, используемый, когда бэкенд выполнения — Singularity.',
        modalImage: 'Образ, используемый, когда бэкенд выполнения — Modal.',
        daytonaImage: 'Образ, используемый, когда бэкенд выполнения — Daytona.',
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
        redactSecrets: 'Скрывать обнаруженные секреты из видимого для модели содержимого, когда это возможно.'
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
      voice: {
        autoTts: 'Автоматически зачитывать ответы ассистента.'
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
          sampleRate: 'Частота дискретизации аудио в Гц. Выше = лучшее качество, большие файлы.',
          bitRate: 'Битрейт MP3 в бит/с. Действует только когда кодек — mp3.'
        },
        neutts: {
          device: 'Локальное устройство инференса для NeuTTS.'
        }
      },
      stt: {
        enabled: 'Включать локальное или провайдерное распознавание речи.',
        echoTranscripts: 'Возвращать в чат «сырую» 🎙️ расшифровку голосовых сообщений.',
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
          'Использовать ваш настоящий профиль браузера с сохранёнными входами и cookie. Отключите, чтобы работать в отдельном профиле Hermes.'
      }
    }),
    about: {
      heading: 'Hermes Desktop',
      version: value => `Версия ${value}`,
      versionUnavailable: 'Версия недоступна',
      bundleOutOfSync: 'Сборка приложения устарела',
      bundleOutOfSyncDesc:
        'Рантайм Hermes обновлён, но само приложение — ещё старая сборка: новые функции интерфейса (например, Bot Mode) не появятся до обновления. Запустите обновление ниже, чтобы пересобрать приложение. Если предупреждение не исчезнет, переустановите с последнего установщика.',
      bundleOutOfSyncAction: 'Скачать установщик',
      bundleSwapPending: 'Перезапустите, чтобы завершить обновление.',
      bundleSwapPendingDesc:
        'Обновленное приложение уже установлено — Hermes нужно только перезагрузить, чтобы загрузить его. Чаты и настройки не тронуты.',
      bundleSwapPendingAction: 'Перезапустите Hermes.',
      updates: 'Обновления',
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
      lastChecked: age => `Проверено ${age}`,
      automaticUpdates: 'Автоматические обновления',
      automaticUpdatesDesc: 'Hermes автоматически проверяет обновления в фоне и сообщает, когда они готовы.',
      branchCommit: (branch, commit) => `Ветка ${branch} · Коммит ${commit}`,
      never: 'никогда',
      justNow: 'только что',
      minAgo: count => `${count} ${RU_NOUN(count, 'минуту', 'минуты', 'минут')} назад`,
      hoursAgo: count => `${count} ${RU_NOUN(count, 'час', 'часа', 'часов')} назад`,
      daysAgo: count => `${count} ${RU_NOUN(count, 'день', 'дня', 'дней')} назад`,
      justNowSuffix: ' · только что'
    },
    config: {
      none: 'Нет',
      noneParen: '(нет)',
      builtinOnly: 'Только встроенные',
      notSet: 'Не задано',
      commaSeparated: 'значения через запятую',
      searchPlaceholder: 'Поиск…',
      noResults: 'Ничего не найдено',
      systemDefault: 'Системное по умолчанию',
      loading: 'Загрузка конфигурации Hermes…',
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
        'Не даёт этой машине засыпать, чтобы долгие или ночные прогоны продолжались. Экран при этом может гаснуть.',
      disableF12Title: 'Отключить F12 DevTools',
      disableF12Desc:
        'Блокирует открытие Developer Tools по F12. Ctrl+Shift+I (на Mac — Cmd+Opt+I) продолжает работать.',
      attachmentSizeTitle: 'Макс. размер превью / загрузки изображений',
      attachmentSizeDesc:
        'Насколько большой локальный файл приложение будет загружать для превью и вложений, в МБ. По умолчанию 16. Для удалённых неграфических вложений действует отдельный лимит 256 МБ. Слишком большое значение загружает весь файл в память и может подвесить или уронить приложение.',
      attachmentSizeUnit: 'МБ',
      attachmentSizeLabel: 'Макс. размер превью / загрузки изображений в мегабайтах',
      minimizeToTrayTitle: 'Сворачивать в трей',
      minimizeToTrayDesc:
        'Сворачивание окон или закрытие главного окна скрывает их в системном трее (строке меню macOS), оставляя Hermes работать. Для выхода выберите «Выйти из Hermes» в меню трея или нажмите Cmd+Q. По умолчанию выключено; действует только на этом устройстве.',
      minimizeToTrayUnavailable:
        'Системный трей недоступен. Окна будут сворачиваться и закрываться как обычно. Выключите и снова включите настройку, чтобы повторить попытку.',
      showOptions: 'Показать параметры'
    },
    quickEntry: {
      enabledTitle: 'Быстрый ввод',
      enabledDesc:
        'Глобальным горячим ключом вызывайте маленький композер откуда угодно и отправляйте запрос, не открывая Hermes.',
      shortcutTitle: 'Горячий ключ быстрого ввода',
      shortcutDesc: 'Нужен хотя бы один модификатор, например CommandOrControl+Shift+Space.',
      active: 'Горячий ключ активен.',
      takenBy: 'Это сочетание уже занято другим приложением — выберите другое.',
      invalidShortcut: 'Некорректное сочетание. Включите хотя бы одну модифицирующую клавишу.'
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
      manageInKeys: 'Управлять в API-ключах',
      docs: 'Документация',
      hideValue: 'Скрыть значение',
      revealValue: 'Показать значение',
      replace: 'Заменить',
      set: 'Установить',
      clear: 'Очистить'
    },
    connections: {
      title: 'Зарегистрированные шлюзы',
      intro:
        'Управляйте этим устройством и всеми шлюзами Hermes, до которых можно дотянуться через удалённые, SSH или Cloud-соединения.',
      stagedNote:
        'Переключайтесь между шлюзами из раздела «Сеансы». Профили, чаты, мессенджеры и cron-задачи остаются за своим шлюзом; работа на других шлюзах продолжается.',
      launchModeTitle: 'При запуске возвращаться к «Сеансам» на последнем шлюзе',
      launchModeDesc: 'Если выключено, «Сеансы» открываются на основном шлюзе.',
      searchPlaceholder: 'Поиск шлюзов…',
      noSearchResults: 'Шлюзы, подходящие под поиск, не найдены.',
      loadFailed: 'Не удалось загрузить соединения',
      currentPill: 'Текущий',
      primaryPill: 'Основной',
      managedPill: 'Управляется приложением',
      addConnection: 'Добавить соединение',
      editConnection: 'Изменить',
      removeConnection: 'Удалить',
      removeConfirmTitle: 'Удалить это соединение?',
      removeConfirmDesc: label =>
        `«${label}» будет удалено из этого приложения. Сама инстанция не затрагивается — её можно добавить снова в любой момент.`,
      makePrimary: 'Сделать основным',
      testConnection: 'Проверить',
      testOk: 'Доступен',
      testFailed: 'Проверка соединения не удалась',
      saveFailed: 'Не удалось сохранить соединение',
      removeFailed: 'Не удалось удалить соединение',
      updateAll: 'Обновить все инстансы',
      updateAllRunning: 'Обновление всех инстансов…',
      updateAllDone: 'Обновления разосланы',
      updateAllFailed: 'Не удалось разослать обновления',
      updateSkippedCloud: 'Управляется Hermes Cloud',
      thisDevice: 'Это устройство',
      kindLocal: 'Локальный',
      kindRemote: 'Удалённый шлюз',
      kindCloud: 'Hermes Cloud',
      kindSsh: 'SSH',
      kindLocalDesc: 'Рантайм Hermes, которым управляет это приложение.',
      kindRemoteDesc: 'Шлюз Hermes, доступный по HTTP(S) — LAN, Tailscale или интернет.',
      kindCloudDesc: 'Хостинговая инстанция, обнаруженная через ваш аккаунт Hermes Cloud.',
      kindSshDesc: 'Установка Hermes, доступная по SSH.',
      labelTitle: 'Имя',
      labelDesc:
        'Обязательно. Показывается везде, где фигурирует эта инстанция; должно быть уникальным (напр. «Домашняя лаборатория», «Рабочий ноутбук»).',
      labelPlaceholder: 'Домашняя лаборатория',
      urlTitle: 'URL шлюза',
      sshHostTitle: 'SSH-хост',
      headersTitle: 'Дополнительные заголовки шлюза',
      headersDesc:
        'Отправляются с каждым HTTP- и WebSocket-запросом к этому шлюзу — например, для прокси доступа вроде Cloudflare Access (CF-Access-Client-Id / CF-Access-Client-Secret). Значения хранятся зашифрованными. Заголовки, которыми управляет Hermes (Authorization, Cookie, Host…), игнорируются.',
      headerValuePlaceholder: 'Значение',
      headerValueSaved: 'Сохранено — оставьте пустым, чтобы не менять',
      headerAdd: 'Добавить заголовок',
      headerRemove: 'Удалить',
      duplicateLocal: 'Это приложение уже управляет локальным соединением — их может быть только одно.',
      duplicateUrl: label => `Соединение с этим URL шлюза уже есть («${label}»).`,
      duplicateSsh: label => `Соединение с этим SSH-хостом уже есть («${label}»).`,
      sameBackendHint: label => `Тот же бэкенд, что и «${label}»`,
      localAddHint: 'Локальное недоступно: управляемое локальное соединение уже существует (их всегда только одно).',
      cloudAddHint:
        'Подсказка: вход в Hermes Cloud выше автоматически обнаруживает ваших агентов — эту форму используйте только для ручной регистрации известного URL инстанса.',
      save: 'Сохранить соединение',
      saving: 'Сохранение…',
      cancel: 'Отмена',
      empty: 'Соединения пока не зарегистрированы.'
    },
    managedUpdates: {
      title: 'Управляемые обновления',
      intro:
        'Обновление SSH, управляемое настольным компьютером, устанавливается транзакционно: сеансы истощаются, удаленная проверка обновляется, и каждый профиль восстанавливается с соответствующей квитанцией.',
      sshConnection: 'Установка SSH с настольного компьютера',
      update: 'Обновление',
      updating: 'Обновление…',
      progress: 'Слив сеансов, обновление удаленной установки и восстановление профилей…',
      updated: 'Обновлено',
      partial: 'Обновлено — восстановление не удалось',
      refused: 'Отказался',
      failed: 'Обновление не выполнено',
      alreadyRunning: 'Обновление уже выполняется',
      receipt: (id: string, outcome: string) => `Квитанция${id} · ${outcome}`,
      receiptVersions: (pre: string, post: string) => `${pre} → ${post}`,
      scopesRestored: (profiles: string) => `Восстановленные профили:${profiles}`,
      scopeNotRestored: (profile: string, error: string) => `Профиль»${profile}” not restored: ${error}`
    },
    gateway: {
      loading: 'Загрузка настроек шлюза…',
      unavailableTitle: 'Настройки шлюза недоступны',
      unavailableDesc: 'IPC-мост приложения не предоставляет настройки шлюза.',
      title: 'Подключение шлюза',
      envOverride: 'переопределение переменными окружения',
      intro:
        'По умолчанию — локальный. Используйте удалённый, когда приложение должно управлять бэкендом Hermes в другом месте. Соединения шлюзов — на уровне машины; профили обнаруживаются из подключённых шлюзов.',
      envOverrideTitle: 'Переменные окружения управляют этой сессией приложения.',
      envOverrideDesc:
        'Сбросьте HERMES_DESKTOP_REMOTE_URL и HERMES_DESKTOP_REMOTE_TOKEN, чтобы использовать сохранённую настройку ниже.',
      modeTitle: 'Режим подключения',
      localTitle: 'Локальный шлюз',
      localDesc: 'Запускает приватный бэкенд Hermes на localhost. Это значение по умолчанию, работает офлайн.',
      remoteTitle: 'Удалённый шлюз',
      remoteDesc: 'Подключает это приложение к удалённому бэкенду Hermes.',
      remoteAuthHint:
        'Хостинговые шлюзы используют OAuth или логин/пароль; самохостинговые могут использовать токен сессии.',
      cloudTitle: 'Hermes Cloud',
      cloudDesc: 'Войдите в Hermes Cloud один раз и выбирайте агентов из своего аккаунта — без вставки URL.',
      cloudSignInTitle: 'Hermes Cloud',
      cloudSignIn: 'Войти в Hermes Cloud',
      cloudSignedIn: 'Вы вошли в Hermes Cloud',
      cloudNeedsSignIn: 'Войдите в Hermes Cloud, чтобы обнаружить агентов в вашем аккаунте.',
      cloudSignedInDesc: 'Вы вошли. Выберите агента ниже; сессия обновляется автоматически.',
      cloudAgentsTitle: 'Ваши агенты',
      cloudOrgPickerTitle: 'Выберите организацию',
      cloudOrgSelect: 'Выбрать',
      cloudOrgChange: 'Сменить организацию',
      cloudOrgRole: role => `Роль: ${role}`,
      cloudLoadingAgents: 'Загрузка ваших агентов…',
      cloudNoAgents: {
        before: 'Агенты на этом аккаунте не найдены. Создайте агента в',
        linkText: 'портале Nous',
        after: ', затем обновите страницу.'
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
      cloudSignedOutTitle: 'Выход из Hermes Cloud',
      cloudSignedOutMessage: 'Сессия Hermes Cloud сброшена.',
      cloudConnectedTitle: 'Подключено',
      cloudConnectedPill: 'Подключено',
      cloudConnectedTo: name => `Подключено к ${name}.`,
      cloudAgentProvisioning: 'Развёртывание…',
      cloudStatusLabel: status => `Статус: ${status}`,
      remoteUrlTitle: 'Удалённый URL',
      remoteUrlDesc: 'Базовый URL удалённого бэкенда дашборда. Поддерживаются префиксы пути, например /hermes.',
      probing: 'Проверяем, как аутентифицируется этот шлюз…',
      probeError:
        'Пока не удалось связаться с этим шлюзом. Проверьте URL — способ аутентификации появится, когда он ответит.',
      signedIn: 'Вы вошли',
      signIn: 'Войти',
      signOut: 'Выйти',
      signInWith: provider => `Войти через ${provider}`,
      authTitle: 'Аутентификация',
      authSignedInPassword: 'Этот шлюз использует логин и пароль. Вы вошли; сессия обновляется автоматически.',
      authSignedInOauth: 'Этот шлюз использует OAuth. Вы вошли; сессия обновляется автоматически.',
      authNeedsPassword: 'Этот шлюз использует логин и пароль. Войдите, чтобы авторизовать это приложение.',
      authNeedsOauth: provider =>
        `Этот шлюз использует OAuth. Войдите через ${provider}, чтобы авторизовать это приложение.`,
      tokenTitle: 'Токен сессии',
      tokenDesc:
        'Токен сессии дашборда для доступа через REST и WebSocket. Оставьте пустым, чтобы сохранить текущий токен.',
      existingToken: value => `Текущий токен ${value}`,
      savedToken: 'сохранён',
      pasteSessionToken: 'Вставьте токен сессии',
      plainTextConfirmTitle: 'Хранить токен шлюза в открытом виде?',
      plainTextConfirmDesc:
        'Служба системного хранилища ключей на этой машине не найдена, поэтому токен будет сохранён без шифрования в файле настроек соединения приложения, и его сможет прочитать любой процесс, работающий от вашего имени. Для шифрованного хранилища установите и включите системное хранилище ключей (в Linux — GNOME Keyring или KWallet).',
      plainTextConfirmAction: 'Сохранить в открытом виде',
      plainTextStoredTitle: 'Токен сохранён в открытом виде',
      plainTextStoredDesc:
        'Безопасное хранилище недоступно, поэтому сохранённый токен хранится без шифрования в файле настроек соединения приложения на этой машине. Установите и включите системное хранилище ключей (в Linux — GNOME Keyring или KWallet) для шифрования.',
      keychainEncryptionTitle: 'Зашифруйте сохраненные секреты с помощью цепочки ключей ОС.',
      keychainEncryptionDesc:
        'По умолчанию выключено. Если этот параметр включен, токены шлюза и учетные данные для входа шифруются с помощью системной связки ключей (связка ключей Access, связка ключей GNOME или Windows DPAPI) — ваша система может запросить разрешение или пароль. Если этот параметр отключен, они сохраняются в виде простых файлов, доступных для чтения только вашей учетной записи пользователя.',
      keychainEncryptionFailed: 'Не удалось изменить секретное шифрование.',
      testRemote: 'Проверить удалённый',
      saveForRestart: 'Сохранить до следующего перезапуска',
      saveAndReconnect: 'Сохранить и переподключиться',
      diagnostics: 'Диагностика',
      diagnosticsDesc: 'Показать desktop.log в файловом менеджере — полезно, если шлюз не запускается.',
      openLogs: 'Открыть логи',
      incompleteTitle: 'Настройки удалённого шлюза неполные',
      incompleteSignIn: 'Введите удалённый URL и войдите, прежде чем переключаться на удалённый режим.',
      incompleteToken: 'Введите удалённый URL и токен сессии, прежде чем переключаться на удалённый режим.',
      incompleteSignInTest: 'Введите удалённый URL и войдите, прежде чем проверять.',
      incompleteTokenTest: 'Введите удалённый URL и токен сессии, прежде чем проверять.',
      enterUrlFirst: 'Сначала введите удалённый URL.',
      restartingTitle: 'Перезапуск соединения шлюза',
      savedTitle: 'Настройки шлюза сохранены',
      restartingMessage: 'Hermes Desktop переподключится с сохранёнными настройками — оболочка останется открытой.',
      savedMessage: 'Сохранено для следующего перезапуска.',
      connectedTo: (baseUrl, version) => `Подключено к ${baseUrl}${version ? ` · Hermes ${version}` : ''}`,
      reachableTitle: 'Удалённый шлюз доступен',
      signedOutTitle: 'Вы вышли',
      signedOutMessage: 'Сессия удалённого шлюза сброшена.',
      failedLoad: 'Не удалось загрузить настройки шлюза',
      signInFailed: 'Не удалось войти',
      signOutFailed: 'Не удалось выйти',
      testFailed: 'Проверка удалённого шлюза не удалась',
      applyFailed: 'Не удалось применить настройки шлюза',
      saveFailed: 'Не удалось сохранить настройки шлюза',
      sshTitle: 'Подключение по SSH',
      sshDesc:
        'Hermes запускается на удалённой машине по SSH и туннелируется в это приложение — ничего не нужно запускать или открывать самим. Требуется рабочая SSH-аутентификация по ключу на хост.',
      sshTrustHint:
        'Первый предъявленный ключ хоста доверяется и фиксируется; последующие изменения приведут к отказу.',
      sshHostTitle: 'Хост',
      sshHostDesc: 'user@host или псевдоним Host из ~/.ssh/config.',
      sshHostPick: 'Выбрать хост…',
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
      sshHermesPathDesc: 'Полный путь к бинарнику hermes на удалённой машине. Пусто = автоопределение.',
      sshHermesPathPlaceholder: 'автоопределение',
      sshTestConnection: 'Проверить SSH',
      sshConnect: 'Подключиться',
      sshButtonsHint: '«Сохранить» применится при следующем запуске. «Подключиться» переподключится сейчас.',
      sshReachable: (host, platform) => `Доступен: ${host} (${platform}) — Hermes найден`,
      sshIncompleteHost: 'Введите SSH-хост перед подключением.',
      sshErrUnreachable: 'Не удалось достичь этого хоста по SSH. Проверьте хост, порт и сеть.',
      sshErrAuth:
        'SSH-аутентификация не удалась. Загрузите ключ в ssh-agent (ssh-add) или задайте IdentityFile в ~/.ssh/config — Hermes запускает ssh в неинтерактивном режиме.',
      sshErrHostKey:
        'Ключ хоста ИЗМЕНИЛСЯ с последнего подключения. Убедитесь, что это ожидаемо, затем выполните ssh-keygen -R <host> и переподключитесь.',
      sshErrNotInstalled:
        'Hermes не установлен на удалённой машине. Установите его там (curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh) или задайте путь к Hermes.',
      sshErrPlatform:
        'Неподдерживаемая удалённая платформа. SSH-режим Hermes Desktop поддерживает удалённые хосты Linux, macOS и Windows.',
      sshErrTimeout: 'SSH-соединение истекло. Хост может быть недоступен или «спит».',
      sshErrUpdateRequired: 'Перед подключением через SSH обновите Hermes на удалённой машине.',
      sshErrUnknown: 'SSH-соединение не удалось.'
    },
    keys: {
      loading: 'Загрузка API-ключей и учётных данных…',
      failedLoad: 'Не удалось загрузить API-ключи',
      empty: 'В этой категории пока ничего не настроено.'
    },
    search: {
      placeholder: 'Поиск по всем настройкам…',
      pill: 'Поиск'
    },
    profileScope: {
      appliesTo: 'Применяется к',
      editsProfile: profile => `Изменения на этой странице применяются к профилю «${profile}».`
    },
    mcp: {
      loading: 'Загрузка MCP-серверов…',
      failedLoad: 'Не удалось загрузить конфигурацию MCP',
      nameRequiredTitle: 'Нужно имя',
      nameRequiredMessage: 'Задайте этому MCP-серверу ключ конфигурации.',
      objectRequired: 'Конфигурация сервера должна быть JSON-объектом',
      invalidJson: 'Неверный JSON MCP',
      saveFailed: 'Не удалось сохранить',
      removeFailed: 'Не удалось удалить',
      gatewayUnavailableTitle: 'Шлюз недоступен',
      gatewayUnavailableMessage: 'Переподключите шлюз, прежде чем перезагружать MCP.',
      reloadedTitle: 'Инструменты MCP перезагружены',
      reloadedMessage: 'Новые схемы инструментов применяются к новым ходам.',
      reloadFailed: 'Не удалось перезагрузить MCP',
      savedTitle: 'MCP-сервер сохранён',
      savedMessage: name => `${name} применится после перезагрузки MCP.`,
      newServer: 'Новый сервер',
      reload: 'Перезагрузить MCP',
      reloading: 'Перезагрузка…',
      emptyTitle: 'MCP-серверов нет',
      emptyDesc: 'Добавьте stdio- или HTTP-сервер, чтобы получить инструменты MCP.',
      disabled: 'отключён',
      editServer: 'Изменить сервер',
      name: 'Имя',
      serverJson: 'JSON сервера',
      remove: 'Удалить',
      saveServer: 'Сохранить сервер',
      test: 'Проверить соединение',
      testing: 'Проверка…',
      testOk: count =>
        `Подключено — доступно ${count} ${RU_PLURAL(count, 'инструмент', 'инструмента', 'инструментов')}`,
      testFailed: 'Не удалось подключиться',
      enableServer: name => `Включить ${name}`,
      disableServer: name => `Отключить ${name}`,
      serverEnabled: name => `${name} включён — применится к новым сеансам.`,
      serverDisabled: name => `${name} отключён — применится к новым сеансам.`,
      toggleFailed: (name, enabled) => `Не удалось ${enabled ? 'включить' : 'отключить'} ${name}`,
      tabServers: 'Серверы',
      tabCatalog: 'Каталог',
      catalogLoading: 'Загрузка каталога MCP…',
      catalogLoadFailed: 'Не удалось загрузить каталог MCP',
      catalogEmpty: 'Записей каталога нет.',
      catalogInstalled: 'Установлен',
      catalogEnabled: 'Включён',
      catalogNeedsInstall: 'Нужна сборка',
      catalogInstall: 'Установить',
      catalogInstalling: 'Установка…',
      catalogInstallStarted: name => `Установка ${name}… применится к новым сеансам после завершения.`,
      catalogInstallFailed: name => `Не удалось установить ${name}`,
      catalogEnvPrompt: name => `${name} требует учётные данные`,
      catalogEnvRequired: 'Заполните обязательные значения перед установкой.',
      capabilitySummary: (tools, prompts, resources) =>
        `${[`${tools} ${RU_NOUN(tools, 'инструмент', 'инструмента', 'инструментов')}`, ...(prompts ? [`${prompts} ${RU_NOUN(prompts, 'промпт', 'промпта', 'промптов')}`] : []), ...(resources ? [`${resources} ${RU_NOUN(resources, 'ресурс', 'ресурса', 'ресурсов')}`] : [])].join(', ')} включено`,
      costTokens: tokens => `~${tokens} ток/вызов`,
      usage30d: uses => `${uses} ${RU_NOUN(uses, 'использование', 'использования', 'использований')}/30д`,
      unusedPill: 'не используется',
      statusConnecting: 'Подключение…',
      statusNeedsAuth: 'Нужна аутентификация',
      statusError: 'Ошибка',
      statusOff: 'Выкл',
      allServers: 'Все серверы',
      authenticatedTitle: 'Аутентифицирован',
      authenticatedMessage: (server, count) =>
        `${server}: ${count} ${RU_PLURAL(count, 'инструмент', 'инструмента', 'инструментов')}`,
      waitingForBrowser: 'Ожидание браузера…',
      authenticate: 'Аутентифицироваться',
      unsavedConnect: 'Не сохранено — сохраните mcp.json, чтобы подключиться.',
      enableTool: tool => `Включить ${tool}`,
      disableTool: tool => `Отключить ${tool}`,
      noOutput: 'Вывода пока нет.',
      deepLinkTitle: 'Добавить MCP-сервер?',
      deepLinkDescription:
        'Ссылка запросила добавить этот MCP-сервер в Hermes. Проверьте конфигурацию ниже — она пришла из ссылки, а не из Hermes.',
      deepLinkStdioWarning:
        'Этот сервер запускает локальный процесс на вашей машине командой, показанной ниже. Продолжайте только если доверяете источнику.',
      deepLinkConfirm: 'Добавить сервер',
      deepLinkNameInvalid: 'Имя: 1–64 символа — буквы, цифры, точки, дефисы или подчёркивания.',
      deepLinkNameConflict: name => `Сервер с именем ${name} уже существует — выберите другое имя или отмените.`,
      deepLinkErrorTitle: 'Ссылка установки MCP отклонена',
      deepLinkErrorName: 'Имя сервера в ссылке отсутствует или некорректно.',
      deepLinkErrorConfig: 'Конфигурация в ссылке не является корректным JSON в base64.',
      deepLinkErrorShape: 'Конфигурация должна быть JSON-объектом со строковым полем `url` или `command`.',
      deepLinkErrorUrl: 'Разрешены только URL серверов http:// и https://.',
      deepLinkErrorTooLarge: 'Пакет конфигурации превышает лимит 32 КБ.',
      importButton: 'Импортировать',
      importPlaceholder:
        'Вставьте фрагмент mcp.json, команду npx/docker, строку claude mcp add, URL или ссылку Cursor…',
      importNoMatch: 'В вставленном тексте не распознана конфигурация сервера.',
      importConfirm: 'Добавить в mcp.json',
      importConfirmMany: count => `Добавить ${count} ${RU_PLURAL(count, 'сервер', 'сервера', 'серверов')} в mcp.json`,
      catalogAuthOAuth: 'OAuth',
      catalogAuthApiKey: 'API ключ'
    },
    model: {
      loading: 'Загрузка конфигурации модели…',
      appliesDesc:
        'Применяется к новым сеансам. Для горячей смены модели в активном чате используйте выборщик модели в композере.',
      provider: 'Провайдер',
      model: 'Модель',
      applying: 'Применение…',
      defaultsLabel: 'По умолчанию',
      reasoning: 'Рассуждения',
      reasoningOff: 'Выкл',
      defaultsFailed: 'Не удалось сохранить модель по умолчанию',
      loadFailed: 'Не удалось загрузить модели',
      restartRequired:
        'Этот бэкэнд выполняет старый код после обновления. Перезапустите его, чтобы загрузить новый код.',
      restartBackend: 'Перезапустить серверную часть',
      restartingBackend: 'Перезапуск серверной части...',
      restartFailed: 'Не удалось перезапустить серверную часть',
      auxiliaryTitle: 'Вспомогательные модели',
      resetAllToMain: 'Сбросить всё на основную',
      auxiliaryDesc:
        'Вспомогательные задачи по умолчанию выполняются основной моделью. Назначьте отдельную модель любой задаче, чтобы переопределить.',
      setToMain: 'На основную',
      change: 'Изменить',
      autoUseMain: 'авто · использовать основную модель',
      providerDefault: '(по умолчанию провайдера)',
      fallbackAdd: 'Добавить запасную',
      fallbackEmpty: 'Запасных моделей нет — используется модель по умолчанию, если она не падает.',
      notInCatalog: 'нет в списке моделей этого провайдера — вызовы могут уходить на запасную.',
      staleAuxPrefix: (count, names) => `${count} auxiliary task${count === 1 ? '' : 's'} (${names}) still run on `,
      staleAuxOtherProviders: 'другие поставщики',
      staleAuxSuffix: 'не ваша основная модель.',
      pasteKeyPlaceholder: keyEnv => `Вставить${keyEnv}`,
      activate: 'Активировать',
      activating: 'Активировать...',
      setUpProvider: name => `Настроить${name}`,
      needsApiKeyHint: name => `${name}требуется ключ API — настройте его, чтобы выбрать модель.`,
      oauthHint: name => `${name}входит через ваш браузер — Hermes запускает процесс за вас.`,
      moa: {
        title: 'Смесь агентов',
        shortTitle: 'MoA',
        presetsTitle: 'Пресеты MoA',
        description:
          'Настройка именованных предустановок, которые появляются в качестве моделей под провайдером Mixture of Agents. Агрегатор — это модель действия.',
        presetPlaceholder: 'Предустановка',
        enabled: 'Включено',
        setDefault: 'Установить по умолчанию',
        deletePreset: 'Удалить',
        newPresetPlaceholder: 'новый preset',
        addPreset: 'Добавить preset',
        defaultLabel: 'По умолчанию:',
        referenceTitle: index => `Справка${index}`,
        toggleReference: (index, enabled) => `${enabled ? 'Инвалид' : 'Допускать'} reference ${index}`,
        removeReference: 'Удалить',
        addReference: 'Добавить справочную модель',
        aggregatorTitle: 'Агрегатор'
      },
      tasks: {
        vision: {
          label: 'Зрение',
          hint: 'Анализ изображений'
        },
        compression: {
          label: 'Сжатие',
          hint: 'Компрессия контекста'
        },
        skills_hub: {
          label: 'Хаб навыков',
          hint: 'Поиск навыков'
        },
        approval: {
          label: 'Одобрение',
          hint: 'Умное авто-одобрение'
        },
        mcp: {
          label: 'MCP',
          hint: 'Маршрутизация MCP-инструментов'
        },
        title_generation: {
          label: 'Ген. заголовка',
          hint: 'Заголовки сеансов'
        },
        review: {
          label: 'Обзор',
          hint: '/review субагент рецензента'
        },
        curator: {
          label: 'Куратор',
          hint: 'Просмотр использования навыков'
        },
        triage_specifier: {
          label: 'Спецификатор сортировки',
          hint: 'Доработка спецификации Канбана'
        },
        kanban_decomposer: {
          label: 'Канбан-декомпозер',
          hint: 'Декомпозиция задачи'
        },
        profile_describer: {
          label: 'Описатель профиля',
          hint: 'Описания автопрофилей'
        },
        web_extract: { label: 'Веб-извлечение', hint: 'Суммаризация страниц' }
      },
      inheritMainEffort: 'наследовать · усилие основной модели',
      moaTitle: 'Смесь агентов',
      moaPreset: 'Предустановка',
      moaDescription:
        'Настройте именованные наборы настроек, которые отображаются в виде моделей в поставщике «Смесь агентов». Агрегатор является действующей моделью: он выполняет каждый шаг цикла инструмента, и почти все затраты на выполнение выставляются его провайдеру. По умолчанию ссылки рекомендуют только один раз за ход пользователя.',
      moaAggregator: 'Агрегатор',
      moaAggregatorBilled: 'действующая модель · выставлен счет за пробег',
      moaReferenceHint: 'по умолчанию советует один раз за ход'
    },
    customEndpoints: {
      title: 'Пользовательские конечные точки',
      loadFailed: 'Невозможно загрузить пользовательские конечные точки',
      saved: 'Пользовательская конечная точка сохранена.',
      saveFailed: 'Сохранение не выполнено',
      reachable: 'Конечная точка достижима.',
      reachableWithModels: count => `Конечная точка доступна. Найдена${count}модели.`,
      validationFailed: 'Проверка конечной точки провалилась.',
      validationError: 'Проверка провалилась',
      enterUrlFirst: 'Сначала введите конечную точку URL.',
      unreachable: url => `Не удалось достичь${url}.`,
      authRejected: 'Конечная точка отклонила ключ API.',
      httpError: status => `Конечная точка вернула HTTP${status}.`,
      activationFailed: 'Активация провалилась',
      deleteConfirm: name => `Удалить${name}?`,
      deleteFailed: 'Удаление не удалось',
      active: 'Активный',
      apiKeySet: 'API ключ',
      use: 'Использование',
      deleteEndpoint: 'Удалить конечную точку',
      emptyTitle: 'Нет пользовательских конечных точек',
      emptyDesc: 'Добавьте ниже конечную точку, совместимую с OpenAI.',
      editTitle: 'Редактировать Endpoint',
      addTitle: 'Добавить Endpoint',
      nameLabel: 'Имя',
      providerIdLabel: 'Идентификатор',
      providerIdHint:
        'Идентификатор хранится в качестве ключа провайдера в config.yaml — фиксируется после создания; используется новая конечная точка для другого идентификатора.',
      urlLabel: 'Конечная точка URL',
      apiModeLabel: 'Протокол API',
      apiModeAuto: 'Автомат',
      apiModeChat: 'Завершения чата',
      apiModeResponses: 'Ответы',
      apiModeMessages: 'Сообщения Anthropic',
      authSchemeLabel: 'Заголовок Auth',
      authSchemeAuto: 'Автоматически обнаруживать',
      authSchemeHint:
        'Совместимые с Anthropic реле разделены на аутентификацию: некоторые ожидают нативный заголовок x-api-key, другие принимают только авторизацию: Bearer. Автообнаружение охватывает известные хосты; закрепите схему, если ваше реле отклоняет запросы с помощью 401/403.',
      noModelCatalog: 'Конечная точка достижима. Он не раскрывает модельный каталог.',
      connectedNoModels: url => `Connected to ${url}, but the endpoint advertised no models.`,
      defaultModelLabel: 'Модель по умолчанию',
      contextLabel: 'Типовые лимиты токенов',
      contextHint:
        'Настройка общего контекста, максимального ввода и максимального вывода для каждой модели. Оставьте любое значение пустым, чтобы решить его автоматически.',
      modelLabel: 'Модель',
      contextWindowLabel: 'Полный контекст',
      maxInputLabel: 'Макс Ввод',
      maxOutputLabel: 'Max Out Out',
      apiKeyLabel: 'Ключ API',
      userAgentLabel: 'Пользователь-агент',
      userAgentHint:
        'Пользователь-агент HTTP отправляется на эту конечную точку. Дефолты стандартному браузерному агенту, поэтому прокси и WAF не блокируют запросы. Очистите поле для использования встроенного SDK по умолчанию.',
      contextAuto: 'Автомат',
      keyKeepPlaceholder: 'Оставьте пустой, чтобы сохранить текущий ключ',
      keyOptionalPlaceholder: 'Необязательно',
      useForNewChats: 'Используйте для новых чатов',
      discoverModels: 'Откройте для себя модели',
      test: 'Тест',
      newEndpoint: 'Новая конечная точка',
      reachableVia: transport => `Конечная точка доступна через${transport}.`,
      emptyDescription: 'Добавьте ниже конечную точку, совместимую с OpenAI.',
      namePlaceholder: 'Аксет Прокси',
      contextPlaceholder: 'Автомат'
    },
    uninstall: {
      dangerZone: 'Опасная зона',
      checking: 'Проверить, что установлено..',
      confirmTitle: 'Подтвердить удаление',
      confirmBody: consequence => `This removes ${consequence}Это нельзя отменить.`,
      appPathLabel: path => `Приложение:${path}`,
      uninstalling: 'Удаление..',
      confirmYes: 'Да, удалить',
      heading: 'Удалить Hermes',
      chooseBody:
        'Выберите, сколько удалить. Приложение закрывается, чтобы закончить работу; откройте установщик в любое время, чтобы вернуться.',
      startFailed: 'Uninstall не может начаться.',
      options: {
        gui: {
          title: 'Удалить Chat GUI',
          description: 'Удалите это настольное приложение. Агент Hermes, ваш конфигуратор и чаты остаются.',
          consequence: 'рабочий стол Chat GUI (это приложение и его данные)'
        },
        lite: {
          title: 'Удалите GUI + агент, сохраните мои данные',
          description:
            'Удалите приложение и агента Hermes, но сохраните конфигурацию, чаты и секреты для будущей переустановки.',
          consequence: 'chat GUI и агент Hermes (конфигурация, чаты и секреты хранятся)'
        },
        full: {
          title: 'Удалить все',
          description:
            'Удалите приложение, агента и все пользовательские данные — конфигурацию, чаты, запланированные задания, секреты, журналы.',
          consequence: 'EVERYTHING — Chat GUI, агент Hermes и все ваши конфигурации, чаты, секреты и журналы'
        }
      }
    },
    poolLimits: {
      warmBackends: 'Число работающих бэкендов ботов',
      warmBackendsDescription:
        'Сколько бэкендов ботов остаются запущенными для быстрого переключения. Чем больше, тем быстрее переключение и выше расход памяти (около 60 MB на бэкенд). Изменения применяются сразу.',
      idleTimeout: 'Тайм-аут простоя бэкенда',
      idleTimeoutDescription:
        'Как долго неиспользуемый бэкенд бота остаётся запущенным до отключения. Увеличьте это время, чтобы не ждать повторного запуска при возвращении к боту каждые несколько минут.',
      idleTimeoutAria: 'Тайм-аут простоя бэкенда в миллисекундах',
      milliseconds: 'мс',
      warmBotBackendsAria: 'Теплый бот-бэкэнд',
      warmBotBackendsTitle: 'Тёплые серверные части бота',
      backendIdleTimeoutAria: 'Время ожидания бездействия бэкенда в миллисекундах',
      backendIdleTimeoutTitle: 'Время ожидания простаивающего бэкенда'
    },
    localModels: {
      catalogDescriptions: {
        'Best all-round agent model; sees images; long context stays fast':
          'Лучшая универсальная модель для агента; понимает изображения; сохраняет скорость при длинном контексте',
        'Frontier-scale model; needs a very large GPU to run well':
          'Передовая крупная модель; для быстрой работы нужен GPU с очень большим объёмом памяти',
        'Bigger mixture-of-experts with multi-token prediction; sees images':
          'Более крупная модель со смесью экспертов и предсказанием нескольких токенов; понимает изображения',
        'Frontier-class model for machines with 128GB+ memory':
          'Передовая модель для компьютеров со 128 GB памяти и более'
      },
      recommendedBuild: (quant, largeWindow) =>
        `Рекомендуемая сборка (${quant}) — формат квантования, под который оптимизирован движок; полностью работает на GPU${largeWindow ? ' с большим окном контекста' : ''}`,
      compactBuild: quant =>
        `Компактная сборка для этого компьютера (${quant}) — превышает объём памяти GPU и использует системную память, поэтому работает медленнее`,
      fitTooLarge: (quant, size) =>
        `Даже самая компактная сборка (${quant}, ${size}) превышает суммарный объём памяти GPU и системной памяти`,
      fitNeedsMemory: 'Требуется больше памяти, чем есть на этом компьютере',
      fitFullContext: context => `работает с полным контекстом ${context}`,
      fitGrowingContext: (start, max) => `контекст начинается с ${start} и расширяется до ${max} по мере использования`,
      fitSpilled: detail => `${detail} (превышает объём памяти GPU и использует системную память — работает медленнее)`,
      title: 'Локальные модели',
      runtimeTitle: 'Локальная среда выполнения',
      runtimeReady: backend => `Готово ·${backend}`,
      serverRunning: 'Бегать',
      runtimeInstalled: 'Установлена среда выполнения llama.cpp.',
      runtimeInstalledDetail: (tag, backend) =>
        `Строить${tag}, ${backend}backend. Hermes запускает и управляет сервером за вас.`,
      installTitle: 'Установите локальную среду выполнения',
      installDetail:
        'Загружает механизм вывода llama.cpp (несколько сотен МБ). Загруженные вами модели полностью запускаются на этом компьютере — ни одна учетная запись, ничто не покидает ваш компьютер.',
      installAction: 'Установить среду выполнения',
      installing: 'Установка среды выполнения…',
      installFailed: 'Не удалось установить среду выполнения',
      hardwareTitle: 'Эта машина',
      hardwareLoading: 'Проверка вашего оборудования…',
      vram: label => `${label}GPU память`,
      ram: label => `${label}RAM`,
      unifiedMemory: 'Единая память',
      modelsTitle: 'Модели',
      recommended: 'Рекомендуется',
      recommendedReason: {
        'best-quality-resident':
          'Модель высочайшего качества, полностью работающая на вашем GPU на полной скорости. Выбор сопоставляет качество с прогнозируемой скоростью на этом оборудовании.',
        'speed-gated-quality':
          'Модель более высокого качества подходит для этой машины, но будет слишком медленно реагировать на пропускную способность памяти — это лучшая модель, которая остается быстрой.',
        'fastest-resident':
          'Ни одна модель не достигает полной скорости на этом оборудовании; этот вариант ближе всего работает полностью в памяти GPU.'
      } as Record<string, string>,
      noRecommendationTitle: 'Для этой машины нет автоматических рекомендаций',
      noRecommendationDetail:
        'Для автоматической настройки требуется тщательно подобранная модель, которая полностью помещается в GPU или единую память. Вы по-прежнему можете выбрать модель ниже или просмотреть другие модели.',
      noRecommendationAction: 'Обзор моделей',
      downloaded: 'Скачано',
      downloadAction: size => `Скачать ·${size}`,
      downloadProgress: (done, total) => `Загрузка${done}из${total}`,
      downloadDoneToast: model => `${model}готов.`,
      installDoneToast: 'Локальная среда выполнения установлена и готова.',
      quickstartTitle: 'Запустите модель на этой машине',
      quickstartDetail: (model, size) =>
        `Одно нажатие настраивает всё: локальный движок,${model} (${size}скачать), и ваш параметр по умолчанию для новых чатов. Ничего не покидает этот компьютер.`,
      quickstartDetailReady: model =>
        `Один клик делает${model}ваш стандарт для новых чатов. Всё работает на этой машине.`,
      quickstartAction: 'Настройте для меня',
      quickstartConfigure: 'Позвольте мне выбрать',
      quickstartDoneToast: model => `${model}настроено — новые чаты работают на этой машине.`,
      quickstartFailed: 'Не удалось настроить локальную модель.',
      quickstartStageEngine: 'Двигатель',
      quickstartStageModel: 'Модель',
      quickstartStageFinish: 'Готово',
      useAction: 'Использование',
      activePill: 'По умолчанию',
      updateTitle: 'Доступно обновление движка',
      updateDetail: (next, current) =>
        `Более новая сборка llama.cpp (${next}) is ready to install — you're on ${current}. Модели продолжают работать во время загрузки.`,
      updateAction: 'Обновить движок',
      updating: 'Обновление движка…',
      upToDateTitle: 'Двигатель в актуальном состоянии',
      upToDateDetail: (tag, backend) => `Running llama.cpp ${tag} (${backend}) — настроенная сборка.`,
      activeDetail: 'Новые чаты используют эту модель — она загружается при отправке первого сообщения.',
      activeNotLoaded: 'Загружается на ваше первое сообщение',
      loadedPill: 'В памяти',
      placementResident: 'все на GPU',
      placementSpilled: 'частично в RAM',
      placementResidentTip: 'Работа полностью в памяти GPU в этом контекстном окне — на полной скорости.',
      placementSpilledTip:
        'Часть этой модели работает из системы RAM — работает, но медленнее. Более компактная сборка или меньший контекст вполне подойдут.',
      loadingPill: 'Загрузка…',
      ejectTip: 'Свободная память GPU (загружается снова при следующем сообщении)',
      ejected: 'Модель выгружена — память GPU освобождена.',
      ejectFailed: 'Не удалось выгрузить модель',
      stopServer: 'Выключить',
      startServer: 'Включить',
      runtimeRunningDetail:
        'Локальный сервер работает. Отключение этой функции освобождает всю память GPU и не позволяет новым чатам использовать локальные модели, пока вы не включите ее снова.',
      serverStopped: 'Локальный сервер остановлен — память GPU освобождена.',
      serverStarted: 'Локальный сервер работает.',
      serverStopFailed: 'Не удалось остановить локальный сервер',
      serverStartFailed: 'Не удалось запустить локальный сервер',
      activating: 'Запуск…',
      activateFailed: model => `Не удалось переключиться на${model}`,
      activateDoneToast: model => `Использовать новые чаты${model}.`,
      downloadFailed: model => `Загрузка${model}неудачный`,
      pillFitsGpu: 'Подходит для вашего GPU',
      pillUsesRam: 'Использует систему RAM',
      pillTooBig: 'Слишком большой для этой машины',
      browseTitle: 'Найти больше моделей',
      browseHint:
        'Найдите все Hugging Face. Модели, которые вы загружаете здесь, автоматически подбираются под вашу машину, но не проверяются нами.',
      browsePlaceholder: 'Поиск моделей по названию или автору…',
      browseSearching: 'Поиск Hugging Face',
      browseListing: 'Чтение файлов модели',
      browseShowFiles: 'Показать файлы',
      browseRefresh: 'Обновить',
      browseDownloads: 'загрузки',
      browseLikes: 'любит',
      browseGated: 'требуется вход Hugging Face',
      browseNoGguf: 'Совместимые файлы моделей не найдены.',
      browseFitUnknown: 'Подходит неизвестно',
      browseAlreadyDownloaded: 'Уже скачал.',
      addedByYou: 'Добавлено вами',
      browseDownloadStarted: 'Загрузка {имя}',
      browseDownloadAria: 'Скачать {имя}',
      sideloadButton: 'Добавить файл модели',
      sideloadTitle: 'Выберите файл модели GGUF.',
      sideloadDone: 'Добавлено {имя}.',
      sideloadAlreadyPresent: 'Уже в вашей библиотеке.',
      pillFullContext: max => `Полный${max}контекст`,
      pillFullContextTip: 'Запускается в полном контекстном окне модели с самого начала.',
      pillUpTo: max => `До${max}контекст`,
      pillGrowsTip: 'Расширяется автоматически по мере того, как вашему разговору требуется больше места',
      pillVision: 'Видит изображения',
      deleteAction: 'Удалить модель',
      deleteConfirm: model => `Удалить${model}с диска?`,
      deleted: model => `${model}удалено.`,
      deleteFailed: 'Удаление не удалось'
    },
    providers: {
      connectAccount: 'Подключить аккаунт',
      haveApiKey: 'Ввести API-ключ вместо этого?',
      intro:
        'Войдите по подписке — копировать API-ключ не нужно. Hermes проведёт вход в браузере прямо здесь, в приложении.',
      connected: 'Подключено',
      collapse: 'Свернуть',
      connectAnother: 'Подключить другой провайдер',
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
      noKeysMatch: 'Провайдеры, подходящие под поиск, не найдены.',
      localEndpoint: {
        title: 'Локальный / свой эндпоинт',
        description: 'Направьте Hermes на любой OpenAI-совместимый эндпоинт (Zyphra, vLLM, llama.cpp, Ollama и т. д.).'
      },
      loading: 'Загрузка провайдеров…',
      providerLabels: {},
      providerDescriptions: {}
    },
    sessions: {
      loading: 'Загрузка архивных сеансов…',
      archivedTitle: 'Архивные сеансы',
      archivedIntro:
        'Архивированные чаты скрыты из боковой панели, но сохраняют все сообщения. Чтобы архивировать чат из боковой панели — Ctrl/⌘-клик по нему.',
      emptyArchivedTitle: 'Архив пуст',
      emptyArchivedDesc: 'Архивируйте чат, чтобы скрыть его отсюда.',
      unarchive: 'Восстановить',
      deletePermanently: 'Удалить безвозвратно',
      messages: count => `${count} ${RU_PLURAL(count, 'сообщение', 'сообщения', 'сообщений')}`,
      restored: 'Восстановлено',
      deleteConfirm: title => `Безвозвратно удалить «${title}»? Это действие необратимо.`,
      autoArchiveTitle: 'Авто-архивация старых чатов',
      autoArchiveDesc:
        'Автоматически архивировать чаты, к которым вы давно не возвращались. Закреплённые чаты никогда не архивируются, ничего не удаляется — архивные чаты просто переезжают сюда.',
      autoArchiveDaysLabel: 'Архивировать через',
      autoArchiveDaysUnit: 'дн. бездействия',
      autoArchiveFailed: 'Не удалось обновить авто-архивацию',
      defaultDirTitle: 'Папка проекта по умолчанию',
      defaultDirDesc:
        'Новые сеансы начинаются в этой папке, если вы не выбрали другую. Оставьте пустым, чтобы использовать домашнюю директорию.',
      defaultDirUpdated:
        'Папка проекта по умолчанию обновлена — начните новый чат (Ctrl/⌘+N), чтобы она вступила в силу',
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
      savedMessage: key => `${key} обновлён.`,
      removedTitle: 'Учётные данные удалены',
      removedMessage: key => `${key} удалён.`,
      failedSave: key => `Не удалось сохранить ${key}`,
      failedRemove: key => `Не удалось удалить ${key}`,
      failedReveal: key => `Не удалось показать ${key}`,
      removeConfirm: key => `Удалить ${key} из .env?`,
      set: 'Установить',
      notSet: 'Не задано',
      selectedTitle: 'Провайдер выбран',
      selectedMessage: provider => `Сейчас активен ${provider}.`,
      failedSelect: provider => `Не удалось выбрать ${provider}`,
      failedLoad: 'Не удалось загрузить конфигурацию инструментов',
      noProviderOptions:
        'У этого набора инструментов нет вариантов провайдера — включите его, и он будет работать с вашей текущей конфигурацией.',
      noProviders: 'Для этого набора инструментов сейчас нет доступных провайдеров.',
      ready: 'Готово',
      needsSignIn: 'Нужен вход',
      needsSetup: 'Требуется настройка',
      badgeTokens: {},
      tagCopy: {},
      activeBackend: 'Активен',
      activeBackendHint: 'Это ваш активный бэкенд',
      useBackend: 'Использовать этот бэкенд',
      nousIncluded: 'Входит в подписку Nous — войдите в Nous Portal, чтобы активировать.',
      nousAuthNeededTitle: 'Войдите в Nous Portal',
      nousAuthNeededMessage: provider => `${provider} сохранён, но не активируется, пока вы не войдёте в Nous Portal.`,
      nousAuthSignIn: 'Войти',
      nousAuthDoneTitle: 'Nous Portal подключён',
      nousAuthDoneMessage: 'Ваши бэкенды по подписке теперь активны.',
      nousAuthFailed: 'Вход в Nous Portal не завершён',
      noApiKeyRequired: 'API-ключ не требуется.',
      postSetupHint: step =>
        `Этому бэкенду нужна однократная установка (${step}). Выполняется на этой машине — может занять несколько минут.`,
      postSetupInstalledHint: 'Установлено. Повторите настройку, только если что-то сломано.',
      postSetupRun: 'Запустить настройку',
      postSetupRerun: 'Повторить настройку',
      postSetupInstalled: 'Установлено',
      postSetupRunning: 'Установка…',
      postSetupStarting: 'Запуск…',
      postSetupCompleteTitle: 'Настройка завершена',
      postSetupCompleteMessage: step => `${step} установлен.`,
      postSetupErrorTitle: 'Настройка завершилась с ошибками',
      postSetupErrorMessage: step => `Посмотрите журнал ${step}.`,
      postSetupFailed: step => `Не удалось выполнить настройку ${step}`,
      webSearchActive: backend => `Поиск: ${backend}`,
      webExtractActive: backend => `Извлечение: ${backend}`,
      webCapabilityUnset: 'не задано',
      webUseForSearch: 'Использовать для поиска',
      webUseForExtract: 'Использовать для извлечения',
      webUsedForSearch: 'Бэкенд поиска',
      webUsedForExtract: 'Бэкенд извлечения',
      webCapabilitySelectedMessage: (provider, capability) => `${provider} теперь отвечает за веб-${capability}.`,
      failedSelectCapability: provider => `Не удалось настроить ${provider}`,
      loadingModels: 'Загрузка каталога моделей…',
      modelSectionTitle: 'Модель',
      modelCount: count => `${count} ${RU_PLURAL(count, 'модель', 'модели', 'моделей')}`,
      modelInUse: 'В использовании',
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
        ready: 'Готово',
        needsSetup: 'Нужна настройка',
        unavailable: 'Недоступен',
        inUse: 'В использовании',
        selectedTitle: 'Бэкенд выбран',
        selectedMessage: backend =>
          `Команды терминала теперь выполняются через ${backend}. Применится к новым сеансам.`,
        failedSelect: backend => `Не удалось выбрать ${backend}`,
        needsSetupHint: 'Этот бэкенд можно выбрать сейчас — команды будут падать, пока настройка не завершена.',
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
          `Hermes не может выполнять команды оболочки прямо сейчас:${backend}не готово. Переключитесь на Локальный или завершите настройку${backend}и попробуй снова.`,
        openBackendSettings: 'Открыть настройки терминала',
        useLocal: 'Использовать локальный',
        switchedToLocal: 'Команды терминала теперь выполняются локально. Применяется к новым сеансам.'
      },
      computerUse: {
        checking: 'Проверка состояния использования компьютера..',
        statusReadFailed: 'Не могу прочитать статус использования компьютера',
        unsupported: platform => `Компьютер Использование не поддерживается на этой платформе${platform}).`,
        installHint: 'Установите бэкэнд cua-driver ниже, чтобы управлять этой машиной.',
        installGrantHint: 'Затем предоставьте доступ к функции доступности и записи экрана здесь.',
        platformNotes: {
          linux: 'Управляет рабочим столом через стек доступности X11 / XWayland — без запроса разрешения.',
          win32: 'Первый запуск может вызвать подсказку Windows SmartScreen для работника UIAccess — допустите это.'
        },
        macGrantNote:
          'Гранты прикрепляются к собственной личности CuaDriver (com.trycua.driver), а не Hermes — поэтому диалог приписывается процессу, который управляет вашим Mac.',
        recheck: 'Перепроверять',
        accessibility: 'Доступность',
        accessibilityHint: 'Позволяет водителю отправлять клики, нажатия клавиш и читать дерево доступности.',
        screenRecording: 'Запись экрана',
        screenRecordingHint: 'Позволяет водителю снимать скриншоты окон приложений.',
        driverHealth: 'Здоровье водителя',
        granted: 'Предоставленный',
        notGranted: 'Не предоставлено',
        ready: 'Готовы',
        notReady: 'Не готов',
        unknown: 'Неизвестно',
        readyMessage: 'Использование компьютера готово. Попросите агента захватить приложение и щелкнуть вокруг.',
        grantPermissions: 'Предоставление разрешений',
        waitingApproval: 'В ожидании одобрения..',
        grantFailed: 'Не могли запросить разрешения',
        approveTitle: 'Утверждено в системных настройках',
        approveMessage: 'macOS покажет диалог разрешения, приписываемый CuaDriver. Утвердить, потом вернуться сюда.'
      },
      browserRealProfile: {
        label: 'Использовать мой настоящий профиль браузера',
        description:
          'Копирует логины и файлы cookie вашего браузера по умолчанию в управляемый снимок, который просматривает агент. Ваш живой профиль никогда не открывается напрямую. Применяется к новым сеансам.',
        enabledTitle: 'Просмотр реального профиля включен',
        enabledMessage: 'Новые сеансы будут просматриваться со снимком вашего профиля браузера по умолчанию.',
        disabledTitle: 'Просмотр реального профиля отключен',
        disabledMessage: 'Снимок профиля будет удален; новые сеансы используют чистый браузер.',
        failedSave: 'Не удалось сохранить настройки реального профиля.',
        prompt: {
          title: 'Оставайтесь в системе на своих сайтах',
          body: 'Разрешите Hermes просматривать снимок вашего профиля браузера по умолчанию, чтобы сайты открывались уже после входа в систему.',
          bulletSnapshot: 'Файлы cookie и логины копируются в управляемый снимок.',
          bulletLiveProfile: 'Ваш действующий профиль браузера никогда не открывается напрямую.',
          bulletLocal: 'Ничто не покидает этот компьютер.',
          dontShowAgain: 'Больше не показывать',
          notNow: 'Не сейчас',
          enable: 'Используйте мой профиль'
        }
      },
      nousAuthFailedMessage: 'Попробуйте еще раз.',
      nousAuthTryAgain: 'Попробуйте снова',
      postSetupOpenLogs: 'Открыть журналы',
      postSetupRunAgain: 'Беги снова'
    },
    subpages: {
      appearanceTheme: 'Тема',
      appearanceTypography: 'Шрифты и масштаб',
      appearanceWindowLayout: 'Окно и расположение',
      appearanceChatDisplay: 'Отображение чата',
      appearancePet: 'Питомец',
      appearanceGeneral: 'Общие',
      modelMain: 'Основная модель',
      modelAuxiliary: 'Вспомогательные модели',
      modelMoa: 'Совместная работа агентов',
      modelFallbacks: 'Резервные модели',
      chatBehavior: 'Поведение',
      chatAttachments: 'Вложения',
      workspaceProjects: 'Проекты и поиск',
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
      voiceTranscription: 'Речь в текст',
      voiceSpeech: 'Текст в речь',
      advancedRuntime: 'Ограничения агента',
      advancedTools: 'Доступ к инструментам',
      advancedTerminal: 'Сервер терминала',
      advancedOutput: 'Ограничения вывода',
      advancedDelegation: 'Субагенты',
      advancedDesktop: 'Приложение и запуск',
      gatewayConnection: 'Это окно',
      gatewayDevices: 'Сохранённые подключения',
      gatewayManagedUpdates: 'Удалённые обновления',
      gatewayManagedUpdatesUnavailable: 'Нужна версия приложения с поддержкой управляемых обновлений SSH.',
      gatewayManagedUpdatesEmpty: 'Добавьте SSH в сохранённые подключения, чтобы управлять его обновлениями здесь.',
      keyboardShortcuts: 'Назначения клавиш',
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
    uninstallSection: {
      dangerZone: 'Опасная зона',
      confirmUninstall: 'Подтвердить удаление',
      uninstallHermes: 'Удалить Hermes'
    },
    computerUse: {
      accessibility: 'Доступность',
      screenRecording: 'Запись экрана',
      driverHealth: 'Здоровье водителя'
    },
    hudModifier: {
      title: 'Вызов HUD коротким нажатием',
      description:
        'Нажмите и отпустите ⌘ + Option на Mac или Ctrl + Alt на Windows/Linux, чтобы вызвать HUD из любого приложения. По умолчанию выключено; действует только на этом устройстве.',
      permission:
        'Разрешите Hermes в Системных настройках → Конфиденциальность и безопасность → Мониторинг ввода, затем повторите попытку. Жест не записывает нажатия клавиш и не снимает экран.',
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
        'Нажмите обе клавиши Command одновременно в любом приложении, чтобы снять его переднее окно и прикрепить снимок к текущему черновику Hermes. Автоматической отправки нет. По умолчанию выключено; действует только на этом Mac. Окно может содержать конфиденциальные данные — проверьте вложение перед отправкой.',
      statusTitle: 'Состояние сочетания для снимка окна',
      checking: 'Проверка сочетания для снимка окна…',
      disabled: 'Сочетание для снимка окна выключено.',
      starting: 'Запускается отслеживание сочетания. Оно пока не готово.',
      ready: 'Сочетание готово. Снимки прикрепляются к текущему черновику без отправки.',
      inputPermission:
        'Разрешение на мониторинг ввода позволяет Hermes распознавать обе клавиши Command, когда активно другое приложение. Разрешите Hermes доступ в Системных настройках → Конфиденциальность и безопасность → Мониторинг ввода, затем вернитесь сюда и повторите попытку.',
      screenPermission:
        'Разрешение на запись экрана позволяет Hermes снимать переднее окно приложения при использовании этого сочетания. Разрешите Hermes доступ в Системных настройках → Конфиденциальность и безопасность → Запись экрана, затем вернитесь сюда и повторите попытку. Перезапустите Hermes, если macOS попросит.',
      openSettings: 'Открыть Системные настройки',
      retry: 'Повторить',
      unavailable: 'Сочетание для снимка окна недоступно. Повторите попытку или выключите его.',
      errorTitle: 'Ошибка сочетания для снимка окна',
      loadFailed: 'Не удалось прочитать состояние сочетания. Повторите попытку, чтобы проверить текущую настройку.',
      saveFailed: 'Не удалось подтвердить изменение сочетания. Повторите попытку, чтобы проверить текущую настройку.',
      permissionFailed:
        'Не удалось открыть Системные настройки. Откройте раздел «Конфиденциальность и безопасность» вручную и повторите попытку.',
      captureFailed: 'Не удалось снять переднее окно. Ничего не прикреплено и не отправлено.',
      contextChanged: 'Текущий черновик изменился во время съёмки. Снимок не прикреплён и не отправлен.'
    },
    envKeys: {}
  },
  skills: {
    tabSkills: 'Навыки',
    tabToolsets: 'Инструменты',
    configuringProfile: 'Настраивается:',
    tabMcp: 'MCP',
    all: 'Все',
    searchSkills: 'Поиск навыков...',
    searchToolsets: 'Поиск инструментов...',
    refresh: 'Обновить навыки',
    refreshing: 'Обновление навыков',
    loading: 'Загрузка возможностей...',
    noSkillsTitle: 'Навыки не найдены',
    noSkillsDesc: 'Попробуйте более широкий поиск или другую категорию.',
    noToolsetsTitle: 'Toolsets не найдены',
    noToolsetsDesc: 'Попробуйте более широкий запрос.',
    noDescription: 'Без описания.',
    configured: 'Настроено',
    needsKeys: 'Нужны ключи',
    visionModelHint:
      'Зрение использует вашу конфигурацию вспомогательной модели — модель с поддержкой изображений выбирается там, а не здесь по провайдеру.',
    visionModelLink: 'Выбрать модель зрения в Настройки → Модели',
    toolsetsEnabled: (enabled, total) => `Включено наборов инструментов: ${enabled}/${total}`,
    configureToolset: label => `Настроить ${label}`,
    toggleToolset: (label, enabled) => `${enabled ? 'Включить' : 'Отключить'} набор инструментов ${label}`,
    skillsLoadFailed: 'Не удалось загрузить навыки',
    toolsetsRefreshFailed: 'Не удалось обновить наборы инструментов',
    skillEnabled: 'Навык включён',
    skillDisabled: 'Навык отключён',
    toolsetEnabled: 'Набор инструментов включён',
    toolsetDisabled: 'Набор инструментов отключён',
    appliesToNewSessions: name => `${name} применится к новым сеансам.`,
    failedToUpdate: name => `Не удалось обновить ${name}`,
    sortMostUsed: 'Самые используемые',
    sortAlpha: 'А–Я',
    sortMostUsedDesc: '↓ Самые используемые',
    sortLeastUsedAsc: '↑ Меньше всего используемые',
    enableAll: 'Включить все',
    disableAll: 'Отключить все',
    disableUnused: 'Отключить неиспользуемые',
    bulkUpdated: count => `Обновлено ${count} ${RU_NOUN(count, 'элемент', 'элемента', 'элементов')} для новых сеансов.`,
    bulkNoChange: 'Менять нечего.',
    usageCount: count => `использован ${count}×`,
    provenance: {
      agent: 'Научен',
      bundled: 'Встроенный',
      hub: 'Хаб'
    },
    emptyNoneFound: noun => `Не найдено: ${noun}`,
    emptyNothingMatches: query => `Ничего не подходит под «${query}».`,
    emptyNoneAvailable: noun => `${noun} пока недоступны.`,
    changesApplyNewSessions: 'Изменения применяются к новым сеансам.',
    skillUpdated: 'Навык обновлён',
    edit: 'Изменить',
    archive: 'В архив',
    archiveSkillTitle: name => `Архивировать ${name}?`,
    archiveSkillDescription: 'Навык будет архивирован; его можно восстановить командой `hermes curator restore`.',
    skillArchivedTitle: 'Навык в архиве',
    skillArchivedMessage: 'Восстановить через hermes curator restore.',
    tabPlugins: 'Плагины',
    plugins: {
      agentTitle: 'Плагины агента',
      agentBlurb:
        'Расширьте агент для выбранного профиля — инструменты, хуки, провайдеры. Вступит в силу после перезапуска шлюза.',
      pageBlurb:
        'Одна строка на плагин. Плагин может расширить это приложение, агент или и то, и другое — каждая половина имеет свой собственный переключатель.',
      halfDesktop: 'Рабочий стол',
      halfDesktopHint: 'это приложение одинаково для каждого профиля',
      halfAgent: 'Агент',
      halfAgentIn: (profile: string) => `Агент в${profile}`,
      defaultProfile: 'Hermes (по умолчанию)',
      kindAgent: 'Агент',
      kindDesktop: 'Рабочий стол',
      kindBoth: 'Агент + Рабочий стол',
      installAgentHere: 'Установить здесь',
      installAgentHereTip: (profile: string) =>
        `The desktop half is loaded in this app, but the agent half is not installed in ${profile}. Установите его туда.`,
      installAgentHereNoOrigin:
        'Половина агента не установлена в этом профиле, и этот пакет был скопирован вручную (без записи в каталоге или удаленного git), поэтому его нельзя установить отсюда. Скопируйте его папку в профиль или переустановите из Git.',
      desktopHalfPending: 'копирование…',
      desktopHalfPendingTip:
        'В этот пакет входит половина рабочего стола, которая еще не была скопирована в приложение. Используйте повторное сканирование или перезапустите приложение.',
      emptyAll: 'Плагинов пока нет.',
      empty: 'Для этого профиля не установлены плагины агента.',
      emptyHint: 'Просмотрите каталог ниже и установите проверенный плагин одним щелчком мыши.',
      loadFailed: 'Не удалось загрузить плагины агента.',
      toggleFailed: (name: string) => `Не удалось переключить${name}`,
      legacyBackend:
        'Этот бэкэнд предшествует переключателям плагинов с адресацией по ключу — обновите Hermes, чтобы управлять им здесь.',
      portableBadge: 'портативный',
      bundledDescriptions: {},
      sourceLabels: {
        bundled: 'упакованный',
        user: 'пользователь',
        git: 'Гит',
        project: 'проект',
        entrypoint: 'точка входа'
      },
      catalogTitle: 'Каталог плагинов',
      catalogBrowse: 'Обзор',
      catalogHide: 'Скрыть браузер каталога',
      catalogHint:
        'Нажмите «+ Добавить к этому агенту» на любом плагине — проверенные записи будут установлены при закрепленном коммите в выбранный профиль. Входящие в комплект плагины «агент + рабочий стол» предлагают обе половины.',
      alreadyInstalled: (name: string) => `${name}уже установлено в этом профиле.`,
      catalogProvenance: (sha: string) => `Установлен из каталога Hermes.${sha ? ` at pin ${sha}` : ''}.`,
      pinnedProvenance: (sha: string) =>
        `Pinned to commit ${sha}. Обновления отклоняются до тех пор, пока они не будут переустановлены с новым PIN-кодом.`,
      pinnedBadge: (sha: string) => `закреплено @${sha}`,
      tierOfficial: 'чиновник',
      tierCommunity: 'сообщество',
      updateToPin: (sha: string) => `Обновить до${sha}`,
      updateFailed: (name: string) => `Не удалось обновить${name}`,
      updated: (name: string) =>
        `${name}обновлено до текущего каталожного PIN-кода. Перезапустите шлюз, чтобы применить изменения.`,
      desktopHalfRemote: 'недоступен (удаленный сервер)',
      desktopHalfRemoteTip:
        'Половина рабочего стола этого пакета находится на диске удаленной серверной части, который это приложение не может прочитать. Чтобы использовать его здесь, запустите Install из Git с репозиторием пакета URL и отмеченной целью Desktop — это клонирует половину рабочего стола на этот компьютер.',
      updateConsentTitle: (name: string) => `${name}просит ещё`,
      updateConsentBody: (name: string, sha: string) =>
        `The new catalog pin of ${name} (${sha}) добавляет поверхности, которых нет в установленной версии. Применяйте его, только если вы им доверяете:`,
      updateConsentConfirm: 'Применить обновление',
      uninstall: 'Удалить',
      uninstallTip: (name: string, profile: string) => `Удалить${name}из${profile}`,
      uninstallConfirmTitle: (name: string) => `Удалить${name}?`,
      uninstallConfirmBody: (name: string, profile: string) =>
        `Это удаляет файлы плагина из${profile}профиль. Любой десктоп, с которым он был отправлен, удаляется вместе с ним. Установите его снова из каталога или с Git в любое время.`,
      uninstallFailed: (name: string) => `Не удалось удалить${name}`,
      uninstalled: (name: string) => `${name}удалено. Перезапустите шлюз, чтобы выгрузить его.`,
      uninstallDesktopTip: (name: string) => `Удалить${name}из этого приложения`,
      uninstallDesktopConfirmBody: (name: string) =>
        `Это удаляет${name}из папки desktop-plugins на этом компьютере и выгружает его сейчас. Переустановите его с Git или верните папку обратно в любое время.`,
      uninstalledDesktop: (name: string) => `${name}деинсталлировано.`,
      deepLinkErrorTitle: 'Ссылка для установки плагина отклонена',
      deepLinkCatalogInvalidName: 'Имя каталога ссылки отсутствует или недействительно.',
      deepLinkCatalogUnknown: (name: string) =>
        `“${name}» отсутствует в каталоге плагинов Hermes. Ничего не было установлено.`,
      deepLinkCatalogUnavailable:
        'Не удалось загрузить каталог плагинов Hermes. Проверьте подключение и откройте ссылку еще раз.',
      settingsToggle: (name: string) => `Настройки:${name}`,
      settingsForm: {
        save: 'Сохранить настройки',
        saved: (name: string) => `${name}настройки сохранены.`,
        saveFailed: (name: string) => `Не удалось сохранить${name}настройки`,
        optional: '(необязательно)',
        secretSet: '•••••••• (комплект)',
        secretStoredAs: (env: string) =>
          `Stored in the profile's .env as ${env}, никогда в config.yaml; оставьте пустым, чтобы сохранить текущее значение.`
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
      featured: 'Избранные навыки',
      landingHint:
        'Ищите в хабе, чтобы просматривать устанавливаемые навыки из официального индекса, GitHub и источников сообщества.',
      noResults: 'Совпадающие навыки в хабе не найдены.',
      resultCount: (count, ms) =>
        `${count} ${RU_PLURAL(count, 'результат', 'результата', 'результатов')}${ms !== null ? ` за ${ms}мс` : ''}`,
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
      findings: count => `${count} ${RU_NOUN(count, 'находка', 'находки', 'находок')}`,
      noFindings: 'Находок безопасности нет.',
      installStarted: name => `Установка ${name}...`,
      uninstallStarted: name => `Удаление ${name}...`,
      updateStarted: 'Обновление установленных навыков...',
      actionFailed: 'Действие с навыком не удалось',
      actionLog: 'Журнал действий',
      alreadyInstalled: name => `«${name}» уже установлен`,
      pickerTitle: 'Хаб навыков',
      pickerBrowse: 'Открыть весь хаб',
      pickerHide: 'Скрыть браузер хаба',
      pickerHint: 'Нажмите «+ Добавить к этому агенту» на любом навыке — он установится и появится в списке выше.',
      loadFailed: 'Не удалось загрузить хаб навыков',
      previewFailed: 'Не удалось получить предпросмотр навыка',
      scanFailed: 'Не удалось выполнить проверку безопасности',
      searchFailed: 'Поиск в хабе не удался',
      installBlockedTitle: name => `Не удалось установить${name}`,
      installBlockedMessage: (findings, unverified) =>
        `The security scan flagged ${findings > 0 ? `${findings} item${findings === 1 ? '' : 's'}` : 'рискованные модели'} to review${unverified ? ' and the skill comes from an unverified source' : ''}. Прочтите скан, прежде чем решить, стоит ли доверять автору.`,
      viewScan: 'Посмотреть скан',
      openLog: 'Открыть журнал'
    },
    toolsetDescriptions: {
      a2a: 'A2A (Agent-to-Agent) protocol v1.0 support for Hermes Agent — bidirectional inter-agent communication using the open Linux Foundation standard. Outbound tools discover peers, fetch Agent Cards, and send JSON-RPC tasks. The inbound adapter exposes Hermes at /.well-known/agent-card.json and routes tasks into its live gateway session with full memory and context. Localhost-only binding is used when no bearer token is configured; inbound text is filtered, outbound credentials are scrubbed, and exchanges are audit-logged outside context compaction. Uses only the Python standard library; no a2a-sdk dependency is required.',
      stt: 'voice transcription (gateway voice messages + voice mode)'
    },
    toolsetLabels: {
      stt: 'Speech-to-Text'
    }
  },
  starmap: {
    title: 'Граф памяти',
    subtitle: (nodes, clusters) =>
      `${nodes} ${RU_NOUN(nodes, 'навык', 'навыка', 'навыков')} в ${clusters} ${RU_NOUN(clusters, 'категория', 'категории', 'категорий')}`,
    close: 'Закрыть граф памяти',
    refresh: 'Обновить',
    memory: 'Память',
    skill: 'умение',
    pauseTimeline: 'Сроки паузы',
    playTimeline: 'Время игры',
    timelineScrubber: 'Таймлайн скруббер',
    ageLegend: 'ядро = старейшее; внешнее = новое',
    editNode: kind => `Редактировать${kind}…`,
    archiveSkill: 'Архивное мастерство',
    deleteMemory: 'Удалить память',
    editTitle: label => `Редактировать${label}`,
    deleteTitle: label => `Удалить${label}?`,
    deleteMemoryDescription: 'Эта память удаляется навсегда.',
    filterAll: 'Все',
    filterUsed: 'Использованные',
    filterLearned: 'Наученные',
    viewGraph: 'Граф',
    loadFailed: 'Не удалось загрузить граф памяти',
    loading: 'Загрузка…',
    emptyTitle: 'Пока ничего не изучено',
    emptyDesc: 'По мере того как Hermes создаёт навыки и память для вашей работы, они появятся здесь.',
    share: 'Поделиться картой',
    shareHint:
      'Скопируйте код, чтобы поделиться этой картой, или вставьте код для загрузки. Включает только раскладку, а не вашу память или текст навыков.',
    shareTitle: 'Импорт / экспорт карты',
    sharePlaceholder: 'Вставьте код карты…',
    copy: 'Скопировать код карты',
    copied: 'Скопировано!',
    importMap: 'Импортировать карту',
    importBtn: 'Загрузить',
    importEmpty: 'Вставьте код карты для загрузки.',
    importSuccess: nodes => `Загружена карта с ${nodes} ${RU_NOUN(nodes, 'узлом', 'узла', 'узлов')}.`,
    importedBadge: 'импортированная карта',
    resetToMine: 'Вернуться к моей карте'
  },
  agents: {
    extendedTranscript: 'Подробный журнал',
    transcriptTruncated: 'Последние 16 КиБ',
    transcriptUnavailable: 'Текущий журнал недоступен',
    close: 'Закрыть агентов',
    title: 'Дерево запусков',
    subtitle: 'Активные субагенты текущего хода в реальном времени.',
    emptyTitle: 'Нет активных субагентов',
    emptyDesc: 'Когда ход делегирует работу, дочерние агенты стримят свой прогресс сюда.',
    running: 'Выполняется',
    failed: 'Ошибка',
    done: 'Готово',
    streaming: 'Стримится',
    files: 'Файлы',
    moreFiles: count => `+ещё ${count} ${RU_NOUN(count, 'файл', 'файла', 'файлов')}`,
    moreAgents: count => `Ещё ${count} агентов`,
    queued: 'В очереди',
    waitingActivity: 'Ожидание активности',
    steer: 'Направить',
    steerPlaceholder: 'Инструкции этому субагенту',
    steerQueued: 'В очереди до следующей контрольной точки',
    stopRequested: 'Запрошена остановка',
    requestRejected: 'Субагент не принял запрос',
    delegation: index => `Делегирование ${index}`,
    workers: count => `${count} ${RU_NOUN(count, 'воркер', 'воркера', 'воркеров')}`,
    workersActive: count => `${count} ${RU_NOUN(count, 'активен', 'активно', 'активных')}`,
    agentsCount: count => `${count} ${RU_PLURAL(count, 'агент', 'агента', 'агентов')}`,
    activeCount: count => `${count} ${RU_NOUN(count, 'активен', 'активно', 'активных')}`,
    failedCount: count => `${count} ${RU_NOUN(count, 'с ошибкой', 'с ошибками', 'с ошибками')}`,
    toolsCount: count => `${count} ${RU_NOUN(count, 'инструмент', 'инструмента', 'инструментов')}`,
    filesCount: count => `${count} ${RU_NOUN(count, 'файл', 'файла', 'файлов')}`,
    updatedAgo: age => `обновлено ${age}`,
    ageNow: 'только что',
    ageSeconds: seconds => `${seconds}с назад`,
    ageMinutes: minutes => `${minutes}м назад`,
    ageHours: hours => `${hours}ч назад`,
    ageDays: days => `${days}д назад`,
    durationSeconds: seconds => `${seconds}с`,
    durationMinutes: (minutes, seconds) => `${minutes}м ${seconds}с`,
    tokens: value => `${value} ток`
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
      adoptFailed: 'Не удалось усыновить этого питомца.',
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
      adopt: 'Усыновить',
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
    sections: {
      maintenance: 'Обслуживание',
      sessions: 'Сеансы',
      system: 'Система',
      usage: 'Использование'
    },
    sectionDescriptions: {
      maintenance: 'Диагностика, резервные копии, курир и данные памяти',
      sessions: 'Поиск и управление сеансами',
      system: 'Статус, журналы и системные действия',
      usage: 'Токены, стоимость и активность навыков со временем'
    },
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
    openBrowser: 'Открыть браузер',
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
    days: count => `${count}д`,
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
    logSearchPlaceholder: 'Фильтр строк журнала...',
    maintenance: {
      runOps: 'Диагностика',
      doctor: 'Запустить doctor',
      doctorDesc: 'Проверка здоровья установки, конфигурации и провайдеров',
      securityAudit: 'Аудит безопасности',
      securityAuditDesc: 'Сканирование конфигурации и навыков на предмет рискованных настроек',
      backup: 'Создать резервную копию',
      backupDesc: 'Сжатие конфигурации, памяти, навыков и сеансов в zip',
      debugShare: 'Поделиться отладкой',
      debugShareDesc: 'Загрузка анонимизированного отчёта + журналов, получение ссылок (автоудаление через 6 ч)',
      debugShareRunning: 'Загрузка отладочного отчёта...',
      debugShareLinks: 'Ссылки для шаринга',
      debugShareFailed: 'Ошибка шаринга отладки',
      copyLink: 'Скопировать ссылку',
      linkCopied: 'Ссылка скопирована',
      curator: 'Курир навыков',
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
    waitingSince: minutes => (minutes < 1 ? 'только что' : `${minutes}м назад`),
    restartNeeded: 'Сохранено. Перезапустите шлюз сообщений, чтобы применить новые настройки.',
    restartNow: 'Перезапустить',
    restarting: 'Перезапуск…',
    restartFailedManual: 'Не удалось перезапустить шлюз — перезапустите его вручную и проверьте журналы.',
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
        help: 'Рекомендуется. Числовые ID через @userinfobot через запятую. Без этого писать вашему боту может кто угодно.'
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
        help: 'Рекомендуется. ID пользователей Discord через запятую.'
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
        help: 'Рекомендуется. ID пользователей Slack через запятую.'
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
        help: 'Рекомендуется. ID пользователей Mattermost через запятую.'
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
        help: 'Рекомендуется. ID пользователей через запятую в формате @user:server.'
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
        help: 'Рекомендуется. Идентификаторы Signal через запятую.'
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
        help: 'Рекомендуется. Номера телефонов или ID WhatsApp через запятую.'
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
      'Вебхуки — это отдельная платформа шлюза. Включите их здесь, чтобы принимать входящие HTTP-события; чат-каналы нужны только когда подписка доставляет в Telegram, Discord, Slack или другой канал.',
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
    fieldDeliver: 'Доставить в',
    fieldDeliverOnly: 'Доставлять только payload',
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
    openFailed: profile => `Failed to open profile "${profile}"`,
    switchFailed: profile => `Failed to switch to profile "${profile}"`,
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
      gateway: gateway => `Профили включены${gateway}`,
      gatewayUnreachable: gateway => `${gateway}· недоступный`,
      onGateway: (name, gateway) => `${name} · ${gateway}`,
      switchTo: (name, gateway) => `Переключиться на${name}включено${gateway}`,
      deleteOn: gateway => `включено${gateway}`
    },
    remoteOverride: {
      menuItem: 'Подключиться к удаленному хосту…',
      badge: (host: string) => `Работает на${host}`,
      title: (profile: string) => `Подключить${profile}к удаленному хосту`,
      description:
        'Сеансы в этом профиле будут запускаться на удаленном Hermes, на который вы указываете, а не на этом компьютере.',
      urlLabel: 'Удаленный адрес',
      urlPlaceholder: 'https://hermes.example.com',
      urlInvalid: 'Введите полный адрес, начиная с http:// или https://.',
      tokenLabel: 'Токен доступа',
      tokenPlaceholder: 'Вставьте токен удаленного сеанса',
      tokenSavedHint: 'Токен уже сохранен. Оставьте пустым, чтобы сохранить его.',
      plainTextOptIn:
        'На этом компьютере нет безопасного хранилища ключей, поэтому токен будет сохранен на диске в незашифрованном виде. Все равно сохраните.',
      collisionWarning: (label: string) =>
        `Шлюз под названием «${label}» уже существует в настройках. Это подключение к профилю является отдельным и не изменит его.`,
      confirmTitle: 'Подключить этот профиль к удаленному хосту?',
      confirmNote: (profile: string, host: string) =>
        `New chats in ${profile} will run on ${host}. Этот компьютер будет выполнять команды и читать файлы там, а не на этом. Подключайтесь только к хосту, которому вы доверяете.`,
      confirmBack: 'Назад',
      connect: 'Подключиться',
      connecting: 'Подключение…',
      disconnect: 'Удалить удаленное подключение',
      savedTitle: 'Профиль подключен',
      savedMessage: (profile: string, host: string) => `${profile}теперь работает на${host}`,
      removedTitle: 'Удаленное подключение удалено',
      removedMessage: (profile: string) => `${profile}теперь работает на этом компьютере`,
      removeFailed: 'Не удалось удалить удаленное подключение',
      authFailedTitle: 'Удаленный хост отклонил сохраненный токен',
      authFailedMessage: (profile: string, host: string) =>
        `${host} refused the token saved for ${profile}. Возможно, оно было изменено на удаленной стороне.`,
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
    displayNameTitle: 'Название этого агента',
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
    defaultDescription: 'Используется при запуске Hermes и для новых чатов. Профили существующих сессий не меняются.',
    failedSetDefault: 'Не удалось установить профиль по умолчанию'
  },
  cron: {
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
    nameLabel: 'Имя',
    namePlaceholder: 'Утренний брифинг',
    promptLabel: 'Промпт',
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
        'Topic news digest': 'Периодическая сводка по интересующим темам без повторов — только действительно новые материалы.',
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
    editJob: 'Редактировать задание',
    runAgain: 'Беги снова',
    overdueSince: 'Просрочено с:',
    modelImpact: {
      title: 'Запланированные задачи остаются на исходной модели',
      message: count =>
        `${count} незакреплённых запланированных задач продолжат работать на модели, с которой были созданы. Закрепите их или задайте cron.model, чтобы перевести.`,
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
    noArtifactsDesc: 'Сгенерированные изображения и файловые результаты появятся здесь по мере их создания в сеансах.',
    failedLoad: 'Не удалось загрузить артефакты',
    openFailed: 'Не удалось открыть',
    itemsImage: 'изображения',
    itemsLink: 'ссылки',
    itemsFile: 'файлы',
    itemsGeneric: 'элементы',
    zero: '0',
    rangeOf: (start, end, total) => `${start}–${end} из ${total}`,
    goToPage: (itemLabel, page) => `Перейти на страницу ${page} ${itemLabel}`,
    colTitleLink: 'Название ссылки',
    colTitleFile: 'Имя',
    colTitleDefault: 'Название / имя',
    colLocationLink: 'URL',
    colLocationFile: 'Путь',
    colLocationDefault: 'Место',
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
    olderVersion: 'Более старая версия',
    newerVersion: 'Более новая версия',
    latest: 'Последняя',
    copyContent: 'Копировать содержимое',
    download: 'Скачать',
    openInBrowser: 'Открыть в браузере',
    openInBrowserFailed: 'Не удалось открыть в браузере',
    missingTitle: 'Артефакт недоступен',
    missingBody: 'Этот артефакт больше нет в локальном реестре.'
  },
  sidebar: {
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
    projects: {
      showAllSessions: 'Показать все сессии',
      sectionLabel: 'Проекты',
      home: 'Главная',
      autoDiscovered: 'Автоматически обнаружено',
      newButton: 'Новый проект',
      createTitle: 'Новый проект',
      createDesc: 'Назовите рабочее пространство и добавьте одну или несколько папок.',
      renameTitle: 'Переименовать проект',
      addFolderTitle: 'Добавить папку',
      namePlaceholder: 'например, Skunkworks',
      foldersLabel: 'Папки',
      ideaLabel: 'Идея',
      ideaPlaceholder: 'О чём этот проект? (сохраняется в IDEA.md)',
      ideaGenerate: 'Сгенерировать идею',
      ideaGenerating: 'Генерация…',
      ideaShuffle: 'Перемешать шаблоны',
      noFolders: 'Папки ещё не добавлены.',
      addFolder: 'Добавить папку',
      primaryBadge: 'основная',
      removeFolder: 'Удалить',
      create: 'Создать',
      menu: 'Действия',
      menuRename: 'Переименовать',
      menuAppearance: 'Внешний вид',
      noColor: 'Без цвета',
      menuAddFolder: 'Добавить папку',
      menuSetActive: 'Сделать активным',
      menuDelete: 'Удалить',
      moveToProject: 'Переместить в проект',
      movedTo: name => `Перемещено в ${name}`,
      moveFailed: 'Не удалось переместить сеанс',
      moveNoFolder: 'У этого проекта нет папки для перемещения',
      moveNoProjects: 'Нет других проектов',
      reveal: 'Показать в папке',
      copyPath: 'Копировать путь',
      removeFromSidebar: 'Скрыть из боковой панели',
      createFailed: 'Не удалось создать проект',
      unavailableAllProfiles: 'Проекты недоступны при просмотре всех профилей',
      staleBackend:
        'Обновите бэкенд Hermes, чтобы создавать проекты — ваш бэкенд старше этого desktop-приложения (Настройки → Обновления → Бэкенд).',
      deleteConfirm: 'Это удалит сохранённый проект из Hermes. Файлы, git-репозитории и worktrees не пострадают.',
      startWork: 'Новый worktree',
      newWorktreeTitle: 'Новый worktree',
      newWorktreeDesc: 'Назовите ветку для этого worktree.',
      branchPlaceholder: 'например, my-feature',
      branchOff: () => ({ after: '', before: 'от ветки ' }),
      baseBranchPlaceholder: 'Поиск веток…',
      baseBranchNone: 'Ветки не найдены',
      startWorkFailed: 'Не удалось создать worktree',
      worktreeStaleBackend:
        'Обновите бэкенд Hermes, чтобы создавать worktrees по этому удалённому соединению — он старше git worktree API.',
      worktreeProjectLabel: 'Проект',
      worktreeProjectPlaceholder: 'Поиск проектов…',
      worktreeProjectNone: 'Нет проектов с папкой',
      convertBranch: 'Преобразовать ветку…',
      convertBranchTitle: 'Преобразовать ветку',
      convertBranchDesc: 'Откройте закоммиченные ветки или создайте worktree для свободной ветки.',
      convertBranchPlaceholder: 'Поиск веток…',
      convertBranchInstead: 'Преобразовать существующую ветку',
      branchOpenExisting: 'открыть',
      branchSwitchHome: 'сменить home',
      branchCreateWorktree: 'новый worktree',
      branchTrackRemote: 'отслеживать удалённую',
      branchesLoading: 'Загрузка веток…',
      noBranches: 'Ветки не найдены',
      removeWorktree: 'Удалить worktree',
      removeWorktreeFailed: 'Не удалось удалить worktree (есть незакоммиченные изменения?)',
      removeWorktreeConfirm:
        'Удалить из git (сотрёт каталог worktree; ветка останется) или просто скрыть лану из боковой панели, оставив worktree на диске.',
      removeWorktreeDirty:
        'В этом worktree есть незакоммиченные изменения. Удалить принудительно (сбросит эти изменения) или просто скрыть лану и оставить на диске.',
      forceRemove: 'Удалить принудительно',
      enter: label => `Открыть ${label}`,
      reorder: label => `Изменить порядок ${label}`,
      toggle: (label, open) => `${open ? 'Показать' : 'Скрыть'} сеансы ${label}`,
      back: 'Все проекты',
      showAllCount: count => `Показать все сессии (${count})`
    },
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
      rename: 'Переименовать',
      archive: 'В архив',
      newWindow: 'Новое окно',
      openInTerminal: 'Открыть в терминале',
      hideTabBar: 'Скрыть панель вкладок',
      openInNewTab: 'Открыть в новой вкладке',
      openInSplit: 'Открыть в сплит-виде',
      splitDirections: {
        right: 'Правильно',
        bottom: 'Вниз',
        left: 'Лево',
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
      renameDesc: 'Оставьте пустым, чтобы очистить.',
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
      ageMin: 'м'
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
      ordering: 'Заказывать',
      show: 'Показать',
      inboxStyle: 'Стиль почтовых ящиков',
      filters: 'Фильтры',
      status: 'Статус',
      pullRequest: 'Запрос на вытягивание',
      profile: 'Профиль',
      project: 'Проект',
      archived: 'Архивировано',
      resetToDefaults: 'Сбросить настройки по умолчанию',
      expandAll: 'Расширять все',
      collapseAll: 'Сломать все',
      markAllRead: 'Отметить все как прочитанное',
      options: {
        updated: 'Обновлено',
        project: 'Проект',
        status: 'Статус',
        profile: 'Профиль',
        created: 'Созданный',
        tokens: 'Токены',
        cost: 'Стоимость',
        manual: 'Руководство',
        preview: 'Предварительный просмотр',
        pr: 'PR',
        open: 'Открыть',
        draft: 'Проект',
        merged: 'Слитый',
        closed: 'Закрытый',
        noPr: 'Нет PR',
        needsInput: 'Требуется ввод',
        working: 'Работающий',
        unread: 'Читать',
        idle: 'Безделье'
      }
    },
    markAllRead: 'Отметить все как прочитанные',
    profileRail: 'Профильная рейка',
    terminal: 'Терминал',
    files: 'Файлы',
    review: 'Проверка',
    logs: 'Журналы'
  },
  intro: {
    bodies: {}
  },
  composer: {
    message: 'Сообщение',
    botSelectionRequired: 'Выберите бот, прежде чем начать другой чат.',
    botChatUnsupported: 'Обновление Hermes Настольный компьютер, чтобы открыть еще один чат бота.',
    addContext: 'Добавить контекст',
    wakingProfile: profile => `Пробуждаем ${profile}…`,
    placeholderStarting: 'Запуск Hermes...',
    placeholderReconnecting: 'Переподключение к Hermes…',
    placeholderFollowUp: 'Отправить продолжение',
    newSessionPlaceholders: [
      'Что будем делать?',
      'Дайте Hermes задачу',
      'О чём вы думаете?',
      'Опишите, что нужно',
      'Что обсудим?',
      'Спросите о чём угодно',
      'Начните с цели'
    ],
    followUpPlaceholders: [
      'Отправьте продолжение',
      'Добавьте контекст',
      'Уточните запрос',
      'Что дальше?',
      'Продолжаем',
      'Запустите дальше',
      'Скорректируйте или продолжите'
    ],
    startVoice: 'Начать голосовой разговор',
    openDirective: 'Открыть',
    queueMessage: 'Вставить сообщение в очередь',
    steer: 'Направить текущий запуск',
    stop: 'Стоп',
    send: 'Отправить',
    speaking: 'Говорит',
    transcribing: 'Расшифровка',
    thinking: 'Думает',
    muted: 'Приглушено',
    listening: 'Слушает',
    muteMic: 'Выключить микрофон',
    unmuteMic: 'Включить микрофон',
    stopListening: 'Перестать слушать и отправить',
    stopShort: 'Стоп',
    endConversation: 'Завершить голосовой разговор',
    endShort: 'Завершить',
    stopDictation: 'Остановить диктовку',
    transcribingDictation: 'Расшифровка диктовки',
    voiceControls: 'Голос',
    voiceEngine: 'Механизм голосового чата',
    voiceEngineChained: 'Преобразование речи в текст + голос Hermes',
    voiceEngineLive: 'GPT-Live (полнодуплексный режим, делегаты Hermes)',
    voiceEngineLiveNeedsKey: 'Требуется ключ OpenAI API.',
    voiceEngineChangeFailed: 'Не удалось изменить механизм голосового чата.',
    voiceEngineChainedShort: 'речь в текст',
    voiceEngineLiveShort: 'GPT-В прямом эфире',
    voiceDictation: 'Голосовая диктовка',
    speakReplies: 'Зачитывать ответы вслух',
    stopSpeakingReplies: 'Перестать зачитывать ответы вслух',
    wakeWordListening: phrase => `Слово-пробуждение: «${phrase}» — слушает`,
    wakeWordOff: phrase => `Слово-пробуждение: «${phrase}» — выключено`,
    wakeWordPausedVoice: phrase => `Слово-пробуждение: «${phrase}» — приостановлено во время голосового чата`,
    wakeWordClickToEnable: 'нажмите, чтобы включить',
    lookupLoading: 'Ищем…',
    lookupNoMatches: 'Нет совпадений.',
    lookupTry: 'Попробуйте',
    lookupOr: 'или',
    commonCommands: 'Частые команды',
    hotkeys: 'Горячие клавиши',
    helpFooter: 'открывает полную панель · backspace закрывает',
    commandDescs: {
      '/help': 'полный список команд + горячих клавиш',
      '/clear': 'начать новый сеанс',
      '/resume': 'возобновить прошлый сеанс',
      '/details': 'уровень детализации транскрипта',
      '/copy': 'скопировать выделенное или последнее сообщение ассистента',
      '/quit': 'выйти из hermes'
    },
    hotkeyDescs: {
      'composer.mention': 'ссылки на файлы, папки, URL, git',
      'composer.slash': 'палитра слэш-команд',
      'composer.help': 'эта быстрая справка (удалите, чтобы закрыть)',
      'composer.sendNewline': 'отправить · Shift+Enter — новая строка',
      'composer.sendQueued': 'отправить следующий ход в очереди',
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
    queueEdit: 'Изменить',
    queueSendNext: 'Дальше',
    queueSteer: 'Направить — изменить текущий ход сейчас',
    queueSend: 'Отправить',
    queueDelete: 'Удалить',
    queueResume: 'Продолжить',
    queueResumeTip: 'Приостановлено стопом — продолжить отправку ходов из очереди',
    queueStuckTitle: 'Сообщение из очереди не отправлено',
    queueStuckBody:
      'Ход из очереди несколько раз не удалось отправить. Он всё ещё в очереди — попробуйте отправить снова.',
    previewUnavailable: 'Предпросмотр недоступен',
    previewLabel: label => `Предпросмотр ${label}`,
    couldNotPreview: label => `Не удалось предпросмотреть ${label}`,
    removeAttachment: label => `Удалить ${label}`,
    dictating: 'Диктовка',
    preparingAudio: 'Подготовка аудио',
    speakingResponse: 'Зачитывает ответ',
    readingAloud: 'Читает вслух',
    themeSuggestions: 'Предложения тем desktop',
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
    tipPost: ' чтобы ссылаться на файлы inline.',
    snippetsTitle: 'Фрагменты промптов',
    snippetsDesc: 'Выберите стартовый промпт, чтобы вставить в композер.',
    dropFiles: 'Перетащите файлы, чтобы прикрепить',
    dropSession: 'Перетащите, чтобы связать этот чат',
    mcpSuggestions: {
      label: server => `Добавить ${server}`,
      tip: keyword => `Предложено, потому что вы упомянули «${keyword}» — нажмите, чтобы подключить`,
      connecting: server => `Подключаем ${server}…`,
      cancelTip: 'Нажмите, чтобы отменить',
      added: server => `Добавлен ${server}`,
      addedTip: 'Подключено — его инструменты готовы в этом чате',
      connectFailed: server => `Не удалось подключить ${server}`
    },
    skillSuggestions: {
      label: skill => `Использовать навык: ${skill}`,
      tip: skill => `Вы упомянули «${skill}» — нажмите, чтобы начать с этого навыка`,
      done: skill => `Добавлено /${skill}`,
      doneTip: 'Навык загрузится при отправке'
    },
    githubSuggestions: {
      label: 'Настроить GitHub',
      tip: 'GitHub работает через навыки gh CLI здесь — нажмите, чтобы подключить аккаунт',
      done: 'Добавлено /github-auth',
      doneTip: 'Отправьте сообщение, и агент проведёт вас через вход в GitHub'
    },
    repairSuggestions: {
      label: server => `Переподключить ${server}`,
      tip: server => `Недавний вызов ${server} завершился ошибкой соединения`,
      working: server => `Переподключаем ${server}…`,
      workingTip: 'Нажмите, чтобы отменить',
      done: server => `Переподключено ${server}`,
      doneTip: 'Свежие учётные данные активны в этом чате',
      failed: server => `Не удалось переподключить ${server}`
    },
    cronSuggestions: {
      label: 'Запланировать это',
      tip: phrase => `«${phrase}» звучит как повторяющееся — запланируйте выполнение по расписанию`,
      prefix: 'Настроить это как запланированную задачу:',
      done: 'Отмечено для планирования',
      doneTip: 'Отправьте, и агент создаст задачу'
    },
    snippets: {
      codeReview: {
        label: 'Рецензия кода',
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
    wakeWord: phrase => `Слово-пробуждение «${phrase}»`,
    restoredDraftNotice: 'Восстановлено ваше неотправленное сообщение',
    restoredDraftUndo: 'Отменить'
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
    running: 'Выполняется',
    stop: 'Стоп',
    dismiss: 'Скрыть',
    exit: code => `exit ${code}`,
    control: {
      goalActiveTurns: (turn, maxTurns) => `Ход ${turn}/${maxTurns}`,
      goalDoneTurns: turns => `${turns} ходов`,
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
      clearGoal: 'Очистить цель',
      clearGoalConfirmTitle: 'Очистить цель?',
      clearGoalConfirmBody: 'Вы уверены, что хотите очистить активную цель? Это действие необратимо.',
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
      waitSession: target => `Ожидание сессии ${target}`,
      waitPid: pid => `Ожидание процесса ${pid}`,
      qualityGatesTitle: 'Контроли качества',
      gateCommand: 'Команда',
      gateAttempts: (attempts, max) => `${attempts}/${max} попыток`,
      gateTimeout: seconds => `таймаут ${seconds}с`,
      gateLastExit: code => (code === null ? 'В ожидании' : `Код возврата: ${code}`),
      loopActive: 'Цикл активен',
      loopPaused: 'Цикл приостановлен',
      loopDeferred: 'Цикл отложен',
      loopFinished: 'Цикл завершен',
      loopRuns: runs => `${runs} запусков`,
      loopRunCount: (current, total) => `Запуск ${current}/${total}`,
      loopNext: time => `следующий ${time}`,
      loopEverySeconds: seconds => `каждые ${seconds}с`,
      loopEveryMinutes: minutes => `каждые ${minutes}м`,
      loopEveryHours: hours => `каждые ${hours}ч`,
      loopSelfPaced: 'автономный',
      loopActions: 'Действия цикла',
      pauseLoop: 'Приостановить цикл',
      resumeLoop: 'Возобновить цикл',
      stopLoop: 'Остановить цикл',
      stopLoopConfirmTitle: 'Остановить цикл?',
      stopLoopConfirmBody: 'Вы уверены, что хотите остановить этот цикл?',
      dismissLoop: 'Закрыть цикл',
      loopPromptLabel: 'Промпт',
      loopCadenceLabel: 'Интервал',
      loopUntilLabel: 'Условие окончания',
      loopDeferredNotice: 'Активная цель в данный момент управляет сессией.',
      loopAwaitingResponse: 'Ожидание ответа',
      heartbeatActive: 'Пульс активен',
      heartbeatPaused: 'Пульс приостановлен',
      heartbeatEveryMinutes: minutes => `каждые ${minutes}м`,
      heartbeatEveryHours: hours => `каждые ${hours}ч`,
      heartbeatEverySeconds: seconds => `каждые ${seconds}с`,
      heartbeatNext: time => `следующий ${time}`,
      heartbeatDueWaitingForIdle: 'пора — ожидание простоя',
      heartbeatActions: 'Действия пульса',
      pauseHeartbeat: 'Приостановить пульс',
      resumeHeartbeat: 'Возобновить пульс',
      clearHeartbeat: 'Очистить пульс',
      clearHeartbeatConfirmTitle: 'Очистить пульс?',
      clearHeartbeatConfirmBody: 'Вы уверены, что хотите очистить этот пульс?',
      heartbeatFiredCount: count => `Сработал ${count} раз`,
      actionFailed: msg => `Ошибка действия: ${msg}`,
      actionSucceeded: 'Действие выполнено успешно',
      copySuccess: 'Критерий скопирован в буфер обмена',
      copyFailure: 'Не удалось скопировать критерий в буфер обмена',
      continuationFailed: 'Не удалось отправить продолжение цели',
      continuationQueued: 'Цель возобновлена — продолжение поставлено в очередь до конца текущего хода',
      continuationBusy: 'Цель возобновлена — сессия занята, выполните /interrupt, чтобы продолжить',
      controlUnavailable: msg => `Управление сессией недоступно: ${msg}`,
      dismissError: 'Скрыть ошибку',
      add: 'Добавить'
    },
    coding: {
      title: 'Рабочее дерево',
      noBranch: 'Без ветки',
      detached: 'отсоединена',
      clean: 'Чисто',
      changed: count => `${count} изменено`,
      ahead: count => `${count} впереди`,
      behind: count => `${count} позади`,
      review: 'Проверить',
      close: 'Закрыть',
      openChanges: 'Открыть изменения',
      openFile: 'Открыть файл',
      stage: 'Добавить в индекс',
      unstage: 'Убрать из индекса',
      stageAll: 'Добавить всё в индекс',
      viewAsTree: 'Вид деревом',
      viewAsList: 'Вид списком',
      revert: 'Отменить',
      revertAll: 'Отменить всё',
      revertConfirm:
        'Сбросить изменения в этом файле и вернуть его в закоммиченное состояние? Это действие необратимо.',
      revertAllConfirm: 'Сбросить все изменения и вернуть файлы в закоммиченное состояние? Это действие необратимо.',
      staged: 'В индексе',
      noChanges: 'Изменений нет',
      notRepo: 'Не git-репозиторий',
      noDiff: 'Нет diff для показа',
      scopeUncommitted: 'Незакоммиченные',
      scopeBranch: 'Ветка',
      scopeLastTurn: 'Последний ход',
      commit: 'Коммит',
      commitAndPush: 'Коммит и Push',
      commitPlaceholder: shortcut => `Сообщение (${shortcut} — коммит)`,
      generateCommitMessage: 'Сгенерировать сообщение коммита',
      stopGenerating: 'Остановить генерацию',
      createPr: 'Создать PR',
      openPr: 'Открыть PR',
      ghMissing: 'Установите GitHub CLI (gh) и войдите, чтобы открывать PR',
      agentShip: 'Попросить Hermes открыть PR',
      agentShipUnavailable: 'Чат, которому принадлежат эти изменения, не на экране.',
      agentShipPrompt:
        'Проверьте текущие изменения, закоммитьте их с ясным conventional-commit сообщением, запушьте ветку и создайте pull request.',
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
    stages: {
      idle: 'Готовимся…',
      prepare: 'Готовимся…',
      fetch: 'Скачиваем…',
      pull: 'Почти готово…',
      pydeps: 'Завершаем…',
      update: 'Обновляем Hermes…',
      rebuild: 'Пересобираем desktop-приложение…',
      restart: 'Перезапускаем Hermes…',
      done: 'Обновление завершено',
      manual: 'Обновление из терминала',
      guiSkew: 'Обновите desktop-приложение',
      error: 'Обновление приостановлено'
    },
    checking: 'Ищем обновления…',
    checkFailedTitle: 'Не удалось проверить обновления',
    tryAgain: 'Попробовать снова',
    notAvailableTitle: 'Обновление недоступно',
    unsupportedMessage: 'Эта версия Hermes не может обновлять себя из приложения.',
    connectionRetry: 'Проверьте соединение и попробуйте снова.',
    latestBody: 'У вас последняя версия.',
    latestBodyBackend: 'Бэкенд работает на последней версии.',
    allSetTitle: 'Всё готово',
    availableTitle: 'Доступно новое обновление',
    availableBody: 'Новая версия Hermes готова к установке.',
    availableTitleBackend: 'Доступно обновление бэкенда',
    availableBodyBackend: 'Новая версия подключённого бэкенда Hermes готова к установке.',
    availableBodyNoChangelog: 'Новая версия готова. Заметки о выпуске недоступны для этого типа установки.',
    updateNow: 'Обновить сейчас',
    maybeLater: 'Возможно позже',
    moreChanges: count => `+ ещё ${count} ${RU_NOUN(count, 'изменение', 'изменения', 'изменений')} включено.`,
    changelogGroups: {
      new: 'Что нового',
      fixed: 'Фиксированный',
      faster: 'Быстрее',
      improved: 'Улучшенный',
      other: 'Другие улучшения'
    },
    changelogFallbackTitle: 'В этом обновлении',
    changelogFallback: 'Улучшения и исправления',
    manualTitle: 'Обновление из терминала',
    manualBody:
      'Hermes установлен из командной строки, поэтому обновления тоже выполняются там. Вставьте это в терминал:',
    manualPickedUp: 'Hermes подхватит новую версию при следующем запуске.',
    guiSkewTitle: 'Обновите desktop-приложение',
    guiSkewBody:
      'Бэкенд обновлён, но пакет этого desktop-приложения не изменился. Обновите или переустановите desktop-приложение Hermes (ваш AppImage / .deb / .rpm), чтобы версии совпали.',
    copy: 'Копировать',
    copied: 'Скопировано',
    done: 'Готово',
    applyingBody:
      'Обновлятор Hermes возьмёт процесс на себя в своём окне и автоматически перезапустит Hermes, когда закончит. Пожалуйста, не открывайте Hermes вручную во время обновления.',
    applyingBodyBackend:
      'Удалённый бэкенд применяет обновление и перезапустится. Hermes переподключится автоматически, когда он снова заработает.',
    applyingClose: 'Это окно закроется во время обновления, затем Hermes откроется сам.',
    errorTitle: 'Обновление не завершилось',
    errorBody: 'Не переживайте — ничего не потеряно. Можно попробовать снова прямо сейчас.',
    blockerTitle: 'Закрыть локальные предпросмотры, чтобы обновить Hermes?',
    blockerBody:
      'Hermes нужно остановить эти локальные предпросмотры перед обновлением. Ваши файлы не будут изменены или удалены.',
    foreignBlockerTitle: 'Закрыть другие процессы, чтобы обновить Hermes',
    foreignBlockerBody:
      'Hermes не может безопасно закрыть эти процессы автоматически. Закройте приложение, терминал или службу, которой принадлежит каждый из них, и повторите обновление.',
    mixedBlockerBody:
      'Hermes может закрыть локальные предпросмотры, перечисленные ниже. Остальные процессы нужно закрыть вручную, прежде чем обновление сможет продолжиться.',
    closePreviewsAndUpdate: 'Закрыть предпросмотры и обновить',
    closePreviewsAndCheckAgain: 'Закрыть предпросмотры и проверить снова',
    localPreview: 'Локальный предпросмотр',
    portLabel: port => `Порт ${port}`,
    pidLabel: pid => `PID ${pid}`,
    technicalDetails: 'Технические детали',
    notNow: 'Не сейчас',
    clientAlsoBehindTitle: 'Desktop-приложение отстает',
    clientAlsoBehindMessage:
      'Бэкенд в актуальном состоянии, но это desktop-приложение ещё на старой версии. Обновите его, чтобы получить последние исправления.',
    clientAlsoBehindAction: 'Обновить desktop-приложение',
    everythingDispatched: 'Обновление запущено',
    everythingSkipped: 'Пропущено',
    everythingRowFailed: 'Обновление не удалось',
    everythingFanoutFailedTitle: 'Не удалось обновить другие инстанции',
    applyStatus: {
      preparing: 'Обновляем бэкенд…',
      pulling: 'Бэкенд обновляется…',
      restarting: 'Бэкенд перезапускается для загрузки обновления…',
      notAvailable: 'Обновление недоступно для этого бэкенда.',
      failed: 'Не удалось обновить бэкенд.',
      noReturn: 'Бэкенд не вернулся в сеть. Обновление могло не завершиться — проверьте хост бэкенда.'
    },
    gitUnusable: 'Hermes не удалось запустить Git на этом компьютере, поэтому проверить обновления не получилось.',
    connectionSettings: 'Настройки подключения',
    openDownloadPage: 'Открыть страницу загрузки'
  },
  handoffTour: {
    profileTitle: 'Ваша первая задача выполняется в профиле по умолчанию.',
    profileText:
      'Эта направляющая переключает профили. Тот, который горит сейчас, является значением по умолчанию, в котором находится сеанс задачи. Другой — профиль настройки, в котором находится приветственный чат.',
    sessionsTitle: 'Каждый профиль хранит свои сеансы',
    sessionsText:
      'Этот список принадлежит профилю по умолчанию. Новый сеанс начинается с любого выбранного профиля. Переключайте профили на рейке и список меняется вместе с ним.',
    stayTitle: 'Hermes находится на расстоянии одного клика',
    stayText:
      'Переключитесь на профиль настройки и откройте «Добро пожаловать в Hermes», когда вам понадобится помощь. Оно остается там.'
  },
  guidedGreeting: {
    line: 'Заходите. Я Hermes. Дайте мне пару минут — обустрою тут всё под вас, а потом займёмся тем, что вам правда нужно.\n\nДля начала: как к вам обращаться?',
    nameSuggestion: (name: string) => `(Могу звать вас просто ${name}, если так удобнее.)`
  },
  introReveal: {
    skip: 'Пропустить',
    surfaces: 'Компьютер · Сообщения · Телефон · Где угодно',
    prompt: 'Создай главный куб в Blender и примени к нему несколько материалов',
    replyWords: ['Готово. ', 'Материалы собраны ', 'и показаны на кубе. ', 'Экспортировать круговой рендер?'],
    composerPlaceholder: 'Спрашивайте что угодно. Создавайте что угодно.',
    viewport: 'окно просмотра',
    tagline: 'Ваш агент — везде',
    viewportModes: {
      standard: 'обычный',
      metal: 'металл',
      texture: 'текстура',
      glass: 'стекло',
      wireframe: 'каркас'
    },
    tools: {
      blender: {
        label: 'blender-mcp',
        running: 'подключаемся к Blender…',
        done: 'сцена подключена'
      },
      metal: {
        label: 'металл',
        running: 'собираем металл…',
        done: 'металл · шерох. 0,2'
      },
      glass: {
        label: 'стекло',
        running: 'собираем стекло…',
        done: 'стекло · IOR 1,45'
      }
    },
    sideAgents: {
      research: {
        title: 'агент-исследователь',
        line1: 'Поиск квартиры: выбраны 3 новых варианта',
        line2: '↳ составляем график просмотров…'
      },
      groceries: {
        title: 'продукты',
        line1: 'Недельный заказ собран по вашему списку',
        line2: '↳ доставка назначена на воскресенье'
      },
      inbox: {
        title: 'агент почты',
        line1: 'Готовы 2 черновика ответа, ждём одобрения',
        line2: '↳ календарь на пятницу обновлён'
      },
      morning: {
        title: 'утренняя сводка',
        line1: 'Завтра: 3 встречи, дождь в 8',
        line2: '↳ будет готово до пробуждения'
      }
    }
  },
  guidedOnboarding: {
    done: '✓ Готово',
    continue: 'Продолжить',
    skipSetup: 'Пропустить настройку',
    fallbackOption: 'Давайте придумаем вместе',
    handoffFailed: 'Не удалось запустить первую задачу.',
    handoffFailedRetry: 'Не удалось запустить первую задачу. Повторите попытку, чтобы проверить её сессию.',
    handoffStarted: title => `${title}: задача запущена и доступна в списке сессий`,
    handoffOpening: title => `Открываем ${title}…`,
    retryFirstBuild: 'Повторить первую задачу',
    workingOnIt: 'Работаем над этим',
    firstBuild: 'Первая задача',
    signpostTitle: 'Hermes всё ещё рядом',
    signpostBody:
      'Теперь вы в своём рабочем пространстве, а здесь находятся профили. Наш предыдущий разговор сохранился — возвращайтесь, когда понадобится помощь.',
    profileDescription: 'Место знакомства с Hermes — проводит через первый запуск и ненавязчиво помогает освоиться.',
    accentNames: {
      mono: 'Монохром',
      githubGreen: 'Зелёный GitHub',
      cyberCyan: 'Кибер-циан',
      nousBlue: 'Синий Nous',
      ultraviolet: 'Ультрафиолет',
      barbiePink: 'Розовый Барби',
      electricRed: 'Электрический красный',
      safetyOrange: 'Сигнальный оранжевый'
    },
    layoutNames: {
      basic: 'Базовая',
      elite: 'Расширенная'
    },
    script: {
      forkQuestion: 'Уже знаете, что хотите создать?',
      automate: 'Автоматизировать привычную задачу',
      figure: 'Давайте придумаем вместе',
      mind: 'У меня уже есть идея',
      skip: 'Пока пропустить',
      somethingElse: 'Что-нибудь другое',
      tourQuestion: 'Сначала немного осмотреться?',
      tourBasics: 'Только самое важное',
      tourNone: 'Разберусь самостоятельно',
      tourFull: 'Покажите всё',
      fallbackQuestion: 'Что звучит лучше?',
      buildReviewQuestion: 'Получилось так, как вы хотели?',
      buildReviewLooksRight: 'Всё верно',
      buildReviewChange: 'Кое-что изменить',
      buildReviewFurther: 'Развить дальше',
      machineRunQuestion: 'Запустить этот план?',
      machineRunGoAhead: 'Начать',
      machineRunChangeList: 'Изменить список',
      machineRunEssentials: 'Только необходимое',
      checkpointQuestion: 'Что делать дальше?',
      computerKind: 'компьютер',
      machineSetupOption: kind => `Помогите настроить ${kind}`,
      machineSetupTask: kind => `Настроить ${kind}`
    },
    errors: {
      firstBuildNeedsAttention: 'Первая задача требует внимания',
      welcomeOwnerUnavailable: 'Приветственный чат пока недоступен. Откройте его снова и повторите первую задачу.',
      preferencesSaveFailed:
        'Не удалось сохранить настройки знакомства. Повторите попытку перед запуском первой задачи.',
      sessionOpenFailed: 'Не удалось открыть сессию первой задачи.',
      sessionIdentityMissing:
        'Сессия первой задачи не вернула постоянный идентификатор. Проверьте сессии и повторите попытку.',
      welcomeCreateFailed: 'Не удалось создать приветственный чат. Повторите попытку.',
      restoreProfileFailed: 'Не удалось восстановить профиль',
      welcomeNeedsAttention: 'Приветственный чат требует внимания',
      welcomeStartFailed: 'Не удалось запустить приветственный чат.',
      receiptUnreadable:
        'Не удалось прочитать сохранённые данные первой задачи. Проверьте сессии перед запуском другой задачи.',
      receiptSaveFailed: 'Не удалось сохранить сессию первой задачи для восстановления. Новый запуск не отправлен.',
      verifyFailed: 'Не удалось проверить первую задачу. Повторите попытку после восстановления подключения.',
      unconfirmedRunning:
        'Запуск первой задачи не подтверждён, но её сессия всё ещё работает. Повторите попытку после остановки; дубликат не отправлен.',
      notAcknowledged:
        'Первая задача не подтвердила запуск. Проверьте её сессию и повторите попытку; дубликат не отправлен.',
      notAcknowledgedStart: 'Первая задача не подтвердила начало работы. Проверьте её сессию и повторите попытку.',
      pluginFolderUnavailable: 'Папка плагинов приложения недоступна. Повторите попытку перед запуском первой задачи.'
    }
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
      configure: 'Настройка ключей API и моделей',
      setup: 'Настройка ключей API и параметров',
      gateway: 'Настройка службы шлюза',
      repo: 'Загрузка Hermes Agent',
      complete: 'Завершение установки'
    },
    unknownError: 'Неизвестная ошибка',
    oneTimeTitle: 'Hermes требует одноразовой установки',
    unsupportedDesc: platform =>
      `Автоматическая установка при первом запуске пока недоступна на ${platform}. Откройте Терминал и выполните команду ниже, затем перезапустите это приложение. При следующих запусках этот шаг будет пропущен.`,
    installCommand: 'Команда установки',
    copyCommand: 'Копировать команду',
    viewDocs: 'Открыть документацию по установке',
    installTo: 'Будет установлено в',
    retryAfterRun: 'Я выполнил — попробовать снова',
    setupChoiceTitle: 'Настройка Hermes Desktop',
    setupChoiceDesc:
      'Подключите это приложение к уже работающему шлюзу Hermes или установите Hermes локально на этот компьютер.',
    connectExistingTitle: 'Подключиться к существующему Hermes',
    connectExistingShort: 'Подключить существующий',
    connectExistingDesc:
      'Используйте удалённый бэкенд с сессионным токеном или входом через браузер. Локальная установка не начнётся.',
    installLocalTitle: 'Установить Hermes локально',
    installLocalDesc: 'Скачайте Hermes, создайте его Python-окружение и запустите бэкенд на этом компьютере.',
    localStartUnavailable: 'Не удалось начать локальную установку. Перезапустите Hermes Desktop и попробуйте снова.',
    remoteSetupTitle: 'Подключиться к существующему Hermes',
    remoteSetupDesc: 'Введите URL вашего шлюза. Hermes Desktop определит, нужен токен или вход через браузер.',
    remoteUrlTitle: 'URL шлюза',
    remoteUrlDesc: 'Используйте базовый URL шлюза Hermes, включая https:// для удалённых.',
    remoteUrlPlaceholder: 'https://gateway.example.com/hermes',
    probing: 'Определяем аутентификацию шлюза...',
    probeError: 'Не удалось подключиться к этому шлюзу Hermes.',
    identityProvider: 'ваш провайдер аутентификации',
    authTitle: 'Аутентификация',
    authNeedsOauth: provider => `Сначала войдите через ${provider}, чтобы проверить этот шлюз.`,
    authSignedIn: 'Вход через браузер завершён.',
    connected: 'Подключено',
    signIn: 'Войти',
    signInWith: provider => `Войти через ${provider}`,
    enterUrlFirst: 'Сначала введите URL шлюза.',
    signInIncomplete: 'Окно входа закрылось до завершения аутентификации.',
    tokenTitle: 'Сессионный токен',
    tokenDesc: 'Вставьте сессионный токен из файла .env удалённого шлюза.',
    pasteSessionToken: 'Вставьте сессионный токен',
    incompleteSignInTest: 'Войдите, чтобы проверить этот шлюз с OAuth-защитой.',
    incompleteTokenTest: 'Введите сессионный токен, чтобы проверить этот шлюз.',
    testConnection: 'Проверить соединение',
    testSucceeded: (baseUrl, version) => `Подключено к ${baseUrl}${version ? ` (${version})` : ''}.`,
    applyRemote: 'Применить и переподключиться',
    backToSetup: 'Назад',
    failedTitle: 'Установка не удалась',
    settingUpTitle: 'Настройка Hermes Agent',
    finishingTitle: 'Завершаем',
    failedDesc:
      'Один из шагов установки завершился ошибкой. На Windows это может произойти, если запущена другая инстанция Hermes CLI или desktop. Остановите все работающие инстанции Hermes и повторите. Подробности — ниже или в журнале desktop.',
    activeDesc:
      'Это одноразовая настройка. Установщик Hermes скачивает зависимости и настраивает вашу машину. При следующих запусках этот шаг будет пропущен.',
    progress: (completed, total) => `Выполнено ${completed} из ${total} шагов`,
    currentStage: stage => ` — сейчас: ${stage}`,
    fetchingManifest: 'Загружаем манифест установщика...',
    error: 'Ошибка',
    hideOutput: 'Скрыть вывод установщика',
    showOutput: 'Показать вывод установщика',
    lines: count => `${count} ${RU_PLURAL(count, 'строка', 'строки', 'строк')}`,
    noOutput: 'Вывода пока нет.',
    cancelling: 'Отмена...',
    cancelInstall: 'Отменить установку',
    transcriptSaved: 'Полный транскрипт сохранён в',
    copiedOutput: 'Скопировано!',
    copyOutput: 'Копировать вывод',
    reloadRetry: 'Перезагрузить и повторить',
    probeErrorDetails: 'Детали',
    openLogs: 'Открыть журналы'
  },
  onboarding: {
    headerTitle: 'Настроим для вас Hermes Agent',
    headerDesc: 'Подключите провайдера модели, чтобы начать общение. Большинство вариантов — в один клик.',
    providerTitles: {
      anthropic: 'Ключ API Anthropic',
      'claude-code': 'Anthropic OAuth: для подписки требуются дополнительные кредиты использования',
      'openai-codex': 'Подписка ChatGPT или Codex'
    },
    preparingInstall: 'Hermes завершает установку. Обычно это занимает меньше минуты при первом запуске.',
    starting: 'Запускаем Hermes…',
    lookingUpProviders: 'Ищем провайдеров...',
    collapse: 'Свернуть',
    otherProviders: 'Другие провайдеры',
    haveApiKey: 'У меня есть API-ключ',
    chooseLater: 'Выберу провайдера позже',
    recommended: 'Рекомендуется',
    connected: 'Подключено',
    featuredPitch: 'Одна подписка, 300+ передовых моделей — рекомендуемый способ запускать Hermes',
    fireworksPitch: 'Прямой API моделей — передовые модели на хостинге Fireworks',
    localModelsTitle: 'Запускайте модели локально',
    localModelsPitch: 'Учетная запись не требуется — загрузите модель и запустите ее на этом компьютере.',
    openRouterPitch: 'Один ключ, сотни моделей — надёжный вариант по умолчанию',
    apiKeyOptions: {
      fireworks: {
        short: 'прямой API моделей',
        description: 'Прямой доступ к моделям на хостинге Fireworks AI.'
      },
      openrouter: {
        short: 'один ключ, много моделей',
        description: 'Сотни моделей за одним ключом. Хороший вариант по умолчанию для новых установок.'
      },
      openai: {
        short: 'модели класса GPT',
        description: 'Прямой доступ к моделям OpenAI.'
      },
      gemini: {
        short: 'модели Gemini',
        description: 'Прямой доступ к моделям Google Gemini.'
      },
      xai: {
        short: 'модели Grok',
        description: 'Прямой доступ к моделям xAI Grok.'
      },
      local: {
        short: 'self-hosted',
        description:
          'Укажите Hermes локальный или self-hosted OpenAI-совместимый endpoint (vLLM, llama.cpp, Ollama и т.д.).'
      }
    },
    backToSignIn: 'Назад ко входу',
    getKey: 'Получить ключ',
    replaceCurrent: 'Заменить текущее значение',
    pasteApiKey: 'Вставьте API-ключ',
    directApiAccess: provider => `Прямой доступ к API ${provider}.`,
    localApiKeyPlaceholder: 'API-ключ (необязательно — только если ваш endpoint его требует)',
    couldNotSave: 'Не удалось сохранить учётные данные.',
    connecting: 'Подключение',
    update: 'Обновить',
    flowSubtitles: {
      pkce: 'Откроет браузер для входа, затем продолжит здесь',
      device_code: 'Откроет страницу подтверждения в браузере — Hermes подключится автоматически',
      external: 'Войдите один раз в терминале, затем вернитесь в чат'
    },
    startingSignIn: provider => `Начинаем вход для ${provider}...`,
    verifyingCode: provider => `Проверяем ваш код через ${provider}...`,
    connectedProvider: provider => `${provider} подключён`,
    connectedPicking: provider => `${provider} подключён. Выбираем модель по умолчанию...`,
    signInFailed: 'Вход не удался. Попробуйте снова.',
    signInExpired:
      'Время ожидания страницы входа истекло до того, как вы закончили. Попробуйте еще раз и завершите шаг браузера в течение нескольких минут или вместо этого используйте ключ API.',
    pickDifferentProvider: 'Выбрать другого провайдера',
    signInWith: provider => `Войти через ${provider}`,
    openedBrowser: provider => `Мы открыли ${provider} в вашем браузере.`,
    authorizeThere: 'Авторизуйте Hermes там.',
    copyAuthCode: 'Скопируйте код авторизации и вставьте его ниже.',
    pasteAuthCode: 'Вставьте код авторизации',
    reopenAuthPage: 'Открыть страницу авторизации снова',
    autoBrowser: provider =>
      `Мы открыли ${provider} в вашем браузере. Авторизуйте Hermes там, и подключение произойдёт автоматически — ничего копировать и вставлять не нужно.`,
    reopenSignInPage: 'Открыть страницу входа снова',
    waitingAuthorize: 'Ждём вашей авторизации...',
    externalPending: provider =>
      `${provider} входит через собственный CLI. Выполните эту команду в терминале, затем вернитесь и выберите «Я вошёл»:`,
    signedIn: 'Я вошёл',
    deviceCodeOpened: provider => `Мы открыли ${provider} в вашем браузере. Введите там этот код:`,
    reopenVerification: 'Открыть страницу подтверждения снова',
    copy: 'Копировать',
    defaultModel: 'Модель по умолчанию',
    freeTier: 'Бесплатный тариф',
    pro: 'Pro',
    free: 'Free',
    price: (input, output) => `${input} вход / ${output} выход за Mtok`,
    change: 'Изменить',
    startChatting: 'Начать',
    docs: provider => `Документация ${provider}`,
    signInDidNotFinish: provider =>
      `Войти с помощью${provider}не завершено. Проверьте ваше интернет-соединение и попробуйте снова, или выберите другого провайдера.`,
    tryAgain: 'Попробуйте снова',
    useApiKeyInstead: 'Используйте ключ API.',
    errorDetails: 'Детали'
  },
  freeTier: {
    providerRowTitle: 'Nous · уровень бесплатного пользования',
    providerRowPitch: 'Войдите в систему с учетной записью Nous, чтобы разблокировать больше моделей и инструментов.',
    readyTitle: 'Hermes готов.',
    readyCaption: 'Бесплатно · разъемы в комплекте',
    begin: 'Начать',
    signInInstead: 'Вместо этого войдите в систему с учетной записью Nous.',
    otherProviders: 'Другие поставщики',
    stripTitle: 'Теперь доступны бесплатные выводы и соединители Nous.',
    stripBody:
      'Откройте средство выбора моделей, чтобы опробовать их, или войдите в систему, используя учетную запись Nous.',
    openModelPicker: 'Открыть выбор модели',
    dismiss: 'Отклонить',
    providerName: 'Nous',
    statusLabel: model => `Nous ·${model}`,
    signIn: 'Войти',
    signInHeading: 'Войдите в систему с учетной записью Nous, чтобы разблокировать больше моделей и инструментов.',
    settingUp: 'Настройка свободного вывода…',
    codeBody: 'Введите этот код в браузере, чтобы завершить вход.',
    copyLink: 'Скопировать ссылку',
    doNotShare: 'Не делитесь этим кодом.',
    waiting: 'Ожидание входа в систему…',
    finishingHeading: 'Завершение входа в систему…',
    finishingBody: 'Одобрено в браузере. Сбор токенов вашего аккаунта.',
    signedInAs: email => `Вход выполнен как${email}`,
    signedIn: 'Выполнен вход.',
    completedBody: 'Теперь в вашей учетной записи есть выводы и инструменты.',
    defaultModel: 'Модель по умолчанию',
    change: 'Изменить',
    done: 'Готово',
    notNow: 'Не сейчас',
    tryAgain: 'Попробуйте снова',
    startAgain: 'Начать заново',
    didNotComplete: 'Вход не завершен',
    rejectedBody:
      'Нет проблем, вы по-прежнему пользуетесь бесплатным сервисом Nous. Войдите в систему, когда будете готовы.',
    supersededBody: 'На смену этому коду входа пришел новый код. Используйте самую новую версию или начните заново.',
    timedOutHeading: 'Срок действия этой ссылки для входа истек.',
    timedOutBody: 'Начните снова, когда будете готовы. Вы по-прежнему пользуетесь бесплатным сервисом Nous.',
    retiredBody:
      'Ваш сеанс завершился до завершения входа в систему. Hermes начнет новый; затем войдите в систему снова, когда будете готовы.',
    errorBody: 'Вход не завершен. Попробуйте еще раз, когда будете готовы.',
    alreadySignedInHeading: 'Уже авторизован.',
    alreadySignedInBody: 'Этот Hermes уже вошел в учетную запись Nous.',
    busyHeading: 'Почти там',
    busyBody: wait =>
      `Hermes couldn't finish signing you in because the Nous service is busy. Try again in ${wait}. А пока ваша сессия все еще здесь.`,
    unreachableBody:
      'Hermes не удалось связаться со службой Nous и завершить вход в систему. Проверьте подключение к Интернету и повторите попытку. Ваша сессия все еще здесь.',
    setupFailed: {
      gateClosed:
        'Эту версию Hermes нельзя запустить без учетной записи Nous. Войдите или создайте его, это бесплатно и займет всего минуту.',
      paused:
        'Использование Hermes без входа в систему на мгновение приостанавливается. Hermes продолжит проверку. Вход в систему бесплатен и позволяет начать работу прямо сейчас.',
      rateLimited: wait =>
        `Lots of people are getting started right now, so Hermes will try again in ${wait}. Вход в систему бесплатен и не требует ожидания.`,
      unreachable:
        'Hermes не удалось связаться со службой Nous. Проверьте подключение к Интернету, затем нажмите «Попробовать еще раз». Или подключите пока другого провайдера.',
      serverError:
        'В службе Nous произошел сбой. Нажмите «Повторить попытку через минуту» или пока подключите другого провайдера.',
      powRequired:
        'Сервер Nous запросил подтверждение работы, но оно еще не реализовано в вашем агенте. Войдите или создайте бесплатную учетную запись Nous, чтобы продолжить.',
      locked:
        'Этот сеанс невозможно продолжить без входа в систему. Войдите в систему или создайте бесплатную учетную запись Nous, чтобы продолжить работу.',
      generic:
        'Hermes не смог настроить бесплатный доступ без входа в систему. Вход бесплатный, или подключите другого провайдера.',
      signInBelow: 'Вход в систему бесплатный. Выберите Nous ниже.',
      tryAgain: 'Попробуйте снова',
      retrying: 'Пробую еще раз…'
    }
  },
  modelPicker: {
    title: 'Сменить модель',
    current: 'текущая:',
    unknown: '(неизвестно)',
    search: 'Фильтр провайдеров и моделей...',
    noModels: 'Модели не найдены.',
    addProvider: 'Добавить провайдера',
    loadFailed: 'Не удалось загрузить модели',
    loadingIntoMemory: 'Загрузка в память',
    downloading: 'Загрузка',
    localDownloadsHeading: 'Местный',
    noAuthenticatedProviders: 'Нет провайдеров с аутентификацией.',
    pro: 'Pro',
    proNeedsSubscription: 'Модели Pro требуют платной подписки Nous.',
    free: 'Free',
    freeTier: 'Бесплатный тариф',
    priceTitle: 'Цена вход / выход за миллион токенов',
    wasPrice: 'было'
  },
  modelVisibility: {
    title: 'Модели',
    search: 'Поиск моделей',
    noAuthenticatedProviders: 'Нет провайдеров с аутентификацией.',
    addProvider: 'Добавить провайдера…'
  },
  shell: {
    windowControls: 'Управление окном',
    paneControls: 'Управление панелями',
    appControls: 'Управление приложением',
    modelMenu: {
      search: 'Поиск моделей',
      noModels: 'Модели не найдены',
      editModels: 'Изменить модели…',
      refreshModels: 'Обновить модели',
      fast: 'Быстрая',
      moaPresets: 'Предустановки MOA'
    },
    modelOptions: {
      noOptions: 'Для этой модели нет опций',
      options: 'Опции',
      thinking: 'Размышление',
      fast: 'Быстрая',
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
      sendsOnRoute: (level: string) => `на этом маршруте отправляется ${level}`
    },
    gatewayMenu: {
      gateway: 'Шлюз',
      connected: 'Подключён',
      connecting: 'Подключение',
      offline: 'Недоступен',
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
    },
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
        empty: 'Данных контекста пока нет',
        loading: 'Загрузка разбивки…',
        percentFull: percent => `${percent}% занято`,
        title: 'Использование контекста',
        tokenSummary: (used, max) => `${used} / ${max} токенов`
      },
      session: 'Сеанс',
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
    aria: 'Правая боковая панель',
    panelsAria: 'Панели правой боковой панели',
    files: 'Файловая система',
    terminal: 'Терминал',
    noFolderSelected: 'Папка не выбрана',
    changeCwdTitle: 'Изменить рабочий каталог',
    remotePickerTitle: 'Выбрать удалённую папку',
    remotePickerDescription: 'Просмотрите папки на подключённом бэкенде.',
    remotePickerSelect: 'Выбрать папку',
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
    addToChat: 'Добавить в чат',
    showIgnored: 'Показать файлы из gitignore',
    hideIgnored: 'Скрыть файлы из gitignore'
  },
  preview: {
    tab: 'Предпросмотр',
    closePane: 'Закрыть панель предпросмотра',
    loading: 'Загрузка предпросмотра',
    unavailable: 'Предпросмотр недоступен',
    opening: 'Открываем...',
    hide: 'Скрыть',
    openPreview: 'Открыть предпросмотр',
    openInBrowser: 'Открыть в браузере',
    openInExternal: 'Открыть во внешнем',
    popIn: 'Загляните',
    popOut: 'Выскочить',
    linkHint: '⌘/Ctrl-клик — панель предпросмотра',
    sourceLineTitle: 'Клик — выбрать · Shift-клик — расширить · перетащите в композер',
    source: 'ИСТОЧНИК',
    renderedPreview: 'ПРЕДПРОСМОТР',
    diff: 'DIFF',
    unknownSize: 'размер неизвестен',
    binaryTitle: 'Похоже на бинарный файл',
    binaryBody: label => `Предпросмотр ${label} может показать нечитаемый текст.`,
    largeTitle: 'Этот файл большой',
    largeBody: (label, size) => `${label} — ${size}. Hermes покажет только первые 512 КБ.`,
    previewAnyway: 'Предпросмотр всё равно',
    truncated: 'Показаны первые 512 КБ.',
    noInlineTitle: 'Нет inline-предпросмотра',
    noInlineBody: mimeType => `${mimeType || 'Этот тип файла'} всё равно можно прикрепить как контекст.`,
    edit: 'Изменить',
    editing: 'Изменение',
    unsavedChanges: 'Несохранённые изменения',
    saveFailed: message => `Не удалось сохранить: ${message}`,
    diskChangedTitle: 'Файл изменился на диске',
    diskChangedBody:
      'Этот файл изменился с момента открытия. Перезаписать его вашей версией или сбросить правки и перезагрузить?',
    overwrite: 'Перезаписать',
    discardReload: 'Сбросить и перезагрузить',
    console: {
      deselect: 'Снять выделение записи',
      select: 'Выбрать запись',
      copyFailed: 'Не удалось скопировать вывод консоли',
      copyEntry: 'Скопировать эту запись',
      sendEntry: 'Отправить эту запись в чат',
      messages: count => `${count} ${RU_PLURAL(count, 'сообщение консоли', 'сообщения консоли', 'сообщений консоли')}`,
      resize: 'Изменить размер консоли предпросмотра',
      title: 'Консоль предпросмотра',
      selected: count => `${count} ${count === 1 ? 'выделено' : 'выделено'}`,
      sendToChat: 'Отправить в чат',
      copySelected: 'Скопировать выбранное в буфер',
      copyAll: 'Скопировать всё в буфер',
      copy: 'Копировать',
      clear: 'Очистить',
      empty: 'Сообщений консоли пока нет.',
      promptHeader: 'Консоль предпросмотра:',
      sentTitle: 'Отправлено в чат',
      sentMessage: count =>
        `${count} ${RU_NOUN(count, 'запись лога', 'записи лога', 'записей лога')} добавлено в композер`
    },
    web: {
      appFailedToBoot: 'Приложение предпросмотра не запустилось',
      serverNotFound: 'Сервер не найден',
      remoteLoopback:
        'Этот адрес указывает на машину, на которой работает ваш агент, а не на эту. Панель браузера загружает страницы локально, поэтому для удалённого dev-сервера нужен порт-форвардинг или доступный hostname.',
      failedToLoad: 'Не удалось загрузить предпросмотр',
      tryAgain: 'Попробовать снова',
      restarting: 'Hermes перезапускается...',
      askRestart: 'Попросить Hermes перезапустить сервер',
      lookingRestart: taskId => `Hermes ищет сервер предпросмотра для перезапуска (${taskId})`,
      restartingTitle: 'Перезапуск сервера предпросмотра',
      restartingMessage: 'Hermes работает в фоне. Следите за прогрессом в консоли предпросмотра.',
      startRestartFailed: message => `Не удалось запустить перезапуск сервера: ${message}`,
      restartFailed: 'Перезапуск сервера не удался',
      hideConsole: 'Скрыть консоль предпросмотра',
      showConsole: 'Показать консоль предпросмотра',
      hideDevTools: 'Скрыть DevTools предпросмотра',
      openDevTools: 'Открыть DevTools предпросмотра',
      goBack: 'Назад',
      goForward: 'Вперёд',
      reload: 'Перезагрузить страницу',
      address: 'Адрес',
      addressPlaceholder: 'Введите адрес',
      blankPageBody: 'Введите адрес выше, чтобы просматривать, или попросите Hermes открыть страницу.',
      finishedRestarting: message => `Hermes завершил перезапуск сервера предпросмотра${message ? `: ${message}` : ''}`,
      failedRestarting: message => `Перезапуск сервера не удался: ${message}`,
      unknownError: 'неизвестная ошибка',
      restartedTitle: 'Сервер предпросмотра перезапущен',
      reloadingNow: 'Перезагружаем предпросмотр.',
      restartFailedTitle: 'Перезапуск предпросмотра не удался',
      restartFailedMessage: 'Hermes не смог перезапустить сервер.',
      stillWorking:
        'Hermes всё ещё работает, но результата перезапуска пока нет. Команда сервера может выполняться в foreground.',
      workspaceReloading: 'Рабочее пространство изменилось, перезагружаем предпросмотр',
      fileChanged: url => `Файл изменился, перезагружаем предпросмотр: ${url}`,
      filesChanged: (count, url) =>
        `${count} ${RU_NOUN(count, 'изменение файла', 'изменения файла', 'изменений файла')}, перезагружаем предпросмотр: ${url}`,
      watchFailed: message => `Не удалось отслеживать файл предпросмотра: ${message}`,
      moduleMimeDescription:
        'Модульные скрипты раздаются с неверным MIME-типом. Обычно это значит, что статический файл-сервер раздаёт Vite/React-приложение вместо dev-сервера проекта.',
      loadFailedConsole: (code, message) => `Не удалось загрузить${code ? ` (${code})` : ''}: ${message}`,
      unreachableDescription: 'Страница предпросмотра недоступна.',
      openTarget: url => `Открыть ${url}`,
      fallbackTitle: 'Предпросмотр',
      annotate: 'Аннотировать',
      annotateOn: 'Прекратить аннотировать',
      annotateNeedPage: 'Сначала откройте страницу в браузере приложения.',
      annotateFailed: 'Не удалось запустить режим аннотаций.',
      commenting: 'Комментирование',
      addComments: count => (count === 1 ? 'Добавить 1 комментарий' : `Add ${count} comments`),
      commentPlaceholder: 'Добавить комментарий...',
      commentTitle: n => `Комментарий${n}`,
      saveComment: 'Сохранить',
      cancelComment: 'Отменить комментарий'
    }
  },
  zones: {
    toggleLayoutEditMode: 'Переключить режим редактирования макета',
    showTabStrip: 'Показать вкладки',
    hideTabStrip: 'Скрыть вкладки',
    showStripTab: title => `Показать ${title}`,
    hideStripTab: title => `Скрыть ${title}`,
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
    paneNames: {
      sessions: 'Сеансы',
      files: 'Файлы',
      review: 'Проверка',
      terminal: 'Терминал',
      workspace: 'Рабочая область'
    }
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
      gatewayFetchFailed: name => `Не удалось получить${name}от шлюза (отсутствует, нечитаем или слишком велик).`,
      openMediaFile: kind => `Открыть${kind}файл`,
      openNamed: name => `Открыть${name}`,
      loadingNamed: name => `Загрузка${name}…`,
      couldNotLoad: name => `Не удалось загрузить${name}.`,
      openImage: 'Открыть изображение',
      imageFallbackName: 'изображение'
    },
    embeds: {
      load: label => `Загрузить${label}`,
      alwaysAllow: label => `Всегда разрешать${label}`,
      holdToZoom: 'Держите Ctrl/ to для увеличения',
      failedToLoad: label => `Не удалось загрузить${label}встроить`,
      openDiagram: 'Открытая диаграмма',
      embedTitle: label => `${label}встроить`
    },
    thread: {
      loadingSession: 'Загрузка сеанса',
      openSessionFailed: 'Не удалось открыть заседание',
      showEarlier: 'Показать ранние сообщения',
      loadingResponse: 'Hermes загружает ответ',
      steered: 'управляемый',
      asyncDelegationFailure: detail => `(ошибка: ${detail})`,
      asyncDelegationPartialOutput: 'Частичный вывод:',
      messagingAgent: name => `Обмен сообщениями${name}…`,
      messagedAgent: name => `Отправлено сообщение${name}`,
      messageFrom: name => `Сообщение от${name}`,
      showMessage: 'показать сообщение',
      repliedTo: name => `Ответил на${name}`,
      showReply: 'показать ответ',
      processOutput: 'вывод',
      emojiSearch: 'Поиск…',
      emojiLoading: 'Загрузка эмодзи..',
      emojiEmpty: 'Эмодзи не нашли.',
      moreEmoji: 'Больше смайликов',
      removeReaction: emoji => `Удалить${emoji}реакция`,
      reactedByHermes: 'Разработчик: Hermes',
      conversationTimeline: 'График времени разговора',
      reviewSummary: {
        label: 'Обзор самосовершенствования',
        memoryUpdated: 'Память обновлена',
        memoryCreated: 'Ввод памяти создан',
        userProfileUpdated: 'Профиль пользователя обновлен',
        skillCreated: 'Навыки, созданные',
        skillNamedCreated: (name, detail) => `Умение"${name}«созданный»${detail ? `: ${detail}` : ''}`,
        skillNamedPatched: (name, detail) => `Умение"${name}"заплатить"${detail ? `: ${detail}` : ''}`,
        skillNamedRewritten: (name, detail) => `Умение"${name}"переписанный${detail ? `: ${detail}` : ''}`,
        memoryLabel: 'Память',
        userProfileLabel: 'Профиль пользователя'
      },
      operationInterrupted: 'Операция прервана.',
      operationInterruptedDuringRetry: (reason, attempt, maxAttempts) =>
        `Операция, прерванная во время повторного использования (${reason}, attempt ${attempt}/${maxAttempts}).`,
      operationInterruptedHandlingApiError: (errorType, detail) =>
        `Операция прервана: обработка ошибки API${errorType}: ${detail}).`,
      operationInterruptedRetryingApiCall: (retry, maxRetries) =>
        `Операция прервана: повторный вызов API после ошибки (повторная попытка${retry}/${maxRetries}).`,
      operationInterruptedRetryingEmptyResponse: (retry, maxRetries) =>
        `Операция прервана: повторная попытка запроса пустого ответа от модели (повтор${retry}/${maxRetries}).`,
      operationInterruptedRetryReasons: {
        fastResponseLikelyRateLimited: durationSeconds =>
          `быстрая реакция${durationSeconds}s) - вероятная ставка ограничена`,
        rateLimited: 'тарифы, ограниченные провайдером upstream (429)',
        responseTime: durationSeconds => `время отклика${durationSeconds}s`,
        slowResponseLikelyUpstreamTimeout: durationSeconds =>
          `медленный ответ${durationSeconds}s) - вероятный отрезок времени`,
        upstreamError: (code, durationSeconds) => `ошибка на стороне сервера (код${code}, ${durationSeconds}s)`,
        upstreamGatewayTimedOut: durationSeconds => `тайм-аут вышеуровневого шлюза (504,${durationSeconds}s)`,
        upstreamProviderOverloaded: code => `перегруженный провайдер вверх по течению ()${code})`,
        upstreamProviderTimedOut: durationSeconds =>
          `Время ожидания исходного провайдера истекло (Cloudflare 524,${durationSeconds}s)`,
        upstreamServerError: (code, durationSeconds) => `ошибка вышестоящего сервера${code}, ${durationSeconds}s)`
      },
      operationInterruptedWaitingForModel: elapsedSeconds =>
        `Операция прервана: ожидание ответа модели (${elapsedSeconds}истекла).`,
      modelContinuing: (attempt, maxAttempts) =>
        `Модель вернула рассуждения без итогового ответа — запрашиваем продолжение (${attempt}/${maxAttempts})`,
      providerReconnecting: (elapsedSeconds, kind) =>
        `No ${kind} from the provider after ${elapsedSeconds}s - воссоединение..`,
      providerRetrying: (retrySeconds, attempt, maxAttempts) =>
        `Ожидание провайдера — повтор через ${retrySeconds} с (попытка ${attempt}/${maxAttempts})`,
      providerWaiting: (provider, elapsedSeconds, kind, reconnectSeconds) =>
        `Waiting for ${provider} ${kind} — ${elapsedSeconds}(поставщик может быть медленным или перегруженным)${
          kind === 'output' ? 'или модель все еще может думать' : ''
        }${reconnectSeconds ? `; automatically reconnecting at ${reconnectSeconds}s` : ''})`,
      providerWaitingAfterActivity: (provider, elapsedSeconds, kind, reconnectSeconds) =>
        `Ожидание ${provider} — ${elapsedSeconds} с без ${kind === 'events' ? 'событий потока' : 'ответа после переподключения'} (провайдер может отвечать медленно или быть перегружен${
          reconnectSeconds ? `; автоматическое переподключение через ${reconnectSeconds} с от начала ожидания` : ''
        })`,
      summarizingThread: 'Резюмирующая нить',
      moaAggregating: 'МоА агрегирует..',
      moaReference: (label, index, count) =>
        `Ссылка${index && count ? ` ${index}/${count}` : ''}${label ? ` — ${label}` : ''}`,
      moaReferencesProgress: (done, total, label) => `MoA refs ${done}/${total}${label ? ` — ${label}` : ''}`,
      loadingLocalModel: model => `Загрузка${model}в память`,
      processingPrompt: 'Запрос на обработку',
      resumeWhenBackgroundDone: count =>
        count === 1
          ? 'Продолжится, когда фоновая задача завершится'
          : `Продолжится, когда ${count} ${RU_NOUN(count, 'фоновая задача', 'фоновые задачи', 'фоновых задач')} завершатся`,
      thinking: 'Думает',
      thought: 'Помыслил',
      thoughtBriefly: 'Кратко подумал',
      thoughtFor: duration => `Думал ${duration}`,
      turnDuration: duration => `Этот ход занял ${duration}`,
      today: time => `Сегодня, ${time}`,
      yesterday: time => `Вчера, ${time}`,
      copy: 'Копировать',
      refresh: 'Обновить',
      moreActions: 'Ещё действия',
      branchNewChat: 'Ветка в новый чат',
      react: 'Реакция',
      dismissError: 'Скрыть ошибку',
      errorLayers: {
        auth: 'Проблема со входом',
        billing: 'Закончились кредиты',
        disk: 'Диск заполнен',
        endpoint: 'Невозможно связаться с сервером вашей модели',
        gateway: 'Hermes столкнулся с проблемой',
        generic: 'Hermes не смог закончить ответ.',
        provider: 'Служба AI вернула ошибку',
        runtime: 'Hermes столкнулся с проблемой',
        streaming: 'Ответ был прерван'
      },
      errorRetry: 'Повторить попытку',
      errorStartNewSession: 'Начать новый сеанс',
      errorSwitchProvider: 'Сменить провайдера',
      errorSignInAgain: provider => `Войти в${provider}снова`,
      errorOauthExpired: provider => `Твой${provider}Вход истек или был отозван. Войдите снова, чтобы продолжить чат.`,
      errorOpenLogs: 'Открыть журналы',
      errorOpenLogsFailed: 'Не удалось открыть папку журналов',
      errorOpenDesktopLogs: 'Открыть журналы рабочего стола',
      errorCopyDiagnostics: 'Скопировать сведения об ошибке',
      errorSendDiagnostics: 'Отправить диагностику',
      filesChanged: count => `${count} ${RU_PLURAL(count, 'файл изменён', 'файла изменено', 'файлов изменено')}`,
      reviewChanges: 'Проверить',
      readAloudFailed: 'Не удалось зачитать вслух',
      preparingAudio: 'Подготовка аудио...',
      stopReading: 'Остановить чтение',
      readAloud: 'Зачитать вслух',
      editMessage: 'Изменить сообщение',
      expandMessage: 'Развернуть сообщение',
      scrollToBottom: 'Прокрутить вниз',
      stop: 'Стоп',
      restorePrevious: 'Восстановить предыдущий чекпоинт',
      restoreCheckpoint: 'Восстановить чекпоинт',
      restoreFromHere: 'Восстановить чекпоинт — запустить снова с этого промпта',
      restoreFailed: 'Восстановление провалилось',
      restoreTitle: 'Восстановить до этого чекпоинта?',
      restoreBody: 'Всё, что было после этого промпта, будет удалено из разговора, и промпт запустится снова отсюда.',
      restoreConfirm: 'Восстановить и запустить',
      restoreNext: 'Восстановить следующий чекпоинт',
      goForward: 'Двигаться вперёд',
      sendEdited: 'Отправить изменённое сообщение',
      attachingFile: 'Прикрепление…',
      errorLayerBodies: {
        auth: 'Служба AI отклонила ваш вход. Проверьте учетные данные этого провайдера, а затем отправьте сообщение еще раз.',
        billing:
          'В вашем аккаунте не осталось средств для этого провайдера. Пополните счет или смените провайдера, а затем отправьте еще раз.',
        disk: 'Ваш диск заполнен, поэтому Hermes не смог сохранить этот разговор. Освободите место и повторите попытку.',
        endpoint:
          'Hermes не может связаться с сервером вашей пользовательской модели. Убедитесь, что оно работает, затем отправьте сообщение еще раз.',
        gateway:
          'Hermes столкнулся с внутренней проблемой при запуске этого ответа. Отправьте сообщение еще раз; если это будет продолжаться, отправьте диагностику.',
        generic:
          'Что-то пошло не так, пока Hermes отвечал. Повторите попытку или скопируйте данные, если это продолжится.',
        provider:
          'Службе AI не удалось выполнить этот запрос. Повторите попытку через минуту или смените поставщика услуг.',
        runtime:
          'Hermes столкнулся с внутренней проблемой при запуске этого ответа. Отправьте сообщение еще раз; если это будет продолжаться, отправьте диагностику.',
        streaming: 'Соединение прервалось до завершения ответа. Повторите попытку отправки еще раз.'
      },
      errorCodes: {
        auth: {
          title: provider => `${provider}отклонил ваш вход`,
          body: provider =>
            `Сохранённые учётные данные для${provider}не были приняты. Исправьте их в Настройках или смените поставщика, затем отправьте сообщение снова.`
        },
        auth_permanent: {
          title: provider => `${provider}отклонил ваш вход`,
          body: provider =>
            `Сохранённые учётные данные для${provider}недействительны или были отозваны. Обновите их или смените поставщика, затем отправьте сообщение снова.`
        },
        billing: {
          title: 'Закончились кредиты',
          body: provider =>
            `Твой${provider}на счету нет средств. Пополните счет или смените провайдера, затем отправьте снова.`
        },
        rate_limit: {
          title: 'Служба AI занята',
          body: provider => `${provider}сейчас ограничивает запросы. Подождите минуту, а затем попробуйте снова.`
        },
        upstream_rate_limit: {
          title: 'Служба AI занята',
          body: provider => `${provider}сейчас ограничивает запросы. Подождите минуту, а затем попробуйте снова.`
        },
        overloaded: {
          title: 'Служба AI перегружена',
          body: provider =>
            `${provider}сейчас возникают проблемы. Попробуйте еще раз через минуту или смените провайдера.`
        },
        server_error: {
          title: 'У службы AI возникла проблема',
          body: provider =>
            `${provider}возвратил ошибку сервера. Повторите попытку через некоторое время или смените провайдера.`
        },
        timeout: {
          title: 'Время ответа истекло',
          body: provider => `${provider}не ответил вовремя. Попробуйте отправить это снова.`
        },
        stream_drop: {
          title: 'Ответ был прерван',
          body: 'Соединение прервалось до завершения ответа. Повторите попытку отправки еще раз.'
        },
        upstream_blocked: {
          title: 'Брандмауэр заблокировал запрос',
          body: provider =>
            `Межсетевой экран или CDN перед${provider}заблокировал запрос до того, как он достиг модели — ваш ключ, вероятно, в порядке. Установите заголовок User-Agent через extra_headers провайдера в Настройках или смените провайдера, затем отправьте сообщение снова.`
        },
        ssl_cert_verification: {
          title: 'Безопасное соединение не удалось',
          body: provider =>
            `Hermes could not verify the secure connection to ${provider}. Проверьте настройки сети или прокси-сервера или смените поставщика услуг, а затем отправьте сообщение еще раз.`
        },
        context_overflow: {
          title: 'Этот разговор слишком длинный',
          body: 'Разговор больше не соответствует этой модели. Сожмите его или начните новый чат, а затем отправьте снова.'
        },
        payload_too_large: {
          title: 'Это сообщение слишком велико',
          body: 'Запрос был слишком велик для модели. Сожмите разговор или начните новый чат, а затем отправьте его еще раз.'
        },
        model_not_found: {
          title: 'Эта модель недоступна',
          body: provider =>
            `${provider}этот модель не доступна на вашем аккаунте. Выберите другую модель, затем отправьте свое сообщение снова.`
        },
        provider_policy_blocked: {
          title: 'Эта модель заблокирована настройками вашего аккаунта',
          body: provider =>
            `${provider}не будет маршрутизировать этот запрос в соответствии с настройками данных или конфиденциальности вашей учетной записи. Выберите другую модель или смените провайдера.`
        },
        content_policy_blocked: {
          title: 'Служба AI отклонила этот запрос',
          body: provider => `${provider}не буду отвечать на это сообщение. Отредактируй его и отправь снова.`
        },
        format_error: {
          title: 'Служба AI отклонила запрос',
          body: provider =>
            `${provider}не приняли, как был сформирован этот запрос. Смените поставщика или пришлите диагностические данные, чтобы мы могли это изучить.`
        },
        truncated: {
          title: 'Ответ был прерван',
          body: 'Модель остановилась, не закончив работу. Повторите попытку, чтобы получить полный ответ.'
        },
        invalid_response: {
          title: 'Служба AI отправила нечитаемый ответ',
          body: provider => `${provider}вернул что-то Hermes, не удалось прочитать. Повторите попытку через минуту.`
        },
        empty_response: {
          title: 'Служба AI отправила пустой ответ',
          body: provider => `${provider}не вернул ничего для этого сообщения. Попробуйте еще раз через минуту.`
        },
        loop_error: {
          title: 'Hermes застрял в цикле',
          body: 'Ответ продолжал повторять одни и те же шаги, поэтому Hermes остановил его. Повторите попытку или начните новый чат, если это произойдет снова.'
        },
        SESSION_NOT_OWNED: {
          title: 'Этот чат открыт где-то еще',
          body: 'Этот чат в настоящее время открыт в другом окне или терминале Hermes. Закройте его и отправьте сообщение еще раз или начните новый чат здесь.'
        },
        disk_full: {
          title: 'Диск заполнен',
          body: 'Ваш диск заполнен, поэтому Hermes не смог сохранить этот разговор. Освободите место и повторите попытку.'
        },
        free_tier_disabled: {
          title: 'Использование Hermes без входа в систему сейчас отключено.',
          body: 'Войдите в систему с учетной записью Nous, чтобы продолжать общение, это бесплатно.'
        },
        free_tier_rate_limited: {
          title: 'Вы израсходовали лимит на общение без входа в систему.',
          body: 'Вскоре он обновится. Войдите в систему с учетной записью Nous, чтобы получить больший лимит, это бесплатно.'
        },
        free_tier_at_capacity: {
          title: 'Общение без входа в систему сейчас очень занято',
          body: 'Войдите в систему, чтобы не стоять в очереди, это бесплатно, или повторите попытку через некоторое время.'
        },
        free_tier_model_not_free: {
          title: 'Эта модель недоступна без входа в систему.',
          body: 'Hermes пока использует бесплатную модель. Войдите в систему с учетной записью Nous, чтобы увидеть больше моделей, это бесплатно.'
        },
        free_tier_route: {
          title: 'Hermes не удалось добраться до бесплатной модели на этом маршруте.',
          body: 'Войдите в систему с помощью учетной записи Nous (это бесплатно) или проверьте настройку NOUS_INFERENCE_BASE_URL.'
        },
        free_tier_outage: {
          title: 'Бесплатная модель сейчас не может ответить.',
          body: 'Попробуйте отправить сообщение еще раз через минуту.'
        },
        free_tier_refused: {
          title: 'Hermes не смог отправить это без входа в систему.',
          body: 'Вход в систему с учетной записью Nous бесплатен.'
        }
      },
      errorAuthKinds: {
        api_key: {
          title: provider => `${provider}отклонён ваш API ключ`,
          body: provider =>
            `Ключ сохранен для${provider}недействителен или был отозван. Обновите его, затем попробуйте снова.`
        },
        oauth: {
          title: provider => `Твой${provider}срок действия входа истек`
        }
      },
      errorDetails: 'Детали',
      errorGenericProvider: 'Служба искусственного интеллекта',
      errorToastTitle: 'Hermes не смог закончить ответ',
      errorLimitResets: time => `Сброс лимита в${time}`,
      errorRetryAtReset: time => `Повторите попытку, когда лимит будет сброшен (${time})`,
      errorRetryScheduled: (time, wait) => `Повторная попытка через${time}— в${wait}`,
      errorRetryScheduledCancel: 'Отменить',
      errorChooseModel: 'Выберите модель',
      errorCompressConversation: 'Сжать разговор',
      errorCompressFailed: 'Не удалось сжать разговор',
      errorOpenHermesFolder: 'Откройте папку Hermes.',
      errorOpenHermesFolderFailed: 'Не удалось открыть папку Hermes.',
      errorUpdateApiKey: 'Обновить ключ API',
      errorSignInFreeTier: 'Войдите с помощью учетной записи Nous.'
    },
    approval: {
      gatewayDisconnected: 'Шлюз Hermes не подключён',
      sendFailed: 'Не удалось отправить ответ на подтверждение',
      run: 'Выполнить',
      command: 'Команда',
      moreOptions: 'Больше опций подтверждения',
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
        'Время одобрения истекло — команда не была запущена. Попросите Hermes повторить попытку или увеличьте лимит в «Настройки» → «Безопасность» → «Тайм-аут подтверждения».',
      openSafetySettings: 'Открыть настройки безопасности'
    },
    clarify: {
      notReady: 'Запрос уточнения ещё не готов',
      gatewayDisconnected: 'Шлюз Hermes не подключён',
      sendFailed: 'Не удалось отправить ответ на уточнение',
      loadingQuestion: 'Загрузка вопроса…',
      other: 'Другое (введите ответ)',
      placeholder: 'Введите ваш ответ…',
      skip: 'Пропустить',
      skipped: 'Пропущено',
      continueLabel: 'Продолжить',
      confirmAndContinueLabel: 'Подтвердить и продолжить',
      answeredBadge: 'Ответ дан',
      recommendedSuffix: '(Рекомендуется)',
      questionProgress: (answered, total) => `Ответ дан на ${answered} из ${total}`,
      lateAnswer: (question, choice) => `Re: «${question}» — мой ответ: ${choice}`,
      lateAnswerTip: 'Составить этот ответ как продолжение',
      lateAnswerHint: 'Этот промпт больше не ждёт. Выберите вариант, чтобы составить его как сообщение-продолжение.'
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
      failed: server => `Настройка не удалась для ${server}`,
      toolCount: count => `${count} ${RU_NOUN(count, 'инструмент', 'инструмента', 'инструментов')}`,
      envRequired: 'Сначала заполните обязательные учётные данные',
      sendFailed: 'Не удалось отправить ответ на настройку MCP',
      reloadFailed: 'Сервер сохранён, но перезагрузка MCP-инструментов не удалась — они загрузятся в следующем сеансе',
      gatewayDisconnected: 'Шлюз Hermes не подключён'
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
      toolPayload: 'Полезная нагрузка инструмента',
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
      memoryWriteNoted: 'Запись в память отмечена',
      failedToWriteFile: detail => `Не удалось записать файл:${detail}`,
      sensitiveSystemPathWriteRefused: path =>
        `Refusing to write to sensitive system path: ${path}
  Use the terminal tool with sudo if you need to modify system files.`,
      returnedError: 'Инструмент вернул ошибку.',
      returnedSuccessFalse: 'Инструмент возвращает успех = ложный.',
      returnedStatus: status => `Инструмент вернул статус"${status}".`,
      commandFailedWithExitCode: exitCode => `Команда завершилась с кодом выхода${exitCode}.`,
      sessionKernelTimedOut: (timeoutSeconds, remote) =>
        `Cell timed out after ${timeoutSeconds}s; the ${remote ? 'remote ' : ''}ядро сеанса было убито, а его состояние потеряно. Следующий вызов execution code запускает новое ядро.`,
      clarifyErrors: {
        questionsMustBeArray: 'Параметр вопросов должен быть массивом объектов вопросов.',
        questionsLimit: limit => `Параметр questions поддерживает максимум${limit}предметы.`,
        questionMustBeObject: index => `вопросы${index}] должен быть объектом, содержащим поле вопроса.`,
        questionMustNotBeEmpty: index => `вопросы${index}вопрос должен быть непустым текстом.`,
        choicesMustBeArray: field => `${field}должен быть массивом.`,
        choicesMustBeStringArray: 'Параметр выбора должен быть массивом строк.',
        noQuestion:
          'Вопроса не было. Добавьте хотя бы один объект к вопросам с полем вопросов; варианты и multi select являются необязательными.',
        unavailable: 'Инструмент разъяснения в этом контексте недоступен.',
        inputFailed: detail => `Не удалось получить ввод пользователя:${detail}`
      },
      countLabel: (count, _noun, displayNoun) => `${count} ${displayNoun}`,
      runSummary: {
        delegate: {
          count: (count, live) =>
            `${live ? 'Делегировать' : 'Делегированный'} ${count} ${count === 1 ? 'задача' : 'задачи'}`,
          present: 'Делегировать',
          target: (target, live) => `${live ? 'Делегировать' : 'Делегированный'} ${target}`
        },
        edit: {
          count: (count, live) =>
            `${live ? 'Редактирование' : 'Отредактированный'} ${count} ${count === 1 ? 'файл' : 'файлы'}`,
          present: 'Редактирование',
          target: (target, live) => `${live ? 'Редактирование' : 'Отредактированный'} ${target}`
        },
        explore: {
          count: (count, live) =>
            `${live ? 'Исследовать' : 'Исследованный'} ${count} ${count === 1 ? 'файл' : 'файлы'}`,
          present: 'Исследовать',
          target: (target, live) => `${live ? 'Исследовать' : 'Исследованный'} ${target}`
        },
        other: {
          count: (count, live) =>
            `${live ? 'Использовать' : 'Использованный'} ${count} ${count === 1 ? 'инструмент' : 'инструменты'}`,
          present: 'Использовать',
          target: (target, live) => `${live ? 'Использовать' : 'Использованный'} ${target}`
        },
        run: {
          count: (count, live) => `${live ? 'Бегать' : 'Рана'} ${count} ${count === 1 ? 'командовать' : 'командовать'}`,
          present: 'Бегать',
          target: (target, live) => `${live ? 'Бегать' : 'Рана'} ${target}`
        },
        separator: ', '
      },
      actions: {
        read: 'Чтение',
        reading: 'Читает',
        opened: 'Открыто',
        opening: 'Открывает',
        failedToOpen: 'Не удалось открыть',
        searched: 'Поиск выполнен',
        searching: 'Ищет',
        ran: 'Выполнено',
        running: 'Выполняется',
        ranCode: 'Код выполнен',
        runningCode: 'Скриптинг'
      },
      prefixes: {
        browser: 'Браузер',
        web: 'Web'
      },
      titleTemplates: {
        actionCommand: (action, command) => `${action} ${command}`,
        actionQuoted: (action, value) => `${action} «${value}»`,
        actionTarget: (action, target) => `${action} ${target}`,
        completedTool: action => `Бежал${action}`,
        prefixedDone: (prefix, action) => `${prefix} ${action}`,
        runningPrefixedTool: (prefix, action) => `Выполняется: ${prefix.toLowerCase()} ${action.toLowerCase()}`,
        runningTool: action => `Выполняется: ${action.toLowerCase()}`
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
          done: 'Снят снимок страницы',
          pending: 'Снимаю страницу',
          pendingAction: 'Снимаю'
        },
        browser_take_screenshot: {
          done: 'Снят скриншот',
          pending: 'Снимаю скриншот',
          pendingAction: 'Снимаю'
        },
        browser_type: {
          done: 'Введено на странице',
          pending: 'Ввожу на странице',
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
          pending: 'Скриптинг',
          pendingAction: 'Скриптинг'
        },
        image_generate: {
          done: 'Изображение сгенерировано',
          pending: 'Генерирую изображение',
          pendingAction: 'Генерирую'
        },
        list_files: {
          done: 'Файлы перечислены',
          pending: 'Перечисляю файлы',
          pendingAction: 'Перечисляю'
        },
        memory: {
          done: 'Сохранено в память',
          pending: 'Сохраняю в память',
          pendingAction: 'Сохраняю'
        },
        patch: {
          done: 'Файл патчен',
          pending: 'Патчу файл',
          pendingAction: 'Патчу'
        },
        read_file: {
          done: 'Файл прочитан',
          pending: 'Читаю файл',
          pendingAction: 'Читаю'
        },
        search_files: {
          done: 'Файлы найдены',
          pending: 'Ищу файлы',
          pendingAction: 'Ищу'
        },
        session_search_recall: {
          done: 'История сеансов найдена',
          pending: 'Ищу в истории сеансов',
          pendingAction: 'Ищу'
        },
        skill_view: {
          done: 'Загруженный навык',
          pending: 'Загрузка мастерства',
          pendingAction: 'Загрузка'
        },
        terminal: {
          done: 'Команда выполнена',
          pending: 'Выполняю команду',
          pendingAction: 'Выполняю'
        },
        todo: {
          done: 'Todo обновлены',
          pending: 'Обновляю todo',
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
          done: 'Поиск в вебе выполнен',
          pending: 'Ищу в вебе',
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
        loading: 'Загружается скилл',
        loaded: 'Загружен скилл',
        loadFailed: 'Не удалось загрузить скилл',
        readingResource: 'Читается ресурс скилла',
        readResource: 'Прочитан ресурс скилла',
        resourceFailed: 'Не удалось прочитать ресурс скилла',
        listing: 'Загружается список скиллов',
        listed: 'Получен список скиллов',
        listFailed: 'Не удалось получить список скиллов',
        unavailable: 'Результат работы со скиллом недоступен'
      },
      resultUnavailable: 'Результат недоступен',
      resultInterrupted: 'Прервано'
    }
  },
  prompts: {
    gatewayDisconnected: 'Шлюз Hermes не подключён',
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
    vaultUnlockTitle: name => `Разблокировать${name}`,
    vaultUnlockDesc: name =>
      `Агент хочет войти на сайт с использованием сохраненного логина${name}. Введите ваш мастер-пароль, чтобы разблокировать его на эту сессию — он напрямую идёт к${name}на этом устройстве и никогда не хранится и не показывается агенту.`,
    vaultUnlockPlaceholder: 'Мастер-пароль',
    vaultUnlockKeepLocked: 'Держите запертым',
    vaultUnlockConfirm: 'Разблокировать',
    vaultSaveSendFailed: 'Не удалось сохранить логин',
    vaultSaveTitle: site => `Сохрани свои${site}вход?`,
    vaultSaveDesc: origin =>
      `Hermes достиг страницы входа${origin}и у него нет для этого логина. Введите его здесь один раз; он зашифрован на этом компьютере и подставляется на страницу без того, чтобы модель когда-либо видела пароль.`,
    vaultSaveIdentifierLabel: 'Электронная почта или имя пользователя',
    vaultSaveIdentifierPlaceholder: 'you@example.com',
    vaultSavePasswordPlaceholder: 'Пароль',
    vaultSaveFootnote: 'Управляйте сохраненными логинами в «Настройки» → «Пароли и логины».',
    vaultSaveDecline: 'Не сохранять',
    vaultSaveConfirm: 'Сохранить и войти',
    vaultCodeSendFailed: 'Не удалось отправить код',
    vaultCodeTitle: site => `Код подтверждения для${site}`,
    vaultCodeDesc: site =>
      `${site}запрашивает одноразовый код (SMS, электронное письмо или приложение-аутентификатор). Введите его здесь, и Hermes вводит его на страницу; модель его никогда не видит.`,
    vaultCodeLabel: 'Код',
    vaultCodeFootnote:
      'Совет: сохраните ключ аутентификатора с этим логином в «Настройки» → «Пароли и логины», и Hermes введет коды за вас.',
    vaultCodeSkip: 'Пропустить',
    vaultCodeConfirm: 'Введите код',
    reconnect: 'Переподключиться',
    sudoCommandUnavailable: 'Агент не предоставил команду. Отмените запрос, если не можете проверить её в разговоре.'
  },
  desktop: {
    audioReadFailed: 'Не удалось прочитать записанное аудио',
    compressingContext: 'Сжатие контекста..',
    compressingContextFor: topic => `Сжатие контекста для:${topic}`,
    sessionUnavailable: 'Сеанс недоступен',
    createSessionFailed: 'Не удалось создать новый сеанс',
    promptFailed: 'Промпт не удался',
    providerCredentialRequired: 'Добавьте учётные данные провайдера перед отправкой первого сообщения.',
    readinessChecksDisagree:
      'setup.status сообщает, что учётные данные настроены, но определить рабочую конфигурацию по-прежнему не удалось.',
    emptySlashCommand: 'пустая слэш-команда',
    desktopCommands: 'Команды desktop',
    skillCommandsAvailable: count =>
      `${count} ${RU_NOUN(count, 'команда навыка', 'команды навыка', 'команд навыка')} доступно.`,
    warningLine: message => `предупреждение: ${message}`,
    yoloArmed: 'YOLO включён для этого чата',
    yoloOff: 'YOLO выключен',
    yoloSystem: active => `YOLO ${active ? 'включён' : 'выключен'} для этого сеанса`,
    yoloTitle: 'YOLO',
    yoloToggleFailed: 'Не удалось переключить YOLO',
    profileStatus: current =>
      `Профиль: ${current}. Используйте /profile <name> или выборку «Новый сеанс», чтобы начать чат в другом профиле.`,
    unknownProfile: 'Неизвестный профиль',
    noProfileNamed: (target, available) => `Нет профиля «${target}». Доступны: ${available}`,
    newChatsProfile: name => `Новые чаты будут использовать профиль ${name}.`,
    setProfileFailed: 'Не удалось установить профиль',
    sttDisabled: 'Распознавание речи отключено в настройках.',
    stopFailed: 'Остановка не удалась',
    regenerateFailed: 'Повторная генерация не удалась',
    editFailed: 'Изменение не удалось',
    editTurnUnavailable: 'Этого хода больше нет в истории сервера (возможно, он был сжат).',
    resumeFailed: 'Возобновление не удалось',
    readOnlyTranscriptTitle: 'Открыт только для чтения',
    readOnlyTranscriptBody:
      'Ни один из подключенных серверов пока не претендует на этот старый чат, поэтому он открывается как стенограмма, доступная только для чтения. Его история нетронута; отправка отключена до тех пор, пока серверная часть не заявит об этом.',
    readOnlyTranscriptSendBlocked: 'Этот чат открыт как стенограмма только для чтения — отправка отключена.',
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
      'Занятая сессия — сообщение, стоящее в очереди, чтобы отправить, когда текущий поворот заканчивается',
    sessionBusyInterruptCommand: 'Занятая сессия — /прервать текущий поворот перед отправкой этой команды',
    steerQueued: text => `Рулевой · "${text}"в очереди на следующий вызов инструмента`,
    steerQueuedNextToolCall: 'Следующий Tool Call',
    steerRejected: 'Рулевое управление отклонено - агент отклонил вход',
    sessionTitleSet: (title, queued) =>
      `Session title set: ${title}${queued ? ' (queued while session initializes)' : ''}`,
    sessionTitleCleared: 'Заголовок сессии расчищен.',
    branchStopCurrent: 'Остановите текущий ход перед ветвлением этого чата.',
    branchNoText: 'В этом сообщении нет текста, от которого можно ответвить.',
    branchTitle: n => `Черновик: Ветка #${n}`,
    branchFailed: 'Ветвление не удалось',
    deleteFailed: 'Удаление не удалось',
    archived: 'В архиве',
    archiveFailed: 'Архивирование не удалось',
    cwdChangeFailed: 'Изменение рабочего каталога не удалось',
    cwdStagedTitle: 'Рабочий каталог поставлен в очередь',
    cwdStagedMessage: 'Перезапустите бэкенд desktop, чтобы применить изменения cwd к этому активному сеансу.',
    modelSwitchFailed: 'Смена модели не удалась',
    hydrationSyncing: (profile: string) => `Syncing ${profile}…`,
    sessionExported: 'Сеанс экспортирован',
    sessionExportFailed: 'Не удалось экспортировать сеанс',
    imageSaved: 'Изображение сохранено',
    downloadStarted: 'Загрузка началась',
    restartToUseSaveImage: 'Перезапустите Hermes Desktop, чтобы использовать «Сохранить изображение».',
    restartToSaveImages: 'Перезапустите Hermes Desktop, чтобы сохранять изображения',
    imageDownloadFailed: 'Загрузка изображения не удалась',
    openImage: 'Открыть изображение',
    generatedImageAlt: 'Сгенерированное изображение',
    downloadImage: 'Скачать изображение',
    savingImage: 'Сохранение изображения',
    imagePreviewFailed: 'Предпросмотр изображения не удался',
    imageAttach: 'Прикрепление изображения',
    imageWriteFailed: 'Не удалось записать изображение на диск.',
    imageAttachFailed: 'Прикрепление изображения не удалось',
    pastedContent: 'Вставленный текст',
    pasteAttachFailed: 'Не удалось прикрепить вставленный текст',
    attachImages: 'Прикрепить изображения',
    clipboard: 'Буфер обмена',
    noClipboardImage: 'Изображение в буфере обмена не найдено',
    clipboardPasteFailed: 'Вставка из буфера обмена не удалась',
    dropFiles: 'Перетащите файлы',
    handoff: {
      pickPlatform: 'Выберите назначение',
      success: platform => `Передаём в ${platform}. Возобновите здесь в любой момент.`,
      systemNote: platform => `↻ Передано в ${platform} — возобновите здесь в любой момент.`,
      failed: error => `Передача не удалась: ${error}`,
      timedOut: 'Превышено время ожидания шлюза. Выполняется ли `hermes gateway`?',
      startMessaging: 'Начать обмен сообщениями'
    },
    noPageAt: path => `Страница не зарегистрирована по адресу${path}`,
    logUnavailable: detail => `Журнал недоступен:${detail}`,
    modelSwitchConfirmBody: 'Эта смена модели требует подтверждения.',
    modelSwitchConfirmLabel: 'Всё равно переключить',
    modelSwitchConfirmTitle: (model: string) => `Переключиться на ${model}?`,
    modelSwitchConfirmTitleFallback: 'Сменить модель?',
    modelSwitchKeepLabel: 'Оставить текущую модель',
    modelSwitchStaleNotice: 'Выбор изменился — смена модели не применена.'
  },
  tips: {
    close: 'Больше не показывать этот совет',
    items: {
      'new-session': {
        title: 'Начать заново',
        text: 'Новый чат получает собственный контекст, терминал и рабочий каталог.'
      },
      skills: {
        title: 'Научите это один раз',
        text: 'Навыки — это папки с инструкциями, которые Hermes загружают, когда их требует работа.'
      },
      messaging: {
        title: 'Hermes вдали от рабочего стола',
        text: 'Подключите Telegram, Discord, Slack и другие — тот же агент, та же память.'
      },
      artifacts: {
        title: 'Все, что сделал Hermes',
        text: 'Изображения, файлы и ссылки из каждого сеанса проиндексированы в одном месте.'
      },
      cron: {
        title: 'Работа, которая выполняется сама собой',
        text: 'Запланируйте подсказку каждый час, ночь или выражение cron.'
      },
      'command-palette': {
        title: 'Одна коробка для всего',
        text: 'Сеансы, настройки, навыки и команды — все соответствует палитре.'
      },
      profiles: {
        title: 'Профили отдельные',
        text: 'У каждого свой Hermes — свои ключи, своя память, свои сессии.'
      },
      'composer-mentions': {
        title: 'Прикрепляйте и командуйте',
        text: 'Введите @, чтобы включить в разговор файл, / для запуска команды.'
      },
      'local-setup': {
        title: 'Эта машина может запускать модели локально',
        text: 'Ваше оборудование может обслуживать локальную модель. Чаты остаются на вашем компьютере и ничего не требуют.',
        action: 'Настройте это'
      },
      'right-pane': {
        title: 'Рабочая панель',
        text: 'Файлы, терминал, обзор и браузер в приложении имеют правую сторону.'
      },
      'local-runtime-update': {
        title: 'Доступно локальное обновление движка',
        text: 'Обновите движок, на котором работают ваши локальные модели. Активные локальные запросы могут быть прерваны.',
        action: 'Обновить сейчас'
      }
    }
  },
  errors: {
    genericFailure: 'Что-то пошло не так',
    boundaryTitle: 'Что-то сломалось в интерфейсе',
    boundaryDesc: 'Вид столкнулся с неожиданной ошибкой. Ваши чаты и настройки в безопасности.',
    reloadWindow: 'Перезагрузить окно',
    openLogs: 'Открыть журналы',
    boundaryDetails: 'Детали',
    sendDiagnostics: 'Отправить диагностику'
  },
  ui: {
    search: {
      clear: 'Очистить поиск'
    },
    pagination: {
      label: 'пагинация',
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
    declined: 'Изменение модели отменено — вы отклонили предупреждение уровня обучения данных.'
  }
})
