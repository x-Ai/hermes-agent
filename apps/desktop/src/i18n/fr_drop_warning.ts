import type { DropWarningCopy } from './types_drop_warning'

export const frDropWarning: DropWarningCopy = {
  dropFiles: 'Déposer des fichiers',
  dropFailedItem: name => `Impossible de joindre ${name}`,
  dropFilesMore: count => `et ${count} de plus`
}
