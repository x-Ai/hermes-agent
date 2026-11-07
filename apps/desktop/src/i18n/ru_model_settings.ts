import type { TranslationOverride } from '@hermes/shared/i18n'

import { ruAuxTasks } from './ru_aux_tasks'
import { ruDelegationRouting } from './ru_delegation_routing'
import { RU_PLURAL } from './ru_plural'
import type { ModelSettingsTranslations } from './types_model_settings'

export const ruModelSettings: TranslationOverride<ModelSettingsTranslations> = {
  moaPreset: 'Пресет',
  moaDescription:
    'Настройте именованные пресеты, которые появятся как модели провайдера Mixture of Agents. Модель-агрегатор выполняет каждый шаг цикла инструментов; почти вся стоимость запуска списывается у её провайдера. По умолчанию референсные модели дают совет один раз на сообщение пользователя.',
  moaAggregator: 'Модель-агрегатор',
  moaAggregatorBilled: 'исполняющая модель · на неё приходится стоимость запуска',
  moaReferenceHint: 'по умолчанию советует один раз за ход',
  setupProviderFallback: 'провайдера',
  setUpProvider: name => `Настроить ${name}`,
  staleAuxBefore: (count, names) =>
    `${count} ${RU_PLURAL(count, 'вспомогательная задача', 'вспомогательные задачи', 'вспомогательных задач')} (${names}) по-прежнему ${RU_PLURAL(count, 'использует', 'используют', 'используют')} `,
  staleAuxAfter: ', а не основную модель.',
  staleAuxOtherProviders: 'других провайдеров',
  moaEnabled: 'Включено',
  moaSetDefault: 'Сделать основным',
  moaNewPresetPlaceholder: 'новый пресет',
  moaAddPreset: 'Добавить пресет',
  customModel: 'Своя модель…',
  customModelPlaceholder: 'ID модели',
  chooseFromList: 'Выбрать из списка',
  moaDefault: 'По умолчанию:',
  moaReferenceToggle: (enabled, index) => `${enabled ? 'Отключить' : 'Включить'} референс ${index}`,
  moaReferenceTitle: index => `Референс ${index}`,
  moaAddReference: 'Добавить референсную модель',
  loading: 'Загрузка конфигурации модели...',
  appliesDesc:
    'Применяется к новым сеансам. Чтобы сменить модель в текущем чате на лету, используйте выбор модели в композере.',
  provider: 'Провайдер',
  model: 'Модель',
  applying: 'Применение...',
  mainAppliedTitle: 'Основная модель обновлена',
  mainAppliedMessage: model => `Новые сеансы будут использовать ${model}.`,
  defaultsLabel: 'По умолчанию',
  reasoning: 'Рассуждения',
  reasoningOff: 'Выкл',
  speed: 'Скорость',
  speedStandard: 'Стандартная',
  defaultsFailed: 'Не удалось сохранить параметры модели по умолчанию',
  loadFailed: 'Не удалось загрузить модели',
  restartRequired: 'Этот бэкенд выполняет старый код после обновления. Перезапустите его, чтобы загрузить новый код.',
  restartBackend: 'Перезапустить бэкенд',
  restartingBackend: 'Перезапуск бэкенда...',
  restartFailed: 'Не удалось перезапустить бэкенд',
  auxiliaryTitle: 'Вспомогательные модели',
  resetAllToMain: 'Сбросить всё на основную',
  staleAuxDismiss: 'Больше не показывать',
  auxiliaryDesc:
    'Вспомогательные задачи по умолчанию выполняются основной моделью. Чтобы изменить это, назначьте задаче отдельную модель.',
  setToMain: 'Использовать основную',
  change: 'Изменить',
  autoUseMain: 'авто · используется основная модель',
  providerDefault: '(по умолчанию у провайдера)',
  fallbackAdd: 'Добавить резервную модель',
  fallbackEmpty: 'Резервных моделей нет — используется модель по умолчанию, если она не даёт сбоев.',
  notInCatalog: 'нет в списке моделей этого провайдера — запросы могут уйти на резервную модель.',
  staleAuxPrefix: (count, names) =>
    `${count} ${RU_PLURAL(count, 'вспомогательная задача', 'вспомогательные задачи', 'вспомогательных задач')} (${names}) по-прежнему ${RU_PLURAL(count, 'использует', 'используют', 'используют')} `,
  staleAuxSuffix: ', а не основную модель.',
  pasteKeyPlaceholder: keyEnv => `Вставьте ${keyEnv}`,
  activate: 'Активировать',
  activating: 'Активация...',
  needsApiKeyHint: name => `${name}: нужен API-ключ — настройте его, чтобы выбрать модель.`,
  oauthHint: name => `${name}: вход выполняется через браузер — Hermes проведёт его за вас.`,
  moa: {
    title: 'Mixture of Agents',
    shortTitle: 'MoA',
    presetsTitle: 'Пресеты MoA',
    description:
      'Настройте именованные пресеты, которые появятся как модели провайдера Mixture of Agents. Агрегатор — исполняющая модель.',
    presetPlaceholder: 'Пресет',
    enabled: 'Включено',
    setDefault: 'Сделать основным',
    deletePreset: 'Удалить',
    newPresetPlaceholder: 'новый пресет',
    addPreset: 'Добавить пресет',
    defaultLabel: 'По умолчанию:',
    referenceTitle: index => `Референс ${index}`,
    toggleReference: (index, enabled) => `${enabled ? 'Отключить' : 'Включить'} референс ${index}`,
    removeReference: 'Удалить',
    addReference: 'Добавить референсную модель',
    aggregatorTitle: 'Агрегатор'
  },
  tasks: ruAuxTasks,
  inheritMainEffort: 'наследовать · как у основной модели',
  inheritsFrom: task => `наследует от задачи «${task}»`,
  followTask: task => `Как у задачи «${task}»`,
  moaTitle: 'Mixture of Agents',
  subagents: {
    inherit: 'Наследовать от основного агента',
    modelOnly: 'Своя модель (учётные данные основного агента)',
    providerLabel: 'Провайдер субагентов',
    modelLabel: 'Модель субагентов',
    direct: 'Прямой эндпоинт',
    customProvider: 'Свой провайдер...',
    customProviderLabel: 'Свой провайдер субагентов',
    customEndpoints: 'Пользовательские эндпоинты',
    customEndpointsHidden: 'Включите «Предлагать субагентам пользовательские эндпоинты», чтобы они появились здесь.',
    parentModel: 'Использовать модель основного агента',
    parentModelWarning:
      'Выбранный провайдер должен поддерживать модель основного агента. Маршрут только с провайдером может не сработать, если модель несовместима. Если у этого провайдера задана своя модель по умолчанию, субагенты используют её.',
    directActive:
      'Активен прямой эндпоинт — он имеет приоритет над сохранённым провайдером. Пока выбран этот режим, эндпоинт и учётные данные сохраняются.',
    directClear:
      'Применение этого маршрута удалит прямой эндпоинт и его сохранённый ключ. Остальные настройки запросов сохранятся.',
    catalogFailed: 'Каталог моделей недоступен. Введите провайдера и модель вручную или повторите попытку.',
    draftHint: 'Изменения остаются локальными, пока вы их не примените.',
    routing: ruDelegationRouting
  }
}
