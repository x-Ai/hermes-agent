import type { TranslationOverride } from '@hermes/shared/i18n'

import type { Translations } from './types'

// Archived sessions and the default project directory (Settings › Sessions),
// composed by ja.ts as `settings.sessions`.
export const jaSessionSettings: TranslationOverride<Translations['settings']['sessions']> = {
  loading: 'アーカイブ済みセッションを読み込み中…',
  archivedTitle: 'アーカイブ済みセッション',
  archivedIntro:
    'アーカイブ済みチャットはサイドバーでは非表示になりますが、すべてのメッセージは保持されます。サイドバーのチャットを Alt/⌥+Shift クリックするとアーカイブできます。',
  emptyArchivedTitle: 'アーカイブがありません',
  emptyArchivedDesc: 'チャットをアーカイブするとここに表示されます。',
  unarchive: 'アーカイブを解除',
  deletePermanently: '完全に削除',
  messages: count => `${count} 件のメッセージ`,
  restored: '復元しました',
  deleteConfirm: title => `"${title}" を完全に削除しますか？この操作は元に戻せません。`,
  autoArchiveTitle: '古いチャットを自動アーカイブ',
  autoArchiveDesc:
    'しばらく操作していないチャットを自動的にアーカイブします。ピン留めしたチャットはアーカイブされず、削除もされません。アーカイブされたチャットはここに移動します。',
  autoArchiveDaysLabel: 'アーカイブまでの日数',
  autoArchiveDaysUnit: '日間操作なし',
  autoArchiveFailed: '自動アーカイブを更新できませんでした',
  defaultDirTitle: 'デフォルトのプロジェクトディレクトリ',
  defaultDirDesc:
    '別のフォルダーを選択しない限り、新しいセッションはこのフォルダーで開始します。未設定の場合はホームディレクトリが使用されます。',
  defaultDirUpdated: shortcut =>
    `デフォルトのプロジェクトディレクトリを更新しました。新しいセッション${shortcut ? `（${shortcut}）` : ''}から反映されます`,
  defaultsTo: label => `デフォルト: ${label}。`,
  change: '変更',
  choose: '選択',
  clear: 'クリア',
  notSet: '未設定',
  failedLoad: 'アーカイブ済みセッションを読み込めませんでした',
  unarchiveFailed: 'アーカイブ解除に失敗しました',
  deleteFailed: '削除に失敗しました',
  updateDirFailed: 'デフォルトディレクトリを更新できませんでした',
  clearDirFailed: 'デフォルトディレクトリをクリアできませんでした'
}
