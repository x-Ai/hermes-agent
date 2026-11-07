import type { TranslationOverride } from '@hermes/shared/i18n'

import type { Translations } from './types'

// Settings › Billing, composed by ru.ts as `settings.billing` (file-size split).
export const ruBilling: TranslationOverride<Translations['settings']['billing']> = {
  perMonth: amount => `${amount}/мес.`,
  creditsPerMonth: amount => `Кредиты на ${amount}/мес.`,
  usageLabel: label => `Использование: ${label}`,
  freeTier: {
    signIn: 'Войти',
    title: 'Вы на бесплатном тарифе Nous',
    message: 'Войдите с аккаунтом Nous, чтобы открыть больше моделей и инструментов.',
    caption:
      'Работает на nous/welcome, коннекторы включены. После входа коннекторы сохранятся, и станут доступны инструменты, которым нужен аккаунт, и все остальные модели.',
    name: 'Nous · бесплатный тариф',
    footnote:
      'На бесплатном тарифе нет баланса и ничего не нужно платить. Оплата и использование появятся после входа с аккаунтом Nous.',
    plan: 'Бесплатный тариф',
    model: 'Модель',
    connectors: 'Коннекторы',
    included: 'Входят в тариф'
  },
  amountValidation: {
    reloadTo: 'Сумма пополнения',
    greaterThanThreshold: 'Сумма пополнения должна быть больше порога.',
    decimal: label => `${label}: введите сумму в долларах, не больше двух знаков после запятой.`,
    positive: label => `${label}: сумма должна быть больше $0.`,
    minimum: (label, amount) => `${label}: минимум ${amount}.`,
    maximum: (label, amount) => `${label}: максимум ${amount}.`
  },
  stepUp: {
    openVerification: 'Открыть страницу проверки',
    dismiss: 'Закрыть',
    waiting: 'Ожидание ссылки для проверки…',
    verify: 'Пройти проверку',
    deniedTitle: 'Проверка не одобрена',
    deniedBody: 'Проверка завершилась, но удалённые траты для этого терминала не разрешены.',
    successTitle: 'Проверка пройдена',
    successBody: 'Удалённые траты для этого терминала разрешены.'
  },
  charge: {
    added: amount => (amount ? `Добавлено: $${amount}.` : 'Кредиты добавлены.'),
    failedTitle: 'Списание не прошло',
    unconfirmedTitle: 'Результат списания не подтверждён',
    unconfirmedBody: message =>
      `${message} Результат последнего списания не подтверждён — проверьте баланс и историю, прежде чем повторять.`,
    checkTitle: 'Не удалось проверить списание',
    checkBody: 'Не удалось проверить списание.',
    untrackedTitle: 'Не удалось отследить списание',
    untrackedBody: 'Сервис оплаты принял запрос, но не вернул ID списания.',
    timeoutTitle: 'Всё ещё обрабатывается спустя 5 минут',
    timeoutBody: 'Списание ещё может пройти. Проверьте портал, прежде чем повторять.',
    authenticationRequired: 'Банк требует подтверждения (3DS). Пройдите его на портале, чтобы завершить покупку.',
    expired: 'Срок действия карты истёк. Обновите её на портале.',
    declined: 'Карта отклонена. Попробуйте другую карту на портале.',
    failedBody: reason => `Списание не прошло (${reason}).`
  },
  preview: 'предпросмотр',
  summary: {
    balance: 'Баланс',
    plan: 'Тариф',
    autoRefill: 'Автопополнение'
  },
  sections: {
    invoices: 'Счета',
    plan: 'Тариф',
    paymentAndCredits: 'Оплата и кредиты',
    usage: 'Использование'
  },
  buyCredits: {
    customAmount: 'Своя сумма кредитов',
    title: 'Купить кредиты сейчас',
    buyButton: 'Купить',
    processing: 'Обработка… проверяем зачисление',
    added: amount => `Добавлено: ${amount}. Баланс обновляется.`,
    retry: 'Повторить',
    openPortal: 'Открыть портал'
  },
  plan: {
    title: 'Тарифы',
    changePlan: 'Сменить тариф',
    viewPlans: 'Посмотреть тарифы',
    backAria: 'Назад к оплате',
    current: 'Текущий тариф',
    scheduled: 'Запланирован',
    empty: 'Сейчас нет тарифов, на которые можно перейти.',
    undo: 'Отменить',
    undoing: 'Отмена…',
    downgrade: 'Понизить',
    confirmDowngrade: 'Подтвердить понижение',
    tryAgain: 'Повторить',
    checkingChange: 'Проверка изменения…',
    cannotChange: 'Это изменение нельзя внести здесь.',
    alreadyOn: name => `Вы уже на тарифе ${name} — менять нечего.`,
    notScheduleable: 'Это изменение нельзя запланировать здесь.',
    scheduling: 'Планирование…',
    cancel: 'Отмена',
    effectScheduled: (targetName, effectiveAt, creditsDelta) =>
      `Переход на тариф ${targetName} вступит в силу ${effectiveAt}. Сейчас ничего не списывается: до этого момента у вас остаётся текущий тариф.${creditsDelta ? ` Изменение ежемесячных кредитов: ${creditsDelta}.` : ''}`
  },
  keepGoingOnCredits: {
    title: 'Продолжать за кредиты',
    description: 'Тратить кредиты, когда включённый объём закончится. Выключено: Hermes ждёт сброса.',
    approveInBrowser:
      'Чтобы изменить это, одобрите удалённые траты в браузере. Изменение применится сразу после одобрения.',
    openAgain: 'Открыть снова',
    cancel: 'Отмена',
    approvedRetry: 'Удалённые траты одобрены, но изменение не сохранилось.',
    tryAgain: 'Повторить'
  },
  autoReload: {
    threshold: 'Порог',
    thresholdAria: 'Порог автопополнения',
    reloadTo: 'Пополнять до',
    reloadToAria: 'Сумма, до которой пополнять',
    turnOffConfirm: 'Выключить автопополнение?',
    turnOff: 'Выключить',
    disable: 'Отключить',
    updated: 'Автопополнение обновлено.',
    turnedOff: 'Автопополнение выключено.',
    manage: 'Управлять',
    save: 'Сохранить',
    saving: 'Сохранение…',
    cancel: 'Отмена'
  },
  state: {
    notice: {
      loggedOut: {
        title: 'Подключите аккаунт Nous',
        message: 'Войдите с аккаунтом Nous, чтобы видеть здесь баланс, тариф и использование.',
        action: 'Войти'
      },
      openPortal: 'Открыть портал ↗',
      noCard: {
        title: 'Нет сохранённого способа оплаты',
        message: 'Покупка кредитов и автопополнение недоступны, пока не сохранена карта. Добавьте её на портале.',
        action: 'Добавить карту ↗'
      }
    },
    paymentMethod: {
      title: 'Способ оплаты',
      description: 'Карта, с которой оплачиваются пополнения и продление подписки.',
      addAction: 'Добавить способ оплаты',
      updateAction: 'Изменить',
      provenance: {
        autoRefill: 'карта автопополнения',
        customerDefault: 'карта по умолчанию',
        subPin: 'карта подписки',
        suffix: label => ` — ${label}`
      }
    },
    buyCredits: {
      description: 'Разовое списание с карты, кредиты поступят на баланс сегодня.'
    },
    autoRefill: {
      title: 'Пополнять при низком балансе',
      genericDescription: 'Пополнять баланс, когда он опускается ниже порога.',
      offPill: 'Выключено',
      enabledPill: 'Включено',
      manageCaption: 'Автопополнение настраивается на портале.',
      turnOnCaption: 'Включите автопополнение на портале',
      chargesDescription: (reloadTo, threshold) =>
        `Автоматически списывает ${reloadTo}, когда баланс опускается ниже ${threshold}.`,
      distinctCardCaption: cardLabel => `Автопополнение использует ${cardLabel} — сверьте на портале`,
      distinctCardFallback: 'другую карту',
      reconcileAction: 'Сверить ↗'
    },
    usage: {
      subscriptionCredits: {
        title: 'Кредиты по подписке',
        barLabel: 'Осталось кредитов по подписке',
        captionResets: date => `Сброс: ${date}`,
        valueOf: (remaining, monthly) => `Осталось ${remaining} из ${monthly}`,
        valueOver: (remaining, monthly, over) => `Осталось ${remaining} из ${monthly} · сверх лимита ${over}`
      },
      topupCredits: {
        title: 'Кредиты пополнения',
        caption: 'Не сгорают'
      },
      monthlyCap: {
        title: 'Месячный лимит расходов',
        barLabel: 'Использовано из месячного лимита расходов',
        captionDefault: 'Лимит по умолчанию',
        captionSpending: 'Удалённые траты за месяц',
        valueUsed: (spent, limit) => `Использовано ${spent} из ${limit}`
      },
      window: {
        today: 'Сегодня',
        week: 'Эта неделя',
        month: 'Этот месяц',
        topTier: 'Крупные модели (месяц)',
        barLabel: title => `${title}: использовано включённого объёма`,
        captionPaused: 'Приостановлено: платёж по подписке не прошёл',
        captionPausedOther: 'Приостановлено: см. раздел «Оплата» на портале',
        captionTopTierUsedUp: 'Месячный лимит исчерпан, остальное оплачивается кредитами',
        captionTopTierUsedUpKeepGoingOff: 'Месячный лимит исчерпан, другие включённые модели работают',
        captionResetsIn: duration => `Сброс через ${duration}`,
        captionIncluded: 'Включённый объём',
        valueUsed: percent => `использовано ${percent}`
      }
    },
    planCard: {
      freeTier: 'Бесплатный',
      chooseAction: 'Выбрать ↗',
      adjustPlanAction: 'Изменить тариф ↗',
      unavailableCaption: 'Данные о подписке недоступны, но портал по-прежнему можно открыть.',
      downgradeCaption: (tierName, when) => `Смена тарифа на ${tierName}: ${when}.`,
      cancellationCaption: when => `Отмена подписки: ${when}.`,
      renewsCaption: date => `Продление: ${date}`,
      noSubscriptionCaption: 'Нет активной подписки — платные модели расходуют кредиты пополнения.'
    }
  },
  errors: {
    consentRequired: {
      title: 'Нужно подтвердить карту',
      message: 'Подтвердите на портале эту карту для списаний из терминала'
    },
    insufficientScope: {
      title: 'Удалённые траты требуют одобрения',
      message: 'Для этого нужно разрешить удалённые траты. Начните пополнение, чтобы разрешить их, и повторите.'
    },
    remoteSpendingRevoked: {
      title: 'Удалённые траты остановлены',
      messageByAdmin: 'Администратор остановил удалённые траты для этого терминала.',
      messageBySelf: 'Вы остановили удалённые траты для этого терминала.'
    },
    remoteSpendingReconnect: who =>
      `${who} Переподключитесь в разделе Настройки → Шлюзы, чтобы снова авторизовать это устройство.`,
    sessionRevoked: {
      title: 'Сеанс завершён',
      message: 'Сеанс был завершён. Войдите снова в разделе Настройки → Шлюзы.'
    },
    cliBillingDisabled: {
      title: 'Удалённые траты выключены',
      message:
        'Удалённые траты для этого аккаунта выключены — администратор оплаты может включить их на странице Hermes Agent на портале.'
    },
    roleRequired: {
      title: 'Нужна роль администратора',
      message:
        'Пополнять баланс может только администратор или владелец организации. Попросите администратора или сделайте это на портале.'
    },
    idempotencyConflict: {
      title: 'Начните новое пополнение',
      message: '🔴 Этот ключ списания уже использован для другой суммы. Начните новое пополнение.'
    },
    noPaymentMethod: {
      title: 'Нет сохранённой карты',
      message:
        '💳 Карта для списаний из терминала ещё не сохранена. Добавьте её на портале (разовые покупки кредитов не сохраняют карту для повторного использования).'
    },
    orgAccessDenied: {
      title: 'Нет доступа к организации',
      message: 'Этот токен не привязан к организации, которой вы можете управлять'
    },
    monthlyCapExceeded: {
      title: 'Достигнут месячный лимит расходов',
      messageReached: '🔴 Достигнут месячный лимит расходов.',
      messageHeadroom: remaining => `🔴 Достигнут месячный лимит расходов — осталось $${remaining}.`
    },
    rateLimited: {
      title: 'Сейчас слишком много списаний',
      message: mins =>
        mins > 0
          ? `🟡 Сейчас слишком много списаний (повторите примерно через ${mins} мин). Это не ошибка оплаты.`
          : '🟡 Сейчас слишком много списаний. Это не ошибка оплаты.'
    },
    stripeUnavailable: {
      title: 'Проблемы на стороне Stripe',
      message: mins =>
        mins > 0
          ? `Проблемы на стороне Stripe — повторите примерно через ${mins} мин`
          : 'Проблемы на стороне Stripe — повторите чуть позже'
    },
    upgradeCapExceeded: {
      title: 'Достигнут дневной лимит смены тарифа',
      message: 'Достигнут дневной лимит смены тарифа — попробуйте завтра'
    },
    endpointUnavailable: {
      title: 'Эндпоинт оплаты недоступен',
      message: 'Эндпоинт оплаты вернул ответ не в формате JSON (возможно, в этом развёртывании он недоступен).'
    },
    timeout: {
      title: 'Истекло время ожидания запроса оплаты',
      message: 'Истекло время ожидания запроса оплаты.'
    },
    transport: {
      title: 'Не удалось связаться с сервисом оплаты',
      message: 'Запрос оплаты не дошёл до шлюза.'
    },
    default: {
      title: 'Не удалось выполнить запрос оплаты',
      message: 'Не удалось выполнить запрос оплаты.'
    }
  }
}
