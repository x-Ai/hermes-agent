import type { DropWarningCopy } from './types_drop_warning'

export const deDropWarning: DropWarningCopy = {
  dropFiles: 'Dateien ablegen',
  dropFailedItem: name => `${name} konnte nicht angehängt werden`,
  dropFilesMore: count => `und ${count} weitere`
}
