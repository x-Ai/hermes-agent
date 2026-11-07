import type { DropWarningCopy } from './types_drop_warning'

export const zhDropWarning: DropWarningCopy = {
  dropFiles: '拖放文件',
  dropFailedItem: name => `无法附加 ${name}`,
  dropFilesMore: count => `以及另外 ${count} 项`
}
