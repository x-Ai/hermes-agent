import { arBilling } from './ar_billing'
import { arCustomEndpoints } from './ar_custom_endpoints'
import { arDelegationRouting } from './ar_delegation_routing'
import { arLocalModels } from './ar_local_models'
import { arMemoryLayers } from './ar_memory_layers'
import { AR_PLURAL } from './ar_plural'
import { arFieldDescriptions, arFieldLabels } from './ar_settings_fields'
import { arUninstallSection } from './ar_uninstall_section'
import { arUpdateChannel } from './ar_update_channel'
import type { TranslationOverrides } from './define-locale'

export const arSettings = {
  language: {
    label: 'اللغة',
    description: 'اختر لغة واجهة تطبيق سطح المكتب.',
    saving: 'جارٍ حفظ اللغة…',
    saveError: 'تعذّر تحديث اللغة',
    switchTo: 'تغيير اللغة',
    searchPlaceholder: 'ابحث عن لغة…',
    noResults: 'لا توجد لغة مطابقة'
  },
  settings: {
    billing: arBilling,
    closeSettings: 'إغلاق الإعدادات',
    exportConfig: 'تصدير الإعدادات',
    importConfig: 'استيراد الإعدادات',
    resetToDefaults: 'استعادة الإعدادات الافتراضية',
    resetConfirm: 'هل تريد إعادة كل الإعدادات إلى قيم Hermes الافتراضية؟',
    exportFailed: 'فشل التصدير',
    resetFailed: 'فشلت إعادة الضبط',
    pluginPages: {
      blurb: 'خيارات تضيفها الإضافات المثبّتة. لكل إضافة صفحتها الخاصة، وبعضها يضيف صفحات فرعية.',
      empty: 'لا توجد إضافة لها إعدادات بعد.',
      manage: 'إدارة الإضافات',
      agentSettings: 'إعدادات الوكيل',
      pageCount: (n: number) =>
        AR_PLURAL(n, { one: 'صفحة واحدة', two: 'صفحتان', few: `${n} صفحات`, many: `${n} صفحة` }),
      missing: 'هذه الإضافة ليس لها صفحة إعدادات. ربما عُطّلت أو أُزيلت.'
    },
    nav: {
      providers: 'المزوّدون',
      providerAccounts: 'الحسابات',
      providerApiKeys: 'مفاتيح API',
      providerCustomEndpoints: 'نقاط النهاية المخصصة',
      providerLocalModels: 'النماذج المحلية',
      gateway: 'البوابات',
      apiKeys: 'الأدوات والمفاتيح',
      keybinds: 'اختصارات لوحة المفاتيح',
      keysTools: 'الأدوات',
      keysSettings: 'الإعدادات',
      mcp: 'MCP',
      archivedChats: 'المحادثات المؤرشفة',
      sessions: 'الجلسات',
      about: 'حول',
      billing: 'الفوترة',
      notifications: 'الإشعارات',
      vault: 'كلمات المرور وتسجيلات الدخول',
      plugins: 'الإضافات'
    },
    plugins: {
      title: 'إضافات سطح المكتب',
      openFolder: 'فتح مجلد إضافات سطح المكتب',
      rescan: 'إعادة الفحص',
      reveal: 'إظهار في مدير الملفات',
      failed: 'فشل',
      kinds: {
        bundled: 'مضمّنة',
        disk: 'على القرص',
        runtime: 'وقت التشغيل'
      },
      installModal: {
        installFromGit: 'التثبيت من Git',
        reviewRepository: 'مراجعة المستودع',
        repoPlaceholder: 'https://github.com/owner/repo',
        title: 'تثبيت إضافة',
        description: 'راجع محتوى هذا المستودع قبل تثبيت أي شيء.',
        repoLabel: 'المستودع',
        includesHeading: 'تتضمن هذه الحزمة',
        agentLabel: 'إضافة الوكيل',
        desktopLabel: 'واجهة تطبيق سطح المكتب',
        agentTargetLocal: (profile, dir) => `تُثبَّت في الواجهة الخلفية للملف الشخصي ${profile} (${dir})`,
        agentTargetRemote: profile => `تُثبَّت في الواجهة الخلفية المتصلة للملف الشخصي ${profile}`,
        restartToApply: 'أعد تشغيل البوابة لتفعيل الإضافة.',
        restartNow: 'إعادة تشغيل البوابة',
        missingEnvAction: 'إعداد المفتاح',
        alreadyInstalled: (name: string) => `الإضافة ${name} مثبّتة بالفعل.`,
        desktopTarget: 'تُثبَّت في مجلد إضافات سطح المكتب المحلي لهذا التطبيق',
        desktopTargetFromPackage: 'تُحمَّل في هذا التطبيق من الحزمة أعلاه — وهي نفسها في كل الملفات الشخصية',
        desktopOnlyNote: 'الحزم المخصصة لتطبيق سطح المكتب وحده لا تثبّت إضافة وكيل في الواجهة الخلفية.',
        insecureWarning:
          'يستخدم هذا العنوان بروتوكولًا غير آمن أو محليًا. يُفضَّل https:// أو git@ لعمليات التثبيت الفعلية.',
        securityIntro: 'ثبّت من مصادر تثق بها فقط — راجع المستودع أدناه إن أردت معرفة ما ستتم إضافته.',
        sourceHeading: 'الشيفرة المصدرية',
        viewRepository: 'عرض المستودع',
        viewPluginFiles: 'عرض ملفات الإضافة',
        enableAgent: 'تفعيل إضافة الوكيل بعد التثبيت',
        forceReinstall: 'فرض إعادة التثبيت (استبدال النسخة المثبّتة إن وُجدت)',
        pinToCommit: 'التثبيت عند إيداع محدد (اختياري)',
        pinToCommitPlaceholder: 'SHA كامل للإيداع من 40 حرفًا',
        pinToCommitHint:
          'كل من يثبّت هذا الـ SHA يحصل على الشيفرة نفسها؛ ثم ترفض الإضافة التحديثات إلى أن تُثبَّت عند إيداع آخر. اتركه فارغًا لاستخدام أحدث إيداع.',
        pinToCommitInvalid: 'يجب إدخال SHA كامل للإيداع من 40 حرفًا (لا تُقبل أسماء الفروع ولا الوسوم).',
        install: 'تثبيت',
        installing: 'جارٍ التثبيت…',
        probing: 'جارٍ فحص المستودع…',
        probeUnavailable: 'فحص الإضافات غير متاح في هذه البيئة.',
        desktopUnavailable: 'تثبيت إضافات سطح المكتب غير متاح في هذه البيئة.',
        selectComponent: 'حدد مكونًا واحدًا على الأقل لتثبيته.',
        agentSuccess: name => `تم تثبيت إضافة الوكيل ${name}`,
        desktopSuccess: name => `تم تثبيت إضافة سطح المكتب ${name}`,
        agentFailed: 'فشل تثبيت إضافة الوكيل',
        desktopFailed: 'فشل تثبيت إضافة سطح المكتب',
        missingEnv: (name, vars) =>
          `الإضافة ${name} مثبّتة لكنها تحتاج إلى مفتاح قبل أن تعمل: ${vars}. أضِفه الآن، وإلا ستفشل أدوات الإضافة.`,
        profileLabel: 'تثبيت للملف الشخصي',
        installUncertain:
          'توقف Hermes عن انتظار نتيجة التثبيت، لكن قد يكون تثبيت الإضافة ما زال جاريًا. أغلق هذه النافذة واستخدم «إعادة الفحص» في الإضافات قبل محاولة «تثبيت» مرة أخرى.',
        nextChat: 'أدوات أخرى ستتوفر في محادثتك التالية',
        serverNotConnected: (server, reason) => `خادم MCP ${server} غير متصل${reason ? `: ${reason}` : '.'}`,
        verified: 'موثّق',
        unverified: 'غير موثّق',
        reviewedByNous: 'راجعته Nous.',
        installsAndEnables: profile => `تُثبَّت للملف الشخصي ${profile} وتُفعَّل فورًا.`,
        installsOnly: profile => `تُثبَّت للملف الشخصي ${profile}.`,
        advanced: 'متقدم',
        versionLabel: 'الإصدار',
        reviewedPin: sha => (sha ? `الإصدار المثبّت المراجَع ${sha}` : 'الإصدار المثبّت المراجَع'),
        latestCommit: 'أحدث إيداع',
        nothingToInstall: 'لا تحتوي هذه الحزمة على ما يُثبَّت هنا.',
        skillsReady: names =>
          AR_PLURAL(names.length, {
            one: `المهارة ${names[0]} جاهزة`,
            two: 'مهارتان جاهزتان',
            few: `${names.length} مهارات جاهزة`,
            many: `${names.length} مهارة جاهزة`
          }),
        toolsConnected: n =>
          AR_PLURAL(n, {
            one: 'تم توصيل أداة واحدة',
            two: 'تم توصيل أداتين',
            few: `تم توصيل ${n} أدوات`,
            many: `تم توصيل ${n} أداة`
          }),
        partialInstall: sha =>
          sha
            ? `لم يُثبَّت سوى جزء من هذه الإضافة: جزء الوكيل مثبَّت عند الإيداع ${sha}، لكن جزء سطح المكتب لم يتمكن من اللحاق به لأن المستودع تغيّر منذ مراجعتك له. فعّل فرض إعادة التثبيت ضمن «متقدم» لاستبدال الجزأين بالإصدار المعروض، أو ألغِ للإبقاء على جزء الوكيل وحده.`
            : 'لم يُثبَّت سوى جزء من هذه الإضافة: جزء الوكيل مثبَّت، لكن جزء سطح المكتب لم يتمكن من اللحاق به لأن المستودع تغيّر منذ مراجعتك له. فعّل فرض إعادة التثبيت ضمن «متقدم» لاستبدال الجزأين بالإصدار المعروض، أو ألغِ للإبقاء على جزء الوكيل وحده.',
        installAnyway: 'التثبيت على أي حال',
        legacyBackendConfirm:
          'هذه الواجهة الخلفية أقدم من هذا التطبيق، لذا لا يمكنها ضمان أن يكون الإصدار الذي راجعته هو ما سيُثبَّت: إذا تغيّر المستودع منذ ذلك الحين، فسيُثبَّت الإصدار الأحدث بدلًا منه. حدّث الواجهة الخلفية للحصول على هذا الضمان.',
        sourceMoved: sha =>
          sha
            ? `تغيّر المستودع منذ مراجعتك له. راجع الإصدار الجديد (الإيداع ${sha}) قبل تثبيته.`
            : 'تغيّر المستودع منذ مراجعتك له. جارٍ قراءة الإصدار الجديد…'
      }
    },
    vault: {
      title: 'كلمات المرور وتسجيلات الدخول',
      blurb:
        'قل «سجّل الدخول إلى GitHub» وسيقوم الوكيل بذلك نيابةً عنك. في أول مرة يصادف صفحة تسجيل دخول يطلب منك بيانات الدخول في مكانها، وبعدها يعمل تلقائيًا. تُشفَّر كلمات المرور على هذا الجهاز وتُملأ في الصفحة مباشرة — ولا يراها النموذج أبدًا.',
      count: n =>
        AR_PLURAL(n, {
          one: 'عنصر واحد محفوظ',
          two: 'عنصران محفوظان',
          few: `${n} عناصر محفوظة`,
          many: `${n} عنصرًا محفوظًا`,
          other: `${n} عنصر محفوظ`
        }),
      loadFailed: 'تعذّر تحميل عناصر الخزنة',
      empty: 'لا شيء محفوظ بعد',
      emptyDesc:
        'لا حاجة لإضافة أي شيء هنا. اطلب من الوكيل تسجيل الدخول إلى موقع وسيطلب منك بيانات الدخول مرة واحدة في مكانها. استخدم «إضافة» إذا كنت تفضّل إدخالها مسبقًا.',
      add: 'إضافة',
      addTitle: 'إضافة بيانات دخول أو بطاقة أو عنوان',
      addDescription: 'تُخزَّن مشفّرة على هذا الجهاز. لا يرى الوكيل كلمة المرور أبداً.',
      added: 'تم الحفظ.',
      adding: 'جارٍ الحفظ…',
      addConfirm: 'حفظ',
      kindField: 'النوع',
      kinds: {
        login: 'تسجيل دخول',
        payment: 'بطاقة دفع',
        address: 'عنوان'
      },
      labelField: 'التسمية',
      labelPlaceholder: 'مثال: حساب GitHub للعمل',
      labelRequired: 'التسمية مطلوبة.',
      originField: 'أصل الموقع',
      originPlaceholder: 'https://github.com',
      originPlaceholderCheckout: 'https://shop.example.com',
      originInvalid: 'أدخل عنوان URL صالحاً مثل https://example.com.',
      identifierTypeField: 'نوع المعرّف',
      identifierTypes: {
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        username: 'اسم المستخدم'
      },
      identifierField: 'المعرّف',
      identifierShown: identifier => identifier,
      passwordField: 'كلمة المرور',
      loginFieldsRequired: 'المعرّف وكلمة المرور مطلوبان.',
      cardNumberField: 'رقم البطاقة',
      cardNameField: 'الاسم على البطاقة',
      expMonthField: 'شهر الانتهاء',
      expYearField: 'سنة الانتهاء',
      cvcField: 'CVC',
      postalField: 'الرمز البريدي',
      addressLine1Field: 'سطر العنوان 1',
      addressLine2Field: 'سطر العنوان 2',
      cityField: 'المدينة',
      stateField: 'الولاية / المنطقة',
      countryField: 'الدولة',
      optional: '(اختياري)',
      createdOn: date => `أُضيف في ${date}`,
      deleteAction: 'إزالة العنصر المحفوظ',
      otpField: 'مفتاح المصادقة',
      otpPlaceholder: 'سر Base32 أو رابط otpauth://',
      otpHint: '«مفتاح الإعداد» الذي يعرضه الموقع عند تفعيل المصادقة الثنائية. بحفظه يولّد Hermes الرموز بنفسه.',
      twoFactorBadge: '2FA تلقائي',
      deleteTitle: 'حذف هذا العنصر؟',
      deleteDescription: label => `سيُزال «${label}». لا يمكن التراجع عن هذا.`,
      deleteConfirm: 'حذف',
      sources: {
        title: 'مديرو كلمات المرور',
        blurb:
          'يكتشف Hermes مديري كلمات المرور المثبّتة تلقائيًا. يطلب منك الوكيل فتح أحدها في أول مرة يحتاج فيها إلى بيانات دخول منه (مرة واحدة لكل جلسة)؛ يبقى في الذاكرة رمز الجلسة فقط، ولا يرى الوكيل كلمة المرور الرئيسية أو أي بيانات دخول.',
        toggleFailed: 'تعذّر تحديث مدير كلمات المرور',
        notInstalled: name => `غير مكتشف. ثبّت أداة سطر الأوامر ${name} وسجّل الدخول إليها؛ سيكتشفها Hermes تلقائيًا.`,
        disabledDesc: 'مكتشف لكنه معطّل لـ Hermes.',
        lockedDesc: 'مكتشف. سيطلب منك الوكيل فتحه عند الحاجة إلى بيانات دخول، أو افتحه الآن.',
        unlockedDesc: 'مفتوح لهذه الجلسة. يُقفل تلقائيًا بعد 30 دقيقة من الخمول أو عند إغلاق Hermes.',
        statusLocked: 'مقفل',
        statusNotDetected: 'غير مكتشف',
        statusOff: 'معطّل',
        statusUnlocked: 'مفتوح',
        unlock: 'فتح القفل',
        unlocking: 'جارٍ فتح القفل…',
        lock: 'قفل',
        unlocked: name => `تم فتح قفل ${name} لهذه الجلسة.`,
        unlockTitle: name => `فتح قفل ${name}`,
        unlockDescription:
          'أدخل كلمة المرور الرئيسية. تُسلَّم إلى مدير كلمات المرور على هذا الجهاز ثم تُهمل — لا تُخزَّن ولا تُسجَّل ولا تُعرض على الوكيل أبدًا.',
        masterPasswordPlaceholder: 'كلمة المرور الرئيسية'
      }
    },
    notifications: {
      title: 'الإشعارات',
      intro: 'إشعارات نظام التشغيل (وليست التنبيهات داخل التطبيق). لكل جهاز إعداداته الخاصة.',
      enableAll: 'تفعيل الإشعارات',
      enableAllDesc: 'عند التعطيل تُكتم كل الإشعارات أدناه.',
      focusedHint: 'تنبيهات الاكتمال تظهر فقط عندما يكون Hermes في الخلفية.',
      kinds: {
        approval: {
          label: 'موافقة مطلوبة',
          description: 'هناك أمر ينتظر موافقتك أو رفضك له.'
        },
        input: {
          label: 'إدخال مطلوب',
          description: 'طرح Hermes سؤالًا أو يحتاج إلى كلمة مرور أو سر.'
        },
        turnDone: {
          label: 'الرد جاهز',
          description: 'انتهى دور بينما كان Hermes في الخلفية.'
        },
        turnError: {
          label: 'فشل الدور',
          description: 'أخطاء الأدوار في الخلفية.'
        },
        backgroundDone: {
          label: 'اكتملت مهمة في الخلفية',
          description: 'اكتمل أمر طرفية يعمل في الخلفية.'
        },
        credits: {
          label: 'تنبيهات الرصيد',
          description: 'عند إيقاف الوصول إلى الرصيد مؤقتًا أو استعادته.'
        },
        plugin: {
          label: 'إشعارات الإضافات',
          description: 'أرسلت إحدى إضافات سطح المكتب إشعارًا بينما كان Hermes في الخلفية.'
        }
      },
      browserPermission: {
        title: 'إشعارات المتصفح',
        allow: 'السماح',
        states: {
          default:
            'اسمح بعرض التنبيهات من هذا المتصفح عندما تكون علامة التبويب في الخلفية. وإلى أن تسمح بذلك، لن يومض سوى عنوان علامة التبويب.',
          granted: 'مسموح. تظهر التنبيهات عندما تكون علامة التبويب هذه في الخلفية، ويومض عنوانها أيضًا.',
          denied: 'محظور في إعدادات الموقع لهذا المتصفح. سيظل عنوان علامة التبويب يومض.',
          insecure: 'يتطلب HTTPS، مثل Tailscale serve. عبر HTTP العادي يومض عنوان علامة التبويب فقط.',
          unsupported: 'لا يستطيع هذا المتصفح عرض الإشعارات. سيظل عنوان علامة التبويب يومض.'
        }
      },
      test: 'إرسال إشعار تجريبي',
      testTitle: 'Hermes',
      testBody: 'الإشعارات تعمل.',
      testSent: 'تم إرسال التجربة. إذا لم يظهر شيء، تحقق من أذونات الإشعارات في نظام التشغيل ووضع التركيز/عدم الإزعاج.',
      testUnsupported: 'لا يدعم هذا النظام إشعارات نظام التشغيل.',
      muteSoundsTitle: 'كتم أصوات الواجهة',
      muteSoundsDesc:
        'يكتم تنبيهات الاكتمال وكلمة التنبيه والتفكير التلقائية والاستجابة اللمسية وأصوات إشعارات النظام. تظل معاينات الصوت والردود المنطوقة مسموعة.',
      completionSoundTitle: 'صوت الاكتمال',
      completionSoundDesc: 'يُشغَّل عند انتهاء دور الوكيل. اختر صوتًا جاهزًا واستمع إليه هنا.',
      completionSoundPreview: 'معاينة'
    },
    memoryProvider: {
      loadFailed: detail => `تعذّر تحميل إعدادات مزوّد الذاكرة: ${detail}`,
      loadFailedFallback: 'تعذّر تحميل إعدادات مزوّد الذاكرة',
      loading: 'جارٍ تحميل إعدادات مزوّد الذاكرة…',
      settingsTitle: label => `إعدادات ${label}`,
      fieldSet: label => `${label} مضبوط`,
      fieldNotSet: label => `${label} غير مضبوط`,
      fullConfig: 'الإعداد الكامل…',
      fullConfigTitle: label => `${label} — الإعداد الكامل`,
      fullConfigDescription: (label, profile) =>
        `جميع خيارات ${label} للملف الشخصي ${profile}. تأخذ الحقول الفارغة القيمة الفعلية للمضيف أو القيمة الافتراضية المدمجة.`,
      reference: label => `مرجع إعداد ${label}`,
      otherGroup: 'أخرى',
      saveChanges: 'حفظ التغييرات',
      fieldAbout: label => `حول ${label}`,
      leaveBlankToKeep: 'اتركه فارغاً للاحتفاظ بالقيمة الحالية',
      valueSet: 'مضبوط',
      connectionStartFailed: 'تعذّر بدء الاتصال.',
      connectionTimedOut: 'انتهت مهلة الاتصال — حاول مجدداً.',
      connectionFailed: 'فشل الاتصال.',
      connectViaOAuth: 'الاتصال عبر OAuth',
      reconnect: 'إعادة الاتصال',
      connect: 'اتصال',
      apiKeySet: 'تم ضبط مفتاح API',
      oauthSet: 'تم ضبط OAuth',
      waitingForConsent: 'بانتظار موافقتك في المتصفح…',
      saved: label => `تم حفظ إعدادات ${label}`,
      updated: 'تم تحديث إعدادات مزوّد الذاكرة.',
      saveFailed: label => `تعذّر حفظ إعدادات ${label}`
    },
    sections: {
      model: 'النموذج',
      chat: 'المحادثة',
      appearance: 'المظهر',
      workspace: 'مساحة العمل',
      safety: 'الأمان',
      memory: 'الذاكرة والسياق',
      voice: 'الصوت',
      advanced: 'متقدم',
      browser: 'المتصفح'
    },
    searchPlaceholder: {
      about: 'حول Hermes Desktop',
      config: 'ابحث في الإعدادات...',
      gateway: 'اتصال البوابة...',
      keys: 'ابحث في مفاتيح API...',
      mcp: 'ابحث في خوادم MCP...',
      sessions: 'ابحث في الجلسات المؤرشفة...'
    },
    modeOptions: {
      light: {
        label: 'فاتح',
        description: 'أسطح فاتحة وساطعة'
      },
      dark: {
        label: 'داكن',
        description: 'مساحة عمل منخفضة الوهج'
      },
      system: {
        label: 'النظام',
        description: 'اتباع مظهر نظام التشغيل'
      }
    },
    appearance: {
      chatTextScaleTitle: 'حجم نص المحادثة',
      chatTextScaleDesc:
        'يضبط حجم نص المحادثة ومحرر الرسائل نسبةً إلى مقياس الواجهة. يبقى حجم الأشرطة الجانبية وعناصر التحكم كما هو.',
      title: 'المظهر',
      intro: 'لتطبيق سطح المكتب فقط. الوضع يحدد السطوع، والسمة تحدد لوحة الألوان وإطار المحادثة.',
      themeSearchPlaceholder: 'ابحث في سماتك أو VS Code Marketplace…',
      noInstalledThemeMatches: query => `لا توجد سمة مثبّتة تطابق «${query}».`,
      marketplaceThemeSource: 'من VS Code Marketplace',
      colorMode: 'نمط الألوان',
      colorModeDesc: 'اختر وضعًا ثابتًا أو دع Hermes يتبع إعداد نظامك.',
      toolViewTitle: 'عرض استدعاءات الأدوات',
      toolViewDesc: '«مبسّط» يخفي بيانات الأدوات الخام؛ «تقني» يعرض المدخلات والمخرجات كاملة.',
      reasoningCollapsedTitle: 'طي التفكير افتراضيًا',
      reasoningCollapsedDesc: 'يبقى الاستدلال المتدفق متاحًا لكنه يظل مطويًا حتى تفتحه.',
      uiScaleTitle: 'مقياس واجهة المستخدم',
      uiScaleDesc: (percent: number) =>
        `يغيّر حجم النص وعناصر التحكم في التطبيق كله. يمكنك أيضًا استخدام Cmd/Ctrl مع + أو - أو 0. الحالي: ${percent}%.`,
      sessionDensityTitle: 'كثافة قائمة الجلسات',
      sessionDensityDesc: 'اختر مقدار السياق الذي يظهر أسفل عناوين الجلسات في الشريط الجانبي.',
      sessionDensityCompact: 'مدمج',
      sessionDensityComfortable: 'مريح',
      sessionDensityDetailed: 'مفصّل',
      tabStripTitle: 'شريط علامات التبويب',
      tabStripDesc:
        'يُظهر علامات التبويب أعلى كل منطقة. يخفيها «تلقائي» عند وجود جزء واحد فقط، ما لم تُفتح منطقة محادثة أو منطقة لوحات أخرى.',
      tabStripAuto: 'تلقائي',
      tabStripAlways: 'دائمًا',
      tabStripNever: 'أبدًا',
      appActionsTitle: 'إجراءات التطبيق',
      appActionsDesc:
        'موضع أزرار الإعدادات والتخطيط وHUD في شريط العنوان. يترك خيار «يمين» مساحة لعلامات التبويب على اليسار.',
      appActionsLeft: 'يسار',
      appActionsRight: 'يمين',
      terminalFontTitle: 'خط الطرفية',
      terminalFontDesc:
        'اختر خطًا مثبّتًا لطرفيات تطبيق سطح المكتب. تعرض خطوط Nerd Fonts أيقونات Powerlevel10k وأيقونات الصدفة؛ اتركه فارغًا لاستخدام خط JetBrains Mono المضمّن.',
      terminalFontPlaceholder: 'MesloLGS NF أو سلسلة خطوط CSS',
      terminalFontPreview: 'معاينة المحارف',
      terminalFontReset: 'استخدام الافتراضي',
      translucencyTitle: 'شفافية النافذة',
      translucencyDesc: 'يظهر سطح المكتب عبر النافذة كلها، بما فيها النص. يُضبط بشكل منفصل للوضعين الفاتح والداكن.',
      translucencyGlassDesc:
        'زجاج غير لامع: يظهر سطح المكتب من خلفه كضبابية ناعمة بينما يبقى النص واضحًا. يُضبط بشكل منفصل للوضعين الفاتح والداكن.',
      translucencyModeClear: 'شفاف',
      translucencyModeGlass: 'زجاج',
      translucencyTintTitle: 'التلوين',
      translucencyFadeTitle: 'التلاشي',
      translucencyFrostTitle: 'نوع الضبابية',
      translucencyFrost: {
        'under-window': 'عميق',
        popover: 'ناعم',
        titlebar: 'ساطع',
        header: 'متوهج'
      },
      translucencyScopeTitle: 'النطاق',
      translucencyScope: {
        window: 'النافذة كاملة',
        sidebar: 'الشريط الجانبي فقط'
      },
      backdropTitle: 'خلفية المحادثة',
      backdropDesc: 'صورة التمثال الباهتة خلف المحادثة.',
      userBubbleTitle: 'فقاعة الرسالة',
      userBubbleDesc: 'مدى شفافية رسائلك. معتمة عند 0؛ يبقى الإطار فقط عند 100.',
      textDirectionTitle: 'اتجاه النص',
      textDirectionDesc:
        'كيف تحدد رسائل المحادثة وحقل الكتابة اتجاهها. «تلقائي» يتبع أول حرف في كل فقرة؛ اختر اتجاهًا عندما يظهر النص المختلط بترتيب خاطئ. تبقى الشيفرة دائمًا من اليسار إلى اليمين.',
      textDirection: { auto: 'تلقائي', rtl: 'من اليمين إلى اليسار', ltr: 'من اليسار إلى اليمين' },
      introSplashTitle: 'شاشة المقدمة',
      introSplashDesc: 'الشعار النصي والعبارة التمهيدية في محادثة فارغة.',
      modelPricingTitle: 'أسعار النماذج',
      modelPricingDesc: 'عرض أسعار الإدخال والإخراج وقراءة ذاكرة التخزين المؤقت لكل مليون رمز في منتقي النماذج.',
      reactionsTitle: 'تفاعلات الرسائل',
      reactionsDesc: 'تفاعلات إيموجي بأسلوب iMessage — تفاعل مع الرسائل، ويمكن لـ Hermes التفاعل مع رسائلك.',
      tipsTitle: 'نصائح داخل التطبيق',
      tipsDesc:
        'نصائح تظهر أحيانًا من التطبيق وHermes. تظهر كل نصيحة مرة واحدة. تُعطّل تلقائيًا بعد أول 30 يومًا من الاستخدام، ويمكنك تفعيلها مجددًا.',
      tipsReset: count =>
        AR_PLURAL(count, {
          one: 'إظهار نصيحة واحدة مرة أخرى',
          two: 'إظهار نصيحتين مرة أخرى',
          few: `إظهار ${count} نصائح مرة أخرى`,
          many: `إظهار ${count} نصيحة مرة أخرى`
        }),
      toursTitle: 'جولات إرشادية',
      toursDesc:
        'دع Hermes يرشدك في التطبيق مع إبراز كل خطوة. تُعطّل الجولات تلقائيًا بعد أول 30 يومًا من الاستخدام، ويمكنك تفعيلها مجددًا.',
      composerPopoutTitle: 'محرر عائم',
      composerPopoutDesc: 'السماح بسحب محرر الرسائل خارج موضعه. عند إيقاف الخيار، يبقى مثبتًا في الأسفل.',
      fileBrowserTitle: 'مستعرض الملفات',
      fileBrowserDesc: 'عرض مستعرض الملفات بجانب المحادثة عند فتح مساحة عمل. يغيّر زر شريط العنوان هذا الخيار أيضًا.',
      vibeHeartsTitle: 'قلوب المزاج',
      vibeHeartsDesc:
        'قلوب عائمة عندما تكتب «thanks» أو «ily» أو «good bot» أو ترسل قلبًا. منفصلة عن «تفاعلات الرسائل» أعلاه.',
      embedsTitle: 'المحتوى المضمّن',
      embedsDesc:
        'تُحمَّل المعاينات الغنية من مواقع خارجية (YouTube وX…). «اسأل» يعرض عنصرًا نائبًا حتى تسمح بكل واحدة منها؛ «دائمًا» يحمّلها تلقائيًا؛ «إيقاف» يُبقي الروابط عادية.',
      embedsAsk: 'اسأل',
      embedsAlways: 'دائمًا',
      embedsOff: 'إيقاف',
      embedsReset: count =>
        AR_PLURAL(count, {
          one: 'إعادة تعيين خدمة واحدة مسموح بها',
          two: 'إعادة تعيين خدمتين مسموح بهما',
          few: `إعادة تعيين ${count} خدمات مسموح بها`,
          many: `إعادة تعيين ${count} خدمة مسموح بها`
        }),
      resumeLastSessionTitle: 'إعادة فتح آخر محادثة عند التشغيل',
      resumeLastSessionDesc:
        'عند التفعيل، يعيد التطبيق فتح أحدث محادثاتك عند تشغيله من جديد. عطّله لتبدأ دائمًا بمحادثة جديدة.',
      product: 'مبسّط',
      productDesc: 'نشاط الأدوات بصياغة سهلة الفهم مع ملخصات موجزة.',
      technical: 'تقني',
      technicalDesc: 'يتضمن وسائط الأدوات ونتائجها الخام والتفاصيل منخفضة المستوى.',
      themeTitle: 'السمة',
      themeDesc: 'لوحات ألوان تطبيق سطح المكتب فقط. يُطبَّق الوضع المحدد فوقها.',
      themeProfileNote: profile => `محفوظة للملف الشخصي ${profile} — لكل ملف شخصي سمته الخاصة.`,
      installTitle: 'التثبيت من VS Code',
      installDesc:
        'الصق معرّف امتداد من Marketplace (مثلًا dracula-theme.theme-dracula) لتحويل سمة ألوانه إلى لوحة ألوان لتطبيق سطح المكتب.',
      installPlaceholder: 'publisher.extension',
      installButton: 'تثبيت',
      installing: 'جارٍ التثبيت…',
      installError: 'تعذّر تثبيت هذه السمة.',
      installed: name => `تم تثبيت «${name}».`,
      removeTheme: 'إزالة السمة',
      importedBadge: 'مستوردة',
      pet: {
        title: 'الحيوان الأليف',
        intro:
          'تبنَّ تميمة petdex متحركة تطفو فوق التطبيق وتتفاعل مع ما يفعله Hermes — تجري أثناء تنفيذ الأدوات، وتحتفل عند النجاح، وتعبس عند الأخطاء.',
        restartHint:
          'تحتاج الحيوانات الأليفة إلى إعادة تشغيل سريعة — بدأ التطبيق العامل قبل إضافة هذه الميزة. أغلق Hermes وأعد فتحه، ثم ارجع إلى هنا.',
        on: 'مفعّل',
        off: 'معطّل',
        scaleTitle: 'الحجم',
        scaleDesc: 'غيّر حجم التميمة العائمة. يُطبَّق في كل مكان فورًا.',
        roamTitle: 'التجوّل',
        roamDesc: 'دع الحيوان الأليف يتجول في النافذة بمفرده أثناء الخمول.',
        chooseTitle: 'اختر حيوانا أليفا',
        chooseDesc: 'اختياره يثبّته (إن لزم) ويجعله نشطا.',
        searchPlaceholder: 'البحث عن حيوانات أليفة…',
        unreachable: 'تعذّر الوصول إلى معرض petdex. تحقق من اتصالك وأعد فتح هذه الصفحة.',
        noMatch: query => `لا توجد حيوانات أليفة تطابق «${query}».`,
        installedTag: 'مثبّت',
        generatedTag: 'مُولّد',
        countCapped: (cap, total) => `عرض ${cap} من ${total} — اكتب لتضييق النتائج.`,
        count: n =>
          AR_PLURAL(n, {
            one: 'حيوان أليف واحد.',
            two: 'حيوانان أليفان.',
            few: `${n} حيوانات أليفة.`,
            many: `${n} حيوانًا أليفًا.`,
            other: `${n} حيوان أليف.`
          }),
        uninstall: name => `إلغاء تثبيت ${name}`,
        delete: name => `حذف ${name}`,
        deleteTitle: name => `حذف ${name}؟`,
        deleteBody: 'سيُحذف الحيوان الأليف نهائيًا — ولا يمكن إعادة تثبيته.',
        deleteConfirm: 'حذف',
        rename: name => `إعادة تسمية ${name}`,
        renameTitle: 'إعادة تسمية الحيوان الأليف',
        renamePlaceholder: 'سمِّ حيوانك الأليف',
        renameSave: 'حفظ',
        exportPet: name => `تصدير ${name}`,
        adoptFailed: slug => `تعذّر تبنّي ${slug}`,
        uninstallFailed: slug => `تعذّر إلغاء تثبيت ${slug}`,
        renameFailed: slug => `تعذّرت إعادة تسمية ${slug}`,
        exportFailed: slug => `تعذّر تصدير ${slug}`,
        noneAvailable: 'لا توجد حيوانات أليفة متاحة للتشغيل الآن.',
        turnOnFailed: 'تعذّر تشغيل الحيوان الأليف.',
        turnOffFailed: 'تعذّر إيقاف الحيوان الأليف.'
      },
      hideCodeDiffsTitle: 'إخفاء فروقات الشيفرة',
      hideCodeDiffsDesc: 'عرض تعديلات الملفات كصفوف أدوات ضمن المحادثة مع عدد الأسطر المضافة والمحذوفة، دون الشيفرة.',
      hideThreadTimelineTitle: 'إخفاء أشرطة خط زمن المحادثة',
      hideThreadTimelineDesc: 'إخفاء أشرطة التنقل على طول الحافة اليمنى لكل محادثة.',
      chatFontTitle: 'خط المحادثة',
      chatFontDesc:
        'اختر خطًا مثبّتًا للمحادثة وبقية التطبيق. مفيد للخطوط المصممة لتسهيل القراءة مثل OpenDyslexic؛ اتركه فارغًا لاستخدام خط السمة.',
      chatFontPlaceholder: 'OpenDyslexic أو سلسلة خطوط CSS',
      chatFontPreview: 'معاينة',
      chatFontSample: 'نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر ومغلف بجلد أزرق. 0123456789',
      chatFontReset: 'استخدام خط السمة'
    },
    fieldLabels: arFieldLabels,
    fieldDescriptions: arFieldDescriptions,
    about: {
      heading: 'Hermes Desktop',
      version: value => `الإصدار ${value}`,
      versionUnavailable: 'الإصدار غير متاح',
      bundleOutOfSync: 'إصدار التطبيق قديم',
      bundleOutOfSyncDesc:
        'تم تحديث بيئة تشغيل Hermes، لكن تطبيق سطح المكتب نفسه ما زال نسخة قديمة — لن تظهر ميزات الواجهة الجديدة (مثل وضع الروبوتات) حتى يُحدَّث التطبيق. شغّل التحديث أدناه لإعادة بناء التطبيق. وإن لم يختفِ هذا التحذير، فأعد التثبيت من أحدث مثبّت لتطبيق سطح المكتب.',
      bundleOutOfSyncAction: 'الحصول على المثبّت',
      bundleSwapPending: 'أعد التشغيل لإكمال التحديث',
      bundleSwapPendingDesc:
        'تم تثبيت التطبيق المحدَّث بالفعل — يكفي إعادة تشغيل Hermes لتحميله. لن تتأثر المحادثات أو الإعدادات.',
      bundleSwapPendingAction: 'إعادة تشغيل Hermes',
      updates: 'التحديثات',
      channel: arUpdateChannel,
      checkNow: 'التحقق الآن',
      checking: 'جارٍ التحقق…',
      seeWhatsNew: 'عرض الجديد',
      updateNow: 'تحديث الآن',
      releaseNotes: 'ملاحظات الإصدار',
      onLatest: 'أنت تستخدم أحدث إصدار.',
      installing: 'يجري الآن تثبيت تحديث.',
      cantUpdate: 'لا يمكن لهذه النسخة تحديث نفسها من داخل التطبيق.',
      cantReach: 'تعذّر الوصول إلى خادم التحديثات.',
      tapCheck: 'اضغط «التحقق الآن» للبحث عن تحديثات.',
      updateReady: count =>
        AR_PLURAL(count, {
          one: 'تحديث جديد جاهز (يتضمن تغييرًا واحدًا).',
          two: 'تحديث جديد جاهز (يتضمن تغييرين).',
          few: `تحديث جديد جاهز (يتضمن ${count} تغييرات).`,
          many: `تحديث جديد جاهز (يتضمن ${count} تغييرًا).`,
          other: `تحديث جديد جاهز (يتضمن ${count} تغيير).`
        }),
      updateReadyUnknown: 'تحديث جديد جاهز.',
      lastChecked: age => `آخر تحقق: ${age}`,
      automaticUpdates: 'التحديثات التلقائية',
      automaticUpdatesDesc: 'يتحقق Hermes من التحديثات تلقائيًا في الخلفية ويُعلمك عندما يصبح أحدها جاهزًا.',
      branchCommit: (branch, commit) => `الفرع ${branch} · الإيداع ${commit}`,
      never: 'لم يتم بعد',
      justNow: 'قبل لحظات',
      minAgo: count =>
        AR_PLURAL(count, {
          one: 'قبل دقيقة واحدة',
          two: 'قبل دقيقتين',
          few: `قبل ${count} دقائق`,
          many: `قبل ${count} دقيقة`
        }),
      hoursAgo: count =>
        AR_PLURAL(count, {
          one: 'قبل ساعة واحدة',
          two: 'قبل ساعتين',
          few: `قبل ${count} ساعات`,
          many: `قبل ${count} ساعة`
        }),
      daysAgo: count =>
        AR_PLURAL(count, {
          one: 'قبل يوم واحد',
          two: 'قبل يومين',
          few: `قبل ${count} أيام`,
          many: `قبل ${count} يومًا`,
          other: `قبل ${count} يوم`
        })
    },

    config: {
      minimizeToTrayTitle: 'التصغير إلى علبة النظام',
      minimizeToTrayDesc:
        'تصغير النوافذ أو إغلاق النافذة الرئيسية يخفيها في علبة النظام (شريط القوائم على macOS) مع استمرار Hermes في العمل. استخدم إنهاء Hermes من قائمة العلبة أو Cmd+Q للخروج. معطّل افتراضيًا ويُطبّق على هذا الجهاز فقط.',
      minimizeToTrayUnavailable:
        'علبة النظام غير متاحة. ستُصغّر النوافذ وتُغلق كالمعتاد. أوقف هذا الخيار ثم فعّله لإعادة المحاولة.',
      none: 'لا شيء',
      noneParen: '(لا شيء)',
      builtinOnly: 'مدمج فقط',
      notSet: 'غير مضبوط',
      commaSeparated: 'قيم مفصولة بفواصل',
      searchPlaceholder: 'بحث…',
      noResults: 'لا توجد نتائج',
      systemDefault: 'إعداد النظام الافتراضي',
      providerDefault: 'الإعداد الافتراضي للمزوّد',
      loading: 'جار تحميل إعدادات Hermes...',
      emptyTitle: 'لا توجد إعدادات',
      emptyDesc: 'لا يحتوي هذا القسم على إعدادات قابلة للتعديل.',
      failedLoad: 'فشل تحميل الإعدادات',
      autosaveFailed: 'فشل الحفظ التلقائي',
      imported: 'تم استيراد الإعدادات',
      invalidJson: 'ملف JSON للإعدادات غير صالح',
      toolsetsWipeConfirm:
        'هل تريد إزالة كل مجموعات الأدوات المفعّلة؟ سيؤدي ذلك إلى تعطيل الذاكرة والطرفية والبحث في الويب والتفويض ومعظم الأدوات الأخرى إلى أن تعيد تفعيلها.',
      keepAwakeTitle: 'منع الحاسوب من السكون',
      keepAwakeDesc:
        'يمنع هذا الجهاز من الدخول في وضع السكون. يُبقيه خيار «أثناء العمل» مستيقظًا فقط أثناء تنفيذ دور، فتكتمل المهام الليلية دون إبقاء الحاسوب المحمول مستيقظًا طوال الأسبوع. قد تخفت الشاشة مع ذلك.',
      keepAwakeOff: 'معطّل',
      keepAwakeWhileWorking: 'أثناء العمل',
      keepAwakeAlways: 'دائمًا',
      disableF12Title: 'تعطيل أدوات التطوير F12',
      disableF12Desc: 'منع F12 من فتح أدوات المطور. لا يزال Ctrl+Shift+I (أو Cmd+Opt+I على نظام Mac) يعمل.',
      alwaysExternalLinksTitle: 'فتح الروابط دائمًا في المتصفح الخارجي',
      alwaysExternalLinksDesc:
        'يفتح كل رابط تنقر عليه في متصفح النظام بدلًا من متصفح التطبيق. يبقى الخيار «فتح في متصفح التطبيق» متاحًا في قائمة النقر بزر الماوس الأيمن.',
      attachmentSizeTitle: 'الحد الأقصى لحجم المعاينة / تحميل الصورة',
      attachmentSizeDesc:
        'أقصى حجم بالميغابايت للملف المحلي الذي يحمّله التطبيق للمعاينة وإرفاق الصور. الافتراضي 16. يستخدم إرفاق الملفات غير الصور عن بُعد حدًا منفصلًا قدره 256 ميغابايت. ضبط هذه القيمة على رقم كبير جدًا يحمّل الملف كاملًا في الذاكرة وقد يجمّد التطبيق أو يتسبب في تعطله.',
      attachmentSizeUnit: 'ميغابايت',
      attachmentSizeLabel: 'الحد الأقصى لحجم المعاينة / تحميل الصورة بالميغابايت',
      showOptions: 'عرض الخيارات',
      voiceShortcutHintDesc:
        'اضبط اختصار تسجيل الصوت من الإعدادات ← اختصارات لوحة المفاتيح («بدء / إيقاف المحادثة الصوتية»). قيمة voice.record_key مخصصة لـ CLI وTUI فقط.',
      voiceShortcutHintTitle: 'اختصار تسجيل الصوت'
    },
    quickEntry: {
      enabledTitle: 'الإدخال السريع',
      enabledDesc: 'استدعِ محرّرًا صغيرًا من أي مكان باختصار عام وأرسل موجّهًا دون فتح Hermes.',
      shortcutTitle: 'اختصار الإدخال السريع',
      shortcutDesc: 'يحتاج إلى مفتاح تعديل واحد على الأقل، مثل CommandOrControl+Shift+Space.',
      active: 'الاختصار مفعّل.',
      takenBy: 'يستخدم تطبيق آخر هذا الاختصار — اختر اختصارا مختلفا.',
      invalidShortcut: 'ليس اختصارا صالحا. أضف مفتاح تعديل واحدا على الأقل.'
    },
    credentials: {
      pasteKey: 'لصق المفتاح',
      pasteLabelKey: label => `لصق مفتاح ${label}`,
      optional: 'اختياري',
      enterValueFirst: 'أدخل قيمة أولا.',
      couldNotSave: 'تعذّر حفظ بيانات الاعتماد.',
      remove: 'إزالة',
      getKey: 'احصل على مفتاح',
      saving: 'جار الحفظ'
    },
    envActions: {
      actions: 'إجراءات',
      manageInKeys: 'الإدارة في مفاتيح API',
      docs: 'الوثائق',
      hideValue: 'إخفاء القيمة',
      revealValue: 'إظهار القيمة',
      replace: 'استبدال',
      set: 'ضبط',
      clear: 'مسح'
    },
    connections: {
      title: 'البوابات المسجّلة',
      intro: 'أدِر هذا الجهاز وكل بوابات Hermes التي يمكنه الوصول إليها عبر الاتصالات البعيدة أو SSH أو Hermes Cloud.',
      stagedNote:
        'تظل كل البوابات متصلة. وتبقى الملفات الشخصية والمحادثات والمراسلة والمهام المجدولة مع بوابتها، ويمكن عرضها كلها معًا في «الجلسات».',
      launchModeTitle: 'عند بدء التشغيل، العودة إلى الجلسات على آخر بوابة مستخدمة',
      launchModeDesc: 'عند التعطيل، تُفتح الجلسات على البوابة الأساسية.',
      searchPlaceholder: 'ابحث في البوابات…',
      noSearchResults: 'لا توجد بوابات تطابق بحثك.',
      loadFailed: 'تعذّر تحميل الاتصالات',
      currentPill: 'الحالية',
      primaryPill: 'الأساسية',
      managedPill: 'يديرها التطبيق',
      addConnection: 'إضافة اتصال',
      editConnection: 'تحرير',
      removeConnection: 'إزالة',
      removeConfirmTitle: 'هل تريد إزالة هذا الاتصال؟',
      removeConfirmDesc: (label: string) =>
        `سيُزال «${label}» من هذا التطبيق. لن يتأثر المثيل نفسه — يمكنك إضافته مجددًا في أي وقت.`,
      makePrimary: 'تعيين كبوابة أساسية',
      testConnection: 'اختبار',
      testOk: 'يمكن الوصول إليها',
      testFailed: 'فشل اختبار الاتصال',
      saveFailed: 'تعذّر حفظ الاتصال',
      removeFailed: 'تعذّرت إزالة الاتصال',
      updateAll: 'تحديث كل المثيلات',
      updateAllRunning: 'جارٍ تحديث كل المثيلات…',
      updateAllDone: 'تم إرسال التحديثات',
      updateAllFailed: 'تعذّر توزيع التحديث على المثيلات',
      updateSkippedCloud: 'يديره Hermes Cloud',
      thisDevice: 'هذا الجهاز',
      kindLocal: 'محلي',
      kindRemote: 'بوابة بعيدة',
      kindCloud: 'Hermes Cloud',
      kindSsh: 'SSH',
      kindLocalDesc: 'بيئة تشغيل Hermes التي يديرها هذا التطبيق.',
      kindRemoteDesc: 'بوابة Hermes يمكن الوصول إليها عبر HTTP(S) — عبر الشبكة المحلية أو Tailscale أو الإنترنت.',
      kindCloudDesc: 'مثيل مستضاف يُكتشف عبر حسابك في Hermes Cloud.',
      kindSshDesc: 'تثبيت Hermes يُوصل إليه عبر SSH.',
      labelTitle: 'الاسم',
      labelDesc: 'مطلوب. يظهر أينما ظهر هذا المثيل، ويجب ألا يتكرر (مثلًا «المختبر المنزلي» أو «حاسوب العمل المحمول»).',
      labelPlaceholder: 'المختبر المنزلي',
      urlTitle: 'عنوان URL للبوابة',
      sshHostTitle: 'مضيف SSH',
      headersTitle: 'رؤوس البوابة الإضافية',
      headersDesc:
        'تُرسل مع كل طلب HTTP وWebSocket إلى هذه البوابة — لخوادم الوصول الوسيطة مثل Cloudflare Access (CF-Access-Client-Id / CF-Access-Client-Secret). تُخزَّن القيم مشفّرة. تُتجاهل الرؤوس التي يديرها Hermes (Authorization وCookie وHost…).',
      headerValuePlaceholder: 'القيمة',
      headerValueSaved: 'محفوظة — اتركها فارغة للإبقاء عليها',
      headerAdd: 'إضافة رأس',
      headerRemove: 'إزالة',
      duplicateLocal: 'يدير هذا التطبيق اتصالًا محليًا بالفعل — ولا يمكن أن يوجد إلا اتصال واحد.',
      duplicateUrl: (label: string) => `يوجد بالفعل اتصال بعنوان البوابة هذا («${label}»).`,
      duplicateSsh: (label: string) => `يوجد بالفعل اتصال بمضيف SSH هذا («${label}»).`,
      sameBackendHint: (label: string) => `الواجهة الخلفية نفسها التي يستخدمها «${label}»`,
      localAddHint: 'الاتصال المحلي غير متاح: الاتصال المحلي المُدار موجود بالفعل (يوجد اتصال واحد فقط).',
      cloudAddHint:
        'نصيحة: تسجيل الدخول في قسم Hermes Cloud أعلاه يكتشف وكلاءك تلقائيًا — استخدم هذا النموذج فقط لتسجيل عنوان URL لمثيل معروف يدويًا.',
      save: 'حفظ الاتصال',
      saving: 'جارٍ الحفظ…',
      cancel: 'إلغاء',
      empty: 'لا توجد اتصالات مسجّلة بعد.'
    },
    managedUpdates: {
      title: 'التحديثات المُدارة',
      intro:
        'حدِّث تثبيتات SSH التي يديرها تطبيق سطح المكتب كعملية واحدة متكاملة: تُفرَّغ الجلسات، ثم تُحدَّث نسخة المستودع على الجهاز البعيد، ويُستعاد كل ملف شخصي مع إيصال مرتبط به.',
      sshConnection: 'تثبيت SSH يديره تطبيق سطح المكتب',
      update: 'تحديث',
      updating: 'جارٍ التحديث…',
      progress: 'جارٍ تفريغ الجلسات وتحديث التثبيت البعيد واستعادة الملفات الشخصية…',
      updated: 'تم التحديث',
      partial: 'تم التحديث — تعذّرت الاستعادة',
      refused: 'مرفوض',
      failed: 'فشل التحديث',
      alreadyRunning: 'يجري تحديث بالفعل',
      receipt: (id: string, outcome: string) => `الإيصال ${id} · ${outcome}`,
      receiptVersions: (pre: string, post: string) => `${pre} → ${post}`,
      scopesRestored: (profiles: string) => `الملفات الشخصية المستعادة: ${profiles}`,
      scopeNotRestored: (profile: string, error: string) => `لم يُستعد الملف الشخصي «${profile}»: ${error}`
    },
    gateway: {
      loading: 'جار تحميل إعدادات البوابة...',
      unavailableTitle: 'إعدادات البوابة غير متاحة',
      unavailableDesc: 'لا يمكن تغيير إعدادات الاتصال إلا من تطبيق Hermes Desktop على الحاسوب الذي يشغّله.',
      title: 'اتصال البوابة',
      envOverride: 'تجاوز من البيئة',
      intro:
        'محلية افتراضيًا. استخدم البوابة البعيدة عندما يجب أن يتحكم هذا التطبيق بواجهة خلفية لـ Hermes في مكان آخر. اتصالات البوابة إعداد على مستوى الجهاز؛ وتُكتشف الملفات الشخصية من البوابات التي تتصل بها.',
      envOverrideTitle: 'طريقة تشغيل Hermes هي التي حدّدت هذا الاتصال.',
      envOverrideDesc:
        'اختار إعداد تشغيل من خارج التطبيق هذا الاتصال، لذا فالخيارات أدناه للقراءة فقط. أعد تشغيل Hermes بدون ذلك الإعداد — أو اطلب ذلك ممن أعدّه — لتتمكن من تغييره هنا.',
      modeTitle: 'وضع الاتصال',
      localTitle: 'بوابة محلية',
      localDesc: 'تشغيل واجهة خلفية خاصة لـ Hermes على localhost. هذا هو الخيار الافتراضي ويعمل دون اتصال بالإنترنت.',
      remoteTitle: 'بوابة بعيدة',
      remoteDesc: 'ربط تطبيق سطح المكتب هذا بواجهة خلفية بعيدة لـ Hermes.',
      remoteAuthHint:
        'تستخدم البوابات المستضافة OAuth أو اسم مستخدم وكلمة مرور؛ وقد تستخدم البوابات المستضافة ذاتيًا رمز جلسة.',
      cloudTitle: 'Hermes Cloud',
      cloudDesc: 'سجّل الدخول مرة واحدة إلى Hermes Cloud واختر من الوكلاء في حسابك — دون الحاجة إلى لصق رابط.',
      cloudSignInTitle: 'Hermes Cloud',
      cloudSignIn: 'تسجيل الدخول إلى Hermes Cloud',
      cloudSignedIn: 'تم تسجيل الدخول إلى Hermes Cloud',
      cloudNeedsSignIn: 'سجّل الدخول إلى Hermes Cloud لاكتشاف الوكلاء في حسابك.',
      cloudSignedInDesc: 'لقد سجّلت الدخول. اختر وكيلًا أدناه؛ تتجدد الجلسة تلقائيًا.',
      cloudAgentsTitle: 'وكلاؤك',
      cloudOrgPickerTitle: 'اختر مؤسسة',
      cloudOrgSelect: 'اختيار',
      cloudOrgChange: 'تغيير المؤسسة',
      cloudOrgRole: role => `الدور: ${role}`,
      cloudLoadingAgents: 'جار تحميل وكلائك…',
      cloudNoAgents: {
        before: 'لم يُعثر على وكلاء في هذا الحساب. أنشئ واحداً في ',
        linkText: 'Nous Portal',
        after: '، ثم حدّث.'
      },
      cloudRefresh: 'تحديث',
      cloudConnect: 'اتصال',
      cloudSavedTitle: 'بوابات Hermes Cloud المحفوظة',
      cloudSavedDesc:
        'استخدم بوابة محفوظة دون تغيير البوابة الافتراضية. سجّل الدخول أدناه لإضافة مثيلات. تُدار الأسماء وتسجيل الدخول من قائمة الاتصالات المحفوظة.',
      cloudUseSaved: 'استخدام البوابة',
      cloudActive: 'نشطة في هذه النافذة',
      cloudConnecting: 'جار الاتصال…',
      cloudDiscoverFailed: 'تعذّر تحميل وكلائك في Hermes Cloud',
      cloudConnectFailed: 'تعذّر الاتصال بذلك الوكيل',
      cloudSignInFailed: 'فشل تسجيل الدخول إلى Hermes Cloud',
      cloudSignedOutTitle: 'تم تسجيل الخروج من Hermes Cloud',
      cloudSignedOutMessage: 'تم مسح جلسة Hermes Cloud.',
      cloudConnectedTitle: 'متصل',
      cloudConnectedPill: 'متصل',
      cloudConnectedTo: name => `تم الاتصال بـ ${name}.`,
      cloudAgentProvisioning: 'جار التهيئة…',
      cloudStatusLabel: status => `الحالة: ${status}`,
      remoteUrlTitle: 'رابط البوابة البعيدة',
      remoteUrlDesc: 'العنوان الأساسي للواجهة الخلفية للوحة التحكم البعيدة. تُدعم بادئات المسار، مثل /hermes.',
      probing: 'جارٍ فحص طريقة مصادقة هذه البوابة…',
      probeError:
        'لا يستطيع Hermes الوصول إلى هذا العنوان. تحقق من URL ومن تشغيل Hermes على الحاسوب الآخر؛ ستظهر خيارات تسجيل الدخول عندما يستجيب.',
      signedIn: 'تم تسجيل الدخول',
      signedInMessage: provider => `تم الاتصال عبر ${provider}`,
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      signInWith: provider => `تسجيل الدخول عبر ${provider}`,
      authTitle: 'المصادقة',
      authSignedInPassword: 'تستخدم هذه البوابة اسم مستخدم وكلمة مرور. لقد سجّلت الدخول، وتتجدد الجلسة تلقائيًا.',
      authSignedInOauth: 'تستخدم هذه البوابة OAuth. لقد سجّلت الدخول، وتتجدد الجلسة تلقائيًا.',
      authNeedsPassword: 'تستخدم هذه البوابة اسم مستخدم وكلمة مرور. سجّل الدخول لتفويض تطبيق سطح المكتب هذا.',
      authNeedsOauth: provider => `تستخدم هذه البوابة OAuth. سجّل الدخول عبر ${provider} لتفويض تطبيق سطح المكتب هذا.`,
      tokenTitle: 'رمز الجلسة',
      tokenDesc: 'رمز جلسة لوحة التحكم المستخدم لطلبات REST وWebSocket. اتركه فارغًا للإبقاء على الرمز المحفوظ.',
      existingToken: value => `رمز موجود ${value}`,
      savedToken: 'محفوظ',
      pasteSessionToken: 'الصق رمز الجلسة',
      plainTextConfirmTitle: 'هل تريد حفظ رمز البوابة كنص غير مشفّر؟',
      plainTextConfirmDesc:
        'لم يُعثر على خدمة سلسلة مفاتيح للنظام على هذا الجهاز، لذا سيُحفظ الرمز دون تشفير في ملف إعدادات الاتصال الخاص بالتطبيق، ويمكن لأي عملية تعمل باسم هذا المستخدم قراءته. ثبّت سلسلة مفاتيح النظام أو فعّلها (GNOME Keyring أو KWallet على Linux) للتخزين المشفّر.',
      plainTextConfirmAction: 'حفظ كنص عادي',
      plainTextStoredTitle: 'حُفظ الرمز كنص غير مشفّر',
      plainTextStoredDesc:
        'التخزين الآمن غير متاح، لذا حُفظ الرمز دون تشفير في ملف إعدادات الاتصال الخاص بالتطبيق على هذا الجهاز. ثبّت سلسلة مفاتيح النظام أو فعّلها (GNOME Keyring أو KWallet على Linux) لتشفيره.',
      keychainEncryptionTitle: 'تشفير الأسرار المحفوظة باستخدام سلسلة مفاتيح النظام',
      keychainEncryptionDesc:
        'معطّل افتراضياً. عند التفعيل، تُشفَّر رموز البوابة وبيانات تسجيل الدخول باستخدام سلسلة مفاتيح النظام (Keychain Access أو GNOME Keyring أو Windows DPAPI) — وقد يطلب النظام إذناً أو كلمة مرور. عند التعطيل، تُخزَّن كملفات عادية لا يقرؤها سوى حساب المستخدم الحالي.',
      keychainEncryptionFailed: 'تعذّر تغيير إعداد تشفير الأسرار',
      testRemote: 'اختبار البوابة البعيدة',
      saveForRestart: 'حفظ للتشغيل القادم',
      saveAndReconnect: 'حفظ وإعادة الاتصال',
      diagnostics: 'التشخيصات',
      diagnosticsDesc: 'اعرض desktop.log في مدير الملفات، وهذا مفيد عند فشل تشغيل البوابة.',
      openLogs: 'فتح السجلات',
      incompleteTitle: 'إعداد البوابة البعيدة غير مكتمل',
      incompleteSignIn: 'أدخل رابط البوابة البعيدة وسجّل الدخول قبل التبديل إلى البوابة البعيدة.',
      incompleteToken: 'أدخل رابط البوابة البعيدة ورمز الجلسة قبل التبديل إلى البوابة البعيدة.',
      incompleteSignInTest: 'أدخل رابط البوابة البعيدة وسجّل الدخول قبل الاختبار.',
      incompleteTokenTest: 'أدخل رابط البوابة البعيدة ورمز الجلسة قبل الاختبار.',
      enterUrlFirst: 'أدخل رابط البوابة البعيدة أولاً.',
      restartingTitle: 'جار إعادة تشغيل اتصال البوابة',
      savedTitle: 'تم حفظ إعدادات البوابة',
      restartingMessage: 'سيعيد Hermes Desktop الاتصال باستخدام الإعدادات المحفوظة — وتبقى نافذة التطبيق مفتوحة.',
      savedMessage: 'تم الحفظ للتشغيل القادم.',
      connectedTo: (baseUrl, version) => `متصل بـ ${baseUrl}${version ? ` · Hermes ${version}` : ''}`,
      reachableTitle: 'يمكن الوصول إلى البوابة البعيدة',
      signedOutTitle: 'تم تسجيل الخروج',
      signedOutMessage: 'تم مسح جلسة البوابة البعيدة.',
      failedLoad: 'فشل تحميل إعدادات البوابة',
      signInFailed: 'فشل تسجيل الدخول',
      signOutFailed: 'فشل تسجيل الخروج',
      testFailed: 'فشل اختبار البوابة البعيدة',
      applyFailed: 'تعذّر تطبيق إعدادات البوابة',
      saveFailed: 'تعذّر حفظ إعدادات البوابة',
      sshTitle: 'الاتصال عبر SSH',
      sshDesc:
        'يُشغَّل Hermes على الجهاز البعيد عبر SSH ويُمرَّر عبر نفق إلى هذا التطبيق — لا حاجة لتشغيل أي شيء أو كشفه بنفسك. يتطلب وصول SSH عاملًا إلى المضيف باستخدام مفتاح.',
      sshTrustHint: 'يُوثَق بأول مفتاح يقدّمه المضيف ويُثبَّت؛ وأي تغيير لاحق فيه يمنع الاتصال.',
      sshHostTitle: 'المضيف',
      sshHostDesc: 'user@host، أو اسم Host مستعار من ~/.ssh/config.',
      sshHostPick: 'حدد مضيفًا…',
      sshHostPickTitle: 'المضيف',
      sshHostPickDesc: 'اسم Host مستعار من ~/.ssh/config، أو «مخصص» لكتابته بنفسك.',
      sshHostCustom: 'مخصص (إدخال يدوي)…',
      sshUserTitle: 'المستخدم',
      sshUserDesc: 'فارغ = ~/.ssh/config أو مستخدمك الحالي.',
      sshUserPlaceholder: 'من ~/.ssh/config',
      sshPortTitle: 'المنفذ',
      sshPortDesc: 'فارغ = 22 أو منفذ ~/.ssh/config.',
      sshKeyTitle: 'ملف الهوية',
      sshKeyDesc: 'مسار المفتاح الخاص. فارغ = ssh-agent أو ~/.ssh/config.',
      sshHermesPathTitle: 'مسار Hermes (اختياري)',
      sshHermesPathDesc: 'المسار الكامل لملف hermes التنفيذي على الجهاز البعيد. فارغ = اكتشاف تلقائي.',
      sshHermesPathPlaceholder: 'اكتشاف تلقائي',
      sshTestConnection: 'اختبار SSH',
      sshConnect: 'اتصال',
      sshButtonsHint: '«حفظ» يُطبَّق عند التشغيل التالي، و«اتصال» يعيد الاتصال فورًا.',
      sshReachable: (host, platform) => `يمكن الوصول إلى ${host} (${platform}) — تم العثور على Hermes`,
      sshIncompleteHost: 'أدخل مضيف SSH قبل الاتصال.',
      sshErrUnreachable: 'تعذّر الوصول إلى هذا المضيف عبر SSH. تحقق من المضيف والمنفذ وشبكتك.',
      sshErrAuth:
        'فشلت مصادقة SSH. حمّل مفتاحك في ssh-agent (ssh-add) أو اضبط IdentityFile في ~/.ssh/config — يشغّل Hermes الأمر ssh بشكل غير تفاعلي.',
      sshErrHostKey:
        'لقد تغيّر مفتاح المضيف منذ آخر اتصال لك. تأكد من أن هذا متوقع، ثم شغّل ssh-keygen -R <host> وأعد الاتصال.',
      sshErrNotInstalled:
        'Hermes غير مثبّت على المضيف البعيد. ثبّته هناك (curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh) أو اضبط مسار Hermes.',
      sshErrPlatform:
        'منصة بعيدة غير مدعومة. يدعم وضع SSH في Hermes Desktop المضيفات البعيدة العاملة بأنظمة Linux وmacOS وWindows.',
      sshErrTimeout: 'انتهت مهلة اتصال SSH. قد يتعذّر الوصول إلى المضيف أو قد يكون في وضع السكون.',
      sshErrUpdateRequired: 'حدّث Hermes على المضيف البعيد قبل الاتصال عبر SSH من تطبيق سطح المكتب.',
      sshErrUnknown: 'فشل اتصال SSH.',
      sshErrInteractiveAuth:
        'يتطلب Tailscale SSH فحصًا تفاعليًا في المتصفح. شغّل في الطرفية `ssh <host> true` وأكمل الفحص، ثم أعد المحاولة — يشغّل Hermes الأمر ssh بشكل غير تفاعلي.',
      webAccess: {
        title: 'الوصول عبر الويب',
        intro:
          'افتح Hermes الموجود على هذا الحاسوب من هاتفك أو من حاسوب آخر، مع تسجيل الدخول بحساب Nous. من يسجّل الدخول يمكنه تشغيل الأوامر على هذا الحاسوب.',
        failed: 'تعذّر تغيير الوصول عبر الويب',
        running: 'قيد التشغيل',
        stopped: 'متوقف',
        starting: 'جارٍ البدء',
        stopping: 'جارٍ الإيقاف',
        restartNeeded: 'يلزم إعادة التشغيل',
        unavailable: 'غير متاح',
        notRunningDetail: 'شغّله لفتح Hermes من جهاز آخر.',
        needsNous: 'سجّل الدخول إلى حساب Nous من قسم المزوّدين أولًا.',
        runningLan: 'افتح هذا العنوان على جهاز في الشبكة نفسها.',
        runningPublic: 'يُقدَّم عبر عنوانك.',
        runningLocal: 'يمكن فتحه من هذا الحاسوب فقط. أوقفه ثم شغّله من جديد لفتحه من أجهزة أخرى.',
        pendingOn: 'تم الحفظ. ستقدّم البوابة تطبيق الويب بعد إعادة تشغيلها.',
        pendingOff: 'تم الإيقاف، لكن البوابة تواصل تقديم تطبيق الويب حتى إعادة تشغيلها.',
        unavailableDetail: reason => `تعذّر على البوابة تقديم تطبيق الويب: ${reason}`,
        restartBusy:
          'تم الحفظ. توجد محادثة قيد التشغيل، لذا لم يُعَد تشغيل البوابة. اختر «إعادة تشغيل البوابة» عند انتهائها.',
        restartFailed: 'تم الحفظ، لكن تعذّرت إعادة تشغيل البوابة. اختر «إعادة تشغيل البوابة» للمحاولة مجددًا.',
        restartFailedBecause: reason => `تعذّرت إعادة تشغيل البوابة: ${reason}`,
        startTimedOut: 'لم تقدّم البوابة تطبيق الويب خلال 90 ثانية.',
        stopTimedOut: 'لم تتوقف البوابة عن تقديم تطبيق الويب خلال 90 ثانية.',
        startStages: {
          preparing: 'جارٍ تجهيز تطبيق الويب. قد يستغرق إنشاؤه بضع دقائق.',
          building: 'جارٍ إنشاء تطبيق الويب. قد يستغرق ذلك بضع دقائق.',
          registering: 'جارٍ إعداد تسجيل الدخول عبر Nous لهذا العنوان.',
          restarting: 'جارٍ إعادة تشغيل البوابة لتقديم تطبيق الويب.'
        },
        startElapsed: time => `الوقت المنقضي: ${time}`,
        start: 'تشغيل',
        stop: 'إيقاف',
        restartGateway: 'إعادة تشغيل البوابة',
        modeLan: 'هذه الشبكة',
        modeLanDetail: url => `تفتح الأجهزة على شبكة Wi-Fi العنوان ${url}. استخدمه على شبكة تثق بها فقط.`,
        lanUnencrypted: 'الاتصال غير مشفّر: يمكن لآخرين على هذه الشبكة قراءة ما ترسله وتستقبله.',
        noLan: 'لا يملك هذا الحاسوب عنوان شبكة يمكن للأجهزة الأخرى الوصول إليه.',
        modePublic: 'عنواني الخاص',
        modePublicDetail: port =>
          `عنوان HTTPS تديره بالفعل، مثل Tailscale Serve أو نفق، يحوّل إلى http://127.0.0.1:${port}.`
      },
      webappHostDesc:
        'يعمل تطبيق الويب دائمًا على مضيف Hermes الذي يقدّمه. الاتصالات المحفوظة أدناه هي قائمة هذا الجهاز، وهي مشتركة مع تطبيق Hermes Desktop؛ ويُوصَل إلى البوابات الأخرى عبر هذا المضيف.',
      webappHostTitle: 'مضيف Hermes',
      webappOauthPaste: {
        title: 'إكمال تسجيل الدخول',
        description:
          'إذا انتهت علامة تبويب تسجيل الدخول عند عنوان لا يُحمَّل (لأن هذا المتصفح ليس على جهاز البوابة)، فالصق ذلك العنوان هنا.',
        placeholder: 'http://127.0.0.1:…/webapp/gateway-connections/oauth/callback?…',
        finish: 'إكمال',
        failed: 'تعذّر إكمال تسجيل الدخول'
      },
      webappRelay: {
        signInElsewhere: 'تسجيل الدخول إلى بوابة أخرى غير متاح هنا.',
        signOutHereOnly: 'لا يمكن هنا تسجيل الخروج إلا من هذه البوابة.',
        testFromRow: 'احفظ هذا الاتصال، ثم استخدم «اختبار» في صفّه: يختبره تطبيق الويب عبر هذه البوابة.',
        nameBeforeSignIn: 'سمِّ هذا الاتصال، ثم سجّل الدخول.',
        signInUnfinished: 'لم يكتمل تسجيل الدخول',
        noSignInForAddress: 'لا يوجد اتصال محفوظ يسجّل الدخول على ذلك العنوان.',
        listUnreadable: 'لم يُرجع Hermes الاتصالات المحفوظة',
        relayTicketMissing: 'لم يُرجع Hermes تذكرة الترحيل',
        sshUnreached: label => `«${label}» اتصال SSH، ولا يصل إليه تطبيق الويب بعد`,
        noAnswer: label => `لم يستجب «${label}»`,
        chatOpensInTab: 'تُفتح المحادثة الموجودة على بوابة أخرى في علامة التبويب هذه، لا في نافذة جديدة.'
      }
    },
    keys: {
      loading: 'جار تحميل مفاتيح API وبيانات الاعتماد...',
      failedLoad: 'فشل تحميل مفاتيح API',
      empty: 'لا يوجد شيء مضبوط في هذه الفئة بعد.'
    },
    search: {
      placeholder: 'البحث في جميع الإعدادات…',
      pill: 'بحث'
    },
    profileScope: {
      appliesTo: 'ينطبق على',
      editsProfile: profile => `تنطبق التغييرات في هذه الصفحة على الملف الشخصي «${profile}».`
    },
    mcp: {
      loading: 'جار تحميل خوادم MCP...',
      invalidJson: 'JSON الخاص بـ MCP غير صالح',
      saveFailed: 'فشل الحفظ',
      removeFailed: 'فشلت الإزالة',
      reloadFailed: 'فشلت إعادة تحميل MCP',
      savedTitle: 'تم حفظ خادم MCP',
      savedMessage: name => `يسري ${name} بعد إعادة تحميل MCP.`,
      disabled: 'معطّل',
      name: 'الاسم',
      serverJson: 'JSON الخادم',
      remove: 'إزالة',
      saveServer: 'حفظ الخادم',
      test: 'اختبار الاتصال',
      testing: 'جارٍ الاختبار...',
      testOk: count =>
        AR_PLURAL(count, {
          zero: 'متصل — لا توجد أدوات متاحة',
          one: 'متصل — أداة واحدة متاحة',
          two: 'متصل — أداتان متاحتان',
          few: `متصل — ${count} أدوات متاحة`,
          many: `متصل — ${count} أداة متاحة`
        }),
      testFailed: 'فشل الاتصال',
      enableServer: name => `تفعيل ${name}`,
      disableServer: name => `تعطيل ${name}`,
      serverEnabled: name => `تم تفعيل ${name} — يسري على الجلسات الجديدة.`,
      serverDisabled: name => `تم تعطيل ${name} — يسري على الجلسات الجديدة.`,
      toggleFailed: (name, enabled) => `تعذّر ${enabled ? 'تفعيل' : 'تعطيل'} ${name}`,
      tabServers: 'الخوادم',
      tabCatalog: 'الكتالوج',
      catalogLoading: 'جارٍ تحميل كتالوج MCP...',
      catalogLoadFailed: 'فشل تحميل كتالوج MCP',
      catalogEmpty: 'لا توجد إدخالات متاحة في الكتالوج.',
      catalogInstalled: 'مثبّت',
      catalogEnabled: 'مفعّل',
      catalogNeedsInstall: 'يحتاج إلى بناء',
      catalogInstall: 'تثبيت',
      catalogInstalling: 'جارٍ التثبيت...',
      catalogInstallStarted: name => `جارٍ تثبيت ${name}... يسري على الجلسات الجديدة عند الانتهاء.`,
      catalogInstallFailed: name => `تعذّر تثبيت ${name}`,
      catalogInstallTimeout: name => `توقف Hermes عن انتظار اكتمال تثبيت ${name}، لكن قد يكون التثبيت ما زال جاريًا.`,
      catalogEnvPrompt: name => `يتطلب ${name} بيانات اعتماد`,
      catalogEnvRequired: 'املأ القيم المطلوبة قبل التثبيت.',
      capabilitySummary: (tools, prompts, resources) =>
        `مفعّل: ${[
          AR_PLURAL(tools, {
            zero: 'لا أدوات',
            one: 'أداة واحدة',
            two: 'أداتان',
            few: `${tools} أدوات`,
            many: `${tools} أداة`
          }),
          ...(prompts
            ? [
                AR_PLURAL(prompts, {
                  one: 'موجّه واحد',
                  two: 'موجّهان',
                  few: `${prompts} موجّهات`,
                  many: `${prompts} موجّهًا`,
                  other: `${prompts} موجّه`
                })
              ]
            : []),
          ...(resources
            ? [
                AR_PLURAL(resources, {
                  one: 'مورد واحد',
                  two: 'موردان',
                  few: `${resources} موارد`,
                  many: `${resources} موردًا`,
                  other: `${resources} مورد`
                })
              ]
            : [])
        ].join('، ')}`,
      costTokens: tokens =>
        `~${AR_PLURAL(tokens, { zero: `${tokens} رمز`, one: 'رمز واحد', two: 'رمزان', few: `${tokens} رموز`, many: `${tokens} رمزًا`, other: `${tokens} رمز` })}/استدعاء`,
      usage30d: uses =>
        `${AR_PLURAL(uses, { zero: `${uses} استخدام`, one: 'استخدام واحد', two: 'استخدامان', few: `${uses} استخدامات`, many: `${uses} استخدامًا`, other: `${uses} استخدام` })}/30 يومًا`,
      unusedPill: 'غير مستخدم',
      statusConnecting: 'جارٍ الاتصال…',
      statusNeedsAuth: 'يحتاج إلى مصادقة',
      statusError: 'خطأ',
      statusOff: 'متوقف',
      allServers: 'كل الخوادم',
      authenticatedTitle: 'تمت المصادقة',
      authenticatedMessage: (server, count) =>
        `${server}: ${AR_PLURAL(count, { zero: 'لا أدوات', one: 'أداة واحدة', two: 'أداتان', few: `${count} أدوات`, many: `${count} أداة` })}`,
      waitingForBrowser: 'في انتظار المتصفح…',
      authenticate: 'مصادقة',
      unsavedConnect: 'غير محفوظ — احفظ mcp.json للاتصال.',
      enableTool: tool => `تفعيل ${tool}`,
      disableTool: tool => `تعطيل ${tool}`,
      noOutput: 'لا يوجد إخراج بعد.',
      deepLinkTitle: 'إضافة خادم MCP؟',
      deepLinkDescription:
        'طلب رابط إضافة خادم MCP هذا إلى Hermes. راجع الإعدادات الكاملة أدناه — فهي قادمة من الرابط وليست من Hermes.',
      deepLinkStdioWarning:
        'سيشغّل هذا الخادم عملية محلية على جهازك بالأمر الموضح أدناه. لا تتابع إلا إذا كنت تثق بمصدره.',
      deepLinkConfirm: 'إضافة الخادم',
      deepLinkNameInvalid: 'يتكوّن الاسم من 1 إلى 64 حرفًا أو رقمًا أو نقطة أو شرطة أو شرطة سفلية.',
      deepLinkNameConflict: name => `يوجد خادم باسم ${name} بالفعل — اختر اسما مختلفا أو ألغِ العملية.`,
      deepLinkErrorTitle: 'رُفض رابط تثبيت MCP',
      deepLinkErrorName: 'اسم الخادم في الرابط مفقود أو غير صالح.',
      deepLinkErrorConfig: 'إعدادات الرابط ليست JSON صالحا مرمّزا بـ base64.',
      deepLinkErrorShape: 'يجب أن تكون الإعدادات كائن JSON يحتوي على حقل `url` أو `command` نصي.',
      deepLinkErrorUrl: 'يسمح فقط بعناوين http:// و https:// للخادم.',
      deepLinkErrorTooLarge: 'حجم الإعدادات يتجاوز الحد الأقصى 32KB.',
      importButton: 'استيراد',
      importPlaceholder:
        'الصق مقتطفًا من mcp.json، أو أمر npx/docker، أو سطر claude mcp add، أو عنوان URL، أو رابط Cursor…',
      importNoMatch: 'لم يُتعرّف على أي إعدادات خادم في النص الملصق.',
      importConfirm: 'إضافة إلى mcp.json',
      importConfirmMany: count =>
        AR_PLURAL(count, {
          one: 'إضافة خادم واحد إلى mcp.json',
          two: 'إضافة خادمين إلى mcp.json',
          few: `إضافة ${count} خوادم إلى mcp.json`,
          many: `إضافة ${count} خادمًا إلى mcp.json`,
          other: `إضافة ${count} خادم إلى mcp.json`
        }),
      catalogAuthOAuth: 'OAuth',
      catalogAuthApiKey: 'مفتاح API'
    },
    model: {
      moaTitle: 'مزيج الوكلاء (Mixture of Agents)',
      moaPreset: 'إعداد مسبق',
      moaDescription:
        'اضبط إعدادات مسبقة مسمّاة تظهر كنماذج ضمن المزوّد Mixture of Agents. نموذج التجميع هو النموذج المنفّذ: يشغّل كل خطوة في حلقة الأدوات، وتُحتسب كل تكلفة التشغيل تقريبًا على مزوّده. ولا تقدّم النماذج المرجعية المشورة افتراضيًا إلا مرة واحدة لكل رسالة من المستخدم.',
      moaAggregator: 'نموذج التجميع',
      moaAggregatorBilled: 'النموذج المنفّذ · تُحتسب عليه تكلفة التشغيل',
      moaReferenceHint: 'يقدّم المشورة مرة واحدة لكل رسالة افتراضياً',
      mainAppliedTitle: 'تم تحديث النموذج الرئيسي',
      mainAppliedMessage: model => `ستستخدم الجلسات الجديدة ${model}.`,
      setupProviderFallback: 'المزوّد',
      setUpProvider: name => `إعداد ${name}`,
      staleAuxBefore: (count, names) =>
        AR_PLURAL(count, {
          one: `ما زالت مهمة مساعدة واحدة (${names}) تعمل على `,
          two: `ما زالت مهمتان مساعدتان (${names}) تعملان على `,
          few: `ما زالت ${count} مهام مساعدة (${names}) تعمل على `,
          many: `ما زالت ${count} مهمة مساعدة (${names}) تعمل على `
        }),
      staleAuxAfter: '، وليس على نموذجك الرئيسي.',
      staleAuxOtherProviders: 'مزوّدين آخرين',
      moaEnabled: 'مفعّل',
      moaSetDefault: 'تعيين كافتراضي',
      moaNewPresetPlaceholder: 'إعداد جديد',
      moaAddPreset: 'إضافة إعداد',
      customModel: 'نموذج مخصص…',
      customModelPlaceholder: 'معرّف النموذج',
      chooseFromList: 'الاختيار من القائمة',
      moaDefault: 'الافتراضي:',
      moaReferenceToggle: (enabled, index) => `${enabled ? 'تعطيل' : 'تفعيل'} المرجع ${index}`,
      moaReferenceTitle: index => `المرجع ${index}`,
      moaAddReference: 'إضافة نموذج مرجعي',
      loading: 'جارٍ تحميل إعدادات النموذج...',
      appliesDesc:
        'يسري على الجلسات الجديدة. لتبديل نموذج المحادثة الحالية فورًا، استخدم منتقي النماذج في محرر الرسائل.',
      provider: 'المزوّد',
      model: 'النموذج',
      applying: 'جارٍ التطبيق...',
      defaultsLabel: 'الإعدادات الافتراضية',
      reasoning: 'الاستدلال',
      reasoningOff: 'متوقف',
      speed: 'السرعة',
      speedStandard: 'قياسي',
      defaultsFailed: 'تعذّر حفظ الإعدادات الافتراضية للنموذج',
      loadFailed: 'تعذّر تحميل النماذج',
      restartRequired: 'ما زالت هذه الواجهة الخلفية تشغّل شيفرة قديمة بعد التحديث. أعد تشغيلها لتحميل الشيفرة الجديدة.',
      restartBackend: 'إعادة تشغيل الواجهة الخلفية',
      restartingBackend: 'جارٍ إعادة تشغيل الواجهة الخلفية...',
      restartFailed: 'تعذّرت إعادة تشغيل الواجهة الخلفية',
      auxiliaryTitle: 'النماذج المساعدة',
      resetAllToMain: 'إعادة تعيين الكل إلى النموذج الرئيسي',
      staleAuxDismiss: 'عدم الإظهار مجددًا',
      auxiliaryDesc: 'تعمل المهام المساعدة على النموذج الرئيسي افتراضيًا. لتغيير ذلك، خصّص نموذجًا لأي مهمة.',
      setToMain: 'ضبط على الرئيسي',
      change: 'تغيير',
      autoUseMain: 'تلقائي · استخدام النموذج الرئيسي',
      inheritMainEffort: 'وراثة · مستوى استدلال النموذج الرئيسي',
      inheritsFrom: task => `يرث من ${task}`,
      followTask: task => `اتباع ${task}`,
      providerDefault: '(افتراضي المزوّد)',
      fallbackAdd: 'إضافة نموذج احتياطي',
      fallbackEmpty: 'لا توجد نماذج احتياطية — يُستخدم النموذج الافتراضي ما لم يفشل.',
      notInCatalog: 'غير موجود في قائمة نماذج هذا المزوّد — قد تتحول الاستدعاءات إلى نموذج احتياطي.',
      staleAuxPrefix: (count, names) =>
        AR_PLURAL(count, {
          one: `ما زالت مهمة مساعدة واحدة (${names}) تعمل على `,
          two: `ما زالت مهمتان مساعدتان (${names}) تعملان على `,
          few: `ما زالت ${count} مهام مساعدة (${names}) تعمل على `,
          many: `ما زالت ${count} مهمة مساعدة (${names}) تعمل على `
        }),
      staleAuxSuffix: '، وليس على نموذجك الرئيسي.',
      pasteKeyPlaceholder: keyEnv => `الصق ${keyEnv}`,
      activate: 'تفعيل',
      activating: 'جارٍ التفعيل...',
      needsApiKeyHint: name => `يحتاج ${name} إلى مفتاح API — اضبطه لاختيار نموذج.`,
      oauthHint: name => `يجري تسجيل الدخول إلى ${name} عبر متصفحك، ويتولى Hermes تنفيذ الخطوات نيابةً عنك.`,
      moa: {
        title: 'مزيج الوكلاء (Mixture of Agents)',
        shortTitle: 'MoA',
        presetsTitle: 'إعدادات MoA المسبقة',
        description:
          'اضبط إعدادات مسبقة مسمّاة تظهر كنماذج ضمن المزوّد Mixture of Agents. نموذج التجميع هو النموذج المنفّذ.',
        presetPlaceholder: 'إعداد مسبق',
        enabled: 'مفعّل',
        setDefault: 'تعيين كافتراضي',
        deletePreset: 'حذف',
        newPresetPlaceholder: 'إعداد جديد',
        addPreset: 'إضافة إعداد',
        defaultLabel: 'الافتراضي:',
        referenceTitle: index => `المرجع ${index}`,
        toggleReference: (index, enabled) => `${enabled ? 'تعطيل' : 'تفعيل'} المرجع ${index}`,
        removeReference: 'إزالة',
        addReference: 'إضافة نموذج مرجعي',
        aggregatorTitle: 'نموذج التجميع'
      },
      tasks: {
        vision: {
          label: 'الرؤية',
          hint: 'تحليل الصور'
        },
        compression: {
          label: 'الضغط',
          hint: 'ضغط السياق'
        },
        approval: {
          label: 'الموافقة',
          hint: 'موافقة تلقائية ذكية'
        },
        mcp: {
          label: 'MCP',
          hint: 'توجيه أدوات MCP'
        },
        title_generation: {
          label: 'توليد العناوين',
          hint: 'عناوين الجلسات'
        },
        review: {
          label: 'المراجعة',
          hint: 'وكيل المراجعة الفرعي /review'
        },
        voice_chat: { label: 'دردشة صوتية', hint: 'ردود الوضع الصوتي' },
        curator: {
          label: 'المنسّق',
          hint: 'مراجعة استخدام المهارات'
        },
        triage_specifier: {
          label: 'مُفصِّل الفرز',
          hint: 'تفصيل مواصفات مهام كانبان'
        },
        kanban_decomposer: {
          label: 'مُجزِّئ كانبان',
          hint: 'تقسيم المهام إلى مهام فرعية'
        },
        profile_describer: {
          label: 'واصف الملفات الشخصية',
          hint: 'أوصاف تلقائية للملفات الشخصية'
        }
      },
      subagents: {
        inherit: 'الوراثة من الوكيل الرئيسي',
        modelOnly: 'نموذج مخصص (بيانات اعتماد الوكيل الرئيسي)',
        providerLabel: 'مزوّد الوكلاء الفرعيين',
        modelLabel: 'نموذج الوكلاء الفرعيين',
        direct: 'تجاوز بنقطة نهاية مباشرة',
        customProvider: 'مزوّد مخصص...',
        customProviderLabel: 'مزوّد مخصص للوكلاء الفرعيين',
        customEndpoints: 'نقاط النهاية المخصصة',
        customEndpointsHidden:
          'تظهر نقاط النهاية المخصصة هنا بعد تفعيل «اقتراح نقاط النهاية المخصصة للوكلاء الفرعيين».',
        parentModel: 'استخدام نموذج الوكيل الرئيسي',
        parentModelWarning:
          'يجب أن يدعم المزوّد المختار نموذج الوكيل الرئيسي. قد يفشل المسار الذي يحدد المزوّد وحده إذا كان النموذج غير متوافق. وإذا حدّد هذا المزوّد نموذجًا افتراضيًا خاصًا به، يستخدمه الوكلاء الفرعيون بدلًا من ذلك.',
        directActive:
          'توجد نقطة نهاية مباشرة مفعّلة لها الأولوية على المزوّد المحفوظ. يُحتفظ بعنوانها وبيانات اعتمادها ما دام هذا الوضع محددًا.',
        directClear: 'تطبيق هذا المسار يمسح نقطة النهاية المباشرة ومفتاحها المحفوظ. تبقى إعدادات الطلب الأخرى كما هي.',
        catalogFailed: 'كتالوج النماذج غير متاح. أدخل المزوّد والنموذج يدويًا أو أعد المحاولة.',
        draftHint: 'تبقى التغييرات محلية حتى تطبيقها.',
        routing: arDelegationRouting
      }
    },
    customEndpoints: arCustomEndpoints,
    uninstall: {
      dangerZone: 'منطقة الخطر',
      checking: 'جارٍ التحقق مما هو مثبّت…',
      confirmTitle: 'تأكيد إلغاء التثبيت',
      confirmBody: consequence => `سيؤدي هذا إلى إزالة ${consequence}. لا يمكن التراجع عن ذلك.`,
      appPathLabel: path => `التطبيق: ${path}`,
      uninstalling: 'جارٍ إلغاء التثبيت…',
      confirmYes: 'نعم، إلغاء التثبيت',
      heading: 'إلغاء تثبيت Hermes',
      chooseBody:
        'اختر مقدار ما تريد إزالته. يُغلَق التطبيق لإكمال المهمة، ويمكنك العودة في أي وقت بإعادة فتح برنامج التثبيت.',
      startFailed: 'تعذّر بدء إلغاء التثبيت.',
      options: {
        gui: {
          title: 'إلغاء تثبيت واجهة الدردشة الرسومية فقط',
          description: 'إزالة تطبيق سطح المكتب فقط. سيبقى وكيل Hermes وإعداداتك ومحادثاتك.',
          consequence: 'واجهة الدردشة الرسومية لسطح المكتب (هذا التطبيق وبياناته)'
        },
        lite: {
          title: 'إلغاء تثبيت الواجهة الرسومية والوكيل مع الاحتفاظ ببياناتي',
          description: 'إزالة التطبيق ووكيل Hermes مع الاحتفاظ بالإعدادات والمحادثات والأسرار لإعادة تثبيته لاحقاً.',
          consequence: 'واجهة الدردشة الرسومية ووكيل Hermes (مع الاحتفاظ بالإعدادات والمحادثات والأسرار)'
        },
        full: {
          title: 'إلغاء تثبيت كل شيء',
          description:
            'إزالة التطبيق والوكيل وكل بيانات المستخدم — الإعدادات والمحادثات والمهام المجدولة والأسرار والسجلات.',
          consequence: 'كل شيء — واجهة الدردشة الرسومية ووكيل Hermes وكل إعداداتك ومحادثاتك وأسرارك وسجلاتك'
        }
      }
    },
    localModels: arLocalModels,
    providers: {
      connectAccount: 'ربط حساب',
      haveApiKey: 'لديك مفتاح API بدلاً من ذلك؟',
      intro: 'سجل الدخول باشتراكك دون نسخ مفتاح API. يشغّل Hermes تسجيل الدخول من المتصفح لك داخل التطبيق.',
      connected: 'متصل',
      collapse: 'طي',
      connectAnother: 'ربط مزوّد آخر',
      otherProviders: 'مزوّدون آخرون',
      disconnect: 'قطع الاتصال',
      disconnectInTerminal: 'قطع الاتصال (يشغّل أمر الإزالة في الطرفية)',
      removeConfirm: provider => `إزالة ${provider}؟`,
      removeExternalGeneric: provider => `${provider} يُدار عبر CLI خاص به — أزله من هناك.`,
      removeKeyManaged: provider => `${provider} مُعدّ بمفتاح API. أزله من قسم «مفاتيح API».`,
      removeTerminalConfirm: (provider, command) =>
        `قطع اتصال ${provider}؟ سيُشغَّل الأمر «${command}» في الطرفية لمسح بيانات الاعتماد.`,
      removeTerminalRunning: provider => `جارٍ تشغيل أمر قطع اتصال ${provider} في الطرفية…`,
      removedTitle: 'تمت إزالة الحساب',
      removedMessage: provider => `تمت إزالة ${provider}.`,
      failedRemove: provider => `تعذّرت إزالة ${provider}`,
      noProviderKeys: 'لا توجد مفاتيح API متاحة للمزوّدين.',
      searchKeys: 'البحث عن مزوّدين...',
      noKeysMatch: 'لا يوجد مزوّدون يطابقون بحثك.',
      localEndpoint: {
        title: 'نقطة نهاية محلية / مخصصة',
        description: 'وجّه Hermes إلى أي نقطة نهاية متوافقة مع OpenAI (مثل Zyphra وvLLM وllama.cpp وOllama وغيرها).'
      },
      loading: 'جارٍ تحميل المزوّدين...',
      providerLabels: {},
      providerDescriptions: {}
    },
    sessions: {
      loading: 'جار تحميل الجلسات المؤرشفة...',
      archivedTitle: 'الجلسات المؤرشفة',
      archivedIntro:
        'تُخفى المحادثات المؤرشفة من الشريط الجانبي مع الاحتفاظ بكل رسائلها. اضغط Alt/⌥+Shift مع النقر على محادثة في الشريط الجانبي لأرشفتها.',
      emptyArchivedTitle: 'لا توجد محادثات مؤرشفة',
      emptyArchivedDesc: 'أرشف محادثة لإخفائها هنا.',
      unarchive: 'إلغاء الأرشفة',
      deletePermanently: 'حذف نهائيًا',
      messages: count =>
        AR_PLURAL(count, {
          zero: 'لا رسائل',
          one: 'رسالة واحدة',
          two: 'رسالتان',
          few: `${count} رسائل`,
          many: `${count} رسالة`
        }),
      restored: 'تمت الاستعادة',
      deleteConfirm: title => `حذف «${title}» نهائيًا؟ لا يمكن التراجع عن ذلك.`,
      autoArchiveTitle: 'أرشفة المحادثات الخاملة تلقائيًا',
      autoArchiveDesc:
        'تُؤرشف تلقائيًا المحادثات التي لم تفتحها منذ مدة. لا تُؤرشف المحادثات المثبّتة أبدًا، ولا يُحذف أي شيء — تنتقل المحادثات المؤرشفة إلى هنا فقط.',
      autoArchiveDaysLabel: 'الأرشفة بعد',
      autoArchiveDaysUnit: 'أيام من عدم النشاط',
      autoArchiveFailed: 'تعذّر تحديث الأرشفة التلقائية',
      defaultDirTitle: 'مجلد المشروع الافتراضي',
      defaultDirDesc: 'تبدأ الجلسات الجديدة في هذا المجلد ما لم تختر غيره. اتركه غير مضبوط لاستخدام مجلدك الرئيسي.',
      defaultDirUpdated: shortcut =>
        `تم تحديث مجلد المشروع الافتراضي — ابدأ محادثة جديدة${shortcut ? ` (${shortcut})` : ''} ليسري التغيير`,
      defaultsTo: label => `الافتراضي هو ${label}.`,
      change: 'تغيير',
      choose: 'اختيار',
      clear: 'مسح',
      notSet: 'غير مضبوط',
      failedLoad: 'تعذر تحميل الجلسات المؤرشفة',
      unarchiveFailed: 'فشل إلغاء الأرشفة',
      deleteFailed: 'فشل الحذف',
      updateDirFailed: 'تعذر تحديث المجلد الافتراضي',
      clearDirFailed: 'تعذر مسح المجلد الافتراضي'
    },
    toolsets: {
      loadingConfig: 'جار تحميل الإعدادات',
      savedTitle: 'تم حفظ بيانات الاعتماد',
      savedMessage: key => `تم تحديث ${key}.`,
      removedTitle: 'تمت إزالة بيانات الاعتماد',
      removedMessage: key => `تمت إزالة ${key}.`,
      failedSave: key => `فشل حفظ ${key}`,
      failedRemove: key => `فشل إزالة ${key}`,
      failedReveal: key => `فشل إظهار ${key}`,
      removeConfirm: key => `إزالة ${key} من .env؟`,
      set: 'مضبوط',
      notSet: 'غير مضبوط',
      selectedTitle: 'تم اختيار المزوّد',
      selectedMessage: provider => `${provider} نشط الآن.`,
      failedSelect: provider => `فشل اختيار ${provider}`,
      failedLoad: 'فشل تحميل إعدادات الأدوات',
      noProviderOptions: 'لا تحتوي مجموعة الأدوات هذه على خيارات مزوّد — فعّلها لتعمل مع إعدادك الحالي.',
      noProviders: 'لا يوجد مزوّدون متاحون لمجموعة الأدوات هذه الآن.',
      ready: 'جاهز',
      needsSignIn: 'يحتاج إلى تسجيل الدخول',
      needsSetup: 'يحتاج إلى إعداد',
      badgeTokens: {},
      tagCopy: {},
      activeBackend: 'نشط',
      activeBackendHint: 'هذه هي الواجهة الخلفية النشطة لديك',
      useBackend: 'استخدام هذه الواجهة الخلفية',
      nousIncluded: 'مضمَّن في اشتراك Nous — سجّل الدخول بحساب Nous لتفعيله.',
      nousAuthNeededTitle: 'سجّل الدخول بحساب Nous',
      nousAuthNeededMessage: provider => `تم حفظ ${provider}، لكنه لن يعمل إلا بعد تسجيل الدخول بحساب Nous.`,
      nousAuthSignIn: 'تسجيل الدخول',
      nousAuthDoneTitle: 'تم ربط حساب Nous',
      nousAuthDoneMessage: 'أصبحت الواجهات الخلفية المضمّنة في اشتراكك نشطة الآن.',
      nousAuthFailed: 'لم يكتمل تسجيل الدخول إلى Nous',
      noApiKeyRequired: 'لا يلزم مفتاح API.',
      postSetupHint: step =>
        `تحتاج هذه الواجهة الخلفية إلى تثبيت لمرة واحدة (${step}). يجري التثبيت على هذا الجهاز وقد يستغرق بضع دقائق.`,
      postSetupInstalledHint: 'تم التثبيت. لا تُعِد تشغيل الإعداد إلا إذا تعطّل شيء ما.',
      postSetupRun: 'تشغيل الإعداد',
      postSetupRerun: 'إعادة تشغيل الإعداد',
      postSetupInstalled: 'مثبّت',
      postSetupRunning: 'جار التثبيت…',
      postSetupStarting: 'جار البدء…',
      postSetupCompleteTitle: 'اكتمل الإعداد',
      postSetupCompleteMessage: step => `تم تثبيت ${step}.`,
      postSetupErrorTitle: 'انتهى الإعداد بأخطاء',
      postSetupErrorMessage: step => `لم يكتمل إعداد ${step}. افتح السجلات لمعرفة السبب، ثم شغّل الإعداد مرة أخرى.`,
      postSetupFailed: step => `فشل تشغيل إعداد ${step}`,
      webSearchActive: backend => `البحث: ${backend}`,
      webExtractActive: backend => `الاستخراج: ${backend}`,
      webCapabilityUnset: 'غير مضبوط',
      webUseForSearch: 'استخدامه للبحث',
      webUseForExtract: 'استخدامه للاستخراج',
      webUsedForSearch: 'مستخدم للبحث',
      webUsedForExtract: 'مستخدم للاستخراج',
      webCapabilitySelectedMessage: (provider, capability) =>
        `يتولى ${provider} الآن ${capability === 'search' ? 'البحث في الويب' : 'استخراج محتوى الويب'}.`,
      failedSelectCapability: provider => `تعذّر تعيين ${provider}`,
      loadingModels: 'جارٍ تحميل كتالوج النماذج...',
      modelSectionTitle: 'النموذج',
      modelCount: count =>
        AR_PLURAL(count, {
          zero: 'لا نماذج',
          one: 'نموذج واحد',
          two: 'نموذجان',
          few: `${count} نماذج`,
          many: `${count} نموذجًا`,
          other: `${count} نموذج`
        }),
      modelInUse: 'قيد الاستخدام',
      modelDefault: 'افتراضي',
      modelInactiveHint: 'اختر هذه الواجهة الخلفية أولًا لتغيير نموذجها.',
      modelSelectedTitle: 'تم اختيار النموذج',
      modelSelectedMessage: model => `يسري ${model} على الجلسات الجديدة.`,
      failedSelectModel: model => `تعذّر اختيار ${model}`,
      modelLabels: {},
      modelSpeeds: {},
      modelDescriptions: {},
      modelPrices: {},
      modelStrengthTokens: {},
      terminalBackend: {
        sectionTitle: 'الواجهة الخلفية للتنفيذ',
        loading: 'جارٍ التحقق من الواجهات الخلفية للتنفيذ…',
        failedLoad: 'تعذّر تحميل الواجهات الخلفية للطرفية',
        ready: 'جاهز',
        needsSetup: 'يحتاج إلى إعداد',
        unavailable: 'غير متاح',
        inUse: 'قيد الاستخدام',
        selectedTitle: 'تم اختيار الواجهة الخلفية',
        selectedMessage: backend => `تعمل أوامر الطرفية الآن عبر ${backend}. يسري ذلك على الجلسات الجديدة.`,
        failedSelect: backend => `تعذّر اختيار ${backend}`,
        needsSetupHint: 'تم اختيار هذه الواجهة الخلفية دون اكتمال إعدادها، وستفشل الأوامر حتى يكتمل الإعداد.',
        descriptions: {},
        details: {},
        needsSetupConfirmTitle: backend => `اختيار ${backend} على أي حال؟`,
        needsSetupConfirmDescription: detail =>
          `${detail} لن تتوفر للجلسات التي تبدأ بعد هذا التغيير أي أدوات للطرفية أو الملفات حتى يكتمل الإعداد.`,
        needsSetupConfirmDescriptionGeneric:
          'لم تُعَدّ هذه الواجهة الخلفية بعد. لن تتوفر للجلسات التي تبدأ بعد هذا التغيير أي أدوات للطرفية أو الملفات حتى يكتمل الإعداد.',
        needsSetupConfirmAction: 'اختيار على أي حال',
        unavailableTitle: 'أوامر الطرفية غير متاحة',
        unavailableMessage: backend =>
          `لا يستطيع Hermes تشغيل أوامر الطرفية الآن: ${backend} غير جاهز. بدّل إلى التنفيذ المحلي، أو أكمل إعداد ${backend} ثم أعد المحاولة.`,
        openBackendSettings: 'فتح إعدادات الطرفية',
        useLocal: 'استخدام التنفيذ المحلي',
        switchedToLocal: 'تعمل أوامر الطرفية الآن محليًا. يسري ذلك على الجلسات الجديدة.'
      },
      computerUse: {
        checking: 'جارٍ التحقق من حالة استخدام الحاسوب…',
        statusReadFailed: 'تعذّرت قراءة حالة استخدام الحاسوب',
        unsupported: platform => `استخدام الحاسوب غير مدعوم على هذه المنصة (${platform}).`,
        installHint: 'ثبّت الواجهة الخلفية cua-driver أدناه للتحكم في هذا الجهاز.',
        installGrantHint: 'ثم امنح إذنَي «تسهيلات الاستخدام» و«تسجيل الشاشة» هنا.',
        platformNotes: {
          linux: 'يتحكم في سطح المكتب عبر طبقة تسهيلات الاستخدام في X11/XWayland — دون طلب إذن.',
          win32: 'قد يُظهر التشغيل الأول تنبيه Windows SmartScreen لعامل UIAccess الخاص بـ cua-driver — اسمح به.'
        },
        macGrantNote:
          'ترتبط الأذونات بهوية CuaDriver نفسها (com.trycua.driver)، لا بـ Hermes، لذلك ينسب مربع الحوار الإذن إلى العملية التي تتحكم في جهاز Mac.',
        recheck: 'إعادة الفحص',
        accessibility: 'تسهيلات الاستخدام',
        accessibilityHint: 'يتيح لـ cua-driver إرسال النقرات وضغطات المفاتيح وقراءة شجرة تسهيلات الاستخدام.',
        screenRecording: 'تسجيل الشاشة',
        screenRecordingHint: 'يتيح لـ cua-driver التقاط صور لنوافذ التطبيقات.',
        driverHealth: 'حالة برنامج التشغيل',
        granted: 'ممنوح',
        notGranted: 'غير ممنوح',
        ready: 'جاهز',
        notReady: 'غير جاهز',
        unknown: 'غير معروف',
        readyMessage: 'استخدام الحاسوب جاهز. اطلب من الوكيل التقاط تطبيق والنقر فيه.',
        grantPermissions: 'منح الأذونات',
        waitingApproval: 'في انتظار الموافقة…',
        grantFailed: 'تعذّر طلب الأذونات',
        approveTitle: 'وافق في إعدادات النظام',
        approveMessage: 'سيعرض macOS مربع أذونات منسوباً إلى CuaDriver. وافق عليه ثم عُد إلى هنا.'
      },
      browserRealProfile: {
        label: 'استخدام ملفي الشخصي الحقيقي في المتصفح',
        description:
          'ينسخ تسجيلات الدخول وملفات تعريف الارتباط من متصفحك الافتراضي إلى لقطة مُدارة يتصفح بها الوكيل، ويسجّل بها الدخول في علامة تبويب المتصفح المدمج أيضًا. لا يُفتح ملفك الشخصي الفعلي مباشرةً أبدًا. يسري على الجلسات الجديدة.',
        enabledTitle: 'تم تفعيل التصفح بالملف الشخصي الحقيقي',
        enabledMessage: 'ستتصفح الجلسات الجديدة بلقطة من الملف الشخصي لمتصفحك الافتراضي.',
        disabledTitle: 'تم إيقاف التصفح بالملف الشخصي الحقيقي',
        disabledMessage:
          'ستُحذف لقطة الملف الشخصي ويُسجَّل خروج المتصفح المدمج منها، وستستخدم الجلسات الجديدة متصفحًا نظيفًا.',
        failedSave: 'تعذّر حفظ إعداد الملف الشخصي الحقيقي',
        reimportSignins: 'إعادة استيراد تسجيلات الدخول',
        signinsImportedTitle: 'تسجيلات الدخول في المتصفح المدمج',
        signinsImported: count =>
          `تم تسجيل الدخول إلى المتصفح المدمج باستخدام ${count} من ملفات تعريف الارتباط من ملف متصفحك.`,
        signinsRemote: 'تعمل هذه الواجهة الخلفية على جهاز آخر، لذا لا يُستورد ملف متصفحها إلى المتصفح المدمج.',
        signinsFailed: 'تعذر استيراد تسجيلات الدخول إلى المتصفح المدمج',
        prompt: {
          title: 'ابقَ مسجّل الدخول إلى مواقعك',
          body: 'اسمح لـ Hermes بالتصفح بلقطة من الملف الشخصي لمتصفحك الافتراضي، لتُفتح المواقع وأنت مسجّل الدخول، سواء للوكيل أو في علامة تبويب المتصفح المدمج.',
          bulletSnapshot: 'تُنسخ ملفات تعريف الارتباط وتسجيلات الدخول إلى لقطة مُدارة.',
          bulletLiveProfile: 'لا يُفتح الملف الشخصي الفعلي لمتصفحك مباشرةً أبدًا.',
          bulletLocal: 'لا يغادر أي شيء هذا الجهاز.',
          dontShowAgain: 'عدم الإظهار مجددًا',
          notNow: 'ليس الآن',
          enable: 'استخدام ملفي الشخصي'
        }
      },
      nousAuthFailedMessage: 'حاول مرة أخرى.',
      nousAuthTryAgain: 'إعادة المحاولة',
      postSetupOpenLogs: 'فتح السجلات',
      postSetupRunAgain: 'تشغيل مرة أخرى'
    },
    subpages: {
      appearanceTheme: 'السمة',
      appearanceTypography: 'الخطوط',
      appearanceWindowLayout: 'النافذة والتخطيط',
      appearanceChatDisplay: 'عرض الدردشة',
      appearancePet: 'الحيوان الأليف',
      appearanceGeneral: 'عام',
      modelMain: 'النموذج الرئيسي',
      modelAuxiliary: 'النماذج المساعدة',
      modelMoa: 'مزيج الوكلاء',
      modelFallbacks: 'النماذج الاحتياطية',
      chatBehavior: 'السلوك',
      chatAttachments: 'المرفقات',
      workspaceProjects: 'المشروعات والاكتشاف',
      workspaceShell: 'بيئة الصدفة',
      workspaceFiles: 'الملفات والتنفيذ',
      safetyApprovals: 'الموافقات',
      safetyPrivacy: 'الخصوصية والشبكة',
      safetyCheckpoints: 'نقاط الاستعادة',
      browserProfile: 'الملف الشخصي للمتصفح',
      browserNetwork: 'عناوين URL المحلية والخاصة',
      memoryPersistent: 'الذاكرة الدائمة',
      memoryContext: 'السياق والضغط',
      voiceConversation: 'محادثة صوتية',
      voiceTranscription: 'تحويل الكلام إلى نص',
      voiceSpeech: 'تحويل النص إلى كلام',
      advancedRuntime: 'حدود الوكيل',
      advancedTools: 'الوصول إلى الأدوات',
      advancedTerminal: 'الواجهة الخلفية للطرفية',
      advancedOutput: 'حدود الإخراج',
      advancedDelegation: 'الوكلاء الفرعيون',
      advancedDesktop: 'تطبيق سطح المكتب وبدء التشغيل',
      gatewayConnection: 'البوابة الأساسية',
      gatewayDevices: 'الاتصالات المحفوظة',
      gatewayManagedUpdates: 'التحديثات عن بُعد',
      gatewayManagedUpdatesUnavailable:
        'تتطلب التحديثات عن بُعد إصدارًا من تطبيق سطح المكتب يدعم تحديثات SSH المُدارة.',
      gatewayManagedUpdatesEmpty: 'أضف اتصال SSH في «الاتصالات المحفوظة» لإدارة تحديثاته هنا.',
      keyboardShortcuts: 'اختصارات لوحة المفاتيح',
      hudGesture: 'إيماءة HUD',
      screenCapture: 'التقاط الشاشة',
      notificationAlerts: 'تنبيهات سطح المكتب',
      notificationSounds: 'الأصوات',
      archivedSessions: 'الأرشفة والاحتفاظ',
      defaultDirectory: 'مجلد المشروع الافتراضي',
      vaultCredentials: 'بيانات الاعتماد المحفوظة',
      vaultSources: 'مديرو كلمات المرور',
      appUpdates: 'الإصدار والتحديثات',
      uninstall: 'إلغاء التثبيت',
      billingOverview: 'نظرة عامة',
      billingPlans: 'الخطط'
    },
    uninstallSection: arUninstallSection,
    computerUse: {
      accessibility: 'تسهيلات الاستخدام',
      screenRecording: 'تسجيل الشاشة',
      driverHealth: 'حالة برنامج التشغيل'
    },
    hudModifier: {
      title: 'اضغط لاستدعاء HUD',
      description:
        'اضغط ⌘ + Option ثم حرّرهما على Mac، أو Ctrl + Alt على Windows/Linux، لإظهار HUD في المقدمة من أي تطبيق. معطّل افتراضيًا، ويسري على هذا الجهاز فقط.',
      permission:
        'اسمح لـ Hermes في إعدادات النظام ← الخصوصية والأمن ← مراقبة الإدخال، ثم أعد المحاولة. لا تسجّل هذه الإيماءة ضغطات المفاتيح ولا تلتقط شاشتك.',
      unavailable:
        'تعذّر بدء مساعد إيماءة HUD أو توقف بشكل غير متوقع. أعد المحاولة أو أعد تشغيل Hermes. لا يزال اختصار HUD الحالي يعمل داخل Hermes.',
      missingHelper: 'ينقص تثبيتَ Hermes هذا مساعدُ إيماءة HUD. حدّث Hermes أو أعد تثبيته، ثم أعد المحاولة.',
      unsupportedSession:
        'لا تدعم جلسة سطح المكتب هذه الضغط العام على مفاتيح التعديل. يتطلب Linux نظام X11، ولا يُدعم Wayland.'
    },
    screenshot: {
      enabledTitle: 'اختصار لقطة الشاشة',
      enabledDesc:
        'اضغط مفتاحي Command معًا من أي تطبيق لالتقاط نافذته الأمامية وإرفاقها بمسودتك الحالية في Hermes. لا يُرسَل أي شيء تلقائيًا. معطّل افتراضيًا، ويسري على جهاز Mac هذا فقط. قد تحتوي النافذة على معلومات حساسة — راجع المرفق قبل الإرسال.',
      statusTitle: 'حالة اختصار لقطة الشاشة',
      checking: 'جارٍ التحقق من اختصار لقطة الشاشة…',
      disabled: 'اختصار لقطة الشاشة معطّل.',
      starting: 'جارٍ تشغيل مستمع الاختصار. لم يصبح جاهزًا بعد.',
      ready: 'الاختصار جاهز. تُرفق لقطات الشاشة بمسودتك الحالية دون إرسالها.',
      inputPermission:
        'يتيح إذن مراقبة الإدخال لـ Hermes اكتشاف ضغط مفتاحي Command أثناء نشاط تطبيق آخر. اسمح لـ Hermes في إعدادات النظام ← الخصوصية والأمن ← مراقبة الإدخال، ثم عُد إلى هنا وأعد المحاولة.',
      screenPermission:
        'يتيح إذن تسجيل الشاشة لـ Hermes التقاط نافذة التطبيق الأمامية عند استخدام هذا الاختصار. اسمح لـ Hermes في إعدادات النظام ← الخصوصية والأمن ← تسجيل الشاشة، ثم عُد إلى هنا وأعد المحاولة. أعد تشغيل Hermes إذا طلب macOS ذلك.',
      openSettings: 'فتح إعدادات النظام',
      retry: 'إعادة المحاولة',
      unavailable: 'اختصار لقطة الشاشة غير متاح. أعد المحاولة أو عطّله.',
      errorTitle: 'خطأ في اختصار لقطة الشاشة',
      loadFailed: 'تعذّرت قراءة حالة الاختصار. أعد المحاولة للتحقق من إعداده الحالي.',
      saveFailed: 'تعذّر تأكيد تغيير الاختصار. أعد المحاولة للتحقق من إعداده الحالي.',
      permissionFailed: 'تعذّر فتح إعدادات النظام. افتح «الخصوصية والأمن» يدويًا، ثم أعد المحاولة.',
      captureFailed: 'تعذّر التقاط النافذة الأمامية. لم يُرفق أي شيء ولم يُرسَل.',
      contextChanged: 'تغيّرت المسودة الحالية أثناء الالتقاط. لم تُرفق لقطة الشاشة ولم تُرسَل.'
    },
    envKeys: {},
    memoryLayers: arMemoryLayers
  },
  modelPicker: {
    title: 'تبديل النموذج',
    current: 'الحالي:',
    unknown: '(غير معروف)',
    search: 'تصفية المزوّدين والنماذج...',
    noModels: 'لم يُعثر على نماذج.',
    addProvider: 'إضافة مزوّد',
    loadFailed: 'تعذّر تحميل النماذج',
    loadingIntoMemory: 'جارٍ التحميل في الذاكرة',
    downloading: 'جارٍ التنزيل',
    localDownloadsHeading: 'محلي',
    noAuthenticatedProviders: 'لا يوجد مزوّدون مصادق عليهم.',
    pro: 'Pro',
    proNeedsSubscription: 'تتطلب نماذج Pro اشتراكًا مدفوعًا في Nous.',
    free: 'مجاني',
    freeTier: 'المستوى المجاني',
    priceTitle: 'سعر الإدخال / الإخراج لكل مليون رمز',
    wasPrice: 'سابقًا',
    addCustomModelAction: 'إضافة نموذج مخصص…',
    customModel: 'نموذج مخصص',
    customModelPlaceholder: 'اكتب معرّف النموذج، مثل openai/gpt-5',
    today: 'اليوم',
    week: 'الأسبوع',
    month: 'الشهر',
    topTier: 'النماذج الكبيرة (شهري)',
    included: 'كل النماذج أدناه مشمولة',
    pausedRenewal: 'متوقف: التجديد غير مدفوع',
    pausedOther: 'متوقف',
    includedUsedUp: 'نفد الاستخدام المضمن',
    limitReached: name => `تم بلوغ الحد ${name}`,
    limitNames: { day: 'اليومي', month: 'الشهري', top_tier: 'الشهري للنماذج الكبيرة', week: 'الأسبوعي' },
    limitThenCredits: 'النماذج المدفوعة تستخدم رصيدك الآن (الدفع حسب الاستخدام)',
    limitThenCreditsLarge: 'النماذج الكبيرة تستخدم رصيدك الآن (الدفع حسب الاستخدام)',
    limitThenWait: 'النماذج المجانية فقط حتى ذلك الحين',
    limitThenWaitLarge: 'النماذج الكبيرة متوقفة مؤقتًا حتى ذلك الحين',
    percentUsed: percent => `${percent} مستخدم`,
    resetsIn: duration => `يُعاد التعيين خلال ${duration}`,
    usageLevels: { free: 'مجاني', top_tier: 'كبير' },
    sectionRecommended: 'موصى بها',
    sectionOther: 'نماذج أخرى',
    largeFootnote: 'تستهلك النماذج الكبيرة أيضًا حدّك الشهري للنماذج الكبيرة.'
  },
  modelVisibility: {
    title: 'النماذج',
    search: 'بحث في النماذج',
    noAuthenticatedProviders: 'لا يوجد مزوّدون مصادق عليهم.',
    addProvider: 'إضافة مزوّد…',
    addCustomModel: 'إضافة نموذج مخصص',
    removeCustomModel: 'إزالة النموذج المخصص',
    resetToDefaults: 'إعادة التعيين إلى الافتراضي',
    resetConfirm: 'إعادة إعدادات ظهور النماذج إلى الافتراضي؟',
    resetDescription:
      'ستُمسح اختياراتك للنماذج الظاهرة والمخفية وتعود قائمة كل مزوّد الافتراضية. تُحفظ النماذج المخصصة التي أضفتها وتظهر.',
    resetAction: 'إعادة التعيين'
  },
  interfaceMode: {
    title: 'وضع الواجهة',
    hint: 'يغيّر ما يظهر، وليس ما يستطيع Hermes فعله.',
    sessionNote: 'يحدده الوضع البسيط. التغيير هنا يستمر لهذه الجلسة فقط؛ بدّل إلى المتقدم لجعله خيارك.',
    simple: {
      label: 'بسيط',
      description: 'للتحدث مع Hermes. الشريط الجانبي والدردشة؛ بلا طرفية أو لوحات ملفات أو فروقات.'
    },
    advanced: {
      label: 'متقدم',
      description: 'للمطورين. الطرفية والملفات والفروقات وشريط الحالة والتخطيطات، كما أعددتها.'
    }
  },
  modelAssignment: {
    saveFailed: 'لم يحفظ Hermes تغيير النموذج هذا.',
    confirmTitle: 'تحذير اختيار النموذج',
    confirmDetail: 'أكّد فقط إذا كنت تقبل هذه المقايضة.',
    confirmAction: 'تأكيد',
    declined: 'أُلغي تغيير النموذج — رفضت تحذير فئة الخدمة التي تستخدم البيانات للتدريب.'
  }
} satisfies Pick<
  TranslationOverrides,
  'language' | 'settings' | 'modelPicker' | 'modelVisibility' | 'interfaceMode' | 'modelAssignment'
>
