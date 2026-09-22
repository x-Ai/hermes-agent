import { ChevronDown, Globe2 } from 'lucide-react'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export type InstallerLocale = 'en' | 'zh' | 'zh-hant' | 'ja' | 'ar' | 'ru'

interface InstallerCopy {
  windowTitle: string
  languageLabel: string
  common: {
    loading: string
    cancel: string
    openLogs: string
    log: string
  }
  welcome: {
    tagline: string
    install: string
  }
  progress: {
    done: string
    settingUp: string
    updating: string
    installDescription: string
    updateDescription: string
    stepsComplete: (done: number, total: number) => string
    liveOutput: string
    lines: (count: number) => string
    showDetails: string
    hideDetails: string
    stageNames: Record<string, string>
  }
  success: {
    title: string
    descriptionBeforeCommand: string
    descriptionAfterCommand: string
    launch: string
    launching: string
    launchFailed: string
  }
  failure: {
    installTitle: string
    updateTitle: string
    installDescription: string
    updateDescription: string
    retryInstall: string
    retryUpdate: string
  }
}

const STAGE_IDS = [
  'uv',
  'python',
  'git',
  'node',
  'system-packages',
  'prerequisites',
  'repo',
  'repository',
  'venv',
  'dependencies',
  'python-deps',
  'node-deps',
  'path',
  'config',
  'setup',
  'gateway',
  'desktop',
  'complete',
  'handoff',
  'update',
  'rebuild',
  'install'
] as const

type InstallerStage = (typeof STAGE_IDS)[number]

