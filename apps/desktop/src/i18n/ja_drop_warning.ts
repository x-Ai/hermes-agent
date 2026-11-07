import type { DropWarningCopy } from './types_drop_warning'

export const jaDropWarning: DropWarningCopy = {
  dropFiles: 'ファイルをドロップ',
  dropFailedItem: name => `${name} を添付できませんでした`,
  dropFilesMore: count => `ほか ${count} 件`
}
