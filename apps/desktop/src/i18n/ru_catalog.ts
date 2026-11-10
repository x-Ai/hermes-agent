import type { TranslationOverrides } from './define-locale'
import { RU_PLURAL } from './ru_plural'

const resultWord = (count: number) => {
  const n = Math.abs(count) % 10
  const nn = Math.abs(count) % 100

  return n === 1 && nn !== 11 ? 'результат' : n >= 2 && n <= 4 && (nn < 12 || nn > 14) ? 'результата' : 'результатов'
}

export const ruCatalog = {
  add: 'Добавить',
  added: 'Добавлено',
  discover: 'Обзор',
  featured: 'Рекомендуемые',
  explorePlugins: 'Обзор плагинов',
  exploreSkills: 'Обзор навыков',
  mostStarred: 'Больше всего звёзд',
  newest: 'Новинки',
  recentlyUpdated: 'Недавно обновлённые',
  mostUsed: 'Часто используемые',
  updateAvailable: 'Обновление',
  updatesAvailable: (count: number) => `Обновления · ${count}`,
  alphabetical: 'Название',
  sortBy: 'Сортировка',
  seeAll: 'Показать все',
  related: 'Похожие',
  tags: 'Теги',
  screenshots: 'Снимки экрана',
  listView: 'Список',
  cardView: 'Карточки',
  installTitle: (name: string) => `Установить «${name}»?`,
  installDescription: 'Навык будет доступен в новых сеансах. Устанавливайте только из источников, которым доверяете.',
  installTo: 'Установить в',
  thisComputer: 'Этот компьютер',
  installing: 'Установка…',
  installComplete: (name: string) => `«${name}» установлен`,
  destinationChanged: 'Место установки изменилось. Закройте диалог и снова откройте ссылку установки.',
  install: 'Установить',
  installed: 'Установлено',
  searchSkills: 'Поиск навыков',
  searchPlugins: 'Поиск плагинов',
  allSources: 'Все источники',
  allCategories: 'Все категории',
  about: 'Описание',
  author: 'Автор',
  source: 'Источник',
  category: 'Категория',
  version: 'Версия',
  platforms: 'Платформы',
  requires: 'Требования',
  tools: 'Инструменты',
  hooks: 'Хуки',
  middleware: 'Промежуточное ПО',
  commands: 'Команды',
  license: 'Лицензия',
  addedDate: 'Добавлено',
  updatedDate: 'Обновлено',
  repository: 'Репозиторий',
  documentation: 'Документация',
  noResults: 'Совпадений нет',
  tryAnother: 'Попробуйте другой запрос или сбросьте фильтры.',
  clearFilters: 'Сбросить фильтры',
  filters: 'Фильтры',
  loadFailed: 'Не удалось загрузить каталог',
  retry: 'Попробовать снова',
  more: 'Показать ещё',
  pinned: 'Проверенный коммит',
  snapshotHint: 'Из каталога Hermes. При просмотре нет обращений к исходным репозиториям.',
  installHint: 'Проверьте исходный код перед установкой. Изменения применяются к новым сеансам.',
  results: (count: number) => `${count.toLocaleString('ru')} ${resultWord(count)}`,
  back: 'Назад к результатам',
  tier: 'Уровень',
  previousSlide: 'Предыдущая рекомендация',
  nextSlide: 'Следующая рекомендация',
  slideOf: (index: number, count: number) => `${index} из ${count}`,
  tierLabels: { official: 'Официальный', verified: 'Проверенный', community: 'Сообщество' },
  tiers: {
    official: { title: 'Официальные плагины', blurb: 'Создаются и поддерживаются Nous Research.' },
    verified: {
      title: 'Проверенные плагины',
      blurb: 'Их выпускает компания, чей сервис они подключают, а проверяет Nous.'
    }
  },
  moreToExplore: 'Что ещё посмотреть',
  moreToExploreBlurb: 'Небольшие разделы каталога — все в одном месте.',
  // The category arrives as its catalog label (Latin), so it stays undeclined in quotes.
  skillsFor: (category: string) => `Навыки из категории «${category}».`,
  // `kind` is the tab label («Плагины», «Навыки»): inanimate, so the accusative is the same word, lower-cased.
  discoverKind: (kind: string) => `Откройте для себя ${kind.toLowerCase()}`,
  developer: {
    heading: 'Режим разработчика',
    title: 'Создавайте для Hermes',
    pitch: 'Создали инструмент, коннектор, плагин или Mod?',
    pitchFollowUp: 'Хотите, но не знаете как?',
    submit: 'Отправить Mod',
    docs: 'Документация для разработчиков'
  },
  toolsets: {
    mostUsed: 'Часто используемые',
    mostUsedBlurb: 'Наборы инструментов, к которым Hermes чаще всего обращается в этом профиле.',
    essentials: 'Основные',
    essentialsBlurb: 'На них держится большая часть работы Hermes.',
    toolCount: (count: number) => `${count} ${RU_PLURAL(count, 'инструмент', 'инструмента', 'инструментов')}`,
    // `count` is the compact display: from 1000 it reads as thousands ("1.2k"), which take the genitive plural.
    callCount: (count: string, calls: number) =>
      `${count} ${calls < 1000 ? RU_PLURAL(calls, 'вызов', 'вызова', 'вызовов') : 'вызовов'}`,
    themes: {
      work: {
        label: 'Браузер, работа и автоматизация',
        blurb: 'Управление браузером и рабочим столом, правка файлов, запуск кода и планирование задач.'
      },
      create: {
        label: 'Видеть, слышать и создавать',
        blurb: 'Просмотр изображений и видео, расшифровка речи и генерация медиа.'
      },
      recall: {
        label: 'Память и знания',
        blurb: 'Что помнит Hermes, а также навыки и история, по которым он может искать.'
      },
      connect: {
        label: 'Подключения и связь',
        blurb: 'Аккаунты, другие агенты, умный дом и поиск за пределами веба.'
      },
      more: { label: 'Другие инструменты', blurb: 'Всё остальное, что можно включить в этом профиле.' }
    }
  }
} satisfies TranslationOverrides['catalog']

export const ruSkillDeepLink = {
  installTitle: (name: string) => `Установить «${name}»?`,
  installDescription: 'Навык будет доступен в новых сеансах. Устанавливайте только из источников, которым доверяете.',
  installTo: 'Установить в',
  thisComputer: 'Этот компьютер',
  installing: 'Установка…',
  installComplete: (name: string) => `«${name}» установлен`,
  destinationChanged: 'Место установки изменилось. Закройте диалог и снова откройте ссылку установки.',
  installed: 'Установлен',
  source: 'Источник'
} satisfies TranslationOverrides['skillDeepLink']
