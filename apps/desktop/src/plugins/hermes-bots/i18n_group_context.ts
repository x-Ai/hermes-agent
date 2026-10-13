/**
 * Copy of the room's context-usage readout (`group-context-usage-panel.tsx`):
 * the statusbar's context chip describes the group room in front, one row per
 * member. Composed into `groupCreateCopy` (`i18n_group_create.ts`) so the keys
 * reach components as `b.group.*` without touching upstream's `group:` block.
 */

// A type alias, not an interface: `BotsMessages` must stay assignable to the
// SDK's index-signature `PluginMessages`, which an interface member breaks.
export type GroupContextCopy = {
  /** Popover title; `group` is the room's display name. */
  contextUsageTitle: (group: string) => string
  /** One line under the title: what the rows measure. */
  contextUsageHint: string
  contextUsageRefresh: string
  /** Replaces the hint while a measuring pass runs. */
  contextUsageRefreshing: string
  /** A member whose room session has not run a turn on this backend yet. */
  contextUsageNone: string
  /** A member driven in several threads: the row shows the latest, this names the count. */
  contextUsageThreads: (count: number) => string
  contextUsageCompressions: (count: number) => string
  contextUsageNoMembers: string
}

const en: GroupContextCopy = {
  contextUsageTitle: group => `Context usage · ${group}`,
  contextUsageHint: "Each member's own room session, measured on this backend; it fills in as members speak.",
  contextUsageRefresh: 'Refresh',
  contextUsageRefreshing: 'Measuring…',
  contextUsageNone: 'No turn yet',
  contextUsageThreads: count => `${count} ${count === 1 ? 'thread' : 'threads'}`,
  contextUsageCompressions: count => `${count} ${count === 1 ? 'compression' : 'compressions'}`,
  contextUsageNoMembers: 'No members in this room'
}

const zh: GroupContextCopy = {
  contextUsageTitle: group => `"${group}" 的上下文用量`,
  contextUsageHint: '各成员在本群聊的会话上下文，由本机后端测量，成员发言后更新',
  contextUsageRefresh: '刷新',
  contextUsageRefreshing: '测量中…',
  contextUsageNone: '尚未发言',
  contextUsageThreads: count => `${count} 个线程`,
  contextUsageCompressions: count => `压缩 ${count} 次`,
  contextUsageNoMembers: '此群聊还没有成员'
}

const zhHant: GroupContextCopy = {
  contextUsageTitle: group => `「${group}」的上下文使用量`,
  contextUsageHint: '各成員在本群組的對話上下文，由本機後端測量，成員發言後更新。',
  contextUsageRefresh: '重新整理',
  contextUsageRefreshing: '測量中…',
  contextUsageNone: '尚未發言',
  contextUsageThreads: count => `${count} 個討論串`,
  contextUsageCompressions: count => `已壓縮 ${count} 次`,
  contextUsageNoMembers: '此群組尚無成員'
}

const ja: GroupContextCopy = {
  contextUsageTitle: group => `コンテキスト使用状況 · ${group}`,
  contextUsageHint:
    '各メンバーのこのルームでのセッションを、このバックエンドで計測します。メンバーが発言すると更新されます。',
  contextUsageRefresh: '更新',
  contextUsageRefreshing: '計測中…',
  contextUsageNone: 'まだ発言なし',
  contextUsageThreads: count => `${count} 件のスレッド`,
  contextUsageCompressions: count => `圧縮 ${count} 回`,
  contextUsageNoMembers: 'このルームにはメンバーがいません'
}

const ru: GroupContextCopy = {
  contextUsageTitle: group => `Использование контекста · ${group}`,
  contextUsageHint:
    'Сессия каждого участника в этой комнате, измеренная этим бэкендом; заполняется по мере реплик участников.',
  contextUsageRefresh: 'Обновить',
  contextUsageRefreshing: 'Измерение…',
  contextUsageNone: 'Реплик ещё не было',
  contextUsageThreads: count => `Тредов: ${count}`,
  contextUsageCompressions: count => `Сжатий: ${count}`,
  contextUsageNoMembers: 'В этой комнате нет участников'
}

const ar: GroupContextCopy = {
  contextUsageTitle: group => `استخدام السياق · ${group}`,
  contextUsageHint: 'جلسة كل عضو في هذه الغرفة كما يقيسها هذا الخادم الخلفي؛ تُحدَّث عندما يتحدث الأعضاء.',
  contextUsageRefresh: 'تحديث',
  contextUsageRefreshing: 'جارٍ القياس…',
  contextUsageNone: 'لا ردود بعد',
  contextUsageThreads: count => `${count} سلاسل`,
  contextUsageCompressions: count => `${count} عمليات ضغط`,
  contextUsageNoMembers: 'لا أعضاء في هذه الغرفة'
}

export const groupContextCopy: Record<'ar' | 'en' | 'ja' | 'ru' | 'zh' | 'zh-hant', GroupContextCopy> = {
  ar,
  en,
  ja,
  ru,
  zh,
  'zh-hant': zhHant
}
