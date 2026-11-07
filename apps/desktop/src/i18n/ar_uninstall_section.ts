import type { TranslationOverride } from '@hermes/shared/i18n'

import type { UninstallSectionTranslations } from './types_uninstall_section'

// Settings › About › Uninstall, composed by ar_settings.ts as `settings.uninstallSection` (file-size split).
export const arUninstallSection: TranslationOverride<UninstallSectionTranslations> = {
  dangerZone: 'منطقة الخطر',
  uninstallHermes: 'إلغاء تثبيت Hermes',
  managedBody: 'يدير نظامك هذا التثبيت، لذا لا يستطيع Hermes إزالة نفسه.',
  dataKept: path => `توجد إعداداتك ومحادثاتك وأسرارك في ${path}. إزالة التطبيق لا تحذفها.`,
  openAppsSettings: 'فتح إعدادات التطبيقات',
  chooseHowMuch:
    'اختر مقدار ما تريد إزالته. يُغلَق التطبيق لإكمال المهمة، ويمكنك العودة في أي وقت بإعادة فتح برنامج التثبيت.',
  confirmUninstall: 'تأكيد إلغاء التثبيت',
  confirmBody: what => `سيؤدي هذا إلى إزالة ${what}. لا يمكن التراجع عن ذلك.`,
  appLabel: 'التطبيق:',
  couldNotStart: 'تعذّر بدء إلغاء التثبيت.',
  uninstalling: 'جارٍ إلغاء التثبيت…',
  yesUninstall: 'نعم، إلغاء التثبيت',
  options: {
    gui: {
      title: 'إلغاء تثبيت واجهة الدردشة الرسومية فقط',
      description: 'إزالة تطبيق سطح المكتب هذا. يبقى وكيل Hermes وإعداداتك ومحادثاتك كما هي.',
      consequence: 'واجهة الدردشة الرسومية لتطبيق سطح المكتب (هذا التطبيق وبياناته)'
    },
    lite: {
      title: 'إلغاء تثبيت الواجهة الرسومية والوكيل مع الاحتفاظ ببياناتي',
      description: 'إزالة التطبيق ووكيل Hermes مع الاحتفاظ بالإعدادات والمحادثات والأسرار لإعادة التثبيت لاحقًا.',
      consequence: 'واجهة الدردشة الرسومية ووكيل Hermes (مع الاحتفاظ بالإعدادات والمحادثات والأسرار)'
    },
    full: {
      title: 'إلغاء تثبيت كل شيء',
      description:
        'إزالة التطبيق والوكيل وكل بيانات المستخدم — الإعدادات والمحادثات والمهام المجدولة والأسرار والسجلات.',
      consequence: 'كل شيء — واجهة الدردشة الرسومية ووكيل Hermes وكل إعداداتك ومحادثاتك وأسرارك وسجلاتك'
    }
  }
}
