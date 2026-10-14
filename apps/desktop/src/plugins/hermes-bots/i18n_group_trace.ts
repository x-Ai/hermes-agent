/**
 * Copy for the member reply's folded "thinking & actions" disclosure
 * (`group-trace-view.tsx`). Composed into `groupCreateCopy`
 * (`i18n_group_create.ts`) so the keys reach components as `b.group.*` without
 * touching upstream's `group:` block. See [[hermes-fork-i18n-scope]].
 */

// A type alias, not an interface: `BotsMessages` must stay assignable to the
// SDK's index-signature `PluginMessages`, which an interface member breaks.
export type GroupTraceCopy = {
  /** The collapsed disclosure's leading label. */
  traceLabel: string
  /** Tiny tag on a reasoning block, and the "thought" chip in the header. */
  traceThought: string
  /** Header count of tool calls in the trace. */
  traceTools: (count: number) => string
  /** Prefix on a failed tool call's result note. */
  traceFailed: string
  /** Older steps dropped from the front to fit the per-entry budget. */
  traceOmitted: (count: number) => string
  /** Header of the live disclosure under the working line while a member's turn runs. */
  traceLive: string
}

const en: GroupTraceCopy = {
  traceLabel: 'Thinking & actions',
  traceThought: 'thought',
  traceTools: count => `${count} ${count === 1 ? 'tool' : 'tools'}`,
  traceFailed: 'Failed',
  traceOmitted: count => `${count} earlier ${count === 1 ? 'step' : 'steps'} hidden`,
  traceLive: 'Working…'
}

const zh: GroupTraceCopy = {
  traceLabel: '思考与执行',
  traceThought: '思考',
  traceTools: count => `${count} 个工具`,
  traceFailed: '失败',
  traceOmitted: count => `已省略较早的 ${count} 步`,
  traceLive: '执行中…'
}

const zhHant: GroupTraceCopy = {
  traceLabel: '思考與執行',
  traceThought: '思考',
  traceTools: count => `${count} 個工具`,
  traceFailed: '失敗',
  traceOmitted: count => `已省略較早的 ${count} 步`,
  traceLive: '執行中…'
}

const ja: GroupTraceCopy = {
  traceLabel: '思考と操作',
  traceThought: '思考',
  traceTools: count => `ツール ${count} 件`,
  traceFailed: '失敗',
  traceOmitted: count => `以前の ${count} ステップを省略`,
  traceLive: '作業中…'
}

const ru: GroupTraceCopy = {
  traceLabel: 'Размышления и действия',
  traceThought: 'мысли',
  traceTools: count => `Инструментов: ${count}`,
  traceFailed: 'Ошибка',
  traceOmitted: count => `Скрыто ранних шагов: ${count}`,
  traceLive: 'Выполняется…'
}

const ar: GroupTraceCopy = {
  traceLabel: 'التفكير والإجراءات',
  traceThought: 'تفكير',
  traceTools: count => `${count} أدوات`,
  traceFailed: 'فشل',
  traceOmitted: count => `${count} خطوات سابقة مخفية`,
  traceLive: 'جارٍ العمل…'
}

export const groupTraceCopy: Record<'ar' | 'en' | 'ja' | 'ru' | 'zh' | 'zh-hant', GroupTraceCopy> = {
  ar,
  en,
  ja,
  ru,
  zh,
  'zh-hant': zhHant
}
