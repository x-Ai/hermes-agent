import { AR_PLURAL } from './ar_plural'

// Desktop-side /rollback /agents /config /history /save /export /import /timestamps lines
// (en_desktop_commands.ts is the source).
export const arDesktopCommands = {
  error: (message: string) => `خطأ: ${message}`,
  rollbackUsage: 'الاستخدام: /rollback [list] | diff <n|hash> | <n|hash> [file] [--all]',
  checkpointsDisabled: 'نقاط الاستعادة غير مفعّلة لهذه الجلسة (اضبط checkpoints.enabled في config.yaml).',
  checkpointsEmpty: 'لا توجد نقاط استعادة بعد لمجلد العمل هذا.',
  checkpointsHeader: 'نقاط الاستعادة (الأحدث أولًا):',
  checkpointsHint:
    'استعد باستخدام /rollback <n> [file] (أضف --all للكتابة فوق تعديلاتك أيضًا)؛ واعرض المعاينة باستخدام /rollback diff <n>.',
  noDiff: 'لا توجد تغييرات منذ نقطة الاستعادة هذه.',
  rollbackFailed: (error: string) => `فشلت الاستعادة: ${error}`,
  unknownError: 'خطأ غير معروف',
  restored: (hash: string) => (hash ? `تمت استعادة نقطة الاستعادة ${hash}.` : 'تمت استعادة نقطة الاستعادة.'),
  rewound: (count: string) =>
    AR_PLURAL(count, {
      one: 'تم التراجع عن رسالة واحدة في هذه المحادثة.',
      two: 'تم التراجع عن رسالتين في هذه المحادثة.',
      few: `تم التراجع عن ${count} رسائل في هذه المحادثة.`,
      many: `تم التراجع عن ${count} رسالة في هذه المحادثة.`
    }),
  reopenForRewind: 'أعد فتح هذه المحادثة لرؤية المحادثة بعد الإرجاع.',
  agentsEmpty: 'لا يوجد وكلاء فرعيون نشطون ولا عمليات في الخلفية في هذه المحادثة.',
  subagentsHeader: (count: string) => `الوكلاء الفرعيون (${count}):`,
  subagentFallback: 'وكيل فرعي',
  statusRunning: 'قيد التشغيل',
  toolCalls: (count: string) =>
    AR_PLURAL(count, {
      one: 'استدعاء أداة واحد',
      two: 'استدعاءان للأدوات',
      few: `${count} استدعاءات للأدوات`,
      many: `${count} استدعاءً للأدوات`,
      other: `${count} استدعاء للأدوات`
    }),
  processesHeader: (count: string) => `عمليات في الخلفية (${count}):`,
  configHeader: 'الإعدادات (العرض والموافقات واللصق والصوت فقط؛ لا يُعرض أي شيء آخر):',
  configDefaults: '(القيم الافتراضية)',
  configFooter: 'غيّر الإعدادات من صفحة الإعدادات، أو حرّر config.yaml باستخدام `hermes config edit` على مضيف البوابة.',
  historyHeader: (count: string) =>
    AR_PLURAL(count, {
      one: 'سجل المحادثة (رسالة واحدة):',
      two: 'سجل المحادثة (رسالتان):',
      few: `سجل المحادثة (${count} رسائل):`,
      many: `سجل المحادثة (${count} رسالة):`
    }),
  historyEmpty: 'لا توجد رسائل بعد.',
  historyYou: 'أنت',
  historyHermes: 'Hermes',
  saveUsage: 'الاستخدام: /save [json|md|html] [filename] [redact]',
  saveLegacyRefused:
    'لم يتم الحفظ: لا تستطيع هذه البوابة تصدير نسخة منقّحة أو باسم محدد أو بغير JSON. حدّث البوابة، أو شغّل /save دون خيارات لكتابة JSON خام على مضيف البوابة.',
  savedOnHost: (path: string) => `تم الحفظ على مضيف البوابة: ${path}`,
  unknownPath: '(مسار غير معروف)',
  saveUnsupported: 'خطأ: لا يستطيع إصدار تطبيق سطح المكتب هذا حفظ الملفات',
  saveDialogTitle: 'حفظ المحادثة',
  savedTo: (path: string) => `تم حفظ المحادثة في ${path}`,
  saveCancelled: 'لم يتم الحفظ (أُلغي).',
  exportRemote:
    'يحزم /export ملفًا شخصيًا من مضيف البوابة، وهو ليس هذا الجهاز. شغّل `hermes profile export` على ذلك المضيف.',
  importRemote:
    'يثبّت /import ملفًا شخصيًا على مضيف البوابة، وهو ليس هذا الجهاز. شغّل `hermes profile import <archive>` على ذلك المضيف.',
  timestampsUsage: 'الاستخدام: /timestamps [on|off|status]',
  timestampsOn: 'الطوابع الزمنية: مفعّلة (هذه النافذة فقط؛ اضبط display.timestamps في config.yaml للاحتفاظ بها)',
  timestampsOff: 'الطوابع الزمنية: معطّلة (هذه النافذة فقط؛ اضبط display.timestamps في config.yaml للاحتفاظ بها)'
}