const stageNames = {
  en: {
    uv: 'Install uv',
    python: 'Verify Python',
    git: 'Install Git',
    node: 'Detect Node.js',
    'system-packages': 'Install system packages',
    prerequisites: 'System prerequisites',
    repo: 'Download Hermes Agent',
    repository: 'Download Hermes Agent',
    venv: 'Create Python virtual environment',
    dependencies: 'Install Python dependencies',
    'python-deps': 'Install Python dependencies',
    'node-deps': 'Install browser-tool dependencies',
    path: 'Install hermes command',
    config: 'Prepare config and skills',
    setup: 'Configure API keys and settings',
    gateway: 'Configure gateway service',
    desktop: 'Build desktop app',
    complete: 'Finish install',
    handoff: 'Prepare update',
    update: 'Download the latest version',
    rebuild: 'Rebuild the desktop app',
    install: 'Install the update'
  },
  zh: {
    uv: '安装 uv',
    python: '验证 Python',
    git: '安装 Git',
    node: '检测 Node.js',
    'system-packages': '安装系统软件包',
    prerequisites: '检查系统前置条件',
    repo: '下载 Hermes Agent',
    repository: '下载 Hermes Agent',
    venv: '创建 Python 虚拟环境',
    dependencies: '安装 Python 依赖',
    'python-deps': '安装 Python 依赖',
    'node-deps': '安装浏览器工具依赖',
    path: '安装 hermes 命令',
    config: '准备配置和技能',
    setup: '配置 API 密钥和设置',
    gateway: '配置网关服务',
    desktop: '构建桌面应用',
    complete: '完成安装',
    handoff: '准备更新',
    update: '下载最新版本',
    rebuild: '重新构建桌面应用',
    install: '安装更新'
  },
  'zh-hant': {
    uv: '安裝 uv',
    python: '驗證 Python',
    git: '安裝 Git',
    node: '偵測 Node.js',
    'system-packages': '安裝系統套件',
    prerequisites: '檢查系統前置條件',
    repo: '下載 Hermes Agent',
    repository: '下載 Hermes Agent',
    venv: '建立 Python 虛擬環境',
    dependencies: '安裝 Python 相依套件',
    'python-deps': '安裝 Python 相依套件',
    'node-deps': '安裝瀏覽器工具相依套件',
    path: '安裝 hermes 指令',
    config: '準備設定與技能',
    setup: '設定 API 金鑰與偏好設定',
    gateway: '設定閘道服務',
    desktop: '建置桌面應用程式',
    complete: '完成安裝',
    handoff: '準備更新',
    update: '下載最新版本',
    rebuild: '重新建置桌面應用程式',
    install: '安裝更新'
  },
  ja: {
    uv: 'uv をインストール',
    python: 'Python を確認',
    git: 'Git をインストール',
    node: 'Node.js を検出',
    'system-packages': 'システムパッケージをインストール',
    prerequisites: 'システム要件を確認',
    repo: 'Hermes Agent をダウンロード',
    repository: 'Hermes Agent をダウンロード',
    venv: 'Python 仮想環境を作成',
    dependencies: 'Python 依存関係をインストール',
    'python-deps': 'Python 依存関係をインストール',
    'node-deps': 'ブラウザーツールの依存関係をインストール',
    path: 'hermes コマンドをインストール',
    config: '設定とスキルを準備',
    setup: 'API キーと設定を構成',
    gateway: 'ゲートウェイサービスを設定',
    desktop: 'デスクトップアプリをビルド',
    complete: 'インストールを完了',
    handoff: '更新を準備',
    update: '最新バージョンをダウンロード',
    rebuild: 'デスクトップアプリを再ビルド',
    install: '更新をインストール'
  },
  ar: {
    uv: 'تثبيت uv',
    python: 'التحقق من Python',
    git: 'تثبيت Git',
    node: 'اكتشاف Node.js',
    'system-packages': 'تثبيت حزم النظام',
    prerequisites: 'التحقق من متطلبات النظام',
    repo: 'تنزيل Hermes Agent',
    repository: 'تنزيل Hermes Agent',
    venv: 'إنشاء بيئة Python افتراضية',
    dependencies: 'تثبيت تبعيات Python',
    'python-deps': 'تثبيت تبعيات Python',
    'node-deps': 'تثبيت تبعيات أداة المتصفح',
    path: 'تثبيت أمر hermes',
    config: 'إعداد التكوين والمهارات',
    setup: 'إعداد مفاتيح API والإعدادات',
    gateway: 'إعداد خدمة البوابة',
    desktop: 'بناء تطبيق سطح المكتب',
    complete: 'إكمال التثبيت',
    handoff: 'التحضير للتحديث',
    update: 'تنزيل أحدث إصدار',
    rebuild: 'إعادة بناء تطبيق سطح المكتب',
    install: 'تثبيت التحديث'
  },
  ru: {
    uv: 'Установка uv',
    python: 'Проверка Python',
    git: 'Установка Git',
    node: 'Определение Node.js',
    'system-packages': 'Установка системных пакетов',
    prerequisites: 'Проверка системных требований',
    repo: 'Загрузка Hermes Agent',
    repository: 'Загрузка Hermes Agent',
    venv: 'Создание виртуального окружения Python',
    dependencies: 'Установка зависимостей Python',
    'python-deps': 'Установка зависимостей Python',
    'node-deps': 'Установка зависимостей браузерных инструментов',
    path: 'Установка команды hermes',
    config: 'Подготовка конфигурации и навыков',
    setup: 'Настройка ключей API и параметров',
    gateway: 'Настройка службы шлюза',
    desktop: 'Сборка приложения',
    complete: 'Завершение установки',
    handoff: 'Подготовка обновления',
    update: 'Загрузка последней версии',
    rebuild: 'Повторная сборка приложения',
    install: 'Установка обновления'
  }
} satisfies Record<InstallerLocale, Record<InstallerStage, string>>

