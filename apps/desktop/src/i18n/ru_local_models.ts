import type { TranslationOverride } from '@hermes/shared/i18n'

import type { Translations } from './types'

// Settings › Local Models, composed by ru.ts as `settings.localModels` (file-size split).
export const ruLocalModels: TranslationOverride<Translations['settings']['localModels']> = {
  catalogDescriptions: {
    'Best all-round agent model; sees images; long context stays fast':
      'Лучшая универсальная модель для агента; понимает изображения; сохраняет скорость при длинном контексте',
    'Frontier-scale mixture-of-experts with multi-token prediction; sees images':
      'Передовая модель со смесью экспертов и предсказанием нескольких токенов; понимает изображения',
    'Frontier-scale model; needs a very large GPU to run well':
      'Передовая крупная модель; для быстрой работы нужен GPU с очень большим объёмом памяти',
    "NVIDIA's 74B mixture-of-experts in a 2-bit build; sees images":
      'Модель NVIDIA со смесью экспертов на 74 млрд параметров в 2-битной сборке; понимает изображения',
    'Bigger mixture-of-experts with multi-token prediction; sees images':
      'Более крупная модель со смесью экспертов и предсказанием нескольких токенов; понимает изображения',
    'Frontier-class model for machines with 128GB+ memory': 'Передовая модель для компьютеров со 128 GB памяти и более'
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
  connectionChanged: 'Подключение для локальных моделей изменилось',
  title: 'Локальные модели',
  runtimeTitle: 'Локальная среда выполнения',
  runtimeReady: backend => `Готово · ${backend}`,
  serverRunning: 'Работает',
  runtimeInstalled: 'Среда выполнения llama.cpp установлена',
  runtimeInstalledDetail: (tag, backend) =>
    `Сборка ${tag}, бэкенд ${backend}. Hermes сам запускает сервер и управляет им.`,
  installTitle: 'Установка локальной среды выполнения',
  installDetail:
    'Скачивает движок инференса llama.cpp (несколько сотен МБ). Скачанные модели работают полностью на этом компьютере — аккаунт не нужен, и никакие данные не покидают компьютер.',
  installAction: 'Установить среду выполнения',
  installing: 'Установка среды выполнения…',
  installFailed: 'Не удалось установить среду выполнения',
  hardwareTitle: 'Этот компьютер',
  hardwareLoading: 'Проверка оборудования…',
  vram: label => `${label} памяти GPU`,
  ram: label => `${label} RAM`,
  unifiedMemory: 'Единая память',
  modelsTitle: 'Модели',
  recommended: 'Рекомендуется',
  recommendedReason: {
    'best-quality-resident':
      'Самая качественная модель, которая целиком работает на вашем GPU на полной скорости. Выбор учитывает и качество, и ожидаемую скорость на этом оборудовании.',
    'speed-gated-quality':
      'На этом компьютере поместится и более качественная модель, но из-за пропускной способности памяти она будет отвечать слишком медленно. Эта модель — лучшая из тех, что работают быстро.',
    'product-default': 'Модель по умолчанию для этого компьютера, выбранная его производителем.'
  } as Record<string, string>,
  noRecommendationTitle: 'Для этого компьютера нет автоматической рекомендации',
  noRecommendationDetail:
    'Для автоматической настройки нужна модель из подборки, которая целиком работает в памяти GPU или единой памяти на полной скорости. Вы всё равно можете выбрать модель ниже или поискать другие модели.',
  noRecommendationAction: 'Просмотреть модели',
  downloaded: 'Скачано',
  downloadAction: size => `Скачать · ${size}`,
  downloadProgress: (done, total) => `${done} из ${total}`,
  downloadStatusRunning: 'Скачивание',
  downloadSpeed: rate => `${rate}`,
  downloadEta: time => `осталось ~${time}`,
  downloadEtaSeconds: count => `${count} с`,
  downloadEtaMinutes: count => `${count} мин`,
  downloadEtaHours: (hours, minutes) => (minutes ? `${hours} ч ${minutes} мин` : `${hours} ч`),
  downloadPausedLabel: 'Приостановлено',
  downloadPauseAction: 'Приостановить',
  downloadResumeAction: 'Продолжить',
  downloadDoneToast: model => `Модель ${model} готова.`,
  installDoneToast: 'Локальная среда выполнения установлена и готова.',
  quickstartTitle: 'Запустите модель на этом компьютере',
  quickstartDetail: (model, size) =>
    `Одно нажатие настроит всё: локальный движок, ${model} (${size} для скачивания) и модель по умолчанию для новых чатов. Никакие данные не покидают этот компьютер.`,
  quickstartDetailReady: model =>
    `Одно нажатие сделает ${model} моделью по умолчанию для новых чатов. Всё работает на этом компьютере.`,
  quickstartAction: 'Настроить за меня',
  quickstartConfigure: 'Выбрать самому',
  quickstartDoneToast: model => `Модель ${model} настроена — новые чаты работают на этом компьютере.`,
  quickstartFailed: 'Не удалось настроить локальную модель',
  quickstartStageEngine: 'Движок',
  quickstartStageModel: 'Модель',
  quickstartStageFinish: 'Завершение',
  useAction: 'Использовать',
  activePill: 'По умолчанию',
  updateTitle: 'Доступно обновление движка',
  updateDetail: (next, current) =>
    `Новая сборка llama.cpp (${next}) готова к установке — сейчас у вас ${current}. Модели продолжают работать во время скачивания.`,
  updateSameBuildDetail: tag =>
    `Теперь Hermes поставляет llama.cpp ${tag} вместе с файлами, нужными для запуска. При обновлении движок скачается заново; модели продолжают работать во время скачивания.`,
  updateAction: 'Обновить движок',
  updating: 'Обновление движка…',
  upToDateTitle: 'Движок обновлён',
  upToDateDetail: (tag, backend) => `Работает llama.cpp ${tag} (${backend}).`,
  activeDetail: 'Новые чаты используют эту модель — она загружается при отправке первого сообщения.',
  activeNotLoaded: 'Загрузится при первом сообщении',
  loadedPill: 'В памяти',
  placementResident: 'целиком на GPU',
  placementSpilled: 'частично в RAM',
  placementResidentTip: 'С этим контекстным окном модель целиком работает в памяти GPU — на полной скорости.',
  placementSpilledTip:
    'Часть модели размещена в системной RAM — это работает, но медленнее. Более компактная сборка или меньший контекст поместились бы целиком.',
  loadingPill: 'Загрузка…',
  ejectTip: 'Освободить память GPU (модель снова загрузится при следующем сообщении)',
  ejected: 'Модель выгружена — память GPU освобождена.',
  ejectFailed: 'Не удалось выгрузить модель',
  stopServer: 'Выключить',
  startServer: 'Включить',
  runtimeRunningDetail:
    'Локальный сервер работает. Если выключить его, освободится вся память GPU, а новые чаты не смогут использовать локальные модели, пока вы не включите сервер снова.',
  serverStopped: 'Локальный сервер остановлен — память GPU освобождена.',
  serverStarted: 'Локальный сервер работает.',
  serverStopFailed: 'Не удалось остановить локальный сервер',
  serverStartFailed: 'Не удалось запустить локальный сервер',
  activating: 'Запуск…',
  activateFailed: model => `Не удалось переключиться на ${model}`,
  activateDoneToast: model => `Новые чаты используют ${model}.`,
  downloadFailed: model => `Не удалось скачать ${model}`,
  downloadPauseFailed: model => `Не удалось приостановить скачивание модели ${model}`,
  downloadResumeFailed: model => `Не удалось возобновить скачивание модели ${model}`,
  pillFitsGpu: 'Помещается в GPU',
  pillUsesRam: 'Использует системную RAM',
  pillTooBig: 'Слишком большая для этого компьютера',
  browseTitle: 'Найти другие модели',
  browseHint:
    'Поиск по всему Hugging Face. Скачанные здесь модели автоматически подбираются под ваш компьютер, но мы их не тестировали.',
  browsePlaceholder: 'Поиск моделей по названию или автору…',
  browseSearching: 'Поиск по Hugging Face',
  browseListing: 'Чтение файлов модели',
  browseShowFiles: 'Показать файлы',
  browseRefresh: 'Обновить',
  browseDownloads: 'скачиваний',
  browseLikes: 'лайков',
  browseGated: 'нужен вход в Hugging Face',
  browseNoGguf: 'Совместимые файлы моделей не найдены.',
  browseFitUnknown: 'Совместимость неизвестна',
  browseAlreadyDownloaded: 'Уже скачана.',
  addedByYou: 'Добавлена вами',
  browseDownloadStarted: 'Скачивание: {name}',
  browseDownloadAria: 'Скачать {name}',
  sideloadButton: 'Добавить файл модели',
  sideloadTitle: 'Выберите файл модели GGUF',
  sideloadDone: 'Добавлено: {name}.',
  sideloadAlreadyPresent: 'Уже есть в библиотеке.',
  pillFullContext: max => `Полный контекст ${max}`,
  pillFullContextTip: 'С самого начала работает с полным контекстным окном модели',
  pillUpTo: max => `Контекст до ${max}`,
  pillGrowsTip: 'Автоматически расширяется, когда разговору нужно больше места',
  pillVision: 'Понимает изображения',
  deleteAction: 'Удалить модель',
  deleteConfirm: model => `Удалить ${model} с диска?`,
  deleted: model => `Модель ${model} удалена.`,
  deleteFailed: 'Не удалось удалить'
}
