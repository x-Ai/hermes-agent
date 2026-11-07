import { AR_PLURAL } from './ar_plural'
import { arThemePicker } from './ar_theme_picker'
import type { TranslationOverrides } from './define-locale'

export const arAssistant = {
  assistant: {
    media: {
      gatewayFetchFailed: name => `تعذّر جلب ${name} من البوابة (مفقود أو تتعذّر قراءته أو كبير جدًا).`,
      openMediaFile: kind => `فتح ملف ${kind === 'audio' ? 'الصوت' : 'الفيديو'}`,
      openNamed: name => `فتح ${name}`,
      loadingNamed: name => `جارٍ تحميل ${name}…`,
      couldNotLoad: name => `تعذّر تحميل ${name}.`,
      openImage: 'فتح الصورة',
      imageFallbackName: 'صورة'
    },
    embeds: {
      load: label => `تحميل ${label}`,
      alwaysAllow: label => `السماح دائمًا لـ ${label}`,
      holdToZoom: 'اضغط مطولاً على Ctrl/⌘ للتكبير',
      failedToLoad: label => `تعذّر تحميل تضمين ${label}`,
      openDiagram: 'فتح المخطط',
      embedTitle: label => `تضمين ${label}`
    },
    thread: {
      loadingSession: 'جارٍ تحميل الجلسة',
      openSessionFailed: 'تعذّر فتح هذه الجلسة',
      showEarlier: 'عرض الرسائل الأقدم',
      loadingResponse: 'يحمّل Hermes ردًا',
      steered: 'تم التوجيه',
      responseStopped: 'توقف الرد',
      asyncDelegationFailure: detail => `(فشل: ${detail})`,
      asyncDelegationPartialOutput: 'الناتج الجزئي:',
      messagingAgent: name => `جارٍ مراسلة ${name}…`,
      messagedAgent: name => `تمت مراسلة ${name}`,
      messageFrom: name => `رسالة من ${name}`,
      showMessage: 'عرض الرسالة',
      repliedTo: name => `تم الرد على ${name}`,
      showReply: 'عرض الرد',
      processOutput: 'المخرجات',
      emojiSearch: 'بحث…',
      emojiLoading: 'جارٍ تحميل الرموز التعبيرية…',
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
        skillNamedPatched: (name, detail) => `تم تعديل المهارة «${name}»${detail ? `: ${detail}` : ''}`,
        skillNamedRewritten: (name, detail) => `تمت إعادة كتابة المهارة «${name}»${detail ? `: ${detail}` : ''}`,
        memoryLabel: 'الذاكرة',
        userProfileLabel: 'ملف المستخدم'
      },
      failedTurnNotice: 'لم تتم معالجة طلبك. أرسله مرة أخرى إذا كنت لا تزال تريد مني تنفيذه.',
      failedTurnRestartNotice:
        'البوابة قيد إعادة التشغيل: انقطع هذا الدور ولن يُعاد تشغيله. أعد إرسال رسالتك بمجرد أن يعيد Hermes الاتصال.',
      failedTurnShutdownNotice:
        'البوابة قيد الإيقاف: انقطع هذا الدور ولن يُعاد تشغيله. أعد إرسال رسالتك بمجرد عودة Hermes.',
      failedTurnAutomationNotice:
        'انقطع تسليم تلقائي ولم يُعَد تشغيله. قد تكون بعض الإجراءات قد نُفِّذت بالفعل؛ تحقق من آثارها.',
      failedTurnPartialNotice:
        'لم يكتمل هذا الدور. ربما نُفِّذت بعض الإجراءات بالفعل؛ تحقق من آثارها قبل إعادة الإرسال.',
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
          `استجابة سريعة (${durationSeconds} ث) — على الأرجح بسبب تقييد المعدل`,
        rateLimited: 'قيّد المزوّد معدل الطلبات (429)',
        responseTime: durationSeconds => `زمن الاستجابة ${durationSeconds} ث`,
        slowResponseLikelyUpstreamTimeout: durationSeconds =>
          `استجابة بطيئة (${durationSeconds} ث) — على الأرجح انتهت مهلة المزوّد`,
        upstreamError: (code, durationSeconds) => `خطأ لدى المزوّد (الرمز ${code}، ${durationSeconds} ث)`,
        upstreamGatewayTimedOut: durationSeconds => `انتهت مهلة الخادم الوسيط لدى المزوّد (504، ${durationSeconds} ث)`,
        upstreamProviderOverloaded: code => `المزوّد محمّل فوق طاقته (${code})`,
        upstreamProviderTimedOut: durationSeconds => `انتهت مهلة المزوّد (Cloudflare 524، ${durationSeconds} ث)`,
        upstreamServerError: (code, durationSeconds) => `خطأ في خادم المزوّد (${code}، ${durationSeconds} ث)`
      },
      operationInterruptedWaitingForModel: elapsedSeconds =>
        `تمت مقاطعة العملية: في انتظار استجابة النموذج (انقضت ${elapsedSeconds} ث).`,
      modelContinuing: (attempt, maxAttempts) =>
        `أعاد النموذج استدلالًا دون إجابة نهائية — جارٍ طلب المتابعة منه (${attempt}/${maxAttempts})`,
      providerReconnecting: (elapsedSeconds, kind) =>
        `لم يرسل المزوّد ${kind === 'output' ? 'مخرجات' : 'استجابة'} منذ ${elapsedSeconds} ث — جارٍ إعادة الاتصال…`,
      providerRetrying: (retrySeconds, attempt, maxAttempts) =>
        `في انتظار المزوّد — إعادة المحاولة بعد ${retrySeconds} ث (المحاولة ${attempt}/${maxAttempts})`,
      providerWaitPhases: {
        first_event: seconds => `${seconds} ث في انتظار أول حدث من المزوّد`,
        reconnect: seconds => `${seconds} ث في انتظار أول حدث من المزوّد بعد إعادة الاتصال`,
        pre_progress: seconds => `بث المزوّد مفتوح؛ ${seconds} ث دون تقدم فعلي من النموذج`,
        post_event: seconds => `بث المزوّد نشط؛ ${seconds} ث دون أحداث بث`,
        first_chunk: seconds => `${seconds} ث في انتظار أول جزء من البث`,
        post_chunk: seconds => `البث مفتوح؛ ${seconds} ث دون مخرجات بث`
      },
      providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
        `${stillWaiting ? 'ما زلنا في انتظار' : 'في انتظار'} ${model} — ${phaseText}${
          watchdog ? ` (إعادة اتصال تلقائية: مراقب ${watchdog.label} خلال ${watchdog.seconds} ث)` : ''
        }`,
      providerRetryReasons: {
        rate_limited: 'تم تقييد المعدل',
        overloaded: 'المزوّد محمّل فوق طاقته',
        free_model_busy: 'النموذج المجاني مشغول'
      },
      providerRetryingAfter: (reason, resetWindow, retrySeconds, attempt, maxAttempts) =>
        `${reason} — ${resetWindow ? `يُعاد الضبط خلال ${resetWindow}، ` : ''}إعادة المحاولة بعد ${retrySeconds} ث (المحاولة ${attempt}/${maxAttempts})`,
      providerAutoRecovering: (retrySeconds, cycle, total, stopHint) =>
        `المزوّد غير متاح مؤقتًا — إعادة المحاولة تلقائيًا بعد ${retrySeconds} ث (الدورة ${cycle}/${total})${
          stopHint ? `؛ ${stopHint}` : ''
        }`,
      providerStopHints: {
        esc: 'اضغط Esc للإيقاف',
        cancelRequest: 'ألغِ الطلب للإيقاف',
        stopCommand: 'أرسل /stop للإلغاء'
      },
      summarizingThread: 'جارٍ تلخيص المحادثة',
      moaAggregating: 'جارٍ التجميع عبر MoA…',
      moaReference: (label, index, count) =>
        `النموذج المرجعي${index && count ? ` ${index}/${count}` : ''}${label ? ` — ${label}` : ''}`,
      moaReferencesProgress: (done, total, label) =>
        `النماذج المرجعية لـ MoA ${done}/${total}${label ? ` — ${label}` : ''}`,
      loadingLocalModel: model => `جارٍ تحميل ${model} إلى الذاكرة`,
      processingPrompt: 'جارٍ معالجة الموجّه',
      resumeWhenBackgroundDone: count =>
        AR_PLURAL(count, {
          one: 'سيُستأنف عند انتهاء المهمة الخلفية',
          two: 'سيُستأنف عند انتهاء المهمتين الخلفيتين',
          few: `سيُستأنف عند انتهاء ${count} مهام خلفية`,
          many: `سيُستأنف عند انتهاء ${count} مهمة خلفية`
        }),
      thinking: 'يفكّر...',
      thought: 'فكّر',
      thoughtBriefly: 'فكّر قليلاً',
      thoughtFor: duration => `فكّر لمدة ${duration}`,
      turnDuration: duration => `استغرق هذا الدور ${duration}`,
      today: time => `اليوم، ${time}`,
      yesterday: time => `أمس، ${time}`,
      copy: 'نسخ',
      refresh: 'تحديث',
      moreActions: 'إجراءات إضافية',
      branchNewChat: 'تفريع إلى محادثة جديدة',
      react: 'إضافة تفاعل',
      dismissError: 'تجاهل الخطأ',
      errorLayers: {
        auth: 'مشكلة تسجيل الدخول',
        billing: 'نفاد الرصيد',
        disk: 'القرص ممتلئ',
        endpoint: 'تعذّر الوصول إلى خادم النموذج',
        gateway: 'تعذّر إرسال رسالتك',
        generic: 'تعذّر على Hermes إنهاء هذا الرد',
        provider: 'أعادت خدمة الذكاء الاصطناعي خطأ',
        runtime: 'واجه Hermes مشكلة',
        streaming: 'تم قطع الرد'
      },
      errorCodes: {
        auth: {
          title: provider => `رفض ${provider} مفتاح API الخاص بك`,
          body: () => 'المفتاح المحفوظ غير صالح أو أُلغي. حدّثه، ثم أرسل رسالتك مجددًا.'
        },
        auth_permanent: {
          title: provider => `رفض ${provider} مفتاح API الخاص بك`,
          body: () => 'المفتاح المحفوظ غير صالح أو أُلغي. حدّثه، ثم أرسل رسالتك مجددًا.'
        },
        billing: {
          title: provider => `نفد رصيدك في ${provider}`,
          body: provider => `أضف رصيدًا لمواصلة استخدام النماذج المدفوعة على ${provider}.`
        },
        rate_limit: {
          title: provider => `${provider} مشغول الآن`,
          body: provider => `بلغت حد الطلبات في ${provider}. انتظر قليلًا، ثم أعد المحاولة.`
        },
        upstream_rate_limit: {
          title: (_provider, model) => `${model || 'هذا النموذج'} مشغول الآن`,
          body: (provider, model) =>
            `${model || 'هذا النموذج'} مقيَّد بحد الطلبات لدى مصدر ${provider}، لا في حسابك. أعد المحاولة بعد قليل.`
        },
        overloaded: {
          title: provider => `${provider} مشغول الآن`,
          body: provider => `${provider} مثقل بالطلبات ولم يتمكن من معالجة هذا الطلب. أعد المحاولة بعد قليل.`
        },
        server_error: {
          title: provider => `${provider} يواجه مشكلة`,
          body: provider => `أعاد ${provider} خطأ في الخادم. أعد المحاولة بعد قليل.`
        },
        timeout: {
          title: provider => `تعذّر الوصول إلى ${provider}`,
          body: provider => `تعذّر على Hermes الوصول إلى ${provider}. تحقّق من اتصالك، ثم أعد المحاولة.`
        },
        no_reply: {
          title: 'لم يصل الرد',
          body: 'أنهى Hermes هذا الدور، لكن لم يصل أي رد إلى هذه النافذة. أعد المحاولة لإرسال رسالتك مجددًا.'
        },
        upstream_blocked: {
          title: provider => `حظر ${provider} هذا الطلب`,
          body: provider =>
            `رفض جدار حماية أمام ${provider} الطلب قبل وصوله إلى النموذج. بدّل المزوّد، أو عيّن له User-Agent مخصصًا.`
        },
        ssl_cert_verification: {
          title: provider => `تعذّر التحقق من اتصال ${provider}`,
          body: provider =>
            `منع وكيل (proxy) أو مخزن شهادات قديم الاتصال الآمن بـ ${provider}. يوضح دليل الإعداد كيفية إصلاح ذلك.`
        },
        context_overflow: {
          title: 'هذه المحادثة طويلة جدًا',
          body: (_provider, model) => `لم تعد المحادثة تتسع في نافذة سياق ${model || 'النموذج'}. اضغطها للمتابعة.`
        },
        payload_too_large: {
          title: 'هذه الرسالة كبيرة جدًا',
          body: provider => `يتجاوز الطلب، بما فيه المرفقات، حد الحجم لدى ${provider}. اضغط المحادثة أو أزل المرفقات.`
        },
        model_not_found: {
          title: (_provider, model) => `${model || 'هذا النموذج'} غير متاح`,
          body: (provider, model) => `لا يوفّر ${provider} ${model || 'هذا النموذج'} في حسابك. اختر نموذجًا آخر.`
        },
        provider_policy_blocked: {
          title: (provider, model) => `إعدادات ${provider} تحظر ${model || 'هذا النموذج'}`,
          body: provider =>
            `تستبعد إعدادات الخصوصية في ${provider} جميع نقاط الوصول لهذا النموذج. غيّرها على ${provider}، أو اختر نموذجًا آخر.`
        },
        content_policy_blocked: {
          title: provider => `رفض ${provider} هذه الرسالة`,
          body: provider => `رفضها مرشّح الأمان في ${provider}. عدّل الرسالة وأرسلها مجددًا.`
        },
        format_error: {
          title: provider => `رفض ${provider} هذا الطلب`,
          body: provider =>
            `لم يقبل ${provider} طريقة بناء هذه المحادثة. بدّل المزوّد، أو ابدأ محادثة جديدة إذا تكرر ذلك.`
        },
        truncated: {
          title: 'انقطع الرد قبل اكتماله',
          body: (_provider, model) => `توقف ${model || 'النموذج'} قبل أن يُنهي ردّه. اختر «متابعة» ليكمل من حيث توقف.`
        },
        invalid_response: {
          title: 'تعذّرت قراءة الرد',
          body: provider => `أعاد ${provider} ردًا فارغًا أو تالفًا. أعد المحاولة بعد قليل.`
        },
        empty_response: {
          title: 'تعذّر الحصول على رد',
          body: provider => `لم يُعِد ${provider} أي شيء لهذه الرسالة. أعد المحاولة بعد قليل.`
        },
        loop_error: {
          title: 'تعذّر على Hermes إنهاء هذه الخطوة',
          body: 'حدث خطأ أثناء معالجة الرد. أعد المحاولة؛ وإذا تكرر ذلك، أرسل التشخيصات من التفاصيل.'
        },
        agent_init_failed: {
          title: 'تعذّر بدء هذه المحادثة',
          body: provider =>
            `تعذّر على Hermes الاتصال بـ ${provider} لهذه المحادثة. أعد المحاولة؛ وإذا استمر الفشل، تحقّق من المزوّد في الإعدادات.`
        },
        SESSION_OWNER_BUSY: {
          title: 'Hermes مشغول في هذه المحادثة',
          body: 'يجري دور آخر هنا ولم تتمكن رسالتك من الانضمام إلى قائمة انتظاره. لم يُرسَل أي شيء. أعد المحاولة بعد انتهاء ذلك الدور.'
        },
        SESSION_OWNER_UNCONFIRMED: {
          title: 'ربما تكون رسالتك في قائمة الانتظار بالفعل',
          body: 'لم تؤكد البوابة استلام رسالتك في الوقت المناسب. إن كانت في قائمة الانتظار، فستُنفَّذ بعد انتهاء الدور السابق أو حسمه. راجع المحادثة قبل إرسالها مرة أخرى.'
        },
        SESSION_NOT_OWNED: {
          title: 'المحادثة مفتوحة في مكان آخر',
          body: 'هذه المحادثة مفتوحة في نافذة Hermes أخرى أو في الطرفية. ابدأ محادثة جديدة هنا، أو أغلقها هناك أولًا.'
        },
        disk_full: {
          title: 'القرص ممتلئ',
          body: 'تعذّر على Hermes حفظ هذه المحادثة. حرّر بعض المساحة، ثم أعد المحاولة.'
        },
        free_tier_disabled: {
          title: 'سجّل الدخول لمتابعة المحادثة',
          body: 'سجّل الدخول بحساب Nous لمتابعة المحادثة، فهو مجاني.'
        },
        free_tier_rate_limited: {
          title: 'نفدت الحصة المجانية',
          body: 'تتجدد قريبًا. سجّل الدخول بحساب Nous للحصول على حصة أكبر، فهو مجاني.'
        },
        free_tier_at_capacity: {
          title: 'المستوى المجاني مزدحم',
          body: 'سجّل الدخول لتتجاوز الانتظار، فهو مجاني، أو حاول مجددًا بعد قليل.'
        },
        free_tier_model_not_free: {
          title: 'هذا النموذج يتطلب تسجيل الدخول',
          body: 'يستخدم Hermes النموذج المجاني حاليًا. سجّل الدخول بحساب Nous للوصول إلى نماذج أكثر، فهو مجاني.'
        },
        free_tier_route: {
          title: 'تعذّر الوصول إلى النموذج المجاني',
          body: 'سجّل الدخول بحساب Nous، فهو مجاني، أو تحقّق من إعداد NOUS_INFERENCE_BASE_URL.'
        },
        free_tier_outage: {
          title: 'النموذج المجاني يواجه مشكلة',
          body: 'حاول إرسال رسالتك مجددًا بعد دقيقة.'
        },
        free_tier_refused: {
          title: 'سجّل الدخول لمتابعة المحادثة',
          body: 'تسجيل الدخول بحساب Nous مجاني.'
        },
        cron_session_read_only: {
          title: 'هذه المحادثة تابعة لمهمة مجدولة',
          body: 'إنها تشغّل تلك المهمة فقط، لذا لم تُنفَّذ رسالتك. ابدأ محادثة جديدة لإرسالها.'
        },
        session_read_only: {
          title: 'هذه المحادثة للقراءة فقط',
          body: 'إنها سجلّ محفوظ يستطيع Hermes عرضه لكن لا يستطيع متابعته، لذا لم تُنفَّذ رسالتك. ابدأ محادثة جديدة لإرسالها.'
        },
        usage_window: {
          title: 'نفد الاستخدام المضمّن',
          body: 'نفد الاستخدام المضمّن في خطتك حتى إعادة التعيين. أضف رصيدًا عبر /topup للمتابعة.'
        },
        workspace_unavailable: {
          title: 'مجلد هذه المحادثة غير موجود',
          body: 'نُقل المجلد الذي تعمل فيه هذه المحادثة أو حُذف، لذا لم تُنفَّذ رسالتك. أعد إنشاء المجلد، أو استخدم «نقل إلى مشروع» لتعيين مجلد آخر للمحادثة، ثم أعد المحاولة.'
        },
        launch_credentials_unavailable: {
          title: 'تغيّر مفتاح API لهذه المحادثة',
          body: 'بدأت هذه المحادثة بمفتاح API تم تغييره أو حذفه منذ ذلك الحين، لذا لم تُرسل رسالتك. المحادثة المفتوحة لا تنتقل أبدًا إلى مفتاح مختلف من تلقاء نفسها. ابدأ جلسة جديدة لاستخدام مفتاحك الحالي.'
        },
        local_runtime_unavailable: {
          title: 'تعذّر الوصول إلى خادم النماذج المحلي',
          body: 'خادم النماذج المحلي لا يعمل بعد: ربما لا يزال قيد التشغيل. أعد المحاولة بعد لحظة، أو انتقل إلى نموذج آخر.',
          bodyNoRetry:
            'خادم النماذج المحلي متوقف. شغّله من تطبيق Hermes لسطح المكتب أو عبر `hermes model` في الطرفية، أو انتقل إلى نموذج آخر.'
        },
        stream_drop: {
          title: 'تم قطع الرد',
          body: 'انقطع الاتصال قبل أن يكتمل الرد. أعد المحاولة لإرساله مرة أخرى.'
        }
      },
      errorRetry: 'إعادة المحاولة',
      errorSwitchToModel: (model, note) => (note ? `التبديل إلى ${model} (${note})` : `التبديل إلى ${model}`),
      errorSwitchModelFailed: 'تعذّر تبديل النموذج',
      errorUseCredits: 'تفعيل «الاستمرار بالرصيد»',
      errorUseCreditsFailed: 'تعذّر تفعيل «الاستمرار بالرصيد»',
      errorAddCredits: 'إضافة رصيد',
      errorOpenBillingSettings: 'فتح إعدادات الفوترة',
      errorStartNewSession: 'بدء جلسة جديدة',
      errorSwitchProvider: 'تبديل المزوّد',
      errorSignInAgain: provider => `تسجيل الدخول إلى ${provider} مجددًا`,
      errorOauthExpired: provider =>
        `انتهت صلاحية تسجيل دخولك إلى ${provider} أو أُلغي. سجّل الدخول مجددًا لمتابعة المحادثة.`,
      errorOpenLogs: 'فتح السجلات',
      errorOpenLogsFailed: 'تعذّر فتح مجلد السجلات',
      errorOpenDesktopLogs: 'فتح سجلات تطبيق سطح المكتب',
      errorCopyDiagnostics: 'نسخ تفاصيل الخطأ',
      errorSendDiagnostics: 'إرسال التشخيصات',
      filesChanged: count =>
        AR_PLURAL(count, {
          one: 'تم تغيير ملف واحد',
          two: 'تم تغيير ملفين',
          few: `تم تغيير ${count} ملفات`,
          many: `تم تغيير ${count} ملفًا`,
          other: `تم تغيير ${count} ملف`
        }),
      reviewChanges: 'مراجعة',
      readAloudFailed: 'تعذّرت القراءة بصوت عالٍ',
      preparingAudio: 'جارٍ تجهيز الصوت...',
      stopReading: 'إيقاف القراءة',
      readAloud: 'القراءة بصوت عالٍ',
      copyFullResponse: 'نسخ الرد الكامل',
      readAloudFullResponseHint: 'انقر مع الضغط على Shift: قراءة الرد الكامل بصوت عالٍ',
      contentRefusedNotice: 'رفض مرشّح الأمان في النموذج هذه الرسالة — جرّب طلبًا مختلفًا.',
      editMessage: 'تعديل الرسالة',
      expandMessage: 'توسيع الرسالة',
      scrollToBottom: 'التمرير إلى الأسفل',
      stop: 'إيقاف',
      restorePrevious: 'استعادة نقطة الاستعادة السابقة',
      restoreCheckpoint: 'استعادة نقطة الاستعادة',
      restoreFromHere: 'استعادة نقطة الاستعادة — إعادة التشغيل من هذا الموجّه',
      restoreFailed: 'تعذّرت الاستعادة',
      restoreTitle: 'العودة إلى نقطة الاستعادة هذه؟',
      restoreBody: 'يُزال كل ما يلي هذا الموجّه من المحادثة، ويُعاد تشغيل الموجّه من هنا.',
      restoreConfirm: 'استعادة وإعادة تشغيل',
      restoreNext: 'استعادة نقطة الاستعادة التالية',
      goForward: 'التقدّم للأمام',
      sendEdited: 'إرسال الرسالة المعدّلة',
      attachingFile: 'جارٍ الإرفاق…',
      errorLayerBodies: {
        auth: 'رفضت خدمة الذكاء الاصطناعي تسجيل دخولك. تحقّق من بيانات اعتماد هذا المزوّد، ثم أرسل رسالتك مجددًا.',
        billing: 'لم يعد في حسابك رصيد لدى هذا المزوّد. اشحن رصيدك أو بدّل المزوّد، ثم أعد الإرسال.',
        disk: 'القرص ممتلئ، لذا تعذّر على Hermes حفظ هذه المحادثة. حرّر بعض المساحة ثم أعد المحاولة.',
        endpoint: 'تعذّر على Hermes الوصول إلى خادم النموذج المخصص. تأكد من أنه يعمل، ثم أرسل رسالتك مجددًا.',
        gateway: 'واجه Hermes مشكلة داخلية عند بدء هذا الرد. أرسل رسالتك مجددًا؛ وإذا تكرر ذلك، أرسل التشخيصات.',
        generic: 'حدث خطأ أثناء رد Hermes. أعد المحاولة، أو انسخ التفاصيل إذا تكررت المشكلة.',
        provider: 'تعذّر على خدمة الذكاء الاصطناعي إكمال هذا الطلب. أعد المحاولة بعد قليل أو بدّل المزوّد.',
        runtime: 'واجه Hermes مشكلة داخلية عند بدء هذا الرد. أرسل رسالتك مجددًا؛ وإذا تكرر ذلك، أرسل التشخيصات.',
        streaming: 'انقطع الاتصال قبل اكتمال الرد. أعد المحاولة لإرسال رسالتك مجددًا.'
      },
      errorAuthKinds: {
        api_key: {
          title: provider => `رفض ${provider} مفتاح API الخاص بك`,
          body: provider => `المفتاح المحفوظ لـ ${provider} غير صالح أو أُلغي. حدّثه ثم أعد المحاولة.`
        },
        oauth: {
          title: provider => `انتهت صلاحية تسجيل دخولك إلى ${provider}`
        }
      },
      errorDetails: 'التفاصيل',
      errorGenericProvider: 'خدمة الذكاء الاصطناعي',
      errorToastTitle: 'تعذّر على Hermes إنهاء الرد',
      errorLimitResets: time => `يُعاد ضبط الحد عند ${time}`,
      errorRetryAtReset: time => `أعد المحاولة عند إعادة ضبط الحد (${time})`,
      errorRetryScheduled: (time, wait) => `إعادة المحاولة عند ${time} — بعد ${wait}`,
      errorRetryScheduledCancel: 'إلغاء',
      errorChooseModel: 'اختيار نموذج',
      errorCompressConversation: 'ضغط المحادثة',
      errorCompressFailed: 'تعذّر ضغط المحادثة',
      errorOpenHermesFolder: 'فتح مجلد Hermes',
      errorOpenHermesFolderFailed: 'تعذّر فتح مجلد Hermes',
      errorUpdateApiKey: 'تحديث مفتاح API',
      errorSignInFreeTier: 'تسجيل الدخول بحساب Nous',
      errorRateLimitResetBody: (provider, time) => `بلغت حد الطلبات في ${provider}. يُعاد ضبطه عند ${time}.`,
      errorRetryAtResetShort: time => `إعادة المحاولة عند ${time}`,
      errorChooseModelLink: 'اختيار نموذج آخر',
      errorStartNewChatLink: 'بدء محادثة جديدة',
      errorOpenModelSettings: 'فتح إعدادات النموذج',
      errorSetupGuideLink: 'دليل الإعداد',
      errorOpenSetupGuide: 'فتح دليل الإعداد',
      errorOpenProviderSettings: provider => `فتح إعدادات ${provider}`,
      errorContinue: 'متابعة',
      errorCopyRaw: 'نسخ الخطأ',
      errorDetailsCopy: 'نسخ التفاصيل',
      errorHideDetails: 'إخفاء تفاصيل الخطأ'
    },
    approval: {
      gatewayDisconnected:
        'Hermes غير متصل الآن. لا يزال الأمر ينتظر إجابتك (حتى انتهاء مهلة الموافقة). أعد الاتصال، ثم أرسلها مرة أخرى.',
      sendFailed: 'تعذّر إرسال إجابتك',
      run: 'تشغيل',
      command: 'الأمر',
      commandDetails: 'تفاصيل الأمر',
      moreOptions: 'خيارات موافقة إضافية',
      allowSession: 'السماح في هذه الجلسة',
      alwaysAllowMenu: 'السماح دائمًا…',
      jumpToApproval: 'الموافقة مطلوبة',
      reject: 'رفض',
      alwaysTitle: 'السماح بهذا الأمر دائمًا؟',
      alwaysDescription: pattern =>
        `يضيف هذا النمط «${pattern}» إلى قائمة السماح الدائمة لديك (~/.hermes/config.yaml). لن يسألك Hermes مجددًا عن أوامر كهذه — في هذه الجلسة ولا في أي جلسة لاحقة.`,
      alwaysAllow: 'السماح دائمًا',
      reconnect: 'إعادة الاتصال',
      timedOutSystemLine:
        'انتهت مهلة الموافقة — لم يُشغَّل الأمر. اطلب من Hermes المحاولة مجددًا، أو ارفع الحد من الإعدادات ← الأمان ← مهلة الموافقة.',
      openSafetySettings: 'فتح إعدادات الأمان'
    },
    clarify: {
      notReady: 'طلب التوضيح غير جاهز بعد',
      gatewayDisconnected: 'Hermes غير متصل الآن. أعد الاتصال، ثم أرسلها مرة أخرى.',
      sendFailed: 'تعذّر إرسال ردك على طلب التوضيح',
      loadingQuestion: 'جارٍ تحميل السؤال…',
      other: 'غير ذلك (اكتب إجابتك)',
      placeholder: 'اكتب إجابتك…',
      skip: 'تخطٍّ',
      skipped: 'تم التخطي',
      noAnswer: 'لا توجد إجابة',
      notDelivered:
        'لم يصل هذا السؤال إلى التطبيق، لذا لا يمكن الإجابة عنه هنا. اضغط «إيقاف» لإنهاء الدور، ثم ردّ في المحادثة.',
      confirmAndContinueLabel: 'تأكيد ومتابعة',
      singleSelectHint: 'اختر واحدًا',
      multiSelectHint: 'حدد كل ما ينطبق',
      recommendedSuffix: ' (موصى به)',
      oneQuestion: 'سؤال واحد',
      questionProgress: (answered, total) => `تمت الإجابة عن ${answered} من ${total}`
    },
    themePicker: arThemePicker,
    mcpSetup: {
      installTitle: 'إضافة خوادم MCP',
      enableTitle: 'تفعيل خوادم MCP',
      authorizeTitle: 'تفويض خوادم MCP',
      installAction: 'تثبيت',
      enableAction: 'تفعيل',
      authorizeAction: 'تفويض',
      installed: server => `تم تثبيت ${server}`,
      enabled: server => `تم تفعيل ${server}`,
      authorized: server => `تم تفويض ${server}`,
      failed: server => `تعذّر إعداد ${server}`,
      toolCount: count =>
        AR_PLURAL(count, { one: 'أداة واحدة', two: 'أداتان', few: `${count} أدوات`, many: `${count} أداة` }),
      launchCommand: target => `يشغّل: ${target}`,
      launchRemote: target => `يتصل بـ: ${target}`,
      launchEnv: keys => `متغيرات البيئة: ${keys}`,
      launchCwd: dir => `مجلد العمل: ${dir}`,
      envRequired: 'املأ بيانات الاعتماد المطلوبة أولًا',
      sendFailed: 'تعذّر إرسال ردك على إعداد MCP',
      reloadFailed: 'تم حفظ الخادم، لكن تعذّرت إعادة تحميل أدوات MCP — ستُحمَّل في الجلسة التالية',
      gatewayDisconnected: 'Hermes غير متصل الآن. أعد الاتصال، ثم أرسله مرة أخرى.'
    },
    tool: {
      copyCode: 'نسخ الكود',
      renderingImage: 'جارٍ عرض الصورة...',
      copyOutput: 'نسخ المخرجات',
      copyCommand: 'نسخ الأمر',
      copyContent: 'نسخ المحتوى',
      copyUrl: 'نسخ الرابط',
      copyResults: 'نسخ النتائج',
      copyQuery: 'نسخ الاستعلام',
      copyFile: 'نسخ الملف',
      copyPath: 'نسخ المسار',
      outputAlt: 'مخرجات الأداة',
      rawResponse: 'الرد الخام',
      copyActivity: 'نسخ النشاط',
      toolPayload: 'حمولة الأداة',
      searchResults: 'نتائج البحث',
      recoveredOne: 'تم التعافي بعد فشل خطوة واحدة',
      recoveredMany: count =>
        AR_PLURAL(count, {
          one: 'تم التعافي بعد فشل خطوة واحدة',
          two: 'تم التعافي بعد فشل خطوتين',
          few: `تم التعافي بعد فشل ${count} خطوات`,
          many: `تم التعافي بعد فشل ${count} خطوة`
        }),
      failedOne: 'فشلت خطوة واحدة',
      failedMany: count =>
        AR_PLURAL(count, {
          one: 'فشلت خطوة واحدة',
          two: 'فشلت خطوتان',
          few: `فشلت ${count} خطوات`,
          many: `فشلت ${count} خطوة`
        }),
      statusRunning: 'قيد التشغيل',
      statusError: 'خطأ',
      statusRecovered: 'تم التعافي',
      statusDone: 'تم',
      memoryWriteNoted: 'سُجّلت محاولة الكتابة في الذاكرة',
      failedToWriteFile: detail => `تعذّرت كتابة الملف: ${detail}`,
      sensitiveSystemPathWriteRefused: path =>
        `رُفضت الكتابة إلى مسار نظام حساس: ${path}\nإذا كنت بحاجة إلى تعديل ملفات النظام، فاستخدم أداة الطرفية مع sudo.`,
      returnedError: 'أعادت الأداة خطأ.',
      returnedSuccessFalse: 'أعادت الأداة success=false.',
      returnedStatus: status => `أعادت الأداة الحالة «${status}».`,
      commandFailedWithExitCode: exitCode => `فشل تنفيذ الأمر برمز الخروج ${exitCode}.`,
      sessionKernelTimedOut: (timeoutSeconds, remote) =>
        `انتهت مهلة الخلية بعد ${timeoutSeconds} ث؛ أُنهيت نواة ${remote ? 'الجلسة البعيدة' : 'الجلسة'} وفُقدت حالتها. سيبدأ استدعاء execute_code التالي بنواة جديدة.`,
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
        analyze: {
          count: (count, live) =>
            `${live ? 'جارٍ تحليل' : 'تم تحليل'} ${AR_PLURAL(count, {
              one: 'صورة واحدة',
              two: 'صورتين',
              few: `${count} صور`,
              many: `${count} صورة`
            })}`,
          present: 'جارٍ التحليل',
          target: (target, live) => `${live ? 'جارٍ تحليل' : 'تم تحليل'} ${target}`
        },
        browse: {
          count: (count, live) =>
            `${live ? 'جارٍ فتح' : 'تم فتح'} ${AR_PLURAL(count, {
              one: 'صفحة واحدة',
              two: 'صفحتين',
              few: `${count} صفحات`,
              many: `${count} صفحة`
            })}`,
          present: 'جارٍ الفتح',
          target: (target, live) => `${live ? 'جارٍ فتح' : 'تم فتح'} ${target}`
        },
        delegate: {
          count: (count, live) =>
            `${live ? 'جارٍ تفويض' : 'تم تفويض'} ${AR_PLURAL(count, {
              one: 'مهمة واحدة',
              two: 'مهمتين',
              few: `${count} مهام`,
              many: `${count} مهمة`
            })}`,
          present: 'جارٍ التفويض',
          target: (target, live) => `${live ? 'جارٍ تفويض' : 'تم تفويض'} ${target}`
        },
        edit: {
          count: (count, live) =>
            `${live ? 'جارٍ تحرير' : 'تم تحرير'} ${AR_PLURAL(count, {
              one: 'ملف واحد',
              two: 'ملفين',
              few: `${count} ملفات`,
              many: `${count} ملفًا`,
              other: `${count} ملف`
            })}`,
          present: 'جارٍ التحرير',
          target: (target, live) => `${live ? 'جارٍ تحرير' : 'تم تحرير'} ${target}`
        },
        explore: {
          count: (count, live) =>
            `${live ? 'جارٍ استكشاف' : 'تم استكشاف'} ${AR_PLURAL(count, {
              one: 'ملف واحد',
              two: 'ملفين',
              few: `${count} ملفات`,
              many: `${count} ملفًا`,
              other: `${count} ملف`
            })}`,
          present: 'جارٍ الاستكشاف',
          target: (target, live) => `${live ? 'جارٍ استكشاف' : 'تم استكشاف'} ${target}`
        },
        interact: {
          count: (count, live) =>
            `${live ? 'جارٍ تنفيذ' : 'تم تنفيذ'} ${AR_PLURAL(count, {
              one: 'إجراء واحد في المتصفح',
              two: 'إجراءين في المتصفح',
              few: `${count} إجراءات في المتصفح`,
              many: `${count} إجراءً في المتصفح`,
              other: `${count} إجراء في المتصفح`
            })}`,
          present: 'جارٍ تنفيذ إجراء في المتصفح',
          target: (target, live) => `${live ? 'جارٍ تنفيذ' : 'تم تنفيذ'} ${target}`
        },
        other: {
          count: (count, live) =>
            `${live ? 'جارٍ استخدام' : 'تم استخدام'} ${AR_PLURAL(count, {
              one: 'أداة واحدة',
              two: 'أداتين',
              few: `${count} أدوات`,
              many: `${count} أداة`
            })}`,
          present: 'جارٍ استخدام أداة',
          target: (target, live) => `${live ? 'جارٍ استخدام' : 'تم استخدام'} ${target}`
        },
        read: {
          count: (count, live) =>
            `${live ? 'جارٍ قراءة' : 'تمت قراءة'} ${AR_PLURAL(count, {
              one: 'صفحة واحدة',
              two: 'صفحتين',
              few: `${count} صفحات`,
              many: `${count} صفحة`
            })}`,
          present: 'جارٍ القراءة',
          target: (target, live) => `${live ? 'جارٍ قراءة' : 'تمت قراءة'} ${target}`
        },
        run: {
          count: (count, live) =>
            `${live ? 'جارٍ تشغيل' : 'تم تشغيل'} ${AR_PLURAL(count, {
              one: 'أمر واحد',
              two: 'أمرين',
              few: `${count} أوامر`,
              many: `${count} أمرًا`,
              other: `${count} أمر`
            })}`,
          present: 'جارٍ التشغيل',
          target: (target, live) => `${live ? 'جارٍ تشغيل' : 'تم تشغيل'} ${target}`
        },
        search: {
          count: (count, live) =>
            `${live ? 'جارٍ إجراء' : 'تم إجراء'} ${AR_PLURAL(count, {
              one: 'عملية بحث واحدة',
              two: 'عمليتي بحث',
              few: `${count} عمليات بحث`,
              many: `${count} عملية بحث`
            })}`,
          present: 'جارٍ البحث',
          target: (target, live) => `${live ? 'جارٍ البحث عن' : 'تم البحث عن'} ${target}`
        },
        separator: '، '
      },
      actions: {
        read: 'تمت قراءة',
        reading: 'جارٍ قراءة',
        opened: 'تم فتح',
        opening: 'جارٍ فتح',
        failedToOpen: 'تعذّر فتح',
        searched: 'تم البحث عن',
        searching: 'جارٍ البحث عن',
        ran: 'تم تشغيل',
        running: 'جارٍ تشغيل',
        ranCode: 'تم تنفيذ الكود',
        runningCode: 'جارٍ تنفيذ الكود'
      },
      prefixes: {
        browser: 'المتصفح',
        web: 'الويب'
      },
      titleTemplates: {
        actionCommand: (action, command) => `${action} ${command}`,
        actionQuoted: (action, value) => `${action} «${value}»`,
        actionTarget: (action, target) => `${action} ${target}`,
        completedTool: action => `تم تشغيل ${action}`,
        prefixedDone: (prefix, action) => `${prefix} ${action}`,
        runningPrefixedTool: (prefix, action) => `جارٍ تشغيل ${prefix.toLowerCase()} ${action.toLowerCase()}`,
        runningTool: action => `جارٍ تشغيل ${action.toLowerCase()}`
      },
      // pendingAction is the part of `pending` that shimmers, so it stays a substring of it.
      titles: {
        browser_click: {
          done: 'تم النقر على عنصر في الصفحة',
          pending: 'جارٍ النقر على عنصر في الصفحة',
          pendingAction: 'جارٍ النقر'
        },
        browser_fill: {
          done: 'تم ملء حقل في النموذج',
          pending: 'جارٍ ملء حقل في النموذج',
          pendingAction: 'جارٍ ملء'
        },
        browser_navigate: {
          done: 'تم فتح الصفحة',
          pending: 'جارٍ فتح الصفحة',
          pendingAction: 'جارٍ فتح'
        },
        browser_snapshot: {
          done: 'تم التقاط لقطة للصفحة',
          pending: 'جارٍ التقاط لقطة للصفحة',
          pendingAction: 'جارٍ التقاط'
        },
        browser_take_screenshot: {
          done: 'تم التقاط لقطة شاشة',
          pending: 'جارٍ التقاط لقطة شاشة',
          pendingAction: 'جارٍ التقاط'
        },
        browser_type: {
          done: 'تمت الكتابة في الصفحة',
          pending: 'جارٍ الكتابة في الصفحة',
          pendingAction: 'جارٍ الكتابة'
        },
        clarify: {
          done: 'تم طرح سؤال',
          pending: 'جارٍ طرح سؤال',
          pendingAction: 'جارٍ طرح'
        },
        cronjob: {
          done: 'مهمة مجدولة',
          pending: 'جارٍ جدولة مهمة',
          pendingAction: 'جارٍ جدولة'
        },
        edit_file: {
          done: 'تم تحرير الملف',
          pending: 'جارٍ تحرير الملف',
          pendingAction: 'جارٍ تحرير'
        },
        execute_code: {
          done: 'تم تنفيذ الكود',
          pending: 'جارٍ تنفيذ الكود',
          pendingAction: 'جارٍ تنفيذ'
        },
        image_generate: {
          done: 'تم إنشاء الصورة',
          pending: 'جارٍ إنشاء الصورة',
          pendingAction: 'جارٍ إنشاء'
        },
        list_files: {
          done: 'تم سرد الملفات',
          pending: 'جارٍ سرد الملفات',
          pendingAction: 'جارٍ سرد'
        },
        memory: {
          done: 'تم الحفظ في الذاكرة',
          pending: 'جارٍ الحفظ في الذاكرة',
          pendingAction: 'جارٍ الحفظ'
        },
        patch: {
          done: 'تم تعديل الملف',
          pending: 'جارٍ تعديل الملف',
          pendingAction: 'جارٍ تعديل'
        },
        read_file: {
          done: 'تمت قراءة الملف',
          pending: 'جارٍ قراءة الملف',
          pendingAction: 'جارٍ قراءة'
        },
        search_files: {
          done: 'تم البحث في الملفات',
          pending: 'جارٍ البحث في الملفات',
          pendingAction: 'جارٍ البحث'
        },
        session_search_recall: {
          done: 'تم البحث في سجل الجلسات',
          pending: 'جارٍ البحث في سجل الجلسات',
          pendingAction: 'جارٍ البحث'
        },
        skill_view: {
          done: 'تم تحميل المهارة',
          pending: 'جارٍ تحميل المهارة',
          pendingAction: 'جارٍ تحميل'
        },
        terminal: {
          done: 'تم تشغيل الأمر',
          pending: 'جارٍ تشغيل الأمر',
          pendingAction: 'جارٍ تشغيل'
        },
        todo: {
          done: 'تم تحديث المهام',
          pending: 'جارٍ تحديث المهام',
          pendingAction: 'جارٍ تحديث'
        },
        vision_analyze: {
          done: 'تم تحليل الصورة',
          pending: 'جارٍ تحليل الصورة',
          pendingAction: 'جارٍ تحليل'
        },
        web_extract: {
          done: 'تمت قراءة صفحة الويب',
          pending: 'جارٍ قراءة صفحة الويب',
          pendingAction: 'جارٍ قراءة'
        },
        web_search: {
          done: 'تم البحث في الويب',
          pending: 'جارٍ البحث في الويب',
          pendingAction: 'جارٍ البحث'
        },
        write_file: {
          done: 'تم تحرير الملف',
          pending: 'جارٍ تحرير الملف',
          pendingAction: 'جارٍ تحرير'
        }
      },
      failedCalls: (count: number) =>
        AR_PLURAL(count, {
          one: 'فشل استدعاء أداة واحد',
          two: 'فشل استدعاءان للأدوات',
          few: `فشل ${count} استدعاءات للأدوات`,
          many: `فشل ${count} استدعاءً للأدوات`,
          other: `فشل ${count} استدعاء للأدوات`
        }),
      skillActivity: {
        loading: 'جارٍ تحميل المهارة',
        loaded: 'تم تحميل المهارة',
        loadFailed: 'تعذّر تحميل المهارة',
        readingResource: 'جارٍ قراءة مورد المهارة',
        readResource: 'تمت قراءة مورد المهارة',
        resourceFailed: 'تعذّرت قراءة مورد المهارة',
        listing: 'جارٍ سرد المهارات',
        listed: 'تم سرد المهارات',
        listFailed: 'تعذّر سرد المهارات',
        unavailable: 'نتيجة المهارة غير متاحة'
      },
      resultUnavailable: 'النتيجة غير متاحة',
      resultInterrupted: 'تمت المقاطعة'
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
      tier: { official: 'رسمي', verified: 'موثّق', community: 'مجتمعي' },
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
      requiresHermes: range => `Hermes ${range}`,
      envVar: name => `متغير البيئة ${name}`,
      credentialsHeading: 'بيانات الاعتماد',
      phase: {
        downloading: 'جارٍ التنزيل…',
        python_packages: 'جارٍ تثبيت حزم Python…',
        loading_tools: 'جارٍ تحميل أدواته…'
      },
      serverNotConnected: (server, reason) => `خادم MCP ${server} غير متصل${reason ? `: ${reason}` : ''}`,
      notEnabled: 'مثبّت لكنه غير مفعّل',
      missingEnv: names => `اضبط ${names} لإكمال الإعداد`,
      alreadyInstalled: 'مثبّت بالفعل؛ تُرك كما هو'
    }
  }
} satisfies Pick<TranslationOverrides, 'assistant'>
