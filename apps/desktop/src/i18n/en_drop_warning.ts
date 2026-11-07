import type { DropWarningCopy } from './types_drop_warning'

export const enDropWarning: DropWarningCopy = {
  dropFiles: 'Drop files',
  dropFailedItem: name => `Could not attach ${name}`,
  dropFilesMore: count => `and ${count} more`
}
