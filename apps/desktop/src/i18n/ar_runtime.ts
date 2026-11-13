import type { TranslationOverrides } from './define-locale'

export const arRuntime = {
  runtimeErrors: {
    previewTargetUnavailable: (target: string) => `تعذّر فتح هدف المعاينة: ${target}`,
    desktopBridgeUnavailable: 'جسر سطح المكتب غير متاح',
    artifactWriteFailed: 'تعذّر كتابة ملف الناتج',
    previewBrowserBridgeUnavailable: 'جسر متصفح المعاينة في سطح المكتب غير متاح',
    remotePreviewLoadFailed: 'تعذّر تحميل معاينة HTML البعيدة',
    previewBufferBridgeUnavailable: 'جسر مخزن المعاينة في سطح المكتب غير متاح',
    remotePreviewStageFailed: 'تعذّر تجهيز معاينة HTML البعيدة',
    hermesDesktopBridgeUnavailable: 'جسر Hermes Desktop غير متاح',
    savingUnavailable: 'الحفظ غير متاح',
    renameUnavailable: 'إعادة التسمية غير متاحة',
    deleteUnavailable: 'الحذف غير متاح',
    gatewayFilePathMissing: 'مسار ملف البوابة مفقود',
    fileDownloadBridgeUnavailable: 'جسر تنزيل الملفات في سطح المكتب غير متاح',
    attachmentReadFailed: (label: string) => `تعذّرت قراءة ${label}`,
    noActiveSessionToRestore: 'لا توجد جلسة نشطة لاستعادتها.',
    restoreMessageNotFound: 'تعذّر العثور على الرسالة المراد استعادتها.',
    restoreEmptyMessage: 'لا يمكن استعادة رسالة فارغة.',
    restoreUnavailableForMessage: 'الاستعادة غير متاحة لهذه الرسالة.',
    newSessionMissingId: 'لم تُعد الجلسة الجديدة معرّفًا مخزّنًا.',
    quickEntryDestinationChanged: (drift: string) => `تغيّرت وجهة الإدخال السريع أثناء الإنشاء: ${drift}`,
    noActiveSessionForRestart: 'لا توجد جلسة نشطة لإعادة التشغيل في الخلفية',
    backgroundRestartNoTaskId: 'لم تُعد إعادة التشغيل في الخلفية معرّف مهمة',
    gatewayNotConnected: 'بوابة Hermes غير متصلة',
    gatewayUnavailable: 'بوابة Hermes غير متاحة',
    gatewayNotConnectedShort: 'البوابة غير متصلة',
    gatewayDisconnected: 'انقطع اتصال البوابة',
    backendReconnecting: (profile: string) => `الخلفية الخاصة بـ "${profile}" تعيد الاتصال؛ أعد المحاولة بعد أن تستقر.`,
    gatewayUnavailableForProfile: (profile: string) => `بوابة Hermes غير متاحة للملف الشخصي "${profile}"`,
    registryDialUnsupported: 'لا يمكن لإصدار سطح المكتب هذا الاتصال باتصالات السجل. حدّث Hermes Desktop.',
    sessionControlGatewayUnavailable: 'بوابة التحكم في الجلسة غير متاحة',
    profileChangedWhileConnecting: 'تغيّر ملف Hermes الشخصي النشط أثناء الاتصال',
    connectionNotActive: (label: string) => `لم يصبح الاتصال "${label}" نشطًا.`,
    connectionTimedOut: (label: string) => `انتهت مهلة الاتصال بـ "${label}".`,
    profileConnectTimedOut: (profile: string) => `انتهت مهلة الاتصال بالملف الشخصي "${profile}"`,
    profileWsUrlTimedOut: (profile: string) =>
      `انتهت مهلة تجديد عنوان WebSocket الخاص بالبوابة للملف الشخصي "${profile}"`,
    gatewayWsUrlTimedOut: 'انتهت مهلة الحصول على عنوان WebSocket الخاص بالبوابة',
    gatewayWsUrlRemintTimedOut: 'انتهت مهلة تجديد عنوان WebSocket الخاص بالبوابة',
    unexpectedGatewayWsPath: (path: string) => `مسار WebSocket غير متوقع للبوابة: ${path}`,
    defaultProfileUnsupported: 'لا يمكن لإصدار سطح المكتب هذا حفظ ملف شخصي افتراضي.',
    clipboardUnavailable: 'واجهة الحافظة غير متاحة',
    pluginFolderUnavailable: 'مجلد إضافات سطح المكتب غير متاح. أعد المحاولة قبل بدء البناء الأول.',
    manifestMinContextInvalid: 'يجب أن يكون الحد الأدنى لنافذة السياق رقمًا أو فارغًا',
    manifestToolsNotList: 'يجب أن تكون tools قائمة',
    manifestToolAutoInstall: (index: number) => `لا يمكن للأداة ${index} طلب التثبيت التلقائي`,
    manifestPluginsNotList: 'يجب أن تكون plugins قائمة',
    manifestSchemaUnsupported: 'إصدار مخطط البيان 1 هو الوحيد المدعوم',
    mcpDocNotObject: 'المتوقع كائن JSON',
    mcpDocNeedsName: 'لفّ الخادم داخل {"mcpServers": {"name": …}} ليكون له اسم',
    transcriptionTimedOut: (seconds: number, provider: string) =>
      `انتهت مهلة النسخ النصي بعد ${seconds} ثانية (لم يستجب ${provider})`,
    sttHttpError: (status: number, detail: string) => `خطأ ElevenLabs STT (HTTP ${status}): ${detail}`,
    ttsHttpError: (status: number, detail: string) => `خطأ ElevenLabs TTS (HTTP ${status}): ${detail}`,
    pluginIdentifierRequired: 'معرّف الإضافة مطلوب.',
    pluginIdentifierInvalid: 'معرّف الإضافة غير صالح.',
    mcpOauthCallbackUnsupported: 'حدّث Hermes Desktop لدعم استدعاءات MCP OAuth الراجعة.',
    mcpOauthTimedOut: 'انتهت مهلة انتظار تفويض MCP OAuth',
    audioContextUnavailable: 'AudioContext غير متاح لالتقاط الإيقاظ من جهة العميل',
    connectionBridgeUnavailable: 'جسر اتصال Hermes Desktop غير متاح',
    builtinProviderId: (id: string, suggestion: string) =>
      `'${id}' هو معرّف مزوّد مضمّن. اختر معرّفًا آخر لنقطة النهاية هذه (مثل '${suggestion}').`,
    sharedProviderEndpoint: (id: string) =>
      `'${id}' مشترك من الملف الشخصي الافتراضي. عدّله هناك، أو أوقف مشاركة المزوّدين في هذا الملف الشخصي أولًا.`,
    sharedEndpointPinned: (id: string, profiles: string) =>
      `'${id}' هو مزوّد النموذج للملفات الشخصية المشارِكة ${profiles}. أعد توجيهها (أو أوقف مشاركة المزوّدين هناك) قبل حذفه.`,
    sharedProviderAccount: (id: string) =>
      `'${id}' مسجَّل الدخول من الملف الشخصي الافتراضي. سجّل الخروج هناك، أو سجّل الدخول في هذا الملف الشخصي أولًا.`,
    backendConnectTimedOut: (seconds: null | number) =>
      seconds === null
        ? 'انتهت مهلة الاتصال بخدمة Hermes الخلفية.'
        : `انتهت مهلة الاتصال بخدمة Hermes الخلفية بعد ${seconds} ث.`,
    desktopQuitting: 'جارٍ إنهاء Hermes Desktop.',
    sshBootstrapCancelledByQuit: 'أُلغي إعداد اتصال SSH لأنه جارٍ إنهاء Hermes Desktop.',
    imageCopyNoDimensions: 'لا تملك الصورة أبعادًا يمكن نسخها',
    imageCopyCanvasUnavailable: 'سياق Canvas 2D غير متاح',
    imageCopyEncodeFailed: 'تعذّر ترميز الصورة بصيغة PNG',
    imageCopyDecodeFailed: 'تعذّر فك ترميز الصورة لنسخها إلى الحافظة',
    imageCopyFetchFailed: (status: number) => `تعذّر جلب الصورة (${status})`,
    imageCopyNeedsSecureContext: 'يتطلب نسخ الصور إلى الحافظة سياقًا آمنًا (HTTPS)'
  },
  sharedProviders: {
    badge: 'مشترك من الملف الشخصي الرئيسي',
    editInMain: 'التعديل في الملف الشخصي الرئيسي',
    endpointHint:
      'نقطة النهاية هذه مشتركة من الملف الشخصي الرئيسي وتُعدَّل هناك، ولا يزال بإمكان هذا الملف الشخصي استخدامها.',
    keyHint: 'هذا المفتاح مشترك من الملف الشخصي الرئيسي ويُعدَّل هناك.',
    accountBadge: 'مسجَّل الدخول من الملف الشخصي الرئيسي',
    accountHint:
      'تسجيل الدخول هذا تابع للملف الشخصي الرئيسي؛ سجّل الخروج من هناك. أما تسجيل الدخول هنا فيمنح هذا الملف الشخصي حسابه الخاص، فلا يعود يتبع الملف الشخصي الرئيسي.'
  }
} satisfies Pick<TranslationOverrides, 'runtimeErrors' | 'sharedProviders'>
