import type { TranslationOverrides } from './define-locale'

export const arAssistant = {
  assistant: {
    media: {
      gatewayFetchFailed: name => `تعذر جلب ${name} من البوابة (مفقود أو غير قابل للقراءة أو كبير جداً).`,
      openMediaFile: kind => `فتح ملف ${kind === 'audio' ? 'الصوت' : 'الفيديو'}`,
      openNamed: name => `فتح ${name}`,
      loadingNamed: name => `جارٍ تحميل ${name}…`,
      couldNotLoad: name => `تعذر تحميل ${name}.`,
      openImage: 'فتح الصورة',
      imageFallbackName: 'صورة'
    },
    embeds: {
      load: label => `تحميل ${label}`,
      alwaysAllow: label => `السماح دائماً لـ ${label}`,
      holdToZoom: 'اضغط مطولاً على Ctrl/⌘ للتكبير',
      failedToLoad: label => `تعذر تحميل تضمين ${label}`,
      openDiagram: 'فتح المخطط',
      embedTitle: label => `تضمين ${label}`
    },
    thread: {
      loadingSession: 'جار تحميل الجلسة...',
      openSessionFailed: 'تعذر فتح هذه الجلسة',
      showEarlier: 'عرض الرسائل الأقدم',
      loadingResponse: 'جار تحميل الرد...',
      steered: 'تم التوجيه',
      asyncDelegationFailure: detail => `(فشل: ${detail})`,
      asyncDelegationPartialOutput: 'الناتج الجزئي:',
      messagingAgent: name => `جار مراسلة ${name}…`,
      messagedAgent: name => `تمت مراسلة ${name}`,
      messageFrom: name => `رسالة من ${name}`,
      showMessage: 'عرض الرسالة',
      repliedTo: name => `تم الرد على ${name}`,
      showReply: 'عرض الرد',
      processOutput: 'المخرجات',
      emojiSearch: 'بحث…',
      emojiLoading: 'جار تحميل الرموز التعبيرية…',
      emojiEmpty: 'لم يتم العثور على رموز تعبيرية.',
      moreEmoji: 'المزيد من الرموز التعبيرية',
      removeReaction: emoji => `إزالة تفاعل ${emoji}`,
      reactedByHermes: 'تفاعل Hermes',
      conversationTimeline: 'الخط الزمني للمحادثة',
      reviewSummary: {
        label: 'مراجعة التحسين الذاتي',
        memoryUpdated: 'تم تحديث الذاكرة',
        memoryCreated: 'تم إنشاء إدخال ذاكرة',
        userProfileUpdated: 'تم تحديث ملف المستخدم',
        skillCreated: 'تم إنشاء المهارة',
        skillNamedCreated: (name, detail) => `تم إنشاء المهارة «${name}»${detail ? `: ${detail}` : ''}`,
        skillNamedPatched: (name, detail) => `تم إصلاح المهارة «${name}»${detail ? `: ${detail}` : ''}`,
        skillNamedRewritten: (name, detail) => `تمت إعادة كتابة المهارة «${name}»${detail ? `: ${detail}` : ''}`,
        memoryLabel: 'الذاكرة',
        userProfileLabel: 'ملف المستخدم'
      },
      operationInterrupted: 'تمت مقاطعة العملية.',
      operationInterruptedDuringRetry: (reason, attempt, maxAttempts) =>
        `تمت مقاطعة العملية أثناء إعادة المحاولة (${reason}، المحاولة ${attempt}/${maxAttempts}).`,
      operationInterruptedHandlingApiError: (errorType, detail) =>
        `تمت مقاطعة العملية أثناء معالجة خطأ API (${errorType}: ${detail}).`,
      operationInterruptedRetryingApiCall: (retry, maxRetries) =>
        `تمت مقاطعة العملية أثناء إعادة محاولة استدعاء API بعد خطأ (المحاولة ${retry}/${maxRetries}).`,
      operationInterruptedRetryingEmptyResponse: (retry, maxRetries) =>
        `تمت مقاطعة العملية أثناء إعادة محاولة استجابة فارغة من النموذج (المحاولة ${retry}/${maxRetries}).`,
      operationInterruptedRetryReasons: {
        fastResponseLikelyRateLimited: durationSeconds =>
          `استجابة سريعة (${durationSeconds} ث) — يُرجح وجود تقييد للمعدل`,
        rateLimited: 'تقييد المعدل من موفر المنبع (429)',
        responseTime: durationSeconds => `زمن الاستجابة ${durationSeconds} ث`,
        slowResponseLikelyUpstreamTimeout: durationSeconds =>
          `استجابة بطيئة (${durationSeconds} ث) — يُرجح انتهاء مهلة المنبع`,
        upstreamError: (code, durationSeconds) => `خطأ في المنبع (الرمز ${code}، ${durationSeconds} ث)`,
        upstreamGatewayTimedOut: durationSeconds => `انتهت مهلة بوابة المنبع (504، ${durationSeconds} ث)`,
        upstreamProviderOverloaded: code => `موفر المنبع محمّل فوق طاقته (${code})`,
        upstreamProviderTimedOut: durationSeconds => `انتهت مهلة موفر المنبع (Cloudflare 524، ${durationSeconds} ث)`,
        upstreamServerError: (code, durationSeconds) => `خطأ في خادم المنبع (${code}، ${durationSeconds} ث)`
      },
      operationInterruptedWaitingForModel: elapsedSeconds =>
        `تمت مقاطعة العملية: في انتظار استجابة النموذج (انقضت ${elapsedSeconds} ث).`,
      modelContinuing: (attempt, maxAttempts) =>
        `أعاد النموذج تفكيرًا دون إجابة نهائية — جار طلب المتابعة (${attempt}/${maxAttempts})`,
      providerReconnecting: (elapsedSeconds, kind) =>
        `لم يرسل الموفّر ${kind === 'output' ? 'مخرجات' : 'استجابة'} منذ ${elapsedSeconds} ث — جار إعادة الاتصال…`,
      providerRetrying: (retrySeconds, attempt, maxAttempts) =>
        `في انتظار الموفّر — إعادة المحاولة بعد ${retrySeconds} ث (المحاولة ${attempt}/${maxAttempts})`,
      providerWaitPhases: {
        first_event: seconds => `${seconds} ث في انتظار أول حدث من الموفّر`,
        reconnect: seconds => `${seconds} ث في انتظار أول حدث من الموفّر بعد إعادة الاتصال`,
        pre_progress: seconds => `بث الموفّر مفتوح؛ ${seconds} ث دون تقدم فعلي من النموذج`,
        post_event: seconds => `بث الموفّر نشط؛ ${seconds} ث دون أحداث بث`,
        first_chunk: seconds => `${seconds} ث في انتظار أول جزء من البث`,
        post_chunk: seconds => `البث مفتوح؛ ${seconds} ث دون مخرجات بث`
      },
      providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
        `${stillWaiting ? 'ما زلنا في انتظار' : 'في انتظار'} ${model} — ${phaseText}${
          watchdog ? ` (إعادة اتصال تلقائية: مراقب ${watchdog.label} خلال ${watchdog.seconds} ث)` : ''
        }`,
      providerRetryReasons: {
        rate_limited: 'تم تقييد المعدل',
        overloaded: 'الموفّر محمّل فوق طاقته',
        free_model_busy: 'النموذج المجاني مشغول'
      },
      providerRetryingAfter: (reason, resetWindow, retrySeconds, attempt, maxAttempts) =>
        `${reason} — ${resetWindow ? `يُعاد الضبط خلال ${resetWindow}، ` : ''}إعادة المحاولة بعد ${retrySeconds} ث (المحاولة ${attempt}/${maxAttempts})`,
      providerAutoRecovering: (retrySeconds, cycle, total, stopHint) =>
        `الموفّر غير متاح مؤقتًا — إعادة المحاولة تلقائيًا بعد ${retrySeconds} ث (الدورة ${cycle}/${total})${
          stopHint ? `؛ ${stopHint}` : ''
        }`,
      providerStopHints: {
        esc: 'اضغط Esc للإيقاف',
        cancelRequest: 'ألغِ الطلب للإيقاف',
        stopCommand: 'أرسل /stop للإلغاء'
      },
      summarizingThread: 'جار تنظيم المحادثة',
      moaAggregating: 'جار التجميع عبر MoA…',
      moaReference: (label, index, count) =>
        `النموذج المرجعي${index && count ? ` ${index}/${count}` : ''}${label ? ` — ${label}` : ''}`,
      moaReferencesProgress: (done, total, label) => `تقدم مراجع MoA ${done}/${total}${label ? ` — ${label}` : ''}`,
      loadingLocalModel: model => `جارٍ التحميل${model}إلى الذاكرة`,
      processingPrompt: 'المعالجة السريعة',
      resumeWhenBackgroundDone: count =>
        count === 1 ? 'سيُستأنف عند انتهاء المهمة الخلفية' : `سيُستأنف عند انتهاء ${count} مهام خلفية`,
      thinking: 'يفكر...',
      thought: 'فكّر',
      thoughtBriefly: 'فكّر قليلاً',
      thoughtFor: duration => `فكّر لمدة ${duration}`,
      turnDuration: duration => `استغرقت هذه الجولة ${duration}`,
      today: time => `اليوم ${time}`,
      yesterday: time => `أمس ${time}`,
      copy: 'نسخ',
      refresh: 'تحديث',
      moreActions: 'إجراءات إضافية',
      branchNewChat: 'تفريع إلى محادثة جديدة',
      react: 'تفاعل',
      dismissError: 'تجاهل الخطأ',
      errorLayers: {
        auth: 'مشكلة تسجيل الدخول',
        billing: 'نفاد الرصيد',
        disk: 'القرص ممتلئ',
        endpoint: 'لا يمكن الوصول إلى خادم النموذج الخاص بك',
        gateway: 'Hermes واجه مشكلة',
        generic: 'Hermes لم يتمكن من إنهاء هذا الرد',
        provider: 'أرجعت خدمة الذكاء الاصطناعي خطأ',
        runtime: 'Hermes واجه مشكلة',
        streaming: 'تم قطع الرد'
      },
      errorRetry: 'إعادة المحاولة',
      errorStartNewSession: 'بدء جلسة جديدة',
      errorSwitchProvider: 'تبديل المزوّد',
      errorSignInAgain: provider => `تسجيل الدخول إلى ${provider} مجدداً`,
      errorOauthExpired: provider =>
        `انتهت صلاحية تسجيل دخولك إلى ${provider} أو تم إلغاؤه. سجّل الدخول مجدداً لمتابعة المحادثة.`,
      errorOpenLogs: 'فتح السجلات',
      errorOpenLogsFailed: 'تعذّر فتح مجلد السجلات',
      errorOpenDesktopLogs: 'فتح سجلات سطح المكتب',
      errorCopyDiagnostics: 'نسخ تفاصيل الخطأ',
      errorSendDiagnostics: 'إرسال التشخيصات',
      filesChanged: count => `${count} ملفات تم تغييرها`,
      reviewChanges: 'مراجعة',
      readAloudFailed: 'فشلت القراءة بصوت عال',
      preparingAudio: 'جار تجهيز الصوت',
      stopReading: 'إيقاف القراءة',
      readAloud: 'قراءة بصوت عال',
      copyFullResponse: 'نسخ الرد الكامل',
      readAloudFullResponseHint: 'انقر مع الضغط على Shift: قراءة الرد الكامل بصوت عال',
      editMessage: 'تحرير الرسالة',
      expandMessage: 'الرسالة الموسعة',
      scrollToBottom: 'التمرير إلى الأسفل',
      stop: 'إيقاف',
      restorePrevious: 'استعادة السابق',
      restoreCheckpoint: 'استعادة النقطة',
      restoreFromHere: 'استعادة نقطة التحقق — إعادة التشغيل من هذا الموجّه',
      restoreFailed: 'فشل الاستعادة',
      restoreTitle: 'الاستعادة إلى نقطة التحقق هذه؟',
      restoreBody: 'يُزال كل ما يلي هذا الموجّه من المحادثة، ويُعاد تشغيل الموجّه من هنا.',
      restoreConfirm: 'استعادة وإعادة تشغيل',
      restoreNext: 'استعادة التالي',
      goForward: 'تقدم',
      sendEdited: 'إرسال التعديل',
      attachingFile: 'جار إرفاق الملف',
      errorLayerBodies: {
        auth: 'لقد رفضت شركة "آي آي" توقيعك تحقق من وثائق تفويض هذا المزود ثم أرسل رسالتك مرة أخرى.',
        billing: 'حسابك ليس لديه أي ائتمانات لهذا المزود اصعدي أو صانعة مفاتيح ثم ارسلي مرة اخرى.',
        disk: 'القرص ممتلئ، لذلك تعذر على Hermes حفظ هذه المحادثة. حرّر بعض المساحة ثم أعد المحاولة.',
        endpoint: 'لا يمكن أن تصل إلى خادم نموذجك تأكد من أنها تعمل ثم أرسل رسالتك مرة أخرى.',
        gateway:
          'Hermes hit an internal problem starting this reply. أرسل رسالتك مرة أخرى، إذا استمر الأمر في الحدوث أرسل التشخيصات.',
        generic: 'حدث خطأ أثناء رد Hermes. أعد المحاولة، أو انسخ التفاصيل إذا استمرت المشكلة.',
        provider: 'The AI service could not complete this request. ارجعوا في لحظة أو مزود تبديل.',
        runtime:
          'Hermes hit an internal problem starting this reply. أرسل رسالتك مرة أخرى، إذا استمر الأمر في الحدوث أرسل التشخيصات.',
        streaming: 'The connection dropped before the reply ended. حاول أن ترسلها مرة أخرى.'
      },
      errorCodes: {
        auth: {
          title: provider => `${provider}رفض تسجيل الدخول الخاص بك`,
          body: provider =>
            `بيانات الاعتماد المحفوظة لـ${provider}لم يتم قبولها. قم بإصلاحها في الإعدادات أو قم بتغيير المزود، ثم أرسل رسالتك مرة أخرى.`
        },
        auth_permanent: {
          title: provider => `${provider}رفض تسجيل الدخول الخاص بك`,
          body: provider =>
            `بيانات الاعتماد المحفوظة لـ${provider}غير صالحة أو تم إلغاؤها. قم بتحديثها أو غيّر المزود، ثم أرسل رسالتك مرة أخرى.`
        },
        billing: {
          title: 'انتهت الرصيد',
          body: provider =>
            `لك${provider}الحساب لم يعد يحتوي على أرصدة. قم بإعادة الشحن أو تغيير المزود، ثم أرسل مرة أخرى.`
        },
        rate_limit: {
          title: 'خدمة "أي آي" مشغولة',
          body: provider => `${provider}يقوم حاليًا بتحديد عدد الطلبات. انتظر دقيقة، ثم حاول مرة أخرى.`
        },
        upstream_rate_limit: {
          title: 'خدمة "أي آي" مشغولة',
          body: provider => `${provider}يقوم حاليًا بتحديد عدد الطلبات. انتظر دقيقة، ثم حاول مرة أخرى.`
        },
        overloaded: {
          title: '"خدمة "آى آي',
          body: provider => `${provider}يواجه مشاكل الآن. حاول مرة أخرى بعد قليل أو قم بتغيير المزود.`
        },
        server_error: {
          title: 'كان لدائرة مكافحة المخدرات مشكلة',
          body: provider => `${provider}أعاد خادم الخطأ. حاول مرة أخرى بعد لحظة أو غيّر المزود.`
        },
        timeout: {
          title: 'تاريخ تقديم الرد',
          body: provider => `${provider}لم يتم الرد في الوقت المحدد. حاول إرسالها مرة أخرى.`
        },
        stream_drop: {
          title: 'تم قطع الرد',
          body: 'The connection dropped before the reply ended. حاول أن ترسلها مرة أخرى.'
        },
        upstream_blocked: {
          title: 'حائط ناري أغلق الطلب',
          body: provider =>
            `جدار ناري أو CDN أمام${provider}تم حظر الطلب قبل أن يصل إلى النموذج — من المحتمل أن تكون مفتاحك على ما يرام. قم بتعيين رأس User-Agent عبر extra_headers الخاصة بالمزود في الإعدادات، أو قم بتغيير المزود، ثم أعد إرسال رسالتك.`
        },
        ssl_cert_verification: {
          title: 'فشل الاتصال الآمن',
          body: provider =>
            `Hermes could not verify the secure connection to ${provider}تحقق من شبكتك أو أماكن العميلة أو مزود المفاتيح ثم أرسل رسالتك مرة أخرى.`
        },
        context_overflow: {
          title: 'هذه المحادثة طويلة جداً',
          body: 'المحادثة لم تعد تناسب النموذج اضغطي عليه أو ابدأي حديث جديد ثم ارسليه مرة اخرى.'
        },
        payload_too_large: {
          title: 'هذه الرسالة كبيرة جدا',
          body: 'الطلب كان كبيرا جدا للنموذج. اضغطي على المحادثة أو ابدأي حديث جديد ثم ارسلي مرة اخرى.'
        },
        model_not_found: {
          title: 'هذا النموذج غير متاح',
          body: provider => `${provider}لا يقدم هذا النموذج على حسابك. اختر نموذجًا آخر، ثم أرسل رسالتك مرة أخرى.`
        },
        provider_policy_blocked: {
          title: 'هذا النموذج محجوب من خلال حساباتك',
          body: provider =>
            `${provider}لن يتم توجيه هذا الطلب ضمن إعدادات البيانات أو الخصوصية لحسابك. اختر نموذجًا آخر أو قم بتغيير المزود.`
        },
        content_policy_blocked: {
          title: 'ورفضت دائرة الاستخبارات المالية هذا الطلب',
          body: provider => `${provider}لن يجيب على هذه الرسالة. حررها وأرسلها مرة أخرى.`
        },
        format_error: {
          title: 'ورفضت دائرة الاستخبارات المالية الطلب',
          body: provider =>
            `${provider}لم يتم قبول الطريقة التي تم بها بناء هذا الطلب. قم بتغيير المزود أو أرسل بيانات التشخيص حتى نتمكن من الاطلاع عليها.`
        },
        truncated: {
          title: 'قُطع الرد',
          body: 'النموذج توقف قبل الانتهاء حاول الحصول على رد كامل.'
        },
        invalid_response: {
          title: 'أرسل خدمة الذكاء الاصطناعي ردًا غير قابل للقراءة',
          body: provider => `${provider}أعاد شيئًا Hermes لم يتمكن من قراءته. حاول مرة أخرى بعد لحظة.`
        },
        empty_response: {
          title: 'أرسل خدمة الذكاء الاصطناعي ردًا فارغًا',
          body: provider => `${provider}لم يُرجع شيئًا لهذه الرسالة. حاول مرة أخرى بعد لحظة.`
        },
        loop_error: {
          title: 'علق Hermes في حلقة تكرار',
          body: 'واستمر الرد في تكرار نفس الخطوات، لذا أوقفته Hermes. ارجع او ابدأ حديث جديد اذا حدث مرة اخرى.'
        },
        SESSION_NOT_OWNED: {
          title: 'هذه الدردشة مفتوحة في مكان آخر',
          body: 'وهذه الدردشة مفتوحة حاليا في نافذة أو محطة طرفية أخرى من طراز Hermes. اغلقه هناك وارسل رسالتك مرة اخرى او ابدأ حديث جديد هنا.'
        },
        disk_full: {
          title: 'القرص ممتلئ',
          body: 'القرص ممتلئ، لذلك تعذر على Hermes حفظ هذه المحادثة. حرّر بعض المساحة ثم أعد المحاولة.'
        },
        free_tier_disabled: {
          title: 'استخدام Hermes بدون توقيع في',
          body: 'التوقيع مع حساب Nous للحفاظ على الدردشة، انها حرة.'
        },
        free_tier_rate_limited: {
          title: 'لقد استعملت علاوة الدردشة دون التوقيع',
          body: 'ستنعش قريباً توقيع مع حساب Nous لبدل أكبر، هو مجانا.'
        },
        free_tier_at_capacity: {
          title: 'التحدي دون التوقيع مشغول جدا الآن',
          body: 'وقّعْ لتَرْك الطابور، هو حرُ، أَو يُحاولُ ثانيةً في فترة قصيرة.'
        },
        free_tier_model_not_free: {
          title: 'هذا النموذج غير متاح بدون توقيع',
          body: 'Hermes تستخدم النموذج الحر الآن. التوقيع مع حساب Nous للمزيد من النماذج، هو مجانا.'
        },
        free_tier_route: {
          title: 'Hermes لا يمكن أن تصل إلى النموذج المجاني على هذا الطريق',
          body: 'التوقيع مع حساب Nous، هو مجانا، أو التحقق من موقع NOUS_INFERENCE_BASE_URL.'
        },
        free_tier_outage: {
          title: 'النموذج الحر يواجه مشكلة في الرد الآن',
          body: 'حاول إرسال رسالتك مرة أخرى في دقيقة.'
        },
        free_tier_refused: {
          title: 'Hermes لا يمكن أن ترسل ذلك دون التوقيع في',
          body: 'التوقيع مع حساب Nous هو مجانا.'
        }
      },
      errorAuthKinds: {
        api_key: {
          title: provider => `${provider}رفض مفتاح API الخاص بك`,
          body: provider => `المفتاح المحفوظ لـ ${provider} غير صالح أو تم إلغاؤه. حدّثه ثم حاول مرة أخرى.`
        },
        oauth: {
          title: provider => `لك${provider}انتهت صلاحية تسجيل الدخول`
        }
      },
      errorDetails: 'تفاصيل',
      errorGenericProvider: 'خدمات AI',
      errorToastTitle: 'Hermes لا يمكن إنهاء الرد',
      errorLimitResets: time => `يتم إعادة تعيين الحد عند${time}`,
      errorRetryAtReset: time => `أعد المحاولة عند إعادة ضبط الحد (${time})`,
      errorRetryScheduled: (time, wait) => `إعادة المحاولة عند${time}— في${wait}`,
      errorRetryScheduledCancel: 'إلغاء',
      errorChooseModel: 'اختيار نموذج',
      errorCompressConversation: 'محادثة ضغط',
      errorCompressFailed: 'لا يمكن الضغط على المحادثة',
      errorOpenHermesFolder: 'ملف Hermes',
      errorOpenHermesFolderFailed: 'لا يمكن فتح ملف Hermes',
      errorUpdateApiKey: 'تحديث مفتاح API',
      errorSignInFreeTier: 'وقع مع حساب Nous'
    },
    approval: {
      gatewayDisconnected:
        'Hermes غير متصل الآن. الأمر لا يزال في انتظار ردك (حتى انتهاء مهلة الموافقة). أعد الاتصال، ثم أرسله مرة أخرى.',
      sendFailed: 'تعذر إرسال إجابتك',
      run: 'تشغيل',
      command: 'الأمر',
      moreOptions: 'خيارات إضافية',
      allowSession: 'السماح لهذه الجلسة',
      alwaysAllowMenu: 'السماح دائما',
      jumpToApproval: 'الموافقة مطلوبة',
      reject: 'رفض',
      alwaysTitle: 'السماح دائما',
      alwaysDescription: pattern => `السماح دائما بالأوامر المطابقة لـ ${pattern}`,
      alwaysAllow: 'السماح دائما',
      reconnect: 'إعادة الاتصال',
      timedOutSystemLine:
        'ووقت الموافقة - لم يتم تشغيل القيادة. اطلب من شركة Hermes المحاولة مرة أخرى، أو رفع الحد الأقصى في ستينغز . السلامة . الموافقة.',
      openSafetySettings: 'أماكن الأمان المفتوحة'
    },
    clarify: {
      notReady: 'غير جاهز',
      gatewayDisconnected: 'Hermes is offline right now. إعادة الاتصال، ثم إرسالها مرة أخرى.',
      sendFailed: 'فشل الإرسال',
      loadingQuestion: 'جار تحميل السؤال...',
      other: 'غير ذلك',
      placeholder: 'اكتب إجابتك...',
      skip: 'تخطي',
      skipped: 'تخطى',
      confirmAndContinueLabel: 'تأكيد ومتابعة',
      singleSelectHint: 'اختر واحدا',
      multiSelectHint: 'حدد كل ما ينطبق',
      recommendedSuffix: ' (موصى به)',
      oneQuestion: 'سؤال واحد',
      questionProgress: (answered, total) => `تمت الإجابة على ${answered} من ${total}`
    },
    mcpSetup: {
      installTitle: 'إضافة خواديم MCP',
      enableTitle: 'خواديم طراز MCP',
      authorizeTitle: 'تفويض خوادم MCP',
      installAction: 'تثبيت',
      enableAction: 'التمكين',
      authorizeAction: 'الإذن',
      installed: server => `مثبت${server}`,
      enabled: server => `مُمكّن${server}`,
      authorized: server => `مصرح به${server}`,
      failed: server => `فشل الإعداد لـ${server}`,
      toolCount: count => (count === 1 ? 'أداة واحدة' : `${count} tools`),
      envRequired: 'ملء وثائق التفويض المطلوبة أولا',
      sendFailed: 'لم يكن بمقدوره إرسال رد من شركة MCP',
      reloadFailed: 'أنقذ سيرفر، ولكن إعادة تحميل أدوات MCP فشلت - وهي تحمل الدورة القادمة',
      gatewayDisconnected: 'Hermes is offline right now. إعادة الاتصال، ثم إرسالها مرة أخرى.'
    },
    setupChoose: {
      kinds: {
        accent: 'لون التمييز',
        connectors: 'التطبيقات',
        layout: 'التخطيط',
        plugins: 'الإضافات',
        theme: 'المظهر'
      },
      loading: 'جار تحميل الخيارات...',
      unavailable: 'هذه القائمة غير متاحة الآن. رد في المحادثة بدلا من ذلك.',
      findApp: 'ابحث عن تطبيق',
      customColor: 'لون مخصص',
      plugin: 'إضافة',
      startsLater: 'سنُعِدّ هذه عندما تبدأ.'
    },
    startChat: {
      starting: title => `جار بدء "${title}"...`,
      startingUntitled: 'جار بدء محادثة...',
      untitled: 'محادثة جديدة',
      notStarted: 'تعذر بدء هذه المحادثة.',
      retry: 'إعادة المحاولة',
      inProfile: profile => `في ${profile}`,
      open: 'فتح',
      openFailed: 'تعذر فتح المحادثة'
    },
    tool: {
      copyCode: 'نسخ الكود',
      renderingImage: 'جار عرض الصورة...',
      copyOutput: 'نسخ الإخراج',
      copyCommand: 'نسخ الأمر',
      copyContent: 'نسخ المحتوى',
      copyUrl: 'نسخ الرابط',
      copyResults: 'نسخ النتائج',
      copyQuery: 'نسخ الاستعلام',
      copyFile: 'نسخ الملف',
      copyPath: 'نسخ المسار',
      outputAlt: 'إخراج الأداة',
      rawResponse: 'الرد الخام',
      copyActivity: 'نسخ النشاط',
      toolPayload: 'حمولة الأداة',
      searchResults: 'نتائج البحث',
      recoveredOne: 'تم الاسترداد',
      recoveredMany: count => `تم استرداد ${count}`,
      failedOne: 'فشل',
      failedMany: count => `فشل ${count}`,
      statusRunning: 'يعمل',
      statusError: 'خطأ',
      statusRecovered: 'تم الاسترداد',
      statusDone: 'تم',
      memoryWriteNoted: 'تم تسجيل كتابة الذاكرة',
      failedToWriteFile: detail => `فشل في كتابة الملف: ${detail}`,
      sensitiveSystemPathWriteRefused: path =>
        `رُفضت الكتابة إلى مسار نظام حساس: ${path}\nإذا كنت بحاجة إلى تعديل ملفات النظام، فاستخدم أداة الطرفية مع sudo.`,
      returnedError: 'أرجعت الأداة خطأ.',
      returnedSuccessFalse: 'أرجعت الأداة success=false.',
      returnedStatus: status => `أرجعت الأداة الحالة «${status}».`,
      commandFailedWithExitCode: exitCode => `فشل تنفيذ الأمر برمز الخروج ${exitCode}.`,
      sessionKernelTimedOut: (timeoutSeconds, remote) =>
        `انتهت مهلة الخلية بعد ${timeoutSeconds} ثانية؛ تم إنهاء نواة ${remote ? 'الجلسة البعيدة' : 'الجلسة'} وفُقدت حالتها. سيبدأ استدعاء execute_code التالي بنواة جديدة.`,
      clarifyErrors: {
        questionsMustBeArray: 'يجب أن تكون المعلمة questions مصفوفة من كائنات الأسئلة.',
        questionsLimit: limit => `تدعم المعلمة questions عددًا أقصاه ${limit} من العناصر.`,
        questionMustBeObject: index => `يجب أن يكون questions[${index}] كائنًا يحتوي على الحقل question.`,
        questionMustNotBeEmpty: index => `يجب أن يحتوي questions[${index}].question على نص غير فارغ.`,
        choicesMustBeArray: field => `يجب أن يكون ${field} مصفوفة.`,
        choicesMustBeStringArray: 'يجب أن تكون المعلمة choices مصفوفة من السلاسل النصية.',
        noQuestion:
          'لم يُحدَّد سؤال. أضف كائنًا واحدًا على الأقل إلى questions مع الحقل question؛ أما choices وmulti_select فاختياريان.',
        unavailable: 'أداة طلب التوضيح غير متاحة في هذا السياق.',
        inputFailed: detail => `تعذّر الحصول على إدخال المستخدم: ${detail}`
      },
      countLabel: (count, _noun, displayNoun) => `${count} ${displayNoun}`,
      runSummary: {
        delegate: {
          count: (count, live) => `${live ? 'الفصل' : 'المندوب'} ${count} ${count === 1 ? 'المهمة' : 'المهام'}`,
          present: 'الفصل',
          target: (target, live) => `${live ? 'الفصل' : 'المندوب'} ${target}`
        },
        edit: {
          count: (count, live) => `${live ? 'التحرير' : 'Edited'} ${count} ${count === 1 ? 'ملف' : 'الملفات'}`,
          present: 'التحرير',
          target: (target, live) => `${live ? 'التحرير' : 'Edited'} ${target}`
        },
        explore: {
          count: (count, live) => `${live ? 'استكشاف' : 'Explored'} ${count} ${count === 1 ? 'ملف' : 'الملفات'}`,
          present: 'استكشاف',
          target: (target, live) => `${live ? 'استكشاف' : 'Explored'} ${target}`
        },
        other: {
          count: (count, live) => `${live ? 'استخدام' : 'مستخدم'} ${count} ${count === 1 ? 'أداة' : 'الأدوات'}`,
          present: 'استخدام',
          target: (target, live) => `${live ? 'استخدام' : 'مستخدم'} ${target}`
        },
        run: {
          count: (count, live) => `${live ? 'تشغيل' : 'ران'} ${count} ${count === 1 ? 'القيادة' : 'الأوامر'}`,
          present: 'تشغيل',
          target: (target, live) => `${live ? 'تشغيل' : 'ران'} ${target}`
        },
        separator: ', '
      },
      actions: {
        read: 'قراءة',
        reading: 'جار القراءة',
        opened: 'تم الفتح',
        opening: 'جار الفتح',
        failedToOpen: 'فشل في فتح',
        searched: 'تم البحث',
        searching: 'جار البحث',
        ran: 'تم التشغيل',
        running: 'جار التشغيل',
        ranCode: 'تم تشغيل الكود',
        runningCode: 'جار البرمجة'
      },
      prefixes: {
        browser: 'المتصفح',
        web: 'الويب'
      },
      titleTemplates: {
        actionCommand: (action, command) => `${action} ${command}`,
        actionQuoted: (action, value) => `${action} “${value}”`,
        actionTarget: (action, target) => `${action} ${target}`,
        completedTool: action => `تم تشغيل ${action}`,
        prefixedDone: (prefix, action) => `${prefix} ${action}`,
        runningPrefixedTool: (prefix, action) => `جار تشغيل ${prefix.toLowerCase()} ${action.toLowerCase()}`,
        runningTool: action => `جار تشغيل ${action.toLowerCase()}`
      },
      titles: {
        setup_choose: { done: 'طرح سؤال إعداد', pending: 'يطرح سؤال إعداد', pendingAction: 'يسأل' },
        start_chat: { done: 'بدأ محادثة', pending: 'يبدأ محادثة', pendingAction: 'يبدأ' },
        browser_click: {
          done: 'تم النقر على عنصر الصفحة',
          pending: 'جار النقر على عنصر الصفحة',
          pendingAction: 'جار النقر'
        },
        browser_fill: {
          done: 'تم ملء حقل النموذج',
          pending: 'جار ملء حقل النموذج',
          pendingAction: 'جار الملء'
        },
        browser_navigate: {
          done: 'تم فتح الصفحة',
          pending: 'جار فتح الصفحة',
          pendingAction: 'جار الفتح'
        },
        browser_snapshot: {
          done: 'تم التقاط لقطة الصفحة',
          pending: 'جار التقاط لقطة الصفحة',
          pendingAction: 'جار الالتقاط'
        },
        browser_take_screenshot: {
          done: 'تم التقاط لقطة الشاشة',
          pending: 'جار التقاط لقطة الشاشة',
          pendingAction: 'جار الالتقاط'
        },
        browser_type: {
          done: 'تمت الكتابة على الصفحة',
          pending: 'جار الكتابة على الصفحة',
          pendingAction: 'جار الكتابة'
        },
        clarify: {
          done: 'تم طرح سؤال',
          pending: 'جار طرح سؤال',
          pendingAction: 'جار السؤال'
        },
        cronjob: {
          done: 'مهمة مجدولة',
          pending: 'جار جدولة المهمة',
          pendingAction: 'جار الجدولة'
        },
        edit_file: {
          done: 'تم تحرير الملف',
          pending: 'جار تحرير الملف',
          pendingAction: 'جار التحرير'
        },
        execute_code: {
          done: 'تم تشغيل الكود',
          pending: 'جار البرمجة',
          pendingAction: 'جار البرمجة'
        },
        image_generate: {
          done: 'تم إنشاء الصورة',
          pending: 'جار إنشاء الصورة',
          pendingAction: 'جار الإنشاء'
        },
        list_files: {
          done: 'تم سرد الملفات',
          pending: 'جار سرد الملفات',
          pendingAction: 'جار السرد'
        },
        memory: {
          done: 'تم الحفظ في الذاكرة',
          pending: 'جار الحفظ في الذاكرة',
          pendingAction: 'جار الحفظ'
        },
        patch: {
          done: 'تم تصحيح الملف',
          pending: 'جار تصحيح الملف',
          pendingAction: 'جار التصحيح'
        },
        read_file: {
          done: 'تمت قراءة الملف',
          pending: 'جار قراءة الملف',
          pendingAction: 'جار القراءة'
        },
        search_files: {
          done: 'تم البحث في الملفات',
          pending: 'جار البحث في الملفات',
          pendingAction: 'جار البحث'
        },
        session_search_recall: {
          done: 'تم البحث في سجل الجلسة',
          pending: 'جار البحث في سجل الجلسة',
          pendingAction: 'جار البحث'
        },
        skill_view: {
          done: 'تم تحميل المهارة',
          pending: 'جار تحميل المهارة',
          pendingAction: 'جار التحميل'
        },
        terminal: {
          done: 'تم تشغيل الأمر',
          pending: 'جار تشغيل الأمر',
          pendingAction: 'جار التشغيل'
        },
        todo: {
          done: 'تم تحديث المهام',
          pending: 'جار تحديث المهام',
          pendingAction: 'جار التحديث'
        },
        vision_analyze: {
          done: 'تم تحليل الصورة',
          pending: 'جار تحليل الصورة',
          pendingAction: 'جار التحليل'
        },
        web_extract: {
          done: 'تمت قراءة صفحة الويب',
          pending: 'جار قراءة صفحة الويب',
          pendingAction: 'جار القراءة'
        },
        web_search: {
          done: 'تم البحث في الويب',
          pending: 'جار البحث في الويب',
          pendingAction: 'جار البحث'
        },
        write_file: {
          done: 'تم تحرير الملف',
          pending: 'جار تحرير الملف',
          pendingAction: 'جار التحرير'
        }
      },
      failedCalls: (count: number) => `${count} tool call${count === 1 ? '' : 's'} failed`,
      skillActivity: {
        loading: 'جارٍ تحميل المهارة',
        loaded: 'مهارة محملة',
        loadFailed: 'فشل تحميل المهارة',
        readingResource: 'مصدر مهارة القراءة',
        readResource: 'اقرأ مورد المهارة',
        resourceFailed: 'فشل في قراءة مورد المهارة',
        listing: 'قائمة المهارات',
        listed: 'المهارات المدرجة',
        listFailed: 'فشل في عرض المهارات',
        unavailable: 'نتيجة المهارة غير متوفرة'
      },
      resultUnavailable: 'النتيجة غير متوفرة',
      resultInterrupted: 'مقاطع'
    },
    catalogInstall: {
      preparing: 'جارٍ تجهيز التثبيت…',
      install: 'تثبيت',
      advanced: 'خيارات متقدمة',
      skip: 'تخطٍّ',
      installing: 'جارٍ التثبيت…',
      installed: 'مثبّت',
      notInstalled: 'غير مثبّت',
      failed: 'فشل',
      showNames: 'إظهار الأسماء',
      hideNames: 'إخفاء الأسماء',
      skill: name => `المهارة ${name}`,
      kind: { plugin: 'إضافة', skill: 'مهارة' },
      tier: { official: 'رسمي', community: 'مجتمعي' },
      targetProfile: profile => `يُثبَّت في ملفك الشخصي ${profile}`,
      sendFailed: 'تعذّر إرسال ردك. حاول مرة أخرى.',
      commitLabel: 'الإيداع',
      subdirLabel: 'المجلد',
      securityHeading: 'الأمان',
      scan: {
        passed: 'نجح الفحص',
        warnings: 'وجد الفحص تحذيرات',
        failed: 'فشل الفحص'
      },
      requirementsLabel: 'المتطلبات',
      credentialsHeading: 'بيانات الاعتماد'
    }
  }
} satisfies Pick<TranslationOverrides, 'assistant'>
