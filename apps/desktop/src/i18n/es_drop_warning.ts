import type { DropWarningCopy } from './types_drop_warning'

export const esDropWarning: DropWarningCopy = {
  dropFiles: 'Soltar archivos',
  dropFailedItem: name => `No se pudo adjuntar ${name}`,
  dropFilesMore: count => `y ${count} más`,
  attachRefusals: {
    folderDrop: (attach, folder) =>
      `Las carpetas no se pueden adjuntar arrastrándolas. Usa ${attach} → ${folder} en su lugar.`,
    fileTooLarge: mib => `El archivo supera los ${mib} MiB, el tamaño máximo que el navegador puede adjuntar.`,
    imageTooLarge: mib => `La imagen supera los ${mib} MiB, el tamaño máximo que el navegador puede enviar.`,
    unsendableImage:
      'Las imágenes SVG e ICO no se pueden adjuntar en el navegador. Adjunta una imagen PNG, JPEG, GIF, WebP o BMP en su lugar.',
    uploadTooLarge:
      'No se pudo subir el archivo (413): supera el tamaño que acepta el servidor o un proxy situado delante de él',
    uploadFailed: status => `No se pudo subir el archivo (${status})`
  }
}
