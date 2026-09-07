import type { AutomationBlueprintField } from '@/lib/api'
import type { Locale } from './types'
import type { DashboardCopy } from './dashboard'

const ZH_DESCRIPTIONS: Record<string, string> = {
  'morning-brief': '每日早报：今日日程、天气和等待处理的紧急事项。',
  'important-mail': '定期检查收件箱，仅在邮件确实需要处理时通知你。',
  'weekly-review': '每周回顾：已完成、待处理和即将到来的事项。',
  'workday-start': '工作日开始时提醒今日日程和优先事项。',
  'custom-reminder': '按你的时间安排，用你自己的话定期提醒。',
  'evening-winddown': '每日收尾：预览明日日程和今晚需要准备的事项。',
  'news-digest': '定期汇总你关心的主题，并对已发送内容去重。',
  'bill-renewal-watch': '在定期付款、订阅续费或到期日前发出提醒。',
  'price-watch': '监控指定商品、航班、酒店或列表，在价格或可用性条件满足时提醒。',
  'competitor-watch': '跟踪指定公司的重要新闻，并生成带引用的摘要。',
  'habit-checkin': '定期提醒以坚持习惯，并回顾是否完成。',
  'hydration-move': '白天定期提醒喝水、起身和伸展。',
  'meal-plan': '按你的饮食偏好和烹饪时间制定每周餐食及合并购物清单。',
  'learn-daily': '每天学习一个小知识，随时间逐步深入。',
  'gratitude-journal': '温和的晚间反思提示，回顾当天并记录值得感激的事。',
  'on-this-day': '每日探索有趣的历史事件、事实或当日词汇。'
}

const TITLE_KEYS: Record<string, keyof DashboardCopy['cron']['blueprintNames']> = {
  'morning-brief': 'morningBriefing',
  'important-mail': 'importantMail',
  'weekly-review': 'weeklyReview',
  'workday-start': 'workdayStart',
  'custom-reminder': 'customReminder',
  'evening-winddown': 'eveningWindDown',
  'news-digest': 'topicNewsDigest',
  'bill-renewal-watch': 'billsRenewals',
  'price-watch': 'priceAvailability',
  'competitor-watch': 'competitorNews',
  'habit-checkin': 'habitCheckIn',
  'hydration-move': 'hydrationMovement',
  'meal-plan': 'weeklyMealPlan',
  'learn-daily': 'dailyLearning',
  'gratitude-journal': 'gratitudeReflection',
  'on-this-day': 'onThisDay'
}

const ZH_LABELS: Record<string, string> = {
  'What time?': '什么时间？',
  'Where to deliver?': '投递到哪里？',
  'How often?': '多久一次？',
  'Only notify me if the mail…': '仅在邮件符合以下条件时通知我…',
  'Which day?': '星期几？',
  'Remind me to…': '提醒我…',
  'Repeat on': '重复日期',
  'What topic?': '什么主题？',
  'How many bullets?': '最多几条？',
  "What's due?": '什么即将到期？',
  'What exactly to watch?': '具体监控什么？',
  'Alert me when…': '在以下情况提醒我…',
  'Which companies?': '哪些公司？',
  'Which events matter?': '关注哪些事件？',
  'Which habit?': '哪个习惯？',
  'Start hour': '开始时间',
  'End hour': '结束时间',
  'Diet?': '饮食偏好？',
  'Meals per day?': '每天几餐？',
  'Cooking effort?': '烹饪复杂度？',
  'Learn about…': '学习主题…',
  'What kind?': '内容类型？'
}

const ZH_VALUES: Record<string, string> = {
  origin: '来源会话',
  local: '本地',
  everyday: '每天',
  weekdays: '工作日',
  sunday: '星期日',
  monday: '星期一',
  friday: '星期五',
  saturday: '星期六',
  weekly: '每周',
  daily: '每日',
  briefing: '简报',
  email: '邮件',
  monitor: '监控',
  review: '回顾',
  focus: '专注',
  reminder: '提醒',
  evening: '晚间',
  digest: '摘要',
  research: '调研',
  finance: '财务',
  prices: '价格',
  shopping: '购物',
  travel: '旅行',
  competitors: '竞争对手',
  news: '新闻',
  habit: '习惯',
  wellbeing: '健康',
  food: '餐食',
  learning: '学习',
  reflection: '反思',
  curiosity: '好奇'
}

export function localizeBlueprintTitle(key: string, fallback: string, copy: DashboardCopy): string {
  const mapped = TITLE_KEYS[key]
  return mapped ? copy.cron.blueprintNames[mapped] : fallback
}

export function localizeBlueprintDescription(key: string, fallback: string, locale: Locale): string {
  return locale === 'zh' ? (ZH_DESCRIPTIONS[key] ?? fallback) : fallback
}

export function localizeBlueprintValue(value: string, locale: Locale): string {
  return locale === 'zh' ? (ZH_VALUES[value] ?? value) : value
}

export function localizeBlueprintField(
  field: AutomationBlueprintField,
  locale: Locale
): Pick<AutomationBlueprintField, 'label' | 'help'> {
  if (locale !== 'zh') return { label: field.label, help: field.help }
  return {
    label: ZH_LABELS[field.label] ?? field.label,
    help: field.help ? `${ZH_LABELS[field.label] ?? field.label}的设置说明。` : field.help
  }
}
