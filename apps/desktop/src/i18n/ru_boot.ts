import type { TranslationOverrides } from './define-locale'

// The boot screen's copy, composed by ru.ts.
export const ruBoot = {
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
      waitingForUpdate: 'Ожидание завершения текущего обновления…',
      waitingSetupChoice: 'Ожидание вашего выбора при первом запуске'
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
  }
} satisfies Pick<TranslationOverrides, 'boot'>
