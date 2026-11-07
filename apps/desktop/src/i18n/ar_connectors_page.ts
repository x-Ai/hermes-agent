import type { TranslationOverride } from '@hermes/shared/i18n'

import { AR_PLURAL } from './ar_plural'
import type { Translations } from './types'

// Subject form (nominative): «أداتان».
const tools = (count: number) =>
  AR_PLURAL(count, { one: 'أداة واحدة', two: 'أداتان', few: `${count} أدوات`, many: `${count} أداة` })

// Object form (accusative / genitive): «أداتين».
const toolsObject = (count: number) =>
  AR_PLURAL(count, { one: 'أداة واحدة', two: 'أداتين', few: `${count} أدوات`, many: `${count} أداة` })

// Capabilities › Connectors page, composed by ar.ts as `connectorsPage`. Its vocabulary is the page's
// own; `connectors.*` (ar_connectors.ts) stays the onboarding and chat copy.
export const arConnectorsPage: TranslationOverride<Translations['connectorsPage']> = {
  title: 'الموصلات',
  searchPlaceholder: count =>
    AR_PLURAL(count, {
      one: 'البحث في تطبيق واحد',
      two: 'البحث في تطبيقين',
      few: `البحث في ${count} تطبيقات`,
      many: `البحث في ${count} تطبيقًا`,
      other: `البحث في ${count} تطبيق`
    }),
  filterCategory: 'الفئة',
  categoryAll: 'كل الفئات',
  uncategorised: 'غير مصنّف',
  residencyLocal: 'على هذا الجهاز',
  segment: {
    all: 'الكل',
    available: 'المتاحة',
    connected: 'المتصلة',
    off: 'المتوقفة'
  },
  group: {
    connected: 'المتصلة',
    connectedNote: 'الاتصالات المتعطّلة أولًا.',
    available: 'المتاحة',
    off: 'المتوقفة',
    offNote: 'تبقى عمليات تسجيل الدخول محفوظة.'
  },
  card: {
    kindManaged: 'مُدار',
    kindCatalog: 'MCP · الكتالوج',
    kindCustom: 'MCP · مخصص',
    kindPlugin: plugin => `MCP · الإضافة ${plugin}`,
    inCatalog: 'في كتالوج Hermes',
    hostedTwin: 'تتوفر نسخة مُدارة',
    alsoLocal: 'يعمل أيضًا على هذا الجهاز',
    open: name => `فتح ${name}`,
    turnServerOn: name => `تشغيل ${name}`,
    turnServerOff: name => `إيقاف ${name}`,
    state: {
      accessExpired: 'انتهت صلاحية الوصول',
      available: 'متاح',
      connected: 'متصل',
      connecting: 'جارٍ الاتصال',
      connectionUnknown: 'الحالة غير معروفة',
      couldNotConnect: 'تعذّر الاتصال',
      offByYourOrganisation: 'أوقفته مؤسستك',
      offForYou: 'متوقف لديك',
      serverConnecting: 'جارٍ الاتصال…',
      serverError: 'خطأ',
      serverNeedsAuth: 'يحتاج إلى مصادقة',
      serverOff: 'متوقف',
      serverOn: 'يعمل',
      serverOnUnused: 'يعمل، غير مستخدم'
    },
    fact: {
      tools,
      toolsOff: count =>
        AR_PLURAL(count, {
          one: 'أداة واحدة متوقفة',
          two: 'أداتان متوقفتان',
          few: `${count} أدوات متوقفة`,
          many: `${count} أداة متوقفة`
        }),
      toolsOn: count =>
        AR_PLURAL(count, {
          one: 'أداة واحدة تعمل',
          two: 'أداتان تعملان',
          few: `${count} أدوات تعمل`,
          many: `${count} أداة تعمل`
        }),
      toolsSomeOn: (total, on) => `${tools(total)}، تعمل منها ${on}`
    },
    verb: {
      authenticate: 'المصادقة',
      connect: 'ربط',
      install: 'تثبيت',
      openLogs: 'فتح السجلات',
      reconnect: 'إعادة الربط',
      stopWaiting: 'إيقاف الانتظار',
      tryAgain: 'إعادة المحاولة',
      turnBackOn: 'تشغيل مجددًا'
    },
    reason: {
      finishSignIn: 'أكمل تسجيل الدخول في متصفحك.',
      reconnect: 'أعد الربط ليستمر هذا التطبيق في العمل.',
      serverError: 'رفض الخادم الاتصال.',
      serverNeedsAuth: 'سجّل الدخول ليتمكن هذا الخادم من الرد.'
    }
  },
  page: {
    loading: 'جارٍ قراءة الكتالوج والخوادم على هذا الجهاز',
    emptyTitle: 'لا توجد تطبيقات هنا بعد. أضف خادمًا على هذا الجهاز للبدء.',
    noMatchTitle: 'لا توجد تطبيقات مطابقة',
    noMatchBody: 'لا شيء هنا يطابق بحثك. وجّه Hermes إلى خادم MCP خاص بك لإضافته.',
    clearSearch: 'مسح البحث',
    hostedFailedTitle: 'تعذّر الوصول إلى التطبيقات المستضافة.',
    hostedFailedBody: 'لم تتأثر الخوادم على هذا الجهاز وما زالت تعمل. لم يُوقَف أي شيء.',
    retry: 'إعادة المحاولة',
    matchesElsewhere: count =>
      `${AR_PLURAL(count, {
        one: 'نتيجة مطابقة أخرى',
        two: 'نتيجتان مطابقتان أخريان',
        few: `${count} نتائج مطابقة أخرى`,
        many: `${count} نتيجة مطابقة أخرى`
      })} في مجموعات أخرى.`,
    showAllMatches: 'عرض كل النتائج المطابقة',
    segmentNoMatch: segment => `لا نتائج مطابقة في «${segment}»، لذا تظهر كل النتائج المطابقة.`,
    freeTierNote: 'تبقى الاتصالات على هذا الجهاز حتى تسجّل الدخول.',
    signInLine: 'سجّل الدخول إلى Nous لاستخدام التطبيقات المُدارة.',
    signIn: 'تسجيل الدخول',
    managedUnavailable: 'التطبيقات المُدارة غير متاحة لهذا الحساب بعد.',
    writeFailed: 'لم يُحفظ هذا التغيير.',
    refreshFailed: 'لم تُحدَّث قائمة الأدوات.',
    disconnectNoAccount: 'لا يوجد لدى Hermes حساب لقطع اتصاله هنا. حدّث الصفحة وأعد المحاولة.',
    disconnectRefused:
      'تعذّر على Nous إزالة تسجيل الدخول هذا الآن. أوقف التطبيق بالمفتاح بدلًا من ذلك، أو أعد المحاولة لاحقًا.'
  },
  add: {
    action: 'إضافة خادمك الخاص',
    title: 'الاتصال بخادم MCP مخصص',
    hint: 'إدخال جديد واحد في mcp.json على هذا الجهاز',
    pasteLabel: 'الصق أمرًا أو مقتطفًا',
    pastePlaceholder: 'npx -y @modelcontextprotocol/server-filesystem /path/to/dir',
    pasteNoMatch: 'لا يبدو أن هذا النص يصف خادمًا. املأ الحقول أدناه بدلًا من ذلك.',
    name: 'الاسم',
    nameTaken: 'هذا الاسم مستخدم بالفعل.',
    type: 'النوع',
    typeStdio: 'STDIO',
    typeHttp: 'Streamable HTTP',
    command: 'أمر التشغيل',
    args: 'الوسائط',
    addArg: '+ إضافة وسيط',
    envVars: 'متغيرات البيئة',
    addEnvVar: '+ إضافة متغير بيئة',
    passthrough: 'تمرير متغيرات البيئة',
    addPassthrough: '+ إضافة متغير',
    cwd: 'مجلد العمل',
    url: 'عنوان URL',
    headers: 'الترويسات',
    addHeader: '+ إضافة ترويسة',
    auth: 'المصادقة',
    authNone: 'بلا مصادقة',
    authOauth: 'OAuth',
    authBearer: 'رمز Bearer',
    keyPlaceholder: 'المفتاح',
    valuePlaceholder: 'القيمة',
    removeRow: 'إزالة هذا الصف',
    editJson: 'تعديل mcp.json',
    saveFailed: 'لم يُحفظ هذا الخادم.'
  },
  dialog: {
    disconnect: 'قطع الاتصال',
    disconnectTitle: name => `قطع الاتصال بـ ${name}؟`,
    disconnectBody: 'يتوقف Hermes عن التصرف باسم هذا الحساب. يمكنك الربط مجددًا في أي وقت.',
    menuRefreshTools: 'تحديث الأدوات',
    moreActions: 'إجراءات أخرى',
    removeServerTitle: name => `إزالة ${name}؟`,
    removeServerBody: 'يُزال الإدخال من mcp.json على هذا الجهاز، ولا يُحذف أي شيء آخر.',
    appSwitch: name => `يمكن لـ Hermes استخدام ${name}`,
    waysTitle: name => `أين يعمل ${name}`,
    wayNotConnected: name => `غير متصل بعد. سجّل الدخول إلى ${name} في متصفحك.`,
    wayHosted: 'مُدار',
    bothOn: name => `كلاهما يعمل، لذا يرى Hermes كل أداة من أدوات ${name} مرتين.`,
    turnOffLocal: 'إيقاف الخادم المحلي',
    providedByPlugin: plugin => `مقدَّم من الإضافة ${plugin}`,
    openPlugins: 'فتح تبويب الإضافات',
    nousLine: 'تتبع تطبيقات Nous حسابك، لا الملف الشخصي.',
    rulesReadOnly: 'لا يمكن تغيير القواعد الآن.',
    rulesAppOff: name => `شغّل ${name} لتغيير أدواته.`,
    rulesSignIn: 'سجّل الدخول لتغيير ما يُسمح لـ Hermes بفعله هنا.',
    orgNote: count => `أوقفت مؤسستك ${toolsObject(count)}.`,
    orgLink: 'فتح إدارة الموصلات',
    connectEnded: 'لم يكتمل تسجيل الدخول.',
    connectOpenAgain: 'فتح الرابط مجددًا',
    tokensPerCall: 'رمز لكل استدعاء',
    usesPerMonth: 'استخدام خلال 30 يومًا',
    advanced: 'متقدم',
    advancedHint: 'إدخال mcp.json والسجلات'
  },
  accounts: {
    heading: 'الحسابات',
    count: count =>
      AR_PLURAL(count, {
        one: 'حساب واحد',
        two: 'حسابان',
        few: `${count} حسابات`,
        many: `${count} حسابًا`,
        other: `${count} حساب`
      }),
    addAnother: 'إضافة حساب آخر',
    aliasLabel: 'اسم الحساب',
    aliasHint: 'أحرف لاتينية صغيرة وأرقام وشرطات، حتى 32 حرفًا. مثلًا work أو home.',
    aliasInvalid: 'استخدم أحرفًا لاتينية صغيرة وأرقامًا وشرطات، على أن يبدأ الاسم بحرف أو رقم.',
    aliasTaken: 'هذا الاسم مستخدم بالفعل.',
    add: 'ربط',
    rename: 'إعادة التسمية',
    renameLabel: name => `اسم جديد لـ «${name}»`,
    renameGone: 'لم يعد هذا الحساب موجودًا؛ فقد أُزيل أو استُبدل عند إعادة الربط.',
    remove: 'إزالة',
    removeTitle: (app, name) => `إزالة حساب ${app} «${name}»؟`,
    removeBody: 'يتوقف Hermes عن التصرف باسم هذا الحساب، وتبقى حساباتك الأخرى متصلة.',
    retiredCount: count =>
      AR_PLURAL(count, {
        one: 'حساب واحد مستبدَل',
        two: 'حسابان مستبدَلان',
        few: `${count} حسابات مستبدَلة`,
        many: `${count} حسابًا مستبدَلًا`,
        other: `${count} حساب مستبدَل`
      }),
    status: {
      expired: 'انتهت صلاحية الوصول',
      failed: 'تعذّر الاتصال',
      inactive: 'غير نشط',
      pending: 'في انتظار تسجيل الدخول',
      retired: 'استُبدل عند إعادة الربط',
      revoked: 'أُلغي الوصول'
    }
  },
  tools: {
    title: 'الأدوات',
    notInstalledBody: 'ثبّته على هذا الجهاز لترى الأدوات التي يوفرها.',
    summaryTitle: name => `ما يُسمح لـ Hermes بفعله في ${name}`,
    summaryPreviewTitle: name => `ما يمكن لـ Hermes فعله في ${name} بعد الربط`,
    summaryCount: tools,
    summaryAllTools: 'كل الأدوات',
    summaryOther: 'أخرى',
    allToolsSwitch: 'تشغيل كل الأدوات أو إيقافها',
    summaryAllOn: 'كلها تعمل',
    summarySomeOn: (on, total) => `${on} من ${total} تعمل`,
    summaryOff: 'متوقفة',
    showAllTools: count => `عرض كل الأدوات (${count})`,
    showSummary: 'عرض الملخص',
    facetSwitch: facet => `تشغيل أدوات «${facet}» أو إيقافها`,
    moreHints: count => `+${count}`,
    staleSignIn: 'سجّل الدخول لقراءة أحدث قائمة أدوات.',
    searchCountPlaceholder: count => `البحث في ${toolsObject(count)}`,
    toolList: name => `أدوات ${name}`,
    categorySelect: count =>
      AR_PLURAL(count, { one: 'فئة واحدة', two: 'فئتان', few: `${count} فئات`, many: `${count} فئة` }),
    showDeprecated: count =>
      AR_PLURAL(count, {
        one: 'عرض الأداة المهملة',
        two: 'عرض الأداتين المهملتين',
        few: `عرض ${count} أدوات مهملة`,
        many: `عرض ${count} أداة مهملة`
      }),
    hideDeprecated: count =>
      AR_PLURAL(count, {
        one: 'إخفاء الأداة المهملة',
        two: 'إخفاء الأداتين المهملتين',
        few: `إخفاء ${count} أدوات مهملة`,
        many: `إخفاء ${count} أداة مهملة`
      }),
    quickReadOnly: 'قراءة فقط',
    quickNoDestructive: 'إيقاف الأدوات المدمّرة',
    quickEverythingOn: 'تشغيل الكل',
    lockedHint: 'أوقفتها مؤسستك',
    turnToolOn: tool => `تشغيل ${tool}`,
    turnToolOff: tool => `إيقاف ${tool}`,
    showDetails: tool => `عرض ما تفعله ${tool}`,
    hideDetails: tool => `إخفاء ما تفعله ${tool}`,
    noMatch: 'لا توجد أداة تطابق عوامل التصفية هذه.',
    loading: 'جارٍ قراءة قائمة الأدوات',
    unavailableLine: 'قائمة الأدوات غير متاحة.',
    needsAuthTitle: name => `سجّل الدخول إلى ${name} لقراءة أدواته.`,
    needsAuthBody: 'يبقى تسجيل الدخول على هذا الجهاز، ولا يغادره شيء.',
    retry: 'إعادة المحاولة',
    goneTitle: name => `لم يعد ${name} في الكتالوج.`,
    goneBody: 'لم يعد بإمكان Hermes استدعاؤه. يبقى الصف حتى تزيله، فلا يختفي شيء.',
    remove: 'إزالة',
    offTitle: name => `${name} متوقف.`,
    offBody: 'شغّله بالمفتاح أعلاه لقراءة الأدوات التي يوفرها.',
    signedOutTitle: 'سجّل الدخول إلى Nous لقراءة قائمة الأدوات.',
    signedOutBody: 'لم تتأثر خوادمك على هذا الجهاز.',
    conflictTitle: 'غيّر شخص آخر هذه القاعدة أثناء تعديلك.',
    // Two sentences at most, and the second says the work is still here.
    conflictBody: (theyOff, theyOn) => {
      const they = [
        theyOff > 0 ? `أوقف ${toolsObject(theyOff)} من الأدوات التي تعمل لديك` : '',
        theyOn > 0 ? `أبقى قيد التشغيل ${toolsObject(theyOn)} من الأدوات التي أوقفتها أنت` : ''
      ].filter(Boolean)

      return `${they.length > 0 ? `${they.join('، و')}. ` : ''}تبقى تعديلاتك على الشاشة، ولم يُكتب أي شيء.`
    },
    conflictReload: 'إعادة تحميل النسخة الأخرى',
    conflictSave: 'الحفظ فوق النسخة الأخرى',
    saveFailed: 'لم تُحفظ قواعد الأدوات هذه.',
    footerDirty: (off, backOn) =>
      `${AR_PLURAL(off, {
        zero: 'لا أدوات متوقفة',
        one: 'أداة واحدة متوقفة',
        two: 'أداتان متوقفتان',
        few: `${off} أدوات متوقفة`,
        many: `${off} أداة متوقفة`
      })}، ${AR_PLURAL(backOn, {
        zero: 'ولا شيء أُعيد تشغيله',
        one: 'وأداة واحدة أُعيد تشغيلها',
        two: 'وأداتان أُعيد تشغيلهما',
        few: `و${backOn} أدوات أُعيد تشغيلها`,
        many: `و${backOn} أداة أُعيد تشغيلها`
      })}`,
    discard: 'تجاهل',
    save: 'حفظ التغييرات',
    saving: 'جارٍ الحفظ...'
  },
  // The label rides in every tool row, so it stays short enough not to widen one.
  vocabulary: {
    facetRead: { label: 'قراءة', long: 'تقرأ البيانات من هذا التطبيق ولا تغيّر شيئًا.' },
    facetWrite: { label: 'كتابة', long: 'تنشئ شيئًا أو تغيّره في هذا التطبيق.' },
    facetDestructive: { label: 'مدمّرة', long: 'قد تزيل شيئًا من هذا التطبيق نهائيًا.' },
    facetUnclassified: { label: 'أثر غير معروف', long: 'لم يوضّح التطبيق ما تفعله هذه الأداة.' },
    hintReadOnly: { label: 'قراءة فقط', long: 'تعلن الأداة أنها تقرأ فقط.' },
    hintCreate: { label: 'تُنشئ', long: 'تنشئ شيئًا جديدًا.' },
    hintUpdate: { label: 'تُحدّث', long: 'تغيّر شيئًا موجودًا.' },
    hintDelete: { label: 'تحذف', long: 'تزيل شيئًا.' },
    hintDestructive: { label: 'مدمّرة', long: 'لا يمكن التراجع هنا عن التغيير الذي تجريه.' },
    hintIdempotent: { label: 'قابلة للتكرار', long: 'تشغيلها مرتين يفعل ما يفعله تشغيلها مرة واحدة.' },
    hintOpenWorld: { label: 'خارجية', long: 'تصل إلى شيء خارج هذا التطبيق.' }
  }
}
