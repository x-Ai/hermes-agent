import { AR_PLURAL } from './ar_plural'
import type { TranslationOverrides } from './define-locale'

export const arArtifacts = {
  media: {
    displayLabel: (kind, name) => {
      const labels = { audio: 'صوت', file: 'ملف', image: 'صورة', video: 'فيديو' }

      return `${labels[kind]}: ${name}`
    }
  },
  artifacts: {
    search: 'بحث',
    refresh: 'تحديث',
    refreshing: 'جار التحديث...',
    indexing: 'جار الفهرسة...',
    tabAll: 'الكل',
    tabImages: 'الصور',
    tabFiles: 'الملفات',
    tabLinks: 'الروابط',
    noArtifactsTitle: 'لا توجد عناصر',
    noArtifactsDesc: 'ستظهر الصور والملفات والروابط من محادثاتك هنا.',
    failedLoad: 'فشل تحميل العناصر',
    openFailed: 'فشل الفتح',
    itemsImage: 'صور',
    itemsLink: 'روابط',
    itemsFile: 'ملفات',
    itemsGeneric: 'عناصر',
    zero: 'صفر',
    rangeOf: (start, end, total) => `${start}-${end} من ${total}`,
    goToPage: (itemLabel, page) => `الانتقال إلى صفحة ${page} من ${itemLabel}`,
    colTitleLink: 'الرابط',
    colTitleFile: 'الملف',
    colTitleDefault: 'العنوان',
    colLocationLink: 'الموقع',
    colLocationFile: 'الموقع',
    colLocationDefault: 'الموقع',
    colSession: 'الجلسة',
    kindImage: 'صورة',
    kindFile: 'ملف',
    kindLink: 'رابط',
    chat: 'المحادثة',
    copyUrl: 'نسخ الرابط',
    copyPath: 'نسخ المسار'
  },
  artifactCard: {
    kind: {
      code: 'كود',
      html: 'صفحة تفاعلية',
      svg: 'رسم'
    },
    generating: lines => `جارٍ الإنشاء… ${lines} سطرًا`,
    versionBadge: (current, total) => `v${current}/${total}`,
    open: 'فتح'
  },
  artifactPreview: {
    versionOf: (current, total) => `الإصدار ${current} من ${total}`,
    olderVersion: 'إصدار أقدم',
    newerVersion: 'إصدار أحدث',
    latest: 'الأحدث',
    copyContent: 'نسخ المحتوى',
    download: 'تنزيل',
    openInBrowser: 'فتح في المتصفح',
    openInBrowserFailed: 'تعذّر الفتح في المتصفح',
    missingTitle: 'الناتج غير متاح',
    missingBody: 'لم يعد هذا الناتج موجودًا في السجل المحلي.'
  },
  preview: {
    tab: 'معاينة',
    pin: 'تثبيت في مساحة العمل',
    unpin: 'إلغاء التثبيت من مساحة العمل',
    closePane: 'إغلاق لوحة المعاينة',
    loading: 'جارٍ تحميل المعاينة',
    unavailable: 'المعاينة غير متاحة',
    missingTarget: 'هذا المسار غير موجود على هذا الجهاز',
    missingTitle: 'لم يعد الملف موجودًا',
    missingBody: label =>
      `تم حذف ${label} أو نقله، أو أُفرغ موقعه المؤقت. لن تتم استعادة علامة التبويب هذه عند التشغيل التالي.`,
    opening: 'جارٍ الفتح...',
    hide: 'إخفاء',
    openPreview: 'فتح المعاينة',
    openInBrowser: 'فتح في المتصفح',
    openInExternal: 'فتح في متصفح خارجي',
    popIn: 'إعادة إلى النافذة الرئيسية',
    popOut: 'فتح في نافذة منفصلة',
    linkHint: 'انقر مع ⌘/Ctrl للفتح في لوحة المعاينة',
    sourceLineTitle: 'انقر للتحديد · انقر مع Shift لتوسيع التحديد · اسحب إلى المحرّر',
    source: 'المصدر',
    renderedPreview: 'المعاينة',
    diff: 'الفروقات',
    unknownSize: 'غير معروف',
    binaryTitle: 'يبدو أن هذا ملف ثنائي',
    binaryBody: label => `قد تعرض معاينة ${label} نصًا غير مقروء.`,
    largeTitle: 'هذا الملف كبير',
    largeBody: (label, size) => `حجم ${label}: ${size}. سيعرض Hermes أول 512 KB فقط.`,
    previewAnyway: 'المعاينة على أي حال',
    truncated: 'يُعرض أول 512 KB فقط.',
    noInlineTitle: 'لا توجد معاينة مضمّنة',
    noInlineBody: mimeType => `لا يزال بالإمكان إرفاق ${mimeType || 'هذا النوع من الملفات'} كسياق.`,
    edit: 'تحرير',
    editing: 'قيد التحرير',
    unsavedChanges: 'تغييرات غير محفوظة',
    saveFailed: message => `تعذّر الحفظ: ${message}`,
    saveScopeChanged: 'عُد إلى الاتصال والملف الشخصي الأصليين لحفظ هذه المسودة.',
    diskChangedTitle: 'تغيّر الملف على القرص',
    diskChangedBody: 'تغيّر هذا الملف منذ أن فتحته. هل تريد الكتابة فوقه بنسختك، أم تجاهل تعديلاتك وإعادة التحميل؟',
    overwrite: 'الكتابة فوقه',
    discardReload: 'تجاهل وإعادة التحميل',
    console: {
      deselect: 'إلغاء تحديد الإدخال',
      select: 'تحديد الإدخال',
      copyFailed: 'تعذّر نسخ مخرجات وحدة التحكم',
      copyEntry: 'نسخ هذا الإدخال',
      sendEntry: 'إرسال هذا الإدخال إلى المحادثة',
      messages: count =>
        AR_PLURAL(count, {
          one: 'رسالة واحدة في وحدة التحكم',
          two: 'رسالتان في وحدة التحكم',
          few: `${count} رسائل في وحدة التحكم`,
          many: `${count} رسالة في وحدة التحكم`
        }),
      resize: 'تغيير حجم وحدة تحكم المعاينة',
      title: 'وحدة تحكم المعاينة',
      selected: count =>
        AR_PLURAL(count, {
          one: 'إدخال واحد محدد',
          two: 'إدخالان محددان',
          few: `${count} إدخالات محددة`,
          many: `${count} إدخالًا محددًا`
        }),
      sendToChat: 'إرسال إلى المحادثة',
      copySelected: 'نسخ المحدد إلى الحافظة',
      copyAll: 'نسخ الكل إلى الحافظة',
      copy: 'نسخ',
      clear: 'مسح',
      empty: 'لا توجد رسائل في وحدة التحكم بعد.',
      promptHeader: 'وحدة تحكم المعاينة:',
      sentTitle: 'تم الإرسال إلى المحادثة',
      sentMessage: count =>
        AR_PLURAL(count, {
          one: 'تمت إضافة إدخال واحد من السجل إلى المحرّر',
          two: 'تمت إضافة إدخالين من السجل إلى المحرّر',
          few: `تمت إضافة ${count} إدخالات من السجل إلى المحرّر`,
          many: `تمت إضافة ${count} إدخالًا من السجل إلى المحرّر`
        })
    },
    web: {
      embeddedPreviewHint: 'تمنع بعض المواقع المعاينات المضمّنة. افتح الصفحة الأصلية في علامة تبويب بالمتصفح.',
      appFailedToBoot: 'تعذّر تشغيل تطبيق المعاينة',
      serverNotFound: 'الخادم غير موجود',
      remoteLoopback:
        'يشير هذا العنوان إلى الجهاز الذي يشغّل الوكيل، وليس هذا الجهاز. تحمّل لوحة المتصفح الصفحات محليًا، لذا يحتاج خادم التطوير البعيد إلى إعادة توجيه منفذ أو اسم مضيف يمكن الوصول إليه.',
      failedToLoad: 'تعذّر تحميل المعاينة',
      tryAgain: 'إعادة المحاولة',
      restarting: 'يعيد Hermes تشغيل الخادم...',
      askRestart: 'طلب إعادة تشغيل الخادم من Hermes',
      lookingRestart: taskId => `يبحث Hermes عن خادم معاينة لإعادة تشغيله (${taskId})`,
      restartingTitle: 'جارٍ إعادة تشغيل خادم المعاينة',
      restartingMessage: 'يعمل Hermes في الخلفية. تابع التقدّم في وحدة تحكم المعاينة.',
      startRestartFailed: message => `تعذّر بدء إعادة تشغيل الخادم: ${message}`,
      restartFailed: 'تعذّرت إعادة تشغيل الخادم',
      hideConsole: 'إخفاء وحدة تحكم المعاينة',
      showConsole: 'إظهار وحدة تحكم المعاينة',
      hideDevTools: 'إخفاء أدوات التطوير للمعاينة',
      openDevTools: 'فتح أدوات التطوير للمعاينة',
      goBack: 'رجوع',
      goForward: 'تقدّم',
      reload: 'إعادة تحميل الصفحة',
      address: 'العنوان',
      addressPlaceholder: 'أدخل العنوان',
      blankPageBody: 'اكتب عنوانًا في الأعلى للتصفح، أو اطلب من Hermes فتح صفحة.',
      finishedRestarting: message => `أنهى Hermes إعادة تشغيل خادم المعاينة${message ? `: ${message}` : ''}`,
      failedRestarting: message => `تعذّرت إعادة تشغيل الخادم: ${message}`,
      unknownError: 'خطأ غير معروف',
      restartedTitle: 'تمت إعادة تشغيل خادم المعاينة',
      reloadingNow: 'جارٍ إعادة تحميل المعاينة الآن.',
      restartFailedTitle: 'تعذّرت إعادة تشغيل المعاينة',
      restartFailedMessage: 'تعذّر على Hermes إعادة تشغيل الخادم.',
      stillWorking:
        'لا يزال Hermes يعمل، لكن لم تصل نتيجة إعادة التشغيل بعد. قد يكون أمر الخادم قيد التشغيل في المقدمة.',
      workspaceReloading: 'تغيّرت مساحة العمل، جارٍ إعادة تحميل المعاينة',
      fileChanged: url => `تغيّر الملف، جارٍ إعادة تحميل المعاينة: ${url}`,
      filesChanged: (count, url) => {
        const changes = AR_PLURAL(count, {
          one: 'تغيير واحد في الملفات',
          two: 'تغييران في الملفات',
          few: `${count} تغييرات في الملفات`,
          many: `${count} تغييرًا في الملفات`
        })

        return `${changes}، جارٍ إعادة تحميل المعاينة: ${url}`
      },
      watchFailed: message => `تعذّرت مراقبة ملف المعاينة: ${message}`,
      moduleMimeDescription:
        'تُقدَّم النصوص البرمجية للوحدات (module scripts) بنوع MIME خاطئ. يعني هذا عادةً أن خادم ملفات ثابتة يقدّم تطبيق Vite/React بدلًا من خادم تطوير المشروع.',
      loadFailedConsole: (code, message) => `تعذّر التحميل${code ? ` (${code})` : ''}: ${message}`,
      unreachableDescription: 'تعذّر الوصول إلى صفحة المعاينة.',
      openTarget: url => `فتح ${url}`,
      fallbackTitle: 'معاينة',
      annotate: 'التعليق على الصفحة',
      annotateOn: 'إنهاء وضع التعليق',
      annotateNeedPage: 'افتح صفحة في متصفح التطبيق أولًا.',
      annotateFailed: 'تعذّر بدء وضع التعليق',
      commenting: 'وضع التعليق',
      addComments: count =>
        AR_PLURAL(count, {
          one: 'إضافة تعليق واحد',
          two: 'إضافة تعليقين',
          few: `إضافة ${count} تعليقات`,
          many: `إضافة ${count} تعليقًا`
        }),
      commentPlaceholder: 'أضف تعليقًا...',
      commentTitle: n => `تعليق ${n}`,
      saveComment: 'حفظ',
      cancelComment: 'إلغاء التعليق',
      vaultFill: 'ملء بيانات دخول محفوظة',
      vaultTitle: site => `بيانات الدخول المحفوظة لـ ${site}`,
      vaultLoading: 'جارٍ تحميل بيانات الدخول المحفوظة…',
      vaultEmpty: 'لا توجد بيانات دخول محفوظة لهذا الموقع',
      vaultUnlock: name => `فتح قفل ${name}`,
      vaultOpenSettings: 'فتح إعدادات خزنة بيانات الاعتماد',
      vaultFilled: label => `تم ملء ${label}. راجع النموذج ثم سجّل الدخول.`,
      vaultFillFailed: 'تعذّر ملء بيانات الدخول',
      vaultLoadFailed: 'تعذّر تحميل بيانات الدخول المحفوظة',
      vaultPageNotReady: 'لا تزال الصفحة قيد التحميل. أعد المحاولة عند اكتمالها.'
    }
  }
} satisfies Pick<TranslationOverrides, 'media' | 'artifacts' | 'artifactCard' | 'artifactPreview' | 'preview'>
