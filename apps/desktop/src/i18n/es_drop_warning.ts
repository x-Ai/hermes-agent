import type { DropWarningCopy } from './types_drop_warning'

export const esDropWarning: DropWarningCopy = {
  dropFiles: 'Soltar archivos',
  dropFailedItem: name => `No se pudo adjuntar ${name}`,
  dropFilesMore: count => `y ${count} más`
}