const MESSAGES: Record<InstallerLocale, InstallerCopy> = {
  en: {
    windowTitle: 'Hermes Setup',
    languageLabel: 'Language',
    common: { loading: 'Loading', cancel: 'Cancel', openLogs: 'Open logs', log: 'Log' },
    welcome: {
      tagline: 'The agent that grows with you. We’ll set things up in the background — takes a few minutes.',
      install: 'Install Hermes'
    },
    progress: {
      done: 'Done',
      settingUp: 'Setting up Hermes Agent',
      updating: 'Updating Hermes',
      installDescription:
        'This is a one-time setup. Hermes is downloading dependencies and configuring your computer. Later launches skip this step.',
      updateDescription: 'Hermes is updating to the latest version — this only takes a moment.',
      stepsComplete: (done, total) => `${done} of ${total} steps complete`,
      liveOutput: 'Live output',
      lines: count => `${count} line${count === 1 ? '' : 's'}`,
      showDetails: 'Show details',
      hideDetails: 'Hide details',
      stageNames: stageNames.en
    },
    success: {
      title: 'Hermes is ready',
      descriptionBeforeCommand: 'Launch it here, or later from Terminal with',
      descriptionAfterCommand: '.',
      launch: 'Launch Hermes',
      launching: 'Launching',
      launchFailed: 'Couldn’t launch the desktop app'
    },
    failure: {
      installTitle: 'Install didn’t finish',
      updateTitle: 'Update didn’t finish',
      installDescription: 'Something went wrong during installation.',
      updateDescription: 'Something went wrong during the update.',
      retryInstall: 'Retry install',
      retryUpdate: 'Retry update'
    }
  },
  zh: {
    windowTitle: 'Hermes 安装程序',
    languageLabel: '语言',
    common: { loading: '加载中', cancel: '取消', openLogs: '打开日志', log: '日志' },
    welcome: {
      tagline: '与你共同成长的智能体，我们会在后台完成设置，通常只需几分钟',
      install: '安装 Hermes'
    },
    progress: {
      done: '完成',
      settingUp: '正在设置 Hermes Agent',
      updating: '正在更新 Hermes',
      installDescription: '这是一次性设置，Hermes 正在下载依赖并配置你的电脑，之后启动会跳过此步骤',
      updateDescription: 'Hermes 正在更新到最新版本，通常很快即可完成',
      stepsComplete: (done, total) => `${done}/${total} 个步骤已完成`,
      liveOutput: '实时输出',
      lines: count => `${count} 行`,
      showDetails: '显示详情',
      hideDetails: '隐藏详情',
      stageNames: stageNames.zh
    },
    success: {
      title: 'Hermes 已就绪',
      descriptionBeforeCommand: '你可以从这里启动，也可以稍后在终端运行',
      descriptionAfterCommand: '',
      launch: '启动 Hermes',
      launching: '正在启动',
      launchFailed: '无法启动桌面应用'
    },
    failure: {
      installTitle: '安装未完成',
      updateTitle: '更新未完成',
      installDescription: '安装过程中出现了问题',
      updateDescription: '更新过程中出现了问题',
      retryInstall: '重试安装',
      retryUpdate: '重试更新'
    }
  },
  'zh-hant': {
    windowTitle: 'Hermes 安裝程式',
    languageLabel: '語言',
    common: { loading: '載入中', cancel: '取消', openLogs: '開啟記錄', log: '記錄' },
    welcome: {
      tagline: '與您共同成長的智慧代理。我們會在背景完成設定，通常只需幾分鐘',
      install: '安裝 Hermes'
    },
    progress: {
      done: '完成',
      settingUp: '正在設定 Hermes Agent',
      updating: '正在更新 Hermes',
      installDescription: '這是一次性設定。Hermes 正在下載相依套件並設定您的電腦，之後啟動會略過此步驟',
      updateDescription: 'Hermes 正在更新至最新版本，通常很快即可完成',
      stepsComplete: (done, total) => `${done}/${total} 個步驟已完成`,
      liveOutput: '即時輸出',
      lines: count => `${count} 行`,
      showDetails: '顯示詳細資訊',
      hideDetails: '隱藏詳細資訊',
      stageNames: stageNames['zh-hant']
    },
    success: {
      title: 'Hermes 已就緒',
      descriptionBeforeCommand: '您可以從這裡啟動，也可以稍後在終端機執行',
      descriptionAfterCommand: '',
      launch: '啟動 Hermes',
      launching: '正在啟動',
      launchFailed: '無法啟動桌面應用程式'
    },
    failure: {
      installTitle: '安裝未完成',
      updateTitle: '更新未完成',
      installDescription: '安裝過程中發生問題',
      updateDescription: '更新過程中發生問題',
      retryInstall: '重試安裝',
      retryUpdate: '重試更新'
    }
  },
  ja: {
    windowTitle: 'Hermes セットアップ',
    languageLabel: '言語',
    common: { loading: '読み込み中', cancel: 'キャンセル', openLogs: 'ログを開く', log: 'ログ' },
    welcome: {
      tagline: 'あなたとともに成長するエージェントです。バックグラウンドで数分かけてセットアップします',
      install: 'Hermes をインストール'
    },
    progress: {
      done: '完了',
      settingUp: 'Hermes Agent を設定中',
      updating: 'Hermes を更新中',
      installDescription:
        'これは一度限りのセットアップです。依存関係をダウンロードしてコンピューターを設定しています。次回以降は省略されます',
      updateDescription: 'Hermes を最新バージョンに更新しています。まもなく完了します',
      stepsComplete: (done, total) => `${total} ステップ中 ${done} 完了`,
      liveOutput: 'ライブ出力',
      lines: count => `${count} 行`,
      showDetails: '詳細を表示',
      hideDetails: '詳細を隠す',
      stageNames: stageNames.ja
    },
    success: {
      title: 'Hermes の準備ができました',
      descriptionBeforeCommand: 'ここから起動するか、後でターミナルから次を実行できます：',
      descriptionAfterCommand: '',
      launch: 'Hermes を起動',
      launching: '起動中',
      launchFailed: 'デスクトップアプリを起動できませんでした'
    },
    failure: {
      installTitle: 'インストールが完了しませんでした',
      updateTitle: '更新が完了しませんでした',
      installDescription: 'インストール中に問題が発生しました',
      updateDescription: '更新中に問題が発生しました',
      retryInstall: 'インストールを再試行',
      retryUpdate: '更新を再試行'
    }
  },
  ar: {
    windowTitle: 'إعداد Hermes',
    languageLabel: 'اللغة',
    common: { loading: 'جار التحميل', cancel: 'إلغاء', openLogs: 'فتح السجلات', log: 'السجل' },
    welcome: {
      tagline: 'الوكيل الذي ينمو معك. سنكمل الإعداد في الخلفية خلال بضع دقائق.',
      install: 'تثبيت Hermes'
    },
    progress: {
      done: 'تم',
      settingUp: 'جار إعداد Hermes Agent',
      updating: 'جار تحديث Hermes',
      installDescription: 'هذا إعداد لمرة واحدة. ينزّل Hermes التبعيات ويهيئ جهازك، وستُتخطى هذه الخطوة لاحقًا.',
      updateDescription: 'يجري تحديث Hermes إلى أحدث إصدار، ولن يستغرق ذلك سوى لحظات.',
      stepsComplete: (done, total) => `اكتملت ${done} من ${total} خطوة`,
      liveOutput: 'المخرجات المباشرة',
      lines: count => `${count} سطر`,
      showDetails: 'إظهار التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      stageNames: stageNames.ar
    },
    success: {
      title: 'Hermes جاهز',
      descriptionBeforeCommand: 'يمكنك تشغيله من هنا أو لاحقًا من الطرفية بالأمر',
      descriptionAfterCommand: '.',
      launch: 'تشغيل Hermes',
      launching: 'جار التشغيل',
      launchFailed: 'تعذّر تشغيل تطبيق سطح المكتب'
    },
    failure: {
      installTitle: 'لم يكتمل التثبيت',
      updateTitle: 'لم يكتمل التحديث',
      installDescription: 'حدث خطأ أثناء التثبيت.',
      updateDescription: 'حدث خطأ أثناء التحديث.',
      retryInstall: 'إعادة محاولة التثبيت',
      retryUpdate: 'إعادة محاولة التحديث'
    }
  },
  ru: {
    windowTitle: 'Установка Hermes',
    languageLabel: 'Язык',
    common: { loading: 'Загрузка', cancel: 'Отмена', openLogs: 'Открыть журналы', log: 'Журнал' },
    welcome: {
      tagline: 'Агент, который развивается вместе с вами. Настройка в фоне займёт несколько минут.',
      install: 'Установить Hermes'
    },
    progress: {
      done: 'Готово',
      settingUp: 'Настройка Hermes Agent',
      updating: 'Обновление Hermes',
      installDescription:
        'Это одноразовая настройка. Hermes загружает зависимости и настраивает компьютер; при следующих запусках этот шаг будет пропущен.',
      updateDescription: 'Hermes обновляется до последней версии. Это займёт немного времени.',
      stepsComplete: (done, total) => `Завершено шагов: ${done} из ${total}`,
      liveOutput: 'Вывод в реальном времени',
      lines: count => `${count} строк`,
      showDetails: 'Показать подробности',
      hideDetails: 'Скрыть подробности',
      stageNames: stageNames.ru
    },
    success: {
      title: 'Hermes готов',
      descriptionBeforeCommand: 'Запустите его здесь или позже из терминала командой',
      descriptionAfterCommand: '.',
      launch: 'Запустить Hermes',
      launching: 'Запуск',
      launchFailed: 'Не удалось запустить приложение'
    },
    failure: {
      installTitle: 'Установка не завершена',
      updateTitle: 'Обновление не завершено',
      installDescription: 'Во время установки произошла ошибка.',
      updateDescription: 'Во время обновления произошла ошибка.',
      retryInstall: 'Повторить установку',
      retryUpdate: 'Повторить обновление'
    }
  }
}

