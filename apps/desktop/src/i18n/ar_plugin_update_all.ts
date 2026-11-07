import { AR_PLURAL } from './ar_plural'
import type { PluginUpdateAllTranslations } from './types_plugin_update'

/** Plugins tab: "Update all" and the auto-update switch. */
export const arPluginUpdateAll: PluginUpdateAllTranslations = {
  updateAll: 'تحديث الكل',
  updatingAll: 'جارٍ التحديث…',
  updateAllTip: 'فحص كل الإضافات المثبتة وتطبيق التحديثات التي لا تحتاج إلى مراجعة',
  updateAllDone: (updated: number, review: number, failed: number) =>
    `تم تحديث ${AR_PLURAL(updated, { one: 'إضافة واحدة', two: 'إضافتين', few: `${updated} إضافات`, many: `${updated} إضافة` })}` +
    (review
      ? `، وتحتاج ${AR_PLURAL(review, { one: 'إضافة واحدة', two: 'إضافتان', few: `${review} إضافات`, many: `${review} إضافة` })} إلى مراجعة`
      : '') +
    (failed
      ? `، وفشل تحديث ${AR_PLURAL(failed, { one: 'إضافة واحدة', two: 'إضافتين', few: `${failed} إضافات`, many: `${failed} إضافة` })}`
      : ''),
  updateAllNone: 'كل الإضافات محدّثة',
  updateAllFailed: 'تعذّر تحديث الإضافات',
  autoUpdate: 'التحديث التلقائي',
  autoUpdateTip: (hours: number) =>
    `تطبيق تحديثات الإضافات تلقائيًا عندما تفحصها البوابة (${AR_PLURAL(hours, { one: 'كل ساعة', two: 'كل ساعتين', few: `كل ${hours} ساعات`, many: `كل ${hours} ساعة` })}). تُحمَّل الشيفرة المحدّثة في الجلسات الجديدة.`,
  autoUpdateFailed: 'تعذّر تغيير التحديث التلقائي للإضافات'
}
