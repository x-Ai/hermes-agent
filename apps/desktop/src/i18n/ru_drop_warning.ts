import type { DropWarningCopy } from './types_drop_warning'

export const ruDropWarning: DropWarningCopy = {
  dropFiles: 'Перетаскивание файлов',
  dropFailedItem: name => `Не удалось прикрепить ${name}`,
  dropFilesMore: count => `и ещё ${count}`
}
