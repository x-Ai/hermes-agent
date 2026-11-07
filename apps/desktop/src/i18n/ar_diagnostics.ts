import { AR_PLURAL } from './ar_plural'
import type { TranslationOverrides } from './define-locale'

export const arDiagnostics = {
  notifications: {
    sharedProfileWarning:
      'تستخدم نسخة أخرى من Hermes هذا الملف الشخصي. تتشارك النسختان إعداداته وبياناته، لذا قد تتعارض التغييرات. يمكنك المتابعة أو إغلاق النسخة الأخرى قبل إجراء تغييرات.',
    region: 'الإشعارات',
    hide: 'إخفاء',
    show: 'إظهار',
    more: count =>
      AR_PLURAL(count, {
        one: 'إشعار إضافي واحد',
        two: 'إشعاران إضافيان',
        few: `${count} إشعارات إضافية`,
        many: `${count} إشعارًا إضافيًا`
      }),
    clearAll: 'مسح الكل',
    dismiss: 'إغلاق الإشعار',
    details: 'التفاصيل',
    copyDetail: 'نسخ التفاصيل',
    copyDetailFailed: 'تعذر نسخ تفاصيل الإشعار',
    compressDeferredDone: 'اكتمل ضغط السياق',
    backendOutOfDateTitle: 'الواجهة الخلفية قديمة',
    backendOutOfDateMessage:
      'الواجهة الخلفية لـ Hermes أقدم من إصدار هذا التطبيق وقد لا تعمل كما يجب. حدّثهما ليتوافقا.',
    installMethodUnsupportedTitle: 'طريقة التثبيت غير مدعومة',
    updateHermes: 'تحديث Hermes',
    updateReadyTitle: 'التحديث جاهز',
    updateReadyMessage: count =>
      AR_PLURAL(count, {
        one: 'يتوفر تغيير جديد واحد.',
        two: 'يتوفر تغييران جديدان.',
        few: `تتوفر ${count} تغييرات جديدة.`,
        many: `يتوفر ${count} تغييرًا جديدًا.`
      }),
    updateReadyMessageUnknown: 'يتوفر تحديث جديد.',
    updateReadyMessageAppInstaller: 'إصدار جديد من Hermes جاهز. حدّث الآن وسيُكمل Windows التثبيت نيابةً عنك.',
    seeWhatsNew: 'عرض الجديد',
    toast: {
      artifactPartialLoad: (failed, total) =>
        `تم تخطي ${failed} من أصل ${total} من الجلسات الحديثة أثناء فهرسة العناصر.`,
      artifactSafeLimitExceeded: count => `تجاوز ${count} منها الحد الآمن لتحميل سجل المحادثة.`,
      artifactUnreadable: count => `تعذّرت قراءة ${count} منها.`,
      attachmentLimitSaveFailed: 'تعذّر حفظ الحد الأقصى لحجم المرفقات',
      localEndpointSaveFailed: 'تعذّر حفظ نقطة النهاية المحلية',
      memoryConnectionStartFailed: 'تعذّر بدء الاتصال',
      memoryFieldSaveFailed: label => `تعذّر حفظ ${label}`,
      memoryProviderSavedMessage: 'تم تحديث إعدادات مزوّد الذاكرة.',
      memoryProviderSavedTitle: label => `تم حفظ ${label}`,
      memoryProviderSettingsSaveFailed: label => `تعذّر حفظ إعدادات ${label}`,
      modelChangeFailed: 'تعذّر تغيير النموذج',
      onboardingReadyTitle: 'Hermes جاهز',
      openBrowserWindowFailed: 'تعذّر فتح المتصفح في نافذة منفصلة',
      openNewWindowFailed: 'تعذّر فتح نافذة جديدة',
      openSessionTerminalFailed: 'تعذّر فتح المحادثة في الطرفية',
      openSessionWindowFailed: 'تعذّر فتح المحادثة في نافذة جديدة',
      petDraftsReadyMessage: 'يبدو حيوانك الأليف جاهزًا — اختر واحدًا لتفقيسه.',
      petDraftsReadyTitle: 'مسوّدات الحيوان الأليف جاهزة',
      petGenerationFailedTitle: 'فشل توليد الحيوان الأليف',
      petHatchedMessage: 'أعد الفتح لتسميته وتبنّيه.',
      petHatchedTitle: 'فقس حيوانك الأليف',
      petHatchingFailedTitle: 'فشل التفقيس',
      petReopenTryAgain: 'أعد الفتح لتحاول مجددًا.',
      pluginLoadFailed: origin => `تعذّر تحميل الإضافة «${origin}»`,
      pluginRegisterFailed: name => `تعذّر تسجيل الإضافة «${name}»`,
      pluginsFolderOpenFailed: 'تعذّر فتح مجلد الإضافات',
      pluginsFolderResolveFailed: 'تعذّر تحديد مجلد الإضافات',
      pluginsFolderUnavailable: 'إضافات سطح المكتب غير متاحة',
      pluginsHomeUnavailable: 'لم تُبلغ الواجهة الخلفية عن مجلدها الرئيسي',
      gatewayConnectFailed: 'تعذّر الاتصال ببوابة Hermes',
      processStopFailed: 'تعذّر إيقاف العملية',
      providerConnected: provider => `تم الاتصال بـ ${provider}.`,
      providerSaveFailed: label => `تعذّر حفظ ${label}`,
      reactionFailed: 'تعذّرت إضافة التفاعل',
      runtimeNotReadyMessage:
        'تعذّر على Hermes Desktop التحقق من الواجهة الخلفية العاملة عند بدء التشغيل. قد تكون بعض الميزات غير متاحة حتى يمكن الوصول إلى البوابة.',
      runtimeNotReadyTitle: 'بيئة التشغيل غير جاهزة',
      toolGatewayEnabledMessage: labels => {
        const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join('، ')} و${labels.at(-1)}`

        return `${list}: تعمل الآن عبر اشتراكك في Nous — لا حاجة إلى مفاتيح API منفصلة.`
      },
      toolGatewayEnabledTitle: 'تم تفعيل Tool Gateway',
      toolGatewayTools: {
        browser: 'أتمتة المتصفح',
        image_gen: 'توليد الصور',
        tts: 'تحويل النص إلى كلام',
        video_gen: 'توليد الفيديو',
        web: 'البحث في الويب واستخراج المحتوى'
      },
      unknownError: 'خطأ غير معروف',
      view: 'عرض'
    },
    mcp: {
      needsAuthTitle: 'خادم MCP يحتاج إلى إعادة المصادقة',
      needsAuthMessage: name => `يحتاج ${name} MCP إلى إعادة المصادقة.`,
      errorTitle: 'تعذر الوصول إلى خادم MCP',
      errorMessage: name => `فشل فحص سلامة ${name} MCP.`,
      signIn: 'تسجيل الدخول',
      view: 'عرض',
      disable: 'تعطيل',
      disabledMessage: name => `تم تعطيل ${name} MCP. يمكنك إعادة تفعيله في أي وقت من المهارات ← MCP.`,
      disableFailed: name => `تعذّر تعطيل ${name} MCP.`
    },
    errors: {
      agentInitUnknownProvider: provider =>
        `فشلت تهيئة الوكيل: المزوّد '${provider}' غير معروف. شغّل 'hermes model' لعرض المزوّدين المتاحين، أو شغّل 'hermes doctor' لتشخيص مشكلات الإعداد.`,
      unknownProvider: provider =>
        `المزوّد '${provider}' غير معروف. شغّل 'hermes model' لعرض المزوّدين المتاحين، أو شغّل 'hermes doctor' لتشخيص مشكلات الإعداد.`,
      fastModeUnavailable: 'الوضع السريع غير متاح لهذا النموذج.',
      apiRetriesExhausted: retries =>
        `فشل استدعاء API بعد ${AR_PLURAL(retries, { one: 'محاولة إعادة واحدة', two: 'محاولتي إعادة', few: `${retries} محاولات إعادة`, many: `${retries} محاولة إعادة` })}`,
      invalidApiResponseAfterRetries: (retries, detail) =>
        `استجابة API غير صالحة بعد ${AR_PLURAL(retries, { one: 'محاولة إعادة واحدة', two: 'محاولتي إعادة', few: `${retries} محاولات إعادة`, many: `${retries} محاولة إعادة` })}: ${detail}`,
      resetsIn: remaining => `الوقت المتبقي لإعادة التعيين: ${remaining}`,
      providerRetriesExhausted: (reason, label, attempts, resetWindow) => {
        const lead = {
          rate_limit: `قيّد ${label} معدل الطلبات في كل المحاولات الـ ${attempts}`,
          overloaded: `أبلغ ${label} عن تحميل زائد في كل المحاولات الـ ${attempts}`,
          server_error: `أعاد ${label} خطأ خادم في كل المحاولات الـ ${attempts}`,
          timeout: `لم يستجب ${label} في الوقت المناسب في أي من المحاولات الـ ${attempts}`,
          unknown: `لم يجب ${label} بعد ${AR_PLURAL(attempts, { one: 'محاولة واحدة', two: 'محاولتين', few: `${attempts} محاولات`, many: `${attempts} محاولة` })}`
        }[reason]

        const situation = resetWindow
          ? `يُعاد ضبط حد الاستخدام الخاص به خلال ${resetWindow}. أرسل /retry بعد ذلك، أو بدّل النموذج عبر /model.`
          : 'يبدو أنه غير متاح مؤقتًا. انتظر دقيقة ثم أرسل /retry، أو بدّل النموذج عبر /model.'

        return `${lead} — ${situation} لتجنب ذلك مستقبلًا، أضف مزوّدًا احتياطيًا عبر \`hermes fallback add\`.`
      },
      providerSaid: summary => `ردّ المزوّد: ${summary}`,
      providerInvalidResponse: (label, attempts) =>
        `أعاد ${label} ردًا فارغًا أو معطوبًا ${AR_PLURAL(attempts, { one: 'مرة واحدة', two: 'مرتين', few: `${attempts} مرات`, many: `${attempts} مرة` })} — على الأرجح أنه محمّل فوق طاقته أو يقيّد معدل طلباتك. انتظر دقيقة ثم أرسل /retry، أو بدّل النموذج عبر /model.`,
      errorDetailsLine: detail => `التفاصيل: ${detail}`,
      elevenLabsNeedsKey: 'يتطلب الإدخال الصوتي مفتاح ElevenLabs. أضفه من الإعدادات ← المفاتيح.',
      elevenLabsRejectedKey: 'لم يقبل ElevenLabs مفتاح API الخاص بك. حدّثه من الإعدادات ← المفاتيح ثم حاول مرة أخرى.',
      diskFull: 'القرص ممتلئ — حرّر مساحة ثم أعد المحاولة.',
      fileNotFound: target => (target ? `لم يتم العثور على الملف: ${target}` : 'لم يتم العثور على الملف.'),
      gatewayAuthFailed:
        'لم يعد Hermes يقبل تسجيل الدخول المحفوظ الخاص بك. افتح البوابات وقم بتسجيل الدخول مرة أخرى (أو الصق رمز وصول جديد)، ثم أعد المحاولة.',
      invalidExternalUrl: 'عنوان URL الخارجي غير صالح.',
      invalidPreviewUrl: 'عنوان URL للمعاينة غير صالح.',
      methodNotAllowed:
        'الخدمة الخلفية لـ Hermes غير متوافقة مع التطبيق، على الأرجح بعد تحديث. أعد تشغيلها لإصلاح ذلك.',
      microphonePermission: 'تم رفض إذن الميكروفون.',
      openaiRejectedApiKey: 'لم يقبل OpenAI مفتاح API الخاص بك. حدّثه من الإعدادات ← المفاتيح ثم حاول مرة أخرى.',
      openaiRejectedApiKeyWithStatus: status => `رفض OpenAI مفتاح API (${status} invalid_api_key).`,
      openaiTtsNeedsKey: 'يتطلب الصوت مفتاح OpenAI. أضفه من الإعدادات ← المفاتيح.',
      restoreTargetMissing: 'لم تعد الرسالة المستهدفة في سجل هذه الجلسة. حدّث الجلسة وحاول مرة أخرى.',
      restoreTargetUnsafe: 'لا يمكن استعادة نقطة الحفظ هذه بأمان. حدّث الجلسة وحاول مرة أخرى.',
      sessionStoppedBeforeAgentReady: 'توقفت الجلسة قبل أن يصبح الوكيل جاهزًا.',
      turnCancelledBeforeAgentReady: 'أُلغي الدور قبل أن يصبح الوكيل جاهزًا.',
      codeSkewRestartRequired: 'حُدّث Hermes لكنه لا يزال يشغّل الإصدار القديم. أعد تشغيله لإكمال التحديث.',
      storageFailure: 'تعذّر على Hermes الحفظ في مجلد بياناته. افتح الصيانة لفحصه وإصلاحه.',
      rpcOutOfSync: 'إصدارا التطبيق والواجهة الخلفية مختلفان. حدّث كليهما.',
      restartHermesFailed: 'تعذر إعادة تشغيل Hermes'
    },
    voice: {
      configureSpeechToText: 'اضبط تحويل الكلام إلى نص لاستخدام وضع الصوت.',
      couldNotStartSession: 'تعذر بدء جلسة الصوت',
      microphoneAccessDenied: 'تم رفض الوصول إلى الميكروفون.',
      microphoneConstraintsUnsupported: 'قيود الميكروفون غير مدعومة على هذا الجهاز.',
      microphoneFailed: 'فشل الميكروفون',
      microphoneInUse: 'الميكروفون مستخدم من تطبيق آخر.',
      microphoneNeedsHttps:
        'يحتاج الميكروفون إلى اتصال آمن. افتح تطبيق الويب عبر HTTPS، أو عبر نفق SSH إلى 127.0.0.1، لاستخدامه.',
      microphonePermissionDenied: 'تم رفض إذن الميكروفون.',
      microphoneStartFailed: 'تعذر بدء تسجيل الميكروفون.',
      microphoneUnsupported: 'بيئة التشغيل هذه لا تدعم تسجيل الميكروفون.',
      noMicrophone: 'لم يتم العثور على ميكروفون.',
      noSpeechDetected: 'لم يتم اكتشاف كلام',
      playbackFailed: 'فشل تشغيل الصوت',
      recordingFailed: 'فشل التسجيل',
      sayStopToEnd: phrase => `قل "${phrase}" لإنهاء المحادثة الصوتية.`,
      transcriptionFailed: 'فشل التفريغ النصي',
      transcriptionUnavailable: 'التفريغ النصي غير متاح.',
      tryRecordingAgain: 'حاول التسجيل مرة أخرى.',
      unavailable: 'الصوت غير متاح',
      liveEnded: 'انتهت الجلسة الصوتية المباشرة',
      liveError: 'المحادثة الصوتية المباشرة',
      liveDelegationFailed: 'تعذر تسليم الطلب إلى Hermes',
      liveUnavailable: reason =>
        `المحادثة الصوتية GPT-Live غير متاحة: ${reason}. يُستخدم تحويل الكلام إلى نص بدلًا منها.`,
      liveEndedConnectionLost: 'فقدت جلسة الصوت المباشر اتصالها.',
      liveEndedClosed: 'تم إغلاق الجلسة الصوتية المباشرة بواسطة الخدمة.'
    },
    native: {
      approvalTitle: 'مطلوب موافقة',
      approveAction: 'موافقة',
      rejectAction: 'رفض',
      inputTitle: 'مطلوب إدخال',
      inputBody: 'ينتظر Hermes ردّك.',
      turnDoneTitle: 'أنهى Hermes',
      turnDoneBody: 'اكتملت الرسالة.',
      turnErrorTitle: 'فشل الدور',
      backgroundDoneTitle: 'انتهت المهمة في الخلفية',
      backgroundFailedTitle: 'فشلت المهمة في الخلفية',
      creditsTitle: 'الرصيد',
      approvalTitleNamed: session => `مطلوب موافقة — ${session}`,
      inputTitleNamed: session => `مطلوب إدخال — ${session}`
    },
    gatewayErrorTitle: 'خطأ Hermes',
    gatewayErrorFallback: 'أبلغ Hermes عن خطأ',
    actions: {
      restartHermes: 'إعادة تشغيل Hermes',
      openKeys: 'فتح المفاتيح',
      openGateways: 'فتح البوابات',
      openMaintenance: 'فتح الصيانة'
    },
    desktopOutOfDateMessage:
      'تطبيق Hermes هذا أقدم من الواجهة الخلفية المتصل بها وقد لا يعمل كما يجب. حدّث التطبيق ليتوافقا.',
    desktopOutOfDateTitle: 'التطبيق قديم',
    updateDesktopApp: 'تحديث التطبيق'
  },
  sendDiagnostics: {
    title: 'إرسال التشخيصات إلى Nous',
    privacyNotice:
      'سيؤدي هذا إلى رفع حزمة تصحيح إلى التخزين الداخلي لدى Nous (ليست لصيقة عامة). تتضمن معلومات النظام (نظام التشغيل، الإصدارات، المزوّد، وأنواع مفاتيح API المُهيأة — وليس المفاتيح نفسها أبداً) والسجلات الكاملة للوكيل والبوابة وسطح المكتب (حتى 512 كيلوبايت لكل منها، ومن المرجح أن تحتوي على محتوى المحادثات ومخرجات الأدوات ومسارات الملفات). تُحجب الأسرار قبل الرفع. لا يمكن الاطلاع عليها إلا لموظفي Nous ومشرفي Discord المعتمدين، وتُحذف تلقائياً بعد 14 يوماً.',
    upload: 'رفع',
    uploading: 'جارٍ الرفع…',
    cancel: 'إلغاء',
    close: 'إغلاق',
    copyLink: 'نسخ الرابط',
    uploadIdFallback: id => `لم يتم إرجاع رابط عرض — اذكر معرّف الرفع ${id} للدعم`,
    doneTitle: 'تم إرسال التشخيصات',
    doneDescription: 'تم رفع الحزمة بشكل خاص. شارك الرابط أدناه في محادثة الدعم لكي يتمكن الفريق من رؤية سجلاتك.',
    failedTitle: 'فشل الرفع',
    failedHint:
      'يمكنك أيضاً تشغيل `hermes debug share --nous` من الطرفية، أو `hermes debug share --local` لعرض التقرير دون رفعه.',
    handoffLead: 'تابع النقاش في:',
    links: {
      github: 'GitHub Issues',
      portal: 'دعم بوابة Nous',
      discord: 'Discord'
    }
  },
  errors: {
    genericFailure: 'حدث خطأ',
    boundaryTitle: 'تعطل جزء من الواجهة',
    boundaryDesc: 'يمكنك إعادة تحميل النافذة أو فتح السجلات لمعرفة التفاصيل.',
    reloadWindow: 'إعادة تحميل النافذة',
    openLogs: 'فتح السجلات',
    boundaryDetails: 'تفاصيل',
    sendDiagnostics: 'إرسال التشخيصات'
  }
} satisfies Pick<TranslationOverrides, 'notifications' | 'sendDiagnostics' | 'errors'>
