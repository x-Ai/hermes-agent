import type { DropWarningCopy } from './types_drop_warning'

export const deDropWarning: DropWarningCopy = {
  dropFiles: 'Dateien ablegen',
  dropFailedItem: name => `${name} konnte nicht angehängt werden`,
  dropFilesMore: count => `und ${count} weitere`,
  attachRefusals: {
    folderDrop: (attach, folder) =>
      `Ordner lassen sich nicht durch Ablegen anhängen. Wählen Sie stattdessen ${attach} → ${folder} aus.`,
    fileTooLarge: mib => `Die Datei ist größer als ${mib} MiB, die größte Datei, die der Browser anhängen kann.`,
    imageTooLarge: mib => `Das Bild ist größer als ${mib} MiB, das größte Bild, das der Browser senden kann.`,
    unsendableImage:
      'SVG- und ICO-Bilder lassen sich im Browser nicht anhängen. Hängen Sie stattdessen ein PNG-, JPEG-, GIF-, WebP- oder BMP-Bild an.',
    uploadTooLarge:
      'Datei-Upload fehlgeschlagen (413): Die Datei ist größer, als der Server oder ein vorgeschalteter Proxy annimmt',
    uploadFailed: status => `Datei-Upload fehlgeschlagen (${status})`
  }
}
