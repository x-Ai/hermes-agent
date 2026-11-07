import type { DropWarningCopy } from './types_drop_warning'

export const enDropWarning: DropWarningCopy = {
  dropFiles: 'Drop files',
  dropFailedItem: name => `Could not attach ${name}`,
  dropFilesMore: count => `and ${count} more`,
  attachRefusals: {
    folderDrop: (attach, folder) => `Folders can't be attached by dropping them. Use ${attach} → ${folder} instead.`,
    fileTooLarge: mib => `The file is larger than ${mib} MiB, the largest file the browser can attach.`,
    imageTooLarge: mib => `The image is larger than ${mib} MiB, the largest image the browser can send.`,
    unsendableImage:
      "SVG and ICO images can't be attached in the browser. Attach a PNG, JPEG, GIF, WebP or BMP instead.",
    uploadTooLarge: 'File upload failed (413): the file is larger than the server or a proxy in front of it accepts',
    uploadFailed: status => `File upload failed (${status})`
  }
}
