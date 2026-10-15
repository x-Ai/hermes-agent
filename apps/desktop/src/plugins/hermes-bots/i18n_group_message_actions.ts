/**
 * Copy of the per-message actions in the room log (`group-chat-view.tsx`):
 * the speaker line's handle toggle and the reply button. Composed into
 * `groupCreateCopy` (`i18n_group_create.ts`) so the keys reach components as
 * `b.group.*` without touching upstream's `group:` block.
 */

// A type alias, not an interface: `BotsMessages` must stay assignable to the
// SDK's index-signature `PluginMessages`, which an interface member breaks.
export type GroupMessageActionsCopy = {
  /** Tooltip of a bot's speaker line: reveal / fold its full @handle. */
  showFullHandle: string
  hideFullHandle: string
  /** Tooltip of the reply button; `handle` is the @-mention it inserts. */
  replyTo: (handle: string) => string
  /** Its accessible name; `member` is the display name. */
  replyToMember: (member: string) => string
}

const en: GroupMessageActionsCopy = {
  showFullHandle: 'Show full handle',
  hideFullHandle: 'Hide full handle',
  replyTo: handle => `Reply to @${handle}`,
  replyToMember: member => `Reply to ${member}`
}

const ja: GroupMessageActionsCopy = {
  showFullHandle: '完全なハンドルを表示',
  hideFullHandle: '完全なハンドルを隠す',
  replyTo: handle => `@${handle} に返信`,
  replyToMember: member => `${member} に返信`
}

const zh: GroupMessageActionsCopy = {
  showFullHandle: '显示完整 @ 标签',
  hideFullHandle: '隐藏完整 @ 标签',
  replyTo: handle => `回复 @${handle}`,
  replyToMember: member => `回复 ${member}`
}

const zhHant: GroupMessageActionsCopy = {
  showFullHandle: '顯示完整 @ 標籤',
  hideFullHandle: '隱藏完整 @ 標籤',
  replyTo: handle => `回覆 @${handle}`,
  replyToMember: member => `回覆 ${member}`
}

const ru: GroupMessageActionsCopy = {
  showFullHandle: 'Показать полный хэндл',
  hideFullHandle: 'Скрыть полный хэндл',
  replyTo: handle => `Ответить @${handle}`,
  replyToMember: member => `Ответить ${member}`
}

const ar: GroupMessageActionsCopy = {
  showFullHandle: 'إظهار المعرّف الكامل',
  hideFullHandle: 'إخفاء المعرّف الكامل',
  replyTo: handle => `الرد على @${handle}`,
  replyToMember: member => `الرد على ${member}`
}

export const groupMessageActionsCopy: Record<'ar' | 'en' | 'ja' | 'ru' | 'zh' | 'zh-hant', GroupMessageActionsCopy> = {
  ar,
  en,
  ja,
  ru,
  zh,
  'zh-hant': zhHant
}
