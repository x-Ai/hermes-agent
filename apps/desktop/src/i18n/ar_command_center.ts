import { arCronControl } from './ar_cron_control'
import { AR_PLURAL } from './ar_plural'
import type { TranslationOverrides } from './define-locale'

export const arCommandCenter = {
  commandCenter: {
    close: 'إغلاق',
    paletteTitle: 'لوحة الأوامر',
    back: 'رجوع',
    searchPlaceholder: 'البحث في الجلسات والعروض والإجراءات',
    goTo: 'انتقال إلى',
    goToSession: 'الانتقال إلى الجلسة',
    branches: 'الفروع',
    projects: 'المشاريع',
    openFolder: 'فتح مجلد كمشروع…',
    openFolderAt: path => `فتح المجلد كمشروع — ${path}`,
    newSessionInProject: project => `جلسة جديدة في ${project}`,
    commands: 'الأوامر',
    startInBranch: branch => `محادثة جديدة في ${branch}`,
    commandCenter: 'مركز الأوامر',
    appearance: 'المظهر',
    settings: 'الإعدادات',
    changeTheme: 'تغيير السمة',
    changeColorMode: 'تغيير نمط الألوان',
    pets: {
      title: 'الحيوانات الأليفة',
      placeholder: 'البحث في الحيوانات الأليفة...',
      loading: 'جار تحميل معرض petdex...',
      error: 'تعذّر الوصول إلى معرض petdex.',
      staleBackend: 'أعد تشغيل Hermes لاستخدام الحيوانات الأليفة — الخادم الخلفي أقدم من هذه الميزة.',
      empty: 'لا توجد حيوانات أليفة مطابقة.',
      turnOff: 'إيقاف التشغيل',
      turnOn: 'تشغيل',
      installed: 'مثبّت',
      generatedTag: 'مُولّد',
      adoptFailed: 'تعذّر تبنّي ذلك الحيوان الأليف.',
      toggleFailed: enabled => `تعذّر ${enabled ? 'تشغيل' : 'إيقاف'} الحيوان الأليف.`,
      noneAvailable: 'لا توجد حيوانات أليفة متاحة — اختر واحدا أدناه لتثبيته.'
    },
    generatePet: {
      title: 'توليد حيوان أليف',
      placeholder: 'صف حيوانا أليفا لتوليده...',
      promptHint: 'اكتب وصفا، ثم اضغط Enter لرسم أربعة مظاهر.',
      readyHint: 'اضغط Enter لرسم أربعة مظاهر من وصفك.',
      generate: 'توليد',
      generating: 'جار التوليد...',
      retry: 'إعادة المحاولة',
      hatch: 'تفقيس',
      spawning: 'جار الإنشاء...',
      hatching: 'جار تفقيس حيوانك الأليف...',
      hatchingSub: 'جار بثّ الحياة فيه...',
      hatched: 'تم التفقيس!',
      hatchRow: (_state, done, total) => `جار رسم الإطار ${done} من ${total}...`,
      hatchComposing: 'جار تجميع الأجزاء...',
      hatchSaving: 'أوشكنا على الانتهاء...',
      namePlaceholder: 'سمِّ حيوانك الأليف',
      staleBackend: 'حدّث Hermes لتوليد الحيوانات الأليفة.',
      backgroundHint: 'يمكنك إغلاق هذا — سيُعلِمك Hermes عند الانتهاء.',
      slowProviderHint: 'قد يستغرق هذا عدة دقائق',
      remix: 'إعادة مزج',
      remixConfirmTitle: 'إعادة مزج هذا المظهر؟',
      remixConfirmBody: 'يولّد هذا مجموعة جديدة من المسوّدات باستخدام هذا كنقطة بداية. قد يستغرق عدة دقائق.',
      genericError: 'فشل التوليد — حاول مجددا أو اختر اقتراحا.',
      referenceImageTooLarge: 'صورة المرجع كبيرة جدا. استخدم واحدة أقل من 16 MB.',
      referenceImageInvalid: 'تعذّرت قراءة صورة المرجع تلك. جرّب PNG أو JPG أو WebP أو GIF.',
      adopt: 'تبنّي',
      startOver: 'البدء من جديد',
      hatchingProgress: 'تقدم التفقيس',
      referenceFallback: 'مرجع',
      removeReference: 'إزالة المرجع',
      unavailableTitle: 'أضف خدمة خلفية لتوليد الصور',
      unavailableDesc: 'يتطلب تفقيس حيوان أليف مخصص موفراً يمكنه استخدام صورة مرجعية.',
      setupImageGeneration: 'إعداد توليد الصور',
      getKeyFrom: 'احصل على مفتاح من',
      addReference: 'إضافة صورة مرجعية'
    },
    installTheme: {
      title: 'تثبيت سمة...',
      pageTitle: 'تثبيت سمة',
      placeholder: 'البحث في VS Code Marketplace...',
      loading: 'جار البحث في Marketplace...',
      error: 'تعذّر الوصول إلى Marketplace.',
      installError: 'تعذّر تثبيت هذه السمة.',
      invalidColorTheme: 'لا تحتوي السمة على إعداد ”colors“، لذا فهي ليست سمة ألوان VS Code صالحة.',
      empty: 'لا توجد سمات مطابقة.',
      install: 'تثبيت',
      installing: 'جار التثبيت...',
      installed: 'مثبّت',
      installs: count =>
        AR_PLURAL(count, {
          one: 'عملية تثبيت واحدة',
          two: 'عمليتا تثبيت',
          few: `${count} عمليات تثبيت`,
          many: `${count} عملية تثبيت`
        })
    },
    settingsFields: 'حقول الإعدادات',
    mcpServers: 'خوادم MCP',
    archivedChats: 'المحادثات المؤرشفة',
    sections: {
      maintenance: 'الصيانة',
      sessions: 'الجلسات',
      system: 'النظام',
      usage: 'الاستخدام'
    },
    nav: {
      newChat: {
        title: 'جلسة جديدة',
        detail: 'بدء جلسة جديدة'
      },
      settings: {
        title: 'الإعدادات',
        detail: 'ضبط إعدادات Hermes Desktop'
      },
      messaging: {
        title: 'المراسلة',
        detail: 'إعداد Telegram وSlack وDiscord والمزيد'
      },
      artifacts: {
        title: 'العناصر',
        detail: 'استعراض المخرجات المولّدة'
      },
      capabilities: {
        title: 'المهارات والأدوات',
        detail: 'المهارات والأدوات وخوادم MCP والإضافات'
      }
    },
    sectionEntries: {
      sessions: {
        title: 'لوحة الجلسات',
        detail: 'البحث في الجلسات وتثبيتها وإدارتها'
      },
      system: {
        title: 'لوحة النظام',
        detail: 'حالة البوابة والسجلات وإعادة التشغيل/التحديث'
      },
      usage: {
        title: 'لوحة الاستخدام',
        detail: 'نشاط الرموز والتكلفة والمهارات'
      }
    },
    providerNavigate: 'التنقل',
    providerSessions: 'الجلسات',
    refresh: 'تحديث',
    refreshing: 'جار التحديث...',
    noResults: 'لا توجد نتائج',
    pinSession: 'تثبيت الجلسة',
    unpinSession: 'إلغاء تثبيت الجلسة',
    exportSession: 'تصدير الجلسة',
    deleteSession: 'حذف الجلسة',
    noSessions: 'لا توجد جلسات',
    gatewayRunning: 'البوابة تعمل',
    gatewayStopped: 'البوابة متوقفة',
    hermesActiveSessions: (version, count) => `Hermes ${version} · الجلسات النشطة: ${count}`,
    restartGateway: 'إعادة تشغيل البوابة',
    openBrowser: 'تبديل المتصفح',
    toggleBrowser: 'تبديل المتصفح',
    gatewayRestartFailed: 'فشل إعادة تشغيل البوابة.',
    updateHermes: 'تحديث Hermes',
    reloadWindow: 'إعادة تحميل النافذة',
    actionRunning: 'الإجراء قيد التشغيل',
    actionDone: 'اكتمل الإجراء',
    actionFailed: 'فشل الإجراء',
    actionStartedWaiting: 'بدأ الإجراء، جار الانتظار...',
    loadingStatus: 'جار تحميل الحالة',
    recentLogs: 'السجلات الأخيرة',
    logSearchPlaceholder: 'البحث في سطور السجل...',
    noLogs: 'لا توجد سجلات',
    days: count => AR_PLURAL(count, { one: 'يوم واحد', two: 'يومان', few: `${count} أيام`, many: `${count} يومًا` }),
    statSessions: 'الجلسات',
    statApiCalls: 'نداءات API',
    statTokens: 'الرموز (إدخال/إخراج)',
    statCost: 'التكلفة التقديرية',
    actualCost: cost => `التكلفة الفعلية ${cost}`,
    loadingUsage: 'جار تحميل الاستخدام',
    noUsage: period =>
      AR_PLURAL(period, {
        one: 'لا يوجد استخدام خلال آخر يوم.',
        two: 'لا يوجد استخدام خلال آخر يومين.',
        few: `لا يوجد استخدام خلال آخر ${period} أيام.`,
        many: `لا يوجد استخدام خلال آخر ${period} يومًا.`
      }),
    retry: 'إعادة المحاولة',
    dailyTokens: 'الرموز اليومية',
    input: 'إدخال',
    output: 'إخراج',
    noDailyActivity: 'لا يوجد نشاط يومي',
    topModels: 'أكثر النماذج استخداما',
    noModelUsage: 'لا يوجد استخدام نماذج',
    topSkills: 'أكثر المهارات استخداما',
    noSkillActivity: 'لا يوجد نشاط مهارات',
    actions: count =>
      AR_PLURAL(count, { one: 'إجراء واحد', two: 'إجراءان', few: `${count} إجراءات`, many: `${count} إجراءً` }),
    logFile: 'ملف السجل',
    logLevel: 'المستوى',
    maintenance: {
      runOps: 'التشخيص',
      doctor: 'تشغيل doctor',
      doctorDesc: 'فحص سلامة التثبيت والإعدادات والمزوّدين',
      securityAudit: 'تدقيق أمني',
      securityAuditDesc: 'فحص الإعدادات والمهارات بحثًا عن إعدادات خطرة',
      backup: 'إنشاء نسخة احتياطية',
      backupDesc: 'ضغط الإعدادات والذكريات والمهارات والجلسات في ملف zip',
      debugShare: 'مشاركة تقرير التصحيح',
      debugShareDesc: 'رفع تقرير منقّح مع السجلات والحصول على روابط للمشاركة (تُحذف تلقائيًا بعد 6 ساعات)',
      debugShareConfirm: 'رفع تقرير التصحيح إلى خدمة لصق عامة؟',
      debugShareConfirmDesc:
        'يرفع معلومات النظام والسجلات الكاملة إلى خدمة لصق عامة. تُحجب الأسرار، لكن رسائلك الأخيرة ومخرجات الأدوات ومسارات الملفات وأسماءها تبقى في السجلات ويمكن لأي شخص لديه الرابط قراءتها. تُحذف اللصقات تلقائيًا بعد 6 ساعات؛ وإذا تعذّر الوصول إلى paste.rs فإن البديل dpaste.com يبقيها عامة ليوم واحد ولا يمكن حذفها قبل ذلك.',
      debugShareRunning: 'جارٍ رفع تقرير التصحيح…',
      debugShareLinks: 'روابط المشاركة',
      debugShareFailed: 'فشلت مشاركة تقرير التصحيح',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ الرابط',
      curator: 'منسّق المهارات',
      curatorDesc: 'مراجعة في الخلفية تؤرشف المهارات القديمة التي أنشأها الوكيل',
      curatorPaused: 'متوقف مؤقتًا',
      curatorActive: 'نشط',
      curatorDisabled: 'معطّل',
      curatorLastRun: when => `آخر تشغيل ${when}`,
      curatorNeverRan: 'لم يعمل بعد',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      runNow: 'تشغيل الآن',
      memoryData: 'بيانات الذاكرة',
      memoryDataDesc: 'ملفات الذاكرة المدمجة التي تُضاف إلى كل جلسة',
      memoryProvider: name => `المزوّد النشط: ${name}`,
      builtinMemory: 'مدمج',
      memoryFile: 'ذاكرة الوكيل (MEMORY.md)',
      userFile: 'ملف المستخدم (USER.md)',
      bytes: size => size,
      empty: 'فارغ',
      resetMemory: 'إعادة تعيين الذاكرة',
      resetUser: 'إعادة تعيين الملف الشخصي',
      resetAll: 'إعادة تعيين كليهما',
      resetConfirm: target => `حذف ${target}؟ لا يمكن التراجع عن هذا.`,
      resetDone: files => `تم حذف ${files}.`,
      resetFailed: 'فشلت إعادة تعيين الذاكرة',
      actionStarted: name => `بدأ ${name} — جارٍ تتبّع السجل…`,
      actionFailed: name => `تعذّر بدء ${name}`,
      running: 'جارٍ التشغيل…',
      viewLog: 'سجل الإجراءات'
    },
    sharedGatewayRestartTitle: 'إعادة تشغيل البوابة المشتركة؟',
    sharedGatewayRestartDescription: bots => `تُعيد كل الروبوتات على هذا الجهاز الاتصال: ${bots}`,
    sharedGatewayRestartConfirm: 'إعادة تشغيل الكل',
    sharedGatewayRestarted: count =>
      AR_PLURAL(count, {
        one: 'تمت إعادة تشغيل البوابة المشتركة (روبوت واحد)',
        two: 'تمت إعادة تشغيل البوابة المشتركة (روبوتان)',
        few: `تمت إعادة تشغيل البوابة المشتركة (${count} روبوتات)`,
        many: `تمت إعادة تشغيل البوابة المشتركة (${count} روبوتًا)`
      })
  },
  messaging: {
    search: 'بحث',
    statusFilter: {
      all: 'الكل',
      bad: 'أخطاء',
      good: 'متصل',
      muted: 'غير نشط',
      warn: 'يحتاج انتباهًا'
    },
    loading: 'جار التحميل...',
    loadFailed: 'فشل التحميل',
    states: {
      connected: 'متصل',
      connecting: 'جار الاتصال',
      disconnected: 'غير متصل',
      disabled: 'معطّل',
      fatal: 'خطأ',
      gateway_stopped: 'تم إيقاف بوابة المراسلة',
      not_configured: 'يحتاج إعدادا',
      pending_restart: 'يلزم إعادة التشغيل',
      retrying: 'جار إعادة المحاولة',
      startup_failed: 'فشل بدء التشغيل'
    },
    unknown: 'غير معروف',
    hintPendingRestart: 'أعد تشغيل البوابة من شريط الحالة لتطبيق هذا التغيير.',
    hintGatewayStopped: 'شغّل البوابة من شريط الحالة للاتصال.',
    credentialsSet: 'بيانات الاعتماد مضبوطة',
    needsSetup: 'يحتاج إعدادا',
    gatewayStopped: 'البوابة متوقفة',
    getCredentials: 'الحصول على بيانات الاعتماد',
    openSetupGuide: 'فتح دليل الإعداد',
    required: 'مطلوب',
    recommended: 'موصى به',
    advanced: count => `إعدادات متقدمة (${count})`,
    noTokenNeeded: 'لا تحتاج هذه المنصة إلى رمز هنا. اتبع دليل الإعداد أعلاه، ثم فعّلها أدناه.',
    enabled: 'مفعل',
    disabled: 'معطل',
    unsavedChanges: 'تغييرات غير محفوظة',
    saving: 'جار الحفظ...',
    saveChanges: 'حفظ التغييرات',
    saved: 'تم الحفظ',
    replaceValue: 'استبدال القيمة',
    openDocs: 'فتح الوثائق',
    clearField: key => `مسح ${key}`,
    addListEntry: 'إضافة آخر',
    removeListEntry: 'إزالة',
    listEntryPlaceholder: 'أدخل معرّفًا',
    enableAria: name => `تفعيل ${name}`,
    disableAria: name => `تعطيل ${name}`,
    platformEnabled: name => `تم تفعيل ${name}`,
    platformDisabled: name => `تم تعطيل ${name}`,
    restartToApply: 'يسري هذا التغيير بعد إعادة تشغيل البوابة.',
    setupSaved: name => `تم حفظ إعداد ${name}`,
    restartToReconnect: 'تسري بيانات الاعتماد الجديدة بعد إعادة تشغيل البوابة.',
    appliedLive: 'تم التطبيق على البوابة قيد التشغيل.',
    connectingLive: 'البوابة قيد التشغيل تتصل باستخدام بيانات الاعتماد الجديدة.',
    keyCleared: key => `تم مسح ${key}`,
    setupUpdated: name => `تم تحديث إعداد ${name}`,
    failedUpdate: name => `فشل تحديث ${name}`,
    failedSave: name => `فشل حفظ ${name}`,
    failedClear: key => `فشل مسح ${key}`,
    pendingRequests: count => `الطلبات المعلقة (${count})`,
    pendingAria: count =>
      AR_PLURAL(count, {
        one: 'طلب اقتران واحد معلّق',
        two: 'طلبا اقتران معلّقان',
        few: `${count} طلبات اقتران معلّقة`,
        many: `${count} طلب اقتران معلّقًا`
      }),
    approvedUsers: count => `المستخدمون المعتمدون (${count})`,
    approve: 'موافقة',
    approving: 'جارٍ الموافقة…',
    revoke: 'إلغاء الوصول',
    revoking: 'جارٍ إلغاء الوصول…',
    revokeAria: name => `إلغاء وصول ${name}`,
    revokeTitle: 'إلغاء الوصول',
    revokeDesc: (name: string) => `سيفقد ${name} الوصول، ولن يُتعرَّف عليه بدءًا من رسالته التالية.`,
    approvedUser: name => `تمت الموافقة على ${name}`,
    approvedHint: 'سيُتعرَّف عليهم تلقائيًا عند رسالتهم التالية.',
    revokedUser: name => `أُلغي وصول ${name}`,
    failedApprove: name => `تعذّرت الموافقة على ${name}`,
    failedRevoke: name => `تعذّر إلغاء وصول ${name}`,
    pairingLockedOut: 'محاولات موافقة فاشلة كثيرة — أُقفلت هذه المنصة. حاول مرة أخرى لاحقًا.',
    waitingSince: minutes => (minutes < 1 ? 'الآن' : `منذ ${minutes} د`),
    restartNeeded: 'تم الحفظ. أعد تشغيل بوابة المراسلة لتطبيق الإعدادات الجديدة.',
    restartNow: 'إعادة التشغيل الآن',
    restarting: 'جارٍ إعادة التشغيل…',
    restartFailedManual: 'فشلت إعادة تشغيل البوابة — أعد تشغيلها يدويًا وتحقق من سجلات البوابة.',
    relayLink: {
      title: 'Team Gateway',
      badge: 'لا حاجة لرمز بوت',
      intro: (platform: string) =>
        `يصل ${platform} إلى هذا الوكيل عبر بوت Hermes المشترك. اربط حسابك في ${platform} ثم راسل البوت للتحدث مع وكيلك.`,
      link: (platform: string) => `ربط ${platform}`,
      linkAnother: (platform: string) => `ربط حساب ${platform} آخر`,
      linkedAccounts: 'الحسابات المرتبطة',
      unlink: 'إلغاء الربط',
      unlinkFailed: 'تعذر إلغاء ربط هذا الحساب',
      stepOpen: (platform: string) => `1. امسح الرمز بهاتفك، أو افتح البوت في ${platform}.`,
      stepSend: '2. أرسل هذه الرسالة إلى البوت من الحساب الذي تريد ربطه:',
      open: (platform: string) => `فتح ${platform}`,
      copy: 'نسخ الرسالة',
      copied: 'تم النسخ',
      copyFailed: (command: string) => `تعذر النسخ. اكتب ${command} بدلًا من ذلك.`,
      waiting: 'بانتظار وصول رسالتك إلى البوت. الرمز يعمل مرة واحدة.',
      linked: (platform: string) => `تم ربط حساب ${platform}. راسل البوت للتحدث مع وكيلك.`,
      expired: 'انتهت صلاحية الرمز قبل استخدامه. احصل على رمز جديد وحاول مرة أخرى.',
      refused: (platform: string) => `رفض ${platform} الربط. احصل على رمز جديد وحاول مرة أخرى.`,
      qrAlt: (platform: string) => `رمز QR لبوت ${platform} المشترك`,
      managed: 'تتم إدارته عبر Team Gateway',
      managedNote: (platform: string) =>
        `يتولى Team Gateway المراسلة في هذا المثيل، لذا يوقف البوابة الاتصال المباشر بـ ${platform} عند كل تشغيل. لتشغيله بجانب المرحّل، اضبط GATEWAY_RELAY_ALLOW_DIRECT_PLATFORMS=true في بيئة البوابة (الاتصال المباشر يمنع المثيل من التقلص إلى الصفر وقد يسلّم الرسائل مرتين).`,
      managedIntro: 'تُربط حسابات هذا الوكيل من Nous Portal.',
      openPortal: 'اربط الحسابات في Nous Portal',
      noNewAccount: (platform: string) =>
        `لم يعد الرمز نشطًا ولم يظهر حساب جديد. إذا لم يكن حسابك في ${platform} مدرجًا، فاحصل على رمز جديد وحاول مرة أخرى.`
    },
    telegramQr: {
      title: 'اختر طريقة ربط بوت Telegram',
      subtitle: 'كلا الخيارين يربط بوتًا تتحكم به ويحفظ بياناته في هذا التثبيت من Hermes فقط.',
      quickSetup: 'إعداد سريع',
      recommended: 'موصى به',
      qrCodeAlt: 'رمز QR لإعداد Telegram',
      quickHelp: 'امسح رمز QR وأكّد في Telegram. سينشئ Hermes البوت ويكتشف معرّف مستخدم Telegram الخاص بك تلقائيًا.',
      createWithQr: 'إنشاء عبر QR',
      starting: 'جارٍ البدء…',
      replaceWarning: 'بيانات Telegram مُعدّة بالفعل. سيحل إعداد QR الجديد أو رمز البوت محل البوت الحالي عند الحفظ.',
      scanHint: 'امسح بتطبيق Telegram على هاتفك، أو افتح الرابط على هذا الجهاز.',
      waiting: 'في انتظار Telegram…',
      expiresIn: remaining => `ينتهي خلال ${remaining}`,
      expired: 'منتهي',
      openTelegram: 'افتح Telegram',
      ready: 'تم إنشاء البوت',
      allowedUsers: 'المستخدمون المسموح لهم',
      ownerDetected: 'تم اكتشاف المالك',
      addAtLeastOne: 'أضف معرّف مستخدم Telegram واحدًا على الأقل.',
      userIdPlaceholder: 'معرّف مستخدم Telegram',
      add: 'إضافة',
      numericOnly: 'يجب أن تكون معرّفات مستخدمي Telegram أرقامًا.',
      saveAndRestart: 'حفظ وإعادة التشغيل',
      applying: 'جارٍ الحفظ…',
      pairingExpired: 'انتهت صلاحية اقتران Telegram. ابدأ إعداد QR جديدًا.',
      stillWaiting: detail => `ما زلنا ننتظر Telegram. إعادة المحاولة بعد: ${detail}`,
      savedRestarting: 'تم حفظ Telegram؛ تجري إعادة تشغيل البوابة…',
      savedRestartFailed: detail => `تم حفظ Telegram؛ فشلت إعادة تشغيل البوابة${detail}`
    },
    fieldCopy: {
      TELEGRAM_BOT_TOKEN: {
        label: 'رمز البوت (token)',
        help: 'أنشئ بوتا عبر @BotFather، ثم الصق الرمز الذي يمنحك إياه.',
        placeholder: 'الصق رمز بوت Telegram'
      },
      TELEGRAM_ALLOWED_USERS: {
        label: 'معرّفات مستخدمي Telegram المسموح بهم',
        help: 'موصى به. معرّفات رقمية (واحد في كل حقل) من @userinfobot. بدون ذلك، يمكن لأي شخص مراسلة بوتك مباشرة.'
      },
      TELEGRAM_PROXY: {
        label: 'رابط الـ Proxy',
        help: 'مطلوب فقط على الشبكات التي يكون فيها Telegram محجوبا.'
      },
      DISCORD_BOT_TOKEN: {
        label: 'رمز البوت (token)',
        help: 'أنشئ تطبيقا في Discord Developer Portal، وأضف بوتا، ثم الصق رمزه.'
      },
      DISCORD_ALLOWED_USERS: {
        label: 'معرّفات مستخدمي Discord المسموح بهم',
        help: 'موصى به. معرّفات مستخدمي Discord (واحد في كل حقل).'
      },
      DISCORD_REPLY_TO_MODE: {
        label: 'نمط الرد',
        help: 'first أو all أو off.'
      },
      DISCORD_ALLOW_ALL_USERS: {
        label: 'السماح لكل مستخدمي Discord',
        help: 'للتطوير فقط. عند التفعيل، يمكن لأي شخص مراسلة البوت مباشرة دون قائمة سماح.'
      },
      DISCORD_HOME_CHANNEL: {
        label: 'معرّف القناة الرئيسية',
        help: 'القناة التي يرسل فيها البوت الرسائل الاستباقية (مخرجات cron، التذكيرات).'
      },
      DISCORD_HOME_CHANNEL_NAME: {
        label: 'اسم القناة الرئيسية',
        help: 'الاسم المعروض للقناة الرئيسية في السجلات ومخرجات الحالة.'
      },
      BLUEBUBBLES_ALLOW_ALL_USERS: {
        label: 'السماح لكل مستخدمي iMessage',
        help: 'عند التفعيل، يتم تخطي قائمة سماح BlueBubbles.'
      },
      MATTERMOST_ALLOW_ALL_USERS: {
        label: 'السماح لكل مستخدمي Mattermost'
      },
      MATTERMOST_HOME_CHANNEL: {
        label: 'القناة الرئيسية'
      },
      QQ_ALLOW_ALL_USERS: {
        label: 'السماح لكل مستخدمي QQ'
      },
      QQBOT_HOME_CHANNEL: {
        label: 'قناة QQ الرئيسية',
        help: 'القناة أو المجموعة الافتراضية لتسليم cron.'
      },
      QQBOT_HOME_CHANNEL_NAME: {
        label: 'اسم قناة QQ الرئيسية'
      },
      SLACK_BOT_TOKEN: {
        label: 'رمز بوت Slack',
        help: 'استخدم رمز البوت من OAuth & Permissions بعد تثبيت تطبيق Slack الخاص بك.',
        placeholder: 'الصق رمز بوت Slack'
      },
      SLACK_APP_TOKEN: {
        label: 'رمز تطبيق Slack',
        help: 'استخدم الرمز على مستوى التطبيق المطلوب لـ Socket Mode.',
        placeholder: 'الصق رمز تطبيق Slack'
      },
      SLACK_ALLOWED_USERS: {
        label: 'معرّفات مستخدمي Slack المسموح بهم',
        help: 'موصى به. معرّفات مستخدمي Slack (واحد في كل حقل).'
      },
      MATTERMOST_URL: {
        label: 'رابط الخادم',
        placeholder: 'https://mattermost.example.com'
      },
      MATTERMOST_TOKEN: {
        label: 'رمز البوت (token)',
        help: 'رمز بوت Mattermost أو رمز الوصول الشخصي'
      },
      MATTERMOST_ALLOWED_USERS: {
        label: 'معرّفات المستخدمين المسموح بهم',
        help: 'موصى به. معرّفات مستخدمي Mattermost (واحد في كل حقل).'
      },
      MATRIX_HOMESERVER: {
        label: 'رابط Homeserver',
        placeholder: 'https://matrix.org',
        help: 'رابط خادم Matrix الرئيسي (مثل https://matrix.org)'
      },
      MATRIX_ACCESS_TOKEN: {
        label: 'رمز الوصول',
        help: 'رمز وصول Matrix (يُفضَّل على تسجيل الدخول بكلمة مرور)'
      },
      MATRIX_USER_ID: {
        label: 'معرّف مستخدم البوت',
        placeholder: '@hermes:example.org',
        help: 'معرّف مستخدم Matrix (مثل @hermes:example.org)'
      },
      MATRIX_ALLOWED_USERS: {
        label: 'معرّفات مستخدمي Matrix المسموح بهم',
        help: 'موصى به. معرّفات مستخدمين (واحد في كل حقل) بصيغة @user:server.'
      },
      SIGNAL_HTTP_URL: {
        label: 'رابط جسر Signal',
        placeholder: 'http://127.0.0.1:8080',
        help: 'رابط جسر signal-cli REST قيد التشغيل.'
      },
      SIGNAL_ACCOUNT: {
        label: 'رقم الهاتف',
        help: 'الرقم المسجّل مع جسر signal-cli الخاص بك.'
      },
      SIGNAL_ALLOWED_USERS: {
        label: 'مستخدمو Signal المسموح بهم',
        help: 'موصى به. معرّفات Signal (واحد في كل حقل).'
      },
      WHATSAPP_ENABLED: {
        label: 'تفعيل جسر WhatsApp',
        help: 'يُضبط تلقائيا عبر المفتاح أدناه. اتركه دون تغيير ما لم تكن متأكدا من حاجتك إليه.'
      },
      WHATSAPP_MODE: {
        label: 'وضع الجسر'
      },
      WHATSAPP_ALLOWED_USERS: {
        label: 'مستخدمو WhatsApp المسموح بهم',
        help: 'موصى به. أرقام هواتف أو معرّفات WhatsApp (واحد في كل حقل).'
      },
      A2A_AGENT_NAME: {
        label: 'اسم عميل A2A',
        help: 'الاسم المُعلَن على بطاقة الوكيل (Agent Card) لهذا الوكيل (الافتراضي: مشتق من اسم المضيف).',
        placeholder: 'اسم عميل A2A'
      },
      A2A_BEARER_TOKEN: {
        label: 'رمز حامل A2A المشترك (أو فارغ لـ localhost فقط)',
        help: 'رمز حامل مشترك لاستدعاءات A2A الواردة (تعود الهوية إلى IP المتصل). بدون أي رمز => ربط بـ 127.0.0.1 فقط.',
        placeholder: 'رمز حامل A2A المشترك (أو فارغ لـ localhost فقط)'
      },
      A2A_HOST: {
        label: 'مضيف ربط A2A (الافتراضي 127.0.0.1)',
        help: 'مضيف الربط الوارد. الافتراضي 127.0.0.1؛ يتوسع إلى 0.0.0.0 فقط عند تعيين رمز حامل والموافقة هنا.',
        placeholder: 'مضيف ربط A2A (الافتراضي 127.0.0.1)'
      },
      A2A_PORT: {
        label: 'منفذ A2A (الافتراضي 9900)',
        help: 'منفذ خادم A2A الوارد (الافتراضي 9900).',
        placeholder: 'منفذ A2A (الافتراضي 9900)'
      },
      A2A_PEER_TOKENS: {
        label: 'رموز نظير A2A (name:token، مفصولة بفواصل؛ أو فارغ)',
        help: 'رموز حامل لكل نظير (مثل alice:tok1,bob:tok2). كل وكيل بعيد له بيانات اعتماد خاصة به.',
        placeholder: 'رموز نظير A2A (name:token، مفصولة بفواصل؛ أو فارغ)'
      },
      A2A_HOME_CHANNEL: {
        label: 'قناة A2A الرئيسية (أو فارغ)',
        help: 'معرف المهمة/السياق المستخدم كهدف تسليم cron / الإشعارات لـ deliver=a2a.'
      },
      A2A_ALLOW_ALL_USERS: {
        label: 'السماح لجميع أقران A2A؟ (true/false)',
        help: 'السماح لأي نظير A2A مصادَق عليه بالوصول إلى الوكيل (للتطوير فقط).'
      },
      RAFT_PROFILE: {
        label: 'ملف تعريف وكيل Raft',
        help: 'اسم ملف تعريف وكيل Raft — يُمكِّن المحول تلقائيًا عند التعيين.',
        placeholder: 'ملف تعريف وكيل Raft'
      },
      BUZZ_RELAY_URL: {
        label: 'عنوان URL مُرحِّل Buzz',
        help: 'عنوان URL الأساسي لمُرحِّل مجتمع Buzz (مثل https://mycommunity.communities.buzz.xyz).',
        placeholder: 'عنوان URL مُرحِّل Buzz'
      },
      BUZZ_PRIVATE_KEY: {
        label: 'المفتاح الخاص لـ Nostr (nsec أو hex)',
        help: 'المفتاح الخاص لـ Nostr لهوية Buzz للوكيل (nsec أو hex) — السر الوحيد لـ Buzz.'
      },
      BUZZ_CLI_PATH: {
        label: 'مسار buzz CLI (أو فارغ)',
        help: "مسار ملف buzz CLI الثنائي (الافتراضي: 'buzz' على PATH، ثم ~/bin/buzz)."
      },
      BUZZ_CHANNELS: {
        label: 'معرفات UUID للقنوات (مفصولة بفواصل)',
        help: 'معرفات UUID للقنوات المراد مراقبتها، مفصولة بفواصل (الافتراضي: جميع القنوات المنضمة إليها).'
      },
      BUZZ_HOME_CHANNEL: {
        label: 'معرف UUID القناة الرئيسية (أو فارغ)',
        help: 'معرف UUID للقناة لتسليم cron / الإشعارات (الافتراضي: القناة الأولى المراقَبة).'
      },
      BUZZ_ALLOWED_USERS: {
        label: 'المستخدمون المسموح بهم (مفصولون بفواصل)',
        help: 'npubs أو مفاتيح hex العامة المسموح لها بالتحدث إلى الوكيل، مفصولة بفواصل.'
      },
      BUZZ_ALLOW_ALL_USERS: {
        label: 'السماح لجميع المستخدمين؟ (true/false)',
        help: 'السماح لأي عضو في المجتمع بالتحدث إلى الوكيل (true/false).'
      },
      BUZZ_TRANSPORT: {
        label: 'طريقة النقل (auto/websocket/poll)',
        help: 'نقل وارد: auto (WebSocket مع احتياط poll، الافتراضي)، websocket، أو poll.'
      },
      BUZZ_POLL_INTERVAL: {
        label: 'ثواني فاصل الاستطلاع',
        help: 'الثواني بين عمليات مسح الاستطلاع الوارد (الافتراضي: 4).'
      },
      BUZZ_AUTH_TAG: {
        label: 'NIP-OA auth tag JSON (أو فارغ)',
        help: 'علامة NIP-OA لاعتماد المالك الاختيارية لمصادقة NIP-42 WebSocket.'
      },
      BUZZ_CREDENTIALS_FILE: {
        label: 'مسار ملف الاعتمادات (أو فارغ)',
        help: 'ملف اعتمادات JSON يحتوي على nsec (احتياطي عند عدم تعيين BUZZ_PRIVATE_KEY).'
      },
      LINE_HOST: {
        label: 'مضيف Webhook',
        help: 'مضيف ربط Webhook (الافتراضي: غير محدد → ثنائي المكدس، جميع الواجهات IPv4+IPv6).'
      },
      TEAMS_HOST: {
        label: 'مضيف Webhook',
        help: 'مضيف ربط Webhook (الافتراضي: غير محدد → ثنائي المكدس، جميع الواجهات IPv4+IPv6).'
      }
    },
    platformIntro: {
      telegram:
        'في Telegram، تحدث إلى @BotFather، وقم بتشغيل /newbot، انسخ الرمز الذي يعطيك إياه. ثم احصل على معرّف مستخدمك الرقمي من @userinfobot.',
      discord:
        'افتح بوابة مطوري Discord، أنشئ تطبيقًا، أضف Bot، وانسخ رمزه. قم بدعوة البوت إلى خادمك بالنطاقات الصحيحة.',
      slack: 'أنشئ تطبيق Slack، فعّل Socket Mode، ثبّته في مساحة العمل الخاصة بك، وانسخ رمز البوت ورمز مستوى التطبيق.',
      mattermost: 'أنشئ حساب بوت أو رمز وصول شخصي على خادم Mattermost الخاص بك، ثم الصق رابط الخادم والرمز هنا.',
      matrix:
        'سجّل الدخول إلى الخادم الرئيسي باستخدام حساب البوت، وانسخ رمز الوصول ومعرّف المستخدم ورابط الخادم الرئيسي.',
      signal:
        'قم بتشغيل جسر signal-cli REST في موقع يمكن الوصول إليه، ثم وجّه Hermes إلى هذا الرابط ورقم الهاتف المسجل.',
      whatsapp: 'قم بتشغيل جسر WhatsApp المدمج في Hermes، امسح رمز QR عند التشغيل الأول، ثم فعّل المنصة.',
      bluebubbles:
        'قم بتشغيل خادم BlueBubbles على Mac يحتوي على iMessage، اكشف API الخاص به، ثم وجّه Hermes إلى هذا الرابط مع كلمة مرور الخادم.',
      homeassistant: 'افتح ملفك الشخصي في Home Assistant وأنشئ رمز وصول طويل الأجل. الصقه هنا مع رابط HA الخاص بك.',
      email:
        'استخدم صندوق بريد مخصص. بالنسبة لـ Gmail/Workspace، أنشئ كلمة مرور للتطبيق واستخدم imap.gmail.com / smtp.gmail.com.',
      sms: 'احصل على Account SID و Auth Token من وحدة تحكم Twilio، بالإضافة إلى رقم هاتف قادر على إرسال الرسائل القصيرة.',
      dingtalk: 'أنشئ تطبيق DingTalk في وحدة تحكم المطورين، وانسخ Client ID (App key) و Client Secret هنا.',
      feishu: 'أنشئ تطبيق Feishu / Lark، قم بإعداد قدرات البوت، وانسخ App ID و App secret ومفتاح تشفير الأحداث.',
      wecom:
        'أضف بوت مجموعة في WeCom، وانسخ مفتاح webhook الخاص به كـ WECOM_BOT_ID. إرسال فقط — للاتجاهين استخدم خيار WeCom (التطبيق).',
      wecom_callback:
        'قم بإعداد تطبيق WeCom الذاتي، اكشف رابط callback الخاص به، وقدم corp ID و secret و agent ID و AES key.',
      weixin:
        'قم بتشغيل `hermes gateway setup`، اختر Weixin، ثم امسح وأكّد رمز QR باستخدام حساب WeChat الشخصي الخاص بك. سيتصل Hermes عبر Tencent iLink Bot API ويحفظ بيانات الاعتماد.',
      qqbot: 'سجّل تطبيقًا على منصة QQ المفتوحة (q.qq.com)، وانسخ App ID و Client Secret.',
      api_server:
        'اكشف Hermes كـ API متوافق مع OpenAI. قم بتعيين مفتاح مصادقة، ثم وجّه Open WebUI / LobeChat وغيرها إلى host:port.',
      webhook:
        'قم بتشغيل خادم HTTP حتى تتمكن الأدوات الأخرى (GitHub، GitLab، التطبيقات المخصصة) من POST. تحقق من التوقيعات باستخدام السر.',
      a2a: 'لا توجد تبعيات خارجية (المكتبة القياسية فقط). قم بتعيين رمز مشترك أو رمز نظير للسماح لمثيلات Hermes الأخرى بالاتصال عبر بروتوكول A2A.',
      buzz: 'يتطلب أداة buzz CLI (https://github.com/block/buzz) في PATH أو BUZZ_CLI_PATH. اتصل بمجتمع Buzz عبر Nostr relay.',
      raft: 'انضم إلى مساحة عمل Raft كوكيل خارجي.'
    },
    sharedListenerUrl: 'يُخدم عبر مستمع البوابة المشتركة على',
    restartFailedManualDetail: 'جرّب إعادة التشغيل مرة أخرى؛ وإن استمر الفشل، فافتح السجلات وأرسل التشخيصات.',
    restartAgain: 'إعادة التشغيل مرة أخرى',
    openLogs: 'فتح السجلات',
    platformDescription: {
      telegram: 'استخدم Hermes في رسائل Telegram الخاصة والمجموعات والمواضيع.',
      discord: 'دمج Hermes مع رسائل Discord المباشرة والقنوات والخيوط.',
      slack: 'استخدم Hermes في Slack عبر Socket Mode. أضف معرّفات أعضاء Slack المسموح بهم وسيستجيب البوت المتصل.',
      mattermost: 'دمج Hermes مع قنوات Mattermost والرسائل المباشرة.',
      matrix: 'استخدم Hermes في غرف Matrix والرسائل المباشرة.',
      signal: 'اتصل عبر جسر signal-cli REST.',
      whatsapp: 'استخدم Hermes عبر جسر WhatsApp المدمج مع مصادقة رمز QR.',
      bluebubbles: 'استخدم Hermes في iMessage عبر خادم BlueBubbles.',
      homeassistant: 'تحكم في منزلك الذكي من Hermes عبر Home Assistant.',
      email: 'تحدث مع Hermes عبر صندوق بريد IMAP/SMTP.',
      sms: 'أرسل واستقبل الرسائل النصية عبر Twilio.',
      dingtalk: 'دمج Hermes مع مجموعات DingTalk.',
      feishu: 'استخدم Hermes داخل Feishu / Lark.',
      google_chat: 'دمج Hermes مع Google Chat عبر Cloud Pub/Sub.',
      wecom: 'بوت مجموعة WeCom للإرسال فقط عبر webhook.',
      wecom_callback: 'تكامل WeCom ثنائي الاتجاه عبر تطبيق callback.',
      weixin: 'اربط حساب WeChat الشخصي عبر Tencent iLink Bot API.',
      qqbot: 'دمج Hermes مع بوت QQ على منصة QQ المفتوحة.',
      yuanbao: 'دمج Hermes مع Tencent Yuanbao.',
      api_server: 'اكشف Hermes كـ HTTP API متوافق مع OpenAI لأدوات مثل Open WebUI.',
      webhook: 'استقبل الأحداث من مصادر webhook مثل GitHub و GitLab.',
      a2a: 'دعم بروتوكول A2A (Agent-to-Agent) الإصدار 1.0 لـ Hermes Agent —— الاتجاهان من معيار Linux Foundation المفتوح للاتصال بين الوكلاء.\n\nالصادر (أدوات العميل): تتيح a2a_discover و a2a_call و a2a_list و a2a_history و a2a_orchestrate للوكيل جلب بطاقة الوكيل (Agent Card) لوكيل آخر وإرسال مهام إليه عبر JSON-RPC —— يعمل مع أي نظير متوافق مع A2A (Hermes، LangChain، CrewAI، Google ADK، OpenClaw، إلخ).\n\nالوارد (محول المنصة): يعرض Hermes كوكيل قابل للاكتشاف عبر A2A. يتم تقديم بطاقة الوكيل على /.well-known/agent-card.json (مسار v1.0 الأساسي؛ agent.json القديم يستجيب أيضًا) ويتم توجيه المهام الواردة إلى جلسة البوابة المباشرة للوكيل مثل أي منصة أخرى —— لذا فإن الوكيل الذي يرد هو نفسه الذي يتحدث إلى المستخدم، مع الذاكرة والسياق الكاملين، وليس نسخة يمكن التخلص منها.\n\nالأمان مفعّل افتراضيًا: عدم تكوين رمز حامل => ربط localhost فقط. يمر نص المهمة الواردة عبر مرشحات حقن المطالبات؛ يتم تنظيف النص الصادر من السلاسل ذات الشكل الاعتمادي؛ يتم تسجيل كل تبادل في سجل المراجعة والاحتفاظ به على القرص خارج خط أنابيب ضغط السياق بحيث تنجو المحادثات من الضغط وإعادة التشغيل.\n\nنقل مكتبة قياسية نقية (http.server + urllib) —— لا حاجة لتبعية a2a-sdk.',
      buzz: 'اتصل بمجتمع Buzz اللامركزي عبر Nostr relay (يتطلب buzz CLI).',
      raft: 'انضم إلى مساحة عمل Raft كوكيل خارجي للتعاون في المهام.'
    }
  },
  profiles: {
    close: 'إغلاق',
    openFailed: profile => `تعذّر فتح الملف الشخصي «${profile}»`,
    switchFailed: profile => `تعذّر التبديل إلى الملف الشخصي «${profile}»`,
    nameHint: 'أحرف لاتينية صغيرة وأرقام وشرطات وشرطات سفلية. يجب أن يبدأ بحرف أو رقم.',
    title: 'الملفات الشخصية',
    count: count =>
      AR_PLURAL(count, {
        one: 'ملف شخصي واحد',
        two: 'ملفان شخصيان',
        few: `${count} ملفات شخصية`,
        many: `${count} ملفًا شخصيًا`
      }),
    search: 'البحث في الملفات الشخصية...',
    loading: 'جار التحميل...',
    newProfile: 'ملف شخصي جديد',
    importProfile: 'استيراد ملف شخصي…',
    exportProfile: 'تصدير ملف شخصي…',
    imported: 'تم استيراد الملف الشخصي',
    exported: 'تم تصدير الملف الشخصي',
    failedImport: 'فشل استيراد الملف الشخصي',
    failedExport: 'فشل تصدير الملف الشخصي',
    allProfiles: 'كل الملفات الشخصية',
    showAllProfiles: 'إظهار كل الملفات الشخصية',
    switchToProfile: name => `التبديل إلى ${name}`,
    switchToConnection: name => `التبديل إلى ${name}`,
    switchConnectionFailed: name => `تعذّر الاتصال بـ ${name}`,
    manageProfiles: 'إدارة الملفات الشخصية',
    connectGateway: 'إدارة البوابات',
    fleet: {
      allOnGateway: 'كل الملفات الشخصية على هذه البوابة',
      gateway: gateway => `الملفات الشخصية على ${gateway}`,
      gatewayUnreachable: gateway => `${gateway} · تعذّر الوصول`,
      rosterTimedOut: 'انتهت مهلة جلب قائمة الملفات الشخصية',
      onGateway: (name, gateway) => `${name} · ${gateway}`,
      switchTo: (name, gateway) => `فتح ${name} على ${gateway}`,
      deleteOn: gateway => ` على ${gateway}`,
      connectExistingInstead: 'الاتصال بتثبيت موجود بدلًا من ذلك',
      installDeviceConfirm: 'تثبيت محليًا',
      installDeviceDesc: 'سيُثبَّت Hermes محليًا ثم تُفتح جلسة جديدة على هذا الحاسوب. لا يبدأ التثبيت قبل التأكيد.',
      installDeviceTitle: 'تثبيت Hermes على هذا الجهاز؟',
      localDevice: 'هذا الجهاز (واجهة خلفية محلية — تثبّت Hermes إن لم يكن مثبتًا، وإلا تفتح جلسة جديدة)'
    },
    remoteOverride: {
      menuItem: 'الاتصال بمضيف بعيد…',
      badge: (host: string) => `يعمل على ${host}`,
      title: (profile: string) => `ربط ${profile} بمضيف بعيد`,
      description: 'ستعمل جلسات هذا الملف الشخصي على خادم Hermes البعيد الذي تحدده، بدلاً من هذا الجهاز.',
      urlLabel: 'العنوان البعيد',
      urlPlaceholder: 'https://hermes.example.com',
      urlInvalid: 'أدخل عنواناً كاملاً يبدأ بـ http:// أو https://',
      tokenLabel: 'رمز الوصول',
      tokenPlaceholder: 'الصق رمز الجلسة البعيد',
      tokenSavedHint: 'يوجد رمز محفوظ بالفعل. اتركه فارغاً للاحتفاظ به.',
      plainTextOptIn:
        'لا يتوفر تخزين مفاتيح آمن على هذا الجهاز، لذا سيُحفظ الرمز على القرص دون تشفير. احفظه على أي حال.',
      collisionWarning: (label: string) =>
        `توجد بوابة باسم «${label}» في الإعدادات بالفعل. اتصال هذا الملف الشخصي منفصل ولن يغيّرها.`,
      confirmTitle: 'ربط هذا الملف الشخصي بمضيف بعيد؟',
      confirmNote: (profile: string, host: string) =>
        `ستعمل المحادثات الجديدة في ${profile} على ${host}. سيقوم ذلك الجهاز بتنفيذ الأوامر وقراءة الملفات هناك، وليس هنا. اتصل فقط بمضيف تثق به.`,
      confirmBack: 'رجوع',
      connect: 'اتصال',
      connecting: 'جارٍ الاتصال…',
      disconnect: 'إزالة الاتصال البعيد',
      savedTitle: 'تم ربط الملف الشخصي',
      savedMessage: (profile: string, host: string) => `${profile} يعمل الآن على ${host}`,
      removedTitle: 'تمت إزالة الاتصال البعيد',
      removedMessage: (profile: string) => `${profile} يعمل الآن على هذا الجهاز`,
      removeFailed: 'تعذّرت إزالة الاتصال البعيد',
      authFailedTitle: 'رفض المضيف البعيد الرمز المحفوظ',
      authFailedMessage: (profile: string, host: string) =>
        `رفض ${host} الرمز المحفوظ لـ ${profile}. ربما تم تغييره على الجانب البعيد.`,
      updateToken: 'أدخل رمزاً جديداً…'
    },
    actions: 'إجراءات',
    color: 'اللون',
    colorFor: 'اللون',
    setColor: color => `ضبط اللون ${color}`,
    autoColor: 'لون تلقائي',
    noProfiles: 'لا توجد ملفات شخصية',
    selectPrompt: 'اختر ملفًا شخصيًا لعرض تفاصيله.',
    refresh: 'تحديث',
    refreshing: 'جار التحديث...',
    default: 'الافتراضي',
    skills: count =>
      AR_PLURAL(count, { one: 'مهارة واحدة', two: 'مهارتان', few: `${count} مهارات`, many: `${count} مهارة` }),
    env: 'البيئة',
    defaultBadge: 'افتراضي',
    rename: 'إعادة تسمية',
    renameMenu: 'إعادة تسمية…',
    exportMenu: 'تصدير…',
    editSoul: 'تحرير SOUL.md…',
    copySetup: 'نسخ الإعداد',
    copying: 'جار النسخ...',
    modelLabel: 'النموذج',
    skillsLabel: 'المهارات',
    notSet: 'غير مضبوط',
    soulDesc: 'موجّه النظام وتعليمات الشخصية المضمّنة في هذا الملف الشخصي.',
    soulMissing:
      'لا يوجد ملف SOUL.md لهذا الملف الشخصي بعد. أضف التعليمات أدناه واحفظ لإنشائه. تُدار إعدادات الشخصية في config.yaml بشكل منفصل.',
    soulOptional: 'اختياري',
    soulPlaceholder: mode => `موجّه النظام / الشخصية لهذا الملف الشخصي.\nاتركه فارغًا للإبقاء على الافتراضي (${mode}).`,
    soulPlaceholderCloned: 'مستنسخ',
    soulPlaceholderEmpty: 'فارغ',
    unsavedChanges: 'تغييرات غير محفوظة',
    loadingSoul: 'جار تحميل SOUL.md...',
    emptySoul: 'SOUL.md فارغ — ابدأ بكتابة الشخصية...',
    saving: 'جار الحفظ...',
    saveSoul: 'حفظ SOUL.md',
    deleteTitle: 'حذف الملف الشخصي؟',
    deleteDescPrefix: 'سيؤدي هذا إلى حذف ',
    deleteDescMid: ' وإزالة ',
    deleteDescSuffix: ' الخاص به. لا يمكن التراجع عن هذا.',
    deleting: 'جار الحذف...',
    createDesc: 'الملفات الشخصية بيئات Hermes مستقلة: إعدادات ومهارات وSOUL.md منفصلة.',
    nameLabel: 'الاسم',
    cloneFrom: 'استنساخ من',
    cloneFromNone: 'لا شيء (فارغ)',
    cloneFromDesc: 'ينسخ الإعدادات والمهارات وSOUL.md من الملف الشخصي المصدر المحدد.',
    cloneFromDefault: 'الاستنساخ من الافتراضي',
    cloneFromDefaultDesc: 'نسخ الإعدادات والمهارات وSOUL.md من ملفك الشخصي الافتراضي.',
    invalidName: hint => `اسم غير صالح: ${hint}`,
    nameRequired: 'الاسم مطلوب',
    creating: 'جار الإنشاء...',
    createAction: 'إنشاء ملف شخصي',
    renameTitle: 'إعادة تسمية الملف الشخصي',
    renameDescPrefix: 'تؤدي إعادة التسمية إلى تحديث دليل الملف الشخصي وأي سكربتات تغليف في ',
    renameDescSuffix: '.',
    displayNameTitle: 'سمِّ هذا الوكيل',
    displayNameDesc: 'يعيّن اسم عرض يظهر في كل أنحاء التطبيق. يبقى معرّف الملف الشخصي الداخلي "default".',
    displayNameLabel: 'اسم العرض',
    newNameLabel: 'الاسم الجديد',
    renaming: 'جار إعادة التسمية...',
    created: 'تم إنشاء الملف الشخصي',
    renamed: 'تمت إعادة التسمية',
    deleted: 'تم الحذف',
    setupCopied: 'تم نسخ الإعداد',
    soulSaved: 'تم حفظ SOUL.md',
    failedLoad: 'فشل تحميل الملفات الشخصية',
    failedDelete: 'فشل الحذف',
    failedCopy: 'فشل النسخ',
    failedLoadSoul: 'فشل تحميل SOUL.md',
    failedSaveSoul: 'فشل حفظ SOUL.md',
    failedCreate: 'فشل الإنشاء',
    failedRename: 'فشل إعادة التسمية',
    openInNewWindow: 'فتح في نافذة جديدة',
    setAsDefault: 'تعيين كافتراضي',
    defaultProfile: 'الملف الشخصي الافتراضي',
    defaultSet: name => `${name} هو الآن الافتراضي`,
    defaultDescription: 'يُستخدم عند فتح Hermes وللمحادثات الجديدة. تظل الجلسات الحالية في ملفاتها الشخصية.',
    failedSetDefault: 'تعذر تعيين الملف الشخصي الافتراضي',
    notServedHere: 'غير متاح هنا',
    exportNeedsHost: name =>
      `لا يستطيع المتصفح حفظ أرشيف ملف شخصي. على الجهاز المضيف لـ Hermes، شغّل: hermes profile export ${name}`,
    status: {
      unread: count =>
        AR_PLURAL(count, {
          one: 'جلسة واحدة غير مقروءة',
          two: 'جلستان غير مقروءتين',
          few: `${count} جلسات غير مقروءة`,
          many: `${count} جلسة غير مقروءة`
        }),
      needsInput: count =>
        AR_PLURAL(count, {
          one: 'جلسة واحدة تحتاج إلى إجابتك',
          two: 'جلستان تحتاجان إلى إجابتك',
          few: `${count} جلسات تحتاج إلى إجابتك`,
          many: `${count} جلسة تحتاج إلى إجابتك`
        }),
      working: count =>
        AR_PLURAL(count, {
          one: 'جلسة واحدة قيد التشغيل',
          two: 'جلستان قيد التشغيل',
          few: `${count} جلسات قيد التشغيل`,
          many: `${count} جلسة قيد التشغيل`
        })
    }
  },
  cron: {
    control: arCronControl,
    close: 'إغلاق',
    title: 'المهام المجدولة',
    count: count => AR_PLURAL(count, { one: 'مهمة واحدة', two: 'مهمتان', few: `${count} مهام`, many: `${count} مهمة` }),
    search: 'بحث',
    loading: 'جار التحميل...',
    states: {
      enabled: 'مُفعّل',
      scheduled: 'مجدول',
      running: 'قيد التشغيل',
      paused: 'متوقف مؤقتا',
      disabled: 'معطّل',
      error: 'خطأ',
      completed: 'مكتمل'
    },
    deliveryLabels: {
      local: 'هذا التطبيق',
      telegram: 'Telegram',
      discord: 'Discord',
      slack: 'Slack',
      email: 'البريد الإلكتروني',
      botChat: 'دردشة البوت',
      defaultProfile: 'افتراضي'
    },
    scheduleLabels: {
      daily: 'يوميا',
      weekdays: 'من الاثنين إلى الجمعة',
      weekly: 'أسبوعيا',
      monthly: 'شهريا',
      hourly: 'كل ساعة',
      'every-15-minutes': 'كل 15 دقيقة',
      custom: 'مخصص'
    },
    scheduleHints: {
      daily: 'كل يوم في الساعة 9:00 صباحا',
      weekdays: 'من الاثنين إلى الجمعة في الساعة 9:00 صباحا',
      weekly: 'كل اثنين في الساعة 9:00 صباحا',
      monthly: 'أول يوم من كل شهر في الساعة 9:00 صباحا',
      hourly: 'في بداية كل ساعة',
      'every-15-minutes': 'كل 15 دقيقة',
      custom: 'صياغة cron أو لغة طبيعية'
    },
    days: {
      '0': 'الأحد',
      '1': 'الاثنين',
      '2': 'الثلاثاء',
      '3': 'الأربعاء',
      '4': 'الخميس',
      '5': 'الجمعة',
      '6': 'السبت',
      '7': 'الأحد'
    },
    dayFallback: value => `اليوم ${value}`,
    everyDayAt: time => `كل يوم في ${time}`,
    weekdaysAt: time => `من الاثنين إلى الجمعة في ${time}`,
    everyDayOfWeekAt: (day, time) => `كل ${day} في ${time}`,
    monthlyOnDayAt: (dayOfMonth, time) => `شهريا في اليوم ${dayOfMonth} في ${time}`,
    topOfHour: 'في بداية كل ساعة',
    everyHourAt: minute => `كل ساعة عند :${minute}`,
    newCron: 'مهمة مجدولة جديدة',
    emptyDescNew: 'أنشئ مهمة مجدولة لتشغيل Hermes تلقائيا.',
    emptyDescSearch: 'لا توجد مهام تطابق البحث.',
    emptyTitleNew: 'لا توجد مهام مجدولة',
    emptyTitleSearch: 'لا توجد نتائج',
    last: 'آخر تشغيل',
    next: 'التالي',
    noRuns: 'لا توجد تشغيلات',
    queuedRun: 'تشغيل في قائمة الانتظار',
    manage: 'إدارة',
    showRuns: 'إظهار التشغيلات',
    hideRuns: 'إخفاء التشغيلات',
    runHistory: 'سجل التشغيل',
    actionsTitle: 'الإجراءات',
    resume: 'استئناف',
    pause: 'إيقاف مؤقت',
    resumeTitle: 'استئناف المهمة',
    pauseTitle: 'إيقاف المهمة مؤقتا',
    triggerNow: 'تشغيل الآن',
    edit: 'تحرير',
    deleteTitle: 'حذف المهمة المجدولة؟',
    deleteDescPrefix: 'سيؤدي هذا إلى إزالة ',
    deleteDescSuffix: ' نهائيا. سيتوقف عن العمل فورا.',
    deleting: 'جار الحذف...',
    resumed: 'تم الاستئناف',
    paused: 'تم الإيقاف مؤقتا',
    triggered: 'تم التشغيل',
    deleted: 'تم الحذف',
    created: 'تم الإنشاء',
    updated: 'تم التحديث',
    failedLoad: 'فشل تحميل المهام',
    failedUpdate: 'فشل التحديث',
    failedTrigger: 'فشل التشغيل',
    failedDelete: 'فشل الحذف',
    failedSave: 'فشل الحفظ',
    editTitle: 'تحرير المهمة المجدولة',
    createTitle: 'إنشاء مهمة مجدولة',
    editDesc: 'عدل الجدول والرسالة.',
    createDesc: 'اضبط مهمة يشغلها Hermes تلقائيا.',
    nameLabel: 'الاسم',
    namePlaceholder: 'مثال: الملخص الصباحي',
    promptLabel: 'الرسالة',
    scriptLabel: 'البرنامج النصي',
    scriptBadge: 'برنامج نصي',
    promptPlaceholder: 'ماذا تريد من Hermes أن يفعل؟',
    frequencyLabel: 'التكرار',
    deliverLabel: 'التسليم',
    deliverNeedsHomeChannel: 'عيّن القناة الرئيسية أولًا',
    modelLabel: 'النموذج',
    modelDefault: 'الافتراضي (النموذج العام)',
    customScheduleLabel: 'جدول مخصص',
    customPlaceholder: 'تعبير cron',
    customHint: 'استخدم صيغة cron القياسية.',
    optional: 'اختياري',
    promptRequired: 'الرسالة مطلوبة.',
    promptScheduleRequired: 'الرسالة والجدول مطلوبان',
    scheduleRequired: 'الجدول الزمني مطلوب.',
    scriptOnlyEditHint: 'مهمة برنامج نصي فقط (بلا رسالة للذكاء الاصطناعي). معرّف المهمة:',
    saveChanges: 'حفظ التغييرات',
    createAction: 'إنشاء مهمة مجدولة',
    tabs: {
      jobs: 'المهام',
      blueprints: 'المخططات'
    },
    blueprints: {
      tab: 'المخططات',
      startFrom: 'البدء من',
      custom: 'مخصص',
      subtitle: 'أتمتة جاهزة',
      dialogDesc: 'املأ التفاصيل وحدد الموعد.',
      scheduleIt: 'جدولة المهمة',
      scheduling: 'جار الجدولة...',
      scheduled: 'تم جدولة المخطط',
      loading: 'جار تحميل المخططات...',
      failedLoad: 'فشل تحميل المخططات',
      emptyTitle: 'لا توجد مخططات متاحة',
      emptyDesc: 'لا توجد مخططات أتمتة متاحة على هذا الخادم.',
      titles: {
        'Morning briefing': 'إحاطة الصباح',
        'Important-mail monitor': 'مراقب البريد المهم',
        'Weekly review': 'مراجعة أسبوعية',
        'Workday start reminder': 'تذكير ببداية يوم العمل',
        'Custom reminder': 'تذكير مخصص',
        'Evening wind-down': 'استرخاء المساء',
        'Topic news digest': 'ملخص أخبار الموضوع',
        'Bills & renewals reminder': 'تذكير بالفواتير والتجديدات',
        'Price & availability watch': 'مراقبة السعر والتوفر',
        'Competitor news watch': 'مراقبة أخبار المنافسين',
        'Habit check-in': 'متابعة العادة',
        'Hydration & movement nudge': 'تذكير بالشرب والحركة',
        'Weekly meal plan': 'خطة وجبات أسبوعية',
        'Daily learning drip': 'تعلم يومي',
        'Gratitude & reflection prompt': 'سؤال للامتنان والتأمل',
        'On-this-day discovery': 'اكتشاف في مثل هذا اليوم'
      },
      descriptions: {
        'Morning briefing': 'إحاطة يومية موجزة: التقويم اليومي والطقس والمهام العاجلة.',
        'Important-mail monitor': 'يتحقق من صندوق الوارد بانتظام وينبّهك فقط عندما يستحق أمر ما اهتمامك فعلًا.',
        'Weekly review': 'مراجعة أسبوعية: ما تم إنجازه، والمهام المعلقة، وما هو قادم.',
        'Workday start reminder': 'تذكير بيوم العمل مع جدول الأعمال والمهام الأولى.',
        'Custom reminder': 'تذكير متكرر مخصص حسب جدولك الزمني.',
        'Evening wind-down': 'فحص نهاية اليوم: ما هو قادم غدًا وما تحتاج إعداده الليلة.',
        'Topic news digest': 'ملخص منتظم حول المواضيع التي تهتم بها — فقط العناصر الجديدة حقًا بعد إلغاء التكرار.',
        'Bills & renewals reminder':
          'تحذير مسبق قبل المدفوعات المتكررة أو تجديدات الاشتراك أو تواريخ الاستحقاق — تجنب الرسوم المفاجئة.',
        'Price & availability watch':
          'يراقب منتجات أو رحلات أو فنادق أو إعلانات محددة وينبّهك عندما يحقق السعر أو التوفر شروطك.',
        'Competitor news watch':
          'يتتبع الأخبار المهمة عن شركات محددة — إطلاقات وأسعار وتمويل وإفصاحات رسمية — مع ملخصات موثّقة بمصادرها.',
        'Habit check-in': 'تذكيرات منتظمة للمواظبة على عادة ومراجعة ما أنجزته منها.',
        'Hydration & movement nudge': 'تذكيرات منتظمة طوال اليوم للشرب والوقوف والتمدد.',
        'Weekly meal plan': 'خطة وجبات أسبوعية مصممة حسب نظامك الغذائي ووقت الطهي، مع قائمة تسوق مجمعة.',
        'Daily learning drip': 'درس صغير واحد يوميًا حول موضوع تريد تعلمه — يتراكم مع مرور الوقت.',
        'Gratitude & reflection prompt': 'سؤال يومي أو أسبوعي للتأمل وتدوين ما تمتن له وما تعلّمته.',
        'On-this-day discovery': 'أحداث مثيرة للاهتمام حدثت في التاريخ في هذا اليوم — مخصصة حسب اهتماماتك.'
      },
      labels: {
        'What time?': 'أي وقت؟',
        'Where to deliver?': 'أين التسليم؟',
        'How often?': 'كم مرة؟',
        'Remind me to…': 'ذكرني بـ…',
        'Which day?': 'أي يوم؟',
        'Repeat on': 'كرر في',
        'What topic?': 'أي موضوع؟',
        'How many bullets?': 'كم نقطة؟',
        "What's due?": 'ما المستحق؟',
        'What exactly to watch?': 'ماذا تراقب بالضبط؟',
        'Alert me when…': 'نبهني عندما…',
        'Which companies?': 'أي شركات؟',
        'Which events matter?': 'أي أحداث مهمة؟',
        'Which habit?': 'أي عادة؟',
        'Start hour': 'ساعة البدء',
        'End hour': 'ساعة الانتهاء',
        'Diet?': 'قيود غذائية؟',
        'Meals per day?': 'وجبات يوميًا؟',
        'Cooking effort?': 'جهد الطهي؟',
        'Only notify me if the mail…': 'فقط أخبرني إذا كان البريد…',
        'Learn about…': 'التعلم حول…',
        'What kind?': 'أي نوع؟'
      },
      helps: {
        '24h local time, e.g. 08:00': 'بتوقيت محلي 24 ساعة، مثل 08:00',
        'minutes between checks': 'دقائق بين كل فحص',
        'hours between checks — be gentle with rate limits': 'ساعات بين كل فحص — راعِ حدود معدل الطلبات',
        'hours between nudges': 'ساعات بين كل تذكير',
        'first hour of the active window (24h)': 'الساعة الأولى من النافذة النشطة (24 ساعة)',
        'last hour of the active window (24h)': 'الساعة الأخيرة من النافذة النشطة (24 ساعة)'
      },
      options: {
        everyday: 'كل يوم',
        weekdays: 'من الاثنين إلى الجمعة',
        weekends: 'السبت والأحد',
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        'dinner only': 'العشاء فقط',
        'lunch and dinner': 'الغداء والعشاء',
        'all three': 'الثلاث وجبات',
        quick: 'سريع',
        medium: 'متوسط',
        ambitious: 'متقدم',
        'no restrictions': 'بدون قيود',
        vegetarian: 'نباتي',
        vegan: 'نباتي صرف',
        'high-protein': 'غني بالبروتين',
        'low-carb': 'منخفض الكربوهيدرات',
        'on this day in history': 'في مثل هذا اليوم من التاريخ',
        'word of the day': 'كلمة اليوم',
        'science fact': 'حقيقة علمية',
        'quote of the day': 'اقتباس اليوم',
        auto: 'تلقائي',
        websocket: 'websocket',
        poll: 'استطلاع دوري'
      }
    },
    lastRunFailed: 'فشل آخر تشغيل:',
    editJob: 'تحرير المهمة',
    runAgain: 'تشغيل مرة أخرى',
    overdueSince: 'متأخر منذ:',
    modelImpact: {
      title: 'تبقى المهام المجدولة على نموذجها الأصلي',
      message: count =>
        `${count} من المهام المجدولة غير المثبتة ستواصل العمل على النموذج الذي أُنشئت به. ثبّتها أو اضبط cron.model لنقلها.`,
      detailMore: (names, remaining) => `${names} و${remaining} أخرى`,
      review: 'مراجعة المهام المجدولة',
      saveFailed: 'لم يحفظ Hermes تغيير النموذج هذا.',
      confirmTitle: 'تحذير اختيار النموذج',
      confirmDetail: 'أكّد فقط إذا كنت تقبل هذه المقايضة.',
      confirmAction: 'تأكيد',
      declined: 'أُلغي تغيير النموذج — رفضت تحذير فئة الخدمة التي تستخدم البيانات للتدريب.'
    }
  }
} satisfies Pick<TranslationOverrides, 'commandCenter' | 'messaging' | 'profiles' | 'cron'>