const LOCALE_STORAGE_KEY = 'hermes-bootstrap.locale'

const LOCALE_OPTIONS: readonly { id: InstallerLocale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '简体中文' },
  { id: 'zh-hant', label: '繁體中文' },
  { id: 'ja', label: '日本語' },
  { id: 'ar', label: 'العربية' },
  { id: 'ru', label: 'Русский' }
]

const ALIASES: Record<string, InstallerLocale> = {
  en: 'en',
  zh: 'zh',
  'zh-cn': 'zh',
  'zh-hans': 'zh',
  'zh-sg': 'zh',
  'zh-tw': 'zh-hant',
  'zh-hk': 'zh-hant',
  'zh-mo': 'zh-hant',
  'zh-hant': 'zh-hant',
  ja: 'ja',
  ar: 'ar',
  ru: 'ru'
}

function normalizeInstallerLocale(value: unknown): InstallerLocale | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase().replaceAll('_', '-')

  return ALIASES[normalized] ?? ALIASES[normalized.split('-')[0]] ?? null
}

function initialLocale(): InstallerLocale {
  try {
    const stored = normalizeInstallerLocale(localStorage.getItem(LOCALE_STORAGE_KEY))

    if (stored) {
      return stored
    }
  } catch {
    // Private/restricted storage still gets system-locale detection.
  }

  const candidates = typeof navigator === 'undefined' ? [] : [navigator.language, ...(navigator.languages ?? [])]

  for (const candidate of candidates) {
    const locale = normalizeInstallerLocale(candidate)

    if (locale) {
      return locale
    }
  }

  return 'en'
}

