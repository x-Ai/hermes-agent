import type { TranslationOverrides } from './define-locale'

export const ruOnboarding: TranslationOverrides['onboarding'] = {
  headerTitle: 'Настроим для вас Hermes Agent',
  headerDesc: 'Подключите провайдера модели, чтобы начать общение. Большинство вариантов — в один клик.',
  preparingInstall: 'Hermes завершает установку. Обычно это занимает меньше минуты при первом запуске.',
  starting: 'Запуск Hermes…',
  setupSlowTitle: 'Настройка занимает больше времени, чем обычно.',
  setupSlowBody: 'Hermes всё ещё запускается в фоновом режиме.',
  continueWithoutSetup: 'Продолжить без настройки',
  lookingUpProviders: 'Поиск провайдеров...',
  collapse: 'Свернуть',
  otherProviders: 'Другие провайдеры',
  haveApiKey: 'У меня есть API-ключ',
  chooseLater: 'Выберу провайдера позже',
  recommended: 'Рекомендуется',
  connected: 'Подключено',
  featuredPitch: 'Одна подписка, 300+ передовых моделей — рекомендуемый способ запускать Hermes',
  fireworksPitch: 'Прямой API моделей — передовые модели на хостинге Fireworks',
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
    openai: { short: 'модели класса GPT', description: 'Прямой доступ к моделям OpenAI.' },
    gemini: { short: 'модели Gemini', description: 'Прямой доступ к моделям Google Gemini.' },
    xai: { short: 'модели Grok', description: 'Прямой доступ к моделям xAI Grok.' },
    local: {
      short: 'на своём сервере',
      description:
        'Подключите Hermes к локальному или собственному OpenAI-совместимому эндпоинту (vLLM, llama.cpp, Ollama и т. д.).'
    }
  },
  backToSignIn: 'Назад ко входу',
  getKey: 'Получить ключ',
  replaceCurrent: 'Заменить текущее значение',
  pasteApiKey: 'Вставьте API-ключ',
  localApiKeyPlaceholder: 'API-ключ (необязательно — только если ваш эндпоинт его требует)',
  couldNotSave: 'Не удалось сохранить учётные данные.',
  connecting: 'Подключение',
  update: 'Обновить',
  flowSubtitles: {
    pkce: 'Откроет браузер для входа, затем продолжит здесь',
    device_code: 'Откроет страницу подтверждения в браузере — Hermes подключится автоматически',
    external: 'Войдите один раз в терминале, затем вернитесь в чат'
  },
  startingSignIn: provider => `Запуск входа: ${provider}...`,
  verifyingCode: provider => `Проверка кода: ${provider}...`,
  connectedProvider: provider => `${provider}: подключено`,
  connectedPicking: provider => `${provider}: подключено. Выбор модели по умолчанию...`,
  signInFailed: 'Не удалось войти. Попробуйте снова.',
  pickDifferentProvider: 'Выбрать другого провайдера',
  signInWith: provider => `Войти через ${provider}`,
  openedBrowser: provider => `В браузере открыта страница входа: ${provider}.`,
  authorizeThere: 'Авторизуйте Hermes там.',
  copyAuthCode: 'Скопируйте код авторизации и вставьте его ниже.',
  pasteAuthCode: 'Вставьте код авторизации',
  reopenAuthPage: 'Открыть страницу авторизации снова',
  waitingAuthorize: 'Ожидание авторизации...',
  externalPending: provider =>
    `${provider}: вход выполняется через собственный CLI. Выполните эту команду в терминале, затем вернитесь и нажмите «Вход выполнен»:`,
  signedIn: 'Вход выполнен',
  deviceCodeOpened: provider => `В браузере открыта страница входа: ${provider}. Введите там этот код:`,
  reopenVerification: 'Открыть страницу подтверждения снова',
  copy: 'Копировать',
  defaultModel: 'Модель по умолчанию',
  freeTier: 'Бесплатный тариф',
  pro: 'Pro',
  free: 'Бесплатно',
  price: (input, output) => `${input} вход / ${output} выход за 1 млн токенов`,
  change: 'Изменить',
  startChatting: 'Начать',
  docs: provider => `Документация: ${provider}`,
  providerTitles: {
    anthropic: 'API-ключ Anthropic',
    'claude-code': 'Anthropic OAuth: для подписки нужны дополнительные кредиты на использование',
    'openai-codex': 'Подписка ChatGPT или Codex'
  },
  directApiAccess: provider => `Прямой доступ к API ${provider}.`,
  errorDetails: 'Подробности',
  localModelsPitch: 'Аккаунт не нужен — скачайте модель и запустите её на этом компьютере',
  localModelsTitle: 'Запускайте модели локально',
  signInDidNotFinish: provider =>
    `Вход через ${provider} не завершён. Проверьте подключение к интернету и попробуйте снова или выберите другого провайдера.`,
  signInExpired:
    'Время на странице входа истекло, прежде чем вы закончили. Попробуйте снова и завершите шаг в браузере за несколько минут или используйте API-ключ.',
  tryAgain: 'Попробовать снова',
  useApiKeyInstead: 'Использовать API-ключ'
}
