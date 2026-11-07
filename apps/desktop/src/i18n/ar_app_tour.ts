import type { TranslationOverride } from '@hermes/shared/i18n'

import type { Translations } from './types'

// The app's own tour, composed by ar.ts as `appTour`. Stop titles reuse the sidebar labels
// (Capabilities is «المهارات», Messaging «المراسلة»).
export const arAppTour: TranslationOverride<Translations['appTour']> = {
  sessions: { title: 'محادثاتك', text: 'كل محادثاتك هنا. ابحث فيها أو ثبّتها أو أعد فتح أي منها.' },
  composer: { title: 'اطلب هنا', text: 'قل ما تريد إنجازه. اكتب @ لإضافة ملف.' },
  newSession: { title: 'ابدأ من جديد', text: 'لكل جلسة جديدة سياقها الخاص. خصّص جلسة لكل مهمة.' },
  model: { title: 'منتقي النموذج', text: 'يحدد النموذج الذي يجيبك.' },
  modelLocal: 'يستطيع هذا الجهاز تشغيل نموذج محليًا: الإعدادات ← المزوّدون ← النماذج المحلية.',
  capabilities: {
    title: 'المهارات',
    text: 'المهارات والأدوات والإضافات التي يستطيع Hermes استخدامها. أضف المزيد من هنا.'
  },
  messaging: { title: 'المراسلة', text: 'تواصل مع Hermes من Telegram وSlack وDiscord وغيرها.' },
  rightPane: { title: 'لوحة العمل', text: 'تفتح الملفات والطرفية والمراجعة ومتصفح التطبيق في لوحة جانبية.' }
}