interface InstallerI18nValue {
  locale: InstallerLocale
  setLocale: (locale: InstallerLocale) => void
  t: InstallerCopy
}

const InstallerI18nContext = createContext<InstallerI18nValue>({
  locale: 'en',
  setLocale: () => {},
  t: MESSAGES.en
})

export function InstallerI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<InstallerLocale>(initialLocale)
  const t = MESSAGES[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.title = t.windowTitle

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Best-effort preference; this window still uses the selected locale.
    }
  }, [locale, t.windowTitle])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <InstallerI18nContext.Provider value={value}>{children}</InstallerI18nContext.Provider>
}

export function useInstallerI18n(): InstallerI18nValue {
  return useContext(InstallerI18nContext)
}

export function InstallerLanguageSwitcher() {
  const { locale, setLocale, t } = useInstallerI18n()

  return (
    <label className="absolute end-4 top-4 z-20 flex items-center gap-1.5 rounded-md border border-(--ui-stroke-tertiary) bg-background/85 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
      <Globe2 aria-hidden size={14} />
      <span className="sr-only">{t.languageLabel}</span>
      <select
        aria-label={t.languageLabel}
        className="cursor-pointer appearance-none bg-transparent pe-4 text-foreground outline-none"
        onChange={event => setLocale(event.target.value as InstallerLocale)}
        value={locale}
      >
        {LOCALE_OPTIONS.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none -ms-4" size={12} />
    </label>
  )
}
