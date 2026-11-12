import type { TranslationOverrides } from './define-locale'

export const ruRuntime = {
  timelineEvents: {
    modelChanged: 'модель изменена',
    resumedInterruptedTurn: 'прерванный ход возобновлён',
    personalityChanged: 'личность изменена',
    backgroundAgentWorkFinished: 'работа фонового агента завершена',
    backgroundAgentsFinished: (count: number) => `завершено фоновых агентов: ${count}`,
    backgroundProcessFinished: 'фоновый процесс завершён'
  },
  runtimeErrors: {
    previewTargetUnavailable: (target: string) => `Не удалось открыть цель предпросмотра: ${target}`,
    desktopBridgeUnavailable: 'Мост приложения недоступен',
    artifactWriteFailed: 'Не удалось записать файл артефакта',
    previewBrowserBridgeUnavailable: 'Мост приложения для браузера предпросмотра недоступен',
    remotePreviewLoadFailed: 'Не удалось загрузить удалённый HTML-предпросмотр',
    previewBufferBridgeUnavailable: 'Мост приложения для буфера предпросмотра недоступен',
    remotePreviewStageFailed: 'Не удалось подготовить удалённый HTML-предпросмотр',
    hermesDesktopBridgeUnavailable: 'Мост Hermes Desktop недоступен',
    savingUnavailable: 'Сохранение недоступно',
    renameUnavailable: 'Переименование недоступно',
    deleteUnavailable: 'Удаление недоступно',
    gatewayFilePathMissing: 'Отсутствует путь к файлу на шлюзе',
    fileDownloadBridgeUnavailable: 'Мост приложения для скачивания файлов недоступен',
    attachmentReadFailed: (label: string) => `Не удалось прочитать ${label}`,
    noActiveSessionToRestore: 'Нет активного сеанса для восстановления.',
    restoreMessageNotFound: 'Не удалось найти сообщение для восстановления.',
    restoreEmptyMessage: 'Нельзя восстановить пустое сообщение.',
    restoreUnavailableForMessage: 'Восстановление недоступно для этого сообщения.',
    newSessionMissingId: 'Новый сеанс не вернул сохранённый идентификатор.',
    quickEntryDestinationChanged: (drift: string) =>
      `Целевой сеанс быстрого ввода изменился во время создания: ${drift}`,
    noActiveSessionForRestart: 'Нет активного сеанса для фонового перезапуска',
    backgroundRestartNoTaskId: 'Фоновый перезапуск не вернул идентификатор задачи',
    gatewayNotConnected: 'Шлюз Hermes не подключён',
    gatewayUnavailable: 'Шлюз Hermes недоступен',
    gatewayNotConnectedShort: 'Шлюз не подключён',
    gatewayDisconnected: 'Шлюз отключён',
    backendReconnecting: (profile: string) =>
      `Бэкенд профиля «${profile}» переподключается. Повторите попытку, когда подключение восстановится.`,
    gatewayUnavailableForProfile: (profile: string) => `Шлюз Hermes недоступен для профиля «${profile}»`,
    registryDialUnsupported: 'Эта сборка приложения не поддерживает подключения из реестра. Обновите Hermes Desktop.',
    sessionControlGatewayUnavailable: 'Шлюз управления сеансом недоступен',
    profileChangedWhileConnecting: 'Активный профиль Hermes изменился во время подключения',
    connectionNotActive: (label: string) => `Соединение «${label}» не стало активным.`,
    connectionTimedOut: (label: string) => `Истекло время ожидания подключения к «${label}».`,
    profileConnectTimedOut: (profile: string) => `Истекло время ожидания подключения к профилю «${profile}»`,
    profileWsUrlTimedOut: (profile: string) =>
      `Истекло время ожидания повторного получения WebSocket URL шлюза для профиля «${profile}»`,
    gatewayWsUrlTimedOut: 'Истекло время ожидания получения WebSocket URL шлюза',
    gatewayWsUrlRemintTimedOut: 'Истекло время ожидания повторного получения WebSocket URL шлюза',
    unexpectedGatewayWsPath: (path: string) => `Неожиданный путь WebSocket шлюза: ${path}`,
    defaultProfileUnsupported: 'Эта версия приложения не умеет сохранять профиль по умолчанию.',
    clipboardUnavailable: 'API буфера обмена недоступен',
    pluginFolderUnavailable:
      'Папка плагинов приложения недоступна. Повторите попытку, прежде чем запускать первую сборку.',
    manifestMinContextInvalid: 'Минимальное контекстное окно должно быть числом или пустым значением',
    manifestToolsNotList: 'Поле tools должно быть списком',
    manifestToolAutoInstall: (index: number) => `Инструмент ${index} не может запрашивать автоматическую установку`,
    manifestPluginsNotList: 'Поле plugins должно быть списком',
    manifestSchemaUnsupported: 'Поддерживается только версия 1 схемы манифеста',
    mcpDocNotObject: 'Ожидался объект JSON',
    mcpDocNeedsName: 'Оберните сервер в {"mcpServers": {"name": …}}, чтобы у него было имя',
    transcriptionTimedOut: (seconds: number, provider: string) =>
      `Расшифровка речи не завершилась за ${seconds} с (нет ответа от ${provider})`,
    sttHttpError: (status: number, detail: string) => `Ошибка ElevenLabs STT (HTTP ${status}): ${detail}`,
    ttsHttpError: (status: number, detail: string) => `Ошибка ElevenLabs TTS (HTTP ${status}): ${detail}`,
    pluginIdentifierRequired: 'Требуется идентификатор плагина.',
    pluginIdentifierInvalid: 'Недопустимый идентификатор плагина.',
    mcpOauthCallbackUnsupported: 'Обновите Hermes Desktop для поддержки обратных вызовов MCP OAuth.',
    mcpOauthTimedOut: 'Истекло время ожидания авторизации MCP OAuth',
    audioContextUnavailable: 'AudioContext недоступен для прослушивания слова активации на клиенте',
    connectionBridgeUnavailable: 'Мост соединений Hermes Desktop недоступен',
    builtinProviderId: (id: string, suggestion: string) =>
      `«${id}» — идентификатор встроенного провайдера. Укажите для этого эндпоинта другой идентификатор (например, «${suggestion}»).`,
    sharedProviderEndpoint: (id: string) =>
      `«${id}» — общий эндпоинт из профиля по умолчанию. Измените его там или сначала отключите совместное использование провайдеров в этом профиле.`,
    sharedEndpointPinned: (id: string, profiles: string) =>
      `«${id}» — провайдер модели для профилей с общими провайдерами: ${profiles}. Перед удалением переключите их на другой провайдер (или отключите там совместное использование провайдеров).`,
    sharedProviderAccount: (id: string) =>
      `Вход в «${id}» выполнен в профиле по умолчанию. Выйдите там или сначала войдите в этом профиле.`,
    backendConnectTimedOut: (seconds: null | number) =>
      seconds === null
        ? 'Не удалось дождаться ответа фоновой службы Hermes.'
        : `Не удалось дождаться ответа фоновой службы Hermes за ${seconds} с.`,
    imageCopyNoDimensions: 'У изображения нет размеров, его нельзя скопировать',
    imageCopyCanvasUnavailable: 'Контекст Canvas 2D недоступен',
    imageCopyEncodeFailed: 'Не удалось закодировать изображение в PNG',
    imageCopyDecodeFailed: 'Не удалось декодировать изображение для копирования в буфер обмена',
    imageCopyFetchFailed: (status: number) => `Не удалось загрузить изображение (${status})`,
    imageCopyNeedsSecureContext: 'Для копирования изображений в буфер обмена нужен защищённый контекст (HTTPS)'
  }
} satisfies Pick<TranslationOverrides, 'timelineEvents' | 'runtimeErrors'>
