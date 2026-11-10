import type { TranslationOverride } from '@hermes/shared/i18n'

import { AR_PLURAL } from './ar_plural'
import type { Translations } from './types'

// Capabilities catalog (skills, plugins, toolsets), composed by ar.ts as `catalog`.
export const arCatalog: TranslationOverride<Translations['catalog']> = {
  add: 'إضافة',
  // Read only before a name ("تمت إضافة github-push"), like `add` and `install`.
  added: 'تمت إضافة',
  discover: 'اكتشف',
  featured: 'المميزة',
  explorePlugins: 'استكشف الإضافات',
  exploreSkills: 'استكشف المهارات',
  mostStarred: 'الأكثر نجومًا',
  newest: 'الأحدث',
  recentlyUpdated: 'المحدثة مؤخرًا',
  mostUsed: 'الأكثر استخدامًا',
  // A badge on an installed entry, not the action that applies the update.
  updateAvailable: 'تحديث متاح',
  updatesAvailable: (count: number) => `التحديثات · ${count}`,
  alphabetical: 'الاسم',
  sortBy: 'ترتيب حسب',
  seeAll: 'عرض الكل',
  related: 'عناصر مشابهة',
  tags: 'الوسوم',
  screenshots: 'لقطات الشاشة',
  listView: 'عرض القائمة',
  cardView: 'عرض البطاقات',
  installTitle: (name: string) => `تثبيت «${name}»؟`,
  installDescription: 'ستتوفر هذه المهارة في الجلسات الجديدة. ثبّت من المصادر التي تثق بها فقط.',
  installTo: 'التثبيت في',
  thisComputer: 'هذا الجهاز',
  installing: 'جارٍ التثبيت…',
  installComplete: (name: string) => `تم تثبيت «${name}»`,
  destinationChanged: 'تغيّرت وجهة التثبيت. أغلق مربع الحوار هذا وافتح رابط التثبيت مجددًا.',
  install: 'تثبيت',
  // Both a button state and a filter name; feminine for مهارة and إضافة alike.
  installed: 'مثبّتة',
  searchSkills: 'البحث في المهارات',
  searchPlugins: 'البحث في الإضافات',
  allSources: 'كل المصادر',
  allCategories: 'كل الفئات',
  about: 'نبذة',
  author: 'المؤلف',
  source: 'المصدر',
  category: 'الفئة',
  version: 'الإصدار',
  platforms: 'المنصات',
  requires: 'المتطلبات',
  tools: 'الأدوات',
  hooks: 'الخطافات',
  middleware: 'البرمجيات الوسيطة',
  commands: 'الأوامر',
  license: 'الترخيص',
  addedDate: 'تاريخ الإضافة',
  updatedDate: 'تاريخ التحديث',
  repository: 'المستودع',
  documentation: 'التوثيق',
  noResults: 'لا توجد نتائج مطابقة',
  tryAnother: 'جرّب بحثًا آخر أو امسح عوامل التصفية.',
  clearFilters: 'مسح عوامل التصفية',
  filters: 'عوامل التصفية',
  loadFailed: 'تعذّر تحميل الكتالوج',
  retry: 'إعادة المحاولة',
  more: 'عرض المزيد',
  pinned: 'الإيداع المُراجَع',
  snapshotHint: 'من كتالوج Hermes. لا يتصل التصفح بمستودعات المصدر مطلقًا.',
  installHint: 'راجع المصدر قبل التثبيت. تسري التغييرات على الجلسات الجديدة.',
  results: (count: number) =>
    AR_PLURAL(count, {
      one: 'نتيجة واحدة',
      two: 'نتيجتان',
      few: `${count.toLocaleString('ar')} نتائج`,
      many: `${count.toLocaleString('ar')} نتيجة`
    }),
  back: 'العودة إلى النتائج',
  tier: 'المستوى',
  previousSlide: 'العنصر المميز السابق',
  nextSlide: 'العنصر المميز التالي',
  slideOf: (index, count) => `${index} من ${count}`,
  tierLabels: { official: 'رسمي', verified: 'موثّق', community: 'مجتمعي' },
  tiers: {
    official: { title: 'الإضافات الرسمية', blurb: 'تبنيها Nous Research وتصونها.' },
    verified: { title: 'الإضافات الموثّقة', blurb: 'من الشركة المسؤولة عن التكامل، وتحققت منها Nous.' }
  },
  moreToExplore: 'المزيد لاستكشافه',
  moreToExploreBlurb: 'زوايا أصغر من الكتالوج، كلها في مكان واحد.',
  // The category arrives as its catalog label (Latin), so Arabic keeps its case.
  skillsFor: category => `مهارات في مجال ${category}.`,
  discoverKind: kind => `اكتشف ${kind}`,
  developer: {
    heading: 'وضع المطوّر',
    title: 'ابنِ لـ Hermes',
    pitch: 'هل بنيت أداة أو موصلًا أو إضافة أو Mod؟',
    pitchFollowUp: 'تريد ذلك ولا تعرف كيف؟',
    submit: 'إرسال Mod',
    docs: 'توثيق المطوّرين'
  },
  toolsets: {
    mostUsed: 'الأكثر استخدامًا',
    mostUsedBlurb: 'مجموعات الأدوات التي يلجأ إليها Hermes أكثر من غيرها في هذا الملف الشخصي.',
    essentials: 'الأساسيات',
    essentialsBlurb: 'ما يعتمد عليه معظم عمل Hermes.',
    toolCount: count =>
      AR_PLURAL(count, { one: 'أداة واحدة', two: 'أداتان', few: `${count} أدوات`, many: `${count} أداة` }),
    // `count` is the compact display ("1.2k"); `calls` picks the noun form.
    callCount: (count, calls) =>
      AR_PLURAL(calls, {
        one: 'استدعاء واحد',
        two: 'استدعاءان',
        few: `${count} استدعاءات`,
        many: `${count} استدعاءً`,
        other: `${count} استدعاء`
      }),
    themes: {
      work: {
        label: 'التصفح والعمل والأتمتة',
        blurb: 'التحكم في المتصفح وسطح المكتب، وتعديل الملفات، وتشغيل الشيفرة، وجدولة العمل.'
      },
      create: {
        label: 'الرؤية والسمع والإنشاء',
        blurb: 'فحص الصور والفيديو، وتفريغ الصوت، وتوليد الوسائط.'
      },
      recall: {
        label: 'الذاكرة والمعرفة',
        blurb: 'ما يتذكره Hermes، والمهارات والسجل اللذان يمكنه البحث فيهما.'
      },
      connect: {
        label: 'الاتصال والتواصل',
        blurb: 'الحسابات والوكلاء الآخرون والمنزل الذكي والبحث فيما يتجاوز الويب.'
      },
      more: { label: 'أدوات أخرى', blurb: 'كل ما يمكن تفعيله أيضًا في هذا الملف الشخصي.' }
    }
  }
}
