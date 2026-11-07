import { AR_PLURAL } from './ar_plural'

// Typed /undo /retry /steer /queue lines (en_session_commands.ts is the source).
export const arSessionCommands = {
  undoUsage: 'الاستخدام: /undo [N]',
  undoNothing: 'لا يوجد ما يمكن التراجع عنه',
  undidOne: (count: string) =>
    AR_PLURAL(count, {
      one: 'تم التراجع عن رسالة واحدة — الرسالة المحذوفة موجودة في المحرّر',
      two: 'تم التراجع عن رسالتين — الرسالة المحذوفة موجودة في المحرّر',
      few: `تم التراجع عن ${count} رسائل — الرسالة المحذوفة موجودة في المحرّر`,
      many: `تم التراجع عن ${count} رسالة — الرسالة المحذوفة موجودة في المحرّر`
    }),
  undidOther: (count: string) =>
    AR_PLURAL(count, {
      one: 'تم التراجع عن رسالة واحدة — الرسالة المحذوفة موجودة في المحرّر',
      two: 'تم التراجع عن رسالتين — الرسالة المحذوفة موجودة في المحرّر',
      few: `تم التراجع عن ${count} رسائل — الرسالة المحذوفة موجودة في المحرّر`,
      many: `تم التراجع عن ${count} رسالة — الرسالة المحذوفة موجودة في المحرّر`
    }),
  retryNothing: 'لا يوجد ما يمكن إعادة محاولته',
  retryUnsupported: '/retry: لا يمكن إعادة محاولة الوسائط أو أجزاء المحتوى غير المعروفة',
  busy: (command: string) =>
    `الجلسة مشغولة — ما زال Hermes يرد. أوقف الرد الحالي أولاً (زر الإيقاف، أو Ctrl+C في الطرفية)، ثم شغّل /${command}.`,
  busyCompressing: (command: string) => `الجلسة مشغولة — يجري تنفيذ /compress؛ شغّل /${command} عند انتهائه.`,
  steerUsage: 'الاستخدام: /steer <الموجّه>',
  steerQueued: (preview: string) => `أُضيف التوجيه إلى قائمة الانتظار — يصل بعد استدعاء الأداة التالي: «${preview}»`,
  steerNoActiveTurn: (preview: string) => `لا يوجد دور نشط — أُضيف إلى قائمة الانتظار للدور التالي: «${preview}»`,
  steerRejected: 'رُفض التوجيه — لا يوجد دور نشط، أُضيف إلى قائمة الانتظار للدور التالي',
  queued: (preview: string) => `في قائمة الانتظار: «${preview}»`,
  queueFailed: 'تعذّرت إضافة الرسالة إلى قائمة الانتظار',
  countOne: (count: string) =>
    AR_PLURAL(count, {
      one: 'رسالة واحدة في قائمة الانتظار',
      two: 'رسالتان في قائمة الانتظار',
      few: `${count} رسائل في قائمة الانتظار`,
      many: `${count} رسالة في قائمة الانتظار`
    }),
  countOther: (count: string) =>
    AR_PLURAL(count, {
      one: 'رسالة واحدة في قائمة الانتظار',
      two: 'رسالتان في قائمة الانتظار',
      few: `${count} رسائل في قائمة الانتظار`,
      many: `${count} رسالة في قائمة الانتظار`
    }),
  queueEditKeptTitle: 'لم تتغير الرسالة في قائمة الانتظار',
  queueEditKept: 'بدأ تنفيذ الرسالة أو رُفضت قبل حفظ تعديلك. نصّك المعدَّل موجود في المحرّر.',
  queueEditUnconfirmedTitle: 'لم يتم تأكيد التعديل',
  queueEditUnconfirmed:
    'تعذّر على Hermes تأكيد تعديلك. احفظ مرة أخرى لإعادة محاولة التعديل نفسه؛ لن يُضاف إلى قائمة الانتظار مرتين.'
}
