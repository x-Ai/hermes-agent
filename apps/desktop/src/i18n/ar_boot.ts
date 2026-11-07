import { arDesktopCommands } from './ar_desktop_commands'
import { AR_PLURAL } from './ar_plural'
import { arSessionCommands } from './ar_session_commands'
import type { TranslationOverrides } from './define-locale'

export const arBoot = {
  boot: {
    ready: 'Hermes Desktop جاهز',
    connecting: 'جار الاتصال',
    desktopBootFailedWithMessage: message => `تعذّر تشغيل تطبيق سطح المكتب: ${message}`,
    steps: {
      connectingGateway: 'جارٍ الاتصال ببوابة تطبيق سطح المكتب',
      loadingSettings: 'جار تحميل إعدادات Hermes',
      loadingSessions: 'جار تحميل الجلسات الأخيرة',
      retryingRemoteBackend: 'جارٍ إعادة الاتصال بواجهة Hermes الخلفية البعيدة…',
      startingDesktopConnection: 'جارٍ بدء اتصال تطبيق سطح المكتب',
      startingHermesDesktop: 'جار تشغيل Hermes Desktop...',
      backendReady: 'واجهة Hermes الخلفية جاهزة',
      connectingRemoteBackend: 'جارٍ الاتصال بواجهة Hermes الخلفية البعيدة',
      resolvingBackend: 'جارٍ تحديد واجهة Hermes الخلفية',
      resolvingRuntime: 'جار تحديد بيئة تشغيل Hermes',
      restartingAfterUpdate: 'جار إعادة تشغيل Hermes لإكمال التحديث…',
      runtimeReady: 'بيئة تشغيل Hermes جاهزة',
      startingBackend: 'جارٍ تشغيل واجهة Hermes الخلفية',
      usingRuntime: 'جارٍ استخدام بيئة تشغيل Hermes المثبّتة',
      waitingBackendLaunch: 'في انتظار تشغيل واجهة Hermes الخلفية',
      waitingBackendReady: 'في انتظار جاهزية واجهة Hermes الخلفية',
      waitingForUpdate: 'في انتظار اكتمال التحديث الحالي…',
      waitingSetupChoice: 'في انتظار اختيارك لإعداد التشغيل الأول'
    },
    errors: {
      backgroundExited:
        'توقفت الخدمة التي تشغّل محادثاتك على نحو غير متوقع. أعد تشغيلها للمتابعة — محادثاتك وإعداداتك في أمان.',
      backgroundExitedDuringStartup: 'توقّف Hermes مباشرةً بعد بدء تشغيله.',
      backendStopped: 'توقّف Hermes عن العمل في الخلفية',
      desktopBootFailed: 'تعذّر تشغيل Hermes',
      gatewayConnectionLost: 'انقطع اتصال Hermes',
      gatewayConnectionLostDetail:
        'لا يزال Hermes يحاول إعادة الاتصال. يمكنك مواصلة القراءة وكتابة المسودات. إذا استمر ذلك، فأعد الاتصال الآن أو تحقّق من إعدادات الاتصال.',
      gatewaySignInRequired: 'تم تسجيل خروجك من Hermes البعيد',
      ipcBridgeUnavailable: 'تعذّر على Hermes Desktop التواصل مع طبقته الخلفية. أعد تشغيل التطبيق.',
      restartHermes: 'إعادة تشغيل Hermes',
      openLogs: 'فتح السجلات',
      reconnectNow: 'إعادة الاتصال الآن',
      connectionSettings: 'إعدادات الاتصال',
      gatewaySignInRequiredDetail: 'سجّل الدخول مجددًا لإعادة الاتصال. محادثاتك وإعداداتك في أمان.',
      signInAgain: 'تسجيل الدخول مجددًا'
    },
    failure: {
      title: 'تعذر تشغيل Hermes',
      description:
        'لم تبدأ خدمة Hermes الخلفية. جرّب إحدى خطوات الاستعادة أدناه. لا يحذف أي من هذه الخيارات محادثاتك أو إعداداتك.',
      remoteTitle: 'يلزم تسجيل الدخول إلى البوابة البعيدة',
      remoteDescription:
        'انتهت صلاحية جلسة البوابة البعيدة. سجّل الدخول مجددًا لإعادة الاتصال. لا يحذف أي من هذه الخيارات محادثاتك أو إعداداتك.',
      webappTitle: 'تسجيل الدخول إلى Hermes',
      webappDescription: 'شغّل hermes webapp على هذا الجهاز لتسجيل الدخول في هذا المتصفح.',
      retry: 'إعادة المحاولة',
      repairInstall: 'إصلاح التثبيت',
      useLocalGateway: 'استخدام البوابة المحلية',
      gatewaySettings: 'إعدادات البوابة',
      back: 'رجوع',
      openLogs: 'فتح السجلات',
      repairHint: 'يعيد الإصلاح تشغيل المثبت وقد يستغرق بضع دقائق على جهاز جديد.',
      bundledReinstallHint:
        'لا يستطيع هذا التثبيت المضمّن إصلاح نفسه من داخل التطبيق — أعد تثبيت التطبيق لاستعادة واجهته الخلفية.',
      reinstallApp: 'إعادة تثبيت التطبيق',
      remoteSignInHint: signInLabel =>
        `يسجّل الخروج من جلسة المتصفح البعيدة المحفوظة، ثم يفتح نافذة ${signInLabel}. اختر «استخدام البوابة المحلية» للتبديل إلى الواجهة الخلفية المضمّنة بدلًا من ذلك.`,
      signOutAndSignIn: 'تسجيل الخروج وإعادة تسجيل الدخول',
      remoteFailureHint: 'تحقق من رابط البوابة وتسجيل الدخول في إعدادات البوابة، أو انتقل إلى البوابة المحلية.',
      cloudDownTitle: 'وكيل Nous Cloud متوقف',
      cloudDownDescription:
        'يُرجع الوكيل السحابي الذي تديره Nous، والذي تتصل به هذه البوابة، خطأً من الخادم. لا يمكن إعادة تشغيله من هنا — تحقّق من حالته، أو انتقل إلى البوابة المحلية، أو اطلب الدعم.',
      cloudDownHint:
        'تفتح الأزرار أدناه Nous Portal (حالة المثيل وعناصر التحكم) ومجتمعنا على Discord للحصول على الدعم.',
      cloudDownCheckPortal: 'التحقق من الحالة في Nous Portal',
      cloudDownDiscord: 'الحصول على مساعدة عبر Discord',
      hideRecentLogs: 'إخفاء السجلات الأخيرة',
      showRecentLogs: 'إظهار السجلات الأخيرة',
      signedInTitle: 'تم تسجيل الدخول',
      signedInMessage: 'جار إعادة الاتصال بالبوابة البعيدة...',
      signInIncompleteTitle: 'تسجيل الدخول غير مكتمل',
      signInIncompleteMessage: 'أُغلقت نافذة تسجيل الدخول قبل اكتمال المصادقة.',
      signInFailed: 'فشل تسجيل الدخول',
      signInToRemoteGateway: 'تسجيل الدخول إلى البوابة البعيدة',
      signInWithProvider: provider => `تسجيل الدخول عبر ${provider}`,
      identityProvider: 'مزوّد الهوية',
      details: 'تفاصيل'
    },
    causes: {
      exitedEarly: 'توقفت خدمة Hermes الخلفية مباشرةً بعد بدء تشغيلها.',
      timedOut: 'لم تستجب خدمة Hermes الخلفية في الوقت المحدد.',
      permission: 'تعذر على Hermes الكتابة إلى مجلد البيانات الخاص به (مشكلة في الإذن).',
      diskFull: 'القرص ممتلئ، لذلك لا يمكن بدء تشغيل Hermes.',
      portInUse: 'يستخدم برنامج آخر منفذ الشبكة الذي يحتاجه Hermes.',
      installMissing: 'جزء من تثبيت Hermes مفقود. اختر «إصلاح التثبيت» لإعادته.'
    },
    updateHold: {
      title: 'لا يزال تحديث سابق يحجز Hermes',
      titleUnverified: 'لا يستطيع Hermes التأكد من اكتمال التحديث الأخير',
      description:
        'يؤجّل Hermes بدء تشغيله كي لا يحمّل ملفات ربما لا يزال أحد التحديثات يغيّرها. سيبدأ من تلقاء نفسه فور انتهاء الحجز.',
      heldByProcess: pid => `انتهى التحديث (العملية ${pid})، لكن عملية بدأها لا تزال تحجز تثبيت Hermes.`,
      heldUnknown: 'انتهى أحد التحديثات، لكن عملية بدأها لا تزال تحجز تثبيت Hermes.',
      unverified: 'تعذّر على مساعد التحديث معرفة الجهة التي تملك تثبيت Hermes الآن. يواصل Hermes التحقق.',
      since: time => `في الانتظار منذ ${time}`,
      lastChecked: time => `آخر تحقق: ${time}`,
      recoveryHint:
        'يزول هذا عادةً خلال بضع دقائق. وإن لم يزل: أنهِ Hermes، وأوقف عمليات git أو hermes المتبقية (أو أعد تشغيل الجهاز)، ثم افتح Hermes مجددًا.',
      checkAgain: 'التحقق مجددًا',
      quit: 'إنهاء Hermes',
      openLogs: 'فتح السجلات',
      startAnyway: 'التشغيل على أي حال…',
      confirmTitle: 'تشغيل Hermes بينما لا يزال التحديث يحجزه؟',
      confirmBody:
        'ربما لا تزال عملية التحديث المتبقية تغيّر ملفات Hermes. قد يؤدي التشغيل الآن إلى تحميل تثبيت محدَّث جزئيًا، وقد لا يعمل حتى تُشغّل التحديث مجددًا. يسجّل Hermes هذا الاختيار في سجله ويُبقي علامة التحديث في مكانها.',
      confirmKeepWaiting: 'مواصلة الانتظار',
      confirmStart: 'التشغيل على أي حال',
      startAnywayRefused: 'تغيّر ما يحجز التثبيت قبل أن يتمكن Hermes من البدء. راجعه وأعد المحاولة.'
    }
  },
  keepAwakeOffer: {
    title: 'دخل جهاز الكمبيوتر في وضع السكون أثناء عمل Hermes',
    message:
      'يمكن لـ Hermes إبقاء جهازك مستيقظًا أثناء تشغيل مهمة. ستنطفئ الشاشة كالمعتاد، وقد يدخل الجهاز في وضع السكون عند العمل بالبطارية.',
    action: 'إبقاء الجهاز مستيقظًا أثناء العمل'
  },
  remoteDisplayBanner: {
    message: reason => `العرض البرمجي مفعّل — اكتُشف عرض عن بُعد (${reason}). عُطِّل تسريع GPU لمنع الوميض.`
  },
  butterbar: {
    goTo: (index, total) => `عرض الإشعار ${index} من ${total}`,
    legal: {
      before: 'يخضع استخدام Hermes Agent لـ',
      terms: 'شروط الخدمة',
      between: ' و',
      privacy: 'سياسة الخصوصية',
      after: ' الخاصة بنا.'
    }
  },
  promptNotices: {
    legacySendUnconfirmed:
      'تعذّر على هذا الخادم تأكيد الإرسال السابق لهذه الرسالة، لذا ربما تم تنفيذها بالفعل. راجع المحادثة قبل إرسالها مرة أخرى.',
    restoredDraftAttachmentsDropped: 'لم تُستعَد مرفقات رسالتك غير المرسلة. أرفقها مجددًا قبل إرسالها.',
    mcpReloadDeferred:
      'هذه المحادثة مشغولة: يُطبَّق تغيير MCP بعد انتهاء دورها وإعادة تحميل MCP مجددًا، أو عند إعادة فتح المحادثة',
    mcpReloadUnavailable: servers => `تعذّر الاتصال: ${servers}`,
    compactedTurnUnavailable: 'تم تلخيص هذه الرسالة عند ضغط المحادثة، لذا لم يعد بالإمكان استعادتها أو تحريرها.',
    staleTurnUnavailable: 'لم تعد هذه الرسالة موجودة في سجل هذه المحادثة.',
    sessionCommands: arSessionCommands,
    desktopCommands: arDesktopCommands
  },
  updates: {
    discontinuedTitle: 'لم يعد إصدار Hermes هذا مدعومًا',
    discontinuedBody: 'لم يعد إصدار Hermes هذا مدعومًا وقد يتوقف عن العمل — ألغِ تثبيته. ستبقى بياناتك على القرص.',
    channels: { stable: 'مستقر', canary: 'تجريبي' },
    bundleSwapPending: 'أعد التشغيل لإكمال التحديث',
    bundleSwapPendingDesc:
      'تم تثبيت التطبيق المحدَّث بالفعل — يكفي إعادة تشغيل Hermes لتحميله. لن تتأثر المحادثات أو الإعدادات.',
    bundleSwapPendingAction: 'إعادة تشغيل Hermes',
    stages: {
      idle: 'جار التحضير...',
      prepare: 'جار التحضير...',
      fetch: 'جار التنزيل...',
      pull: 'أوشكنا على الانتهاء...',
      pydeps: 'جار الإنهاء...',
      update: 'جار تحديث Hermes...',
      rebuild: 'جار إعادة بناء تطبيق سطح المكتب...',
      restart: 'جار إعادة تشغيل Hermes...',
      done: 'اكتمل التحديث',
      manual: 'التحديث من الطرفية',
      guiSkew: 'تحديث تطبيق سطح المكتب',
      error: 'تم إيقاف التحديث مؤقتا'
    },
    checking: 'جار البحث عن تحديثات...',
    checkFailedTitle: 'تعذّر التحقق من التحديثات',
    tryAgain: 'إعادة المحاولة',
    notAvailableTitle: 'التحديث غير متاح',
    unsupportedMessage: 'لا يمكن لهذا الإصدار من Hermes تحديث نفسه من داخل التطبيق.',
    appName: 'Hermes',
    version: value => `الإصدار ${value}`,
    versionUnavailable: 'الإصدار غير متاح',
    bundleOutOfSync: 'إصدار التطبيق قديم',
    bundleOutOfSyncDesc:
      'تم تحديث بيئة تشغيل Hermes، لكن تطبيق سطح المكتب نفسه لا يزال على إصدار أقدم. حدّثه للحصول على أحدث الإصلاحات.',
    bundleOutOfSyncAction: 'الحصول على المثبّت',
    checkNow: 'التحقق الآن',
    checkingShort: 'جار التحقق...',
    seeWhatsNew: 'عرض الجديد',
    releaseNotes: 'ملاحظات الإصدار',
    onLatest: 'أنت على أحدث إصدار',
    installing: 'يجري تثبيت تحديث الآن.',
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
    never: 'لم يُجرَ بعد',
    justNow: 'الآن',
    minAgo: count =>
      AR_PLURAL(count, { one: 'قبل دقيقة', two: 'قبل دقيقتين', few: `قبل ${count} دقائق`, many: `قبل ${count} دقيقة` }),
    hoursAgo: count =>
      AR_PLURAL(count, { one: 'قبل ساعة', two: 'قبل ساعتين', few: `قبل ${count} ساعات`, many: `قبل ${count} ساعة` }),
    daysAgo: count =>
      AR_PLURAL(count, {
        one: 'قبل يوم',
        two: 'قبل يومين',
        few: `قبل ${count} أيام`,
        many: `قبل ${count} يومًا`,
        other: `قبل ${count} يوم`
      }),
    versionDetailsTitle: 'تفاصيل الإصدار',
    versionDetailsBody: 'هذا التثبيت مُدار خارج التطبيق. حدّثه بالطريقة نفسها التي استخدمتها لتثبيته.',
    versionDetailsVersion: 'الإصدار',
    versionDetailsCommit: 'الإيداع',
    versionDetailsBuildOrigin: 'مصدر البناء',
    versionDetailsBuildOriginLocal: 'محلي',
    versionDetailsDistribution: 'التوزيع',
    versionDetailsDistributionDesktop: 'تطبيق سطح المكتب',
    versionDetailsDistributionDesktopMsix: 'تطبيق سطح المكتب (MSIX)',
    versionDetailsDistributionDesktopInstaller: 'تطبيق سطح المكتب (المُثبِّت)',
    versionDetailsDistributionSourceInstaller: 'المصدر (سكربت التثبيت)',
    versionDetailsDistributionSourceInstallerDesktop: 'المصدر (سكربت التثبيت) + hermes desktop',
    versionDetailsDistributionSource: 'المصدر',
    versionDetailsDistributionSourceDesktop: 'المصدر + hermes desktop',
    versionDetailsDistributionStore: 'Microsoft Store',
    versionDetailsRuntimeEmbedded: 'بيئة تشغيل مضمّنة',
    versionDetailsRuntimeExternal: 'خارجية (تستخدم بيئة التشغيل المثبّتة على الجهاز)',
    versionDetailsRuntime: 'بيئة التشغيل',
    versionDetailsInstallId: 'معرّف التثبيت',
    versionDetailsUncommittedChanges: 'تغييرات غير مودَعة',
    versionDetailsBackend: 'الواجهة الخلفية المتصلة',
    versionDetailsClient: 'هذا الجهاز',
    connectionRetry:
      'تعذّر على Hermes الوصول إلى خادم التحديثات. تحقّق من اتصالك بالإنترنت وأعد المحاولة. إذا كنت تستخدم Hermes بعيدًا، فتأكد من أنه متصل.',
    latestBody: 'أنت تستخدم أحدث إصدار.',
    latestBodyBackend: 'الواجهة الخلفية تعمل بأحدث إصدار.',
    allSetTitle: 'كل شيء جاهز',
    availableTitle: 'يتوفر تحديث جديد',
    availableBody: 'إصدار جديد من Hermes جاهز للتثبيت.',
    availableTitleBackend: 'يتوفر تحديث للواجهة الخلفية',
    availableBodyBackend: 'إصدار أحدث من واجهة Hermes الخلفية المتصلة جاهز للتثبيت.',
    availableBodyNoChangelog: 'إصدار أحدث جاهز. ملاحظات الإصدار غير متاحة لنوع التثبيت هذا.',
    availableBodyRelease: (tag: string) => `الإصدار ${tag} جاهز للتثبيت.`,
    availableBodyAppInstaller:
      'إصدار جديد من Hermes جاهز. سيُغلَق Hermes، وسيُكمل Windows التحديث، ثم يُعاد فتح Hermes من تلقاء نفسه.',
    updateNow: 'التحديث الآن',
    maybeLater: 'ربما لاحقا',
    moreChanges: count =>
      AR_PLURAL(count, {
        one: '+ تغيير إضافي واحد مُضمَّن.',
        two: '+ تغييران إضافيان مُضمَّنان.',
        few: `+ ${count} تغييرات إضافية مُضمَّنة.`,
        many: `+ ${count} تغييرًا إضافيًا مُضمَّنًا.`,
        other: `+ ${count} تغيير إضافي مُضمَّن.`
      }),
    changelogGroups: {
      new: 'الجديد',
      fixed: 'الإصلاحات',
      faster: 'أسرع',
      improved: 'التحسينات',
      other: 'تحسينات أخرى'
    },
    changelogFallbackTitle: 'في هذا التحديث',
    changelogFallback: 'تحسينات وإصلاحات',
    copyFullLog: 'نسخ سجل التغييرات الكامل',
    manualTitle: 'التحديث من الطرفية',
    manualUnavailableTitle: 'لا يمكن التحديث من هنا',
    manualBody: 'لقد ثبّتت Hermes من سطر الأوامر، لذا تُجرى التحديثات من هناك أيضا. الصق هذا في طرفيتك:',
    manualBodyBackend: 'تُدار واجهة Hermes الخلفية خارج هذا التطبيق. نفّذ هذا الأمر على الخادم الذي يستضيفها:',
    manualPickedUp: 'سيستخدم Hermes الإصدار الجديد في المرة التالية التي تشغّله فيها.',
    manualPickedUpBackend: 'تنتقل الواجهة الخلفية إلى الإصدار الجديد بعد اكتمال التحديث.',
    guiSkewTitle: 'تحديث تطبيق سطح المكتب',
    guiSkewBody:
      'تم تحديث الواجهة الخلفية، لكن حزمة تطبيق سطح المكتب هذه لم تتغير. حدّث أو أعد تثبيت تطبيق Hermes لسطح المكتب (ملف AppImage / ‎.deb / ‎.rpm) لمطابقته.',
    copy: 'نسخ',
    copied: 'تم النسخ',
    done: 'تم',
    applyingBody:
      'يتولّى مُحدِّث Hermes المهمة في نافذته الخاصة ويعيد فتح Hermes تلقائيا عند الانتهاء. الرجاء عدم إعادة فتح Hermes بنفسك أثناء التحديث.',
    applyingBodyBackend:
      'تطبّق الواجهة الخلفية البعيدة التحديث وستعيد التشغيل. يعيد Hermes الاتصال تلقائيا عند عودتها.',
    applyingClose: 'ستُغلق هذه النافذة أثناء تشغيل التحديث، ثم يعيد Hermes فتح نفسه تلقائيا.',
    applyingBodyAppInstaller:
      'سيُغلَق Hermes وسيُكمل Windows التحديث. سيُعاد فتح Hermes عند الانتهاء — لا داعي لأن تفعل شيئًا.',
    checkUnknownTitleAppInstaller: 'تعذّر التحقق من التحديثات',
    checkUnknownBodyAppInstaller:
      'تعذّر على Windows التحقق من التحديثات الآن. تُثبَّت التحديثات تلقائيًا أيضًا عند إعادة تشغيل Hermes.',
    errorTitle: 'لم يكتمل التحديث',
    errorBody: 'لا داعي للقلق — لم يُفقد شيء. يمكنك إعادة المحاولة الآن.',
    blockerTitle: 'إغلاق المعاينات المحلية لتحديث Hermes؟',
    blockerBody: 'يحتاج Hermes إلى إيقاف هذه المعاينات المحلية قبل التحديث. لن يؤدي ذلك إلى تعديل ملفاتك أو حذفها.',
    foreignBlockerTitle: 'أغلق العمليات الأخرى لتحديث Hermes',
    foreignBlockerBody:
      'لا يمكن لـ Hermes إغلاق هذه العمليات تلقائيًا بأمان. أغلق التطبيق أو الطرفية أو الخدمة التي تشغّل كل عملية، ثم حاول التحديث مرة أخرى.',
    mixedBlockerBody:
      'يمكن لـ Hermes إغلاق المعاينات المحلية المدرجة أدناه. يجب إغلاق العمليات الأخرى يدويًا قبل متابعة التحديث.',
    closePreviewsAndUpdate: 'إغلاق المعاينات والتحديث',
    closePreviewsAndCheckAgain: 'إغلاق المعاينات والتحقق مجددًا',
    localPreview: 'معاينة محلية',
    portLabel: port => `المنفذ ${port}`,
    pidLabel: pid => `معرّف العملية ${pid}`,
    technicalDetails: 'التفاصيل التقنية',
    notNow: 'ليس الآن',
    clientAlsoBehindTitle: 'تطبيق سطح المكتب غير محدَّث',
    clientAlsoBehindMessage:
      'الواجهة الخلفية محدَّثة، لكن تطبيق سطح المكتب هذا لا يزال على إصدار أقدم. حدّثه للحصول على أحدث الإصلاحات.',
    clientAlsoBehindAction: 'تحديث تطبيق سطح المكتب',
    everythingDispatched: 'تم إرسال التحديث',
    everythingSkipped: 'تم التخطي',
    everythingRowFailed: 'فشل التحديث',
    everythingFanoutFailedTitle: 'تعذر تحديث المثيلات الأخرى',
    changeLogNew: 'جديد',
    changeLogFixed: 'إصلاحات',
    changeLogFaster: 'أسرع',
    changeLogImproved: 'تحسينات',
    changeLogOther: 'تحسينات أخرى',
    changeLogFallbackLabel: 'في هذا التحديث',
    changeLogFallbackItem: 'تحسينات وإصلاحات',
    applyStatus: {
      preparing: 'جار تحديث الواجهة الخلفية...',
      pulling: 'جار تحديث الواجهة الخلفية...',
      restarting: 'تعيد الواجهة الخلفية التشغيل لتحميل التحديث...',
      notAvailable: 'التحديث غير متاح لهذه الواجهة الخلفية.',
      failed: 'فشل تحديث الواجهة الخلفية.',
      noReturn: 'لم تعد الواجهة الخلفية إلى الاتصال. قد لا يكون التحديث قد اكتمل — تحقق من مضيف الواجهة الخلفية.',
      owed: steps =>
        `تم تحديث الواجهة الخلفية، لكن خطوات لا تزال معلّقة: ${steps}. أعد تشغيل \`hermes update\` لإكمالها.`
    },
    gitUnusable: 'لم يتمكن Hermes من تشغيل Git على هذا الجهاز، لذا لم يتمكن من التحقق من التحديثات.',
    connectionSettings: 'إعدادات الاتصال',
    openDownloadPage: 'فتح صفحة التنزيل',
    justNowSuffix: ' · الآن'
  },
  install: {
    stageStates: {
      pending: 'قيد الانتظار',
      running: 'جار التثبيت',
      succeeded: 'تم',
      skipped: 'تم التخطي',
      failed: 'فشل'
    },
    stageNames: {
      uv: 'تثبيت uv',
      python: 'التحقق من Python',
      git: 'تثبيت Git',
      node: 'اكتشاف Node.js',
      'system-packages': 'تثبيت حزم النظام',
      prerequisites: 'متطلبات النظام',
      repository: 'تنزيل Hermes Agent',
      venv: 'إنشاء بيئة Python',
      dependencies: 'تثبيت تبعيات Python',
      'python-deps': 'تثبيت تبعيات Python',
      'node-deps': 'تثبيت تبعيات أداة المتصفح',
      desktop: 'بناء تطبيق سطح المكتب',
      path: 'تثبيت أمر hermes',
      'config-templates': 'كتابة قوالب الإعداد',
      config: 'تجهيز الإعدادات والمهارات',
      'platform-sdks': 'تثبيت حزم منصات المراسلة',
      'bootstrap-marker': 'تسجيل اكتمال التثبيت',
      configure: 'ضبط مفاتيح API والنماذج',
      setup: 'ضبط مفاتيح API والإعدادات',
      gateway: 'تكوين خدمة البوابة',
      repo: 'تنزيل Hermes Agent',
      complete: 'إنهاء التثبيت'
    },
    unknownError: 'خطأ غير معروف',
    oneTimeTitle: 'يحتاج Hermes إلى تثبيت لمرة واحدة',
    unsupportedDesc: platform =>
      `التثبيت التلقائي عند أول تشغيل غير متاح على ${platform} بعد. افتح الطرفية وشغّل الأمر أدناه، ثم أعد تشغيل هذا التطبيق. ستتخطى عمليات التشغيل اللاحقة هذه الخطوة.`,
    installCommand: 'أمر التثبيت',
    copyCommand: 'نسخ الأمر',
    viewDocs: 'عرض مستندات التثبيت',
    installTo: 'سيتم التثبيت في',
    retryAfterRun: 'لقد شغّلته -- إعادة المحاولة',
    setupChoiceTitle: 'إعداد Hermes Desktop',
    setupChoiceDesc: 'اربط هذا التطبيق ببوابة Hermes تعمل مسبقاً، أو ثبّت Hermes محلياً على هذا الحاسوب.',
    setupChoiceDescLocal: 'ثبّت Hermes على هذا الجهاز، أو اتصل ببوابة Hermes تشغّلها مسبقًا.',
    connectExistingTitle: 'الاتصال بتثبيت Hermes موجود',
    connectExistingShort: 'الاتصال بتثبيت موجود',
    connectExistingDesc: 'استخدم واجهة خلفية بعيدة عبر رمز جلسة أو تسجيل الدخول من المتصفح. لن يبدأ أي تثبيت محلي.',
    installLocalTitle: 'تثبيت Hermes محلياً',
    installLocalDesc: 'نزّل Hermes، وأنشئ بيئة Python الخاصة به، وشغّل الواجهة الخلفية على هذا الحاسوب.',
    useLocalTitle: 'استخدام Hermes على هذا الجهاز',
    useLocalDesc: 'بيئة تشغيل Hermes مثبّتة هنا بالفعل — شغّلها بنقرة واحدة. لن يُنزَّل أي شيء.',
    bundledLocalDesc: 'استخدم بيئة تشغيل Hermes المضمّنة في هذا التطبيق — فالواجهة الخلفية المضمّنة هي التثبيت المحلي.',
    localStartUnavailable: 'تعذر بدء التثبيت المحلي. أعد تشغيل Hermes Desktop ثم حاول مجدداً.',
    remoteSetupTitle: 'الاتصال بتثبيت Hermes موجود',
    remoteSetupDesc: 'أدخل رابط البوابة. سيكتشف Hermes Desktop ما إذا كان يحتاج رمزاً أو تسجيل دخول عبر المتصفح.',
    remoteUrlTitle: 'رابط البوابة',
    remoteUrlDesc: 'استخدم الرابط الأساسي لبوابة Hermes، بما في ذلك https:// عند الاتصال عن بُعد.',
    remoteUrlPlaceholder: 'https://gateway.example.com/hermes',
    probing: 'جار اكتشاف مصادقة البوابة...',
    probeError:
      'لا يستطيع Hermes الوصول إلى هذا العنوان. تحقّق من الرابط ومن أن Hermes يعمل على الحاسوب الآخر — ستظهر خيارات تسجيل الدخول بمجرد أن يستجيب.',
    identityProvider: 'مزوّد الهوية',
    authTitle: 'المصادقة',
    authNeedsOauth: provider => `سجّل الدخول عبر ${provider} قبل اختبار هذه البوابة.`,
    authSignedIn: 'اكتمل تسجيل الدخول عبر المتصفح.',
    connected: 'متصل',
    signIn: 'تسجيل الدخول',
    signInWith: provider => `تسجيل الدخول عبر ${provider}`,
    enterUrlFirst: 'أدخل رابط البوابة أولاً.',
    signInIncomplete: 'أُغلقت نافذة تسجيل الدخول قبل اكتمال المصادقة.',
    tokenTitle: 'رمز الجلسة',
    tokenDesc: 'الصق رمز الجلسة من ملف .env الخاص بالبوابة البعيدة.',
    pasteSessionToken: 'الصق رمز الجلسة',
    incompleteSignInTest: 'سجّل الدخول قبل اختبار هذه البوابة المحمية بـ OAuth.',
    incompleteTokenTest: 'أدخل رمز جلسة قبل اختبار هذه البوابة.',
    testConnection: 'اختبار الاتصال',
    testSucceeded: (baseUrl, version) => `تم الاتصال بـ ${baseUrl}${version ? ` (${version})` : ''}.`,
    applyRemote: 'تطبيق وإعادة الاتصال',
    backToSetup: 'رجوع',
    failedTitle: 'فشل التثبيت',
    settingUpTitle: 'جارٍ إعداد Hermes Agent',
    finishingTitle: 'جار الإنهاء',
    failedDesc:
      'لم تكتمل إحدى خطوات الإعداد. قد يحدث هذا عندما تعمل نسخة أخرى من Hermes، أو ينقطع الاتصال بالإنترنت، أو يحظر برنامج مكافحة الفيروسات المثبّت. أغلق نوافذ Hermes الأخرى، ثم اختر «إعادة التحميل وإعادة المحاولة». إذا فشل التثبيت مجددًا، فافتح السجلات وأرسلها إلى فريق الدعم.',
    activeDesc:
      'هذا إعداد لمرة واحدة. يُنزّل مثبّت Hermes التبعيات ويهيّئ جهازك. ستتخطى عمليات التشغيل اللاحقة هذه الخطوة.',
    progress: (completed, total) => `الخطوات المكتملة: ${completed} من ${total}`,
    currentStage: stage => ` -- الآن: ${stage}`,
    fetchingManifest: 'جار جلب بيان المثبّت...',
    error: 'خطأ',
    hideOutput: 'إخفاء مخرجات المثبّت',
    showOutput: 'إظهار مخرجات المثبّت',
    lines: count =>
      AR_PLURAL(count, {
        one: 'سطر واحد',
        two: 'سطران',
        few: `${count} أسطر`,
        many: `${count} سطرًا`,
        other: `${count} سطر`
      }),
    noOutput: 'لا توجد مخرجات بعد.',
    cancelling: 'جار الإلغاء...',
    cancelInstall: 'إلغاء التثبيت',
    transcriptSaved: 'حُفظ السجل الكامل في',
    copiedOutput: 'تم النسخ!',
    copyOutput: 'نسخ المخرجات',
    reloadRetry: 'إعادة التحميل وإعادة المحاولة',
    probeErrorDetails: 'تفاصيل',
    openLogs: 'فتح السجلات'
  },
  onboarding: {
    headerTitle: 'لنُعِدّ لك Hermes Agent',
    headerDesc: 'اربط مزوّد نماذج لبدء المحادثة. معظم الخيارات تتطلب نقرة واحدة.',
    providerTitles: {
      anthropic: 'مفتاح Anthropic API',
      'claude-code': 'Anthropic OAuth: يلزم رصيد استخدام إضافي لاستخدام الاشتراك',
      'openai-codex': 'اشتراك ChatGPT أو Codex'
    },
    preparingInstall: 'يُكمل Hermes التثبيت. عادة ما يستغرق ذلك أقل من دقيقة في أول تشغيل.',
    starting: 'جار بدء Hermes...',
    setupSlowTitle: 'يستغرق الإعداد وقتا أطول من المعتاد.',
    setupSlowBody: 'لا يزال Hermes قيد البدء في الخلفية.',
    continueWithoutSetup: 'المتابعة دون إعداد',
    lookingUpProviders: 'جار البحث عن المزوّدين...',
    collapse: 'طي',
    otherProviders: 'مزوّدون آخرون',
    haveApiKey: 'لديّ مفتاح API',
    chooseLater: 'سأختار مزوّدا لاحقا',
    recommended: 'موصى به',
    connected: 'متصل',
    featuredPitch: 'اشتراك واحد، أكثر من 300 نموذج متقدم — الطريقة الموصى بها لتشغيل Hermes',
    fireworksPitch: 'واجهة API مباشرة للنماذج — نماذج متقدمة تستضيفها Fireworks',
    localModelsTitle: 'تشغيل النماذج محليًا',
    localModelsPitch: 'لا حاجة إلى حساب — نزّل نموذجًا وشغّله على هذا الجهاز',
    openRouterPitch: 'مفتاح واحد لمئات النماذج — خيار افتراضي جيد',
    apiKeyOptions: {
      fireworks: {
        short: 'واجهة API مباشرة للنماذج',
        description: 'وصول مباشر إلى النماذج التي تستضيفها Fireworks AI.'
      },
      openrouter: {
        short: 'مفتاح واحد، نماذج كثيرة',
        description: 'يستضيف مئات النماذج خلف مفتاح واحد. خيار افتراضي جيد للتثبيتات الجديدة.'
      },
      openai: {
        short: 'نماذج من فئة GPT',
        description: 'وصول مباشر إلى نماذج OpenAI.'
      },
      gemini: {
        short: 'نماذج Gemini',
        description: 'وصول مباشر إلى نماذج Google Gemini.'
      },
      xai: {
        short: 'نماذج Grok',
        description: 'وصول مباشر إلى نماذج xAI Grok.'
      },
      local: {
        short: 'مستضاف ذاتيا',
        description:
          'وجّه Hermes إلى نقطة نهاية محلية أو مستضافة ذاتيا متوافقة مع OpenAI (vLLM، llama.cpp، Ollama، إلخ).'
      }
    },
    backToSignIn: 'العودة إلى تسجيل الدخول',
    getKey: 'الحصول على مفتاح',
    replaceCurrent: 'استبدال القيمة الحالية',
    pasteApiKey: 'الصق مفتاح API',
    directApiAccess: provider => `وصول مباشر إلى ${provider} عبر واجهة API.`,
    localApiKeyPlaceholder: 'مفتاح API (اختياري — فقط إذا كانت نقطة النهاية تتطلبه)',
    localModelNamePlaceholder: 'اسم النموذج (مثلًا command-a-plus-05-2026)',
    couldNotSave: 'تعذر حفظ بيانات الاعتماد.',
    connecting: 'جار الاتصال',
    update: 'تحديث',
    flowSubtitles: {
      pkce: 'يفتح المتصفح لتسجيل الدخول ثم يتابع هنا',
      device_code: 'يفتح صفحة تحقق في المتصفح — يتصل Hermes تلقائياً',
      external: 'سجل الدخول مرة واحدة في الطرفية ثم عد إلى المحادثة'
    },
    startingSignIn: provider => `جار بدء تسجيل الدخول لـ ${provider}...`,
    verifyingCode: provider => `جار التحقق من الرمز عبر ${provider}...`,
    connectedProvider: provider => `تم ربط ${provider}`,
    connectedPicking: provider => `تم ربط ${provider}. جار اختيار نموذج افتراضي...`,
    signInFailed: 'فشل تسجيل الدخول. حاول مرة أخرى.',
    signInExpired:
      'انتهت مهلة صفحة تسجيل الدخول قبل أن تُنهي العملية. أعد المحاولة وأكمل خطوة المتصفح خلال بضع دقائق، أو استخدم مفتاح API بدلًا من ذلك.',
    pickDifferentProvider: 'اختيار مزوّد آخر',
    signInWith: provider => `تسجيل الدخول عبر ${provider}`,
    openedBrowser: provider => `فتحنا ${provider} في المتصفح.`,
    authorizeThere: 'صرّح لـ Hermes هناك.',
    copyAuthCode: 'انسخ رمز التفويض والصقه أدناه.',
    pasteAuthCode: 'الصق رمز التفويض',
    reopenAuthPage: 'إعادة فتح صفحة التفويض',
    waitingAuthorize: 'بانتظار التفويض...',
    externalPending: provider =>
      `يسجّل ${provider} الدخول عبر أداة سطر الأوامر الخاصة به. شغّل هذا الأمر في الطرفية، ثم عد واختر «سجلت الدخول»:`,
    signedIn: 'سجلت الدخول',
    deviceCodeOpened: provider => `فتحنا ${provider} في المتصفح. أدخل هذا الرمز هناك:`,
    reopenVerification: 'إعادة فتح صفحة التحقق',
    copy: 'نسخ',
    defaultModel: 'النموذج الافتراضي',
    freeTier: 'المستوى المجاني',
    pro: 'مدفوع',
    free: 'مجاني',
    price: (input, output) => `${input} إدخال / ${output} إخراج لكل مليون رمز`,
    change: 'تغيير',
    startChatting: 'ابدأ',
    docs: provider => `وثائق ${provider}`,
    signInDidNotFinish: provider =>
      `لم يكتمل تسجيل الدخول عبر ${provider}. تحقّق من اتصالك بالإنترنت وأعد المحاولة، أو اختر مزوّدًا آخر.`,
    tryAgain: 'إعادة المحاولة',
    useApiKeyInstead: 'استخدام مفتاح API',
    errorDetails: 'تفاصيل'
  },
  freeTier: {
    providerRowTitle: 'Nous · المستوى المجاني',
    providerRowPitch: 'سجّل الدخول بحساب Nous لفتح المزيد من النماذج والأدوات.',
    readyTitle: 'Hermes جاهز.',
    readyCaption: 'مجاني · يشمل الموصلات',
    begin: 'ابدأ',
    signInInstead: 'تسجيل الدخول بحساب Nous بدلًا من ذلك',
    otherProviders: 'مزوّدون آخرون',
    stripTitle: 'يتوفر الآن الاستدلال المجاني من Nous والموصلات.',
    stripBody: 'افتح منتقي النماذج لتجربتها، أو سجّل الدخول بحساب Nous.',
    openModelPicker: 'فتح منتقي النماذج',
    dismiss: 'إغلاق',
    providerName: 'Nous',
    statusLabel: model => `Nous · ${model}`,
    signIn: 'تسجيل الدخول',
    signInHeading: 'سجّل الدخول بحساب Nous لفتح المزيد من النماذج والأدوات.',
    settingUp: 'جارٍ إعداد الاستدلال المجاني…',
    finishInBrowser: 'أكمل في المتصفح',
    doNotShare: 'لا تشارك هذا الرمز.',
    openPageAgain: 'فتح الصفحة مجددًا',
    waiting: 'بانتظار تسجيل الدخول…',
    finishingHeading: 'جارٍ إكمال تسجيل الدخول…',
    finishingBody: 'تمت الموافقة في المتصفح. جارٍ جلب رموز الوصول الخاصة بحسابك.',
    signedInAsLabel: 'تم تسجيل الدخول باسم',
    signedIn: 'تم تسجيل الدخول.',
    completedBody: 'أصبح حسابك يشمل الاستدلال والأدوات.',
    reconnect: 'إعادة الاتصال',
    openConnectors: 'فتح الموصلات',
    defaultModel: 'النموذج الافتراضي',
    change: 'تغيير',
    done: 'تم',
    notNow: 'ليس الآن',
    tryAgain: 'إعادة المحاولة',
    didNotComplete: 'لم يكتمل تسجيل الدخول',
    timedOutHeading: 'انتهت صلاحية رابط تسجيل الدخول هذا',
    timedOutBody: 'ابدأ من جديد متى كنت مستعدًا. ما زلت تستخدم خدمة Nous المجانية.',
    errorBody: 'لم يكتمل تسجيل الدخول. أعد المحاولة متى كنت مستعدًا.',
    alreadySignedInHeading: 'تم تسجيل الدخول مسبقًا.',
    alreadySignedInBody: 'نسخة Hermes هذه مسجّلة الدخول بالفعل بحساب Nous.',
    offer: {
      heading: 'واصل مع Hermes',
      body: 'أنت تستخدم الحصة المجانية. إذا واصلت استخدام Hermes فستبدأ بمواجهة حدود الاستخدام. سجّل الدخول بحساب Nous مجاني للحصول على حصة أكبر.',
      signIn: 'تسجيل الدخول',
      notNow: 'ليس الآن'
    },
    busyHeading: 'أوشكنا على الانتهاء',
    busyBody: wait =>
      `تعذّر على Hermes إكمال تسجيل دخولك لأن خدمة Nous مشغولة. أعد المحاولة بعد ${wait}. ستبقى جلستك محفوظة في هذه الأثناء.`,
    unreachableBody:
      'تعذّر على Hermes الوصول إلى خدمة Nous لإكمال تسجيل دخولك. تحقّق من اتصالك بالإنترنت وأعد المحاولة. جلستك لا تزال محفوظة.',
    setupFailed: {
      gateClosed:
        'لا يمكن لهذا الإصدار من Hermes أن يبدأ دون حساب Nous. سجّل الدخول أو أنشئ حسابًا، فالأمر مجاني ولا يستغرق سوى دقيقة.',
      paused:
        'توقف استخدام Hermes دون تسجيل الدخول مؤقتاً. سيواصل Hermes التحقق. تسجيل الدخول مجاني ويتيح لك المتابعة فوراً.',
      rateLimited: wait =>
        `يبدأ كثيرون باستخدام Hermes الآن، لذا سيعيد المحاولة بعد ${wait}. تسجيل الدخول مجاني ويُغنيك عن الانتظار.`,
      unreachable:
        'تعذّر على Hermes الوصول إلى خدمة Nous. تحقّق من اتصالك بالإنترنت، ثم اضغط «إعادة المحاولة». أو اربط مزوّدًا آخر في الوقت الحالي.',
      serverError: 'واجهت خدمة Nous عطلًا مؤقتًا. اضغط «إعادة المحاولة» بعد قليل، أو اربط مزوّدًا آخر في الوقت الحالي.',
      powRequired: 'طلب خادم Nous إثبات عمل، لكن وكيلك لا يدعمه بعد. سجّل الدخول أو أنشئ حساب Nous مجانياً للمتابعة.',
      locked: 'لا يمكن لهذه الجلسة الاستمرار دون تسجيل الدخول. سجّل الدخول أو أنشئ حساب Nous مجانياً للمتابعة.',
      generic: 'تعذّر على Hermes إعداد الوصول المجاني دون تسجيل الدخول. تسجيل الدخول مجاني، أو اربط مزوّدًا آخر.',
      signInBelow: 'تسجيل الدخول مجاني. اختر Nous أدناه.',
      tryAgain: 'إعادة المحاولة',
      retrying: 'جارٍ إعادة المحاولة…'
    }
  }
} satisfies Pick<
  TranslationOverrides,
  | 'boot'
  | 'remoteDisplayBanner'
  | 'butterbar'
  | 'promptNotices'
  | 'keepAwakeOffer'
  | 'updates'
  | 'install'
  | 'onboarding'
  | 'freeTier'
>
