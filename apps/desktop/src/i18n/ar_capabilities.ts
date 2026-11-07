import { arPluginUpdateAll } from './ar_plugin_update_all'
import { AR_PLURAL } from './ar_plural'
import type { TranslationOverrides } from './define-locale'

export const arCapabilities = {
  skillDeepLink: {
    installTitle: (name: string) => `تثبيت «${name}»؟`,
    installDescription: 'ستتوفر هذه المهارة في الجلسات الجديدة. ثبّت من المصادر التي تثق بها فقط.',
    installTo: 'التثبيت في',
    thisComputer: 'هذا الجهاز',
    installing: 'جارٍ التثبيت…',
    installComplete: (name: string) => `تم تثبيت «${name}»`,
    destinationChanged: 'تغيّرت وجهة التثبيت. أغلق مربع الحوار هذا وافتح رابط التثبيت مجددًا.',
    installed: 'تم التثبيت',
    source: 'المصدر'
  },
  skills: {
    tabSkills: 'المهارات',
    tabToolsets: 'الأدوات',
    configuringProfile: 'إعداد الملف الشخصي:',
    tabMcp: 'MCP',
    all: 'الكل',
    searchSkills: 'البحث في المهارات...',
    searchToolsets: 'البحث في الأدوات...',
    refresh: 'تحديث',
    lock: 'قفل',
    locked: 'مقفلة',
    lockHint: 'لا يمكن للوكيل تغيير هذه المهارة ما دامت مقفلة. لا يزال بإمكانك تعديلها بنفسك.',
    unlockedHint: 'اقفلها لمنع الوكيل من تغيير هذه المهارة. لا يزال بإمكانك تعديلها بنفسك.',
    refreshing: 'جارٍ تحديث المهارات',
    loading: 'جارٍ تحميل القدرات...',
    noSkillsTitle: 'لم يُعثر على مهارات',
    noSkillsDesc: 'جرّب بحثًا أوسع أو فئة أخرى.',
    noToolsetsTitle: 'لم يُعثر على مجموعات أدوات',
    noToolsetsDesc: 'جرّب عبارة بحث أوسع.',
    noDescription: 'لا يوجد وصف.',
    configured: 'مضبوط',
    needsKeys: 'تحتاج إلى مفاتيح',
    visionModelHint:
      'تستخدم الرؤية إعدادات النماذج المساعدة — يُختار النموذج القادر على معالجة الصور هناك، لا لكل مزوّد هنا.',
    visionModelLink: 'اختر نموذج الرؤية في الإعدادات ← النموذج',
    toolsetsEnabled: (enabled, total) => `مجموعات الأدوات المفعّلة: ${enabled}/${total}`,
    configureToolset: label => `ضبط ${label}`,
    toggleToolset: (label, enabled) => `${enabled ? 'تفعيل' : 'تعطيل'} مجموعة الأدوات ${label}`,
    toolsCount: count =>
      AR_PLURAL(count, { one: 'أداة واحدة', two: 'أداتان', few: `${count} أدوات`, many: `${count} أداة` }),
    skillsLoadFailed: 'فشل تحميل المهارات',
    toolsetsRefreshFailed: 'فشل تحديث مجموعات الأدوات',
    skillEnabled: 'تم تفعيل المهارة',
    skillDisabled: 'تم تعطيل المهارة',
    toolsetEnabled: 'تم تفعيل مجموعة الأدوات',
    toolsetDisabled: 'تم تعطيل مجموعة الأدوات',
    appliesToNewSessions: name => `تسري تعديلات ${name} على الجلسات الجديدة.`,
    failedToUpdate: name => `تعذّر تحديث ${name}`,
    sortMostUsed: 'الأكثر استخدامًا',
    sortAlpha: 'A–Z',
    sortMostUsedDesc: '↓ الأكثر استخدامًا',
    sortLeastUsedAsc: '↑ الأقل استخدامًا',
    enableAll: 'تفعيل الكل',
    disableAll: 'تعطيل الكل',
    disableUnused: 'تعطيل غير المستخدمة',
    bulkUpdated: count =>
      AR_PLURAL(count, {
        one: 'تم تحديث عنصر واحد للجلسات الجديدة.',
        two: 'تم تحديث عنصرين للجلسات الجديدة.',
        few: `تم تحديث ${count} عناصر للجلسات الجديدة.`,
        many: `تم تحديث ${count} عنصرًا للجلسات الجديدة.`,
        other: `تم تحديث ${count} عنصر للجلسات الجديدة.`
      }),
    bulkNoChange: 'لا شيء للتغيير.',
    usageCount: count =>
      AR_PLURAL(count, {
        one: 'استُخدمت مرة واحدة',
        two: 'استُخدمت مرتين',
        few: `استُخدمت ${count} مرات`,
        many: `استُخدمت ${count} مرة`
      }),
    provenance: {
      agent: 'مكتسبة',
      bundled: 'مضمّنة',
      hub: 'المركز'
    },
    // CapabilityEmpty passes its noun as the English literal "tools".
    emptyNoneFound: noun => `لم يُعثر على ${noun === 'tools' ? 'أدوات' : noun}`,
    emptyNothingMatches: query => `لا شيء يطابق «${query}».`,
    emptyNoneAvailable: noun => `لا توجد ${noun === 'tools' ? 'أدوات' : noun} متاحة بعد.`,
    changesApplyNewSessions: 'تسري التغييرات على الجلسات الجديدة.',
    skillUpdated: 'تم تحديث المهارة',
    edit: 'تحرير',
    archive: 'أرشفة',
    archiveSkillTitle: name => `أرشفة ${name}؟`,
    archiveSkillDescription: 'تُؤرشف المهارة ويمكن استعادتها باستخدام `hermes curator restore`.',
    skillArchivedTitle: 'تمت أرشفة المهارة',
    skillArchivedMessage: 'يمكن استعادتها باستخدام hermes curator restore.',
    tabPlugins: 'الإضافات',
    plugins: {
      ...arPluginUpdateAll,
      agentTitle: 'إضافات الوكيل',
      agentBlurb:
        'وسّع قدرات الوكيل في الملف الشخصي المحدد — أدوات وخطافات ومزوّدون. تسري التغييرات بعد إعادة تشغيل البوابة.',
      pageBlurb: 'يمكن للإضافة أن توسّع هذا التطبيق أو الوكيل أو كليهما — ولكل جزء مفتاح تشغيل خاص به.',
      halfDesktop: 'تطبيق سطح المكتب',
      halfDesktopHint: 'هذا التطبيق، وهو نفسه في كل الملفات الشخصية',
      halfAgent: 'الوكيل',
      halfAgentIn: (profile: string) => `الوكيل في ${profile}`,
      defaultProfile: 'Hermes (افتراضي)',
      kindAgent: 'الوكيل',
      kindDesktop: 'تطبيق سطح المكتب',
      kindBoth: 'الوكيل + تطبيق سطح المكتب',
      installAgentHere: 'التثبيت هنا',
      installAgentHereTip: (profile: string) =>
        `جزء تطبيق سطح المكتب محمَّل في هذا التطبيق، لكن جزء الوكيل غير مثبّت في ${profile}. ثبّته هناك.`,
      installAgentHereNoOrigin:
        'جزء الوكيل غير مثبّت في هذا الملف الشخصي، وقد نُسخت هذه الحزمة يدويًا (لا إدخال لها في الكتالوج ولا مستودع Git بعيد)، لذا لا يمكن تثبيته من هنا. انسخ مجلدها إلى الملف الشخصي أو أعد تثبيتها من Git.',
      desktopHalfPending: 'جارٍ النسخ…',
      desktopHalfPendingTip:
        'تتضمن هذه الحزمة جزءًا لتطبيق سطح المكتب لم يُنسخ إلى التطبيق بعد. استخدم «إعادة الفحص» أو أعد تشغيل التطبيق.',
      emptyAll: 'لا توجد إضافات بعد.',
      empty: 'لا توجد إضافات وكيل مثبّتة في هذا الملف الشخصي.',
      emptyHint: 'تصفّح الكتالوج أدناه وثبّت إضافة تمت مراجعتها بنقرة واحدة.',
      loadFailed: 'تعذّر تحميل إضافات الوكيل',
      toggleFailed: (name: string) => `تعذّر تبديل حالة ${name}`,
      legacyBackend:
        'هذه الواجهة الخلفية أقدم من دعم تبديل الإضافات بمعرّفاتها — حدّث Hermes لإدارة هذه الإضافة من هنا.',
      portableBadge: 'محمولة',
      bundledNames: {},
      bundledDescriptions: {},
      sourceLabels: {
        bundled: 'مضمّنة',
        user: 'المستخدم',
        git: 'Git',
        project: 'المشروع',
        entrypoint: 'نقطة الدخول'
      },
      alreadyInstalled: (name: string) => `${name} مثبّت بالفعل في هذا الملف الشخصي.`,
      catalogProvenance: (sha: string) => `ثُبّتت من كتالوج Hermes${sha ? ` عند الإيداع ${sha}` : ''}.`,
      pinnedProvenance: (sha: string) =>
        `مقيّدة بالإيداع ${sha}. تُرفض التحديثات إلى أن يُعاد تثبيتها مقيّدةً بإيداع جديد.`,
      pinnedBadge: (sha: string) => `مقيّدة @ ${sha}`,
      updateToPin: (sha: string) => `تحديث إلى ${sha}`,
      updateFailed: (name: string) => `تعذّر تحديث ${name}`,
      updated: (name: string) => `تم تحديث ${name} إلى إيداع الكتالوج الحالي. أعد تشغيل البوابة لتطبيق التحديث.`,
      desktopHalfRemote: 'غير متاح (واجهة خلفية بعيدة)',
      desktopHalfRemoteTip:
        'جزء تطبيق سطح المكتب في هذه الحزمة موجود على قرص الواجهة الخلفية البعيدة، ولا يستطيع هذا التطبيق قراءته. لاستخدامه هنا، شغّل «التثبيت من Git» بعنوان URL لمستودع الحزمة مع تحديد هدف تطبيق سطح المكتب — فيُستنسخ جزء تطبيق سطح المكتب إلى هذا الجهاز.',
      updateConsentTitle: (name: string) => `${name} يطلب إمكانات إضافية`,
      updateConsentBody: (name: string, sha: string) =>
        `يضيف الإيداع الجديد لـ ${name} في الكتالوج (${sha}) إمكانات لا يملكها الإصدار المثبّت. لا تطبّقه إلا إذا كنت تثق بها:`,
      updateConsentConfirm: 'تطبيق التحديث',
      uninstall: 'إلغاء التثبيت',
      uninstallTip: (name: string, profile: string) => `إلغاء تثبيت ${name} من ${profile}`,
      uninstallConfirmTitle: (name: string) => `إلغاء تثبيت ${name}؟`,
      uninstallConfirmBody: (name: string, profile: string) =>
        `يحذف هذا ملفات الإضافة من الملف الشخصي ${profile}، ويُزال معها أي جزء لتطبيق سطح المكتب كانت تتضمنه. يمكنك إعادة تثبيتها من الكتالوج أو من Git في أي وقت.`,
      uninstallFailed: (name: string) => `تعذّر إلغاء تثبيت ${name}`,
      uninstalled: (name: string) => `تم إلغاء تثبيت ${name}. أعد تشغيل البوابة لإلغاء تحميله.`,
      uninstallDesktopTip: (name: string) => `إلغاء تثبيت ${name} من هذا التطبيق`,
      uninstallDesktopConfirmBody: (name: string) =>
        `يحذف هذا ${name} من مجلد desktop-plugins على هذا الجهاز ويُلغي تحميله الآن. يمكنك إعادة تثبيته من Git أو إعادة المجلد إلى مكانه في أي وقت.`,
      uninstalledDesktop: (name: string) => `تم إلغاء تثبيت ${name}.`,
      deepLinkErrorTitle: 'رُفض رابط تثبيت الإضافة',
      deepLinkCatalogInvalidName: 'اسم الكتالوج في الرابط مفقود أو غير صالح.',
      deepLinkCatalogUnknown: (name: string) => `«${name}» غير موجود في كتالوج إضافات Hermes. لم يُثبَّت أي شيء.`,
      deepLinkCatalogUnavailable: 'تعذّر تحميل كتالوج إضافات Hermes. تحقّق من اتصالك وافتح الرابط مرة أخرى.',
      settingsToggle: (name: string) => `إعدادات ${name}`,
      settingsForm: {
        save: 'حفظ الإعدادات',
        saved: (name: string) => `تم حفظ إعدادات ${name}.`,
        saveFailed: (name: string) => `تعذّر حفظ إعدادات ${name}`,
        required: 'مطلوب',
        secretSet: '•••••••• (مضبوط)',
        secretStoredAs: (env: string) =>
          `تُحفظ في ملف .env الخاص بالملف الشخصي باسم ${env}، ولا تُحفظ أبداً في config.yaml؛ اتركها فارغة للاحتفاظ بالقيمة الحالية.`
      },
      folderAccess: {
        title: 'الوصول إلى المجلدات',
        hint: (name: string) => `يمكن لـ ${name} قراءة الملفات وتعديلها في هذه المجلدات. يسري الإلغاء فورًا.`,
        revoke: 'إلغاء',
        revokeLabel: (path: string) => `إلغاء الوصول إلى ${path}`,
        revoked: (name: string, path: string) => `لم يعد بإمكان ${name} استخدام ${path}.`,
        revokeFailed: (name: string) => `تعذر إلغاء وصول ${name} إلى المجلدات`,
        pickerTitle: (name: string) => `اختر مجلدًا لـ ${name}`,
        pickerButton: 'السماح بالوصول',
        refusedProtected: (name: string) =>
          `لا يمكن لـ ${name} استخدام هذا المجلد: فهو يحتوي على إعدادات Hermes أو مفاتيحه أو بيانات الإضافات. اختر مجلدًا لا يحتويها.`,
        loadFailed: (name: string) => `تعذّر تحميل المجلدات المشتركة مع ${name}.`
      },
      previewScriptRevokeUnsaved: (plugin: string, origin: string) =>
        `تعذّر حفظ هذا التغيير، لذا يسري فقط حتى إعادة تشغيل Hermes. ${plugin} محظور على ${origin} في الوقت الحالي.`,
      previewScriptRevoked: (plugin: string, origin: string) =>
        `لم يعد بإمكان ${plugin} تشغيل نصوص برمجية على ${origin}.`,
      previewScriptRevoke: (origin: string) => `إلغاء الوصول إلى ${origin}`,
      previewScriptAccessNone: 'يسأل قبل تشغيل النصوص البرمجية على أي صفحة',
      previewScriptAccessLabel: 'نصوص الصفحة',
      previewScriptDeny: 'عدم السماح',
      previewScriptAllow: 'السماح على هذا الموقع',
      previewScriptPromptRevokeHint: 'ينطبق على هذا الموقع فقط. يمكنك إلغاؤه من المهارات ← الإضافات.',
      previewScriptPromptRisk:
        'يمكن للنصوص البرمجية قراءة كل شيء على ذلك الموقع وتغييره، بما في ذلك صفحات الحسابات التي سجّلت الدخول إليها هناك.',
      previewScriptPromptBody: (plugin: string, origin: string) =>
        `يريد ${plugin} تشغيل JavaScript في متصفح المعاينة على ${origin}.`,
      previewScriptPromptTitle: (plugin: string) => `هل تسمح لـ ${plugin} بتشغيل نصوص برمجية على هذه الصفحة؟`
    },
    officialCatalog: 'متاح للتثبيت',
    officialPill: 'رسمية',
    hub: {
      searchPlaceholder: 'ابحث في مركز المهارات',
      search: 'بحث',
      searching: 'جارٍ البحث...',
      connectingHubs: 'جارٍ الاتصال بمراكز المهارات...',
      connectedHubs: 'المراكز المتصلة:',
      featured: 'المهارات المميزة',
      landingHint: 'ابحث في المركز لتصفّح المهارات القابلة للتثبيت من الفهرس الرسمي ومن GitHub ومن مصادر المجتمع.',
      noResults: 'لا توجد مهارات مطابقة في المركز.',
      resultCount: (count, ms) =>
        `${AR_PLURAL(count, { one: 'نتيجة واحدة', two: 'نتيجتان', few: `${count} نتائج`, many: `${count} نتيجة` })}${ms !== null ? ` خلال ${ms} مللي ثانية` : ''}`,
      timedOut: sources => `انتهت المهلة: ${sources}`,
      installed: 'مثبّتة',
      install: 'تثبيت',
      installing: 'جارٍ التثبيت...',
      uninstall: 'إلغاء التثبيت',
      uninstalling: 'جارٍ إلغاء التثبيت...',
      updateAll: 'تحديث المهارات المثبّتة',
      updating: 'جارٍ التحديث...',
      preview: 'معاينة',
      scan: 'فحص',
      scanning: 'جارٍ الفحص...',
      close: 'إغلاق',
      files: 'ملفات',
      noReadme: 'لا تحتوي هذه المهارة على معاينة لملف SKILL.md.',
      trust: {
        builtin: 'مضمّنة',
        trusted: 'موثوقة',
        community: 'مجتمعية'
      },
      verdictSafe: 'آمن',
      verdictCaution: 'تحذير',
      verdictDangerous: 'خطير',
      policyAllow: 'التثبيت مسموح',
      policyAsk: 'المراجعة مطلوبة قبل التثبيت',
      policyBlock: 'التثبيت محظور بموجب السياسة',
      findings: count =>
        AR_PLURAL(count, { one: 'ملاحظة واحدة', two: 'ملاحظتان', few: `${count} ملاحظات`, many: `${count} ملاحظة` }),
      noFindings: 'لا توجد ملاحظات أمنية.',
      installStarted: name => `جارٍ تثبيت ${name}...`,
      uninstallStarted: name => `جارٍ إلغاء تثبيت ${name}...`,
      updateStarted: 'جارٍ تحديث المهارات المثبّتة...',
      actionFailed: 'فشل إجراء المهارة',
      actionLog: 'سجل الإجراءات',
      alreadyInstalled: (name: string) => `«${name}» مثبّت بالفعل`,
      pickerTitle: 'مركز المهارات',
      pickerBrowse: 'تصفّح المركز كاملًا',
      pickerHide: 'إخفاء متصفح المركز',
      pickerHint: 'انقر «+» على أي مهارة — تُثبَّت وتظهر في القائمة أعلاه.',
      loadFailed: 'فشل تحميل مركز المهارات',
      previewFailed: 'فشلت معاينة المهارة',
      scanFailed: 'فشل الفحص الأمني',
      searchFailed: 'فشل البحث في المركز',
      installBlockedTitle: name => `تعذّر تثبيت ${name}`,
      installBlockedMessage: (findings, unverified) =>
        `رصد الفحص الأمني ${findings > 0 ? AR_PLURAL(findings, { one: 'عنصرًا واحدًا', two: 'عنصرين', few: `${findings} عناصر`, many: `${findings} عنصرًا`, other: `${findings} عنصر` }) : 'أنماطًا خطرة'} للمراجعة${unverified ? '، والمهارة من مصدر غير موثّق' : ''}. اطّلع على نتيجة الفحص قبل أن تقرر ما إذا كنت تثق بمؤلفها.`,
      viewScan: 'عرض الفحص',
      openLog: 'فتح السجل'
    },
    toolsetDescriptions: {
      a2a: 'دعم بروتوكول A2A (Agent-to-Agent) الإصدار 1.0 في Hermes Agent للاتصال ثنائي الاتجاه بين الوكلاء وفق معيار Linux Foundation المفتوح. تكتشف أدوات الإرسال النظراء وتجلب Agent Card وترسل مهام JSON-RPC، بينما يعرض محول الاستقبال Hermes عبر /.well-known/agent-card.json ويوجه المهام إلى جلسة البوابة المباشرة بكامل الذاكرة والسياق. عند عدم إعداد رمز مصادقة Bearer يقتصر الربط على localhost، مع ترشيح النص الوارد وتنظيف بيانات الاعتماد الصادرة وتسجيل التبادلات في سجل تدقيق خارج ضغط السياق. يعتمد على مكتبة Python القياسية فقط ولا يحتاج إلى a2a-sdk.',
      stt: 'تحويل الصوت إلى نص (الرسائل الصوتية عبر البوابة + الوضع الصوتي)'
    },
    toolsetLabels: {
      stt: 'تحويل الكلام إلى نص'
    }
  },
  starmap: {
    title: 'خريطة الذاكرة',
    subtitle: (nodes, clusters) =>
      `${AR_PLURAL(nodes, { one: 'مهارة واحدة', two: 'مهارتان', few: `${nodes} مهارات`, many: `${nodes} مهارة` })} في ${AR_PLURAL(clusters, { one: 'فئة واحدة', two: 'فئتين', few: `${clusters} فئات`, many: `${clusters} فئة` })}`,
    close: 'إغلاق خريطة الذاكرة',
    refresh: 'تحديث',
    memory: 'ذاكرة',
    skill: 'مهارة',
    pauseTimeline: 'إيقاف الخط الزمني مؤقتاً',
    playTimeline: 'تشغيل الخط الزمني',
    timelineScrubber: 'شريط تمرير الخط الزمني',
    ageLegend: 'المركز = الأقدم · الأطراف = الأحدث',
    editNode: kind => `تحرير ${kind === 'memory' ? 'الذاكرة' : 'المهارة'}…`,
    archiveSkill: 'أرشفة المهارة',
    deleteMemory: 'حذف الذاكرة',
    editTitle: label => `تحرير ${label}`,
    deleteTitle: label => `حذف ${label}؟`,
    deleteMemoryDescription: 'ستُحذف هذه الذاكرة نهائياً.',
    filterAll: 'الكل',
    filterUsed: 'المستخدمة',
    filterLearned: 'المكتسبة',
    viewGraph: 'المخطط',
    loadFailed: 'تعذّر تحميل خريطة الذاكرة',
    loading: 'جارٍ التحميل…',
    emptyTitle: 'لم يتعلّم Hermes شيئًا بعد',
    emptyDesc: 'ستظهر هنا المهارات والذكريات التي ينشئها Hermes لعملك.',
    share: 'مشاركة الخريطة',
    shareHint:
      'انسخ الرمز لمشاركة هذه الخريطة، أو الصق رمزًا لتحميله. يتضمن الرمز التخطيط فقط، لا ذاكرتك ولا نصوص مهاراتك.',
    shareTitle: 'استيراد / تصدير الخريطة',
    sharePlaceholder: 'الصق رمز خريطة…',
    copy: 'نسخ رمز الخريطة',
    copied: 'تم النسخ!',
    importMap: 'استيراد خريطة',
    importBtn: 'تحميل',
    importEmpty: 'الصق رمز خريطة لتحميله.',
    importSuccess: nodes =>
      `تم تحميل خريطة تضم ${AR_PLURAL(nodes, { one: 'عقدة واحدة', two: 'عقدتين', few: `${nodes} عُقد`, many: `${nodes} عقدة` })}.`,
    importedBadge: 'الخريطة المستوردة',
    resetToMine: 'العودة إلى خريطتي'
  },
  agents: {
    extendedTranscript: 'سجل موسّع',
    transcriptTruncated: 'يُعرض آخر 16 كيلوبايت',
    transcriptUnavailable: 'السجل المباشر غير متاح',
    close: 'إغلاق الوكلاء',
    title: 'شجرة الوكلاء',
    subtitle: 'نشاط الوكلاء الفرعيين المباشر للدور الحالي.',
    emptyTitle: 'لا يوجد وكلاء فرعيون نشطون',
    emptyDesc: 'عندما يفوّض دورٌ ما عملًا، يعرض الوكلاء الفرعيون تقدّمهم هنا مباشرةً.',
    running: 'قيد التشغيل',
    failed: 'فشل',
    done: 'تم',
    streaming: 'جارٍ البث',
    files: 'الملفات',
    moreFiles: count =>
      AR_PLURAL(count, {
        one: '+ملف آخر',
        two: '+ملفان آخران',
        few: `+${count} ملفات أخرى`,
        many: `+${count} ملفًا آخر`,
        other: `+${count} ملف آخر`
      }),
    moreAgents: count =>
      AR_PLURAL(count, {
        one: '+وكيل آخر',
        two: '+وكيلان آخران',
        few: `+${count} وكلاء آخرين`,
        many: `+${count} وكيلًا آخر`,
        other: `+${count} وكيل آخر`
      }),
    queued: 'في قائمة الانتظار',
    waitingActivity: 'بانتظار النشاط',
    steer: 'توجيه',
    steerPlaceholder: 'تعليمات لهذا الوكيل الفرعي',
    steerQueued: 'في انتظار نقطة التحقق التالية',
    stopRequested: 'تم طلب الإيقاف',
    requestRejected: 'لم يقبل الوكيل الفرعي الطلب',
    delegation: index => `التفويض ${index}`,
    workers: count =>
      AR_PLURAL(count, {
        one: 'عامل واحد',
        two: 'عاملان',
        few: `${count} عمّال`,
        many: `${count} عاملًا`,
        other: `${count} عامل`
      }),
    workersActive: count => `${count} نشط`,
    agentsCount: count =>
      AR_PLURAL(count, {
        one: 'وكيل واحد',
        two: 'وكيلان',
        few: `${count} وكلاء`,
        many: `${count} وكيلًا`,
        other: `${count} وكيل`
      }),
    activeCount: count => `${count} نشط`,
    failedCount: count => `${count} فشل`,
    toolsCount: count =>
      AR_PLURAL(count, { one: 'أداة واحدة', two: 'أداتان', few: `${count} أدوات`, many: `${count} أداة` }),
    filesCount: count =>
      AR_PLURAL(count, {
        one: 'ملف واحد',
        two: 'ملفان',
        few: `${count} ملفات`,
        many: `${count} ملفًا`,
        other: `${count} ملف`
      }),
    updatedAgo: age => `تم التحديث ${age}`,
    ageNow: 'الآن',
    ageSeconds: seconds => `قبل ${seconds} ث`,
    ageMinutes: minutes => `قبل ${minutes} د`,
    ageHours: hours => `قبل ${hours} س`,
    ageDays: days => `قبل ${days} ي`,
    durationSeconds: seconds => `${seconds} ث`,
    durationMinutes: (minutes, seconds) => `${minutes} د ${seconds} ث`,
    tokens: value =>
      AR_PLURAL(value, {
        one: 'رمز واحد',
        two: 'رمزان',
        few: `${value} رموز`,
        many: `${value} رمزًا`,
        other: `${value} رمز`
      })
  }
} satisfies Pick<TranslationOverrides, 'skillDeepLink' | 'skills' | 'starmap' | 'agents'>
