import type { TranslationOverrides } from './define-locale'

export const arDiagnostics = {
  notifications: {
    sharedProfileWarning:
      'تستخدم نسخة أخرى من Hermes هذا الملف الشخصي. تتشارك النسختان إعداداته وبياناته، لذا قد تتعارض التغييرات. يمكنك المتابعة أو إغلاق النسخة الأخرى قبل إجراء تغييرات.',
    region: 'الإشعارات',
    hide: 'إخفاء',
    show: 'إظهار',
    more: count => `${count} إشعار إضافي`,
    clearAll: 'مسح الكل',
    dismiss: 'إغلاق الإشعار',
    details: 'التفاصيل',
    copyDetail: 'نسخ التفاصيل',
    copyDetailFailed: 'تعذر نسخ تفاصيل الإشعار',
    backendOutOfDateTitle: 'الخلفية قديمة',
    backendOutOfDateMessage: 'خلفية Hermes أقدم من إصدار سطح المكتب الحالي وقد لا تعمل كما يجب. حدثهما ليتوافقا.',
    installMethodUnsupportedTitle: 'طريقة التثبيت غير مدعومة',
    updateHermes: 'تحديث Hermes',
    updateReadyTitle: 'التحديث جاهز',
    updateReadyMessage: count => `${count} تغيير جديد متاح.`,
    updateReadyMessageUnknown: 'يتوفر تحديث جديد.',
    seeWhatsNew: 'عرض الجديد',
    toast: {
      artifactPartialLoad: (failed, total) => `تخطى${failed}من${total}الجلسات الأخيرة أثناء فهرسة القطع الأثرية.`,
      artifactSafeLimitExceeded: count => `${count}تجاوز حد تحميل النص الآمن.`,
      artifactUnreadable: count => `${count}تعذر قراءته.`,
      attachmentLimitSaveFailed: 'لا يمكن أن ينقذ الحد الأقصى لحجم الملحق',
      localEndpointSaveFailed: 'لا يمكن إنقاذ نقطة النهاية المحلية',
      memoryConnectionStartFailed: 'فشل في بدء الاتصال',
      memoryFieldSaveFailed: label => `فشل الحفظ${label}`,
      memoryProviderSavedMessage: 'تحديث تشكيلة مقدِّم الذاكرة.',
      memoryProviderSavedTitle: label => `${label}تم الحفظ`,
      memoryProviderSettingsSaveFailed: label => `فشل الحفظ${label}الإعدادات`,
      modelChangeFailed: 'لا يمكن تغيير النموذج',
      onboardingReadyTitle: 'Hermes جاهزة',
      openBrowserWindowFailed: 'تعذّر فتح المتصفح في نافذة منفصلة',
      openNewWindowFailed: 'لا يمكن فتح نافذة جديدة',
      openSessionTerminalFailed: 'لا يمكن فتح دردشة في محطة',
      openSessionWindowFailed: 'لا يمكن فتح الدردشة في نافذة جديدة',
      petDraftsReadyMessage: 'الحيوانات الأليفة الخاصة بك تبدو منتهية - اختيار واحد لجلب.',
      petDraftsReadyTitle: 'مشاريع بيت جاهزة',
      petGenerationFailedTitle: 'فشل جيل الفستق',
      petHatchedMessage: 'ابدأي بالاسم وتبنيه.',
      petHatchedTitle: 'حيوانك الأليف',
      petHatchingFailedTitle: 'فشل القفز',
      petReopenTryAgain: 'أعيدي المحاولة مرة أخرى.',
      pluginLoadFailed: origin => `Plugin "${origin}فشل في تحميل`,
      pluginRegisterFailed: name => `تعذّر تسجيل المكوّن الإضافي «${name}»`,
      pluginsFolderOpenFailed: 'لا يمكن فتح ملف البلوغين',
      pluginsFolderResolveFailed: 'لا يمكن حل ملف البلوغين',
      pluginsFolderUnavailable: 'المزلاجات غير متاحة',
      pluginsHomeUnavailable: 'لم تبلغ الخلفية عن دليلها المنزلي',
      gatewayConnectFailed: 'تعذر الاتصال بالبوابة Hermes',
      processStopFailed: 'لم أستطع إيقاف العملية',
      providerConnected: provider => `${provider}متصل.`,
      providerSaveFailed: label => `تعذر الحفظ${label}`,
      reactionFailed: 'لا يمكن رد فعل',
      runtimeNotReadyMessage:
        'Hermes Desktop لا يمكن التحقق من التراجع المستمر في البداية. وقد تكون بعض الملامح غير متاحة حتى يمكن الوصول إلى البوابة.',
      runtimeNotReadyTitle: 'جاهز',
      toolGatewayEnabledMessage: labels => {
        const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`

        return `${list} now run through your Nous subscription — no separate API keys needed.`
      },
      toolGatewayEnabledTitle: 'المدخل المتحرك',
      toolGatewayTools: {
        browser: 'التشغيل الآلي للمصفوفين',
        image_gen: 'إنتاج الصور',
        tts: 'النص إلى الكلام',
        video_gen: 'إنتاج الفيديو',
        web: 'البحث على شبكة الإنترنت'
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
      disabledMessage: name => `تم تعطيل ${name} MCP. يمكنك إعادة تفعيله في أي وقت من الإمكانات → MCP.`,
      disableFailed: name => `تعذّر تعطيل ${name} MCP.`
    },
    errors: {
      agentInitUnknownProvider: provider =>
        `فشلت تهيئة الوكيل: المزوّد '${provider}' غير معروف. شغّل 'hermes model' لعرض المزوّدين المتاحين، أو شغّل 'hermes doctor' لتشخيص مشكلات الإعداد.`,
      unknownProvider: provider =>
        `المزوّد '${provider}' غير معروف. شغّل 'hermes model' لعرض المزوّدين المتاحين، أو شغّل 'hermes doctor' لتشخيص مشكلات الإعداد.`,
      fastModeUnavailable: 'الوضع السريع غير متاح لهذا النموذج.',
      apiRetriesExhausted: retries => `فشل استدعاء API بعد ${retries} محاولات إعادة`,
      invalidApiResponseAfterRetries: (retries, detail) =>
        `استجابة API غير صالحة بعد ${retries} محاولات إعادة: ${detail}`,
      resetsIn: remaining => `الوقت المتبقي لإعادة التعيين: ${remaining}`,
      providerRetriesExhausted: (reason, label, attempts, resetWindow) => {
        const lead = {
          rate_limit: `قيّد ${label} معدل الطلبات في كل المحاولات الـ ${attempts}`,
          overloaded: `أبلغ ${label} عن تحميل زائد في كل المحاولات الـ ${attempts}`,
          server_error: `أعاد ${label} خطأ خادم في كل المحاولات الـ ${attempts}`,
          timeout: `لم يستجب ${label} في الوقت المناسب في أي من المحاولات الـ ${attempts}`,
          unknown: `لم يجب ${label} بعد ${attempts} محاولات`
        }[reason]

        const situation = resetWindow
          ? `يُعاد ضبط حد الاستخدام الخاص به خلال ${resetWindow}. أرسل /retry بعد ذلك، أو بدّل النموذج عبر /model.`
          : 'يبدو أنه غير متاح مؤقتًا. انتظر دقيقة ثم أرسل /retry، أو بدّل النموذج عبر /model.'

        return `${lead} — ${situation} لتجنب ذلك مستقبلًا، أضف موفّرًا احتياطيًا عبر \`hermes fallback add\`.`
      },
      providerSaid: summary => `قال الموفّر: ${summary}`,
      providerInvalidResponse: (label, attempts) =>
        `أعاد ${label} ردًا فارغًا أو معطوبًا ${attempts} مرات — على الأرجح أنه محمّل فوق طاقته أو يقيّد معدل طلباتك. انتظر دقيقة ثم أرسل /retry، أو بدّل النموذج عبر /model.`,
      errorDetailsLine: detail => `التفاصيل: ${detail}`,
      elevenLabsNeedsKey: 'يتطلب ElevenLabs STT المفتاح ELEVENLABS_API_KEY.',
      elevenLabsRejectedKey: 'رفض ElevenLabs مفتاح API (401).',
      diskFull: 'القرص ممتلئ — حرّر مساحة ثم أعد المحاولة.',
      fileNotFound: target => (target ? `لم يتم العثور على الملف: ${target}` : 'لم يتم العثور على الملف.'),
      gatewayAuthFailed:
        'لم يعد Hermes يقبل تسجيل الدخول المحفوظ الخاص بك. افتح البوابات وقم بتسجيل الدخول مرة أخرى (أو الصق رمز وصول جديد)، ثم أعد المحاولة.',
      invalidExternalUrl: 'عنوان URL الخارجي غير صالح.',
      invalidPreviewUrl: 'عنوان URL للمعاينة غير صالح.',
      methodNotAllowed: 'رفضت خلفية سطح المكتب هذا الطلب (405 Method Not Allowed). جرب إعادة تشغيل Hermes Desktop.',
      microphonePermission: 'تم رفض إذن الميكروفون.',
      openaiRejectedApiKey: 'رفض OpenAI مفتاح API.',
      openaiRejectedApiKeyWithStatus: status => `رفض OpenAI مفتاح API (${status} invalid_api_key).`,
      openaiTtsNeedsKey: 'يتطلب OpenAI TTS المفتاح VOICE_TOOLS_OPENAI_KEY أو OPENAI_API_KEY.',
      restoreTargetMissing: 'لم تعد الرسالة المستهدفة في تاريخ هذه الدورة. كرر الجلسة وحاول مرة أخرى.',
      restoreTargetUnsafe: 'ولا يمكن إعادة نقطة التفتيش هذه بأمان. كرر الجلسة وحاول مرة أخرى.',
      sessionStoppedBeforeAgentReady: 'توقفت الجلسة قبل أن يصبح الوكيل جاهزًا.',
      turnCancelledBeforeAgentReady: 'أُلغيت الجولة قبل أن يصبح الوكيل جاهزًا.',
      codeSkewRestartRequired: 'بعد التحديث ما زال هذا الخلفية يشغّل كودا قديما. أعد تشغيله لتحميل الكود الجديد.',
      storageFailure: 'تعذر حفظ Hermes في مجلد البيانات الخاص به. افتح الصيانة لفحصها وإصلاحها.',
      rpcOutOfSync: 'التطبيق والواجهة الخلفية موجودان في إصدارات مختلفة. قم بتحديث كليهما.',
      restartHermesFailed: 'تعذر إعادة تشغيل Hermes'
    },
    voice: {
      configureSpeechToText: 'اضبط تحويل الكلام إلى نص لاستخدام وضع الصوت.',
      couldNotStartSession: 'تعذر بدء جلسة الصوت',
      microphoneAccessDenied: 'تم رفض الوصول إلى الميكروفون.',
      microphoneConstraintsUnsupported: 'قيود الميكروفون غير مدعومة على هذا الجهاز.',
      microphoneFailed: 'فشل الميكروفون',
      microphoneInUse: 'الميكروفون مستخدم من تطبيق آخر.',
      microphonePermissionDenied: 'تم رفض إذن الميكروفون.',
      microphoneStartFailed: 'تعذر بدء تسجيل الميكروفون.',
      microphoneUnsupported: 'هذا المتصفح لا يدعم تسجيل الميكروفون.',
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
      liveError: 'صوت حي',
      liveDelegationFailed: 'تعذر تسليم الطلب إلى Hermes',
      liveUnavailable: reason =>
        `GPT-Live voice chat is not available: ${reason}. استخدام تحويل الكلام إلى نص بدلا من ذلك.`,
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
      turnErrorTitle: 'فشلت الجولة',
      backgroundDoneTitle: 'انتهت المهمة في الخلفية',
      backgroundFailedTitle: 'فشلت المهمة في الخلفية',
      creditsTitle: 'الاعتمادات',
      approvalTitleNamed: session => `مطلوب موافقة — ${session}`,
      inputTitleNamed: session => `مطلوب إدخال — ${session}`
    },
    gatewayErrorTitle: 'خطأ Hermes',
    gatewayErrorFallback: 'Hermes أبلغ عن خطأ',
    actions: {
      restartHermes: 'أعد تشغيل Hermes',
      openKeys: 'فتح المفاتيح',
      openGateways: 'فتح البوابات',
      openMaintenance: 'الصيانة المفتوحة'
    },
    desktopOutOfDateMessage: 'تطبيق Hermes أقدم من الخلفية المتصل بها وقد لا يعمل كما يجب. حدّث التطبيق ليتوافقا.',
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
