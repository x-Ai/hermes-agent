import type { DropWarningCopy } from './types_drop_warning'

export const jaDropWarning: DropWarningCopy = {
  dropFiles: 'ファイルのドロップ',
  dropFailedItem: name => `${name} を添付できませんでした`,
  dropFilesMore: count => `ほか ${count} 件`,
  attachRefusals: {
    folderDrop: (attach, folder) =>
      `フォルダーはドロップでは添付できません。代わりに「${attach} → ${folder}」を使ってください。`,
    fileTooLarge: mib => `ファイルが、ブラウザーで添付できる上限の ${mib} MiB を超えています。`,
    imageTooLarge: mib => `画像が、ブラウザーで送信できる上限の ${mib} MiB を超えています。`,
    unsendableImage:
      'SVG と ICO の画像はブラウザーでは添付できません。代わりに PNG、JPEG、GIF、WebP、BMP のいずれかを添付してください。',
    uploadTooLarge:
      'ファイルのアップロードに失敗しました（413）：サーバーまたはその手前のプロキシが受け付けるサイズを超えています',
    uploadFailed: status => `ファイルのアップロードに失敗しました（${status}）`
  }
}
