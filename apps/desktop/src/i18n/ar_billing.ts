import type { TranslationOverride } from '@hermes/shared/i18n'

import { AR_PLURAL } from './ar_plural'
import type { Translations } from './types'

// "after about N minutes", genitive after بعد.
const aboutMinutes = (mins: number) =>
  `بعد نحو ${AR_PLURAL(mins, { one: 'دقيقة', two: 'دقيقتين', few: `${mins} دقائق`, many: `${mins} دقيقة` })}`

// Settings › Billing, composed by ar_settings.ts as `settings.billing` (file-size split).
export const arBilling: TranslationOverride<Translations['settings']['billing']> = {
  perMonth: amount => `${amount} شهريًا`,
  creditsPerMonth: amount => `رصيد ${amount} شهريًا`,
  usageLabel: label => `استخدام ${label}`,
  freeTier: {
    signIn: 'تسجيل الدخول',
    title: 'أنت على المستوى المجاني من Nous',
    message: 'سجّل الدخول بحساب Nous لفتح مزيد من النماذج والأدوات.',
    caption:
      'يعمل على nous/welcome مع الموصلات. يُبقي تسجيل الدخول موصلاتك ويضيف الأدوات التي تتطلب حسابًا وكل النماذج الأخرى.',
    name: 'Nous · المستوى المجاني',
    footnote: 'لا رصيد في المستوى المجاني ولا شيء تدفعه. يظهر الدفع والاستخدام عند تسجيل الدخول بحساب Nous.',
    plan: 'المستوى المجاني',
    model: 'النموذج',
    connectors: 'الموصلات',
    included: 'مضمّنة'
  },
  amountValidation: {
    reloadTo: 'مبلغ التعبئة',
    greaterThanThreshold: 'يجب أن يكون مبلغ التعبئة أكبر من الحد الأدنى.',
    decimal: label => `${label}: أدخل مبلغًا بالدولار بخانتين عشريتين على الأكثر.`,
    positive: label => `${label}: يجب أن يكون المبلغ أكبر من $0.`,
    minimum: (label, amount) => `${label}: أقل مبلغ مسموح به ${amount}.`,
    maximum: (label, amount) => `${label}: أعلى مبلغ مسموح به ${amount}.`
  },
  stepUp: {
    openVerification: 'فتح صفحة التحقق',
    dismiss: 'إغلاق',
    waiting: 'جارٍ انتظار رابط التحقق…',
    verify: 'التحقق للمتابعة',
    deniedTitle: 'لم تتم الموافقة على التحقق',
    deniedBody: 'انتهى التحقق دون السماح بالإنفاق عن بُعد لهذه الطرفية.',
    successTitle: 'اكتمل التحقق',
    successBody: 'الإنفاق عن بُعد مسموح لهذه الطرفية.'
  },
  charge: {
    added: amount => (amount ? `تمت إضافة $${amount}.` : 'تمت إضافة الرصيد.'),
    failedTitle: 'فشلت عملية الدفع',
    unconfirmedTitle: 'نتيجة عملية الدفع غير مؤكدة',
    unconfirmedBody: message =>
      `${message} نتيجة آخر عملية دفع غير مؤكدة - راجع رصيدك أو سجلّ العمليات قبل إعادة المحاولة.`,
    checkTitle: 'تعذّر التحقق من عملية الدفع',
    checkBody: 'تعذّر التحقق من عملية الدفع.',
    untrackedTitle: 'تعذّر تتبّع عملية الدفع',
    untrackedBody: 'قبلت خدمة الفوترة الطلب لكنها لم تُرجع معرّف عملية الدفع.',
    timeoutTitle: 'لا تزال المعالجة جارية بعد 5 دقائق',
    timeoutBody: 'قد تكتمل عملية الدفع لاحقًا. راجع البوابة قبل إعادة المحاولة.',
    authenticationRequired: 'يطلب مصرفك التحقق (3DS). أكمله في البوابة لإتمام عملية الشراء.',
    expired: 'انتهت صلاحية بطاقتك. حدّثها في البوابة.',
    declined: 'رُفضت بطاقتك. جرّب بطاقة أخرى في البوابة.',
    failedBody: reason => `لم تتم عملية الدفع (${reason}).`
  },
  preview: 'معاينة',
  summary: {
    balance: 'الرصيد',
    plan: 'الخطة',
    autoRefill: 'التعبئة التلقائية'
  },
  sections: {
    invoices: 'الفواتير',
    plan: 'الخطة',
    paymentAndCredits: 'الدفع والرصيد',
    usage: 'الاستخدام'
  },
  buyCredits: {
    customAmount: 'مبلغ رصيد مخصص',
    title: 'شراء رصيد الآن',
    buyButton: 'شراء',
    processing: 'جارٍ المعالجة… يجري التحقق من التسوية',
    added: amount => `تمت إضافة ${amount}. جارٍ تحديث الرصيد.`,
    retry: 'إعادة المحاولة',
    openPortal: 'فتح البوابة'
  },
  plan: {
    title: 'الخطط',
    changePlan: 'تغيير الخطة',
    viewPlans: 'عرض الخطط',
    backAria: 'العودة إلى الفوترة',
    current: 'الخطة الحالية',
    scheduled: 'مجدولة',
    empty: 'لا توجد خطط متاحة للتغيير إليها حاليًا.',
    undo: 'تراجع',
    undoing: 'جارٍ التراجع…',
    downgrade: 'خفض الخطة',
    confirmDowngrade: 'تأكيد خفض الخطة',
    tryAgain: 'إعادة المحاولة',
    checkingChange: 'جارٍ التحقق من هذا التغيير…',
    cannotChange: 'لا يمكن إجراء هذا التغيير هنا.',
    alreadyOn: name => `أنت مشترك في ${name} بالفعل — لا شيء لتغييره.`,
    notScheduleable: 'لا يمكن جدولة هذا التغيير هنا.',
    scheduling: 'جارٍ الجدولة…',
    cancel: 'إلغاء',
    effectScheduled: (targetName, effectiveAt, creditsDelta) =>
      `الانتقال إلى ${targetName} — يسري في ${effectiveAt}. لا رسوم الآن، وتحتفظ بخطتك الحالية حتى ذلك الحين.${creditsDelta ? ` تغيّر الرصيد الشهري: ${creditsDelta}.` : ''}`
  },
  keepGoingOnCredits: {
    title: 'الاستمرار بالرصيد',
    description: 'استخدم رصيدك عند نفاد الاستخدام المضمّن. عند الإيقاف: ينتظر Hermes إعادة التعيين.',
    approveInBrowser: 'وافق على الإنفاق عن بُعد في متصفحك لتغيير هذا. يُطبَّق فور الموافقة.',
    openAgain: 'فتح مرة أخرى',
    cancel: 'إلغاء',
    approvedRetry: 'تمت الموافقة على الإنفاق عن بُعد، لكن لم يُحفظ التغيير.',
    tryAgain: 'إعادة المحاولة'
  },
  autoReload: {
    threshold: 'الحد الأدنى',
    thresholdAria: 'الحد الأدنى للتعبئة التلقائية',
    reloadTo: 'التعبئة حتى',
    reloadToAria: 'مبلغ التعبئة التلقائية',
    turnOffConfirm: 'إيقاف التعبئة التلقائية؟',
    turnOff: 'إيقاف',
    disable: 'تعطيل',
    updated: 'تم تحديث التعبئة التلقائية.',
    turnedOff: 'تم إيقاف التعبئة التلقائية.',
    manage: 'إدارة',
    save: 'حفظ',
    saving: 'جارٍ الحفظ…',
    cancel: 'إلغاء'
  },
  state: {
    notice: {
      loggedOut: {
        title: 'اربط حسابك في Nous',
        message: 'سجّل الدخول بحسابك في Nous لترى هنا رصيدك وخطتك واستخدامك.',
        action: 'تسجيل الدخول'
      },
      openPortal: 'فتح البوابة ↗',
      noCard: {
        title: 'لا توجد وسيلة دفع محفوظة',
        message: 'يبقى شراء رصيد التعبئة والتعبئة التلقائية معطّلين حتى تُحفظ بطاقة. أضف بطاقة في البوابة.',
        action: 'إضافة بطاقة ↗'
      }
    },
    paymentMethod: {
      title: 'وسيلة الدفع',
      description: 'أدِر البطاقة المستخدمة للتعبئة وتجديد الاشتراك.',
      addAction: 'إضافة وسيلة دفع',
      updateAction: 'تحديث',
      provenance: {
        autoRefill: 'بطاقة التعبئة التلقائية',
        customerDefault: 'البطاقة الافتراضية للحساب',
        subPin: 'بطاقة الاشتراك',
        suffix: label => ` - ${label}`
      }
    },
    buyCredits: {
      description: 'دفعة واحدة من بطاقتك تُضاف إلى رصيدك اليوم.'
    },
    autoRefill: {
      title: 'التعبئة عند انخفاض الرصيد',
      genericDescription: 'يُبقي رصيدك معبّأً عندما ينخفض عن الحد الأدنى الذي حددته.',
      offPill: 'متوقفة',
      enabledPill: 'مفعّلة',
      manageCaption: 'أدِر التعبئة التلقائية من البوابة.',
      turnOnCaption: 'فعّل التعبئة التلقائية من البوابة',
      chargesDescription: (reloadTo, threshold) =>
        `يُخصم ${reloadTo} من بطاقتك تلقائيًا عندما ينخفض رصيدك عن ${threshold}.`,
      distinctCardCaption: cardLabel => `تُخصم التعبئة التلقائية من ${cardLabel} — طابِق البطاقتين في البوابة`,
      distinctCardFallback: 'بطاقة مختلفة',
      reconcileAction: 'مطابقة ↗'
    },
    usage: {
      subscriptionCredits: {
        title: 'رصيد الاشتراك',
        barLabel: 'المتبقي من رصيد الاشتراك',
        captionResets: date => `يُعاد التعيين في ${date}`,
        valueOf: (remaining, monthly) => `متبقٍ ${remaining} من ${monthly}`,
        valueOver: (remaining, monthly, over) => `متبقٍ ${remaining} من ${monthly} · تجاوز بمقدار ${over}`
      },
      topupCredits: {
        title: 'رصيد التعبئة',
        caption: 'لا تنتهي صلاحيته'
      },
      monthlyCap: {
        title: 'حد الإنفاق الشهري',
        barLabel: 'المستخدم من حد الإنفاق الشهري',
        captionDefault: 'الحد الافتراضي',
        captionSpending: 'الإنفاق الشهري عن بُعد',
        valueUsed: (spent, limit) => `استُخدم ${spent} من ${limit}`
      },
      window: {
        today: 'اليوم',
        week: 'هذا الأسبوع',
        month: 'هذا الشهر',
        topTier: 'النماذج الكبيرة (شهريًا)',
        barLabel: title => `المستخدم من الاستخدام المضمّن: ${title}`,
        captionPaused: 'متوقف مؤقتًا: فشل دفع الاشتراك',
        captionPausedOther: 'متوقف مؤقتًا: راجع الفوترة في البوابة',
        captionTopTierUsedUp: 'نفدت الحصة الشهرية، ويغطي الرصيد الباقي',
        captionTopTierUsedUpKeepGoingOff: 'نفدت الحصة الشهرية، ولا تزال النماذج المضمّنة الأخرى تعمل',
        captionResetsIn: duration => `يُعاد التعيين خلال ${duration}`,
        captionIncluded: 'الاستخدام المضمّن',
        valueUsed: percent => `استُخدم ${percent}`
      }
    },
    planCard: {
      freeTier: 'مجانية',
      chooseAction: 'اختيار ↗',
      adjustPlanAction: 'تعديل الخطة ↗',
      unavailableCaption: 'تفاصيل الاشتراك غير متاحة، لكن لا يزال بإمكانك فتح البوابة.',
      downgradeCaption: (tierName, when) => `تتغير إلى ${tierName} في ${when}.`,
      cancellationCaption: when => `تُلغى في ${when}.`,
      renewsCaption: date => `تتجدد في ${date}`,
      noSubscriptionCaption: 'لا يوجد اشتراك نشط — تستهلك النماذج المدفوعة رصيد التعبئة.'
    }
  },
  errors: {
    consentRequired: {
      title: 'يلزم تأكيد البطاقة',
      message: 'أكّد هذه البطاقة لعمليات الدفع من الطرفية في البوابة'
    },
    insufficientScope: {
      title: 'يحتاج الإنفاق عن بُعد إلى موافقة',
      message: 'يتطلب هذا السماح بالإنفاق عن بُعد. ابدأ تعبئة للسماح به، ثم أعد المحاولة.'
    },
    remoteSpendingRevoked: {
      title: 'أُوقف الإنفاق عن بُعد',
      messageByAdmin: 'أوقف أحد المسؤولين الإنفاق عن بُعد لهذه الطرفية.',
      messageBySelf: 'لقد أوقفت الإنفاق عن بُعد لهذه الطرفية.'
    },
    remoteSpendingReconnect: who => `${who} أعد الاتصال من الإعدادات ← البوابات لإعادة تفويض هذا الجهاز.`,
    sessionRevoked: {
      title: 'سُجّل الخروج من الجلسة',
      message: 'سُجّل خروج جلستك. سجّل الدخول مجددًا من الإعدادات ← البوابات.'
    },
    cliBillingDisabled: {
      title: 'الإنفاق عن بُعد متوقف',
      message: 'الإنفاق عن بُعد متوقف لهذا الحساب — يمكن لمسؤول الفوترة تشغيله من صفحة Hermes Agent في البوابة.'
    },
    roleRequired: {
      title: 'يلزم دور المسؤول',
      message: 'تتطلب إضافة الأموال مسؤولًا أو مالكًا للمؤسسة. اطلب ذلك من أحد المسؤولين، أو أدِر الأمر من البوابة.'
    },
    idempotencyConflict: {
      title: 'ابدأ تعبئة جديدة',
      message: '🔴 استُخدم مفتاح عملية الدفع هذا من قبل لمبلغ مختلف. ابدأ تعبئة جديدة.'
    },
    noPaymentMethod: {
      title: 'لا توجد بطاقة محفوظة',
      message:
        '💳 لا توجد بعد بطاقة محفوظة لعمليات الدفع من الطرفية. أضف بطاقة في البوابة ' +
        '(شراء الرصيد لمرة واحدة لا يحفظ بطاقة قابلة لإعادة الاستخدام).'
    },
    orgAccessDenied: {
      title: 'رُفض الوصول إلى المؤسسة',
      message: 'رمز الوصول هذا غير مرتبط بمؤسسة يمكنك إدارتها'
    },
    monthlyCapExceeded: {
      title: 'تم بلوغ حد الإنفاق الشهري',
      messageReached: '🔴 تم بلوغ حد الإنفاق الشهري.',
      messageHeadroom: remaining => `🔴 تم بلوغ حد الإنفاق الشهري — يتبقى هامش قدره $${remaining}.`
    },
    rateLimited: {
      title: 'عمليات دفع كثيرة جدًا الآن',
      message: mins =>
        mins > 0
          ? `🟡 عمليات دفع كثيرة جدًا الآن (أعد المحاولة ${aboutMinutes(mins)}). هذا ليس فشلًا في الدفع.`
          : '🟡 عمليات دفع كثيرة جدًا الآن. هذا ليس فشلًا في الدفع.'
    },
    stripeUnavailable: {
      title: 'تواجه Stripe مشكلة',
      message: mins =>
        mins > 0
          ? `تواجه Stripe مشكلة — أعد المحاولة ${aboutMinutes(mins)}`
          : 'تواجه Stripe مشكلة — أعد المحاولة بعد قليل'
    },
    upgradeCapExceeded: {
      title: 'تم بلوغ الحد اليومي لتغيير الخطة',
      message: 'تم بلوغ الحد اليومي لتغيير الخطة — أعد المحاولة غدًا'
    },
    endpointUnavailable: {
      title: 'نقطة نهاية الفوترة غير متاحة',
      message: 'أعادت نقطة نهاية الفوترة استجابة ليست بصيغة JSON (ربما لا تتوفر في هذا النشر).'
    },
    timeout: {
      title: 'انتهت مهلة طلب الفوترة',
      message: 'انتهت مهلة طلب الفوترة.'
    },
    transport: {
      title: 'فشل الاتصال بخدمة الفوترة',
      message: 'فشل طلب الفوترة قبل وصوله إلى البوابة.'
    },
    default: {
      title: 'فشل طلب الفوترة',
      message: 'فشل طلب الفوترة.'
    }
  }
}
