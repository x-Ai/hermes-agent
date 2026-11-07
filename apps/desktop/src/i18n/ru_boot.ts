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
      usingRuntime: 'Использование установленной среды выполнения Hermes',
      waitingBackendLaunch: 'Ожидание запуска бэкенда Hermes',
      waitingBackendReady: 'Ожидание готовности бэкенда Hermes',
      waitingForUpdate: 'Ожидание завершения текущего обновления…',
      waitingSetupChoice: 'Ожидание вашего выбора при первом запуске'
    },
    errors: {
      backgroundExited:
        'Служба, в которой работают ваши чаты, неожиданно остановилась. Перезапустите её, чтобы продолжить. Чаты и настройки в сохранности.',
      backgroundExitedDuringStartup: 'Hermes остановился сразу после запуска.',
      backendStopped: 'Hermes перестал работать в фоновом режиме',
      desktopBootFailed: 'Не удалось запустить Hermes',
      gatewayConnectionLost: 'Hermes потерял соединение',
      gatewayConnectionLostDetail:
        'Hermes всё ещё пытается переподключиться. Можно по-прежнему читать чаты и писать черновики. Если это затянется, переподключитесь сейчас или проверьте настройки подключения.',
      gatewaySignInRequired: 'Выполнен выход из удалённого Hermes',
      ipcBridgeUnavailable: 'Hermes Desktop не смог связаться со своим фоновым процессом. Перезапустите приложение.',
      restartHermes: 'Перезапустить Hermes',
      openLogs: 'Открыть журналы',
      reconnectNow: 'Восстановить соединение сейчас',
      connectionSettings: 'Настройки подключения',
      gatewaySignInRequiredDetail: 'Войдите снова, чтобы переподключиться. Чаты и настройки в сохранности.',
      signInAgain: 'Войти снова'
    },
    failure: {
      title: 'Не удалось запустить Hermes',
      description:
        'Фоновая служба Hermes не запустилась. Попробуйте один из способов восстановления ниже. Ни один из них не удаляет ваши чаты и настройки.',
      remoteTitle: 'Требуется вход в удалённый шлюз',
      remoteDescription:
        'Срок действия входа в удалённый шлюз истёк. Войдите снова, чтобы переподключиться. Ни одно из этих действий не удаляет ваши чаты и настройки.',
      webappTitle: 'Вход в Hermes',
      webappDescription: 'Выполните hermes webapp на этом компьютере, чтобы войти в этом браузере.',
      retry: 'Повторить',
      repairInstall: 'Восстановить установку',
      useLocalGateway: 'Использовать локальный шлюз',
      gatewaySettings: 'Настройки шлюза',
      back: 'Назад',
      openLogs: 'Открыть журналы',
      repairHint: 'Восстановление заново запускает установщик; на чистой системе это может занять несколько минут.',
      bundledReinstallHint:
        'Встроенная установка не может восстановить себя изнутри приложения — переустановите приложение, чтобы вернуть его бэкенд.',
      reinstallApp: 'Переустановить приложение',
      remoteSignInHint: signInLabel =>
        `Сначала выполняется выход из сохранённого браузерного сеанса удалённого шлюза, затем открывается окно «${signInLabel}». Чтобы вместо этого перейти на встроенный бэкенд, выберите «Использовать локальный шлюз».`,
      signOutAndSignIn: 'Выйти и войти',
      remoteFailureHint:
        'Проверьте URL шлюза и данные для входа в разделе «Настройки шлюза» или переключитесь на локальный шлюз.',
      cloudDownTitle: 'Облачный агент Nous не работает',
      cloudDownDescription:
        'Облачный агент, управляемый Nous, к которому подключается этот шлюз, возвращает ошибку сервера. Его нельзя перезапустить отсюда — проверьте его статус, переключитесь на локальный шлюз или обратитесь в поддержку.',
      cloudDownHint:
        'Кнопки ниже открывают портал Nous (состояние экземпляра и элементы управления) и наш Discord для поддержки.',
      cloudDownCheckPortal: 'Проверить статус на портале',
      cloudDownDiscord: 'Получить помощь в Discord',
      hideRecentLogs: 'Скрыть последние записи журнала',
      showRecentLogs: 'Показать последние записи журнала',
      signedInTitle: 'Вход выполнен',
      signedInMessage: 'Переподключение к удалённому шлюзу…',
      signInIncompleteTitle: 'Вход не завершён',
      signInIncompleteMessage: 'Окно входа закрылось до завершения аутентификации.',
      signInFailed: 'Не удалось войти',
      signInToRemoteGateway: 'Войти в удалённый шлюз',
      signInWithProvider: provider => `Войти через ${provider}`,
      identityProvider: 'вашего провайдера аутентификации',
      details: 'Подробности'
    },
    causes: {
      exitedEarly: 'Фоновая служба Hermes остановилась сразу после запуска.',
      timedOut: 'Фоновая служба Hermes не ответила вовремя.',
      permission: 'Hermes не смог выполнить запись в свою папку данных (проблема с разрешениями).',
      diskFull: 'Диск заполнен, поэтому Hermes не смог запуститься.',
      portInUse: 'Другая программа использует сетевой порт, необходимый Hermes.',
      installMissing: 'Часть установки Hermes отсутствует. Выберите «Восстановить установку», чтобы вернуть её.'
    },
    updateHold: {
      title: 'Предыдущее обновление всё ещё удерживает Hermes',
      titleUnverified: 'Hermes не может подтвердить, что последнее обновление завершилось',
      description:
        'Hermes откладывает запуск, чтобы не загрузить файлы, которые обновление, возможно, ещё изменяет. Он запустится сам, как только блокировка снимется.',
      heldByProcess: pid =>
        `Обновление (процесс ${pid}) завершилось, но запущенный им процесс всё ещё удерживает установку Hermes.`,
      heldUnknown: 'Обновление завершилось, но запущенный им процесс всё ещё удерживает установку Hermes.',
      unverified:
        'Помощнику обновления сейчас не удалось проверить, кто удерживает установку Hermes. Hermes продолжает проверять.',
      since: time => `Ожидание с ${time}`,
      lastChecked: time => `Последняя проверка: ${time}`,
      recoveryHint:
        'Обычно это проходит за несколько минут. Если нет: закройте Hermes, завершите оставшиеся процессы git или hermes (или перезагрузите компьютер) и снова откройте Hermes.',
      checkAgain: 'Проверить снова',
      quit: 'Закрыть Hermes',
      openLogs: 'Открыть журналы',
      startAnyway: 'Всё равно запустить…',
      confirmTitle: 'Запустить Hermes, пока обновление ещё удерживает его?',
      confirmBody:
        'Оставшийся процесс обновления, возможно, ещё изменяет файлы Hermes. Если запустить сейчас, может загрузиться наполовину обновлённая установка, которая не будет работать, пока вы снова не запустите обновление. Hermes запишет этот выбор в журнал и оставит метку обновления на месте.',
      confirmKeepWaiting: 'Ждать дальше',
      confirmStart: 'Всё равно запустить',
      startAnywayRefused:
        'Пока Hermes запускался, изменилось то, что удерживает установку. Проверьте и попробуйте снова.'
    }
  }
} satisfies Pick<TranslationOverrides, 'boot'>
